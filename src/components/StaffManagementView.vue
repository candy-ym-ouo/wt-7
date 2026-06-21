<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref, computed } from 'vue'
import type { 
  StaffRecruitCandidate, Employee, StaffWorkShift, StaffTrainingType,
  StaffSkillType, StaffAttributeType
} from '@/types'

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()
const activeTab = ref<'recruit' | 'employees' | 'training' | 'schedule' | 'salary' | 'bonus'>('recruit')
const selectedEmployee = ref<Employee | null>(null)
const message = ref('')
const messageType = ref<'success' | 'error' | 'info'>('success')
const showMessage = ref(false)
const raiseAmount = ref(500)
const showRaiseModal = ref(false)
const showFireModal = ref(false)
const showHireModal = ref(false)
const selectedCandidate = ref<StaffRecruitCandidate | null>(null)

const daysOfWeek = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
  message.value = msg
  messageType.value = type
  showMessage.value = true
  setTimeout(() => { showMessage.value = false }, 2500)
}

const recruitPool = computed(() => gameStore.staffManagement.recruitPool)
const employees = computed(() => gameStore.staffManagement.employees.filter(e => e.status !== 'fired'))
const salarySummary = computed(() => gameStore.staffManagement.currentSalarySummary)
const bonusSummary = computed(() => gameStore.staffBonusSummary)
const unreadNotifications = computed(() => gameStore.staffManagement.notifications.filter(n => !n.read).length)

const activeEmployeesCount = computed(() => employees.value.filter(e => e.status === 'working').length)
const trainingEmployeesCount = computed(() => employees.value.filter(e => e.status === 'training').length)
const maxEmployees = computed(() => gameStore.staffManagement.maxEmployees)

const handleRefreshPool = () => {
  const result = gameStore.refreshRecruitPool()
  showNotification(result.message, result.success ? 'success' : 'error')
}

const openHireModal = (candidate: StaffRecruitCandidate) => {
  if (candidate.isLocked) {
    showNotification(candidate.unlockReason || '该岗位未解锁', 'error')
    return
  }
  selectedCandidate.value = candidate
  showHireModal.value = true
}

const handleHire = () => {
  if (!selectedCandidate.value) return
  const result = gameStore.hireEmployee(selectedCandidate.value.id)
  showNotification(result.message, result.success ? 'success' : 'error')
  if (result.success) {
    showHireModal.value = false
    selectedCandidate.value = null
  }
}

const handleFire = () => {
  if (!selectedEmployee.value) return
  const result = gameStore.fireEmployee(selectedEmployee.value.id)
  showNotification(result.message, result.success ? 'success' : 'error')
  if (result.success) {
    showFireModal.value = false
    selectedEmployee.value = null
  }
}

const openRaiseModal = (emp: Employee) => {
  selectedEmployee.value = emp
  raiseAmount.value = Math.max(100, Math.floor(emp.baseSalary * 0.1))
  showRaiseModal.value = true
}

const handleRaise = () => {
  if (!selectedEmployee.value) return
  const result = gameStore.raiseEmployeeSalary(selectedEmployee.value.id, raiseAmount.value)
  showNotification(result.message, result.success ? 'success' : 'error')
  if (result.success) {
    showRaiseModal.value = false
  }
}

const handleStartTraining = (empId: string, courseId: StaffTrainingType) => {
  const result = gameStore.startTraining(empId, courseId)
  showNotification(result.message, result.success ? 'success' : 'error')
  if (result.success) {
    const emp = employees.value.find(e => e.id === empId)
    if (emp) {
      selectedEmployee.value = { ...emp }
    }
  }
}

const handleSetSchedule = (empId: string, day: number, shift: StaffWorkShift | null) => {
  const result = gameStore.setEmployeeShiftSchedule(empId, day, shift)
  showNotification(result.message, result.success ? 'success' : 'error')
}

const getPositionInfo = (posId: string) => gameStore.getPositionConfig(posId as any)
const getShiftInfo = (shiftId: string) => gameStore.getShiftConfig(shiftId as any)
const getEmployeeCourses = (empId: string) => gameStore.getTrainingCoursesForEmployee(empId)

const getExpProgress = (emp: Employee) => {
  return (emp.experience / emp.nextLevelExp) * 100
}

const getScheduleForDay = (emp: Employee, day: number) => {
  return emp.schedules.find(s => s.dayOfWeek === day && s.isActive)
}

const formatSalary = (n: number) => `¥${n.toLocaleString()}`

const skillLabelMap: Record<StaffSkillType, string> = {
  service: '服务',
  recommendation: '推荐',
  skip_recovery: '抗压',
  capacity: '容量'
}
const attributeLabelMap: Record<StaffAttributeType, string> = {
  professionalism: '专业',
  communication: '沟通',
  patience: '耐心',
  attention: '专注',
  creativity: '创造'
}
const getSkillLabel = (type: string) => skillLabelMap[type as StaffSkillType] || type
const getAttributeLabel = (type: string) => attributeLabelMap[type as StaffAttributeType] || type
const getStaffRarityColor = (rarity: string): string => gameStore.getStaffRarityColor(rarity as any)
const getStaffRarityLabel = (rarity: string): string => gameStore.getRarityLabel(rarity as any)

const markNotifsRead = () => gameStore.markStaffNotificationsRead()

const tabs = [
  { id: 'recruit', name: '招聘', icon: '📋' },
  { id: 'employees', name: '员工', icon: '👥' },
  { id: 'training', name: '培训', icon: '🎓' },
  { id: 'schedule', name: '排班', icon: '📅' },
  { id: 'salary', name: '薪资', icon: '💰' },
  { id: 'bonus', name: '加成', icon: '✨' }
]
</script>

