<template>
	<view class="home-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="navbar-inner">
				<TopTitle />
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
					<view class="feature-card glass-card" @click="handleCardClick('script')">
						<view class="card-icon-wrapper">
							<uni-icons type="hand-up" size="28" color="#FF6B6B"></uni-icons>
						</view>
						<text class="card-title">AI剧本创作</text>
						<text class="card-desc">基于大语言模型,自动生成短剧剧本、分镜脚本和对话,大幅提升创意产出效率</text>
					</view>

					<!-- 卡片2: 数字人表演 -->
					<view class="feature-card glass-card" @click="handleCardClick('actor')">
						<view class="card-icon-wrapper">
							<uni-icons type="person" size="28" color="#FF6B6B"></uni-icons>
						</view>
						<text class="card-title">数字人表演</text>
						<text class="card-desc">AI驱动的数字人技术,无需真人演员即可生成逼真的角色表演和口播内容</text>
					</view>

					<!-- 卡片3: 一键分发 -->
					<view class="feature-card glass-card" @click="handleCardClick('publish')">
						<view class="card-icon-wrapper">
							<uni-icons type="redo" size="28" color="#FF6B6B"></uni-icons>
						</view>
						<text class="card-title">一键分发</text>
						<text class="card-desc">批量发布到抖音、快手、视频号等主流平台,自动适配格式与封面</text>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 学员案例区 -->
		<scroll-view id="cases" class="cases-section" scroll-y="true">
			<view class="section-inner">
				<text class="section-title">真实学员成果</text>
				<view class="divider"></view>
				<scroll-view class="cases-scroll" scroll-x="true" show-scrollbar="false">
					<view class="cases-list">
						<!-- 案例1 -->
						<view class="case-card glass-card">
							<image class="case-image" src="/static/assets/image_1_yi19x4.jpg" mode="aspectFill"></image>
							<view class="case-overlay"></view>
							<view class="case-info">
								<text class="case-title">影视制作实战班</text>
								<view class="case-meta">
									<text class="case-author">张明宇</text>
									<view class="case-badge">
										<text class="case-badge-text">百万播放</text>
									</view>
								</view>
							</view>
						</view>

						<!-- 案例2 -->
						<view class="case-card glass-card">
							<image class="case-image" src="/static/assets/image_2_yi19x4.jpg" mode="aspectFill"></image>
							<view class="case-overlay"></view>
							<view class="case-info">
								<text class="case-title">数字人表演高级班</text>
								<view class="case-meta">
									<text class="case-author">李思琪</text>
									<view class="case-badge">
										<text class="case-badge-text">签约创作</text>
									</view>
								</view>
							</view>
						</view>

						<!-- 案例3 -->
						<view class="case-card glass-card">
							<image class="case-image" src="/static/assets/image_3_yi19x4.jpg" mode="aspectFill"></image>
							<view class="case-overlay"></view>
							<view class="case-info">
								<text class="case-title">AI短剧全流程班</text>
								<view class="case-meta">
									<text class="case-author">王浩然</text>
									<view class="case-badge">
										<text class="case-badge-text">月入过万</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>

				<!-- 社会认证 -->
				<view class="trust-section">
					<view class="avatar-group">
						<view class="avatar-item primary-avatar">张</view>
						<view class="avatar-item light-avatar">李</view>
						<view class="avatar-item accent-avatar">王</view>
						<view class="avatar-item dark-avatar">赵</view>
						<view class="avatar-item plus-avatar">+</view>
					</view>
					<text class="trust-text">已有 <text class="trust-number">30,000+</text> 创作者加入</text>
				</view>
			</view>
		</scroll-view>

		<!-- CTA区域 -->
		<view id="cta" class="cta-section">
			<view class="cta-bg-accent"></view>
			<view class="cta-bg-accent-bottom"></view>
			<view class="cta-inner">
				<text class="cta-title">开启AI短剧创作之旅</text>
				<text class="cta-desc">限时优惠报名中,首月仅需9.9元,立即锁定早鸟名额</text>
				<view class="cta-primary-btn" @click="handleEnroll">
					<text class="cta-primary-btn-text">立即报名,限时优惠</text>
				</view>
			</view>
		</view>

		<!-- 底部栏 -->
		<view class="footer">
			<view class="footer-inner">
				<view class="footer-brand">
					<text class="footer-logo">AI短剧学院</text>
					<text class="footer-tagline">让每个人都能成为短剧创作者</text>
				</view>
				<view class="footer-links">
					<text class="footer-link" @click="scrollToSection('features')">课程体系</text>
					<text class="footer-link" @click="scrollToSection('cases')">学员案例</text>
					<text class="footer-link" @click="scrollToSection('pricing')">课程定价</text>
					<text class="footer-link">关于我们</text>
				</view>
				<view class="footer-social">
					<uni-icons type="chatbubble" size="24" color="#rgba(26, 83, 92, 0.4)"></uni-icons>
					<uni-icons type="email" size="24" color="#rgba(26, 83, 92, 0.4)"></uni-icons>
					<uni-icons type="videocam" size="24" color="#rgba(26, 83, 92, 0.4)"></uni-icons>
				</view>
			</view>
			<view class="footer-bottom">
				<text class="copyright">© 2026 AI短剧学院. 保留所有权利.</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import TopTitle from '@/components/TopTitle.vue'

