import type { 
  StoryChapter, 
  RecordStory, 
  RecordAchievement, 
  DisplayCopy,
  RecordAchievementType,
  CollectionSourceType
} from '@/types'

const createStoryChapters = (
  recordId: string,
  recordTitle: string,
  recordArtist: string,
  genre: string
): StoryChapter[] => {
  const baseChapters: StoryChapter[] = [
    {
      id: `${recordId}-ch1`,
      chapterIndex: 1,
      title: '初次相遇',
      content: `当你第一次将《${recordTitle}》从货架上取下时，封面上那独特的设计仿佛在诉说着${recordArtist}的音乐灵魂。这张${genre}专辑的每一道纹路，都承载着跨越时代的记忆。`,
      unlockCondition: '收藏即可解锁',
      isUnlocked: false,
      unlockedDate: null
    },
    {
      id: `${recordId}-ch2`,
      chapterIndex: 2,
      title: '聆听之旅',
      content: `唱针落下的那一刻，${recordArtist}的音符如潮水般涌来。你开始明白，为什么这张专辑能成为无数乐迷心中的经典。音乐不仅仅是声音，更是情感的传递。`,
      unlockCondition: '持有超过 3 天',
      isUnlocked: false,
      unlockedDate: null,
      requiredDaysOwned: 3
    },
    {
      id: `${recordId}-ch3`,
      chapterIndex: 3,
      title: '知音难觅',
      content: `一位顾客站在《${recordTitle}》前久久不愿离去，当他最终带着它离开时，脸上洋溢着的幸福感让你明白：好的唱片总会找到它的知音。每一次交易，都是一次缘分的延续。`,
      unlockCondition: '成功售出 2 次',
      isUnlocked: false,
      unlockedDate: null,
      requiredSalesCount: 2
    },
    {
      id: `${recordId}-ch4`,
      chapterIndex: 4,
      title: '匠心守护',
      content: `经过精心的翻新维护，《${recordTitle}》重焕光彩。品相的提升不仅让它的价值翻倍，更重要的是，你守护了一份珍贵的文化遗产。正如音乐需要演奏者，唱片也需要懂它的守护者。`,
      unlockCondition: '完成 1 次翻新且品相 ≥ 85',
      isUnlocked: false,
      unlockedDate: null,
      requiredConditionScore: 85,
      requiredRenovationCount: 1
    },
    {
      id: `${recordId}-ch5`,
      chapterIndex: 5,
      title: '珍藏于心',
      content: `你将《${recordTitle}》标记为最爱，它不仅仅是一张商品，更是你店铺故事的一部分。从进货、陈列、推荐到收藏，每一步都凝聚着你的心血。这，就是黑胶店老板的幸福。`,
      unlockCondition: '标记为收藏且完成 1 个关卡',
      isUnlocked: false,
      unlockedDate: null,
      requiredFavorite: true,
      requiredCompletedLevels: [1]
    }
  ]
  return baseChapters
}

