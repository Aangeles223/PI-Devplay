import React, { useState, useEffect } from "react";
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

export default function HomeScreen({ navigation, route }) {
  const { theme, getText, language } = useTheme();

  // Usuario logueado (correo)
  const userEmail = route?.params?.usuario?.correo || null;
  const [userData, setUserData] = useState(null);

  // Estados para apps desde backend
  const [appsData, setAppsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para la búsqueda
  const [searchText, setSearchText] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Obtener apps al montar
  useEffect(() => {
    fetch("http://10.0.0.11:3001/apps")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAppsData(data);
        } else {
          setAppsData([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        setAppsData([]);
        setLoading(false);
        Alert.alert("Error", "No se pudo cargar la lista de apps");
      });
  }, []);

  // Obtener datos del usuario logueado
  useEffect(() => {
    if (userEmail) {
      fetch(`http://10.0.0.11:3001/usuario/${userEmail}`)
        .then((res) => res.json())
        .then((data) => {
          setUserData(data);
        })
        .catch(() => setUserData(null));
    }
  }, [userEmail]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando apps...</Text>
      </View>
    );
  }

  // Función para cerrar sesión
  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("userToken");
          navigation.navigate("Login"); // Usa navigate en vez de reset
        },
      },
    ]);
  };

  // Render avatar del usuario con botón de logout
  const renderUserAvatar = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {/* Avatar */}
      {userData && userData.avatar ? (
        <Image source={{ uri: userData.avatar }} style={styles.profilePic} />
      ) : userData && userData.nombre ? (
        <View style={styles.profilePic}>
          <Text style={styles.profileText}>
            {userData.nombre
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </Text>
        </View>
      ) : (
        <View style={styles.profilePic}>
          <Ionicons name="person" size={24} color="#fff" />
        </View>
      )}
    </View>
  );

  // Categorías con más opciones
  const categories = [
    {
      id: 1,
      name: getText("action"),
      icon: "game-controller",
      bgColor: "#FFEBEE",
      color: "#FF5252",
      category: "Acción",
    },
    {
      id: 2,
      name: getText("adventure"),
      icon: "compass",
      bgColor: "#E8F5E8",
      color: "#4CAF50",
      category: "Aventura",
    },
    {
      id: 3,
      name: getText("strategy"),
      icon: "extension-puzzle",
      bgColor: "#E3F2FD",
      color: "#2196F3",
      category: "Estrategia",
    },
    {
      id: 4,
      name: getText("sports"),
      icon: "football",
      bgColor: "#FFF3E0",
      color: "#FF5722",
      category: "Deportes",
    },
  ];

  // Filtros de apps
  const featuredApps = appsData.filter((app) => app.isFeatured);
  const trendingGames = appsData.slice(0, 4);
  const newReleases = appsData.slice(2, 6);
  const offers = appsData.filter((app) => app.isOnSale).slice(0, 4);
  const freeGames = appsData.filter((app) => app.isFree).slice(0, 4);
  const topFreeGames = appsData
    .filter((app) => app.isFree && app.rating >= 4.5)
    .slice(0, 4);
  const multiplayerGames = appsData
    .filter((app) => app.isMultiplayer)
    .slice(0, 4);
  const topPaidGames = appsData
    .filter((app) => app.isPremium && app.rating >= 4.5)
    .slice(0, 4);
  const offlineGames = appsData.filter((app) => app.isOffline).slice(0, 4);

  // Función de búsqueda mejorada
  const handleSearch = (text) => {
    setSearchText(text);

    if (text.trim().length > 0) {
      const filtered = appsData.filter((app) => {
        const appName = app.name?.toLowerCase() || "";
        const appDeveloper = app.developer?.toLowerCase() || "";
        const appCategory = app.category?.toLowerCase() || "";
        const searchLower = text.toLowerCase();

        return (
          appName.includes(searchLower) ||
          appDeveloper.includes(searchLower) ||
          appCategory.includes(searchLower)
        );
      });

      setSearchResults(filtered.slice(0, 5));
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  // Navegar a pantalla de búsqueda completa
  const goToSearch = () => {
    setSearchText("");
    setShowSearchResults(false);
    setSearchResults([]);
    setIsSearchFocused(false);
    navigation.navigate("Search");
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchText("");
    setShowSearchResults(false);
    setSearchResults([]);
  };

  // Manejar focus del input
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchText.trim().length > 0) {
      setShowSearchResults(true);
    }
  };

  // Manejar blur del input
  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    setTimeout(() => {
      if (!isSearchFocused) {
        setShowSearchResults(false);
      }
    }, 200);
  };

  // Seleccionar resultado de búsqueda
  const selectSearchResult = (app) => {
    setShowSearchResults(false);
    setSearchText("");
    setIsSearchFocused(false);
    navigation.navigate("AppDetails", { app });
  };

  // Renderizar resultado de búsqueda
  const renderSearchResult = (app) => (
    <TouchableOpacity
      key={app.id}
      style={[
        styles.searchResultItem,
        {
          backgroundColor: theme.cardBackground,
          borderBottomColor: theme.border,
        },
      ]}
      onPress={() => selectSearchResult(app)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: app.icon }} style={styles.searchResultIcon} />
      <View style={styles.searchResultInfo}>
        <Text style={[styles.searchResultName, { color: theme.textColor }]}>
          {app.name}
        </Text>
        <Text
          style={[
            styles.searchResultDeveloper,
            { color: theme.secondaryTextColor },
          ]}
        >
          {app.developer}
        </Text>
        <Text style={[styles.searchResultCategory, { color: theme.primary }]}>
          {getText(app.category?.toLowerCase())}
        </Text>
      </View>
      <View style={styles.searchResultActions}>
        <Text style={[styles.searchResultRating, { color: theme.textColor }]}>
          ⭐ {app.rating}
        </Text>
        <TouchableOpacity
          style={[styles.miniInstallButton, { backgroundColor: theme.primary }]}
          onPress={() => handleInstallPress(app)}
        >
          <Text style={styles.miniInstallButtonText}>
            {app.isFree ? getText("install") : "$"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const handleCategoryPress = (category) => {
    navigation.navigate("Categories", {
      categoryName: category.name,
      categoryFilter: category.category,
    });
  };

  const handleSeeMorePress = (sectionTitle, gamesData) => {
    navigation.navigate("Categories", {
      categoryName: sectionTitle,
      gamesData: gamesData,
    });
  };

  const handleInstallPress = (app) => {
    alert(`${getText("installing")} ${app.name}...`);
  };

  const handleAppPress = (app) => {
    navigation.navigate("AppDetails", { app });
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryChip, { backgroundColor: item.bgColor }]}
      onPress={() => handleCategoryPress(item)}
    >
      <Ionicons name={item.icon} size={16} color={item.color} />
      <Text style={[styles.categoryText, { color: item.color }]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderTrendingGame = ({ item }) => (
    <TouchableOpacity
      style={[styles.trendingCard, { backgroundColor: theme.cardBackground }]}
      onPress={() => handleAppPress(item)}
    >
      <Image source={{ uri: item.icon }} style={styles.trendingImage} />
      <View style={styles.trendingOverlay}>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={styles.trendingInfo}>
          <Text style={styles.trendingTitle}>{item.name}</Text>
          <Text style={styles.trendingDeveloper}>{item.developer}</Text>
          <TouchableOpacity
            style={styles.installButtonSmall}
            onPress={() => handleInstallPress(item)}
          >
            <Text style={styles.installButtonTextSmall}>
              {getText("install")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGameCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.gameCard, { backgroundColor: theme.cardBackground }]}
      onPress={() => handleAppPress(item)}
    >
      <Image source={{ uri: item.icon }} style={styles.gameImage} />
      <View style={styles.gameOverlay}>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>{item.name}</Text>
          <Text style={styles.gameDeveloper}>{item.developer}</Text>
          {item.isOnSale && (
            <View style={styles.priceContainer}>
              <Text style={styles.originalPrice}>{item.originalPrice}</Text>
              <Text style={styles.salePrice}>{item.salePrice}</Text>
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.installButtonSmall,
              item.isFree ? {} : styles.paidButton,
            ]}
            onPress={() => handleInstallPress(item)}
          >
            <Text style={styles.installButtonTextSmall}>
              {item.isFree
                ? getText("install")
                : item.isOnSale
                ? item.salePrice
                : item.originalPrice || getText("install")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id.toString()}
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
            renderItem={renderTrendingGame}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingList}
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
              onPress={() => handleSeeMorePress("Offers", offers)}
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
            data={offers}
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
              onPress={() => handleSeeMorePress("Free Games", freeGames)}
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
            data={freeGames}
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
              onPress={() => handleSeeMorePress("Top Free Games", topFreeGames)}
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
            data={topFreeGames}
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
              onPress={() =>
                handleSeeMorePress("Multiplayer", multiplayerGames)
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
            data={multiplayerGames}
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
              onPress={() => handleSeeMorePress("Top Paid Games", topPaidGames)}
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
            data={topPaidGames}
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
              onPress={() => handleSeeMorePress("Offline Games", offlineGames)}
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
            data={offlineGames}
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
    padding: 4,
  },
  searchResults: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    borderRadius: 12,
    maxHeight: 350,
    zIndex: 1000,
    elevation: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 0.5,
  },
  searchResultIcon: {
    width: 45,
    height: 45,
    borderRadius: 10,
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  searchResultDeveloper: {
    fontSize: 12,
    marginBottom: 2,
  },
  searchResultCategory: {
    fontSize: 11,
    fontWeight: "500",
  },
  searchResultActions: {
    alignItems: "flex-end",
  },
  searchResultRating: {
    fontSize: 11,
    marginBottom: 6,
  },
  miniInstallButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: "center",
  },
  miniInstallButtonText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
  seeAllResults: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 0.5,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 6,
  },
  noResultsDropdown: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    borderRadius: 12,
    padding: 20,
    zIndex: 1000,
    elevation: 10,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  searchAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchAllButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  seeMoreText: {
    fontSize: 14,
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  trendingList: {
    paddingRight: 20,
  },
  trendingCard: {
    width: 160,
    height: 200,
    marginRight: 15,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trendingImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  trendingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 12,
    justifyContent: "space-between",
  },
  ratingBadge: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  trendingInfo: {
    alignItems: "flex-start",
  },
  trendingTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  trendingDeveloper: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginBottom: 8,
  },
  installButtonSmall: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
  },
  installButtonTextSmall: {
    color: "#333",
    fontSize: 12,
    fontWeight: "600",
  },
  newReleasesList: {
    paddingRight: 20,
  },
  gameCard: {
    width: 140,
    height: 180,
    marginRight: 15,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameImage: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  gameOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  gameDeveloper: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  originalPrice: {
    color: "#ccc",
    fontSize: 12,
    textDecorationLine: "line-through",
    marginRight: 5,
  },
  salePrice: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "bold",
  },
  paidButton: {
    backgroundColor: "#FF9800",
  },
});
