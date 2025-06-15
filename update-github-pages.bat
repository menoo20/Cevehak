@echo off
REM Update GitHub Pages with latest changes
echo 🔄 Updating GitHub Pages with your latest changes...

REM Ensure gh-pages directory exists
if not exist "gh-pages" mkdir gh-pages
if not exist "gh-pages\css" mkdir gh-pages\css
if not exist "gh-pages\js" mkdir gh-pages\js
if not exist "gh-pages\images" mkdir gh-pages\images
if not exist "gh-pages\images\optimized" mkdir gh-pages\images\optimized

REM Copy and update HTML files
echo 📄 Updating HTML files...
copy "views\index.html" "gh-pages\index.html" /Y
copy "views\*.html" "gh-pages\" /Y

REM Copy Jekyll configuration
echo ⚙️ Updating Jekyll config...
copy "_config.yml" "gh-pages\_config.yml" /Y

REM Copy CSS files
echo 🎨 Updating CSS files...
copy "public\css\landing.css" "gh-pages\css\landing.css" /Y
copy "public\css\style.css" "gh-pages\css\style.css" /Y

REM Copy JavaScript files
echo 📜 Updating JavaScript files...
copy "public\js\landing.js" "gh-pages\js\landing.js" /Y
copy "public\js\script.js" "gh-pages\js\script.js" /Y

REM Copy images (including optimized versions)
echo 🖼️ Updating images...
xcopy "public\images" "gh-pages\images" /E /I /Y /Q

REM Copy icons folder
echo 🎯 Updating icons...
if not exist "gh-pages\icons" mkdir gh-pages\icons
xcopy "public\icons" "gh-pages\icons" /E /I /Y /Q

copy "public\favicon.ico" "gh-pages\" /Y

echo 🔧 Fixing file paths for GitHub Pages...

REM Fix file paths using PowerShell
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

REM Fix icon paths in HTML files
for %%f in (gh-pages\*.html) do (
    powershell -Command "(Get-Content '%%f') -replace '\.\./public/icons/', 'icons/' | Set-Content '%%f'"
)

echo ✅ GitHub Pages updated with your latest changes!
echo 📋 Next steps:
echo    1. cd gh-pages
echo    2. git add .
echo    3. git commit -m "Update with latest changes"
echo    4. git push
echo.
echo 🌐 Your site: https://menoo20.github.io/cevehak-front-end-test
