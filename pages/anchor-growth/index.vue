<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">成长与晋升</text>
				<text class="gf-subtitle">等级 · 门槛 · 30 天起步</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<view class="gr-hero">
					<text class="gr-l">当前等级</text>
					<text class="gr-lv">{{ profile.posText }}</text>
					<view class="gr-tags">
						<text class="gr-tag">{{ profile.groupName }}</text>
						<text class="gr-tag">{{ profile.emp }}</text>
						<text class="gr-tag">{{ profile.join }} 入职</text>
					</view>
				</view>

				<!-- 下一级 -->
				<view class="gf-card">
					<view class="gf-card-title">
						<text>下一级门槛</text>
						<text class="gf-card-title-sub">{{ nextLevel ? nextLevel[0] : '已是最高级' }}</text>
					</view>
					<view v-if="nextLevel" class="gf-notice ink">
						<text class="gf-notice-main">{{ nextLevel[1] }}</text>
					</view>
					<view v-else class="gf-notice">
						<text class="gf-notice-main">已是最高等级，可参与年度竞聘进入管理层。</text>
					</view>
					<view v-if="suggest" class="gf-row">
						<text class="gf-row-k">系统建议</text>
						<text class="gf-row-v">冲刺 {{ suggest.to }} · {{ suggest.why }}</text>
					</view>
				</view>

				<!-- 近 3 月有效 GMV -->
				<view class="gf-card">
					<view class="gf-card-title">
						<text>近 3 月有效 GMV</text>
						<text class="gf-card-title-sub">提成按阶梯全额跳档</text>
					</view>
					<view v-for="(h, i) in bars" :key="i" class="bar-row">
						<text class="bar-l">{{ h.label }}</text>
						<view class="bar-track"><i :style="{ width: h.p + '%' }"></i></view>
						<text class="bar-v">{{ wan(h.v) }}</text>
					</view>
					<view class="gf-divider"></view>
					<view class="gf-row">
						<text class="gf-row-k">阶梯口径</text>
						<text class="gf-row-v">≥6 万 8% · ≥10 万 10% · 首席 12%</text>
					</view>
				</view>

				<!-- 30 天起步 -->
				<view class="gf-card">
					<view class="gf-card-title">
						<text>30 天起步计划</text>
						<text class="gf-card-title-sub">{{ onboard ? '第 ' + onboard.day + ' / 30 天' : '已完成' }}</text>
					</view>
					<block v-if="onboard">
						<view class="gf-prog ob-prog"><i :style="{ width: obPercent + '%' }"></i></view>
						<view v-for="(n, i) in onboard.nodes" :key="i" class="gf-step">
							<view class="gf-step-node" :class="{ done: n.done, active: n.active && !n.done }">
								{{ n.done ? '✓' : i + 1 }}
							</view>
							<view class="gf-step-main">
								<text class="gf-step-t">{{ n.text }}</text>
								<text class="gf-step-d">{{ n.done ? '已完成' : n.active ? '进行中' : '待开始' }}</text>
							</view>
						</view>
					</block>
					<view v-else class="gf-state small">
						<text class="gf-state-text">你已过 30 天起步期，进入常规考核</text>
					</view>
				</view>

				<text class="gf-hint gf-hint-c">
					等级与有效 GMV 挂钩；退款、取消订单不计入有效 GMV。
				</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { getGrowth } from '@/api/mp'
	import { wan, monthStart } from '@/utils/mp-format'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				profile: {},
				onboard: null,
				history: [],
				suggest: null,
				nextLevel: null
			}
		},
		computed: {
			bars() {
				const max = Math.max(1, ...this.history.map((v) => Number(v) || 0))
				const base = new Date(monthStart())
				return this.history.map((v, i) => {
					const d = new Date(base.getFullYear(), base.getMonth() - (this.history.length - 1 - i), 1)
					return {
						label: d.getMonth() + 1 + ' 月',
						v: Number(v) || 0,
						p: Math.round(((Number(v) || 0) / max) * 100)
					}
				})
			},
			obPercent() {
				if (!this.onboard) return 100
				const done = (this.onboard.nodes || []).filter((n) => n.done).length
				return Math.round((done / ((this.onboard.nodes || []).length || 1)) * 100)
			}
		},
		onLoad() {
			this.load()
		},
		methods: {
			wan,
			async load() {
				const d = await getGrowth()
				this.profile = d.profile || {}
				this.onboard = d.onboard || null
				this.history = d.history || []
				this.suggest = d.suggest || null
				this.nextLevel = d.nextLevel || null
			},
			goBack() {
				goBack('/pages/anchor-mine/index')
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

	.gr-hero {
		background: linear-gradient(150deg, #26241f 0%, #3a4a52 78%);
		border-radius: 18rpx;
		padding: 26rpx;
		margin-bottom: 18rpx;
		border: 1rpx solid rgba(201, 162, 75, 0.35);
	}

	.gr-l {
		display: block;
		font-size: 20rpx;
		color: rgba(253, 246, 230, 0.6);
	}

	.gr-lv {
		display: block;
		margin: 8rpx 0 14rpx;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 54rpx;
		font-weight: 700;
		color: #fdf6e6;
		line-height: 1.1;
	}

	.gr-tags {
		display: flex;
		gap: 10rpx;
		flex-wrap: wrap;
	}

	.gr-tag {
		height: 34rpx;
		line-height: 32rpx;
		padding: 0 12rpx;
		border-radius: 4rpx;
		font-size: 19rpx;
		color: #fdf6e6;
		background: rgba(253, 246, 230, 0.14);
		border: 1rpx solid rgba(253, 246, 230, 0.26);
	}

	.bar-row {
		display: flex;
		align-items: center;
		gap: 14rpx;
		padding: 12rpx 0;
	}

	.bar-l {
		width: 76rpx;
		font-size: 20rpx;
		color: $gf-ink-3;
		flex-shrink: 0;
	}

	.bar-track {
		flex: 1;
		height: 16rpx;
		border-radius: 8rpx;
		background: rgba(140, 130, 116, 0.16);
		overflow: hidden;
	}

	.bar-track i {
		display: block;
		height: 100%;
		border-radius: 8rpx;
		background: linear-gradient(90deg, #c9a24b 0%, #b23a2e 100%);
	}

	.bar-v {
		width: 92rpx;
		text-align: right;
		font-size: 21rpx;
		color: $gf-ink;
		font-weight: 600;
		flex-shrink: 0;
	}

	.ob-prog {
		margin: 6rpx 0 16rpx;
	}
</style>
