<template>
	<view class="payment-container">
		<!-- 返回链接 -->
		<view class="back-link" @click="handleBack">
			<uni-icons type="left" size="16" color="#rgba(26, 83, 92, 0.65)"></uni-icons>
			<text class="back-text">返回课程</text>
		</view>

		<!-- 页面标题 -->
		<view class="page-header">
			<text class="page-title">安全结账</text>
			<text class="page-subtitle">完成支付,立即开始学习</text>
		</view>

		<!-- 两栏布局 -->
		<view class="two-column-layout">
			<!-- 左栏 - 订单摘要 -->
			<view class="order-summary glass-card">
				<text class="card-title">订单摘要</text>

				<!-- 课程缩略图+标题 -->
				<view class="course-item">
					<view class="course-thumbnail">
						<uni-icons type="play-filled" size="24" color="#4ECDC4"></uni-icons>
					</view>
					<view class="course-info">
						<text class="course-name">从0到1万粉 — AI短剧大师课</text>
						<text class="course-desc">完整课程 · 终身访问</text>
					</view>
				</view>

				<!-- 价格明细 -->
				<view class="price-breakdown">
					<view class="price-row">
						<text class="price-label-muted">原价</text>
						<text class="price-original">¥2,999</text>
					</view>
					<view class="price-row">
						<text class="price-label-muted">限时优惠</text>
						<text class="price-discount">-¥1,700</text>
					</view>
					<view class="divider-line"></view>
					<view class="price-row total-row">
						<text class="price-label-bold">应付金额</text>
						<text class="price-final gradient-text">¥1,299</text>
					</view>
				</view>

				<!-- 优惠码 -->
				<view class="coupon-section">
					<text class="coupon-label">优惠码</text>
					<view class="coupon-input-group">
						<input class="coupon-input" v-model="couponCode" placeholder="输入优惠码" @input="handleCouponInput" />
						<view class="coupon-btn" @click="handleApplyCoupon">
							<text class="coupon-btn-text">兑换</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 右栏 - 账单表单 -->
			<view class="billing-form glass-card">
				<text class="card-title">账单信息</text>

				<view class="form-fields">
					<!-- 姓名 -->
					<view class="field-item">
						<text class="field-label">姓名</text>
						<input class="field-input" v-model="name" placeholder="" @input="handleNameInput" />
					</view>

					<!-- 手机号 -->
					<view class="field-item">
						<text class="field-label">手机号</text>
						<input class="field-input" v-model="phone" type="number" placeholder="用于接收课程通知" @input="handlePhoneInput" />
					</view>

					<!-- 邮箱 -->
					<view class="field-item">
						<text class="field-label">邮箱</text>
						<input class="field-input" v-model="email" placeholder="用于发送课程凭证" @input="handleEmailInput" />
					</view>

					<!-- 支付方式 -->
					<view class="payment-methods-section">
						<text class="field-label">支付方式</text>
						<view class="payment-methods">
							<!-- 微信支付 -->
							<view class="payment-option" :class="{ 'selected': selectedPayment === 'wechat' }" @click="selectPayment('wechat')">
								<view class="payment-icon wechat-icon">
									<uni-icons type="chatbubble-filled" size="16" color="#4ECDC4"></uni-icons>
								</view>
								<text class="payment-name">微信支付</text>
								<view class="radio-icon">
									<view class="radio-inner" v-if="selectedPayment === 'wechat'"></view>
								</view>
							</view>

							<!-- 支付宝 -->
							<view class="payment-option" :class="{ 'selected': selectedPayment === 'alipay' }" @click="selectPayment('alipay')">
								<view class="payment-icon alipay-icon">
									<uni-icons type="wallet-filled" size="16" color="#4ECDC4"></uni-icons>
								</view>
								<text class="payment-name">支付宝</text>
								<view class="radio-icon">
									<view class="radio-inner" v-if="selectedPayment === 'alipay'"></view>
								</view>
							</view>

							<!-- 银行卡 -->
							<view class="payment-option" :class="{ 'selected': selectedPayment === 'card' }" @click="selectPayment('card')">
								<view class="payment-icon card-icon">
									<uni-icons type="staff-filled" size="16" color="#rgba(26, 83, 92, 0.65)"></uni-icons>
								</view>
								<text class="payment-name">银行卡</text>
								<view class="radio-icon">
									<view class="radio-inner" v-if="selectedPayment === 'card'"></view>
								</view>
							</view>
						</view>
					</view>

					<!-- 支付按钮 -->
					<view class="pay-button" @click="handlePayment">
						<uni-icons type="locked-filled" size="16" color="#FFFFFF"></uni-icons>
						<text class="pay-button-text">安全支付 · ¥1,299</text>
					</view>

					<!-- 安全提示 -->
					<view class="security-note">
						<uni-icons type="shield-filled" size="14" color="#rgba(26, 83, 92, 0.4)"></uni-icons>
						<text class="security-text">256位SSL加密保护您的支付安全</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 安全徽章 -->
		<view class="security-badges">
			<view class="badge-item">
				<view class="badge-icon">
					<uni-icons type="shield" size="20" color="#4ECDC4"></uni-icons>
				</view>
				<text class="badge-label">SSL加密</text>
			</view>
			<view class="badge-item">
				<view class="badge-icon">
					<uni-icons type="refresh" size="20" color="#4ECDC4"></uni-icons>
				</view>
				<text class="badge-label">30天退款</text>
			</view>
			<view class="badge-item">
				<view class="badge-icon">
					<uni-icons type="checkbox-filled" size="20" color="#4ECDC4"></uni-icons>
				</view>
				<text class="badge-label">安全验证</text>
			</view>
		</view>

		<!-- 协议提示 -->
		<view class="agreement-note">
			<text class="agreement-text">购买即表示同意《用户协议》和《退款政策》</text>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

