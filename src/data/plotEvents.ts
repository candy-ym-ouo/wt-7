import type {
  PlotEventConfig,
  SpecialOrderConfig,
  LevelEndingConfig,
  CustomerRelationship,
  RelationshipLevel,
  Genre
} from '@/types'

const getRelationshipLevelInfo = (level: RelationshipLevel): { name: string; icon: string; minTrust: number } => {
  const levels: Record<RelationshipLevel, { name: string; icon: string; minTrust: number }> = {
    stranger: { name: '陌生人', icon: '👋', minTrust: 0 },
    acquaintance: { name: '熟人', icon: '🙂', minTrust: 20 },
    friend: { name: '朋友', icon: '🤝', minTrust: 50 },
    confidant: { name: '知己', icon: '💝', minTrust: 100 },
    soulmate: { name: '灵魂伴侣', icon: '✨', minTrust: 200 }
  }
  return levels[level]
}

const getNextLevelTrust = (level: RelationshipLevel): number => {
  const nextMap: Record<RelationshipLevel, number> = {
    stranger: 20,
    acquaintance: 50,
    friend: 100,
    confidant: 200,
    soulmate: 999
  }
  return nextMap[level]
}

const ownerGrowthEvents: PlotEventConfig[] = [
  {
    id: 'owner_growth_first_sale',
    type: 'owner_growth',
    category: 'main',
    title: '第一笔交易',
    subtitle: '店主成长之路的起点',
    icon: '💰',
    coverColor: '#f6ad55',
    description: '每一个传奇黑胶店主，都从第一笔交易开始。',
    longDescription: '当你完成人生中第一笔唱片交易时，那种满足感难以言喻。这不仅仅是金钱的收获，更是梦想的开始。',
    triggerCondition: {
      minLevel: 1,
      probabilityWeight: 100
    },
    nodes: [
      {
        id: 'node_start',
        title: '初尝甜头',
        content: '叮——收银机响起清脆的声音。你看着顾客满意地带着唱片离开，心中涌起一股暖流。这是你开业以来的第一笔交易。',
        speakerName: '系统',
        speakerAvatar: '🏪',
        backgroundEmotion: 'happy',
        autoNextDelay: 3000,
        nextNodeId: 'node_reflect'
      },
      {
        id: 'node_reflect',
        title: '经营理念',
        content: '站在柜台后，你开始思考：作为黑胶店的店主，你希望这家店成为什么样的存在？每一个选择，都将塑造你未来的经营道路。',
        speakerName: '内心独白',
        speakerAvatar: '🤔',
        backgroundEmotion: 'neutral',
        choices: [
          {
            id: 'choice_profit',
            label: '精明的商人',
            description: '追求利润最大化，让店铺蓬勃发展',
            icon: '💎',
            effects: [
              { type: 'special_flag', value: 1, targetId: 'owner_style_profit', description: '确立商业风格' },
              { type: 'growth_points', value: 10, description: '获得成长值' }
            ],
            nextNodeId: 'node_profit'
          },
          {
            id: 'choice_relationship',
            label: '友善的朋友',
            description: '与顾客建立深厚关系，传播音乐文化',
            icon: '💕',
            effects: [
              { type: 'special_flag', value: 1, targetId: 'owner_style_relationship', description: '确立人文风格' },
              { type: 'reputation', value: 5, description: '获得声望' }
            ],
            nextNodeId: 'node_relationship'
          },
          {
            id: 'choice_balance',
            label: '音乐的守护者',
            description: '在商业与情怀之间寻求平衡',
            icon: '⚖️',
            effects: [
              { type: 'special_flag', value: 1, targetId: 'owner_style_balance', description: '确立平衡风格' },
              { type: 'growth_points', value: 5, description: '获得成长值' },
              { type: 'reputation', value: 3, description: '获得声望' }
            ],
            nextNodeId: 'node_balance'
          }
        ]
      },
      {
        id: 'node_profit',
        title: '商业之路',
        content: '你决定将店铺经营得有声有色。精明的定价策略、高效的库存管理，每一步都经过深思熟虑。很快，你的店就以「价格公道、品质保证」在附近小有名气。',
        speakerName: '旁白',
        speakerAvatar: '📖',
        backgroundEmotion: 'happy',
        isEnding: true,
        endingType: 'good',
        unlockReward: {
          budget: 200,
          growthPoints: 15,
          achievementId: 'ach_first_path_profit'
        }
      },
      {
        id: 'node_relationship',
        title: '人情之路',
        content: '你用心记住每一位常客的喜好，耐心为新手讲解黑胶文化。渐渐地，你的店成为了乐迷们的聚集地。有人说，走进这里就像回到了家。',
        speakerName: '旁白',
        speakerAvatar: '📖',
        backgroundEmotion: 'happy',
        isEnding: true,
        endingType: 'good',
        unlockReward: {
          reputation: 10,
          growthPoints: 15,
          achievementId: 'ach_first_path_relationship'
        }
      },
      {
        id: 'node_balance',
        title: '平衡之道',
        content: '你明白，黑胶店的经营不仅仅是生意，更是一种文化传承。你在商业与情怀之间找到了属于自己的节奏——既让店铺能够持续运营，又让每一位顾客都能感受到音乐的温度。',
        speakerName: '旁白',
        speakerAvatar: '📖',
        backgroundEmotion: 'happy',
        isEnding: true,
        endingType: 'good',
        unlockReward: {
          budget: 100,
          reputation: 5,
          growthPoints: 20,
          achievementId: 'ach_first_path_balance'
        }
      }
    ],
    startNodeId: 'node_start',
    minLevel: 1,
    priority: 10,
    isRepeatable: false,
    cooldownDays: 0,
    rewardPreview: '根据选择获得不同奖励'
  },
  {
    id: 'owner_growth_crisis',
    type: 'owner_growth',
    category: 'main',
    title: '经营危机',
    subtitle: '面对困难的抉择',
    icon: '⚡',
    coverColor: '#fc8181',
    description: '一帆风顺的经营中，总会遇到意想不到的挑战。',
    longDescription: '正当生意渐入佳境时，一场突如其来的危机降临。如何应对，将决定你店铺的未来走向。',
    triggerCondition: {
      minLevel: 2,
      minDay: 5,
      minReputation: 20,
      probabilityWeight: 60
    },
    nodes: [
      {
        id: 'crisis_start',
        title: '坏消息',
        content: '一个阴沉的早晨，你收到了房东的通知：由于周边商圈升级，店铺租金即将上涨 50%。同时，隔壁新开了一家连锁唱片店，以低价策略吸引顾客。',
        speakerName: '📰',
        backgroundEmotion: 'sad',
        autoNextDelay: 4000,
        nextNodeId: 'crisis_choice'
      },
      {
        id: 'crisis_choice',
        title: '应对策略',
        content: '双重压力下，你必须尽快做出决定。每一条路都有风险，但也都有机会。',
        speakerName: '内心独白',
        speakerAvatar: '😰',
        backgroundEmotion: 'neutral',
        choices: [
          {
            id: 'crisis_price_war',
            label: '降价迎战',
            description: '以牙还牙，用价格战留住顾客',
            icon: '⚔️',
            effects: [
              { type: 'special_flag', value: 1, targetId: 'crisis_price_war_chosen', description: '选择价格战' },
              { type: 'budget', value: -300, description: '牺牲短期利润' },
              { type: 'customer_count', value: 30, description: '吸引更多顾客' }
            ],
            nextNodeId: 'crisis_price_result'
          },
          {
            id: 'crisis_differentiate',
            label: '差异化经营',
            description: '发挥特色优势，避开正面竞争',
            icon: '🎯',
            effects: [
              { type: 'special_flag', value: 1, targetId: 'crisis_diff_chosen', description: '选择差异化' },
              { type: 'budget', value: -200, description: '投入特色建设' },
              { type: 'reputation', value: 10, description: '建立特色声望' }
            ],
            nextNodeId: 'crisis_diff_result',
            conditionExpression: 'minReputation>=30'
          },
          {
            id: 'crisis_partnership',
            label: '寻求合作',
            description: '与周边商家联盟，互惠共赢',
            icon: '🤝',
            effects: [
              { type: 'special_flag', value: 1, targetId: 'crisis_partner_chosen', description: '选择合作' },
              { type: 'budget', value: -100, description: '合作启动资金' },
              { type: 'buy_chance', value: 10, description: '增加购买率' }
            ],
            nextNodeId: 'crisis_partner_result'
          }
        ]
      },
      {
        id: 'crisis_price_result',
        title: '险中求胜',
        content: '激烈的价格战让你损失了不少利润，但也成功留住了大部分老顾客。三个月后，连锁店因水土不服黯然离场。你松了一口气，但也明白不能每次都靠这种方式。',
        speakerName: '旁白',
        backgroundEmotion: 'happy',
        isEnding: true,
        endingType: 'normal',
        unlockReward: {
          budget: 500,
          growthPoints: 25,
          reputation: 8
        }
      },
      {
        id: 'crisis_diff_result',
        title: '脱颖而出',
        content: '你投入资金打造了独特的「聆听空间」，举办周末鉴赏会，邀请资深乐迷分享。很快，你的店就以「文化氛围浓厚」的口碑甩开了竞争对手，甚至吸引了许多外地游客慕名而来。',
        speakerName: '旁白',
        backgroundEmotion: 'happy',
        isEnding: true,
        endingType: 'good',
        unlockReward: {
          budget: 800,
          growthPoints: 40,
          reputation: 20
        }
      },
      {
        id: 'crisis_partner_result',
        title: '互利共赢',
        content: '你与隔壁的咖啡馆、书店达成合作：在对方消费可以获得你店的折扣券，反之亦然。三家店形成了小小的文化商圈，客流共享，大家的生意都好了起来。',
        speakerName: '旁白',
        backgroundEmotion: 'happy',
        isEnding: true,
        endingType: 'good',
        unlockReward: {
          budget: 600,
          growthPoints: 30,
          reputation: 15
        }
      }
    ],
    startNodeId: 'crisis_start',
    minLevel: 2,
    priority: 8,
    isRepeatable: false,
    cooldownDays: 0,
    rewardPreview: '根据选择获得 500-800 预算和成长值'
  },
  {
    id: 'owner_growth_mentor',
    type: 'owner_growth',
    category: 'hidden',
    title: '神秘前辈',
    subtitle: '来自老一代店主的智慧',
    icon: '🧙',
    coverColor: '#9f7aea',
    description: '一位神秘的老人走进了你的店铺，他似乎对黑胶有着非同寻常的理解。',
    longDescription: '传说中的黑胶教父级人物，据说他培养出了无数优秀的唱片店店主。今天，他竟然出现在了你的店里。',
    triggerCondition: {
      minLevel: 3,
      minReputation: 50,
      requiredCollectionCount: 30,
      probabilityWeight: 20
    },
    nodes: [
      {
        id: 'mentor_start',
        title: '不速之客',
        content: '一位满头银发的老人缓缓走入店内。他没有急着看唱片，而是环顾四周，微微点头。「年轻人，这家店的气息不错。」他的声音低沉而有磁性。',
        speakerName: '神秘老人',
        speakerAvatar: '🧙',
        backgroundEmotion: 'mysterious',
        autoNextDelay: 4000,
        nextNodeId: 'mentor_question'
      },
      {
        id: 'mentor_question',
        title: '灵魂拷问',
        content: '老人转向你，目光深邃：「我问你——黑胶唱片的本质是什么？是商品？是文化载体？还是……某种更神圣的东西？」',
        speakerName: '神秘老人',
        speakerAvatar: '🧙',
        backgroundEmotion: 'mysterious',
        choices: [
          {
            id: 'mentor_commodity',
            label: '是商品',
            description: '有价值的物品，值得被交易和收藏',
            icon: '📦',
            effects: [
              { type: 'growth_points', value: 15, description: '获得商业感悟' },
              { type: 'budget', value: 200, description: '老人的建议' }
            ],
            nextNodeId: 'mentor_commodity_end'
          },
          {
            id: 'mentor_culture',
            label: '是文化载体',
            description: '记录着时代和记忆，传承音乐精神',
            icon: '📚',
            effects: [
              { type: 'growth_points', value: 20, description: '获得文化感悟' },
              { type: 'reputation', value: 15, description: '老人的赞赏' }
            ],
            nextNodeId: 'mentor_culture_end'
          },
          {
            id: 'mentor_sacred',
            label: '是时间的结晶',
            description: '每一张都是独一无二的，承载着制作者和听者的灵魂',
            icon: '💫',
            effects: [
              { type: 'growth_points', value: 50, description: '获得深刻感悟' },
              { type: 'reputation', value: 25, description: '老人的认可' },
              { type: 'special_flag', value: 1, targetId: 'mentor_blessing', description: '获得前辈祝福' }
            ],
            nextNodeId: 'mentor_sacred_end'
          }
        ]
      },
      {
        id: 'mentor_commodity_end',
        title: '现实之选',
        content: '老人微微一笑：「务实，很好。不虚伪，不矫饰。记住，再好的文化也需要生存的土壤。希望你能在务实中，保留那份对音乐的初心。」他留下一张名片，上面写着「有困难，来找我」。',
        speakerName: '神秘老人',
        speakerAvatar: '🧙',
        backgroundEmotion: 'happy',
        isEnding: true,
        endingType: 'normal',
        unlockReward: {
          budget: 500,
          growthPoints: 30,
          recordId: 'rare_mentor_1'
        }
      },
      {
        id: 'mentor_culture_end',
        title: '传承者',
        content: '老人眼中闪过一丝欣慰：「很好。在这个浮躁的时代，还能有人记得这一点。黑胶店的店主，本质上是文化的守门人。好好走下去，年轻人。」他从包里取出一张品相极佳的稀有唱片，郑重地交给你。',
        speakerName: '神秘老人',
        speakerAvatar: '🧙',
        backgroundEmotion: 'happy',
        isEnding: true,
        endingType: 'good',
        unlockReward: {
          budget: 300,
          growthPoints: 50,
          reputation: 20,
          recordId: 'rare_mentor_2'
        }
      },
      {
        id: 'mentor_sacred_end',
        title: '命中注定',
        content: '老人沉默了片刻，眼眶微微湿润：「三十年了……我终于等到一个懂得这个道理的人。」他将一枚古老的徽章别在你的衣襟上，「这是黑胶守护者的信物。从今往后，你不再是一个人在战斗。整个守护者网络，都将是你的后盾。」',
        speakerName: '神秘老人',
        speakerAvatar: '🧙',
        backgroundEmotion: 'happy',
        isEnding: true,
        endingType: 'perfect',
        unlockReward: {
          budget: 1000,
          growthPoints: 100,
          reputation: 50,
          recordId: 'legendary_mentor_vinyl',
          achievementId: 'ach_vinyl_guardian'
        }
      }
    ],
    startNodeId: 'mentor_start',
    minLevel: 3,
    priority: 2,
    isRepeatable: false,
    cooldownDays: 0,
    rewardPreview: '稀有唱片 + 神秘老人的祝福'
  }
]

