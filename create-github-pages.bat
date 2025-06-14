@echo off
REM Phase 2: GitHub Pages Deployment Preparation (Windows)
echo 📦 Preparing GitHub Pages compatible version...

REM Create gh-pages directory structure
if not exist "gh-pages" mkdir gh-pages
if not exist "gh-pages\css" mkdir gh-pages\css
if not exist "gh-pages\js" mkdir gh-pages\js
if not exist "gh-pages\images" mkdir gh-pages\images
if not exist "gh-pages\images\optimized" mkdir gh-pages\images\optimized

REM Copy and fix HTML files (move from views to root)
echo 📄 Processing HTML files...
copy "views\index.html" "gh-pages\index.html"
copy "views\*.html" "gh-pages\"

REM Copy CSS files (use minified versions for production)
echo 🎨 Processing CSS files...
if exist "public\css\landing.min.css" (
    copy "public\css\landing.min.css" "gh-pages\css\landing.css"
) else (
    copy "public\css\landing.css" "gh-pages\css\landing.css"
)

if exist "public\css\style.min.css" (
    copy "public\css\style.min.css" "gh-pages\css\style.css"
) else (
    copy "public\css\style.css" "gh-pages\css\style.css"
)

copy "public\css\mobile-enhancements.css" "gh-pages\css\"

REM Copy JavaScript files
echo 📜 Processing JavaScript files...
copy "public\js\landing.js" "gh-pages\js\"
copy "public\js\script.js" "gh-pages\js\"

REM Copy images (including optimized versions)
echo 🖼️ Processing images...
xcopy "public\images" "gh-pages\images" /E /I /Y
copy "public\favicon.ico" "gh-pages\"

echo 🔧 Fixing file paths for GitHub Pages...

REM Use PowerShell for find/replace operations
powershell -Command "(Get-Content 'gh-pages\index.html') -replace '\.\./public/css/', 'css/' | Set-Content 'gh-pages\index.html'"
powershell -Command "(Get-Content 'gh-pages\index.html') -replace '\.\./public/js/', 'js/' | Set-Content 'gh-pages\index.html'"
powershell -Command "(Get-Content 'gh-pages\index.html') -replace '\.\./public/images/', 'images/' | Set-Content 'gh-pages\index.html'"

REM Fix paths in all HTML files
for %%f in (gh-pages\*.html) do (
    powershell -Command "(Get-Content '%%f') -replace '\.\./public/css/', 'css/' | Set-Content '%%f'"
    powershell -Command "(Get-Content '%%f') -replace '\.\./public/js/', 'js/' | Set-Content '%%f'"
    powershell -Command "(Get-Content '%%f') -replace '\.\./public/images/', 'images/' | Set-Content '%%f'"
)

REM Fix image paths in CSS files
for %%f in (gh-pages\css\*.css) do (
    powershell -Command "(Get-Content '%%f') -replace '\.\./images/', 'images/' | Set-Content '%%f'"
)

REM Fix image paths in JavaScript files
for %%f in (gh-pages\js\*.js) do (
    powershell -Command "(Get-Content '%%f') -replace '/images/', 'images/' | Set-Content '%%f'"
    powershell -Command "(Get-Content '%%f') -replace 'http://localhost:5500/public/images/', 'images/' | Set-Content '%%f'"
)

echo ✅ GitHub Pages version created in gh-pages\ directory
echo 📋 Next steps:
echo    1. Copy gh-pages\ contents to your GitHub repository
echo    2. Enable GitHub Pages in repository settings
echo    3. Set source to main branch / (root)
echo.
echo 🌐 Your site will be available at: https://yourusername.github.io/repository-name
pause
