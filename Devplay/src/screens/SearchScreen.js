import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appsData } from "../data/appsData";
import { useTheme } from "../context/ThemeContext";

export default function SearchScreen({ navigation }) {
  const { theme, getText } = useTheme();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.length > 0) {
      const results = appsData.filter(
        (app) =>
          app.name.toLowerCase().includes(text.toLowerCase()) ||
          app.developer.toLowerCase().includes(text.toLowerCase()) ||
          app.category.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: theme.cardBackground }]}
    >
      <Image source={{ uri: item.icon }} style={styles.appIcon} />
      <View style={styles.appInfo}>
        <Text style={[styles.appName, { color: theme.textColor }]}>
          {item.name}
        </Text>
        <Text style={[styles.appDeveloper, { color: theme.textColor }]}>
          {item.developer}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={[styles.rating, { color: theme.textColor }]}>
            {item.rating}
          </Text>
          <Text style={[styles.downloads, { color: theme.textColor }]}>
            • {item.downloads}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.installButton}>
        <Text style={styles.installButtonText}>{getText("install")}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const popularSearches = [
    "WhatsApp",
    "Instagram",
    "TikTok",
    "Spotify",
    "Netflix",
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.cardBackground },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={theme.textColor}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.textColor }]}
          placeholder={getText("searchApps")}
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor={theme.textColor}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close" size={20} color={theme.textColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          style={styles.resultsList}
        />
      ) : searchText.length > 0 ? (
        <View style={styles.noResults}>
          <Ionicons name="search" size={50} color="#ccc" />
          <Text style={[styles.noResultsText, { color: theme.textColor }]}>
            {getText("noResults")}
          </Text>
          <Text style={[styles.noResultsSubtext, { color: theme.textColor }]}>
            {getText("tryOtherTerms")}
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.defaultView,
            { backgroundColor: theme.backgroundColor },
          ]}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              {getText("popularSearches")}
            </Text>
            {popularSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.popularSearch,
                  { backgroundColor: theme.cardBackground },
                ]}
                onPress={() => handleSearch(search)}
              >
                <Ionicons
                  name="trending-up"
                  size={20}
                  color={theme.textColor}
                />
                <Text
                  style={[styles.popularSearchText, { color: theme.textColor }]}
                >
                  {search}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 15,
    marginTop: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  resultsList: {
    flex: 1,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
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
  downloads: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
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
  },
  noResults: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 15,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
  defaultView: {
    flex: 1,
  },
  section: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  popularSearch: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  popularSearchText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
});
