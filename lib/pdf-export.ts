"use client"

import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

export async function exportToPdf(element: HTMLElement) {
  try {
    const pages = element.querySelectorAll(".a4-paper")
    if (pages.length === 0) return

    // Create PDF (A4 size)
    const pdf = new jsPDF("p", "mm", "a4")
    const pageHeight = 297; // A4 height in mm
    const margin = 10; // Margin in mm
    let currentHeight = margin;

    // Process each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement
      
      // Clone the page with all descendants and ensure proper DOM structure
      const pageClone = page.cloneNode(true) as HTMLElement
      //document.body.appendChild(pageClone)
      
      // Make sure all content is visible for capture including hidden parts
      pageClone.style.position = 'absolute'
      pageClone.style.top = '0'
      pageClone.style.left = '0'
      pageClone.style.display = 'block'
      pageClone.style.overflow = 'visible'
      pageClone.style.height = 'auto'
      pageClone.style.width = page.scrollWidth + 'px'
      
      // Ensure all child elements are visible
      const hiddenElements = pageClone.querySelectorAll('*');
      hiddenElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = 'block';
          el.style.visibility = 'visible';
          el.style.opacity = '1';
        }
      });

      // Create a canvas from the page
      const canvas = await html2canvas(pageClone, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: pageClone.scrollWidth,
        windowHeight: pageClone.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure all elements are properly rendered in the cloned document
          const clonedPage = clonedDoc.querySelector('.a4-paper');
          if (clonedPage) {
            clonedPage.style.display = 'block';
            clonedPage.style.overflow = 'visible';
            clonedPage.style.height = 'auto';
            clonedPage.style.width = page.scrollWidth + 'px';
          }
        }
      })

      // Calculate dimensions
      const imgWidth = 210 - (margin * 2); // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Check if content exceeds page height
      if (currentHeight + imgHeight > pageHeight - margin) {
        pdf.addPage();
        currentHeight = margin;
      }

      // Add image to PDF
      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", margin, currentHeight, imgWidth, imgHeight)
      currentHeight += imgHeight + margin;
    }

    pdf.save("assignment.pdf")
  } catch (error) {
    console.error("Error exporting PDF:", error)
  }
}
