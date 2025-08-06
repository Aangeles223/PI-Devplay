import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { UserContext } from "../context/UserContext";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllPaises,
  getAllGeneros,
} from "../services/api";

export default function RegisterScreen({ navigation, onLogin }) {
  const { theme, getText } = useTheme();
  const { setUsuario } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    address: "",
    gender: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paises, setPaises] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);

  // Cargar países y géneros al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        const [paisesRes, generosRes] = await Promise.all([
          getAllPaises(),
          getAllGeneros(),
        ]);
        setPaises(paisesRes.data);
        setGeneros(generosRes.data);
      } catch (error) {
        console.error("Error cargando datos:", error);
        Alert.alert("Error", "No se pudieron cargar los datos necesarios");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      handleInputChange("birthDate", dateStr);
    }
  };

  const handleRegister = async () => {
    const {
      name,
      email,
      password,
      confirmPassword,
      birthDate,
      phone,
      country,
      address,
      gender,
    } = formData;

    // Validaciones básicas
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !birthDate ||
      !phone ||
      !country ||
      !address ||
      !gender
    ) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "El correo debe contener '@'");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return;
    }

    // Validar que país y género sean números válidos
    if (!country || isNaN(parseInt(country))) {
      Alert.alert("Error", "Por favor selecciona un país válido");
      return;
    }

    if (!gender || isNaN(parseInt(gender))) {
      Alert.alert("Error", "Por favor selecciona un género válido");
      return;
    }

    try {
      const params = {
        nombre: name.trim(),
        correo: email.trim().toLowerCase(),
        contraseña: password,
        status_id: 1,
        telefono: phone.trim(),
        pais_id: parseInt(country),
        direccion: address.trim(),
        genero_id: parseInt(gender),
        fecha_nacimiento: birthDate,
      };

      console.log("Datos a enviar:", params);

      const registerResponse = await registerUser(params);
      console.log("Registro exitoso:", registerResponse);

      // Mostrar mensaje de éxito y redirigir al login
      Alert.alert(
        "¡Registro exitoso!",
        "Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.",
        [
          {
            text: "Iniciar sesión",
            onPress: () => {
              // Resetear el formulario completamente
              setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                phone: "",
                country: "",
                address: "",
                gender: "",
                birthDate: "",
              });
              setSelectedCountry(null);
              setSelectedGender(null);
              setShowCountryPicker(false);
              setShowGenderPicker(false);
              // Navegar al login
              navigation.navigate("Login");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Error al registrar usuario";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Google", "Función de Google en desarrollo");
  };

  // Función para cerrar los dropdowns
  const closeDropdowns = () => {
    setShowCountryPicker(false);
    setShowGenderPicker(false);
  };

  // Función para manejar la apertura de dropdown de país
  const handleCountryPicker = () => {
    setShowGenderPicker(false); // Cerrar el otro dropdown
    setShowCountryPicker(!showCountryPicker);
  };

  // Función para manejar la apertura de dropdown de género
  const handleGenderPicker = () => {
    setShowCountryPicker(false); // Cerrar el otro dropdown
    setShowGenderPicker(!showGenderPicker);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={closeDropdowns}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>Crea una cuenta</Text>
            <Text style={styles.subtitle}>
              Ingresa tus datos para registrarte
            </Text>
            {/* Nombre */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu nombre completo"
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
              />
            </View>
            {/* Correo */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo</Text>
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {/* Fecha de nacimiento */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fecha de nacimiento</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {formData.birthDate
                    ? formData.birthDate
                    : "Selecciona tu fecha"}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#666"
                  style={styles.calendarIcon}
                />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={
                    formData.birthDate
                      ? new Date(formData.birthDate)
                      : new Date(2000, 0, 1)
                  }
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
            {/* Teléfono */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu teléfono"
                value={formData.phone}
                onChangeText={(value) => handleInputChange("phone", value)}
                keyboardType="phone-pad"
              />
            </View>
            {/* País */}
            <View
              style={[
                styles.inputContainer,
                { zIndex: showCountryPicker ? 1000 : 1 },
              ]}
            >
              <Text style={styles.label}>País</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.customPickerButton,
                  showCountryPicker && styles.pickerButtonActive,
                ]}
                onPress={handleCountryPicker}
              >
                <Text
                  style={[
                    styles.customPickerText,
                    {
                      color: formData.country ? "#333" : "#999",
                    },
                  ]}
                >
                  {formData.country
                    ? paises.find((p) => p.id.toString() === formData.country)
                        ?.nombre || "Selecciona tu país"
                    : "Selecciona tu país"}
                </Text>
                <Ionicons
                  name={showCountryPicker ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
              {showCountryPicker && (
                <View style={[styles.customPickerDropdown, { zIndex: 1001 }]}>
                  <Text style={styles.dropdownHeader}>Selecciona tu país</Text>
                  <ScrollView
                    style={{ maxHeight: 200 }}
                    showsVerticalScrollIndicator={false}
                  >
                    {paises.map((pais, index) => (
                      <TouchableOpacity
                        key={pais.id}
                        style={[
                          styles.customPickerItem,
                          formData.country === pais.id.toString() &&
                            styles.selectedItem,
                          index === paises.length - 1 && styles.lastItem,
                        ]}
                        onPress={() => {
                          handleInputChange("country", pais.id.toString());
                          setSelectedCountry(pais);
                          setShowCountryPicker(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.customPickerItemText,
                            formData.country === pais.id.toString() &&
                              styles.selectedItemText,
                          ]}
                        >
                          {pais.nombre}
                        </Text>
                        {formData.country === pais.id.toString() && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color="#8E44AD"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Dirección */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dirección</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu dirección"
                value={formData.address}
                onChangeText={(value) => handleInputChange("address", value)}
              />
            </View>

            {/* Género */}
            <View
              style={[
                styles.inputContainer,
                { zIndex: showGenderPicker ? 999 : 1 },
              ]}
            >
              <Text style={styles.label}>Género</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.customPickerButton,
                  showGenderPicker && styles.pickerButtonActive,
                ]}
                onPress={handleGenderPicker}
              >
                <Text
                  style={[
                    styles.customPickerText,
                    {
                      color: formData.gender ? "#333" : "#999",
                    },
                  ]}
                >
                  {formData.gender
                    ? generos.find((g) => g.id.toString() === formData.gender)
                        ?.nombre || "Selecciona tu género"
                    : "Selecciona tu género"}
                </Text>
                <Ionicons
                  name={showGenderPicker ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
              {showGenderPicker && (
                <View style={[styles.customPickerDropdown, { zIndex: 1000 }]}>
                  <Text style={styles.dropdownHeader}>
                    Selecciona tu género
                  </Text>
                  <ScrollView
                    style={{ maxHeight: 150 }}
                    showsVerticalScrollIndicator={false}
                  >
                    {generos.map((genero, index) => (
                      <TouchableOpacity
                        key={genero.id}
                        style={[
                          styles.customPickerItem,
                          formData.gender === genero.id.toString() &&
                            styles.selectedItem,
                          index === generos.length - 1 && styles.lastItem,
                        ]}
                        onPress={() => {
                          handleInputChange("gender", genero.id.toString());
                          setSelectedGender(genero);
                          setShowGenderPicker(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.customPickerItemText,
                            formData.gender === genero.id.toString() &&
                              styles.selectedItemText,
                          ]}
                        >
                          {genero.nombre}
                        </Text>
                        {formData.gender === genero.id.toString() && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color="#8E44AD"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            {/* Contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder=""
                  value={formData.password}
                  onChangeText={(value) => handleInputChange("password", value)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* Confirmar contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirma tu contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder=""
                  value={formData.confirmPassword}
                  onChangeText={(value) =>
                    handleInputChange("confirmPassword", value)
                  }
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* Botón de Agregar */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>Agregar</Text>
            </TouchableOpacity>
            {/* Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Inicia sesión aquí</Text>
              </TouchableOpacity>
            </View>
            {/* Continuar con */}
            <View style={styles.dividerContainer}>
              <Text style={styles.dividerText}>Continuar con</Text>
            </View>
            {/* Botón de Google */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.googleButtonText}>Google</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 80,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
    position: "relative",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  calendarIcon: {
    marginLeft: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 15,
  },
  registerButton: {
    backgroundColor: "#8E44AD",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginLink: {
    fontSize: 14,
    color: "#8E44AD",
    fontWeight: "600",
  },
  dividerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  dividerText: {
    fontSize: 14,
    color: "#666",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 30,
  },
  googleButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  pickerContainer: {
    justifyContent: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  picker: {
    width: "100%",
    height: 50,
  },
  customPickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 48,
  },
  pickerButtonActive: {
    borderColor: "#8E44AD",
    borderWidth: 2,
  },
  customPickerText: {
    fontSize: 16,
    flex: 1,
  },
  customPickerDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginTop: 2,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    maxHeight: 250,
  },
  dropdownHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E44AD",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  customPickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  selectedItem: {
    backgroundColor: "#8E44AD08",
  },
  customPickerItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  selectedItemText: {
    color: "#8E44AD",
    fontWeight: "500",
  },
});
