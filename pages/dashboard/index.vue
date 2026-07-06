<template>
  <view class="dashboard-page">
    <!-- 顶部导航栏 - 手机端显示 -->
    <view class="top-nav-mobile" v-if="isMobile">
      <view class="logo">
        <text class="gradient-text">AI短剧</text>
      </view>
      <uni-icons type="bars" size="24" color="#1A535C" @click="toggleSidebar"></uni-icons>
    </view>

    <!-- 左侧固定导航栏 -->
    <view class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <!-- Logo -->
      <view class="sidebar-logo">
        <text class="gradient-text">AI短剧</text>
      </view>

      <!-- 导航项 -->
      <scroll-view class="sidebar-nav" scroll-y>
        <view class="nav-item active" @click="navigateTo('/pages/dashboard/index')">
          <uni-icons type="home" size="20" color="#4ECDC4"></uni-icons>
          <text class="nav-text">首页</text>
        </view>
        <view class="nav-item" @click="navigateTo('/pages/courses/index')">
          <uni-icons type="book" size="20" color="rgba(255,255,255,0.6)"></uni-icons>
          <text class="nav-text">我的课程</text>
        </view>
        <view class="nav-item" @click="navigateTo('/pages/ai-tools/index')">
          <uni-icons type="hand-up" size="20" color="rgba(255,255,255,0.6)"></uni-icons>
          <text class="nav-text">AI工具</text>
        </view>
        <view class="nav-item" @click="navigateTo('/pages/wallet/index')">
          <uni-icons type="wallet" size="20" color="rgba(255,255,255,0.6)"></uni-icons>
          <text class="nav-text">钱包</text>
        </view>
        <view class="nav-item" @click="navigateTo('/pages/settings/index')">
          <uni-icons type="gear" size="20" color="rgba(255,255,255,0.6)"></uni-icons>
          <text class="nav-text">设置</text>
        </view>
      </scroll-view>

      <!-- 用户信息 -->
      <view class="sidebar-user">
        <view class="user-avatar">
          <text class="avatar-text">张</text>
        </view>
        <view class="user-info">
          <text class="user-name">张小明</text>
          <text class="user-role">学员</text>
        </view>
      </view>
    </view>

    <!-- 主内容区 -->
    <scroll-view class="main-content" scroll-y :scroll-top="scrollTop">
      <!-- 欢迎区域 -->
      <view class="welcome-section">
        <text class="welcome-title">欢迎回来,张小明</text>
        <view class="streak-badge">
          <uni-icons type="fire" size="16" color="#FF6B6B"></uni-icons>
          <text class="streak-text">连续学习 15 天</text>
        </view>
      </view>

      <!-- 统计卡片 -->
      <view class="stats-grid">
        <view class="stat-card">
          <view class="stat-icon" style="background: rgba(78,205,196,0.12);">
            <uni-icons type="checkbox-filled" size="20" color="#4ECDC4"></uni-icons>
          </view>
          <view class="stat-content">
            <text class="stat-number">12</text>
            <text class="stat-label">已完成课时</text>
          </view>
        </view>

        <view class="stat-card">
          <view class="stat-icon" style="background: rgba(78,205,196,0.12);">
            <uni-icons type="clock" size="20" color="#4ECDC4"></uni-icons>
          </view>
          <view class="stat-content">
            <text class="stat-number">48</text>
            <text class="stat-label">学习时长(小时)</text>
          </view>
        </view>

        <view class="stat-card">
          <view class="stat-icon" style="background: rgba(78,205,196,0.12);">
            <uni-icons type="videocam" size="20" color="#4ECDC4"></uni-icons>
          </view>
          <view class="stat-content">
            <text class="stat-number">6</text>
            <text class="stat-label">作品数量(部)</text>
          </view>
        </view>

        <view class="stat-card">
          <view class="stat-icon" style="background: rgba(78,205,196,0.12);">
            <uni-icons type="medal" size="20" color="#4ECDC4"></uni-icons>
          </view>
          <view class="stat-content">
            <text class="stat-number">2</text>
            <text class="stat-label">获得证书(张)</text>
          </view>
        </view>
      </view>

      <!-- 正在学习课程 -->
      <view class="learning-section">
        <text class="section-title">正在学习</text>
        <view class="courses-grid">
          <!-- 课程卡片 1 -->
          <view class="course-card" @click="navigateTo('/pages/course-detail/index?id=1')">
            <view class="course-cover" style="background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);"></view>
            <view class="course-info">
              <text class="course-title">AI剧本创作</text>
              <text class="course-teacher">讲师:张明远</text>
              <!-- 进度环 -->
              <view class="progress-ring">
                <view class="ring-container">
                  <view class="ring-progress" :style="{ '--progress': 75 }">
                    <text class="ring-text">75%</text>
                  </view>
                </view>
                <text class="progress-text">45/60课时</text>
              </view>
              <button class="continue-btn" @click.stop="continueCourse(1)">继续学习</button>
            </view>
          </view>

          <!-- 课程卡片 2 -->
          <view class="course-card" @click="navigateTo('/pages/course-detail/index?id=2')">
            <view class="course-cover" style="background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);"></view>
            <view class="course-info">
              <text class="course-title">数字人表演</text>
              <text class="course-teacher">讲师:张明远</text>
              <view class="progress-ring">
                <view class="ring-container">
                  <view class="ring-progress" :style="{ '--progress': 45 }">
                    <text class="ring-text">45%</text>
                  </view>
                </view>
                <text class="progress-text">27/60课时</text>
              </view>
              <button class="continue-btn" @click.stop="continueCourse(2)">继续学习</button>
            </view>
          </view>

          <!-- 课程卡片 3 -->
          <view class="course-card" @click="navigateTo('/pages/course-detail/index?id=3')">
            <view class="course-cover" style="background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);"></view>
            <view class="course-info">
              <text class="course-title">自动化剪辑</text>
              <text class="course-teacher">讲师:张明远</text>
              <view class="progress-ring">
                <view class="ring-container">
                  <view class="ring-progress" :style="{ '--progress': 20 }">
                    <text class="ring-text">20%</text>
                  </view>
                </view>
                <text class="progress-text">6/30课时</text>
              </view>
              <button class="continue-btn" @click.stop="continueCourse(3)">继续学习</button>
            </view>
          </view>
        </view>
      </view>

      <!-- 每日播放量图表 -->
      <view class="chart-section">
        <text class="section-title">每日播放量</text>
        <view class="chart-container">
          <view class="chart-wrapper">
            <!-- 图表数据展示 -->
            <view class="chart-values">
              <view class="chart-item">
                <text class="chart-label">周一</text>
                <view class="chart-bar" :style="{ height: '50px' }">
                  <text class="chart-value">50</text>
                </view>
              </view>
              <view class="chart-item">
                <text class="chart-label">周二</text>
                <view class="chart-bar" :style="{ height: '82px' }">
                  <text class="chart-value">82</text>
                </view>
              </view>
              <view class="chart-item">
                <text class="chart-label">周三</text>
                <view class="chart-bar" :style="{ height: '65px' }">
                  <text class="chart-value">65</text>
                </view>
              </view>
              <view class="chart-item">
                <text class="chart-label">周四</text>
                <view class="chart-bar" :style="{ height: '120px' }">
                  <text class="chart-value">120</text>
                </view>
              </view>
              <view class="chart-item">
                <text class="chart-label">周五</text>
                <view class="chart-bar" :style="{ height: '140px' }">
                  <text class="chart-value">140</text>
                </view>
              </view>
              <view class="chart-item">
                <text class="chart-label">周六</text>
                <view class="chart-bar" :style="{ height: '165px' }">
                  <text class="chart-value">165</text>
                </view>
              </view>
              <view class="chart-item">
                <text class="chart-label">周日</text>
                <view class="chart-bar" :style="{ height: '185px' }">
                  <text class="chart-value">185</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- AI推荐课程 -->
      <view class="recommend-section">
        <text class="section-title">AI推荐课程</text>
        <view class="recommend-grid">
          <!-- 推荐课程1 -->
          <view class="recommend-card" style="border-left: 3px solid #4ECDC4;">
            <view class="recommend-header">
              <view class="recommend-title-wrap">
                <text class="recommend-title">AI特效制作进阶</text>
                <text class="recommend-desc">学习使用AI工具制作电影级视觉特效,从基础合成到高级粒子系统,全面提升短剧视觉品质。</text>
              </view>
              <view class="recommend-badge">适合你的水平</view>
            </view>
            <view class="recommend-footer">
              <view class="recommend-link" @click="navigateTo('/pages/course-detail/index?id=4')">
                <text class="link-text">查看详情</text>
                <uni-icons type="arrow-right" size="14" color="#4ECDC4"></uni-icons>
              </view>
            </view>
          </view>

          <!-- 推荐课程2 -->
          <view class="recommend-card" style="border-left: 3px solid #FF6B6B;">
            <view class="recommend-header">
              <view class="recommend-title-wrap">
                <text class="recommend-title">短剧运营与分发</text>
                <text class="recommend-desc">掌握短剧内容运营策略,学习多平台分发技巧、数据分析与用户增长方法论。</text>
              </view>
              <view class="recommend-badge">适合你的水平</view>
            </view>
            <view class="recommend-footer">
              <view class="recommend-link" @click="navigateTo('/pages/course-detail/index?id=5')">
                <text class="link-text">查看详情</text>
                <uni-icons type="arrow-right" size="14" color="#4ECDC4"></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 移动端侧边栏遮罩 -->
    <view class="sidebar-mask" v-if="sidebarOpen" @click="toggleSidebar"></view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 响应式数据
