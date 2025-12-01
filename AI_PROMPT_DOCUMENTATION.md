# 🎯 Advanced AI Prompt System - Documentation

## Overview

The JV-ForMate Word Add-in now features an **enterprise-level AI prompt system** that provides sophisticated Microsoft Word document engineering capabilities. This document explains the enhanced system architecture and capabilities.

---

## 🚀 What's New in v3.0

### Core Enhancements

1. **Publication-Grade Formatting**
   - Automatic document type detection (reports, proposals, legal docs, etc.)
   - Professional formatting standards application
   - Complex layout management (margins, spacing, alignment)

2. **Knowledge-Driven Content Generation**
   - NO placeholders - generates actual, complete content
   - Uses vast knowledge base for specific facts and data
   - Contextual awareness for topic-specific details

3. **Multi-Command Execution**
   - Execute multiple formatting commands in sequence
   - Batch operations for comprehensive document transformation
   - Professional workflow automation

4. **Advanced Spacing & Typography**
   - Line spacing control (1.0, 1.15, 1.5, 2.0)
   - Paragraph spacing (before/after)
   - Professional font schemes and combinations

---

## 📊 Supported Document Types

The AI automatically detects and applies appropriate formatting for:

### 1. Technical Reports / Research Papers
- **Font**: Georgia 11pt body, Calibri headings
- **Margins**: 1" all sides (Normal)
- **Spacing**: 1.5 line spacing, 6pt after paragraphs
- **Alignment**: Justified body text
- **Structure**: Title → Abstract → ToC → Body → References
- **Headers/Footers**: Document title, page numbers

