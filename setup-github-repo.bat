@echo off
REM Quick GitHub Pages Repository Setup
echo 🚀 GitHub Pages Repository Setup Helper
echo.

REM Get repository name
set /p REPO_NAME="Enter your repository name (e.g., cevehak-website): "
if "%REPO_NAME%"=="" (
    echo ❌ Repository name is required!
    pause
    exit /b 1
)

REM Get GitHub username
set /p GITHUB_USER="Enter your GitHub username: "
if "%GITHUB_USER%"=="" (
    echo ❌ GitHub username is required!
    pause
    exit /b 1
)

echo.
echo 📦 Setting up repository for: https://github.com/%GITHUB_USER%/%REPO_NAME%
echo 🌐 Your site will be: https://%GITHUB_USER%.github.io/%REPO_NAME%
echo.

REM Navigate to gh-pages directory
cd gh-pages

REM Initialize git repository
echo 🔧 Initializing Git repository...
git init

REM Add all files
echo 📁 Adding files...
git add .

REM Initial commit
echo 💾 Creating initial commit...
git commit -m "Initial GitHub Pages deployment with optimizations

✨ Features included:
- Image optimization (WebP with PNG fallback)
- Mobile touch gestures
- CSS minification
- Responsive design
- Performance enhancements"

REM Add remote origin
echo 🔗 Adding remote repository...
git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Repository setup complete!
echo.
echo 📋 Next steps:
echo    1. Go to: https://github.com/%GITHUB_USER%/%REPO_NAME%/settings/pages
echo    2. Enable GitHub Pages
echo    3. Set source to: main branch / (root)
echo    4. Your site will be live at: https://%GITHUB_USER%.github.io/%REPO_NAME%
echo.
echo 📱 For mobile testing and auto-sync:
echo    1. Return to main project folder
echo    2. Run: node watch-and-sync.js
echo    3. Make changes to CSS/HTML - they'll auto-sync to GitHub!
echo.

cd ..
pause
