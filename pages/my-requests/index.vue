<template>
	<view class="page">
		<view class="topbar">
			<view class="topbar-back" @click="goBack">‹</view>
			<text class="topbar-title">我的申请</text>
			<view class="topbar-holder"></view>
		</view>

		<view class="filters">
			<view v-for="f in typeFilters" :key="f.value" class="chip" :class="{ on: type === f.value }" @click="setType(f.value)">
				{{ f.label }}
			</view>
			<view class="chip ghost" :class="{ on: onlyPending }" @click="togglePending">
				{{ onlyPending ? '仅待审核' : '全部状态' }}
			</view>
		</view>

		<scroll-view scroll-y class="body" @scrolltolower="loadMore">
			<view v-if="loading && list.length === 0" class="state-box">
				<text class="state-text">加载中…</text>
			</view>

			<view v-else-if="list.length === 0" class="state-box">
				<text class="state-icon">📝</text>
				<text class="state-text">暂无申请记录</text>
			</view>

			<view v-else class="list">
				<view v-for="it in list" :key="it.type + '-' + it.id" class="card">
					<view class="card-head">
						<view class="tagline">
							<text class="tag type">{{ it.type_label }}</text>
							<text v-if="it.type === 1" class="tag sub">{{ it.req_type_label }}</text>
							<text v-if="it.my_role" class="tag sub">{{ it.my_role }}</text>
						</view>
						<text class="status" :class="statusClass(it.status)">{{ it.status_label }}</text>
					</view>

					<view class="line">
						<text class="line-main">
							<template v-if="it.type === 1">
								{{ it.plan_date }} {{ it.start_time }}-{{ it.end_time }}
								<template v-if="it.req_type === 2">
									⇄ {{ it.target_date }} {{ it.target_start }}-{{ it.target_end }}
								</template>
							</template>
							<template v-else>{{ it.range_text }}</template>
						</text>
					</view>

					<view v-if="it.type === 1" class="line sub">
						{{ it.from_anchor_name }} → {{ it.to_anchor_name }}
					</view>
					<view v-else class="line sub">
						{{ it.leave_type_label }} · {{ it.plan_count }} 场
						<text v-if="it.auto_cover === 1"> · 已开启自动替班</text>
					</view>

					<view v-if="it.reason" class="line sub">理由：{{ it.reason }}</view>
					<view v-if="it.review_remark" class="line sub review">审核：{{ it.review_remark }}</view>

					<view class="card-foot">
						<text class="time">{{ it.createtime }}</text>
						<view v-if="it.can_cancel" class="btn ghost" @click="cancel(it)">取消申请</view>
					</view>
				</view>

				<view v-if="list.length >= total" class="list-end">没有更多了</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { getMyRequests, cancelMyRequest } from '@/api/index'
	import { goBack as navBack } from '@/utils/nav'

	export default {
		data() {
			return {
				loading: false,
				type: 0,
				onlyPending: false,
				page: 1,
				pageSize: 10,
				total: 0,
				list: [],
				typeFilters: [
					{ label: '全部', value: 0 },
					{ label: '换班', value: 1 },
					{ label: '请假', value: 2 }
				]
			}
		},
		onLoad() {
			this.load(true)
		},
		onPullDownRefresh() {
			this.load(true).then(() => uni.stopPullDownRefresh())
		},
		methods: {
			statusClass(s) {
				if (s === 0) return 'pending'
				if (s === 1) return 'pass'
				if (s === 2) return 'reject'
				if (s === 3) return 'done'
				return 'off'
			},
			setType(v) {
				this.type = v
				this.load(true)
			},
			togglePending() {
				this.onlyPending = !this.onlyPending
				this.load(true)
			},
			async load(reset) {
				if (reset) {
					this.page = 1
					this.list = []
				}
				this.loading = true
				try {
					const res = await getMyRequests({
						page: this.page,
						pageSize: this.pageSize,
						type: this.type,
						status: this.onlyPending ? 0 : -1
					})
					const rows = res.list || []
					this.list = reset ? rows : this.list.concat(rows)
					this.total = res.total || 0
				} catch (e) {
					/* toast 已统一处理 */
				} finally {
					this.loading = false
				}
			},
			loadMore() {
				if (this.list.length >= this.total || this.loading) return
				this.page += 1
				this.load(false)
			},
			cancel(it) {
				uni.showModal({
					title: '取消申请',
					content: '确定取消这条' + it.type_label + '申请？',
					success: async (r) => {
						if (!r.confirm) return
						try {
							await cancelMyRequest({ id: it.id, type: it.type, reason: '主播主动取消' })
							uni.showToast({ title: '已取消', icon: 'success' })
							this.load(true)
						} catch (e) {}
					}
				})
			},
			goBack() {
				// 统一返回：本项目未配置 tabBar，不能用 switchTab
				navBack()
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

.filters {
	display: flex;
	gap: 12rpx;
	padding: 20rpx 32rpx;
	background: #fff;
	flex-shrink: 0;
}

.chip {
	font-size: 22rpx;
	padding: 10rpx 24rpx;
	border-radius: 999rpx;
	background: #eef4f2;
	color: #1a535c;
}

.chip.on {
	background: #1a535c;
	color: #fff;
	font-weight: 700;
}

.chip.ghost.on {
	background: #c9772a;
	color: #fff;
}

.body {
	flex: 1;
	overflow: hidden;
	padding: 20rpx 32rpx 40rpx;
	box-sizing: border-box;
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

.list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.card {
	background: #fff;
	border-radius: 20rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(26, 83, 92, 0.05);
}

.card-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 14rpx;
}

.tagline {
	display: flex;
	gap: 10rpx;
}

.tag {
	font-size: 18rpx;
	padding: 3rpx 12rpx;
	border-radius: 999rpx;
}

.tag.type {
	background: #e8f0fe;
	color: #2354a8;
}

.tag.sub {
	background: #f2f4f3;
	color: rgba(26, 83, 92, 0.6);
}

.status {
	font-size: 20rpx;
	padding: 4rpx 14rpx;
	border-radius: 999rpx;
}

.status.pending {
	background: #fdf1e0;
	color: #b87516;
}

.status.pass {
	background: #e8f0fe;
	color: #2354a8;
}

.status.reject {
	background: #fde8e6;
	color: #c0392b;
}

.status.done {
	background: #e6f4ea;
	color: #1f7a3d;
}

.status.off {
	background: #f0f0f0;
	color: #999;
}

.line {
	margin-top: 6rpx;
}

.line-main {
	font-size: 28rpx;
	font-weight: 700;
	color: #1a3a3f;
}

.line.sub {
	font-size: 22rpx;
	color: rgba(26, 83, 92, 0.6);
	line-height: 32rpx;
}

.line.review {
	color: #b87516;
}

.card-foot {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 16rpx;
	padding-top: 14rpx;
	border-top: 1rpx solid #f1f5f3;
}

.time {
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.4);
}

.btn {
	font-size: 22rpx;
	padding: 10rpx 24rpx;
	border-radius: 999rpx;
}

.btn.ghost {
	background: #fde8e6;
	color: #c0392b;
}

.list-end {
	text-align: center;
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.35);
	padding: 30rpx 0 10rpx;
}
</style>
