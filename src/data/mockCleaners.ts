export interface Cleaner {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  specialties: string[];
  priceRange: string;
  availability: string;
  phone: string;
  experience: string;
}

export const MOCK_CLEANERS: Cleaner[] = [
  {
    id: 1,
    name: "Calabar Clean Team",
    rating: 4.8,
    reviews: 127,
    specialties: ["Deep Cleaning", "Move-in/out", "Office Cleaning"],
    priceRange: "₦5,000 - ₦15,000",
    availability: "Available Today",
    phone: "+234 803 123 4567",
    experience: "5 years"
  },
  {
    id: 2,
    name: "Sparkle Pro Services",
    rating: 4.9,
    reviews: 203,
    specialties: ["Residential", "Commercial", "Post-Construction"],
    priceRange: "₦7,000 - ₦20,000",
    availability: "Available Tomorrow",
    phone: "+234 805 987 6543",
    experience: "8 years"
  },
  {
    id: 3,
    name: "EcoClean Calabar",
    rating: 4.7,
    reviews: 89,
    specialties: ["Eco-Friendly", "Deep Cleaning", "Carpet Cleaning"],
    priceRange: "₦6,000 - ₦18,000",
    availability: "Available Today",
    phone: "+234 807 456 7890",
    experience: "3 years"
  },
  {
    id: 4,
    name: "Quick Waste Pickup",
    rating: 4.6,
    reviews: 156,
    specialties: ["Waste Removal", "Bulk Pickup", "Construction Debris"],
    priceRange: "₦3,000 - ₦25,000",
    availability: "24/7 Available",
    phone: "+234 809 234 5678",
    experience: "6 years"
  },
  {
    id: 5,
    name: "Premium Clean Co.",
    rating: 5.0,
    reviews: 45,
    specialties: ["Luxury Homes", "Event Cleanup", "Sanitization"],
    priceRange: "₦10,000 - ₦30,000",
    availability: "By Appointment",
    phone: "+234 802 345 6789",
    experience: "10 years"
  }
];
