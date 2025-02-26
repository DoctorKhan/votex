/**
 * Formats text with Markdown-like syntax into HTML
 * Supports:
 * - Paragraphs (separated by blank lines)
 * - Bullet points (lines starting with "- " or "* ")
 * - Numbered lists (lines starting with "1. ", "2. ", etc.)
 * - Bold text (wrapped in "**")
 */
export function formatMarkdownText(text: string): string {
  if (!text) return '';
  
  // Process paragraphs (split by blank lines)
  const formattedText = text
    .split(/\n\s*\n/)
    .map(paragraph => {
      // Check if this paragraph is a list
      if (paragraph.trim().match(/^[-*]\s/) || paragraph.trim().match(/^\d+\.\s/)) {
        // Process lists
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
            
            // Add as list item
            listHtml += `<li>${processBoldText(content)}</li>`;
          }
        });
        
        // Close the list
        listHtml += isBulletList ? '</ul>' : '</ol>';
        return listHtml;
      } else {
        // Regular paragraph
        return `<p>${processBoldText(paragraph)}</p>`;
      }
    })
    .join('');
  
  return formattedText;
}

/**
 * Process bold text (text wrapped in **)
 */
function processBoldText(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}