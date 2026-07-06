<template>
	<view class="home-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="navbar-inner">
				<text class="logo-text">AI短剧学院</text>
				<view class="nav-links">
					<text class="nav-link" @click="scrollToSection('features')">课程体系</text>
					<text class="nav-link" @click="scrollToSection('cases')">学员案例</text>
					<text class="nav-link" @click="scrollToSection('pricing')">课程定价</text>
				</view>
				<view class="cta-btn" @click="handleEnroll">
					<text class="cta-btn-text">立即报名</text>
				</view>
			</view>
		</view>

		<!-- Hero区域 -->
		<view class="hero-section">
			<image class="hero-bg" src="/static/assets/image_0_yi19x4.jpg" mode="aspectFill"></image>
			<view class="hero-overlay"></view>
			<view class="hero-content">
				<view class="badge">
					<text class="badge-text">2026全新升级</text>
				</view>
				<text class="hero-title">用AI创作爆款短剧</text>
				<text class="hero-subtitle">从零开始掌握Sora、Pika、剪映等AI工具,30天成为短剧创作者</text>
				<view class="stats-row">
					<view class="stat-item">
						<text class="stat-number">30,000+</text>
						<text class="stat-label">学员</text>
					</view>
					<view class="dot"></view>
					<view class="stat-item">
						<text class="stat-number">200+</text>
						<text class="stat-label">课时</text>
					</view>
					<view class="dot"></view>
					<view class="stat-item">
						<text class="stat-number">98%</text>
						<text class="stat-label">好评率</text>
					</view>
				</view>
				<view class="cta-group">
					<view class="primary-btn" @click="handleFreeTrial">
						<text class="btn-text">免费试听</text>
					</view>
					<view class="outline-btn" @click="handleViewOutline">
						<text class="outline-btn-text">查看课程大纲</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 特色卡片区 -->
		<scroll-view id="features" class="features-section" scroll-y="true">
			<view class="section-inner">
				<text class="section-title">AI赋能,高效创作</text>
				<view class="divider"></view>
				<view class="features-grid">
					<!-- 卡片1: AI剧本创作 -->
					<view class="feature-card glass-card" @click="handleCardClick('script