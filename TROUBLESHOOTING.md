# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### 1. Module Export Error

**Error:**
```
bookingFlow.ts:1 Uncaught SyntaxError: The requested module '/src/types/booking.ts' 
does not provide an export named 'BookingRequest'
```

**Cause:** Vite cache issue after creating new files

**Solution:**
```bash
# Option 1: Use the provided script
./fix-cache.sh
npm run dev

# Option 2: Manual cleanup
rm -rf node_modules/.vite
rm -rf dist
npm run dev
```

**Why this happens:** Vite caches module information. When new TypeScript files are created, the cache may not update immediately.

---

### 2. Paystack Not Defined

**Error:**
```
Uncaught ReferenceError: PaystackPop is not defined
```

**Cause:** Paystack script not loaded

**Solution:**

1. Check `index.html` has the script:
```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

2. Verify it's before the main script:
```html
<script src="https://js.paystack.co/v1/inline.js"></script>
<script type="module" src="/src/main.tsx"></script>
```

3. Check browser console for script loading errors
4. Verify internet connection

---

### 3. Routes Not Working (404)

**Error:** Navigating to `/community/booking-confirmation` shows 404

**Cause:** Routes not registered in App.tsx

**Solution:**

Check `src/App.tsx` has these routes:
```typescript
<Route path="/community/hire-cleaners" element={<HireCleaners />} />
<Route path="/community/booking-confirmation" element={<BookingConfirmation />} />
<Route path="/community/booking-success" element={<BookingSuccess />} />
```

And imports:
```typescript
import BookingConfirmation from './pages/community/BookingConfirmation'
import BookingSuccess from './pages/community/BookingSuccess'
```

---

### 4. Chatbot Doesn't Open in Hire Mode

**Error:** Clicking "Ask AI" doesn't open chatbot or opens in wrong mode

**Cause:** Custom event not dispatched or listener not set up

**Solution:**

1. Check `HireCleaners.tsx` has the button:
```typescript
onClick={() => {
  const event = new CustomEvent('openAIChatInMode', { detail: { mode: 'hire' } });
  window.dispatchEvent(event);
}}
```

2. Check `AIChatBot.tsx` has the listener:
```typescript
useEffect(() => {
  const handleOpenChat = (e: CustomEvent) => {
    const { mode } = e.detail;
    if (mode && ['normal', 'upcycle', 'hire'].includes(mode)) {
      setAIMode(mode);
      setMessages([getGreeting(mode)]);
      setIsAIChatOpen(true);
    }
  };
  window.addEventListener('openAIChatInMode', handleOpenChat as EventListener);
  return () => {
    window.removeEventListener('openAIChatInMode', handleOpenChat as EventListener);
  };
}, [])
```

3. Clear browser cache and reload

---

### 5. Booking Data Lost

**Error:** Data disappears when navigating to confirmation page

**Cause:** localStorage not saving or being cleared

**Solution:**

1. Check browser allows localStorage:
```javascript
// In browser console
localStorage.setItem('test', 'value')
localStorage.getItem('test') // Should return 'value'
```

2. Check private/incognito mode (may block localStorage)

3. Verify data is saved:
```javascript
// In browser console after completing chat
localStorage.getItem('cleancal_booking_request')
```

4. Check `bookingFlow.ts` functions are imported correctly

---

### 6. Payment Modal Doesn't Open

**Error:** Clicking "Proceed to Payment" does nothing

**Cause:** Paystack configuration issue

**Solution:**

1. Verify API key is set in `BookingConfirmation.tsx`:
```typescript
key: 'pk_test_your_actual_key_here', // Not the placeholder!
```

2. Check amount is valid (> 0):
```typescript
const amount = parseInt(priceStr) * 100; // Should be > 0
console.log('Amount:', amount); // Debug
```

3. Check email is provided:
```typescript
email: booking.contactEmail || user.email, // Must have value
```

4. Open browser console for Paystack errors

---

### 7. TypeScript Errors

**Error:** Red squiggly lines in VS Code

**Cause:** Type definitions not recognized

**Solution:**

1. Restart TypeScript server in VS Code:
   - Cmd/Ctrl + Shift + P
   - Type "TypeScript: Restart TS Server"
   - Press Enter

2. Check `tsconfig.json` includes src folder:
```json
{
  "include": ["src"]
}
```

3. Run type check:
```bash
npm run type-check
# or
npx tsc --noEmit
```

---

### 8. Styles Not Applied

**Error:** Components look unstyled or broken

**Cause:** Tailwind CSS not loaded

**Solution:**

1. Check `tailwind.config.js` exists

2. Verify `src/index.css` has Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

3. Check `main.tsx` imports the CSS:
```typescript
import './index.css'
```

4. Restart dev server

---

### 9. Mock Cleaners Not Showing

**Error:** No service providers displayed

**Cause:** Mock data not imported

**Solution:**

1. Verify `src/data/mockCleaners.ts` exists

2. Check it's imported in components:
```typescript
import { MOCK_CLEANERS } from '../../data/mockCleaners'
```

3. Check the data structure matches the `Cleaner` interface

---

### 10. Price Calculation Wrong

**Error:** Estimated price doesn't match expectations

**Cause:** Logic error in `estimatePrice()` function

**Solution:**

1. Check `src/utils/bookingFlow.ts` `estimatePrice()` function

2. Verify booking data has required fields:
```typescript
{
  serviceType: 'cleaning' | 'waste_pickup',
  spaceSize: 'small' | 'medium' | 'large', // for cleaning
  wasteSize: 'small_bin' | 'large_bin' | 'truck_load', // for waste
  urgency: 'standard' | 'urgent'
}
```

3. Test calculation manually:
```typescript
// In browser console
import { estimatePrice } from './utils/bookingFlow'
estimatePrice({
  serviceType: 'cleaning',
  spaceSize: 'medium',
  urgency: 'standard'
}) // Should return ₦10,000
```

---

## Development Issues

### Hot Reload Not Working

**Solution:**
```bash
# Stop server (Ctrl+C)
rm -rf node_modules/.vite
npm run dev
```

### Port Already in Use

**Error:** `Port 5173 is already in use`

**Solution:**
```bash
# Find and kill process
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Build Errors

