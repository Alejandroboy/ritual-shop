import {
  OrderStatusEnum,
  MaterialEnum,
  ShapeEnum,
  CoverageEnum,
  ColorModeEnum,
  Role,
  OrientationEnum,
  HolePatternEnum,
  FinishEnum,
  ApprovalStage,
  InvoiceStatusEnum,
} from '@types';

export const orderStatusLabels = {
  [OrderStatusEnum.CANCELLED]: 'Отменен',
  [OrderStatusEnum.DRAFT]: 'Черновик',
  [OrderStatusEnum.ACCEPTED]: 'Принят',
  [OrderStatusEnum.IN_PROGRESS]: 'В работе',
  [OrderStatusEnum.APPROVAL]: 'Согласование',
  [OrderStatusEnum.READY]: 'Готов',
  [OrderStatusEnum.COMPLETED]: 'Отправлен',
} satisfies Record<OrderStatusEnum, string>;

export const invoiceStatusLabel = {
  [InvoiceStatusEnum.PARTIAL]: 'Оплачен частично',
  [InvoiceStatusEnum.PAID]: 'Оплачен',
  [InvoiceStatusEnum.UNPAID]: 'Не оплачен',
} satisfies Record<InvoiceStatusEnum, string>;

export const materialLabels = {
  [MaterialEnum.BLACK_CERAMIC_GRANITE]: 'Черный керамогранит',
  [MaterialEnum.WHITE_CERAMIC_GRANITE]: 'Белый керамогранит',
  [MaterialEnum.CERMET]: 'Металлокерамика',
  [MaterialEnum.GLASS]: 'Стекло',
  [MaterialEnum.ENGRAVING]: 'Гравировка',
  [MaterialEnum.GROWTH_PHOTOCERAMICS]: 'Ростовая фотокерамика',
} satisfies Record<MaterialEnum, string>;

export const shapeLabels = {
  [ShapeEnum.ARCH]: 'Арка',
  [ShapeEnum.OVAL]: 'Овал',
  [ShapeEnum.HEART]: 'Сердце',
  [ShapeEnum.STAR]: 'Звезда',
  [ShapeEnum.RECTANGLE]: 'Прямоугольник',
} satisfies Record<ShapeEnum, string>;

export const coverageLabels = {
  [CoverageEnum.FULL_WRAP]: 'Полная затяжка',
  [CoverageEnum.NORMAL]: 'Бен затяжки',
} satisfies Record<CoverageEnum, string>;
export const colorModeLabels = {
  [ColorModeEnum.COLOR]: 'Цветной',
  [ColorModeEnum.BW]: 'Черно-белый',
} satisfies Record<ColorModeEnum, string>;
export const holePatternLabels = {
  [HolePatternEnum.NONE]: 'Без отверстий',
  [HolePatternEnum.FOUR_CORNERS]: '4 отверстия по углам',
  [HolePatternEnum.TWO_HORIZONTAL]: '2 отверстия горизонтально',
  [HolePatternEnum.TWO_VERTICAL]: '2 отверстия вертикально',
} satisfies Record<HolePatternEnum, string>;
export const finishLabels = {
  [FinishEnum.GLOSS]: 'Глянец',
  [FinishEnum.MATTE]: 'Матовый',
} satisfies Record<FinishEnum, string>;

export const roleLabels = {
  [Role.ADMIN]: 'Администратор',
  [Role.ADMIN_GOD]: 'Админ-бог',
  [Role.CUSTOMER]: 'Пользователь',
  [Role.MANAGER]: 'Менеджер',
} satisfies Record<Role, string>;

export const orientationLabels = {
  [OrientationEnum.HORIZONTAL]: 'Горизонтально',
  [OrientationEnum.VERTICAL]: 'Вертикально',
} satisfies Record<OrientationEnum, string>;

export const approvalStageLabels = {
  [ApprovalStage.APPROVED]: 'Согласовано',
  [ApprovalStage.NOT_STARTED]: 'Согласование не начато',
  [ApprovalStage.IN_PROGRESS]: 'Согласование в процессе',
} satisfies Record<ApprovalStage, string>;

export const labelOf =
  <T extends string>(map: Record<T, string>) =>
  (value: T) =>
    map[value];
