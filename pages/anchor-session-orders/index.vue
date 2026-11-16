<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">本场订单</text>
				<text class="gf-subtitle">按支付时间自动归属</text>
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
					<view class="gf-card">
						<view class="gf-row">
							<text class="gf-row-k">场次</text>
							<text class="gf-row-v">{{ mdhm(session.startAt) }}–{{ session.endAt ? hm(session.endAt) : '直播中' }}</text>
						</view>
						<view class="gf-row">
							<text class="gf-row-k">房间 / 视频号</text>
							<text class="gf-row-v">{{ session.roomNo }} · {{ session.accName }}</text>
						</view>
						<view class="gf-row">
							<text class="gf-row-k">单量 / GMV</text>
							<text class="gf-row-v strong">{{ stats.n }} 单 · {{ money(stats.gmv) }}</text>
						</view>
					</view>

					<view class="gf-card">
						<view v-for="o in orders" :key="o.id" class="order-row">
							<view class="order-main">
								<text class="order-id">{{ maskNo(o.id) }}</text>
								<text class="order-sub">{{ hm(o.payAt) }} · {{ o.flag || '自动归属' }}</text>
							</view>
							<view class="order-right">
								<text class="order-amt">{{ money(o.amt) }}</text>
								<text class="gf-tag" :class="tagOf(o)">{{ o.refund ? '已退款' : o.validity }}</text>
							</view>
						</view>
						<view v-if="!orders.length" class="gf-state small">
							<text class="gf-state-text">本场暂无订单</text>
						</view>
					</view>

					<text class="gf-hint gf-hint-c">订单号已脱敏 · 有效：收货满 7 天或支付满 15 天</text>
				</template>
			</view>
		</scroll-view>

		<view v-if="session" class="gf-foot">
			<view class="gf-btn gf-btn-ghost" @click="openClaim">申诉掉单</view>
		</view>

		<!-- 申诉掉单 -->
		<view v-if="claim.show" class="gf-mask" @click="claim.show = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd">
					申诉掉单
					<text class="gf-sheet-x" @click="claim.show = false">×</text>
				</view>
				<view class="gf-sheet-bd">
					<text class="gf-hint">选择同视频号、本场前后归属小店的订单；提交后进入异常池，由运营核实。</text>

					<view v-if="candidates.length" class="cand-list">
						<view
							v-for="c in candidates"
							:key="c.id"
							class="cand"
							:class="{ on: claim.orderId === c.id }"
							@click="claim.orderId = c.id"
						>
							<view class="cand-radio">{{ claim.orderId === c.id ? '✓' : '' }}</view>
							<view class="cand-main">
								<text class="cand-id">{{ maskNo(c.id) }}</text>
								<text class="cand-sub">{{ mdhm(c.payAt) }} · {{ money(c.amt) }} · 当前归小店</text>
							</view>
						</view>
					</view>
					<view v-else class="gf-field">
						<text class="gf-label">订单号</text>
						<input class="gf-input" v-model="claim.orderId" placeholder="输入完整订单号" />
					</view>

					<view class="gf-field claim-reason">
						<text class="gf-label"><text class="gf-req">*</text>说明</text>
						<textarea class="gf-textarea" v-model="claim.reason" placeholder="例如：开播前预热时用户已下单，扫码晚了 2 分钟" />
					</view>
				</view>
				<view class="gf-sheet-ft">
					<view class="gf-btn gf-btn-ghost" @click="claim.show = false">取消</view>
					<view class="gf-btn gf-btn-primary" @click="submitClaim">提交申诉</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getSessionOrders, claimOrder } from '@/api/mp'
	import { money, maskNo } from '@/utils/mp-format'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				id: '',
				session: null,
				stats: { n: 0, gmv: 0 },
				orders: [],
				candidates: [],
				claim: { show: false, orderId: '', reason: '' }
			}
		},
		onLoad(q) {
			this.id = (q && q.id) || ''
			this.load()
		},
		methods: {
			money,
			maskNo,
			hm(ts) {
				const d = new Date(ts)
				return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
			},
			mdhm(ts) {
				const d = new Date(ts)
				return (
					String(d.getMonth() + 1).padStart(2, '0') +
					'-' +
					String(d.getDate()).padStart(2, '0') +
					' ' +
					String(d.getHours()).padStart(2, '0') +
					':' +
					String(d.getMinutes()).padStart(2, '0')
				)
			},
			tagOf(o) {
				if (o.refund) return 'gf-tag-red'
				if (o.validity === '有效') return 'gf-tag-ink'
				return 'gf-tag-gray'
			},
			async load() {
				const d = await getSessionOrders(this.id)
				if (!d) return
				this.session = d.session
				this.stats = d.stats
				this.orders = d.orders
				this.candidates = d.candidates || []
			},
			openClaim() {
				this.claim = {
					show: true,
					orderId: this.candidates.length ? this.candidates[0].id : '',
					reason: '开播前预热时用户已下单，扫码晚了 2 分钟'
				}
			},
			async submitClaim() {
				if (!this.claim.orderId) {
					uni.showToast({ title: '请选择或输入订单号', icon: 'none' })
					return
				}
				if (!String(this.claim.reason || '').trim()) {
					uni.showToast({ title: '请填写说明', icon: 'none' })
					return
				}
				await claimOrder({ orderId: this.claim.orderId, reason: this.claim.reason })
				this.claim.show = false
				uni.showToast({ title: '已提交，运营将在 24h 内处理', icon: 'success' })
				this.load()
			},
			goBack() {
				goBack('/pages/anchor-performance/index')
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

	.order-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
		padding: 18rpx 0;
		border-bottom: 1rpx solid $gf-line-soft;
	}

	.order-row:last-child {
		border-bottom: 0;
	}

	.order-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.order-id {
		font-family: 'DIN Alternate', monospace;
		font-size: 25rpx;
		color: $gf-ink;
	}

	.order-sub {
		font-size: 20rpx;
		color: $gf-ink-3;
	}

	.order-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 6rpx;
	}

	.order-amt {
		font-family: 'STKaiti', serif;
		font-size: 28rpx;
		font-weight: 700;
		color: $gf-ink;
	}

	.cand-list {
		margin: 18rpx 0;
	}

	.cand {
		display: flex;
		align-items: center;
		gap: 14rpx;
		padding: 16rpx 18rpx;
		border: 1rpx solid $gf-line-soft;
		border-radius: 10rpx;
		margin-bottom: 12rpx;
		background: rgba(255, 253, 247, 0.7);
	}

	.cand.on {
		border-color: $gf-cinnabar;
		background: rgba(178, 58, 46, 0.05);
	}

	.cand-radio {
		width: 36rpx;
		height: 36rpx;
		line-height: 32rpx;
		text-align: center;
		border-radius: 50%;
		border: 2rpx solid rgba(140, 130, 116, 0.4);
		font-size: 20rpx;
		color: #fdf6e6;
		flex-shrink: 0;
	}

	.cand.on .cand-radio {
		background: $gf-cinnabar;
		border-color: $gf-cinnabar;
	}

	.cand-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.cand-id {
		font-family: 'DIN Alternate', monospace;
		font-size: 24rpx;
		color: $gf-ink;
	}

	.cand-sub {
		font-size: 20rpx;
		color: $gf-ink-3;
	}

	.claim-reason {
		margin-top: 12rpx;
	}
</style>
