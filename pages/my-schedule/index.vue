<template>
	<view class="page gf-page">
		<!-- ===== 顶栏 ===== -->
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">我的排班</text>
				<text class="gf-subtitle">主播工作台 · 周视图</text>
			</view>
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

		<!-- ===== 上播签到入口（标题下方显著位置） ===== -->
		<navigator class="checkin-bar" url="/pages/anchor-checkin/index" open-type="navigate">
			<view class="checkin-seal">签</view>
			<view class="checkin-main">
				<text class="checkin-title">上播签到</text>
				<text class="checkin-sub">选择房间号与视频号，开始今日直播</text>
			</view>
			<text class="checkin-go">进入 ›</text>
		</navigator>

		<!-- ===== 周切换 + 周日期轴 ===== -->
		<view class="weekwrap">
			<view class="weekbar">
				<view class="week-nav" @click="shiftWeek(-1)">‹</view>
				<view class="week-center">
					<text class="week-range">{{ rangeText }}</text>
					<text class="week-sub">{{ monthLabel }}</text>
				</view>
				<view class="week-nav" @click="shiftWeek(1)">›</view>
			</view>

			<scroll-view scroll-x class="dateaxis">
				<view class="axis-inner">
					<view v-for="day in days" :key="'ax-' + day.date" class="axis-cell" :class="{ on: day.is_today }">
						<text class="axis-week">{{ day.week_label }}</text>
						<text class="axis-date">{{ day.date.slice(5) }}</text>
						<view v-if="day.is_today" class="axis-seal">今</view>
						<view v-else class="axis-dot" :class="{ empty: day.count === 0 }"></view>
					</view>
				</view>
			</scroll-view>
		</view>

		<scroll-view scroll-y class="body">
			<!-- ===== 开播提醒 ===== -->
			<view class="notice">
				<view class="notice-seal">
					<text>提醒</text>
				</view>
				<view class="notice-main">
					<text class="notice-title">
						{{ summary.need_confirm > 0 ? '有 ' + summary.need_confirm + ' 场排班待你确认' : '本周排班已确认完毕' }}
					</text>
					<text class="notice-desc">
						本周共 {{ summary.count }} 场 · {{ summary.hours }} 小时，确认后请按时开播
					</text>
				</view>
			</view>

			<!-- ===== 汇总 ===== -->
			<view class="summary">
				<view class="summary-item">
					<text class="summary-value">{{ summary.count }}</text>
					<text class="summary-label">场次</text>
				</view>
				<view class="summary-divider"></view>
				<view class="summary-item">
					<text class="summary-value">{{ summary.hours }}</text>
					<text class="summary-label">小时</text>
				</view>
				<view class="summary-divider"></view>
				<view class="summary-item">
					<text class="summary-value" :class="{ warn: summary.need_confirm > 0 }">{{ summary.need_confirm }}</text>
					<text class="summary-label">待确认</text>
				</view>
			</view>

			<view v-if="loading && days.length === 0" class="gf-state">
				<text class="gf-state-text">加载中…</text>
			</view>

			<view v-else-if="errorMsg" class="gf-state">
				<text class="gf-state-text">{{ errorMsg }}</text>
				<view class="retry-btn" @click="load">重新加载</view>
			</view>

			<view v-else-if="days.length === 0" class="gf-state">
				<text class="gf-state-ico">闲</text>
				<text class="gf-state-text">本周暂无排班</text>
			</view>

			<view v-else class="daylist">
				<view v-for="day in days" :key="day.date" class="dayblock">
					<view class="dayhead">
						<view class="rail">
							<view class="rail-dot" :class="{ today: day.is_today }"></view>
						</view>
						<view class="dayhead-main">
							<text class="daydate">{{ day.date.slice(5) }}</text>
							<text class="dayweek">{{ day.week_label }}</text>
							<text v-if="day.is_today" class="daytag today">今</text>
							<text v-if="day.count === 0" class="daytag rest">休</text>
							<text v-else class="daycount">{{ day.count }} 场 · {{ day.hours }}h</text>
						</view>
					</view>

					<view v-for="p in day.plans" :key="p.id" class="pcard" :class="statusClass(p.status)">
						<view class="pcard-rail" :class="statusClass(p.status)"></view>
						<view class="pcard-body">
							<view class="pcard-head">
								<text class="ptime">{{ p.start_time }} - {{ p.end_time }}</text>
								<text class="pstatus" :class="statusClass(p.status)">{{ p.status_label }}</text>
							</view>

							<text class="ptopic">{{ p.topic || '未命名场次' }}</text>

							<view class="pmeta">
								<view v-if="p.room" class="pmeta-item">
									<text class="pmeta-tag">间</text>
									<text class="pmeta-txt">{{ p.room }}</text>
								</view>
								<view v-if="p.role" class="pmeta-item">
									<text class="pmeta-tag">岗</text>
									<text class="pmeta-txt">{{ p.role }}</text>
								</view>
								<view v-if="p.cover_status" class="pmeta-item warn">
									<text class="pmeta-tag">替</text>
									<text class="pmeta-txt">{{ p.cover_status_label }}</text>
								</view>
							</view>

							<view class="pflags">
								<text class="flag" :class="confirmClass(p)">{{ p.confirm_status_label }}</text>
								<text v-if="p.swap_pending" class="flag flag-pending">换班待审</text>
								<text v-if="p.leave_pending" class="flag flag-pending">请假待审</text>
							</view>

							<view class="pactions">
								<view v-if="p.confirm_status === 0 && !p.is_past" class="pbtn primary" @click="doConfirm(p, 1)">
									确认排班
								</view>
								<view v-if="p.confirm_status === 0 && !p.is_past" class="pbtn ghost" @click="doReject(p)">
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
			</view>

			<view class="footer-tip">排班由运营编排，如需调整请发起换班或请假申请</view>
		</scroll-view>

		<!-- ===== 底部四 Tab ===== -->
		<view class="gf-tabbar">
			<navigator class="gf-tab on" url="/pages/my-schedule/index" open-type="reLaunch">
				<text class="gf-tab-seal">排</text>
				<text class="gf-tab-txt">排班</text>
			</navigator>
			<navigator class="gf-tab" url="/pages/my-requests/index" open-type="reLaunch">
				<text class="gf-tab-seal">申</text>
				<text class="gf-tab-txt">申请</text>
			</navigator>
			<navigator class="gf-tab" url="/pages/my-notifications/index" open-type="reLaunch">
				<text class="gf-tab-seal">信</text>
				<text class="gf-tab-txt">消息</text>
			</navigator>
			<navigator class="gf-tab" url="/pages/anchor-profile/index" open-type="reLaunch">
				<text class="gf-tab-seal">我</text>
				<text class="gf-tab-txt">我的</text>
			</navigator>
		</view>
	</view>
