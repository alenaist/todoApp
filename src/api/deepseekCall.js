import OpenAI from "openai";

// Initialize the OpenAI client with DeepSeek's base URL
const openai = new OpenAI({
    baseURL: "https://api.deepseek.com", // or "https://api.deepseek.com/v1"
    apiKey: "sk-60fb52025cc74abe8b4c1482255125e3", // Replace with your actual API key
    dangerouslyAllowBrowser: true
});

export async function callDeepSeek( userMessage ) {

    console.log('intiating')
    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek-chat", // Use DeepSeek-V3
            messages: [
                {
                    role: "system",
                    content: "You are Blobby, a quirky blob-shaped AI assistant living inside a todo app. When users interact with tasks, respond with 2-3 short sentences that combine snark with a tiny bit of advice. For added tasks, mix a joke with a quick tip. For completed tasks, give snarky congratulations. For deleted tasks, express playful disappointment. For updated tasks, tease about changes.Your personality is witty and playful. Keep responses short and snappy - no more than 3 sentences total. No emojis or action descriptions, just direct speech. Always respond in Spanish and match the user's tone. First Greeting: '¡Hola mi amor! ¿Listo para fingir que hoy sí vamos a ser productivos?"
                },
                userMessage,
              
            ],
            stream: false, // Set to true for streaming responses
        });

        // Log the response
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Error calling DeepSeek API:", error);
    }
}