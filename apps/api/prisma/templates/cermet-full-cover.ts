// ---------- Металлокерамика: «полная затяжка» (стр. 20–22) ----------
// TODO: при необходимости точно сопоставить коды с макетом каталога
import {
  sizeArchMetal,
  sizeHeart,
  sizesMetalFullWrap,
  sizesOvalHor,
  sizesOvalVert,
  type TemplateConfig,
} from './shared.ts';
import {
  ColorMode,
  Coverage,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';

const metalFullBasesHorizontal = ['T12', 'T13'];
const metalFullBasesVertical = ['T10', 'T11'];
const archMetalFullBases = ['A4', 'A5'];
const heartBasesFull = ['C4', 'C5'];
const metalFullOvalHorizontal = ['F14', 'F15'];
const metalFullOvalVertical = ['F10', 'F11'];

const PRICES_HOR: Record<string, number> = {
  '13×19': 1500,
  '17×22': 1800,
  '18×24': 2200,
  '20×30': 2600,
  '24×30': 2700,
};
const PRICES_VERT: Record<string, number> = {
  '13×19': 1500,
  '17×22': 1800,
  '18×24': 2200,
  '20×30': 2600,
  '24×30': 2700,
};
const PRICES_HOR_OVAL: Record<string, number> = {
  '13×19': 1500,
  '17×22': 1800,
  '18×24': 2200,
  '20×30': 2600,
  '24×30': 2700,
};
const PRICES_VERT_OVAL: Record<string, number> = {
  '13×19': 1500,
  '17×22': 1800,
  '18×24': 2200,
  '20×30': 2600,
  '24×30': 2700,
};
const PRICES_ARCH: Record<string, number> = {
  '17×24': 1800,
};
const PRICES_HEART: Record<string, number> = {
  '16×18': 1500,
};

const SIZE_HOLES_HOR: Record<string, HolePattern[]> = {
  '13×19': [HolePattern.TWO_HORIZONTAL],
  '17×22': [HolePattern.TWO_HORIZONTAL, HolePattern.NONE],
};
const SIZE_HOLES_VERT: Record<string, HolePattern[]> = {
  '13×19': [HolePattern.TWO_VERTICAL],
  '17×22': [HolePattern.TWO_VERTICAL, HolePattern.NONE],
};
const SIZE_HOLES_HOR_OVAL: Record<string, HolePattern[]> = {
  '9×12': [HolePattern.TWO_VERTICAL],
  '13×18': [
    HolePattern.TWO_HORIZONTAL,
    HolePattern.TWO_VERTICAL,
    HolePattern.NONE,
  ],
  '17×22': [HolePattern.TWO_VERTICAL, HolePattern.NONE],
  '21×27': [HolePattern.TWO_VERTICAL, HolePattern.NONE],
};
const SIZE_HOLES_VERT_OVAL: Record<string, HolePattern[]> = {
  '9×12': [HolePattern.TWO_HORIZONTAL],
  '13×18': [
    HolePattern.TWO_HORIZONTAL,
    HolePattern.TWO_VERTICAL,
    HolePattern.NONE,
  ],
  '17×22': [HolePattern.TWO_HORIZONTAL, HolePattern.NONE],
  '21×27': [HolePattern.TWO_HORIZONTAL, HolePattern.NONE],
};

export const metalFullTemplates: TemplateConfig[] = [
  ...metalFullOvalVertical.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('F', 'Ф'),
      fullTitle: `Вертикальный овал ${base.replace('F', 'Ф')} полное покрытие`,
      material: Material.CERMET,
      shape: Shape.OVAL,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.FULL_WRAP,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      perHolePrice: 0,
      basePrice: 0,
      sizeHolePatterns: SIZE_HOLES_VERT_OVAL,
      sizePrice: PRICES_VERT_OVAL,
      sizeLabels: sizesOvalVert,
      holePatterns: [
        HolePattern.NONE,
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
      ],
      backgroundCodes: [400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11],
      inscribed: index !== 0,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Вертикальный овал ${base.replace('F', 'Ф')}ц полное покрытие`,
      backgroundCodes: [
        400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25, 16,
        14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34, 35,
        36,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...metalFullOvalHorizontal.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('F', 'Ф'),
      fullTitle: `Горизонтальный овал ${base.replace('F', 'Ф')} полное покрытие`,
      material: Material.CERMET,
      shape: Shape.OVAL,
      orientation: Orientation.HORIZONTAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.FULL_WRAP,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      perHolePrice: 0,
      basePrice: 0,
      sizeHolePatterns: SIZE_HOLES_HOR_OVAL,
      sizePrice: PRICES_HOR_OVAL,
      sizeLabels: sizesOvalHor,
      holePatterns: [
        HolePattern.NONE,
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
      ],
      backgroundCodes: [400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11],
      inscribed: index !== 0,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Горизонтальный овал ${base.replace('F', 'Ф')}ц полное покрытие`,
      backgroundCodes: [
        400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25, 16,
        14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34, 35,
        36,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...metalFullBasesVertical.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('T', 'Т'),
      fullTitle: `Вертикальная табличка ${base.replace('T', 'Т')} полное покрытие`,
      material: Material.CERMET,
      shape: Shape.RECTANGLE,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.FULL_WRAP,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      perHolePrice: 0,
      basePrice: 0,
      sizeHolePatterns: SIZE_HOLES_VERT,
      singlePerson: base !== 'T13',
      sizePrice: PRICES_VERT,
      sizeLabels: sizesMetalFullWrap,
      holePatterns: [HolePattern.NONE, HolePattern.TWO_VERTICAL],
      backgroundCodes: [400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11],
      inscribed: index !== 0,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Вертикальная табличка ${bw.label}ц полное покрытие`,
      backgroundCodes: [
        400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25, 16,
        14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34, 35,
        36,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...metalFullBasesHorizontal.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('T', 'Т'),
      fullTitle: `Горизонтальная табличка ${base.replace('T', 'Т')} полное покрытие`,
      material: Material.CERMET,
      shape: Shape.RECTANGLE,
      orientation: Orientation.HORIZONTAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.FULL_WRAP,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      perHolePrice: 0,
      basePrice: 0,
      sizeHolePatterns: SIZE_HOLES_HOR,
      sizePrice: PRICES_HOR,
      sizeLabels: sizesMetalFullWrap,
      holePatterns: [HolePattern.NONE, HolePattern.TWO_HORIZONTAL],
      backgroundCodes: [400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11],
      inscribed: index !== 0,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Горизонтальная табличка ${bw.label}ц полное покрытие`,
      backgroundCodes: [
        400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25, 16,
        14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34, 35,
        36,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...archMetalFullBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('A', 'А'),
      fullTitle: `Фигурная табличка "арка" ${base.replace('A', 'А')} полное покрытие`,
      material: Material.CERMET,
      shape: Shape.ARCH,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.FULL_WRAP,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      perHolePrice: 0,
      basePrice: 0,
      sizePrice: PRICES_ARCH,
      sizeLabels: sizeArchMetal,
      holePatterns: [HolePattern.NONE, HolePattern.TWO_HORIZONTAL],
      backgroundCodes: [400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11],
      inscribed: index !== 0,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Фигурная табличка "арка" ${bw.label}ц полное покрытие`,
      backgroundCodes: [
        400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25, 16,
        14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34, 35,
        36,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...heartBasesFull.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('C', 'С'),
      fullTitle: `Фигурная табличка "сердце" ${base.replace('C', 'С')} полное покрытие`,
      material: Material.CERMET,
      shape: Shape.HEART,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.FULL_WRAP,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      perHolePrice: 0,
      basePrice: 0,
      sizePrice: PRICES_HEART,
      sizeLabels: sizeHeart,
      holePatterns: [HolePattern.NONE, HolePattern.TWO_VERTICAL],
      backgroundCodes: [400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11],
      inscribed: index !== 0,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Фигурная табличка "сердце" ${bw.label}ц полное покрытие`,
      backgroundCodes: [
        400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25, 16,
        14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34, 35,
        36,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
];
