import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { appsData as staticApps } from "../data/appsData"; // for fallback if needed

export default function CategoriesScreen({ route, navigation }) {
  const { theme, getText } = useTheme();
  const { categoryName, categoryId, gamesData } = route.params;
  const [appsData, setAppsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Install/download handler: simulate download and navigate to Downloads screen
  const handleInstall = (app) => {
    alert(getText("installing") || `Instalando ${app.name}`);
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate("Profile", {
        screen: "Downloads",
        params: { installApp: app },
      });
    } else {
      navigation.navigate("Profile", {
        screen: "Downloads",
        params: { installApp: app },
      });
    }
  };

  useEffect(() => {
    fetch("http://10.0.0.11:3001/apps")
      .then((res) => res.json())
      .then((data) => {
        setAppsData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar apps:", err);
        setAppsData(staticApps);
        setLoading(false);
      });
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
          style={[
            styles.installButton,
            item.isFree ? styles.freeButton : styles.paidButton,
          ]}
          onPress={() => handleInstall(item)} // Attach install handler
        >
          <Text style={styles.installButtonText}>
            {item.isFree ? getText("install") : item.price}
          </Text>
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
