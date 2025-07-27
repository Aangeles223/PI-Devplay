import React, { useState } from "react";
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

export default function FavoritesScreen({ navigation }) {
  const { theme, getText } = useTheme();
  // Por ahora usamos datos simulados, luego puedes implementar AsyncStorage
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      name: "WhatsApp",
      developer: "Meta",
      rating: 4.2,
      icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    },
    {
      id: 2,
      name: "Instagram",
      developer: "Meta",
      rating: 4.3,
      icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
    },
  ]);

  const removeFavorite = (appId) => {
    setFavorites(favorites.filter((app) => app.id !== appId));
  };

  const renderFavorite = ({ item }) => (
    <View
      style={[styles.favoriteCard, { backgroundColor: theme.cardBackground }]}
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
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={[styles.rating, { color: theme.textColor }]}>
            {item.rating}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFavorite(item.id)}
        >
          <Ionicons name="heart" size={20} color="#FF6B6B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.installButton}>
          <Text style={styles.installButtonText}>{getText("install")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (favorites.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: theme.backgroundColor },
        ]}
      >
        <Ionicons
          name="heart-outline"
          size={80}
          color={theme.secondaryTextColor}
        />
        <Text style={[styles.emptyTitle, { color: theme.textColor }]}>
          {getText("noFavorites")}
        </Text>
        <Text
          style={[styles.emptySubtitle, { color: theme.secondaryTextColor }]}
        >
          {getText("noFavoritesDesc")}
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.exploreButtonText}>{getText("exploreApps")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <FlatList
        data={favorites}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  list: {
    padding: 15,
    paddingTop: 50,
  },
  favoriteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 15,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  appDeveloper: {
    fontSize: 14,
    color: "#666",
    marginVertical: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    alignItems: "center",
  },
  removeButton: {
    padding: 8,
    marginBottom: 8,
  },
  installButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  installButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
