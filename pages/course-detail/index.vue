<template>
</template>

<script setup>
	import {
		ref
	} from 'vue'
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
		padding-top: 136rpx;
		/* 导航栏+进度条高度 */
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
		background: linear-gradient(transparent, rgba(26, 17, 10, 0.9));
	}

	.chapter-badge {
		padding: 8rpx 24rpx;
		border-radius: $radius-full;
		background: rgba(255, 248, 240, 0.12);

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
		background: rgba(255, 248, 240, 0.08);

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
