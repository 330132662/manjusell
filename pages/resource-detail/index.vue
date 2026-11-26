<template>

</template>

<script setup>
import { ref, computed } from 'vue'
import TopTitle from '@/components/TopTitle.vue'

// 响应式数据
const activeTab = ref('content')

// 设备检测
const isMobile = computed(() => {
  return uni.getSystemInfoSync().windowWidth < 768
})

// 导航到首页
const navigateToHome = () => {
  uni.navigateTo({ url: '/pages/index/index' })
}

// 导航到资源库
const navigateToResource = () => {
  uni.navigateTo({ url: '/pages/resource/index' })
}

// 导航到详情页
const navigateToDetail = (resourceId) => {
  uni.navigateTo({
    url: `/pages/resource-detail/index?id=${resourceId}`
  })
}

// 切换标签
const switchTab = (tab) => {
  activeTab.value = tab
  uni.showToast({
    title: '切换到: ' + tab,
    icon: 'none'
  })
}

// 加入素材库
const addToLibrary = () => {
  uni.showToast({
    title: '已加入素材库',
    icon: 'success'
  })
}

// 下载资源
const downloadResource = () => {
  uni.showToast({
    title: '开始下载',
    icon: 'success'
  })
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #F7FFF7;
}

// 渐变文字
.gradient-text {
  background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
  letter-spacing: -0.02em;
}

// 导航栏
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(26, 83, 92, 0.08);
  z-index: 50;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  .gradient-text {
    font-size: 20px;
  }
}

.nav-links {
  display: flex;
  gap: 32px;
  white-space: nowrap;
}

.nav-link {
  font-size: 14px;
  font-weight: 500;
  color: rgba(26, 83, 92, 0.65);
  transition: color 0.15s;

  &.active {
    color: #1A535C;
    font-weight: 600;
  }

  &:active {
    color: #1A535C;
  }
}

.nav-action {
  .enroll-btn {
    padding: 10px 20px;
    background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #FFFFFF;
    border: none;

    &:active {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  }
}

// 面包屑导航
.breadcrumb {
  padding: 24px 32px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-link {
  font-size: 14px;
  color: #4ECDC4;
  transition: color 0.15s;

  &:active {
    color: #1A535C;
  }
}

.breadcrumb-current {
  font-size: 14px;
  color: rgba(26, 83, 92, 0.4);
}

// 主内容区
.main-content {
  padding-top: 64px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

// 左侧预览区
.preview-panel {
  flex: 0 0 60%;
}

// 标签栏
.tab-bar {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #FFFFFF;
  border: 1px solid rgba(26, 83, 92, 0.12);
  border-radius: 16px 16px 0 0;
  border-bottom: none;
}

.tab-btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  background: transparent;
  color: rgba(26, 83, 92, 0.4);

  &.active {
    background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);
    color: #FFFFFF;
    font-weight: 600;
  }

  &:active {
    color: #1A535C;
  }
}

// 预览区域
.preview-area {
  position: relative;
  background: #1A535C;
  border-radius: 0 0 16px 16px;
  min-height: 520px;
  overflow: hidden;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background-image:
    linear-gradient(rgba(78, 205, 196, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(78, 205, 196, 0.3) 1px, transparent 1px);
  background-size: 40px 40px;
}

.script-content {
  position: relative;
  padding: 40px;
  font-family: 'Courier New', monospace;
  color: rgba(247, 255, 247, 0.88);
}

.scene-heading {
  font-size: 18px;
  font-weight: bold;
  color: #4ECDC4;
  letter-spacing: 0.02em;
  margin-bottom: 24px;
}

.scene-desc {
  margin-bottom: 32px;

  .desc-text {
    font-size: 16px;
    line-height: 1.6;
    color: rgba(247, 255, 247, 0.7);
    display: block;
    max-width: 640px;
  }
}

.dialogue-block {
  margin-bottom: 32px;
}

.character-name {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
}

.dialogue-text {
  display: flex;
  padding-left: 16px;
  gap: 8px;
}

.dialogue-border {
  flex-shrink: 0;
  width: 2px;
  background: #4ECDC4;
  border-radius: 1px;
}

.dialogue-content {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(247, 255, 247, 0.8);
}

.action-block {
  margin-top: 24px;

  .action-text {
    font-size: 14px;
    line-height: 1.6;
    color: rgba(247, 255, 247, 0.6);
    font-style: italic;
    display: block;
  }
}

// 右侧元数据区
.metadata-panel {
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

// 元数据卡片
.metadata-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(26, 83, 92, 0.08);
  border-radius: 16px;
  padding: 32px;
}

.resource-title {
  font-size: 28px;
  font-weight: bold;
  color: #1A535C;
  line-height: 1.3;
  margin-bottom: 12px;
  display: block;
}

.category-badge {
  margin-bottom: 20px;
}

.badge-text {
  padding: 6px 14px;
  background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  color: #FFFFFF;
  display: inline-block;
}

// 难度
.difficulty-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.difficulty-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(26, 83, 92, 0.65);
}

.difficulty-levels {
  display: flex;
  gap: 6px;
}

.level-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;

  &.filled {
    background: #1A535C;
  }

  &.empty {
    border: 1.5px solid rgba(26, 83, 92, 0.12);
  }
}