</template>

<script>
	import { getMySchedules, getMyNotifications, confirmMyPlan } from '@/api/index'
	import { goBack as navBack } from '@/utils/nav'

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

/* ===== 顶栏右侧 ===== */
.topbar-actions {
	display: flex;
	align-items: center;
	gap: 14rpx;
	flex-shrink: 0;
}

.topbar-action {
	position: relative;
	padding: 8rpx 18rpx;
	border: 1rpx solid $gf-line;
	border-radius: 8rpx;
	background: rgba(255, 253, 247, 0.9);
}

.topbar-action-text {
	font-size: 22rpx;
	color: $gf-ink-2;
	letter-spacing: 1rpx;
}

.topbar-badge {
	position: absolute;
	top: -10rpx;
	right: -10rpx;
	min-width: 30rpx;
	height: 30rpx;
	line-height: 30rpx;
	padding: 0 6rpx;
	border-radius: 30rpx;
	background: $gf-cinnabar;
	color: #fdf6e6;
	font-size: 18rpx;
	text-align: center;
}

/* ===== 上播签到入口 ===== */
.checkin-bar {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin: 16rpx 28rpx 2rpx;
	padding: 18rpx 20rpx;
	border-radius: 16rpx;
	background: linear-gradient(120deg, #b23a2e 0%, #8f2d24 100%);
	border: 1rpx solid $gf-gold;
	box-shadow: 0 8rpx 20rpx rgba(178, 58, 46, 0.22);
	position: relative;
	overflow: hidden;
}

.checkin-bar::after {
	/* 右上角鎏金光晕，替代祥云点缀 */
	content: '';
	position: absolute;
	right: -40rpx;
	top: -60rpx;
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(232, 199, 122, 0.35) 0%, rgba(232, 199, 122, 0) 70%);
}

