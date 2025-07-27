import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Deshabilitar screens nativas para evitar crashes
import { enableScreens } from "react-native-screens";
enableScreens(false);
import MainNavigator from "./src/navigation/MainNavigator";
import AuthNavigator from "./src/navigation/AuthNavigator";
import SplashScreen from "./src/components/SplashScreen";
import { ThemeProvider } from "./src/context/ThemeContext";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialRoute, setInitialRoute] = useState("Home");

  // Función para cargar el estado guardado
  const loadPersistedState = async () => {
    try {
      const savedRoute = await AsyncStorage.getItem("lastRoute");
      const userToken = await AsyncStorage.getItem("userToken");

      if (savedRoute) {
        setInitialRoute(savedRoute);
      }

      // Si hay un token guardado, el usuario ya está autenticado
      if (userToken) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log("Error loading persisted state:", error);
    }
  };

  useEffect(() => {
    loadPersistedState();
  }, []);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  const handleLogin = async (userData) => {
    try {
      // Guardar token de usuario
      await AsyncStorage.setItem("userToken", "user_logged_in");
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      setIsAuthenticated(true);
    } catch (error) {
      console.log("Error saving user data:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");
      setIsAuthenticated(false);
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        {isAuthenticated ? (
          <MainNavigator initialRoute={initialRoute} onLogout={handleLogout} />
        ) : (
          <AuthNavigator onLogin={handleLogin} />
        )}
        <StatusBar style="auto" />
      </NavigationContainer>
    </ThemeProvider>
  );
}
