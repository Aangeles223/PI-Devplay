import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function AppDetailsScreen({ route, navigation }) {
  const { theme, getText, language } = useTheme();
  const { app } = route.params;
  const similarGames = [
    {
      id: "rdr2",
      name: "Red dead redemption 2",
      price: language === "es" ? "$40.00" : "$40.00",
      image: require("../../assets/imagen2.jpg"),
    },
    {
      id: "gow",
      name: "God Of War",
      price: getText("free"),
      image: require("../../assets/imagen1.jpg"),
    },
    {
      id: "forza",
      name: "Forza",
      price: getText("free"),
      image: require("../../assets/imagen2.jpg"),
    },
  ];

  const renderSimilarGame = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.similarGameCard,
        { backgroundColor: theme.cardBackground },
      ]}
    >
      <Image source={item.image} style={styles.similarGameImage} />
      <Text style={[styles.similarGameName, { color: theme.textColor }]}>
        {item.name}
      </Text>
      <Text style={[styles.similarGamePrice, { color: theme.textSecondary }]}>
        {item.price}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        <Image source={app.icon} style={styles.headerImage} />
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
      >
        {/* App Info Card */}
        <View
          style={[
            styles.appInfoCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.appInfoHeader}>
            <TouchableOpacity style={styles.downloadIcon}>
              <Ionicons name="download" size={24} color={theme.iconColor} />
            </TouchableOpacity>
            <View style={styles.appBasicInfo}>
              <Text style={[styles.appInfoTitle, { color: theme.textColor }]}>
                {getText("ageRating")}
              </Text>
              <Text
                style={[styles.appInfoSubtitle, { color: theme.textSecondary }]}
              >
                {getText("file")}
              </Text>
            </View>
            <View style={styles.appBasicInfo}>
              <Text style={[styles.appInfoTitle, { color: theme.textColor }]}>
                100MB
              </Text>
              <Text
                style={[styles.appInfoSubtitle, { color: theme.textSecondary }]}
              >
                {getText("ageRating")}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {getText("description")}
          </Text>
          <Text
            style={[styles.descriptionText, { color: theme.textSecondary }]}
          >
            {getText("gameDescription")}
          </Text>
        </View>

        {/* Similar Games */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {getText("similarGames")}
          </Text>
          <FlatList
            data={similarGames}
            renderItem={renderSimilarGame}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.similarGamesList}
          />
        </View>

        {/* Install Button */}
        <TouchableOpacity style={styles.installButton}>
          <Text style={styles.installButtonText}>{getText("install")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  similarGamesList: {
    paddingTop: 8,
  },
  similarGameCard: {
    width: 120,
    marginRight: 16,
  },
  similarGameImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  similarGameName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  similarGamePrice: {
    fontSize: 12,
  },
  installButton: {
    backgroundColor: "#8B5A96",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    marginVertical: 20,
  },
  installButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
