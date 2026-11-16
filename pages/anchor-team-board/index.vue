<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">本组看板</text>
				<text class="gf-subtitle">人效 · 组员 · 组长上播</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<view v-if="forbidden" class="gf-state">
					<text class="gf-state-ico">锁</text>
					<text class="gf-state-text">仅组长 / 副组长可见</text>
				</view>

				<template v-else>
					<view class="board-hero">
						<view class="bh-grid">
							<view class="bh-cell">
								<text class="bh-v">{{ wan(d.gmv) }}</text>
								<text class="bh-l">团队有效 GMV</text>
							</view>
							<view class="bh-cell">
								<text class="bh-v">{{ wan(d.eff) }}</text>
								<text class="bh-l">人效</text>
							</view>
							<view class="bh-cell">
								<text class="bh-v">{{ d.effK }}</text>
								<text class="bh-l">人效系数</text>
							</view>
						</view>
						<text class="bh-tip">分母 {{ d.den }} 人（不含组长）· ≥7 万 1.2 / 5–7 万 1.0 / 3–5 万 0.7</text>
					</view>

					<view class="gf-card">
						<view class="gf-card-title">
							<text>组长上播</text>
							<text class="gf-card-title-sub">{{ d.leaderSessions }}/{{ d.leaderTarget }} 场</text>
						</view>
						<view class="gf-prog ink">
							<i :style="{ width: leaderPercent + '%' }"></i>
						</view>
						<text class="gf-hint board-hint">不足 15 场管理津贴按比例发放</text>
					</view>

					<view class="gf-card">
						<view class="gf-card-title">
							<text>组员今日</text>
							<text class="gf-card-title-sub">场次 / 单量</text>
						</view>
						<view v-for="m in d.members" :key="m.id" class="gf-row">
							<view class="mem-left">
								<text class="mem-name">{{ m.name }}</text>
								<text class="mem-pos">{{ m.posText }}</text>
								<text v-if="m.live" class="gf-tag gf-tag-red mem-live">直播中</text>
							</view>
							<text class="gf-row-v">{{ m.sessions }} 场 · {{ m.orders }} 单</text>
						</view>
					</view>
				</template>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { getTeamBoard } from '@/api/mp'
	import { wan } from '@/utils/mp-format'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				forbidden: false,
				d: { gmv: 0, eff: 0, effK: 0, den: 0, leaderSessions: 0, leaderTarget: 15, members: [] }
			}
		},
		computed: {
			leaderPercent() {
				return Math.min(100, (this.d.leaderSessions / this.d.leaderTarget) * 100)
			}
		},
		onLoad() {
			this.load()
		},
		methods: {
			wan,
			async load() {
				const d = await getTeamBoard()
				this.forbidden = !!d.forbidden
				if (!d.forbidden) this.d = d
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

	.board-hero {
		background: linear-gradient(150deg, #26241f 0%, #3a4a52 72%);
		border-radius: 18rpx;
		padding: 28rpx 24rpx 20rpx;
		margin-bottom: 18rpx;
		border: 1rpx solid rgba(201, 162, 75, 0.35);
	}

	.bh-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10rpx;
	}

	.bh-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4rpx;
	}

	.bh-v {
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 40rpx;
		font-weight: 700;
		color: #fdf6e6;
	}

	.bh-l {
		font-size: 19rpx;
		color: rgba(253, 246, 230, 0.55);
	}

	.bh-tip {
		display: block;
		text-align: center;
		margin-top: 16rpx;
		font-size: 18rpx;
		color: rgba(253, 246, 230, 0.4);
	}

	.board-hint {
		display: block;
		margin-top: 10rpx;
	}

	.mem-left {
		display: flex;
		align-items: center;
		gap: 10rpx;
		flex: 1;
		min-width: 0;
	}

	.mem-name {
		font-size: 25rpx;
		color: $gf-ink;
		font-weight: 600;
	}

	.mem-pos {
		font-size: 19rpx;
		color: $gf-ink-3;
	}

	.mem-live {
		transform: scale(0.86);
	}
</style>
