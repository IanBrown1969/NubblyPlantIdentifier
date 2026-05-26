Add-Type -AssemblyName System.Drawing
$files = @("icon.png", "android-icon-foreground.png", "logo-glow.png", "splash-icon.png", "favicon.png")
foreach ($file in $files) {
    $path = "c:\Users\ianbr\NubblyPlantIdentifier\assets\images\$file"
    if (Test-Path $path) {
        $bmp = New-Object System.Drawing.Bitmap($path)
        $tempPath = "$path.temp.png"
        $bmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        Move-Item -Path $tempPath -Destination $path -Force
        Write-Host "Converted $file to native PNG successfully!"
    }
}
