export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  description: string;
}

export const initialCoupons: Coupon[] = [
  {
    code: "FRESH50",
    discountType: "fixed",
    discountValue: 50,
    minOrderValue: 299,
    description: "Flat ₹50 OFF on orders above ₹299",
  },
  {
    code: "WELCOME20",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 199,
    maxDiscount: 150,
    description: "20% OFF (up to ₹150) for your healthy grocery cart",
  },
  {
    code: "SUPER100",
    discountType: "fixed",
    discountValue: 100,
    minOrderValue: 599,
    description: "Flat ₹100 OFF on bulk grocery orders above ₹599",
  },
  {
    code: "FARMDEAL",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 399,
    maxDiscount: 200,
    description: "15% OFF (up to ₹200) on fresh fruits & vegetables",
  },
];
