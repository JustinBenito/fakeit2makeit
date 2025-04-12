"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { parseMarkdown } from "@/lib/markdown"
import { MermaidChart } from "@/components/mermaid-chart"

interface SidePanelProps {
  content: {
    text: string
    charts: { id: string; code: string }[]
    html: string
  }
  setContent: React.Dispatch<
    React.SetStateAction<{
      text: string
      charts: { id: string; code: string }[]
      html: string
    }>
  >
  activeElement: string | null
  onClose: () => void
}

export function SidePanel({ content, setContent, activeElement, onClose }: SidePanelProps) {
  const [editingText, setEditingText] = useState(content.text)
  const [editingChartCode, setEditingChartCode] = useState("")
  const [editingChartId, setEditingChartId] = useState("")

  useEffect(() => {
    if (activeElement?.startsWith("chart-")) {
      const chartId = activeElement.replace("chart-", "")
      const chart = content.charts.find((c) => c.id === chartId)
      if (chart) {
        setEditingChartCode(chart.code)
        setEditingChartId(chartId)
      }
    } else {
      setEditingText(content.text)
    }
  }, [activeElement, content])

  const handleSaveText = () => {
    const html = parseMarkdown(editingText)
    setContent({
      ...content,
      text: editingText,
      html,
    })
    onClose()
  }

  const handleSaveChart = () => {
    const updatedCharts = content.charts.map((chart) =>
      chart.id === editingChartId ? { ...chart, code: editingChartCode } : chart,
    )
    setContent({
      ...content,
      charts: updatedCharts,
    })
    onClose()
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-xl z-50 overflow-auto">
      <div className="p-4 border-b sticky top-0 bg-background z-10 flex justify-between items-center">
        <h3 className="text-lg font-medium">{activeElement?.startsWith("chart-") ? "Edit Chart" : "Edit Content"}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4">
        {activeElement?.startsWith("chart-") ? (
          <div className="space-y-4">
            <Textarea
              value={editingChartCode}
              onChange={(e) => setEditingChartCode(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              placeholder="Enter Mermaid chart code"
            />

            <div className="border rounded-md p-4">
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <MermaidChart code={editingChartCode} />
            </div>

            <Button onClick={handleSaveChart} className="w-full">
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Markdown Content</label>
              <Textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Enter markdown content"
              />
            </div>

            <div className="border rounded-md p-4">
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <div
                className="prose prose-sm max-w-none font-virgil"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(editingText) }}
              />
            </div>

            <Button onClick={handleSaveText} className="w-full">
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
