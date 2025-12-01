import { FormatTemplate, AutoFormatOptions } from '../../types/formatting';

export const DEFAULT_TEMPLATES: FormatTemplate[] = [
    {
        id: 'standard',
        name: 'Standard / Report',
        description: 'Clean, professional formatting suitable for most business documents.',
        settings: {
            enableFonts: true,
            enableHeadings: true,
            enableSpacing: true,
            enableLists: true,
            enableTables: true,
            enableImages: true,
            enableMargins: true,
        },
        rules: {
            fontFamily: 'Calibri',
            fontSize: 11,
            lineSpacing: 1.15,
            margins: { top: 72, bottom: 72, left: 72, right: 72 }, // 1 inch
            headingStyles: {
                h1: { fontSize: 16, bold: true, color: '#2F5496' },
                h2: { fontSize: 13, bold: true, color: '#2F5496' },
                h3: { fontSize: 12, bold: true, color: '#1F3763' },
            }
        }
    },
    {
        id: 'academic',
        name: 'Academic / IEEE',
        description: 'Strict formatting for academic papers (Times New Roman, double spacing).',
        settings: {
            enableFonts: true,
            enableHeadings: true,
            enableSpacing: true,
            enableCitations: true,
            enableMargins: true,
        },
        rules: {
            fontFamily: 'Times New Roman',
            fontSize: 12,
            lineSpacing: 2.0, // Double spacing
            margins: { top: 72, bottom: 72, left: 72, right: 72 },
            headingStyles: {
                h1: { fontSize: 14, bold: true, color: '#000000' },
                h2: { fontSize: 12, bold: true, color: '#000000' },
                h3: { fontSize: 12, bold: true, color: '#000000' }, // Italic often used but simple bold for now
            }
        }
    },
    {
        id: 'resume',
        name: 'Modern Resume',
        description: 'Sleek, compact formatting to maximize space.',
        settings: {
            enableFonts: true,
            enableHeadings: true,
            enableLists: true,
            enableMargins: true,
        },
        rules: {
            fontFamily: 'Arial',
            fontSize: 10,
            lineSpacing: 1.0,
            margins: { top: 36, bottom: 36, left: 54, right: 54 }, // 0.5 inch top/bottom, 0.75 side
            headingStyles: {
                h1: { fontSize: 18, bold: true, color: '#000000' },
                h2: { fontSize: 14, bold: true, color: '#666666' },
                h3: { fontSize: 11, bold: true, color: '#000000' },
            }
        }
    },
    {
        id: 'formal',
        name: 'Formal / Legal',
        description: 'Traditional formatting with generous margins and serif fonts.',
        settings: {
            enableFonts: true,
            enableHeadings: true,
            enableSpacing: true,
            enableLists: true,
        },
        rules: {
            fontFamily: 'Georgia',
            fontSize: 11,
            lineSpacing: 1.5,
            margins: { top: 90, bottom: 90, left: 90, right: 90 }, // 1.25 inch
            headingStyles: {
                h1: { fontSize: 14, bold: true, color: '#000000' },
                h2: { fontSize: 12, bold: true, color: '#000000' },
                h3: { fontSize: 11, bold: true, color: '#000000' },
            }
        }
    }
];

export const getTemplateById = (id: string): FormatTemplate | undefined => {
    return DEFAULT_TEMPLATES.find(t => t.id === id);
};

export const applyTemplateSettings = (
    currentOptions: AutoFormatOptions,
    templateId: string
): AutoFormatOptions => {
    const template = getTemplateById(templateId);
    if (!template) return currentOptions;

    return {
        ...currentOptions,
        ...template.settings,
        templateId: template.id
    };
};
