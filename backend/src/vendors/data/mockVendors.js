/**
 * src/vendors/data/mockVendors.js
 * Public vendor and menu data ported from prototype.
 * Credentials (passwords, tokens, usernames) are strictly excluded.
 */

const mockVendors = [
  // ── NEW DELHI (NDLS) ──────────────────────────────────────────────
  {
    id: "v-ndls-1",
    name: "Moti Mahal Express",
    stationCode: "NDLS",
    stationName: "New Delhi",
    category: "North Indian",
    rating: 4.5,
    deliveryTime: "15–20 min",
    isVeg: false,
    tags: ["Bestseller", "Quick Delivery"],
    image: null,
    menu: [
      { id: "m1", name: "Butter Chicken + 2 Roti", price: 180, isVeg: false, popular: true },
      { id: "m2", name: "Dal Makhani + Rice",       price: 140, isVeg: true,  popular: false },
      { id: "m3", name: "Paneer Tikka (6 pcs)",      price: 160, isVeg: true,  popular: true },
      { id: "m4", name: "Chicken Biryani",           price: 200, isVeg: false, popular: false },
    ],
  },
  {
    id: "v-ndls-2",
    name: "Delhi Chaat Corner",
    stationCode: "NDLS",
    stationName: "New Delhi",
    category: "Snacks & Street Food",
    rating: 4.2,
    deliveryTime: "10–15 min",
    isVeg: true,
    tags: ["Pure Veg"],
    image: null,
    menu: [
      { id: "m5",  name: "Aloo Tikki Chaat",   price: 60,  isVeg: true, popular: true  },
      { id: "m6",  name: "Pani Puri (8 pcs)",  price: 50,  isVeg: true, popular: true  },
      { id: "m7",  name: "Dahi Bhalla",         price: 70,  isVeg: true, popular: false },
      { id: "m8",  name: "Samosa (2 pcs)",      price: 40,  isVeg: true, popular: false },
    ],
  },

  // ── AGRA CANTT (AGC) ─────────────────────────────────────────────
  {
    id: "v-agc-1",
    name: "Taj Bhojanaya",
    stationCode: "AGC",
    stationName: "Agra Cantt",
    category: "Thali & Meals",
    rating: 4.3,
    deliveryTime: "10–15 min",
    isVeg: true,
    tags: ["Pure Veg", "Value Meals"],
    image: null,
    menu: [
      { id: "m9",  name: "Full Veg Thali",       price: 130, isVeg: true,  popular: true  },
      { id: "m10", name: "Puri Sabzi (4 pcs)",   price: 80,  isVeg: true,  popular: false },
      { id: "m11", name: "Petha Box (200g)",      price: 90,  isVeg: true,  popular: true  },
      { id: "m12", name: "Lassi (large)",         price: 50,  isVeg: true,  popular: false },
    ],
  },

  // ── LUCKNOW (LKO) ────────────────────────────────────────────────
  {
    id: "v-lko-1",
    name: "Tunday Kababi Stall",
    stationCode: "LKO",
    stationName: "Lucknow",
    category: "Awadhi",
    rating: 4.7,
    deliveryTime: "15–20 min",
    isVeg: false,
    tags: ["Bestseller", "Heritage Brand"],
    image: null,
    menu: [
      { id: "m13", name: "Galouti Kebab (4 pcs) + Paratha", price: 210, isVeg: false, popular: true  },
      { id: "m14", name: "Shami Kebab (4 pcs)",             price: 150, isVeg: false, popular: true  },
      { id: "m15", name: "Biryani (Lucknowi)",              price: 190, isVeg: false, popular: false },
      { id: "m16", name: "Roomali Roti (2 pcs)",            price: 40,  isVeg: true,  popular: false },
    ],
  },
  {
    id: "v-lko-2",
    name: "Chowk Chai House",
    stationCode: "LKO",
    stationName: "Lucknow",
    category: "Beverages & Snacks",
    rating: 4.1,
    deliveryTime: "5–10 min",
    isVeg: true,
    tags: ["Pure Veg", "Quick"],
    image: null,
    menu: [
      { id: "m17", name: "Masala Chai (2 cups)",     price: 40,  isVeg: true, popular: true  },
      { id: "m18", name: "Imarti + Rabri",            price: 80,  isVeg: true, popular: true  },
      { id: "m19", name: "Sheermal (2 pcs)",          price: 60,  isVeg: true, popular: false },
      { id: "m20", name: "Cold Coffee",               price: 70,  isVeg: true, popular: false },
    ],
  },

  // ── HOWRAH (HWH) ─────────────────────────────────────────────────
  {
    id: "v-hwh-1",
    name: "Bong Bites",
    stationCode: "HWH",
    stationName: "Howrah",
    category: "Bengali",
    rating: 4.4,
    deliveryTime: "15–20 min",
    isVeg: false,
    tags: ["Local Favourite"],
    image: null,
    menu: [
      { id: "m21", name: "Fish Curry + Rice",     price: 170, isVeg: false, popular: true  },
      { id: "m22", name: "Egg Roll (2 pcs)",      price: 80,  isVeg: false, popular: true  },
      { id: "m23", name: "Mishti Doi (cup)",       price: 50,  isVeg: true,  popular: false },
      { id: "m24", name: "Veg Kati Roll",          price: 70,  isVeg: true,  popular: false },
    ],
  },

  // ── PATNA (PNBE) ─────────────────────────────────────────────────
  {
    id: "v-pnbe-1",
    name: "Patliputra Kitchen",
    stationCode: "PNBE",
    stationName: "Patna",
    category: "Bihari Thali",
    rating: 4.2,
    deliveryTime: "10–15 min",
    isVeg: false,
    tags: ["Homestyle"],
    image: null,
    menu: [
      { id: "m25", name: "Litti Chokha (4 pcs)", price: 100, isVeg: true,  popular: true  },
      { id: "m26", name: "Non-Veg Thali",         price: 160, isVeg: false, popular: true  },
      { id: "m27", name: "Sattu Sharbat",          price: 40,  isVeg: true,  popular: false },
      { id: "m28", name: "Khaja (sweets box)",     price: 80,  isVeg: true,  popular: false },
    ],
  },

  // ── MUMBAI CENTRAL (MMCT / BCT) ──────────────────────────────────
  {
    id: "v-mmct-1",
    name: "Vada Pav Brothers",
    stationCode: "MMCT",
    stationName: "Mumbai Central",
    category: "Mumbai Street",
    rating: 4.6,
    deliveryTime: "5–10 min",
    isVeg: true,
    tags: ["Pure Veg", "Iconic"],
    image: null,
    menu: [
      { id: "m29", name: "Vada Pav (2 pcs)",       price: 40,  isVeg: true, popular: true  },
      { id: "m30", name: "Misal Pav",               price: 90,  isVeg: true, popular: true  },
      { id: "m31", name: "Pav Bhaji",               price: 110, isVeg: true, popular: false },
      { id: "m32", name: "Cutting Chai (2 cups)",   price: 30,  isVeg: true, popular: false },
    ],
  },
  {
    id: "v-bct-1",
    name: "Vada Pav Brothers",
    stationCode: "BCT",
    stationName: "Mumbai Central",
    category: "Mumbai Street",
    rating: 4.6,
    deliveryTime: "5–10 min",
    isVeg: true,
    tags: ["Pure Veg", "Iconic"],
    image: null,
    menu: [
      { id: "m29b", name: "Vada Pav (2 pcs)",     price: 40,  isVeg: true, popular: true  },
      { id: "m30b", name: "Misal Pav",             price: 90,  isVeg: true, popular: true  },
      { id: "m31b", name: "Pav Bhaji",             price: 110, isVeg: true, popular: false },
      { id: "m32b", name: "Cutting Chai (2 cups)", price: 30,  isVeg: true, popular: false },
    ],
  },

  // ── VADODARA (BRC) ───────────────────────────────────────────────
  {
    id: "v-brc-1",
    name: "Sev Usal House",
    stationCode: "BRC",
    stationName: "Vadodara",
    category: "Gujarati Snacks",
    rating: 4.3,
    deliveryTime: "10–15 min",
    isVeg: true,
    tags: ["Pure Veg"],
    image: null,
    menu: [
      { id: "m33", name: "Sev Usal",           price: 70,  isVeg: true, popular: true  },
      { id: "m34", name: "Gujarati Thali",      price: 150, isVeg: true, popular: true  },
      { id: "m35", name: "Fafda Jalebi",        price: 80,  isVeg: true, popular: false },
      { id: "m36", name: "Masala Buttermilk",   price: 40,  isVeg: true, popular: false },
    ],
  },
];

module.exports = { mockVendors };
