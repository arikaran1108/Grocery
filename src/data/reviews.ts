export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export const initialReviews: ProductReview[] = [
  {
    id: "REV-1",
    productId: "1", // Bananas
    userName: "Priya S.",
    rating: 5,
    title: "Super fresh and sweet!",
    comment: "The bananas arrived perfectly yellow with zero bruises. Highly recommended for daily smoothies!",
    date: "8 Feb 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-2",
    productId: "1",
    userName: "Karthik R.",
    rating: 4,
    title: "Good organic quality",
    comment: "Naturally sweet and wholesome. Fast delivery within 25 minutes.",
    date: "4 Feb 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-3",
    productId: "2", // Apples
    userName: "Ananya M.",
    rating: 5,
    title: "Crisp and juicy apples",
    comment: "Very crunchy and sweet Royal Gala apples. My kids loved them in their lunchbox.",
    date: "6 Feb 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-4",
    productId: "3", // Avocados
    userName: "Dev A.",
    rating: 5,
    title: "Perfect guacamole texture",
    comment: "Just the right ripeness. Made wonderful avocado toast for breakfast.",
    date: "7 Feb 2026",
    verifiedPurchase: true,
  },
  {
    id: "REV-5",
    productId: "5", // Alphonso Mangoes
    userName: "Ramesh Kumar",
    rating: 5,
    title: "Authentic Ratnagiri sweetness",
    comment: "Aroma filled the whole kitchen when unboxed! Absolutely heavenly taste.",
    date: "9 Feb 2026",
    verifiedPurchase: true,
  },
];
