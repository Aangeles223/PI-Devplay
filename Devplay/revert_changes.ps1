# Script para revertir cambios problemáticos en appsData.js
# Este script elimina las estructuras complejas de traducciones que causan errores

$filePath = "c:\Users\Aaron234\Documents\PI-Devplay\Devplay\src\data\appsData.js"
$content = Get-Content $filePath -Raw

# Revertir todas las estructuras de description complejas
$content = $content -replace 'description: \{[^}]*es: "([^"]*)"[^}]*\}', 'description: "$1"'

# Revertir todas las estructuras de features complejas
$content = $content -replace 'features: \{[^}]*es: \[([^\]]*)\][^}]*\}', 'features: [$1]'

# Eliminar bloques techSpecs completos (muy complejos para regex)
$content = $content -replace 'techSpecs: \{[^}]*\{[^}]*\}[^}]*\{[^}]*\}[^}]*\},', ''

# Eliminar bloques reviews completos (muy complejos para regex)
$content = $content -replace 'reviews: \[[^\]]*\{[^}]*comment: \{[^}]*\}[^}]*\}[^\]]*\],', ''

Set-Content $filePath $content -Encoding UTF8

Write-Host "Cambios revertidos correctamente"
