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

### Required Environment Variables in Vercel:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add these variables:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `DB_URL` | `postgresql://neondb_owner:npg_gdYnelxC0p1F@ep-holy-hat-a1c9b1dv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` | Production, Preview, Development |
| `JWT_SECRET` | `your_secure_jwt_secret_64_hex_chars` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `CORS_ORIGIN` | `https://your-frontend-domain.vercel.app` | Production, Preview |

### ⚠️ Security Notes:
- Never commit actual secrets to Git
- Use different JWT secrets for different environments
- Consider using Vercel's secret management for sensitive data

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
