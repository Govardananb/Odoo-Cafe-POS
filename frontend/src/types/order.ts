// src/types/order.ts

export type OrderStatus =
  | "draft"
  | "to_cook"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled";

export const isActiveOrder = (status: OrderStatus): boolean =>
  status !== "completed" && status !== "cancelled";

export interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
  };
  quantity: number;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber?: string;
  floorId?: string;
  floorName?: string;
  employeeId?: string;
  customerId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod?: string;
  paymentStatus: "unpaid" | "paid";
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}
