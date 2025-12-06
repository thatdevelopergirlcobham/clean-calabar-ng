# CleanCal Booking System Guide

## Overview
The new booking system provides a conversational AI-powered flow for hiring cleaners and scheduling waste pickup services with integrated Paystack payment.

## Features

### 🤖 Conversational AI Booking
- Step-by-step guided conversation
- Natural language processing
- Collects all necessary information through chat
- No sensitive data displayed in chat (privacy-focused)

### 💳 Secure Payment Integration
- Paystack payment gateway
- Secure checkout process
- Payment confirmation
- Transaction reference tracking

### 📱 User Flow

#### 1. Start Booking
**From HireCleaners Page:**
- Click "Ask AI" button in the banner
- Chatbot opens in "Hire Cleaners" mode

**From Chatbot:**
- Click chatbot icon
- Select "Hire Cleaners" from dropdown

#### 2. Conversational Data Collection
The AI guides users through these steps:

1. **Service Type**
   - "I need house cleaning" → Cleaning service
   - "I need waste pickup" → Waste pickup service

2. **Location**
   - "Ekpo Abasi Street, Calabar"
   - Any address in Calabar

3. **Date**
   - "Tomorrow"
   - "December 10"
   - "Next Monday"

4. **Service Details**
   - For cleaning: Space size (small/medium/large)
   - For waste: Waste size (small bin/large bin/truck load)

5. **Urgency**
   - "Urgent" → ASAP with 30% fee
   - "Standard" → Scheduled time

6. **Description**
   - Brief description of work needed

7. **Contact Information**
   - Full name
   - Phone number
   - Email address

#### 3. Review & Payment
- AI shows booking summary
- Click "Proceed to Payment" button
- Redirects to Booking Confirmation page
- Review all details
- Matched with best service provider
- See estimated price
- Click "Proceed to Payment"
- Paystack payment modal opens
- Complete payment

#### 4. Confirmation
- Success page with booking reference
- Email confirmation sent
- Service provider will contact customer

## Technical Implementation

### Files Created

#### 1. Type Definitions
**`src/types/booking.ts`**
```typescript
export interface BookingRequest {
  serviceType: 'cleaning' | 'waste_pickup';
  location: string;
  date: string;
  time?: string;
  urgency: 'standard' | 'urgent';
  description: string;
  spaceSize?: 'small' | 'medium' | 'large';
  wasteSize?: 'small_bin' | 'large_bin' | 'truck_load';
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  selectedCleaner?: number;
  estimatedPrice?: string;
}
```

#### 2. Utility Functions
**`src/utils/bookingFlow.ts`**
- `saveBookingToStorage()` - Save booking to localStorage
- `getBookingFromStorage()` - Retrieve booking data
- `clearBookingFromStorage()` - Clear after payment
- `matchCleanerToRequest()` - Match best cleaner
- `estimatePrice()` - Calculate estimated price

#### 3. Pages

**`src/pages/community/BookingConfirmation.tsx`**
- Review booking details
- Show matched service provider
- Display estimated price
- Paystack payment integration

**`src/pages/community/BookingSuccess.tsx`**
- Payment success confirmation
- Booking reference display
- Next steps information

#### 4. Updated Components

**`src/components/common/AIChatBot.tsx`**
- Added "Hire Cleaners" mode
- Conversational booking flow
- Step-by-step data collection
- "Proceed to Payment" button
- localStorage integration

**`src/pages/community/HireCleaners.tsx`**
- Added AI helper banner
- "Ask AI" button
- Custom event to open chatbot

### Routes Added
```typescript
/community/hire-cleaners → HireCleaners page
/community/booking-confirmation → BookingConfirmation page
/community/booking-success → BookingSuccess page
```

## Paystack Integration

### Setup Required

1. **Get Paystack API Keys**
   - Sign up at https://paystack.com
   - Get your public key from dashboard
   - Test key: `pk_test_...`
   - Live key: `pk_live_...`

2. **Update Configuration**
   In `src/pages/community/BookingConfirmation.tsx`, replace:
   ```typescript
   key: 'pk_test_your_paystack_public_key_here'
   ```
   With your actual Paystack public key.

3. **Environment Variables** (Recommended)
   Create `.env`:
   ```
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
   ```
   
   Update code:
   ```typescript
   key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
   ```

