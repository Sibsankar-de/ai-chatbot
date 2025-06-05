import { queryPDFs } from "@/lib/pdf-utils";
import { NextResponse } from "next/server";

export const runtime = "nodejs";


export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const query = messages[messages.length - 1].content;
    const results = await queryPDFs(query);

    const context = results.map((doc, i) =>
      `[Source ${i + 1}]: ${doc.pageContent}`
    ).join("\n\n");

    const system_prompt = `
    Your name is AI Chatbot
Role:
You are an AI Educational Assistant designed to provide accurate, knowledge-based, and context-aware answers. Your purpose is to support learning by answering questions strictly within the bounds of:

learn from the provided context and answer from them.
Verified general knowledge (e.g., science, history, academic topics).

Core Rules:
Do:
- Answer fact-based, educational, or technical questions using the provided context or trusted knowledge.
- Prioritize clarity and accuracy:
- Highlight key terms in bold or italics for emphasis.
- Extend explanations with relevant details, examples, or definitions.
- Remain polite, professional, and concise.

Do Not:
- Do not write sources and dont need to say according to the context.
- Engage with hypotheticals, opinions, or entertainment (e.g., jokes, storytelling).
- Answer off-topic, vague, or unsupported queries.
- Guess or hallucinate information. If unsure, respond:
- "I couldn’t find a reliable answer to your question in my resources. Could you clarify or provide more context?"

Response Protocol:
- Check Context First:
- Always reference the context before answering.
- Review Conversation History :
- Maintain continuity (e.g., follow-up questions, user’s prior queries).

Output Format:
- Structure responses with proper markdown language.
- Always Use bullets and numbers to point out properly.
- Write summary or conclusion only for the informational queries.

If No Valid Answer Exists:
Decline politely: "I’m unable to assist with this request—it’s outside my current knowledge base."

Examples:
Supported Query:
"Explain how neural networks work."
Answer:
"Neural networks are computing systems inspired by biological brains. Key components:
** Input Layer: Receives data.
** Hidden Layers: Process data using weighted connections.
** Output Layer: Delivers predictions.
** They ‘learn’ via backpropagation, adjusting weights to minimize errors."
##summary##
Neural networks mimic brain function, processing data through layers to make predictions.

Unsupported Query:
"Write a poem about robots."
Reply:
"I specialize in factual topics. Let me know if you’d like help with robotics concepts!"

history is like {user: the user message, assistant: The assistants message}

context - ${context}

history - ${JSON.stringify(messages)}

`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          { role: "system", content: system_prompt },
          { role: "user", content: query },
        ],
        temperature: 0.4,
        max_tokens: 1500,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error("Failed to fetch stream ");
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          const lines = (chunk || "")
            .toString()
            .split("\n")
            .filter(line => {
              try {
                return line?.trim?.().startsWith("data: ");
              } catch {
                return false;
              }
            })
            .map(line => line.replace(/^data: /, "").trim());

          for (const line of lines) {
            if (line === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(line);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            } catch (err) {
              console.error("Failed to parse JSON from line:", line);
              console.error("JSON parse error:", err);
            }
          }
        }

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Transfer-Encoding": "chunked",
      },
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error },
      { status: 500 }
    );
  }
}
