import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("es");

  // Cargar configuraciones guardadas al iniciar
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      const savedLanguage = await AsyncStorage.getItem("language");

      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
      if (savedLanguage !== null) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.log("Error loading settings:", error);
    }
  };

  const toggleTheme = async (value) => {
    try {
      setIsDarkMode(value);
      await AsyncStorage.setItem("theme", JSON.stringify(value));
    } catch (error) {
      console.log("Error saving theme:", error);
    }
  };

  const changeLanguage = async (lang) => {
    try {
      setLanguage(lang);
      await AsyncStorage.setItem("language", lang);
    } catch (error) {
      console.log("Error saving language:", error);
    }
  };

  // Textos en diferentes idiomas
  const texts = {
    es: {
      // Home Screen
      home: "Inicio",
      search: "Buscar",
      profile: "Perfil",
      categories: "Categorías",
      featuredGames: "Juegos Destacados",

      // Categories
      action: "Acción",
      adventure: "Aventura",
      arcade: "Arcade",
      puzzle: "Puzzle",
      racing: "Carreras",
      rpg: "RPG",
      simulation: "Simulación",
      sports: "Deportes",
      strategy: "Estrategia",

      // Home Screen specific
      trending: "Juegos en tendencia",
      newReleases: "Nuevos lanzamientos",
      offers: "Ofertas",
      freeGames: "Juegos gratuitos",
      topFreeGames: "Top juegos gratis",
      multiplayer: "Multijugador",
      topPaidGames: "Top juegos de pago",
      offlineGames: "Juegos sin conexión",
      seeMore: "Ver más",
      install: "Instalar",
      installing: "Instalando",

      // Search Screen
      searchApps: "Buscar aplicaciones...",
      noResults: "No se encontraron resultados",
      tryOtherTerms: "Prueba con otros términos de búsqueda",
      popularSearches: "Búsquedas populares",

      // App Details Screen
      description: "Descripción",
      similarGames: "Juegos similares",
      years: "años",
      free: "Gratis",
      file: "Archivo",
      ageRating: "+12años",
      gameDescription:
        "Sumérgete en el salvaje oeste americano en esta épica aventura de mundo abierto.",

      // Profile
      myProfile: "Mi perfil",
      editProfile: "Editar perfil",
      logout: "Cerrar sesión",
      settings: "Configuración",

      // Settings
      notifications: "Notificaciones",
      language: "Idioma",
      darkMode: "Modo oscuro/claro",
      downloads: "Descargas",
      purchases: "Compras",
      storage: "Almacenamiento",
      help: "Ayuda",
      history: "Historial",

      // Common
      save: "Guardar",
      cancel: "Cancelar",
      close: "Cerrar",
      back: "Atrás",
      name: "Nombre",
      email: "Correo electrónico",
      phone: "Teléfono",
      country: "País",

      // Game specific
      games: "Juegos",
      gameStore: "Tienda de Juegos",
      freeGames: "Juegos Gratis",
      premiumGames: "Juegos Premium",
      newGames: "Juegos Nuevos",
      topGames: "Top Juegos",
      myGames: "Mis Juegos",
      downloadedGames: "Juegos Descargados",

      // Notifications
      newGameAlerts: "Alertas de juegos nuevos",
      gameOffers: "Ofertas de juegos",
      gameUpdates: "Actualizaciones de juegos",
      tournamentNotifications: "Notificaciones de torneos",

      // Storage specific to games
      gameData: "Datos de juegos",
      gameCache: "Caché de juegos",
      gameDownloads: "Descargas de juegos",
      savedGames: "Partidas guardadas",

      // Additional notification texts
      configuration: "Configuración",
      newReleases: "Nuevos lanzamientos",
      newGamesDesc: "Recibe notificaciones sobre nuevos juegos",
      offersDeals: "Ofertas y descuentos",
      offersDesc: "No te pierdas las mejores ofertas",
      downloadsCompleted: "Descargas completadas",
      downloadsDesc: "Notifica cuando terminen las descargas",
      updatesDesc: "Informa sobre actualizaciones disponibles",
      recentNotifications: "Notificaciones recientes",
      newGameAvailable: "Nuevo juego disponible",
      codNewSeason: "Call of Duty Mobile ha lanzado una nueva temporada",
      specialOffer: "Oferta especial",
      minecraftDiscount: "Minecraft tiene 50% de descuento por tiempo limitado",
      downloadComplete: "Descarga completada",
      pubgDownloaded: "PUBG Mobile se ha descargado correctamente",
      yesterday: "Ayer",
      hoursAgo: "Hace {0} horas",

      // Language Screen
      selectLanguage: "Seleccionar idioma",
      languageInfo: "Información",
      languageDescription:
        "Cambiar el idioma afectará toda la aplicación. Los juegos y contenido se mostrarán en el idioma seleccionado.",

      // Dark Mode Screen
      preview: "Vista Previa",
      currentTheme: "Tema actual",
      themeOptions: "Opciones de Tema",
      lightMode: "Modo Claro",
      lightModeDesc: "Fondo blanco con texto oscuro",
      darkModeOption: "Modo Oscuro",
      darkModeDesc: "Fondo oscuro con texto claro",
      autoMode: "Automático",
      autoModeDesc: "Sigue la configuración del sistema",
    },
    en: {
      // Home Screen
      home: "Home",
      search: "Search",
      profile: "Profile",
      categories: "Categories",
      featuredGames: "Featured Games",

      // Categories
      action: "Action",
      adventure: "Adventure",
      arcade: "Arcade",
      puzzle: "Puzzle",
      racing: "Racing",
      rpg: "RPG",
      simulation: "Simulation",
      sports: "Sports",
      strategy: "Strategy",

      // Home Screen specific
      trending: "Trending Games",
      newReleases: "New Releases",
      offers: "Offers",
      freeGames: "Free Games",
      topFreeGames: "Top Free Games",
      multiplayer: "Multiplayer",
      topPaidGames: "Top Paid Games",
      offlineGames: "Offline Games",
      seeMore: "See More",
      install: "Install",
      installing: "Installing",

      // Search Screen
      searchApps: "Search applications...",
      noResults: "No results found",
      tryOtherTerms: "Try other search terms",
      popularSearches: "Popular Searches",

      // App Details Screen
      description: "Description",
      similarGames: "Similar Games",
      years: "years",
      free: "Free",
      file: "File",
      ageRating: "+12years",
      gameDescription:
        "Immerse yourself in the American Wild West in this epic open-world adventure.",

      // Profile
      myProfile: "My profile",
      editProfile: "Edit profile",
      logout: "Sign out",
      settings: "Settings",

      // Settings
      notifications: "Notifications",
      language: "Language",
      darkMode: "Dark/Light mode",
      downloads: "Downloads",
      purchases: "Purchases",
      storage: "Storage",
      help: "Help",
      history: "History",

      // Common
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      back: "Back",
      name: "Name",
      email: "Email",
      phone: "Phone",
      country: "Country",

      // Game specific
      games: "Games",
      gameStore: "Game Store",
      freeGames: "Free Games",
      premiumGames: "Premium Games",
      newGames: "New Games",
      topGames: "Top Games",
      myGames: "My Games",
      downloadedGames: "Downloaded Games",

      // Notifications
      newGameAlerts: "New game alerts",
      gameOffers: "Game offers",
      gameUpdates: "Game updates",
      tournamentNotifications: "Tournament notifications",

      // Storage specific to games
      gameData: "Game data",
      gameCache: "Game cache",
      gameDownloads: "Game downloads",
      savedGames: "Saved games",

      // Additional notification texts
      configuration: "Configuration",
      newReleases: "New Releases",
      newGamesDesc: "Get notifications about new games",
      offersDeals: "Offers & Deals",
      offersDesc: "Don't miss the best deals",
      downloadsCompleted: "Downloads Completed",
      downloadsDesc: "Notify when downloads finish",
      updatesDesc: "Notify about available updates",
      recentNotifications: "Recent Notifications",
      newGameAvailable: "New game available",
      codNewSeason: "Call of Duty Mobile launched a new season",
      specialOffer: "Special Offer",
      minecraftDiscount: "Minecraft has 50% discount for limited time",
      downloadComplete: "Download Complete",
      pubgDownloaded: "PUBG Mobile downloaded successfully",
      yesterday: "Yesterday",
      hoursAgo: "{0} hours ago",

      // Language Screen
      selectLanguage: "Select Language",
      languageInfo: "Information",
      languageDescription:
        "Changing the language will affect the entire application. Games and content will be displayed in the selected language.",

      // Dark Mode Screen
      preview: "Preview",
      currentTheme: "Current theme",
      themeOptions: "Theme Options",
      lightMode: "Light Mode",
      lightModeDesc: "White background with dark text",
      darkModeOption: "Dark Mode",
      darkModeDesc: "Dark background with light text",
      autoMode: "Automatic",
      autoModeDesc: "Follows system settings",
    },
  };

  const getText = (key, param) => {
    const text = texts[language][key] || key;
    if (param && text.includes("{0}")) {
      return text.replace("{0}", param);
    }
    return text;
  };

  // Temas de colores
  const themes = {
    light: {
      backgroundColor: "#f8f9fa",
      cardBackground: "#ffffff",
      textColor: "#333333",
      secondaryTextColor: "#666666",
      textSecondary: "#666666",
      textTertiary: "#999999",
      iconColor: "#666666",
      primary: "#8E44AD",
      border: "#f0f0f0",
      success: "#34C759",
      warning: "#FF9500",
      error: "#FF3B30",
    },
    dark: {
      backgroundColor: "#1a1a1a",
      cardBackground: "#2a2a2a",
      textColor: "#ffffff",
      secondaryTextColor: "#cccccc",
      textSecondary: "#cccccc",
      textTertiary: "#999999",
      iconColor: "#cccccc",
      primary: "#8E44AD",
      border: "#444444",
      success: "#34C759",
      warning: "#FF9500",
      error: "#FF3B30",
    },
  };

  const theme = isDarkMode ? themes.dark : themes.light;

  const value = {
    isDarkMode,
    language,
    theme,
    toggleTheme,
    changeLanguage,
    getText,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
