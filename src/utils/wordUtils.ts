/* global Word */

/**
 * Insert text at the current cursor position
 */
export const insertTextAtCursor = async (text: string): Promise<void> => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();
    range.insertText(text, Word.InsertLocation.end);
    await context.sync();
  });
};

/**
 * Insert HTML at the current cursor position
 */
export const insertHtmlAtCursor = async (html: string): Promise<void> => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();
    range.insertHtml(html, Word.InsertLocation.end);
    await context.sync();
  });
};

/**
 * Replace the currently selected text
 */
export const replaceSelectedText = async (text: string): Promise<void> => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();
    range.insertText(text, Word.InsertLocation.replace);
    await context.sync();
  });
};

/**
 * Replace the currently selected text with HTML
 */
export const replaceSelectedTextWithHtml = async (html: string): Promise<void> => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();

    // Get the start of the selection to determine the "base" formatting
    const startRange = range.getRange(Word.RangeLocation.start);
    startRange.load('font');
    await context.sync();

    const fontName = startRange.font.name;
    const fontSize = startRange.font.size;

    // Insert the HTML
    range.insertHtml(html, Word.InsertLocation.replace);

    // Re-apply the base font settings to the inserted content
    if (fontName) range.font.name = fontName;
    if (fontSize) range.font.size = fontSize;

    await context.sync();
  });
};

/**
 * Get the currently selected text
 */
export const getSelectedText = async (): Promise<string> => {
  return await Word.run(async (context) => {
    const range = context.document.getSelection();
    range.load('text');
    await context.sync();
    return range.text;
  });
};

/**
 * Apply paragraph formatting to selection
 */
export const applyParagraphFormatting = async (options: {
  fontName?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  alignment?: Word.Alignment;
  lineSpacing?: number;
}): Promise<void> => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();
    const font = range.font;

    if (options.fontName) font.name = options.fontName;
    if (options.fontSize) font.size = options.fontSize;
    if (options.bold !== undefined) font.bold = options.bold;
    if (options.italic !== undefined) font.italic = options.italic;
    if (options.underline !== undefined) {
      font.underline = options.underline ? Word.UnderlineType.single : Word.UnderlineType.none;
    }

    const paragraph = range.paragraphs.getFirst();
    if (options.alignment) paragraph.alignment = options.alignment;
    if (options.lineSpacing) paragraph.lineSpacing = options.lineSpacing;

    await context.sync();
  });
};

/**
 * Set document margins
 */
export const setDocumentMargins = async (margins: {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}): Promise<void> => {
  await Word.run(async (context) => {
    const sections = context.document.sections;
    sections.load('items');
    await context.sync();

    sections.items.forEach((section) => {
      const pageSetup = section.pageSetup;
      if (margins.top !== undefined) pageSetup.topMargin = margins.top;
      if (margins.bottom !== undefined) pageSetup.bottomMargin = margins.bottom;
      if (margins.left !== undefined) pageSetup.leftMargin = margins.left;
      if (margins.right !== undefined) pageSetup.rightMargin = margins.right;
    });

    await context.sync();
  });
};

/**
 * Fix all headings in the document
 */
/**
 * Fix all headings in the document
 * Detects headings by size, bold, or keywords and applies standard Word styles
 */
