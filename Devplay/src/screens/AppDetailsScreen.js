import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  Linking,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import Constants from "expo-constants";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { appsData } from "../data/appsData";

const { width } = Dimensions.get("window");

export default function AppDetailsScreen({ navigation, route }) {
  const { theme, getText, language, getGameText } = useTheme();
  const { usuario: user } = useContext(UserContext);
  // Host for API: derive dev server IP dynamically
  const localhost =
    Constants.manifest?.debuggerHost?.split(":")[0] ?? "localhost";
  const host =
    Platform.OS === "android"
      ? "http://10.0.2.2:3001"
      : `http://${localhost}:3001`;
  const { app } = route.params || {};

  // Compute header image source (backend icon or static image)
  const headerSource =
    typeof app.icon === "string"
      ? { uri: app.icon }
      : app.icon
      ? app.icon
      : app.image
      ? typeof app.image === "string"
        ? { uri: app.image }
        : app.image
      : null;
  // Prepare screenshots list: backend screenshots or fallback to static image
  const screenshotsList =
    Array.isArray(app.screenshots) && app.screenshots.filter(Boolean).length > 0
      ? app.screenshots.filter(Boolean)
      : app.image
      ? [app.image]
      : [];

  // Format release date (YYYY-MM-DD)
  const releaseDateText = app.releaseDate
    ? new Date(app.releaseDate).toLocaleDateString()
    : "-";
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);
  // Sections for "Secciones"
  const [sections, setSections] = useState([]);
  const [sectionApps, setSectionApps] = useState({});
  const [backendApps, setBackendApps] = useState([]);
  // Track if this app is already downloaded
  const [isDownloaded, setIsDownloaded] = useState(false);
  // Simulate download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const downloadTimerRef = useRef(null);

  // Reset screenshot modal when switching apps
  useEffect(() => {
    setSelectedScreenshot(null);
    setShowImageModal(false);
  }, [app.id]);
  // Fetch all apps from backend for section rendering
  useEffect(() => {
    fetch(`${host}/apps`)
      .then((res) => res.json())
      .then((data) => setBackendApps(data))
      .catch(console.error);
  }, [host]);

  // Fetch reviews from backend
  useEffect(() => {
    fetch(`${host}/apps/${app.id}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch(console.error);
  }, [app.id]);

  // Fetch sections and their apps
  useEffect(() => {
    fetch(`${host}/secciones`)
      .then((res) => res.json())
      .then((sects) => {
        setSections(sects);
        // Fetch apps for all sections and store raw DB entries
        Promise.all(
          sects.map((sec) =>
            fetch(`${host}/secciones/${sec.id}/apps`).then((r) => r.json())
          )
        )
          .then((allAppsLists) => {
            const mapped = {};
            sects.forEach((sec, idx) => {
              mapped[sec.id] = Array.isArray(allAppsLists[idx])
                ? allAppsLists[idx]
                : [];
            });
            setSectionApps(mapped);
          })
          .catch(console.error);
      })
      .catch(console.error);
  }, [host]);

  // On mount, check download status
  useEffect(() => {
    fetch(`${host}/descargas`)
      .then((res) => res.json())
      .then((data) => {
        const found = Array.isArray(data)
          ? data.some((d) => d.id_app === app.id)
          : false;
        setIsDownloaded(found);
      })
      .catch(console.error);
  }, [host, app.id]);

  if (!app) return <Text>Error: App no encontrada</Text>;

  // Format price: parse numeric price or display raw string
  let priceText;
  if (app.price != null) {
    const num = parseFloat(app.price);
    if (!isNaN(num)) {
      priceText = `$${num.toFixed(2)}`;
    } else {
      priceText = app.price; // raw price string (e.g., 'gratis')
    }
  } else if (app.isFree) {
    priceText = getText("free");
  } else {
    priceText = getText("unknown");
  }

  // Submit new review
  const handleSubmitReview = () => {
    if (!user) {
      alert(
        getText("loginToReview") || "Debes iniciar sesión para dejar una reseña"
      );
      return;
    }
    fetch(`${host}/apps/${app.id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_id: user.id,
        puntuacion: newRating,
        comentario: newComment,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          // Refresh reviews
          fetch(`${host}/apps/${app.id}/reviews`)
            .then((r) => r.json())
            .then((data) => setReviews(data))
            .catch(console.error);
          setNewRating(0);
          setNewComment("");
        }
      })
      .catch(console.error);
  };

  // Open app simulation
  const handleOpen = () => {
    alert(getText("open") || "Abrir app");
  };

  // Simulate download: register download in backend after progress
  const handleDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    // progress every second (4 minutes total -> 240s)
    downloadTimerRef.current = setInterval(() => {
      setDownloadProgress((prev) => {
        const next = prev + 100 / 240;
        if (next >= 100) {
          clearInterval(downloadTimerRef.current);
          setDownloadProgress(100);
          setIsDownloading(false);
          // record download in backend
          fetch(`${host}/descargas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_app: app.id }),
          })
            .then((res) => res.json())
            .then((resJson) => {
              if (resJson.success) {
                setIsDownloaded(true);
                alert(getText("downloadComplete") || "Descarga completada");
              }
            })
            .catch(console.error);
        }
        return next;
      });
    }, 1000);
  };

  // Calcular rating a mostrar: usar rating de la API o promedio de reseñas simuladas
  const displayRating =
    app.rating != null
      ? app.rating
      : reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const similarGames = [
    {
      id: "rdr2",
      name: "Red Dead Redemption 2",
      price: language === "es" ? "$40.00" : "$40.00",
      image: require("../../assets/games/red-dead-redemption-2/Redemption_icon.jpg"),
      rating: 4.8,
    },
    {
      id: "gow",
      name: "God Of War",
      price: getText("free"),
      image: require("../../assets/games/god-of-war/god_icon.jpg"),
      rating: 4.9,
    },
    {
      id: "forza",
      name: "Forza Horizon 5",
      price: getText("free"),
      image: require("../../assets/games/forza-horizon-5/Forza_icon.jpg"),
      rating: 4.7,
    },
    {
      id: "minecraft",
      name: "Minecraft",
      price: language === "es" ? "$567.99" : "$567.99",
      image: require("../../assets/games/minecraft/minecraft_icon.jpg"),
      rating: 4.5,
    },
    {
      id: "cod",
      name: "Call of Duty Mobile",
      price: getText("free"),
      image: require("../../assets/games/call-of-duty/cod_icon.jpg"),
      rating: 4.3,
    },
    {
      id: "pubg",
      name: "PUBG Mobile",
      price: getText("free"),
      image: require("../../assets/games/pubg-mobile/pug_icon.jpg"),
      rating: 4.2,
    },
  ];
  // Navigate to details of a similar game by name
  const handleSimilarGamePress = (game) => {
    const selected = appsData.find((a) => a.name === game.name);
    if (selected) {
      navigation.push("AppDetails", { app: selected });
    }
  };

  const renderSimilarGame = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.similarGameCard,
        { backgroundColor: theme.cardBackground },
      ]}
      onPress={() => handleSimilarGamePress(item)}
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

  // Render apps for each section
  const renderSectionApp = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.similarGameCard,
        { backgroundColor: theme.cardBackground },
      ]}
      onPress={() => navigation.push("AppDetails", { app: item })}
    >
      <Image
        source={typeof item.icon === "string" ? { uri: item.icon } : item.icon}
        style={styles.similarGameImage}
      />
      <Text
        style={[styles.similarGameName, { color: theme.textColor }]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderReview = ({ item }) => (
    <View
      style={[styles.reviewCard, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUserInfo}>
          <View style={styles.userAvatar}>
            {item.avatar ? (
              <Image
                source={{ uri: item.avatar }}
                style={styles.userAvatarImage}
              />
            ) : (
              <Text style={styles.userAvatarText}>{item.user.charAt(0)}</Text>
            )}
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
      <Image
        source={typeof item === "string" ? { uri: item } : item}
        style={styles.screenshotImage}
      />
    </TouchableOpacity>
  );

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        {headerSource && (
          <Image source={headerSource} style={styles.headerImage} />
        )}
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
                {displayRating.toFixed(1)}
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
            data={screenshotsList}
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
                {app.developer || getText("unknown")}
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
            {/* Nueva fila: versión, fecha y enlace APK */}
            <View style={styles.techInfoRow}>
              <Text
                style={[styles.techInfoLabel, { color: theme.textSecondary }]}
              >
                Versión
              </Text>
              <Text style={[styles.techInfoValue, { color: theme.textColor }]}>
                {app.version || "-"}
              </Text>
            </View>
            <View style={styles.techInfoRow}>
              <Text
                style={[styles.techInfoLabel, { color: theme.textSecondary }]}
              >
                Fecha de lanzamiento
              </Text>
              <Text style={[styles.techInfoValue, { color: theme.textColor }]}>
                {releaseDateText}
              </Text>
            </View>
            <View style={styles.techInfoRow}>
              <Text
                style={[styles.techInfoLabel, { color: theme.textSecondary }]}
              >
                APK
              </Text>
              {app.apkUrl ? (
                <TouchableOpacity onPress={() => Linking.openURL(app.apkUrl)}>
                  <Text
                    style={[
                      styles.techInfoValue,
                      { color: theme.primary, textDecorationLine: "underline" },
                    ]}
                  >
                    Descargar
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text
                  style={[styles.techInfoValue, { color: theme.textColor }]}
                >
                  -
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Tu reseña */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Tu reseña
          </Text>
          <View style={styles.ratingStars}>
            {[...Array(5)].map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setNewRating(i + 1)}>
                <Ionicons
                  name={i < newRating ? "star" : "star-outline"}
                  size={30}
                  color={theme.primary}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[
              styles.commentInput,
              { color: theme.textColor, borderColor: theme.textSecondary },
            ]}
            placeholder="Escribe tu comentario"
            placeholderTextColor={theme.textSecondary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitReview}
          >
            <Text style={styles.submitButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {getText("reviews")}
            </Text>
            <TouchableOpacity
              onPress={() => setShowAllReviews(!showAllReviews)}
            >
              <Text style={[styles.seeAllText, { color: theme.primary }]}>
                {showAllReviews
                  ? getText("showLess") || "Ver menos"
                  : getText("seeAll") || "Ver todo"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ratingOverview}>
            <View style={styles.ratingScore}>
              <Text style={[styles.ratingNumber, { color: theme.textColor }]}>
                {displayRating.toFixed(1)}
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

          <FlatList
            data={displayedReviews}
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
            nestedScrollEnabled
            scrollEnabled
            contentContainerStyle={styles.similarGamesList}
          />
        </View>

        {/* Secciones */}
        {sections.map((sec) => (
          <View key={sec.id} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {sec.name}
            </Text>
            <FlatList
              data={
                Array.isArray(sectionApps[sec.id])
                  ? sectionApps[sec.id]
                      .map((sa) => {
                        // use sa.id (alias from SQL) or sa.id_app if present
                        const sectionAppId = sa.id ?? sa.id_app;
                        return backendApps.find((a) => a.id === sectionAppId);
                      })
                      .filter(Boolean)
                  : []
              }
              renderItem={renderSectionApp}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={styles.similarGamesList}
            />
          </View>
        ))}

        {/* Install / Open Button */}
        <TouchableOpacity
          style={styles.installButton}
          onPress={isDownloaded ? handleOpen : handleDownload}
          disabled={isDownloading}
        >
          <Text style={styles.installButtonText}>
            {isDownloaded
              ? getText("open") || "Abrir"
              : isDownloading
              ? `${Math.round(downloadProgress)}%`
              : getText("download") || "Descargar"}
          </Text>
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
              <Image
                source={
                  typeof selectedScreenshot === "string"
                    ? { uri: selectedScreenshot }
                    : selectedScreenshot
                }
                style={styles.modalImage}
              />
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

const styles = {
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
    fontSize: 14,
    lineHeight: 20,
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
  userAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    height: 80,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
  },
};
