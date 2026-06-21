import type { StaffSkill, StaffSkillType, StaffState } from '@/types'

export function createStaffSkill(
  type: StaffSkillType,
  name: string,
  icon: string,
  maxLevel: number,
  description: string,
  effectPerLevel: number
): StaffSkill {
  return {
    type,
    name,
    icon,
    level: 0,
    maxLevel,
    description,
    effectPerLevel,
    currentEffect: 0
  }
}

export const defaultStaffSkills: StaffSkill[] = [
  createStaffSkill(
    'service',
    '接待效率',
    '⚡',
    10,
    '提升顾客接待效率，减缓顾客耐心值消耗速度',
    0.03
  ),
  createStaffSkill(
    'recommendation',
    '推荐精准',
    '🎯',
    10,
    '提升唱片推荐的匹配准确率，增加成交概率',
    3
  ),
  createStaffSkill(
    'skip_recovery',
    '跳过损耗减免',
    '🛡️',
    10,
    '降低跳过顾客带来的满意度和声望损失',
    0.05
  ),
  createStaffSkill(
    'capacity',
    '营业容量',
    '👥',
    10,
    '提升每日可接待的顾客数量上限',
    0.05
  )
]

export const createInitialStaffState = (initialPoints: number = 3): StaffState => {
  return {
    skills: defaultStaffSkills.map(s => ({ ...s })),
    totalStaffPoints: initialPoints,
    availablePoints: initialPoints,
    serviceEfficiencyBonus: 0,
    recommendationAccuracyBonus: 0,
    skipLossReduction: 0,
    dailyCapacityBonus: 0
  }
}

export const calculateStaffBonuses = (skills: StaffSkill[]): {
  serviceEfficiencyBonus: number
  recommendationAccuracyBonus: number
  skipLossReduction: number
  dailyCapacityBonus: number
} => {
  let serviceEfficiencyBonus = 0
  let recommendationAccuracyBonus = 0
  let skipLossReduction = 0
  let dailyCapacityBonus = 0

  for (const skill of skills) {
    const effect = skill.level * skill.effectPerLevel
    switch (skill.type) {
      case 'service':
        serviceEfficiencyBonus = effect
        break
      case 'recommendation':
        recommendationAccuracyBonus = effect
        break
      case 'skip_recovery':
        skipLossReduction = effect
        break
      case 'capacity':
        dailyCapacityBonus = effect
        break
    }
  }

  return {
    serviceEfficiencyBonus,
    recommendationAccuracyBonus,
    skipLossReduction,
    dailyCapacityBonus
  }
}

export const upgradeStaffSkill = (
  state: StaffState,
  skillType: StaffSkillType
): { success: boolean; message: string; state: StaffState } => {
  const skill = state.skills.find(s => s.type === skillType)
  if (!skill) {
    return { success: false, message: '技能不存在', state }
  }

  if (skill.level >= skill.maxLevel) {
    return { success: false, message: '技能已满级', state }
  }

  if (state.availablePoints < 1) {
    return { success: false, message: '技能点不足', state }
  }

  const newSkills = state.skills.map(s => {
    if (s.type === skillType) {
      const newLevel = s.level + 1
      return {
        ...s,
        level: newLevel,
        currentEffect: newLevel * s.effectPerLevel
      }
    }
    return s
  })

  const bonuses = calculateStaffBonuses(newSkills)

  const newState: StaffState = {
    ...state,
    skills: newSkills,
    availablePoints: state.availablePoints - 1,
    ...bonuses
  }

  return {
    success: true,
    message: `${skill.name} 升级到 Lv.${skill.level + 1}！`,
    state: newState
  }
}

export const addStaffPoints = (state: StaffState, points: number): StaffState => {
  return {
    ...state,
    totalStaffPoints: state.totalStaffPoints + points,
    availablePoints: state.availablePoints + points
  }
}

export const getSkillByType = (skills: StaffSkill[], type: StaffSkillType): StaffSkill | undefined => {
  return skills.find(s => s.type === type)
}

export const getSkillDescriptionWithEffect = (skill: StaffSkill): string => {
  const effect = skill.level * skill.effectPerLevel
  switch (skill.type) {
    case 'service':
      return `${skill.description}（当前：耐心消耗减缓 ${Math.round(effect * 100)}%）`
    case 'recommendation':
      return `${skill.description}（当前：匹配度 +${effect.toFixed(0)}）`
    case 'skip_recovery':
      return `${skill.description}（当前：损耗减少 ${Math.round(effect * 100)}%）`
    case 'capacity':
      return `${skill.description}（当前：容量 +${Math.round(effect * 100)}%）`
    default:
      return skill.description
  }
}