### Payment Flow

1. User clicks "Proceed to Payment"
2. Paystack modal opens
3. User enters card details
4. Payment processed
5. On success: Redirect to success page
6. On close: Stay on confirmation page

### Webhook Setup (Backend Required)

For production, set up Paystack webhooks to:
- Verify payments
- Update booking status
- Send confirmation emails
- Notify service providers

## Data Privacy

### What's NOT Shown in Chat
- Service provider phone numbers
- Service provider emails
- Exact pricing until summary

### What's Stored in localStorage
- All booking data temporarily
- Cleared after successful payment
- Used only for booking confirmation page

### Security Considerations
- No sensitive payment data stored
- Paystack handles all payment processing
- HTTPS required for production
- PCI DSS compliant through Paystack

## Pricing Logic

### Base Prices

**Cleaning Services:**
- Small space: ₦5,000
- Medium space: ₦10,000
- Large space: ₦15,000

**Waste Pickup:**
- Small bin: ₦3,000
- Large bin: ₦8,000
- Truck load: ₦15,000

**Urgency Fee:**
- Urgent requests: +30% of base price

### Example Calculations
- Medium cleaning, standard: ₦10,000
- Medium cleaning, urgent: ₦13,000
- Large bin waste, urgent: ₦10,400

## Mock Data

### Service Providers
Located in `src/data/mockCleaners.ts`:

1. **Calabar Clean Team** - 4.8⭐ (127 reviews)
2. **Sparkle Pro Services** - 4.9⭐ (203 reviews)
3. **EcoClean Calabar** - 4.7⭐ (89 reviews)
4. **Quick Waste Pickup** - 4.6⭐ (156 reviews)
5. **Premium Clean Co.** - 5.0⭐ (45 reviews)

## Testing the System

### Test Booking Flow

1. Open app and navigate to HireCleaners page
2. Click "Ask AI" button
3. Follow conversation:
   ```
   User: "I need house cleaning"
   Bot: "Where do you need the cleaning?"
   User: "Ekpo Abasi Street"
   Bot: "When do you need this service?"
   User: "Tomorrow"
   Bot: "What's the size of the space?"
   User: "Medium"
   Bot: "Is this urgent or standard?"
   User: "Standard"
   Bot: "Please provide a brief description"
   User: "Deep cleaning needed"
   Bot: "What's your full name?"
   User: "John Doe"
   Bot: "What's your phone number?"
   User: "+234 803 123 4567"
   Bot: "What's your email?"
   User: "john@example.com"
   Bot: [Shows summary with "Proceed to Payment" button]
   ```

4. Click "Proceed to Payment"
5. Review details on confirmation page
6. Click "Proceed to Payment" again
7. Use Paystack test card:
   - Card: 4084 0840 8408 4081
   - Expiry: Any future date
   - CVV: 408
   - PIN: 0000
   - OTP: 123456

8. Complete payment
9. See success page

## Future Enhancements

### Phase 2
- [ ] Real-time availability checking
- [ ] Service provider profiles with photos
- [ ] Customer reviews and ratings
- [ ] In-app messaging with providers
- [ ] Booking history and tracking

### Phase 3
- [ ] Recurring bookings
- [ ] Multi-service packages
- [ ] Loyalty rewards program
- [ ] Service provider app
- [ ] Real-time GPS tracking

### Phase 4
- [ ] AI-powered price optimization
- [ ] Automated scheduling
- [ ] Quality assurance system
- [ ] Insurance integration
- [ ] Multi-language support

## Troubleshooting

### Common Issues

**Chatbot doesn't open in hire mode:**
- Check browser console for errors
- Verify custom event is dispatched
- Clear browser cache

**Payment modal doesn't open:**
- Verify Paystack script is loaded
- Check API key is correct
- Ensure amount is valid (> 0)

**Booking data lost:**
- Check localStorage is enabled
- Verify data is saved before navigation
- Check browser privacy settings

**Price calculation wrong:**
- Verify booking data is complete
- Check estimatePrice() function
- Ensure urgency is set correctly

## Support

For issues or questions:
- Email: support@cleancal.ng
- GitHub: [Repository Issues]
- Documentation: This file

## License

This booking system is part of the CleanCal platform.
All rights reserved © 2024 CleanCal