const couponCode = ref('')
const name = ref('')
const phone = ref('')
const email = ref('')
const selectedPayment = ref('wechat')

const handleBack = () => {
	uni.navigateBack()
}

const handleCouponInput = (e) => {
	couponCode.value = e.detail.value
}

const handleApplyCoupon = () => {
	if (!couponCode.value) {
		uni.showToast({
			title: '请输入优惠码',
			icon: 'none'
		})
		return
	}
	uni.showToast({
		title: '优惠码已应用',
		icon: 'success'
	})
}

const handleNameInput = (e) => {
	name.value = e.detail.value
}

const handlePhoneInput = (e) => {
	phone.value = e.detail.value
}

const handleEmailInput = (e) => {
	email.value = e.detail.value
}

const selectPayment = (method) => {
	selectedPayment.value = method
}

const handlePayment = () => {
	// 表单验证
	if (!name.value) {
		uni.showToast({
			title: '请输入姓名',
			icon: 'none'
		})
		return
	}

	if (!phone.value || phone.value.length !== 11) {
		uni.showToast({
			title: '请输入正确的手机号',
			icon: 'none'
		})
		return
	}

	if (!email.value || !email.value.includes('@')) {
		uni.showToast({
			title: '请输入正确的邮箱',
			icon: 'none'
		})
		return
	}

	uni.showToast({
		title: '支付处理中...',
		icon: 'loading',
		duration: 2000
	})

	// 模拟支付成功
	setTimeout(() => {
		uni.showToast({
			title: '支付成功',
			icon: 'success',
			duration: 2000
		})
		
		setTimeout(() => {
			uni.redirectTo({
				url: '/pages/course-detail/index'
			})
		}, 2000)
	}, 2000)
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.payment-container {
	min-height: 100vh;
	padding: 32rpx 48rpx;
	background: $color-bg-surface;
}

/* 返回链接 */
.back-link {
	max-width: 960px;
	margin: 0 auto 32rpx auto;
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.back-text {
	font-size: 28rpx;
	font-weight: 500;
	color: $color-text-secondary;
}

/* 页面标题 */
.page-header {
	max-width: 960px;
	margin: 0 auto 56rpx auto;
	text-align: center;
}

.page-title {
	font-size: 32rpx;
	font-weight: 600;
	color: $color-text-primary;
	line-height: 1.3;
}

.page-subtitle {
	margin-top: 16rpx;
	font-size: 28rpx;
	color: $color-text-muted;
}

/* 两栏布局 */
.two-column-layout {
	max-width: 960px;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 32rpx;
	
	@media (min-width: 768px) {
		flex-direction: row;
	}
}

/* 玻璃态卡片 */
.glass-card {
	background: $glass-bg;
	backdrop-filter: blur($glass-blur);
	-webkit-backdrop-filter: blur($glass-blur);
	border: 1px solid $glass-border;
	border-radius: $radius-lg;
	padding: 48rpx;
}

.card-title {
	font-size: 32rpx;
	font-weight: 600;
	color: $color-text-primary;
	margin-bottom: 40rpx;
}

/* 课程项目 */
.course-item {
	display: flex;
	gap: 32rpx;
	margin-bottom: 48rpx;
}

.course-thumbnail {
	flex-shrink: 0;
	width: 160rpx;
	height: 160rpx;
	background: $gradient-card;
	border-radius: $radius-md;
	display: flex;
	align-items: center;
	justify-content: center;
}

.course-info {
	flex: 1;
	min-width: 0;
}

.course-name {
	font-size: 28rpx;
	font-weight: 600;
	color: $color-text-primary;
	word-break: break-all;
}

.course-desc {
	margin-top: 16rpx;
	font-size: 24rpx;
	color: $color-text-muted;
}

/* 价格明细 */
.price-breakdown {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.price-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.price-label-muted {
	font-size: 28rpx;
	color: $color-text-muted;
}

.price-original {
	font-size: 28rpx;
	color: $color-text-muted;
	text-decoration: line-through;
}

.price-discount {
	font-size: 28rpx;
	font-weight: 600;
	color: $color-text-accent;
}

.divider-line {
	margin: 32rpx 0;
	border-top: 1px solid $color-border;
}

.total-row {
	align-items: baseline;
}

.price-label-bold {
	font-size: 28rpx;
	font-weight: 600;
	color: $color-text-primary;
}

.price-final {
	font-size: 48rpx;
	font-weight: bold;
	background: $gradient-primary;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

/* 优惠码 */
.coupon-section {
	margin-top: 48rpx;
	padding-top: 40rpx;
	border-top: 1px solid $color-border;
}

.coupon-label {
	font-size: 24rpx;
	font-weight: 600;
	color: $color-text-secondary;
	margin-bottom: 16rpx;
}

.coupon-input-group {
	display: flex;
	gap: 16rpx;
}

.coupon-input {
	flex: 1;
	min-width: 0;
	height: 80rpx;
	padding: 0 24rpx;
	font-size: 28rpx;
	border-radius: $radius-md;
	background: $color-bg-surface;
	border: 1px solid $color-border;
	color: $color-text-primary;
	
	&:focus {
		border-color: $color-primary;
		box-shadow: 0 0 0 8rpx rgba(217,79,48,0.2);
	}
}

.coupon-btn {
	flex-shrink: 0;
	height: 80rpx;
	padding: 0 32rpx;
	font-size: 28rpx;
	font-weight: 600;
	border-radius: $radius-md;
	background: $color-bg-surface;
	border: 1px solid $color-border;
	color: $color-text-secondary;
	
	.coupon-btn-text {
		color: $color-text-secondary;
	}
}

/* 账单表单 */
.form-fields {
	display: flex;
	flex-direction: column;
	gap: 40rpx;
}

.field-item {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.field-label {
	font-size: 24rpx;
	font-weight: 600;
	color: $color-text-secondary;
}

.field-input {
	width: 100%;
	height: 88rpx;
	padding: 0 24rpx;
	font-size: 28rpx;
	border-radius: $radius-md;
	background: $color-bg-surface;
	border: 1px solid $color-border;
	color: $color-text-primary;
	
	&:focus {
		border-color: $color-primary;
		box-shadow: 0 0 0 8rpx rgba(217,79,48,0.2);
	}
}

/* 支付方式 */
.payment-methods-section {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.payment-methods {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.payment-option {
	display: flex;
	align-items: center;
	gap: 24rpx;
	padding: 24rpx;
	border-radius: $radius-md;
	background: $color-bg-surface;
	border: 2px solid $color-border;
	
	&.selected {
		border-color: $color-primary;
	}
}

.payment-icon {
	flex-shrink: 0;
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.wechat-icon {
	background: rgba(76,175,80,0.15);
}

.alipay-icon {
	background: rgba(41,182,246,0.15);
}

.card-icon {
	background: rgba(196,168,140,0.12);
}

.payment-name {
	flex: 1;
	font-size: 28rpx;
	font-weight: 600;
	color: $color-text-primary;
}

.radio-icon {
	flex-shrink: 0;
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	border: 4rpx solid $color-border;
	display: flex;
	align-items: center;
	justify-content: center;
	
	.payment-option.selected & {
		border-color: $color-primary;
	}
}

.radio-inner {
	width: 20rpx;
	height: 20rpx;
	border-radius: 50%;
	background: $color-primary;
}

/* 支付按钮 */
.pay-button {
	width: 100%;
	height: 96rpx;
	background: $gradient-primary;
	border-radius: $radius-md;
	box-shadow: $glow-primary;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	margin-top: 16rpx;
	
	.pay-button-text {
		font-size: 32rpx;
		font-weight: 600;
		color: #FFFFFF;
	}
}

/* 安全提示 */
.security-note {
	text-align: center;
	margin-top: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
}

.security-text {
	font-size: 24rpx;
	color: $color-text-muted;
}

/* 安全徽章 */
.security-badges {
	max-width: 960px;
	margin: 56rpx auto 0 auto;
	display: flex;
	justify-content: center;
	gap: 64rpx;
}

.badge-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
}

.badge-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: $color-accent-muted;
	display: flex;
	align-items: center;
	justify-content: center;
}

.badge-label {
	font-size: 24rpx;
	font-weight: 600;
	color: $color-text-secondary;
}

/* 协议提示 */
.agreement-note {
	max-width: 960px;
	margin: 32rpx auto 0 auto;
	text-align: center;
}

.agreement-text {
	font-size: 24rpx;
	color: $color-text-muted;
}

/* 响应式布局 */
@media (min-width: 768px) {
	.two-column-layout {
		.order-summary {
			width: 45%;
		}
		
		.billing-form {
			width: 55%;
		}
	}
}
</style>