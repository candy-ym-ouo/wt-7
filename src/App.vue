<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from './stores/game'
import LevelSelect from './components/LevelSelect.vue'
import GameHeader from './components/GameHeader.vue'
import PurchaseView from './components/PurchaseView.vue'
import DisplayView from './components/DisplayView.vue'
import BusinessView from './components/BusinessView.vue'
import SettlementView from './components/SettlementView.vue'
import CollectionView from './components/CollectionView.vue'
import StaffView from './components/StaffView.vue'
import AuctionView from './components/AuctionView.vue'
import PresaleView from './components/PresaleView.vue'
import ShopRenovationView from './components/ShopRenovationView.vue'
import MarketTourView from './components/MarketTourView.vue'
import RepairWorkshopView from './components/RepairWorkshopView.vue'
import EncyclopediaView from './components/EncyclopediaView.vue'
import FestivalView from './components/FestivalView.vue'

const gameStore = useGameStore()
const showCollection = ref(false)
const showStaff = ref(false)
const showAuction = ref(false)
const showPresale = ref(false)
const showRenovation = ref(false)
const showMarketTour = ref(false)
const showRepairWorkshop = ref(false)
const showEncyclopedia = ref(false)
const showFestival = ref(false)
const currentView = ref<'menu' | 'game'>('menu')

const startGame = (levelId: number) => {
  gameStore.startLevel(levelId)
  currentView.value = 'game'
}

const backToMenu = () => {
  currentView.value = 'menu'
}

const toggleCollection = () => {
  showCollection.value = !showCollection.value
}

const toggleStaff = () => {
  showStaff.value = !showStaff.value
}

const toggleAuction = () => {
  showAuction.value = !showAuction.value
}

const togglePresale = () => {
  showPresale.value = !showPresale.value
}

const toggleRenovation = () => {
  showRenovation.value = !showRenovation.value
}

const toggleMarketTour = () => {
  showMarketTour.value = !showMarketTour.value
}

const toggleRepairWorkshop = () => {
  showRepairWorkshop.value = !showRepairWorkshop.value
}

const toggleEncyclopedia = () => {
  showEncyclopedia.value = !showEncyclopedia.value
  if (!showEncyclopedia.value) {
    gameStore.clearNewEncyclopediaNotifications()
  }
}

const toggleFestival = () => {
  showFestival.value = !showFestival.value
}
</script>

<template>
  <div class="app-container">
    <CollectionView v-if="showCollection" @close="toggleCollection" />
    <StaffView v-if="showStaff" @close="toggleStaff" />
    <AuctionView v-if="showAuction" @close="toggleAuction" />
    <PresaleView v-if="showPresale" @close="togglePresale" />
    <ShopRenovationView v-if="showRenovation" @close="toggleRenovation" />
    <MarketTourView v-if="showMarketTour" @close="toggleMarketTour" />
    <RepairWorkshopView v-if="showRepairWorkshop" @close="toggleRepairWorkshop" />
    <EncyclopediaView v-if="showEncyclopedia" @close="toggleEncyclopedia" />
    <FestivalView v-if="showFestival" @close="toggleFestival" />
    
    <template v-if="currentView === 'menu'">
      <LevelSelect @start="startGame" />
    </template>
    
    <template v-else>
      <GameHeader 
        @back="backToMenu" 
        @collection="toggleCollection"
        @staff="toggleStaff"
        @auction="toggleAuction"
        @presale="togglePresale"
        @renovation="toggleRenovation"
        @market-tour="toggleMarketTour"
        @repair-workshop="toggleRepairWorkshop"
        @encyclopedia="toggleEncyclopedia"
        @festival="toggleFestival"
      />
      
      <main class="main-content">
        <PurchaseView v-if="gameStore.phase === 'purchase'" />
        <DisplayView v-else-if="gameStore.phase === 'display'" />
        <BusinessView v-else-if="gameStore.phase === 'business'" />
        <SettlementView v-else-if="gameStore.phase === 'settlement'" @back="backToMenu" />
      </main>
    </template>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 16px;
  padding-bottom: 80px;
}
</style>
