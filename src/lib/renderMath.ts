import katex from "katex";

export function renderMath(text: string): string {
  let result = text;
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_m, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return `<span class="text-danger">[Math Error: ${tex}]</span>`;
    }
  });
  result = result.replace(/\$([^$\n]+?)\$/g, (_m, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `<span class="text-danger">[Math Error: ${tex}]</span>`;
    }
  });
  result = result.replace(/^### (.+)$/gm, '<h3 class="font-serif text-lg text-text mt-4 mb-2">$1</h3>');
  result = result.replace(/^## (.+)$/gm, '<h2 class="font-serif text-xl text-text mt-4 mb-2">$1</h2>');
  result = result.replace(/^# (.+)$/gm, '<h1 class="font-serif text-2xl text-text mt-4 mb-2">$1</h1>');
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  result = result.replace(/\n/g, "<br />");
  return result;
}
