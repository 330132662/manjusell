<template>
	<view class="course-detail-container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="navbar-inner">
				<TopTitle />
				<view class="nav-links">
					<text class="nav-link">课程体系</text>
					<text class="nav-link">AI工具</text>
					<text class="nav-link">学员案例</text>
					<text class="nav-link">课程定价</text>
				</view>
				<view class="nav-cta-btn" @click="handlePayment">
					<text class="nav-cta-text">立即报名</text>
				</view>
			</view>
		</view>

		<!-- 课程进度条 -->
		<view class="progress-bar-wrapper">
			<view class="progress-bar">
				<view class="progress-fill" :style="{ width: courseProgress + '%' }"></view>
			</view>
		</view>

		<!-- 主要内容区 -->
		<scroll-view class="main-content" scroll-y="true">
			<!-- 分屏布局 - 视频播放器+课程标题 -->
			<view class="split-layout">
				<view class="left-panel">
					<!-- 视频播放器 -->
					<view class="video-player" @click="handlePlayVideo">
						<image class="video-cover" src="/static/assets/image_4_yi19x4.jpg" mode="aspectFill"></image>
						<!-- 播放按钮 -->
						<view class="play-button-overlay">
							<view class="play-button">
								<uni-icons type="play-filled" size="32" color="#FFFFFF"></uni-icons>
							</view>
						</view>
						<!-- 浮动章节列表 -->
						<view class="chapter-overlay">
							<view class="chapter-badge playing-badge">
								<text class="badge-text">正在播放</text>
							</view>
							<view class="chapter-badge">
								<text class="badge-text">第一章 第3节</text>
							</view>
							<view class="chapter-badge time-badge">
								<text class="badge-text">2:34 / 12:18</text>
							</view>
						</view>
					</view>

					<!-- 课程标题 -->
					<view class="course-title-section">
						<text class="course-main-title">从0到1万粉</text>
						<text class="course-sub-title">AI短剧创作大师课</text>
					</view>
				</view>

				<!-- 右侧面板 - 统计+CTA+价格 -->
				<view class="right-panel">
					<!-- 课程统计栏 -->
					<view class="course-stats glass-card">
						<view class="stat-row">
							<uni-icons type="person-filled" size="16" color="#FF6B6B"></uni-icons>
							<text class="stat-info">12,847 已报名</text>
						</view>
						<view class="stat-row">
							<uni-icons type="star-filled" size="16" color="#FF6B6B"></uni-icons>
							<text class="stat-info">评分 4.9/5</text>
						</view>
						<view class="stat-row">
							<uni-icons type="clock" size="16" color="#FF6B6B"></uni-icons>
							<text class="stat-info">200+ 课时</text>
						</view>
					</view>

					<!-- 购买CTA+价格 -->
					<view class="buy-cta glass-card">
						<!-- 价格显示 -->
						<view class="price-display">
							<text class="current-price">¥1,299</text>
							<text class="original-price">¥2,999</text>
						</view>
						<text class="discount-note">限时优惠 — 节省 ¥1,700</text>
						<!-- CTA按钮 -->
						<view class="buy-button" @click="handlePayment">
							<text class="buy-button-text">立即购买 — 30天无忧退款</text>
						</view>
						<text class="payment-methods-note">支持支付宝 / 微信支付 / 信用卡</text>
					</view>
				</view>
			</view>

			<!-- 讲师介绍 -->
			<view class="instructor-section">
				<view class="instructor-card glass-card">
					<image class="instructor-avatar" src="/static/assets/image_5_yi19x4.jpg" mode="aspectFill"></image>
					<view class="instructor-info">
						<view class="instructor-header">
							<text class="instructor-name">张明远</text>
							<view class="verified-badge">
								<text class="verified-text">认证专家</text>
							</view>
						</view>
						<text class="instructor-title">资深AI影视制作人</text>
						<text class="instructor-desc">10年影视行业经验,曾参与多部爆款短剧制作。AI短剧创作先行者,累计学员超过30,000人。</text>
						<!-- 讲师统计 -->
						<view class="instructor-stats">
							<view class="stat-block">
								<text class="stat-value">10年</text>
								<text class="stat-unit">经验</text>
							</view>
							<view class="divider-vertical"></view>
							<view class="stat-block">
								<text class="stat-value">30,000+</text>
								<text class="stat-unit">学员</text>
							</view>
							<view class="divider-vertical"></view>
							<view class="stat-block">
								<text class="stat-value">100+</text>
								<text class="stat-unit">作品</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 课程大纲 -->
			<view class="curriculum-section">
				<text class="section-title">课程大纲</text>
				<view class="chapter-list">
					<!-- 第一章 -->
					<view class="chapter-card glass-card" @click="toggleChapter(1)">
						<view class="chapter-header">
							<view class="chapter-number">01</view>
							<view class="chapter-info">
								<text class="chapter-title">第一章:AI模型微调</text>
								<text class="chapter-lessons">12课时</text>
							</view>
							<uni-icons :type="expandedChapters.includes(1) ? 'down' : 'right'" size="20" color="#rgba(26, 83, 92, 0.4)"></uni-icons>
						</view>
						<view class="chapter-content" v-if="expandedChapters.includes(1)">
							<text class="chapter-desc">掌握Sora、Pika等AI视频生成模型的核心参数,学会微调出符合短剧风格的角色和场景</text>
						</view>
					</view>

					<!-- 第二章 -->
					<view class="chapter-card glass-card" @click="toggleChapter(2)">
						<view class="chapter-header">
							<view class="chapter-number">02</view>
							<view class="chapter-info">
								<text class="chapter-title">第二章:角色一致性</text>
								<text class="chapter-lessons">15课时</text>
							</view>
							<uni-icons :type="expandedChapters.includes(2) ? 'down' : 'right'" size="20" color="#rgba(26, 83, 92, 0.4)"></uni-icons>
						</view>
						<view class="chapter-content" v-if="expandedChapters.includes(2)">
							<text class="chapter-desc">解决AI生成视频中角色面部一致性的核心难题,实现多场景连续拍摄</text>
						</view>
					</view>

					<!-- 第三章 -->
					<view class="chapter-card glass-card" @click="toggleChapter(3)">
						<view class="chapter-header">
							<view class="chapter-number">03</view>
							<view class="chapter-info">
								<text class="chapter-title">第三章:自动化剪辑</text>
								<text class="chapter-lessons">10课时</text>
							</view>
							<uni-icons :type="expandedChapters.includes(3) ? 'down' : 'right'" size="20" color="#rgba(26, 83, 92, 0.4)"></uni-icons>
						</view>
						<view class="chapter-content" v-if="expandedChapters.includes(3)">
							<text class="chapter-desc">使用剪映AI功能实现一键剪辑,自动匹配音乐、字幕和特效,大幅提升创作效率</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 学员评价 -->
			<view class="testimonials-section">
				<text class="section-title">学员评价</text>
				<view class="testimonial-grid">
					<!-- 评价1 -->
					<view class="testimonial-card glass-card">
						<view class="testimonial-header">
							<view class="testimonial-avatar">李</view>
							<view class="testimonial-meta">
								<text class="testimonial-name">李晓婷</text>
								<view class="star-rating">
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
								</view>
							</view>
						</view>
						<text class="testimonial-text">跟着张老师的课从零开始,两个月我的账号粉丝就破万了,课程内容非常实用。</text>
					</view>

					<!-- 评价2 -->
					<view class="testimonial-card glass-card">
						<view class="testimonial-header">
							<view class="testimonial-avatar">王</view>
							<view class="testimonial-meta">
								<text class="testimonial-name">王建国</text>
								<view class="star-rating">
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
								</view>
							</view>
						</view>
						<text class="testimonial-text">角色一致性那一章解决了我最大的痛点,现在批量产出短剧效率翻倍。</text>
					</view>

					<!-- 评价3 -->
					<view class="testimonial-card glass-card">
						<view class="testimonial-header">
							<view class="testimonial-avatar">陈</view>
							<view class="testimonial-meta">
								<text class="testimonial-name">陈思雨</text>
								<view class="star-rating">
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
									<uni-icons type="star-filled" size="12" color="#FF6B6B"></uni-icons>
								</view>
							</view>
						</view>
						<text class="testimonial-text">AI工具+创作方法论结合得很好,零基础也能快速上手,社群氛围也很棒。</text>
					</view>
				</view>
			</view>

			<!-- 底部CTA区 -->
			<view class="bottom-cta-section">
				<view class="bottom-cta-inner">
					<text class="bottom-cta-title">开启你的AI短剧创作之旅</text>
					<text class="bottom-cta-desc">加入12,847位创作者,系统掌握AI短剧全流程创作技能</text>
					<view class="bottom-cta-button" @click="handlePayment">
						<text class="bottom-cta-text">立即报名</text>
					</view>
					<!-- 信任徽章 -->
					<view class="trust-badges">
						<view class="trust-item">
							<uni-icons type="shield-filled" size="16" color="#FF6B6B"></uni-icons>
							<text class="trust-text">30天无忧退款</text>
						</view>
						<view class="trust-item">
							<uni-icons type="refresh" size="16" color="#FF6B6B"></uni-icons>
							<text class="trust-text">终身免费更新</text>
						</view>
						<view class="trust-item">
							<uni-icons type="chatbubble-filled" size="16" color="#FF6B6B"></uni-icons>
							<text class="trust-text">专属学习社群</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 底部栏 -->
			<view class="footer">
				<view class="footer-inner">
					<view class="footer-brand">
						<text class="footer-logo">AI短剧学院</text>
						<text class="footer-tagline">让每个人都能创作爆款短剧</text>
					</view>
					<view class="footer-links">
						<text class="footer-link">课程体系</text>
						<text class="footer-link">AI工具</text>
						<text class="footer-link">学员案例</text>
						<text class="footer-link">关于我们</text>
					</view>
					<view class="footer-social">
						<uni-icons type="chatbubble" size="20" color="#rgba(26, 83, 92, 0.4)"></uni-icons>
						<uni-icons type="email" size="20" color="#rgba(26, 83, 92, 0.4)"></uni-icons>
						<uni-icons type="videocam" size="20" color="#rgba(26, 83, 92, 0.4)"></uni-icons>
					</view>
				</view>
				<view class="footer-bottom">
					<text class="copyright">© 2025 AI短剧学院. All rights reserved.</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import TopTitle from '@/components/TopTitle.vue'

