import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function ProfileScreen({ navigation, onLogout }) {
  const { theme, getText, language } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Usuario1",
    phone: "+520 123456789",
    email: "usuario1@example.com",
    country: "México",
  });

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    Alert.alert(getText("success"), getText("profileUpdated"));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Aquí podrías revertir los cambios si es necesario
  };

  const handleLogout = () => {
    setShowMenu(false);
    Alert.alert(getText("logout"), getText("confirmLogout"), [
      { text: getText("cancel"), style: "cancel" },
      {
        text: getText("logout"),
        style: "destructive",
        onPress: () => onLogout(),
      },
    ]);
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity style={styles.backButton}>
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
        <View style={styles.profilePicContainer}>
          <View style={[styles.profilePic, { backgroundColor: theme.primary }]}>
            <Text style={styles.profilePicText}>JD</Text>
          </View>
        </View>
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
            value={profileData.name}
            placeholder={getText("name")}
            placeholderTextColor={theme.textTertiary}
            editable={isEditing}
            onChangeText={(value) => handleInputChange("name", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textColor }]}>
            {getText("phone")}
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
            value={profileData.phone}
            placeholder={getText("phone")}
            placeholderTextColor={theme.textTertiary}
            keyboardType="phone-pad"
            editable={isEditing}
            onChangeText={(value) => handleInputChange("phone", value)}
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
            value={profileData.email}
            placeholder={getText("email")}
            placeholderTextColor={theme.textTertiary}
            keyboardType="email-address"
            editable={isEditing}
            onChangeText={(value) => handleInputChange("email", value)}
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formGroupHalf}>
            <Text style={[styles.label, { color: theme.textColor }]}>
              {language === "es" ? "Fecha de nacimiento" : "Birth date"}
            </Text>
            <TouchableOpacity
              style={[
                styles.dateInput,
                {
                  backgroundColor: theme.backgroundColor,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.dateText, { color: theme.textColor }]}>
                12/12/96
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={theme.iconColor}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.formGroupHalf}>
            <Text style={[styles.label, { color: theme.textColor }]}>
              {language === "es" ? "Género" : "Gender"}
            </Text>
            <TouchableOpacity
              style={[
                styles.selectInput,
                {
                  backgroundColor: theme.backgroundColor,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.selectText, { color: theme.textColor }]}>
                {language === "es" ? "Hombre" : "Male"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.iconColor} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textColor }]}>
            {getText("country")}
          </Text>
          <TouchableOpacity
            style={[
              styles.selectInput,
              {
                backgroundColor: theme.backgroundColor,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.selectText, { color: theme.textColor }]}>
              México
            </Text>
            <Ionicons name="chevron-down" size={20} color={theme.iconColor} />
          </TouchableOpacity>
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
            value="El Rosario, 762, Santiago de Querétaro, Qro."
            placeholder={language === "es" ? "Dirección" : "Address"}
            multiline
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
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 50,
    paddingRight: 20,
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
