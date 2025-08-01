import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function StorageScreen({ navigation }) {
  const { theme, getText, language } = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  // Mock storage data focused on games
  const storageData = {
    total: 64, // GB
    used: 42.8, // GB
    available: 21.2, // GB
    categories: [
      {
        id: "games",
        name: getText("games"),
        size: 25.4,
        icon: "game-controller",
        color: "#8E44AD",
        count: 45,
      },
      {
        id: "gameData",
        name: getText("gameData"),
        size: 8.6,
        icon: "save",
        color: "#007AFF",
        count: 67,
      },
      {
        id: "gameCache",
        name: getText("gameCache"),
        size: 3.2,
        icon: "server",
        color: "#FF9500",
        count: null,
      },
      {
        id: "gameDownloads",
        name: getText("gameDownloads"),
        size: 2.8,
        icon: "download",
        color: "#34C759",
        count: 12,
      },
      {
        id: "savedGames",
        name: getText("savedGames"),
        size: 1.9,
        icon: "bookmark",
        color: "#FF2D92",
        count: 89,
      },
      {
        id: "other",
        name: "Otros",
        size: 0.9,
        icon: "ellipsis-horizontal",
        color: "#666",
        count: null,
      },
    ],
  };

  // Top games by storage usage
  const topGames = [
    {
      id: "1",
      name: "Call of Duty Mobile",
      size: 4.2,
      icon: "gun",
      category: getText("action"),
    },
    {
      id: "2",
      name: "Genshin Impact",
      size: 3.8,
      icon: "sparkles",
      category: getText("rpg"),
    },
    {
      id: "3",
      name: "Fortnite",
      size: 3.1,
      icon: "game-controller",
      category: getText("action"),
    },
    {
      id: "4",
      name: "Minecraft",
      size: 2.4,
      icon: "cube",
      category: getText("adventure"),
    },
    {
      id: "5",
      name: "PUBG Mobile",
      size: 2.1,
      icon: "rifle",
      category: getText("action"),
    },
  ];

  const getPercentage = (size) => {
    return ((size / storageData.total) * 100).toFixed(1);
  };

  const formatSize = (sizeGB) => {
    if (sizeGB >= 1) {
      return `${sizeGB} GB`;
    } else {
      return `${Math.round(sizeGB * 1024)} MB`;
    }
  };

  const renderStorageCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryItem, { borderBottomColor: theme.border }]}
    >
      <View style={styles.categoryLeft}>
        <View
          style={[styles.categoryIcon, { backgroundColor: item.color + "20" }]}
        >
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryName, { color: theme.textColor }]}>
            {item.name}
          </Text>
          <Text
            style={[styles.categoryDetails, { color: theme.textSecondary }]}
          >
            {formatSize(item.size)} {item.count && `• ${item.count} elementos`}
          </Text>
        </View>
      </View>
      <View style={styles.categoryRight}>
        <Text style={[styles.categorySize, { color: theme.textColor }]}>
          {formatSize(item.size)}
        </Text>
        <Text
          style={[styles.categoryPercentage, { color: theme.textSecondary }]}
        >
          {getPercentage(item.size)}%
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTopApp = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.appItem,
        {
          backgroundColor: theme.cardBackground,
          borderBottomColor: theme.border,
        },
      ]}
    >
      <View
        style={[styles.appIcon, { backgroundColor: theme.backgroundColor }]}
      >
        <Ionicons name={item.icon} size={40} color="#8E44AD" />
      </View>
      <View style={styles.appInfo}>
        <Text style={[styles.appName, { color: theme.textColor }]}>
          {item.name}
        </Text>
        <Text style={[styles.appCategory, { color: theme.textSecondary }]}>
          {item.category}
        </Text>
      </View>
      <View style={styles.appRight}>
        <Text style={[styles.appSize, { color: theme.textColor }]}>
          {formatSize(item.size)}
        </Text>
        <TouchableOpacity
          style={[
            styles.manageButton,
            { backgroundColor: theme.backgroundColor },
          ]}
        >
          <Text style={[styles.manageButtonText, { color: theme.primary }]}>
            {language === "es" ? "Administrar" : "Manage"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
          {getText("storage")}
        </Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={theme.textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Storage Overview */}
        <View
          style={[
            styles.overviewCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.overviewHeader}>
            <Ionicons name="phone-portrait" size={24} color="#8E44AD" />
            <Text style={[styles.overviewTitle, { color: theme.textColor }]}>
              {language === "es" ? "Almacenamiento de juegos" : "Game Storage"}
            </Text>
          </View>

          <View
            style={[
              styles.storageCircle,
              { backgroundColor: theme.backgroundColor },
            ]}
          >
            <View style={styles.storageCircleInner}>
              <Text style={[styles.usedStorage, { color: theme.textColor }]}>
                {storageData.used} GB
              </Text>
              <Text style={[styles.usedLabel, { color: theme.textSecondary }]}>
                {language === "es" ? "utilizados" : "used"}
              </Text>
            </View>
          </View>

          <View style={styles.storageDetails}>
            <View style={styles.storageDetailItem}>
              <Text
                style={[
                  styles.storageDetailLabel,
                  { color: theme.textSecondary },
                ]}
              >
                Total
              </Text>
              <Text
                style={[styles.storageDetailValue, { color: theme.textColor }]}
              >
                {storageData.total} GB
              </Text>
            </View>
            <View style={styles.storageDetailItem}>
              <Text
                style={[
                  styles.storageDetailLabel,
                  { color: theme.textSecondary },
                ]}
              >
                {language === "es" ? "Disponible" : "Available"}
              </Text>
              <Text style={[styles.storageDetailValue, styles.availableValue]}>
                {storageData.available} GB
              </Text>
            </View>
          </View>

          {/* Storage Bar */}
          <View
            style={[
              styles.storageBar,
              { backgroundColor: theme.backgroundColor },
            ]}
          >
            {storageData.categories.map((category, index) => (
              <View
                key={category.id}
                style={[
                  styles.storageBarSegment,
                  {
                    width: `${getPercentage(category.size)}%`,
                    backgroundColor: category.color,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Storage Categories */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {language === "es" ? "Uso por categoría" : "Usage by category"}
            </Text>
            <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
              <Text style={[styles.toggleButton, { color: theme.primary }]}>
                {showDetails
                  ? language === "es"
                    ? "Ocultar detalles"
                    : "Hide details"
                  : language === "es"
                  ? "Ver detalles"
                  : "View details"}
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={storageData.categories}
            renderItem={renderStorageCategory}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Top Games */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {language === "es"
              ? "Juegos que más espacio ocupan"
              : "Games using most storage"}
          </Text>
          <FlatList
            data={topGames}
            renderItem={renderTopApp}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={[styles.viewAllText, { color: theme.primary }]}>
              {language === "es" ? "Ver todos los juegos" : "View all games"}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Storage Tips */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {language === "es"
              ? "Consejos para liberar espacio"
              : "Tips to free up space"}
          </Text>

          <View style={[styles.tipItem, { borderBottomColor: theme.border }]}>
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: theme.textColor }]}>
                {language === "es"
                  ? "Eliminar caché de juegos"
                  : "Clear game cache"}
              </Text>
              <Text
                style={[styles.tipDescription, { color: theme.textSecondary }]}
              >
                {language === "es"
                  ? "Libera hasta 3.1 GB eliminando archivos temporales de juegos"
                  : "Free up to 3.1 GB by removing temporary game files"}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.tipButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.tipButtonText}>
                {language === "es" ? "Limpiar" : "Clean"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.tipItem, { borderBottomColor: theme.border }]}>
            <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: theme.textColor }]}>
                {language === "es"
                  ? "Respaldar partidas guardadas"
                  : "Backup saved games"}
              </Text>
              <Text
                style={[styles.tipDescription, { color: theme.textSecondary }]}
              >
                {language === "es"
                  ? "Mueve partidas guardadas a almacenamiento en la nube"
                  : "Move saved games to cloud storage"}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.tipButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.tipButtonText}>
                {language === "es" ? "Configurar" : "Setup"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.tipItem, { borderBottomColor: theme.border }]}>
            <Ionicons name="download-outline" size={24} color="#34C759" />
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: theme.textColor }]}>
                {language === "es" ? "Juegos sin usar" : "Unused games"}
              </Text>
              <Text
                style={[styles.tipDescription, { color: theme.textSecondary }]}
              >
                {language === "es"
                  ? "Elimina juegos descargados que ya no juegas"
                  : "Remove downloaded games you no longer play"}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.tipButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.tipButtonText}>
                {language === "es" ? "Revisar" : "Review"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "white",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  overviewCard: {
    backgroundColor: "white",
    marginTop: 10,
    padding: 20,
    alignItems: "center",
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 10,
  },
  storageCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  storageCircleInner: {
    alignItems: "center",
  },
  usedStorage: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  usedLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  storageDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  storageDetailItem: {
    alignItems: "center",
  },
  storageDetailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  storageDetailValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  availableValue: {
    color: "#34C759",
  },
  storageBar: {
    flexDirection: "row",
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
    width: "100%",
  },
  storageBarSegment: {
    height: "100%",
  },
  section: {
    backgroundColor: "white",
    marginTop: 10,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  toggleButton: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  categoryDetails: {
    fontSize: 14,
    color: "#666",
  },
  categoryRight: {
    alignItems: "flex-end",
  },
  categorySize: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    color: "#666",
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  appCategory: {
    fontSize: 14,
    color: "#666",
  },
  appRight: {
    alignItems: "flex-end",
  },
  appSize: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  manageButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
  },
  manageButtonText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginTop: 10,
  },
  viewAllText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
    marginRight: 5,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tipContent: {
    flex: 1,
    marginLeft: 15,
  },
  tipTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  tipDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  tipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007AFF",
    borderRadius: 16,
    marginLeft: 15,
  },
  tipButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
});
