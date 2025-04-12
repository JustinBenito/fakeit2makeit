"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"

interface MermaidChartProps {
  code: string
}

export function MermaidChart({ code }: MermaidChartProps) {
  const [svg, setSvg] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const chartId = useRef(`mermaid-${Math.random().toString(36).substring(2, 11)}`)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "Virgil",
      look: "handDrawn",

    })

    const renderChart = async () => {
      try {
        setError(null)
        const { svg } = await mermaid.render(chartId.current, code)
        setSvg(svg)
      } catch (err) {
        console.error("Mermaid rendering error:", err)
        setError("Failed to render chart. Please check your syntax.")
      }
    }

    renderChart()
  }, [code])

  if (error) {
    console.log(chartId.current)
    return <div className="p-4 text-red-500 border border-red-300 rounded-md">{error}</div>
  }

  return (
    <div className="mermaid-chart-container ">
      <div 
        className="mermaid-chart" 
        dangerouslySetInnerHTML={{ __html: svg }} 
      />
    </div>
  )
}
