import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function SearchScreen({ navigation }) {
  const { theme, getText } = useTheme();
  const [searchText, setSearchText] = useState("");
  const [filteredApps, setFilteredApps] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    "minecraft",
    "call of duty",
    "among us",
    "pubg",
    "fortnite",
  ]);
  const [appsData, setAppsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener apps desde el backend al montar
  useEffect(() => {
    fetch("http://10.0.0.11:3001/apps")
      .then((res) => res.json())
      .then((data) => {
        setAppsData(data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert("Error", "No se pudo cargar la lista de apps");
      });
  }, []);

  // Función para filtrar aplicaciones
  const filterApps = (text) => {
    if (!text.trim()) {
      setFilteredApps([]);
      return;
    }

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

    setFilteredApps(filtered);
  };

  // Manejar cambio de texto en búsqueda
  const handleSearchChange = (text) => {
    setSearchText(text);
    filterApps(text);
  };

  // Manejar selección de búsqueda reciente
  const handleRecentSearch = (searchTerm) => {
    setSearchText(searchTerm);
    filterApps(searchTerm);
  };

  // Manejar selección de aplicación
  const handleAppPress = (app) => {
    // Agregar a búsquedas recientes si no existe
    if (
      !recentSearches.includes(searchText.toLowerCase()) &&
      searchText.trim()
    ) {
      setRecentSearches((prev) => [
        searchText.toLowerCase(),
        ...prev.slice(0, 4),
      ]);
    }

    navigation.navigate("AppDetails", { app });
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchText("");
    setFilteredApps([]);
  };

  // Renderizar item de aplicación
  const renderAppItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.appItem, { backgroundColor: theme.cardBackground }]}
      onPress={() => handleAppPress(item)}
    >
      <Image source={{ uri: item.icon }} style={styles.appIcon} />
      <View style={styles.appInfo}>
        <Text style={[styles.appName, { color: theme.textColor }]}>
          {item.name}
        </Text>
        <Text
          style={[styles.appDeveloper, { color: theme.secondaryTextColor }]}
        >
          {item.developer}
        </Text>
        <Text style={[styles.appCategory, { color: theme.primary }]}>
          {getText(item.category?.toLowerCase())}
        </Text>
      </View>
      <View style={styles.appActions}>
        <Text style={[styles.appRating, { color: theme.textColor }]}>
          ⭐ {item.rating}
        </Text>
        <TouchableOpacity
          style={[styles.installButton, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.installButtonText}>{getText("install")}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Renderizar búsqueda reciente
  const renderRecentSearch = ({ item }) => (
    <TouchableOpacity
      style={[styles.recentItem, { borderBottomColor: theme.border }]}
      onPress={() => handleRecentSearch(item)}
    >
      <Ionicons
        name="time-outline"
        size={20}
        color={theme.secondaryTextColor}
      />
      <Text style={[styles.recentText, { color: theme.textColor }]}>
        {item}
      </Text>
      <Ionicons
        name="arrow-up-outline"
        size={16}
        color={theme.secondaryTextColor}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando apps...</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {/* Header de búsqueda */}
      <View
        style={[styles.searchHeader, { backgroundColor: theme.cardBackground }]}
      >
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.backgroundColor },
          ]}
        >
          <Ionicons name="search" size={20} color={theme.secondaryTextColor} />
          <TextInput
            style={[styles.searchInput, { color: theme.textColor }]}
            placeholder={getText("searchPlaceholder") || "Buscar juegos..."}
            placeholderTextColor={theme.secondaryTextColor}
            value={searchText}
            onChangeText={handleSearchChange}
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
        </View>
      </View>

      {/* Contenido */}
      {searchText.trim() === "" ? (
        // Mostrar todos los juegos existentes cuando no hay texto de búsqueda
        <FlatList
          data={appsData}
          renderItem={renderAppItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
        />
      ) : filteredApps.length > 0 ? (
        // Mostrar resultados de búsqueda
        <View style={styles.resultsContainer}>
          <Text
            style={[styles.resultsCount, { color: theme.secondaryTextColor }]}
          >
            {filteredApps.length} {getText("results") || "resultados"} para "
            {searchText}"
          </Text>
          <FlatList
            data={filteredApps}
            renderItem={renderAppItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
          />
        </View>
      ) : (
        // Mostrar mensaje de no resultados
        <View style={styles.noResultsContainer}>
          <Ionicons name="search" size={64} color={theme.secondaryTextColor} />
          <Text style={[styles.noResultsTitle, { color: theme.textColor }]}>
            {getText("noResults") || "Sin resultados"}
          </Text>
          <Text
            style={[styles.noResultsText, { color: theme.secondaryTextColor }]}
          >
            {getText("noResultsDesc") ||
              "No encontramos juegos que coincidan con tu búsqueda"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  recentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  recentText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: 15,
  },
  resultsList: {
    paddingBottom: 20,
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  appInfo: {
    flex: 1,
    marginLeft: 15,
  },
  appName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  appDeveloper: {
    fontSize: 13,
    marginBottom: 2,
  },
  appCategory: {
    fontSize: 12,
    fontWeight: "500",
  },
  appActions: {
    alignItems: "flex-end",
  },
  appRating: {
    fontSize: 12,
    marginBottom: 8,
  },
  installButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  installButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  noResultsText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
