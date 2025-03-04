/**
 * Formats text with Markdown syntax into HTML
 * Supports:
 * - Headers (# Title, ## Subtitle, etc.)
 * - Paragraphs (separated by blank lines)
 * - Bullet points (lines starting with "- " or "* ")
 * - Numbered lists (lines starting with "1. ", "2. ", etc.)
 * - Bold text (wrapped in ** or __)
 * - Italic text (wrapped in * or _)
 * - Links ([Link text](URL))
 * - Code (wrapped in `)
 * - Code blocks (wrapped in ```)
 * - Blockquotes (lines starting with >)
 * - Horizontal rules (---, ***, or ___)
 */
export function formatMarkdownText(text: string): string {
  if (!text) return '';
  
  // First, escape HTML to prevent XSS
  let processedText = escapeHtml(text);
  
  // Process code blocks first (```) to avoid formatting inside them
  processedText = processCodeBlocks(processedText);
  
  // Process inline code (`) to avoid formatting inside it
  processedText = processInlineCode(processedText);
  
  // Process headers (# Title, ## Subtitle, etc.) before paragraphs
  processedText = processHeaders(processedText);
  
  // Process horizontal rules
  processedText = processHorizontalRules(processedText);
  
  // Process blockquotes
  processedText = processBlockquotes(processedText);
  
  // Process paragraphs and lists (split by blank lines)
  processedText = processedText
    .split(/\n\s*\n/)
    .map(paragraph => {
      // Skip if this is already processed as a code block
      if (paragraph.startsWith('<pre><code>')) {
        return paragraph;
      }
      
      // Check if this paragraph is a list
      if (paragraph.trim().match(/^[-*]\s/) || paragraph.trim().match(/^\d+\.\s/)) {
        return processList(paragraph);
      } else {
        // Regular paragraph - process formatting inside
        return `<p>${processInlineFormatting(paragraph)}</p>`;
      }
    })
    .join('\n\n');
  
  return processedText;
}

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Process code blocks
function processCodeBlocks(text: string): string {
  // Find all code blocks and replace them with <pre><code> tags
  return text.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });
}

// Process inline code
function processInlineCode(text: string): string {
  // Find all inline code and replace with <code> tags
  return text.replace(/`([^`]+)`/g, (match, code) => {
    return `<code>${code}</code>`;
  });
}

// Process headers
function processHeaders(text: string): string {
  // Process headers from h1 to h6
  return text
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.*?)$/gm, '<h4>$1</h4>')
    .replace(/^##### (.*?)$/gm, '<h5>$1</h5>')
    .replace(/^###### (.*?)$/gm, '<h6>$1</h6>');
}

// Process horizontal rules
function processHorizontalRules(text: string): string {
  return text.replace(/^(---|\*\*\*|___)$/gm, '<hr />');
}

// Process blockquotes
function processBlockquotes(text: string): string {
  // Process blockquotes (lines starting with >)
  const lines = text.split('\n');
  let inBlockquote = false;
  let blockquoteContent = '';
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim().startsWith('>')) {
      if (!inBlockquote) {
        inBlockquote = true;
        blockquoteContent = '';
      }
      // Add the content after the > to the blockquote
      blockquoteContent += line.replace(/^>\s?/, '') + '\n';
    } else {
      if (inBlockquote) {
        // End the blockquote and process its content recursively
        result.push(`<blockquote>${formatMarkdownText(blockquoteContent.trim())}</blockquote>`);
        inBlockquote = false;
      }
      result.push(line);
    }
  }
  
  // Handle the case where the blockquote is at the end of the text
  if (inBlockquote) {
    result.push(`<blockquote>${formatMarkdownText(blockquoteContent.trim())}</blockquote>`);
  }
  
  return result.join('\n');
}

// Process lists
function processList(paragraph: string): string {
  const lines = paragraph.split('\n');
  const isBulletList = lines[0].trim().match(/^[-*]\s/);
  
  // Start the appropriate list type
  let listHtml = isBulletList ? '<ul>' : '<ol>';
  
  // Process each line as a list item
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      // Extract the content after the bullet or number
      const content = isBulletList
        ? trimmedLine.replace(/^[-*]\s/, '')
        : trimmedLine.replace(/^\d+\.\s/, '');
      
      // Process inline formatting inside list items
      listHtml += `<li>${processInlineFormatting(content)}</li>`;
    }
  });
  
  // Close the list
  listHtml += isBulletList ? '</ul>' : '</ol>';
  return listHtml;
}

// Process inline formatting (bold, italic, links)
function processInlineFormatting(text: string): string {
  // Process links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Process bold text (** or __)
  text = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, (match, p1, p2) => {
    return `<strong>${p1 || p2}</strong>`;
  });
  
  // Process italic text (* or _) - but avoid conflicts with already processed bold
  text = text.replace(/\b_([^_]+)_\b|\*([^*]+)\*/g, (match, p1, p2) => {
    return `<em>${p1 || p2}</em>`;
  });
  
  return text;
}