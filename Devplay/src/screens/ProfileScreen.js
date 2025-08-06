import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Image,
  FlatList,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // <--- import Picker
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { UserContext } from "../context/UserContext";
import {
  getAllPaises,
  getAllGeneros,
  updateUser,
  getAllUsers,
} from "../services/api";

export default function ProfileScreen({ navigation, route, onLogout }) {
  const { theme, getText, language } = useTheme();
  const { usuario } = useContext(UserContext);
  const userEmail = usuario?.correo || "";
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Listas de referencia
  const [countries, setCountries] = useState([]); // <--- estados para listas
  const [genders, setGenders] = useState([]);

  // Modals
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);

  // 1) Obtener datos del usuario
  useEffect(() => {
    if (!userEmail) return;
    getAllUsers()
      .then((res) => {
        const user = res.data.find((u) => u.correo === userEmail);
        if (user) setProfileData(user);
        else setProfileData({ error: "Usuario no encontrado" });
      })
      .catch((err) => {
        console.warn("Error al traer perfil:", err);
        setProfileData({ error: "Error al cargar perfil" });
      });
  }, [userEmail]);

  // 2) Cargar países y géneros
  useEffect(() => {
    getAllPaises()
      .then((r) => setCountries(r.data))
      .catch(console.warn);

    getAllGeneros()
      .then((r) => setGenders(r.data))
      .catch(console.warn);
  }, []);

  const handleInputChange = (field, value) => {
    // Validación y formateo especial para fecha de nacimiento
    if (field === "fecha_nacimiento") {
      // Validar formato de fecha YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      if (value && !dateRegex.test(value)) {
        console.warn("Formato de fecha inválido:", value);
        // Intentar corregir formato común DD-MM-YYYY o MM-DD-YYYY
        const parts = value.split(/[-/]/);
        if (parts.length === 3) {
          const [part1, part2, part3] = parts;

          // Si el primer elemento tiene 4 dígitos, probablemente ya está en formato correcto
          if (part1.length === 4) {
            // Validar que month y day sean válidos
            const month = parseInt(part2);
            const day = parseInt(part3);

            if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
              value = `${part1}-${part2.padStart(2, "0")}-${part3.padStart(
                2,
                "0"
              )}`;
            }
          }
          // Si el último elemento tiene 4 dígitos, formato DD-MM-YYYY
          else if (part3.length === 4) {
            const day = parseInt(part1);
            const month = parseInt(part2);

            if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
              value = `${part3}-${part2.padStart(2, "0")}-${part1.padStart(
                2,
                "0"
              )}`;
            }
          }
        }
      }

      // Validación adicional de fecha válida
      if (value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          console.warn("Fecha inválida:", value);
          return; // No actualizar si la fecha es inválida
        }

        // Validar que la fecha no sea futura (para fecha de nacimiento)
        if (date > new Date()) {
          console.warn("Fecha de nacimiento no puede ser futura:", value);
          return;
        }
      }
    }

    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  // 3) Guardar cambios
  const handleSaveProfile = () => {
    // Validación de fecha antes de enviar
    if (profileData.fecha_nacimiento) {
      const date = new Date(profileData.fecha_nacimiento);
      if (isNaN(date.getTime())) {
        Alert.alert(
          "Error",
          "Formato de fecha inválido. Use el formato YYYY-MM-DD (ej: 2002-07-26)"
        );
        return;
      }

      if (date > new Date()) {
        Alert.alert("Error", "La fecha de nacimiento no puede ser futura");
        return;
      }
    }

    setIsEditing(false);
    const updatedData = {
      nombre: profileData.nombre,
      telefono: profileData.telefono,
      // enviamos los ids
      pais_id: profileData.pais_id,
      genero_id: profileData.genero_id,
      direccion: profileData.direccion,
      fecha_nacimiento: profileData.fecha_nacimiento?.slice(0, 10) || null,
    };

    console.log("Enviando datos actualizados:", updatedData);

    updateUser(profileData.id, updatedData)
      .then((res) => {
        setProfileData(res.data.usuario);
        Alert.alert(
          getText("profileUpdated") || "Perfil actualizado",
          getText("changesSaved") || "Los cambios se guardaron con éxito."
        );
      })
      .catch((error) => {
        console.error("Error actualizando perfil:", error);
        Alert.alert(
          "Error",
          "No se pudo actualizar el perfil. Verifique que todos los datos sean correctos."
        );
        setIsEditing(true); // Volver al modo edición si hay error
      });
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Opcional: recargar datos del usuario
    if (userEmail) {
      getAllUsers()
        .then((res) => {
          const user = res.data.find((u) => u.correo === userEmail);
          if (user) setProfileData(user);
        })
        .catch(() => {});
    }
  };

  const handleLogout = () => {
    setShowMenu(false);
    if (Platform.OS === "web") {
      // Use native confirm on web
      const ok = window.confirm(getText("confirmLogout"));
      if (ok) onLogout();
    } else {
      Alert.alert(getText("logout"), getText("confirmLogout"), [
        { text: getText("cancel"), style: "cancel" },
        {
          text: getText("logout"),
          style: "destructive",
          onPress: () => onLogout(),
        },
      ]);
    }
  };

  const selectGender = (g) => {
    handleInputChange("genero_id", g.id);
    handleInputChange("genero", g.nombre);
    setShowGenderModal(false);
  };
  const selectCountry = (c) => {
    handleInputChange("pais_id", c.id);
    handleInputChange("pais", c.nombre);
    setShowCountryModal(false);
  };

  const menuItems = [
    {
      id: 1,
      icon: "notifications-outline",
      title: getText("notifications"),
      hasArrow: true,
    },
    {
      id: 2,
      icon: "language-outline",
      title: getText("language"),
      hasArrow: true,
    },
    {
      id: 3,
      icon: "moon-outline",
      title: getText("darkMode"),
      hasArrow: true,
    },
    {
      id: 4,
      icon: "download-outline",
      title: getText("downloads"),
      hasArrow: true,
    },
    {
      id: 5,
      icon: "basket-outline",
      title: getText("purchases"),
      hasArrow: true,
    },
    {
      id: 6,
      icon: "save-outline",
      title: getText("storage"),
      hasArrow: true,
    },
    {
      id: 7,
      icon: "help-circle-outline",
      title: getText("help"),
      hasArrow: true,
    },
    {
      id: 8,
      icon: "time-outline",
      title: getText("history"),
      hasArrow: true,
    },
  ];

  const handleMenuPress = (item) => {
    switch (item.id) {
      case 1:
        navigation.navigate("Notifications");
        break;
      case 2:
        navigation.navigate("Language");
        break;
      case 3:
        navigation.navigate("DarkMode");
        break;
      case 4:
        navigation.navigate("Downloads");
        break;
      case 5:
        navigation.navigate("Purchases");
        break;
      case 6:
        navigation.navigate("Storage");
        break;
      case 7:
        navigation.navigate("Help");
        break;
      case 8:
        navigation.navigate("History");
        break;
      default:
        console.log("Menu item not implemented:", item.title);
    }
  };

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { borderBottomColor: theme.border }]}
      onPress={() => handleMenuPress(item)}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon} size={24} color={theme.iconColor} />
        <Text style={[styles.menuItemText, { color: theme.textColor }]}>
          {item.title}
        </Text>
      </View>
      {item.hasArrow && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.secondaryTextColor}
        />
      )}
    </TouchableOpacity>
  );

  // Renderizar avatar del usuario
  const renderUserAvatar = () => {
    if (profileData && profileData.avatar) {
      return (
        <Image source={{ uri: profileData.avatar }} style={styles.profilePic} />
      );
    } else if (profileData && profileData.nombre) {
      // Iniciales si no hay avatar
      const initials = profileData.nombre
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      return (
        <View style={[styles.profilePic, { backgroundColor: theme.primary }]}>
          <Text style={styles.profilePicText}>{initials}</Text>
        </View>
      );
    } else {
      // Default
      return (
        <View style={[styles.profilePic, { backgroundColor: theme.primary }]}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
      );
    }
  };

  if (!profileData || profileData.error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>
          {profileData?.error
            ? "No se encontró el usuario"
            : "Cargando perfil..."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setShowMenu(true)}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={theme.textColor}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View
        style={[
          styles.profileSection,
          { backgroundColor: theme.cardBackground },
        ]}
      >
        <Text style={[styles.profileTitle, { color: theme.textColor }]}>
          {getText("myProfile")}
        </Text>
        <View style={styles.profilePicContainer}>{renderUserAvatar()}</View>
      </View>

      {/* Form Fields */}
      <View
        style={[styles.formSection, { backgroundColor: theme.cardBackground }]}
      >
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textColor }]}>
            {getText("name")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
                borderColor: theme.border,
              },
              !isEditing && styles.inputDisabled,
            ]}
            value={profileData.nombre || ""}
            placeholder={getText("name")}
            placeholderTextColor={theme.textTertiary}
            editable={isEditing}
            onChangeText={(value) => handleInputChange("nombre", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textColor }]}>
            {language === "es" ? "Teléfono" : "Phone"}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
                borderColor: theme.border,
              },
              !isEditing && styles.inputDisabled,
            ]}
            value={profileData.telefono || ""}
            editable={isEditing}
            keyboardType="phone-pad"
            onChangeText={(val) => handleInputChange("telefono", val)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textColor }]}>
            {getText("email")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
                borderColor: theme.border,
              },
              !isEditing && styles.inputDisabled,
            ]}
            value={profileData.correo || ""}
            placeholder={getText("email")}
            placeholderTextColor={theme.textTertiary}
            keyboardType="email-address"
            editable={false}
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formGroupHalf}>
            <Text style={[styles.label, { color: theme.textColor }]}>
              {language === "es" ? "Fecha de nacimiento" : "Birth date"}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                  borderColor: theme.border,
                },
                !isEditing && styles.inputDisabled,
              ]}
              value={profileData.fecha_nacimiento?.slice(0, 10) || ""}
              editable={isEditing}
              placeholder="YYYY-MM-DD"
              onChangeText={(val) => handleInputChange("fecha_nacimiento", val)}
            />
          </View>

          <View style={styles.formGroupHalf}>
            <Text style={[styles.label, { color: theme.textColor }]}>
              {language === "es" ? "Género" : "Gender"}
            </Text>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowGenderModal(true)}
                >
                  <Text style={[styles.selectText, { color: theme.textColor }]}>
                    {profileData.genero || "Selecciona..."}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={theme.iconColor}
                  />
                </TouchableOpacity>
                <Modal
                  visible={showGenderModal}
                  transparent
                  animationType="slide"
                >
                  <View style={styles.modalOverlay}>
                    <View
                      style={[
                        styles.modalContent,
                        { backgroundColor: theme.cardBackground },
                      ]}
                    >
                      <FlatList
                        data={genders}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => selectGender(item)}
                          >
                            <Text style={{ color: theme.textColor }}>
                              {item.nombre}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                      <TouchableOpacity
                        onPress={() => setShowGenderModal(false)}
                      >
                        <Text
                          style={{
                            color: "#FF3B30",
                            textAlign: "center",
                            marginTop: 8,
                          }}
                        >
                          Cancelar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </>
            ) : (
              // … tu vista no-edit existente …
              <View
                style={[
                  styles.selectInput,
                  {
                    backgroundColor: theme.backgroundColor,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={[styles.selectText, { color: theme.textColor }]}>
                  {profileData.genero || "Sin especificar"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={theme.iconColor}
                />
              </View>
            )}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textColor }]}>
            {getText("country")}
          </Text>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowCountryModal(true)}
              >
                <Text style={[styles.selectText, { color: theme.textColor }]}>
                  {profileData.pais || "Selecciona..."}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={theme.iconColor}
                />
              </TouchableOpacity>
              <Modal
                visible={showCountryModal}
                transparent
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View
                    style={[
                      styles.modalContent,
                      { backgroundColor: theme.cardBackground },
                    ]}
                  >
                    <FlatList
                      data={countries}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.modalItem}
                          onPress={() => selectCountry(item)}
                        >
                          <Text style={{ color: theme.textColor }}>
                            {item.nombre}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                    <TouchableOpacity
                      onPress={() => setShowCountryModal(false)}
                    >
                      <Text
                        style={{
                          color: "#FF3B30",
                          textAlign: "center",
                          marginTop: 8,
                        }}
                      >
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </>
          ) : (
            <View
              style={[
                styles.selectInput,
                {
                  backgroundColor: theme.backgroundColor,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.selectText, { color: theme.textColor }]}>
                {profileData.pais || "Sin especificar"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.iconColor} />
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textColor }]}>
            {language === "es" ? "Dirección" : "Address"}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
                borderColor: theme.border,
              },
            ]}
            value={profileData.direccion || ""}
            placeholder={language === "es" ? "Dirección" : "Address"}
            multiline
            editable={isEditing}
            onChangeText={(value) => handleInputChange("direccion", value)}
          />
        </View>
      </View>

      {/* Edit/Save Buttons */}
      {isEditing && (
        <View
          style={[
            styles.editButtonsContainer,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.backgroundColor,
              },
            ]}
            onPress={handleCancelEdit}
          >
            <Text style={[styles.cancelButtonText, { color: theme.textColor }]}>
              {getText("cancel")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSaveProfile}
          >
            <Text style={styles.saveButtonText}>{getText("save")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Settings Menu */}
      <View
        style={[styles.menuSection, { backgroundColor: theme.cardBackground }]}
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.textColor, borderBottomColor: theme.border },
          ]}
        >
          {getText("settings")}
        </Text>
        {menuItems.map(renderMenuItem)}
      </View>

      {/* Modal del menú */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View
            style={[
              styles.menuModal,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <TouchableOpacity
              style={[styles.menuOption, { borderBottomColor: theme.border }]}
              onPress={handleEditProfile}
            >
              <Ionicons
                name="create-outline"
                size={24}
                color={theme.textColor}
              />
              <Text style={[styles.menuOptionText, { color: theme.textColor }]}>
                {getText("editProfile")}
              </Text>
            </TouchableOpacity>

            <View
              style={[styles.menuDivider, { backgroundColor: theme.border }]}
            />

            <TouchableOpacity style={styles.menuOption} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
              <Text style={[styles.menuOptionText, { color: "#FF3B30" }]}>
                Cerrar sesión
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  moreButton: {
    padding: 8,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  profilePicContainer: {
    alignItems: "center",
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profilePicText: {
    color: "white",
    fontSize: 32,
    fontWeight: "600",
  },
  formSection: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  formGroupHalf: {
    flex: 0.48,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
  },
  selectInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  selectText: {
    fontSize: 16,
  },
  menuSection: {
    marginTop: 10,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  editButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 12,
    padding: 8,
    width: "80%",
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuModal: {
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
  },
});
