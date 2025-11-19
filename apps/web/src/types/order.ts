import { ApprovalStage, OrderStatusEnum } from './enums';

export type OrderItemDetails = {
  comment?: string;
  id: string;
  templateLabel: string;
  templateCode: string;
  backgroundId: string;
  frameId: string;
  dateOfBirth: string;
  dateOfDeath: string;
  size: {
    label: string;
  };
  sizeLabel: string;
  firstName: string;
  middleName: string;
  lastName: string;
  assets: OrderItemAsset[];
  retouchNeeded: boolean;
  approveNeeded: boolean;
  approvalStage: ApprovalStage;
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
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  orderNumber: string;
};
