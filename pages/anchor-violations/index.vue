<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">违规与交接红线</text>
				<text class="gf-subtitle">24 小时内可申诉 · 交接扣款 200 / 场</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<view class="gf-tabs">
			<view class="gf-tabs-i" :class="{ on: tab === 'v' }" @click="tab = 'v'">违规 {{ violations.length }}</view>
			<view class="gf-tabs-i" :class="{ on: tab === 'h' }" @click="tab = 'h'">交接红线 {{ handovers.length }}</view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<!-- 违规 -->
				<block v-if="tab === 'v'">
					<view v-if="violations.length">
						<view v-for="v in violations" :key="v.id" class="gf-card vio-card">
							<view class="vio-head">
								<text class="vio-lv" :class="{ high: v.level !== '一级' }">{{ v.level }}</text>
								<text class="vio-t">{{ v.desc }}</text>
							</view>
							<view class="gf-row">
								<text class="gf-row-k">扣款</text>
								<text class="gf-row-v strong">{{ money(v.amt) }}</text>
							</view>
							<view class="gf-row">
								<text class="gf-row-k">记录时间</text>
								<text class="gf-row-v">{{ mdhm(v.at) }}</text>
							</view>
							<view class="gf-row">
								<text class="gf-row-k">状态</text>
								<text class="gf-row-v">{{ stText(v) }}</text>
							</view>

							<view v-if="v.can" class="vio-act">
								<text class="vio-left">申诉剩余 {{ v.leftText }}</text>
								<view class="gf-btn gf-btn-sm gf-btn-ghost" @click="openAppeal(v)">去申诉</view>
							</view>
							<view v-else-if="v.appeal === '审批中'" class="vio-act">
								<text class="vio-left">申诉处理中，结果将通知你</text>
							</view>
						</view>
					</view>
					<view v-else class="gf-state">
						<text class="gf-state-ico">规</text>
						<text class="gf-state-text">近期无违规记录</text>
					</view>

					<view class="gf-notice ink">
						<text class="gf-notice-main">
							申诉提交后由运营复核；一级违规申诉成立则撤销扣款，二级维持后不再受理同一事项。
						</text>
					</view>
				</block>

				<!-- 交接红线 -->
				<block v-else>
					<view v-if="handovers.length">
						<view v-for="h in handovers" :key="h.id" class="gf-card">
							<view class="gf-li">
								<view class="gf-li-ico red">接</view>
								<view class="gf-li-main">
									<text class="gf-li-t">{{ h.sessionText }}</text>
									<text class="gf-li-d">
										交接留存率 {{ h.ratio === null ? '—' : pct(h.ratio) }} · 低于 40% 且峰值 &gt; 100 判红线
									</text>
								</view>
								<text class="gf-tag" :class="h.st === '待处理' ? 'gf-tag-red' : 'gf-tag-gold'">{{ h.st }}</text>
							</view>
							<view v-if="h.reason" class="gf-row">
								<text class="gf-row-k">说明</text>
								<text class="gf-row-v">{{ h.reason }}</text>
							</view>
							<view v-if="h.st === '待处理'" class="h-act">
								<view class="gf-btn gf-btn-sm gf-btn-ghost" @click="openFree(h)">申请免责</view>
							</view>
						</view>
					</view>
					<view v-else class="gf-state">
						<text class="gf-state-ico">接</text>
						<text class="gf-state-text">无交接红线记录</text>
					</view>

					<view class="gf-notice">
						<text class="gf-notice-main">
							红线口径：峰值在线 &gt; 100 且下播前在线 ÷ 峰值 &lt; 40%，扣 200 元 / 场；中控断播、平台限流经认定可免责。
						</text>
					</view>
				</block>
			</view>
		</scroll-view>

		<!-- 申诉弹层 -->
		<view v-if="appealShow" class="gf-mask" @click="appealShow = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd">
					违规申诉
					<text class="gf-sheet-x" @click="appealShow = false">✕</text>
				</view>
				<view class="gf-sheet-bd">
					<view class="gf-notice red">
						<text class="gf-notice-main">{{ appealItem.desc }} · {{ appealItem.level }} · 扣 {{ money(appealItem.amt) }}</text>
					</view>
					<view class="gf-field">
						<text class="gf-label"><text class="gf-req">*</text>申诉理由</text>
						<textarea class="gf-textarea" v-model="appealReason" placeholder="说明事实与依据，可附截图凭证" :maxlength="300" />
					</view>
				</view>
				<view class="gf-sheet-ft">
					<view class="gf-btn gf-btn-ghost" @click="appealShow = false">取消</view>
					<view class="gf-btn gf-btn-primary" @click="submitAppeal">提交申诉</view>
				</view>
			</view>
		</view>

		<!-- 免责弹层 -->
		<view v-if="freeShow" class="gf-mask" @click="freeShow = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd">
					申请交接免责
					<text class="gf-sheet-x" @click="freeShow = false">✕</text>
				</view>
				<view class="gf-sheet-bd">
					<view class="gf-notice ink">
						<text class="gf-notice-main">仅中控断播、平台限流、设备故障等非主播原因可申请，需运营认定。</text>
					</view>
					<view class="gf-field">
						<text class="gf-label"><text class="gf-req">*</text>免责说明</text>
						<textarea class="gf-textarea" v-model="freeReason" placeholder="说明断播时间点与原因" :maxlength="300" />
					</view>
				</view>
				<view class="gf-sheet-ft">
					<view class="gf-btn gf-btn-ghost" @click="freeShow = false">取消</view>
					<view class="gf-btn gf-btn-primary" @click="submitFree">提交申请</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getViolations, submitViolationAppeal, submitHandoverFree } from '@/api/mp'
	import { money, pct, mdhmText } from '@/utils/mp-format'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				tab: 'v',
				violations: [],
				handovers: [],
				appealShow: false,
				appealItem: {},
				appealReason: '',
				freeShow: false,
				freeItem: {},
				freeReason: ''
			}
		},
		onLoad(q) {
			if (q && q.tab === 'h') this.tab = 'h'
			this.load()
		},
		methods: {
			money,
			pct,
			mdhm(ts) {
				return mdhmText(ts)
			},
			async load() {
				const d = await getViolations()
				this.violations = d.violations || []
				this.handovers = d.handovers || []
			},
			stText(v) {
				if (v.appeal === '审批中') return '申诉审批中'
				if (v.appeal === '维持') return '申诉已维持'
				if (v.appeal === '撤销') return '申诉成立 · 已撤销'
				return v.can ? '待申诉' : '已生效'
			},
			openAppeal(v) {
				this.appealItem = v
				this.appealReason = ''
				this.appealShow = true
			},
			async submitAppeal() {
				if (!String(this.appealReason || '').trim()) {
					uni.showToast({ title: '请填写申诉理由', icon: 'none' })
					return
				}
				await submitViolationAppeal(this.appealItem.id, this.appealReason)
				this.appealShow = false
				uni.showToast({ title: '已提交申诉', icon: 'success' })
				this.load()
			},
			openFree(h) {
				this.freeItem = h
				this.freeReason = ''
				this.freeShow = true
			},
			async submitFree() {
				if (!String(this.freeReason || '').trim()) {
					uni.showToast({ title: '请填写免责说明', icon: 'none' })
					return
				}
				await submitHandoverFree(this.freeItem.sessionId || this.freeItem.id, this.freeReason)
				this.freeShow = false
				uni.showToast({ title: '已提交，待运营认定', icon: 'success' })
				this.load()
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

	.vio-card {
		padding-top: 22rpx;
	}

	.vio-head {
		display: flex;
		align-items: flex-start;
		gap: 12rpx;
		margin-bottom: 8rpx;
	}

	.vio-lv {
		flex-shrink: 0;
		height: 38rpx;
		line-height: 36rpx;
		padding: 0 12rpx;
		border-radius: 6rpx;
		font-size: 19rpx;
		color: #8a6a1f;
		background: rgba(201, 162, 75, 0.14);
		border: 1rpx solid rgba(201, 162, 75, 0.4);
	}

	.vio-lv.high {
		color: #8f2d24;
		background: rgba(178, 58, 46, 0.09);
		border-color: rgba(178, 58, 46, 0.3);
	}

	.vio-t {
		flex: 1;
		font-size: 26rpx;
		font-weight: 600;
		color: $gf-ink;
		line-height: 1.5;
	}

	.vio-act {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
		margin-top: 16rpx;
		padding-top: 16rpx;
		border-top: 1rpx dashed $gf-line-soft;
	}

	.vio-left {
		font-size: 20rpx;
		color: $gf-cinnabar;
	}

	.h-act {
		display: flex;
		justify-content: flex-end;
		margin-top: 14rpx;
	}
</style>
