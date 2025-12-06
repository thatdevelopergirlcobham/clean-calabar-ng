# AI Cleaner Finder Feature (DEPRECATED)

⚠️ **This document is outdated. The system has been upgraded!**

## New System
The booking system has been completely redesigned with:
- ✅ Conversational AI booking flow
- ✅ Privacy-focused (no sensitive data in chat)
- ✅ Integrated Paystack payment
- ✅ Automated booking confirmation

## 📚 Updated Documentation
Please refer to these new guides:
- **`BOOKING_FLOW_SUMMARY.md`** - Quick overview (START HERE!)
- **`PAYSTACK_SETUP.md`** - Setup instructions
- **`BOOKING_SYSTEM_GUIDE.md`** - Complete documentation

---

# Original Documentation (For Reference Only)

## Overview
The AI Chatbot now includes a "Hire Cleaners" mode that helps users find cleaning services and waste pickup providers in Calabar through conversational AI.

## Features

### 3 AI Modes
1. **Assistant Mode** - General waste management help
2. **Upcycle Mode** - Creative DIY upcycling ideas
3. **Hire Cleaners Mode** - Find and hire cleaning services (NEW!)

### Hire Cleaners Mode Capabilities
- Browse 5 mock cleaning/waste pickup services
- Filter by service type (cleaning vs waste pickup)
- Find services by availability (urgent/today)
- Get recommendations by rating
- Find budget-friendly options
- View detailed service information (ratings, prices, phone numbers)

## Mock Data
Located in `src/data/mockCleaners.ts`:
- 5 cleaning/waste pickup services
- Ratings, reviews, specialties
- Price ranges in Nigerian Naira (₦)
- Contact information
- Availability status

## Usage

### From HireCleaners Page
1. Click the "Ask AI" button in the banner
2. Chatbot opens automatically in "Hire Cleaners" mode
3. Ask questions like:
   - "Show me cleaning services"
   - "I need waste pickup today"
   - "Who's the best rated?"
   - "Affordable options?"

### From Chatbot Directly
1. Click the chatbot icon (bottom right)
2. Select "Hire Cleaners" from the mode dropdown
3. Start asking questions

## Example Queries
- "I need cleaning service" → Shows all cleaning services
- "Waste pickup today" → Shows available waste pickup services
- "Best rated cleaners" → Shows top 3 by rating
- "Cheap options" → Shows budget-friendly services
- "Urgent service" → Shows services available today/24-7

## Technical Implementation

### Files Modified
- `src/components/common/AIChatBot.tsx` - Added hire mode
- `src/pages/community/HireCleaners.tsx` - Added AI helper banner
- `src/data/mockCleaners.ts` - Mock cleaner data (NEW)

### Custom Event
The HireCleaners page triggers the chatbot using:
```javascript
const event = new CustomEvent('openAIChatInMode', { detail: { mode: 'hire' } });
window.dispatchEvent(event);
```

### AI Response Logic
- Without Gemini API: Uses pattern matching on user queries
- With Gemini API: Uses AI with cleaner data in system prompt

## Future Enhancements
- Connect to real cleaner database
- Add booking functionality
- Include cleaner photos and portfolios
- Add user reviews and ratings
- Implement real-time availability
- Add payment integration
