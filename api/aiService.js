const axios = require('axios');

const invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions";
const stream = false;

const headers = {
  "Authorization": "Bearer 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",
  "Accept": stream ? "text/event-stream" : "application/json"
};

const getFinancialAdvice = async (message, financialData) => {
    try {
        const payload = {
            "model": "google/gemma-3n-e4b-it",
            "messages": [
                {
                    "role": "system", 
                    "content": "You are an expert, professional AI Financial Advisor. Analyze the financial profile of the user and provide actionable, intelligent advice answering their query. Focus on realistic and critical impacts such as debt ratio, emergency funds, and investment pacing."
                },
                {
                    "role": "user",
                    "content": `User Financial Profile:\n${JSON.stringify(financialData, null, 2)}\n\nUser Query: ${message}`
                }
            ],
            "max_tokens": 512,
            "temperature": 0.20,
            "top_p": 0.70,
            "frequency_penalty": 0.00,
            "presence_penalty": 0.00,
            "stream": stream
        };

        const response = await axios.post(invoke_url, payload, { headers });

        if (stream) {
            let fullResponse = "";
            for (const line of response.data) {
                if (line) {
                    fullResponse += line.toString() + "\n";
                }
            }
            return fullResponse.trim();
        } else {
            return response.data.choices[0]?.message?.content || "No response received";
        }
    } catch (error) {
        console.error("NVIDIA API Error:", error);
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
