/**
 * Converts Markdown string to HTML
 * @param markdown - The Markdown string to convert
 * @returns The converted HTML string
 */
export function markdownToHtml(markdown: string): string {
    if (!markdown.trim()) {
        return "";
    }

    let html = markdown;

    // Escape HTML entities first (except for what we'll convert)
    html = html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Code blocks (fenced with ```) - must be processed before inline code
    html = html.replace(
        /```(\w*)\n([\s\S]*?)```/g,
        (_match, language, code) => {
            const langClass = language ? ` class="language-${language}"` : "";
            return `<pre><code${langClass}>${code.trim()}</code></pre>`;
        }
    );

    // Inline code (single backticks)
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Headers (h1-h6)
    html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
    html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
    html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // Horizontal rule
    html = html.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, "<hr>");

    // Bold and italic combinations
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/_(.+?)_/g, "<em>$1</em>");

    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");
    // Merge consecutive blockquotes
    html = html.replace(/<\/blockquote>\n<blockquote>/g, "\n");

    // Unordered lists
    html = html.replace(/^[*\-+] (.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>\n${match}</ul>\n`);

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
    html = html.replace(
        /(<li>.*<\/li>\n?)(?=<li>|\n|$)/g,
        (match, _, offset, string) => {
            // Check if this is part of an ordered list context
            const before = string.substring(0, offset);
            if (before.match(/\d+\. [^\n]+\n?$/)) {
                return match;
            }
            return match;
        }
    );

    // Links: [text](url)
    html = html.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Images: ![alt](url)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

    // Task lists
    html = html.replace(
        /<li>\[x\] (.+)<\/li>/gi,
        '<li><input type="checkbox" checked disabled> $1</li>'
    );
    html = html.replace(
        /<li>\[ \] (.+)<\/li>/g,
        '<li><input type="checkbox" disabled> $1</li>'
    );

    // Paragraphs (double newlines)
    const lines = html.split(/\n\n+/);
    html = lines
        .map((line) => {
            const trimmed = line.trim();
            // Skip if already wrapped in block element
            if (
                trimmed.startsWith("<h") ||
                trimmed.startsWith("<p") ||
                trimmed.startsWith("<ul") ||
                trimmed.startsWith("<ol") ||
                trimmed.startsWith("<blockquote") ||
                trimmed.startsWith("<pre") ||
                trimmed.startsWith("<hr") ||
                trimmed === ""
            ) {
                return trimmed;
            }
            return `<p>${trimmed}</p>`;
        })
        .join("\n\n");

    // Clean up extra newlines within paragraphs
    html = html.replace(/<p>([\s\S]*?)<\/p>/g, (_match, content) => {
        return `<p>${content.replace(/\n/g, "<br>")}</p>`;
    });

    return html.trim();
}