const courseProgress = ref(35)
const expandedChapters = ref([])

const toggleChapter = (chapterId) => {
	const index = expandedChapters.value.indexOf(chapterId)
	if (index > -1) {
		expandedChapters.value.splice(index, 1)
	} else {
		expandedChapters.value.push(chapterId)
	}
}

const handlePlayVideo = () => {
	uni.showToast({
		title: '播放视频',
		icon: 'none'
	})
}

const handlePayment = () => {
	uni.navigateTo({
		url: '/pages/payment/index'
	})
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.course-detail-container {
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
	background: $color-bg-glass;
	backdrop-filter: blur($glass-blur);
	-webkit-backdrop-filter: blur($glass-blur);
	border-bottom: 1px solid $color-border;
	height: 128rpx;
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
}

.nav-cta-btn {
	padding: 20rpx 40rpx;
	background: $gradient-primary;
	border-radius: $radius-md;
	
	.nav-cta-text {
		font-size: 28rpx;
		font-weight: 600;
		color: $color-bg-elevated;
	}
}

/* 课程进度条 */
.progress-bar-wrapper {
	position: fixed;
	top: 128rpx;
	left: 0;
	right: 0;
	z-index: 998;
	height: 8rpx;
	background: $color-border-light;
}

.progress-bar {
	width: 100%;
	height: 100%;
}

.progress-fill {
	height: 100%;
	background: $gradient-primary;
	border-radius: 0 8rpx 8rpx 0;
}

/* 主要内容 */
.main-content {
	padding-top: 136rpx; /* 导航栏+进度条高度 */
}

/* 分屏布局 */
.split-layout {
	max-width: 750px;
	margin: 0 auto;
	padding: 32rpx;
	display: flex;
	flex-direction: column;
	gap: 32rpx;
	
	@media (min-width: 768px) {
		flex-direction: row;
	}
}

.left-panel {
	width: 100%;
	
	@media (min-width: 768px) {
		width: 55%;
	}
}

.right-panel {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 32rpx;
	
	@media (min-width: 768px) {
		width: 45%;
	}
}

/* 视频播放器 */
.video-player {
	position: relative;
	width: 100%;
	border-radius: $radius-lg;
	overflow: hidden;
}

.video-cover {
	width: 100%;
	height: 432rpx;
}

.play-button-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.play-button {
	width: 128rpx;
	height: 128rpx;
	background: $gradient-primary;
	border-radius: $radius-full;
	box-shadow: $glow-primary;
	display: flex;
	align-items: center;
	justify-content: center;
}

.chapter-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 24rpx;
	display: flex;
	gap: 24rpx;
	background: linear-gradient(transparent, rgba(26,17,10,0.9));
}

