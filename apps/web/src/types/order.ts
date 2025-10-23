export type OrderItemDetails = {
  comment?: string;
  id: string;
  templateLabel: string;
  templateCode: string;
  backgroundId: string;
  frameId: string;
  size: {
    label: string;
  };
  assets: OrderItemAsset[];
};

export type OrderItemAsset = {
  id: string;
  originalName: string;
  size: number;
};

export type Order = {
  number: number;
  orderStatus: string;
  id: string;
  createdAt: Date;
};