**Error:** Build fails with module errors

**Solution:**
```bash
# Clean everything
rm -rf node_modules
rm -rf node_modules/.vite
rm -rf dist
rm package-lock.json

# Reinstall
npm install

# Try build
npm run build
```

---

## Browser Issues

### Works in Chrome but not Safari

**Cause:** Browser compatibility

**Solution:**
1. Check browser console for specific errors
2. Verify localStorage is enabled in Safari settings
3. Test in private window to rule out extensions

### Mobile Issues

**Cause:** Responsive design or touch events

**Solution:**
1. Test in Chrome DevTools mobile view
2. Check viewport meta tag in `index.html`
3. Verify touch events work (not just click)

---

## Production Issues

### Paystack Test Mode in Production

**Error:** Using test keys in production

**Solution:**
1. Replace `pk_test_...` with `pk_live_...`
2. Use environment variables:
```typescript
key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
```

### HTTPS Required

**Error:** Paystack requires HTTPS

**Solution:**
1. Deploy to platform with HTTPS (Vercel, Netlify, etc.)
2. Or set up SSL certificate on your server

---

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Check browser console for errors
3. ✅ Try clearing cache (`./fix-cache.sh`)
4. ✅ Verify all files are created correctly
5. ✅ Check Paystack key is set

### Where to Get Help

- **Documentation:** Read `BOOKING_SYSTEM_GUIDE.md`
- **Setup:** Check `PAYSTACK_SETUP.md`
- **Quick Start:** Review `QUICK_START.md`
- **Email:** support@cleancal.ng

### What to Include When Reporting Issues

1. Error message (full text)
2. Browser console screenshot
3. Steps to reproduce
4. Browser and OS version
5. What you've already tried

---

## Debugging Tips

### Enable Verbose Logging

Add to components:
```typescript
console.log('Booking data:', bookingData)
console.log('Current step:', bookingStep)
console.log('Estimated price:', estimatePrice(bookingData))
```

### Check localStorage

In browser console:
```javascript
// View all data
console.log(localStorage)

// View booking data
console.log(JSON.parse(localStorage.getItem('cleancal_booking_request')))

// Clear if needed
localStorage.clear()
```

### Test Paystack Separately

```html
<!-- Create test.html -->
<script src="https://js.paystack.co/v1/inline.js"></script>
<script>
  const handler = PaystackPop.setup({
    key: 'pk_test_your_key',
    email: 'test@example.com',
    amount: 1000000, // ₦10,000 in kobo
    callback: (response) => console.log('Success:', response),
    onClose: () => console.log('Closed')
  });
  handler.openIframe();
</script>
```

---

## Still Having Issues?

If none of these solutions work:

1. Create a fresh branch
2. Re-run the setup from scratch
3. Compare with working version
4. Contact support with detailed information

Remember: Most issues are cache-related. Try `./fix-cache.sh` first! 🧹
