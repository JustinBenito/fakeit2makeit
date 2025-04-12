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
    const splitContentIntoPages = () => {
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

        // Create pages array preserving original order
        const newPages: string[] = []
        
        // Process all content (text and charts) in order
        const textContent = tempDiv.innerHTML
        const words = textContent ? textContent.split(/\s+/) : []
        const wordsPerPage = 220
        let currentPageWords: string[] = []
        let currentPageDiv = document.createElement("div")
        currentPageDiv.className = "a4-page"
        
        // Process words and charts together
        let wordIndex = 0
        let chartIndex = 0
        
        while (wordIndex < words.length || chartIndex < content.charts.length) {
          // Add words to current page until full or no more words
          if (wordIndex < words.length) {
            const remainingSpace = wordsPerPage - currentPageWords.length
            const wordsToAdd = words.slice(wordIndex, wordIndex + remainingSpace)
            currentPageWords.push(...wordsToAdd)
            wordIndex += wordsToAdd.length
            
            // Update page content with current words
            currentPageDiv.innerHTML = currentPageWords.join(" ")
          }
          
          // Check if we can add a chart to current page
          if (chartIndex < content.charts.length && 
              (wordsPerPage - currentPageWords.length) > wordsPerPage * 0.3) {
            const chart = content.charts[chartIndex]
            const chartContainer = document.createElement("div")
            chartContainer.className = "mermaid-chart-container"
            chartContainer.innerHTML = `
              <div class="mermaid-chart" data-chart-id="${chart.id}"></div>
            `
            currentPageDiv.appendChild(chartContainer)
            chartIndex++
          }
          
          // If page is full or no more content, add to pages
          if (currentPageWords.length >= wordsPerPage || 
              (wordIndex >= words.length && chartIndex >= content.charts.length)) {
            newPages.push(currentPageDiv.outerHTML)
            currentPageWords = []
            currentPageDiv = document.createElement("div")
            currentPageDiv.className = "a4-page"
          }
        }

        setPages(newPages)
        console.log("Content split into", newPages.length, "pages")
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
        {!content.html && (!content.charts || content.charts.length === 0) ? (
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
                {pageHtml.includes('mermaid-chart') && (
                  <div className="mermaid-chart-page w-full scale-75 max-w-[21cm] max-h-[30.7cm] overflow-clip">
                    <MermaidChart code={content.charts.find(c => pageHtml.includes(c.id))?.code || ''} />
                  </div>
                )}

                
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
const content = { html: '', charts: [] }; // Initialize content with default values
