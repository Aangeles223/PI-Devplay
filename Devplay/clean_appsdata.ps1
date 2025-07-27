# Script para limpiar todas las estructuras problemáticas de appsData.js
$filePath = "src\data\appsData.js"

Write-Host "Limpiando estructuras problemáticas en $filePath..."

# Leer el contenido del archivo
$content = Get-Content $filePath -Raw -Encoding UTF8

# 1. Limpiar description objects - mantener solo el español
$content = $content -replace 'description: \{\s*es: "([^"]*)",?\s*en: "[^"]*",?\s*\}', 'description: "$1"'

# 2. Limpiar features objects - mantener solo el español  
$content = $content -replace 'features: \{\s*es: (\[[^\]]*\]),?\s*en: \[[^\]]*\],?\s*\}', 'features: $1'

# 3. Eliminar completamente bloques techSpecs (muy complejos)
$content = $content -replace 'techSpecs: \{[\s\S]*?\},\s*', ''

# 4. Eliminar completamente bloques reviews (muy complejos)
$content = $content -replace 'reviews: \[[\s\S]*?\],\s*', ''

# 5. Limpiar comment objects dentro de reviews que puedan quedar
$content = $content -replace 'comment: \{\s*es: "([^"]*)",?\s*en: "[^"]*",?\s*\}', 'comment: "$1"'

# Guardar el archivo limpio
Set-Content $filePath $content -Encoding UTF8

Write-Host "Limpieza completada. Archivo guardado."
Write-Host "Revisa el archivo para verificar que no haya errores de sintaxis."
