<template>
	<view class="page gf-page">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">考勤日历</text>
				<text class="gf-subtitle">{{ month }} 月 · 迟到 / 缺勤 / 情绪假</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<view class="gf-kpi-grid three">
					<view class="gf-kpi">
						<text class="gf-kpi-l">迟到</text>
						<text class="gf-kpi-v">{{ late }}</text>
						<text class="gf-kpi-s">次</text>
					</view>
					<view class="gf-kpi">
						<text class="gf-kpi-l">鸽播</text>
						<text class="gf-kpi-v">{{ pigeon }}</text>
						<text class="gf-kpi-s">次</text>
					</view>
					<view class="gf-kpi">
						<text class="gf-kpi-l">情绪假</text>
						<text class="gf-kpi-v">{{ emoLeft }}</text>
						<text class="gf-kpi-s">本季剩余</text>
					</view>
				</view>

				<view class="gf-card">
					<view class="gf-card-title">
						<text>{{ month }} 月</text>
						<text class="gf-card-title-sub">休息已用 {{ restTaken }} / {{ monthRest }} 天</text>
					</view>

					<view class="cal-head">
						<text v-for="w in week" :key="w" class="cal-w">{{ w }}</text>
					</view>
					<view class="cal-grid">
						<view v-for="b in blanks" :key="'b' + b" class="cal-cell empty"></view>
						<view
							v-for="c in cells"
							:key="c.day"
							class="cal-cell"
							:class="[c.type, { today: c.today }]"
						>
							<text class="cal-d">{{ c.day }}</text>
							<text v-if="c.type" class="cal-t">{{ markOf(c.type) }}</text>
						</view>
					</view>

					<view class="legend">
						<view class="lg"><i class="dot ok"></i><text>准时</text></view>
						<view class="lg"><i class="dot late"></i><text>迟到</text></view>
						<view class="lg"><i class="dot bs"></i><text>黑天鹅豁免</text></view>
						<view class="lg"><i class="dot rest"></i><text>休息</text></view>
					</view>
				</view>

				<view class="gf-card">
					<view class="gf-card-title"><text>口径说明</text></view>
					<view class="gf-row">
						<text class="gf-row-k">迟到判定</text>
						<text class="gf-row-v">开播时间后 5 分钟内未上播</text>
					</view>
					<view class="gf-row">
						<text class="gf-row-k">鸽播判定</text>
						<text class="gf-row-v">整场未上播且未报备</text>
					</view>
					<view class="gf-row">
						<text class="gf-row-k">黑天鹅</text>
						<text class="gf-row-v">断网 / 平台限流 / 中控断播，经运营认定豁免</text>
					</view>
					<view class="gf-row">
						<text class="gf-row-k">情绪假</text>
						<text class="gf-row-v">每季 1 天，需提前 24 小时申请</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { getAttendance } from '@/api/mp'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				week: ['日', '一', '二', '三', '四', '五', '六'],
				month: new Date().getMonth() + 1,
				firstWeekday: 0,
				cells: [],
				late: 0,
				pigeon: 0,
				emoLeft: 1,
				restTaken: 0,
				monthRest: 4
			}
		},
		computed: {
			blanks() {
				return Array.from({ length: this.firstWeekday }, (_, i) => i)
			}
		},
		onLoad() {
			this.load()
		},
		methods: {
			async load() {
				const d = await getAttendance()
				this.month = d.month
				this.firstWeekday = d.firstWeekday
				this.cells = d.cells || []
				this.late = d.late || 0
				this.pigeon = d.pigeon || 0
				this.emoLeft = d.emoLeft || 0
				this.restTaken = d.restTaken || 0
				this.monthRest = d.monthRest || 4
			},
			markOf(t) {
				return { ok: '·', late: '迟', bs: '免', rest: '休' }[t] || ''
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

	.cal-head {
		display: flex;
		margin: 8rpx 0 6rpx;
	}

	.cal-w {
		flex: 1;
		text-align: center;
		font-size: 20rpx;
		color: $gf-ink-3;
	}

	.cal-grid {
		display: flex;
		flex-wrap: wrap;
	}

	.cal-cell {
		width: 14.28%;
		height: 76rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2rpx;
		position: relative;
	}

	.cal-cell.empty {
		height: 0;
	}

	.cal-d {
		font-size: 24rpx;
		color: $gf-ink-2;
	}

	.cal-t {
		font-size: 16rpx;
		line-height: 1;
	}

	.cal-cell.ok .cal-d {
		color: #2f6a52;
	}

	.cal-cell.ok .cal-t {
		color: rgba(58, 106, 82, 0.75);
	}

	.cal-cell.late .cal-d {
		color: #8a6a1f;
		font-weight: 700;
	}

	.cal-cell.late .cal-t {
		color: #8a6a1f;
	}

	.cal-cell.bs .cal-d {
		color: $gf-indigo;
		font-weight: 700;
	}

	.cal-cell.bs .cal-t {
		color: $gf-indigo;
	}

	.cal-cell.rest .cal-d {
		color: $gf-ink-3;
	}

	.cal-cell.rest .cal-t {
		color: $gf-ink-3;
	}

	.cal-cell.today {
		background: rgba(178, 58, 46, 0.07);
		border-radius: 10rpx;
	}

	.cal-cell.today .cal-d {
		color: $gf-cinnabar;
		font-weight: 700;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 18rpx;
		margin-top: 16rpx;
		padding-top: 16rpx;
		border-top: 1rpx solid $gf-line-soft;
	}

	.lg {
		display: flex;
		align-items: center;
		gap: 8rpx;
		font-size: 19rpx;
		color: $gf-ink-3;
	}

	.dot {
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		display: block;
	}

	.dot.ok {
		background: #2f6a52;
	}

	.dot.late {
		background: $gf-gold;
	}

	.dot.bs {
		background: $gf-indigo;
	}

	.dot.rest {
		background: rgba(140, 130, 116, 0.45);
	}
</style>
