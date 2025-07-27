// Script para actualizar los juegos restantes con traducciones completas
// Este archivo contiene las actualizaciones para los juegos restantes

const remainingGamesUpdates = {
  "God Of War": {
    description: {
      es: "Épica aventura de acción con Kratos y Atreus en la mitología nórdica.",
      en: "Epic action adventure with Kratos and Atreus in Norse mythology.",
    },
    features: {
      es: ["Acción", "Aventura", "Historia épica", "Combat brutal"],
      en: ["Action", "Adventure", "Epic story", "Brutal combat"],
    },
    techSpecs: {
      es: {
        "Versión Android": "7.0+",
        "RAM mínima": "4GB",
        Almacenamiento: "89MB",
        Procesador: "Snapdragon 845+",
        Gráficos: "Adreno 630+",
        Conexión: "No requerida",
      },
      en: {
        "Android Version": "7.0+",
        "Minimum RAM": "4GB",
        Storage: "89MB",
        Processor: "Snapdragon 845+",
        Graphics: "Adreno 630+",
        Connection: "Not required",
      },
    },
    reviews: [
      {
        id: 1,
        user: "KratosWarrior",
        rating: 5,
        date: "Hace 2 días",
        comment: {
          es: "Una obra maestra de acción, la relación padre-hijo es conmovedora.",
          en: "An action masterpiece, the father-son relationship is touching.",
        },
      },
      {
        id: 2,
        user: "NorseGamer",
        rating: 5,
        date: "Hace 1 semana",
        comment: {
          es: "Increíble adaptación de la mitología nórdica con combates brutales.",
          en: "Incredible adaptation of Norse mythology with brutal combat.",
        },
      },
    ],
  },

  "Forza Horizon 5": {
    description: {
      es: "El mejor juego de carreras en mundo abierto ambientado en México.",
      en: "The best open world racing game set in Mexico.",
    },
    features: {
      es: ["Carreras", "Mundo abierto", "México", "Multijugador"],
      en: ["Racing", "Open world", "Mexico", "Multiplayer"],
    },
    techSpecs: {
      es: {
        "Versión Android": "8.0+",
        "RAM mínima": "6GB",
        Almacenamiento: "12GB",
        Procesador: "Snapdragon 855+",
        Gráficos: "Adreno 640+",
        Conexión: "Internet requerida",
      },
      en: {
        "Android Version": "8.0+",
        "Minimum RAM": "6GB",
        Storage: "12GB",
        Processor: "Snapdragon 855+",
        Graphics: "Adreno 640+",
        Connection: "Internet required",
      },
    },
    reviews: [
      {
        id: 1,
        user: "SpeedDemon",
        rating: 5,
        date: "Hace 1 día",
        comment: {
          es: "Gráficos increíbles y física de conducción perfecta. México se ve hermoso.",
          en: "Incredible graphics and perfect driving physics. Mexico looks beautiful.",
        },
      },
      {
        id: 2,
        user: "RacingPro",
        rating: 4,
        date: "Hace 3 días",
        comment: {
          es: "Excelente variedad de coches y pistas, aunque consume mucha batería.",
          en: "Excellent variety of cars and tracks, although it consumes a lot of battery.",
        },
      },
    ],
  },

  "Need for Speed": {
    description: {
      es: "Carreras callejeras ilegales con persecuciones policiales épicas.",
      en: "Illegal street racing with epic police chases.",
    },
    features: {
      es: ["Carreras callejeras", "Persecuciones", "Tuning", "Acción"],
      en: ["Street racing", "Chases", "Tuning", "Action"],
    },
    techSpecs: {
      es: {
        "Versión Android": "6.0+",
        "RAM mínima": "3GB",
        Almacenamiento: "4.5GB",
        Procesador: "Snapdragon 660+",
        Gráficos: "Adreno 512+",
        Conexión: "Internet requerida",
      },
      en: {
        "Android Version": "6.0+",
        "Minimum RAM": "3GB",
        Storage: "4.5GB",
        Processor: "Snapdragon 660+",
        Graphics: "Adreno 512+",
        Connection: "Internet required",
      },
    },
    reviews: [
      {
        id: 1,
        user: "StreetRacer",
        rating: 4,
        date: "Hace 2 días",
        comment: {
          es: "Adrenalina pura, las persecuciones policiales son emocionantes.",
          en: "Pure adrenaline, police chases are exciting.",
        },
      },
      {
        id: 2,
        user: "NeedForSpeedFan",
        rating: 4,
        date: "Hace 4 días",
        comment: {
          es: "Buen juego de carreras, aunque podría tener más opciones de personalización.",
          en: "Good racing game, although it could have more customization options.",
        },
      },
    ],
  },

  "Halo Infinite": {
    description: {
      es: "El legendario Master Chief regresa en esta épica aventura espacial.",
      en: "The legendary Master Chief returns in this epic space adventure.",
    },
    features: {
      es: ["Ciencia ficción", "Disparos", "Campaña épica", "Multijugador"],
      en: ["Sci-fi", "Shooting", "Epic campaign", "Multiplayer"],
    },
    techSpecs: {
      es: {
        "Versión Android": "8.0+",
        "RAM mínima": "6GB",
        Almacenamiento: "25GB",
        Procesador: "Snapdragon 865+",
        Gráficos: "Adreno 650+",
        Conexión: "Internet requerida",
      },
      en: {
        "Android Version": "8.0+",
        "Minimum RAM": "6GB",
        Storage: "25GB",
        Processor: "Snapdragon 865+",
        Graphics: "Adreno 650+",
        Connection: "Internet required",
      },
    },
    reviews: [
      {
        id: 1,
        user: "SpartanWarrior",
        rating: 5,
        date: "Hace 1 día",
        comment: {
          es: "El Master Chief está de vuelta y mejor que nunca. Campaña increíble.",
          en: "Master Chief is back and better than ever. Incredible campaign.",
        },
      },
      {
        id: 2,
        user: "HaloLegend",
        rating: 5,
        date: "Hace 3 días",
        comment: {
          es: "Regreso triunfal de la saga, el multijugador es adictivo.",
          en: "Triumphant return of the saga, the multiplayer is addictive.",
        },
      },
    ],
  },

  "Gears 5": {
    description: {
      es: "Intensa acción de tercera persona en el universo de Gears of War.",
      en: "Intense third-person action in the Gears of War universe.",
    },
    features: {
      es: ["Acción", "Tercera persona", "Cooperativo", "Historia"],
      en: ["Action", "Third-person", "Cooperative", "Story"],
    },
    techSpecs: {
      es: {
        "Versión Android": "7.0+",
        "RAM mínima": "4GB",
        Almacenamiento: "18GB",
        Procesador: "Snapdragon 845+",
        Gráficos: "Adreno 630+",
        Conexión: "Internet requerida",
      },
      en: {
        "Android Version": "7.0+",
        "Minimum RAM": "4GB",
        Storage: "18GB",
        Processor: "Snapdragon 845+",
        Graphics: "Adreno 630+",
        Connection: "Internet required",
      },
    },
    reviews: [
      {
        id: 1,
        user: "GearsVeteran",
        rating: 4,
        date: "Hace 2 días",
        comment: {
          es: "Sólida continuación de la saga, el modo cooperativo es fantástico.",
          en: "Solid continuation of the saga, the cooperative mode is fantastic.",
        },
      },
      {
        id: 2,
        user: "ActionGamer",
        rating: 4,
        date: "Hace 5 días",
        comment: {
          es: "Buena acción de tercera persona, aunque la historia es predecible.",
          en: "Good third-person action, although the story is predictable.",
        },
      },
    ],
  },
};

console.log(
  "Actualizaciones preparadas para:",
  Object.keys(remainingGamesUpdates)
);
