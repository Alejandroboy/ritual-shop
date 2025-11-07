import { OrderStatusEnum } from './enums';

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
  retouchNeeded: boolean;
  approveNeeded: boolean;
};

export type OrderItemAsset = {
  id: string;
  originalName: string;
  size: number;
};

export type Order = {
  number: number;
  orderStatus: OrderStatusEnum;
  id: string;
  createdAt: Date;
};