const scrollToSection = (sectionId) => {
	// 使用uni-app的scrollIntoView功能
	// 实际项目中需要通过pageScrollTo实现
	uni.showToast({
		title: '滚动到' + sectionId,
		icon: 'none'
	})
}

const handleEnroll = () => {
	uni.navigateTo({
		url: '/pages/payment/index'
	})
}

const handleFreeTrial = () => {
	uni.navigateTo({
		url: '/pages/course-detail/index'
	})
}

const handleViewOutline = () => {
	uni.navigateTo({
		url: '/pages/course-detail/index'
	})
}

const handleCardClick = (type) => {
	uni.showToast({
		title: '查看' + type + '详情',
		icon: 'none'
	})
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.home-container {
	width: 100%;
	min-height: 100vh;
	background: $color-bg-surface;
}

/* 导航栏 */
.navbar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 999;
	background: $color-bg-deep;
	border-bottom: 1px solid $color-border;
	height: 72px;
}

.navbar-inner {
	max-width: 750px;
	margin: 0 auto;
	padding: 0 32rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 100%;
}

.logo-text {
	font-size: 32rpx;
	font-weight: bold;
	background: $gradient-primary;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	font-family: $font-display;
	letter-spacing: -0.02em;
}

.nav-links {
	display: flex;
	align-items: center;
	gap: 48rpx;
}

.nav-link {
	font-size: 28rpx;
	font-weight: 500;
	color: $color-text-secondary;
	transition: color 0.15s;
	
	&:active {
		color: $color-text-primary;
	}
}

.cta-btn {
	padding: 20rpx 48rpx;
	background: $gradient-primary;
	border-radius: $radius-md;
	
	.cta-btn-text {
		font-size: 28rpx;
		font-weight: 600;
		color: $color-bg-elevated;
	}
}

/* Hero区域 */
.hero-section {
	position: relative;
	width: 100%;
	height: 100vh;
	overflow: hidden;
}

.hero-bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.hero-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(180deg, rgba(11,19,43,0.7) 0%, rgba(11,19,43,0.85) 50%, rgba(11,19,43,1) 100%);
}

.hero-content {
	position: relative;
	z-index: 10;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 160rpx 48rpx;
	height: 100%;
}

.badge {
	padding: 12rpx 32rpx;
	background: $gradient-accent;
	border-radius: $radius-full;
	margin-bottom: 32rpx;
	
	.badge-text {
		font-size: 28rpx;
		font-weight: 600;
		color: $color-primary;
	}
}

