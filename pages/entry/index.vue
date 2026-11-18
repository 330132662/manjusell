<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="topbar-holder"></view>
			<view class="gf-topbar-mid">
				<text class="gf-title">功能选择</text>
				<text class="gf-subtitle">鼎耀工作台</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<view class="entry-lead">
					<text class="entry-lead-mark">选</text>
					<text class="entry-lead-text">登录成功，请选择您要进入的工作台。</text>
				</view>

				<!-- 主播工作台 -->
				<view class="entry-card anchor" @click="goAnchor">
					<view class="entry-card-hd">
						<view class="entry-seal anchor">播</view>
						<view class="entry-card-hd-txt">
							<text class="entry-card-title">主播工作台</text>
							<text class="entry-card-en">ANCHOR · 排班开播</text>
						</view>
						<text class="entry-arrow">›</text>
					</view>
					<text class="entry-card-desc">查看排班、扫码开播、录入数据与下播管理</text>
					<view class="entry-card-tags">
						<text class="gf-tag gf-tag-red">排班</text>
						<text class="gf-tag gf-tag-gold">数据</text>
						<text class="gf-tag gf-tag-ink">下播</text>
					</view>
				</view>

				<!-- 客服工作台 -->
				<view class="entry-card service" @click="goService">
					<view class="entry-card-hd">
						<view class="entry-seal service">客</view>
						<view class="entry-card-hd-txt">
							<text class="entry-card-title">客服工作台</text>
							<text class="entry-card-en">SERVICE · 客户会话</text>
						</view>
						<text class="entry-arrow">›</text>
					</view>
					<text class="entry-card-desc">进入客户会话列表，处理消息、查询订单与数据看板</text>
					<view class="entry-card-tags">
						<text class="gf-tag gf-tag-ink">会话</text>
						<text class="gf-tag gf-tag-gold">订单</text>
						<text class="gf-tag gf-tag-gray">看板</text>
					</view>
				</view>

				<text class="gf-hint gf-hint-c">主播排班与客户会话，分别进入对应工作台</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		isLogged,
		enterWorkspace,
		ANCHOR_PAGE,
		SERVICE_PAGE,
		LOGIN_GATE_PAGE
	} from '@/utils/auth'

	export default {
		onLoad(options) {
			// 本页为登录后功能切换页，未登录一律回未登录落地页
			if (!isLogged()) {
				uni.reLaunch({ url: LOGIN_GATE_PAGE })
				return
			}
			// 身份切换：由 switchWorkspace 经本页中转，携带 next 自动进入目标，
			// 保证页面栈恒为 [中转页, 目标页]，返回键只回到本页
			if (options && options.next) {
				try {
					enterWorkspace(decodeURIComponent(options.next))
				} catch (e) {
					// next 非法则停留在本页，由用户手动选择
				}
			}
		},
		data() {
			return {}
		},
		methods: {
			goAnchor() {
				enterWorkspace(ANCHOR_PAGE)
			},
			goService() {
				enterWorkspace(SERVICE_PAGE)
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '../../styles/guofeng-vars.scss';

	.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.topbar-holder {
		width: 64rpx;
	}

	/* 顶部引导 */
	.entry-lead {
		display: flex;
		align-items: flex-start;
		gap: 14rpx;
		padding: 18rpx 20rpx;
		margin-bottom: 24rpx;
		background: rgba(201, 162, 75, 0.1);
		border: 1rpx solid $gf-line-soft;
		border-radius: 10rpx;
	}

	.entry-lead-mark {
		flex-shrink: 0;
		width: 44rpx;
		height: 44rpx;
		line-height: 44rpx;
		text-align: center;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 24rpx;
		font-weight: 700;
		color: $gf-cinnabar;
		border: 2rpx solid $gf-cinnabar;
		border-radius: 6rpx;
		background: rgba(178, 58, 46, 0.06);
	}

	.entry-lead-text {
		flex: 1;
		font-size: 24rpx;
		line-height: 1.6;
		color: $gf-ink-2;
	}

	/* 功能卡片 */
	.entry-card {
		position: relative;
		background: $gf-card;
		border: 1rpx solid $gf-line;
		border-radius: 18rpx;
		padding: 32rpx 28rpx 26rpx;
		margin-bottom: 26rpx;
		box-shadow: 0 8rpx 24rpx rgba(26, 24, 21, 0.07);
		overflow: hidden;
		transition: transform 0.15s ease, box-shadow 0.15s ease;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 6rpx;
		}

		&.anchor::before {
			background: linear-gradient(90deg, $gf-cinnabar 0%, $gf-gold 60%, rgba(201, 162, 75, 0.2) 100%);
		}

		&.service::before {
			background: linear-gradient(90deg, $gf-indigo 0%, $gf-gold 60%, rgba(201, 162, 75, 0.2) 100%);
		}

		&:active {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 12rpx rgba(26, 24, 21, 0.1);
		}
	}

	.entry-card-hd {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.entry-seal {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 64rpx;
		height: 64rpx;
		border-radius: 10rpx;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 34rpx;
		font-weight: 700;
		line-height: 1;

		&.anchor {
			color: $gf-cinnabar;
			border: 2rpx solid $gf-cinnabar;
			background: rgba(178, 58, 46, 0.06);
		}

		&.service {
			color: $gf-indigo;
			border: 2rpx solid $gf-indigo;
			background: rgba(58, 74, 82, 0.06);
		}
	}

	.entry-card-hd-txt {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.entry-card-title {
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 38rpx;
		font-weight: 700;
		color: $gf-ink;
		letter-spacing: 2rpx;
		line-height: 1.2;
	}

	.entry-card-en {
		font-size: 20rpx;
		color: $gf-ink-3;
		letter-spacing: 1rpx;
	}

	.entry-arrow {
		flex-shrink: 0;
		width: 48rpx;
		height: 48rpx;
		line-height: 44rpx;
		text-align: center;
		font-size: 44rpx;
		color: $gf-ink-3;
	}

	.entry-card-desc {
		display: block;
		margin: 24rpx 0 20rpx;
		font-size: 24rpx;
		line-height: 1.6;
		color: $gf-ink-2;
	}

	.entry-card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}
</style>
