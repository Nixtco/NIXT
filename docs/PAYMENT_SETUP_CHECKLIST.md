# ✅ SpaceRemit Payment Setup Checklist

## Before You Start

Make sure you have:
- [ ] SpaceRemit account created at [spaceremit.com](https://spaceremit.com)
- [ ] Access to your SpaceRemit Dashboard
- [ ] Backend and Frontend projects running locally
- [ ] PostgreSQL database configured

---

## Step-by-Step Setup

### 1️⃣ Get Your API Keys from SpaceRemit

1. Login to [SpaceRemit Dashboard](https://spaceremit.com/dashboard)
2. Navigate to **"Websites And Keys"**
3. Add your website
4. Copy these keys:
   - **Production Public Key** (starts with `pk_live_`)
   - **Production Secret Key** (starts with `sk_live_`)
   - **Test Public Key** (starts with `pk_test_`)
   - **Test Secret Key** (starts with `sk_test_`)

---

### 2️⃣ Configure Frontend Environment

File: `c:\Users\moham\OneDrive\Desktop\NIXT\.env.local`

```env
# SpaceRemit Payment Gateway
NEXT_PUBLIC_SPACEREMIT_PUBLIC_KEY=pk_live_your_public_key_here
NEXT_PUBLIC_SPACEREMIT_TEST_PUBLIC_KEY=pk_test_your_test_public_key_here
```

**Replace:**
- `pk_live_your_public_key_here` → Your actual production public key
- `pk_test_your_test_public_key_here` → Your actual test public key

---

### 3️⃣ Configure Backend Environment

File: `c:\Users\moham\OneDrive\Desktop\NixtBackend\.env`

```env
# SpaceRemit Payment Gateway
SPACEREMIT_SECRET_KEY=sk_live_your_secret_key_here
SPACEREMIT_PUBLIC_KEY=pk_live_your_public_key_here
SPACEREMIT_TEST_SECRET_KEY=sk_test_your_test_secret_key_here
SPACEREMIT_TEST_PUBLIC_KEY=pk_test_your_test_public_key_here
SPACEREMIT_ENVIRONMENT=development
```

**Replace:**
- `sk_live_*` → Your production secret key
- `pk_live_*` → Your production public key
- `sk_test_*` → Your test secret key
- `pk_test_*` → Your test public key

**Important:**
- Set `SPACEREMIT_ENVIRONMENT=development` for testing
- Set `SPACEREMIT_ENVIRONMENT=production` when going live

---

### 4️⃣ Create Database Table

Open your terminal and run:

```bash
cd c:\Users\moham\OneDrive\Desktop\NixtBackend

# Connect to your database and run migration
psql -U postgres -d your_database_name -f migrations/2026-07-25-create-payments-table.sql
```

**Replace:**
- `your_database_name` → Your actual database name

---

### 5️⃣ Setup Webhook URL in SpaceRemit Dashboard

#### For Production:
1. Go to [SpaceRemit Dashboard](https://spaceremit.com/dashboard) → Website Settings
2. Find "Callback URL" or "Webhook URL" field
3. Enter:
   ```
   https://yourdomain.com/api/v1/payments/spaceremit/webhook
   ```
4. Save settings

#### For Development (Local Testing):

**Option A: Using ngrok (Recommended)**
```bash
# Install ngrok if you haven't: https://ngrok.com/download
ngrok http 3003
```

Then use the URL provided:
```
https://abc123.ngrok.io/api/v1/payments/spaceremit/webhook
```

**Option B: Using localhost.run**
```bash
ssh -R 80:localhost:3003 localhost.run
```

---

### 6️⃣ Restart Your Servers

```bash
# Terminal 1 - Frontend
cd c:\Users\moham\OneDrive\Desktop\NIXT
npm run dev

# Terminal 2 - Backend
cd c:\Users\moham\OneDrive\Desktop\NixtBackend
npm run dev
```

---

### 7️⃣ Test the Payment Flow

1. Open your browser: `http://localhost:3000/payment?plan=landing&amount=100`
2. You should see the payment form
3. Select "Local payment methods"
4. Complete a test payment using test keys
5. Verify payment was recorded in database:
   ```sql
   SELECT * FROM payments ORDER BY created_at DESC LIMIT 1;
   ```

---

## 🔍 Verification Steps

Check each of these:

- [ ] Frontend shows payment form correctly
- [ ] No console errors in browser
- [ ] Backend `/api/v1/payments/spaceremit/config` returns configuration
- [ ] Test payment completes successfully
- [ ] Payment is recorded in `payments` table
- [ ] Webhook URL is accessible (test with Postman or curl)

---

## 🐛 Common Issues

### "Payment gateway is not configured"

**Solution:**
1. Check `.env` files have correct keys
2. Restart backend server
3. Clear browser cache

### "Failed to load Spaceremit payment script"

**Solution:**
1. Check internet connection
2. Check browser console for CORS errors
3. Verify PUBLIC_KEY is correct

### Webhook not receiving callbacks

**Solution:**
1. Verify callback URL in SpaceRemit Dashboard is correct
2. For local testing, ensure ngrok is running
3. Check backend logs for webhook errors
4. Test webhook manually:
   ```bash
   curl -X POST http://localhost:3003/api/v1/payments/spaceremit/webhook \
     -H "Content-Type: application/json" \
     -d '{"response_status":"success","data":{"id":"test"}}'
   ```

---

## 🚀 Going Live

When ready for production:

1. Set `SPACEREMIT_ENVIRONMENT=production` in backend `.env`
2. Update frontend to use production public key
3. Update webhook URL to production domain
4. Test with small amount first
5. Monitor logs for any issues

---

## 📚 Additional Resources

- Full Documentation: `SPACEREMIT_INTEGRATION_GUIDE.md`
- Backend Setup: `NixtBackend/SPACEREMIT_SETUP.md`
- SpaceRemit API Docs: [spaceremit.com/api/documentation](https://spaceremit.com/api/documentation)

---

## ✅ Setup Complete!

If all steps are completed, you're ready to accept payments! 🎉

**Test URL:** `http://localhost:3000/payment?plan=landing&amount=100`
