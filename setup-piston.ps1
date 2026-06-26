$ProgressPreference = 'SilentlyContinue'

$urls = @(
    "https://github.com/engineer-man/piston/releases/download/pkgs/java-15.0.2.pkg.tar.gz",
    "https://github.com/engineer-man/piston/releases/download/pkgs/gcc-10.2.0.pkg.tar.gz",
    "https://github.com/engineer-man/piston/releases/download/pkgs/node-18.15.0.pkg.tar.gz"
)

foreach ($url in $urls) {
    $filename = $url.Substring($url.LastIndexOf("/") + 1)
    Write-Host "Downloading $filename..."
    Invoke-WebRequest -Uri $url -OutFile $filename
    Write-Host "Copying $filename to container..."
    docker cp $filename "placementai-piston:/piston/packages/$filename"
    Write-Host "Extracting $filename..."
    docker exec placementai-piston bash -c "cd /piston/packages && tar -xzf $filename && rm $filename"
    Remove-Item $filename
}
Write-Host "Done."