export const fixAllHeadings = async (): Promise<void> => {
  await Word.run(async (context) => {
    const paragraphs = context.document.body.paragraphs;
    paragraphs.load('items, style, text, font');
    await context.sync();

    const headingKeywords = ['introduction', 'conclusion', 'abstract', 'references', 'chapter', 'section', 'summary', 'background', 'methodology', 'results', 'discussion'];

    paragraphs.items.forEach((paragraph) => {
      const text = paragraph.text.trim();
      const lowerText = text.toLowerCase();
      const wordCount = text.split(/\s+/).length;
      const charCount = text.length;

      if (charCount === 0) return;

      // Detection Logic
      let isHeading = false;
      let targetStyle = '';

      // 1. Keyword Detection (must be short)
      if (charCount < 50 && headingKeywords.some(k => lowerText.includes(k))) {
        isHeading = true;
        targetStyle = 'Heading 1';
      }
      // 2. Visual Detection
      else if (paragraph.font.size >= 14) {
        isHeading = true;
        if (paragraph.font.size >= 18) targetStyle = 'Heading 1';
        else targetStyle = 'Heading 2';
      }
      else if (paragraph.font.bold && charCount < 100 && charCount > 3 && wordCount < 15) {
        // Short bold text is likely a sub-heading
        isHeading = true;
        targetStyle = 'Heading 3';
      }
      // 3. Existing Heading Styles
      else if (paragraph.style.includes('Heading')) {
        isHeading = true;
        targetStyle = paragraph.style; // Keep existing level but normalize format
      }

      // Application Logic
      if (isHeading) {
        // Apply Style
        if (targetStyle && paragraph.style !== targetStyle) {
          paragraph.style = targetStyle;
        }

        // Enforce Clean Formatting
        paragraph.font.name = 'Calibri';
        paragraph.font.color = 'Black'; // Standard black
        paragraph.font.bold = true;
        paragraph.font.italic = false;
        paragraph.font.underline = Word.UnderlineType.none;
        paragraph.alignment = Word.Alignment.left;

        // Enforce Sizes based on level
        if (paragraph.style === 'Heading 1') {
          paragraph.font.size = 16;
        } else if (paragraph.style === 'Heading 2') {
          paragraph.font.size = 14;
        } else if (paragraph.style === 'Heading 3') {
          paragraph.font.size = 12;
        }
      }
    });

    await context.sync();
  });
};

/**
 * Normalize font styles across entire document
 */
/**
 * Normalize font styles across entire document
 * Excludes Headings, Code blocks, and other special styles
 */
export const normalizeDocumentFonts = async (fontName: string = 'Calibri', fontSize: number = 12): Promise<void> => {
  await Word.run(async (context) => {
    const paragraphs = context.document.body.paragraphs;
    paragraphs.load('items, style, font');
    await context.sync();

    paragraphs.items.forEach((paragraph) => {
      const style = paragraph.style;

      // Exclusion Logic
      // 1. Headings
      if (style.includes('Heading')) return;

      // 2. Code Blocks (often named "Code", "Macro Text", "Consolas")
      if (style.includes('Code') || style.includes('Macro') || paragraph.font.name === 'Courier New' || paragraph.font.name === 'Consolas') return;

      // 3. Quotes/Titles/Subtitles
      if (style.includes('Quote') || style.includes('Title') || style.includes('Subtitle')) return;

      // Apply Normalization
      paragraph.font.name = fontName;
      paragraph.font.size = fontSize;

      // Note: We deliberately do NOT reset bold/italic to preserve emphasis in body text
    });

    await context.sync();
  });
};

/**
 * Update all footers with left and right text
 */
/**
 * Update all footers with left, center, and right text
 */
export const updateAllFooters = async (leftText: string, centerText: string, rightText: string, addPageNumbers: boolean): Promise<void> => {
  await Word.run(async (context) => {
    const sections = context.document.sections;
    sections.load('items');
    await context.sync();

    for (const section of sections.items) {
      const footer = section.getFooter(Word.HeaderFooterType.primary);
      footer.clear();

      // Insert a 1x3 table for layout (Left, Center, Right)
      const table = footer.insertTable(1, 3, Word.InsertLocation.start);
      table.styleBuiltIn = Word.BuiltInStyleName.tableGrid;
      table.headerRowCount = 0;

      // Remove borders
      const border = table.getBorder(Word.BorderLocation.all);
      border.type = Word.BorderType.none;

      // Get cells
      const rangeLeft = table.getCell(0, 0).body;
      const rangeCenter = table.getCell(0, 1).body;
      const rangeRight = table.getCell(0, 2).body;

      // Insert text
      if (leftText) {
        rangeLeft.insertText(leftText, Word.InsertLocation.replace);
        rangeLeft.paragraphs.getFirst().alignment = Word.Alignment.left;
      }

      if (addPageNumbers) {
        // Insert Page Number in Center (overrides text if both present, or we can append)
        // Usually page numbers are standalone in a section
        // We use the range to insert fields
        const range = rangeCenter.getRange(Word.RangeLocation.content);
        range.insertText("Page ", Word.InsertLocation.start);
        range.insertField(Word.InsertLocation.end, Word.FieldType.page);
        range.insertText(" of ", Word.InsertLocation.end);
        range.insertField(Word.InsertLocation.end, Word.FieldType.numPages);
        rangeCenter.paragraphs.getFirst().alignment = Word.Alignment.centered;
      } else if (centerText) {
        rangeCenter.insertText(centerText, Word.InsertLocation.replace);
        rangeCenter.paragraphs.getFirst().alignment = Word.Alignment.centered;
      }

      if (rightText) {
        rangeRight.insertText(rightText, Word.InsertLocation.replace);
        rangeRight.paragraphs.getFirst().alignment = Word.Alignment.right;
      }
    }

    await context.sync();
  });
};