const customerRelationshipEvents: PlotEventConfig[] = [
  {
    id: 'cust_rel_old_friend',
    type: 'customer_relationship',
    category: 'main',
    title: '老陈的故事',
    subtitle: '一位常客的深情往事',
    icon: '👴',
    coverColor: '#4fd1c5',
    description: '老陈是你店里的常客，每周三下午都会准时出现。',
    longDescription: '有些顾客不仅仅是顾客，更是你人生故事的一部分。老陈的故事，将让你重新理解黑胶的意义。',
    triggerCondition: {
      minLevel: 1,
      minDay: 7,
      probabilityWeight: 50
    },
    nodes: [
      {
        id: 'oldchen_start',
        title: '熟悉的面孔',
        content: '周三下午三点整，老陈准时推开店门。他穿着一件洗得发白的中山装，手里提着一个旧布包。「小老板，今天有什么好东西推荐吗？」他笑着问，眼角的皱纹如同岁月的年轮。',
        speakerName: '老陈',
        speakerAvatar: '👴',
        backgroundEmotion: 'happy',
        autoNextDelay: 4000,
        nextNodeId: 'oldchen_request'
      },
      {
        id: 'oldchen_request',
        title: '特别的请求',
        content: '今天的老陈有些不一样。他犹豫了很久，才小心翼翼地问：「小老板……你能不能帮我找一张唱片？叫《月亮代表我的心》，最好是 1973 年的首版。钱不是问题。」他的声音有些颤抖。',
        speakerName: '老陈',
        speakerAvatar: '👴',
        backgroundEmotion: 'neutral',
        choices: [
          {
            id: 'oldchen_agree_free',
            label: '免费帮您找',
            description: '被老陈的真诚打动，决定不收佣金',
            icon: '💝',
            effects: [
              { type: 'relationship', value: 30, targetId: 'oldchen', description: '老陈的信任大增' },
              { type: 'special_flag', value: 1, targetId: 'oldchen_promise', description: '许下承诺' }
            ],
            nextNodeId: 'oldchen_story'
          },
          {
            id: 'oldchen_agree_normal',
            label: '我尽力而为',
            description: '按照正常渠道帮忙寻找',
            icon: '🤝',
            effects: [
              { type: 'relationship', value: 10, targetId: 'oldchen', description: '老陈的信任增加' },
              { type: 'budget', value: 50, description: '收取定金' }
            ],
            nextNodeId: 'oldchen_story'
          },
          {
            id: 'oldchen_ask_reason',
            label: '为什么一定要这张？',
            description: '先了解背后的故事再说',
            icon: '❓',
            effects: [
              { type: 'relationship', value: 5, targetId: 'oldchen', description: '老陈愿意分享' }
            ],
            nextNodeId: 'oldchen_story'
          }
        ]
      },
      {
        id: 'oldchen_story',
        title: '半世纪的回忆',
        content: '老陈沉默了一会儿，从布包里取出一张泛黄的照片。照片上，一对年轻的情侣依偎在一起。「这是我和她，1973 年拍的。那张唱片……是我们定情的信物。她走了十年了，但我总觉得，只要能再听到那张唱片，她就还在我身边。」',
        speakerName: '老陈',
        speakerAvatar: '👴',
        backgroundEmotion: 'sad',
        autoNextDelay: 5000,
        nextNodeId: 'oldchen_promise'
      },
      {
        id: 'oldchen_promise',
        title: '承诺',
        content: '你被深深打动了。「老陈，放心吧。我一定帮您找到那张唱片。不管花多长时间，多少代价。」老陈握住你的手，浑浊的眼睛里闪着泪光。',
        speakerName: '你',
        speakerAvatar: '🙋',
        backgroundEmotion: 'happy',
        isEnding: true,
        endingType: 'good',
        unlockReward: {
          growthPoints: 40,
          reputation: 20,
          customerId: 'oldchen_special'
        }
      }
    ],
    startNodeId: 'oldchen_start',
    minLevel: 1,
    priority: 7,
    isRepeatable: false,
    cooldownDays: 0,
    rewardPreview: '老陈的信任 + 特殊顾客解锁'
  },
  {
    id: 'cust_rel_young_collector',
    type: 'customer_relationship',
    category: 'side',
    title: '年轻的收藏家',
    subtitle: 'Z世代与黑胶的碰撞',
    icon: '👦',
    coverColor: '#63b3ed',
    description: '一个背着潮牌背包的年轻人走进了你的店。',
    longDescription: '年轻人以为黑胶是复古潮流，你却要让他明白黑胶真正的魅力。',
    triggerCondition: {
      minLevel: 2,
      probabilityWeight: 40
    },
    nodes: [
      {
        id: 'youth_start',
        title: '潮流与经典',
        content: '「老板，你们这里最火的、适合拍 Instagram 的唱片是哪张？」年轻人举着手机，显然是为了赶「复古潮流」而来。',
        speakerName: '小宇',
        speakerAvatar: '👦',
        backgroundEmotion: 'surprised',
        autoNextDelay: 3500,
        nextNodeId: 'youth_choice'
      },
      {
        id: 'youth_choice',
        title: '如何引导',
        content: '看着这个年轻人，你在想：该把黑胶当作潮流单品卖给他，还是试着让他真正爱上这种音乐载体？',
        speakerName: '内心独白',
        speakerAvatar: '🤔',
        backgroundEmotion: 'neutral',
        choices: [
          {
            id: 'youth_trendy',
            label: '推荐潮流款',
            description: '顾客就是上帝，满足他的需求',
            icon: '📸',
            effects: [
              { type: 'budget', value: 150, description: '高价卖出潮流唱片' },
              { type: 'satisfaction', value: 10, description: '顾客满意' }
            ],
            nextNodeId: 'youth_trendy_end'
          },
          {
            id: 'youth_introduce',
            label: '「先听听这个」',
            description: '递给他耳机，播放一首经典',
            icon: '🎧',
            effects: [
              { type: 'relationship', value: 15, targetId: 'xiaoyu', description: '建立好感' },
              { type: 'growth_points', value: 10, description: '传播音乐文化' }
            ],
            nextNodeId: 'youth_listen'
          },
          {
            id: 'youth_story',
            label: '讲讲黑胶的故事',
            description: '告诉他每张唱片背后的历史',
            icon: '📖',
            effects: [
              { type: 'relationship', value: 20, targetId: 'xiaoyu', description: '获得尊重' },
              { type: 'reputation', value: 5, description: '文化传播者' }
            ],
            nextNodeId: 'youth_story_end'
          }
        ]
      },
      {
        id: 'youth_trendy_end',
        title: '各取所需',
        content: '年轻人心满意足地拿着「网红唱片」离开了，拍了九张照片发了朋友圈。你赚了钱，但总觉得少了点什么。不过，也许这也是一种传播方式？',
        speakerName: '旁白',
        backgroundEmotion: 'neutral',
        isEnding: true,
        endingType: 'normal',
        unlockReward: {
          budget: 200,
          growthPoints: 10
        }
      },
      {
        id: 'youth_listen',
        title: '被征服的耳朵',
        content: '唱针落下的瞬间，年轻人皱起了眉。然后，他的眼睛慢慢睁大了。「这……这和我在手机上听的完全不一样！」他惊呼，「怎么会这么温暖，这么有层次？」',
        speakerName: '小宇',
        speakerAvatar: '👦',
        backgroundEmotion: 'surprised',
        autoNextDelay: 4000,
        nextNodeId: 'youth_converted'
      },
      {
        id: 'youth_converted',
        title: '新的皈依者',
        content: '那一天，小宇不仅买了三张经典专辑，还办了会员。后来他成了店里的常客，每次来都会带新的朋友。「谢谢老板，你让我真正爱上了音乐。」他总是这样说。',
        speakerName: '旁白',
        backgroundEmotion: 'happy',
        isEnding: true,
        endingType: 'good',
        unlockReward: {
          budget: 300,
          growthPoints: 30,
          reputation: 15,
          customerId: 'xiaoyu_regular'
        }
      },
      {
        id: 'youth_story_end',
        title: '传承者',
        content: '小宇听得入了迷，从下午一直待到打烊。他说：「原来这些塑料圆盘里，藏着这么多故事。」半年后，他在自己的大学创办了黑胶文化社。你的店，成为了他们的「朝圣地」。',
        speakerName: '旁白',
        backgroundEmotion: 'happy',
        isEnding: true,
        endingType: 'perfect',
        unlockReward: {
          budget: 400,
          growthPoints: 50,
          reputation: 30,
          achievementId: 'ach_culture_passed_on'
        }
      }
    ],
    startNodeId: 'youth_start',
    minLevel: 2,
    priority: 6,
    isRepeatable: false,
    cooldownDays: 0,
    rewardPreview: '根据选择获得不同奖励'
  }
]

