# Vercel Deployment Guide

## 🚀 Deploying Vehicle Maintenance API to Vercel

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional but recommended):
   ```bash
   npm i -g vercel
   ```

### 📋 Pre-Deployment Checklist

✅ **Environment Variables Setup**
✅ **Database Configuration** 
✅ **Vercel Configuration Files**
✅ **Code Optimization for Serverless**

## 🔧 Configuration Files

### 1. vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/src/api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. src/api/index.js (Vercel Entry Point)
```javascript
const app = require('../index.js');
module.exports = app;
```

## 🌍 Environment Variables Setup

### ⚠️ CRITICAL: Configure Environment Variables in Vercel

**This is the most common cause of deployment failures. Follow these steps carefully:**

### Required Environment Variables:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add these variables** (set for Production, Preview, and Development):

#### Database Configuration:
```bash
# Variable Name: DB_URL
# Value: Your complete Neon connection string (NO QUOTES in Vercel UI)
# Example format:
postgresql://neondb_owner:your_password@ep-example-123.region.aws.neon.tech:5432/neondb?sslmode=require
```

#### JWT Secret:
```bash
# Variable Name: JWT_SECRET
# Value: 64-character secure hex string (generate below)
# Generate with: openssl rand -hex 64
```

#### Environment:
```bash
# Variable Name: NODE_ENV
# Value: production
```

### 🔍 How to Get Your Neon DB_URL:

1. **Log into Neon Console**: https://console.neon.tech/
2. **Go to your project** → Dashboard
3. **Copy connection string** from "Connection Details"
4. **Ensure it includes**: `?sslmode=require` at the end

### 🔐 Generate Secure JWT Secret:

```bash
# Option 1: Using OpenSSL
openssl rand -hex 64

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 3: Online (use with caution)
# Visit: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

### 📝 Setting Variables in Vercel UI:

1. **In Vercel Dashboard**:
   - Project Settings → Environment Variables → Add New

2. **For each variable**:
   ```
   Name: DB_URL
   Value: postgresql://your_connection_string_here (NO QUOTES)
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

3. **Important**:
   - Don't add quotes around values in Vercel UI
   - Select all environments (Production, Preview, Development)
   - Click "Save" after adding each variable

### ✅ Verify Configuration:

After setting variables, check your deployment:

```bash
# Visit your health check endpoint:
https://your-app.vercel.app/health

# Should return:
{
  "status": "success",
  "configuration": {
    "db_url_configured": true,
    "jwt_secret_configured": true
  }
```

### 🚨 Common Issues:

| Issue | Cause | Solution |
|-------|--------|----------|
| `DB_URL not configured` | Missing DB_URL variable | Add DB_URL in Vercel dashboard |
| `ENOTFOUND` | Wrong hostname | Check Neon connection string |
| `28P01` Authentication failed | Wrong credentials | Verify username/password in DB_URL |
| Variables not available | Not set for all environments | Ensure variables are set for Production, Preview, Development |

### 🔄 After Adding Variables:

**Important**: Redeploy your application after adding environment variables:

```bash
# Trigger a new deployment
git commit --allow-empty -m "trigger redeploy with env vars"
git push origin main
```

## 🚀 Deployment Methods

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub** (your code is already there):
   ```bash
   git add .
   git commit -m "feat: add Vercel deployment configuration"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository: `rizalkr/backend-motor-dashboard-monitor`
   - Vercel will auto-detect the configuration

3. **Configure Environment Variables** in Vercel dashboard

4. **Deploy**: Vercel will automatically deploy on every push to main

### Method 2: Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Deploy to production
vercel --prod
```

## 🔍 Testing Deployment

Once deployed, test these endpoints:

```bash
# Replace YOUR_VERCEL_URL with your actual Vercel URL
export API_URL="https://your-project.vercel.app"

# Health check
curl $API_URL/health

# API documentation
curl $API_URL/

# Register user
curl -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'

# Login
curl -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

## ⚡ Vercel-Specific Optimizations

### 1. Serverless Function Considerations

- **Cold starts**: First request might be slower
- **Execution time limit**: 10 seconds for Hobby plan, 60s for Pro
- **Memory limit**: 1024 MB for Hobby plan
- **No persistent connections**: Database connections are created per request

### 2. Database Connection Optimization

The current configuration is already optimized for Vercel:
- Connection pooling with proper timeouts
- SSL configuration for Neon
- Error handling for connection issues

### 3. Environment Detection

The code automatically detects Vercel environment:
```javascript
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  // Only start server locally, not in Vercel
}
```

## 📊 Monitoring & Debugging

### Vercel Dashboard Features:
- **Real-time logs**: View function execution logs
- **Analytics**: Request metrics and performance
- **Error tracking**: Automatic error detection

### Debugging Tips:
```bash
# View deployment logs
vercel logs

# View function logs (last deployment)
vercel logs --follow
```

## 🔧 Troubleshooting Common Issues

### 1. "Module not found" Error
- Check file paths in `src/api/index.js`
- Ensure all dependencies are in `package.json`

### 2. Database Connection Timeout
- Verify `DB_URL` environment variable
- Check Neon database status
- Increase connection timeout in `db.js`

### 3. CORS Issues
- Set `CORS_ORIGIN` environment variable
- Update CORS configuration for your frontend domain

### 4. Function Timeout
- Optimize database queries
- Consider upgrading Vercel plan for longer timeouts
- Add request/response caching

## 📈 Production Recommendations

1. **Upgrade to Vercel Pro** for:
   - Longer function execution time (60s)
   - Better performance
   - More concurrent executions

2. **Add monitoring**:
   - Set up error tracking (Sentry)
   - Monitor database performance
   - Set up uptime monitoring

3. **Implement caching**:
   - Cache frequent database queries
   - Use Redis for session storage if needed

4. **Security enhancements**:
   - Add rate limiting
   - Implement request logging
   - Set up security headers

## 🎯 Next Steps After Deployment

1. **Update GitHub README** with Vercel URL
2. **Set up custom domain** (optional)
3. **Configure frontend** to use Vercel API URL
4. **Set up staging environment** for testing
5. **Monitor performance** and optimize as needed

Your API will be available at: `https://your-project-name.vercel.app`
