import type { Record, Genre } from '@/types'

export const allRecords: Record[] = [
  {
    id: 'rec-001',
    title: 'Kind of Blue',
    artist: 'Miles Davis',
    genre: 'Jazz',
    year: 1959,
    coverColor: '#1a365d',
    condition: 'Near Mint',
    rarity: 5,
    costPrice: 280,
    marketPrice: 420,
    description: '爵士乐史上最经典的专辑之一， modal jazz 的巅峰之作',
    trackCount: 5
  },
  {
    id: 'rec-002',
    title: 'Blue Train',
    artist: 'John Coltrane',
    genre: 'Jazz',
    year: 1957,
    coverColor: '#2d3748',
    condition: 'Very Good',
    rarity: 4,
    costPrice: 220,
    marketPrice: 350,
    description: 'Coltrane 早期硬波普杰作',
    trackCount: 5
  },
  {
    id: 'rec-003',
    title: 'The Dark Side of the Moon',
    artist: 'Pink Floyd',
    genre: 'Rock',
    year: 1973,
    coverColor: '#000000',
    condition: 'Near Mint',
    rarity: 5,
    costPrice: 320,
    marketPrice: 480,
    description: '摇滚史上最畅销的专辑之一，概念专辑的典范',
    trackCount: 10
  },
  {
    id: 'rec-004',
    title: 'Led Zeppelin IV',
    artist: 'Led Zeppelin',
    genre: 'Rock',
    year: 1971,
    coverColor: '#744210',
    condition: 'Very Good',
    rarity: 4,
    costPrice: 260,
    marketPrice: 390,
    description: '硬摇滚巅峰，收录 Stairway to Heaven',
    trackCount: 8
  },
  {
    id: 'rec-005',
    title: 'What\'s Going On',
    artist: 'Marvin Gaye',
    genre: 'Soul',
    year: 1971,
    coverColor: '#2c5282',
    condition: 'Mint',
    rarity: 5,
    costPrice: 300,
    marketPrice: 450,
    description: '灵魂乐概念专辑的里程碑',
    trackCount: 9
  },
  {
    id: 'rec-006',
    title: 'Songs in the Key of Life',
    artist: 'Stevie Wonder',
    genre: 'Soul',
    year: 1976,
    coverColor: '#5a67d8',
    condition: 'Near Mint',
    rarity: 4,
    costPrice: 280,
    marketPrice: 420,
    description: 'Stevie Wonder 创作巅峰期的双专辑',
    trackCount: 21
  },
  {
    id: 'rec-007',
    title: 'Maggot Brain',
    artist: 'Funkadelic',
    genre: 'Funk',
    year: 1971,
    coverColor: '#742a2a',
    condition: 'Very Good',
    rarity: 4,
    costPrice: 240,
    marketPrice: 360,
    description: '放克摇滚的代表作，吉他solo出神入化',
    trackCount: 7
  },
  {
    id: 'rec-008',
    title: 'There\'s a Riot Goin\' On',
    artist: 'Sly and the Family Stone',
    genre: 'Funk',
    year: 1971,
    coverColor: '#1a202c',
    condition: 'Good',
    rarity: 3,
    costPrice: 180,
    marketPrice: 280,
    description: '黑暗放克的开山之作',
    trackCount: 12
  },
  {
    id: 'rec-009',
    title: 'Saturday Night Fever',
    artist: 'Bee Gees',
    genre: 'Disco',
    year: 1977,
    coverColor: '#d69e2e',
    condition: 'Near Mint',
    rarity: 3,
    costPrice: 150,
    marketPrice: 240,
    description: '迪斯科时代的标志性原声带',
    trackCount: 17
  },
  {
    id: 'rec-010',
    title: 'C\'est Chic',
    artist: 'Chic',
    genre: 'Disco',
    year: 1978,
    coverColor: '#e53e3e',
    condition: 'Very Good',
    rarity: 3,
    costPrice: 140,
    marketPrice: 220,
    description: 'Chic 最成功的专辑，包含 Le Freak',
    trackCount: 8
  },
  {
    id: 'rec-011',
    title: 'Beethoven: Symphony No.9',
    artist: 'Herbert von Karajan',
    genre: 'Classical',
    year: 1963,
    coverColor: '#4a5568',
    condition: 'Near Mint',
    rarity: 4,
    costPrice: 200,
    marketPrice: 320,
    description: '贝多芬第九交响曲经典录音',
    trackCount: 4
  },
  {
    id: 'rec-012',
    title: 'The Four Seasons',
    artist: 'Antonio Vivaldi',
    genre: 'Classical',
    year: 1970,
    coverColor: '#68d391',
    condition: 'Mint',
    rarity: 3,
    costPrice: 120,
    marketPrice: 190,
    description: '维瓦尔第最著名的作品',
    trackCount: 12
  },
  {
    id: 'rec-013',
    title: 'The Complete Blues',
    artist: 'Robert Johnson',
    genre: 'Blues',
    year: 1961,
    coverColor: '#2d3748',
    condition: 'Good',
    rarity: 5,
    costPrice: 350,
    marketPrice: 520,
    description: '三角洲布鲁斯的圣经',
    trackCount: 29
  },
  {
    id: 'rec-014',
    title: 'Born Under a Bad Sign',
    artist: 'Albert King',
    genre: 'Blues',
    year: 1967,
    coverColor: '#c53030',
    condition: 'Very Good',
    rarity: 4,
    costPrice: 230,
    marketPrice: 350,
    description: '电声布鲁斯的经典',
    trackCount: 11
  },
  {
    id: 'rec-015',
    title: 'Thriller',
    artist: 'Michael Jackson',
    genre: 'Pop',
    year: 1982,
    coverColor: '#e53e3e',
    condition: 'Near Mint',
    rarity: 4,
    costPrice: 260,
    marketPrice: 390,
    description: '史上最畅销专辑',
    trackCount: 9
  },
  {
    id: 'rec-016',
    title: 'Purple Rain',
    artist: 'Prince',
    genre: 'Pop',
    year: 1984,
    coverColor: '#553c9a',
    condition: 'Mint',
    rarity: 5,
    costPrice: 290,
    marketPrice: 440,
    description: 'Prince 的巅峰之作，电影原声带',
    trackCount: 9
  },
  {
    id: 'rec-017',
    title: 'Random Access Memories',
    artist: 'Daft Punk',
    genre: 'Electronic',
    year: 2013,
    coverColor: '#f6e05e',
    condition: 'Mint',
    rarity: 4,
    costPrice: 250,
    marketPrice: 380,
    description: '电子音乐与复古迪斯科的完美融合',
    trackCount: 13
  },
  {
    id: 'rec-018',
    title: 'The End of Evangelion',
    artist: 'Shiro Sagisu',
    genre: 'Electronic',
    year: 1997,
    coverColor: '#e53e3e',
    condition: 'Near Mint',
    rarity: 5,
    costPrice: 320,
    marketPrice: 480,
    description: 'EVA 剧场版原声，动漫迷的收藏佳品',
    trackCount: 14
  },
  {
    id: 'rec-019',
    title: 'The Freewheelin\' Bob Dylan',
    artist: 'Bob Dylan',
    genre: 'Folk',
    year: 1963,
    coverColor: '#2b6cb0',
    condition: 'Good',
    rarity: 5,
    costPrice: 310,
    marketPrice: 470,
    description: '迪伦最具代表性的民谣专辑',
    trackCount: 13
  },
  {
    id: 'rec-020',
    title: 'Blue',
    artist: 'Joni Mitchell',
    genre: 'Folk',
    year: 1971,
    coverColor: '#3182ce',
    condition: 'Very Good',
    rarity: 4,
    costPrice: 240,
    marketPrice: 360,
    description: '民谣摇滚的女性声音典范',
    trackCount: 10
  },
  {
    id: 'rec-021',
    title: 'A Love Supreme',
    artist: 'John Coltrane',
    genre: 'Jazz',
    year: 1965,
    coverColor: '#1a202c',
    condition: 'Mint',
    rarity: 5,
    costPrice: 340,
    marketPrice: 510,
    description: '精神爵士的巅峰之作',
    trackCount: 4
  },
  {
    id: 'rec-022',
    title: 'Abbey Road',
    artist: 'The Beatles',
    genre: 'Rock',
    year: 1969,
    coverColor: '#f6e05e',
    condition: 'Near Mint',
    rarity: 5,
    costPrice: 330,
    marketPrice: 500,
    description: '披头士最后录制的专辑',
    trackCount: 17
  },
  {
    id: 'rec-023',
    title: 'Nevermind',
    artist: 'Nirvana',
    genre: 'Rock',
    year: 1991,
    coverColor: '#3182ce',
    condition: 'Very Good',
    rarity: 4,
    costPrice: 220,
    marketPrice: 340,
    description: 'Grunge 运动的引爆点',
    trackCount: 12
  },
  {
    id: 'rec-024',
    title: 'Off the Wall',
    artist: 'Michael Jackson',
    genre: 'Pop',
    year: 1979,
    coverColor: '#2d3748',
    condition: 'Near Mint',
    rarity: 4,
    costPrice: 200,
    marketPrice: 310,
    description: 'MJ 单飞后的里程碑',
    trackCount: 10
  }
]

