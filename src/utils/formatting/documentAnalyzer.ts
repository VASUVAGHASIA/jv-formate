
/* global Word */
import { DocumentModel, ParagraphInfo, TableInfo, ImageInfo, SectionInfo, HeaderFooterInfo } from '../../types/formatting';

export const buildDocumentModel = async (context: Word.RequestContext): Promise<DocumentModel> => {
    const body = context.document.body;
    const paragraphs = body.paragraphs;
    const tables = body.tables;
    const sections = context.document.sections;

    // Load necessary properties
    paragraphs.load('items, style, font, alignment, lineSpacing, listItemOrNullObject');
    tables.load('items, rowCount, rowCount');
    sections.load('items, pageSetup');

    // Load images (inline pictures)
    const images = body.inlinePictures;
    images.load('items, width, height, altTextTitle, altTextDescription, hyperlink');

    await context.sync();

    // Process paragraphs
    const paragraphInfos: ParagraphInfo[] = paragraphs.items.map((p, index) => {
        // Check if it's a list item
        const isListItem = p.listItemOrNullObject !== null;
        let listLevel = -1;

        // We need to load list level separately if it is a list item, 
        // but for now we'll just mark it. In a real deep analysis we'd load levels.

        const styleName = p.style as string;
        const isHeading = styleName.toLowerCase().includes('heading');
        let headingLevel = 0;
        if (isHeading) {
            const match = styleName.match(/Heading\s+(\d+)/i);
            if (match) headingLevel = parseInt(match[1]);
        }

        return {
            index,
            text: p.text,
            style: styleName,
            fontName: p.font.name,
            fontSize: p.font.size,
            alignment: p.alignment as Word.Alignment,
            lineSpacing: p.lineSpacing,
            isListItem,
            listLevel,
            isHeading,
            headingLevel
        };
    });

    // Process tables
    const tableInfos: TableInfo[] = tables.items.map((t, index) => ({
        index,
        rowCount: t.rowCount,
        columnCount: t.values[0]?.length || 0, // Approximate column count from first row
        hasHeaderRow: true // Assumption, would need more checks
    }));

    // Process images
    const imageInfos: ImageInfo[] = images.items.map((img, index) => ({
        index,
        width: img.width,
        height: img.height,
        hasAltText: !!img.altTextTitle || !!img.altTextDescription,
        wrapping: 'inline' // Inline pictures are always inline
    }));

    // Process sections
    const sectionInfos: SectionInfo[] = sections.items.map((s, index) => ({
        index,
        pageMargins: {
            top: s.pageSetup.topMargin,
            bottom: s.pageSetup.bottomMargin,
            left: s.pageSetup.leftMargin,
            right: s.pageSetup.rightMargin
        }
    }));

    // Process headers/footers (simplified - just primary for first section)
    const headers: HeaderFooterInfo[] = [];
    const footers: HeaderFooterInfo[] = [];

    if (sections.items.length > 0) {
        // In a full implementation, we'd load these. 
        // For now, we'll skip deep loading to avoid too many syncs in this initial pass
    }

    return {
        paragraphs: paragraphInfos,
        tables: tableInfos,
        images: imageInfos,
        sections: sectionInfos,
        headers,
        footers
    };
};
