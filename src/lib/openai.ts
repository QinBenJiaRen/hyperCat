import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL;
const DEFAULT_MODEL = 'gpt-4'; // 强制使用 GPT-4

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_API_BASE_URL,
});

// Model mapping
const MODEL_MAP: { [key: string]: string } = {
  'gpt41': 'gpt-4-1106-preview',
  'gpt4': 'gpt-4',
  'auto': DEFAULT_MODEL,
  'o3mini': 'gpt-3.5-turbo',
};

export const generateContent = async (systemPrompt: string, userPrompt: string, modelKey: string = 'gpt4') => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // 使用模型映射获取实际的模型名称，如果没有找到映射则使用默认模型
    const modelName = MODEL_MAP[modelKey] || DEFAULT_MODEL;
    console.log('Using OpenAI model:', modelName);

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    console.error('Error generating content:', {
      message: error.message,
      response: {
        status: error.status,
        statusText: error.statusText,
        data: error.response?.data
      },
      config: {
        baseURL: OPENAI_API_BASE_URL,
        model: DEFAULT_MODEL
      }
    });
    throw error;
  }
};