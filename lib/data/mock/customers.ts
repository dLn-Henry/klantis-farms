export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
};

export const customers: Customer[] = [
  {
    id: "cust-001",
    name: "Akosua Mensah",
    email: "akosua.mensah@example.com",
    phone: "+233 24 555 0142",
    location: "Koforidua",
    joinedDate: "2026-03-12",
    totalOrders: 8,
    totalSpent: 1240,
  },
  {
    id: "cust-002",
    name: "Kwame Addo",
    email: "kwame.addo@example.com",
    phone: "+233 20 555 0198",
    location: "Nkawkaw",
    joinedDate: "2026-01-25",
    totalOrders: 14,
    totalSpent: 3860,
  },
  {
    id: "cust-003",
    name: "Abena Darko",
    email: "abena.darko@example.com",
    phone: "+233 27 555 0071",
    location: "Akim Oda",
    joinedDate: "2026-05-02",
    totalOrders: 3,
    totalSpent: 410,
  },
  {
    id: "cust-004",
    name: "Yaw Boateng",
    email: "yaw.boateng@example.com",
    phone: "+233 26 555 0233",
    location: "Koforidua",
    joinedDate: "2026-06-18",
    totalOrders: 2,
    totalSpent: 265,
  },
];