const specialOrders: SpecialOrderConfig[] = [
  {
    id: 'order_jazz_collection',
    eventId: 'special_order_jazz',
    customerId: 'mr_jazz',
    customerName: '爵士乐手老王',
    customerAvatar: '🎷',
    title: '爵士老人的心愿',
    description: '老王是本地著名的爵士乐手，他想为自己的学生们找一套经典爵士入门专辑。',
    requirements: [
      { type: 'genre', value: 'Jazz', description: '爵士乐唱片', count: 5 },
      { type: 'rarity', value: 3, description: '至少 3 星稀有度', count: 3 },
      { type: 'condition', value: 80, description: '品相评分 80 以上' }
    ],
    deadlineDays: 14,
    reward: {
      basePayment: 1500,
      bonusPayment: 800,
      reputation: 30,
      growthPoints: 40,
      relationshipBonus: 25,
      specialGiftId: 'gift_jazz_signature'
    },
    difficulty: 'medium',
    story: '老王说：「我想让这些年轻人从一开始就听最好的。数字音乐太方便了，但他们需要听到真正的声音。」'
  },
  {
    id: 'order_rare_rock',
    eventId: 'special_order_rock',
    customerId: 'rock_collector',
    customerName: '摇滚收藏家阿杰',
    customerAvatar: '🎸',
    title: '消失的专辑',
    description: '传说中只发行了 500 张的地下摇滚专辑，据说只有真正的圈内人才能找到。',
    requirements: [
      { type: 'specific_record', value: 'lost_rock_album_1987', description: '《黑暗中的呐喊》1987 地下首版' },
      { type: 'rarity', value: 5, description: '必须是 5 星传世级' },
      { type: 'condition', value: 90, description: '品相近乎完美' }
    ],
    deadlineDays: 30,
    reward: {
      basePayment: 5000,
      bonusPayment: 3000,
      reputation: 80,
      growthPoints: 100,
      relationshipBonus: 50,
      specialGiftId: 'gift_rock_backstage'
    },
    difficulty: 'legendary',
    story: '「这张专辑改变了我的人生。我找了它 20 年了……如果你能帮我找到，我愿意付出任何代价。」'
  },
  {
    id: 'order_wedding_gift',
    eventId: 'special_order_wedding',
    customerId: 'groom_lin',
    customerName: '新郎小林',
    customerAvatar: '💒',
    title: '婚礼的惊喜',
    description: '小林想在婚礼上播放一首特殊的歌曲——那是他和妻子第一次约会时在咖啡店听到的。',
    requirements: [
      { type: 'artist', value: '周蕙', description: '周蕙的专辑' },
      { type: 'price_range', value: [0, 500] as [number, number], description: '控制在 500 元内' },
      { type: 'genre', value: 'Pop', description: '流行音乐' }
    ],
    deadlineDays: 7,
    reward: {
      basePayment: 600,
      bonusPayment: 300,
      reputation: 20,
      growthPoints: 25,
      relationshipBonus: 15
    },
    difficulty: 'easy',
    story: '「老板，求求你了。这首歌对我们意义重大。我想在婚礼第一支舞的时候放……」'
  },
  {
    id: 'order_classical_set',
    eventId: 'special_order_classical',
    customerId: 'professor_zhang',
    customerName: '张教授',
    customerAvatar: '👨‍🏫',
    title: '音乐学院的订单',
    description: '市音乐学院需要一套古典音乐名曲集，用于学生的鉴赏课程。',
    requirements: [
      { type: 'genre', value: 'Classical', description: '古典音乐唱片', count: 10 },
      { type: 'condition', value: 75, description: '品相 75 分以上' }
    ],
    deadlineDays: 21,
    reward: {
      basePayment: 3000,
      bonusPayment: 1000,
      reputation: 50,
      growthPoints: 60,
      relationshipBonus: 30,
      specialGiftId: 'gift_concert_tickets'
    },
    difficulty: 'hard',
    story: '「好的录音版本对学生来说至关重要。他们需要听到最纯正的演绎，才能理解音乐的真谛。」'
  }
]

