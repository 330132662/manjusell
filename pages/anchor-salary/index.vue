<template>
	<view class="page gf-page">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">我的工资</text>
				<text class="gf-subtitle">16 日推送 · 5 日内确认 · 20 日发放</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<!-- 主卡 -->
				<view class="pay-hero">
					<text class="pay-period">
						{{ salary.st === '待核算' ? history[1].period : salary.period }} 月实发 · 模板：{{ salary.tpl }}
					</text>
					<text class="pay-num">{{ money(salary.st === '待核算' ? history[1].net : salary.net) }}</text>
					<view class="pay-acts">
						<view class="pay-btn ghost" @click="goPayslip(salary.st === '待核算' ? history[1].period : salary.period)">
							查看明细
						</view>
						<view v-if="salary.canAdvance" class="pay-btn solid" @click="go('/pages/anchor-advance/index')">
							预支 · 可借 {{ wan(salary.quota) }}
						</view>
					</view>
				</view>

				<view class="gf-card">
					<view class="gf-card-title">
						<text>工资条</text>
						<text class="gf-card-title-sub">近 3 个月</text>
					</view>
					<view v-for="h in history" :key="h.period" class="gf-li" @click="goPayslip(h.period)">
						<view class="gf-li-ico" :class="h.st === '待确认' ? '' : 'ink'">薪</view>
						<view class="gf-li-main">
							<text class="gf-li-t">{{ h.period.replace('-', '年') }}月</text>
							<text class="gf-li-d">{{ subText(h) }}</text>
						</view>
						<text class="gf-tag" :class="tagCls(h.st)">{{ h.st }}</text>
						<text class="gf-li-go">›</text>
					</view>
				</view>

				<text class="gf-hint gf-hint-c">
					16 日推送 · 5 日内确认（逾期默认确认）· 20 日发放{{ salary.flex ? ' · 灵活用工平台代发' : '' }}
				</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { getSalary } from '@/api/mp'
	import { money, wan } from '@/utils/mp-format'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				salary: { period: '', net: 0, st: '', tpl: '', flex: false, canAdvance: true, quota: 0 },
				history: []
			}
		},
		onLoad() {
			this.load()
		},
		onShow() {
			this.load()
		},
		methods: {
			money,
			wan,
			async load() {
				const d = await getSalary()
				this.salary = d
				this.history = d.history
			},
			subText(h) {
				if (h.st === '待核算') return '15 日锁定 · 16 日推送'
				if (h.st === '待确认') return '实发 ' + money(h.net) + ' · 待你确认'
				if (h.st === '异议中') return '实发 ' + money(h.net) + ' · 异议处理中'
				if (h.st === '已确认') return '实发 ' + money(h.net) + ' · 已确认待发放'
				return h.paidAt + ' 已发放'
			},
			tagCls(st) {
				if (st === '待确认') return 'gf-tag-gold'
				if (st === '已发放' || st === '已确认') return 'gf-tag-ink'
				if (st === '异议中') return 'gf-tag-red'
				return 'gf-tag-gray'
			},
			goPayslip(period) {
				uni.navigateTo({ url: '/pages/anchor-payslip/index?p=' + period })
			},
			go(url) {
				uni.navigateTo({ url })
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

	.pay-hero {
		background: linear-gradient(150deg, #26241f 0%, #3a4a52 75%);
		border-radius: 18rpx;
		padding: 28rpx 26rpx 24rpx;
		margin-bottom: 18rpx;
		border: 1rpx solid rgba(201, 162, 75, 0.35);
	}

	.pay-period {
		display: block;
		font-size: 20rpx;
		color: rgba(253, 246, 230, 0.6);
	}

	.pay-num {
		display: block;
		margin: 8rpx 0 22rpx;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 68rpx;
		font-weight: 700;
		color: #fdf6e6;
		line-height: 1.1;
	}

	.pay-acts {
		display: flex;
		gap: 14rpx;
	}

	.pay-btn {
		flex: 1;
		height: 72rpx;
		line-height: 72rpx;
		text-align: center;
		border-radius: 10rpx;
		font-size: 23rpx;
	}

	.pay-btn.ghost {
		color: #fdf6e6;
		background: rgba(253, 246, 230, 0.14);
		border: 1rpx solid rgba(253, 246, 230, 0.24);
	}

	.pay-btn.solid {
		color: #1a1815;
		background: #e8c77a;
		font-weight: 700;
	}
</style>