const scrollTop = ref(0)
const sidebarOpen = ref(false)

// 设备检测
const isMobile = computed(() => {
  return uni.getSystemInfoSync().windowWidth < 768
})

// 侧边栏切换
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// 导航跳转
const navigateTo = (url) => {
  uni.navigateTo({ url })
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

// 继续学习
const continueCourse = (courseId) => {
  uni.navigateTo({
    url: `/pages/course-detail/index?id=${courseId}&action=continue`
  })
}
</script>

<style lang="scss" scoped>
.dashboard-page {
  display: flex;
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
  font-size: 20px;
  letter-spacing: -0.02em;
}

// 移动端顶部导航
.top-nav-mobile {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #FFFFFF;
  border-bottom: 1px solid rgba(26, 83, 92, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
}

// 左侧导航栏
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 240px;
  background: #1A535C;
  display: flex;
  flex-direction: column;
  z-index: 30;
  transform: translateX(-100%);
  transition: transform 0.3s ease;

  &.sidebar-open {
    transform: translateX(0);
  }
}

.sidebar-logo {
  padding: 24px;
  display: flex;
  align-items: center;
}

.sidebar-nav {
  flex: 1;
  padding: 8px 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  transition: background 0.15s;

  &.active {
    background: rgba(255, 255, 255, 0.1);
    border-left: 3px solid #4ECDC4;

    .nav-text {
      color: rgba(255, 255, 255, 0.9);
    }
  }

  &:not(.active) {
    background: transparent;

    .nav-text {
      color: rgba(255, 255, 255, 0.6);
    }
  }

  &:active {
    background: rgba(255, 255, 255, 0.05);
  }
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-user {
  padding: 20px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #4ECDC4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 14px;
  font-weight: bold;
  color: #FFFFFF;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  display: block;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  display: block;
}

// 主内容区
.main-content {
  flex: 1;
  padding-top: 60px;
}

// 欢迎区域
.welcome-section {
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.welcome-title {
  font-size: 24px;
  font-weight: bold;
  color: #1A535C;
}

.streak-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 107, 107, 0.15);
  border-radius: 20px;
}

.streak-text {
  font-size: 14px;
  font-weight: 600;
  color: #FF6B6B;
}

// 统计卡片
.stats-grid {
  padding: 0 32px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: #FFFFFF;
  border: 1px solid rgba(26, 83, 92, 0.12);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #1A535C;
  display: block;
}

.stat-label {
  font-size: 14px;
  color: rgba(26, 83, 92, 0.65);
  display: block;
}

// 正在学习
.learning-section {
  padding: 0 32px 32px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #1A535C;
  margin-bottom: 16px;
  display: block;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.course-card {
  background: #FFFFFF;
  border: 1px solid rgba(26, 83, 92, 0.12);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.15s;

  &:active {
    transform: translateY(-2px);
  }
}

.course-cover {
  height: 112px;
  width: 100%;
}

.course-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.course-title {
  font-size: 14px;
  font-weight: 600;
  color: #1A535C;
  margin-bottom: 2px;
}

.course-teacher {
  font-size: 12px;
  color: rgba(26, 83, 92, 0.4);
  margin-bottom: 16px;
}

// 进度环
.progress-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
}

.ring-container {
  width: 64px;
  height: 64px;
  position: relative;
}

.ring-progress {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    #4ECDC4 calc(var(--progress) * 1%),
    rgba(26, 83, 92, 0.08) calc(var(--progress) * 1%)
  );
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #FFFFFF;
  }
}

