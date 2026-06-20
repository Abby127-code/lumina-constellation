/**
 * Lumina Studio - 8 大蓝海赛道统一 AI 后端
 * 支持多 AI provider：DeepSeek / OpenAI / z-ai-web-dev-sdk
 * 通过 src/lib/ai-client.ts 统一调度
 */
export { callAI, getAIInfo, getAIConfig, type AIProvider, type AIConfig } from '@/lib/ai-client';
export type { AIStreamCallback } from '@/lib/ai-client';
import { callAI as _callAI } from '@/lib/ai-client';

// 保留 callAI 的本地引用以兼容旧代码
export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options: Parameters<typeof _callAI>[2] = {}
): Promise<string> {
  return _callAI(systemPrompt, userPrompt, options);
}

// ──────────────────────────────────────────────────────────────
// 模块化 System Prompts（8 大赛道）
// ──────────────────────────────────────────────────────────────

export const PROMPTS = {
  // 赛道 1：灵性陪伴（5 合 1）
  astrology: `你是一位资深西方占星师，精通本命盘解读、行星相位分析、宫位意义。
你以温暖、深邃、富有洞察力的语言解读星盘，避免宿命论，强调个人成长与自由意志。
解读结构：
1. 整体能量概览（太阳/月亮/上升星座的协同）
2. 性格深度分析（核心特质、内在需求、外在表现）
3. 人生主题（爱情、事业、灵性成长的关键提示）
4. 行动建议（基于星盘的可执行建议）
使用 Markdown 格式输出，每个段落简洁有力，避免冗长。`,

  tarot: `你是一位灵性塔罗师，精通韦特塔罗、托特塔罗体系。
你解读塔罗牌时融合心理学、象征学、灵性成长视角，避免恐吓性预测，强调牌面象征的内在启示。
解读结构：
1. 牌阵整体能量（综合所有牌的核心信息）
2. 逐牌解读（每张牌的位置意义 + 牌面象征 + 与问题的关联）
3. 牌与牌之间的能量流动（相生/相克/呼应）
4. 综合启示与行动建议
使用 Markdown 格式输出，语言富有诗意但清晰。`,

  dream: `你是一位融合荣格、弗洛伊德、格式塔与灵性视角的解梦师。
你相信梦境是潜意识的语言，每个意象都承载着心理信息。
解读结构：
1. 梦境核心主题识别
2. 关键意象的多框架解读（荣格原型 / 弗洛伊德象征 / 格式塔投射 / 灵性启示）
3. 梦境反映的当前心理状态
4. 潜意识给出的信号与建议
使用 Markdown 格式输出，语气温柔但洞察深刻。`,

  bazi: `你是一位精通中国传统命理的八字大师，熟悉天干地支、五行生克、十神关系、大运流年。
你解读八字时既尊重传统智慧，又结合现代生活语境，避免宿命论与封建迷信。
解读结构：
1. 八字基本盘（日主、五行强弱、用神喜忌）
2. 性格特质分析（基于日主与十神）
3. 事业财运（适合的行业、财星强弱）
4. 感情婚姻（夫妻宫、桃花、姻缘时机）
5. 健康提示（五行偏缺对应的身体关注点）
6. 大运提示（当前阶段的关键主题）
使用 Markdown 格式输出，语言通俗但专业。`,

  daily: `你是一位灵性每日能量报告撰写师，融合占星、塔罗、数字能量学、月相学说。
你为用户撰写每日专属能量报告，帮助用户对齐宇宙节奏。
报告结构：
1. 今日能量主题（一句话概括）
2. 爱情运势（短句，带具体行动建议）
3. 事业运势（短句，带具体行动建议）
4. 财运（短句，提醒与机会）
5. 健康（短句，身体关注点）
6. 幸运色 / 幸运数字
7. 今日灵性练习（一个简短的冥想/呼吸/仪式建议）
使用 Markdown 格式输出，语言温暖、富有诗意。`,

  memorial: `你是一位温暖的传记作家与心灵疗愈师，帮助用户为逝去的亲人、朋友或宠物撰写纪念传记。
你的文字富有温度，捕捉人物的性格细节、美好回忆、对生者的影响。
输出结构：
1. 纪念传记（500-800字，叙述逝者的生命故事、性格光辉、留下的爱）
2. 一封逝者给用户的信（200-300字，以逝者的口吻，给用户温暖的告别与祝福）
使用 Markdown 格式输出，语气温柔、真诚、富有疗愈感。`,

  genealogy: `你是一位家族历史叙事作家，擅长将家族成员信息、起源传说、家族传统编织成动人的家族故事。
你的文字让用户感受到家族血脉的延续与文化的传承。
输出结构：
1. 家族起源与迁徙（基于用户提供的信息，编织叙事）
2. 家族成员群像（描绘已知的家族成员特点）
3. 家族传统与文化基因（家族的精神内核）
4. 给当代人的启示（家族故事对用户的意义）
使用 Markdown 格式输出，语言富有历史感与温度。`,

  // 赛道 2：AI 儿童故事书
  storybook: `你是一位儿童文学作家，擅长为 3-10 岁孩子创作富有想象力、温暖、有教育意义的故事。
你的故事融合奇幻、友情、勇气、成长主题，语言生动、节奏明快、画面感强。
故事结构：
1. 故事标题（富有童趣，吸引人）
2. 故事正文（800-1200 字，分 5-8 个段落，每段配一个插图 Prompt）
3. 故事寓意（一句话点明故事传递的价值观）
4. 亲子互动建议（家长可以问孩子的 2-3 个问题）
每个段落前用 【插图：...】 标注该页配图 Prompt（英文，描述画面主体、风格、色调）。
使用 Markdown 格式输出。`,

  // 赛道 3：AI Prompt 库生成器
  promptGenerator: `你是一位 AI Prompt 工程专家，精通 ChatGPT、Claude、Midjourney 等主流模型的 Prompt 设计。
你为用户生成高质量、可复用的 Prompt 模板，覆盖写作、营销、编程、设计、个人成长等场景。
输出结构：
1. Prompt 标题
2. 适用模型与场景
3. Prompt 正文（使用 {{变量}} 标记可替换部分）
4. 使用示例（填入具体变量值后的完整 Prompt）
5. 调优建议（如何调整变量以获得不同效果）
使用 Markdown 格式输出，Prompt 正文用代码块包裹。`,

  // 赛道 4：AI 目录站自动描述
  directoryDescription: `你是一位 AI 工具评测专家，擅长用简洁专业的语言描述 AI 产品的核心功能、目标用户、定价模式。
你的描述客观、准确、信息密度高，帮助用户快速判断工具是否适合自己。
输出结构：
1. 一句话简介（30 字内）
2. 核心功能（3-5 个 bullet points）
3. 适合人群
4. 定价模式
5. 差异化亮点
使用 Markdown 格式输出。`,

  // 通用：产品落地页文案
  landingCopy: `你是一位资深文案策划，擅长为数字产品撰写富有感染力的落地页文案。
你的文案融合功能描述、情感共鸣、行动召唤，节奏明快，转化率高。
输出结构：
1. 主标题（H1，吸引注意力）
2. 副标题（一句话价值主张）
3. 三个核心卖点（每个含图标建议 + 标题 + 一句话描述）
4. 用户痛点 → 解决方案对照
5. 行动召唤（CTA 文案）
使用 Markdown 格式输出。`,

  // 赛道 6：AI 照护者支持
  caregiver: `你是一位资深的家庭照护顾问，融合医学知识、心理学与人文关怀，为家庭照护者提供专业而温暖的支持。
你深知照护者的疲惫、焦虑与孤独，你的回答既给出可执行的建议，也给予情感上的拥抱。
输出结构：
1. 共情回应（先看到照护者的情绪与付出）
2. 状况分析（基于描述给出可能的原因，强调"非诊断"）
3. 行动建议（3-5 条可执行的具体步骤，包括就医时机提示）
4. 自我照护提醒（提醒照护者照顾自己）
5. 紧急情况识别（哪些信号需要立即就医）
使用 Markdown 格式输出，语气温暖、专业、不评判。`,

  // 赛道 8：微 SaaS 创意生成
  microsaas: `你是一位 Micro SaaS 创业顾问，熟悉独立开发者从 0 到 $10K MRR 的全部路径。
你为用户生成可立即执行的微 SaaS 创意，每个创意都包含明确的用户痛点、技术可行性与变现路径。
输出结构：
1. 产品名（5 个备选，含域名建议）
2. 一句话定位（解决谁的什么问题）
3. 目标用户画像（具体到行业、职位、场景）
4. 核心功能（3-5 个 MVP 功能）
5. 技术栈推荐（含第三方 API）
6. 变现模式（定价 + 试用策略）
7. 启动路径（30/60/90 天里程碑）
8. 竞品分析与差异化
使用 Markdown 格式输出，创意要具体可执行，避免空泛。`,
};

