<template>
  <view class="detail-page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-content">
        <view class="logo">
          <TopTitle />
        </view>
        <scroll-view class="nav-links" scroll-x v-if="!isMobile">
          <view class="nav-link">课程体系</view>
          <view class="nav-link active">资源库</view>
          <view class="nav-link">AI工具</view>
          <view class="nav-link">学员案例</view>
          <view class="nav-link">课程定价</view>
        </scroll-view>
        <view class="nav-action">
          <button class="enroll-btn">立即报名</button>
        </view>
      </view>
    </view>

    <!-- 面包屑导航 -->
    <view class="breadcrumb">
      <text class="breadcrumb-link" @click="navigateToHome">首页</text>
      <uni-icons type="arrow-right" size="14" color="rgba(26, 83, 92, 0.4)"></uni-icons>
      <text class="breadcrumb-link" @click="navigateToResource">资源库</text>
      <uni-icons type="arrow-right" size="14" color="rgba(26, 83, 92, 0.4)"></uni-icons>
      <text class="breadcrumb-current">赛博朋克城市追逐</text>
    </view>

    <!-- 主要内容区 -->
    <scroll-view class="main-content" scroll-y>
      <view class="content-wrapper">
        <!-- 左侧 - 剧本预览区(60%) -->
        <view class="preview-panel">
          <!-- 标签栏 -->
          <view class="tab-bar">
            <button class="tab-btn active">剧本内容</button>
            <button class="tab-btn">视频预览</button>
            <button class="tab-btn">AI朗读</button>
          </view>

          <!-- 预览区域 -->
          <view class="preview-area">
            <!-- 网格背景 -->
            <view class="grid-overlay"></view>

            <!-- 剧本内容 -->
            <view class="script-content">
              <view class="scene-heading">场景 3 — 霓虹巷道追逐</view>

              <view class="scene-desc">
                <text class="desc-text">内景 / 外景 — 霓虹巷道 / 夜</text>
                <text class="desc-text">雨水从生锈的管道滴落,霓虹灯在积水中投射出斑斓的倒影。远处传来警报声和无人机嗡鸣。KIRA在巷道深处奔跑,身后追兵的机械脚步声越来越近。</text>
              </view>

              <!-- 对话1 -->
              <view class="dialogue-block">
                <view class="character-name" style="color: #4ECDC4;">KIRA</view>
                <view class="dialogue-text">
                  <text class="dialogue-border"></text>
                  <text class="dialogue-content">(低声自语) 接口还有三十秒就加密完成……不能在这里停下。</text>
                </view>
              </view>

              <!-- 对话2 -->
              <view class="dialogue-block">
                <view class="character-name" style="color: #FF6B6B;">追兵队长</view>
                <view class="dialogue-text">
                  <text class="dialogue-border"></text>
                  <text class="dialogue-content">(通讯频道) 所有单位注意,目标已进入C-7区域。启动电磁干扰,封锁所有出口。</text>
                </view>
              </view>

              <!-- 对话3 -->
              <view class="dialogue-block">
                <view class="character-name" style="color: #4ECDC4;">KIRA</view>
                <view class="dialogue-text">
                  <text class="dialogue-border"></text>
                  <text class="dialogue-content">(转身面向墙壁,手指快速在腕部终端上滑动)\n就赌这个旧线路还没被监控。</text>
                </view>
              </view>

              <!-- 动作描述 -->
              <view class="action-block">
                <text class="action-text">KIRA跃上垃圾桶,攀住消防梯,身体消失在雨幕之中。一道蓝色电弧在巷道口炸开,追兵的脚步声戛然而止。</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 右侧 - 资源元数据(40%) -->
        <view class="metadata-panel">
          <!-- 元数据卡片 -->
          <view class="metadata-card">
            <text class="resource-title">赛博朋克城市追逐</text>

            <!-- 分类标签 -->
            <view class="category-badge">
              <text class="badge-text">AI剧本 · 科幻</text>
            </view>

            <!-- 难度 -->
            <view class="difficulty-section">
              <text class="difficulty-label">难度</text>
              <view class="difficulty-levels">
                <view class="level-dot filled"></view>
                <view class="level-dot filled"></view>
                <view class="level-dot empty"></view>
              </view>
              <text class="difficulty-text">中级</text>
            </view>

            <!-- 分隔线 -->
            <view class="divider"></view>

            <!-- 元数据网格 -->
            <view class="metadata-grid">
              <view class="metadata-item">
                <text class="meta-label">文件大小</text>
                <text class="meta-value">2.4 MB</text>
              </view>
              <view class="metadata-item">
                <text class="meta-label">格式</text>
                <text class="meta-value">.docx + .pdf</text>
              </view>
              <view class="metadata-item">
                <text class="meta-label">评分</text>
                <view class="rating-wrapper">
                  <uni-icons type="star-filled" size="14" color="#FF6B6B"></uni-icons>
                  <text class="rating-value">4.9/5</text>
                </view>
              </view>
              <view class="metadata-item">
                <text class="meta-label">使用次数</text>
                <text class="meta-value">500+ 部短剧</text>
              </view>
            </view>

            <!-- 分隔线 -->
            <view class="divider"></view>

            <!-- 操作按钮 -->
            <view class="action-buttons">
              <button class="primary-btn">加入素材库</button>
              <button class="secondary-btn">
                <uni-icons type="download" size="16" color="#1A535C"></uni-icons>
                <text class="btn-text">下载资源</text>
              </button>
            </view>
          </view>

          <!-- 信任元素卡片 -->
          <view class="trust-card">
            <view class="trust-item">
              <view class="trust-icon" style="background: rgba(255, 107, 107, 0.15);">
                <uni-icons type="checkbox-filled" size="16" color="#FF6B6B"></uni-icons>
              </view>
              <view class="trust-content">
                <text class="trust-title">AI专家创作</text>
                <text class="trust-desc">经过专业编剧审核校对</text>
              </view>
            </view>

            <view class="trust-item">
              <view class="trust-icon" style="background: linear-gradient(135deg, rgba(26, 83, 92, 0.04) 0%, rgba(78, 205, 196, 0.02) 100%);">
                <uni-icons type="person-filled" size="16" color="#4ECDC4"></uni-icons>
              </view>
              <view class="trust-content">
                <text class="trust-title">已有 1,234 位创作者使用</text>
                <text class="trust-desc">过去30天新增 89 位</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 相关推荐 -->
      <view class="related-section">
        <text class="related-title">相关推荐</text>
        <scroll-view class="related-carousel" scroll-x>
          <!-- 相关卡片 1 -->
          <view class="related-card" @click="navigateToDetail(101)">
            <view class="related-cover" style="background: linear-gradient(135deg, #14464D 0%, #4ECDC4 100%);">
              <uni-icons type="paperclip" size="16" color="rgba(255,255,255,0.4)"></uni-icons>
            </view>
            <view class="related-info">
              <text class="related-name">废墟黎明</text>
              <text class="related-tag">AI剧本 · 末日</text>
            </view>
          </view>

          <!-- 相关卡片 2 -->
          <view class="related-card" @click="navigateToDetail(102)">
            <view class="related-cover" style="background: linear-gradient(135deg, #1A535C 0%, #2a7f8a 100%);">
              <uni-icons type="videocam" size="16" color="rgba(255,255,255,0.4)"></uni-icons>
            </view>
            <view class="related-info">
              <text class="related-name">时间旅行者手记</text>
              <text class="related-tag">AI剧本 · 悬疑</text>
            </view>
          </view>

          <!-- 相关卡片 3 -->
          <view class="related-card" @click="navigateToDetail(103)">
            <view class="related-cover" style="background: linear-gradient(135deg, #0d3b3f 0%, #4ECDC4 100%);">
              <uni-icons type="film" size="16" color="rgba(255,255,255,0.4)"></uni-icons>
            </view>
            <view class="related-info">
              <text class="related-name">虚拟恋人第一季</text>
              <text class="related-tag">AI剧本 · 爱情</text>
            </view>
          </view>

          <!-- 相关卡片 4 -->
          <view class="related-card" @click="navigateToDetail(104)">
            <view class="related-cover" style="background: linear-gradient(135deg, #1A535C 0%, #6ee7de 100%);">
              <uni-icons type="star-filled" size="16" color="rgba(255,255,255,0.4)"></uni-icons>
            </view>
            <view class="related-info">
              <text class="related-name">暗网追凶</text>
              <text class="related-tag">AI剧本 · 犯罪</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </scroll-view>

    <!-- 底部 -->
    <view class="footer">
      <view class="footer-content">
        <view class="footer-brand">
          <text class="gradient-text footer-logo">AI短剧学院</text>
          <text class="footer-desc">让每个人都能创作爆款短剧</text>
        </view>
        <view class="footer-links">
          <text class="footer-link">课程体系</text>
          <text class="footer-link">AI工具</text>
          <text class="footer-link">学员案例</text>
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
        <text class="copyright-text">© 2025 AI短剧学院. All rights reserved.</text>
      </view>
    </view>
  </view>
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