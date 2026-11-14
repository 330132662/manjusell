<template>
	<view class="page gf-page">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">OKR 与 KPI</text>
				<text class="gf-subtitle">{{ okr.q }} · 考核结果决定提成系数</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<!-- OKR -->
				<view class="gf-card">
					<view class="gf-card-title">
						<text>目标 O</text>
						<text class="gf-tag" :class="okr.st === '待签收' ? 'gf-tag-gold' : 'gf-tag-ink'">{{ okr.st }}</text>
					</view>
					<text class="o-text">{{ okr.o }}</text>
					<view v-for="(kr, i) in okr.krs" :key="i" class="kr-row">
						<view class="kr-top">
							<text class="kr-t">KR{{ i + 1 }} · {{ kr[0] }}</text>
							<text class="kr-p">{{ pct(kr[1]) }}</text>
						</view>
						<view class="gf-prog"><i :style="{ width: Math.round(kr[1] * 100) + '%' }"></i></view>
					</view>
				</view>

				<!-- KPI -->
				<view class="gf-card">
					<view class="gf-card-title">
						<text>本月 KPI · {{ kpi.period }}</text>
						<text class="gf-card-title-sub">满分 100</text>
					</view>
					<view v-for="it in kpi.items" :key="it.key" class="kpi-row">
						<view class="kpi-l">
							<text class="kpi-n">{{ it.key }}</text>
							<text class="kpi-d">{{ it.desc }}</text>
						</view>
						<text class="kpi-w">权重 {{ it.weight }}%</text>
						<text class="kpi-s">{{ it.score }}</text>
					</view>
				</view>

				<!-- 结果 -->
				<view class="res-hero">
					<view class="res-cell">
						<text class="res-v">{{ kpi.score }}</text>
						<text class="res-k">综合得分</text>
					</view>
					<view class="res-line"></view>
					<view class="res-cell">
						<text class="res-v">{{ kpi.coef }}</text>
						<text class="res-k">提成系数</text>
					</view>
				</view>

				<view class="gf-notice ink">
					<text class="gf-notice-main">
						系数口径：≥90 得 1.2 · ≥80 得 1.0 · ≥70 得 0.8 · ≥60 得 0.6 · 低于 60 得 0.4；系数作用于阶梯提成。
					</text>
				</view>
			</view>
		</scroll-view>

		<view v-if="okr.st === '待签收'" class="gf-foot">
			<view class="gf-btn gf-btn-primary" :class="{ disabled: signing }" @click="sign">
				{{ signing ? '签收中…' : '确认签收考核结果' }}
			</view>
		</view>
	</view>
</template>

<script>
	import { getOkr, signOkr } from '@/api/mp'
	import { pct } from '@/utils/mp-format'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				okr: { q: '', o: '', krs: [], st: '' },
				kpi: { period: '', items: [], score: 0, coef: 1 },
				signing: false
			}
		},
		onLoad() {
			this.load()
		},
		methods: {
			pct,
			async load() {
				const d = await getOkr()
				this.okr = d.okr || this.okr
				this.kpi = d.kpi || this.kpi
			},
			sign() {
				uni.showModal({
					title: '签收考核结果',
					content: '签收后视为认可本月 KPI 与系数，如有异议请在工资条「有异议」中提出。',
					success: async (r) => {
						if (!r.confirm) return
						this.signing = true
						try {
							await signOkr()
							uni.showToast({ title: '已签收', icon: 'success' })
							await this.load()
						} finally {
							this.signing = false
						}
					}
				})
			},
			goBack() {
				goBack('/pages/anchor-mine/index')
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '../../styles/guofeng.scss';

	.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.topbar-holder {
		width: 64rpx;
	}

	.o-text {
		display: block;
		font-size: 27rpx;
		line-height: 1.6;
		color: $gf-ink;
		font-weight: 600;
		margin: 6rpx 0 18rpx;
	}

	.kr-row {
		margin-bottom: 18rpx;
	}

	.kr-row:last-child {
		margin-bottom: 0;
	}

	.kr-top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16rpx;
		margin-bottom: 8rpx;
	}

	.kr-t {
		flex: 1;
		font-size: 22rpx;
		color: $gf-ink-2;
		line-height: 1.5;
	}

	.kr-p {
		font-size: 22rpx;
		color: $gf-cinnabar;
		font-weight: 700;
		flex-shrink: 0;
	}

	.kpi-row {
		display: flex;
		align-items: center;
		gap: 14rpx;
		padding: 16rpx 0;
		border-bottom: 1rpx dashed $gf-line-soft;
	}

	.kpi-row:last-child {
		border-bottom: 0;
		padding-bottom: 0;
	}

	.kpi-l {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2rpx;
	}

	.kpi-n {
		font-size: 25rpx;
		color: $gf-ink;
		font-weight: 600;
	}

	.kpi-d {
		font-size: 19rpx;
		color: $gf-ink-3;
	}

	.kpi-w {
		font-size: 20rpx;
		color: $gf-ink-3;
		flex-shrink: 0;
	}

	.kpi-s {
		width: 72rpx;
		text-align: right;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 32rpx;
		font-weight: 700;
		color: $gf-ink;
		flex-shrink: 0;
	}

	.res-hero {
		display: flex;
		align-items: center;
		background: linear-gradient(150deg, #26241f 0%, #3a4a52 78%);
		border-radius: 18rpx;
		padding: 26rpx 0;
		margin-bottom: 18rpx;
		border: 1rpx solid rgba(201, 162, 75, 0.35);
	}

	.res-cell {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6rpx;
	}

	.res-v {
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 52rpx;
		font-weight: 700;
		color: #fdf6e6;
		line-height: 1.1;
	}

	.res-k {
		font-size: 20rpx;
		color: rgba(253, 246, 230, 0.6);
	}

	.res-line {
		width: 1rpx;
		height: 62rpx;
		background: rgba(253, 246, 230, 0.18);
	}
</style>
