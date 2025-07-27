import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function DarkModeScreen({ navigation }) {
  const { theme, getText, isDarkMode, toggleTheme } = useTheme();
  const [isAutoMode, setIsAutoMode] = useState(false);

  const handleDarkModeToggle = (value) => {
    toggleTheme(value);
    if (value) {
      setIsAutoMode(false);
    }
  };

  const handleAutoModeToggle = (value) => {
    setIsAutoMode(value);
    if (value) {
      toggleTheme(false);
    }
    // Aquí implementarías la lógica para el modo automático
    console.log(`Modo automático: ${value ? "activado" : "desactivado"}`);
  };

  const currentTheme = isDarkMode ? "dark" : isAutoMode ? "auto" : "light";

  return (
    <View
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
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          {getText("darkMode")}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Current Theme Preview */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {getText("language") === "es" ? "Vista Previa" : "Preview"}
          </Text>
          <View
            style={[
              styles.preview,
              {
                backgroundColor: theme.backgroundColor,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.previewHeader}>
              <View style={styles.previewIcon}>
                <Ionicons
                  name="game-controller"
                  size={24}
                  color={theme.primary}
                />
              </View>
              <Text style={[styles.previewText, { color: theme.textColor }]}>
                {getText("gameStore")}
              </Text>
            </View>
            <View style={styles.previewContent}>
              <Text
                style={[styles.previewSubText, { color: theme.textSecondary }]}
              >
                {getText("language") === "es"
                  ? `Tema actual: ${
                      currentTheme === "dark"
                        ? "Oscuro"
                        : currentTheme === "auto"
                        ? "Automático"
                        : "Claro"
                    }`
                  : `Current theme: ${
                      currentTheme === "dark"
                        ? "Dark"
                        : currentTheme === "auto"
                        ? "Auto"
                        : "Light"
                    }`}
              </Text>
            </View>
          </View>
        </View>

        {/* Theme Options */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {getText("themeOptions") || "Opciones de Tema"}
          </Text>

          {/* Light Mode */}
          <TouchableOpacity
            style={[
              styles.optionItem,
              { backgroundColor: theme.cardBackground },
            ]}
            onPress={() => {
              toggleTheme(false);
              setIsAutoMode(false);
            }}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="sunny" size={24} color={theme.iconColor} />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.textColor }]}>
                  {getText("lightMode") || "Modo Claro"}
                </Text>
                <Text
                  style={[
                    styles.optionSubtitle,
                    { color: theme.secondaryTextColor },
                  ]}
                >
                  {getText("lightModeDesc") || "Fondo blanco con texto oscuro"}
                </Text>
              </View>
            </View>
            {!isDarkMode && !isAutoMode && (
              <Ionicons name="checkmark" size={24} color="#007AFF" />
            )}
          </TouchableOpacity>

          {/* Dark Mode */}
          <TouchableOpacity
            style={[
              styles.optionItem,
              { backgroundColor: theme.cardBackground },
            ]}
            onPress={() => handleDarkModeToggle(!isDarkMode)}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="moon" size={24} color={theme.iconColor} />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.textColor }]}>
                  {getText("darkModeOption") || "Modo Oscuro"}
                </Text>
                <Text
                  style={[
                    styles.optionSubtitle,
                    { color: theme.secondaryTextColor },
                  ]}
                >
                  {getText("darkModeDesc") || "Fondo oscuro con texto claro"}
                </Text>
              </View>
            </View>
            {isDarkMode && (
              <Ionicons name="checkmark" size={24} color="#007AFF" />
            )}
          </TouchableOpacity>

          {/* Auto Mode */}
          <TouchableOpacity
            style={[
              styles.optionItem,
              { backgroundColor: theme.cardBackground },
            ]}
            onPress={() => handleAutoModeToggle(!isAutoMode)}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name="phone-portrait"
                size={24}
                color={theme.iconColor}
              />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.textColor }]}>
                  {getText("autoMode") || "Automático"}
                </Text>
                <Text
                  style={[
                    styles.optionSubtitle,
                    { color: theme.secondaryTextColor },
                  ]}
                >
                  Sigue la configuración del sistema
                </Text>
              </View>
            </View>
            {isAutoMode && (
              <Ionicons name="checkmark" size={24} color="#007AFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={[styles.section, isDarkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Configuración Adicional
          </Text>

          <View
            style={[styles.settingItem, isDarkMode && styles.darkOptionItem]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="contrast"
                size={24}
                color={isDarkMode ? "#fff" : "#333"}
              />
              <View style={styles.settingText}>
                <Text
                  style={[styles.settingTitle, isDarkMode && styles.darkText]}
                >
                  Alto Contraste
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    isDarkMode && styles.darkSubText,
                  ]}
                >
                  Mejora la legibilidad
                </Text>
              </View>
            </View>
            <Switch
              value={false}
              onValueChange={() => {}}
              trackColor={{ false: "#ccc", true: "#007AFF" }}
            />
          </View>

          <View
            style={[styles.settingItem, isDarkMode && styles.darkOptionItem]}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="eye"
                size={24}
                color={isDarkMode ? "#fff" : "#333"}
              />
              <View style={styles.settingText}>
                <Text
                  style={[styles.settingTitle, isDarkMode && styles.darkText]}
                >
                  Reducir Brillo
                </Text>
                <Text
                  style={[
                    styles.settingSubtitle,
                    isDarkMode && styles.darkSubText,
                  ]}
                >
                  Menos fatiga visual
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={() => {}}
              trackColor={{ false: "#ccc", true: "#007AFF" }}
            />
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={[styles.infoBox, isDarkMode && styles.darkInfoBox]}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#007AFF"
            />
            <Text style={[styles.infoText, isDarkMode && styles.darkInfoText]}>
              El modo oscuro puede ayudar a ahorrar batería en dispositivos con
              pantallas OLED y reducir la fatiga visual en ambientes con poca
              luz.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  darkContainer: {
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "white",
  },
  darkHeader: {
    backgroundColor: "#2a2a2a",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  darkText: {
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "white",
    marginTop: 20,
    paddingVertical: 15,
  },
  darkSection: {
    backgroundColor: "#2a2a2a",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  preview: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  darkPreview: {
    backgroundColor: "#333",
    borderColor: "#555",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  previewIcon: {
    marginRight: 10,
  },
  previewText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  previewContent: {
    marginTop: 10,
  },
  previewSubText: {
    fontSize: 14,
    color: "#666",
  },
  darkSubText: {
    color: "#ccc",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  darkOptionItem: {
    borderBottomColor: "#444",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionText: {
    marginLeft: 15,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E3F2FD",
    padding: 15,
    borderRadius: 8,
  },
  darkInfoBox: {
    backgroundColor: "#1E3A8A",
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  darkInfoText: {
    color: "#E5E7EB",
  },
});
