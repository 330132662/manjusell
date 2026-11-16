<template>
	<view class="live-page" :style="capsuleSafeStyle">
		<view class="live-head">
			<view class="live-back" @click="goBack">‹</view>
			<text class="live-title">直播中</text>
			<view class="live-holder"></view>
		</view>

		<template v-if="live">
			<scroll-view scroll-y class="live-scroll">
				<!-- ===== 计时 ===== -->
				<view class="live-hero">
					<view class="live-badge"><text class="live-dot"></text>直播中</view>
					<text class="live-timer">{{ clockText }}</text>
					<text class="live-sub">{{ live.roomNo }} · {{ live.accName }}</text>
					<text class="live-sub small">
						开播 {{ hm(live.startAt) }}{{ live.planEnd ? ' · 计划至 ' + hm(live.planEnd) : ' · 计划外' }}
					</text>
					<view v-if="live.planEnd" class="live-prog">
						<i :style="{ width: planPercent + '%' }"></i>
					</view>
					<view class="live-kpis">
						<view class="live-kpi">
							<text class="live-kpi-v">{{ stats.n }}</text>
							<text class="live-kpi-l">本场单量</text>
						</view>
						<view class="live-kpi">
							<text class="live-kpi-v">{{ money(stats.gmv) }}</text>
							<text class="live-kpi-l">本场成交 GMV</text>
						</view>
					</view>
				</view>

				<view class="live-body">
					<view v-if="weak" class="live-notice red">网络不稳定：开播 / 下播时间已离线缓存，恢复后自动续传</view>
					<view v-if="nowTick - live.startAt > 2 * 3600 * 1000" class="live-notice">已连播超 2 小时，请安排 15–20 分钟休息</view>
					<view v-if="overPlan" class="live-notice red">计划已结束，请及时下播；超 60 分钟按计划结束时间自动下播</view>

					<view class="live-orders">
						<view v-for="o in orders" :key="o.id" class="live-order">
							<text class="lo-id">{{ maskNo(o.id) }}</text>
							<text class="lo-time">{{ hm(o.payAt) }}</text>
							<text class="lo-amt">+{{ money(o.amt) }}</text>
						</view>
						<view v-if="!orders.length" class="lo-empty">等待第一笔成交…</view>
					</view>

					<view class="live-net">
						<text>网络{{ weak ? '较弱' : '良好' }}</text>
						<text class="live-link" @click="toggleWeak">{{ weak ? '恢复网络' : '模拟弱网' }}</text>
					</view>
					<text class="live-link demo-order" v-if="demo" @click="mock">模拟一笔成交（演示）</text>

					<text class="live-tip">下播前请留意在线人数：下播前在线 < 峰值 40% 且峰值 > 100 将触发交接红线。</text>
				</view>
			</scroll-view>

			<view class="live-foot">
				<view class="live-end" @click="confirmEnd">我要下播</view>
			</view>
		</template>

		<view v-else class="live-empty">
			<text class="live-empty-ico">空</text>
			<text class="live-empty-t">当前没有进行中的场次</text>
			<view class="live-empty-btn" @click="goHome">返回首页</view>
		</view>

		<!-- 下播确认 -->
		<view v-if="askEnd" class="live-mask" @click="askEnd = false">
			<view class="live-dialog" @click.stop>
				<text class="ld-t">确认下播？</text>
				<text class="ld-c">{{ endTip }}</text>
				<view class="ld-a">
					<view class="ld-btn" @click="askEnd = false">取消</view>
					<view class="ld-btn primary" @click="doEnd">确认下播</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getLiveBoard, endLive, mockOrder } from '@/api/mp'
	import { clock as clockFmt, money, maskNo } from '@/utils/mp-format'
	import { goBack } from '@/utils/nav'
	import { USE_MP_DEMO } from '@/utils/config'

	export default {
		data() {
			return {
				live: null,
				orders: [],
				stats: { n: 0, gmv: 0 },
				elapsed: 0,
				overPlan: false,
				weak: false,
				askEnd: false,
				nowTick: Date.now(),
				timer: null,
				demo: USE_MP_DEMO
			}
		},
		computed: {
			clockText() {
				return clockFmt(this.nowTick - (this.live ? this.live.startAt : this.nowTick))
			},
			planPercent() {
				if (!this.live || !this.live.planEnd) return 0
				const total = this.live.planEnd - this.live.startAt
				if (total <= 0) return 100
				return Math.min(100, ((this.nowTick - this.live.startAt) / total) * 100)
			},
			endTip() {
				if (!this.live || !this.live.planEnd) return '下播后需录入本场数据（UV / 峰值 / 下播前在线 + 截图）。'
				const left = Math.round((this.live.planEnd - Date.now()) / 60000)
				if (left > 1) return '距计划结束还有 ' + left + ' 分钟，提前下播记为早退。'
				return '下播后需录入本场数据（UV / 峰值 / 下播前在线 + 截图）。'
			}
		},
		onLoad() {
			this.load()
			this.timer = setInterval(() => {
				this.nowTick = Date.now()
				if (this.live && this.live.planEnd) this.overPlan = this.nowTick > this.live.planEnd
			}, 1000)
		},
		onShow() {
			this.load()
		},
		onUnload() {
			if (this.timer) clearInterval(this.timer)
		},
		methods: {
			money,
			maskNo,
			hm(ts) {
				const d = new Date(ts)
				return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
			},
			async load() {
				const d = await getLiveBoard()
				this.live = d.live
				this.orders = d.orders || []
				this.stats = d.stats || { n: 0, gmv: 0 }
				this.elapsed = d.elapsed || 0
				this.overPlan = !!d.overPlan
			},
			toggleWeak() {
				this.weak = !this.weak
				if (!this.weak) uni.showToast({ title: '网络已恢复，缓存数据已续传', icon: 'none' })
			},
			async mock() {
				await mockOrder(this.live.id)
				this.load()
			},
			confirmEnd() {
				this.askEnd = true
			},
			async doEnd() {
				this.askEnd = false
				const early = this.live.planEnd && Date.now() < this.live.planEnd - 60000
				await endLive({ early })
				uni.redirectTo({ url: '/pages/anchor-live-data/index?id=' + this.live.id })
			},
			goHome() {
				uni.reLaunch({ url: '/pages/anchor-home/index' })
			},
			goBack() {
				goBack('/pages/anchor-home/index')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.live-page {
		min-height: 100vh;
		background: #14130f;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.live-head {
		display: flex;
		align-items: center;
		padding: 22rpx 28rpx;
		padding-top: calc(22rpx + env(safe-area-inset-top));
		color: #fdf6e6;
		flex-shrink: 0;
	}

	.live-back {
		width: 64rpx;
		height: 64rpx;
		line-height: 58rpx;
		text-align: center;
		border-radius: 50%;
		font-size: 38rpx;
		background: rgba(253, 246, 230, 0.1);
	}

	.live-title {
		flex: 1;
		text-align: center;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 32rpx;
		letter-spacing: 4rpx;
	}

	.live-holder {
		width: 64rpx;
	}

	.live-scroll {
		flex: 1;
		overflow: hidden;
	}

	.live-hero {
		padding: 20rpx 32rpx 34rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.live-badge {
		display: flex;
		align-items: center;
		gap: 10rpx;
		height: 44rpx;
		padding: 0 18rpx;
		border-radius: 22rpx;
		font-size: 21rpx;
		color: #ffd9d1;
		background: rgba(226, 86, 74, 0.16);
		border: 1rpx solid rgba(226, 86, 74, 0.5);
	}

	.live-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: #e2564a;
		animation: blink 1.4s infinite;
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}

	.live-timer {
		margin-top: 18rpx;
		font-family: 'DIN Alternate', 'Roboto', 'STKaiti', serif;
		font-size: 96rpx;
		font-weight: 700;
		color: #fdf6e6;
		line-height: 1.1;
		letter-spacing: 2rpx;
	}

	.live-sub {
		font-size: 23rpx;
		color: rgba(253, 246, 230, 0.72);
		margin-top: 6rpx;
	}

	.live-sub.small {
		font-size: 20rpx;
		color: rgba(253, 246, 230, 0.45);
	}

	.live-prog {
		width: 100%;
		height: 8rpx;
		border-radius: 4rpx;
		background: rgba(253, 246, 230, 0.12);
		margin-top: 24rpx;
		overflow: hidden;
	}

	.live-prog i {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, #e8a86a, #e2564a);
	}

	.live-kpis {
		display: flex;
		width: 100%;
		margin-top: 30rpx;
		border-top: 1rpx solid rgba(253, 246, 230, 0.1);
		padding-top: 24rpx;
	}

	.live-kpi {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4rpx;
	}

	.live-kpi-v {
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 44rpx;
		font-weight: 700;
		color: #fdf6e6;
	}

	.live-kpi-l {
		font-size: 20rpx;
		color: rgba(253, 246, 230, 0.5);
	}

	.live-body {
		padding: 0 28rpx 30rpx;
	}

	.live-notice {
		padding: 16rpx 18rpx;
		border-radius: 10rpx;
		font-size: 21rpx;
		line-height: 1.6;
		color: #e8c77a;
		background: rgba(201, 162, 75, 0.12);
		border: 1rpx solid rgba(201, 162, 75, 0.3);
		margin-bottom: 16rpx;
	}

	.live-notice.red {
		color: #ffb4a8;
		background: rgba(226, 86, 74, 0.12);
		border-color: rgba(226, 86, 74, 0.35);
	}

	.live-orders {
		background: rgba(253, 246, 230, 0.05);
		border-radius: 14rpx;
		padding: 4rpx 20rpx;
	}

	.live-order {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18rpx 0;
		border-bottom: 1rpx solid rgba(253, 246, 230, 0.06);
		font-size: 23rpx;
		color: rgba(253, 246, 230, 0.82);
	}

	.live-order:last-child {
		border-bottom: 0;
	}

	.lo-id {
		font-family: 'DIN Alternate', monospace;
	}

	.lo-time {
		color: rgba(253, 246, 230, 0.4);
		font-size: 20rpx;
	}

	.lo-amt {
		color: #f0c987;
		font-weight: 700;
	}

	.lo-empty {
		padding: 26rpx 0;
		text-align: center;
		font-size: 22rpx;
		color: rgba(253, 246, 230, 0.4);
	}

	.live-net {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 18rpx;
		font-size: 21rpx;
		color: rgba(253, 246, 230, 0.55);
	}

	.live-link {
		color: #e8c77a;
		font-size: 21rpx;
	}

	.demo-order {
		display: block;
		text-align: right;
		margin-top: 10rpx;
		opacity: 0.7;
	}

	.live-tip {
		display: block;
		margin-top: 18rpx;
		font-size: 19rpx;
		line-height: 1.6;
		color: rgba(253, 246, 230, 0.32);
	}

	.live-foot {
		flex-shrink: 0;
		padding: 16rpx 28rpx;
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
		border-top: 1rpx solid rgba(253, 246, 230, 0.08);
	}

	.live-end {
		height: 92rpx;
		line-height: 92rpx;
		text-align: center;
		border-radius: 14rpx;
		font-size: 30rpx;
		font-weight: 700;
		letter-spacing: 4rpx;
		color: #fdf6e6;
		background: linear-gradient(135deg, #d24a3d 0%, #a8302a 100%);
		border: 1rpx solid rgba(201, 162, 75, 0.5);
	}

	.live-empty {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
	}

	.live-empty-ico {
		font-family: 'STKaiti', serif;
		font-size: 90rpx;
		color: rgba(201, 162, 75, 0.4);
	}

	.live-empty-t {
		font-size: 26rpx;
		color: rgba(253, 246, 230, 0.6);
	}

	.live-empty-btn {
		margin-top: 20rpx;
		height: 76rpx;
		padding: 0 40rpx;
		line-height: 76rpx;
		border-radius: 10rpx;
		border: 1rpx solid rgba(201, 162, 75, 0.5);
		color: #e8c77a;
		font-size: 24rpx;
	}

	.live-mask {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.55);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 99;
	}

	.live-dialog {
		width: 560rpx;
		border-radius: 20rpx;
		padding: 40rpx 32rpx 0;
		background: #f4ecdb;
		text-align: center;
	}

	.ld-t {
		display: block;
		font-family: 'STKaiti', serif;
		font-size: 33rpx;
		font-weight: 700;
		color: #1a1815;
	}

	.ld-c {
		display: block;
		margin-top: 14rpx;
		font-size: 24rpx;
		line-height: 1.7;
		color: #5b5348;
	}

	.ld-a {
		display: flex;
		margin-top: 30rpx;
		border-top: 1rpx solid rgba(201, 162, 75, 0.3);
	}

	.ld-btn {
		flex: 1;
		height: 96rpx;
		line-height: 96rpx;
		font-size: 27rpx;
		color: #5b5348;
	}

	.ld-btn.primary {
		color: #b23a2e;
		font-weight: 700;
		border-left: 1rpx solid rgba(201, 162, 75, 0.3);
	}
</style>
