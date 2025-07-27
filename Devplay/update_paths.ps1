# Script para actualizar rutas de imágenes en appsData.js

$gameUpdates = @{
    "Dead Cells" = "dead-cells"
    "Red Dead Redemption 2" = "red-dead-redemption-2"
    "God Of War" = "god-of-war"
    "Forza Horizon 5" = "forza-horizon-5"
    "Need for Speed" = "need-for-speed"
    "Halo Infinite" = "halo-infinite"
    "Gears 5" = "gears-5"
}

$filePath = "c:\Users\Aaron234\Documents\PI-Devplay\Devplay\src\data\appsData.js"
$content = Get-Content $filePath -Raw

foreach ($gameName in $gameUpdates.Keys) {
    $folderName = $gameUpdates[$gameName]
    Write-Host "Actualizando $gameName -> $folderName"
    
    # Actualizar icono
    $content = $content -replace "icon: require\(`"../../assets/imagen[12]\.jpg`"\),", "icon: require(`"../../assets/games/$folderName/icon.jpg`"),"
    
    # Actualizar screenshots
    $content = $content -replace "require\(`"../../assets/imagen[12]\.jpg`"\),", "require(`"../../assets/games/$folderName/screenshot1.jpg`"),"
    $content = $content -replace "require\(`"../../assets/imagen[12]\.jpg`"\),", "require(`"../../assets/games/$folderName/screenshot2.jpg`"),"
}

Set-Content $filePath $content
Write-Host "Actualización completada"
