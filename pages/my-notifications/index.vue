<template>
	<view class="page">
		<view class="topbar">
			<view class="topbar-back" @click="goBack">‹</view>
			<text class="topbar-title">站内提醒</text>
			<view class="topbar-action" @click="readAll">全部已读</view>
		</view>

		<view class="filters">
			<view class="chip" :class="{ on: status === -1 }" @click="setStatus(-1)">全部</view>
			<view class="chip" :class="{ on: status === 0 }" @click="setStatus(0)">未读 {{ unread }}</view>
		</view>

		<scroll-view scroll-y class="body" @scrolltolower="loadMore">
			<view v-if="loading && list.length === 0" class="state-box">
				<text class="state-text">加载中…</text>
			</view>

			<view v-else-if="list.length === 0" class="state-box">
				<text class="state-icon">🔔</text>
				<text class="state-text">暂无提醒</text>
			</view>

			<view v-else class="list">
				<view v-for="it in list" :key="it.id" class="card" :class="{ unread: it.status === 0 }" @click="openItem(it)">
					<view class="card-head">
						<text class="icon">{{ iconOf(it.type) }}</text>
						<text class="title">{{ it.title }}</text>
						<text v-if="it.status === 0" class="dot"></text>
					</view>
					<text class="content">{{ it.content }}</text>
					<view class="card-foot">
						<text class="type">{{ it.type_label }}</text>
						<text class="time">{{ it.createtime }}</text>
					</view>
				</view>

				<view v-if="list.length >= total" class="list-end">没有更多了</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { getMyNotifications, readMyNotifications } from '@/api/index'
	import { goBack as navBack } from '@/utils/nav'

	export default {
		data() {
			return {
				status: -1,
				page: 1,
				pageSize: 15,
				total: 0,
				unread: 0,
				list: [],
				loading: false
			}
		},
		onLoad() {
			this.load(true)
		},
		onPullDownRefresh() {
			this.load(true).then(() => uni.stopPullDownRefresh())
		},
		methods: {
			iconOf(t) {
				switch (t) {
					case 1:
						return '📋'
					case 2:
						return '⏰'
					case 3:
						return '🏃'
					case 4:
						return '🔁'
					case 5:
						return '🛠'
					case 6:
						return '✅'
					default:
						return '🔔'
				}
			},
			setStatus(s) {
				this.status = s
				this.load(true)
			},
			async load(reset) {
				if (reset) {
					this.page = 1
					this.list = []
				}
				this.loading = true
				try {
					const res = await getMyNotifications({
						page: this.page,
						pageSize: this.pageSize,
						status: this.status,
						type: 0
					})
					const rows = res.list || []
					this.list = reset ? rows : this.list.concat(rows)
					this.total = res.total || 0
					this.unread = res.unread || 0
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
			async openItem(it) {
				if (it.status === 0) {
					try {
						await readMyNotifications({ ids: String(it.id) })
						it.status = 1
						this.unread = Math.max(0, this.unread - 1)
					} catch (e) {}
				}
				// 按业务类型跳转
				if (it.biz_type === 'swap' || it.biz_type === 'leave') {
					uni.navigateTo({ url: '/pages/my-requests/index' })
				} else if (it.biz_type === 'cover') {
					uni.navigateTo({ url: '/pages/grab-list/index' })
				} else if (it.biz_type === 'plan') {
					uni.navigateTo({ url: '/pages/my-schedule/index' })
				}
			},
			readAll() {
				uni.showModal({
					title: '全部已读',
					content: '把所有未读提醒标记为已读？',
					success: async (r) => {
						if (!r.confirm) return
						try {
							await readMyNotifications({ ids: '' })
							uni.showToast({ title: '已全部已读', icon: 'success' })
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
	flex: 1;
	text-align: center;
}

.topbar-action {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.85);
	width: 110rpx;
	text-align: right;
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
	gap: 18rpx;
}

.card {
	background: #fff;
	border-radius: 18rpx;
	padding: 22rpx 24rpx;
	box-shadow: 0 4rpx 14rpx rgba(26, 83, 92, 0.05);
}

.card.unread {
	border-left: 6rpx solid #1a535c;
}

.card-head {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.icon {
	font-size: 30rpx;
}

.title {
	flex: 1;
	font-size: 26rpx;
	font-weight: 700;
	color: #1a3a3f;
}

.dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: #e8453c;
}

.content {
	display: block;
	margin-top: 10rpx;
	font-size: 22rpx;
	color: rgba(26, 83, 92, 0.7);
	line-height: 32rpx;
}

.card-foot {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 12rpx;
}

.type {
	font-size: 18rpx;
	padding: 3rpx 12rpx;
	border-radius: 999rpx;
	background: #eef4f2;
	color: #1a535c;
}

.time {
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.4);
}

.list-end {
	text-align: center;
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.35);
	padding: 30rpx 0 10rpx;
}
</style>
