
import { parseMarkdownToHtml } from './markdownParser';

const testCases = [
    {
        name: "Bold in List",
        input: "* **Bold Item**",
        expected: '<ul><li><span style="font-weight:bold;">Bold Item</span></li></ul>'
    },
    {
        name: "Italic in List",
        input: "* *Italic Item*",
        expected: '<ul><li><span style="font-style:italic;">Italic Item</span></li></ul>'
    },
    {
        name: "Mixed in List",
        input: "* **Bold** and *Italic*",
        expected: '<ul><li><span style="font-weight:bold;">Bold</span> and <span style="font-style:italic;">Italic</span></li></ul>'
    }
];

console.log("--- Testing parseMarkdownToHtml with inline styles ---");
testCases.forEach(test => {
    const output = parseMarkdownToHtml(test.input);
    console.log(`\nTest: ${test.name}`);
    console.log(`Input: ${JSON.stringify(test.input)}`);
    console.log(`Output: ${JSON.stringify(output)}`);
});