/**
 * Update all headers with left and right text
 */
export const updateAllHeaders = async (leftText: string, rightText: string): Promise<void> => {
  await Word.run(async (context) => {
    const sections = context.document.sections;
    sections.load('items');
    await context.sync();

    for (const section of sections.items) {
      const header = section.getHeader(Word.HeaderFooterType.primary);
      header.clear();

      // Insert a 1x2 table for layout
      const table = header.insertTable(1, 2, Word.InsertLocation.start);
      table.styleBuiltIn = Word.BuiltInStyleName.tableGrid;
      table.headerRowCount = 0;

      // Remove borders
      const border = table.getBorder(Word.BorderLocation.all);
      border.type = Word.BorderType.none;

      // Get cells
      const rangeLeft = table.getCell(0, 0).body;
      const rangeRight = table.getCell(0, 1).body;

      // Insert text
      if (leftText) {
        rangeLeft.insertText(leftText, Word.InsertLocation.replace);
        rangeLeft.paragraphs.getFirst().alignment = Word.Alignment.left;
      }

      if (rightText) {
        rangeRight.insertText(rightText, Word.InsertLocation.replace);
        rangeRight.paragraphs.getFirst().alignment = Word.Alignment.right;
      }
    }

    await context.sync();
  });
};

/**
 * Apply bullet list to selection
 */
export const applyBulletList = async (): Promise<void> => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();
    const paragraphs = range.paragraphs;
    paragraphs.load('items');
    await context.sync();

    paragraphs.items.forEach((paragraph) => {
      paragraph.startNewList();
      const listItem = paragraph.listItemOrNullObject;
      listItem.load('level');
      listItem.level = 0;
    });

    await context.sync();
  });
};

/**
 * Apply numbered list to selection
 */
export const applyNumberedList = async (): Promise<void> => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();
    const paragraphs = range.paragraphs;
    paragraphs.load('items');
    await context.sync();

    // Use built-in numbering template
    const firstParagraph = paragraphs.getFirst();
    firstParagraph.startNewList();

    for (let i = 1; i < paragraphs.items.length; i++) {
      paragraphs.items[i].attachToList(firstParagraph.list.id, 0);
    }

    await context.sync();
  });
};

/**
 * Center all images in the document
 */
