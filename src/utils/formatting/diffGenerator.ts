
import { DocumentModel, Problem, FormatChange, AutoFormatOptions } from '../../types/formatting';
import { fixAllHeadings } from '../wordUtils';
import { cleanWhitespace, normalizeLists, styleTables, resizeImages, normalizeFonts } from './localFixes';

/* global Word */

export const generateDiff = (
    model: DocumentModel,
    problems: Problem[],
    options: AutoFormatOptions
): FormatChange[] => {
    const changes: FormatChange[] = [];

    // Font Changes
    if (options.enableFonts) {
        const fontProblems = problems.filter(p => p.id.startsWith('font-'));
        if (fontProblems.length > 0) {
            changes.push({
                id: 'normalize-fonts',
                type: 'style',
                category: 'Fonts',
                description: `Normalize fonts to Calibri 11pt`,
                before: 'Mixed fonts',
                after: 'Calibri 11pt',
                range: { start: 0, end: model.paragraphs.length },
                applyFn: async () => {
                    await normalizeFontsWrapper();
                },
                enabled: true
            });
        }
    }

    // Heading Changes
    if (options.enableHeadings) {
        changes.push({
            id: 'fix-headings',
            type: 'style',
            category: 'Headings',
            description: 'Standardize all heading styles',
            before: 'Inconsistent heading styles',
            after: 'Standardized headings (H1: 16pt, H2: 14pt)',
            range: { start: 0, end: model.paragraphs.length },
            applyFn: async () => await fixAllHeadings(),
            enabled: true
        });
    }

    // Spacing Changes
    if (options.enableSpacing) {
        changes.push({
            id: 'fix-spacing',
            type: 'spacing',
            category: 'Spacing',
            description: `Remove extra blank lines`,
            before: 'Multiple blank lines',
            after: 'Single blank lines',
            range: { start: 0, end: model.paragraphs.length },
            applyFn: async () => await cleanWhitespaceWrapper(),
            enabled: true
        });
    }

    // List Changes
    if (options.enableLists) {
        changes.push({
            id: 'fix-lists',
            type: 'style',
            category: 'Lists',
            description: 'Normalize list styles',
            before: 'Mixed list styles',
            after: 'Standardized lists',
            range: { start: 0, end: model.paragraphs.length },
            applyFn: async () => await normalizeListsWrapper(),
            enabled: true
        });
    }

    // Table Changes
    if (options.enableTables) {
        changes.push({
            id: 'fix-tables',
            type: 'style',
            category: 'Tables',
            description: 'Apply standard table style',
            before: 'Unstyled tables',
            after: 'Grid Table 4 - Accent 1',
            range: { start: 0, end: model.paragraphs.length }, // Approximate
            applyFn: async () => await styleTablesWrapper(),
            enabled: true
        });
    }

    // Image Changes
    if (options.enableImages) {
        changes.push({
            id: 'fix-images',
            type: 'image',
            category: 'Images',
            description: `Resize and wrap images`,
            before: 'Various sizes/wrapping',
            after: 'Resized to fit page',
            range: { start: 0, end: 0 },
            applyFn: async () => await resizeImagesWrapper(),
            enabled: true
        });
    }

    return changes;
};

// Wrappers to handle Word.run since localFixes functions expect context
// Ideally localFixes should export these wrappers.

const normalizeFontsWrapper = async () => {
    await Word.run(async (context) => {
        await normalizeFonts(context);
    });
};

const cleanWhitespaceWrapper = async () => {
    await Word.run(async (context) => {
        await cleanWhitespace(context);
    });
};

const normalizeListsWrapper = async () => {
    await Word.run(async (context) => {
        await normalizeLists(context);
    });
};

const styleTablesWrapper = async () => {
    await Word.run(async (context) => {
        await styleTables(context);
    });
};

const resizeImagesWrapper = async () => {
    await Word.run(async (context) => {
        await resizeImages(context);
    });
};
