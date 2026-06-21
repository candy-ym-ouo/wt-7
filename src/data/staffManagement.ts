import type {
  StaffPosition, StaffPositionConfig, StaffAttributeType, StaffAttribute,
  StaffWorkShift, StaffShiftConfig, StaffTrainingType, StaffTrainingCourse,
  StaffRarity, StaffRecruitCandidate, Employee,
  StaffTrainingProgress, StaffRevenueBonus, StaffBonusSummary,
  SalaryComponent, StaffSalaryRecord, StaffSalarySummary, StaffManagementState,
  StaffSkillType
} from '@/types'
import { defaultStaffSkills, createStaffSkill } from '@/data/staff'

export const staffPositionConfigs: StaffPositionConfig[] = [
  {
    id: 'sales',
    name: '销售专员',
    icon: '💼',
    description: '负责唱片销售与顾客接待，提升销售效率和顾客满意度',
    baseSalary: 3000,
    requiredSkills: ['service', 'recommendation'],
    attributeBonus: { service: 0.1, recommendation: 0.1 },
    unlockLevel: 1,
    maxCount: 4
  },
  {
    id: 'reception',
    name: '前台接待',
    icon: '🎧',
    description: '负责客户接待和会员管理，提升顾客体验和会员转化',
    baseSalary: 2800,
    requiredSkills: ['service', 'skip_recovery'],
    attributeBonus: { service: 0.15, skipRecovery: 0.1 },
    unlockLevel: 2,
    maxCount: 2
  },
  {
    id: 'restoration',
    name: '修复技师',
    icon: '🔧',
    description: '负责唱片品相修复和维护，提升修复效率和品质',
    baseSalary: 3500,
    requiredSkills: ['capacity'],
    attributeBonus: { capacity: 0.15, recommendation: 0.1 },
    unlockLevel: 3,
    maxCount: 2
  },
  {
    id: 'purchasing',
    name: '采购专员',
    icon: '📦',
    description: '负责货源采购和供应商关系，降低采购成本',
    baseSalary: 3200,
    requiredSkills: ['recommendation', 'capacity'],
    attributeBonus: { recommendation: 0.12, service: 0.08 },
    unlockLevel: 4,
    maxCount: 2
  },
  {
    id: 'management',
    name: '店长助理',
    icon: '👔',
    description: '综合管理岗位，全面提升各项经营指标',
    baseSalary: 5000,
    requiredSkills: ['service', 'recommendation', 'skip_recovery', 'capacity'],
    attributeBonus: { service: 0.05, recommendation: 0.05, skipRecovery: 0.05, capacity: 0.05 },
    unlockLevel: 6,
    maxCount: 1
  }
]

export const getPositionConfig = (id: StaffPosition): StaffPositionConfig | undefined => {
  return staffPositionConfigs.find(p => p.id === id)
}

export const getUnlockedPositions = (currentLevel: number): StaffPositionConfig[] => {
  return staffPositionConfigs.filter(p => p.unlockLevel <= currentLevel)
}

export const staffAttributeTypes: { type: StaffAttributeType; name: string; icon: string; description: string }[] = [
  { type: 'professionalism', name: '专业度', icon: '📚', description: '影响服务专业水平和顾客信任度' },
  { type: 'communication', name: '沟通力', icon: '💬', description: '影响销售推荐和议价成功率' },
  { type: 'patience', name: '耐心值', icon: '🕊️', description: '影响处理复杂顾客时的表现' },
  { type: 'attention', name: '专注力', icon: '🔍', description: '影响修复品质和细节处理' },
  { type: 'creativity', name: '创造力', icon: '✨', description: '影响陈列搭配和营销创意' }
]

export const createAttribute = (type: StaffAttributeType, value: number = 50): StaffAttribute => {
  const info = staffAttributeTypes.find(a => a.type === type)!
  return {
    type,
    name: info.name,
    icon: info.icon,
    value,
    maxValue: 100,
    description: info.description
  }
}