.difficulty-text {
  font-size: 14px;
  font-weight: 600;
  color: #1A535C;
}

// 分隔线
.divider {
  height: 1px;
  background: rgba(26, 83, 92, 0.12);
  margin: 24px 0;
}

// 元数据网格
.metadata-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 24px;
  margin-bottom: 24px;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(26, 83, 92, 0.4);
}

.meta-value {
  font-size: 14px;
  font-weight: 600;
  color: #1A535C;
}

.rating-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-value {
  font-size: 14px;
  font-weight: 600;
  color: #1A535C;
}

// 操作按钮
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primary-btn {
  padding: 14px 24px;
  background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);
  border-radius: 16px;
  font-size: 16px;
  font-weight: bold;
  color: #FFFFFF;
  border: none;
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.25);

  &:active {
    opacity: 0.9;
    transform: translateY(-1px);
  }
}

.secondary-btn {
  padding: 14px 24px;
  background: transparent;
  border: 1.5px solid rgba(26, 83, 92, 0.12);
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1A535C;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:active {
    border-color: #1A535C;
  }
}

.btn-text {
  color: #1A535C;
}

// 信任元素卡片
.trust-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(26, 83, 92, 0.08);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trust-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trust-content {
  flex: 1;
}

.trust-title {
  font-size: 14px;
  font-weight: 600;
  color: #1A535C;
  display: block;
}

.trust-desc {
  font-size: 12px;
  color: rgba(26, 83, 92, 0.4);
  display: block;
}

// 相关推荐
.related-section {
  padding: 40px 32px 56px;
}

.related-title {
  font-size: 24px;
  font-weight: bold;
  color: #1A535C;
  margin-bottom: 24px;
  display: block;
}

.related-carousel {
  display: flex;
  gap: 20px;
  padding-bottom: 8px;
  white-space: nowrap;
}

.related-card {
  flex-shrink: 0;
  width: 208px;
  transition: transform 0.15s;

  &:active {
    transform: translateY(-2px);
  }
}

.related-cover {
  height: 156px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.related-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.related-name {
  font-size: 14px;
  font-weight: 600;
  color: #1A535C;
  transition: color 0.15s;
}

.related-tag {
  padding: 4px 10px;
  background: rgba(78, 205, 196, 0.1);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #4ECDC4;
  display: inline-block;
}

// 底部
.footer {
  padding: 40px 32px 48px;
  background: #F7FFF7;
  border-top: 1px solid rgba(26, 83, 92, 0.12);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
}

.footer-brand {
  .footer-logo {
    font-size: 18px;
    display: block;
    margin-bottom: 8px;
  }

  .footer-desc {
    font-size: 14px;
    color: rgba(26, 83, 92, 0.4);
    display: block;
  }
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-link {
  font-size: 14px;
  color: rgba(26, 83, 92, 0.4);
  transition: color 0.15s;

  &:active {
    color: #1A535C;
  }
}

.footer-social {
  display: flex;
  gap: 16px;
}

.social-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;

  &:active {
    color: #1A535C;
  }
}

.footer-copyright {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(26, 83, 92, 0.12);
}

.copyright-text {
  font-size: 12px;
  color: rgba(26, 83, 92, 0.4);
}

// 响应式布局
@media screen and (min-width: 1024px) {
  .content-wrapper {
    flex-direction: row;
    gap: 32px;
  }
}

@media screen and (max-width: 767px) {
  .nav-bar {
    height: 60px;
  }

  .nav-content {
    padding: 0 16px;
  }

  .nav-links {
    display: none;
  }

  .breadcrumb {
    padding: 16px 16px 8px;
    font-size: 12px;
  }

  .content-wrapper {
    padding: 16px;
    flex-direction: column;
  }

  .preview-panel {
    flex: 1;
  }

  .metadata-panel {
    flex: 1;
  }

  .preview-area {
    min-height: 400px;
  }

  .script-content {
    padding: 20px;
  }

  .scene-heading {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .scene-desc {
    margin-bottom: 24px;

    .desc-text {
      font-size: 14px;
    }
  }

  .dialogue-block {
    margin-bottom: 24px;
  }

  .character-name {
    font-size: 12px;
  }

  .dialogue-content {
    font-size: 14px;
  }

  .metadata-card {
    padding: 20px;
  }

  .resource-title {
    font-size: 22px;
  }

  .related-section {
    padding: 24px 16px 32px;
  }

  .related-title {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .related-carousel {
    gap: 16px;
  }

  .related-card {
    width: 180px;
  }

  .related-cover {
    height: 135px;
  }

  .footer {
    padding: 32px 16px;
  }

  .footer-links {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}

@media screen and (min-width: 768px) and (max-width: 1023px) {
  .content-wrapper {
    flex-direction: column;
  }

  .preview-panel,
  .metadata-panel {
    flex: 1;
  }
}
</style>
