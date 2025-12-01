/**
 * Simple Markdown to HTML parser for Word Add-in
 * Converts basic Markdown syntax to HTML that Word can interpret.
 */

/**
 * Simple Markdown to HTML parser for Word Add-in
 * Converts basic Markdown syntax to HTML that Word can interpret.
 */
export const parseMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return '';

    const lines = markdown.split('\n');
    let html = '';
    let inList = false;
    let listType = ''; // 'ul' or 'ol'
    let inTable = false;
    let tableHeaderParsed = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Check for empty lines
        if (line.trim() === '') {
            if (inList) {
                html += `</${listType}>`;
                inList = false;
            }
            if (inTable) {
                html += '</tbody></table>';
                inTable = false;
                tableHeaderParsed = false;
            }
            continue;
        }

        // Table Detection
        if (line.trim().startsWith('|')) {
            if (!inTable) {
                // Check if it's a valid table start (next line should be separator)
                if (i + 1 < lines.length && lines[i + 1].trim().startsWith('|') && lines[i + 1].includes('---')) {
                    html += '<table border="1" style="border-collapse: collapse; width: 100%;"><thead><tr>';
                    const headers = line.split('|').filter(cell => cell.trim() !== '');
                    headers.forEach(header => {
                        html += `<th style="padding: 8px; border: 1px solid #000000; background-color: #f2f2f2; font-weight: bold;">${parseInline(header.trim())}</th>`;
                    });
                    html += '</tr></thead><tbody>';
                    inTable = true;
                    tableHeaderParsed = true;
                    i++; // Skip the separator line
                    continue;
                }
            } else if (tableHeaderParsed) {
                // Table Row
                if (line.includes('---')) continue; // Skip separator if encountered again
                html += '<tr>';
                // Better split: split by |, then ignore first and last if empty?
                // Standard markdown tables have leading/trailing pipes often.
                // Let's use a regex or cleaner split.
                const rowContent = line.trim().replace(/^\||\|$/g, '');
                const rowCells = rowContent.split('|');

                rowCells.forEach(cell => {
                    html += `<td style="padding: 8px; border: 1px solid #000000;">${parseInline(cell.trim())}</td>`;
                });
                html += '</tr>';
                continue;
            }
        } else if (inTable) {
            html += '</tbody></table>';
            inTable = false;
            tableHeaderParsed = false;
        }

        // Headers
        if (line.match(/^#{1,6} /)) {
            if (inList) { html += `</${listType}>`; inList = false; }
            const level = line.match(/^#{1,6}/)![0].length;
            const content = line.replace(/^#{1,6} /, '');
            html += `<h${level}>${parseInline(content)}</h${level}>`;
            continue;
        }

        // Unordered List
        if (line.match(/^\s*[\*\-\+] /)) {
            if (!inList || listType === 'ol') {
                if (inList) html += `</${listType}>`;
                html += '<ul>';
                inList = true;
                listType = 'ul';
            }
            const content = line.replace(/^\s*[\*\-\+] /, '');
            html += `<li>${parseInline(content)}</li>`;
            continue;
        }

        // Ordered List
        if (line.match(/^\s*\d+\. /)) {
            if (!inList || listType === 'ul') {
                if (inList) html += `</${listType}>`;
                html += '<ol>';
                inList = true;
                listType = 'ol';
            }
            const content = line.replace(/^\s*\d+\. /, '');
            html += `<li>${parseInline(content)}</li>`;
            continue;
        }

        // Close list if we encounter a non-list line
        if (inList) {
            html += `</${listType}>`;
            inList = false;
        }

        // Paragraphs
        if (line.match(/^\s*[\*\-\+][A-Za-z0-9]/)) {
            if (!inList || listType === 'ol') {
                if (inList) html += `</${listType}>`;
                html += '<ul>';
                inList = true;
                listType = 'ul';
            }
            const content = line.replace(/^\s*[\*\-\+]/, '');
            html += `<li>${parseInline(content)}</li>`;
            continue;
        }

        html += `<p>${parseInline(line)}</p>`;
    }

    if (inList) {
        html += `</${listType}>`;
    }
    if (inTable) {
        html += '</tbody></table>';
    }

    return html;
};

// Export the old name for compatibility if needed, but we replaced the implementation.
export const markdownToHtml = parseMarkdownToHtml;

const parseInline = (text: string): string => {
    let html = text;

    // Bold *** or ___
    // Use [\s\S] to match newlines if they somehow exist, though we split by line.
    html = html.replace(/\*\*\*([\s\S]*?)\*\*\*/g, '<span style="font-weight:bold;font-style:italic;">$1</span>');
    html = html.replace(/___([\s\S]*?)___/g, '<span style="font-weight:bold;font-style:italic;">$1</span>');

    // Bold ** or __
    html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<span style="font-weight:bold;">$1</span>');
    html = html.replace(/__([\s\S]*?)__/g, '<span style="font-weight:bold;">$1</span>');

    // Italic * or _
    // We want to match *word* or *word.* or * word *
    // The previous regex \*(.*?)\* was correct for non-greedy matching.
    // Let's ensure we handle cases where * is part of the text? No, markdown assumes * is formatting.
    html = html.replace(/\*([\s\S]*?)\*/g, '<span style="font-style:italic;">$1</span>');
    html = html.replace(/_([\s\S]*?)_/g, '<span style="font-style:italic;">$1</span>');

    // Code `
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    return html;
};
