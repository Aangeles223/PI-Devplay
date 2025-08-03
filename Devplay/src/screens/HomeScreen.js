import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppCard from "../components/AppCard";
// import staticApps fallback (not needed for HomeScreen now)
import { useNavigation, useRoute } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, getText } = useTheme();

  const [appsData, setAppsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // añade este estado:
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // estados para la búsqueda
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  // Download records state
  const [downloadRecords, setDownloadRecords] = useState([]);
  // Compute API host
  const host =
    Platform.OS === "android"
      ? "http://10.0.2.2:3001"
      : "http://10.0.0.11:3001";

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
    if (!host) return;
    const fetchDownloads = () => {
      fetch(`${host}/descargas`)
        .then((res) => res.json())
        .then((data) => setDownloadRecords(Array.isArray(data) ? data : []))
        .catch(console.error);
    };
    fetchDownloads();
    const unsubscribe = navigation.addListener("focus", fetchDownloads);
    return unsubscribe;
  }, [host, navigation]);

  // Handle install button press: alert and navigate to Downloads
  const handleInstall = (item) => {
    alert(getText("downloading") || `Descargando ${item.name}`);
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate("Profile", {
        screen: "Downloads",
        params: { installApp: item },
      });
    } else {
      navigation.navigate("Profile", {
        screen: "Downloads",
        params: { installApp: item },
      });
    }
  };

  // Determine install button label based on download record
  const getInstallLabel = (item) => {
    const rec = downloadRecords.find((d) => d.id_app === item.id);
    if (rec) {
      return rec.instalada === 1
        ? getText("installed") || "Instalada"
        : `${getText("downloading") || "Instalando"}...`;
    }
    return getText("install") || "Instalar";
  };

  // Al montar, carga los datos estáticos y desactiva el loading
  useEffect(() => {
    // 1) Cargamos apps
    // Cargamos apps desde API
    fetch(`${host}/apps`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Error: appsData no es un arreglo:", data);
          setAppsData([]);
        } else {
          setAppsData(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // 2) Cargamos categorías y formateamos con validación
    fetch(`${host}/categorias`)
      .then((res) => {
        if (!res.ok) {
          // Leer el mensaje de error devuelto por el servidor
          return res.json().then((err) => {
            console.error(
              `Error al cargar categorías (servidor): ${err.error || err}`
            );
            return [];
          });
        }
        return res.json();
      })
      .then((cats) => {
        if (!Array.isArray(cats)) {
          console.error("Error: categorías no es un arreglo:", cats);
          setCategories([]);
          return;
        }
        // Mapear campos de BD a id y name
        const formatted = cats.map((c) => ({
          id: c.id_categoria || c.id || c.id_cat,
          name: c.nombre || c.name || c.nombre_categoria,
        }));
        setCategories(formatted);
      })
      .catch((err) => {
        console.error("Error al cargar categorías:", err);
        setCategories([]);
      });

    // 3) Cargamos datos de usuario
    const loadUserData = async () => {
      try {
        const userJson = await AsyncStorage.getItem("userData");
        const user = userJson != null ? JSON.parse(userJson) : null;
        setUserData(user);
      } catch (e) {
        console.error("Error al cargar datos de usuario:", e);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
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
            style={styles.installButtonSmall}
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
        <View style={[styles.cardContent, { paddingHorizontal: 4 }]}>
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
              style={[
                styles.installButton,
                {
                  marginLeft: "auto",
                  paddingVertical: 6,
                  paddingHorizontal: 12,
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
        style={styles.miniInstallButton}
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

  // Fallback dinámico de categorías si BD no respondió
  const categoryList =
    categories.length > 0
      ? categories
      : Array.from(new Set(appsData.map((app) => app.category)))
          .filter((c) => c)
          .map((name) => ({ id: name, name }));
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
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={[styles.header, { backgroundColor: theme.cardBackground }]}
        >
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
                onChangeText={handleSearch}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                returnKeyType="search"
                onSubmitEditing={() => {
                  if (searchText.trim().length > 0) {
                    goToSearch();
                  }
                }}
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

            {/* Resultados de búsqueda en dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <View
                style={[
                  styles.searchResults,
                  {
                    backgroundColor: theme.cardBackground,
                    shadowColor: theme.textColor,
                  },
                ]}
              >
                {searchResults.map(renderSearchResult)}
                {searchResults.length === 5 && (
                  <TouchableOpacity
                    style={[
                      styles.seeAllResults,
                      { borderTopColor: theme.border },
                    ]}
                    onPress={goToSearch}
                  >
                    <Text style={[styles.seeAllText, { color: theme.primary }]}>
                      {getText("seeMore") || "Ver todos los resultados"}
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Mensaje de sin resultados */}
            {showSearchResults &&
              searchResults.length === 0 &&
              searchText.length > 0 && (
                <View
                  style={[
                    styles.noResultsDropdown,
                    { backgroundColor: theme.cardBackground },
                  ]}
                >
                  <Text
                    style={[
                      styles.noResultsText,
                      { color: theme.secondaryTextColor },
                    ]}
                  >
                    {getText("noResultsDesc") || "No se encontraron juegos"}
                  </Text>
                  <TouchableOpacity
                    style={styles.searchAllButton}
                    onPress={goToSearch}
                  >
                    <Text
                      style={[
                        styles.searchAllButtonText,
                        { color: theme.primary },
                      ]}
                    >
                      Buscar en toda la tienda
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {getText("categories")}
          </Text>
          <FlatList
            data={categoryList}
            renderItem={renderCategory}
            keyExtractor={(cat) => cat.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Juegos en tendencia */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {getText("trending")}
            </Text>
            <TouchableOpacity
              onPress={() => handleSeeMorePress("Trending", trendingGames)}
            >
              <Text
                style={[
                  styles.seeMoreText,
                  { color: theme.secondaryTextColor },
                ]}
              >
                {getText("seeMore")}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={trendingGames}
            renderItem={renderGameCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newReleasesList}
          />
        </View>

        {/* Nuevos lanzamientos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {getText("newReleases")}
            </Text>
            <TouchableOpacity
              onPress={() => handleSeeMorePress("New Releases", newReleases)}
            >
              <Text
                style={[
                  styles.seeMoreText,
                  { color: theme.secondaryTextColor },
                ]}
              >
                {getText("seeMore")}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={newReleases}
            renderItem={renderGameCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newReleasesList}
          />
        </View>

        {/* Ofertas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {getText("offers")}
            </Text>
            <TouchableOpacity
              onPress={() => handleSeeMorePress("Offers", offersList)}
            >
              <Text
                style={[
                  styles.seeMoreText,
                  { color: theme.secondaryTextColor },
                ]}
              >
                {getText("seeMore")}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={offersList}
            renderItem={renderGameCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newReleasesList}
          />
        </View>

        {/* Juegos Gratuitos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {getText("freeGames")}
            </Text>
            <TouchableOpacity
              onPress={() => handleSeeMorePress("Free Games", freeListSafe)}
            >
              <Text
                style={[
                  styles.seeMoreText,
                  { color: theme.secondaryTextColor },
                ]}
              >
                {getText("seeMore")}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={freeListSafe}
            renderItem={renderGameCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newReleasesList}
          />
        </View>

        {/* Top Juegos Gratis */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {getText("topFreeGames")}
            </Text>
            <TouchableOpacity
              onPress={() =>
                handleSeeMorePress("Top Free Games", topFreeListSafe)
              }
            >
              <Text
                style={[
                  styles.seeMoreText,
                  { color: theme.secondaryTextColor },
                ]}
              >
                {getText("seeMore")}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={topFreeListSafe}
            renderItem={renderGameCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newReleasesList}
          />
        </View>

        {/* Multijugador */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {getText("multiplayer")}
            </Text>
            <TouchableOpacity
              onPress={() => handleSeeMorePress("Multiplayer", multiListSafe)}
            >
              <Text
                style={[
                  styles.seeMoreText,
                  { color: theme.secondaryTextColor },
                ]}
              >
                {getText("seeMore")}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={multiListSafe}
            renderItem={renderGameCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newReleasesList}
          />
        </View>

        {/* Top Juegos de Pago */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {getText("topPaidGames")}
            </Text>
            <TouchableOpacity
              onPress={() =>
                handleSeeMorePress("Top Paid Games", topPaidListSafe)
              }
            >
              <Text
                style={[
                  styles.seeMoreText,
                  { color: theme.secondaryTextColor },
                ]}
              >
                {getText("seeMore")}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={topPaidListSafe}
            renderItem={renderGameCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newReleasesList}
          />
        </View>

        {/* Juegos Sin Conexión */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {getText("offlineGames")}
            </Text>
            <TouchableOpacity
              onPress={() =>
                handleSeeMorePress("Offline Games", offlineListSafe)
              }
            >
              <Text
                style={[
                  styles.seeMoreText,
                  { color: theme.secondaryTextColor },
                ]}
              >
                {getText("seeMore")}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={offlineListSafe}
            renderItem={renderGameCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newReleasesList}
          />
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  coinsSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  coinsText: {
    marginLeft: 6,
    color: "#FF6B6B",
    fontWeight: "600",
    fontSize: 14,
  },
  searchSection: {
    position: "relative",
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  advancedSearchButton: {
    marginLeft: 8,
    padding: 8, // <— concreta un valor para 'padding'
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoriesList: {
    paddingRight: 20,
  },
  trendingList: {
    paddingLeft: 20,
    paddingBottom: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  categoryText: {
    fontWeight: "500",
  },
  trendingCard: {
    width: 140,
    borderRadius: 12,
    marginRight: 16,
    marginVertical: 8,
    overflow: "hidden",
    elevation: 4,
  },
  trendingImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  trendingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    padding: 10,
  },
  ratingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  ratingText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 12,
  },
  trendingInfo: {
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 10,
  },
  trendingTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  trendingDeveloper: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 8,
  },
  installButtonSmall: {
    backgroundColor: "#FF6B6B",
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  installButtonTextSmall: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 12,
  },
  gameCard: {
    width: 120,
    borderRadius: 10,
    marginRight: 15,
    overflow: "hidden",
    elevation: 2,
  },
  gameImage: {
    width: "100%",
    height: 80,
    resizeMode: "cover",
  },
  gameOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    padding: 10,
  },
  gameTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  gameDeveloper: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 8,
  },
  gameInfo: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    padding: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  originalPrice: {
    color: "#fff",
    textDecorationLine: "line-through",
    fontSize: 12,
    marginRight: 4,
  },
  salePrice: {
    color: "#FF6B6B",
    fontWeight: "600",
    fontSize: 14,
  },
  installButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  installButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontWeight: "500",
    fontSize: 16,
    marginBottom: 4,
  },
  searchResultDeveloper: {
    color: "#666",
    fontSize: 14,
    marginBottom: 2,
  },
  searchResultCategory: {
    fontSize: 12,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  searchResultActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniInstallButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  miniInstallButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 12,
  },
  searchResults: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    zIndex: 999,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 4,
  },
  seeAllResults: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seeAllText: {
    fontWeight: "500",
    fontSize: 14,
  },
  noResultsDropdown: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    zIndex: 999,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 4,
    padding: 15,
  },
  noResultsText: {
    color: "#666",
    fontSize: 14,
    marginBottom: 10,
  },
  searchAllButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  searchAllButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
  appsList: {
    paddingBottom: 20,
  },
  cardContainer: {
    width: 140,
    marginRight: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: 80,
  },
  cardContent: {
    padding: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  subInfoText: {
    fontSize: 12,
    marginTop: 0,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  // Category label badge
  categoryLabel: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  categoryLabelText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  // Rating under category
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  newReleasesList: {
    paddingLeft: 20,
    paddingBottom: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryLabel: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  categoryLabelText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
});
