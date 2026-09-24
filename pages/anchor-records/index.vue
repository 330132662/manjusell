<template>
	<view class="page">
		<!-- 顶栏 -->
		<view class="topbar">
			<view class="topbar-back" @click="goBack">‹</view>
			<text class="topbar-title">直播记录</text>
			<view class="topbar-holder"></view>
		</view>

		<!-- 列表 -->
		<view class="body">
			<!-- 加载中 -->
			<view v-if="loading && items.length === 0" class="state-box">
				<text class="state-text">加载中…</text>
			</view>

			<!-- 加载失败 -->
			<view v-else-if="errorMsg" class="state-box">
				<text class="state-text">{{ errorMsg }}</text>
				<view class="retry-btn" @click="reload">重新加载</view>
			</view>

			<!-- 空列表 -->
			<view v-else-if="items.length === 0" class="state-box">
				<text class="state-icon">📭</text>
				<text class="state-text">暂无直播记录</text>
			</view>

			<!-- 记录列表 -->
			<view v-else class="list">
				<view v-for="item in items" :key="item.id" class="card">
					<view class="card-head">
						<view class="status" :class="{ live: !item.end_time }">
							<text v-if="!item.end_time" class="status-dot"></text>
							<text class="status-text">{{ item.end_time ? '已下播' : '直播中' }}</text>
						</view>
						<text class="card-id">#{{ item.id }}</text>
					</view>

					<view class="card-row">
						<text class="row-k">房间</text>
						<text class="row-v">{{ item.office_no ? item.office_no + ' 室' : '—' }}</text>
					</view>
					<view class="card-row">
						<text class="row-k">视频号</text>
						<text class="row-v">{{ item.account_name || '—' }}</text>
					</view>
					<view class="card-row">
						<text class="row-k">上播时间</text>
						<text class="row-v">{{ item.start_time || '—' }}</text>
					</view>
					<view class="card-row">
						<text class="row-k">下播时间</text>
						<text class="row-v">{{ item.end_time || '—' }}</text>
					</view>
					<view class="card-row">
						<text class="row-k">订单数</text>
						<text class="row-v">{{ item.order_count || 0 }}</text>
					</view>
				</view>

				<!-- 加载更多 -->
				<view v-if="hasMore" class="load-more" @click="loadMore">
					<text>{{ loadingMore ? '加载中…' : '加载更多' }}</text>
				</view>
				<view v-else-if="items.length > 0" class="load-end">
					<text>没有更多了</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { getMyLiveRecords } from '@/api'

const items = ref([])
const page = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const errorMsg = ref('')

const hasMore = computed(() => items.value.length < total.value)

onMounted(() => {
	const token = uni.getStorageSync('token')
	if (!token) {
		uni.reLaunch({ url: '/pages/anchor-login/index' })
		return
	}
	loadData()
})

async function loadData() {
	loading.value = true
	errorMsg.value = ''
	try {
		const res = await getMyLiveRecords({ page: 1, pageSize })
		items.value = (res && res.items) || []
		total.value = (res && res.total) || 0
		page.value = 1
	} catch (e) {
		errorMsg.value = (e && e.message) || '加载失败，请稍后重试'
	} finally {
		loading.value = false
	}
}

async function loadMore() {
	if (loadingMore.value || !hasMore.value) return
	loadingMore.value = true
	try {
		const nextPage = page.value + 1
		const res = await getMyLiveRecords({ page: nextPage, pageSize })
		const list = (res && res.items) || []
		items.value = items.value.concat(list)
		total.value = (res && res.total) || total.value
		page.value = nextPage
	} catch (e) {
		uni.showToast({ title: (e && e.message) || '加载失败', icon: 'none' })
	} finally {
		loadingMore.value = false
	}
}

function reload() {
	loadData()
}

// 滑到页面底部自动加载下一页
onReachBottom(() => {
	loadMore()
})

// 下拉刷新：重置到第一页重新加载
onPullDownRefresh(async () => {
	try {
		await loadData()
	} finally {
		uni.stopPullDownRefresh()
	}
})

function goBack() {
	uni.navigateBack({
		fail: () => uni.reLaunch({ url: '/pages/anchor-checkin/index' })
	})
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
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
	padding: 0 32rpx;
	background: #1a535c;
	color: #ffffff;
	position: sticky;
	top: 0;
	z-index: 10;
}

.topbar-back {
	width: 64rpx;
	font-size: 52rpx;
	line-height: 96rpx;
	color: #ffffff;
}

.topbar-title {
	font-size: 34rpx;
	font-weight: 700;
}

.topbar-holder {
	width: 64rpx;
}

.body {
	padding: 28rpx 32rpx;
	box-sizing: border-box;
}

/* ===== 状态盒子 ===== */
.state-box {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
	gap: 20rpx;
}

.state-icon {
	font-size: 80rpx;
}

.state-text {
	font-size: 28rpx;
	color: rgba(26, 83, 92, 0.5);
}

.retry-btn {
	margin-top: 12rpx;
	padding: 16rpx 40rpx;
	background: #1a535c;
	color: #ffffff;
	font-size: 26rpx;
	border-radius: 999rpx;
}

/* ===== 记录卡片 ===== */
.list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.card {
	background: #ffffff;
	border-radius: 20rpx;
	padding: 28rpx 32rpx;
	box-shadow: 0 6rpx 20rpx rgba(26, 83, 92, 0.05);
}

.card-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
	padding-bottom: 18rpx;
	border-bottom: 1rpx solid #eef2ef;
}

.status {
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
	padding: 6rpx 18rpx;
	border-radius: 999rpx;
	background: rgba(26, 83, 92, 0.1);
}

.status.live {
	background: rgba(255, 107, 107, 0.12);
}

.status-dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: #ff6b6b;
	animation: blink 1s infinite;
}

@keyframes blink {
	50% {
		opacity: 0.35;
	}
}

.status-text {
	font-size: 24rpx;
	color: #1a535c;
	font-weight: 600;
}

.status.live .status-text {
	color: #ff6b6b;
}

.card-id {
	font-size: 24rpx;
	color: rgba(26, 83, 92, 0.4);
}

.card-row {
	display: flex;
	justify-content: space-between;
	padding: 10rpx 0;
}

.row-k {
	font-size: 26rpx;
	color: rgba(26, 83, 92, 0.55);
}

.row-v {
	font-size: 26rpx;
	color: #1a535c;
	font-weight: 600;
	max-width: 60%;
	text-align: right;
}

/* ===== 加载更多 ===== */
.load-more,
.load-end {
	text-align: center;
	padding: 32rpx 0;
	font-size: 26rpx;
	color: rgba(26, 83, 92, 0.5);
}

.load-more {
	color: #16a69a;
	font-weight: 600;
}
</style>