const specialOrderEvents: PlotEventConfig[] = [
  {
    id: 'special_order_jazz',
    type: 'special_order',
    category: 'side',
    title: '特殊订单：爵士心愿',
    subtitle: '爵士老人的委托',
    icon: '📋',
    coverColor: '#ed8936',
    description: '一位爵士乐手委托你寻找一套经典入门专辑。',
    longDescription: '为了让年轻一代接触真正的爵士乐，老王愿意出高价收购优质唱片。',
    triggerCondition: {
      minLevel: 2,
      minReputation: 25,
      probabilityWeight: 45
    },
    nodes: [
      {
        id: 'so_jazz_start',
        title: '不寻常的客人',
        content: '一位头发花白、戴着贝雷帽的老人走进店里。从他走路的姿态，你能看出这是一个一辈子都在和节奏打交道的人。「听说你这里的东西不错。我有一批学生，需要真正的入门教材。」',
        speakerName: '老王',
        speakerAvatar: '🎷',
        backgroundEmotion: 'neutral',
        autoNextDelay: 4000,
        nextNodeId: 'so_jazz_order'
      },
      {
        id: 'so_jazz_order',
        title: '订单详情',
        content: '老王从包里取出一张手写的清单，字迹苍劲有力。「这是我列的。5 张爵士乐经典，至少 3 张是 3 星以上的，品相不能差。半个月内，能办到吗？」',
        speakerName: '老王',
        speakerAvatar: '🎷',
        backgroundEmotion: 'neutral',
        choices: [
          {
            id: 'so_jazz_accept',
            label: '接受订单',
            description: '14 天内完成，基础酬劳 1500，完成出色另有奖励',
            icon: '✅',
            effects: [
              { type: 'special_flag', value: 1, targetId: 'order_jazz_active', description: '激活爵士订单' }
            ],
            nextNodeId: 'so_jazz_accepted'
          },
          {
            id: 'so_jazz_negotiate',
            label: '要求更多时间',
            description: '请求延长到 21 天，酬劳降低 10%',
            icon: '⏰',
            effects: [
              { type: 'special_flag', value: 1, targetId: 'order_jazz_extended', description: '延长订单期限' }
            ],
            nextNodeId: 'so_jazz_extended'
          },
          {
            id: 'so_jazz_reject',
            label: '暂时无法接受',
            description: '库存不足，婉拒这次委托',
            icon: '❌',
            effects: [
              { type: 'reputation', value: -5, description: '轻微损失声望' }
            ],
            nextNodeId: 'so_jazz_rejected'
          }
        ]
      },
      {
        id: 'so_jazz_accepted',
        title: '放心交给我',
        content: '老王露出了笑容：「好！年轻人有魄力。我相信你。记住，爵士乐讲究的是 feel，不是数字。让这些孩子听到音乐里的灵魂。」',
        speakerName: '老王',
        speakerAvatar: '🎷',
        backgroundEmotion: 'happy',
        isEnding: true,
        endingType: 'good',
        unlockReward: {
          budget: 300,
          growthPoints: 10
        }
      },
      {
        id: 'so_jazz_extended',
        title: '稳妥起见',
        content: '老王想了想，点了点头：「也好，慢工出细活。我不赶时间，最重要的是品质。去吧，年轻人。」',
        speakerName: '老王',
        speakerAvatar: '🎷',
        backgroundEmotion: 'neutral',
        isEnding: true,
        endingType: 'normal',
        unlockReward: {
          budget: 200,
          growthPoints: 5
        }
      },
      {
        id: 'so_jazz_rejected',
        title: '遗憾',
        content: '老王叹了口气：「好吧，没关系。我再去别处看看。」他的背影有几分落寞。你希望以后还有弥补的机会。',
        speakerName: '旁白',
        backgroundEmotion: 'sad',
        isEnding: true,
        endingType: 'bad',
        unlockReward: {}
      }
    ],
    startNodeId: 'so_jazz_start',
    minLevel: 2,
    priority: 5,
    isRepeatable: false,
    cooldownDays: 7,
    rewardPreview: '1500-2300 预算 + 爵士老人的友谊'
  }
]