.hero-title {
	font-size: 72rpx;
	font-weight: 800;
	line-height: 1.1;
	letter-spacing: -0.03em;
	background: $gradient-primary;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	margin-bottom: 24rpx;
	text-align: center;
	word-break: keep-all;
}

.hero-subtitle {
	font-size: 32rpx;
	line-height: 1.75;
	color: $color-text-secondary;
	text-align: center;
	margin-bottom: 40rpx;
	max-width: 800rpx;
}

.stats-row {
	display: flex;
	align-items: center;
	gap: 24rpx;
	margin-bottom: 40rpx;
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.stat-number {
	font-size: 48rpx;
	font-weight: bold;
	color: $color-text-primary;
	font-family: $font-display;
}

.stat-label {
	font-size: 28rpx;
	color: $color-text-muted;
}

.dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: $color-accent;
	box-shadow: 0 0 16rpx $color-accent-glow;
}

.cta-group {
	display: flex;
	gap: 32rpx;
}

.primary-btn {
	padding: 28rpx 64rpx;
	background: $gradient-primary;
	border-radius: $radius-md;
	
	.btn-text {
		font-size: 32rpx;
		font-weight: 600;
		color: $color-bg-elevated;
	}
}

.outline-btn {
	padding: 28rpx 64rpx;
	border: 1px solid $color-border;
	border-radius: $radius-md;
	
	.outline-btn-text {
		font-size: 32rpx;
		font-weight: 500;
		color: $color-text-secondary;
	}
}

/* 特色卡片区 */
.features-section {
	padding: 80rpx 48rpx;
	background: $color-bg-deep;
}

.section-inner {
	max-width: 750px;
	margin: 0 auto;
}

.section-title {
	font-size: 48rpx;
	font-weight: 700;
	line-height: 1.2;
	letter-spacing: -0.02em;
	background: $gradient-primary;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	text-align: center;
	margin-bottom: 16rpx;
	word-break: keep-all;
}

.divider {
	width: 96rpx;
	height: 6rpx;
	background: $gradient-primary;
	border-radius: $radius-full;
	margin: 16rpx auto 64rpx auto;
}

.features-grid {
	display: grid;
	grid-template-columns: repeat(1, 1fr);
	gap: 32rpx;
	
	/* 平板适配 */
	@media (min-width: 768px) {
		grid-template-columns: repeat(3, 1fr);
		gap: 48rpx;
	}
}

.feature-card {
	background: $glass-bg;
	backdrop-filter: blur($glass-blur);
	-webkit-backdrop-filter: blur($glass-blur);
	border: 1px solid $glass-border;
	border-radius: $radius-lg;
	padding: 48rpx;
	transition: transform 0.3s, box-shadow 0.3s;
	
	&:active {
		box-shadow: $glow-primary;
		transform: translateY(-4rpx);
	}
}

.card-icon-wrapper {
	width: 96rpx;
	height: 96rpx;
	border-radius: $radius-lg;
	display: flex;
	align-items: center;
	justify-content: center;
	background: $color-accent-muted;
	margin-bottom: 32rpx;
}

.card-title {
	font-size: 32rpx;
	font-weight: 600;
	color: $color-text-primary;
	margin-bottom: 16rpx;
}

.card-desc {
	font-size: 28rpx;
	line-height: 1.6;
	color: $color-text-secondary;
}

/* 学员案例区 */
.cases-section {
	padding: 80rpx 48rpx;
	background: $color-bg-surface;
}

.cases-scroll {
	white-space: nowrap;
}

.cases-list {
	display: inline-flex;
	gap: 32rpx;
	padding-bottom: 16rpx;
}