export const centerAllImages = async (padding: number = 0, addCaptions: boolean = false, alignment: 'left' | 'centered' | 'right' = 'centered'): Promise<void> => {
  await Word.run(async (context) => {
    // 1. Convert Floating Images to Inline (Batch 1)
    try {
      const shapes = context.document.body.shapes;
      shapes.load('items');
      await context.sync();

      // Iterate backwards to safely modify the collection
      for (let i = shapes.items.length - 1; i >= 0; i--) {
        const shape = shapes.items[i];
        shape.load('type');
      }
      await context.sync();

      for (let i = shapes.items.length - 1; i >= 0; i--) {
        const shape = shapes.items[i];
        if (shape.type === Word.ShapeType.picture) {
          (shape as any).convertToInlinePicture();
        }
      }
      await context.sync();
    } catch (error) {
      console.warn('Error converting shapes:', error);
    }

    // 2. Load Inline Images and Context (Batch 2)
    const images = context.document.body.inlinePictures;
    images.load('items');
    await context.sync();

    // Pre-load next paragraphs for caption checking
    const nextParagraphs: Word.Paragraph[] = [];
    if (addCaptions) {
      for (const image of images.items) {
        const nextPara = image.paragraph.getNextOrNullObject();
        nextPara.load('text');
        nextParagraphs.push(nextPara);
      }
      // Sync to get the texts
      await context.sync();
    }

    // 3. Apply Formatting and Insert Captions (Batch 3)
    let captionIndex = 1;

    for (let i = 0; i < images.items.length; i++) {
      const image = images.items[i];
      const paragraph = image.paragraph;

      // Apply Alignment & Padding
      if (alignment === 'left') paragraph.alignment = Word.Alignment.left;
      else if (alignment === 'right') paragraph.alignment = Word.Alignment.right;
      else paragraph.alignment = Word.Alignment.centered;

      paragraph.spaceBefore = padding;
      paragraph.spaceAfter = padding;

      // Apply Captions
      if (addCaptions) {
        // Safety check for nextParagraphs array
        if (i < nextParagraphs.length) {
          const nextPara = nextParagraphs[i];
          let isCaptioned = false;

          if (!nextPara.isNullObject) {
            const text = nextPara.text.trim();
            if (text.startsWith('Figure') && text.length < 100) {
              isCaptioned = true;
            }
          }

          if (!isCaptioned) {
            const captionText = `Figure ${captionIndex}: `;
            const captionParagraph = paragraph.insertParagraph(captionText, Word.InsertLocation.after);

            // Format Caption
            if (alignment === 'left') captionParagraph.alignment = Word.Alignment.left;
            else if (alignment === 'right') captionParagraph.alignment = Word.Alignment.right;
            else captionParagraph.alignment = Word.Alignment.centered;

            captionParagraph.font.italic = true;
            captionParagraph.font.size = 10;
            captionParagraph.font.name = 'Calibri';
            captionParagraph.spaceBefore = 0;
            captionParagraph.spaceAfter = 12;
          }
        }
        captionIndex++;
      }
    }

    await context.sync();
  });
};

/**
 * Set text wrapping for all images
 */
export const wrapAllImages = async (): Promise<void> => {
  await Word.run(async (context) => {
    const images = context.document.body.inlinePictures;
    images.load('items');
    await context.sync();

    // Note: Advanced image wrapping requires floating pictures
    // This sets basic inline picture alignment
    images.items.forEach((image) => {
      const paragraph = image.paragraph;
      paragraph.alignment = Word.Alignment.left;
    });

    await context.sync();
  });
};

/**
 * Auto-format entire document with standard settings
 */
export const autoFormatDocument = async (): Promise<void> => {
  await Word.run(async (context) => {
    // Set standard margins (1 inch = 72 points)
    await setDocumentMargins({
      top: 72,
      bottom: 72,
      left: 72,
      right: 72,
    });

    // Normalize fonts
    await normalizeDocumentFonts('Calibri', 11);

    // Fix headings
    await fixAllHeadings();

    // Center images
    await centerAllImages();

    await context.sync();
  });
};

/**
 * Insert text with specific formatting
 */
export const insertFormattedText = async (
  text: string,
  formatting: {
    fontName?: string;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    color?: string;
  }
): Promise<void> => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();
    const insertedRange = range.insertText(text, Word.InsertLocation.end);

    if (formatting.fontName) insertedRange.font.name = formatting.fontName;
    if (formatting.fontSize) insertedRange.font.size = formatting.fontSize;
    if (formatting.bold !== undefined) insertedRange.font.bold = formatting.bold;
    if (formatting.italic !== undefined) insertedRange.font.italic = formatting.italic;
    if (formatting.color) insertedRange.font.color = formatting.color;

    await context.sync();
  });
};

/**
 * Clear all formatting from selection
 */
export const clearFormatting = async (): Promise<void> => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();
    range.font.reset();
    await context.sync();
  });
};

/**
 * Get document statistics
 */
