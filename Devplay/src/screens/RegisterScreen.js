import React, { useState, useContext } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { UserContext } from "../context/UserContext";
import { registerUser, loginUser, getCurrentUser } from "../services/api";

export default function RegisterScreen({ navigation, onLogin }) {
  const { theme, getText } = useTheme();
  const { setUsuario } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
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

    try {
      const params = {
        nombre: name,
        correo: email,
        contraseña: password,
        status_id: 1,
        telefono: phone,
        pais: country,
        direccion: address,
        genero: gender,
        fecha_nacimiento: birthDate,
      };
      await registerUser(params);
      // Auto-login after register
      const loginRes = await loginUser({ username: email, password });
      const token = loginRes.data.access_token;
      const userRes = await getCurrentUser(token);
      const user = userRes.data;
      setUsuario({ ...user, token });
      onLogin({ ...user, token });
    } catch (error) {
      Alert.alert("Error", error.response?.data?.detail || error.message);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Google", "Función de Google en desarrollo");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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

          {/* Usuario */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Elige tu nombre de usuario único"
              value={formData.username}
              onChangeText={(value) => handleInputChange("username", value)}
              autoCapitalize="none"
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
          <View style={styles.inputContainer}>
            <Text style={styles.label}>País</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu país"
              value={formData.country}
              onChangeText={(value) => handleInputChange("country", value)}
            />
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
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Género</Text>
            <TextInput
              style={styles.input}
              placeholder="Masculino, Femenino, Otro"
              value={formData.gender}
              onChangeText={(value) => handleInputChange("gender", value)}
            />
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
});
