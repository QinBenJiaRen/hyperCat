import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_BASE_URL = process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.ai/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat-v1-33b';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export const generateWithDeepSeek = async (systemPrompt: string, userPrompt: string) => {
  try {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key is not configured');
    }

    console.log('DeepSeek API Request:', {
      url: `${DEEPSEEK_API_BASE_URL}/chat/completions`,
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const response = await axios.post<DeepSeekResponse>(
      `${DEEPSEEK_API_BASE_URL}/chat/completions`,
      {
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error generating content with DeepSeek:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });
    throw error;
  }
};