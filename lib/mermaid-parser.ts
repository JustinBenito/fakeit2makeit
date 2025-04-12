export function parseMermaidCharts(content: string): {
  text: string
  charts: { id: string; code: string }[]
} {
  const charts: { id: string; code: string }[] = []

  // Find all mermaid code blocks
  const mermaidRegex = /```mermaid\s+([\s\S]*?)```/g
  let match
  let processedContent = content
  console.log("content",content)

  while ((match = mermaidRegex.exec(content)) !== null) {
    const chartId = `chart-${Math.random().toString(36).substring(2, 11)}`
    let chartCode = match[1].trim()
    console.log("chartCode prev to see whitesapce",chartCode)
    // Validate Mermaid diagram type
    // const diagramTypes = ['graph', 'pie', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'journey', 'gantt'];
    // const hasValidType = diagramTypes.some(type => chartCode.startsWith(type));
    
    // if (!hasValidType) {
    //   console.warn(`Invalid Mermaid diagram syntax in chart ${chartId}`);
    //   chartCode = `graph TD\n${chartCode}`; // Default to flowchart if type not detected
    // }
    
    console.log("chartCode",chartCode)
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