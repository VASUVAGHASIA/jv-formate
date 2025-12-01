
import { parseMarkdownToHtml } from './markdownParser';

const testCases = [
    {
        name: "Bold in List",
        input: "* **Bold Item**",
        expected: "<ul><li><strong>Bold Item</strong></li></ul>" // Approximately
    },
    {
        name: "Italic in List",
        input: "* *Italic Item*",
        expected: "<ul><li><em>Italic Item</em></li></ul>"
    },
    {
        name: "Mixed in List",
        input: "* **Bold** and *Italic*",
        expected: "<ul><li><strong>Bold</strong> and <em>Italic</em></li></ul>"
    },
    {
        name: "Bold Italic in List",
        input: "* ***Bold Italic***",
        expected: "<ul><li><strong><em>Bold Italic</em></strong></li></ul>"
    },
    {
        name: "List with plain text",
        input: "* Plain Item",
        expected: "<ul><li>Plain Item</li></ul>"
    },
    {
        name: "Multiline List",
        input: "* Item 1\n* **Item 2**",
        expected: "<ul><li>Item 1</li><li><strong>Item 2</strong></li></ul>"
    }
];

console.log("--- Testing parseMarkdownToHtml ---");
testCases.forEach(test => {
    const output = parseMarkdownToHtml(test.input);
    console.log(`\nTest: ${test.name}`);
    console.log(`Input: ${JSON.stringify(test.input)}`);
    console.log(`Output: ${JSON.stringify(output)}`);
});
