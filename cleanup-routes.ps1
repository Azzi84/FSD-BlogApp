$appDir = "c:\Users\ryana\Desktop\Uni\Y5 Semester 1\FSD\assignment-2-blog-group-2-ryan-azzi\assignment-2-blog-group-2-ryan-azzi\apps\admin\src\app"

# Remove conflicting files
if (Test-Path "$appDir\post\[id]\page.tsx") {
    Remove-Item -Path "$appDir\post\[id]\page.tsx" -Force
    Write-Output "Removed post\[id]\page.tsx"
}

if (Test-Path "$appDir\posts\[id]\page.tsx") {
    Remove-Item -Path "$appDir\posts\[id]\page.tsx" -Force
    Write-Output "Removed posts\[id]\page.tsx"
}

if (Test-Path "$appDir\posts\[id]\edit\page.tsx") {
    Remove-Item -Path "$appDir\posts\[id]\edit\page.tsx" -Force
    Write-Output "Removed posts\[id]\edit\page.tsx"
}

Write-Output "Cleanup complete!"
