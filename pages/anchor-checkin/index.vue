<template>
	<view class="page">
		<!-- 顶栏 -->
		<view class="topbar">
			<view class="topbar-back" @click="goBack">‹</view>
			<text class="topbar-title">主播签到</text>
			<view class="topbar-holder"></view>
		</view>

		<!-- 未上播：选房间 + 选视频号 -->
		<view v-if="!isLive" class="body">
			<view class="tip">
				<text class="tip-dot"></text>
				<text class="tip-text">请先绑定房间号、选择视频号，两项选好后即可上播</text>
			</view>

			<view class="card">
				<!-- 房间号：下拉选择（拉取房间列表接口） -->
				<picker mode="selector" :range="officeNames" :disabled="loadingOffices" @change="onOfficeChange">
					<view class="field">
						<view class="field-left">
							<text class="field-label">房间号</text>
							<text class="field-req">*</text>
						</view>
						<view class="field-value" :class="{ done: !!roomOffice }">
							<text v-if="roomOffice" class="field-text">{{ roomOffice.no }} 室</text>
							<text v-else class="field-placeholder">
								{{ loadingOffices ? '加载中…' : '下拉选择房间号' }}
							</text>
						</view>
						<view class="field-arrow">⌄</view>
					</view>
				</picker>
				<!-- <view class="room-scan-link" @click="openRoomModal">没有房间？去扫码绑定</view> -->

				<!-- 视频号：下拉 -->
				<picker mode="selector" :range="accountNames" :disabled="loadingAccounts" @change="onAccountChange">
					<view class="field">
						<view class="field-left">
							<text class="field-label">视频号</text>
							<text class="field-req">*</text>
						</view>
						<view class="field-value" :class="{ done: !!selectedAccount }">
							<text v-if="selectedAccount" class="field-text">{{ selectedAccount.source_name }}</text>
							<text v-else class="field-placeholder">
								{{ loadingAccounts ? '加载中…' : '下拉选择视频号' }}
							</text>
						</view>
						<view class="field-arrow">⌄</view>
					</view>
				</picker>
			</view>

			<!-- 上播按钮：两项都选好才可点 -->
			<view class="action-wrap">
				<button class="btn-up" :class="{ disabled: !canUp }" :disabled="!canUp" @click="handleUp">
					{{ submitting ? '上播中…' : '上　播' }}
				</button>

			</view>
			<view class="action-wrap">
				<button @click="switchAccount">切换账号</button>
			</view>
		</view>

		<!-- 已上播：仅显示下播 -->
		<view v-else class="body">
			<view class="live-banner">
				<view class="live-badge">
					<text class="live-dot"></text>
					<text class="live-badge-text">直播中</text>
				</view>
				<view class="live-info">
					<view class="live-row">
						<text class="live-k">房间</text>
						<text class="live-v">{{ roomOffice ? roomOffice.no : '—' }}</text>
					</view>
					<view class="live-row">
						<text class="live-k">视频号</text>
						<text class="live-v">{{ selectedAccount ? selectedAccount.source_name : '—' }}</text>
					</view>
					<view class="live-row" v-if="liveInfo.start_time">
						<text class="live-k">上播时间</text>
						<text class="live-v">{{ liveInfo.start_time }}</text>
					</view>
				</view>
			</view>

			<view class="action-wrap">
				<button class="btn-down" @click="handleDown">下　播</button>
			</view>
		</view>

		<!-- 房间绑定弹层：扫码为主，手动选择兜底 -->
		<view v-if="showRoomModal" class="mask" @click="closeRoomModal">
			<view class="sheet" @click.stop>
				<view class="sheet-head">
					<text class="sheet-title">绑定房间号</text>
					<text class="sheet-close" @click="closeRoomModal">×</text>
				</view>

				<view class="scan-btn" @click="scanRoom">
					<view class="scan-icon">
						<view class="scan-corner tl"></view>
						<view class="scan-corner tr"></view>
						<view class="scan-corner bl"></view>
						<view class="scan-corner br"></view>
						<text class="scan-icon-text">扫码</text>
					</view>
					<text class="scan-label">扫码绑定房间号</text>
				</view>
				<text class="scan-sub" v-if="scanHint">{{ scanHint }}</text>

				<view class="sheet-divider"><text>或手动选择</text></view>

				<scroll-view scroll-y class="sheet-list">
					<view v-for="o in offices" :key="o.id" class="sheet-item"
						:class="{ active: roomOffice && roomOffice.id === o.id }" @click="bindOffice(o)">
						<text class="sheet-item-name">{{ o.no }} 室</text>
						<text v-if="roomOffice && roomOffice.id === o.id" class="sheet-item-check">✓</text>
					</view>
					<view v-if="offices.length === 0" class="sheet-empty">暂无可用房间</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue'
	import {
			getLiveOffices,
			getLiveAccounts,
			getAnchorUserinfo,
			getLiveRecords,
			liveCheckIn,
			liveCheckOut
		} from '@/api'

	const offices = ref([])
	const accounts = ref([])
	const roomOffice = ref(null) // 扫码/手动绑定的房间(办公室)
	const selectedAccount = ref(null) // 下拉选中的视频号
	const isLive = ref(false)
	const submitting = ref(false)
	const loadingAccounts = ref(false)
	const loadingOffices = ref(false)
	const liveInfo = ref({})
	const showRoomModal = ref(false)
	const scanHint = ref('')

	const accountNames = computed(() => accounts.value.map((a) => a.source_name || `视频号${a.id}`))
	const officeNames = computed(() => offices.value.map((o) => `${o.no} 室`))

	const canUp = computed(() => !!roomOffice.value && !!selectedAccount.value && !submitting.value)

	// 房间号下拉选择
	function onOfficeChange(e) {
		const office = offices.value[Number(e.detail.value)]
		if (office) roomOffice.value = office
	}

	onMounted(async () => {
		// 未登录或 token 失效则先去登录页
		const token = uni.getStorageSync('token')
		console.log("token检测 ", token);
		if (!token) {
			uni.reLaunch({
				url: '/pages/anchor-login/index'
			})
			return
		}
		// 先查询是否正在直播：若在直播中则直接切到已上播状态(仅显示下播)
		checkLiveStatus()
		// 预取房间号下拉
		loadingOffices.value = true
		getLiveOffices()
			.then((res) => {
				offices.value = (res && res.items) || []
			})
			.catch(() => {
				offices.value = []
			})
			.finally(() => {
				loadingOffices.value = false
			})
		// 预取视频号下拉
		loadingAccounts.value = true
		try {
			const res = await getLiveAccounts()
			accounts.value = (res && res.items) || []
		} catch (e) {
			accounts.value = []
		} finally {
			loadingAccounts.value = false
		}
	})

	// 查询当前主播是否有未下播(直播中)的记录，有则恢复为已上播状态
	async function checkLiveStatus() {
		// 取当前登录主播的 uid(=直播记录 streamer_id)，本地缓存避免每次进页面多拉一次用户信息
		let uid = uni.getStorageSync('streamer_id')
		if (!uid) {
			try {
				const info = await getAnchorUserinfo()
				uid = info && info.id
				if (uid) uni.setStorageSync('streamer_id', uid)
			} catch (e) {
				return
			}
		}
		if (!uid) return
		try {
			const res = await getLiveRecords({
				streamer_id: Number(uid),
				page: 1,
				pageSize: 10
			})
			const items = (res && res.items) || []
			// 存在 end_time 为空的记录 = 仍在直播
			const live = items.find((it) => !it.end_time)
			if (live) {
				isLive.value = true
				roomOffice.value = live.office_id ? {
					id: live.office_id,
					no: live.office_no
				} : null
				selectedAccount.value = live.account_id ? {
					id: live.account_id,
					source_name: live.account_name
				} : null
				liveInfo.value = {
					id: live.id,
					start_time: live.start_time
				}
			}
		} catch (e) {
			// 查询失败不阻断页面，保持未上播初始态
		}
	}

	function goBack() {
		uni.navigateBack({
			fail: () => uni.reLaunch({
				url: '/pages/home/index'
			})
		})
	}

	function switchAccount() {
		console.log("aaaa");
		uni.navigateTo({
			url: "/pages/anchor-login/index"
		})
	}

	function openRoomModal() {
		showRoomModal.value = true
		scanHint.value = ''
	}

	function closeRoomModal() {
		showRoomModal.value = false
	}

	// 扫码绑定房间号：扫描到的内容(每间房二维码不同)与办公室门牌号匹配
	async function scanRoom() {
		let result = ''
		try {
			const res = await uni.scanCode({
				scanType: ['qrCode']
			})
			result = (res && res.result) || ''
		} catch (e) {
			// 非小程序/H5 不支持或无授权等，走手动选择
			scanHint.value = '当前环境不支持扫码，请直接手动选择房间号'
			return
		}

		if (!result) {
			scanHint.value = '未识别到二维码内容，请手动选择房间号'
			return
		}

		const office = resolveOffice(result)
		if (office) {
			bindOffice(office)
			scanHint.value = ''
		} else {
			scanHint.value = `未匹配到房间「${result}」，请扫码后手动选择`
		}
	}

	// 把扫码文本解析成 office：优先按门牌号(no)，其次按 id
	function resolveOffice(text) {
		const t = String(text || '').trim()
		if (!t) return null
		return (
			offices.value.find((o) => String(o.no).trim() === t) ||
			offices.value.find((o) => o.id === Number(t))
		)
	}

	function bindOffice(o) {
		roomOffice.value = o
		showRoomModal.value = false
		uni.showToast({
			title: `已绑定 ${o.no} 室`,
			icon: 'none'
		})
	}

	function onAccountChange(e) {
		const idx = Number(e.detail.value)
		selectedAccount.value = accounts.value[idx] || null
	}

	// 上播签到
	async function handleUp() {
		if (!canUp.value || submitting.value) return
		submitting.value = true
		try {
			const res = await liveCheckIn({
				office_id: roomOffice.value.id,
				account_id: selectedAccount.value.id
			})
			isLive.value = true
			liveInfo.value = {
				id: res.id,
				start_time: res.start_time
			}
			uni.showToast({
				title: '上播成功',
				icon: 'success'
			})
		} catch (e) {
			uni.showToast({
				title: (e && e.message) || '上播失败',
				icon: 'none'
			})
		} finally {
			submitting.value = false
		}
	}

	// 下播签退（先弹确认框）
	function handleDown() {
		uni.showModal({
			title: '确认下播',
			content: '下播后将结束本次直播并签退，确认继续吗？',
			confirmText: '确认下播',
			confirmColor: '#FF6B6B',
			success: (r) => {
				if (r.confirm) {
					doCheckOut()
				}
			}
		})
	}

	async function doCheckOut() {
		submitting.value = true
		try {
			const res = await liveCheckOut()
			uni.showToast({
				title: '下播签退成功',
				icon: 'success'
			})
			// 回到可上播状态，清空本次绑定以重新选择
			isLive.value = false
			roomOffice.value = null
			selectedAccount.value = null
			liveInfo.value = {}
		} catch (e) {
			uni.showToast({
				title: (e && e.message) || '下播失败',
				icon: 'none'
			})
		} finally {
			submitting.value = false
		}
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

	/* ===== 顶部提示 ===== */
	.tip {
		display: flex;
		align-items: flex-start;
		gap: 12rpx;
		background: rgba(78, 205, 196, 0.1);
		border: 1rpx solid rgba(78, 205, 196, 0.35);
		border-radius: 16rpx;
		padding: 18rpx 22rpx;
		margin-bottom: 24rpx;
	}

	.tip-dot {
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		background: #4ecdc4;
		margin-top: 10rpx;
		flex-shrink: 0;
	}

	.tip-text {
		flex: 1;
		font-size: 24rpx;
		color: #1a535c;
		line-height: 1.5;
	}

	/* ===== 卡片 ===== */
	.card {
		background: #ffffff;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.field {
		display: flex;
		align-items: center;
		padding: 30rpx 28rpx;
		gap: 16rpx;
	}

	.field+.field {
		border-top: 1rpx solid #eef2ef;
	}

	.field-left {
		display: flex;
		align-items: baseline;
		width: 130rpx;
	}

	.field-label {
		font-size: 30rpx;
		color: #1a535c;
		font-weight: 600;
	}

	.field-req {
		color: #ff6b6b;
		font-size: 26rpx;
		margin-left: 4rpx;
	}

	.field-value {
		flex: 1;
		min-width: 0;
	}

	.field-text {
		font-size: 30rpx;
		color: #1a535c;
	}

	.field-placeholder {
		font-size: 28rpx;
		color: rgba(26, 83, 92, 0.4);
	}

	.field-action {
		font-size: 24rpx;
		color: #16a69a;
		border: 1rpx solid #16a69a;
		border-radius: 999rpx;
		padding: 8rpx 22rpx;
		flex-shrink: 0;
	}

	.field-action.done {
		color: rgba(26, 83, 92, 0.45);
		border-color: rgba(26, 83, 92, 0.25);
	}

	.field-arrow {
		font-size: 30rpx;
		color: rgba(26, 83, 92, 0.4);
	}

	.room-scan-link {
		padding: 10rpx 8rpx 2rpx;
		text-align: right;
		font-size: 24rpx;
		color: #16a69a;
	}

	/* ===== 按钮 ===== */
	.action-wrap {
		margin-top: 48rpx;
	}

	.btn-up {
		width: 100%;
		height: 100rpx;
		line-height: 100rpx;
		border-radius: 20rpx;
		background: linear-gradient(135deg, #1a535c 0%, #4ecdc4 100%);
		color: #ffffff;
		font-size: 34rpx;
		font-weight: 700;
		border: none;

		&::after {
			border: none;
		}
	}

	.btn-up.disabled {
		opacity: 0.45;
	}

	.btn-down {
		width: 100%;
		height: 100rpx;
		line-height: 100rpx;
		border-radius: 20rpx;
		background: #ff6b6b;
		color: #ffffff;
		font-size: 34rpx;
		font-weight: 700;
		border: none;

		&::after {
			border: none;
		}
	}

	/* ===== 直播中横幅 ===== */
	.live-banner {
		background: #ffffff;
		border-radius: 20rpx;
		padding: 32rpx;
	}

	.live-badge {
		display: inline-flex;
		align-items: center;
		gap: 10rpx;
		background: rgba(255, 107, 107, 0.12);
		border-radius: 999rpx;
		padding: 8rpx 22rpx;
	}

	.live-dot {
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		background: #ff6b6b;
		animation: blink 1s infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0.35;
		}
	}

	.live-badge-text {
		font-size: 26rpx;
		color: #ff6b6b;
		font-weight: 700;
	}

	.live-info {
		margin-top: 24rpx;
	}

	.live-row {
		display: flex;
		justify-content: space-between;
		padding: 14rpx 0;
	}

	.live-k {
		font-size: 28rpx;
		color: rgba(26, 83, 92, 0.55);
	}

	.live-v {
		font-size: 28rpx;
		color: #1a535c;
		font-weight: 600;
	}

	/* ===== 房间绑定弹层 ===== */
	.mask {
		position: fixed;
		inset: 0;
		background: rgba(10, 20, 18, 0.45);
		display: flex;
		align-items: flex-end;
		z-index: 99;
	}

	.sheet {
		width: 100%;
		background: #ffffff;
		border-radius: 28rpx 28rpx 0 0;
		padding: 30rpx 32rpx calc(30rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.sheet-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.sheet-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #1a535c;
	}

	.sheet-close {
		font-size: 44rpx;
		color: rgba(26, 83, 92, 0.5);
		padding: 0 12rpx;
	}

	.scan-btn {
		margin-top: 36rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 18rpx;
	}

	.scan-icon {
		position: relative;
		width: 180rpx;
		height: 180rpx;
		border: 2rpx solid #4ecdc4;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.scan-corner {
		position: absolute;
		width: 44rpx;
		height: 44rpx;
		border-color: #1a535c;
	}

	.scan-corner.tl {
		top: -2rpx;
		left: -2rpx;
		border-top: 6rpx solid;
		border-left: 6rpx solid;
	}

	.scan-corner.tr {
		top: -2rpx;
		right: -2rpx;
		border-top: 6rpx solid;
		border-right: 6rpx solid;
	}

	.scan-corner.bl {
		bottom: -2rpx;
		left: -2rpx;
		border-bottom: 6rpx solid;
		border-left: 6rpx solid;
	}

	.scan-corner.br {
		bottom: -2rpx;
		right: -2rpx;
		border-bottom: 6rpx solid;
		border-right: 6rpx solid;
	}

	.scan-icon-text {
		font-size: 30rpx;
		color: #16a69a;
		font-weight: 600;
	}

	.scan-label {
		font-size: 28rpx;
		color: #1a535c;
		font-weight: 600;
	}

	.scan-sub {
		margin-top: 8rpx;
		font-size: 22rpx;
		color: #ff6b6b;
		text-align: center;
	}

	.sheet-divider {
		display: flex;
		align-items: center;
		gap: 20rpx;
		color: rgba(26, 83, 92, 0.4);
		font-size: 22rpx;
		margin: 30rpx 0 10rpx;
	}

	.sheet-divider::before,
	.sheet-divider::after {
		content: '';
		flex: 1;
		height: 1rpx;
		background: #eef2ef;
	}

	.sheet-list {
		max-height: 420rpx;
	}

	.sheet-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 16rpx;
		border-bottom: 1rpx solid #f2f5f3;
	}

	.sheet-item-name {
		font-size: 30rpx;
		color: #1a535c;
	}

	.sheet-item.active .sheet-item-name {
		color: #16a69a;
		font-weight: 700;
	}

	.sheet-item-check {
		color: #16a69a;
		font-size: 32rpx;
		font-weight: 700;
	}

	.sheet-empty {
		text-align: center;
		padding: 48rpx 0;
		color: rgba(26, 83, 92, 0.4);
		font-size: 26rpx;
	}
</style>
