const { OpenAI } = require('openai');

const openai = new OpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: "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"
});

const getFinancialAdvice = async (message, financialData) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "deepseek-ai/deepseek-r1-distill-llama-8b",
            messages: [
                {
                    role: "system", 
                    content: "You are an expert, professional AI Financial Advisor. Analyze the financial profile of the user and provide actionable, intelligent advice answering their query. Focus on realistic and critical impacts such as debt ratio, emergency funds, and investment pacing."
                },
                {
                    role: "user",
                    content: `User Financial Profile:\n${JSON.stringify(financialData, null, 2)}\n\nUser Query: ${message}`
                }
            ],
            temperature: 0.6,
            top_p: 0.95,
            max_tokens: 2048,
            extra_body: { "chat_template_kwargs": { "thinking": true } }
        });

        // The response format from OpenAI SDK will have choices[0].message
        let responseContent = completion.choices[0]?.message?.content || "";
        
        // Some models include reasoning_content in the message object, though usually it's in the stream delta
        // If present, let's include it for transparency
        const reasoning = completion.choices[0]?.message?.reasoning_content;
        if (reasoning) {
            responseContent = `[AI Thinking: ${reasoning}]\n\n${responseContent}`;
        }

        return responseContent.trim();
    } catch (error) {
        console.error("DeepSeek API Error:", error);
        return getMockedAdvice(message, financialData);
    }
};

function getMockedAdvice(message, financialData) {
    const q = message.toLowerCase();
    
    if (q.includes('car') || q.includes('house')) {
        return "Based on your current profile, a major purchase next year might dip your emergency fund below the recommended 6 months of living expenses. Consider increasing your monthly savings or delaying the purchase by 8-12 months.";
    }
    if (q.includes('invest')) {
        return "You have a solid emergency fund. Consider diversifying your remaining savings into broad index funds to outpace inflation, while systematically minimizing your debt ratio.";
    }
    
    return "This is a simulated AI response. There might have been an error connecting to the DeepSeek API. Please check server logs.";
}

module.exports = { getFinancialAdvice };
