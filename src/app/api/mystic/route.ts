/**
 * 统一 AI API 路由
 * POST /api/mystic
 * Body: { module: string, input: any, userId?: string }
 *
 * 支持的 module：
 * - 灵性陪伴：astrology / tarot / dream / bazi / daily / memorial / genealogy
 * - 儿童故事书：storybook
 * - Prompt 库：promptGenerator
 * - 目录站：directoryDescribe
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  callAI, PROMPTS,
  drawTarotCards, getSunSign, getBaziDayMaster, getMoonPhase, getLifePathNumber,
} from '@/lib/mystic';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { module, input, userId } = body as { module: string; input: any; userId?: string };

    if (!module || !input) {
      return NextResponse.json({ error: 'Missing module or input' }, { status: 400 });
    }

    let systemPrompt = '';
    let userPrompt = '';
    let result = '';
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
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 2400 });
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
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 2400 });
        break;
      }

      case 'dream': {
        systemPrompt = PROMPTS.dream;
        const framework = input.framework || 'jungian';
        const frameworkName: Record<string, string> = {
          jungian: '荣格原型',
          freudian: '弗洛伊德精神分析',
          gestalt: '格式塔',
          spiritual: '灵性视角',
        };
        userPrompt = `请用「${frameworkName[framework] || '荣格原型'}」框架为用户解读梦境：
- 梦境标题：${input.title}
- 梦境内容：${input.content}
- 梦境情绪：${input.mood || '未指定'}
- 用户的现实背景（可选）：${input.context || '未提供'}`;
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 2000 });
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
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 2400 });
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
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 1500 });
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
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 2400 });
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
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 2400 });
        break;
      }

      case 'storybook': {
        systemPrompt = PROMPTS.storybook;
        const themeMap: Record<string, string> = {
          brave: '勇敢面对困难',
          friendship: '友谊与分享',
          sleep: '温馨睡前故事',
          explore: '探索未知世界',
          share: '学会分享',
          kind: '善良与同理心',
          growth: '成长与独立',
          magic: '奇幻冒险',
        };
        const themeText = themeMap[input.theme] || input.theme || '成长主题';
        const styleMap: Record<string, string> = {
          watercolor: '水彩画风',
          cartoon: '卡通风格',
          pixar: '皮克斯 3D 风',
          anime: '日系动漫风',
          picturebook: '经典绘本风',
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
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 3000, temperature: 0.9 });
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
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 2000 });
        break;
      }

      case 'directoryDescribe': {
        systemPrompt = PROMPTS.directoryDescription;
        userPrompt = `请为以下 AI 工具/产品撰写一段专业描述：
- 工具名：${input.name}
- URL：${input.url}
- 用户提供的简要描述：${input.userDescription || '无'}
- 类别：${input.category || 'AI 工具'}

请基于以上信息，输出该工具的核心功能、适合人群、定价模式与差异化亮点。`;
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 1200 });
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
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 2400 });
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
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 3000, temperature: 0.9 });
        break;
      }

      // ─── AI Agent 运营模块 ───
      case 'seoBlog': {
        systemPrompt = PROMPTS.seoBlog;
        userPrompt = `请为以下主题撰写一篇 SEO 优化博客文章：
- 主关键词：${input.keyword || 'AI 灵性陪伴'}
- 赛道：${input.track || 'mystic'}
- 目标受众：${input.audience || '对灵性探索感兴趣的 25-40 岁女性'}
- 字数要求：${input.wordCount || '1500-2000 字'}
- 语言：${input.locale || 'zh'}
- 特别要求：${input.specialRequest || '无'}`;
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 4000, temperature: 0.7 });
        break;
      }

      case 'socialContent': {
        systemPrompt = PROMPTS.socialContent;
        userPrompt = `请为以下产品/赛道批量生成社交媒体内容：
- 产品/赛道：${input.track || 'AI 灵性陪伴'}
- 主题：${input.theme || '今日运势'}
- 目标受众：${input.audience || 'Gen Z 灵性爱好者'}
- 语言：${input.locale || 'zh'}
- 品牌调性：${input.tone || '神秘奢华 · 温暖 · 富有洞察'}
- 特别要求：${input.notes || '无'}`;
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 4000, temperature: 0.9 });
        break;
      }

      case 'newsletter': {
        systemPrompt = PROMPTS.newsletter;
        const today = new Date();
        const moonPhase = getMoonPhase(today);
        const lifePath = input.birthDate ? getLifePathNumber(input.birthDate) : null;
        const sunSign = input.birthDate ? getSunSign(input.birthDate) : '未知';
        userPrompt = `请为用户撰写今日 Newsletter：
- 用户姓名：${input.name || 'Lumina 旅人'}
- 太阳星座：${sunSign}
- 生命路径数：${lifePath || '未知'}
- 今日月相：${moonPhase.phase}（${moonPhase.meaning}）
- 今日日期：${today.toISOString().slice(0, 10)}
- 用户最近关注的：${input.focus || '综合运势'}`;
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 2000, temperature: 0.8 });
        break;
      }

      case 'agentFollowup': {
        systemPrompt = PROMPTS.agentFollowup;
        userPrompt = `请为以下用户生成跟进建议：
- 用户姓名：${input.name || '匿名用户'}
- 注册天数：${input.daysSinceSignup || 7}
- 最近活跃：${input.lastActiveDays || 1} 天前
- 累计使用次数：${input.totalUsage || 0}
- 付费状态：${input.plan || 'free'}
- 上次行为：${input.lastAction || '生成占星报告'}
- 风险信号：${input.riskSignals || '无'}`;
        result = await callAI(systemPrompt, userPrompt, { maxTokens: 2000, temperature: 0.6 });
        break;
      }

      case 'tiktok': {
        systemPrompt = `你是一位 TikTok 短视频内容创作专家，擅长为灵性 / 玄学 / 自我成长赛道打造爆款短视频脚本。
你理解 TikTok 算法：前 3 秒钩子决定生死、节奏要快、视觉描述具体、CTA 明确。

输出结构：

## 📹 视频脚本（共 ${input.videoCount || '5'} 条）

### 脚本 1
**主题**：xxx
**时长**：${input.duration || '15-30s'}
**前 3 秒钩子**：[具体台词 + 视觉描述]
**主体**：[分镜描述，含 BGM 节奏点]
**结尾 CTA**：[引导互动 / 关注 / 评论]
**BGM 推荐**：[TikTok 热门 BGM 风格 + 具体 Ref]
**Hashtag**：#xxx #xxx #xxx #xxx #xxx（5-8 个，含 1 个长尾）
**最佳发布时间**：[基于赛道受众活跃时段]

### 脚本 2 ...（同上格式，共 ${input.videoCount || '5'} 条）

## 📊 爆款分析
- 建议发布频率：每天 X 条
- 最佳发布时段：[基于目标受众]
- 热门话题趋势：[当前赛道在 TikTok 上的机会窗口]

使用 Markdown 格式输出，脚本要具体到可以直接拍摄，避免空泛描述。`;
        userPrompt = `请为以下 TikTok 账号生成 ${input.videoCount || '5'} 条爆款短视频脚本：
- 赛道：${input.track || 'mystic'}
- 细分领域：${input.niche || '占星 + 塔罗 + 灵性成长'}
- 目标受众：${input.audienceAge || 'Gen Z 女性 18-28'}
- 账号阶段：${input.accountStage || '新号 0 粉丝'}
- 视频时长：${input.duration || '15-30s'}
- 语言：${input.language || 'zh'}
- 热门趋势关注：${input.trendFocus || '当下热门：自我探索 / 内在疗愈 / 灵性觉醒'}
- 特殊要求：${input.specialRequest || '无'}

要求：
1. 前 3 秒钩子必须极具冲击力，让人停下手指
2. 主体节奏要快，每 3-5 秒一个画面切换
3. BGM 推荐要具体（含 TikTok 热门 Ref 编号或音乐风格）
4. Hashtag 包含 1 个高热度（10 亿+）+ 2 个中等（1-10 亿）+ 2 个长尾（< 1 亿）
5. CTA 要明确：评论 / 关注 / 收藏 / 分享任选其一
6. 每条脚本风格要有差异，覆盖不同内容类型（科普 / 故事 / 占卜 / 测试 / 教学）`;
        result = await callAI(systemPrompt, userPrompt, {
          maxTokens: 4000,
          temperature: 0.9,
        });
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown module: ' + module }, { status: 400 });
    }

    // 持久化到数据库
    let savedRecord = null;
    if (userId && result) {
      try {
        if (module === 'dream') {
          savedRecord = await db.dream.create({
            data: {
              userId,
              title: input.title || '未命名梦境',
              content: input.content || '',
              mood: input.mood || null,
              framework: input.framework || 'jungian',
              interpretation: result,
              dreamDate: new Date(),
            },
          });
        } else if (module === 'memorial') {
          savedRecord = await db.memorial.create({
            data: {
              userId,
              personName: input.personName,
              relationship: input.relationship || null,
              birthYear: input.birthYear || null,
              deathYear: input.deathYear || null,
              personality: input.personality || null,
              memories: input.memories || null,
              biography: result,
            },
          });
        } else if (module === 'genealogy') {
          savedRecord = await db.genealogy.create({
            data: {
              userId,
              familyName: input.familyName,
              members: JSON.stringify(input.members || {}),
              origins: input.origins || null,
              traditions: input.traditions || null,
              narrative: result,
            },
          });
        } else if (module === 'storybook') {
          savedRecord = await db.storybook.create({
            data: {
              userId,
              childName: input.childName,
              childAge: Number(input.childAge) || 5,
              theme: input.theme || 'growth',
              artStyle: input.artStyle || 'picturebook',
              storyText: result,
            },
          });
        } else if (module === 'promptGenerator') {
          savedRecord = await db.promptItem.create({
            data: {
              userId,
              title: input.purpose || `Prompt - ${input.model || 'ChatGPT'}`,
              category: input.category || 'writing',
              model: input.model || 'ChatGPT',
              promptText: result,
              description: input.scene || null,
            },
          });
        } else if (module === 'caregiver') {
          savedRecord = await db.caregiverLog.create({
            data: {
              userId,
              logDate: new Date(),
              careType: input.careType || 'general',
              title: input.careType || '照护咨询',
              content: input.description || '',
              aiAdvice: result,
              mood: input.mood || null,
            },
          });
        } else {
          savedRecord = await db.reading.create({
            data: {
              userId,
              type: module,
              question: input.question || null,
              input: JSON.stringify(input),
              result,
              metadata: JSON.stringify(metadata),
            },
          });
          await db.user.update({
            where: { id: userId },
            data: { totalReadings: { increment: 1 } },
          });
        }
      } catch (dbErr) {
        console.error('DB save error:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      module,
      result,
      metadata,
      saved: savedRecord ? { id: savedRecord.id } : null,
    });
  } catch (err: any) {
    console.error('Mystic API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/** GET /api/mystic — 健康检查 + 列出可用模块 */
export async function GET() {
  return NextResponse.json({
    service: 'Lumina Studio API',
    version: '2.0',
    tracks: [
      {
        id: 'mystic',
        name: 'AI 灵性陪伴',
        modules: ['daily', 'astrology', 'tarot', 'dream', 'bazi', 'memorial', 'genealogy'],
      },
      {
        id: 'storybook',
        name: 'AI 儿童故事书',
        modules: ['storybook'],
      },
      {
        id: 'directory',
        name: 'AI 目录站',
        modules: ['directoryDescribe'],
      },
      {
        id: 'prompts',
        name: 'AI Prompt 库',
        modules: ['promptGenerator'],
      },
    ],
    status: 'online',
  });
}