.ring-text {
  position: relative;
  z-index: 1;
  font-size: 12px;
  font-weight: bold;
  color: #4ECDC4;
}

.progress-text {
  font-size: 12px;
  color: rgba(26, 83, 92, 0.65);
  margin-bottom: 12px;
}

.continue-btn {
  padding: 6px 16px;
  background: #1A535C;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  border: none;

  &:active {
    opacity: 0.9;
  }
}

// 图表区域
.chart-section {
  padding: 0 32px 32px;
}

.chart-container {
  background: #FFFFFF;
  border: 1px solid rgba(26, 83, 92, 0.12);
  border-radius: 8px;
  padding: 24px;
}

.chart-wrapper {
  height: 200px;
  position: relative;
}

.chart-values {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
  padding-bottom: 30px;
}

.chart-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

.chart-label {
  position: absolute;
  bottom: 0;
  font-size: 11px;
  color: rgba(26, 83, 92, 0.4);
}

.chart-bar {
  width: 32px;
  background: linear-gradient(to top, #4ECDC4, rgba(78, 205, 196, 0.3));
  border-radius: 4px 4px 0 0;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.chart-value {
  position: absolute;
  top: -20px;
  font-size: 10px;
  color: rgba(26, 83, 92, 0.65);
  font-weight: 500;
}

// AI推荐
.recommend-section {
  padding: 0 32px 40px;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.recommend-card {
  background: #FFFFFF;
  border: 1px solid rgba(26, 83, 92, 0.12);
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.15s;

  &:active {
    transform: translateY(-2px);
  }
}

.recommend-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.recommend-title-wrap {
  flex: 1;
}

.recommend-title {
  font-size: 14px;
  font-weight: 600;
  color: #1A535C;
  margin-bottom: 4px;
  display: block;
}

.recommend-desc {
  font-size: 12px;
  color: rgba(26, 83, 92, 0.65);
  line-height: 1.6;
  display: block;
}

.recommend-badge {
  padding: 4px 8px;
  background: rgba(78, 205, 196, 0.1);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #4ECDC4;
  white-space: nowrap;
}

.recommend-footer {
  margin-top: 12px;
}

.recommend-link {
  display: flex;
  align-items: center;
  gap: 4px;

  &:active {
    opacity: 0.8;
  }
}

.link-text {
  font-size: 14px;
  font-weight: 500;
  color: #4ECDC4;
}

// 移动端遮罩
.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 20;
}

// 响应式布局
@media screen and (min-width: 768px) {
  .sidebar {
    transform: translateX(0);
  }

  .main-content {
    padding-top: 0;
    margin-left: 240px;
  }

  .top-nav-mobile {
    display: none;
  }

  .sidebar-mask {
    display: none;
  }
}

@media screen and (max-width: 767px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .courses-grid {
    grid-template-columns: 1fr;
  }

  .recommend-grid {
    grid-template-columns: 1fr;
  }

  .welcome-section {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
  }

  .learning-section,
  .chart-section,
  .recommend-section {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>