.checkin-seal {
	width: 60rpx;
	height: 60rpx;
	line-height: 54rpx;
	text-align: center;
	border: 2rpx solid rgba(253, 246, 230, 0.85);
	border-radius: 6rpx;
	color: #fdf6e6;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 30rpx;
	font-weight: 700;
	flex-shrink: 0;
	background: rgba(253, 246, 230, 0.08);
}

.checkin-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
	z-index: 1;
}

.checkin-title {
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 31rpx;
	font-weight: 700;
	color: #fdf6e6;
	letter-spacing: 4rpx;
}

.checkin-sub {
	font-size: 19rpx;
	color: rgba(253, 246, 230, 0.82);
	letter-spacing: 1rpx;
}

.checkin-go {
	flex-shrink: 0;
	font-size: 21rpx;
	color: #f0dcb4;
	letter-spacing: 1rpx;
	z-index: 1;
}

/* ===== 周切换 ===== */
.weekwrap {
	flex-shrink: 0;
	padding: 18rpx 28rpx 8rpx;
}

.weekbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 14rpx;
}

.week-nav {
	width: 56rpx;
	height: 56rpx;
	line-height: 50rpx;
	text-align: center;
	font-size: 34rpx;
	color: $gf-ink-2;
	border: 1rpx solid $gf-line-soft;
	border-radius: 50%;
	background: rgba(255, 253, 247, 0.7);
}

