# 🌟 Recyclables Marketplace - Setup Guide

## ✅ What Has Been Created

I've successfully created a **complete Recyclables Marketplace** feature for your CleanCal app! This allows users to buy and sell recyclable items like plastic bottles, glass, metal, etc.

---

## 📁 Files Created

### 1. **Database Schema** 
📄 `migrations/recyclables_marketplace_schema.sql`
- Complete SQL schema for recyclables marketplace
- Two main tables: `recyclables` and `recyclable_orders`
- Row Level Security (RLS) policies
- Indexes for performance
- Auto-updating timestamps

### 2. **TypeScript Types**
📄 `src/types/recyclable.ts`
- Type definitions for recyclables
- Bottle sizes constants (50cl, 60cl, 1L, 1.5L, 2L, etc.)
- Category types (plastic, glass, metal, paper, cardboard)
- Status types (available, sold, reserved, removed)

### 3. **API Service**
📄 `src/api/recyclables.ts`
- Full CRUD operations for recyclables
- Order management functions
- Real-time subscriptions
- User-specific queries

### 4. **Components**
📄 `src/components/community/RecyclableModal.tsx`
- Modal for creating new recyclable listings
- Image upload integration
- Location selection
- Price calculator
- Bottle size dropdown

📄 `src/components/community/RecyclableCard.tsx`
- Beautiful card component to display recyclables
- Shows price, quantity, category, status
- Seller information
- Contact details

### 5. **Main Page**
📄 `src/pages/community/RecyclablesMarketplace.tsx`
- Homepage-style layout (replica of your reports page)
- Search and filter functionality
- Category filtering
- Status filtering
- Sorting options (newest, price, quantity)
- Real-time updates
- Statistics dashboard

### 6. **Routing**
✅ Updated `src/App.tsx` to include the `/recyclables` route

---

## 🚀 Setup Instructions

### Step 1: Run the SQL Schema in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file: `migrations/recyclables_marketplace_schema.sql`
4. Copy the entire content
5. Paste it into the SQL Editor
6. Click **Run** to execute

This will create:
- ✅ `recyclables` table
- ✅ `recyclable_orders` table
- ✅ All necessary indexes
- ✅ RLS policies for security
- ✅ Triggers for auto-updating timestamps

### Step 2: Verify the Tables

After running the SQL, verify in Supabase:
1. Go to **Table Editor**
2. You should see:
   - `recyclables` table
   - `recyclable_orders` table

### Step 3: Test the Application

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to: **http://localhost:5173/recyclables**

3. You should see the Recyclables Marketplace page!

---

## 🎯 Features Overview

### For Sellers:
- ✅ Upload images of recyclables
- ✅ Set price per piece
- ✅ Specify quantity
- ✅ Choose bottle size (for plastics/glass)
- ✅ Add location
- ✅ Mark price as negotiable
- ✅ Add contact phone number

### For Buyers:
- ✅ Browse all available recyclables
- ✅ Search by keywords
- ✅ Filter by category (plastic, glass, metal, etc.)
- ✅ Filter by status (available, sold, reserved)
- ✅ Sort by price, date, quantity
- ✅ View seller contact information
- ✅ See location (if provided)

### Categories Supported:
1. **Plastic Bottles** - with size options (50cl, 60cl, 1L, 1.5L, 2L, etc.)
2. **Glass Bottles** - with size options
3. **Metal/Aluminum** - cans, containers
4. **Paper** - newspapers, magazines
5. **Cardboard** - boxes, packaging
6. **Other** - miscellaneous recyclables

---

## 📊 Database Schema Details

