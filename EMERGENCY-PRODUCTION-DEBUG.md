# 🚨 EMERGENCY PRODUCTION DEBUGGING GUIDE

## CRITICAL ISSUE: Upload/Payment Flow Broken

**Business Impact**: Users can upload images but cannot proceed to payment = 100% revenue loss

## IMMEDIATE DIAGNOSTIC STEPS

### 1. Environment Variables Check (MOST LIKELY ISSUE)

**Access Vercel Dashboard:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `login-selfie-v01-light`
3. Go to Settings > Environment Variables
4. Verify these critical variables exist:

```
STRIPE_SECRET_KEY=sk_live_51S7dnX01LV3uszZy...
STRIPE_PUBLISHABLE_KEY=pk_live_51S7dnX01LV3uszZy...
STRIPE_WEBHOOK_SECRET=(optional but recommended)
DATABASE_URL=(if using database)
FAL_KEY=(for AI generation)
```

**⚠️ CRITICAL**: If `STRIPE_SECRET_KEY` is missing, this is your problem!

### 2. Production API Diagnostics

**Test Environment Variables:**
```
GET https://your-vercel-app.vercel.app/api/debug-production
```

**Test Stripe Connection:**
```
GET https://your-vercel-app.vercel.app/api/test-stripe-connection
```

**Test Payment Session Creation:**
```
POST https://your-vercel-app.vercel.app/api/test-stripe-connection
Content-Type: application/json

{
  "sessionId": "test-debug-session"
}
```

### 3. Check Vercel Deployment Logs

1. Go to Vercel Dashboard > Your Project > Functions
2. Click on any API function
3. Check logs for errors like:
   - "STRIPE_SECRET_KEY is not set"
   - "Invalid API Key"
   - "Connection timeout"

## MOST LIKELY FIXES

### Fix 1: Missing Environment Variables (90% likely)

**In Vercel Dashboard:**
1. Settings > Environment Variables
2. Add missing variables (especially `STRIPE_SECRET_KEY`)
3. Set for "Production" environment
4. Redeploy the project

### Fix 2: Invalid Stripe Keys

**Verify your Stripe keys:**
1. Login to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to Developers > API keys
3. Copy the LIVE secret key (starts with `sk_live_`)
4. Update in Vercel environment variables

### Fix 3: URL Configuration Issues

**Check success/cancel URLs:**
- Success URL should be: `https://your-domain.vercel.app/payment/success`
- Cancel URL should be: `https://your-domain.vercel.app/payment/cancel`

## EMERGENCY DEPLOYMENT

**If you need to redeploy after fixing environment variables:**

```bash
# Force redeploy with environment changes
git commit --allow-empty -m "Force redeploy for environment variable fixes"
git push origin main
```

## TESTING THE FIX

1. **Test Upload Flow:**
   - Go to your production site
   - Drag/drop an image
   - Click "Generate AI Selfie - €5.00"
   - Should redirect to Stripe payment page

2. **Check Console Errors:**
   - Open browser developer tools
   - Check for JavaScript errors during upload process

## API ERROR CODES TO LOOK FOR

- `STRIPE_SECRET_KEY is not set` → Missing environment variable
- `Invalid API Key` → Wrong Stripe key or test/live mismatch
- `Failed to create payment session` → Network/timeout issue
- `No file uploaded` → Upload API issue (less likely)

## CONTACT FOR HELP

If these steps don't resolve the issue, the diagnostic endpoints will provide detailed error information. Check the API responses from the diagnostic endpoints above.

## CLEANUP AFTER DEBUGGING

**Remove diagnostic endpoints before final production:**
```bash
rm -rf app/api/debug-production app/api/test-stripe-connection
git add -A && git commit -m "Remove debugging endpoints" && git push
```

---

**This guide addresses the immediate production emergency. Most payment failures are due to missing Stripe environment variables in Vercel.**