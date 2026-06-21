<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref, computed } from 'vue'
import type { CommunityPostType } from '@/types'
import { getLevelColor } from '@/data/members'

const gameStore = useGameStore()

const showCreateModal = ref(false)
const newPostType = ref<CommunityPostType>('discussion')
const newPostContent = ref('')
const newPostTags = ref('')

const postTypes = [
  { type: 'review' as CommunityPostType, name: '唱片点评', icon: '📝' },
  { type: 'recommendation' as CommunityPostType, name: '好物推荐', icon: '💫' },
  { type: 'discussion' as CommunityPostType, name: '音乐讨论', icon: '💬' },
  { type: 'event_share' as CommunityPostType, name: '活动分享', icon: '🎉' },
  { type: 'collection_show' as CommunityPostType, name: '收藏展示', icon: '🏆' }
]

const posts = computed(() => gameStore.communityPosts)

const handleLike = (postId: string) => {
  gameStore.likeCommunityPost(postId)
}

const handleShare = (postId: string) => {
  gameStore.shareCommunityPost(postId)
}

const openCreateModal = () => {
  showCreateModal.value = true
  newPostContent.value = ''
  newPostTags.value = ''
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const handleCreatePost = () => {
  if (!newPostContent.value.trim()) return

  const tags = newPostTags.value
    .split(/[,，]/)
    .map(t => t.trim())
    .filter(t => t.length > 0)

  gameStore.createCommunityPost(
    newPostType.value,
    newPostContent.value,
    undefined,
    undefined,
    undefined,
    undefined,
    tags
  )

  closeCreateModal()
}
</script>

<template>
  <div class="community-posts">
    <div class="posts-header">
      <h3 class="section-title">乐迷帖子</h3>
      <button class="create-btn" @click="openCreateModal">
        ✏️ 发帖
      </button>
    </div>

    <div class="post-list">
      <div 
        v-for="post in posts" 
        :key="post.id" 
        class="post-card card"
        :class="{ pinned: post.isPinned }"
      >
        <div class="post-header">
          <div class="post-author">
            <span class="author-avatar">{{ post.authorAvatar }}</span>
            <div class="author-info">
              <span class="author-name">{{ post.authorName }}</span>
              <span 
                v-if="post.authorLevel" 
                class="author-level"
                :style="{ color: getLevelColor(post.authorLevel) }"
              >
                {{ post.authorLevel }}
              </span>
            </div>
          </div>
          <div class="post-meta">
            <span class="post-type-tag" :class="post.type">
              {{ post.typeIcon }} {{ post.typeName }}
            </span>
            <span v-if="post.isPinned" class="pinned-tag">📌 置顶</span>
          </div>
        </div>

        <p class="post-content">{{ post.content }}</p>

        <div v-if="post.recordTitle" class="post-record">
          <div 
            class="record-mini-cover" 
            :style="{ background: post.recordCoverColor || '#333' }"
          >
            <span class="vinyl-disc">●</span>
          </div>
          <div class="record-info">
            <span class="record-title">{{ post.recordTitle }}</span>
            <span class="record-artist">{{ post.recordArtist }}</span>
          </div>
          <span v-if="post.recordGenre" class="record-genre">
            {{ gameStore.getCommunityGenreIcon(post.recordGenre) }} {{ post.recordGenre }}
          </span>
        </div>

        <div v-if="post.tags.length > 0" class="post-tags">
          <span v-for="tag in post.tags" :key="tag" class="tag">
            #{{ tag }}
          </span>
        </div>

        <div class="post-actions">
          <button 
            class="action-btn" 
            :class="{ liked: post.isLiked }"
            @click="handleLike(post.id)"
          >
            <span class="action-icon">{{ post.isLiked ? '❤️' : '🤍' }}</span>
            <span class="action-count">{{ post.likes }}</span>
          </button>
          <button class="action-btn">
            <span class="action-icon">💬</span>
            <span class="action-count">{{ post.comments }}</span>
          </button>
          <button class="action-btn" @click="handleShare(post.id)">
            <span class="action-icon">🔄</span>
            <span class="action-count">{{ post.shares }}</span>
          </button>
          <span class="post-time">
            {{ gameStore.formatCommunityTimeAgo(post.timestamp) }}
          </span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
        <div class="modal-content animate-slide-up">
          <div class="modal-header">
            <h3>发布帖子</h3>
            <button class="close-btn" @click="closeCreateModal">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="post-type-selector">
              <button 
                v-for="pt in postTypes" 
                :key="pt.type"
                class="type-btn"
                :class="{ active: newPostType === pt.type }"
                @click="newPostType = pt.type"
              >
                <span class="type-icon">{{ pt.icon }}</span>
                <span class="type-name">{{ pt.name }}</span>
              </button>
            </div>

            <div class="content-editor">
              <textarea 
                v-model="newPostContent"
                placeholder="分享你的黑胶故事..."
                class="content-textarea"
                rows="5"
              ></textarea>
            </div>

            <div class="tags-input">
              <span class="tags-label">标签</span>
              <input 
                v-model="newPostTags"
                type="text"
                placeholder="用逗号分隔，如：爵士,经典"
                class="tags-field"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="closeCreateModal">取消</button>
            <button 
              class="btn-primary" 
              :disabled="!newPostContent.trim()"
              @click="handleCreatePost"
            >
              发布
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.community-posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.create-btn {
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  animation: slideUp 0.3s ease-out;
}

.post-card.pinned {
  border-color: var(--accent-gold);
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.08) 0%, rgba(243, 156, 18, 0.08) 100%);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-orange) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.author-level {
  font-size: 10px;
  font-weight: 600;
}