### 2. Business Proposals / Executive Summaries
- **Font**: Calibri 11pt, Calibri Light headings
- **Margins**: Moderate (1" top/bottom, 0.75" sides)
- **Spacing**: 1.15 line spacing, 8pt after
- **Colors**: Corporate blue (#0078D4) for headings
- **Features**: Executive summary boxes, bullet points

### 3. Legal Documents / Contracts
- **Font**: Times New Roman 12pt
- **Spacing**: Double-spaced (2.0)
- **Alignment**: Fully justified
- **Numbering**: Multi-level sections (1.0, 1.1, 1.1.1)
- **Style**: Pure black and white, ALL CAPS headers

### 4. Newsletters / Articles
- **Font**: Arial 10pt
- **Layout**: 2-column format
- **Margins**: Narrow (0.5" all sides)
- **Features**: Inline images, callout boxes, pull quotes

### 5. Academic Essays / Assignments
- **Font**: Times New Roman 12pt
- **Spacing**: Double-spaced
- **Alignment**: Left-aligned
- **Format**: MLA/APA standard compliance

### 6. Technical Manuals / User Guides
- **Font**: Verdana 10pt (high readability)
- **Margins**: Wide left margin for binding
- **Features**: Numbered sections, ToC, screenshots with captions
- **Elements**: Warning/note boxes with colored backgrounds

### 7. Resumes / CVs
- **Font**: Calibri 11pt
- **Margins**: Moderate (0.75" all sides)
- **Style**: Action verbs, bullet points for achievements
- **Length**: Single page preferred

---

## 🎨 AI Capabilities

### Content Generation
- **Research-Based**: Uses real facts, statistics, dates
- **Comprehensive**: 200-1500+ words depending on request
- **Structured**: Proper introduction → body → conclusion flow
- **Authoritative**: Professional, well-researched tone

### Formatting Intelligence
- **Auto-Detection**: Identifies document type from user prompt
- **Proactive**: Suggests formatting improvements
- **Comprehensive**: Handles all Word features (headers, footers, margins, styles)
- **Consistent**: Maintains professional standards throughout

### Advanced Features
- **Tables**: Complex tables with headers, merged cells, alternating rows
- **Lists**: Bulleted, numbered, multi-level outlines
- **Images**: Alignment, wrapping, captions, alt text
- **Themes**: Office, Academic, Professional, Modern, Classic
- **Typography**: Professional font schemes and color palettes

---

## 🛠️ Action Types

The AI can perform these action types:

### 1. `insert`
Insert new content at cursor position
```json
{
  "type": "insert",
  "content": "Content with \\n newlines",
  "formatting": {
    "fontName": "Calibri",
    "fontSize": 11,
    "lineSpacing": 1.5,
    "spaceAfter": 6
  }
}
```

### 2. `replace`
Replace selected text with new content
```json
{
  "type": "replace",
  "content": "Replacement content"
}
```

### 3. `format`
Apply formatting without changing content
```json
{
  "type": "format",
  "formatting": {
    "bold": true,
    "color": "#0078D4"
  }
}
```

### 4. `command`
Execute a single Word command
```json
{
  "type": "command",
  "commandName": "fixHeadings"
}
```

### 5. `multi-command`
Execute multiple commands in sequence
```json
{
  "type": "multi-command",
  "multiCommands": [
    { "commandName": "fixHeadings" },
    { "commandName": "normalizeFonts", "args": { "fontName": "Calibri", "fontSize": 11 } },
    { "commandName": "setMargins", "args": { "top": 72, "bottom": 72 } }
  ]
}
```

### 6. `chat`
Informational response only
```json
{
  "type": "chat"
}
```

---

## 📋 Available Commands

### Document Structure
- `fixHeadings` - Auto-detect and standardize headings
- `normalizeFonts` - Standardize font throughout document
- `clearFormatting` - Remove all formatting
- `autoFormat` - Apply comprehensive auto-formatting

### Layout & Spacing
- `setMargins` - Set document margins (in points, 72pt = 1 inch)
  ```json
  { "top": 72, "bottom": 72, "left": 72, "right": 72 }
  ```

### Headers & Footers
- `updateHeader` - Set header content
  ```json
  { "leftText": "Title", "rightText": "Author" }
  ```
- `updateFooter` - Set footer content
  ```json
  { "leftText": "Confidential", "addPageNumbers": true }
  ```

### Images
- `formatImages` - Format all images
  ```json
  { "alignment": "centered", "addCaptions": true }
  ```

### Lists
- `applyBulletList` - Apply bullet list to selection
- `applyNumberedList` - Apply numbered list to selection

---

## 🎯 Formatting Properties

### Font Properties
- `fontName`: "Calibri" | "Arial" | "Georgia" | "Times New Roman" | "Verdana"
- `fontSize`: 10 | 11 | 12 | 14 | 16 | 18
- `bold`: boolean
- `italic`: boolean
- `underline`: boolean
- `color`: "black" | "#0078D4" | "rgb(0,0,0)"

### Paragraph Properties
- `alignment`: "left" | "center" | "right" | "justify"
- `lineSpacing`: 1.0 | 1.15 | 1.5 | 2.0
- `spaceAfter`: 0 | 6 | 8 | 10 | 12 (in points)
- `spaceBefore`: 0 | 6 | 8 | 10 | 12 (in points)

---

## 💡 Usage Examples

### Example 1: Generate Technical Report
**User**: "Write a report on AI in healthcare"

**AI Response**:
- Detects: Technical Report type
- Applies: Georgia font, 1.5 spacing, justified alignment
- Generates: Complete 1000+ word report with:
  - Title and abstract
  - Multiple sections with proper headings
  - Data tables comparing AI applications
  - Real statistics and facts
  - Professional conclusion

### Example 2: Format as Business Proposal
**User**: "Make this look like a professional business proposal"

**AI Response**:
```json
{
  "type": "multi-command",
  "multiCommands": [
    { "commandName": "normalizeFonts", "args": { "fontName": "Calibri", "fontSize": 11 } },
    { "commandName": "fixHeadings" },
    { "commandName": "setMargins", "args": { "top": 72, "bottom": 72, "left": 54, "right": 54 } },
    { "commandName": "updateHeader", "args": { "rightText": "Business Proposal 2024" } },
    { "commandName": "updateFooter", "args": { "leftText": "Confidential", "addPageNumbers": true } }
  ]
}
```

### Example 3: Academic Essay Formatting
**User**: "Format this as an MLA essay"

**AI Response**:
- Applies: Times New Roman 12pt
- Sets: Double spacing (2.0)
- Configures: 1" margins all sides
- Adds: Header with last name + page number
- Ensures: Left alignment, proper citations format

---

## 🔧 Technical Implementation

### JSON Response Format
```json
{
  "chatResponse": "Brief confirmation message",
  "action": {
    "type": "insert|replace|format|command|multi-command|chat",
    "target": "selection|document",
    "content": "Content with \\n for newlines",
    "formatting": {
      // Font and paragraph properties
    },
    "commandName": "commandName",
    "args": { /* command arguments */ },
    "multiCommands": [
      { "commandName": "command1", "args": {} }
    ]
  }
}
```

### Critical JSON Rules
1. **Escape newlines**: Use `\\n` not actual newlines
2. **Escape quotes**: Use `\\"` for quotes inside strings
3. **No markdown blocks**: Return raw JSON only
4. **Validate schema**: Must match exact structure

---

## 🎨 Design Philosophy

### 1. Proactive Intelligence
The AI doesn't just respond to requests - it **anticipates needs**:
- User asks for "a report" → AI applies professional report formatting
- User mentions "legal document" → AI uses appropriate legal standards
- User requests "make it professional" → AI applies comprehensive formatting

### 2. Knowledge-Driven
- NO placeholders or templates
- Real facts and data from knowledge base
- Specific examples and case studies
- Authoritative, well-researched content

### 3. Publication-Grade Quality
- Engineering-level documentation standards
- Professional typography and spacing
- Consistent formatting throughout
- Industry-standard compliance (MLA, APA, legal formats)

### 4. Holistic Document Engineering
- Thinks beyond just text content
- Considers layout, structure, visual hierarchy
- Applies appropriate themes and styles
- Manages headers, footers, margins comprehensively

---

## 📊 Performance Metrics

- **Content Density**: 200-1500 words per generation
- **Formatting Accuracy**: Pixel-perfect professional standards
- **Response Time**: < 5 seconds for complex operations
- **Knowledge Coverage**: Broad domain expertise
- **Format Support**: 7+ major document types

---

## 🚀 Future Enhancements

Planned features:
- [ ] Custom theme creation
- [ ] Template library integration
- [ ] Multi-language support
- [ ] Advanced table of contents generation
- [ ] Bibliography management
- [ ] Style guide enforcement (Chicago, APA, MLA)
- [ ] Document comparison and merging
- [ ] Version control integration

---

## 📝 Best Practices

### For Users
1. **Be specific**: "Write a technical report on X" vs "Write about X"
2. **Mention document type**: "Format as legal document", "Make it academic"
3. **Request features**: "Add header with title", "Include page numbers"
4. **Combine requests**: "Write a report on X with professional formatting"

### For Developers
1. **Always validate JSON** before returning to prevent parsing errors
2. **Escape special characters** properly in content strings
3. **Test all action types** with various formatting combinations
4. **Handle errors gracefully** with fallback responses
5. **Log AI responses** for debugging and improvement

---

## 🔍 Troubleshooting

### Common Issues

**Issue**: JSON parsing error
- **Solution**: Ensure all newlines are escaped as `\\n`

**Issue**: Formatting not applied
- **Solution**: Check that target is set correctly (selection vs document)

**Issue**: Command not executed
- **Solution**: Verify command name matches available commands exactly

**Issue**: Content has placeholders
- **Solution**: AI should use knowledge to generate real content; check prompt

---

## 📚 References

- [Microsoft Word JavaScript API](https://learn.microsoft.com/en-us/javascript/api/word)
- [Google Generative AI SDK](https://ai.google.dev/)
- [Professional Document Standards](https://www.chicagomanualofstyle.org/)

---

**Version**: 3.0  
**Last Updated**: November 2024  
**Maintained By**: JV-ForMate Development Team
