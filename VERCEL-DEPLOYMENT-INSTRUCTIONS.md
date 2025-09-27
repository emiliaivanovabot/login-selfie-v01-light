# CRITICAL: Vercel Production Deployment Instructions

## IMMEDIATE FIXES FOR BROKEN PAYMENT FLOW

The "Generate AI Selfie" button is not working in production because:
1. SQLite database doesn't work in Vercel serverless
2. Missing environment variables
3. Need PostgreSQL database setup

## Step 1: Set Up Vercel Postgres Database (REQUIRED)

1. **Go to your Vercel project dashboard**
2. **Click "Storage" tab**
3. **Click "Create Database" → "Postgres"**
4. **Copy the connection details to environment variables**

## Step 2: Configure Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

### Database (CRITICAL - REQUIRED FOR API TO WORK)
```
DATABASE_URL = postgresql://default:xxxxx@xxxxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require
DIRECT_URL = postgresql://default:xxxxx@xxxxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require
```

### Stripe (REQUIRED FOR PAYMENT)
```
STRIPE_PUBLISHABLE_KEY = pk_live_YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY = sk_live_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET = whsec_YOUR_WEBHOOK_SECRET
```

### FAL AI (REQUIRED FOR IMAGE GENERATION)
```
FAL_KEY = YOUR_FAL_API_KEY
```

### Other Required Variables
```
NEXTAUTH_SECRET = your-production-secret-key-min-32-chars
NEXTAUTH_URL = https://your-vercel-app.vercel.app
NODE_ENV = production
GDPR_DATA_RETENTION_HOURS = 24
GDPR_COOKIE_CONSENT_REQUIRED = true
GDPR_EU_DATA_RESIDENCY = true
UPLOAD_DIR = /tmp
GENERATED_DIR = /tmp
TEMP_DIR = /tmp
MAX_FILE_SIZE = 10485760
MAX_UPLOADS_PER_IP_PER_HOUR = 5
CLEANUP_JOB_INTERVAL_MINUTES = 30
```

## Step 3: Deploy Database Schema

After setting up environment variables:

1. **Go to Vercel project dashboard**
2. **Deployments tab → Redeploy latest deployment**
3. **The build process will automatically run `prisma generate` and create tables**

## Step 4: Test the Payment Flow

1. **Visit your Vercel app URL**
2. **Upload an image**
3. **Click "Generate AI Selfie"**
4. **Should redirect to Stripe checkout for €5**

## Common Issues & Solutions

### Issue: "Database connection failed"
- **Solution**: Verify DATABASE_URL and DIRECT_URL are correct in Vercel environment variables

### Issue: "Stripe session creation failed"
- **Solution**: Verify STRIPE_SECRET_KEY is correct and starts with `sk_live_`

### Issue: Build fails with Prisma errors
- **Solution**: Ensure `postinstall` script runs `prisma generate`

### Issue: Payment button does nothing
- **Solution**: Check browser console for JavaScript errors, verify API endpoints return 200

## Deployment Commands (for reference)

```bash
# If deploying manually
npm run build  # This runs prisma generate + next build
npm run db:push  # Push schema to production database
```

## Security Notes

- All environment variables are properly secured in Vercel
- File uploads use `/tmp` directory (serverless compatible)
- GDPR compliance maintained with 24-hour data retention
- All payments processed securely through Stripe

## After Deployment

1. **Test complete user flow**: Upload → Payment → Generation
2. **Verify webhook handling** (if using Stripe webhooks)
3. **Check logs** in Vercel Functions tab for any errors
4. **Monitor performance** and error rates

---

**This fixes the production payment flow issue blocking revenue generation!**