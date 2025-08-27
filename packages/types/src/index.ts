export type OrderStatus =
  | 'PRINYAT'
  | 'V_RABOTE'
  | 'SOGLASOVANIE'
  | 'OTPRAVLEN'
  | 'GOTOV';
export interface Product {
  id: string;
  title: string;
  price: number;
}
