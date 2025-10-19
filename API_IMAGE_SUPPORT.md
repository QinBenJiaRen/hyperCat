# API 图片支持文档

## 概述
前端现在会在调用 `/api/generate` 接口时发送产品图片（如果用户上传了图片）。

## 请求格式

### 接口路径
```
POST /api/generate
```

### 请求头
```
Content-Type: application/json
```

### 请求体参数

```typescript
{
  model: string,              // 模型名称：'gpt4', 'gpt41', 'deepseek', 'o3mini', 'auto'
  keywords: string[],         // 关键词数组
  prompt: string,             // 产品信息或提示文本
  sensitiveFilter?: boolean,  // 敏感词过滤（仅在生成标题时存在）
  platform?: string,          // 平台名称：'instagram', 'facebook', 'x'（仅在生成平台内容时存在）
  language?: string,          // 语言：'zh', 'en', 'de'（仅在生成平台内容时存在）
  images?: string[],          // 产品图片数组（base64格式），可选
  purpose?: string,           // 【新增】用途标签（如 'ecommerce'），可选
}
```

### images 字段说明

#### 格式
- **类型**：`string[]`（字符串数组）
- **编码**：base64
- **格式示例**：`"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."`
- **数量限制**：最多 5 张图片
- **大小限制**：每张图片最大 5MB（前端已限制）

#### 何时存在
- 当 `images` 字段存在且数组长度 > 0 时，表示用户上传了产品图片
- 当 `images` 为 `undefined` 时，表示用户没有上传图片

#### base64 格式解析
```javascript
// 完整格式
"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."

// 组成部分
data:[MIME类型];base64,[图片数据]

// 常见 MIME 类型
- image/jpeg
- image/png
- image/gif
- image/webp
```

### purpose 字段说明

#### 格式
- **类型**：`string`
- **可选值**：`'ecommerce'`（更多用途可能在未来添加）
- **示例**：`"ecommerce"`

#### 何时存在
- 当 `purpose` 字段存在时，表示用户选择了特定的内容用途
- 当 `purpose` 为 `undefined` 时，表示用户未选择任何用途标签

#### 用途说明
- **ecommerce**：电商推广 / E-commerce Promotion / E-Commerce-Werbung
  - 表示生成的内容用于电商平台的产品推广
  - 后端可以据此优化生成策略，如添加购买引导、促销话术等

#### 多语言映射
```typescript
const purposeTranslations = {
  ecommerce: {
    zh: "电商推广",
    en: "E-commerce Promotion",
    de: "E-Commerce-Werbung"
  }
}
```

## 后端处理建议

### 1. 检查图片和用途
```typescript
// 检查图片
if (request.images && request.images.length > 0) {
  // 用户上传了图片，需要使用支持视觉的模型
  // 例如：GPT-4 Vision, GPT-4.1 Vision
}

// 检查用途
if (request.purpose) {
  // 用户选择了特定用途，可以据此优化提示词
  // 例如：'ecommerce' 可以添加促销、购买引导等话术
}
```

### 2. 模型选择策略

#### 有图片时的模型映射
```typescript
const modelWithVisionSupport = {
  'gpt4': 'gpt-4-vision-preview',
  'gpt41': 'gpt-4.1-vision-preview',
  'deepseek': 'deepseek-vision',  // 如果支持
  'o3mini': 'o3-mini-vision',     // 如果支持
  'auto': 'gpt-4-vision-preview'  // 默认使用 GPT-4 Vision
}
```

#### 无图片时的模型映射（保持现有逻辑）
```typescript
const standardModels = {
  'gpt4': 'gpt-4',
  'gpt41': 'gpt-4.1',
  'deepseek': 'deepseek-chat',
  'o3mini': 'o3-mini',
  'auto': 'gpt-4'  // 或根据策略自动选择
}
```

### 3. 构建 API 请求（以 OpenAI 为例）

#### 无图片（文本模式）
```typescript
const messages = [
  {
    role: "user",
    content: prompt
  }
]
```

#### 有图片（视觉模式）
```typescript
const messages = [
  {
    role: "user",
    content: [
      {
        type: "text",
        text: prompt
      },
      ...images.map(image => ({
        type: "image_url",
        image_url: {
          url: image  // 直接使用 base64 数据 URL
        }
      }))
    ]
  }
]
```

### 4. 完整示例代码

