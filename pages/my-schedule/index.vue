<template>
	<view class="page">
		<!-- 顶栏 -->
		<view class="topbar">
			<view class="topbar-back" @click="goBack">‹</view>
			<text class="topbar-title">我的排班</text>
			<view class="topbar-actions">
				<view class="topbar-action" @click="goGrab">
					<text class="topbar-action-text">抢班</text>
				</view>
				<view class="topbar-action" @click="goNotice">
					<text class="topbar-action-text">消息</text>
					<text v-if="unread > 0" class="topbar-badge">{{ unread > 99 ? '99+' : unread }}</text>
				</view>
			</view>
		</view>

		<!-- 周切换 -->
		<view class="weekbar">
			<view class="week-nav" @click="shiftWeek(-1)">‹</view>
			<view class="week-center">
				<text class="week-range">{{ rangeText }}</text>
				<text class="week-sub">{{ monthLabel }}</text>
			</view>
			<view class="week-nav" @click="shiftWeek(1)">›</view>
		</view>

		<!-- 汇总 -->
		<view class="summary">
			<view class="summary-item">
				<text class="summary-value">{{ summary.count }}</text>
				<text class="summary-label">场次</text>
			</view>
			<view class="summary-item">
				<text class="summary-value">{{ summary.hours }}</text>
				<text class="summary-label">小时</text>
			</view>
			<view class="summary-item">
				<text class="summary-value" :class="{ warn: summary.need_confirm > 0 }">{{ summary.need_confirm }}</text>
				<text class="summary-label">待确认</text>
			</view>
		</view>

		<scroll-view scroll-y class="body">
			<view v-if="loading && days.length === 0" class="state-box">
				<text class="state-text">加载中…</text>
			</view>

			<view v-else-if="errorMsg" class="state-box">
				<text class="state-text">{{ errorMsg }}</text>
				<view class="retry-btn" @click="load">重新加载</view>
			</view>

			<view v-else-if="days.length === 0" class="state-box">
				<text class="state-icon">🗓</text>
				<text class="state-text">本周暂无排班</text>
			</view>

			<view v-else class="daylist">
				<view v-for="day in days" :key="day.date" class="dayblock">
					<view class="dayhead">
						<text class="daydate">{{ day.date.slice(5) }}</text>
						<text class="dayweek">{{ day.week_label }}</text>
						<text v-if="day.is_today" class="daytag today">今天</text>
						<text v-if="day.count === 0" class="daytag rest">休</text>
						<text v-else class="daycount">{{ day.count }} 场 · {{ day.hours }}h</text>
					</view>

					<view v-for="p in day.plans" :key="p.id" class="pcard">
						<view class="pcard-head">
							<text class="ptime">{{ p.start_time }} - {{ p.end_time }}</text>
							<text class="pstatus" :class="statusClass(p.status)">{{ p.status_label }}</text>
						</view>

						<text class="ptopic">{{ p.topic || '未命名场次' }}</text>

						<view class="pmeta">
							<text v-if="p.room" class="pmeta-item">📍 {{ p.room }}</text>
							<text v-if="p.role" class="pmeta-item">🎭 {{ p.role }}</text>
							<text v-if="p.cover_status" class="pmeta-item warn">🔁 {{ p.cover_status_label }}</text>
						</view>

						<view class="pflags">
							<text class="flag" :class="confirmClass(p)">{{ p.confirm_status_label }}</text>
							<text v-if="p.swap_pending" class="flag flag-pending">换班待审</text>
							<text v-if="p.leave_pending" class="flag flag-pending">请假待审</text>
						</view>

						<view class="pactions">
							<view
								v-if="p.confirm_status === 0 && !p.is_past"
								class="pbtn primary"
								@click="doConfirm(p, 1)"
							>
								确认排班
							</view>
							<view
								v-if="p.confirm_status === 0 && !p.is_past"
								class="pbtn ghost"
								@click="doReject(p)"
							>
								拒接
							</view>
							<view v-if="!p.swap_pending && !p.is_past" class="pbtn ghost" @click="goSwap(p)">
								换班
							</view>
							<view v-if="!p.leave_pending && !p.is_past" class="pbtn ghost" @click="goLeave(p)">
								请假
							</view>
							<view class="pbtn text" @click="goRequests">申请记录 ›</view>
						</view>
					</view>
				</view>
			</view>

			<view class="footer-tip">排班由运营编排，如需调整请发起换班或请假申请</view>
		</scroll-view>
	</view>
</template>

