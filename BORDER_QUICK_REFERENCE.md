# Border Feature - Quick Reference

## User Commands → AI Actions

### Basic Borders

| User Says | Command | Args |
|-----------|---------|------|
| "add a border" | `addBorder` | `{ style: "solid", color: "#000000", width: 1 }` |
| "add border to selection" | `addBorder` | Default args |
| "remove border" | `removeBorders` | `{ target: "selection" }` |

### Styled Borders

| User Says | Command | Args |
|-----------|---------|------|
| "red border" | `addBorder` | `{ color: "#FF0000" }` |
| "thick border" | `addBorder` | `{ width: 6 }` |
| "double border" | `addBorder` | `{ style: "double" }` |
| "wavy border" | `addBorder` | `{ style: "wave" }` |
| "curly border" | `addBorder` | `{ style: "wave" }` |
| "dotted border" | `addBorder` | `{ style: "dotted" }` |

### Page Borders

| User Says | Command | Args |
|-----------|---------|------|
| "page border" | `addPageBorder` | Default args |
| "border on all pages" | `addPageBorder` | `{ applyToAllPages: true }` |
| "border on one page" | `addPageBorder` | `{ applyToAllPages: false }` |

### Decorative Borders

| User Says | Command | Args |
|-----------|---------|------|
| "decorative border" | `addDecorativeBorder` | Default args |
| "fancy box" | `addDecorativeBorder` | `{ style: "double", width: 4 }` |
| "highlighted box" | `addDecorativeBorder` | `{ shading: "#FFFACD" }` |

## Border Style Cheat Sheet

```
solid   ─────────────  (default, professional)
double  ═════════════  (elegant, formal)
dotted  ·············  (casual, informal)
dashed  ─ ─ ─ ─ ─ ─   (modern)
triple  ≡≡≡≡≡≡≡≡≡≡≡≡≡  (decorative)
wave    ~~~~~~~~~~~~   (creative, playful)
```

## Common Color Codes

```
Black:  #000000
Blue:   #0078D4 (Microsoft Blue)
Red:    #FF0000
Green:  #4CAF50
Gold:   #FFD700
Purple: #9C27B0
Orange: #FF9800
Pink:   #E91E63
```

## Width Guidelines

```
1pt  = Subtle, minimal
2pt  = Standard text border
3pt  = Noticeable
4pt  = Prominent
6pt  = Page border (recommended)
8pt+ = Decorative, certificate-style
```

## Example JSON Responses

### Simple Border
```json
{
  "chatResponse": "I've added a border to the selected text.",
  "action": {
    "type": "command",
    "commandName": "addBorder",
    "args": {
      "style": "solid",
      "color": "#000000",
      "width": 2
    }
  }
}
```

### Colorful Thick Border
```json
{
  "chatResponse": "I've added a thick blue border.",
  "action": {
    "type": "command",
    "commandName": "addBorder",
    "args": {
      "style": "solid",
      "color": "#0078D4",
      "width": 5
    }
  }
}
```

### Decorative Box
```json
{
  "chatResponse": "I've created a decorative box with a double border.",
  "action": {
    "type": "command",
    "commandName": "addDecorativeBorder",
    "args": {
      "style": "double",
      "color": "#0078D4",
      "width": 4,
      "padding": 20,
      "shading": "#F0F8FF"
    }
  }
}
```

### Page Border (All Pages)
```json
{
  "chatResponse": "I've added a border to all pages.",
  "action": {
    "type": "command",
    "commandName": "addPageBorder",
    "args": {
      "style": "solid",
      "color": "#000000",
      "width": 6,
      "applyToAllPages": true
    }
  }
}
```

### Complex Border Request
```json
{
  "chatResponse": "I've added a wavy red border with medium thickness.",
  "action": {
    "type": "command",
    "commandName": "addBorder",
    "args": {
      "style": "wave",
      "color": "#FF0000",
      "width": 3
    }
  }
}
```

## Multi-Command with Borders

```json
{
  "chatResponse": "I've formatted your certificate with borders and styling.",
  "action": {
    "type": "multi-command",
    "multiCommands": [
      {
        "commandName": "setMargins",
        "args": { "top": 108, "bottom": 108, "left": 108, "right": 108 }
      },
      {
        "commandName": "addPageBorder",
        "args": {
          "style": "double",
          "color": "#FFD700",
          "width": 8,
          "applyToAllPages": false
        }
      },
      {
        "commandName": "normalizeFonts",
        "args": { "fontName": "Times New Roman", "fontSize": 14 }
      }
    ]
  }
}
```

## Testing Checklist

- [ ] Simple border (solid, black, 1pt)
- [ ] Colored border (red, blue, green)
- [ ] Thick border (6pt+)
- [ ] Different styles (double, dotted, dashed, wave)
- [ ] Page border (all pages)
- [ ] Page border (single page)
- [ ] Decorative border with shading
- [ ] Remove borders
- [ ] Border on selected text
- [ ] Border on paragraph
- [ ] Multi-command with borders
- [ ] Edge cases (empty selection, entire document)

## Troubleshooting

**Border not appearing?**
- Ensure text is selected for selection borders
- Check if border color matches background
- Verify width is not 0

**Border looks different than expected?**
- HTML tables may have slightly different rendering
- Some styles work better with thicker widths
- Try adjusting width or style

**Page border affects layout?**
- Reduce border width
- Adjust margins to accommodate border
- Use decorative border instead for sections

## API Reference

### Function Signatures

```typescript
addBorderToSelection(options?: {
  style?: string;
  color?: string;
  width?: number;
}): Promise<void>

addPageBorder(options?: {
  style?: string;
  color?: string;
  width?: number;
  applyToAllPages?: boolean;
}): Promise<void>

addBorderToParagraphs(options?: {
  style?: string;
  color?: string;
  width?: number;
  target?: 'selection' | 'document';
  borderPosition?: 'top' | 'bottom' | 'all';
}): Promise<void>

removeBorders(target?: 'selection' | 'document'): Promise<void>

addDecorativeBorder(options?: {
  style?: string;
  color?: string;
  width?: number;
  padding?: number;
  shading?: string;
}): Promise<void>
```