export const getDocumentStats = async (): Promise<{
  characterCount: number;
  wordCount: number;
  paragraphCount: number;
}> => {
  return await Word.run(async (context) => {
    const body = context.document.body;
    body.load('text');

    const paragraphs = body.paragraphs;
    paragraphs.load('items');

    await context.sync();

    const text = body.text;
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = text.length;
    const paragraphCount = paragraphs.items.length;

    return {
      characterCount,
      wordCount,
      paragraphCount,
    };
  });
};

/**
 * Get the full document text
 */
export const getFullDocumentText = async (): Promise<string> => {
  return await Word.run(async (context) => {
    const body = context.document.body;
    body.load('text');
    await context.sync();
    return body.text;
  });
};

/**
 * Format the current selection with specific styles
 */
export const formatSelection = async (formatting: {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontName?: string;
  fontSize?: number;
  color?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  lineSpacing?: number;
  spaceAfter?: number;
  spaceBefore?: number;
}): Promise<void> => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();

    if (formatting.fontName) range.font.name = formatting.fontName;
    if (formatting.fontSize) range.font.size = formatting.fontSize;
    if (formatting.bold !== undefined) range.font.bold = formatting.bold;
    if (formatting.italic !== undefined) range.font.italic = formatting.italic;
    if (formatting.underline !== undefined) {
      range.font.underline = formatting.underline ? Word.UnderlineType.single : Word.UnderlineType.none;
    }
    if (formatting.color) range.font.color = formatting.color;

    if (formatting.alignment || formatting.lineSpacing || formatting.spaceAfter !== undefined || formatting.spaceBefore !== undefined) {
      const paragraphs = range.paragraphs;
      paragraphs.load('items');
      await context.sync();

      paragraphs.items.forEach(p => {
        if (formatting.alignment) {
          p.alignment = formatting.alignment as Word.Alignment;
        }
        if (formatting.lineSpacing) {
          p.lineSpacing = formatting.lineSpacing;
        }
        if (formatting.spaceAfter !== undefined) {
          p.spaceAfter = formatting.spaceAfter;
        }
        if (formatting.spaceBefore !== undefined) {
          p.spaceBefore = formatting.spaceBefore;
        }
      });
    }

    await context.sync();
  });
};

/**
 * Format the entire document with specific styles
 */
export const formatDocument = async (formatting: {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontName?: string;
  fontSize?: number;
  color?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}): Promise<void> => {
  await Word.run(async (context) => {
    const body = context.document.body;

    if (formatting.fontName) body.font.name = formatting.fontName;
    if (formatting.fontSize) body.font.size = formatting.fontSize;
    if (formatting.bold !== undefined) body.font.bold = formatting.bold;
    if (formatting.italic !== undefined) body.font.italic = formatting.italic;
    if (formatting.underline !== undefined) {
      body.font.underline = formatting.underline ? Word.UnderlineType.single : Word.UnderlineType.none;
    }
    if (formatting.color) body.font.color = formatting.color;

    if (formatting.alignment) {
      const paragraphs = body.paragraphs;
      paragraphs.load('items');
      await context.sync();

      paragraphs.items.forEach(p => {
        p.alignment = formatting.alignment as Word.Alignment;
      });
    }

    await context.sync();
  });
};

/**
 * Add border to the current selection using HTML table
 */
export const addBorderToSelection = async (options?: {
  style?: string;
  color?: string;
  width?: number;
}): Promise<void> => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();
    range.load('text');
    await context.sync();

    const originalText = range.text;
    const borderStyle = options?.style || 'solid';
    const borderColor = options?.color || '#000000';
    const borderWidth = options?.width || 1;

    // Insert HTML table with border for better control
    const htmlContent = `
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="border: ${borderWidth}pt ${borderStyle} ${borderColor}; padding: 10pt;">
            ${originalText.replace(/\n/g, '<br>')}
          </td>
        </tr>
      </table>
    `;

    range.insertHtml(htmlContent, Word.InsertLocation.replace);

    await context.sync();
  });
};

/**
 * Add page border to all pages
 */
