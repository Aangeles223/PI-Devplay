import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AppDetailsScreen from "../screens/AppDetailsScreen";
import CategoriesScreen from "../screens/CategoriesScreen";

// Settings screens
import NotificationsScreen from "../screens/NotificationsScreen";
import LanguageScreen from "../screens/LanguageScreen";
import DarkModeScreen from "../screens/DarkModeScreen";
import DownloadsScreen from "../screens/DownloadsScreen";
import PurchasesScreen from "../screens/PurchasesScreen";
import StorageScreen from "../screens/StorageScreen";
import HelpScreen from "../screens/HelpScreen";
import HistoryScreen from "../screens/HistoryScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator para las pantallas individuales
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="AppDetails" component={AppDetailsScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
    </Stack.Navigator>
  );
}

// Stack Navigator para Search
function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="AppDetails" component={AppDetailsScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
    </Stack.Navigator>
  );
}

// Stack Navigator para Profile con props y todas las pantallas de configuración
function ProfileStack({ onLogout }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain">
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="DarkMode" component={DarkModeScreen} />
      <Stack.Screen name="Downloads" component={DownloadsScreen} />
      <Stack.Screen name="Purchases" component={PurchasesScreen} />
      <Stack.Screen name="Storage" component={StorageScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator({ initialRoute = "Home", onLogout }) {
  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Esta línea quita todos los headers azules
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Profile">
        {(props) => <ProfileStack {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
