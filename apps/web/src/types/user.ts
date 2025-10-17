export type User = {
  userId: string;
  email: string;
  name: string;
  phone: string;
  customerOrders: customerOrder[] | [];
};

type customerOrder = {
  createdAt: string;
  id: string;
  orderStatus: string;
  totalMinor: number;
  items: customerOrderItem[] | [];
};

type customerOrderItem = {
  assets: customerOrderItemAsset[] | [];
  backgroundId: number;
  comment: string | null;
  createdAt: string;
  finish: string | null;
  frameId: string | null;
  holePattern: string;
  id: string;
  orderId: string;
  sizeId: string;
  templateCode: string;
  templateId: string;
  templateLabel: string;
  unitPriceMinor: number;
  updatedAt: string;
};
type customerOrderItemAsset = {
  createdAt: string;
  filename: string;
  id: string;
  itemId: string;
  kind: string;
  mime: string;
  note: string | null;
  primary: boolean;
  size: number;
  url: string;
};
