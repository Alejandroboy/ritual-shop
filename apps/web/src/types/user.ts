export type User = {
  id: string;
  userId: string;
  email: string;
  name: string;
  phone: string;
  customerOrders: CustomerOrder[] | [];
};

export type CustomerOrder = {
  orderNumber: string;
  createdAt: string;
  includedInInvoice: boolean;
  invoiceName: string;
  invoiceId: string;
  id: string;
  orderStatus: string;
  totalMinor: number;
  items: CustomerOrderItem;
};

export type CustomerOrderItem = {
  assets: CustomerOrderItemAsset[] | [];
  backgroundId: number;
  comment: string | null;
  createdAt: string;
  finish: string | null;
  frameId: string | null;
  holePattern: string;
  id: string;
  orderId: string;
  sizeId: string;
  template: {
    label: string;
    fullTitle: string;
    material: string;
    allowedSizes: {
      sizeId: string;
      price: number;
    }[];
  };
  size: {
    id: string;
    label: string;
  };
  background: {
    name: string;
  };
  frame: {
    name: string;
  };
  userActionNeeded: boolean;
  templateCode: string;
  templateId: string;
  templateLabel: string;
  unitPriceMinor: number;
  updatedAt: string;
  dateOfBirth: string;
  dateOfDeath: string;
  firstName: string;
  middleName: string;
  lastName: string;
  approveNeeded: boolean;
  approved: boolean;
  approvalStage: string;
  skuCode: string;
};

export type CustomerOrderItemAsset = {
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