```typescript
export async function POST(request: Request) {
  const { model, keywords, prompt, images, purpose } = await request.json()
  
  // 判断是否需要视觉模型
  const hasImages = images && images.length > 0
  
  // 选择合适的模型
  let apiModel = model
  if (hasImages) {
    // 使用支持视觉的模型
    const visionModels = {
      'gpt4': 'gpt-4-vision-preview',
      'gpt41': 'gpt-4-turbo',
      'auto': 'gpt-4-vision-preview'
    }
    apiModel = visionModels[model] || 'gpt-4-vision-preview'
  }
  
  // 根据用途优化提示词
  let enhancedPrompt = prompt
  if (purpose === 'ecommerce') {
    enhancedPrompt = `${prompt}\n\n请注意：这是用于电商推广的内容，需要包含吸引购买的元素。`
  }
  
  // 构建消息内容
  let messageContent
  if (hasImages) {
    // 视觉模式：包含文本和图片
    messageContent = [
      {
        type: "text",
        text: enhancedPrompt
      },
      ...images.map(image => ({
        type: "image_url",
        image_url: {
          url: image
        }
      }))
    ]
  } else {
    // 文本模式：仅包含文本
    messageContent = enhancedPrompt
  }
  
  // 调用 OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: apiModel,
      messages: [
        {
          role: "user",
          content: messageContent
        }
      ],
      max_tokens: hasImages ? 1000 : 500  // 有图片时可能需要更多 tokens
    })
  })
  
  const data = await response.json()
  return Response.json({ content: data.choices[0].message.content })
}
```

## 使用场景

### 1. 生成标题（Generate 按钮）
- **接口调用**：点击 "Generate" 按钮
- **图片用途**：大模型分析产品图片，生成更准确的标题
- **用途用途**：根据选择的用途（如电商推广）优化标题风格
- **请求示例**：
```json
{
  "model": "gpt4",
  "keywords": ["Summer Sale", "New Arrival"],
  "prompt": "这是一款运动鞋...",
  "sensitiveFilter": true,
  "images": ["data:image/jpeg;base64,...", "data:image/png;base64,..."],
  "purpose": "ecommerce"
}
```

### 2. 生成平台内容（点击标题）
- **接口调用**：点击 Hot Titles 中的标题
- **图片用途**：大模型根据图片生成更详细的推广文案
- **用途用途**：根据选择的用途优化文案内容
- **请求示例**：
```json
{
  "model": "gpt4",
  "keywords": ["Summer Sale"],
  "platform": "instagram",
  "language": "zh",
  "prompt": "请用中文根据以下标题为instagram平台创建一个推广文案...",
  "images": ["data:image/jpeg;base64,..."],
  "purpose": "ecommerce"
}
```

### 3. 刷新内容（刷新按钮）
- **接口调用**：点击社交媒体平台旁的刷新按钮
- **图片用途**：大模型结合图片重新生成推广文案
- **用途用途**：根据选择的用途优化重新生成的内容
- **请求示例**：
```json
{
  "model": "gpt4",
  "keywords": ["Summer Sale", "New Arrival"],
  "platform": "facebook",
  "language": "en",
  "prompt": "Create promotional content...",
  "images": ["data:image/jpeg;base64,...", "data:image/png;base64,..."],
  "purpose": "ecommerce"
}
```

## 注意事项

### 1. 性能考虑
- base64 编码的图片会增加请求体大小
- 5张图片可能导致请求体达到数MB
- 建议在后端设置合理的请求体大小限制

### 2. 成本考虑
- 使用视觉模型的成本通常高于纯文本模型
- 建议在后端记录带图片的请求，用于成本统计

### 3. 错误处理
```typescript
// 建议的错误处理
if (images && images.length > 5) {
  return Response.json({ error: 'Too many images' }, { status: 400 })
}

// 检查模型是否支持视觉
const modelSupportsVision = ['gpt4', 'gpt41'].includes(model)
if (images && images.length > 0 && !modelSupportsVision) {
  // 降级到支持的模型或返回错误
  console.warn(`Model ${model} may not support images, using gpt-4-vision instead`)
}
```

### 4. 超时设置
- 前端已设置 15 秒超时
- 处理图片可能需要更长时间
- 建议后端适当增加超时时间或使用异步处理

## 测试建议

### 1. 无图片测试
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt4",
    "prompt": "运动鞋产品描述",
    "keywords": ["summer", "sale"]
  }'
```

### 2. 有图片测试
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt4",
    "prompt": "运动鞋产品描述",
    "keywords": ["summer", "sale"],
    "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRg..."]
  }'
```

## 前端实现细节

### 图片状态管理
```typescript
const [uploadedImages, setUploadedImages] = useState<string[]>([])
```

### 图片限制
- 最多 5 张图片
- 每张图片最大 5MB
- 仅支持图片格式

### 发送逻辑
```typescript
images: uploadedImages.length > 0 ? uploadedImages : undefined
```
- 有图片：发送 base64 数组
- 无图片：不发送 images 字段（undefined）

## 向后兼容性

✅ **完全兼容**：`images` 字段是可选的
- 旧的 API 调用（无 images 字段）继续正常工作
- 新的 API 调用（有 images 字段）提供增强功能
- 后端可以逐步添加图片支持，不影响现有功能
