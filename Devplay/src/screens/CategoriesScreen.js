import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { appsData as staticApps } from "../data/appsData"; // for fallback if needed
import { getApps, postMisApp, postDescarga, getMisApps } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { UserContext } from "../context/UserContext";

export default function CategoriesScreen({ route, navigation }) {
  const { theme, getText } = useTheme();
  const { categoryName, categoryId, gamesData } = route.params;
  const [appsData, setAppsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Contextos de usuario
  const { user: authUser } = useAuth();
  const { usuario: contextUser } = useContext(UserContext);
  const user = authUser || contextUser;

  // Estado para apps instaladas
  const [installedApps, setInstalledApps] = useState([]);
  // Cargar apps instaladas del usuario
  useEffect(() => {
    const loadInstalledApps = () => {
      const userId = user?.id || user?.id_usuario || user?.usuario_id;
      if (!userId) return;

      getMisApps(userId)
        .then((res) => {
          // Extraer solo los IDs de las apps instaladas
          const installedIds = res.data.map((app) => app.id_app);
          setInstalledApps(installedIds);
        })
        .catch((e) => console.error("Error loading installed apps:", e));
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

    const usuario_id = user?.id || user?.id_usuario || user?.usuario_id;

    if (!usuario_id) {
      Alert.alert(
        getText("error") || "Error",
        getText("userNotAuthenticated") || "Usuario no autenticado"
      );
      return;
    }

    if (isAppInstalled(item.id)) {
      Alert.alert(
        getText("info") || "Información",
        getText("appAlreadyInstalled") || "Esta aplicación ya está instalada"
      );
      return;
    }

    Alert.alert(
      getText("confirm") || "Confirmar",
      `${getText("installApp") || "¿Instalar"} ${item.name}?`,
      [
        {
          text: getText("cancel") || "Cancelar",
          style: "cancel",
        },
        {
          text: getText("install") || "Instalar",
          onPress: async () => {
            try {
              console.log("Llamando postDescarga con:", {
                id_app: item.id,
                usuario_id,
              });
              const response = await postDescarga({
                id_app: item.id,
                usuario_id,
              });
              console.log("Respuesta de postDescarga:", response.data);

              // Actualizar el estado local para reflejar que la app está instalada
              setInstalledApps((prev) => [...prev, item.id]);

              Alert.alert(
                getText("success") || "Éxito",
                getText("appInstalled") || "Aplicación instalada correctamente"
              );
            } catch (error) {
              console.error("Error al instalar:", error);
              Alert.alert(
                getText("error") || "Error",
                getText("installError") || "Error al instalar la aplicación"
              );
            }
          },
        },
      ]
    );
  };

  const getInstallLabel = (item) => {
    return isAppInstalled(item.id)
      ? getText("installed") || "Instalado"
      : getText("install") || "Instalar";
  };

  useEffect(() => {
    getApps()
      .then((res) => {
        setAppsData(res.data);
      })
      .catch((err) => {
        console.error("Error al cargar apps:", err);
        setAppsData(staticApps);
      })
      .finally(() => setLoading(false));
  }, []);

  // Determine games to display: specific list or by categoryId
  const filteredGames = loading
    ? []
    : gamesData ||
      (categoryId
        ? appsData.filter((app) => app.categoryId === categoryId)
        : appsData);

  const handleAppPress = (app) => {
    navigation.navigate("AppDetails", { app });
  };

  const renderGameItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.gameCard, { backgroundColor: theme.cardBackground }]}
      onPress={() => handleAppPress(item)}
    >
      <Image
        source={
          item.icon ? { uri: item.icon } : require("../../assets/icon.png")
        }
        style={styles.gameImage}
      />
      <View style={styles.gameInfo}>
        <Text style={[styles.gameName, { color: theme.textColor }]}>
          {item.name}
        </Text>
        <Text style={[styles.gameDeveloper, { color: theme.textSecondary }]}>
          {item.price}
        </Text>
        <View style={styles.gameMetrics}>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
              {item.rating?.toFixed(1) || ""}
            </Text>
          </View>
          <Text style={[styles.priceContainer, { color: theme.textSecondary }]}>
            {item.price}
          </Text>
        </View>
        <TouchableOpacity
          disabled={isAppInstalled(item.id)}
          style={[
            styles.installButton,
            {
              backgroundColor: isAppInstalled(item.id)
                ? theme.secondaryTextColor
                : theme.primary,
            },
          ]}
          onPress={() => handleInstall(item)}
        >
          <Text style={styles.installButtonText}>{getInstallLabel(item)}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>{getText("loading") || "Cargando..."}</Text>
      </View>
    );
  }

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
          {categoryName}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Games List */}
      <FlatList
        data={filteredGames}
        renderItem={renderGameItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.gamesList}
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  placeholder: {
    width: 40,
  },
  gamesList: {
    padding: 20,
  },
  gameCard: {
    flexDirection: "row",
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gameImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  gameInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  gameName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  gameDeveloper: {
    fontSize: 14,
    marginBottom: 8,
  },
  gameMetrics: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 5,
  },
  salePrice: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  installButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  freeButton: {
    backgroundColor: "#4CAF50",
  },
  paidButton: {
    backgroundColor: "#FF9800",
  },
  installButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
