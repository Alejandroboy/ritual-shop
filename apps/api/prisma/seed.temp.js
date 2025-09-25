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
async function connectSizesByCodes(codes) {
    const pairs = codes.map(parseSize);
    const sizes = await prisma.size.findMany({
        where: {
            OR: pairs.map((p) => ({ widthCm: p.widthCm, heightCm: p.heightCm })),
        },
    });
    return sizes.map((s) => ({ sizeId: s.id }));
}
async function connectFramesByCodes(codes) {
    const frames = await prisma.frame.findMany({
        where: { code: { in: codes } },
    });
    return frames.map((f) => ({ frameId: f.id }));
}
async function connectBackgroundsByCodes(codes) {
    const bgs = await prisma.background.findMany({
        where: { code: { in: codes } },
    });
    return bgs.map((bg) => ({ backgroundId: bg.id }));
}
async function seedSizes() {
    const rect = [
        '13x18',
        '15x20',
        '20x25',
        '20x30',
        '25x30',
        '30x40',
        '30x60',
        '13x19',
        '17x22',
        '40x60',
        '50x70',
        '50x80',
        '55x80',
        '50x100',
        '60x100',
        '60x120',
    ];
    const uniq = Array.from(new Set(rect));
    await Promise.all(uniq.map(upsertSize));
    console.log(`✓ Sizes: ${uniq.length}`);
}
async function seedFrames() {
    const list = [
        { code: 1, name: 'Рамка 1' },
        { code: 2, name: 'Рамка 2' },
        { code: 3, name: 'Рамка 3' },
        { code: 4, name: 'Рамка 4' },
        { code: 5, name: 'Рамка 5' },
        { code: 6, name: 'Рамка 6' },
    ];
    for (const f of list) {
        await prisma.frame.upsert({
            where: { code: f.code },
            update: { name: f.name },
            create: f,
        });
    }
    console.log(`✓ Frames: ${list.length}`);
}
async function seedBackgrounds() {
    const base = Array.from({ length: 36 }, (_, i) => i + 1);
    const extra = [100, 200];
    const all = [...base, ...extra];
    for (const code of all) {
        await prisma.background.upsert({
            where: { code },
            update: { name: `Фон ${code}` },
            create: { code, name: `Фон ${code}` },
        });
    }
    console.log(`✓ Backgrounds: ${all.length}`);
}
async function seedFinishVariants() {
    const list = [
        { code: 'MATTE', label: 'Матовый' },
        { code: 'GLOSS', label: 'Глянец' },
    ];
    for (const f of list) {
        await prisma.finishVariant.upsert({
            where: { code: f.code },
            update: { label: f.label },
            create: f,
        });
    }
    console.log(`✓ Finish variants: ${list.length}`);
}
async function addTemplate(input) {
    const tpl = await prisma.template.upsert({
        where: { code: input.code },
        update: {
            label: input.label,
            material: input.material,
            shape: input.shape,
            orientation: input.orientation,
            colorMode: input.colorMode,
            coverage: input.coverage ?? client_1.Coverage.NORMAL,
            supportsFrame: input.supportsFrame ?? false,
            requiresBackground: input.requiresBackground ?? false,
            requiresFinish: input.requiresFinish ?? false,
            supportsHoles: input.supportsHoles ?? true,
            personsMin: 1,
            personsMax: 1,
        },
        create: {
            code: input.code,
            label: input.label,
            material: input.material,
            shape: input.shape,
            orientation: input.orientation,
            colorMode: input.colorMode,
            coverage: input.coverage ?? client_1.Coverage.NORMAL,
            supportsFrame: input.supportsFrame ?? false,
            requiresBackground: input.requiresBackground ?? false,
            requiresFinish: input.requiresFinish ?? false,
            supportsHoles: input.supportsHoles ?? true,
            personsMin: 1,
            personsMax: 1,
        },
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
    const sizeLinks = await connectSizesByCodes(input.sizeCodes);
    if (sizeLinks.length) {
        await prisma.templateSize.createMany({
            data: sizeLinks.map((s) => ({
                templateId: tpl.id,
                sizeId: s.sizeId,
            })),
            skipDuplicates: true,
        });
    }
    if (input.holePatterns?.length) {
        await prisma.templateHole.createMany({
            data: input.holePatterns.map((p) => ({ templateId: tpl.id, pattern: p })),
            skipDuplicates: true,
        });
    }
    if (input.frameCodes?.length) {
        const frameLinks = await connectFramesByCodes(input.frameCodes);
        if (frameLinks.length) {
            await prisma.templateFrame.createMany({
                data: frameLinks.map((s) => ({
                    templateId: tpl.id,
                    frameId: s.frameId,
                })),
                skipDuplicates: true,
            });
        }
    }
    if (input.backgroundCodes?.length) {
        const bgLinks = await connectBackgroundsByCodes(input.backgroundCodes);
        if (bgLinks.length) {
            await prisma.templateBackground.createMany({
                data: bgLinks.map((s) => ({
                    templateId: tpl.id,
                    backgroundId: s.backgroundId,
                })),
                skipDuplicates: true,
            });
        }
    }
    if (input.allowedTemplateFinishes?.length) {
        await prisma.templateFinish.createMany({
            data: input.allowedTemplateFinishes.map((f) => ({
                templateId: tpl.id,
                finish: f,
            })),
            skipDuplicates: true,
        });
    }
    for (const p of input.holePatterns) {
        const variant = await prisma.templateVariant.upsert({
            where: { templateId_holePattern: { templateId: tpl.id, holePattern: p } },
            update: { finishRequired: !!input.requiresFinish },
            create: {
                templateId: tpl.id,
                holePattern: p,
                finishRequired: !!input.requiresFinish,
            },
        });
        if (input.variantFinishes?.length) {
            const fv = await prisma.finishVariant.findMany({
                where: { code: { in: input.variantFinishes } },
                select: { id: true },
            });
            if (fv.length) {
                await prisma.templateVariantFinish.createMany({
                    data: fv.map((x) => ({
                        templateId: tpl.id,
                        holePattern: variant.holePattern,
                        finishId: x.id,
                    })),
                    skipDuplicates: true,
                });
            }
        }
    }
    return tpl;
}
async function seedTemplates() {
    await addTemplate({
        code: 'T1',
        label: 'Т1',
        material: client_1.Material.CERMET,
        shape: client_1.Shape.RECTANGLE,
        orientation: client_1.Orientation.VERTICAL,
        colorMode: client_1.ColorMode.BW,
        supportsFrame: true,
        requiresBackground: false,
        requiresFinish: false,
        sizeCodes: ['13x19', '17x22'],
        holePatterns: [
            client_1.HolePattern.NONE,
            client_1.HolePattern.TWO_VERTICAL,
            client_1.HolePattern.FOUR_CORNERS,
        ],
        frameCodes: [1, 2, 3, 4, 5, 6],
        backgroundCodes: [1, 2, 7, 5, 4],
    });
    await addTemplate({
        code: 'T1c',
        label: 'Т1ц',
        material: client_1.Material.CERMET,
        shape: client_1.Shape.RECTANGLE,
        orientation: client_1.Orientation.VERTICAL,
        colorMode: client_1.ColorMode.COLOR,
        supportsFrame: true,
        sizeCodes: ['13x19', '17x22'],
        holePatterns: [
            client_1.HolePattern.NONE,
            client_1.HolePattern.TWO_VERTICAL,
            client_1.HolePattern.FOUR_CORNERS,
        ],
        frameCodes: [1, 2, 3, 4, 5, 6],
        backgroundCodes: [1, 2, 7, 5, 4],
    });
    await addTemplate({
        code: 'K1',
        label: 'К1',
        material: client_1.Material.WHITE_CERAMIC_GRANITE,
        shape: client_1.Shape.RECTANGLE,
        orientation: client_1.Orientation.VERTICAL,
        colorMode: client_1.ColorMode.BW,
        requiresBackground: true,
        requiresFinish: true,
        sizeCodes: ['13x18', '15x20', '20x25', '20x30', '25x30', '30x40', '30x60'],
        holePatterns: [
            client_1.HolePattern.NONE,
            client_1.HolePattern.TWO_VERTICAL,
            client_1.HolePattern.FOUR_CORNERS,
        ],
        backgroundCodes: [1, 2, 7, 5, 4, 10, 12, 13, 21, 23, 31, 32, 34, 36, 100],
        allowedTemplateFinishes: [client_1.Finish.MATTE, client_1.Finish.GLOSS],
        variantFinishes: ['MATTE', 'GLOSS'],
    });
    await addTemplate({
        code: 'K1c',
        label: 'К1ц',
        material: client_1.Material.WHITE_CERAMIC_GRANITE,
        shape: client_1.Shape.RECTANGLE,
        orientation: client_1.Orientation.VERTICAL,
        colorMode: client_1.ColorMode.COLOR,
        requiresBackground: true,
        requiresFinish: true,
        sizeCodes: ['13x18', '15x20', '20x25', '20x30', '25x30', '30x40', '30x60'],
        holePatterns: [
            client_1.HolePattern.NONE,
            client_1.HolePattern.TWO_VERTICAL,
            client_1.HolePattern.FOUR_CORNERS,
        ],
        backgroundCodes: [1, 2, 7, 5, 4, 10, 12, 13, 21, 23, 31, 32, 34, 36, 100],
        allowedTemplateFinishes: [client_1.Finish.MATTE, client_1.Finish.GLOSS],
        variantFinishes: ['MATTE', 'GLOSS'],
    });
    console.log('✓ Templates: T1, T1ц, K1, K1ц');
}
async function main() {
    await seedSizes();
    await seedFrames();
    await seedBackgrounds();
    await seedFinishVariants();
    await seedTemplates();
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
//# sourceMappingURL=seed.temp.js.map