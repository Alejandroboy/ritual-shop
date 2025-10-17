export type Id = string;

export type Me = { id: Id; email: string; name?: string } | null;

export type Template = { id: number; code: string; label: string };
export type TemplateFilter = {
  q?: string;
  sizeId?: number;
  frameId?: number;
  backgroundId?: number;
  holePattern?: string;
};

export type OrderItem = { id: Id; orderId: Id };

export type PresignResp = {
  url: string;
  bucket: string;
  key: string;
  requiredHeaders?: Record<string, string>;
};
