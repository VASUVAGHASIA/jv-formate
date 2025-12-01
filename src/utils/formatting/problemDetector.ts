
import { DocumentModel, Problem } from '../../types/formatting';

export const detectFontInconsistencies = (model: DocumentModel): Problem[] => {
    const problems: Problem[] = [];

    // Find the most common font
    const fontCounts = new Map<string, number>();
    model.paragraphs.forEach(p => {
        if (p.text.trim().length > 0) {
            const font = p.fontName;
            fontCounts.set(font, (fontCounts.get(font) || 0) + 1);
        }
    });

    let primaryFont = 'Calibri'; // Default
    let maxCount = 0;
    fontCounts.forEach((count, font) => {
        if (count > maxCount) {
            maxCount = count;
            primaryFont = font;
        }
    });

    // Find paragraphs with non-standard fonts
    let currentRangeStart = -1;
    let currentRangeEnd = -1;

    model.paragraphs.forEach((p, i) => {
        if (p.text.trim().length > 0 && p.fontName !== primaryFont && !p.isHeading) {
            if (currentRangeStart === -1) {
                currentRangeStart = i;
            }
            currentRangeEnd = i;
        } else {
            if (currentRangeStart !== -1) {
                problems.push({
                    id: `font-${currentRangeStart}`,
                    description: `Inconsistent font "${model.paragraphs[currentRangeStart].fontName}" (should be ${primaryFont})`,
                    severity: 'warning',
                    affectedRange: { start: currentRangeStart, end: currentRangeEnd }
                });
                currentRangeStart = -1;
                currentRangeEnd = -1;
            }
        }
    });

    return problems;
};

export const detectHeadingProblems = (model: DocumentModel): Problem[] => {
    const problems: Problem[] = [];

    model.paragraphs.forEach((p) => {
        // Check for "fake headings" - short bold text that isn't a heading style
        if (!p.isHeading && p.text.length < 100 && p.text.length > 3 && !p.isListItem) {
            // This is a heuristic - in real app we'd check bold property which we need to add to model
            // For now, let's assume we can detect it via other means or update model later
        }

        // Check for heading hierarchy skipping (e.g. H1 -> H3)
        // This requires tracking previous heading level
    });

    return problems;
};

export const detectSpacingIssues = (model: DocumentModel): Problem[] => {
    const problems: Problem[] = [];

    // Check for multiple blank lines
    let blankLineCount = 0;
    let startBlank = -1;

    model.paragraphs.forEach((p, i) => {
        if (p.text.trim().length === 0) {
            if (blankLineCount === 0) startBlank = i;
            blankLineCount++;
        } else {
            if (blankLineCount > 1) {
                problems.push({
                    id: `spacing-${startBlank}`,
                    description: `Multiple blank lines found (${blankLineCount})`,
                    severity: 'info',
                    affectedRange: { start: startBlank, end: i - 1 }
                });
            }
            blankLineCount = 0;
        }
    });

    return problems;
};

export const detectImageProblems = (model: DocumentModel): Problem[] => {
    const problems: Problem[] = [];

    model.images.forEach((img, i) => {
        if (!img.hasAltText) {
            problems.push({
                id: `image-alt-${i}`,
                description: 'Image missing alt text',
                severity: 'warning',
                affectedRange: { start: -1, end: -1 } // Images don't map directly to paragraph ranges easily in this simple model
            });
        }
    });

    return problems;
};
