import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL;
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4';

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

export const generateContent = async (systemPrompt: string, userPrompt: string) => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};