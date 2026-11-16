<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="gf-back" @click="goHome">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">下播小结</text>
				<text class="gf-subtitle">本场已结束</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<view v-if="!session" class="gf-state">
					<text class="gf-state-ico">空</text>
					<text class="gf-state-text">暂无场次</text>
				</view>

				<template v-else>
					<view class="sum-head">
						<text class="sum-seal">结</text>
						<text class="sum-t">辛苦了，本场已结束</text>
						<text class="sum-d">{{ hm(session.startAt) }} – {{ hm(session.endAt) }} · {{ session.roomNo }}</text>
					</view>

					<view class="gf-kpi-grid three">
						<view class="gf-kpi">
							<text class="gf-kpi-l">时长</text>
							<text class="gf-kpi-v small">{{ duration }}</text>
						</view>
						<view class="gf-kpi">
							<text class="gf-kpi-l">单量</text>
							<text class="gf-kpi-v small">{{ stats.n }}</text>
						</view>
						<view class="gf-kpi">
							<text class="gf-kpi-l">GMV</text>
							<text class="gf-kpi-v small">{{ wan(stats.gmv) }}</text>
						</view>
					</view>

					<view class="gf-card sum-card">
						<view class="gf-row">
							<text class="gf-row-k">考勤</text>
							<text class="gf-tag" :class="session.att === '准时' ? 'gf-tag-ink' : 'gf-tag-gold'">{{ session.att }}</text>
						</view>
						<view class="gf-row">
							<text class="gf-row-k">交接留存</text>
							<text class="gf-row-v">{{ ratioText }}</text>
						</view>
						<view class="gf-row">
							<text class="gf-row-k">数据审核</text>
							<text class="gf-tag gf-tag-gray">{{ dataStatus }}</text>
						</view>
					</view>
				</template>
			</view>
		</scroll-view>

		<view v-if="session" class="gf-foot">
			<view class="gf-btn gf-btn-ghost" @click="goOrders">本场订单</view>
			<view class="gf-btn gf-btn-primary" @click="goReport">写日报</view>
		</view>
	</view>
</template>

<script>
	import { getSummary } from '@/api/mp'
	import { wan, duration as durFmt } from '@/utils/mp-format'

	export default {
		data() {
			return { id: '', session: null, stats: { n: 0, gmv: 0 }, ratio: null }
		},
		computed: {
			duration() {
				if (!this.session) return '—'
				return durFmt(this.session.endAt - this.session.startAt)
			},
			ratioText() {
				if (this.ratio === null) return '—'
				return (this.ratio * 100).toFixed(0) + '%'
			},
			dataStatus() {
				return this.session && this.session.data ? this.session.data.st : '—'
			}
		},
		onLoad(q) {
			this.id = (q && q.id) || ''
			this.load()
		},
		methods: {
			wan,
			hm(ts) {
				const d = new Date(ts)
				return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
			},
			async load() {
				const d = await getSummary(this.id)
				if (!d) return
				this.session = d.session
				this.stats = d.stats
				this.ratio = d.ratio
			},
			goOrders() {
				uni.navigateTo({ url: '/pages/anchor-session-orders/index?id=' + this.session.id })
			},
			goReport() {
				uni.navigateTo({ url: '/pages/anchor-daily-report/index' })
			},
			goHome() {
				uni.reLaunch({ url: '/pages/anchor-home/index' })
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

	.sum-head {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 0 34rpx;
	}

	.sum-seal {
		width: 96rpx;
		height: 96rpx;
		line-height: 92rpx;
		text-align: center;
		border: 2rpx solid $gf-cinnabar;
		border-radius: 8rpx;
		color: $gf-cinnabar;
		font-family: 'STKaiti', serif;
		font-size: 40rpx;
		font-weight: 700;
		background: rgba(178, 58, 46, 0.05);
	}

	.sum-t {
		margin-top: 22rpx;
		font-family: 'STKaiti', serif;
		font-size: 38rpx;
		font-weight: 700;
		color: $gf-ink;
		letter-spacing: 2rpx;
	}

	.sum-d {
		margin-top: 8rpx;
		font-size: 22rpx;
		color: $gf-ink-3;
	}

	.sum-card {
		margin-top: 18rpx;
	}
</style>