export const createFullAttributes = (values: Partial<Record<StaffAttributeType, number>> = {}): StaffAttribute[] => {
  return staffAttributeTypes.map(attr => 
    createAttribute(attr.type, values[attr.type] ?? Math.floor(Math.random() * 30) + 40)
  )
}

export const staffShiftConfigs: StaffShiftConfig[] = [
  {
    id: 'morning',
    name: '早班',
    icon: '🌅',
    timeSlots: ['afternoon'],
    salaryMultiplier: 1.0,
    description: '上午10点至下午6点，负责午后场营业',
    startHour: 10,
    endHour: 18
  },
  {
    id: 'afternoon',
    name: '中班',
    icon: '☀️',
    timeSlots: ['afternoon', 'night'],
    salaryMultiplier: 1.1,
    description: '下午2点至晚上10点，覆盖两个时段',
    startHour: 14,
    endHour: 22
  },
  {
    id: 'night',
    name: '晚班',
    icon: '🌙',
    timeSlots: ['night'],
    salaryMultiplier: 1.2,
    description: '下午6点至凌晨2点，专注夜场经营',
    startHour: 18,
    endHour: 2
  },
  {
    id: 'full',
    name: '全天班',
    icon: '🔥',
    timeSlots: ['afternoon', 'night'],
    salaryMultiplier: 1.5,
    description: '上午10点至凌晨2点，高强度全日班',
    startHour: 10,
    endHour: 2
  },
  {
    id: 'weekend',
    name: '周末班',
    icon: '🎉',
    timeSlots: ['afternoon', 'night'],
    salaryMultiplier: 1.3,
    description: '仅周末上班，客流高峰时段支援',
    startHour: 10,
    endHour: 24
  }
]

export const getShiftConfig = (id: StaffWorkShift): StaffShiftConfig | undefined => {
  return staffShiftConfigs.find(s => s.id === id)
}

export const getShiftForTimeSlot = (slot: string): StaffShiftConfig[] => {
  return staffShiftConfigs.filter(s => s.timeSlots.includes(slot as any))
}

export const staffTrainingCourses: StaffTrainingCourse[] = [
  {
    id: 'onboarding',
    name: '新员工入职培训',
    icon: '🎓',
    description: '了解唱片店基本运营和服务规范',
    durationDays: 3,
    cost: 500,
    targetSkillType: 'service',
    skillBonus: 1,
    attributeBoosts: { professionalism: 10, communication: 5 },
    unlockLevel: 1,
    prerequisites: []
  },
  {
    id: 'service_etiquette',
    name: '高级服务礼仪',
    icon: '🎩',
    description: '提升高端客户服务能力和会员维护技巧',
    durationDays: 5,
    cost: 1500,
    targetSkillType: 'service',
    skillBonus: 2,
    attributeBoosts: { professionalism: 15, patience: 10, communication: 10 },
    unlockLevel: 2,
    prerequisites: ['onboarding']
  },
  {
    id: 'music_knowledge',
    name: '音乐知识进阶',
    icon: '🎵',
    description: '深入了解各类音乐风格，提升推荐精准度',
    durationDays: 7,
    cost: 2000,
    targetSkillType: 'recommendation',
    skillBonus: 2,
    attributeBoosts: { professionalism: 20, creativity: 5 },
    unlockLevel: 2,
    prerequisites: ['onboarding']
  },
  {
    id: 'sales_technique',
    name: '销售技巧大师班',
    icon: '💰',
    description: '掌握高级销售技巧和议价策略',
    durationDays: 5,
    cost: 2500,
    targetSkillType: 'recommendation',
    skillBonus: 3,
    attributeBoosts: { communication: 20, creativity: 10 },
    unlockLevel: 3,
    prerequisites: ['music_knowledge']
  },
  {
    id: 'repair_skill',
    name: '唱片修复技术',
    icon: '🔬',
    description: '学习专业唱片修复和品相维护技术',
    durationDays: 10,
    cost: 3500,
    targetSkillType: 'capacity',
    skillBonus: 2,
    attributeBoosts: { attention: 25, professionalism: 15 },
    unlockLevel: 3,
    prerequisites: ['onboarding']
  },
  {
    id: 'management',
    name: '管理能力培训',
    icon: '📊',
    description: '提升团队管理和经营分析能力',
    durationDays: 14,
    cost: 5000,
    targetSkillType: null,
    skillBonus: 0,
    attributeBoosts: { professionalism: 20, communication: 15, creativity: 15, attention: 10 },
    unlockLevel: 5,
    prerequisites: ['service_etiquette', 'sales_technique']
  }
]