<template>
  <div class="staff-mgmt-overlay" @click.self="emit('close')">
    <div class="staff-mgmt">
      <div class="sm-header">
        <h2>🏪 店员管理中心</h2>
        <div class="sm-header-actions">
          <span class="sm-budget">💵 {{ formatSalary(gameStore.budget) }}</span>
          <button class="close-btn" @click="emit('close')">✕</button>
        </div>
      </div>

      <div class="sm-stats-bar">
        <div class="sm-stat">
          <span class="sm-stat-icon">👔</span>
          <div>
            <span class="sm-stat-value">{{ activeEmployeesCount }}/{{ maxEmployees }}</span>
            <span class="sm-stat-label">在职员工</span>
          </div>
        </div>
        <div class="sm-stat">
          <span class="sm-stat-icon">📚</span>
          <div>
            <span class="sm-stat-value">{{ trainingEmployeesCount }}</span>
            <span class="sm-stat-label">培训中</span>
          </div>
        </div>
        <div class="sm-stat">
          <span class="sm-stat-icon">💸</span>
          <div>
            <span class="sm-stat-value">{{ formatSalary(gameStore.totalMonthlySalary) }}</span>
            <span class="sm-stat-label">月度工资</span>
          </div>
        </div>
        <div v-if="unreadNotifications > 0" class="sm-stat sm-notif" @click="markNotifsRead">
          <span class="sm-stat-icon">🔔</span>
          <div>
            <span class="sm-stat-value">{{ unreadNotifications }}</span>
            <span class="sm-stat-label">新通知</span>
          </div>
        </div>
      </div>

      <div class="sm-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          class="sm-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id as any"
        >
          <span class="sm-tab-icon">{{ tab.icon }}</span>
          <span class="sm-tab-name">{{ tab.name }}</span>
        </button>
      </div>

      <div v-if="showMessage" class="sm-message" :class="messageType">
        {{ message }}
      </div>

      <div class="sm-content">
        <template v-if="activeTab === 'recruit'">
          <div class="sm-section-header">
            <h3>📋 招聘候选人</h3>
            <button class="btn-secondary sm-refresh-btn" @click="handleRefreshPool">
              🔄 刷新（¥200）
            </button>
          </div>
          <div v-if="recruitPool.length === 0" class="sm-empty">
            <p>暂无候选人，请刷新候选人池</p>
          </div>
          <div class="sm-candidate-grid">
            <div 
              v-for="candidate in recruitPool" 
              :key="candidate.id"
              class="sm-candidate-card"
              :class="{ locked: candidate.isLocked }"
              :style="{ borderColor: getStaffRarityColor(candidate.rarity) + '60' }"
            >
              <div class="sm-candidate-header">
                <div class="sm-candidate-avatar">{{ candidate.avatar }}</div>
                <div class="sm-candidate-info">
                  <div class="sm-candidate-name">
                    {{ candidate.name }}
                    <span 
                      class="sm-rarity-badge" 
                      :style="{ background: getStaffRarityColor(candidate.rarity) + '30', color: getStaffRarityColor(candidate.rarity) }"
                    >
                      {{ getStaffRarityLabel(candidate.rarity) }}
                    </span>
                  </div>
                  <div class="sm-candidate-position">
                    <span v-if="getPositionInfo(candidate.position)">
                      {{ getPositionInfo(candidate.position)?.icon }} {{ getPositionInfo(candidate.position)?.name }}
                    </span>
                  </div>
                </div>
              </div>
              <p class="sm-candidate-note">「{{ candidate.interviewNote }}」</p>
              <div class="sm-attr-mini">
                <div 
                  v-for="attr in candidate.baseAttributes" 
                  :key="attr.type" 
                  class="sm-attr-mini-item"
                  :title="attr.description"
                >
                  <span class="sm-attr-icon">{{ attr.icon }}</span>
                  <div class="sm-attr-bar-sm">
                    <div 
                      class="sm-attr-fill-sm" 
                      :style="{ width: (attr.value / attr.maxValue * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="sm-candidate-skills" v-if="Object.keys(candidate.skillBonuses).length > 0">
                <span 
                  v-for="(val, key) in candidate.skillBonuses" 
                  :key="key"
                  class="sm-skill-tag"
                >
                  +{{ val }} {{ getSkillLabel(key as string) }}
                </span>
              </div>
              <div class="sm-candidate-cost">
                <div class="sm-cost-item">
                  <span class="sm-cost-label">签约奖金</span>
                  <span class="sm-cost-value">{{ formatSalary(candidate.signingBonus) }}</span>
                </div>
                <div class="sm-cost-item">
                  <span class="sm-cost-label">月薪</span>
                  <span class="sm-cost-value">{{ formatSalary(candidate.expectedSalary) }}</span>
                </div>
              </div>
              <button 
                class="btn-primary sm-hire-btn"
                :disabled="candidate.isLocked"
                @click="openHireModal(candidate)"
              >
                {{ candidate.isLocked ? (candidate.unlockReason || '未解锁') : '📝 聘用' }}
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'employees'">
          <div class="sm-section-header">
            <h3>👥 员工列表</h3>
          </div>
          <div v-if="employees.length === 0" class="sm-empty">
            <p>暂无员工，请先前往招聘页面聘用员工</p>
          </div>
          <div class="sm-employee-list">
            <div 
              v-for="emp in employees" 
              :key="emp.id"
              class="sm-employee-card"
              :style="{ borderColor: getStaffRarityColor(emp.rarity) + '50' }"
            >
              <div class="sm-emp-header">
                <div class="sm-emp-avatar" :style="{ boxShadow: `0 0 16px ${getStaffRarityColor(emp.rarity)}40` }">
                  {{ emp.avatar }}
                </div>
                <div class="sm-emp-main">
                  <div class="sm-emp-name-row">
                    <h4 class="sm-emp-name">
                      {{ emp.name }}
                      <span 
                        class="sm-rarity-badge"
                        :style="{ background: getStaffRarityColor(emp.rarity) + '30', color: getStaffRarityColor(emp.rarity) }"
                      >
                        {{ getStaffRarityLabel(emp.rarity) }}
                      </span>
                      <span class="sm-level-badge">Lv.{{ emp.level }}</span>
                      <span 
                        class="sm-status-badge" 
                        :class="emp.status"
                      >
                        {{ emp.status === 'working' ? '在岗' : emp.status === 'training' ? '培训中' : '休息' }}
                      </span>
                    </h4>
                    <p class="sm-emp-pos">
                      {{ getPositionInfo(emp.position)?.icon }} {{ getPositionInfo(emp.position)?.name }}
                    </p>
                  </div>
                  <div class="sm-emp-exp-bar">
                    <div class="sm-emp-exp-fill" :style="{ width: getExpProgress(emp) + '%' }"></div>
                    <span class="sm-emp-exp-text">{{ emp.experience }}/{{ emp.nextLevelExp }} EXP</span>
                  </div>
                </div>
              </div>
              <div class="sm-emp-stats-row">
                <div class="sm-emp-stat">
                  <span class="sm-emp-stat-label">📈 总业绩</span>
                  <span class="sm-emp-stat-value">{{ formatSalary(emp.performance.totalSales) }}</span>
                </div>
                <div class="sm-emp-stat">
                  <span class="sm-emp-stat-label">🎯 服务</span>
                  <span class="sm-emp-stat-value">{{ emp.performance.customersServed }}人</span>
                </div>
                <div class="sm-emp-stat">
                  <span class="sm-emp-stat-label">😊 满意度</span>
                  <span class="sm-emp-stat-value">{{ emp.performance.avgSatisfaction.toFixed(0) }}%</span>
                </div>
                <div class="sm-emp-stat">
                  <span class="sm-emp-stat-label">💵 月薪</span>
                  <span class="sm-emp-stat-value">{{ formatSalary(emp.baseSalary) }}</span>
                </div>
              </div>
              <div class="sm-emp-attrs">
                <div v-for="attr in emp.attributes" :key="attr.type" class="sm-emp-attr-item">
                  <div class="sm-emp-attr-header">
                    <span class="sm-emp-attr-icon">{{ attr.icon }}</span>
                    <span class="sm-emp-attr-name">{{ attr.name }}</span>
                    <span class="sm-emp-attr-value">{{ attr.value }}</span>
                  </div>
                  <div class="sm-emp-attr-bar">
                    <div class="sm-emp-attr-fill" :style="{ width: (attr.value / attr.maxValue * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
              <div v-if="emp.currentTraining?.isActive" class="sm-emp-training">
                <span class="sm-training-icon">🎓</span>
                <span>培训中：{{ gameStore.getTrainingCourse(emp.currentTraining.courseId)?.name }}</span>
                <span class="sm-training-progress">{{ emp.currentTraining.progressDays }}/{{ emp.currentTraining.totalDays }}天</span>
              </div>
              <div class="sm-emp-actions">
                <button class="btn-secondary sm-action-btn" @click="selectedEmployee = emp; activeTab = 'training'">🎓 培训</button>
                <button class="btn-secondary sm-action-btn" @click="selectedEmployee = emp; activeTab = 'schedule'">📅 排班</button>
                <button class="btn-secondary sm-action-btn raise" @click="openRaiseModal(emp)">💵 加薪</button>
                <button class="btn-secondary sm-action-btn fire" @click="selectedEmployee = emp; showFireModal = true">🚪 解聘</button>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'training'">
          <div class="sm-section-header"><h3>🎓 员工培训</h3></div>
          <div v-if="employees.length === 0" class="sm-empty"><p>暂无员工，请先聘用员工</p></div>
          <div v-else class="sm-training-container">
            <div class="sm-emp-selector">
              <h4>选择员工</h4>
              <div class="sm-emp-select-list">
                <button 
                  v-for="emp in employees" 
                  :key="emp.id"
                  class="sm-emp-select-item"
                  :class="{ active: selectedEmployee?.id === emp.id }"
                  @click="selectedEmployee = emp"
                >
                  <span>{{ emp.avatar }}</span>
                  <span>{{ emp.name }}</span>
                  <span class="sm-emp-select-level">Lv.{{ emp.level }}</span>
                </button>
              </div>
            </div>
            <div v-if="selectedEmployee" class="sm-training-detail">
              <div class="sm-training-emp-info">
                <h4>{{ selectedEmployee.avatar }} {{ selectedEmployee.name }}</h4>
                <div class="sm-completed-trainings">
                  <span class="sm-training-label">已完成：</span>
                  <span v-if="selectedEmployee.completedTrainings.length === 0" class="sm-no-training">暂无</span>
                  <span 
                    v-for="t in selectedEmployee.completedTrainings" 
                    :key="t"
                    class="sm-completed-tag"
                  >✓ {{ gameStore.getTrainingCourse(t)?.name }}</span>
                </div>
                <div v-if="selectedEmployee.currentTraining?.isActive" class="sm-active-training">
                  <span class="sm-active-training-icon">⏳</span>
                  <div>
                    <p class="sm-active-training-name">{{ gameStore.getTrainingCourse(selectedEmployee.currentTraining.courseId)?.name }}</p>
                    <p class="sm-active-training-progress">{{ selectedEmployee.currentTraining.progressDays }}/{{ selectedEmployee.currentTraining.totalDays }}天</p>
                  </div>
                </div>
              </div>
              <h4 class="sm-course-title">📚 可选课程</h4>
              <div v-if="getEmployeeCourses(selectedEmployee.id).length === 0" class="sm-empty sm-empty-sm">
                <p>暂无可选课程</p>
              </div>
              <div class="sm-course-list">
                <div 
                  v-for="course in getEmployeeCourses(selectedEmployee.id)" 
                  :key="course.id"
                  class="sm-course-card"
                >
                  <div class="sm-course-header">
                    <span class="sm-course-icon">{{ course.icon }}</span>
                    <div class="sm-course-info">
                      <h5 class="sm-course-name">{{ course.name }}</h5>
                      <p class="sm-course-desc">{{ course.description }}</p>
                    </div>
                  </div>
                  <div class="sm-course-meta">
                    <span>⏱️ {{ course.durationDays }}天</span>
                    <span>💰 {{ formatSalary(course.cost) }}</span>
                    <span v-if="course.targetSkillType">🎯 技能+{{ course.skillBonus }}</span>
                  </div>
                  <div v-if="Object.keys(course.attributeBoosts).length > 0" class="sm-course-boosts">
                    <span 
                      v-for="(val, key) in course.attributeBoosts" 
                      :key="key"
                      class="sm-boost-tag"
                    >
                      {{ getAttributeLabel(key as string) }} +{{ val }}
                    </span>
                  </div>
                  <button 
                    class="btn-primary sm-course-btn"
                    :disabled="gameStore.budget < course.cost"
                    @click="handleStartTraining(selectedEmployee!.id, course.id)"
                  >{{ gameStore.budget < course.cost ? '资金不足' : '开始培训' }}</button>
                </div>
              </div>
            </div>
            <div v-else class="sm-empty sm-empty-sm"><p>请先选择一名员工</p></div>
          </div>
        </template>

        <template v-else-if="activeTab === 'schedule'">
          <div class="sm-section-header"><h3>📅 员工排班</h3></div>
          <div v-if="employees.length === 0" class="sm-empty"><p>暂无员工</p></div>
          <div v-else class="sm-schedule-container">
            <div class="sm-schedule-matrix">
              <div class="sm-schedule-header-row">
                <div class="sm-schedule-corner">员工</div>
                <div v-for="(day, idx) in daysOfWeek" :key="idx" class="sm-schedule-day">{{ day }}</div>
              </div>
              <div v-for="emp in employees" :key="emp.id" class="sm-schedule-row">
                <div class="sm-schedule-emp-name">
                  <span>{{ emp.avatar }}</span>
                  <span>{{ emp.name }}</span>
                </div>
                <div v-for="(_day, idx) in daysOfWeek" :key="idx" class="sm-schedule-cell">
                  <template v-if="getScheduleForDay(emp, idx)">
                    <div class="sm-shift-chip">
                      <span>{{ getShiftInfo(getScheduleForDay(emp, idx)!.shiftId)?.icon }}</span>
                      <span class="sm-shift-name">{{ getShiftInfo(getScheduleForDay(emp, idx)!.shiftId)?.name }}</span>
                      <button class="sm-remove-shift" @click="handleSetSchedule(emp.id, idx, null)">✕</button>
                    </div>
                  </template>
                  <template v-else>
                    <select 
                      class="sm-shift-select"
                      @change="(e) => handleSetSchedule(emp.id, idx, (e.target as HTMLSelectElement).value as StaffWorkShift || null)"
                    >
                      <option value="">休息</option>
                      <option 
                        v-for="shift in gameStore.staffManagement.activeShifts" 
                        :key="shift.id"
                        :value="shift.id"
                      >{{ shift.icon }} {{ shift.name }} (×{{ shift.salaryMultiplier }})</option>
                    </select>
                  </template>
                </div>
              </div>
            </div>
            <div class="sm-shift-legend">
              <h4>💡 班次说明</h4>
              <div class="sm-shift-legend-list">
                <div v-for="shift in gameStore.staffManagement.activeShifts" :key="shift.id" class="sm-shift-legend-item">
                  <span class="sm-shift-legend-icon">{{ shift.icon }}</span>
                  <div>
                    <p class="sm-shift-legend-name">{{ shift.name }} <small>(×{{ shift.salaryMultiplier }})</small></p>
                    <p class="sm-shift-legend-desc">{{ shift.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'salary'">
          <div class="sm-section-header">
            <h3>💰 薪资结算</h3>
            <span class="sm-payroll-info">发薪日：每 {{ gameStore.staffManagement.payrollDay }} 天</span>
          </div>
          <div v-if="salarySummary" class="sm-salary-summary-card card">
            <h4>📊 最近结算</h4>
            <div class="sm-salary-period">第 {{ salarySummary.periodStartDay }}-{{ salarySummary.periodEndDay }} 天</div>
            <div class="sm-salary-breakdown">
              <div class="sm-salary-row"><span>基本工资</span><span>{{ formatSalary(salarySummary.totalBaseSalary) }}</span></div>
              <div class="sm-salary-row"><span>加班补贴</span><span>{{ formatSalary(salarySummary.totalOvertimePay) }}</span></div>
              <div class="sm-salary-row"><span>绩效奖金</span><span>{{ formatSalary(salarySummary.totalPerformancePay) }}</span></div>
              <div class="sm-salary-row"><span>津贴</span><span>{{ formatSalary(salarySummary.totalBonus) }}</span></div>
              <div class="sm-salary-total"><span>实发总计</span><span class="sm-salary-total-value">{{ formatSalary(salarySummary.totalPayout) }}</span></div>
            </div>
          </div>
          <div class="sm-section-header sm-sub-header"><h4>📋 员工薪资</h4></div>
          <div v-if="employees.length === 0" class="sm-empty"><p>暂无员工</p></div>
          <div v-else class="sm-salary-list">
            <div v-for="emp in employees" :key="emp.id" class="sm-salary-item">
              <div class="sm-salary-emp">
                <span class="sm-salary-avatar">{{ emp.avatar }}</span>
                <div>
                  <p class="sm-salary-emp-name">{{ emp.name }}</p>
                  <p class="sm-salary-emp-pos">{{ getPositionInfo(emp.position)?.name }} · Lv.{{ emp.level }}</p>
                </div>
              </div>
              <div class="sm-salary-detail">
                <div class="sm-salary-mini">
                  <span class="sm-salary-mini-label">基本工资</span>
                  <span class="sm-salary-mini-value">{{ formatSalary(emp.baseSalary) }}</span>
                </div>
                <div class="sm-salary-mini">
                  <span class="sm-salary-mini-label">出勤</span>
                  <span class="sm-salary-mini-value">{{ emp.performance.daysWorked }}天</span>
                </div>
                <div class="sm-salary-mini">
                  <span class="sm-salary-mini-label">士气</span>
                  <span class="sm-salary-mini-value" :class="{ low: emp.morale < 50 }">{{ emp.morale }}%</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="gameStore.staffManagement.salaryHistory.length > 0" class="sm-section-header sm-sub-header"><h4>📜 历史记录</h4></div>
          <div v-if="gameStore.staffManagement.salaryHistory.length > 0" class="sm-salary-history">
            <div 
              v-for="record in gameStore.staffManagement.salaryHistory.slice(-10).reverse()" 
              :key="record.id"
              class="sm-salary-history-item"
            >
              <span class="sm-sh-date">第{{ record.settlementDay }}天</span>
              <span class="sm-sh-name">{{ record.employeeName }}</span>
              <span class="sm-sh-amount">{{ formatSalary(record.totalAmount) }}</span>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'bonus'">
          <div class="sm-section-header"><h3>✨ 营业加成概览</h3></div>
          <div class="sm-bonus-summary-grid">
            <div class="sm-bonus-card card">
              <span class="sm-bonus-icon">📈</span>
              <div>
                <span class="sm-bonus-label">营收加成</span>
                <span class="sm-bonus-value positive">×{{ bonusSummary.totalRevenueModifier.toFixed(3) }}</span>
              </div>
            </div>
            <div class="sm-bonus-card card">
              <span class="sm-bonus-icon">💎</span>
              <div>
                <span class="sm-bonus-label">利润加成</span>
                <span class="sm-bonus-value positive">×{{ bonusSummary.totalProfitModifier.toFixed(3) }}</span>
              </div>
            </div>
            <div class="sm-bonus-card card">
              <span class="sm-bonus-icon">😊</span>
              <div>
                <span class="sm-bonus-label">满意度</span>
                <span class="sm-bonus-value positive">+{{ bonusSummary.totalSatisfactionBonus.toFixed(1) }}</span>
              </div>
            </div>
            <div class="sm-bonus-card card">
              <span class="sm-bonus-icon">⭐</span>
              <div>
                <span class="sm-bonus-label">声望加成</span>
                <span class="sm-bonus-value positive">+{{ bonusSummary.totalReputationBonus.toFixed(2) }}</span>
              </div>
            </div>
            <div class="sm-bonus-card card">
              <span class="sm-bonus-icon">👥</span>
              <div>
                <span class="sm-bonus-label">客流加成</span>
                <span class="sm-bonus-value positive">×{{ bonusSummary.totalCustomerCountModifier.toFixed(3) }}</span>
              </div>
            </div>
            <div class="sm-bonus-card card">
              <span class="sm-bonus-icon">🎯</span>
              <div>
                <span class="sm-bonus-label">购买率</span>
                <span class="sm-bonus-value positive">+{{ (bonusSummary.totalBuyChanceBonus * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>
          <div class="sm-section-header sm-sub-header"><h4>📋 加成来源</h4></div>
          <div v-if="bonusSummary.activeBonuses.length === 0" class="sm-empty"><p>聘用员工并排班即可获得加成</p></div>
          <div v-else class="sm-bonus-detail-list">
            <div v-for="(bonus, idx) in bonusSummary.activeBonuses" :key="idx" class="sm-bonus-detail-item">
              <div class="sm-bonus-detail-header">
                <span class="sm-bonus-source">{{ bonus.source }}</span>
                <span class="sm-bonus-type-tag">
                  {{ bonus.bonusType === 'revenue' ? '营收' : bonus.bonusType === 'profit' ? '利润' : bonus.bonusType === 'satisfaction' ? '满意度' : bonus.bonusType === 'reputation' ? '声望' : bonus.bonusType === 'customer_count' ? '客流' : '购买率' }}
                </span>
              </div>
              <p class="sm-bonus-desc">{{ bonus.description }}</p>
              <div class="sm-bonus-values">
                <span class="sm-bonus-val">+{{ bonus.value.toFixed(2) }}</span>
                <span class="sm-bonus-val percent">+{{ bonus.percentage.toFixed(2) }}%</span>
              </div>
            </div>
          </div>
          <div class="sm-section-header sm-sub-header"><h4>💡 岗位说明</h4></div>
          <div class="sm-position-bonus-list">
            <div v-for="pos in gameStore.staffManagement.positionConfigs" :key="pos.id" class="sm-position-bonus-item">
              <div class="sm-pos-bonus-header">
                <span class="sm-pos-bonus-icon">{{ pos.icon }}</span>
                <div>
                  <p class="sm-pos-bonus-name">{{ pos.name }}<small v-if="pos.unlockLevel > 1">（等级{{ pos.unlockLevel }}解锁）</small></p>
                  <p class="sm-pos-bonus-desc">{{ pos.description }}</p>
                </div>
              </div>
              <div class="sm-pos-bonus-info">
                <span class="sm-pos-bonus-salary">月薪 ¥{{ pos.baseSalary }}</span>
                <span class="sm-pos-bonus-max">最多 {{ pos.maxCount }} 人</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showRaiseModal && selectedEmployee" class="sm-modal-overlay" @click.self="showRaiseModal = false">
        <div class="sm-modal">
          <div class="sm-modal-header">
            <h3>💵 为 {{ selectedEmployee.name }} 加薪</h3>
            <button class="close-btn" @click="showRaiseModal = false">✕</button>
          </div>
          <div class="sm-modal-body">
            <p class="sm-modal-info">当前月薪：<strong>{{ formatSalary(selectedEmployee.baseSalary) }}</strong></p>
            <p class="sm-modal-info">士气：<strong>{{ selectedEmployee.morale }}%</strong></p>
            <div class="sm-amount-editor">
              <label class="sm-amount-label">加薪金额</label>
              <div class="sm-amount-controls">
                <button class="sm-amt-btn" @click="raiseAmount = Math.max(100, raiseAmount - 100)">-100</button>
                <input type="number" v-model.number="raiseAmount" min="100" class="sm-amt-input" />
                <button class="sm-amt-btn" @click="raiseAmount = raiseAmount + 100">+100</button>
              </div>
              <p class="sm-amount-hint">加薪后月薪：{{ formatSalary(selectedEmployee.baseSalary + raiseAmount) }}</p>
            </div>
          </div>
          <div class="sm-modal-footer">
            <button class="btn-secondary" @click="showRaiseModal = false">取消</button>
            <button class="btn-primary" :disabled="gameStore.budget < raiseAmount" @click="handleRaise">
              {{ gameStore.budget < raiseAmount ? '资金不足' : '确认加薪' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="showFireModal && selectedEmployee" class="sm-modal-overlay" @click.self="showFireModal = false">
        <div class="sm-modal">
          <div class="sm-modal-header">
            <h3>🚪 解聘 {{ selectedEmployee.name }}？</h3>
            <button class="close-btn" @click="showFireModal = false">✕</button>
          </div>
          <div class="sm-modal-body">
            <p class="sm-modal-warning">
              ⚠️ 离职补偿金：<strong class="sm-warning-amount">{{ formatSalary(Math.floor(selectedEmployee.baseSalary * 0.5)) }}</strong>
            </p>
            <p class="sm-modal-note">解聘后无法恢复，请谨慎操作。</p>
          </div>
          <div class="sm-modal-footer">
            <button class="btn-secondary" @click="showFireModal = false">取消</button>
            <button 
              class="btn-secondary sm-fire-confirm"
              :disabled="gameStore.budget < Math.floor(selectedEmployee.baseSalary * 0.5)"
              @click="handleFire"
            >{{ gameStore.budget < Math.floor(selectedEmployee.baseSalary * 0.5) ? '资金不足' : '确认解聘' }}</button>
          </div>
        </div>
      </div>

      <div v-if="showHireModal && selectedCandidate" class="sm-modal-overlay" @click.self="showHireModal = false">
        <div class="sm-modal">
          <div class="sm-modal-header">
            <h3>📝 聘用 {{ selectedCandidate.name }}？</h3>
            <button class="close-btn" @click="showHireModal = false">✕</button>
          </div>
          <div class="sm-modal-body">
            <div class="sm-hire-candidate-info">
              <span class="sm-hire-avatar">{{ selectedCandidate.avatar }}</span>
              <div>
                <p class="sm-hire-name">
                  {{ selectedCandidate.name }}
                  <span :style="{ color: getStaffRarityColor(selectedCandidate.rarity) }">
                    [{{ getStaffRarityLabel(selectedCandidate.rarity) }}]
                  </span>
                </p>
                <p class="sm-hire-pos">{{ getPositionInfo(selectedCandidate.position)?.icon }} {{ getPositionInfo(selectedCandidate.position)?.name }}</p>
              </div>
            </div>
            <div class="sm-hire-cost-breakdown">
              <div class="sm-cost-row"><span>签约奖金</span><span>{{ formatSalary(selectedCandidate.signingBonus) }}</span></div>
              <div class="sm-cost-row"><span>首月工资</span><span>{{ formatSalary(selectedCandidate.expectedSalary) }}</span></div>
              <div class="sm-cost-row total"><span>入职总费用</span><span>{{ formatSalary(selectedCandidate.signingBonus + selectedCandidate.expectedSalary) }}</span></div>
            </div>
          </div>
          <div class="sm-modal-footer">
            <button class="btn-secondary" @click="showHireModal = false">取消</button>
            <button 
              class="btn-primary"
              :disabled="gameStore.budget < selectedCandidate.signingBonus + selectedCandidate.expectedSalary"
              @click="handleHire"
            >{{ gameStore.budget < selectedCandidate.signingBonus + selectedCandidate.expectedSalary ? '资金不足' : '确认聘用' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.staff-mgmt-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}
.staff-mgmt {
  background: linear-gradient(145deg, #2a1a10 0%, #1a0f08 100%);
  border-radius: 18px;
  max-width: 720px;
  width: 100%;
  max-height: 92vh;
  overflow-y: auto;
  border: 2px solid #8b6914;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}
.sm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(139, 105, 20, 0.3);
  position: sticky;
  top: 0;
  background: linear-gradient(145deg, #2a1a10 0%, #1a0f08 100%);
  z-index: 10;
}
.sm-header h2 {
  margin: 0;
  color: #f0d9b5;
  font-size: 1.4rem;
}
.sm-header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.sm-budget {
  color: #f6ad55;
  font-weight: 600;
  font-size: 0.95rem;
}
.close-btn {
  background: rgba(255,255,255,0.08);
  border: none;
  color: #f0d9b5;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}
.close-btn:hover { background: rgba(255,255,255,0.15); }

.sm-stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  padding: 16px 24px;
  background: rgba(139, 105, 20, 0.08);
  border-bottom: 1px solid rgba(139, 105, 20, 0.15);
}
.sm-stat {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
  border: 1px solid rgba(139, 105, 20, 0.15);
}
.sm-stat.sm-notif { cursor: pointer; transition: all 0.2s; }
.sm-stat.sm-notif:hover { background: rgba(139, 105, 20, 0.15); }
.sm-stat-icon { font-size: 1.5rem; }
.sm-stat-value {
  display: block;
  color: #ffd700;
  font-weight: 700;
  font-size: 1rem;
}
.sm-stat-label {
  display: block;
  color: #a08060;
  font-size: 0.75rem;
}

.sm-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 24px;
  border-bottom: 1px solid rgba(139, 105, 20, 0.15);
  overflow-x: auto;
}
.sm-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(0,0,0,0.15);
  border: 1px solid transparent;
  border-radius: 8px;
  color: #a08060;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
  transition: all 0.2s;
}
.sm-tab:hover { background: rgba(139, 105, 20, 0.1); color: #c0a080; }
.sm-tab.active {
  background: linear-gradient(135deg, rgba(139, 105, 20, 0.3), rgba(107, 79, 15, 0.3));
  border-color: #8b6914;
  color: #ffd700;
  font-weight: 600;
}

.sm-message {
  margin: 12px 24px 0;
  padding: 10px 14px;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  animation: fadeIn 0.25s ease;
}
.sm-message.success { background: rgba(72, 187, 120, 0.15); color: #68d391; border: 1px solid rgba(72, 187, 120, 0.3); }
.sm-message.error { background: rgba(245, 101, 101, 0.15); color: #fc8181; border: 1px solid rgba(245, 101, 101, 0.3); }
.sm-message.info { background: rgba(66, 153, 225, 0.15); color: #63b3ed; border: 1px solid rgba(66, 153, 225, 0.3); }

.sm-content { padding: 20px 24px 28px; }

.sm-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.sm-section-header h3 {
  margin: 0;
  color: #f0d9b5;
  font-size: 1.1rem;
}
.sm-section-header.sm-sub-header {
  margin-top: 24px;
  margin-bottom: 12px;
}
.sm-section-header.sm-sub-header h4 {
  margin: 0;
  color: #c0a080;
  font-size: 0.95rem;
}
.sm-refresh-btn { font-size: 0.85rem; padding: 6px 12px; }

.sm-empty {
  padding: 32px;
  text-align: center;
  background: rgba(0,0,0,0.2);
  border-radius: 12px;
  color: #a08060;
}
.sm-empty-sm { padding: 20px; font-size: 0.9rem; }

.card {
  background: rgba(0,0,0,0.2);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(139, 105, 20, 0.2);
}

.sm-candidate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}
.sm-candidate-card {
  background: rgba(0,0,0,0.2);
  border: 2px solid transparent;
  border-radius: 14px;
  padding: 16px;
  transition: all 0.25s;
}
.sm-candidate-card.locked { opacity: 0.6; }
.sm-candidate-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.sm-candidate-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.sm-candidate-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b6914, #6b4f0f);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}
.sm-candidate-info { flex: 1; min-width: 0; }
.sm-candidate-name {
  font-weight: 600;
  color: #f0d9b5;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.sm-rarity-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}
.sm-candidate-position {
  color: #a08060;
  font-size: 0.85rem;
}
.sm-candidate-note {
  color: #c0a080;
  font-size: 0.85rem;
  margin: 0 0 12px 0;
  font-style: italic;
  padding: 8px 12px;
  background: rgba(0,0,0,0.15);
  border-radius: 8px;
  border-left: 3px solid #8b6914;
}
.sm-attr-mini {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}
.sm-attr-mini-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  background: rgba(0,0,0,0.15);
  border-radius: 6px;
}
.sm-attr-icon { font-size: 0.9rem; }
.sm-attr-bar-sm {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  overflow: hidden;
}
.sm-attr-fill-sm {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #f6ad55);
  border-radius: 2px;
}
.sm-candidate-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}
.sm-skill-tag {
  padding: 3px 8px;
  background: rgba(66, 153, 225, 0.15);
  color: #63b3ed;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}
.sm-candidate-cost {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px dashed rgba(139, 105, 20, 0.25);
  border-bottom: 1px dashed rgba(139, 105, 20, 0.25);
  margin-bottom: 12px;
}
.sm-cost-item { display: flex; flex-direction: column; gap: 2px; }
.sm-cost-label { font-size: 0.7rem; color: #a08060; }
.sm-cost-value { font-weight: 700; color: #f6ad55; font-size: 0.95rem; }

.btn-primary, .btn-secondary {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, #d69e2e, #b7791f);
  color: #1a0f08;
}
.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #ecc94b, #d69e2e);
  transform: translateY(-1px);
}
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-secondary {
  background: rgba(139, 105, 20, 0.2);
  color: #f0d9b5;
  border: 1px solid rgba(139, 105, 20, 0.35);
}
.btn-secondary:hover:not(:disabled) { background: rgba(139, 105, 20, 0.35); }
.btn-secondary:disabled { opacity: 0.45; cursor: not-allowed; }

.sm-hire-btn { width: 100%; }

.sm-employee-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sm-employee-card {
  background: rgba(0,0,0,0.2);
  border-radius: 14px;
  padding: 18px;
  border: 2px solid transparent;
}
.sm-emp-header {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 14px;
}
.sm-emp-avatar {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b6914, #4a3a1a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}
.sm-emp-main { flex: 1; min-width: 0; }
.sm-emp-name-row { margin-bottom: 4px; }
.sm-emp-name {
  margin: 0;
  color: #f0d9b5;
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.sm-level-badge {
  background: linear-gradient(135deg, #4299e1, #2b6cb0);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}
.sm-status-badge {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}
.sm-status-badge.working { background: rgba(72, 187, 120, 0.2); color: #68d391; }
.sm-status-badge.training { background: rgba(66, 153, 225, 0.2); color: #63b3ed; }
.sm-status-badge.resting { background: rgba(160, 128, 96, 0.2); color: #a08060; }
.sm-emp-pos {
  color: #a08060;
  font-size: 0.85rem;
  margin: 0 0 8px 0;
}
.sm-emp-exp-bar {
  position: relative;
  height: 18px;
  background: rgba(0,0,0,0.25);
  border-radius: 9px;
  overflow: hidden;
}
.sm-emp-exp-fill {
  height: 100%;
  background: linear-gradient(90deg, #4299e1, #9f7aea);
  border-radius: 9px;
  transition: width 0.4s;
}
.sm-emp-exp-text {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.6);
}

.sm-emp-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px;
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
  margin-bottom: 12px;
}
.sm-emp-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: center;
}
.sm-emp-stat-label { font-size: 0.7rem; color: #a08060; }
.sm-emp-stat-value { font-size: 0.9rem; font-weight: 700; color: #f0d9b5; }

.sm-emp-attrs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}
.sm-emp-attr-item {
  padding: 8px 10px;
  background: rgba(0,0,0,0.15);
  border-radius: 8px;
}
.sm-emp-attr-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.sm-emp-attr-icon { font-size: 0.9rem; }
.sm-emp-attr-name { font-size: 0.8rem; color: #c0a080; flex: 1; }
.sm-emp-attr-value { font-size: 0.75rem; color: #ffd700; font-weight: 600; }
.sm-emp-attr-bar {
  height: 5px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
}
.sm-emp-attr-fill {
  height: 100%;
  background: linear-gradient(90deg, #68d391, #48bb78);
  border-radius: 3px;
}
.sm-emp-training {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(66, 153, 225, 0.12);
  border: 1px solid rgba(66, 153, 225, 0.25);
  border-radius: 8px;
  color: #63b3ed;
  font-size: 0.85rem;
  margin-bottom: 12px;
}
.sm-training-icon { font-size: 1rem; }
.sm-training-progress { margin-left: auto; font-weight: 600; }

.sm-emp-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.sm-action-btn {
  flex: 1;
  min-width: 100px;
  font-size: 0.85rem;
  padding: 8px 10px;
}
.sm-action-btn.raise {
  background: rgba(72, 187, 120, 0.15);
  border-color: rgba(72, 187, 120, 0.35);
  color: #68d391;
}
.sm-action-btn.fire {
  background: rgba(245, 101, 101, 0.15);
  border-color: rgba(245, 101, 101, 0.35);
  color: #fc8181;
}

.sm-training-container {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
}
@media (max-width: 600px) {
  .sm-training-container { grid-template-columns: 1fr; }
}
.sm-emp-selector h4 {
  color: #c0a080;
  font-size: 0.9rem;
  margin: 0 0 10px 0;
}
.sm-emp-select-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
}
.sm-emp-select-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #c0a080;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}
.sm-emp-select-item:hover { background: rgba(139, 105, 20, 0.1); }
.sm-emp-select-item.active {
  background: linear-gradient(135deg, rgba(139, 105, 20, 0.25), rgba(107, 79, 15, 0.25));
  border-color: #8b6914;
  color: #ffd700;
  font-weight: 600;
}
.sm-emp-select-level {
  margin-left: auto;
  font-size: 0.75rem;
  background: rgba(66, 153, 225, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
  color: #63b3ed;
}

.sm-training-detail { display: flex; flex-direction: column; gap: 14px; }
.sm-training-emp-info {
  padding: 14px;
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
}
.sm-training-emp-info h4 {
  color: #f0d9b5;
  margin: 0 0 10px 0;
  font-size: 0.95rem;
}
.sm-completed-trainings {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}
.sm-training-label { color: #a08060; font-size: 0.8rem; }
.sm-no-training { color: #705040; font-size: 0.8rem; }
.sm-completed-tag {
  background: rgba(72, 187, 120, 0.15);
  color: #68d391;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}
.sm-active-training {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(66, 153, 225, 0.1);
  border: 1px solid rgba(66, 153, 225, 0.25);
  border-radius: 8px;
}
.sm-active-training-icon { font-size: 1.2rem; }
.sm-active-training-name { margin: 0; color: #63b3ed; font-weight: 600; font-size: 0.85rem; }
.sm-active-training-progress { margin: 0; color: #a08060; font-size: 0.75rem; }

.sm-course-title {
  color: #c0a080;
  margin: 0;
  font-size: 0.9rem;
}
.sm-course-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px;
}
.sm-course-card {
  padding: 12px;
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
  border: 1px solid rgba(139, 105, 20, 0.15);
}
.sm-course-header {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 10px;
}
.sm-course-icon { font-size: 1.5rem; }
.sm-course-info { flex: 1; min-width: 0; }
.sm-course-name {
  margin: 0 0 4px 0;
  color: #f0d9b5;
  font-size: 0.9rem;
}
.sm-course-desc {
  margin: 0;
  color: #a08060;
  font-size: 0.78rem;
  line-height: 1.4;
}
.sm-course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.sm-course-meta span {
  font-size: 0.75rem;
  color: #c0a080;
  padding: 2px 6px;
  background: rgba(0,0,0,0.2);
  border-radius: 4px;
}
.sm-course-boosts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}
.sm-boost-tag {
  padding: 2px 8px;
  background: rgba(159, 122, 234, 0.15);
  color: #b794f4;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
}
.sm-course-btn { width: 100%; font-size: 0.85rem; padding: 7px 12px; }

.sm-schedule-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sm-schedule-matrix {
  overflow-x: auto;
  background: rgba(0,0,0,0.15);
  border-radius: 12px;
  padding: 8px;
}
.sm-schedule-header-row {
  display: grid;
  grid-template-columns: 120px repeat(7, 1fr);
  gap: 4px;
  padding: 8px;
  border-bottom: 2px solid rgba(139, 105, 20, 0.25);
  margin-bottom: 4px;
}
.sm-schedule-corner {
  color: #a08060;
  font-weight: 600;
  font-size: 0.85rem;
}
.sm-schedule-day {
  text-align: center;
  color: #c0a080;
  font-weight: 600;
  font-size: 0.85rem;
}
.sm-schedule-row {
  display: grid;
  grid-template-columns: 120px repeat(7, 1fr);
  gap: 4px;
  padding: 6px 8px;
  align-items: center;
  border-bottom: 1px solid rgba(139, 105, 20, 0.1);
}
.sm-schedule-emp-name {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f0d9b5;
  font-size: 0.85rem;
  font-weight: 500;
}
.sm-schedule-cell {
  min-height: 44px;
}
.sm-shift-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(66, 153, 225, 0.15);
  border: 1px solid rgba(66, 153, 225, 0.3);
  border-radius: 6px;
  font-size: 0.75rem;
  color: #63b3ed;
  position: relative;
}
.sm-shift-name { font-weight: 500; }
.sm-remove-shift {
  margin-left: auto;
  background: rgba(245, 101, 101, 0.2);
  border: none;
  color: #fc8181;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 0.65rem;
  cursor: pointer;
  line-height: 1;
}
.sm-shift-select {
  width: 100%;
  padding: 6px 4px;
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(139, 105, 20, 0.2);
  border-radius: 6px;
  color: #c0a080;
  font-size: 0.75rem;
  cursor: pointer;
}
.sm-shift-legend { padding: 14px; background: rgba(0,0,0,0.15); border-radius: 10px; }
.sm-shift-legend h4 { margin: 0 0 10px 0; color: #c0a080; font-size: 0.9rem; }
.sm-shift-legend-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
}
.sm-shift-legend-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 10px;
  background: rgba(0,0,0,0.15);
  border-radius: 8px;
}
.sm-shift-legend-icon { font-size: 1.2rem; }
.sm-shift-legend-name { margin: 0; color: #f0d9b5; font-weight: 600; font-size: 0.85rem; }
.sm-shift-legend-name small { color: #f6ad55; font-weight: 500; }
.sm-shift-legend-desc { margin: 2px 0 0 0; color: #a08060; font-size: 0.75rem; }

.sm-payroll-info {
  font-size: 0.8rem;
  color: #a08060;
  padding: 4px 10px;
  background: rgba(139, 105, 20, 0.15);
  border-radius: 10px;
}
.sm-salary-summary-card h4 {
  margin: 0 0 8px 0;
  color: #f0d9b5;
  font-size: 0.95rem;
}
.sm-salary-period {
  color: #a08060;
  font-size: 0.8rem;
  margin-bottom: 12px;
}
.sm-salary-breakdown {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sm-salary-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(139, 105, 20, 0.15);
  color: #c0a080;
  font-size: 0.9rem;
}
.sm-salary-total {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  margin-top: 4px;
  border-top: 2px solid rgba(139, 105, 20, 0.25);
  color: #f0d9b5;
  font-weight: 600;
  font-size: 1rem;
}
.sm-salary-total-value { color: #f6ad55; font-weight: 700; font-size: 1.1rem; }

.sm-salary-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sm-salary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
}
.sm-salary-emp {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}
.sm-salary-avatar {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #8b6914, #4a3a1a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sm-salary-emp-name { margin: 0; color: #f0d9b5; font-weight: 600; font-size: 0.9rem; }
.sm-salary-emp-pos { margin: 2px 0 0 0; color: #a08060; font-size: 0.75rem; }
.sm-salary-detail {
  display: flex;
  gap: 16px;
}
.sm-salary-mini {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.sm-salary-mini-label { color: #a08060; font-size: 0.7rem; }
.sm-salary-mini-value { color: #f0d9b5; font-weight: 600; font-size: 0.9rem; }
.sm-salary-mini-value.low { color: #fc8181; }

.sm-salary-history {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
  max-height: 200px;
  overflow-y: auto;
}
.sm-salary-history-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
}
.sm-salary-history-item:hover { background: rgba(139, 105, 20, 0.08); }
.sm-sh-date { color: #a08060; }
.sm-sh-name { color: #c0a080; flex: 1; text-align: center; }
.sm-sh-amount { color: #f6ad55; font-weight: 600; }

.sm-bonus-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}
.sm-bonus-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  transition: all 0.2s;
}
.sm-bonus-card:hover { transform: translateY(-2px); }
.sm-bonus-icon { font-size: 1.8rem; }
.sm-bonus-label {
  display: block;
  color: #a08060;
  font-size: 0.8rem;
  margin-bottom: 2px;
}
.sm-bonus-value {
  font-size: 1.1rem;
  font-weight: 700;
}
.sm-bonus-value.positive { color: #68d391; }

.sm-bonus-detail-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.sm-bonus-detail-item {
  padding: 12px 14px;
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
  border-left: 3px solid #68d391;
}
.sm-bonus-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.sm-bonus-source {
  color: #f0d9b5;
  font-weight: 600;
  font-size: 0.9rem;
}
.sm-bonus-type-tag {
  padding: 2px 10px;
  background: rgba(159, 122, 234, 0.15);
  color: #b794f4;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}
.sm-bonus-desc {
  margin: 0 0 8px 0;
  color: #a08060;
  font-size: 0.8rem;
}
.sm-bonus-values {
  display: flex;
  gap: 12px;
}
.sm-bonus-val {
  padding: 2px 8px;
  background: rgba(72, 187, 120, 0.1);
  color: #68d391;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
}
.sm-bonus-val.percent {
  background: rgba(246, 173, 85, 0.1);
  color: #f6ad55;
}

.sm-position-bonus-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 10px;
}
.sm-position-bonus-item {
  padding: 14px;
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
  border: 1px solid rgba(139, 105, 20, 0.15);
}
.sm-pos-bonus-header {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.sm-pos-bonus-icon { font-size: 1.8rem; }
.sm-pos-bonus-name {
  margin: 0 0 4px 0;
  color: #f0d9b5;
  font-weight: 600;
  font-size: 0.95rem;
}
.sm-pos-bonus-name small {
  color: #f6ad55;
  font-size: 0.7rem;
  font-weight: 500;
  margin-left: 6px;
}
.sm-pos-bonus-desc {
  margin: 0;
  color: #a08060;
  font-size: 0.8rem;
  line-height: 1.4;
}
.sm-pos-bonus-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px dashed rgba(139, 105, 20, 0.2);
}
.sm-pos-bonus-info span {
  padding: 3px 8px;
  background: rgba(139, 105, 20, 0.1);
  color: #c0a080;
  border-radius: 6px;
  font-size: 0.78rem;
}
.sm-pos-bonus-salary { color: #f6ad55 !important; font-weight: 600; }
.sm-pos-bonus-max { color: #63b3ed !important; }

.sm-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
}
.sm-modal {
  background: linear-gradient(145deg, #2a1a10 0%, #1a0f08 100%);
  border-radius: 16px;
  max-width: 440px;
  width: 100%;
  border: 2px solid #8b6914;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  animation: slideUp 0.3s ease;
}
.sm-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(139, 105, 20, 0.25);
}
.sm-modal-header h3 {
  margin: 0;
  color: #f0d9b5;
  font-size: 1.05rem;
}
.sm-modal-body { padding: 20px; }
.sm-modal-info {
  margin: 0 0 12px 0;
  color: #c0a080;
  font-size: 0.9rem;
}
.sm-modal-info strong { color: #f6ad55; }
.sm-modal-warning {
  padding: 12px 14px;
  background: rgba(245, 101, 101, 0.1);
  border: 1px solid rgba(245, 101, 101, 0.25);
  border-radius: 8px;
  color: #fc8181;
  font-size: 0.9rem;
  margin-bottom: 8px;
}
.sm-warning-amount { color: #f6ad55; font-size: 1.1rem; }
.sm-modal-note {
  margin: 0;
  color: #a08060;
  font-size: 0.8rem;
  font-style: italic;
}

.sm-amount-editor {
  padding: 14px;
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
  margin-top: 8px;
}
.sm-amount-label {
  display: block;
  color: #a08060;
  font-size: 0.8rem;
  margin-bottom: 10px;
}
.sm-amount-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
}
.sm-amt-btn {
  width: 44px;
  height: 36px;
  background: rgba(139, 105, 20, 0.2);
  border: 1px solid rgba(139, 105, 20, 0.35);
  color: #f0d9b5;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.sm-amt-btn:hover { background: rgba(139, 105, 20, 0.35); }
.sm-amt-input {
  width: 100px;
  height: 36px;
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(139, 105, 20, 0.25);
  border-radius: 8px;
  color: #f0d9b5;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
}
.sm-amount-hint {
  margin: 0;
  text-align: center;
  color: #68d391;
  font-size: 0.85rem;
  font-weight: 600;
}

.sm-hire-candidate-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
  margin-bottom: 14px;
}
.sm-hire-avatar {
  font-size: 2.2rem;
  width: 54px;
  height: 54px;
  background: linear-gradient(135deg, #8b6914, #4a3a1a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sm-hire-name {
  margin: 0 0 4px 0;
  color: #f0d9b5;
  font-weight: 600;
  font-size: 1rem;
}
.sm-hire-pos {
  margin: 0;
  color: #a08060;
  font-size: 0.85rem;
}
.sm-hire-cost-breakdown {
  padding: 14px;
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sm-cost-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  color: #c0a080;
  font-size: 0.9rem;
}
.sm-cost-row.total {
  padding-top: 8px;
  margin-top: 4px;
  border-top: 2px solid rgba(139, 105, 20, 0.25);
  color: #f0d9b5;
  font-weight: 700;
  font-size: 1rem;
}
.sm-cost-row.total span:last-child { color: #f6ad55; }

.sm-modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid rgba(139, 105, 20, 0.25);
}
.sm-modal-footer button { flex: 1; }
.sm-fire-confirm {
  background: rgba(245, 101, 101, 0.2) !important;
  border-color: rgba(245, 101, 101, 0.4) !important;
  color: #fc8181 !important;
}
.sm-fire-confirm:hover:not(:disabled) {
  background: rgba(245, 101, 101, 0.3) !important;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
