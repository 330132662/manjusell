<template>
  <view class="resource-page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-content">
        <view class="logo">
          <text class="gradient-text">AI短剧学院</text>
        </view>
        <scroll-view class="nav-links" scroll-x v-if="!isMobile">
          <view class="nav-link">课程体系</view>
          <view class="nav-link active">资源库</view>
          <view class="nav-link">AI工具</view>
          <view class="nav-link">课程定价</view>
        </scroll-view>
        <view class="nav-action">
          <button class="enroll-btn">立即报名</button>
        </view>
      </view>
    </view>

    <!-- Hero区域 -->
    <view class="hero-section">
      <text class="hero-title gradient-text">AI短剧资源库</text>
      <text class="hero-subtitle">剧本 / 素材 / 模板,一键获取创作弹药</text>

      <!-- 搜索栏 -->
      <view class="search-bar">
        <uni-icons type="search" size="20" color="rgba(26, 83, 92, 0.4)"></uni-icons>
        <input class="search-input" placeholder="搜索资源..." v-model="searchKeyword" @confirm="handleSearch" />
      </view>

      <!-- 筛选标签 -->
      <scroll-view class="filter-chips" scroll-x>
        <button class="filter-chip active" @click="changeFilter('all')">全部</button>
        <button class="filter-chip" @click="changeFilter('script')">AI剧本</button>
        <button class="filter-chip" @click="changeFilter('avatar')">数字人形象</button>
        <button class="filter-chip" @click="changeFilter('music')">背景音乐</button>
        <button class="filter-chip" @click="changeFilter('video')">视频模板</button>
        <button class="filter-chip" @click="changeFilter('subtitle')">字幕模板</button>
      </scroll-view>
    </view>

    <!-- 资源网格 -->
    <scroll-view class="resource-grid-section" scroll-y>
      <view class="resource-grid">
        <!-- 资源卡片 1 -->
        <view class="resource-card" @click="navigateToDetail(1)">
          <view class="card-cover" style="background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);">
            <view class="cover-icon">
              <uni-icons type="videocam" size="32" color="rgba(255,255,255,0.3)"></uni-icons>
            </view>
            <view class="play-badge">
              <uni-icons type="play-filled" size="20" color="#FFFFFF"></uni-icons>
            </view>
          </view>
          <view class="card-content">
            <text class="card-title">赛博朋克城市追逐</text>
            <view class="card-tags">
              <text class="tag tag-accent">#AI剧本</text>
              <text class="tag tag-primary">#Pika风格</text>
            </view>
            <view class="card-footer">
              <text class="usage-count">已使用 1.2k 次</text>
              <button class="preview-btn">预览使用</button>
            </view>
          </view>
        </view>

        <!-- 资源卡片 2 -->
        <view class="resource-card" @click="navigateToDetail(2)">
          <view class="card-cover" style="background: linear-gradient(135deg, #14464D 0%, #1A535C 100%);">
            <view class="cover-icon">
              <uni-icons type="paperclip" size="32" color="rgba(255,255,255,0.3)"></uni-icons>
            </view>
            <view class="play-badge">
              <uni-icons type="play-filled" size="20" color="#FFFFFF"></uni-icons>
            </view>
          </view>
          <view class="card-content">
            <text class="card-title">古风宫廷权谋</text>
            <view class="card-tags">
              <text class="tag tag-accent">#AI剧本</text>
              <text class="tag tag-primary">#Sora风格</text>
            </view>
            <view class="card-footer">
              <text class="usage-count">已使用 980 次</text>
              <button class="preview-btn">预览使用</button>
            </view>
          </view>
        </view>

        <!-- 资源卡片 3 -->
        <view class="resource-card" @click="navigateToDetail(3)">
          <view class="card-cover" style="background: linear-gradient(135deg, #4ECDC4 0%, rgba(78,205,196,0.4) 100%);">
            <view class="cover-icon">
              <uni-icons type="heart-filled" size="32" color="#14464D"></uni-icons>
            </view>
            <view class="play-badge">
              <uni-icons type="play-filled" size="20" color="#14464D"></uni-icons>
            </view>
          </view>
          <view class="card-content">
            <text class="card-title">现代都市爱情</text>
            <view class="card-tags">
              <text class="tag tag-accent">#AI剧本</text>
              <text class="tag tag-primary">#剪映模板</text>
            </view>
            <view class="card-footer">
              <text class="usage-count">已使用 2.1k 次</text>
              <button class="preview-btn">预览使用</button>
            </view>
          </view>
        </view>

        <!-- 资源卡片 4 -->
        <view class="resource-card" @click="navigateToDetail(4)">
          <view class="card-cover" style="background: linear-gradient(135deg, #1A535C 0%, #14464D 100%);">
            <view class="cover-icon">
              <uni-icons type="rocket" size="32" color="rgba(255,255,255,0.3)"></uni-icons>
            </view>
            <view class="play-badge">
              <uni-icons type="play-filled" size="20" color="#FFFFFF"></uni-icons>
            </view>
          </view>
          <view class="card-content">
            <text class="card-title">科幻星际冒险</text>
            <view class="card-tags">
              <text class="tag tag-accent">#视频模板</text>
              <text class="tag tag-primary">#Pika风格</text>
            </view>
            <view class="card-footer">
              <text class="usage-count">已使用 1.5k 次</text>
              <button class="preview-btn">预览使用</button>
            </view>
          </view>
        </view>

        <!-- 资源卡片 5 -->
        <view class="resource-card" @click="navigateToDetail(5)">
          <view class="card-cover" style="background: linear-gradient(135deg, #14464D 0%, #1A535C 100%);">
            <view class="cover-icon">
              <uni-icons type="search" size="32" color="rgba(255,255,255,0.3)"></uni-icons>
            </view>
            <view class="play-badge">
              <uni-icons type="play-filled" size="20" color="#FFFFFF"></uni-icons>
            </view>
          </view>
          <view class="card-content">
            <text class="card-title">悬疑推理密室</text>
            <view class="card-tags">
              <text class="tag tag-accent">#AI剧本</text>
              <text class="tag tag-primary">#Sora风格</text>
            </view>
            <view class="card-footer">
              <text class="usage-count">已使用 860 次</text>
              <button class="preview-btn">预览使用</button>
            </view>
          </view>
        </view>

        <!-- 资源卡片 6 -->
        <view class="resource-card" @click="navigateToDetail(6)">
          <view class="card-cover" style="background: linear-gradient(135deg, #4ECDC4 0%, #1A535C 100%);">
            <view class="cover-icon">
              <uni-icons type="book" size="32" color="#14464D"></uni-icons>
            </view>
            <view class="play-badge">
              <uni-icons type="play-filled" size="20" color="#14464D"></uni-icons>
            </view>
          </view>
          <view class="card-content">
            <text class="card-title">校园青春日常</text>
            <view class="card-tags">
              <text class="tag tag-accent">#字幕模板</text>
              <text class="tag tag-primary">#剪映模板</text>
            </view>
            <view class="card-footer">
              <text class="usage-count">已使用 1.8k 次</text>
              <button class="preview-btn">预览使用</button>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 热门资源轮播 -->
    <view class="hot-resources-section">
      <text class="section-title gradient-text">热门资源</text>
      <scroll-view class="hot-carousel" scroll-x>
        <!-- 热门卡片 1 -->
        <view class="hot-card" style="border: 2px solid #FF6B6B;">
          <view class="hot-cover" style="background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);">
            <view class="hot-icon">
              <uni-icons type="fire" size="28" color="rgba(255,255,255,0.3)"></uni-icons>
            </view>
          </view>
          <view class="hot-content">
            <text class="hot-title">极速反转短视频合集</text>
            <text class="hot-badge">热度 98%</text>
          </view>
        </view>

        <!-- 热门卡片 2 -->
        <view class="hot-card" style="border: 2px solid #FF6B6B;">
          <view class="hot-cover" style="background: linear-gradient(135deg, #1A535C 0%, #FF6B6B 100%);">
            <view class="hot-icon">
              <uni-icons type="trending-up" size="28" color="rgba(255,255,255,0.3)"></uni-icons>
            </view>
          </view>
          <view class="hot-content">
            <text class="hot-title">爆款情感短剧剧本</text>
            <text class="hot-badge">热度 96%</text>
          </view>
        </view>

        <!-- 热门卡片 3 -->
        <view class="hot-card" style="border: 2px solid #FF6B6B;">
          <view class="hot-cover" style="background: linear-gradient(135deg, #4ECDC4 0%, #FF6B6B 100%);">
            <view class="hot-icon">
              <uni-icons type="star-filled" size="28" color="#14464D"></uni-icons>
            </view>
          </view>
          <view class="hot-content">
            <text class="hot-title">AI数字人形象包</text>
            <text class="hot-badge">热度 95%</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 底部 -->
    <view class="footer">
      <view class="footer-content">
        <view class="footer-brand">
          <text class="gradient-text footer-logo">AI短剧学院</text>
          <text class="footer-desc">让每个人都能成为短剧创作者</text>
        </view>
        <view class="footer-links">
          <text class="footer-link">课程体系</text>
          <text class="footer-link">资源库</text>
          <text class="footer-link">课程定价</text>
          <text class="footer-link">关于我们</text>
        </view>
        <view class="footer-social">
          <view class="social-icon">
            <uni-icons type="chat" size="20" color="rgba(26, 83, 92, 0.4)"></uni-icons>
          </view>
          <view class="social-icon">
            <uni-icons type="email" size="20" color="rgba(26, 83, 92, 0.4)"></uni-icons>
          </view>
          <view class="social-icon">
            <uni-icons type="videocam" size="20" color="rgba(26, 83, 92, 0.4)"></uni-icons>
          </view>
        </view>
      </view>
      <view class="footer-copyright">
        <text class="copyright-text">© 2026 AI短剧学院. 保留所有权利.</text>
      </view>
    </view>

    <!-- AI生成悬浮按钮 -->
    <view class="ai-float-btn" @click="handleAIGenerate">
      <button class="ai-btn">
        <uni-icons type="star-filled" size="24" color="#FFFFFF"></uni-icons>
      </button>
      <text class="ai-btn-text">AI生成</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 响应式数据