export const getTrainingCourse = (id: StaffTrainingType): StaffTrainingCourse | undefined => {
  return staffTrainingCourses.find(c => c.id === id)
}

export const getAvailableCourses = (level: number, completed: StaffTrainingType[]): StaffTrainingCourse[] => {
  return staffTrainingCourses.filter(c => {
    if (c.unlockLevel > level) return false
    if (completed.includes(c.id)) return false
    return c.prerequisites.every(p => completed.includes(p))
  })
}

export const rarityColors: Record<StaffRarity, string> = {
  common: '#a0aec0',
  uncommon: '#48bb78',
  rare: '#4299e1',
  epic: '#9f7aea',
  legendary: '#f6ad55'
}

export const rarityLabels: Record<StaffRarity, string> = {
  common: '普通',
  uncommon: '优秀',
  rare: '精英',
  epic: '杰出',
  legendary: '传奇'
}

export const getRarityColor = (rarity: StaffRarity): string => rarityColors[rarity]
export const getRarityLabel = (rarity: StaffRarity): string => rarityLabels[rarity]

const candidateNames = [
  '小林', '张伟', '王芳', '刘洋', '陈思', '杨帆', '赵磊', '黄丽',
  '周杰', '吴敏', '徐峰', '孙莉', '马超', '朱琳', '胡军', '郭静',
  '何涛', '罗雪', '梁鹏', '宋佳', '郑辉', '谢婷', '韩磊', '唐敏'
]

const candidateAvatars = ['👨', '👩', '👨‍🦱', '👩‍🦰', '👨‍🦳', '👩‍🦳', '🧑', '👨‍💼', '👩‍💼', '🧔']

const interviewNotes: Record<StaffRarity, string[]> = {
  common: [
    '应届毕业生，对唱片行业充满热情',
    '有零售经验，希望转行音乐行业',
    '做事认真踏实，学习能力尚可',
    '本地求职者，通勤便利稳定'
  ],
  uncommon: [
    '有2年相关经验，熟悉各类音乐风格',
    '服务意识强，曾获优秀员工称号',
    '音乐爱好者，私藏唱片数百张',
    '沟通能力出众，擅长处理客户关系'
  ],
  rare: [
    '曾在知名唱片连锁店任职主管',
    '音乐学院毕业，专业知识扎实',
    '持有音响工程师证书，技术能力强',
    '5年高端零售经验，客户资源丰富'
  ],
  epic: [
    '业内资深人士，曾操盘多家知名门店',
    '音乐制作人背景，拥有丰富行业资源',
    '海归MBA，擅长数据分析和运营管理',
    '知名主播/DJ，自带流量和粉丝群'
  ],
  legendary: [
    '前唱片公司高管，人脉遍布整个产业链',
    '传奇收藏家，估价能力堪比专业鉴定师',
    '音乐界知名人士，一句话能带火一家店',
    '商业奇才，曾将濒临破产的门店做到地区第一'
  ]
}

