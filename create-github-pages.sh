#!/bin/bash
# Phase 2: GitHub Pages Deployment Preparation
echo "📦 Preparing GitHub Pages compatible version..."

# Create gh-pages directory structure
mkdir -p gh-pages
mkdir -p gh-pages/css
mkdir -p gh-pages/js
mkdir -p gh-pages/images
mkdir -p gh-pages/images/optimized

# Copy and fix HTML files (move from views to root)
echo "📄 Processing HTML files..."
cp views/index.html gh-pages/index.html
cp views/*.html gh-pages/

# Copy CSS files (use minified versions for production)
echo "🎨 Processing CSS files..."
cp public/css/landing.min.css gh-pages/css/landing.css
cp public/css/style.min.css gh-pages/css/style.css
cp public/css/mobile-enhancements.css gh-pages/css/

# Copy JavaScript files
echo "📜 Processing JavaScript files..."
cp public/js/landing.js gh-pages/js/
cp public/js/script.js gh-pages/js/

# Copy images (including optimized versions)
echo "🖼️ Processing images..."
cp -r public/images/* gh-pages/images/
cp public/favicon.ico gh-pages/

echo "🔧 Fixing file paths for GitHub Pages..."

# Fix CSS paths in HTML files
sed -i 's|../public/css/|css/|g' gh-pages/*.html
sed -i 's|../public/js/|js/|g' gh-pages/*.html
sed -i 's|../public/images/|images/|g' gh-pages/*.html

# Fix image paths in CSS files
sed -i 's|../images/|images/|g' gh-pages/css/*.css

# Fix image paths in JavaScript files
sed -i 's|/images/|images/|g' gh-pages/js/*.js

echo "✅ GitHub Pages version created in gh-pages/ directory"
echo "📋 Next steps:"
echo "   1. Copy gh-pages/ contents to your GitHub repository"
echo "   2. Enable GitHub Pages in repository settings"
echo "   3. Set source to main branch / (root)"
echo ""
echo "🌐 Your site will be available at: https://yourusername.github.io/repository-name"
