<template>
	<view class="page gf-page">
		<!-- ===== 顶栏 ===== -->
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">发起换班</text>
				<text class="gf-subtitle">换班申请 · 提交后由运营审核</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="body">
			<!-- ===== 换出的排班 ===== -->
			<view class="gf-card slotcard">
				<view class="gf-card-title">
					<text>我要换出的排班</text>
					<text class="slot-seal">换出</text>
				</view>
				<view class="slot">
					<view class="slot-date">
						<text class="slot-date-main">{{ source.plan_date }}</text>
						<text class="slot-date-time">{{ source.start_time }} - {{ source.end_time }}</text>
					</view>
					<view class="slot-line"></view>
					<text class="slot-topic">{{ source.topic || '未命名场次' }}</text>
				</view>
			</view>

			<!-- ===== 换班方式 ===== -->
			<view class="gf-card">
				<view class="gf-card-title">
					<text>换班方式</text>
					<text class="gf-card-title-sub">二选一</text>
				</view>
				<view class="tabs">
					<view class="tab" :class="{ on: reqType === 1 }" @click="switchType(1)">
						<text class="tab-seal">代</text>
						<text class="tab-txt">请人代班</text>
					</view>
					<view class="tab" :class="{ on: reqType === 2 }" @click="switchType(2)">
						<text class="tab-seal">换</text>
						<text class="tab-txt">与人互调</text>
					</view>
				</view>
				<view class="hint">
					<text class="hint-mark">注</text>
					<text class="hint-txt">
						{{ reqType === 1 ? '把你的场次交给别人，你不接手对方的班。' : '双方互换场次，两场都要能接得住才能提交。' }}
					</text>
				</view>
			</view>

			<!-- ===== 候选主播 ===== -->
			<view class="gf-card">
				<view class="gf-card-title">
					<text>{{ reqType === 1 ? '可代班主播' : '可互换的主播' }}</text>
					<text class="gf-card-title-sub">按技能 + 时段 + 负载排序</text>
				</view>

				<view v-if="loading" class="gf-state small">
					<text class="gf-state-text">计算候选中…</text>
				</view>

				<view v-else-if="reqType === 1">
					<view v-if="covers.length === 0" class="empty">
						<text class="gf-state-ico">候</text>
						<text class="empty-text">{{ reason || '暂无可用候选' }}</text>
						<text class="empty-tip">可改天再试，或直接在「我的排班」发起请假让运营处理</text>
					</view>

					<view
						v-for="c in covers"
						:key="c.anchor_id"
						class="person"
						:class="{ picked: pickedAnchor === c.anchor_id }"
						@click="pickAnchor(c)"
					>
						<view class="person-avatar">{{ (c.anchor_name || '?').slice(0, 1) }}</view>
						<view class="person-main">
							<view class="person-head">
								<text class="person-name">{{ c.anchor_name }}</text>
								<text class="person-score-seal">{{ c.score }}</text>
							</view>
							<text class="person-reason">{{ c.reason }}</text>
						</view>
						<view class="person-check">
							<text v-if="pickedAnchor === c.anchor_id">已选</text>
							<text v-else>选择</text>
						</view>
					</view>

					<view v-if="blocked.length" class="blocked">
						<text class="blocked-title">以下主播接不住这场</text>
						<view v-for="b in blocked" :key="b.anchor_id" class="blocked-item">
							<text class="blocked-name">{{ b.anchor_name }}</text>
							<text class="blocked-msg">{{ (b.blockers && b.blockers[0] && b.blockers[0].message) || '不满足约束' }}</text>
						</view>
					</view>
				</view>

				<view v-else>
					<view v-if="mutual.length === 0" class="empty">
						<text class="gf-state-ico">空</text>
						<text class="empty-text">附近没有可互换的场次</text>
						<text class="empty-tip">互调只展示「互换后双方都不冲突」的场次</text>
					</view>

					<view
						v-for="m in mutual"
						:key="m.to_plan_id"
						class="person"
						:class="{ picked: pickedToPlanId === m.to_plan_id }"
						@click="pickMutual(m)"
					>
						<view class="person-avatar">{{ (m.to_anchor_name || '?').slice(0, 1) }}</view>
						<view class="person-main">
							<view class="person-head">
								<text class="person-name">{{ m.to_anchor_name }}</text>
								<text class="person-score-seal swap">⇄</text>
							</view>
							<text class="person-reason">{{ m.target_date }} {{ m.target_start }}-{{ m.target_end }} · {{ m.topic }}</text>
						</view>
						<view class="person-check">
							<text v-if="pickedToPlanId === m.to_plan_id">已选</text>
							<text v-else>选择</text>
						</view>
					</view>
				</view>
			</view>

			<!-- ===== 申请理由 ===== -->
			<view class="gf-card">
				<view class="gf-card-title">
					<text>申请理由</text>
					<text class="gf-card-title-sub">选填</text>
				</view>
				<textarea
					v-model="reasonText"
					class="textarea"
					placeholder="简单说明原因，方便运营快速审核（选填）"
					placeholder-class="ph"
					maxlength="200"
				/>
			</view>

			<view class="footer">
				<view class="gf-btn-main" :class="{ disabled: !canSubmit }" @click="submit">
					{{ submitting ? '提交中…' : '提交换班申请' }}
				</view>
				<text class="footer-note">提交后将由运营审核，审核结果会在站内提醒中通知</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { getSwapCandidates, applySwap } from '@/api/index'
	import { goBack as navBack } from '@/utils/nav'

	export default {
		data() {
			return {
				planId: 0,
				reqType: 1,
				source: {},
				covers: [],
				blocked: [],
				mutual: [],
				reason: '',
				reasonText: '',
				pickedAnchor: 0,
				pickedAnchorName: '',
				pickedToPlanId: 0,
				loading: false,
				submitting: false
			}
		},
		computed: {
			canSubmit() {
				if (this.reqType === 1) return !!this.pickedAnchor
				return !!this.pickedAnchor && !!this.pickedToPlanId
			}
		},
		onLoad(options) {
			this.planId = Number(options.plan_id || 0)
			this.load()
		},
		methods: {
			async load() {
				if (!this.planId) {
					uni.showToast({ title: '缺少排班参数', icon: 'none' })
					return
				}
				this.loading = true
				try {
					const res = await getSwapCandidates({ from_plan_id: this.planId, limit: 8 })
					this.source = res.from_plan || {}
					this.covers = res.covers || []
					this.blocked = res.blocked || []
					this.mutual = res.mutual || []
					this.reason = res.reason || ''
				} catch (e) {
					this.reason = e.message || ''
				} finally {
					this.loading = false
				}
			},
			switchType(t) {
				this.reqType = t
				this.pickedAnchor = 0
				this.pickedAnchorName = ''
				this.pickedToPlanId = 0
			},
			pickAnchor(c) {
				if (this.pickedAnchor === c.anchor_id) {
					this.pickedAnchor = 0
					this.pickedAnchorName = ''
					return
				}
				this.pickedAnchor = c.anchor_id
				this.pickedAnchorName = c.anchor_name
				// 切换代班人后，互调目标失效
				if (this.reqType === 2) this.pickedToPlanId = 0
			},
			pickMutual(m) {
				if (this.pickedToPlanId === m.to_plan_id) {
					this.pickedToPlanId = 0
					return
				}
				this.pickedAnchor = m.to_anchor_id
				this.pickedAnchorName = m.to_anchor_name
				this.pickedToPlanId = m.to_plan_id
			},
			async submit() {
				if (!this.canSubmit) {
					uni.showToast({ title: this.reqType === 1 ? '请选择代班主播' : '请选择互换对象', icon: 'none' })
					return
				}
				this.submitting = true
				try {
					await applySwap({
						req_type: this.reqType,
						from_plan_id: this.planId,
						to_anchor_id: this.pickedAnchor,
						to_plan_id: this.reqType === 2 ? this.pickedToPlanId : 0,
						reason: this.reasonText
					})
					uni.showToast({ title: '已提交，等待审核', icon: 'success' })
					setTimeout(() => {
						uni.redirectTo({ url: '/pages/my-requests/index' })
					}, 700)
				} catch (e) {
					/* request 层已 toast */
				} finally {
					this.submitting = false
				}
			},
			goBack() {
				// 统一返回：本项目未配置 tabBar，不能用 switchTab
				navBack()
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

.body {
	flex: 1;
	overflow: hidden;
	padding: 24rpx 28rpx 0;
}

/* ===== 换出的排班 ===== */
.slot-seal {
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 19rpx;
	font-weight: 700;
	color: $gf-cinnabar;
	border: 2rpx solid $gf-cinnabar;
	border-radius: 6rpx;
	padding: 2rpx 10rpx;
	background: rgba(178, 58, 46, 0.06);
	letter-spacing: 0;
}

.slot {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 18rpx 18rpx;
	border-radius: 12rpx;
	background: linear-gradient(180deg, #fdf7ec 0%, #f6ecd8 100%);
	border: 1rpx solid rgba(201, 162, 75, 0.35);
}

.slot-date {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
	flex-shrink: 0;
}

.slot-date-main {
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 34rpx;
	font-weight: 700;
	color: $gf-ink;
	letter-spacing: 1rpx;
}

.slot-date-time {
	font-size: 21rpx;
	color: $gf-cinnabar;
	font-weight: 700;
}

.slot-line {
	width: 1rpx;
	align-self: stretch;
	background: rgba(201, 162, 75, 0.4);
}

.slot-topic {
	flex: 1;
	font-size: 26rpx;
	color: $gf-ink;
	font-weight: 700;
	line-height: 1.5;
}

/* ===== 换班方式 ===== */
.tabs {
	display: flex;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.tab {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	height: 84rpx;
	border: 1rpx solid $gf-line-soft;
	border-radius: 12rpx;
	background: rgba(255, 253, 247, 0.85);
}

.tab-seal {
	width: 40rpx;
	height: 40rpx;
	line-height: 36rpx;
	text-align: center;
	border: 1rpx solid rgba(140, 130, 116, 0.4);
	border-radius: 4rpx;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 21rpx;
	font-weight: 700;
	color: $gf-ink-3;
}

.tab-txt {
	font-size: 26rpx;
	color: $gf-ink-2;
	letter-spacing: 1rpx;
}

.tab.on {
	border-color: $gf-cinnabar;
	background: rgba(178, 58, 46, 0.06);
}

.tab.on .tab-seal {
	border-color: $gf-cinnabar;
	background: $gf-cinnabar;
	color: #fdf6e6;
}

.tab.on .tab-txt {
	color: $gf-cinnabar;
	font-weight: 700;
}

.hint {
	display: flex;
	gap: 10rpx;
	padding: 14rpx 16rpx;
	border-radius: 8rpx;
	background: rgba(201, 162, 75, 0.09);
	border: 1rpx solid rgba(201, 162, 75, 0.3);
}

.hint-mark {
	width: 30rpx;
	height: 30rpx;
	line-height: 28rpx;
	text-align: center;
	border: 1rpx solid rgba(201, 162, 75, 0.7);
	border-radius: 3rpx;
	font-size: 17rpx;
	color: #8a6a1f;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	flex-shrink: 0;
}

.hint-txt {
	flex: 1;
	font-size: 21rpx;
	color: $gf-ink-2;
	line-height: 1.55;
}

/* ===== 候选 ===== */
.person {
	position: relative;
	display: flex;
	align-items: center;
	gap: 18rpx;
	padding: 18rpx;
	border: 1rpx solid $gf-line-soft;
	border-radius: 14rpx;
	background: rgba(255, 253, 247, 0.92);
	margin-bottom: 14rpx;
}

.person.picked {
	border-color: $gf-cinnabar;
	background: rgba(178, 58, 46, 0.045);
	box-shadow: 0 5rpx 16rpx rgba(178, 58, 46, 0.1);
}

.person-avatar {
	width: 76rpx;
	height: 76rpx;
	line-height: 74rpx;
	text-align: center;
	border-radius: 50%;
	border: 2rpx solid $gf-gold;
	background: linear-gradient(180deg, #fffdf7 0%, #f0e4cd 100%);
	color: $gf-ink;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 32rpx;
	font-weight: 700;
	flex-shrink: 0;
	box-shadow: inset 0 0 0 3rpx rgba(255, 255, 255, 0.7);
}

.person-main {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.person-head {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.person-name {
	font-size: 27rpx;
	font-weight: 700;
	color: $gf-ink;
	letter-spacing: 1rpx;
}

.person-score-seal {
	min-width: 44rpx;
	height: 36rpx;
	line-height: 32rpx;
	text-align: center;
	padding: 0 6rpx;
	border: 2rpx solid $gf-cinnabar;
	border-radius: 4rpx;
	color: $gf-cinnabar;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 20rpx;
	font-weight: 700;
	background: rgba(178, 58, 46, 0.06);
}

.person-score-seal.swap {
	border-color: $gf-indigo;
	color: $gf-indigo;
	background: rgba(58, 74, 82, 0.06);
}

.person-reason {
	font-size: 21rpx;
	color: $gf-ink-3;
	line-height: 1.5;
}

.person-check {
	flex-shrink: 0;
	height: 52rpx;
	line-height: 50rpx;
	padding: 0 18rpx;
	border-radius: 8rpx;
	border: 1rpx solid $gf-line;
	font-size: 21rpx;
	color: $gf-ink-2;
	background: rgba(255, 253, 247, 0.9);
}

.person.picked .person-check {
	border-color: $gf-cinnabar;
	color: #fdf6e6;
	background: $gf-cinnabar;
}

/* ===== 不可接 ===== */
.blocked {
	margin-top: 6rpx;
	padding: 16rpx 18rpx;
	border-radius: 10rpx;
	background: rgba(140, 130, 116, 0.07);
	border: 1rpx dashed rgba(140, 130, 116, 0.35);
}

.blocked-title {
	display: block;
	font-size: 21rpx;
	color: $gf-ink-3;
	margin-bottom: 10rpx;
	letter-spacing: 1rpx;
}

.blocked-item {
	display: flex;
	align-items: baseline;
	gap: 10rpx;
	margin-bottom: 6rpx;
}

.blocked-name {
	font-size: 21rpx;
	color: $gf-ink-2;
	font-weight: 700;
	flex-shrink: 0;
}

.blocked-msg {
	font-size: 20rpx;
	color: $gf-ink-3;
	line-height: 1.5;
}

/* ===== 空态 ===== */
.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx 20rpx;
	gap: 8rpx;
}

.empty-text {
	font-size: 24rpx;
	color: $gf-ink-2;
	letter-spacing: 1rpx;
}

.empty-tip {
	font-size: 20rpx;
	color: $gf-ink-3;
	text-align: center;
	line-height: 1.6;
}

/* ===== 理由 ===== */
.textarea {
	width: 100%;
	min-height: 150rpx;
	padding: 18rpx;
	box-sizing: border-box;
	border: 1rpx solid $gf-line-soft;
	border-radius: 10rpx;
	background: rgba(255, 253, 247, 0.9);
	font-size: 24rpx;
	color: $gf-ink;
	line-height: 1.6;
}

.ph {
	color: $gf-ink-3;
	font-size: 23rpx;
}

/* ===== 底部 ===== */
.footer {
	padding: 10rpx 0 40rpx;
	padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.footer-note {
	display: block;
	margin-top: 16rpx;
	text-align: center;
	font-size: 19rpx;
	color: $gf-ink-3;
	line-height: 1.6;
	letter-spacing: 1rpx;
}
</style>
