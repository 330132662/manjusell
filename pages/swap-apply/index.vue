<template>
	<view class="page">
		<view class="topbar">
			<view class="topbar-back" @click="goBack">‹</view>
			<text class="topbar-title">发起换班</text>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="body">
			<!-- 我的这场 -->
			<view class="card">
				<view class="card-title">我要换出的排班</view>
				<view class="slot">
					<text class="slot-time">{{ source.plan_date }} {{ source.start_time }}-{{ source.end_time }}</text>
					<text class="slot-topic">{{ source.topic || '未命名场次' }}</text>
				</view>
			</view>

			<!-- 换班类型 -->
			<view class="card">
				<view class="card-title">换班方式</view>
				<view class="tabs">
					<view class="tab" :class="{ on: reqType === 1 }" @click="switchType(1)">请人代班</view>
					<view class="tab" :class="{ on: reqType === 2 }" @click="switchType(2)">与人互调</view>
				</view>
				<text class="hint">
					{{ reqType === 1 ? '把你的场次交给别人，你不接手对方的班。' : '双方互换场次，两场都要能接得住才能提交。' }}
				</text>
			</view>

			<!-- 候选主播 -->
			<view class="card">
				<view class="card-title">
					{{ reqType === 1 ? '可代班主播' : '可互换的主播' }}
					<text class="card-title-sub">按技能+时段+负载排序</text>
				</view>

				<view v-if="loading" class="state-box small">
					<text class="state-text">计算候选中…</text>
				</view>

				<view v-else-if="reqType === 1">
					<view v-if="covers.length === 0" class="empty">
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
							<text class="person-name">{{ c.anchor_name }}</text>
							<text class="person-reason">{{ c.reason }}</text>
						</view>
						<text class="person-score">{{ c.score }}</text>
					</view>

					<view v-if="blocked.length" class="blocked">
						<text class="blocked-title">以下主播接不住这场：</text>
						<text v-for="b in blocked" :key="b.anchor_id" class="blocked-item">
							· {{ b.anchor_name }}：{{ (b.blockers && b.blockers[0] && b.blockers[0].message) || '不满足约束' }}
						</text>
					</view>
				</view>

				<view v-else>
					<view v-if="mutual.length === 0" class="empty">
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
							<text class="person-name">{{ m.to_anchor_name }}</text>
							<text class="person-reason">{{ m.target_date }} {{ m.target_start }}-{{ m.target_end }} · {{ m.topic }}</text>
						</view>
						<text class="person-score">⇄</text>
					</view>
				</view>
			</view>

			<!-- 理由 -->
			<view class="card">
				<view class="card-title">申请理由</view>
				<textarea
					v-model="reasonText"
					class="textarea"
					placeholder="简单说明原因，方便运营快速审核（选填）"
					maxlength="200"
				/>
			</view>

			<view class="footer">
				<view class="submit" :class="{ disabled: !canSubmit }" @click="submit">
					{{ submitting ? '提交中…' : '提交换班申请' }}
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { getSwapCandidates, applySwap } from '@/api/index'

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
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss" scoped>
.page {
	height: 100vh;
	background: #f4f7f5;
	display: flex;
	flex-direction: column;
}

.topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 96rpx;
	padding: 0 24rpx;
	background: #1a535c;
	color: #fff;
	flex-shrink: 0;
}

.topbar-back {
	width: 64rpx;
	font-size: 48rpx;
	line-height: 96rpx;
}

.topbar-title {
	font-size: 34rpx;
	font-weight: 700;
}

.topbar-holder {
	width: 64rpx;
}

.body {
	flex: 1;
	overflow: hidden;
	padding: 24rpx 32rpx 0;
	box-sizing: border-box;
}

.card {
	background: #fff;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(26, 83, 92, 0.05);
}

.card-title {
	font-size: 26rpx;
	font-weight: 700;
	color: #1a3a3f;
	margin-bottom: 16rpx;
}

.card-title-sub {
	font-size: 20rpx;
	font-weight: 400;
	color: rgba(26, 83, 92, 0.45);
	margin-left: 12rpx;
}

.slot-time {
	display: block;
	font-size: 30rpx;
	font-weight: 700;
	color: #1a535c;
}

.slot-topic {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #2c4a4e;
}

.tabs {
	display: flex;
	gap: 16rpx;
	margin-bottom: 14rpx;
}

.tab {
	flex: 1;
	text-align: center;
	padding: 18rpx 0;
	font-size: 26rpx;
	color: #1a535c;
	background: #eef4f2;
	border-radius: 999rpx;
}

.tab.on {
	background: #1a535c;
	color: #fff;
	font-weight: 700;
}

.hint {
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.55);
	line-height: 30rpx;
}

.state-box.small {
	padding: 40rpx 0;
}

.state-text {
	font-size: 24rpx;
	color: rgba(26, 83, 92, 0.5);
}

.empty {
	padding: 40rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10rpx;
}

.empty-text {
	font-size: 24rpx;
	color: rgba(26, 83, 92, 0.6);
}

.empty-tip {
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.4);
}

.person {
	display: flex;
	align-items: center;
	gap: 18rpx;
	padding: 18rpx 16rpx;
	border-radius: 16rpx;
	border: 2rpx solid #eef2f0;
	margin-bottom: 14rpx;
}

.person.picked {
	border-color: #1a535c;
	background: #f2f8f6;
}

.person-avatar {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: #1a535c;
	color: #fff;
	font-size: 26rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.person-main {
	flex: 1;
	overflow: hidden;
}

.person-name {
	display: block;
	font-size: 26rpx;
	font-weight: 700;
	color: #1a3a3f;
}

.person-reason {
	display: block;
	margin-top: 4rpx;
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.55);
	line-height: 28rpx;
}

.person-score {
	font-size: 28rpx;
	font-weight: 700;
	color: #1a535c;
}

.blocked {
	margin-top: 8rpx;
	padding: 16rpx;
	background: #f7f9f8;
	border-radius: 12rpx;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.blocked-title {
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.6);
}

.blocked-item {
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.45);
	line-height: 28rpx;
}

.textarea {
	width: 100%;
	height: 140rpx;
	font-size: 24rpx;
	color: #2c4a4e;
	background: #f7f9f8;
	border-radius: 12rpx;
	padding: 16rpx;
	box-sizing: border-box;
}

.footer {
	padding: 20rpx 0 60rpx;
}

.submit {
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	background: #1a535c;
	color: #fff;
	font-size: 28rpx;
	font-weight: 700;
	border-radius: 999rpx;
}

.submit.disabled {
	background: #b9c9c6;
}
</style>
