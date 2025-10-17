import { NextResponse } from 'next/server'
import { generateContent } from '@/lib/openai'
import { generateWithDeepSeek } from '@/lib/deepseek'

export async function POST(req: Request) {
  try {
    const { prompt, model, keywords = [], language = 'en' } = await req.json()
    
    // Multi-language system prompts
    const systemPromptTemplates = {
      en: {
        title: `As a social media marketing expert, please generate 5 attention-grabbing titles for the following product.
Requirements:
1. Titles should be concise and impactful, suitable for social media platforms
2. Each title must include the product's core value
3. Titles should be engaging and shareable${keywords.length > 0 ? '\n4. Incorporate these keywords appropriately: ' + keywords.join(', ') : ''}
5. Ensure titles are attractive and shareable
6. Output format must be:
1. [First title]
2. [Second title]
3. [Third title]
4. [Fourth title]
5. [Fifth title]`,
        content: `Create engaging content based on the title and product information provided.
Requirements:
1. Write in a conversational, social media-friendly tone
2. Use emojis appropriately to enhance engagement
3. Keep the content between 50-100 characters
4. Make it compelling and shareable
5. Maintain brand voice and message consistency`
      },
      zh: {
        title: `作为一个社交媒体营销专家，请为以下产品生成5个引人注目的标题。
要求：
1. 标题简短有力，适合社交媒体平台
2. 每个标题都必须包含产品的核心价值
3. 标题要引人注目且易于分享${keywords.length > 0 ? '\n4. 合理使用以下关键词: ' + keywords.join(', ') : ''}
5. 确保标题具有吸引力和可分享性
6. 输出格式必须为：
1. [第一个标题]
2. [第二个标题]
3. [第三个标题]
4. [第四个标题]
5. [第五个标题]`,
        content: `根据提供的标题和产品信息创建有吸引力的内容。
要求：
1. 使用适合社交媒体的口吻
2. 适当使用表情符号增加互动性
3. 内容保持在50-100字之间
4. 使内容具有说服力且易于分享
5. 保持品牌声音和信息的一致性`
      },
      de: {
        title: `Als Social-Media-Marketing-Experte generieren Sie bitte 5 aufmerksamkeitsstarke Titel für das folgende Produkt.
Anforderungen:
1. Titel sollten prägnant und wirkungsvoll sein, geeignet für Social-Media-Plattformen
2. Jeder Titel muss den Kernwert des Produkts enthalten
3. Titel sollten ansprechend und teilbar sein${keywords.length > 0 ? '\n4. Verwenden Sie diese Schlüsselwörter angemessen: ' + keywords.join(', ') : ''}
5. Stellen Sie sicher, dass die Titel attraktiv und teilbar sind
6. Ausgabeformat muss sein:
1. [Erster Titel]
2. [Zweiter Titel]
3. [Dritter Titel]
4. [Vierter Titel]
5. [Fünfter Titel]`,
        content: `Erstellen Sie ansprechende Inhalte basierend auf dem Titel und den Produktinformationen.
Anforderungen:
1. Schreiben Sie in einem konversationellen, Social-Media-freundlichen Ton
2. Verwenden Sie Emojis angemessen zur Steigerung des Engagements
3. Halten Sie den Inhalt zwischen 50-100 Zeichen
4. Machen Sie es überzeugend und teilbar
5. Behalten Sie die Markenstimme und Nachrichtenkonsistenz bei`
      }
    };

    const selectedLanguage = language in systemPromptTemplates ? language : 'en';
    const systemPrompt = systemPromptTemplates[selectedLanguage as keyof typeof systemPromptTemplates].title

    // Adjust user prompt based on language
    const userPromptPrefix = {
      en: 'Product information:',
      zh: '产品信息：',
      de: 'Produktinformationen:'
    };
    const userPrompt = `${userPromptPrefix[selectedLanguage as keyof typeof userPromptPrefix]} ${prompt}`
    
    let content;
    if (model === 'deepseek') {
      content = await generateWithDeepSeek(systemPrompt, userPrompt)
    } else {
      // Default to OpenAI for other models (gpt4, auto, etc.)
      content = await generateContent(systemPrompt, userPrompt)
    }
    
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}