"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
import { DocumentEditor } from "@/components/document-editor"
import { generateContent } from "@/lib/gemini"
import { parseMermaidCharts } from "@/lib/mermaid-parser"
import { parseMarkdown } from "@/lib/markdown"
import { SidePanel } from "@/components/side-panel"

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [isInitialPrompt, setIsInitialPrompt] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState<{
    text: string
    charts: { id: string; code: string }[]
    html: string
  }>({
    text: "",
    charts: [],
    html: "",
  })
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [activeElement, setActiveElement] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      const generatedContent = await generateContent(prompt)
      const { text, charts } = parseMermaidCharts(generatedContent)
      const html = parseMarkdown(text)

      setContent({ text, charts, html })
      setIsInitialPrompt(false)
      setPrompt("")
    } catch (error) {
      console.error("Error generating content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleElementClick = (elementType: string) => {
    setActiveElement(elementType)
    setIsPanelOpen(true)
  }

  const handlePanelClose = () => {
    setIsPanelOpen(false)
    setActiveElement(null)
  }

  return (
    <main className="flex min-h-screen flex-col">
      {isInitialPrompt ? (
        <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <div className="w-full max-w-3xl space-y-8">
            <h1 className="text-center text-6xl font-bold">AssignmentFaker.ai</h1>
            <p className="text-center text-lg text-muted-foreground">
              Generate professional-looking assignments with AI
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative p-4 bg-white border border-gray-200 rounded-lg shadow-md">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-100 via-green-400 to-green-600 rounded-t-md"></div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="How can I help you today?"
                  className="w-full h-32 p-4 text-gray-900 text-base bg-white border-none focus:outline-none resize-none"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute bottom-4 right-4 text-white bg-green-500 hover:bg-green-600 rounded-full p-1"
                  disabled={isLoading || !prompt.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
    
        <footer className="mt-auto flex w-full items-center justify-center px-4 py-4 text-black md:px-8 lg:px-16">
          <p className="mb-2 mt-8 text-center text-gray-600">
            Made with luv 💚 by Justin Benito
            <a href="https://justinbenito.com" className="ml-2 text-[#03b051]"></a>
          </p>
        </footer>
      </div>
      ) : (
        <div className="flex flex-1 flex-col relative">
          <div className="flex-1 overflow-auto p-4 pb-24">
            <DocumentEditor content={content} setContent={setContent} onElementClick={handleElementClick} />
          </div>

          {isPanelOpen && (
            <SidePanel
              content={content}
              setContent={setContent}
              activeElement={activeElement}
              onClose={handlePanelClose}
            />
          )}

          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 bg-background border rounded-lg shadow-lg p-2"
            >
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="flex-1 border-0 focus-visible:ring-0"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !prompt.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send
              </Button>
            </form>
          </div>

          

          
        </div>
      )}
    </main>
  )
}