.post-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.post-type-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.post-type-tag.review {
  background: rgba(72, 187, 120, 0.2);
  color: var(--success);
}

.post-type-tag.recommendation {
  background: rgba(243, 156, 18, 0.2);
  color: var(--warning);
}

.post-type-tag.discussion {
  background: rgba(66, 153, 225, 0.2);
  color: #4299e1;
}

.post-type-tag.event_share {
  background: rgba(237, 137, 54, 0.2);
  color: var(--warning);
}

.post-type-tag.collection_show {
  background: rgba(159, 122, 234, 0.2);
  color: #9f7aea;
}

.pinned-tag {
  font-size: 10px;
  color: var(--accent-gold);
  font-weight: 600;
}

.post-content {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.post-record {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-bottom: 12px;
}

.record-mini-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vinyl-disc {
  color: rgba(255, 255, 255, 0.3);
  font-size: 20px;
}

.record-info {
  flex: 1;
  min-width: 0;
}

.record-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-artist {
  font-size: 11px;
  color: var(--text-secondary);
}

.record-genre {
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(233, 69, 96, 0.2);
  color: var(--accent-gold);
  border-radius: 8px;
  flex-shrink: 0;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.tag {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 10px;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  padding: 4px 0;
}

.action-btn.liked {
  color: var(--danger);
}

.action-icon {
  font-size: 14px;
}

.action-count {
  font-size: 11px;
  font-weight: 500;
}

.post-time {
  margin-left: auto;
  font-size: 10px;
  color: var(--text-muted);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 14px;
}

.modal-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 2px solid transparent;
  flex: 1;
  min-width: 60px;
}

.type-btn.active {
  background: rgba(233, 69, 96, 0.15);
  border-color: var(--accent-gold);
  color: var(--accent-gold);
}

.type-icon {
  font-size: 20px;
}

.type-name {
  font-size: 10px;
  font-weight: 500;
}

.content-editor {
  width: 100%;
}

.content-textarea {
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
}

.content-textarea:focus {
  border-color: var(--accent-gold);
}

.tags-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tags-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.tags-field {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
}

.tags-field:focus {
  border-color: var(--accent-gold);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid var(--border);
}

.modal-footer button {
  flex: 1;
}
</style>