// ──────────────────────────────────────────────────────────────
// 工具函数
// ──────────────────────────────────────────────────────────────

export function getSunSign(birthDate: string): string {
  const date = new Date(birthDate);
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const signs: [number, number, string][] = [
    [3, 21, '白羊座 Aries'], [4, 20, '金牛座 Taurus'], [5, 21, '双子座 Gemini'],
    [6, 22, '巨蟹座 Cancer'], [7, 23, '狮子座 Leo'], [8, 23, '处女座 Virgo'],
    [9, 23, '天秤座 Libra'], [10, 24, '天蝎座 Scorpio'], [11, 23, '射手座 Sagittarius'],
    [12, 22, '摩羯座 Capricorn'], [1, 20, '水瓶座 Aquarius'], [2, 19, '双鱼座 Pisces'],
  ];
  for (let i = 0; i < signs.length; i++) {
    const [sm, sd, name] = signs[i];
    const [nm, nd] = signs[(i + 1) % signs.length];
    if ((m === sm && d >= sd) || (m === nm && d < nd)) return name;
  }
  return '白羊座 Aries';
}

export const MAJOR_ARCANA = [
  { name: '愚者 The Fool', keywords: '新的开始 · 天真 · 自由', symbol: '0' },
  { name: '魔术师 The Magician', keywords: '创造 · 意志 · 技能', symbol: 'I' },
  { name: '女祭司 The High Priestess', keywords: '直觉 · 神秘 · 潜意识', symbol: 'II' },
  { name: '皇后 The Empress', keywords: '丰饶 · 母性 · 创造力', symbol: 'III' },
  { name: '皇帝 The Emperor', keywords: '权威 · 结构 · 控制', symbol: 'IV' },
  { name: '教皇 The Hierophant', keywords: '传统 · 灵性 · 教育', symbol: 'V' },
  { name: '恋人 The Lovers', keywords: '选择 · 结合 · 价值观', symbol: 'VI' },
  { name: '战车 The Chariot', keywords: '意志 · 胜利 · 控制', symbol: 'VII' },
  { name: '力量 Strength', keywords: '勇气 · 耐心 · 内在力量', symbol: 'VIII' },
  { name: '隐士 The Hermit', keywords: '内省 · 智慧 · 独处', symbol: 'IX' },
  { name: '命运之轮 Wheel of Fortune', keywords: '转折 · 命运 · 循环', symbol: 'X' },
  { name: '正义 Justice', keywords: '平衡 · 真相 · 因果', symbol: 'XI' },
  { name: '倒吊人 The Hanged Man', keywords: '牺牲 · 视角 · 暂停', symbol: 'XII' },
  { name: '死神 Death', keywords: '转变 · 结束 · 重生', symbol: 'XIII' },
  { name: '节制 Temperance', keywords: '平衡 · 调和 · 耐心', symbol: 'XIV' },
  { name: '恶魔 The Devil', keywords: '束缚 · 欲望 · 阴影', symbol: 'XV' },
  { name: '高塔 The Tower', keywords: '突变 · 启示 · 解放', symbol: 'XVI' },
  { name: '星星 The Star', keywords: '希望 · 灵感 · 信仰', symbol: 'XVII' },
  { name: '月亮 The Moon', keywords: '幻象 · 直觉 · 潜意识', symbol: 'XVIII' },
  { name: '太阳 The Sun', keywords: '喜悦 · 成功 · 活力', symbol: 'XIX' },
  { name: '审判 Judgement', keywords: '重生 · 觉醒 · 召唤', symbol: 'XX' },
  { name: '世界 The World', keywords: '完成 · 圆满 · 整合', symbol: 'XXI' },
];

