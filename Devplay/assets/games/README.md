# Organización de Imágenes de Juegos

## Estructura de Carpetas

Cada juego tiene su propia carpeta dentro de `assets/games/`, siguiendo esta estructura:

```
assets/
├── games/
│   ├── sustainity/
│   │   ├── icon.jpg         (Ícono principal del juego)
│   │   ├── screenshot1.jpg  (Primera captura de pantalla)
│   │   └── screenshot2.jpg  (Segunda captura de pantalla)
│   ├── call-of-duty/
│   │   ├── icon.jpg
│   │   ├── screenshot1.jpg
│   │   └── screenshot2.jpg
│   ├── minecraft/
│   │   ├── icon.jpg
│   │   ├── screenshot1.jpg
│   │   └── screenshot2.jpg
│   └── [nombre-del-juego]/
│       ├── icon.jpg
│       ├── screenshot1.jpg
│       └── screenshot2.jpg
```

## Cómo Agregar Nuevas Imágenes

1. **Crear carpeta del juego**: Usa el nombre del juego en minúsculas y con guiones

   - Ejemplo: "Among Us" → `among-us`
   - Ejemplo: "PUBG Mobile" → `pubg-mobile`

2. **Agregar imágenes**:

   - `icon.jpg` - Ícono principal (recomendado: 512x512px)
   - `screenshot1.jpg` - Primera captura (recomendado: 1920x1080px)
   - `screenshot2.jpg` - Segunda captura (recomendado: 1920x1080px)

3. **Actualizar appsData.js**: Cambiar las rutas de las imágenes en el archivo de datos

## Formatos Soportados

- JPG/JPEG
- PNG
- WebP

## Tamaños Recomendados

- **Íconos**: 512x512px (cuadrado)
- **Screenshots**: 1920x1080px o 16:9 ratio
- **Peso máximo**: 2MB por imagen para mejor rendimiento

## Convenciones de Nombres

- Solo minúsculas
- Usar guiones (-) en lugar de espacios
- Sin caracteres especiales
- Nombres descriptivos y cortos
