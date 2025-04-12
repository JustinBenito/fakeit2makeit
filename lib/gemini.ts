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

                You are an expert at generating assignments for students.
                You will be given a prompt and you will generate an assignment based on the prompt.
                The assignment should be a detailed and comprehensive task that is suitable for students of all levels.
                Format your response in markdown with proper headings, lists, and emphasis. 
                If appropriate, include mermaid diagrams to visualize concepts. Include mermaid "Generate a valid Mermaid flowchart (text-based) using version 11.6.0 syntax. Please ensure: All special characters in node labels are enclosed in double quotes.
                Mathematical expressions use plain text like n times (n-1) factorial.
                Use --> for arrows and proper indentation.
                No invalid characters like *, (, ) or ! outside quotes.
                Make sure the code renders without syntax errors."
                Please ensure:
                The Mermaid chart follows proper syntax.
                All strings, especially with quotes, are correctly escaped.
                The generated chart content does not contain any unexpected characters or syntax errors.
                make sure to not include Mermaid charts with these chart type:
                1. requirementDiagram
                2. mindmap
                3. quadrantChart
                4. C4Context
                5. timeline
                Dont include these at all costs. 
                
                Dont generate bigger charts/diagrams. 
                Dont generate charts with more than 5 nodes.

                Only Generate Assignment, dont include any other text which indicates that you are a chatbot. 
                `,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.5,
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
    // Remove markdown code block delimiters only if they wrap the entire content
    // const cleanText = generatedText.startsWith('```markdown\n') && generatedText.endsWith('```')
    //   ? generatedText.slice(12, -3)
    //   : generatedText
    // console.log("genTxt",cleanText)
    return generatedText
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    throw error
  }
}
