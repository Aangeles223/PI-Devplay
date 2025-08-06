import React, { useState, useEffect, useContext } from "react";
import { Platform } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
// import Section from "../components/Section";  // removed to restore original design
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppCard from "../components/AppCard";
import {
  getApps,
  getAllCategorias,
  getMisApps,
  postMisApp,
  postDescarga,
} from "../services/api";
// import staticApps fallback (not needed for HomeScreen now)
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { UserContext } from "../context/UserContext";

export default function HomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, getText } = useTheme();

  // Contextos de usuario
  const { user: authUser } = useAuth();
  const { usuario: contextUser } = useContext(UserContext);
  const user = authUser || contextUser;

  const [appsData, setAppsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [installedApps, setInstalledApps] = useState([]);

  // añade este estado:
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // estados para la búsqueda
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  // Download records state
  const [downloadRecords, setDownloadRecords] = useState([]);
  // Estado para simular descarga
  const [downloadingId, setDownloadingId] = useState(null);

  const handleSearch = (text) => {
    setSearchText(text);
    // aquí filtras según tu lógica o haces un fetch
    const results = appsData.filter((app) =>
      app.name.toLowerCase().includes(text.toLowerCase())
    );
    setSearchResults(results);
  };

  const clearSearch = () => {
    setSearchText("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const goToSearch = () => {
    navigation.navigate("Search", { query: searchText });
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowSearchResults(true);
  };
  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    // si quieres ocultar al perder foco:
    // setShowSearchResults(false);
  };
  // Fetch download records on mount and when screen is focused
  useEffect(() => {
    const updateDownloads = () => {
      if (!userData) return;
      getMisApps(userData.id)
        .then((res) => {
          const records = Array.isArray(res.data) ? res.data : [];
          setDownloadRecords(records);
        })
        .catch(console.error);
    };
    updateDownloads();
    const unsubscribe = navigation.addListener("focus", updateDownloads);
    return unsubscribe;
  }, [navigation, userData]);

  // Clear and reload download records on user change
  useEffect(() => {
    if (userData) {
      setDownloadRecords([]);
      getMisApps(userData.id)
        .then((res) => {
          const records = Array.isArray(res.data) ? res.data : [];
          setDownloadRecords(records);
        })
        .catch(console.error);
    }
  }, [userData]);

  // Cargar apps instaladas del usuario
  useEffect(() => {
    const loadInstalledApps = () => {
      const userId = user?.id || user?.id_usuario || user?.usuario_id;
      console.log("HomeScreen - User data:", user);
      console.log("HomeScreen - Extracted userId:", userId);

      if (!userId) {
        console.log("HomeScreen - No user ID found, skipping getMisApps");
        return;
      }

      getMisApps(userId)
        .then((res) => {
          console.log("HomeScreen - getMisApps response:", res.data);
          // Extraer solo los IDs de las apps instaladas
          const installedIds = res.data.map((app) => app.id_app);
          setInstalledApps(installedIds);
        })
        .catch((e) => {
          console.error("Error loading installed apps:", e);
          console.error("Error details:", e.response?.data || e.message);
        });
    };

    loadInstalledApps();

    // Recargar cuando regresemos a esta pantalla
    const unsubscribe = navigation.addListener("focus", loadInstalledApps);
    return unsubscribe;
  }, [user, navigation]);

  // Verificar si una app está instalada
  const isAppInstalled = (appId) => {
    return installedApps.includes(appId);
  };

  // Handle install button press: alert and navigate to Downloads
  const handleInstall = (item) => {
    console.log("Botón instalación presionado para:", item.name);
    console.log("Usuario completo:", user);
    console.log("App ID:", item.id);

    // Verificar diferentes campos de ID del usuario
    const userId = user?.id || user?.id_usuario || user?.usuario_id;

    if (!userId) {
      console.log("No se encontró ID de usuario válido");
      return Alert.alert("Error", "Usuario no autenticado");
    }

    // Mostrar alerta de confirmación primero
    Alert.alert("Instalar", `¿Deseas instalar ${item.name}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Instalar",
        onPress: () => {
          postDescarga({ id_app: item.id, usuario_id: userId })
            .then(() => {
              Alert.alert("Éxito", "Juego instalado correctamente");
              // Actualizar lista de apps instaladas
              setInstalledApps((prev) => [...prev, item.id]);
            })
            .catch((err) => {
              console.error("Error al registrar descarga:", err);
              Alert.alert("Error", "Error al instalar el juego");
            });
        },
      },
    ]);
  };

  // Determine install button label based on download record
  const getInstallLabel = (item) => {
    return isAppInstalled(item.id)
      ? "Instalado"
      : getText("install") || "Instalar";
  };

  // Al montar, carga los datos estáticos y desactiva el loading
  useEffect(() => {
    getApps()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        console.log("[HomeScreen] Apps cargadas:", data.length);
        setAppsData(data);
      })
      .catch((err) => console.error("Error al cargar apps:", err))
      .finally(() => setLoading(false));
    getAllCategorias()
      .then((res) => {
        const cats = Array.isArray(res.data)
          ? res.data.map((c) => ({ id: c.id, name: c.name }))
          : [];
        console.log("[HomeScreen] Categorías cargadas:", cats.length);
        setCategories(cats);
      })
      .catch((err) => {
        console.error("Error al cargar categorías:", err);
        setCategories([]);
      });
    // cargar usuario desde AsyncStorage
    (async () => {
      try {
        const userJson = await AsyncStorage.getItem("userData");
        const user = userJson ? JSON.parse(userJson) : null;
        setUserData(user);
      } catch (e) {
        console.error("Error al cargar datos de usuario:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // renderizador de avatar de usuario
  const renderUserAvatar = () => (
    <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
      {userData?.avatar ? (
        <Image source={{ uri: userData.avatar }} style={styles.profilePic} />
      ) : (
        <Ionicons
          name="person-circle-outline"
          size={40}
          color={theme.textColor}
        />
      )}
    </TouchableOpacity>
  );

  // renderizador de juego en tendencia
  const renderTrendingGame = ({ item }) => (
    <TouchableOpacity
      style={styles.trendingCard}
      onPress={() => navigation.navigate("AppDetails", { app: item })}
    >
      <Image source={{ uri: item.icon }} style={styles.trendingImage} />
      <View style={styles.trendingOverlay}>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{item.rating?.toFixed(1) || ""}</Text>
        </View>
        <View style={styles.trendingInfo}>
          <Text style={styles.trendingTitle}>{item.name}</Text>
          <Text style={styles.trendingDeveloper}>{item.developer}</Text>
          <TouchableOpacity
            // Disable when already installed
            disabled={isAppInstalled(item.id)}
            style={[
              styles.installButtonSmall,
              {
                backgroundColor: isAppInstalled(item.id)
                  ? theme.secondaryTextColor
                  : theme.primary,
              },
            ]}
            onPress={() => handleInstall(item)}
          >
            <Text style={styles.installButtonTextSmall}>
              {getInstallLabel(item)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // renderizador de tarjeta de juego para otras secciones
  const renderGameCard = ({ item }) => {
    // Mostrar precio directamente desde la API
    const formattedPrice = item.price || getText("free") || "";

    // Fallback para imagen
    const imageSource = item.icon
      ? { uri: item.icon }
      : require("../../assets/icon.png");

    return (
      <TouchableOpacity
        style={[
          styles.cardContainer,
          {
            backgroundColor: theme.cardBackground,
            borderWidth: 1,
            borderColor: theme.border,
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            padding: 8,
          },
        ]}
        onPress={() => navigation.navigate("AppDetails", { app: item })}
      >
        <Image source={imageSource} style={styles.cardImage} />
        <View
          style={[
            styles.cardContent,
            { backgroundColor: theme.cardBackground, paddingHorizontal: 4 },
          ]}
        >
          <Text
            style={[styles.cardTitle, { color: theme.textColor }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            style={[styles.cardSubtitle, { color: theme.secondaryTextColor }]}
            numberOfLines={1}
          >
            {item.developer}
          </Text>
          {/* Category badge */}
          {item.category && (
            <View
              style={[styles.categoryLabel, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.categoryLabelText} numberOfLines={1}>
                {item.category}
              </Text>
            </View>
          )}
          {/* Subinfo: Age rating y tamaño */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <Ionicons
              name="alert-circle-outline"
              size={12}
              color={theme.primary}
            />
            <Text
              style={[
                styles.subInfoText,
                { color: theme.secondaryTextColor, marginLeft: 4 },
              ]}
            >
              {item.ageRating}
            </Text>
            <Ionicons
              name="download-outline"
              size={12}
              color={theme.primary}
              style={{ marginLeft: 12 }}
            />
            <Text
              style={[
                styles.subInfoText,
                { color: theme.secondaryTextColor, marginLeft: 4 },
              ]}
            >
              {item.size}
            </Text>
          </View>
          <View style={[styles.cardFooter, { paddingTop: 4 }]}>
            {/* Mostrar precio fijo */}
            <Text style={styles.salePrice}>{formattedPrice}</Text>
            <TouchableOpacity
              // Deshabilitar si ya instalado
              disabled={isAppInstalled(item.id)}
              style={[
                styles.installButton,
                {
                  marginLeft: "auto",
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  backgroundColor: isAppInstalled(item.id)
                    ? theme.secondaryTextColor
                    : theme.primary,
                },
              ]}
              onPress={() => handleInstall(item)}
            >
              <Text style={styles.installButtonText}>
                {getInstallLabel(item)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // renderizador de resultados de búsqueda
  const renderSearchResult = (app) => (
    <TouchableOpacity
      key={app.id}
      style={[
        styles.searchResultItem,
        { backgroundColor: theme.cardBackground },
      ]}
      onPress={() => navigation.navigate("AppDetails", { app })}
    >
      <Image
        source={app.icon ? { uri: app.icon } : require("../../assets/icon.png")}
        style={styles.searchResultIcon}
      />
      <View style={styles.searchResultInfo}>
        <Text style={[styles.searchResultName, { color: theme.textColor }]}>
          {app.name}
        </Text>
        <Text
          style={[
            styles.searchResultDeveloper,
            { color: theme.secondaryTextColor || theme.textSecondary },
          ]}
        >
          {app.developer}
        </Text>
      </View>
      <TouchableOpacity
        // Deshabilitar si ya instalado
        disabled={isAppInstalled(app.id)}
        style={[
          styles.miniInstallButton,
          {
            backgroundColor: isAppInstalled(app.id)
              ? theme.secondaryTextColor
              : theme.primary,
          },
        ]}
        onPress={() => handleInstall(app)}
      >
        <Text style={styles.miniInstallButtonText}>{getInstallLabel(app)}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <Text>{getText("loading") || "Cargando…"}</Text>
      </View>
    );
  }

  // Lista de categorías desde la BD
  const categoryList = categories;
  // Icons and colors per category
  const categoryIconMap = {
    Acción: "flash",
    Aventura: "map",
    Puzzle: "help-circle",
    Arcade: "game-controller",
    RPG: "body",
    Estrategia: "analytics",
    Deportes: "football",
    Carreras: "car",
  };
  const categoryColorMap = {
    Acción: "#E74C3C",
    Aventura: "#3498DB",
    Puzzle: "#9B59B6",
    Arcade: "#F1C40F",
    RPG: "#1ABC9C",
    Estrategia: "#E67E22",
    Deportes: "#2ECC71",
    Carreras: "#E84393",
  };
  const renderCategory = ({ item }) => {
    const iconName = categoryIconMap[item.name] || "apps";
    const bgColor = categoryColorMap[item.name] || theme.primary;
    return (
      <TouchableOpacity
        style={[
          styles.categoryChip,
          { backgroundColor: bgColor, borderColor: bgColor },
        ]}
        onPress={() =>
          navigation.navigate("Categories", {
            categoryId: item.id,
            categoryName: item.name,
          })
        }
      >
        <Ionicons
          name={iconName}
          size={16}
          color="#fff"
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.categoryText, { color: "#fff" }]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };
  // Acción para 'Ver más' en las secciones
  const handleSeeMorePress = (sectionTitle, data) => {
    Alert.alert(sectionTitle, getText("seeMoreDesc") || "Ver más juegos", [
      { text: getText("ok") || "Aceptar" },
    ]);
  };

  // Filtros para las secciones
  // Mostrar todos los juegos en cada sección si no hay filtro
  const trendingGames = appsData || [];
  const newReleases = appsData || [];
  // Ofertas: solo juegos de pago que estén en oferta
  const offers = (appsData || []).filter(
    (app) => app.isOnSale && app.isPremium
  );
  // Clasificar juegos gratuitos y de pago usando flags de la API
  // Solo apps con la palabra 'gratis' en el campo price
  const freeList = (appsData || []).filter((app) => {
    const priceText =
      app.price != null ? app.price.toString().trim().toLowerCase() : "";
    return priceText.includes("gratis");
  });
  const paidList = (appsData || []).filter((app) => app.isPremium);
  const topFreeList = freeList.filter((app) => app.rating >= 4.5);
  const topPaidList = paidList.filter((app) => app.rating >= 4.5);
  const multiList = (appsData || []).filter((app) => app.isMultiplayer);
  const offlineList = (appsData || []).filter((app) => app.isOffline);

  // Fallback de secciones: si el filtro no arroja resultados, mostramos todos o estáticos
  // Solo juegos de pago en oferta
  // Juegos en oferta
  // Ofertas: si no hay, mostrar solo juegos de pago
  const offersList = offers.length > 0 ? offers : paidList;
  // Solo juegos gratuitos
  const freeListSafe = freeList;
  // Solo juegos de pago
  const paidListSafe = paidList;
  // Solo top juegos gratuitos: si no hay, mostrar solo juegos gratuitos
  const topFreeListSafe = topFreeList.length > 0 ? topFreeList : freeList;
  // Solo top juegos de pago: si no hay, mostrar solo juegos de pago
  const topPaidListSafe = topPaidList.length > 0 ? topPaidList : paidList;
  // Solo juegos multijugador
  const multiListSafe = multiList;
  // Solo juegos sin conexión
  // Sin conexión: si no hay, mostrar todas las apps
  const offlineListSafe = offlineList.length > 0 ? offlineList : appsData;
  // Fallback de categorías si la API no respondió
  // Eliminamos fallback, usamos solo categorías de la BD

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <StatusBar
        translucent={false}
        backgroundColor={theme.cardBackground}
        barStyle={
          theme.userInterfaceStyle === "dark" ? "light-content" : "dark-content"
        }
      />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.profileSection}>
          {/* Avatar y nombre de usuario */}
          {renderUserAvatar()}
          <View style={styles.coinsSection}>
            <Ionicons name="trophy" size={16} color="#FF6B6B" />
            <Text style={styles.coinsText}>10,000</Text>
          </View>
        </View>
        {/* Search Bar Mejorada */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: theme.backgroundColor,
                borderColor: isSearchFocused ? theme.primary : "transparent",
                borderWidth: isSearchFocused ? 1 : 0,
              },
            ]}
          >
            <TouchableOpacity onPress={goToSearch}>
              <Ionicons
                name="search"
                size={20}
                color={theme.secondaryTextColor}
                style={styles.searchIcon}
              />
            </TouchableOpacity>
            <TextInput
              style={[styles.searchInput, { color: theme.textColor }]}
              placeholder={getText("searchPlaceholder") || "Buscar juegos..."}
              placeholderTextColor={theme.secondaryTextColor}
              value={searchText}
              onChangeText={(text) => {
                handleSearch(text);
                setShowSearchResults(true);
              }}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              returnKeyType="search"
              onSubmitEditing={goToSearch}
              autoFocus={true}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.secondaryTextColor}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={goToSearch}
              style={styles.advancedSearchButton}
            >
              <Ionicons
                name="options"
                size={16}
                color={theme.secondaryTextColor}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Home Search Results */}
      {showSearchResults && searchText.trim() !== "" ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AppCard
              app={item}
              price={item.price || getText("free") || ""}
              onPress={() => navigation.navigate("AppDetails", { app: item })}
              onInstall={() => handleInstall(item)}
              installLabel={getInstallLabel(item)}
              installDisabled={
                !!downloadRecords.find(
                  (d) => d.id_app === item.id && d.usuario_id === userData?.id
                )
              }
            />
          )}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Sección de categorías */}
          {categoryList.length > 0 && (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: theme.cardBackground,
                  borderRadius: 8,
                  marginHorizontal: 16,
                  paddingVertical: 16,
                },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
                  {getText("categories") || "Categorías"}
                </Text>
              </View>
              <FlatList
                data={categoryList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCategory}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              />
            </View>
          )}
          {/* Sección de juegos en tendencia */}
          {trendingGames.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
                  {getText("trendingGames") || "Juegos en tendencia"}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    handleSeeMorePress(
                      getText("trendingGames") || "Juegos en tendencia",
                      trendingGames
                    )
                  }
                >
                  <Text style={[styles.seeMore, { color: theme.primary }]}>
                    {getText("seeMore") || "Ver más"}
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={trendingGames}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTrendingGame}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingList}
              />
            </View>
          )}

          {/* Sección de nuevas entregas (releases) */}
          {newReleases.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
                  {getText("newReleases") || "Nuevas entregas"}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    handleSeeMorePress("Nuevas entregas", newReleases)
                  }
                >
                  <Text style={[styles.seeMore, { color: theme.primary }]}>
                    {getText("seeMore") || "Ver más"}
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={newReleases}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderGameCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.releasesList}
              />
            </View>
          )}

          {/* Sección de ofertas */}
          {offersList.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
                  {getText("offers") || "Ofertas"}
                </Text>
                <TouchableOpacity
                  onPress={() => handleSeeMorePress("Ofertas", offersList)}
                >
                  <Text style={[styles.seeMore, { color: theme.primary }]}>
                    {getText("seeMore") || "Ver más"}
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={offersList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderGameCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.offersList}
              />
            </View>
          )}

          {/* Sección de juegos gratuitos destacados */}
          {topFreeListSafe.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
                  {getText("topFreeGames") || "Top juegos gratuitos"}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    handleSeeMorePress("Top Gratis", topFreeListSafe)
                  }
                >
                  <Text style={[styles.seeMore, { color: theme.primary }]}>
                    {getText("seeMore") || "Ver más"}
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={topFreeListSafe}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderGameCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topFreeList}
              />
            </View>
          )}

          {/* Sección de juegos de pago destacados */}
          {topPaidListSafe.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
                  {getText("topPaidGames") || "Top juegos de pago"}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    handleSeeMorePress("Top Pago", topPaidListSafe)
                  }
                >
                  <Text style={[styles.seeMore, { color: theme.primary }]}>
                    {getText("seeMore") || "Ver más"}
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={topPaidListSafe}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderGameCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topPaidList}
              />
            </View>
          )}

          {/* Sección de juegos multijugador */}
          {multiListSafe.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
                  {getText("multiplayerGames") || "Juegos multijugador"}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    handleSeeMorePress("Multijugador", multiListSafe)
                  }
                >
                  <Text style={[styles.seeMore, { color: theme.primary }]}>
                    {getText("seeMore") || "Ver más"}
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={multiListSafe}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderGameCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.multiList}
              />
            </View>
          )}

          {/* Sección de juegos sin conexión */}
          {offlineListSafe.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
                  {getText("offlineGames") || "Juegos sin conexión"}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    handleSeeMorePress("Sin conexión", offlineListSafe)
                  }
                >
                  <Text style={[styles.seeMore, { color: theme.primary }]}>
                    {getText("seeMore") || "Ver más"}
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={offlineListSafe}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderGameCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.offlineList}
              />
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === "android" ? 25 : 0,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    zIndex: 100,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  coinsSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinsText: {
    color: "#FF6B6B",
    fontWeight: "bold",
    marginLeft: 4,
  },
  searchSection: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
  advancedSearchButton: {
    marginLeft: 8,
  },
  section: {
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeMore: {
    fontSize: 14,
    fontWeight: "500",
  },
  trendingList: {
    paddingVertical: 8,
  },
  trendingCard: {
    width: 120,
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  trendingImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  trendingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    padding: 8,
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    color: "#fff",
    fontWeight: "bold",
  },
  trendingInfo: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 8,
    padding: 8,
  },
  trendingTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  trendingDeveloper: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
  },
  installButtonSmall: {
    backgroundColor: "#FF6B6B",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  installButtonTextSmall: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  cardContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#777",
    marginBottom: 8,
  },
  categoryLabel: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  categoryLabelText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 12,
  },
  subInfoText: {
    fontSize: 12,
    color: "#777",
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  salePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  installButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  installButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: 16,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  searchResultDeveloper: {
    fontSize: 14,
    color: "#777",
  },
  miniInstallButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  miniInstallButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },
  categoryChip: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  categoryText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  offersList: {
    paddingVertical: 8,
  },
  topFreeList: {
    paddingVertical: 8,
  },
  topPaidList: {
    paddingVertical: 8,
  },
  multiList: {
    paddingVertical: 8,
  },
  offlineList: {
    paddingVertical: 8,
  },
  categoriesList: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
