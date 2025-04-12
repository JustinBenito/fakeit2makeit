"use server"

export async function generateContent(prompt: string): Promise<string> {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${prompt}. 
                Format your response in markdown with proper headings, lists, and emphasis. 
                If appropriate, include mermaid diagrams to visualize concepts. Include mermaid "Generate a valid Mermaid flowchart (text-based) using version 11.6.0 syntax. Please ensure: All special characters in node labels are enclosed in double quotes.
                Mathematical expressions use plain text like n times (n-1) factorial.
                Use --> for arrows and proper indentation.
                No invalid characters like *, (, ) or ! outside quotes.
                Make sure the code renders without syntax errors."`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    // Extract the text from the response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    return generatedText
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    throw error
  }
}
