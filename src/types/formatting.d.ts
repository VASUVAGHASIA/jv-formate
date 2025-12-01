
/* global Word */

export interface ParagraphInfo {
    index: number;
    text: string;
    style: string;
    fontName: string;
    fontSize: number;
    alignment: Word.Alignment;
    lineSpacing: number;
    isListItem: boolean;
    listLevel: number;
    isHeading: boolean;
    headingLevel: number;
}

export interface TableInfo {
    index: number;
    rowCount: number;
    columnCount: number;
    hasHeaderRow: boolean;
}

export interface ImageInfo {
    index: number;
    width: number;
    height: number;
    hasAltText: boolean;
    wrapping: string; // approximate
}

export interface SectionInfo {
    index: number;
    pageMargins: { top: number; bottom: number; left: number; right: number };
}

export interface HeaderFooterInfo {
    type: 'header' | 'footer';
    text: string;
}

export interface DocumentModel {
    paragraphs: ParagraphInfo[];
    tables: TableInfo[];
    images: ImageInfo[];
    sections: SectionInfo[];
    headers: HeaderFooterInfo[];
    footers: HeaderFooterInfo[];
}

export type ChangeType = 'style' | 'text' | 'list' | 'image' | 'table' | 'page' | 'spacing';

export interface FormatChange {
    id: string;
    type: ChangeType;
    category: string; // e.g., "Fonts", "Headings", "Spacing"
    description: string;
    before: string; // description of state before
    after: string; // description of state after
    range: { start: number; end: number }; // paragraph indices
    applyFn: () => Promise<void>;
    enabled: boolean;
}

export interface Problem {
    id: string;
    description: string;
    severity: 'warning' | 'error' | 'info';
    affectedRange: { start: number; end: number };
}

export interface FormatRule {
    id: string;
    name: string;
    category: string;
    detect: (model: DocumentModel) => Problem[];
    generateFix: (problem: Problem) => FormatChange;
}

export interface AuditEntry {
    timestamp: Date;
    changesApplied: number;
    categories: string[];
    durationMs: number;
}

export type FormatMode = 'auto-fix' | 'suggest' | 'semi-auto';
export type ProcessingMode = 'local' | 'ai' | 'server';

export interface AutoFormatOptions {
    // Categories
    enableFonts: boolean;
    enableHeadings: boolean;
    enableSpacing: boolean;
    enableLists: boolean;
    enableTables: boolean;
    enableImages: boolean;
    enableMargins: boolean;
    enableAccessibility: boolean; // Alt text
    enableGrammar: boolean;
    enableCitations: boolean;
    enablePdfRepair: boolean;

    // Configuration
    mode: FormatMode;
    processingMode: ProcessingMode;
    templateId: string;
}

export interface FormatTemplate {
    id: string;
    name: string;
    description: string;
    settings: Partial<AutoFormatOptions>;
    rules: {
        fontFamily: string;
        fontSize: number;
        lineSpacing: number;
        margins: { top: number; bottom: number; left: number; right: number };
        headingStyles: {
            h1: { fontSize: number; bold: boolean; color?: string };
            h2: { fontSize: number; bold: boolean; color?: string };
            h3: { fontSize: number; bold: boolean; color?: string };
        };
    };
}
