<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">本组排班确认</text>
				<text class="gf-subtitle">组长确认后进入公示</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<!-- 非组长 -->
		<view v-if="forbidden" class="gf-state">
			<text class="gf-state-ico">权</text>
			<text class="gf-state-text">仅组长 / 副组长可确认本组排班</text>
			<view class="gf-btn gf-btn-ghost gf-btn-sm lock-btn" @click="goBack">返回</view>
		</view>

		<block v-else>
			<scroll-view scroll-y class="gf-scroll">
				<view class="gf-pad">
					<view v-if="pending" class="gf-notice">
						<text class="gf-notice-main">还有 {{ pending }} 条排班待你确认，确认后运营公示。</text>
					</view>
					<view v-else class="gf-notice ink">
						<text class="gf-notice-main">本组排班已全部确认。</text>
					</view>

					<view v-for="d in days" :key="d.date" class="gf-card">
						<view class="gf-card-title">
							<text>{{ d.date }}</text>
							<text class="gf-card-title-sub">{{ d.plans.length }} 场</text>
						</view>
						<view v-for="p in d.plans" :key="p.id" class="plan-row">
							<view class="plan-main">
								<text class="plan-t">{{ nameOf(p.anchor) }} · {{ p.start }} – {{ p.end }}</text>
								<text class="plan-d">{{ p.roomNo }} 直播间 · {{ p.type }}</text>
								<text v-if="p.obj" class="plan-obj">异议：{{ p.objReason }}</text>
							</view>
							<view class="plan-act">
								<text class="gf-tag" :class="p.status === '待确认' ? 'gf-tag-gold' : 'gf-tag-ink'">{{ p.status }}</text>
								<view v-if="p.status === '待确认' && !p.obj" class="plan-btns">
									<view class="gf-btn gf-btn-sm gf-btn-ghost" @click="openObj(p)">有异议</view>
									<view class="gf-btn gf-btn-sm gf-btn-primary" @click="confirm(p)">确认</view>
								</view>
							</view>
						</view>
					</view>

					<text class="gf-hint gf-hint-c">确认窗口 24 小时，超时未处理视为默认同意。</text>
				</view>
			</scroll-view>

			<view class="gf-foot">
				<view class="gf-btn gf-btn-primary" :class="{ disabled: !pending }" @click="confirmAll">
					一键全部确认（{{ pending }}）
				</view>
			</view>
		</block>

		<!-- 异议弹层 -->
		<view v-if="objShow" class="gf-mask" @click="objShow = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd">
					排班异议
					<text class="gf-sheet-x" @click="objShow = false">✕</text>
				</view>
				<view class="gf-sheet-bd">
					<view class="gf-notice red">
						<text class="gf-notice-main">{{ nameOf(objItem.anchor) }} · {{ objItem.start }} – {{ objItem.end }} · {{ objItem.roomNo }}</text>
					</view>
					<view class="gf-field">
						<text class="gf-label"><text class="gf-req">*</text>异议原因</text>
						<textarea class="gf-textarea" v-model="objReason" placeholder="工时冲突 / 账号不匹配 / 需换人" :maxlength="200" />
					</view>
				</view>
				<view class="gf-sheet-ft">
					<view class="gf-btn gf-btn-ghost" @click="objShow = false">取消</view>
					<view class="gf-btn gf-btn-primary" @click="submitObj">提交异议</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getTeamSchedule, confirmTeamPlan, objectTeamPlan, confirmAllTeamPlans } from '@/api/mp'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				forbidden: false,
				days: [],
				pending: 0,
				members: [],
				objShow: false,
				objItem: {},
				objReason: ''
			}
		},
		onLoad() {
			this.load()
		},
		methods: {
			async load() {
				const d = await getTeamSchedule()
				this.forbidden = !!d.forbidden
				this.days = d.days || []
				this.pending = d.pending || 0
				this.members = d.members || []
			},
			nameOf(id) {
				const m = this.members.find((x) => x.id === id)
				return m ? m.name : id
			},
			async confirm(p) {
				await confirmTeamPlan(p.id)
				uni.showToast({ title: '已确认', icon: 'success' })
				this.load()
			},
			openObj(p) {
				this.objItem = p
				this.objReason = ''
				this.objShow = true
			},
			async submitObj() {
				if (!String(this.objReason || '').trim()) {
					uni.showToast({ title: '请填写异议原因', icon: 'none' })
					return
				}
				await objectTeamPlan(this.objItem.id, this.objReason)
				this.objShow = false
				uni.showToast({ title: '已提交异议', icon: 'success' })
				this.load()
			},
			confirmAll() {
				if (!this.pending) return
				uni.showModal({
					title: '全部确认',
					content: '确认剩余 ' + this.pending + ' 条排班，确认后进入公示？',
					success: async (r) => {
						if (!r.confirm) return
						await confirmAllTeamPlans()
						uni.showToast({ title: '已全部确认', icon: 'success' })
						this.load()
					}
				})
			},
			goBack() {
				goBack('/pages/my-schedule/index')
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

	.lock-btn {
		margin-top: 24rpx;
		width: 220rpx;
	}

	.plan-row {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
		padding: 18rpx 0;
		border-bottom: 1rpx solid $gf-line-soft;
	}

	.plan-row:last-child {
		border-bottom: 0;
		padding-bottom: 0;
	}

	.plan-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.plan-t {
		font-size: 25rpx;
		color: $gf-ink;
		font-weight: 600;
	}

	.plan-d {
		font-size: 20rpx;
		color: $gf-ink-3;
	}

	.plan-obj {
		font-size: 20rpx;
		color: $gf-cinnabar;
		line-height: 1.5;
	}

	.plan-act {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 10rpx;
		flex-shrink: 0;
	}

	.plan-btns {
		display: flex;
		gap: 10rpx;
	}
</style>