const multiEndingConfigs: LevelEndingConfig[] = [
  {
    id: 'level1_ending_normal',
    levelId: 1,
    type: 'normal',
    typeName: '普通结局',
    title: '站稳脚跟',
    description: '你成功经营了一个月，店铺终于走上了正轨。',
    epilogue: '回首这一个月，有欢笑也有泪水。虽然没有什么惊天动地的成就，但你知道，这只是开始。黑胶之路，漫漫其修远兮。',
    icon: '🌟',
    conditions: {
      minProfit: 2000
    },
    rewards: {
      budget: 1000,
      reputation: 10,
      growthPoints: 50,
      unlockNextLevelBonus: true
    },
    isUnlocked: false,
    unlockedDate: null
  },
  {
    id: 'level1_ending_good',
    levelId: 1,
    type: 'good',
    typeName: '良好结局',
    title: '小有名气',
    description: '你的店铺在周边已经有了不错的口碑，回头客越来越多。',
    epilogue: '「你听说了吗？那家新开的黑胶店很不错！」这样的评价在附近传开。你不仅赚到了钱，更收获了认可。',
    icon: '⭐',
    conditions: {
      minProfit: 4000,
      minSatisfaction: 80,
      minReputation: 30
    },
    rewards: {
      budget: 2500,
      reputation: 30,
      growthPoints: 100,
      bonusRecordId: 'reward_level1_good',
      unlockNextLevelBonus: true
    },
    isUnlocked: false,
    unlockedDate: null
  },
  {
    id: 'level1_ending_perfect',
    levelId: 1,
    type: 'perfect',
    typeName: '完美结局',
    title: '传奇的起点',
    description: '这一个月，你创造了无数不可能完成的奇迹。',
    epilogue: '老陈的唱片找到了、小宇成为了文化传播者、神秘老人留下了祝福……你知道吗？在城市的某个角落，老乐迷们正在谈论着你的名字。「那家店，有灵魂。」这是最高的评价。',
    icon: '👑',
    conditions: {
      minProfit: 6000,
      minSatisfaction: 95,
      minReputation: 60,
      requiredCompletedEventIds: ['owner_growth_first_sale', 'cust_rel_old_friend', 'owner_growth_mentor'],
      requiredCollectionCount: 40
    },
    rewards: {
      budget: 5000,
      reputation: 80,
      growthPoints: 250,
      bonusRecordId: 'legendary_level1_perfect',
      unlockNextLevelBonus: true
    },
    isUnlocked: false,
    unlockedDate: null
  },
  {
    id: 'level1_ending_bad',
    levelId: 1,
    type: 'bad',
    typeName: '遗憾结局',
    title: '举步维艰',
    description: '经营状况不太理想，但你没有放弃。',
    epilogue: '这个月的成绩并不理想。租金、库存、顾客流失……问题接踵而至。但你告诉自己：爱迪生发明灯泡之前失败了一千次。我这才哪到哪？',
    icon: '💪',
    conditions: {
      minProfit: 500
    },
    rewards: {
      budget: 300,
      reputation: 0,
      growthPoints: 20
    },
    isUnlocked: false,
    unlockedDate: null
  },
  {
    id: 'level1_ending_secret',
    levelId: 1,
    type: 'secret',
    typeName: '隐藏结局',
    title: '守护者的觉醒',
    description: '你获得了黑胶守护者的传承，从此肩负起更重大的使命。',
    epilogue: '当神秘老人将古老的徽章交予你的那一刻，你感受到了一股来自半个世纪前的力量。「你是第九十九代守护者。去吧，让黑胶的火焰永不熄灭。」',
    icon: '🛡️',
    conditions: {
      minProfit: 3000,
      specialFlags: ['mentor_blessing'],
      requiredCompletedEventIds: ['owner_growth_mentor']
    },
    rewards: {
      budget: 8000,
      reputation: 100,
      growthPoints: 500,
      bonusRecordId: 'legendary_guardian_vinyl',
      unlockNextLevelBonus: true
    },
    isUnlocked: false,
    unlockedDate: null
  },
  {
    id: 'level2_ending_normal',
    levelId: 2,
    type: 'normal',
    typeName: '普通结局',
    title: '稳步前行',
    description: '第二个月，店铺运营更加顺畅了。',
    epilogue: '经过上一个月的历练，你变得更加成熟。一切都在向好的方向发展。',
    icon: '🌟',
    conditions: {
      minProfit: 5000
    },
    rewards: {
      budget: 2000,
      reputation: 20,
      growthPoints: 100,
      unlockNextLevelBonus: true
    },
    isUnlocked: false,
    unlockedDate: null
  },
  {
    id: 'level2_ending_good',
    levelId: 2,
    type: 'good',
    typeName: '良好结局',
    title: '声名远扬',
    description: '你的店成为了城市里一道独特的文化风景。',
    epilogue: '本地杂志报道了你的店，标题是：「在数字时代，守护黑胶温度的年轻人」。更多的人走进店里，不只是买唱片，更是体验一种生活方式。',
    icon: '⭐',
    conditions: {
      minProfit: 10000,
      minSatisfaction: 85,
      minReputation: 80,
      requiredRelationshipLevels: [
        { customerId: 'oldchen', minLevel: 'friend' },
        { customerId: 'xiaoyu', minLevel: 'acquaintance' }
      ]
    },
    rewards: {
      budget: 5000,
      reputation: 60,
      growthPoints: 200,
      bonusRecordId: 'reward_level2_good',
      unlockNextLevelBonus: true
    },
    isUnlocked: false,
    unlockedDate: null
  },
  {
    id: 'level2_ending_perfect',
    levelId: 2,
    type: 'perfect',
    typeName: '完美结局',
    title: '黑胶文化灯塔',
    description: '你的店已经不仅仅是一家店了，它是整个城市黑胶文化的中心。',
    epilogue: '老陈的婚礼上播放了你找到的那张唱片，小宇带着他的社团成员来店里实践，老王每周都会来店里给年轻人上课……你的梦想，正在一点点照进现实。',
    icon: '👑',
    conditions: {
      minProfit: 15000,
      minSatisfaction: 95,
      minReputation: 120,
      requiredCompletedEventIds: ['owner_growth_crisis', 'cust_rel_old_friend', 'cust_rel_young_collector'],
      requiredRelationshipLevels: [
        { customerId: 'oldchen', minLevel: 'confidant' }
      ],
      requiredCollectionCount: 80
    },
    rewards: {
      budget: 10000,
      reputation: 150,
      growthPoints: 500,
      bonusRecordId: 'legendary_level2_perfect',
      unlockNextLevelBonus: true
    },
    isUnlocked: false,
    unlockedDate: null
  }
]