<script>
	import { getMySchedules, getMyNotifications, confirmMyPlan } from '@/api/index'

	export default {
		data() {
			return {
				loading: false,
				errorMsg: '',
				anchorDate: '',
				view: 'week',
				days: [],
				summary: { count: 0, hours: 0, need_confirm: 0, unconfirmed: 0 },
				startDate: '',
				endDate: '',
				unread: 0
			}
		},
		computed: {
			rangeText() {
				if (!this.startDate) return ''
				return this.startDate.slice(5) + ' ~ ' + this.endDate.slice(5)
			},
			monthLabel() {
				if (!this.startDate) return ''
				return this.startDate.slice(0, 7) + ' 周视图'
			}
		},
		onLoad() {
			this.anchorDate = this.fmt(new Date())
			this.load()
		},
		onShow() {
			this.loadUnread()
		},
		onPullDownRefresh() {
			this.load().then(() => uni.stopPullDownRefresh())
		},
		methods: {
			fmt(d) {
				const y = d.getFullYear()
				const m = String(d.getMonth() + 1).padStart(2, '0')
				const day = String(d.getDate()).padStart(2, '0')
				return y + '-' + m + '-' + day
			},
			async load() {
				this.loading = true
				this.errorMsg = ''
				try {
					const res = await getMySchedules({ view: this.view, date: this.anchorDate })
					this.days = (res.days || []).filter((d) => d.count > 0 || d.is_today)
					this.summary = res.summary || { count: 0, hours: 0, need_confirm: 0 }
					this.startDate = res.start_date
					this.endDate = res.end_date
				} catch (e) {
					this.errorMsg = e.message || '加载失败'
				} finally {
					this.loading = false
				}
			},
			async loadUnread() {
				try {
					const res = await getMyNotifications({ page: 1, pageSize: 1, status: 0 })
					this.unread = res.unread || 0
				} catch (e) {
					this.unread = 0
				}
			},
			shiftWeek(step) {
				const d = new Date(this.anchorDate + 'T00:00:00')
				d.setDate(d.getDate() + step * 7)
				this.anchorDate = this.fmt(d)
				this.load()
			},
			statusClass(s) {
				if (s === 4) return 'off'
				if (s === 3) return 'done'
				if (s === 2) return 'ok'
				return ''
			},
			confirmClass(p) {
				if (p.confirm_status === 1) return 'flag-ok'
				if (p.confirm_status === 2) return 'flag-bad'
				return 'flag-warn'
			},
			doConfirm(p, action) {
				uni.showModal({
					title: '确认排班',
					content: '确认 ' + p.plan_date + ' ' + p.start_time + '-' + p.end_time + ' 的排班？',
					success: async (r) => {
						if (!r.confirm) return
						try {
							await confirmMyPlan({ plan_id: p.id, action })
							uni.showToast({ title: '已确认', icon: 'success' })
							this.load()
						} catch (e) {
							/* 错误提示已在 request 层统一 toast */
						}
					}
				})
			},
			doReject(p) {
				uni.showModal({
					title: '拒接排班',
					editable: true,
					placeholderText: '请填写拒接原因（必填）',
					success: async (r) => {
						if (!r.confirm) return
						const reason = (r.content || '').trim()
						if (!reason) {
							uni.showToast({ title: '请填写原因', icon: 'none' })
							return
						}
						try {
							await confirmMyPlan({ plan_id: p.id, action: 2, reject_reason: reason })
							uni.showToast({ title: '已提交拒接', icon: 'none' })
							this.load()
						} catch (e) {}
					}
				})
			},
			goSwap(p) {
				uni.navigateTo({
					url: '/pages/swap-apply/index?plan_id=' + p.id + '&date=' + p.plan_date
				})
			},
			goLeave(p) {
				uni.navigateTo({
					url: '/pages/leave-apply/index?plan_ids=' + p.id + '&date=' + p.plan_date
				})
			},
			goRequests() {
				uni.navigateTo({ url: '/pages/my-requests/index' })
			},
			goGrab() {
				uni.navigateTo({ url: '/pages/grab-list/index' })
			},
			goNotice() {
				uni.navigateTo({ url: '/pages/my-notifications/index' })
			},
			goBack() {
				const pages = getCurrentPages()
				if (pages.length > 1) uni.navigateBack()
				else uni.switchTab({ url: '/pages/user/user' })
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

/* ===== 顶栏 ===== */
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
	width: 48rpx;
	font-size: 48rpx;
	line-height: 96rpx;
}

.topbar-title {
	font-size: 34rpx;
	font-weight: 700;
	flex: 1;
	text-align: center;
}

.topbar-actions {
	display: flex;
	align-items: center;
	gap: 20rpx;
	width: 160rpx;
	justify-content: flex-end;
}

.topbar-action {
	position: relative;
	padding: 8rpx 16rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.45);
	border-radius: 999rpx;
}

.topbar-action-text {
	font-size: 22rpx;
	color: #fff;
}

.topbar-badge {
	position: absolute;
	top: -10rpx;
	right: -8rpx;
	min-width: 28rpx;
	height: 28rpx;
	padding: 0 6rpx;
	background: #e8453c;
	color: #fff;
	font-size: 18rpx;
	line-height: 28rpx;
	text-align: center;
	border-radius: 999rpx;
}

/* ===== 周切换 ===== */
.weekbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 32rpx;
	background: #fff;
	flex-shrink: 0;
}