const createAchievements = (recordId: string, rarity: number): RecordAchievement[] => {
  const achievements: RecordAchievement[] = [
    {
      id: `${recordId}-ach-first-purchase`,
      type: 'first_purchase',
      name: '初次入手',
      icon: '🛒',
      description: '第一次将这张唱片收入库存',
      isUnlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 1
    },
    {
      id: `${recordId}-ach-first-sale`,
      type: 'first_sale',
      name: '成功推荐',
      icon: '💰',
      description: '第一次成功售出这张唱片',
      isUnlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 1
    },
    {
      id: `${recordId}-ach-high-value`,
      type: 'high_value_sale',
      name: '高价成交',
      icon: '💎',
      description: '以超过市场价 120% 的价格售出',
      isUnlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 1
    },
    {
      id: `${recordId}-ach-repeat`,
      type: 'repeat_sales',
      name: '畅销金曲',
      icon: '🔥',
      description: '累计售出 5 次',
      isUnlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 5
    },
    {
      id: `${recordId}-ach-perfect`,
      type: 'perfect_condition',
      name: '完美品相',
      icon: '✨',
      description: '品相评分达到 95 以上',
      isUnlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 95
    },
    {
      id: `${recordId}-ach-renovated`,
      type: 'renovated',
      name: '焕然一新',
      icon: '🔧',
      description: '完成 2 次翻新维护',
      isUnlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 2
    },
    {
      id: `${recordId}-ach-album`,
      type: 'album_centerpiece',
      name: '图鉴核心',
      icon: '📖',
      description: '作为关键唱片激活收藏图鉴',
      isUnlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 1
    },
    {
      id: `${recordId}-ach-favorite`,
      type: 'favorite_pick',
      name: '店主精选',
      icon: '❤️',
      description: '标记为最喜欢的收藏',
      isUnlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 1
    }
  ]
  
  if (rarity >= 4) {
    achievements.push({
      id: `${recordId}-ach-legendary`,
      type: 'legendary_find',
      name: '稀世珍藏',
      icon: '👑',
      description: '收藏这张稀有唱片',
      isUnlocked: false,
      unlockedDate: null,
      progress: 0,
      target: 1
    })
  }
  
  return achievements
}