const searchKeyword = ref('')
const activeFilter = ref('all')

// 设备检测
const isMobile = computed(() => {
  return uni.getSystemInfoSync().windowWidth < 768
})

// 搜索处理
const handleSearch = () => {
  uni.showToast({
    title: '搜索: ' + searchKeyword.value,
    icon: 'none'
  })
}

// 筛选切换
const changeFilter = (filter) => {
  activeFilter.value = filter
  uni.showToast({
    title: '筛选: ' + filter,
    icon: 'none'
  })
}

// 导航到详情页
const navigateToDetail = (resourceId) => {
  uni.navigateTo({
    url: `/pages/resource-detail/index?id=${resourceId}`
  })
}

// AI生成
const handleAIGenerate = () => {
  uni.showToast({
    title: 'AI生成功能',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.resource-page {
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
  height: 72px;
  background: #FFFFFF;
  border-bottom: 1px solid rgba(26, 83, 92, 0.12);
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
    padding: 10px 24px;
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

// Hero区域
.hero-section {
  padding-top: 100px;
  padding-bottom: 56px;
  text-align: center;
}

.hero-title {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(26, 83, 92, 0.65);
  line-height: 1.75;
  display: block;
  margin-bottom: 32px;
}

// 搜索栏
.search-bar {
  max-width: 600px;
  margin: 0 auto 24px;
  height: 48px;
  background: #FFFFFF;
  border: 1px solid rgba(26, 83, 92, 0.12);
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 16px;
  color: #1A535C;
  background: transparent;
}

// 筛选标签
.filter-chips {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  white-space: nowrap;
}

.filter-chip {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  background: transparent;
  color: rgba(26, 83, 92, 0.65);
  border: 1px solid rgba(26, 83, 92, 0.12);

  &.active {
    background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);
    color: #FFFFFF;
    border: none;
  }

  &:active {
    color: #1A535C;
  }
}

// 资源网格
.resource-grid-section {
  padding: 64px 32px;
}

.resource-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

// 资源卡片
.resource-card {
  background: #FFFFFF;
  border: 1px solid rgba(26, 83, 92, 0.12);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;

  &:active {
    transform: translateY(-2px);
    box-shadow: 0 0 20px rgba(78, 205, 196, 0.25);
  }
}

.card-cover {
  height: 180px;
  position: relative;
}

.cover-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.3;
}

.play-badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content {
  padding: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A535C;
  margin-bottom: 8px;
  display: block;
}

.card-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;

  &.tag-accent {
    background: rgba(255, 107, 107, 0.15);
    color: #FF6B6B;
  }

  &.tag-primary {
    background: rgba(78, 205, 196, 0.12);
    color: #4ECDC4;
  }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.usage-count {
  font-size: 12px;
  color: rgba(26, 83, 92, 0.4);
}

.preview-btn {
  padding: 6px 16px;
  background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #FFFFFF;
  border: none;

  &:active {
    opacity: 0.9;
    transform: translateY(-1px);
  }
}

// 热门资源
.hot-resources-section {
  padding: 64px 32px;
  background: #FFFFFF;
}

.section-title {
  font-size: 32px;
  margin-bottom: 32px;
  display: block;
}

.hot-carousel {
  display: flex;
  gap: 24px;
  padding-bottom: 16px;
  white-space: nowrap;
}

.hot-card {
  width: 280px;
  background: #F7FFF7;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;

  &:active {
    transform: translateY(-2px);
    box-shadow: 0 0 20px rgba(78, 205, 196, 0.25);
  }
}

.hot-cover {
  height: 150px;
  position: relative;
}

.hot-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.3;
}

.hot-content {
  padding: 16px;
}

.hot-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A535C;
  margin-bottom: 8px;
  display: block;
}

