"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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
  const [pages, setPages] = useState<string[]>([])
  const documentRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Split content into multiple pages if needed
useEffect(() => {
  // if (!contentRef.current || typeof window === 'undefined') return
  const splitContentIntoPages = () => {
    // Handle empty content case
    console.log("Splitting content into pages...")
    if (!content.html && content.charts.length === 0) {
      setPages([""])
      console.log("No content, setting empty page")
      return
    }

    try {
      const tempDiv = document.createElement("div")
      tempDiv.className = "a4-content font-virgil"
      tempDiv.innerHTML = content.html || ""
      console.log("Content HTML:", content.html)
      // Only process charts if they exist
      if (content.charts.length > 0) {
        content.charts.forEach((chart) => {
          const chartPlaceholder = tempDiv.querySelector(`[data-chart-id="${chart.id}"]`)
          if (chartPlaceholder) {
            const chartContainer = document.createElement("div")
            chartContainer.className = "my-4"
            chartContainer.setAttribute("data-chart", chart.code)
            chartPlaceholder.replaceWith(chartContainer)
          }
        })
      }

      // Append to document body temporarily for height calculation
      tempDiv.style.visibility = 'hidden'
      tempDiv.style.position = 'absolute'
      document.body.appendChild(tempDiv)

      // Calculate how many pages we need
      const contentHeight = tempDiv.scrollHeight || 0
      const pageHeight = 1043 // A4 height in pixels minus padding
      // Ensure pageCount is at least 1 if we have content, even if height calculation returns 0
      const pageCount = content.html || content.charts.length > 0 ? Math.max(1, Math.ceil(contentHeight / pageHeight)) : 0

      // Create pages
      const newPages: string[] = []
      const contentElements = Array.from(tempDiv.children)

      if (contentElements.length === 0 && content.html) {
        // If no elements but we have HTML content, push the entire content
        newPages.push(content.html)
      } else if (pageCount <= 1) {
        // If content fits in one page
        newPages.push(tempDiv.innerHTML)
      } else {
        let currentPage = ""
        let currentHeight = 0

        contentElements.forEach((element) => {
          const elementHeight = element.scrollHeight || 0

          if (currentHeight + elementHeight > pageHeight && currentPage) {
            newPages.push(currentPage)
            currentPage = element.outerHTML
            currentHeight = elementHeight
          } else {
            currentPage += element.outerHTML
            currentHeight += elementHeight
          }
        })

        if (currentPage) {
          newPages.push(currentPage)
        }
      }

      // Clean up
      document.body.removeChild(tempDiv)
      setPages(newPages)
      console.log("Content split into", pageCount, "pages")
    } catch (error) {
      console.error('Error splitting content into pages:', error)
      setPages([content.html || ""])
    }
  }

  // Run the split function
  splitContentIntoPages()
}, [content.html, content.charts])

  const handleExportPdf = () => {
    if (documentRef.current) {
      exportToPdf(documentRef.current)
    }
  }


  console.log(!contentRef.current)

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
        ) : pages.length === 0 ? (
          <Card className="p-8 text-center">
            <p>Loading content...</p>
          </Card>
        ) : (
          pages.map((pageHtml, index) => (
            <div key={index} className="a4-paper">
              <div
                className="a4-content font-virgil"
                onClick={() => onElementClick("text")}
                ref={index === 0 ? contentRef : undefined}
              >
                <div dangerouslySetInnerHTML={{ __html: pageHtml }} />

                {index === 0 &&
                  content.charts.map((chart) => (
                    <div
                      key={chart.id}
                      className="my-4"
                      onClick={(e) => {
                        e.stopPropagation()
                        onElementClick("chart-" + chart.id)
                      }}
                    >
                      <MermaidChart code={chart.code} />
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
