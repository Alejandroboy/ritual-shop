export enum MaterialEnum {
  CERMET = 'CERMET',
  WHITE_CERAMIC_GRANITE = 'WHITE_CERAMIC_GRANITE',
  BLACK_CERAMIC_GRANITE = 'BLACK_CERAMIC_GRANITE',
  GLASS = 'GLASS',
  GROWTH_PHOTOCERAMICS = 'GROWTH_PHOTOCERAMICS',
  ENGRAVING = 'ENGRAVING',
}

export enum ShapeEnum {
  RECTANGLE = 'RECTANGLE',
  OVAL = 'OVAL',
  ARCH = 'ARCH',
  STAR = 'STAR',
  HEART = 'HEART',
}

export enum OrientationEnum {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL',
}

export enum ColorModeEnum {
  BW = 'BW',
  COLOR = 'COLOR',
}

export enum CoverageEnum {
  NORMAL = 'NORMAL',
  FULL_WRAP = 'FULL_WRAP',
}

export enum HolePatternEnum {
  NONE = 'NONE',
  TWO_HORIZONTAL = 'TWO_HORIZONTAL',
  TWO_VERTICAL = 'TWO_VERTICAL',
  FOUR_CORNERS = 'FOUR_CORNERS',
}

export enum FinishEnum {
  MATTE = 'MATTE',
  GLOSS = 'GLOSS',
}
export enum Role {
  ADMIN_GOD = 'ADMIN_GOD',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CUSTOMER = 'CUSTOMER',
}

export enum OrderStatusEnum {
  CANCELLED = 'CANCELLED',
  DRAFT = 'DRAFT',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVAL = 'APPROVAL',
  SENT = 'SENT',
  READY = 'READY',
}

export enum ApprovalStage {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
}
