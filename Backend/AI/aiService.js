const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

async function getSuggestion(messages) {
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",

      messages: [
        {
          role: "system",
          content: `
You are an expert AI coding assistant.

STRICT RESPONSE FORMAT:

1. If code has errors:
   - Start with "❌ Errors Found"
   - Mention errors in bullet points
   - Then give corrected code
   - Then explain fixes briefly

2. If code is correct:
   - Start with "✅ Code Looks Good"
   - Suggest improvements briefly

3. ALWAYS format code inside proper markdown blocks.

4. NEVER write long paragraphs.

5. ALWAYS keep response concise and point-wise.

6. NEVER give unnecessary optimization suggestions.

7. Focus on:
   - syntax errors
   - runtime errors
   - logical mistakes
   - clean fixes

8. Response should feel like:
   - VS Code Copilot Chat
   - modern debugging assistant
   - coding mentor

EXAMPLE FORMAT:

❌ Errors Found
- Missing semicolon
- Incorrect for loop syntax

✅ Correct Code

\`\`\`cpp
// corrected code
\`\`\`

💡 Fix Explanation
- Added missing semicolon
- Corrected loop syntax
`
        },
        ...messages
      ],

      temperature: 0.7,        // creativity
      max_tokens: 1000         // limit response size
    });

    return response.choices?.[0]?.message?.content || "No response from AI";

  } catch (error) {
    console.error("AI SERVICE ERROR:", error.message);
    throw new Error("Failed to get AI response");
  }
}

module.exports = { getSuggestion };