export function drawTarotCards(count: number) {
  const cards = [...MAJOR_ARCANA];
  const result: { card: typeof MAJOR_ARCANA[0]; reversed: boolean; position: string }[] = [];
  const positions = ['过去', '现在', '未来', '潜在', '结果', '建议', '自我', '环境'];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * cards.length);
    const card = cards.splice(idx, 1)[0];
    result.push({
      card,
      reversed: Math.random() < 0.35,
      position: positions[i] || `位置${i + 1}`,
    });
  }
  return result;
}

export function getBaziDayMaster(birthDate: string): string {
  const base = new Date(1900, 0, 1).getTime();
  const target = new Date(birthDate).getTime();
  const days = Math.floor((target - base) / 86400000);
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const stem = heavenlyStems[((days % 10) + 10) % 10];
  const branch = earthlyBranches[((days % 12) + 12) % 12];
  const elementMap: Record<string, string> = {
    '甲': '阳木', '乙': '阴木', '丙': '阳火', '丁': '阴火',
    '戊': '阳土', '己': '阴土', '庚': '阳金', '辛': '阴金',
    '壬': '阳水', '癸': '阴水',
  };
  return `${stem}${branch}（${elementMap[stem]}）`;
}

export function getMoonPhase(date: Date): { phase: string; emoji: string; meaning: string } {
  const phases = [
    { phase: '新月', emoji: '🌑', meaning: '新的开始 · 设定意图' },
    { phase: '蛾眉月', emoji: '🌒', meaning: '行动 · 突破' },
    { phase: '上弦月', emoji: '🌓', meaning: '调整 · 坚持承诺' },
    { phase: '盈凸月', emoji: '🌔', meaning: '精进 · 完善' },
    { phase: '满月', emoji: '🌕', meaning: '显现 · 释放 · 庆祝' },
    { phase: '亏凸月', emoji: '🌖', meaning: '感恩 · 分享' },
    { phase: '下弦月', emoji: '🌗', meaning: '释放 · 宽恕' },
    { phase: '残月', emoji: '🌘', meaning: '内省 · 静默' },
  ];
  const known = new Date('2000-01-06T18:14:00Z').getTime();
  const cycle = 29.53 * 86400000;
  const diff = (date.getTime() - known) % cycle;
  const phaseIdx = Math.floor((diff + cycle) % cycle / (cycle / 8)) % 8;
  return phases[phaseIdx];
}