### `recyclables` Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- title (VARCHAR)
- description (TEXT)
- category (VARCHAR) - plastic, glass, metal, paper, cardboard, other
- bottle_size (VARCHAR) - 50cl, 60cl, 1 liter, etc.
- quantity (INTEGER)
- price_per_unit (DECIMAL)
- total_price (DECIMAL, Auto-calculated)
- image_url (TEXT)
- location (JSONB) - {lat, lng}
- status (VARCHAR) - available, sold, reserved, removed
- is_negotiable (BOOLEAN)
- contact_phone (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### `recyclable_orders` Table
```sql
- id (UUID, Primary Key)
- recyclable_id (UUID, Foreign Key)
- buyer_id (UUID, Foreign Key)
- seller_id (UUID, Foreign Key)
- quantity_ordered (INTEGER)
- total_amount (DECIMAL)
- status (VARCHAR) - pending, confirmed, completed, cancelled
- buyer_notes (TEXT)
- seller_notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 🔐 Security (RLS Policies)

### Recyclables Table:
- ✅ Anyone can **view** all recyclables
- ✅ Authenticated users can **create** their own listings
- ✅ Users can **update** only their own listings
- ✅ Users can **delete** only their own listings

### Orders Table:
- ✅ Users can view orders where they are buyer OR seller
- ✅ Authenticated users can create orders
- ✅ Buyers and sellers can update their orders

---

## 🎨 UI/UX Features

### Hero Section:
- Green gradient background
- Call-to-action button to sell recyclables
- Engaging copy about turning recyclables into cash

### Statistics Dashboard:
- Total listings count
- Available items count
- Total marketplace value

### Filters & Search:
- Real-time search
- Category dropdown
- Status filter
- Multiple sorting options
- Refresh button

### Recyclable Cards:
- Beautiful card design
- Image preview
- Category and status badges
- Price display (per unit and total)
- Bottle size (if applicable)
- Seller information
- Contact phone
- "Negotiable" indicator
- View details button

---

## 🔄 Real-time Features

The marketplace uses Supabase real-time subscriptions:
- ✅ New listings appear automatically
- ✅ Status updates reflect immediately
- ✅ No need to refresh the page

---

## 🛣️ Navigation

Access the marketplace at:
- **Route**: `/recyclables`
- **Full URL**: `http://localhost:5173/recyclables`

You can add a link in your navbar:
```tsx
<Link to="/recyclables">Recyclables</Link>
```

---

## 📱 Mobile Responsive

The page is fully responsive:
- ✅ Mobile-friendly cards
- ✅ Responsive grid layout
- ✅ Touch-friendly buttons
- ✅ Optimized filters for mobile

---

## 🧪 Testing Checklist

### As a Seller:
1. ✅ Click "Sell Recyclables" button
2. ✅ Fill in the form (title, category, quantity, price)
3. ✅ Upload an image
4. ✅ Select bottle size (for plastics/glass)
5. ✅ Add location (optional)
6. ✅ Add contact phone (optional)
7. ✅ Submit the listing
8. ✅ Verify it appears on the marketplace

### As a Buyer:
1. ✅ Browse listings
2. ✅ Use search to find specific items
3. ✅ Filter by category
4. ✅ Sort by price
5. ✅ Click "View Details" on a card
6. ✅ See seller contact information

---

## 🎯 Next Steps (Optional Enhancements)

You can add these features later:
1. **Order System** - Allow buyers to place orders
2. **Chat System** - Buyer-seller messaging
3. **Ratings & Reviews** - Rate sellers
4. **Payment Integration** - Online payments
5. **Delivery Tracking** - Track orders
6. **Favorites** - Save favorite listings
7. **Notifications** - Alert sellers of new orders

---

## 🐛 Troubleshooting

### Issue: Page shows blank
**Solution**: Make sure you ran the SQL schema in Supabase

### Issue: Can't create listings
**Solution**: Check that you're logged in and RLS policies are active

### Issue: Images not uploading
**Solution**: Verify Supabase Storage is configured (you already have this working)

### Issue: Location not working
**Solution**: The LocationAutocomplete uses Nominatim API (free, no key needed)

---

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify Supabase connection
3. Ensure all files are saved
4. Restart the dev server

---

## 🎉 Summary

You now have a **fully functional Recyclables Marketplace** that:
- ✅ Looks beautiful (replica of your homepage design)
- ✅ Uses your existing image upload system
- ✅ Integrates with Supabase
- ✅ Has real-time updates
- ✅ Is mobile responsive
- ✅ Includes search, filters, and sorting
- ✅ Has proper security (RLS policies)
- ✅ Supports multiple recyclable categories
- ✅ Includes bottle size options for plastics

**Just run the SQL schema in Supabase and you're ready to go!** 🚀
