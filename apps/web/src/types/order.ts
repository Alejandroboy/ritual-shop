import { ApprovalStage, InvoiceStatusEnum, OrderStatusEnum } from './enums';

export type OrderItemDetails = {
  comment?: string;
  approved: boolean;
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
  background: {
    name: string;
  };
  frame: {
    name: string;
  };
  holePattern: string;
};

export type OrderItemAsset = {
  id: string;
  originalName: string;
  size: number;
  stage: string;
  contentType: string;
  primary: boolean;
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
  items: OrderItemDetails;
  includedInInvoice: boolean;
  invoice: {
    status: InvoiceStatusEnum;
  };
  invoiceName?: string;
};
