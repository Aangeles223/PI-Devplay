import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import {
  getApps,
  getAllSecciones,
  getAppsDeSeccion,
  postDescarga,
  getMisApps,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { UserContext } from "../context/UserContext";

export default function SearchScreen({ navigation }) {
  const { theme, getText } = useTheme();
  const { user: authUser } = useAuth();
  const { usuario: contextUser } = useContext(UserContext);

  // Usar el usuario de cualquiera de los dos contextos
  const user = authUser || contextUser;
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
  const [sections, setSections] = useState([]);
  const [sectionApps, setSectionApps] = useState({});
  const [installedApps, setInstalledApps] = useState([]);

  // Obtener apps desde el backend al montar
  useEffect(() => {
    getApps()
      .then((res) => {
        setAppsData(res.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert("Error", "No se pudo cargar la lista de apps");
      });
  }, []);
  // Obtener secciones y sus apps
  useEffect(() => {
    getAllSecciones()
      .then((res) => {
        // Map section objects to ensure id field exists (use id, id_seccion or seccion_id)
        const mappedSects = res.data
          .map((sec) => {
            const id = sec.id ?? sec.id_seccion ?? sec.seccion_id;
            return { ...sec, id };
          })
          .filter((sec) => sec.id != null);
        setSections(mappedSects);
        // Fetch apps for each section by normalized id
        mappedSects.forEach((sec) => {
          getAppsDeSeccion(sec.id)
            .then((r) => {
              setSectionApps((prev) => ({ ...prev, [sec.id]: r.data }));
            })
            .catch((e) =>
              console.error(`Error loading apps for section ${sec.id}:`, e)
            );
        });
      })
      .catch((e) => console.error("Error loading sections:", e));
  }, []);

  // Cargar apps instaladas del usuario
  useEffect(() => {
    const userId = user?.id || user?.id_usuario || user?.usuario_id;
    if (!userId) return;

    getMisApps(userId)
      .then((res) => {
        // Extraer solo los IDs de las apps instaladas
        const installedIds = res.data.map((app) => app.id_app);
        setInstalledApps(installedIds);
      })
      .catch((e) => console.error("Error loading installed apps:", e));
  }, [user]);

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

  // Verificar si una app está instalada
  const isAppInstalled = (appId) => {
    return installedApps.includes(appId);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchText("");
    setFilteredApps([]);
  };

  // Renderizar item de aplicación
  const renderAppItem = ({ item }) => (
    <View style={[styles.appItem, { backgroundColor: theme.cardBackground }]}>
      <TouchableOpacity
        style={styles.appContent}
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
      </TouchableOpacity>
      <View style={styles.appActions}>
        <Text style={[styles.appRating, { color: theme.textColor }]}>
          ⭐ {item.rating}
        </Text>
        <TouchableOpacity
          style={[
            styles.installButton,
            {
              backgroundColor: isAppInstalled(item.id)
                ? theme.secondaryTextColor
                : theme.primary,
            },
          ]}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={isAppInstalled(item.id)}
          onPress={(e) => {
            e.stopPropagation();
            console.log("Botón instalación presionado para:", item.name);
            console.log("Usuario completo:", user);
            console.log("Usuario ID:", user?.id);
            console.log("Usuario id_usuario:", user?.id_usuario);
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
          }}
        >
          <Text style={styles.installButtonText}>
            {isAppInstalled(item.id)
              ? "Instalado"
              : getText("install") || "Instalar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
        // Mostrar secciones con sus apps cuando no hay búsqueda activa
        <ScrollView showsVerticalScrollIndicator={false}>
          {sections.map((sec, index) => (
            <View
              key={sec.id ?? index}
              style={{ marginBottom: 20, paddingHorizontal: 20 }}
            >
              <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
                {" "}
                {sec.name}{" "}
              </Text>
              <FlatList
                data={
                  Array.isArray(sectionApps[sec.id])
                    ? sectionApps[sec.id]
                        .map((sa) => appsData.find((a) => a.id === sa.id))
                        .filter(Boolean)
                    : []
                }
                renderItem={renderAppItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                contentContainerStyle={styles.resultsList}
              />
            </View>
          ))}
        </ScrollView>
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
    paddingTop: 10,
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
  },
  appContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minHeight: 44,
    minWidth: 80,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  installButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
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
