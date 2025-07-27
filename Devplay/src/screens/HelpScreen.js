import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function HelpScreen({ navigation }) {
  const { theme, getText } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Mock FAQ data
  const faqCategories = [
    {
      id: "account",
      title: "Cuenta y Perfil",
      icon: "person-circle-outline",
      questions: [
        {
          id: "1",
          question: "¿Cómo cambio mi contraseña?",
          answer:
            "Puedes cambiar tu contraseña desde la sección de Perfil > Editar Perfil > Cambiar Contraseña. Necesitarás introducir tu contraseña actual y la nueva contraseña dos veces para confirmar.",
        },
        {
          id: "2",
          question: "¿Cómo actualizo mi información personal?",
          answer:
            "Ve a tu perfil, toca los tres puntos y selecciona 'Editar perfil'. Desde ahí podrás actualizar tu nombre, foto de perfil y otra información personal.",
        },
        {
          id: "3",
          question: "¿Puedo eliminar mi cuenta?",
          answer:
            "Sí, puedes eliminar tu cuenta contactando con nuestro equipo de soporte. Ten en cuenta que esta acción es irreversible y perderás todas tus compras y datos.",
        },
      ],
    },
    {
      id: "downloads",
      title: "Descargas y Instalación",
      icon: "download-outline",
      questions: [
        {
          id: "4",
          question: "¿Por qué mi descarga es lenta?",
          answer:
            "Las descargas lentas pueden deberse a tu conexión a internet, espacio de almacenamiento insuficiente, o tráfico elevado en nuestros servidores. Verifica tu conexión Wi-Fi y libera espacio en tu dispositivo.",
        },
        {
          id: "5",
          question: "¿Qué hago si una descarga falla?",
          answer:
            "Si una descarga falla, verifica tu conexión a internet y espacio disponible. Puedes reintentar la descarga desde la sección de Descargas > Pendientes.",
        },
        {
          id: "6",
          question: "¿Puedo pausar las descargas?",
          answer:
            "Sí, puedes pausar y reanudar las descargas en cualquier momento desde la sección de Descargas.",
        },
      ],
    },
    {
      id: "payments",
      title: "Pagos y Compras",
      icon: "card-outline",
      questions: [
        {
          id: "7",
          question: "¿Qué métodos de pago aceptan?",
          answer:
            "Aceptamos tarjetas de crédito/débito (Visa, MasterCard, American Express), PayPal, y códigos de regalo de DevPlay.",
        },
        {
          id: "8",
          question: "¿Puedo solicitar un reembolso?",
          answer:
            "Puedes solicitar un reembolso dentro de las 48 horas posteriores a la compra si no has usado la aplicación. Ve a Mis Compras y selecciona la compra para solicitar el reembolso.",
        },
        {
          id: "9",
          question: "¿Dónde veo mi historial de compras?",
          answer:
            "Puedes ver todas tus compras en la sección de Perfil > Mis Compras. Ahí encontrarás tanto las aplicaciones gratuitas como las de pago.",
        },
      ],
    },
    {
      id: "technical",
      title: "Problemas Técnicos",
      icon: "settings-outline",
      questions: [
        {
          id: "10",
          question: "La aplicación se cierra inesperadamente",
          answer:
            "Si la app se cierra, intenta reiniciar tu dispositivo, verificar que tienes la última versión de la app, y liberar memoria cerrando otras aplicaciones.",
        },
        {
          id: "11",
          question: "No puedo iniciar sesión",
          answer:
            "Verifica que estés usando las credenciales correctas. Si olvidaste tu contraseña, usa la opción 'Olvidé mi contraseña' en la pantalla de inicio de sesión.",
        },
        {
          id: "12",
          question: "¿Cómo actualizo la aplicación?",
          answer:
            "Las actualizaciones se descargan automáticamente. Puedes verificar actualizaciones manualmente en la configuración de tu dispositivo.",
        },
      ],
    },
  ];

  const helpOptions = [
    {
      id: "contact",
      titleKey: "contactSupport",
      descriptionKey: "contactSupportDesc",
      icon: "headset-outline",
      action: "contact",
    },
    {
      id: "report",
      titleKey: "reportProblem",
      descriptionKey: "reportProblemDesc",
      icon: "bug-outline",
      action: "report",
    },
    {
      id: "feedback",
      titleKey: "sendFeedback",
      descriptionKey: "sendFeedbackDesc",
      icon: "chatbubble-ellipses-outline",
      action: "feedback",
    },
    {
      id: "community",
      titleKey: "communityForum",
      descriptionKey: "communityForumDesc",
      icon: "people-outline",
      action: "community",
    },
  ];

  const filteredFAQs = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  const toggleFaq = (questionId) => {
    setExpandedFaq(expandedFaq === questionId ? null : questionId);
  };

  const handleAction = (action) => {
    switch (action) {
      case "contact":
        console.log("Contactar soporte");
        break;
      case "report":
        console.log("Reportar problema");
        break;
      case "feedback":
        console.log("Enviar comentarios");
        break;
      case "community":
        console.log("Abrir foro");
        break;
    }
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
          {getText("helpCenter")}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={[styles.content, { backgroundColor: theme.backgroundColor }]}
      >
        {/* Search */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.backgroundColor },
          ]}
        >
          <View
            style={[
              styles.searchBox,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={theme.secondaryTextColor}
            />
            <TextInput
              style={[styles.searchInput, { color: theme.textColor }]}
              placeholder={getText("searchHelp")}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.secondaryTextColor}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.secondaryTextColor}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Help Options */}
        {!searchQuery && (
          <View
            style={[styles.section, { backgroundColor: theme.cardBackground }]}
          >
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {getText("needImmediateHelp")}
            </Text>
            {helpOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.helpOption,
                  {
                    backgroundColor: theme.cardBackground,
                    borderBottomColor: theme.border,
                  },
                ]}
                onPress={() => handleAction(option.action)}
              >
                <View style={styles.helpOptionLeft}>
                  <View
                    style={[
                      styles.helpOptionIcon,
                      { backgroundColor: theme.backgroundColor },
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={theme.primary}
                    />
                  </View>
                  <View style={styles.helpOptionInfo}>
                    <Text
                      style={[
                        styles.helpOptionTitle,
                        { color: theme.textColor },
                      ]}
                    >
                      {getText(option.titleKey)}
                    </Text>
                    <Text
                      style={[
                        styles.helpOptionDescription,
                        { color: theme.secondaryTextColor },
                      ]}
                    >
                      {getText(option.descriptionKey)}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.secondaryTextColor}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* FAQ Categories */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {searchQuery ? getText("searchResults") : getText("faq")}
          </Text>

          {(searchQuery ? filteredFAQs : faqCategories).map((category) => (
            <View key={category.id} style={styles.faqCategory}>
              {!searchQuery && (
                <View
                  style={[
                    styles.categoryHeader,
                    { borderBottomColor: theme.border },
                  ]}
                >
                  <Ionicons
                    name={category.icon}
                    size={20}
                    color={theme.primary}
                  />
                  <Text
                    style={[styles.categoryTitle, { color: theme.textColor }]}
                  >
                    {category.title}
                  </Text>
                </View>
              )}

              {category.questions.map((question) => (
                <View
                  key={question.id}
                  style={[
                    styles.faqItem,
                    { backgroundColor: theme.cardBackground },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => toggleFaq(question.id)}
                  >
                    <Text
                      style={[
                        styles.faqQuestionText,
                        { color: theme.textColor },
                      ]}
                    >
                      {question.question}
                    </Text>
                    <Ionicons
                      name={
                        expandedFaq === question.id
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={20}
                      color={theme.secondaryTextColor}
                    />
                  </TouchableOpacity>

                  {expandedFaq === question.id && (
                    <View style={styles.faqAnswer}>
                      <Text
                        style={[
                          styles.faqAnswerText,
                          { color: theme.secondaryTextColor },
                        ]}
                      >
                        {question.answer}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}

          {searchQuery && filteredFAQs.length === 0 && (
            <View style={styles.noResults}>
              <Ionicons
                name="search"
                size={60}
                color={theme.secondaryTextColor}
              />
              <Text style={[styles.noResultsTitle, { color: theme.textColor }]}>
                {getText("noSearchResults")}
              </Text>
              <Text
                style={[
                  styles.noResultsDescription,
                  { color: theme.secondaryTextColor },
                ]}
              >
                {getText("noSearchResultsDesc")}
              </Text>
            </View>
          )}
        </View>

        {/* Contact Info */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {getText("contactInfo")}
          </Text>

          <View
            style={[
              styles.contactInfo,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color={theme.primary} />
              <Text style={[styles.contactText, { color: theme.textColor }]}>
                soporte@devplay.com
              </Text>
            </View>

            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color={theme.primary} />
              <Text style={[styles.contactText, { color: theme.textColor }]}>
                +1 (555) 123-4567
              </Text>
            </View>

            <View style={styles.contactItem}>
              <Ionicons name="time-outline" size={20} color={theme.primary} />
              <Text style={[styles.contactText, { color: theme.textColor }]}>
                {getText("businessHours")}
              </Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text
            style={[styles.appInfoText, { color: theme.secondaryTextColor }]}
          >
            DevPlay Store v1.0.0 • Build 100
          </Text>
          <TouchableOpacity>
            <Text style={[styles.privacyLink, { color: theme.primary }]}>
              {getText("privacyPolicy")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={[styles.privacyLink, { color: theme.primary }]}>
              {getText("termsOfService")}
            </Text>
          </TouchableOpacity>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  section: {
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  helpOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  helpOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  helpOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  helpOptionInfo: {
    flex: 1,
  },
  helpOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  helpOptionDescription: {
    fontSize: 14,
  },
  faqCategory: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  faqItem: {
    marginBottom: 1,
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 0,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
    marginRight: 10,
  },
  faqAnswer: {
    paddingBottom: 15,
    paddingRight: 30,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noResults: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },
  noResultsDescription: {
    fontSize: 14,
    textAlign: "center",
  },
  contactInfo: {
    borderRadius: 12,
    padding: 15,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 10,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  appInfoText: {
    fontSize: 12,
    marginBottom: 10,
  },
  privacyLink: {
    fontSize: 14,
    color: "#007AFF",
    marginVertical: 5,
  },
});
