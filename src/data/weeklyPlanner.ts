export interface WeeklyPlanItem {
  id: string;
  productId: string;
  quantity: number;
  day?: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday" | "All Week";
  notes?: string;
}

export interface WeeklyPlanTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge: string;
  items: { productId: string; quantity: number; day?: WeeklyPlanItem["day"] }[];
}

export const INITIAL_WEEKLY_TEMPLATES: WeeklyPlanTemplate[] = [
  {
    id: "family-essentials",
    name: "👨‍👩‍👧‍👦 Family Weekly Essentials",
    description: "Standard daily basket for home cooking, morning breakfast, and fresh fruits.",
    icon: "🥛",
    badge: "Most Popular",
    items: [
      { productId: "25", quantity: 2, day: "All Week" }, // Milk
      { productId: "26", quantity: 1, day: "Monday" }, // Eggs
      { productId: "34", quantity: 2, day: "Tuesday" }, // Bread
      { productId: "1", quantity: 2, day: "All Week" }, // Bananas
      { productId: "17", quantity: 1, day: "Wednesday" }, // Potatoes
      { productId: "18", quantity: 1, day: "Wednesday" }, // Onions
      { productId: "15", quantity: 1, day: "Friday" }, // Cherry Tomatoes
      { productId: "2", quantity: 1, day: "Saturday" }, // Apples
    ],
  },
  {
    id: "fitness-diet",
    name: "🥗 Healthy Diet & Fitness Plan",
    description: "High protein, greens, and antioxidant fruits curated for health and vitality.",
    icon: "🥑",
    badge: "Clean Eating",
    items: [
      { productId: "26", quantity: 2, day: "All Week" }, // Brown Eggs
      { productId: "14", quantity: 2, day: "Monday" }, // Baby Spinach
      { productId: "13", quantity: 1, day: "Wednesday" }, // Broccoli
      { productId: "3", quantity: 1, day: "Thursday" }, // Hass Avocados
      { productId: "27", quantity: 2, day: "All Week" }, // Greek Yogurt
      { productId: "9", quantity: 1, day: "Saturday" }, // Oranges
    ],
  },
  {
    id: "bachelor-quick",
    name: "⚡ Student & Quick Essentials",
    description: "Hassle-free grocery staples for fast breakfasts and quick weekday meals.",
    icon: "🍌",
    badge: "Budget Friendly",
    items: [
      { productId: "1", quantity: 2, day: "All Week" }, // Bananas
      { productId: "25", quantity: 2, day: "All Week" }, // Milk
      { productId: "34", quantity: 1, day: "Monday" }, // Bread
      { productId: "29", quantity: 1, day: "Tuesday" }, // Butter
      { productId: "17", quantity: 1, day: "Thursday" }, // Potatoes
      { productId: "31", quantity: 1, day: "Friday" }, // Curd
    ],
  },
];