const createDisplayCopy = (
  title: string, 
  artist: string, 
  genre: string, 
  year: number,
  rarity: number
): DisplayCopy => {
  const rarityLevel = ['入门经典', '品质之选', '值得珍藏', '稀有珍品', '传世之作'][rarity - 1] || '经典作品'
  
  const quotesByGenre: Record<string, string[]> = {
    'Jazz': [
      '"爵士乐是明天的音乐，它永远属于明天。" —— 迈尔斯·戴维斯',
      '"爵士乐不是和弦的排列，而是情感的流动。" —— 约翰·柯川',
      '"每一次爵士演奏，都是一次全新的冒险。" —— 路易斯·阿姆斯特朗'
    ],
    'Rock': [
      '"摇滚乐永不消亡，它只是换了张唱片。" —— 摇滚圣经',
      '"我们是音乐的反叛者，也是时代的记录者。" —— 披头士',
      '"把音量调到最大，让世界听到我们的声音。" —— 经典摇滚宣言'
    ],
    'Soul': [
      '"灵魂乐是心与心的对话，是最深沉的情感共鸣。" —— 马文·盖伊',
      '"每一个音符都来自灵魂深处，每一次演唱都是生命的呐喊。" —— 艾瑞莎·弗兰克林',
      '"灵魂乐不需要解释，你只需要去感受。" —— 奥蒂斯·雷丁'
    ],
    'Funk': [
      '"放克就是节拍，就是灵魂，就是让身体不由自主地动起来。" —— 詹姆斯·布朗',
      '"强调节奏，强调律动，强调快乐！" —— 放克宣言',
      '"当贝斯开始律动，整个世界都在跳舞。" —— Bootsy Collins'
    ],
    'Disco': [
      '"迪斯科不是音乐，它是一种生活态度！" —— 70年代宣言',
      '"舞池就是我们的圣殿，节拍就是我们的祈祷。" —— 迪斯科黄金时代',
      '"穿上你的舞鞋，今晚我们不回家！" —— 周六夜狂热'
    ],
    'Classical': [
      '"古典音乐是永恒的，它超越了时间和空间的限制。" —— 贝多芬',
      '"作曲家写下音符，演奏者赋予生命，听者获得灵魂。" —— 卡拉扬',
      '"每一次聆听，都是一次穿越时空的对话。" —— 古典音乐札记'
    ],
    'Blues': [
      '"蓝调是人生的忧伤，也是我们从中获取力量的源泉。" —— B.B. King',
      '"布鲁斯不是烦恼，而是对烦恼的超越。" —— 马迪·沃特斯',
      '"从三角洲到全世界，蓝调永远是音乐的根。" —— 罗伯特·约翰逊传承'
    ],
    'Pop': [
      '"流行音乐是时代的镜子，折射出每一代人的梦想。" —— 流行乐坛',
      '"让每个人都能找到共鸣，这就是流行的魅力。" —— 金曲制造者',
      '"一首好歌，可以改变一个人的一生。" —— 流行箴言'
    ],
    'Electronic': [
      '"电子音乐是未来的声音，是科技与艺术的完美结合。" —— Daft Punk',
      '"合成器是我们的乐器，节拍是我们的语言。" —— 电子宣言',
      '"让我们在无尽的律动中，找到属于自己的频率。" —— 俱乐部文化'
    ],
    'Folk': [
      '"民谣是时代的记录者，是人民的心声。" —— 鲍勃·迪伦',
      '"一把吉他，一个故事，一首永恒的歌。" —— 民谣传统',
      '"音乐不应该被封存在殿堂里，它应该在每个普通人的心中。" —— 琼·贝兹'
    ]
  }
  
  const quotes = quotesByGenre[genre] || quotesByGenre['Pop']
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
  
  const triviaPool = [
    `这张专辑录制于${year}年，正值${genre}音乐的黄金时代。`,
    `据说${artist}在录制这张专辑时，曾连续工作超过 48 小时。`,
    `专辑封面的设计灵感来自于${artist}的一次梦境。`,
    `在当时，${genre}音乐正经历着前所未有的变革与创新。`,
    `${artist}凭借这张专辑奠定了在${genre}领域的宗师地位。`,
    `这张专辑的首版黑胶在拍卖会上曾创下惊人的价格记录。`,
    `许多音乐人表示，这张专辑改变了他们对音乐的理解。`,
    `录制期间，工作室里总是弥漫着咖啡和香烟的味道。`,
    `专辑中的某首歌曲，其实是一次即兴演奏的完美结果。`,
    `${year}年的音乐杂志，将这张专辑评为年度最佳。`
  ]
  
  const selectedTrivia = [
    triviaPool[Math.floor(Math.random() * triviaPool.length)],
    triviaPool[Math.floor(Math.random() * triviaPool.length)]
  ].filter((v, i, a) => a.indexOf(v) === i).join(' ')
  
  const moods: Record<string, string[]> = {
    'Jazz': ['深夜咖啡馆', '雨夜独处', '微醺时刻'],
    'Rock': ['公路旅行', '热血沸腾', '释放自我'],
    'Soul': ['温暖午后', '恋人时光', '深情时刻'],
    'Funk': ['派对狂欢', '跳舞时刻', '活力满满'],
    'Disco': ['周末派对', '舞池热舞', '闪耀之夜'],
    'Classical': ['清晨阅读', '深度思考', '庄重仪式'],
    'Blues': ['雨后黄昏', '沉思时刻', '灵魂对话'],
    'Pop': ['通勤路上', '朋友聚会', '快乐时光'],
    'Electronic': ['深夜俱乐部', '未来幻想', '城市漫步'],
    'Folk': ['旅途风景', '安静午后', '回忆时刻']
  }
  
  const pairings: Record<string, string[]> = {
    'Jazz': ['威士忌', '手冲咖啡', '法式甜点'],
    'Rock': ['冰镇啤酒', '美式汉堡', '爆米花'],
    'Soul': ['红酒', '巧克力', '灵魂料理'],
    'Funk': ['鸡尾酒', '塔可', '街头美食'],
    'Disco': ['香槟', '草莓', '闪光蛋糕'],
    'Classical': ['茶点', '鹅肝', '精致晚宴'],
    'Blues': ['波本威士忌', '烧烤', '南方美食'],
    'Pop': ['奶茶', '披萨', '冰淇淋'],
    'Electronic': ['能量饮料', '寿司', '小食拼盘'],
    'Folk': ['热茶', '手工面包', '田园沙拉']
  }
  
  const genreMoods = moods[genre] || moods['Pop']
  const genrePairings = pairings[genre] || pairings['Pop']
  
  return {
    headline: `${artist} 的传世杰作`,
    tagline: `${rarityLevel} · ${genre}音乐史上的里程碑`,
    history: `《${title}》发布于${year}年，是${artist}职业生涯中的重要作品。在那个${genre}蓬勃发展的年代，这张专辑不仅在商业上取得了巨大成功，更在艺术层面影响了无数后来的音乐人。它所代表的，不仅仅是音乐，更是一个时代的文化印记。`,
    trivia: selectedTrivia,
    quote: randomQuote,
    recommendedPairing: `推荐搭配：${genrePairings[0]}、${genrePairings[1]}；适合场景：${genreMoods.join('、')}`,
    moodDescription: `当你播放这张唱片，仿佛置身于${genreMoods[0]}的氛围中。每一个音符都带着${year}年的温度，带领你穿越时空，与那个黄金时代对话。`
  }
}