export const generateRecruitCandidate = (
  position: StaffPosition,
  level: number,
  forceRarity?: StaffRarity
): StaffRecruitCandidate => {
  const rarityRoll = Math.random()
  let rarity: StaffRarity
  if (forceRarity) {
    rarity = forceRarity
  } else if (rarityRoll < 0.45) rarity = 'common'
  else if (rarityRoll < 0.75) rarity = 'uncommon'
  else if (rarityRoll < 0.90) rarity = 'rare'
  else if (rarityRoll < 0.98) rarity = 'epic'
  else rarity = 'legendary'

  const rarityMultiplier = { common: 1, uncommon: 1.2, rare: 1.5, epic: 1.8, legendary: 2.5 }[rarity]
  const posConfig = getPositionConfig(position)!
  
  const baseAttrRange = {
    common: [40, 60],
    uncommon: [50, 70],
    rare: [60, 80],
    epic: [70, 90],
    legendary: [80, 100]
  }[rarity]

  const attributes = createFullAttributes()
  attributes.forEach(attr => {
    attr.value = Math.floor(Math.random() * (baseAttrRange[1] - baseAttrRange[0]) + baseAttrRange[0])
  })

  const requiredSkillBonuses: Partial<Record<StaffSkillType, number>> = {}
  posConfig.requiredSkills.forEach(skill => {
    requiredSkillBonuses[skill] = Math.floor(Math.random() * 3 + 1) * (rarity === 'legendary' ? 2 : 1)
  })

  const name = candidateNames[Math.floor(Math.random() * candidateNames.length)]
  const avatar = candidateAvatars[Math.floor(Math.random() * candidateAvatars.length)]
  const notes = interviewNotes[rarity]
  const note = notes[Math.floor(Math.random() * notes.length)]

  return {
    id: `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    avatar,
    position,
    rarity,
    baseAttributes: attributes,
    potential: Math.floor(Math.random() * 40 + 60) * rarityMultiplier,
    interviewNote: note,
    expectedSalary: Math.floor(posConfig.baseSalary * rarityMultiplier * (0.9 + Math.random() * 0.2)),
    signingBonus: Math.floor(posConfig.baseSalary * 0.3 * rarityMultiplier),
    skillBonuses: requiredSkillBonuses,
    isLocked: posConfig.unlockLevel > level,
    unlockReason: posConfig.unlockLevel > level ? `需要等级 ${posConfig.unlockLevel}` : undefined
  }
}

export const generateRecruitPool = (level: number, count: number = 6): StaffRecruitCandidate[] => {
  const pool: StaffRecruitCandidate[] = []
  const unlockedPositions = getUnlockedPositions(level).map(p => p.id)
  
  for (let i = 0; i < count; i++) {
    const pos = unlockedPositions[Math.floor(Math.random() * unlockedPositions.length)]
    pool.push(generateRecruitCandidate(pos, level))
  }
  
  return pool
}

export const createEmployeeFromCandidate = (
  candidate: StaffRecruitCandidate,
  currentDay: number
): Employee => {
  const skills = defaultStaffSkills.map(s => {
    const skill = createStaffSkill(s.type, s.name, s.icon, s.maxLevel, s.description, s.effectPerLevel)
    const bonus = candidate.skillBonuses[s.type] || 0
    skill.level = bonus
    skill.currentEffect = bonus * skill.effectPerLevel
    return skill
  })

  return {
    id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: candidate.name,
    avatar: candidate.avatar,
    position: candidate.position,
    rarity: candidate.rarity,
    hiredDay: currentDay,
    status: 'working',
    attributes: candidate.baseAttributes.map(a => ({ ...a })),
    level: 1,
    experience: 0,
    nextLevelExp: 100,
    skills,
    currentTraining: null,
    completedTrainings: [],
    schedules: [],
    performance: {
      totalSales: 0,
      customersServed: 0,
      avgSatisfaction: 0,
      daysWorked: 0
    },
    satisfaction: 80,
    morale: 85,
    baseSalary: candidate.expectedSalary,
    lastRaiseDay: null,
    notes: candidate.interviewNote
  }
}

export const calculateEmployeeBonusSummary = (
  employees: Employee[],
  currentTimeSlot: string
): StaffBonusSummary => {
  const bonuses: StaffRevenueBonus[] = []
  let totalRevenueMod = 0
  let totalProfitMod = 0
  let totalSatBonus = 0
  let totalRepBonus = 0
  let totalCustMod = 0
  let totalBuyChance = 0

  const workingEmployees = employees.filter(e => {
    if (e.status !== 'working') return false
    if (e.schedules.length === 0) return true
    return e.schedules.some(s => {
      if (!s.isActive) return false
      const shiftConfig = getShiftConfig(s.shiftId)
      return shiftConfig?.timeSlots.includes(currentTimeSlot as any)
    })
  })

  workingEmployees.forEach(emp => {
    const posConfig = getPositionConfig(emp.position)
    if (!posConfig) return

    const avgAttr = emp.attributes.reduce((sum, a) => sum + a.value, 0) / emp.attributes.length
    const levelBonus = (emp.level - 1) * 0.005
    const rarityBonus = { common: 0, uncommon: 0.02, rare: 0.05, epic: 0.08, legendary: 0.15 }[emp.rarity]

    const attrEfficiency = avgAttr / 100
    const totalEfficiency = attrEfficiency + levelBonus + rarityBonus

    const serviceSkill = emp.skills.find(s => s.type === 'service')
    const recSkill = emp.skills.find(s => s.type === 'recommendation')
    const capacitySkill = emp.skills.find(s => s.type === 'capacity')

    if (serviceSkill) {
      const bonus = serviceSkill.currentEffect * totalEfficiency
      totalSatBonus += bonus * 2
      totalCustMod += bonus * 0.5
      bonuses.push({
        source: `${emp.name}(${posConfig.name})`,
        description: `服务效率加成`,
        bonusType: 'satisfaction',
        value: bonus * 2,
        percentage: bonus * 0.5 * 100,
        sourceId: emp.id
      })
    }

    if (recSkill) {
      const bonus = recSkill.currentEffect * totalEfficiency
      totalBuyChance += bonus * 0.01
      totalRevenueMod += bonus * 0.002
      bonuses.push({
        source: `${emp.name}(${posConfig.name})`,
        description: `推荐精准加成`,
        bonusType: 'buy_chance',
        value: bonus * 0.01,
        percentage: bonus * 0.2,
        sourceId: emp.id
      })
    }

    if (capacitySkill) {
      const bonus = capacitySkill.currentEffect * totalEfficiency
      totalCustMod += bonus
      totalProfitMod += bonus * 0.005
      bonuses.push({
        source: `${emp.name}(${posConfig.name})`,
        description: `营业容量加成`,
        bonusType: 'customer_count',
        value: bonus,
        percentage: bonus * 0.5,
        sourceId: emp.id
      })
    }

    if (emp.rarity === 'epic' || emp.rarity === 'legendary') {
      const repBonus = rarityBonus * 0.5
      totalRepBonus += repBonus
      bonuses.push({
        source: `${emp.name}(${getRarityLabel(emp.rarity)})`,
        description: `稀有品质声望加成`,
        bonusType: 'reputation',
        value: repBonus,
        percentage: repBonus * 10,
        sourceId: emp.id
      })
    }

    if (emp.position === 'management') {
      const mgmtBonus = totalEfficiency * 0.03
      totalRevenueMod += mgmtBonus
      totalProfitMod += mgmtBonus
      totalSatBonus += mgmtBonus * 10
    }
  })

  return {
    totalRevenueModifier: 1 + totalRevenueMod,
    totalProfitModifier: 1 + totalProfitMod,
    totalSatisfactionBonus: totalSatBonus,
    totalReputationBonus: totalRepBonus,
    totalCustomerCountModifier: 1 + totalCustMod,
    totalBuyChanceBonus: totalBuyChance,
    activeBonuses: bonuses
  }
}

export const addExperienceToEmployee = (
  employee: Employee,
  exp: number
): { employee: Employee; leveledUp: boolean; newLevel: number } => {
  let newExp = employee.experience + exp
  let newLevel = employee.level
  let nextLevelExp = employee.nextLevelExp
  let leveledUp = false

  while (newExp >= nextLevelExp) {
    newExp -= nextLevelExp
    newLevel++
    nextLevelExp = Math.floor(nextLevelExp * 1.5)
    leveledUp = true
  }

  const updatedAttrs = employee.attributes.map(attr => {
    if (leveledUp) {
      return { ...attr, value: Math.min(attr.maxValue, attr.value + 2) }
    }
    return attr
  })

  return {
    employee: {
      ...employee,
      experience: newExp,
      level: newLevel,
      nextLevelExp,
      attributes: updatedAttrs
    },
    leveledUp,
    newLevel
  }
}

export const startEmployeeTraining = (
  employee: Employee,
  course: StaffTrainingCourse,
  currentDay: number
): { success: boolean; message: string; employee: Employee } => {
  if (employee.currentTraining?.isActive) {
    return { success: false, message: '该员工正在培训中', employee }
  }

  if (employee.completedTrainings.includes(course.id)) {
    return { success: false, message: '该培训已完成', employee }
  }

  const hasPrereqs = course.prerequisites.every(p => employee.completedTrainings.includes(p))
  if (!hasPrereqs) {
    return { success: false, message: '前置培训未完成', employee }
  }

  const progress: StaffTrainingProgress = {
    courseId: course.id,
    progressDays: 0,
    totalDays: course.durationDays,
    isActive: true,
    startDay: currentDay
  }

  return {
    success: true,
    message: `${employee.name} 已开始 ${course.name}`,
    employee: { ...employee, currentTraining: progress, status: 'training' }
  }
}

export const progressTrainingDay = (employee: Employee): { 
  employee: Employee
  completed: boolean
  course?: StaffTrainingCourse
} => {
  if (!employee.currentTraining?.isActive) {
    return { employee, completed: false }
  }

  const progress = { ...employee.currentTraining }
  progress.progressDays++

  if (progress.progressDays >= progress.totalDays) {
    const course = getTrainingCourse(progress.courseId)
    if (!course) return { employee, completed: false }

    let newSkills = employee.skills.map(s => ({ ...s }))
    if (course.targetSkillType) {
      newSkills = newSkills.map(s => {
        if (s.type === course.targetSkillType && s.level < s.maxLevel) {
          const newLevel = Math.min(s.maxLevel, s.level + course.skillBonus)
          return {
            ...s,
            level: newLevel,
            currentEffect: newLevel * s.effectPerLevel
          }
        }
        return s
      })
    }

    const newAttrs = employee.attributes.map(attr => {
      const boost = course.attributeBoosts[attr.type] || 0
      return {
        ...attr,
        value: Math.min(attr.maxValue, attr.value + boost)
      }
    })

    return {
      employee: {
        ...employee,
        currentTraining: null,
        completedTrainings: [...employee.completedTrainings, course.id],
        skills: newSkills,
        attributes: newAttrs,
        status: 'working'
      },
      completed: true,
      course
    }
  }

  return {
    employee: { ...employee, currentTraining: progress },
    completed: false
  }
}

export const setEmployeeSchedule = (
  employee: Employee,
  dayOfWeek: number,
  shiftId: StaffWorkShift | null
): Employee => {
  let schedules = employee.schedules.filter(s => s.dayOfWeek !== dayOfWeek)
  
  if (shiftId) {
    schedules.push({
      staffId: employee.id,
      dayOfWeek,
      shiftId,
      isActive: true
    })
  }

  return { ...employee, schedules }
}

export const calculateEmployeeSalary = (
  employee: Employee,
  periodStart: number,
  periodEnd: number,
  settlementDay: number
): StaffSalaryRecord => {
  const daysInPeriod = periodEnd - periodStart + 1
  const components: SalaryComponent[] = []

  components.push({
    type: 'base',
    label: '基本工资',
    amount: employee.baseSalary,
    description: `岗位：${getPositionConfig(employee.position)?.name || '未知'}`
  })

  let overtimePay = 0
  employee.schedules.forEach(s => {
    if (s.isActive) {
      const shiftCfg = getShiftConfig(s.shiftId)
      if (shiftCfg && shiftCfg.salaryMultiplier > 1) {
        overtimePay += Math.floor(employee.baseSalary * (shiftCfg.salaryMultiplier - 1) / daysInPeriod * 2)
      }
    }
  })
  if (overtimePay > 0) {
    components.push({
      type: 'overtime',
      label: '加班补贴',
      amount: overtimePay,
      description: '高倍率班次额外补贴'
    })
  }

  const served = employee.performance.customersServed
  const avgSat = employee.performance.avgSatisfaction
  const salesContrib = Math.min(30, employee.performance.totalSales / 5000)
  const serviceBonus = served > 0 ? (avgSat - 50) * 0.3 : 0
  const levelBonus = employee.level * 2
  const perfScore = Math.max(0, 30 + salesContrib + serviceBonus + levelBonus)
  const performancePay = Math.floor(employee.baseSalary * 0.2 * (perfScore / 80))
  if (performancePay > 0) {
    components.push({
      type: 'performance',
      label: '绩效奖金',
      amount: performancePay,
      description: `绩效评分：${perfScore.toFixed(1)}（服务${served}人·满意度${avgSat.toFixed(0)}）`
    })
  }

  if (employee.rarity === 'rare') {
    components.push({ type: 'bonus', label: '人才津贴', amount: 300, description: '精英员工津贴' })
  } else if (employee.rarity === 'epic') {
    components.push({ type: 'bonus', label: '人才津贴', amount: 800, description: '杰出员工津贴' })
  } else if (employee.rarity === 'legendary') {
    components.push({ type: 'bonus', label: '人才津贴', amount: 2000, description: '传奇员工津贴' })
  }

  if (employee.level >= 5) {
    components.push({
      type: 'bonus',
      label: '工龄奖励',
      amount: employee.level * 100,
      description: `等级 Lv.${employee.level} 奖励`
    })
  }

  const totalAmount = components.reduce((sum, c) => sum + c.amount, 0)

  return {
    id: `salary_${employee.id}_${settlementDay}`,
    employeeId: employee.id,
    employeeName: employee.name,
    periodStartDay: periodStart,
    periodEndDay: periodEnd,
    settlementDay,
    components,
    totalAmount,
    daysWorked: employee.performance.daysWorked,
    performanceScore: perfScore,
    notes: ''
  }
}

export const calculatePayrollSummary = (
  employees: Employee[],
  periodStart: number,
  periodEnd: number,
  settlementDay: number
): StaffSalarySummary => {
  const records = employees
    .filter(e => e.status !== 'fired')
    .map(e => calculateEmployeeSalary(e, periodStart, periodEnd, settlementDay))

  const summary: StaffSalarySummary = {
    periodStartDay: periodStart,
    periodEndDay: periodEnd,
    totalBaseSalary: records.reduce((s, r) => s + (r.components.find(c => c.type === 'base')?.amount || 0), 0),
    totalOvertimePay: records.reduce((s, r) => s + (r.components.find(c => c.type === 'overtime')?.amount || 0), 0),
    totalPerformancePay: records.reduce((s, r) => s + (r.components.find(c => c.type === 'performance')?.amount || 0), 0),
    totalBonus: records.reduce((s, r) => s + r.components.filter(c => c.type === 'bonus').reduce((a, c) => a + c.amount, 0), 0),
    totalDeduction: records.reduce((s, r) => s + r.components.filter(c => c.type === 'deduction').reduce((a, c) => a + c.amount, 0), 0),
    totalPayout: records.reduce((s, r) => s + r.totalAmount, 0),
    records
  }

  return summary
}

export const createInitialStaffManagementState = (): StaffManagementState => {
  return {
    employees: [],
    recruitPool: generateRecruitPool(1, 4),
    lastRecruitRefreshDay: 0,
    recruitRefreshCooldown: 3,
    availableCourses: staffTrainingCourses,
    activeShifts: staffShiftConfigs,
    positionConfigs: staffPositionConfigs,
    bonusSummary: {
      totalRevenueModifier: 1,
      totalProfitModifier: 1,
      totalSatisfactionBonus: 0,
      totalReputationBonus: 0,
      totalCustomerCountModifier: 1,
      totalBuyChanceBonus: 0,
      activeBonuses: []
    },
    salaryHistory: [],
    currentSalarySummary: null,
    payrollDay: 7,
    maxEmployees: 3,
    totalHiringCost: 0,
    totalTrainingCost: 0,
    notifications: []
  }
}
