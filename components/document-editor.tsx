"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download } from "lucide-react"
import { exportToPdf } from "@/lib/pdf-export"
import { MermaidChart } from "@/components/mermaid-chart"

interface DocumentEditorProps {
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
  onElementClick: (elementType: string) => void
}

export function DocumentEditor({ content, setContent, onElementClick }: DocumentEditorProps) {
  const documentRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Process content on load to handle chart placeholders
  useEffect(() => {
    if (!contentRef.current || typeof window === 'undefined') return;
    
    try {
      // Only process if there's HTML content with potential chart placeholders
      if (content.html) {
        const container = contentRef.current;
        
        // Find and process chart placeholders
        content.charts.forEach((chart) => {
          const placeholder = container.querySelector(`[data-chart-id="${chart.id}"]`);
          if (placeholder) {
            // Create a marker to identify where charts should be rendered
            const chartMarker = document.createElement("div");
            chartMarker.setAttribute("data-chart-id", chart.id);
            chartMarker.className = "chart-placeholder my-4";
            placeholder.replaceWith(chartMarker);
          }
        });
      }
      
      console.log("Content processed successfully");
    } catch (error) {
      console.error("Error processing content:", error);
    }
  }, [content.html, content.charts]);

  const handleExportPdf = () => {
    if (documentRef.current) {
      exportToPdf(documentRef.current);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Assignment</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onElementClick("text")}>
            Edit Content
          </Button>
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div ref={documentRef} className="space-y-8">
        {!content.html && content.charts.length === 0 ? (
          <Card className="p-8 text-center">
            <p>No content available</p>
          </Card>
        ) : (
          <div className="a4-paper">
            <div
              className="a4-content font-virgil"
              onClick={() => onElementClick("text")}
              ref={contentRef}
            >
              {/* Safely render HTML content */}
              {content.html && (
                <div dangerouslySetInnerHTML={{ __html: content.html }} />
              )}
              
              {/* Render charts */}
              {content.charts.map((chart) => (
                <div
                  key={chart.id}
                  className="my-4 chart-container"
                  onClick={(e) => {
                    e.stopPropagation();
                    onElementClick("chart-" + chart.id);
                  }}
                  data-chart-id={chart.id}
                >
                  <MermaidChart code={chart.code} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}