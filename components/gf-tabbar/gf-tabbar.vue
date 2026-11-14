<template>
	<view class="gf-tabbar">
		<navigator
			v-for="t in tabs"
			:key="t.key"
			class="gf-tab"
			:class="{ on: active === t.key }"
			:url="t.url"
			open-type="reLaunch"
			hover-class="gf-tab-hover"
		>
			<text class="gf-tab-seal">{{ t.seal }}</text>
			<text class="gf-tab-txt">{{ t.label }}</text>
			<text v-if="badgeOf(t.key) > 0" class="gf-dot">{{ badgeOf(t.key) > 99 ? '99+' : badgeOf(t.key) }}</text>
		</navigator>
	</view>
</template>

<script>
	import { getWorkbench } from '@/api/mp'

	/**
	 * 主播工作台底部 Tab（M2 首页 / M3 排班 / M4 业绩 / M6 我的）
	 * 项目未配置原生 tabBar，统一用 reLaunch 跳转；角标由数据层统一计算。
	 */
	export default {
		name: 'GfTabbar',
		props: {
			active: { type: String, default: 'home' },
			scheduleBadge: { type: Number, default: -1 },
			mineBadge: { type: Number, default: -1 }
		},
		data() {
			return {
				tabs: [
					{ key: 'home', seal: '首', label: '首页', url: '/pages/anchor-home/index' },
					{ key: 'schedule', seal: '排', label: '排班', url: '/pages/my-schedule/index' },
					{ key: 'performance', seal: '绩', label: '业绩', url: '/pages/anchor-performance/index' },
					{ key: 'mine', seal: '我', label: '我的', url: '/pages/anchor-mine/index' }
				],
				badges: { schedule: 0, mine: 0 }
			}
		},
		mounted() {
			this.loadBadges()
		},
		methods: {
			async loadBadges() {
				try {
					const d = await getWorkbench()
					this.badges = d.badges || { schedule: 0, mine: 0 }
				} catch (e) {
					/* 角标失败不影响导航 */
				}
			},
			badgeOf(key) {
				if (key === 'schedule' && this.scheduleBadge >= 0) return this.scheduleBadge
				if (key === 'mine' && this.mineBadge >= 0) return this.mineBadge
				return this.badges[key] || 0
			}
		}
	}
</script>

<style lang="scss" scoped>
	.gf-tabbar {
		display: flex;
		align-items: center;
		justify-content: space-around;
		height: 112rpx;
		height: calc(112rpx + env(safe-area-inset-bottom));
		padding: 8rpx 12rpx 0;
		padding-bottom: env(safe-area-inset-bottom);
		background: rgba(255, 253, 247, 0.97);
		border-top: 1rpx solid rgba(201, 162, 75, 0.42);
		box-shadow: 0 -6rpx 18rpx rgba(26, 24, 21, 0.05);
		flex-shrink: 0;
	}

	.gf-tab {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6rpx;
	}

	.gf-tab-hover {
		opacity: 0.7;
	}

	.gf-tab-seal {
		width: 46rpx;
		height: 46rpx;
		line-height: 42rpx;
		text-align: center;
		border: 1rpx solid rgba(201, 162, 75, 0.42);
		border-radius: 6rpx;
		color: #8c8274;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 24rpx;
		font-weight: 700;
		background: rgba(201, 162, 75, 0.06);
	}

	.gf-tab-txt {
		font-size: 20rpx;
		color: #8c8274;
		letter-spacing: 2rpx;
	}

	.gf-tab.on .gf-tab-seal {
		background: #b23a2e;
		border-color: #b23a2e;
		color: #fdf6e6;
	}

	.gf-tab.on .gf-tab-txt {
		color: #b23a2e;
		font-weight: 700;
	}

	.gf-dot {
		position: absolute;
		top: -4rpx;
		right: 8rpx;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 30rpx;
		height: 30rpx;
		padding: 0 8rpx;
		border-radius: 15rpx;
		background: #b23a2e;
		color: #fdf6e6;
		font-size: 18rpx;
		line-height: 1;
	}
</style>