.week-center {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.week-range {
	font-size: 28rpx;
	color: $gf-ink;
	font-weight: 700;
	letter-spacing: 1rpx;
}

.week-sub {
	margin-top: 2rpx;
	font-size: 19rpx;
	color: $gf-ink-3;
	letter-spacing: 1rpx;
}

/* ===== 周日期轴 ===== */
.dateaxis {
	white-space: nowrap;
	width: 100%;
}

.axis-inner {
	display: inline-flex;
	gap: 12rpx;
	padding: 2rpx 2rpx 6rpx;
}

.axis-cell {
	position: relative;
	width: 88rpx;
	padding: 12rpx 0 14rpx;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	gap: 6rpx;
	border: 1rpx solid $gf-line-soft;
	border-radius: 12rpx;
	background: rgba(255, 253, 247, 0.72);
}

.axis-cell.on {
	border-color: $gf-cinnabar;
	background: rgba(178, 58, 46, 0.06);
}

.axis-week {
	font-size: 19rpx;
	color: $gf-ink-3;
	letter-spacing: 1rpx;
}

.axis-date {
	font-size: 24rpx;
	color: $gf-ink;
	font-weight: 700;
}

.axis-cell.on .axis-date {
	color: $gf-cinnabar;
}

.axis-seal {
	width: 36rpx;
	height: 36rpx;
	line-height: 32rpx;
	text-align: center;
	border: 2rpx solid $gf-cinnabar;
	border-radius: 4rpx;
	color: $gf-cinnabar;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 19rpx;
	font-weight: 700;
	background: rgba(178, 58, 46, 0.08);
}

.axis-dot {
	width: 10rpx;
	height: 10rpx;
	border-radius: 50%;
	background: $gf-gold;
}

.axis-dot.empty {
	background: rgba(140, 130, 116, 0.35);
}

/* ===== 滚动区 ===== */
.body {
	flex: 1;
	overflow: hidden;
	padding: 18rpx 28rpx 0;
}

/* ===== 开播提醒 ===== */
.notice {
	display: flex;
	align-items: center;
	gap: 18rpx;
	padding: 22rpx 22rpx;
	margin-bottom: 18rpx;
	border: 1rpx solid rgba(178, 58, 46, 0.28);
	border-radius: 16rpx;
	background: linear-gradient(180deg, #fdf5ea 0%, #f8ebd8 100%);
	box-shadow: 0 6rpx 16rpx rgba(178, 58, 46, 0.07);
}

.notice-seal {
	width: 74rpx;
	height: 74rpx;
	border: 2rpx solid $gf-cinnabar;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: $gf-cinnabar;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 22rpx;
	font-weight: 700;
	letter-spacing: 0;
	line-height: 1.15;
	text-align: center;
	background: rgba(178, 58, 46, 0.05);
	flex-shrink: 0;
}

.notice-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.notice-title {
	font-size: 27rpx;
	font-weight: 700;
	color: $gf-ink;
	letter-spacing: 1rpx;
}

.notice-desc {
	font-size: 21rpx;
	color: $gf-ink-2;
	line-height: 1.5;
}

/* ===== 汇总 ===== */
.summary {
	display: flex;
	align-items: center;
	justify-content: space-around;
	padding: 20rpx 10rpx;
	margin-bottom: 22rpx;
	border-top: 1rpx solid $gf-line-soft;
	border-bottom: 1rpx solid $gf-line-soft;
}

.summary-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4rpx;
	flex: 1;
}

.summary-divider {
	width: 1rpx;
	height: 46rpx;
	background: $gf-line-soft;
}

.summary-value {
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 40rpx;
	font-weight: 700;
	color: $gf-ink;
	line-height: 1;
}

.summary-value.warn {
	color: $gf-cinnabar;
}

.summary-label {
	font-size: 20rpx;
	color: $gf-ink-3;
	letter-spacing: 2rpx;
}

/* ===== 时间轴 ===== */
.daylist {
	padding-bottom: 10rpx;
}

.dayblock {
	position: relative;
}

.dayhead {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 6rpx 0 14rpx;
}

.rail {
	width: 20rpx;
	display: flex;
	justify-content: center;
	flex-shrink: 0;
}

.rail-dot {
	width: 14rpx;
	height: 14rpx;
	border-radius: 50%;
	background: $gf-gold;
	box-shadow: 0 0 0 4rpx rgba(201, 162, 75, 0.16);
}

.rail-dot.today {
	background: $gf-cinnabar;
	box-shadow: 0 0 0 4rpx rgba(178, 58, 46, 0.16);
}

.dayhead-main {
	display: flex;
	align-items: center;
	gap: 12rpx;
	flex: 1;
}

.daydate {
	font-size: 27rpx;
	font-weight: 700;
	color: $gf-ink;
	letter-spacing: 1rpx;
}

.dayweek {
	font-size: 21rpx;
	color: $gf-ink-3;
}

.daytag {
	height: 34rpx;
	line-height: 30rpx;
	padding: 0 10rpx;
	border-radius: 4rpx;
	font-size: 18rpx;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-weight: 700;
}

.daytag.today {
	color: #fdf6e6;
	background: $gf-cinnabar;
	border: 1rpx solid $gf-cinnabar;
}

.daytag.rest {
	color: $gf-ink-3;
	border: 1rpx solid rgba(140, 130, 116, 0.4);
}

.daycount {
	margin-left: auto;
	font-size: 20rpx;
	color: $gf-ink-3;
}

/* ===== 场次卡片 ===== */
.pcard {
	position: relative;
	display: flex;
	margin: 0 0 18rpx 20rpx;
	background: $gf-card;
	border: 1rpx solid $gf-line-soft;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 5rpx 14rpx rgba(26, 24, 21, 0.045);
}

.pcard-rail {
	width: 8rpx;
	flex-shrink: 0;
	background: rgba(140, 130, 116, 0.35);
}

.pcard-rail.ok {
	background: $gf-gold;
}

.pcard-rail.done {
	background: $gf-indigo;
}

.pcard-rail.off {
	background: rgba(140, 130, 116, 0.3);
}

.pcard-body {
	flex: 1;
	padding: 20rpx 22rpx 18rpx;
	min-width: 0;
}

.pcard-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12rpx;
	margin-bottom: 8rpx;
}

.ptime {
	font-size: 25rpx;
	font-weight: 700;
	color: $gf-ink;
	letter-spacing: 1rpx;
}

.pstatus {
	height: 34rpx;
	line-height: 32rpx;
	padding: 0 12rpx;
	border-radius: 4rpx;
	font-size: 18rpx;
	border: 1rpx solid $gf-line;
	color: $gf-ink-2;
	background: rgba(201, 162, 75, 0.08);
}

