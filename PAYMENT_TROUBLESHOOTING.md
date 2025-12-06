# Payment Button Troubleshooting

## Issue: "Proceed to Payment" Button Not Working

### Quick Checks

1. **Open Browser Console** (F12 or Right-click → Inspect → Console)
   - Look for any error messages
   - Check what happens when you click the button

2. **Check if Paystack is Loaded**
   - In browser console, type: `window.PaystackPop`
   - Should show an object, not `undefined`

3. **Verify You're Logged In**
   - The payment requires a user to be logged in
   - Check if you see your profile in the navbar

### Common Issues & Solutions

#### 1. Paystack Not Loaded

**Symptoms:**
- Console error: `PaystackPop is not defined`
- Alert: "Payment system is loading"

**Solutions:**

a. **Check Internet Connection**
   ```bash
   # Test if Paystack script is accessible
   curl -I https://js.paystack.co/v1/inline.js
   ```

b. **Clear Browser Cache**
   - Chrome: Ctrl+Shift+Delete → Clear cache
   - Or hard reload: Ctrl+Shift+R

c. **Test Paystack Separately**
   - Open `test-paystack.html` in your browser
   - Click "Test Payment"
   - If this works, the issue is in the React app

#### 2. No Booking Data

**Symptoms:**
- Redirected back to hire-cleaners page
- Message: "No booking data found"

**Solutions:**

a. **Complete the Chat Flow**
   - Go to `/community/hire-cleaners`
   - Click "Ask AI"
   - Complete ALL questions in the chat
   - Click "Proceed to Payment" in chat
   - Then try payment button

b. **Check localStorage**
   ```javascript
   // In browser console
   localStorage.getItem('cleancal_booking_request')
   ```
   Should show booking data, not `null`

c. **Clear and Restart**
   ```javascript
   // In browser console
   localStorage.clear()
   // Then start booking process again
   ```

#### 3. User Not Logged In

**Symptoms:**
- Button does nothing
- Console shows: "Missing required data: user"

**Solutions:**

a. **Log In**
   - Click "Login" in navbar
   - Or go to `/auth`

b. **Check Auth Status**
   ```javascript
   // In browser console
   localStorage.getItem('supabase.auth.token')
   ```

#### 4. Invalid Amount

**Symptoms:**
- Console error about amount
- Payment modal doesn't open

**Solutions:**

a. **Check Estimated Price**
   - Should show on confirmation page
   - Must be > 0

b. **Debug Amount Calculation**
   ```javascript
   // In browser console
   const booking = JSON.parse(localStorage.getItem('cleancal_booking_request'))
   console.log('Booking:', booking)
   ```

#### 5. API Key Issues

**Symptoms:**
- Payment modal opens but shows error
- "Invalid key" message

**Solutions:**

a. **Verify API Key**
   - Check `src/pages/community/BookingConfirmation.tsx` line ~60
   - Should be: `pk_live_...` or `pk_test_...`
   - No trailing dots or spaces

b. **Test with Test Key**
   - Replace with: `pk_test_...` for testing
   - Use test card: 4084 0840 8408 4081

### Step-by-Step Debugging

#### Step 1: Open Browser Console
```
F12 or Right-click → Inspect → Console tab
```

#### Step 2: Check Paystack
```javascript
console.log('Paystack loaded:', typeof window.PaystackPop !== 'undefined')
```

#### Step 3: Check Booking Data
```javascript
const booking = JSON.parse(localStorage.getItem('cleancal_booking_request'))
console.log('Booking data:', booking)
```

#### Step 4: Check User
```javascript
console.log('User logged in:', !!localStorage.getItem('supabase.auth.token'))
```

#### Step 5: Try Payment
- Click "Proceed to Payment"
- Watch console for errors
- Note exact error message

### Testing the Complete Flow

1. **Start Fresh**
   ```javascript
   // Clear everything
   localStorage.clear()
   ```

2. **Log In**
   - Go to `/auth`
   - Sign in or create account

3. **Start Booking**
   - Go to `/community/hire-cleaners`
   - Click "Ask AI"

4. **Complete Chat**
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

5. **Click "Proceed to Payment" in Chat**
   - Should navigate to confirmation page

6. **Review Details**
   - Check all information is correct

7. **Click "Proceed to Payment" Button**
   - Paystack modal should open

8. **Enter Test Card**
   ```
   Card: 4084 0840 8408 4081
   Expiry: 12/25
   CVV: 408
   PIN: 0000
   OTP: 123456
   ```

9. **Complete Payment**
   - Should redirect to success page

### Still Not Working?

#### Collect Debug Info

Run this in browser console:
```javascript
console.log('=== DEBUG INFO ===')
console.log('Paystack:', typeof window.PaystackPop)
console.log('Booking:', localStorage.getItem('cleancal_booking_request'))
console.log('Auth:', !!localStorage.getItem('supabase.auth.token'))
console.log('URL:', window.location.href)
console.log('==================')
```

Copy the output and:
1. Check against this guide
2. Search for the specific error
3. Contact support with the debug info

### Quick Fixes

#### Fix 1: Restart Dev Server
```bash
# Stop server (Ctrl+C)
./fix-cache.sh
npm run dev
```

#### Fix 2: Hard Reload Browser
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

#### Fix 3: Try Different Browser
- Test in Chrome
- Test in Firefox
- Test in Safari

#### Fix 4: Check Network Tab
- Open DevTools → Network tab
- Click payment button
- Look for failed requests (red)
- Check if Paystack script loaded

### Test Files

1. **`test-paystack.html`** - Standalone Paystack test
   - Open directly in browser
   - Tests if Paystack works outside React

2. **`fix-cache.sh`** - Clear Vite cache
   ```bash
   ./fix-cache.sh
   ```

### Contact Support

If nothing works, provide:
1. Browser console screenshot
2. Network tab screenshot
3. Debug info from console
4. Steps you've tried
5. Browser and OS version

Email: support@cleancal.ng

---

## Prevention Tips

- Always complete the full chat flow
- Don't refresh during booking process
- Stay logged in
- Use supported browsers (Chrome, Firefox, Safari)
- Check internet connection
- Clear cache if issues persist