.hot-badge {
  padding: 4px 8px;
  background: rgba(255, 107, 107, 0.15);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #FF6B6B;
  display: inline-block;
}

// 底部
.footer {
  padding: 48px 32px 32px;
  background: #1A535C;
  border-top: 1px solid rgba(26, 83, 92, 0.12);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.footer-brand {
  text-align: center;
}

.footer-logo {
  font-size: 18px;
  display: block;
  margin-bottom: 8px;
}

.footer-desc {
  font-size: 12px;
  color: rgba(26, 83, 92, 0.4);
  display: block;
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
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
}

.footer-copyright {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid rgba(26, 83, 92, 0.06);
  text-align: center;
}

.copyright-text {
  font-size: 12px;
  color: rgba(26, 83, 92, 0.4);
}

// AI生成悬浮按钮
.ai-float-btn {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.ai-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 12px 40px rgba(26, 83, 92, 0.15);

  &:active {
    transform: translateY(-2px);
    box-shadow: 0 0 20px rgba(78, 205, 196, 0.25);
  }
}

.ai-btn-text {
  font-size: 12px;
  font-weight: 600;
  color: rgba(26, 83, 92, 0.65);
}

// 响应式布局
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

  .hero-section {
    padding-top: 80px;
    padding-bottom: 40px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .resource-grid-section {
    padding: 40px 16px;
  }

  .resource-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .hot-resources-section {
    padding: 40px 16px;
  }

  .section-title {
    font-size: 22px;
    margin-bottom: 24px;
  }

  .hot-carousel {
    gap: 16px;
  }

  .hot-card {
    width: 240px;
  }

  .footer {
    padding: 32px 16px;
  }

  .footer-links {
    flex-wrap: wrap;
    justify-content: center;
  }

  .ai-float-btn {
    bottom: 24px;
    right: 24px;
  }

  .ai-btn {
    width: 48px;
    height: 48px;
  }
}

@media screen and (min-width: 768px) and (max-width: 1024px) {
  .resource-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>