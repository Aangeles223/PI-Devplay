import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function AppDetailsScreen({ route, navigation }) {
  const { theme, getText, language, getGameText } = useTheme();
  const { app } = route.params;
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Datos de reseñas simuladas
  const reviews = [
    {
      id: 1,
      user: "Angel_212121",
      rating: 5,
      date: "Hace 5 días",
      comment:
        "Está perfectamente optimizado, falta agregar la opción para poder jugar con controles de ps4 y Xbox one. Hay que aprovechar que se puede usar la compatibilidad con mandos, hay muchas personas que tienes problemas para jugar estos tipos de juegos porque les suda la pantalla.",
    },
    {
      id: 2,
      user: "GamerPro2024",
      rating: 4,
      date: "Hace 1 semana",
      comment:
        "Excelente juego, muy buena calidad gráfica y jugabilidad fluida. Solo le falta mejorar algunos aspectos del matchmaking.",
    },
    {
      id: 3,
      user: "MobileGamer",
      rating: 5,
      date: "Hace 2 semanas",
      comment:
        "El mejor juego de disparos para móvil que he jugado. Los controles son intuitivos y los gráficos son impresionantes.",
    },
  ];

  const similarGames = [
    {
      id: "rdr2",
      name: "Red Dead Redemption 2",
      price: language === "es" ? "$40.00" : "$40.00",
      image: require("../../assets/games/red-dead-redemption-2/icon.jpg"),
      rating: 4.8,
    },
    {
      id: "gow",
      name: "God Of War",
      price: getText("free"),
      image: require("../../assets/games/god-of-war/icon.jpg"),
      rating: 4.9,
    },
    {
      id: "forza",
      name: "Forza Horizon 5",
      price: getText("free"),
      image: require("../../assets/games/forza-horizon-5/icon.jpg"),
      rating: 4.7,
    },
  ];

  const renderSimilarGame = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.similarGameCard,
        { backgroundColor: theme.cardBackground },
      ]}
    >
      <Image source={item.image} style={styles.similarGameImage} />
      <Text style={[styles.similarGameName, { color: theme.textColor }]}>
        {item.name}
      </Text>
      <View style={styles.similarGameInfo}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
            {item.rating}
          </Text>
        </View>
        <Text style={[styles.similarGamePrice, { color: theme.textSecondary }]}>
          {item.price}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderReview = ({ item }) => (
    <View
      style={[styles.reviewCard, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUserInfo}>
          <View style={[styles.userAvatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.userAvatarText}>{item.user.charAt(0)}</Text>
          </View>
          <View>
            <Text style={[styles.reviewUser, { color: theme.textColor }]}>
              {item.user}
            </Text>
            <Text style={[styles.reviewDate, { color: theme.textSecondary }]}>
              {item.date}
            </Text>
          </View>
        </View>
        <View style={styles.reviewRating}>
          {[...Array(5)].map((_, index) => (
            <Ionicons
              key={index}
              name="star"
              size={14}
              color={index < item.rating ? "#FFD700" : theme.textSecondary}
            />
          ))}
        </View>
      </View>
      <Text style={[styles.reviewComment, { color: theme.textSecondary }]}>
        {item.comment}
      </Text>
    </View>
  );

  const renderScreenshot = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedScreenshot(item);
        setShowImageModal(true);
      }}
    >
      <Image source={item} style={styles.screenshotImage} />
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        <Image source={app.icon} style={styles.headerImage} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={[styles.content, { backgroundColor: theme.backgroundColor }]}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info Card */}
        <View
          style={[
            styles.appInfoCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.appInfoHeader}>
            <View style={styles.appBasicInfo}>
              <Text style={[styles.appInfoTitle, { color: theme.textColor }]}>
                {app.rating}
              </Text>
              <Text
                style={[styles.appInfoSubtitle, { color: theme.textSecondary }]}
              >
                {getText("rating")}
              </Text>
            </View>
            <View style={styles.appBasicInfo}>
              <Text style={[styles.appInfoTitle, { color: theme.textColor }]}>
                {app.size}
              </Text>
              <Text
                style={[styles.appInfoSubtitle, { color: theme.textSecondary }]}
              >
                {getText("size")}
              </Text>
            </View>
            <View style={styles.appBasicInfo}>
              <Text style={[styles.appInfoTitle, { color: theme.textColor }]}>
                {app.ageRating}
              </Text>
              <Text
                style={[styles.appInfoSubtitle, { color: theme.textSecondary }]}
              >
                {getText("ageRating")}
              </Text>
            </View>
          </View>
        </View>

        {/* Screenshots */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Screenshots
          </Text>
          <FlatList
            data={app.screenshots}
            renderItem={renderScreenshot}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.screenshotsList}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {getText("description")}
          </Text>
          <Text
            style={[styles.descriptionText, { color: theme.textSecondary }]}
          >
            {getGameText(app.description)}
          </Text>
        </View>

        {/* Technical Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {getText("techSpecs")}
          </Text>
          <View
            style={[
              styles.techInfoCard,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.techInfoRow}>
              <Text
                style={[styles.techInfoLabel, { color: theme.textSecondary }]}
              >
                {getText("developer")}
              </Text>
              <Text style={[styles.techInfoValue, { color: theme.textColor }]}>
                {app.developer}
              </Text>
            </View>
            <View style={styles.techInfoRow}>
              <Text
                style={[styles.techInfoLabel, { color: theme.textSecondary }]}
              >
                {getText("size")}
              </Text>
              <Text style={[styles.techInfoValue, { color: theme.textColor }]}>
                {app.size}
              </Text>
            </View>
            <View style={styles.techInfoRow}>
              <Text
                style={[styles.techInfoLabel, { color: theme.textSecondary }]}
              >
                {getText("category")}
              </Text>
              <Text style={[styles.techInfoValue, { color: theme.textColor }]}>
                {getText(app.category.toLowerCase())}
              </Text>
            </View>
            <View style={styles.techInfoRow}>
              <Text
                style={[styles.techInfoLabel, { color: theme.textSecondary }]}
              >
                {getText("compatibility")}
              </Text>
              <Text style={[styles.techInfoValue, { color: theme.textColor }]}>
                Con este iPhone
              </Text>
            </View>
            <View style={styles.techInfoRow}>
              <Text
                style={[styles.techInfoLabel, { color: theme.textSecondary }]}
              >
                Idiomas
              </Text>
              <Text style={[styles.techInfoValue, { color: theme.textColor }]}>
                Español y 9 más
              </Text>
            </View>
            <View style={styles.techInfoRow}>
              <Text
                style={[styles.techInfoLabel, { color: theme.textSecondary }]}
              >
                Edad
              </Text>
              <Text style={[styles.techInfoValue, { color: theme.textColor }]}>
                {app.ageRating}
              </Text>
            </View>
            <View style={styles.techInfoRow}>
              <Text
                style={[styles.techInfoLabel, { color: theme.textSecondary }]}
              >
                Compras dentro de la app
              </Text>
              <Text style={[styles.techInfoValue, { color: theme.textColor }]}>
                Sí
              </Text>
            </View>
            <View style={styles.techInfoRow}>
              <Text
                style={[styles.techInfoLabel, { color: theme.textSecondary }]}
              >
                Copyright
              </Text>
              <Text style={[styles.techInfoValue, { color: theme.textColor }]}>
                © 2025 {app.developer}
              </Text>
            </View>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {getText("reviews")}
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>
                Ver todo
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ratingOverview}>
            <View style={styles.ratingScore}>
              <Text style={[styles.ratingNumber, { color: theme.textColor }]}>
                {app.rating}
              </Text>
              <Text
                style={[styles.ratingSubtext, { color: theme.textSecondary }]}
              >
                de 5
              </Text>
            </View>
            <View style={styles.ratingBars}>
              {[5, 4, 3, 2, 1].map((star) => (
                <View key={star} style={styles.ratingBar}>
                  <View style={styles.starRow}>
                    {[...Array(star)].map((_, i) => (
                      <Ionicons key={i} name="star" size={12} color="#FFD700" />
                    ))}
                  </View>
                  <View
                    style={[
                      styles.barBackground,
                      { backgroundColor: theme.textSecondary + "30" },
                    ]}
                  >
                    <View
                      style={[
                        styles.barFill,
                        {
                          backgroundColor: theme.primary,
                          width: `${star === 5 ? 80 : star === 4 ? 15 : 5}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
            <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>
              265,220 calificaciones
            </Text>
          </View>

          <Text style={[styles.reviewPrompt, { color: theme.textSecondary }]}>
            Toca para calificar:
          </Text>
          <View style={styles.ratingStars}>
            {[...Array(5)].map((_, index) => (
              <TouchableOpacity key={index}>
                <Ionicons name="star-outline" size={30} color={theme.primary} />
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Similar Games */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Juegos similares
          </Text>
          <FlatList
            data={similarGames}
            renderItem={renderSimilarGame}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.similarGamesList}
          />
        </View>

        {/* Install Button */}
        <TouchableOpacity style={styles.installButton}>
          <Text style={styles.installButtonText}>Obtener</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setShowImageModal(false)}
          />
          <View style={styles.modalImageContainer}>
            {selectedScreenshot && (
              <Image source={selectedScreenshot} style={styles.modalImage} />
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowImageModal(false)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImageContainer: {
    height: 300,
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
  },
  appInfoCard: {
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  appInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  appBasicInfo: {
    alignItems: "center",
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  appInfoSubtitle: {
    fontSize: 12,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  // Screenshots styles
  screenshotsList: {
    paddingVertical: 10,
  },
  screenshotImage: {
    width: 200,
    height: 120,
    borderRadius: 10,
    marginRight: 15,
  },
  // Description styles
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  // Technical Info styles
  techInfoCard: {
    padding: 20,
    borderRadius: 15,
  },
  techInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  techInfoLabel: {
    fontSize: 16,
    flex: 1,
  },
  techInfoValue: {
    fontSize: 16,
    flex: 1,
    textAlign: "right",
  },
  // Reviews styles
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: "600",
  },
  ratingOverview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  ratingScore: {
    alignItems: "center",
    marginRight: 20,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: "bold",
  },
  ratingSubtext: {
    fontSize: 16,
  },
  ratingBars: {
    flex: 1,
    marginRight: 15,
  },
  ratingBar: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  starRow: {
    flexDirection: "row",
    width: 80,
  },
  barBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  reviewCount: {
    fontSize: 14,
    textAlign: "center",
  },
  reviewPrompt: {
    fontSize: 16,
    marginBottom: 10,
  },
  ratingStars: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  reviewCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  reviewUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userAvatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: "600",
  },
  reviewDate: {
    fontSize: 14,
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: 15,
    lineHeight: 22,
  },
  // Similar games styles
  similarGamesList: {
    paddingVertical: 10,
  },
  similarGameCard: {
    width: 120,
    marginRight: 15,
    padding: 12,
    borderRadius: 12,
  },
  similarGameImage: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  similarGameName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  similarGameInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  similarGamePrice: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Install button styles
  installButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  installButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalImageContainer: {
    position: "relative",
  },
  modalImage: {
    width: width * 0.9,
    height: width * 0.9 * 0.6,
    borderRadius: 15,
  },
  closeButton: {
    position: "absolute",
    top: -50,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  appInfoCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  appInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  downloadIcon: {
    padding: 8,
  },
  appBasicInfo: {
    alignItems: "center",
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  appInfoSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  similarGamesList: {
    paddingTop: 8,
  },
  similarGameCard: {
    width: 120,
    marginRight: 16,
  },
  similarGameImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  similarGameName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  similarGamePrice: {
    fontSize: 12,
  },
  installButton: {
    backgroundColor: "#8B5A96",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    marginVertical: 20,
  },
  installButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
