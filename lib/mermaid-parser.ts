export function parseMermaidCharts(content: string): {
  text: string
  charts: { id: string; code: string }[]
} {
  const charts: { id: string; code: string }[] = []

  // Find all mermaid code blocks
  const mermaidRegex = /```mermaid\s+([\s\S]*?)```/g
  let match
  let processedContent = content

  while ((match = mermaidRegex.exec(content)) !== null) {
    const chartId = `chart-${Math.random().toString(36).substring(2, 11)}`
    const chartCode = match[1].trim()

    charts.push({
      id: chartId,
      code: chartCode,
    })

    // Replace the mermaid code block with a placeholder
    processedContent = processedContent.replace(
      match[0],
      `<div class="mermaid-placeholder" data-chart-id="${chartId}"></div>`,
    )
  }

  return {
    text: processedContent,
    charts,
  }
}
