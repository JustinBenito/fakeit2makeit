"use client"

import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

export async function exportToPdf(element: HTMLElement) {
  try {
    const pages = element.querySelectorAll(".a4-paper")
    if (pages.length === 0) return

    // Create PDF (A4 size)
    const pdf = new jsPDF("p", "mm", "a4")

    // Process each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement

      // Create a canvas from the page
      const canvas = await html2canvas(page, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      // Calculate dimensions
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add image to PDF
      const imgData = canvas.toDataURL("image/png")

      // Add new page if not the first page
      if (i > 0) {
        pdf.addPage()
      }

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
    }

    pdf.save("assignment.pdf")
  } catch (error) {
    console.error("Error exporting PDF:", error)
  }
}
