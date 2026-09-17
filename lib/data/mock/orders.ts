export type OrderStatus = "Pending" | "Confirmed" | "Processing" | "Ready" | "Delivered" | "Cancelled";
export type PaymentStatus = "Paid" | "Pending Payment" | "Refunded";

export type OrderItem = {
  productSlug: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  deliveryFee: number;
  deliveryMethod: "Delivery" | "Pickup";
  address: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
};

export const orders: Order[] = [
  {
    id: "kf-1058",
    orderNumber: "KF-1058",
    customerId: "cust-002",
    customerName: "Kwame Addo",
    date: "2026-08-18",
    items: [
      { productSlug: "fresh-mangoes", name: "Fresh Mangoes", quantity: 20, unitPrice: 12 },
      { productSlug: "dried-maize", name: "Dried Maize", quantity: 1, unitPrice: 220 },
    ],
    deliveryFee: 25,
    deliveryMethod: "Delivery",
    address: "12 Adum Street, Nkawkaw",
    paymentStatus: "Paid",
    status: "Processing",
  },
  {
    id: "kf-1057",
    orderNumber: "KF-1057",
    customerId: "cust-001",
    customerName: "Akosua Mensah",
    date: "2026-08-18",
    items: [
      { productSlug: "fresh-mangoes", name: "Fresh Mangoes", quantity: 10, unitPrice: 12 },
    ],
    deliveryFee: 0,
    deliveryMethod: "Pickup",
    address: "Farm Pickup — Klantis Farms",
    paymentStatus: "Paid",
    status: "Ready",
  },
  {
    id: "kf-1056",
    orderNumber: "KF-1056",
    customerId: "cust-003",
    customerName: "Abena Darko",
    date: "2026-08-17",
    items: [
      { productSlug: "raw-cashew-nuts", name: "Raw Cashew Nuts", quantity: 5, unitPrice: 28 },
      { productSlug: "fresh-yams", name: "Fresh Yams", quantity: 8, unitPrice: 8 },
    ],
    deliveryFee: 18,
    deliveryMethod: "Delivery",
    address: "Bawjiase Road, Akim Oda",
    paymentStatus: "Paid",
    status: "Delivered",
  },
  {
    id: "kf-1055",
    orderNumber: "KF-1055",
    customerId: "cust-004",
    customerName: "Yaw Boateng",
    date: "2026-08-16",
    items: [
      { productSlug: "fresh-mangoes-sliced", name: "Fresh Mangoes — Sliced Pack", quantity: 4, unitPrice: 15 },
    ],
    deliveryFee: 15,
    deliveryMethod: "Delivery",
    address: "Zongo Junction, Koforidua",
    paymentStatus: "Pending Payment",
    status: "Pending",
  },
  {
    id: "kf-1054",
    orderNumber: "KF-1054",
    customerId: "cust-002",
    customerName: "Kwame Addo",
    date: "2026-08-14",
    items: [
      { productSlug: "dried-maize", name: "Dried Maize", quantity: 2, unitPrice: 220 },
    ],
    deliveryFee: 30,
    deliveryMethod: "Delivery",
    address: "12 Adum Street, Nkawkaw",
    paymentStatus: "Refunded",
    status: "Cancelled",
  },
];

export function orderSubtotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function orderTotal(order: Order): number {
  return orderSubtotal(order) + order.deliveryFee;
}
