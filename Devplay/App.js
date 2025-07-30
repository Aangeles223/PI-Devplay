import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { enableScreens } from "react-native-screens";
enableScreens(false);

import MainNavigator from "./src/navigation/MainNavigator";
import AuthNavigator from "./src/navigation/AuthNavigator";
import SplashScreen from "./src/components/SplashScreen";
import { ThemeProvider } from "./src/context/ThemeContext";
import { UserContext } from "./src/context/UserContext";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialRoute, setInitialRoute] = useState("Home");
  const [usuarioGlobal, setUsuarioGlobal] = useState(null);

  // Carga sesión
  useEffect(() => {
    AsyncStorage.getItem("usuario").then((stored) => {
      if (stored) {
        const u = JSON.parse(stored);
        setUsuarioGlobal(u);
        setIsAuthenticated(true);
        setInitialRoute("Profile");
      }
      setIsLoading(false);
    });
  }, []);

  const handleLogin = async (user) => {
    setUsuarioGlobal(user);
    await AsyncStorage.setItem("usuario", JSON.stringify(user));
    setIsAuthenticated(true);
    setInitialRoute("Profile");
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("usuario");
    setUsuarioGlobal(null);
    setIsAuthenticated(false);
    setInitialRoute("Home");
  };

  if (isLoading) return <SplashScreen />;

  return (
    <ThemeProvider>
      <UserContext.Provider
        value={{ usuario: usuarioGlobal, setUsuario: setUsuarioGlobal }}
      >
        <NavigationContainer>
          {isAuthenticated ? (
            <MainNavigator
              initialRouteName={initialRoute}
              onLogout={handleLogout}
            />
          ) : (
            <AuthNavigator onLogin={handleLogin} />
          )}
          <StatusBar style="auto" />
        </NavigationContainer>
      </UserContext.Provider>
    </ThemeProvider>
  );
}
