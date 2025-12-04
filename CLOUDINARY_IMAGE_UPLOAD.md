# 📸 Image Upload Configuration - Cloudinary

## ✅ Updated: ImageUploader Component

The `ImageUploader` component has been updated to use your **Cloudinary API** instead of Supabase Storage.

---

## 🔧 Configuration Details

### **Endpoint:**
```
https://clean-cal-api.vercel.app/upload
```

### **Method:**
```
POST
```

### **Form Field Name:**
```
image
```

### **Request Format:**
```typescript
const formData = new FormData()
formData.append('image', file)

const response = await fetch('https://clean-cal-api.vercel.app/upload', {
  method: 'POST',
  body: formData,
})
```

### **Expected Response:**
```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/abc123.jpg"
}
```

---

## 📁 Updated File

**File:** `src/components/common/ImageUploader.tsx`

**Changes Made:**
1. ✅ Removed Supabase Storage upload logic
2. ✅ Added Cloudinary API integration
3. ✅ Uses FormData with field name `image`
4. ✅ Expects JSON response with `url` field
5. ✅ Removed unused Supabase import

---

## 🎯 How It Works

### **Upload Flow:**

1. **User selects image** → File validation (type & size)
2. **Create FormData** → Append file with name `image`
3. **POST to Cloudinary API** → `https://clean-cal-api.vercel.app/upload`
4. **Receive response** → Extract `url` from JSON
5. **Store URL** → Save Cloudinary URL to Supabase database

### **Validation:**
- ✅ File type: Must be an image
- ✅ File size: Maximum 5MB
- ✅ Error handling: User-friendly alerts

---

## 🔄 Where It's Used

The `ImageUploader` component is now used in:

1. **Report Creation** - When users report waste issues
2. **Recyclables Marketplace** - When users list items for sale
3. **Any other features** - That use the ImageUploader component

All of these now upload to **Cloudinary** and store the returned URL in Supabase.

---

## 📊 Data Flow

```
User selects image
    ↓
ImageUploader validates file
    ↓
FormData created with 'image' field
    ↓
POST to https://clean-cal-api.vercel.app/upload
    ↓
Cloudinary processes and stores image
    ↓
API returns { url: "cloudinary-url" }
    ↓
URL stored in Supabase database
    ↓
Image displayed using Cloudinary URL
```

---

## 🧪 Testing

To test the image upload:

1. Go to `/recyclables`
2. Click "Sell Recyclables"
3. Click "Upload Image"
4. Select an image file
5. Wait for upload to complete
6. Verify the Cloudinary URL is returned
7. Check that the image preview displays correctly

---

## 🐛 Troubleshooting

### Issue: Upload fails
**Solution:** Check that your Cloudinary API endpoint is running and accessible

### Issue: No URL returned
**Solution:** Verify the API response includes a `url` field in the JSON

### Issue: Image doesn't display
**Solution:** Check that the Cloudinary URL is publicly accessible

---

## 📝 API Response Format

Your Cloudinary API should return:

```json
{
  "url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/filename.jpg"
}
```

If your API returns a different format, you may need to adjust the response handling in `ImageUploader.tsx` (line 53-58).

---

## ✨ Summary

- ✅ **Endpoint:** `https://clean-cal-api.vercel.app/upload`
- ✅ **Field Name:** `image`
- ✅ **Method:** POST with FormData
- ✅ **Response:** JSON with `url` field
- ✅ **Storage:** Cloudinary URL saved to Supabase
- ✅ **Used By:** Reports, Recyclables, and all features using ImageUploader

Your recyclables marketplace now uses the same Cloudinary upload system as the rest of your app! 🎉