export const generateRecordStory = (record: { id: string; title: string; artist: string; genre: string; rarity: number }): RecordStory => {
  const chapters = createStoryChapters(record.id, record.title, record.artist, record.genre)
  return {
    recordId: record.id,
    storyTitle: `${record.title} 的故事`,
    storyIcon: '📜',
    chapters,
    totalChapters: chapters.length,
    unlockedChapters: 0,
    isStoryComplete: false
  }
}

export const generateRecordAchievements = (recordId: string, rarity: number): RecordAchievement[] => {
  return createAchievements(recordId, rarity)
}

export const generateDisplayCopy = (record: { id: string; title: string; artist: string; genre: string; year: number; rarity: number }): DisplayCopy => {
  return createDisplayCopy(record.title, record.artist, record.genre, record.year, record.rarity)
}

export const getSourceTypeLabel = (type: CollectionSourceType): { label: string; icon: string; color: string } => {
  const labels: Record<CollectionSourceType, { label: string; icon: string; color: string }> = {
    'customer_gift': { label: '顾客赠送', icon: '🎁', color: '#ec4899' },
    'purchase': { label: '进货收藏', icon: '🛒', color: '#3b82f6' },
    'member_reward': { label: '会员回馈', icon: '👑', color: '#f59e0b' },
    'event_reward': { label: '活动奖励', icon: '🎉', color: '#8b5cf6' },
    'level_clear': { label: '通关奖励', icon: '🏆', color: '#10b981' },
    'special_customer': { label: '特殊顾客', icon: '⭐', color: '#f6e05e' },
    'album_bonus': { label: '图鉴奖励', icon: '📖', color: '#06b6d4' },
    'staff_reward': { label: '员工推荐', icon: '👨‍💼', color: '#64748b' }
  }
  return labels[type] || { label: '未知来源', icon: '❓', color: '#6b7280' }
}

export const getAchievementTypeInfo = (type: RecordAchievementType): { name: string; icon: string } => {
  const info: Record<RecordAchievementType, { name: string; icon: string }> = {
    'first_purchase': { name: '初次入手', icon: '🛒' },
    'first_sale': { name: '成功推荐', icon: '💰' },
    'high_value_sale': { name: '高价成交', icon: '💎' },
    'repeat_sales': { name: '畅销金曲', icon: '🔥' },
    'perfect_condition': { name: '完美品相', icon: '✨' },
    'renovated': { name: '焕然一新', icon: '🔧' },
    'album_centerpiece': { name: '图鉴核心', icon: '📖' },
    'favorite_pick': { name: '店主精选', icon: '❤️' },
    'customer_favorite': { name: '顾客最爱', icon: '😊' },
    'legendary_find': { name: '稀世珍藏', icon: '👑' }
  }
  return info[type] || { name: type, icon: '🏅' }
}
