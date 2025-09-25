# 🛡️ GDPR-Compliant AI Selfie Generator

A privacy-first AI selfie generation service built with **GDPR compliance from day one**. Features automatic 24-hour data deletion, EU-only data processing, and complete transparency.

## 🔒 Privacy & Compliance Features

### GDPR Compliance
- ✅ **No user accounts** - Session-based processing only
- ✅ **24-hour automatic data deletion** - All data expires automatically
- ✅ **EU data residency** - Processing occurs only on EU servers
- ✅ **Explicit consent management** - Clear consent flows for all data processing
- ✅ **Full data rights support** - Export, delete, and view data processing activities
- ✅ **Transparent processing logs** - Complete audit trail of data activities

### Data Protection Features
- 🔐 **End-to-end encryption** for all file transfers
- 🇪🇺 **EU-only infrastructure** (Vercel Frankfurt/Amsterdam regions)
- 🗑️ **Automated cleanup jobs** every 2 hours
- 📊 **Processing activity logs** for GDPR Article 30 compliance
- 🚫 **No tracking or analytics** without explicit consent
- ⏰ **Session-based architecture** with automatic expiry

## 🚀 Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Backend**: Next.js API routes with TypeScript
- **Database**: PostgreSQL with Prisma ORM (GDPR-compliant schema)
- **AI Processing**: FAL.ai for image generation
- **Payment**: Stripe (session-based, no user accounts)
- **Hosting**: Vercel (EU regions only)
- **Styling**: Tailwind CSS with accessibility focus

## 📋 Environment Setup

### Required Environment Variables

```env
# Database (EU-compliant)
DATABASE_URL="postgresql://username:password@eu-server:5432/gdpr_ai_selfie"

# Stripe (to be provided)
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# FAL AI
FAL_KEY="your-fal-api-key"

# GDPR Settings
GDPR_DATA_RETENTION_HOURS=24
GDPR_COOKIE_CONSENT_REQUIRED=true
GDPR_EU_DATA_RESIDENCY=true

# Security
NEXTAUTH_SECRET="your-secure-secret-key"
NEXTAUTH_URL="https://your-domain.com"
CRON_SECRET="your-cron-secret-for-cleanup-jobs"
```

## 🔧 Installation & Deployment

### Local Development

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Set up database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Create storage directories:**
   ```bash
   mkdir -p storage/{uploads,generated,temp}
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Production Deployment (Vercel)

1. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Set environment variables** in Vercel dashboard

3. **Configure database** with EU-based PostgreSQL provider

4. **Verify EU regions** are configured in `vercel.json`

## 🏗️ Architecture Overview

### GDPR-Compliant Data Flow

```
1. User visits → GDPR consent banner
2. Consent granted → Session created (24h expiry)
3. File upload → Temporary storage (EU servers)
4. Payment → Stripe session (no user account)
5. AI processing → FAL.ai (privacy mode)
6. Download → Secure link (24h expiry)
7. Automatic cleanup → All data deleted after 24h
```

### Database Schema

```sql
-- Session-based data only (no users table)
generation_sessions
├── session_id (UUID, primary key)
├── data_consent (boolean)
├── cookie_consent (boolean)
├── upload_path (temporary file location)
├── generated_image_path (temporary file location)
├── expires_at (24h from creation)
└── created_at (timestamp)

-- GDPR transparency logs
data_processing_logs
├── session_id (foreign key)
├── action (upload/payment/generation/download/delete)
├── purpose (image_generation/payment/delivery)
├── legal_basis (consent/contract/legitimate_interest)
└── timestamp

-- GDPR deletion requests
data_deletion_requests
├── session_id (foreign key)
├── requested_at (timestamp)
├── processed_at (timestamp)
└── status (pending/completed)
```

## 🎯 User Journey

### Privacy-First Experience

1. **Landing Page**
   - GDPR consent banner on first visit
   - Clear privacy information
   - No hidden tracking

2. **Upload Process**
   - Privacy notice before upload
   - Clear data retention information
   - Consent confirmation

3. **Payment**
   - Session-based Stripe checkout
   - No account creation required
   - Privacy-compliant payment processing

4. **Generation**
   - EU-based AI processing
   - Real-time status updates
   - Processing activity transparency

5. **Download**
   - Secure, temporary download links
   - Data deletion countdown
   - Option to delete immediately

## 🔍 GDPR Rights Implementation

### Article 6 - Lawful Basis
- **Consent** for data processing
- **Contract** for payment processing
- **Legitimate Interest** for security/fraud prevention

### Article 7 - Consent
- Clear consent requests
- Easy consent withdrawal
- Consent documentation

### Article 13-14 - Information Rights
- Transparent privacy notices
- Clear data processing information
- Contact details for data protection

### Article 15 - Access Rights
- Data export functionality
- Processing activity logs
- Current consent status

### Article 17 - Erasure Rights
- Immediate deletion requests
- Automatic 24h deletion
- Confirmation of deletion

### Article 20 - Portability Rights
- JSON data export
- Standardized format
- All personal data included

### Article 30 - Records of Processing
- Complete processing logs
- Legal basis documentation
- Purpose and retention periods

## 📊 Monitoring & Compliance

### Automated GDPR Compliance

- **Cleanup jobs** run every 2 hours
- **Orphaned file detection** and removal
- **Session expiry monitoring**
- **Processing activity logging**

### Manual Compliance Tools

```bash
# Check expired sessions
npm run check-expired

# Manual cleanup (development)
npm run cleanup-expired

# Generate compliance report
npm run gdpr-report
```

## 🚨 Security Features

### Data Protection
- All file uploads encrypted in transit
- Temporary storage with automatic deletion
- No long-term data persistence
- EU-only data processing

### Infrastructure Security
- Vercel security headers
- HTTPS enforcement
- CSRF protection
- Rate limiting

### Privacy by Design
- Minimal data collection
- Purpose limitation
- Data minimization
- Automatic deletion

## 📞 Support & Contact

### Data Protection
- **DPO Email**: privacy@aiselfiegenerator.com
- **Support**: support@aiselfiegenerator.com

### GDPR Requests
All GDPR requests are processed within 72 hours:
- Data access requests
- Deletion requests
- Portability requests
- Complaint handling

## 📄 Legal Documentation

- Privacy Policy: `/privacy-policy`
- Terms of Service: `/terms`
- Cookie Policy: `/cookie-policy`
- GDPR Rights: `/privacy-rights`

---

**Built with privacy by design. GDPR compliant from day one.**

*This application demonstrates how to build a commercial service that respects user privacy while delivering excellent user experience.*