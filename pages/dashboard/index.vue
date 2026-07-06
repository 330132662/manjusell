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
          <view class="stat-icon" style="back