const allPlotEvents: PlotEventConfig[] = [
  ...ownerGrowthEvents,
  ...customerRelationshipEvents,
  ...specialOrderEvents
]

const getEventById = (eventId: string): PlotEventConfig | undefined => {
  return allPlotEvents.find(e => e.id === eventId)
}

const getNodeById = (event: PlotEventConfig, nodeId: string) => {
  return event.nodes.find(n => n.id === nodeId)
}

const getEventsByType = (type: string): PlotEventConfig[] => {
  return allPlotEvents.filter(e => e.type === type)
}

const getLevelEndings = (levelId: number): LevelEndingConfig[] => {
  return multiEndingConfigs.filter(e => e.levelId === levelId)
}

const getSpecialOrders = (): SpecialOrderConfig[] => {
  return specialOrders
}

const getSpecialOrderById = (orderId: string): SpecialOrderConfig | undefined => {
  return specialOrders.find(o => o.id === orderId)
}

const initialRelationships: CustomerRelationship[] = [
  {
    customerId: 'oldchen',
    customerName: '老陈',
    customerAvatar: '👴',
    level: 'stranger',
    levelProgress: 0,
    nextLevelProgress: 20,
    trustPoints: 0,
    trust: 0,
    sharedMoments: [],
    unlockedStoryIds: [],
    unlockedEvents: [],
    specialPerks: [],
    birthday: '03-15',
    favoriteGenre: 'Pop' as Genre,
    lastVisitDay: 0,
    notes: '每周三下午三点准时出现，喜欢 70 年代华语流行'
  },
  {
    customerId: 'xiaoyu',
    customerName: '小宇',
    customerAvatar: '👦',
    level: 'stranger',
    levelProgress: 0,
    nextLevelProgress: 20,
    trustPoints: 0,
    trust: 0,
    sharedMoments: [],
    unlockedStoryIds: [],
    unlockedEvents: [],
    specialPerks: [],
    birthday: '08-22',
    favoriteGenre: 'Rock' as Genre,
    lastVisitDay: 0,
    notes: '大学音乐社社长，对黑胶文化充满热情'
  },
  {
    customerId: 'laowang',
    customerName: '老王',
    customerAvatar: '🎷',
    level: 'stranger',
    levelProgress: 0,
    nextLevelProgress: 20,
    trustPoints: 0,
    trust: 0,
    sharedMoments: [],
    unlockedStoryIds: [],
    unlockedEvents: [],
    specialPerks: [],
    birthday: '11-08',
    favoriteGenre: 'Jazz' as Genre,
    lastVisitDay: 0,
    notes: '前爵士乐团萨克斯手，现在教学生爵士乐'
  }
]

export {
  allPlotEvents,
  specialOrders,
  multiEndingConfigs,
  initialRelationships,
  getEventById,
  getNodeById,
  getEventsByType,
  getLevelEndings,
  getSpecialOrders,
  getSpecialOrderById,
  getRelationshipLevelInfo,
  getNextLevelTrust
}
