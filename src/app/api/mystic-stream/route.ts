/**
 * AI 流式输出 API（SSE - Server-Sent Events）
 * POST /api/mystic-stream
 *
 * 返回 text/event-stream，前端用 EventSource 或 fetch + ReadableStream 接收
 */
import { NextRequest } from 'next/server';
import { callAI, PROMPTS, drawTarotCards, getSunSign, getBaziDayMaster, getMoonPhase, getLifePathNumber } from '@/lib/mystic';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { module, input, userId } = body as { module: string; input: any; userId?: string };

    if (!module || !input) {
      return new Response(JSON.stringify({ error: 'Missing module or input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt = '';
    let userPrompt = '';
    let metadata: any = {};

    switch (module) {
      case 'astrology': {
        systemPrompt = PROMPTS.astrology;
        const sunSign = getSunSign(input.birthDate);
        metadata = { sunSign };
        userPrompt = `请为以下用户解读本命盘：
- 出生日期：${input.birthDate}
- 出生时间：${input.birthTime || '未知'}
- 出生地点：${input.birthPlace || '未知'}
- 性别：${input.gender || '未知'}
- 太阳星座：${sunSign}
- 想了解的问题：${input.question || '综合人生解读'}`;
        break;
      }
      case 'tarot': {
        systemPrompt = PROMPTS.tarot;
        const count = input.cardCount || 3;
        const cards = drawTarotCards(count);
        metadata = { cards };
        const cardsDescription = cards.map((c, i) =>
          `位置${i + 1}「${c.position}」：${c.card.name}（${c.reversed ? '逆位' : '正位'}）— 关键词：${c.card.keywords}`
        ).join('\n');
        userPrompt = `请为用户解读塔罗牌阵：
- 占卜问题：${input.question || '综合指引'}
- 牌阵（${count}张）：
${cardsDescription}

请按位置逐张解读，然后给出综合启示与行动建议。`;
        break;
      }
      case 'dream': {
        systemPrompt = PROMPTS.dream;
        const frameworkName: Record<string, string> = {
          jungian: '荣格原型',
          freudian: '弗洛伊德精神分析',
          gestalt: '格式塔',
          spiritual: '灵性视角',
        };
        userPrompt = `请用「${frameworkName[input.framework || 'jungian'] || '荣格原型'}」框架为用户解读梦境：
- 梦境标题：${input.title}
- 梦境内容：${input.content}
- 梦境情绪：${input.mood || '未指定'}
- 用户的现实背景：${input.context || '未提供'}`;
        break;
      }
      case 'bazi': {
        systemPrompt = PROMPTS.bazi;
        const dayMaster = getBaziDayMaster(input.birthDate);
        metadata = { dayMaster };
        userPrompt = `请为以下用户解读八字命盘：
- 出生：${input.birthDate} ${input.birthTime || ''}
- 性别：${input.gender || '未知'}
- 简化日主：${dayMaster}
- 想了解：${input.question || '综合命理'}`;
        break;
      }
      case 'daily': {
        systemPrompt = PROMPTS.daily;
        const today = new Date();
        const moonPhase = getMoonPhase(today);
        const lifePath = input.birthDate ? getLifePathNumber(input.birthDate) : null;
        metadata = { moonPhase, lifePath };
        userPrompt = `请为用户撰写今日（${today.toISOString().slice(0, 10)}）能量报告：
- 太阳星座：${input.sunSign || (input.birthDate ? getSunSign(input.birthDate) : '未知')}
- 生命路径数：${lifePath || '未知'}
- 今日月相：${moonPhase.phase}（${moonPhase.meaning}）
- 用户当下关注的：${input.focus || '综合'}`;
        break;
      }
      case 'storybook': {
        systemPrompt = PROMPTS.storybook;
        const themeMap: Record<string, string> = {
          brave: '勇敢面对困难', friendship: '友谊与分享', sleep: '温馨睡前故事',
          explore: '探索未知世界', share: '学会分享', kind: '善良与同理心',
          growth: '成长与独立', magic: '奇幻冒险',
        };
        const themeText = themeMap[input.theme] || input.theme || '成长主题';
        const styleMap: Record<string, string> = {
          watercolor: '水彩画风', cartoon: '卡通风格', pixar: '皮克斯 3D 风',
          anime: '日系动漫风', picturebook: '经典绘本风',
        };
        const styleText = styleMap[input.artStyle] || '经典绘本风';
        userPrompt = `请为以下孩子创作一本个性化故事书：
- 主角名字：${input.childName}
- 孩子年龄：${input.childAge} 岁
- 故事主题：${themeText}
- 插画风格：${styleText}
- 特殊要求：${input.specialRequest || '无'}

要求：
1. 故事标题要富有童趣
2. 故事正文 800-1200 字，分 5-8 个段落
3. 每个段落前用 【插图：英文 prompt】 标注配图 Prompt
4. 主角的名字要嵌入故事中
5. 故事要适合该年龄段孩子的理解能力
6. 结尾要有温暖的寓意`;
        break;
      }
      case 'promptGenerator': {
        systemPrompt = PROMPTS.promptGenerator;
        userPrompt = `请为以下场景生成一个高质量 AI Prompt 模板：
- Prompt 用途：${input.purpose || '通用'}
- 目标模型：${input.model || 'ChatGPT'}
- 具体场景描述：${input.scene || '通用场景'}
- 期望的输出风格：${input.style || '专业'}

请生成一个可复用的 Prompt 模板，包含变量占位符 {{变量名}}，并提供使用示例。`;
        break;
      }
      case 'memorial': {
        systemPrompt = PROMPTS.memorial;
        userPrompt = `请为用户撰写一份纪念内容：
- 纪念对象：${input.personName}
- 与用户的关系：${input.relationship || '未指定'}
- 生卒年：${input.birthYear || '?'} — ${input.deathYear || '?'}
- 性格特点：${input.personality || '未提供'}
- 美好回忆：${input.memories || '未提供'}
- 用户想表达的情感：${input.userFeeling || '怀念与感恩'}`;
        break;
      }
      case 'genealogy': {
        systemPrompt = PROMPTS.genealogy;
        userPrompt = `请为用户撰写家族故事：
- 家族名：${input.familyName}
- 已知成员：${input.members || '未提供'}
- 家族起源：${input.origins || '未提供'}
- 家族传统：${input.traditions || '未提供'}
- 用户希望突出的：${input.focus || '传承与精神'}`;
        break;
      }
      case 'caregiver': {
        systemPrompt = PROMPTS.caregiver;
        userPrompt = `请为以下照护场景提供支持：
- 照护对象：${input.careRecipient || '长辈'}
- 状况类型：${input.careType || '一般咨询'}
- 描述：${input.description}
- 照护者当前情绪：${input.mood || '未指定'}
- 已尝试的措施：${input.triedAlready || '未提供'}`;
        break;
      }
      case 'microsaas': {
        systemPrompt = PROMPTS.microsaas;
        userPrompt = `请为以下方向生成微 SaaS 创意：
- 兴趣领域：${input.field || '通用'}
- 技术能力：${input.techStack || 'Next.js + API'}
- 目标 MRR：${input.targetMrr || '$1K-10K'}
- 偏好类型：${input.category || 'chrome-ext/notion-plugin/slack-bot/zapier/shopify-app'}
- 其他要求：${input.notes || '无'}`;
        break;
      }
      default:
        return new Response(JSON.stringify({ error: 'Unknown module' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
    }

    // 发送元数据（如塔罗牌阵、月相）作为首个事件
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // 发送 metadata 事件
        if (Object.keys(metadata).length > 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'metadata', metadata })}\n\n`));
        }
        // 流式 AI 调用
        let fullText = '';
        try {
          await callAI(systemPrompt, userPrompt, {
            maxTokens: 2400,
            onChunk: (chunk, full) => {
              fullText = full;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', chunk })}\n\n`));
            },
          });
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', full: fullText })}\n\n`));

          // 持久化
          if (userId && fullText) {
            try {
              if (module === 'dream') {
                await db.dream.create({ data: { userId, title: input.title || '未命名', content: input.content || '', mood: input.mood || null, framework: input.framework || 'jungian', interpretation: fullText, dreamDate: new Date() } });
              } else if (module === 'memorial') {
                await db.memorial.create({ data: { userId, personName: input.personName, relationship: input.relationship || null, birthYear: input.birthYear || null, deathYear: input.deathYear || null, personality: input.personality || null, memories: input.memories || null, biography: fullText } });
              } else if (module === 'storybook') {
                await db.storybook.create({ data: { userId, childName: input.childName, childAge: Number(input.childAge) || 5, theme: input.theme || 'growth', artStyle: input.artStyle || 'picturebook', storyText: fullText } });
              } else if (module === 'promptGenerator') {
                await db.promptItem.create({ data: { userId, title: input.purpose || 'Prompt', category: input.category || 'writing', model: input.model || 'ChatGPT', promptText: fullText, description: input.scene || null } });
              } else if (module === 'caregiver') {
                await db.caregiverLog.create({ data: { userId, logDate: new Date(), careType: input.careType || 'general', title: input.careType || '照护咨询', content: input.description || '', aiAdvice: fullText, mood: input.mood || null } });
              } else {
                await db.reading.create({ data: { userId, type: module, question: input.question || null, input: JSON.stringify(input), result: fullText, metadata: JSON.stringify(metadata) } });
                await db.user.update({ where: { id: userId }, data: { totalReadings: { increment: 1 } } });
              }
            } catch (e) {
              console.error('DB save error:', e);
            }
          }
        } catch (err: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: err?.message })}\n\n`));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
