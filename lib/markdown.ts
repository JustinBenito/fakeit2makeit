import { marked } from "marked"

export function parseMarkdown(markdown: string): string {
  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true,
  })

  // Parse markdown to HTML
  return marked.parse(markdown)
}
