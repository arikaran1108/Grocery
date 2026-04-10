export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  unit: string;
  description: string;
  rating: number;
  inStock: boolean;
}

export const categories = [
  { id: "fruits", name: "Fruits", emoji: "🍎" },
  { id: "vegetables", name: "Vegetables", emoji: "🥦" },
  { id: "dairy", name: "Dairy & Eggs", emoji: "🥛" },
  { id: "bakery", name: "Bakery", emoji: "🍞" },
  { id: "meat", name: "Meat & Fish", emoji: "🥩" },
  { id: "beverages", name: "Beverages", emoji: "🧃" },
  { id: "snacks", name: "Snacks", emoji: "🍿" },
  { id: "pantry", name: "Pantry", emoji: "🫙" },
];

export const products: Product[] = [
  { id: "1", name: "Fresh Organic Bananas", price: 49, originalPrice: 69, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400", category: "fruits", unit: "1 bunch", description: "Sweet and perfectly ripe organic bananas", rating: 4.8, inStock: true },
  { id: "2", name: "Red Apples", price: 149, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400", category: "fruits", unit: "1 kg", description: "Crispy and juicy red apples", rating: 4.6, inStock: true },
  { id: "3", name: "Avocados", price: 199, originalPrice: 299, image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400", category: "fruits", unit: "3 pack", description: "Perfectly ripe Hass avocados", rating: 4.7, inStock: true },
  { id: "4", name: "Fresh Strawberries", price: 249, image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400", category: "fruits", unit: "250g", description: "Sweet and fragrant strawberries", rating: 4.9, inStock: true },
  { id: "5", name: "Organic Broccoli", price: 89, image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400", category: "vegetables", unit: "1 head", description: "Fresh organic broccoli crowns", rating: 4.5, inStock: true },
  { id: "6", name: "Baby Spinach", price: 59, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400", category: "vegetables", unit: "200g", description: "Tender baby spinach leaves", rating: 4.6, inStock: true },
  { id: "7", name: "Cherry Tomatoes", price: 79, image: "https://images.unsplash.com/photo-1546470427-e26264be0b11?w=400", category: "vegetables", unit: "250g", description: "Sweet vine-ripened cherry tomatoes", rating: 4.7, inStock: true },
  { id: "8", name: "Carrots", price: 39, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400", category: "vegetables", unit: "500g", description: "Fresh crunchy carrots", rating: 4.4, inStock: true },
  { id: "9", name: "Whole Milk", price: 68, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400", category: "dairy", unit: "1 liter", description: "Farm-fresh whole milk", rating: 4.5, inStock: true },
  { id: "10", name: "Free Range Eggs", price: 99, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400", category: "dairy", unit: "12 pack", description: "Organic free-range eggs", rating: 4.8, inStock: true },
  { id: "11", name: "Greek Yogurt", price: 159, originalPrice: 199, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400", category: "dairy", unit: "500g", description: "Creamy Greek-style yogurt", rating: 4.6, inStock: true },
  { id: "12", name: "Sourdough Bread", price: 129, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400", category: "bakery", unit: "1 loaf", description: "Artisan sourdough bread", rating: 4.9, inStock: true },
  { id: "13", name: "Croissants", price: 179, image: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400", category: "bakery", unit: "4 pack", description: "Buttery French croissants", rating: 4.7, inStock: true },
  { id: "14", name: "Chicken Breast", price: 249, image: "https://images.unsplash.com/photo-1604503468506-a8da13d82571?w=400", category: "meat", unit: "500g", description: "Skinless chicken breast fillets", rating: 4.5, inStock: true },
  { id: "15", name: "Atlantic Salmon", price: 599, originalPrice: 749, image: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400", category: "meat", unit: "300g", description: "Fresh Atlantic salmon fillets", rating: 4.8, inStock: true },
  { id: "16", name: "Orange Juice", price: 119, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400", category: "beverages", unit: "1 liter", description: "Freshly squeezed orange juice", rating: 4.6, inStock: true },
  { id: "17", name: "Mixed Nuts", price: 349, image: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=400", category: "snacks", unit: "300g", description: "Premium roasted mixed nuts", rating: 4.7, inStock: true },
  { id: "18", name: "Extra Virgin Olive Oil", price: 499, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400", category: "pantry", unit: "500ml", description: "Cold-pressed extra virgin olive oil", rating: 4.9, inStock: true },
];
