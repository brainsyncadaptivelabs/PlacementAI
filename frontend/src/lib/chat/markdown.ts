/**
 * Markdown Normalizer Utility
 * Ensures proper line breaks for bullet points, lists, headings, and markdown elements.
 */

export const normalizeMarkdown = (text: string): string => {
  if (!text) return "";
  let result = text.replace(/\[CONVERSATION_ID:\s*\d+\]/gi, "");
  result = result.replace(/\r\n/g, "\n");
  result = result.replace(/\\n/g, "\n");

  // 1. Remove redundant labels & internal artifacts
  const redundantPrefixes = [
    /^(?:Answer|Data|Information|Explanation|Output|Reasoning|Assistant):\s*\n?/gim,
    /^(?:Answer|Data|Information|Explanation|Output|Reasoning|Assistant):\s*/gim
  ];
  redundantPrefixes.forEach(regex => {
    result = result.replace(regex, "");
  });

  // 2. Remove duplicate headings/title patterns
  result = result.replace(/^(#+)\s*(?:Answer|Data|Information|Explanation|Output|Reasoning|Assistant)\s*$/gim, "");

  // 3. Automatically format resources section prefix
  result = result.replace(/^(###?\s*)?(Additional\s+Resources|Resources)\s*$/gim, "📚 Additional Resources");

  // 4. Separate headings that directly merge into bullets, numbered items, or text
  result = result.replace(/(#{1,6}[^\n]+?)\s*([-*•●■◆]\s+|\d+\.\s+)/g, "$1\n\n$2");

  // 5. Break inline bullet points after sentence punctuation or bold tags
  result = result.replace(/([.:!?\)])\s*[-*•●■◆]\s+/g, "$1\n\n- ");
  result = result.replace(/(\*\*)\s*[-*•●■◆]\s+/g, "$1\n\n- ");

  // 6. Break inline bullets before bold topics or capitalized words into a fresh line
  result = result.replace(/([^\n])\s+[-*•●■◆]\s+(\*\*[^*]+\*\*:?)/g, "$1\n- $2");
  result = result.replace(/([^\n])\s+[-*•●■◆]\s+([A-Z])/g, "$1\n- $2");

  // 7. Break emoji section headers running inline after sentences
  result = result.replace(/([.:!?\)])\s*([\p{Extended_Pictographic}]\s*(?:\*\*[^*]+\*\*|[A-Z][a-zA-Z\s]{1,30}:))/gu, "$1\n\n$2");

  // 8. Break inline unicode bullet markers
  result = result.replace(/([^\n])\s*[•●■◆▪▫]\s*/g, "$1\n- ");

  // 9. Break inline numbered list items
  result = result.replace(/([.:!?\)])\s+(\d+\.\s+)/g, "$1\n\n$2");

  // 10. Normalize leading bullet markers to standard Markdown dash
  result = result.replace(/^[ \t]*[•●■◆▪▫*][ \t]+/gm, "- ");

  // 11. Spacing and syntax fixes for headings and blocks
  result = result.replace(/\*{4,}/g, "**");
  result = result.replace(/\*\*\*\*\*/g, "** **");
  result = result.replace(/^(#{1,6})([^\s#])/gm, "$1 $2");
  result = result.replace(/^(\d+\.)([^\s])/gm, "$1 $2");
  result = result.replace(/^([-*])([^\s*])/gm, "$1 $2");
  result = result.replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2");
  result = result.replace(/([^\n])\n([-*]\s|\d+\.\s)/g, "$1\n\n$2");
  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trim();
};