.chapter-badge {
	padding: 8rpx 24rpx;
	border-radius: $radius-full;
	background: rgba(255,248,240,0.12);
	
	.badge-text {
		font-size: 24rpx;
		font-weight: 600;
		color: $color-bg-elevated;
	}
}

.playing-badge {
	background: $color-primary;
}

.time-badge {
	background: rgba(255,248,240,0.08);
	
	.badge-text {
		color: $color-text-secondary;
	}
}

/* 课程标题 */
.course-title-section {
	margin-top: 32rpx;
}

.course-main-title {
	font-size: 64rpx;
	font-weight: 800;
	line-height: 1.15;
	color: $color-text-primary;
	font-family: $font-display;
}

.course-sub-title {
	margin-top: 16rpx;
	font-size: 32rpx;
	font-weight: 500;
	color: $color-text-secondary;
}

/* 课程统计栏 */
.course-stats {
	padding: 32rpx;
	display: flex;
	align-items: center;
	gap: 32rpx;
	flex-wrap: wrap;
}

.stat-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.stat-info {
	font-size: 28rpx;
	font-weight: 500;
	color: $color-text-secondary;
}

/* 购买CTA+价格 */
.buy-cta {
	padding: 48rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.price-display {
	display: flex;
	align-items: baseline;
	gap: 24rpx;
	margin-bottom: 16rpx;
}

.current-price {
	font-size: 64rpx;
	font-weight: 800;
	color: $color-text-primary;
	font-family: $font-display;
}

.original-price {
	font-size: 32rpx;
	color: $color-text-muted;
	text-decoration: line-through;
}

.discount-note {
	font-size: 28rpx;
	font-weight: 600;
	color: $color-accent;
	margin-bottom: 32rpx;
}

.buy-button {
	width: 100%;
	padding: 32rpx;
	background: $gradient-primary;
	border-radius: $radius-lg;
	box-shadow: $glow-primary;
	
	.buy-button-text {
		font-size: 32rpx;
		font-weight: bold;
		color: $color-bg-elevated;
	}
}

.payment-methods-note {
	margin-top: 24rpx;
	font-size: 24rpx;
	color: $color-text-muted;
	text-align: center;
}

/* 讲师介绍 */
.instructor-section {
	max-width: 750px;
	margin: 64rpx auto 0 auto;
	padding: 0 32rpx;
}

.instructor-card {
	padding: 48rpx;
	display: flex;
	flex-direction: column;
	gap: 32rpx;
	
	@media (min-width: 768px) {
		flex-direction: row;
	}
}

.instructor-avatar {
	flex-shrink: 0;
	width: 192rpx;
	height: 192rpx;
	border-radius: $radius-full;
	border: 8rpx solid $color-border;
	object-fit: cover;
}

.instructor-info {
	flex: 1;
	min-width: 0;
}

.instructor-header {
	display: flex;
	align-items: center;
	gap: 24rpx;
	flex-wrap: wrap;
}

.instructor-name {
	font-size: 40rpx;
	font-weight: bold;
	color: $color-text-primary;
	font-family: $font-display;
}

.verified-badge {
	padding: 8rpx 24rpx;
	background: $gradient-primary;
	border-radius: $radius-full;
	
	.verified-text {
		font-size: 24rpx;
		font-weight: 600;
		color: $color-bg-elevated;
	}
}

.instructor-title {
	margin-top: 8rpx;
	font-size: 28rpx;
	font-weight: 500;
	color: $color-accent;
}

.instructor-desc {
	margin-top: 24rpx;
	font-size: 28rpx;
	line-height: 1.6;
	color: $color-text-secondary;
	max-width: 1024rpx;
}

.instructor-stats {
	margin-top: 40rpx;
	display: flex;
	align-items: center;
	gap: 48rpx;
	flex-wrap: wrap;
}

.stat-block {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.stat-value {
	font-size: 32rpx;
	font-weight: bold;
	color: $color-text-primary;
}

.stat-unit {
	font-size: 28rpx;
	color: $color-text-muted;
}

.divider-vertical {
	width: 4rpx;
	height: 48rpx;
	background: $color-border;
}

/* 课程大纲 */
.curriculum-section {
	max-width: 750px;
	margin: 64rpx auto 0 auto;
	padding: 0 32rpx;
}

.section-title {
	font-size: 48rpx;
	font-weight: bold;
	color: $color-text-primary;
	font-family: $font-display;
	margin-bottom: 32rpx;
}

.chapter-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.chapter-card {
	padding: 40rpx;
	border-left: 12rpx solid $color-primary;
}

.chapter-header {
	display: flex;
	align-items: center;
	gap: 32rpx;
}

.chapter-number {
	flex-shrink: 0;
	width: 80rpx;
	height: 80rpx;
	background: $gradient-primary;
	border-radius: $radius-md;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: bold;
	color: $color-bg-elevated;
}

.chapter-info {
	flex: 1;
	min-width: 0;
}

.chapter-title {
	font-size: 32rpx;
	font-weight: 600;
	color: $color-text-primary;
}

.chapter-lessons {
	margin-top: 8rpx;
	font-size: 28rpx;
	color: $color-text-muted;
}

.chapter-content {
	margin-top: 24rpx;
	padding-left: 112rpx;
}

.chapter-desc {
	font-size: 28rpx;
	line-height: 1.6;
	color: $color-text-secondary;
}

/* 学员评价 */
.testimonials-section {
	max-width: 750px;
	margin: 64rpx auto 0 auto;
	padding: 0 32rpx;
}

.testimonial-grid {
	display: grid;
	grid-template-columns: repeat(1, 1fr);
	gap: 32rpx;
	
	@media (min-width: 768px) {
		grid-template-columns: repeat(3, 1fr);
	}
}

.testimonial-card {
	padding: 40rpx;
}

.testimonial-header {
	display: flex;
	align-items: center;
	gap: 24rpx;
	margin-bottom: 24rpx;
}

.testimonial-avatar {
	flex-shrink: 0;
	width: 80rpx;
	height: 80rpx;
	background: $gradient-primary;
	border-radius: $radius-full;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: bold;
	color: $color-bg-elevated;
}

.testimonial-meta {
	flex: 1;
	min-width: 0;
}

.testimonial-name {
	font-size: 28rpx;
	font-weight: 600;
	color: $color-text-primary;
}

.star-rating {
	margin-top: 8rpx;
	display: flex;
	align-items: center;
	gap: 4rpx;
}

.testimonial-text {
	font-size: 28rpx;
	line-height: 1.6;
	color: $color-text-secondary;
}

/* 底部CTA区 */
.bottom-cta-section {
	margin-top: 64rpx;
	background: $color-bg-elevated;
	padding: 128rpx 48rpx;
}

.bottom-cta-inner {
	max-width: 600rpx;
	margin: 0 auto;
	text-align: center;
}

.bottom-cta-title {
	font-size: 48rpx;
	font-weight: bold;
	line-height: 1.2;
	color: $color-text-primary;
	font-family: $font-display;
	margin-bottom: 32rpx;
}

.bottom-cta-desc {
	font-size: 32rpx;
	color: $color-text-secondary;
	margin-bottom: 64rpx;
}

.bottom-cta-button {
	padding: 32rpx 64rpx;
	background: $gradient-primary;
	border-radius: $radius-lg;
	box-shadow: $glow-primary;
	
	.bottom-cta-text {
		font-size: 32rpx;
		font-weight: bold;
		color: $color-bg-elevated;
	}
}

.trust-badges {
	margin-top: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 48rpx;
	flex-wrap: wrap;
}

.trust-item {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.trust-text {
	font-size: 28rpx;
	color: $color-text-muted;
}

/* 底部栏 */
.footer {
	background: $color-bg-surface;
	border-top: 1px solid $color-border;
	padding: 80rpx 48rpx;
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
	align-items: flex-start;
	gap: 16rpx;
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
	font-size: 28rpx;
	color: $color-text-muted;
}

.footer-links {
	display: flex;
	align-items: center;
	gap: 48rpx;
	flex-wrap: wrap;
}

.footer-link {
	font-size: 28rpx;
	color: $color-text-muted;
}

.footer-social {
	display: flex;
	align-items: center;
	gap: 32rpx;
}

.footer-bottom {
	margin-top: 64rpx;
	padding-top: 48rpx;
	border-top: 1px solid $color-border;
}

.copyright {
	font-size: 24rpx;
	color: $color-text-muted;
}
</style>