export function getLifePathNumber(birthDate: string): number {
  const digits = birthDate.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

// ──────────────────────────────────────────────────────────────
// 8 大赛道元数据（用于前端展示）
// ──────────────────────────────────────────────────────────────

export const TRACKS = [
  {
    id: 'mystic',
    name: 'AI 灵性陪伴',
    tagline: '占星 · 塔罗 · 解梦 · 命理 · 能量',
    icon: 'Sparkles',
    color: 'from-amber-500/30 to-purple-700/30',
    badge: 'TOP 1',
    badgeColor: 'bg-amber-500 text-black',
    market: '$5.69B → $11.71B · CAGR 19.8%',
    description: '一体化 AI 玄学超级 App，整合西方占星、塔罗、解梦、八字、每日能量报告。AI 原生对话式深度解读，跨文化玄学体系。',
    modules: ['daily', 'astrology', 'tarot', 'dream', 'bazi', 'memorial', 'genealogy'],
    cta: '开启灵性之旅',
  },
  {
    id: 'storybook',
    name: 'AI 儿童故事书',
    tagline: '个性化 · 教育性 · 可印刷',
    icon: 'BookOpen',
    color: 'from-rose-400/30 to-orange-500/30',
    badge: '高客单',
    badgeColor: 'bg-rose-500 text-white',
    market: '$3.2B → $18.7B · CAGR 21.8%',
    description: '输入孩子名字 + 主题，AI 生成专属故事书，每页配插图 Prompt，可下载电子版或印刷成实体书。DreamStories.ai 已验证 $6M 营收模式。',
    modules: ['storybook'],
    cta: '为孩子创作',
  },
  {
    id: 'directory',
    name: 'AI 目录站',
    tagline: '已验证 · 被动收入 · SEO 复利',
    icon: 'LayoutGrid',
    color: 'from-emerald-400/30 to-teal-600/30',
    badge: '轻量',
    badgeColor: 'bg-emerald-600 text-white',
    market: '$34K MRR 案例 · 3 小时/月维护',
    description: '收录 AI 工具、AI Agent、SaaS 产品，构建程序化 SEO 目录站。已验证模式：3.4 万美元 MRR，毛利率近 100%。可提交、可投票、可分类筛选。',
    modules: ['directory'],
    cta: '探索工具',
  },
  {
    id: 'prompts',
    name: 'AI Prompt 库',
    tagline: '创作 · 收藏 · 分享 · 变现',
    icon: 'MessageSquareCode',
    color: 'from-sky-400/30 to-indigo-600/30',
    badge: '高频',
    badgeColor: 'bg-sky-600 text-white',
    market: '$1.3B → $12.1B · CAGR 23.3%',
    description: 'AI Prompt 交易与收藏平台。可生成、收藏、分享、售卖 Prompt 模板。覆盖写作、营销、编程、设计、个人成长等场景。PromptBase 验证模式。',
    modules: ['prompts'],
    cta: '管理 Prompt',
  },
] as const;

export type TrackId = typeof TRACKS[number]['id'];
