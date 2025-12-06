# 🚀 Quick Start - CleanCal Booking System

## ⚡ 2-Minute Setup

### 1. Get Paystack Key (1 min)
1. Go to https://paystack.com
2. Sign up (or log in)
3. Copy your test public key: `pk_test_...`

### 2. Add Key to App (30 sec)
Open `src/pages/community/BookingConfirmation.tsx` (line 67):
```typescript
key: 'YOUR_KEY_HERE', // Replace this
```

### 3. Test It! (30 sec)
```bash
npm run dev
```
Navigate to: http://localhost:5173/community/hire-cleaners

Click "Ask AI" → Follow the chat → Use test card!

## 🧪 Test Card
```
Card: 4084 0840 8408 4081
Expiry: 12/25
CVV: 408
PIN: 0000
OTP: 123456
```

## ✅ That's It!

The system is ready to use. For more details:
- 📖 Read `BOOKING_FLOW_SUMMARY.md` for overview
- 🔧 Read `PAYSTACK_SETUP.md` for production setup
- 📚 Read `BOOKING_SYSTEM_GUIDE.md` for everything

## 🎯 What You Get

✅ Conversational AI booking
✅ Privacy-focused (no sensitive data exposed)
✅ Paystack payment integration
✅ Automated booking flow
✅ Mobile-friendly interface
✅ 5 mock service providers
✅ Smart price calculation
✅ Success confirmation page

## 📱 Try It Now

1. Start app: `npm run dev`
2. Go to: `/community/hire-cleaners`
3. Click: "Ask AI"
4. Say: "I need house cleaning"
5. Follow the conversation
6. Complete booking with test card
7. See success page! 🎉

## 🆘 Troubleshooting

### "Module does not provide an export" Error

If you see this error:
```
The requested module '/src/types/booking.ts' does not provide an export named 'BookingRequest'
```

**Fix:** Clear Vite cache and restart:
```bash
./fix-cache.sh
npm run dev
```

Or manually:
```bash
rm -rf node_modules/.vite
rm -rf dist
npm run dev
```

### Other Issues

- **Paystack not defined:** Check `index.html` has the Paystack script
- **Routes not working:** Check `src/App.tsx` has the new routes
- **Chat not opening:** Clear browser cache and reload

## 🆘 Need Help?

- Check `BOOKING_FLOW_SUMMARY.md` for quick reference
- Check `PAYSTACK_SETUP.md` for setup issues
- Check `BOOKING_SYSTEM_GUIDE.md` for detailed docs

---

**Happy booking! 🧹🚛**
