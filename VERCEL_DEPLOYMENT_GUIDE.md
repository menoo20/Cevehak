# Vercel Deployment Guide for Cevehak CV Website Service

## 📋 Prerequisites

1. GitHub account with your repository
2. Vercel account (free)
3. Cloud PostgreSQL database (see options below)

## 🚀 Deployment Steps

### Step 1: Set up Cloud Database

#### Option A: Vercel Postgres (Recommended)
1. Go to Vercel Dashboard
2. Create new project from your GitHub repo
3. Go to Storage tab
4. Create Postgres database
5. Copy connection details

#### Option B: Supabase (Free option)
1. Go to https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy connection string
5. Note: Use connection pooling URL for better performance

### Step 2: Deploy to Vercel

1. **Connect GitHub Repository**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository: `menoo20/Cevehak`

2. **Configure Environment Variables**
   In Vercel project settings, add these environment variables:

   ```
   # Database (from your cloud database)
   DB_HOST=your_db_host
   DB_PORT=5432
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   
   # Email (keep your current settings)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=menooteaching@gmail.com
   EMAIL_PASSWORD=dbhn pwpc jimi svri
   NOTIFICATION_EMAIL=menooteaching@gmail.com
   
   # Security
   NODE_ENV=production
   JWT_SECRET=CevehakSecureProductionKey2025!
   BCRYPT_ROUNDS=12
   PORT=3000
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Step 3: Set up Database Tables

After deployment, you need to create the database tables:

1. **Option A: Use Vercel CLI**
   ```bash
   npx vercel env pull .env.production
   node config/database.js
   ```

2. **Option B: Use database admin panel**
   - Access your cloud database admin panel
   - Run the SQL from your database.js file

### Step 4: Configure Custom Domain (Optional)

1. Go to Vercel project settings
2. Add your custom domain (e.g., cevehak.com)
3. Update DNS records as instructed

## 🔧 Post-Deployment Checklist

- [ ] Database connection working
- [ ] Email notifications working
- [ ] File uploads working
- [ ] Admin panel accessible
- [ ] Form submissions saving to database
- [ ] Mobile responsiveness working
- [ ] SSL certificate active

## 🌐 Expected URLs

- **Main site**: `https://your-project-name.vercel.app`
- **Admin panel**: `https://your-project-name.vercel.app/admin`
- **API health**: `https://your-project-name.vercel.app/health`

## 📝 Notes

- Vercel has a 25MB deployment size limit
- Serverless functions have execution time limits
- File uploads are stored temporarily (consider using cloud storage for production)
- Environment variables are encrypted and secure

## 🔒 Security Considerations

- All passwords are in environment variables (not in code)
- HTTPS is automatically enabled
- Vercel provides DDoS protection
- Rate limiting may need to be implemented for forms

## 🆘 Troubleshooting

- Check Vercel function logs for errors
- Verify environment variables are set correctly
- Test database connection separately
- Ensure all npm dependencies are in package.json
