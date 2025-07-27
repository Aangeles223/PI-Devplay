import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function LanguageScreen({ navigation }) {
  const { theme, getText, language, changeLanguage } = useTheme();

  const languages = [
    {
      id: 1,
      name: "Español",
      code: "es",
      flag: "🇪🇸",
    },
    {
      id: 2,
      name: "English",
      code: "en",
      flag: "🇺🇸",
    },
  ];

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.backgroundColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          {getText("language")}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {getText("selectLanguage") || "Seleccionar idioma"}
          </Text>

          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              style={[
                styles.languageOption,
                { backgroundColor: theme.cardBackground },
                language === lang.code && styles.selectedOption,
              ]}
              onPress={() => handleLanguageSelect(lang.code)}
            >
              <View style={styles.languageLeft}>
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text style={[styles.languageName, { color: theme.textColor }]}>
                  {lang.name}
                </Text>
              </View>
              {language === lang.code && (
                <Ionicons name="checkmark" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.infoTitle, { color: theme.textColor }]}>
            {getText("languageInfo") || "Información"}
          </Text>
          <Text style={[styles.infoText, { color: theme.secondaryTextColor }]}>
            {getText("languageDescription") ||
              "Cambiar el idioma afectará toda la aplicación. Los juegos y contenido se mostrarán en el idioma seleccionado."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginRight: 30,
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedOption: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF10",
  },
  languageLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    fontSize: 24,
    marginRight: 15,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