.pstatus.ok {
	color: #8a6a1f;
	border-color: rgba(201, 162, 75, 0.55);
	background: rgba(201, 162, 75, 0.14);
}

.pstatus.done {
	color: $gf-indigo;
	border-color: rgba(58, 74, 82, 0.35);
	background: rgba(58, 74, 82, 0.08);
}

.pstatus.off {
	color: $gf-ink-3;
	border-color: rgba(140, 130, 116, 0.35);
	background: rgba(140, 130, 116, 0.08);
}

.ptopic {
	display: block;
	font-size: 27rpx;
	color: $gf-ink;
	font-weight: 700;
	line-height: 1.45;
	margin-bottom: 10rpx;
}

.pcard.off .ptopic {
	color: $gf-ink-3;
	text-decoration: line-through;
}

.pmeta {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx 16rpx;
	margin-bottom: 10rpx;
}

.pmeta-item {
	display: flex;
	align-items: center;
	gap: 6rpx;
}

.pmeta-tag {
	width: 28rpx;
	height: 28rpx;
	line-height: 26rpx;
	text-align: center;
	border: 1rpx solid $gf-line;
	border-radius: 3rpx;
	font-size: 17rpx;
	color: #8a6a1f;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	background: rgba(201, 162, 75, 0.08);
}

.pmeta-txt {
	font-size: 21rpx;
	color: $gf-ink-2;
}

.pmeta-item.warn .pmeta-tag {
	color: $gf-cinnabar;
	border-color: rgba(178, 58, 46, 0.4);
	background: rgba(178, 58, 46, 0.06);
}

.pmeta-item.warn .pmeta-txt {
	color: $gf-cinnabar;
}

/* ===== 确认状态 ===== */
.pflags {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
	margin-bottom: 14rpx;
}

.flag {
	height: 34rpx;
	line-height: 32rpx;
	padding: 0 12rpx;
	border-radius: 4rpx;
	font-size: 18rpx;
	border: 1rpx solid transparent;
}

.flag-ok {
	color: #2f6a52;
	background: rgba(58, 106, 82, 0.08);
	border-color: rgba(58, 106, 82, 0.3);
}

.flag-warn {
	color: $gf-cinnabar;
	background: rgba(178, 58, 46, 0.08);
	border-color: rgba(178, 58, 46, 0.32);
}

.flag-bad {
	color: #7a3b32;
	background: rgba(122, 59, 50, 0.1);
	border-color: rgba(122, 59, 50, 0.3);
}

.flag-pending {
	color: #8a6a1f;
	background: rgba(201, 162, 75, 0.12);
	border-color: rgba(201, 162, 75, 0.45);
}

/* ===== 操作按钮 ===== */
.pactions {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	padding-top: 14rpx;
	border-top: 1rpx dashed $gf-line-soft;
}

.pbtn {
	height: 58rpx;
	line-height: 56rpx;
	padding: 0 22rpx;
	border-radius: 8rpx;
	font-size: 22rpx;
	letter-spacing: 1rpx;
	border: 1rpx solid transparent;
}

.pbtn.primary {
	background: linear-gradient(180deg, #c0463a 0%, $gf-cinnabar 100%);
	color: #fdf6e6;
	border-color: $gf-gold;
	font-weight: 700;
}

.pbtn.ghost {
	border-color: $gf-line;
	color: $gf-ink-2;
	background: rgba(255, 253, 247, 0.9);
}

.pbtn.text {
	margin-left: auto;
	border: none;
	background: transparent;
	color: #8a6a1f;
	padding: 0 4rpx;
}

.retry-btn {
	margin-top: 20rpx;
	height: 60rpx;
	line-height: 58rpx;
	padding: 0 30rpx;
	border: 1rpx solid $gf-cinnabar;
	border-radius: 8rpx;
	color: $gf-cinnabar;
	font-size: 23rpx;
}

.footer-tip {
	margin: 26rpx 10rpx 40rpx;
	text-align: center;
	font-size: 20rpx;
	color: $gf-ink-3;
	line-height: 1.6;
	letter-spacing: 1rpx;
}
</style>
