<template>
	<view class="page gf-page">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">{{ periodText }}工资条</text>
				<text class="gf-topbar-mid-sub">{{ p.tpl }}</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<!-- 核算中 -->
				<template v-if="pendingCalc">
					<view class="calc-head">
						<text class="calc-ico">算</text>
						<text class="calc-t">工资核算中</text>
						<text class="calc-d">15 日 24:00 锁定、16 日推送工资条，请在 5 日内确认。</text>
					</view>
					<view class="gf-card">
						<view class="gf-row">
							<text class="gf-row-k">预估应发</text>
							<text class="gf-row-v strong">{{ money(p.gross) }}</text>
						</view>
						<view class="gf-row">
							<text class="gf-row-k">预估实发</text>
							<text class="gf-row-v strong">{{ money(p.net) }}</text>
						</view>
						<view class="gf-row" @click="openEst">
							<text class="gf-row-k">提成预估</text>
							<text class="gf-row-v gf-link">查看 ›</text>
						</view>
					</view>
				</template>

				<!-- 明细 -->
				<template v-else>
					<view class="slip-head">
						<text class="gf-tag" :class="tagCls(p.st)">{{ p.st }}</text>
						<text class="slip-hint">实发工资 · {{ p.tpl }}</text>
						<text class="slip-num">{{ money(p.net) }}</text>
						<view class="slip-sum">
							<text>应发 {{ money(p.gross) }}</text>
							<text>扣减 {{ money(p.dedTotal) }}</text>
						</view>
						<view v-if="p.st === '已发放'" class="gf-notice ink slip-note">
							<text class="gf-notice-main">{{ p.paidAt }} 已发放 · {{ bank }}</text>
						</view>
						<view v-if="objectionText" class="gf-notice slip-note">
							<text class="gf-notice-main">{{ objectionText }}</text>
						</view>
					</view>

					<view class="gf-card">
						<view class="gf-card-title">
							<text>收入</text>
							<text class="gf-card-title-sub">{{ money(p.gross) }}</text>
						</view>
						<view v-for="it in p.inc" :key="it.no" class="item-row" @click="openItem(it, false)">
							<text class="item-no">{{ it.no }}</text>
							<view class="item-main">
								<text class="item-name">{{ it.name }}</text>
								<text class="item-f">{{ it.f }}</text>
							</view>
							<text class="item-amt">{{ money(it.amt) }}</text>
							<text class="gf-li-go">›</text>
						</view>
					</view>

					<view class="gf-card">
						<view class="gf-card-title">
							<text>扣减</text>
							<text class="gf-card-title-sub down">-{{ money(p.dedTotal) }}</text>
						</view>
						<view v-for="it in p.ded" :key="it.no" class="item-row" @click="openItem(it, true)">
							<text class="item-no">{{ it.no }}</text>
							<view class="item-main">
								<text class="item-name">{{ it.name }}</text>
								<text class="item-f">{{ it.f }}</text>
							</view>
							<text class="item-amt minus">{{ it.amt ? '-' : '' }}{{ money(it.amt) }}</text>
							<text class="gf-li-go">›</text>
						</view>
					</view>
				</template>
			</view>
		</scroll-view>

		<view v-if="p.st === '待确认'" class="gf-foot confirm-foot">
			<view class="foot-tip">剩余 {{ leftText }}，逾期系统默认确认</view>
			<view class="foot-btns">
				<view class="gf-btn gf-btn-ghost" @click="goObjection">有异议</view>
				<view class="gf-btn gf-btn-primary" @click="askConfirm = true">确认无误</view>
			</view>
		</view>

		<!-- 明细项弹层 -->
		<view v-if="item.show" class="gf-mask" @click="item.show = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd">
					{{ item.no }}. {{ item.name }}
					<text class="gf-sheet-x" @click="item.show = false">×</text>
				</view>
				<view class="gf-sheet-bd">
					<view class="item-top">
						<text class="item-big" :class="{ minus: item.minus }">{{ item.minus && item.amt ? '-' : '' }}{{ money(item.amt) }}</text>
						<text class="gf-hint">{{ item.f }}</text>
					</view>
					<view class="gf-row">
						<text class="gf-row-k">计算口径</text>
						<text class="gf-row-v">{{ item.f }}</text>
					</view>
					<view class="gf-row">
						<text class="gf-row-k">结算周期</text>
						<text class="gf-row-v">{{ p.period }}</text>
					</view>
					<text class="gf-hint item-tip">如对本项有疑问，可在工资条底部发起「有异议」，财务将逐项核对。</text>
				</view>
			</view>
		</view>

		<!-- 确认弹窗 -->
		<view v-if="askConfirm" class="gf-mask center" @click="askConfirm = false">
			<view class="gf-dialog" @click.stop>
				<text class="gf-dialog-t">确认工资条无误？</text>
				<text class="gf-dialog-c">确认后进入发放流程；如后续发现差错可联系财务补发 / 红冲。</text>
				<view class="gf-dialog-a">
					<view class="gf-btn gf-btn-ghost" @click="askConfirm = false">取消</view>
					<view class="gf-btn gf-btn-primary" @click="doConfirm">确认</view>
				</view>
			</view>
		</view>

		<!-- 提成预估 -->
		<view v-if="est.show" class="gf-mask" @click="est.show = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd">
					提成预估
					<text class="gf-sheet-x" @click="est.show = false">×</text>
				</view>
				<view class="gf-sheet-bd">
					<view class="item-top">
						<text class="item-big">{{ money(est.amount) }}</text>
						<text class="gf-hint">成交 GMV {{ money(est.gmv) }} × {{ pct(est.rate) }}</text>
					</view>
					<text class="gf-hint">预估以成交计；正式工资按有效 GMV 于每月 15 日核算。</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getPayslip, confirmPayslip, getCommission } from '@/api/mp'
	import { money, pct, clock as clockFmt } from '@/utils/mp-format'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				period: '',
				p: { period: '', st: '', tpl: '', inc: [], ded: [], gross: 0, dedTotal: 0, net: 0, isCurrent: false },
				item: { show: false, no: '', name: '', f: '', amt: 0, minus: false },
				est: { show: false, amount: 0, gmv: 0, rate: 0.05 },
				askConfirm: false,
				leftText: '',
				timer: null
			}
		},
		computed: {
			periodText() {
				return this.p.period ? this.p.period.replace('-', '年') : ''
			},
			pendingCalc() {
				return this.p.isCurrent && this.p.st === '待核算'
			},
			bank() {
				return '招商银行 尾号 6688'
			},
			objectionText() {
				if (this.p.objection && this.p.objection.result) return this.p.objection.result
				if (this.p.st === '异议中') return '异议处理中，本月照常发放，成立差额次月补发'
				return ''
			}
		},
		onLoad(q) {
			this.period = (q && q.p) || ''
			this.load()
		},
		onUnload() {
			if (this.timer) clearInterval(this.timer)
		},
		methods: {
			money,
			pct,
			async load() {
				this.p = await getPayslip(this.period)
				this.period = this.p.period
				this.startCountdown()
			},
			startCountdown() {
				if (this.timer) clearInterval(this.timer)
				if (this.p.st !== '待确认') return
				const end = (this.p.pushAt || Date.now()) + 5 * 86400000
				const tick = () => {
					this.leftText = clockFmt(end - Date.now())
				}
				tick()
				this.timer = setInterval(tick, 1000)
			},
			tagCls(st) {
				if (st === '待确认') return 'gf-tag-gold'
				if (st === '已发放' || st === '已确认') return 'gf-tag-ink'
				if (st === '异议中') return 'gf-tag-red'
				return 'gf-tag-gray'
			},
			openItem(it, minus) {
				this.item = { show: true, ...it, minus }
			},
			async openEst() {
				const d = await getCommission()
				this.est = { show: true, ...d }
			},
			goObjection() {
				uni.navigateTo({ url: '/pages/anchor-salary-objection/index?p=' + this.p.period })
			},
			async doConfirm() {
				await confirmPayslip()
				this.askConfirm = false
				uni.showToast({ title: '已确认', icon: 'success' })
				this.load()
			},
			goBack() {
				goBack('/pages/anchor-salary/index')
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

	.gf-topbar-mid-sub {
		font-size: 19rpx;
		color: $gf-ink-3;
		margin-top: 2rpx;
	}

	.calc-head {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 50rpx 20rpx 30rpx;
	}

	.calc-ico {
		width: 100rpx;
		height: 100rpx;
		line-height: 96rpx;
		text-align: center;
		border-radius: 50%;
		border: 2rpx solid rgba(201, 162, 75, 0.5);
		color: #8a6a1f;
		font-family: 'STKaiti', serif;
		font-size: 40rpx;
		background: rgba(201, 162, 75, 0.1);
	}

	.calc-t {
		margin-top: 20rpx;
		font-family: 'STKaiti', serif;
		font-size: 34rpx;
		font-weight: 700;
		color: $gf-ink;
	}

	.calc-d {
		margin-top: 10rpx;
		font-size: 22rpx;
		color: $gf-ink-3;
		text-align: center;
		line-height: 1.6;
	}

	.slip-head {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 24rpx 20rpx 26rpx;
	}

	.slip-hint {
		margin-top: 12rpx;
		font-size: 21rpx;
		color: $gf-ink-3;
	}

	.slip-num {
		margin: 6rpx 0 10rpx;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 74rpx;
		font-weight: 700;
		color: $gf-ink;
		line-height: 1.1;
	}

	.slip-sum {
		display: flex;
		gap: 36rpx;
		font-size: 23rpx;
		color: $gf-ink-2;
	}

	.slip-note {
		width: 100%;
		margin: 18rpx 0 0;
		justify-content: center;
	}

	.item-row {
		display: flex;
		align-items: center;
		gap: 14rpx;
		padding: 18rpx 0;
		border-bottom: 1rpx solid $gf-line-soft;
	}

	.item-row:last-child {
		border-bottom: 0;
	}

	.item-no {
		width: 36rpx;
		font-size: 20rpx;
		color: $gf-ink-3;
		flex-shrink: 0;
	}

	.item-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.item-name {
		font-size: 25rpx;
		color: $gf-ink;
	}

	.item-f {
		font-size: 19rpx;
		color: $gf-ink-3;
	}

	.item-amt {
		font-family: 'STKaiti', serif;
		font-size: 27rpx;
		font-weight: 700;
		color: $gf-ink;
	}

	.item-amt.minus,
	.down {
		color: $gf-cinnabar;
	}

	.confirm-foot {
		flex-direction: column;
		gap: 10rpx;
	}

	.foot-tip {
		text-align: center;
		font-size: 20rpx;
		color: $gf-ink-3;
	}

	.foot-btns {
		display: flex;
		gap: 14rpx;
	}

	.foot-btns .gf-btn {
		flex: 1;
	}

	.item-top {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
		padding: 8rpx 0 24rpx;
	}

	.item-big {
		font-family: 'STKaiti', serif;
		font-size: 56rpx;
		font-weight: 700;
		color: $gf-ink;
	}

	.item-big.minus {
		color: $gf-cinnabar;
	}

	.item-tip {
		display: block;
		margin-top: 22rpx;
	}
</style>
