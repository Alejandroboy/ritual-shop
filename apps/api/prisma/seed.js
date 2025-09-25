"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({ log: ['warn', 'error'] });
const toLabel = (w, h) => `${w}×${h} см`;
const parseSize = (s) => {
    const [w, h] = s.split('x').map(Number);
    return { widthCm: w, heightCm: h, label: toLabel(w, h) };
};
async function upsertSize(code) {
    const s = parseSize(code);
    await prisma.size.upsert({
        where: { widthCm_heightCm: { widthCm: s.widthCm, heightCm: s.heightCm } },
        update: { label: s.label },
        create: s,
    });
}
async function findSizeIds(sizeCodes) {
    const pairs = sizeCodes.map(parseSize);
    const sizes = await prisma.size.findMany({
        where: {
            OR: pairs.map((p) => ({ widthCm: p.widthCm, heightCm: p.heightCm })),
        },
        select: { id: true },
    });
    return sizes.map((s) => s.id);
}
const SIZES = {
    RECT_SMALL: ['13x18', '15x20', '20x25', '20x30', '25x30', '30x40'],
    RECT_TALL: ['30x60', '40x60', '50x70', '50x80'],
    RECT_CERMET: ['13x19', '17x22'],
    OVAL_COMMON_V: ['9x12', '11x15', '13x18', '15x20', '18x24', '20x25'],
    OVAL_COMMON_H: ['12x9', '15x11', '18x13', '20x15', '24x18', '25x20'],
    ARCH_WHITE: ['20x25', '20x30', '25x30', '30x40'],
    GROWTH: ['40x60', '50x70', '50x80', '55x80', '50x100', '60x100', '60x120'],
};
const FRAMES = [1, 2, 3, 4, 5, 6];
const BACKGROUNDS = [
    ...Array.from({ length: 36 }, (_, i) => i + 1),
    100,
    200,
];
function familyRectCermet(codePrefix, labelPrefix) {
    return {
        codePrefix,
        labelPrefix,
        material: client_1.Material.CERMET,
        shape: client_1.Shape.RECTANGLE,
        colorModes: [client_1.ColorMode.BW, client_1.ColorMode.COLOR],
        orientations: [client_1.Orientation.VERTICAL, client_1.Orientation.HORIZONTAL],
        supportsFrame: true,
        requiresBackground: false,
        requiresFinish: false,
        holesByOrientation: {
            [client_1.Orientation.VERTICAL]: [
                client_1.HolePattern.NONE,
                client_1.HolePattern.TWO_VERTICAL,
                client_1.HolePattern.FOUR_CORNERS,
            ],
            [client_1.Orientation.HORIZONTAL]: [
                client_1.HolePattern.NONE,
                client_1.HolePattern.TWO_HORIZONTAL,
                client_1.HolePattern.FOUR_CORNERS,
            ],
        },
        sizeCodesByOrientation: {
            [client_1.Orientation.VERTICAL]: SIZES.RECT_CERMET,
            [client_1.Orientation.HORIZONTAL]: SIZES.RECT_CERMET.map((s) => s.split('x').reverse().join('x')),
        },
        frameCodes: FRAMES,
        backgroundCodes: [1, 2, 4, 5, 7, 10, 12, 13, 21, 23, 31, 32, 34, 36],
    };
}
function familyOvalCermet(codePrefix, labelPrefix) {
    return {
        codePrefix,
        labelPrefix,
        material: client_1.Material.CERMET,
        shape: client_1.Shape.OVAL,
        colorModes: [client_1.ColorMode.BW, client_1.ColorMode.COLOR],
        orientations: [client_1.Orientation.VERTICAL, client_1.Orientation.HORIZONTAL],
        supportsFrame: true,
        holesByOrientation: {
            [client_1.Orientation.VERTICAL]: [client_1.HolePattern.NONE, client_1.HolePattern.TWO_VERTICAL],
            [client_1.Orientation.HORIZONTAL]: [client_1.HolePattern.NONE, client_1.HolePattern.TWO_HORIZONTAL],
        },
        sizeCodesByOrientation: {
            [client_1.Orientation.VERTICAL]: SIZES.OVAL_COMMON_V,
            [client_1.Orientation.HORIZONTAL]: SIZES.OVAL_COMMON_H,
        },
        frameCodes: FRAMES,
        backgroundCodes: BACKGROUNDS,
    };
}
function familyRectWhite(codePrefix, labelPrefix, fullWrap = false) {
    return {
        codePrefix,
        labelPrefix,
        material: client_1.Material.WHITE_CERAMIC_GRANITE,
        shape: client_1.Shape.RECTANGLE,
        colorModes: [client_1.ColorMode.BW, client_1.ColorMode.COLOR],
        orientations: [client_1.Orientation.VERTICAL, client_1.Orientation.HORIZONTAL],
        requiresBackground: true,
        requiresFinish: true,
        templateFinishes: [client_1.Finish.MATTE, client_1.Finish.GLOSS],
        variantFinishes: [client_1.Finish.MATTE, client_1.Finish.GLOSS],
        coverage: fullWrap ? client_1.Coverage.FULL_WRAP : client_1.Coverage.NORMAL,
        holesByOrientation: {
            [client_1.Orientation.VERTICAL]: [
                client_1.HolePattern.NONE,
                client_1.HolePattern.TWO_VERTICAL,
                client_1.HolePattern.FOUR_CORNERS,
            ],
            [client_1.Orientation.HORIZONTAL]: [
                client_1.HolePattern.NONE,
                client_1.HolePattern.TWO_HORIZONTAL,
                client_1.HolePattern.FOUR_CORNERS,
            ],
        },
        sizeCodesByOrientation: {
            [client_1.Orientation.VERTICAL]: [...SIZES.RECT_SMALL, ...SIZES.RECT_TALL],
            [client_1.Orientation.HORIZONTAL]: [...SIZES.RECT_SMALL, ...SIZES.RECT_TALL].map((s) => s.split('x').reverse().join('x')),
        },
        backgroundCodes: BACKGROUNDS,
    };
}
function familyOvalWhite(codePrefix, labelPrefix) {
    return {
        codePrefix,
        labelPrefix,
        material: client_1.Material.WHITE_CERAMIC_GRANITE,
        shape: client_1.Shape.OVAL,
        colorModes: [client_1.ColorMode.BW, client_1.ColorMode.COLOR],
        orientations: [client_1.Orientation.VERTICAL, client_1.Orientation.HORIZONTAL],
        requiresBackground: true,
        requiresFinish: true,
        templateFinishes: [client_1.Finish.MATTE, client_1.Finish.GLOSS],
        variantFinishes: [client_1.Finish.MATTE, client_1.Finish.GLOSS],
        holesByOrientation: {
            [client_1.Orientation.VERTICAL]: [client_1.HolePattern.NONE, client_1.HolePattern.TWO_VERTICAL],
            [client_1.Orientation.HORIZONTAL]: [client_1.HolePattern.NONE, client_1.HolePattern.TWO_HORIZONTAL],
        },
        sizeCodesByOrientation: {
            [client_1.Orientation.VERTICAL]: SIZES.OVAL_COMMON_V,
            [client_1.Orientation.HORIZONTAL]: SIZES.OVAL_COMMON_H,
        },
        backgroundCodes: BACKGROUNDS,
    };
}
function familyArchWhite(codePrefix, labelPrefix) {
    return {
        codePrefix,
        labelPrefix,
        material: client_1.Material.WHITE_CERAMIC_GRANITE,
        shape: client_1.Shape.ARCH,
        colorModes: [client_1.ColorMode.BW, client_1.ColorMode.COLOR],
        orientations: [client_1.Orientation.VERTICAL],
        requiresBackground: true,
        requiresFinish: true,
        templateFinishes: [client_1.Finish.MATTE, client_1.Finish.GLOSS],
        variantFinishes: [client_1.Finish.MATTE, client_1.Finish.GLOSS],
        holesByOrientation: {
            [client_1.Orientation.VERTICAL]: [
                client_1.HolePattern.NONE,
                client_1.HolePattern.TWO_VERTICAL,
                client_1.HolePattern.FOUR_CORNERS,
            ],
        },
        sizeCodesByOrientation: {
            [client_1.Orientation.VERTICAL]: SIZES.ARCH_WHITE,
        },
        backgroundCodes: BACKGROUNDS,
    };
}
function familyRectGlass(codePrefix, labelPrefix) {
    return {
        codePrefix,
        labelPrefix,
        material: client_1.Material.GLASS,
        shape: client_1.Shape.RECTANGLE,
        colorModes: [client_1.ColorMode.BW, client_1.ColorMode.COLOR],
        orientations: [client_1.Orientation.VERTICAL, client_1.Orientation.HORIZONTAL],
        requiresBackground: true,
        requiresFinish: false,
        holesByOrientation: {
            [client_1.Orientation.VERTICAL]: [
                client_1.HolePattern.NONE,
                client_1.HolePattern.TWO_VERTICAL,
                client_1.HolePattern.FOUR_CORNERS,
            ],
            [client_1.Orientation.HORIZONTAL]: [
                client_1.HolePattern.NONE,
                client_1.HolePattern.TWO_HORIZONTAL,
                client_1.HolePattern.FOUR_CORNERS,
            ],
        },
        sizeCodesByOrientation: {
            [client_1.Orientation.VERTICAL]: SIZES.RECT_SMALL,
            [client_1.Orientation.HORIZONTAL]: SIZES.RECT_SMALL.map((s) => s.split('x').reverse().join('x')),
        },
        backgroundCodes: BACKGROUNDS,
    };
}
function familyOvalGlass(codePrefix, labelPrefix) {
    return {
        codePrefix,
        labelPrefix,
        material: client_1.Material.GLASS,
        shape: client_1.Shape.OVAL,
        colorModes: [client_1.ColorMode.BW, client_1.ColorMode.COLOR],
        orientations: [client_1.Orientation.VERTICAL, client_1.Orientation.HORIZONTAL],
        requiresBackground: true,
        holesByOrientation: {
            [client_1.Orientation.VERTICAL]: [client_1.HolePattern.NONE, client_1.HolePattern.TWO_VERTICAL],
            [client_1.Orientation.HORIZONTAL]: [client_1.HolePattern.NONE, client_1.HolePattern.TWO_HORIZONTAL],
        },
        sizeCodesByOrientation: {
            [client_1.Orientation.VERTICAL]: SIZES.OVAL_COMMON_V,
            [client_1.Orientation.HORIZONTAL]: SIZES.OVAL_COMMON_H,
        },
        backgroundCodes: BACKGROUNDS,
    };
}
function familyArchGlass(codePrefix, labelPrefix) {
    return {
        codePrefix,
        labelPrefix,
        material: client_1.Material.GLASS,
        shape: client_1.Shape.ARCH,
        colorModes: [client_1.ColorMode.BW, client_1.ColorMode.COLOR],
        orientations: [client_1.Orientation.VERTICAL],
        requiresBackground: true,
        holesByOrientation: {
            [client_1.Orientation.VERTICAL]: [
                client_1.HolePattern.NONE,
                client_1.HolePattern.TWO_VERTICAL,
                client_1.HolePattern.FOUR_CORNERS,
            ],
        },
        sizeCodesByOrientation: {
            [client_1.Orientation.VERTICAL]: SIZES.ARCH_WHITE,
        },
        backgroundCodes: BACKGROUNDS,
    };
}
function familyRectBlack(codePrefix, labelPrefix) {
    return {
        codePrefix,
        labelPrefix,
        material: client_1.Material.BLACK_CERAMIC_GRANITE,
        shape: client_1.Shape.RECTANGLE,
        colorModes: [client_1.ColorMode.BW],
        orientations: [client_1.Orientation.VERTICAL, client_1.Orientation.HORIZONTAL],
        requiresFinish: true,
        templateFinishes: [client_1.Finish.MATTE, client_1.Finish.GLOSS],
        variantFinishes: [client_1.Finish.MATTE, client_1.Finish.GLOSS],
        holesByOrientation: {
            [client_1.Orientation.VERTICAL]: [
                client_1.HolePattern.NONE,
                client_1.HolePattern.TWO_VERTICAL,
                client_1.HolePattern.FOUR_CORNERS,
            ],
            [client_1.Orientation.HORIZONTAL]: [
                client_1.HolePattern.NONE,
                client_1.HolePattern.TWO_HORIZONTAL,
                client_1.HolePattern.FOUR_CORNERS,
            ],
        },
        sizeCodesByOrientation: {
            [client_1.Orientation.VERTICAL]: [...SIZES.RECT_SMALL, ...SIZES.RECT_TALL],
            [client_1.Orientation.HORIZONTAL]: [...SIZES.RECT_SMALL, ...SIZES.RECT_TALL].map((s) => s.split('x').reverse().join('x')),
        },
    };
}
function familyGrowth(codePrefix, labelPrefix) {
    return {
        codePrefix,
        labelPrefix,
        material: client_1.Material.GROWTH_PHOTOCERAMICS,
        shape: client_1.Shape.RECTANGLE,
        colorModes: [client_1.ColorMode.COLOR],
        orientations: [client_1.Orientation.VERTICAL, client_1.Orientation.HORIZONTAL],
        requiresFinish: true,
        templateFinishes: [client_1.Finish.GLOSS],
        variantFinishes: [client_1.Finish.GLOSS],
        holesByOrientation: {
            [client_1.Orientation.VERTICAL]: [client_1.HolePattern.NONE, client_1.HolePattern.TWO_VERTICAL],
            [client_1.Orientation.HORIZONTAL]: [client_1.HolePattern.NONE, client_1.HolePattern.TWO_HORIZONTAL],
        },
        sizeCodesByOrientation: {
            [client_1.Orientation.VERTICAL]: SIZES.GROWTH,
            [client_1.Orientation.HORIZONTAL]: SIZES.GROWTH.map((s) => s.split('x').reverse().join('x')),
        },
    };
}
function familyEngraving(codePrefix, labelPrefix) {
    return {
        codePrefix,
        labelPrefix,
        material: client_1.Material.ENGRAVING,
        shape: client_1.Shape.RECTANGLE,
        colorModes: [client_1.ColorMode.BW],
        orientations: [client_1.Orientation.VERTICAL, client_1.Orientation.HORIZONTAL],
        requiresFinish: false,
        holesByOrientation: {
            [client_1.Orientation.VERTICAL]: [
                client_1.HolePattern.NONE,
                client_1.HolePattern.TWO_VERTICAL,
                client_1.HolePattern.FOUR_CORNERS,
            ],
            [client_1.Orientation.HORIZONTAL]: [
                client_1.HolePattern.NONE,
                client_1.HolePattern.TWO_HORIZONTAL,
                client_1.HolePattern.FOUR_CORNERS,
            ],
        },
        sizeCodesByOrientation: {
            [client_1.Orientation.VERTICAL]: SIZES.RECT_SMALL,
            [client_1.Orientation.HORIZONTAL]: SIZES.RECT_SMALL.map((s) => s.split('x').reverse().join('x')),
        },
    };
}
function buildTemplates(f) {
    const items = [];
    const orientations = f.orientations ?? [];
    const holesMap = f.holesByOrientation ?? {};
    const sizeMap = f.sizeCodesByOrientation ?? {};
    if (orientations.length) {
        for (const orient of orientations) {
            for (const cm of f.colorModes) {
                const suffix = `${f.shape === client_1.Shape.OVAL ? 'OV' : f.shape === client_1.Shape.ARCH ? 'AR' : 'R'}-` +
                    `${orient === client_1.Orientation.VERTICAL ? 'V' : 'H'}-` +
                    `${cm === client_1.ColorMode.BW ? 'BW' : 'C'}`;
                const code = `${f.codePrefix}-${suffix}`;
                const label = `${f.labelPrefix} ${orient === client_1.Orientation.VERTICAL ? 'верт.' : 'гор.'} ${cm === client_1.ColorMode.BW ? 'ч/б' : 'цвет'}`;
                items.push({
                    code,
                    label,
                    material: f.material,
                    shape: f.shape,
                    orientation: orient,
                    colorMode: cm,
                    coverage: f.coverage ?? client_1.Coverage.NORMAL,
                    supportsFrame: !!f.supportsFrame,
                    requiresBackground: !!f.requiresBackground,
                    requiresFinish: !!f.requiresFinish,
                    sizeCodes: sizeMap[orient] ?? [],
                    frameCodes: f.frameCodes,
                    backgroundCodes: f.backgroundCodes,
                    holePatterns: holesMap[orient] ?? [],
                    templateFinishes: f.templateFinishes,
                    variantFinishes: f.variantFinishes,
                });
            }
        }
    }
    else {
        for (const cm of f.colorModes) {
            const suffix = `${f.shape === client_1.Shape.OVAL ? 'OV' : f.shape === client_1.Shape.ARCH ? 'AR' : 'R'}-` +
                `${cm === client_1.ColorMode.BW ? 'BW' : 'C'}`;
            const code = `${f.codePrefix}-${suffix}`;
            const label = `${f.labelPrefix} ${cm === client_1.ColorMode.BW ? 'ч/б' : 'цвет'}`;
            items.push({
                code,
                label,
                material: f.material,
                shape: f.shape,
                colorMode: cm,
                coverage: f.coverage ?? client_1.Coverage.NORMAL,
                supportsFrame: !!f.supportsFrame,
                requiresBackground: !!f.requiresBackground,
                requiresFinish: !!f.requiresFinish,
                sizeCodes: f.sizeCodes ?? [],
                frameCodes: f.frameCodes,
                backgroundCodes: f.backgroundCodes,
                holePatterns: f.holes ?? [],
                templateFinishes: f.templateFinishes,
                variantFinishes: f.variantFinishes,
            });
        }
    }
    return items;
}
async function seedSizes() {
    const all = new Set([
        ...SIZES.RECT_SMALL,
        ...SIZES.RECT_TALL,
        ...SIZES.RECT_CERMET,
        ...SIZES.OVAL_COMMON_V,
        ...SIZES.OVAL_COMMON_H,
        ...SIZES.ARCH_WHITE,
        ...SIZES.GROWTH,
    ]);
    [...SIZES.RECT_SMALL, ...SIZES.RECT_TALL].forEach((s) => all.add(s.split('x').reverse().join('x')));
    SIZES.OVAL_COMMON_V.forEach((s) => all.add(s));
    SIZES.OVAL_COMMON_H.forEach((s) => all.add(s));
    await Promise.all([...all].map(upsertSize));
    console.log(`✓ Sizes: ${all.size}`);
}
async function seedFrames() {
    for (const code of FRAMES) {
        await prisma.frame.upsert({
            where: { code },
            update: { name: `Рамка ${code}` },
            create: { code, name: `Рамка ${code}` },
        });
    }
    console.log(`✓ Frames: ${FRAMES.length}`);
}
async function seedBackgrounds() {
    for (const code of BACKGROUNDS) {
        await prisma.background.upsert({
            where: { code },
            update: { name: `Фон ${code}` },
            create: { code, name: `Фон ${code}` },
        });
    }
    console.log(`✓ Backgrounds: ${BACKGROUNDS.length}`);
}
async function seedFinishVariants() {
    for (const f of [
        { code: 'MATTE', label: 'Матовый' },
        { code: 'GLOSS', label: 'Глянец' },
    ]) {
        await prisma.finishVariant.upsert({
            where: { code: f.code },
            update: { label: f.label },
            create: f,
        });
    }
    console.log('✓ Finish variants: 2');
}
async function upsertTemplate(t) {
    const tpl = await prisma.template.upsert({
        where: { code: t.code },
        update: {
            label: t.label,
            material: t.material,
            shape: t.shape,
            orientation: t.orientation,
            colorMode: t.colorMode,
            coverage: t.coverage ?? client_1.Coverage.NORMAL,
            supportsFrame: t.supportsFrame ?? false,
            requiresBackground: t.requiresBackground ?? false,
            requiresFinish: t.requiresFinish ?? false,
        },
        create: {
            code: t.code,
            label: t.label,
            material: t.material,
            shape: t.shape,
            orientation: t.orientation,
            colorMode: t.colorMode,
            coverage: t.coverage ?? client_1.Coverage.NORMAL,
            supportsFrame: t.supportsFrame ?? false,
            requiresBackground: t.requiresBackground ?? false,
            requiresFinish: t.requiresFinish ?? false,
            personsMin: 1,
            personsMax: 1,
        },
        select: { id: true },
    });
    await prisma.$transaction([
        prisma.templateSize.deleteMany({ where: { templateId: tpl.id } }),
        prisma.templateHole.deleteMany({ where: { templateId: tpl.id } }),
        prisma.templateFrame.deleteMany({ where: { templateId: tpl.id } }),
        prisma.templateBackground.deleteMany({ where: { templateId: tpl.id } }),
        prisma.templateFinish.deleteMany({ where: { templateId: tpl.id } }),
        prisma.templateVariantFinish.deleteMany({ where: { templateId: tpl.id } }),
        prisma.templateVariant.deleteMany({ where: { templateId: tpl.id } }),
    ]);
    const sizeIds = await findSizeIds(t.sizeCodes);
    await prisma.templateSize.createMany({
        data: sizeIds.map((sizeId) => ({ templateId: tpl.id, sizeId })),
        skipDuplicates: true,
    });
    await prisma.templateHole.createMany({
        data: t.holePatterns.map((pattern) => ({ templateId: tpl.id, pattern })),
        skipDuplicates: true,
    });
    if (t.frameCodes?.length) {
        const frames = await prisma.frame.findMany({
            where: { code: { in: t.frameCodes } },
            select: { id: true },
        });
        await prisma.templateFrame.createMany({
            data: frames.map((f) => ({ templateId: tpl.id, frameId: f.id })),
            skipDuplicates: true,
        });
    }
    if (t.backgroundCodes?.length) {
        const bgs = await prisma.background.findMany({
            where: { code: { in: t.backgroundCodes } },
            select: { id: true },
        });
        await prisma.templateBackground.createMany({
            data: bgs.map((b) => ({ templateId: tpl.id, backgroundId: b.id })),
            skipDuplicates: true,
        });
    }
    if (t.templateFinishes?.length) {
        await prisma.templateFinish.createMany({
            data: t.templateFinishes.map((f) => ({ templateId: tpl.id, finish: f })),
            skipDuplicates: true,
        });
    }
    for (const p of t.holePatterns) {
        await prisma.templateVariant.upsert({
            where: { templateId_holePattern: { templateId: tpl.id, holePattern: p } },
            update: { finishRequired: !!t.requiresFinish },
            create: {
                templateId: tpl.id,
                holePattern: p,
                finishRequired: !!t.requiresFinish,
            },
        });
        if (t.variantFinishes?.length) {
            const fv = await prisma.finishVariant.findMany({
                where: { code: { in: t.variantFinishes.map((x) => x) } },
                select: { id: true },
            });
            await prisma.templateVariantFinish.createMany({
                data: fv.map((x) => ({
                    templateId: tpl.id,
                    holePattern: p,
                    finishId: x.id,
                })),
                skipDuplicates: true,
            });
        }
    }
}
async function seedCatalog() {
    const families = [
        familyRectCermet('CERM-T', 'Табличка Т'),
        familyOvalCermet('CERM-O', 'Овал'),
        familyRectWhite('WCG-T', 'Керамогранит бел. табличка', false),
        familyRectWhite('WCG-TF', 'Керамогранит бел. табличка полная', true),
        familyOvalWhite('WCG-O', 'Керамогранит бел. овал'),
        familyArchWhite('WCG-A', 'Керамогранит бел. арка'),
        familyRectGlass('GLS-T', 'Стекло табличка'),
        familyOvalGlass('GLS-O', 'Стекло овал'),
        familyArchGlass('GLS-A', 'Стекло арка'),
        familyRectBlack('BCG-T', 'Керамогранит чёрный'),
        familyGrowth('GROWTH', 'Ростовая фотокерамика'),
        familyEngraving('ENGR', 'Гравировка'),
    ];
    const built = families.flatMap(buildTemplates);
    console.log(`→ Building ${built.length} templates...`);
    for (const t of built) {
        await upsertTemplate(t);
    }
    console.log('✓ Templates seeded');
}
async function main() {
    await seedSizes();
    await seedFrames();
    await seedBackgrounds();
    await seedFinishVariants();
    await seedCatalog();
}
main()
    .then(async () => {
    console.log('✅ Seed completed');
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error('❌ Seed failed', e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map