export const addPageBorder = async (options?: {
  style?: string;
  color?: string;
  width?: number;
  applyToAllPages?: boolean;
}): Promise<void> => {
  await Word.run(async (context) => {
    const sections = context.document.sections;
    sections.load('items');
    await context.sync();

    const borderStyle = options?.style || 'solid';
    const borderColor = options?.color || '#000000';
    const borderWidth = options?.width || 6;

    // Apply border to each section using tables
    for (const section of sections.items) {
      const body = section.body;
      body.load('text');
      await context.sync();

      const content = body.text;

      // Insert a bordered table at the start of the section
      const htmlBorder = `
        <table style="border-collapse: collapse; width: 100%; height: 100%;">
          <tr>
            <td style="border: ${borderWidth}pt ${borderStyle} ${borderColor}; padding: 30pt;">
              ${content.replace(/\n/g, '<br>')}
            </td>
          </tr>
        </table>
      `;

      body.insertHtml(htmlBorder, Word.InsertLocation.replace);
    }

    await context.sync();
  });
};

/**
 * Add border to paragraphs using HTML tables
 */
export const addBorderToParagraphs = async (options?: {
  style?: string;
  color?: string;
  width?: number;
  target?: 'selection' | 'document';
  borderPosition?: 'top' | 'bottom' | 'all';
}): Promise<void> => {
  await Word.run(async (context) => {
    let range;
    if (options?.target === 'document') {
      range = context.document.body.getRange();
    } else {
      range = context.document.getSelection();
    }

    range.load('text');
    await context.sync();

    const borderStyle = options?.style || 'solid';
    const borderColor = options?.color || '#000000';
    const borderWidth = options?.width || 1;
    const position = options?.borderPosition || 'all';

    let borderCss = '';
    if (position === 'all') {
      borderCss = `border: ${borderWidth}pt ${borderStyle} ${borderColor};`;
    } else if (position === 'top') {
      borderCss = `border-top: ${borderWidth}pt ${borderStyle} ${borderColor};`;
    } else if (position === 'bottom') {
      borderCss = `border-bottom: ${borderWidth}pt ${borderStyle} ${borderColor};`;
    }

    const content = range.text;
    const htmlContent = `
      <div style="${borderCss} padding: 10pt;">
        ${content.replace(/\n/g, '<br>')}
      </div>
    `;

    range.insertHtml(htmlContent, Word.InsertLocation.replace);

    await context.sync();
  });
};

/**
 * Remove borders from selection or document (removes table wrappers)
 */
export const removeBorders = async (target?: 'selection' | 'document'): Promise<void> => {
  await Word.run(async (context) => {
    let tables;
    if (target === 'document') {
      tables = context.document.body.tables;
    } else {
      const range = context.document.getSelection();
      tables = range.tables;
    }

    tables.load('items');
    await context.sync();

    // Remove borders from all tables
    tables.items.forEach((table) => {
      const borders = [
        table.getBorder(Word.BorderLocation.top),
        table.getBorder(Word.BorderLocation.bottom),
        table.getBorder(Word.BorderLocation.left),
        table.getBorder(Word.BorderLocation.right),
        table.getBorder(Word.BorderLocation.insideHorizontal),
        table.getBorder(Word.BorderLocation.insideVertical),
      ];

      borders.forEach((border) => {
        border.type = Word.BorderType.none;
      });
    });

    await context.sync();
  });
};

/**
 * Add decorative border with custom styling (box effect)
 */
export const addDecorativeBorder = async (options?: {
  style?: string;
  color?: string;
  width?: number;
  padding?: number;
  shading?: string;
}): Promise<void> => {
  await Word.run(async (context) => {
    const range = context.document.getSelection();
    range.load('text');
    await context.sync();

    const borderStyle = options?.style || 'double';
    const borderColor = options?.color || '#0078D4';
    const borderWidth = options?.width || 4;
    const padding = options?.padding || 15;
    const backgroundColor = options?.shading || 'transparent';

    const originalText = range.text;

    // Create decorative bordered box using HTML
    const htmlContent = `
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="border: ${borderWidth}pt ${borderStyle} ${borderColor}; padding: ${padding}pt; background-color: ${backgroundColor};">
            ${originalText.replace(/\n/g, '<br>')}
          </td>
        </tr>
      </table>
    `;

    range.insertHtml(htmlContent, Word.InsertLocation.replace);

    await context.sync();
  });
};