.week-nav {
	width: 64rpx;
	height: 64rpx;
	line-height: 60rpx;
	text-align: center;
	font-size: 40rpx;
	color: #1a535c;
	background: #eef4f2;
	border-radius: 50%;
}

.week-center {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.week-range {
	font-size: 30rpx;
	font-weight: 700;
	color: #1a3a3f;
}

.week-sub {
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.5);
	margin-top: 4rpx;
}

/* ===== 汇总 ===== */
.summary {
	display: flex;
	background: #fff;
	padding: 12rpx 32rpx 24rpx;
	flex-shrink: 0;
}

.summary-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.summary-value {
	font-size: 34rpx;
	font-weight: 700;
	color: #1a535c;
}

.summary-value.warn {
	color: #e8453c;
}

.summary-label {
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.55);
	margin-top: 4rpx;
}

/* ===== 列表 ===== */
.body {
	flex: 1;
	overflow: hidden;
}

.state-box {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 140rpx 0;
	gap: 20rpx;
}

.state-icon {
	font-size: 80rpx;
}

.state-text {
	font-size: 26rpx;
	color: rgba(26, 83, 92, 0.5);
}

.retry-btn {
	margin-top: 12rpx;
	padding: 16rpx 40rpx;
	background: #1a535c;
	color: #fff;
	font-size: 26rpx;
	border-radius: 999rpx;
}

.daylist {
	padding: 20rpx 32rpx 40rpx;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.dayhead {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 8rpx 0;
}

.daydate {
	font-size: 30rpx;
	font-weight: 700;
	color: #1a3a3f;
}

.dayweek {
	font-size: 22rpx;
	color: rgba(26, 83, 92, 0.6);
}

.daytag {
	font-size: 18rpx;
	padding: 2rpx 12rpx;
	border-radius: 999rpx;
}

.daytag.today {
	background: #1a535c;
	color: #fff;
}

.daytag.rest {
	background: #e6ece9;
	color: #7d918f;
}

.daycount {
	margin-left: auto;
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.5);
}

.pcard {
	background: #fff;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(26, 83, 92, 0.06);
}

.pcard-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.ptime {
	font-size: 30rpx;
	font-weight: 700;
	color: #1a535c;
}

.pstatus {
	font-size: 20rpx;
	padding: 4rpx 14rpx;
	border-radius: 999rpx;
	background: #eef4f2;
	color: #1a535c;
}

.pstatus.ok {
	background: #e6f4ea;
	color: #1f7a3d;
}

.pstatus.done {
	background: #e8f0fe;
	color: #2354a8;
}

.pstatus.off {
	background: #f0f0f0;
	color: #999;
}

.ptopic {
	display: block;
	margin-top: 10rpx;
	font-size: 26rpx;
	color: #2c4a4e;
}

.pmeta {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-top: 8rpx;
}

.pmeta-item {
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.6);
}

.pmeta-item.warn {
	color: #c9772a;
}

.pflags {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx;
	margin-top: 12rpx;
}

.flag {
	font-size: 18rpx;
	padding: 3rpx 12rpx;
	border-radius: 999rpx;
}

.flag-ok {
	background: #e6f4ea;
	color: #1f7a3d;
}

.flag-warn {
	background: #fdf1e0;
	color: #b87516;
}

.flag-bad {
	background: #fde8e6;
	color: #c0392b;
}

.flag-pending {
	background: #eef0fb;
	color: #4a4fa8;
}

.pactions {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-top: 18rpx;
	padding-top: 18rpx;
	border-top: 1rpx solid #eef2f0;
}

.pbtn {
	font-size: 22rpx;
	padding: 12rpx 24rpx;
	border-radius: 999rpx;
}

.pbtn.primary {
	background: #1a535c;
	color: #fff;
}

.pbtn.ghost {
	background: #eef4f2;
	color: #1a535c;
}

.pbtn.text {
	color: rgba(26, 83, 92, 0.55);
	padding-left: 0;
	margin-left: auto;
}

.footer-tip {
	text-align: center;
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.4);
	padding: 20rpx 40rpx 60rpx;
}
</style>
