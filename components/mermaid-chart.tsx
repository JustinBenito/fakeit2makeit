"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"

interface MermaidChartProps {
  code: string
}

export function MermaidChart({ code }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const chartId = useRef(`mermaid-${Math.random().toString(36).substring(2, 11)}`)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "Virgil",
    })

    const renderChart = async () => {
      try {
        setError(null)
        const { svg } = await mermaid.render(chartId.current, code)
        // Make SVG responsive using viewBox and styles
        const responsiveSvg = svg
          .replace(/<svg[^>]*width="[^"]*"[^>]*height="[^"]*"/, '<svg style="width: 100%; height: auto;"')
          .replace(/<svg /, '<svg preserveAspectRatio="xMidYMid meet" ')
        setSvg(responsiveSvg)
      } catch (err) {
        console.error("Mermaid rendering error:", err)
        setError("Failed to render chart. Please check your syntax.")
      }
    }

    renderChart()
  }, [code])

  if (error) {
    return <div className="p-4 text-red-500 border border-red-300 rounded-md">{error}</div>
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-chart"
      style={{
        width: "100%",
        maxWidth: "100%",
        height: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}