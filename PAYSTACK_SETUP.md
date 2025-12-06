# Paystack Setup Guide for CleanCal

## Quick Setup (5 minutes)

### Step 1: Get Your Paystack Keys

1. Go to https://paystack.com
2. Sign up or log in
3. Navigate to Settings → API Keys & Webhooks
4. Copy your **Public Key**
   - Test mode: `pk_test_...`
   - Live mode: `pk_live_...`

### Step 2: Add Key to Your App

**Option A: Direct (Quick Test)**

Open `src/pages/community/BookingConfirmation.tsx` and find line ~67:

```typescript
key: 'pk_test_your_paystack_public_key_here',
```

Replace with your actual key:

```typescript
key: 'pk_test_abc123xyz456...',
```

**Option B: Environment Variable (Recommended)**

1. Create/update `.env` file in project root:
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
```

2. Update `src/pages/community/BookingConfirmation.tsx` line ~67:
```typescript
key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_fallback_key',
```

3. Restart dev server

### Step 3: Test Payment

Use these Paystack test cards:

**Success Card:**
- Card Number: `4084 0840 8408 4081`
- Expiry: Any future date (e.g., `12/25`)
- CVV: `408`
- PIN: `0000`
- OTP: `123456`

**Other Test Cards:**
- Insufficient Funds: `5060 6666 6666 6666 6666`
- Declined: `5060 0000 0000 0000 0000`

### Step 4: Verify Script is Loaded

The Paystack script is already added to `index.html`:
```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

No action needed! ✅

## Testing the Complete Flow

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Navigate to HireCleaners:**
   - Go to `/community/hire-cleaners`
   - Or click "Hire Cleaners" in navigation

3. **Click "Ask AI" button**

4. **Chat with the bot:**
   ```
   You: "I need house cleaning"
   Bot: "Where do you need the cleaning?"
   You: "123 Main Street, Calabar"
   Bot: "When do you need this service?"
   You: "Tomorrow"
   Bot: "What's the size of the space?"
   You: "Medium"
   Bot: "Is this urgent or standard?"
   You: "Standard"
   Bot: "Please provide a brief description"
   You: "General cleaning"
   Bot: "What's your full name?"
   You: "Test User"
   Bot: "What's your phone number?"
   You: "+234 803 123 4567"
   Bot: "What's your email?"
   You: "test@example.com"
   ```

5. **Click "Proceed to Payment"**

6. **Review booking details**

7. **Click "Proceed to Payment" again**

8. **Enter test card details**

9. **Complete payment**

10. **See success page!** 🎉

## Production Checklist

Before going live:

- [ ] Replace test key with live key (`pk_live_...`)
- [ ] Set up Paystack webhooks
- [ ] Configure webhook URL in Paystack dashboard
- [ ] Test with real (small amount) transactions
- [ ] Set up email notifications
- [ ] Configure proper error handling
- [ ] Add transaction logging
- [ ] Set up customer support flow
- [ ] Test refund process
- [ ] Review Paystack fees and pricing
- [ ] Enable 3D Secure for cards
- [ ] Set up dispute resolution process

## Webhook Setup (Backend Required)

### 1. Create Webhook Endpoint

```typescript
// Example: /api/webhooks/paystack
app.post('/api/webhooks/paystack', (req, res) => {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (hash === req.headers['x-paystack-signature']) {
    const event = req.body;
    
    if (event.event === 'charge.success') {
      // Update booking status
      // Send confirmation email
      // Notify service provider
    }
  }
  
  res.sendStatus(200);
});
```

### 2. Configure in Paystack Dashboard

1. Go to Settings → API Keys & Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/paystack`
3. Select events to listen for:
   - `charge.success`
   - `charge.failed`
   - `transfer.success`

### 3. Test Webhooks

Use Paystack's webhook testing tool in dashboard.

## Pricing Configuration

Current pricing in `src/utils/bookingFlow.ts`:

```typescript
// Cleaning
Small: ₦5,000
Medium: ₦10,000
Large: ₦15,000

// Waste Pickup
Small bin: ₦3,000
Large bin: ₦8,000
Truck load: ₦15,000

// Urgency fee: +30%
```

To change prices, edit the `estimatePrice()` function.

## Security Best Practices

1. **Never commit API keys to git**
   - Add `.env` to `.gitignore`
   - Use environment variables

2. **Use HTTPS in production**
   - Required by Paystack
   - Protects customer data

3. **Validate on backend**
   - Don't trust client-side amounts
   - Verify payment on server

4. **Log all transactions**
   - Keep audit trail
   - Monitor for fraud

5. **Handle errors gracefully**
   - Show user-friendly messages
   - Log technical details

## Common Issues

### "Paystack is not defined"
- Check if script is loaded in `index.html`
- Verify internet connection
- Check browser console for errors

### Payment modal doesn't open
- Verify API key is correct
- Check amount is valid (> 0)
- Ensure email is provided

### Payment succeeds but booking not saved
- Check localStorage is enabled
- Verify webhook is configured
- Check backend logs

### Wrong amount charged
- Verify `estimatePrice()` calculation
- Check urgency fee is applied correctly
- Ensure amount is in kobo (multiply by 100)

## Support Resources

- **Paystack Docs:** https://paystack.com/docs
- **Test Cards:** https://paystack.com/docs/payments/test-payments
- **API Reference:** https://paystack.com/docs/api
- **Support:** support@paystack.com

## Cost Breakdown

Paystack fees (as of 2024):
- Local cards: 1.5% + ₦100 (capped at ₦2,000)
- International cards: 3.9% + ₦100
- Bank transfers: ₦50 flat fee

Example for ₦10,000 booking:
- Customer pays: ₦10,000
- Paystack fee: ₦250 (1.5% + ₦100)
- You receive: ₦9,750

## Next Steps

1. ✅ Get Paystack account
2. ✅ Add public key to app
3. ✅ Test with test cards
4. ⏳ Set up webhooks (backend)
5. ⏳ Configure email notifications
6. ⏳ Test in production with small amounts
7. ⏳ Launch! 🚀

---

Need help? Check the main `BOOKING_SYSTEM_GUIDE.md` or contact support@cleancal.ng
