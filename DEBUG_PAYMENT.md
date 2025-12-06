# Debug Payment Button

## Quick Debug Steps

### 1. Check Browser Console

Open browser console (F12) and look for these messages when you click "Proceed to Payment":

**Good signs:**
```
Initializing payment: { amount: 1000000, email: "test@example.com" }
```

**Bad signs:**
```
Missing required data: { user: null, booking: {...}, selectedCleaner: {...} }
Paystack not loaded. Check if script is in index.html
Payment initialization error: ...
```

### 2. Add Temporary Debug Button

Add this to `BookingConfirmation.tsx` temporarily (before the return statement):

```typescript
// TEMPORARY DEBUG - Remove after testing
console.log('=== BOOKING DEBUG ===');
console.log('User:', user);
console.log('Booking:', booking);
console.log('Selected Cleaner:', selectedCleaner);
console.log('Estimated Price:', estimatedPrice);
console.log('Paystack loaded:', typeof window.PaystackPop !== 'undefined');
console.log('====================');
```

### 3. Check Each Requirement

The payment button needs ALL of these:

✅ **User logged in**
```javascript
// In console
console.log('User:', !!localStorage.getItem('supabase.auth.token'))
```

✅ **Booking data exists**
```javascript
// In console
console.log('Booking:', localStorage.getItem('cleancal_booking_request'))
```

✅ **Cleaner selected**
```javascript
// Should see cleaner info on page
```

✅ **Paystack loaded**
```javascript
// In console
console.log('Paystack:', typeof window.PaystackPop)
// Should show "object", not "undefined"
```

### 4. Test Paystack Directly

Open `test-paystack.html` in your browser:
```bash
# If using VS Code Live Server
# Right-click test-paystack.html → Open with Live Server

# Or just open the file directly in browser
open test-paystack.html  # Mac
start test-paystack.html # Windows
```

If this works, Paystack is fine. Issue is in the React app.

### 5. Common Fixes

#### Fix A: Not Logged In
```
1. Go to /auth
2. Sign in or create account
3. Try booking again
```

#### Fix B: No Booking Data
```
1. Go to /community/hire-cleaners
2. Click "Ask AI"
3. Complete ENTIRE chat conversation
4. Click "Proceed to Payment" in chat
5. Then click payment button on confirmation page
```

#### Fix C: Paystack Not Loading
```
1. Check internet connection
2. Hard reload: Ctrl+Shift+R
3. Clear cache: ./fix-cache.sh
4. Restart dev server
```

#### Fix D: Button Does Nothing
```
1. Open browser console (F12)
2. Click button
3. Read error message
4. Follow specific fix for that error
```

### 6. Enable Verbose Logging

Add this at the top of `handlePayment` function:

```typescript
const handlePayment = () => {
  console.log('=== PAYMENT CLICKED ===');
  console.log('User:', user);
  console.log('Booking:', booking);
  console.log('Cleaner:', selectedCleaner);
  console.log('Price:', estimatedPrice);
  
  if (!user) {
    console.error('❌ No user - please log in');
    alert('Please log in to continue');
    return;
  }
  
  if (!booking) {
    console.error('❌ No booking data');
    alert('No booking data found. Please start from the booking page.');
    return;
  }
  
  if (!selectedCleaner) {
    console.error('❌ No cleaner selected');
    alert('No service provider selected. Please try again.');
    return;
  }
  
  // ... rest of function
```

### 7. Test Each Step

#### Step 1: Can you see the confirmation page?
- ✅ Yes → Continue
- ❌ No → Check booking data in localStorage

#### Step 2: Do you see service provider details?
- ✅ Yes → Continue
- ❌ No → Cleaner matching failed

#### Step 3: Do you see estimated price?
- ✅ Yes → Continue
- ❌ No → Price calculation failed

#### Step 4: Is "Proceed to Payment" button enabled?
- ✅ Yes → Continue
- ❌ No → Check if `isProcessing` is stuck

#### Step 5: Does clicking button show "Processing..."?
- ✅ Yes → Paystack should open
- ❌ No → Check console for errors

#### Step 6: Does Paystack modal open?
- ✅ Yes → Success! Enter test card
- ❌ No → Paystack not loaded or API key issue

### 8. Network Check

Open DevTools → Network tab:
1. Reload page
2. Look for `inline.js` (Paystack script)
3. Should show status 200 (green)
4. If red/failed → Internet or firewall issue

### 9. API Key Check

In `BookingConfirmation.tsx`, find this line:
```typescript
key: 'pk_live_fa0a541804703ca42042c3562e96a57e3baa71b1',
```

Make sure:
- No trailing dot (`.`)
- No extra spaces
- Starts with `pk_live_` or `pk_test_`
- Is a valid Paystack key

### 10. Last Resort

If nothing works:

```bash
# 1. Clear everything
localStorage.clear()
rm -rf node_modules/.vite
rm -rf dist

# 2. Restart
npm run dev

# 3. Test in incognito/private window

# 4. Try different browser

# 5. Check PAYMENT_TROUBLESHOOTING.md
```

---

## Quick Test Script

Paste this in browser console to test everything:

```javascript
(function() {
  console.log('=== PAYMENT DEBUG TEST ===');
  
  // Check Paystack
  const paystackLoaded = typeof window.PaystackPop !== 'undefined';
  console.log('✓ Paystack loaded:', paystackLoaded ? '✅' : '❌');
  
  // Check Auth
  const hasAuth = !!localStorage.getItem('supabase.auth.token');
  console.log('✓ User logged in:', hasAuth ? '✅' : '❌');
  
  // Check Booking
  const bookingData = localStorage.getItem('cleancal_booking_request');
  const hasBooking = !!bookingData;
  console.log('✓ Booking data:', hasBooking ? '✅' : '❌');
  
  if (hasBooking) {
    try {
      const booking = JSON.parse(bookingData);
      console.log('  - Service:', booking.serviceType);
      console.log('  - Location:', booking.location);
      console.log('  - Contact:', booking.contactEmail);
    } catch (e) {
      console.log('  - Error parsing booking data');
    }
  }
  
  // Check URL
  console.log('✓ Current page:', window.location.pathname);
  
  // Summary
  console.log('\n=== SUMMARY ===');
  if (paystackLoaded && hasAuth && hasBooking) {
    console.log('✅ All checks passed! Payment should work.');
  } else {
    console.log('❌ Issues found:');
    if (!paystackLoaded) console.log('  - Paystack not loaded');
    if (!hasAuth) console.log('  - User not logged in');
    if (!hasBooking) console.log('  - No booking data');
  }
  console.log('==================');
})();
```

This will tell you exactly what's wrong!