export const getRecordsByGenre = (genre: Genre): Record[] => {
  return allRecords.filter(r => r.genre === genre)
}

export const getRecordById = (id: string): Record | undefined => {
  return allRecords.find(r => r.id === id)
}

export const getRandomRecords = (count: number, excludeIds: string[] = [], rarityBonus: number = 0): Record[] => {
  const available = allRecords.filter(r => !excludeIds.includes(r.id))
  
  if (rarityBonus <= 0) {
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }
  
  const weightedRecords = available.map(record => {
    const rarityIndex = record.rarity - 1
    const baseWeights = [40, 30, 20, 8, 2]
    let weight = baseWeights[rarityIndex] || 5
    if (record.rarity >= 4) {
      weight = weight * (1 + rarityBonus)
    }
    return { record, weight }
  })
  
  const totalWeight = weightedRecords.reduce((sum, item) => sum + item.weight, 0)
  const selected: Record[] = []
  const pool = [...weightedRecords]
  
  while (selected.length < count && pool.length > 0) {
    let random = Math.random() * totalWeight
    let found = false
    
    const currentTotal = pool.reduce((sum, item) => sum + item.weight, 0)
    random = Math.random() * currentTotal
    
    for (let i = 0; i < pool.length; i++) {
      random -= pool[i].weight
      if (random <= 0) {
        selected.push(pool[i].record)
        pool.splice(i, 1)
        found = true
        break
      }
    }
    
    if (!found && pool.length > 0) {
      selected.push(pool[0].record)
      pool.splice(0, 1)
    }
  }
  
  return selected
}
