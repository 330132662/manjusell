<template>
	<view class="page">
		<view class="topbar">
			<view class="topbar-back" @click="goBack">‹</view>
			<text class="topbar-title">抢班</text>
			<view class="topbar-holder"></view>
		</view>

		<view class="filters">
			<view class="chip" :class="{ on: scope === 1 }" @click="setScope(1)">可抢场次</view>
			<view class="chip" :class="{ on: scope === 2 }" @click="setScope(2)">我抢到的</view>
		</view>

		<scroll-view scroll-y class="body" @scrolltolower="loadMore">
			<view v-if="loading && list.length === 0" class="state-box">
				<text class="state-text">加载中…</text>
			</view>

			<view v-else-if="list.length === 0" class="state-box">
				<text class="state-icon">🏃</text>
				<text class="state-text">{{ scope === 1 ? '当前没有可抢的场次' : '还没有抢到过场次' }}</text>
			</view>

			<view v-else class="list">
				<view v-for="it in list" :key="it.id" class="card">
					<view class="card-head">
						<text class="slot-time">{{ it.plan_date }} {{ it.start_time }}-{{ it.end_time }}</text>
						<text class="tag" :class="it.grabbable ? 'ok' : 'gray'">{{ it.status_label }}</text>
					</view>

					<text class="topic">{{ it.topic || '未命名场次' }}</text>

					<view class="meta">
						<text class="meta-item">原主播 {{ it.anchor_name || '—' }}</text>
						<text v-if="it.room" class="meta-item">📍 {{ it.room }}</text>
						<text v-if="it.way" class="meta-item">{{ it.way_label }}</text>
					</view>

					<view v-if="it.grab_deadline" class="deadline">
						抢班截止：{{ it.grab_deadline }}
					</view>

					<view class="card-foot">
						<text class="foot-tip">{{ it.remark || '顶班后这场排班归你出镜' }}</text>
						<view v-if="it.grabbable" class="btn primary" @click="grab(it)">
							{{ grabbingId === it.id ? '抢班中…' : '立即抢班' }}
						</view>
						<text v-else-if="scope === 2" class="mine">已归你</text>
					</view>
				</view>

				<view v-if="list.length >= total" class="list-end">没有更多了</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { getGrabbableList, grabCover } from '@/api/index'

	export default {
		data() {
			return {
				scope: 1,
				page: 1,
				pageSize: 10,
				total: 0,
				list: [],
				loading: false,
				grabbingId: 0
			}
		},
		onLoad() {
			this.load(true)
		},
		onPullDownRefresh() {
			this.load(true).then(() => uni.stopPullDownRefresh())
		},
		methods: {
			setScope(s) {
				this.scope = s
				this.load(true)
			},
			async load(reset) {
				if (reset) {
					this.page = 1
					this.list = []
				}
				this.loading = true
				try {
					const res = await getGrabbableList({
						page: this.page,
						pageSize: this.pageSize,
						scope: this.scope
					})
					const rows = res.list || []
					this.list = reset ? rows : this.list.concat(rows)
					this.total = res.total || 0
				} catch (e) {
				} finally {
					this.loading = false
				}
			},
			loadMore() {
				if (this.list.length >= this.total || this.loading) return
				this.page += 1
				this.load(false)
			},
			grab(it) {
				uni.showModal({
					title: '确认抢班',
					content:
						'抢下 ' + it.plan_date + ' ' + it.start_time + '-' + it.end_time + ' 后，这场排班归你出镜，确定？',
					success: async (r) => {
						if (!r.confirm) return
						this.grabbingId = it.id
						try {
							await grabCover({ id: it.id })
							uni.showToast({ title: '抢班成功', icon: 'success' })
							this.load(true)
						} catch (e) {
							// 手慢了等业务失败提示已由 request 层 toast
							this.load(true)
						} finally {
							this.grabbingId = 0
						}
					}
				})
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

.filters {
	display: flex;
	gap: 12rpx;
	padding: 20rpx 32rpx;
	background: #fff;
	flex-shrink: 0;
}

.chip {
	font-size: 22rpx;
	padding: 10rpx 26rpx;
	border-radius: 999rpx;
	background: #eef4f2;
	color: #1a535c;
}

.chip.on {
	background: #1a535c;
	color: #fff;
	font-weight: 700;
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
}

.slot-time {
	font-size: 30rpx;
	font-weight: 700;
	color: #1a535c;
}

.tag {
	font-size: 18rpx;
	padding: 3rpx 12rpx;
	border-radius: 999rpx;
}

.tag.ok {
	background: #e6f4ea;
	color: #1f7a3d;
}

.tag.gray {
	background: #f2f4f3;
	color: rgba(26, 83, 92, 0.6);
}

.topic {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #2c4a4e;
}

.meta {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-top: 10rpx;
}

.meta-item {
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.6);
}

.deadline {
	margin-top: 12rpx;
	padding: 10rpx 14rpx;
	background: #fdf7ee;
	border-radius: 10rpx;
	font-size: 20rpx;
	color: #b87516;
}

.card-foot {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 16rpx;
	padding-top: 16rpx;
	border-top: 1rpx solid #f1f5f3;
}

.foot-tip {
	flex: 1;
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.45);
	padding-right: 16rpx;
}

.btn.primary {
	font-size: 24rpx;
	padding: 14rpx 32rpx;
	background: #1a535c;
	color: #fff;
	border-radius: 999rpx;
}

.mine {
	font-size: 22rpx;
	color: #1f7a3d;
}

.list-end {
	text-align: center;
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.35);
	padding: 30rpx 0 10rpx;
}
</style>