.case-card {
	position: relative;
	width: 680rpx;
	height: 440rpx;
	border-radius: $radius-lg;
	overflow: hidden;
	background: $glass-bg;
	border: 1px solid $glass-border;
	flex-shrink: 0;
	
	.case-image {
		width: 100%;
		height: 100%;
	}
	
	.case-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(0deg, rgba(11,19,43,0.8) 0%, transparent 60%);
	}
	
	.case-info {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 32rpx;
	}
	
	.case-title {
		font-size: 28rpx;
		font-weight: 600;
		color: $color-text-primary;
	}
	
	.case-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 16rpx;
	}
	
	.case-author {
		font-size: 24rpx;
		color: $color-text-secondary;
	}
	
	.case-badge {
		padding: 8rpx 16rpx;
		background: $color-accent-muted;
		border-radius: $radius-md;
		
		.case-badge-text {
			font-size: 24rpx;
			font-weight: 600;
			color: $color-accent;
		}
	}
}

.trust-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
	margin-top: 48rpx;
}

.avatar-group {
	display: flex;
	align-items: center;
	margin-left: -16rpx;
}

.avatar-item {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	font-weight: bold;
	border: 4rpx solid $color-bg-surface;
	flex-shrink: 0;
}

.primary-avatar {
	background: $color-primary;
	color: $color-text-primary;
}

.light-avatar {
	background: $color-primary-light;
	color: $color-text-primary;
}

.accent-avatar {
	background: $color-accent-muted;
	color: $color-accent;
}

.dark-avatar {
	background: $color-primary-dark;
	color: $color-text-primary;
}

.plus-avatar {
	background: $color-bg-elevated;
	color: $color-text-muted;
}

.trust-text {
	font-size: 28rpx;
	color: $color-text-muted;
}

.trust-number {
	font-weight: 600;
	color: $color-text-secondary;
}

/* CTA区域 */
.cta-section {
	position: relative;
	padding: 80rpx 48rpx;
	background: $color-bg-elevated;
	overflow: hidden;
}

.cta-bg-accent {
	position: absolute;
	top: 0;
	left: 0;
	width: 768rpx;
	height: 768rpx;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%);
	filter: blur(160rpx);
	pointer-events: none;
}

.cta-bg-accent-bottom {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 768rpx;
	height: 768rpx;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(0,242,254,0.1) 0%, transparent 70%);
	filter: blur(160rpx);
	pointer-events: none;
}

.cta-inner {
	position: relative;
	z-index: 10;
	max-width: 600rpx;
	margin: 0 auto;
	text-align: center;
}

.cta-title {
	font-size: 48rpx;
	font-weight: 700;
	line-height: 1.2;
	letter-spacing: -0.02em;
	background: $gradient-primary;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	margin-bottom: 24rpx;
	word-break: keep-all;
}

.cta-desc {
	font-size: 32rpx;
	line-height: 1.75;
	color: $color-text-secondary;
	margin-bottom: 40rpx;
}

.cta-primary-btn {
	padding: 32rpx 80rpx;
	background: $gradient-primary;
	border-radius: $radius-md;
	
	.cta-primary-btn-text {
		font-size: 32rpx;
		font-weight: 600;
		color: $color-bg-elevated;
	}
}

/* 底部栏 */
.footer {
	padding: 64rpx 48rpx;
	background: $color-bg-deep;
	border-top: 1px solid $color-border;
}

.footer-inner {
	max-width: 750px;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 32rpx;
}

.footer-brand {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.footer-logo {
	font-size: 36rpx;
	font-weight: bold;
	background: $gradient-primary;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.footer-tagline {
	font-size: 24rpx;
	color: $color-text-muted;
}

.footer-links {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 32rpx;
	flex-wrap: wrap;
}

.footer-link {
	font-size: 28rpx;
	color: $color-text-muted;
	transition: color 0.15s;
	
	&:active {
		color: $color-text-primary;
	}
}

.footer-social {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 32rpx;
}

.footer-bottom {
	margin-top: 32rpx;
	padding-top: 32rpx;
	border-top: 1px solid $color-border-light;
	text-align: center;
}

.copyright {
	font-size: 24rpx;
	color: $color-text-muted;
}
</style>