<template>
	<view class="page">
		<!-- 顶栏 -->
		<view class="topbar">
			<view class="topbar-back" @click="goBack">‹</view>
			<text class="topbar-title">我的资料</text>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="body">
			<!-- 主播卡片 -->
			<view class="hero">
				<view class="hero-avatar" @click="chooseAvatar">
					<image v-if="form.avatar" class="hero-avatar-img" :src="form.avatar" mode="aspectFill" />
					<text v-else class="hero-avatar-text">{{ avatarText }}</text>
					<view class="hero-avatar-edit">换</view>
				</view>
				<view class="hero-info">
					<text class="hero-name">{{ profile.name || '未命名主播' }}</text>
					<view class="hero-tags">
						<text class="tag" :class="profile.status === 1 ? 'tag-on' : 'tag-off'">
							{{ profile.status === 1 ? '在职' : '停用' }}
						</text>
						<text v-if="profile.skills" class="tag tag-skill">{{ profile.skills }}</text>
					</view>
				</view>
			</view>

			<!-- 基本信息 -->
			<view class="card">
				<view class="card-title">基本信息</view>
				<view class="row">
					<text class="row-label">姓名</text>
					<text class="row-value">{{ profile.name || '—' }}</text>
				</view>
				<view class="row">
					<text class="row-label">手机号</text>
					<text class="row-value">{{ profile.phone || '—' }}</text>
				</view>
				<view class="row">
					<text class="row-label">性别</text>
					<text class="row-value">{{ genderText }}</text>
				</view>
				<view class="card-tip">姓名 / 手机号 / 技能标签由管理员维护，如需修改请联系运营</view>
			</view>

			<!-- 头像 -->
			<view class="card">
				<view class="card-title">头像</view>
				<view class="avatar-row">
					<image v-if="form.avatar" class="avatar-preview" :src="form.avatar" mode="aspectFill" />
					<view v-else class="avatar-preview avatar-empty">{{ avatarText }}</view>
					<button class="btn-ghost" :loading="uploading" @click="chooseAvatar">
						{{ uploading ? '上传中…' : '更换头像' }}
					</button>
				</view>
			</view>

			<!-- 可用时段 -->
			<view class="card">
				<view class="card-title">可用时段</view>
				<textarea
					v-model="form.available_time"
					class="textarea"
					placeholder="例如：周一至周五 9:00-18:00，周末可协商"
					placeholder-class="ph"
					:maxlength="255"
					auto-height
				/>
				<view class="card-tip">写清楚可上播的时间段，方便运营排班</view>
			</view>

			<!-- 平台账号 -->
			<view class="card">
				<view class="card-title">
					<text>平台账号</text>
					<text class="add-link" @click="addAccount">+ 添加</text>
				</view>

				<view v-for="(item, index) in form.platform_accounts" :key="index" class="acct">
					<view class="acct-head">
						<picker
							mode="selector"
							:range="platformOptions"
							:value="platformIndex(item.platform)"
							@change="(e) => onPlatformChange(item, e)"
						>
							<view class="acct-platform">{{ item.platform || '选择平台' }} ⌄</view>
						</picker>
						<text class="acct-del" @click="removeAccount(index)">删除</text>
					</view>
					<input v-model="item.account" class="acct-input" placeholder="账号 / 昵称" placeholder-class="ph" :maxlength="64" />
					<input v-model="item.url" class="acct-input" placeholder="主页链接（选填）" placeholder-class="ph" :maxlength="255" />
				</view>

				<view v-if="!form.platform_accounts.length" class="empty">
					还没有平台账号，点击右上角「+ 添加」
				</view>
			</view>

			<view class="bottom-space"></view>
		</scroll-view>

		<!-- 底部保存 -->
		<view class="footer">
			<button class="btn-save" :class="{ disabled: saving }" :disabled="saving" @click="handleSave">
				{{ saving ? '保存中…' : '保 存' }}
			</button>
		</view>
	</view>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue'
	import { getMyAnchorProfile, saveMyAnchorProfile, uploadAnchorAvatar } from '@/api'

	const platformOptions = ['抖音', '快手', '视频号', '小红书', '其他']

	const profile = ref({})
	const form = ref({
		avatar: '',
		available_time: '',
		platform_accounts: []
	})
	const loading = ref(false)
	const saving = ref(false)
	const uploading = ref(false)

	const avatarText = computed(() => {
		const name = String(profile.value.name || '主')
		return name.slice(0, 1)
	})

	const genderText = computed(() => {
		const g = Number(profile.value.gender || 0)
		return g === 1 ? '男' : g === 2 ? '女' : '未知'
	})

	onMounted(() => {
		const token = uni.getStorageSync('token')
		if (!token) {
			uni.reLaunch({
				url: '/pages/anchor-login/index'
			})
			return
		}
		loadProfile()
	})

	async function loadProfile() {
		loading.value = true
		try {
			const data = await getMyAnchorProfile()
			profile.value = data || {}
			form.value = {
				avatar: (data && data.avatar) || '',
				available_time: (data && data.available_time) || '',
				platform_accounts: ((data && data.platform_accounts) || []).map((it) => ({
					platform: it.platform || '',
					account: it.account || '',
					url: it.url || ''
				}))
			}
		} catch (e) {
			// 拦截器已提示
		} finally {
			loading.value = false
		}
	}

	function goBack() {
		uni.navigateBack({
			fail: () => uni.reLaunch({ url: '/pages/anchor-checkin/index' })
		})
	}

	function platformIndex(platform) {
		const i = platformOptions.indexOf(platform)
		return i < 0 ? 0 : i
	}

	function onPlatformChange(item, e) {
		item.platform = platformOptions[Number(e.detail.value)] || ''
	}

	function addAccount() {
		form.value.platform_accounts.push({ platform: '抖音', account: '', url: '' })
	}

	function removeAccount(index) {
		form.value.platform_accounts.splice(index, 1)
	}

	function chooseAvatar() {
		if (uploading.value) return
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: async (res) => {
				const filePath = ((res.tempFilePaths || [])[0]) || ((res.tempFiles || [])[0] || {}).path
				if (!filePath) return
				uploading.value = true
				try {
					const data = await uploadAnchorAvatar(filePath)
					if (data && data.url) {
						form.value.avatar = data.url
						uni.showToast({ title: '头像已上传', icon: 'success' })
					}
				} catch (e) {
					// 拦截器已提示
				} finally {
					uploading.value = false
				}
			}
		})
	}

	async function handleSave() {
		if (saving.value) return
		const accounts = (form.value.platform_accounts || []).filter(
			(it) => String(it.platform || '').trim() || String(it.account || '').trim() || String(it.url || '').trim()
		)
		for (let i = 0; i < accounts.length; i++) {
			if (!String(accounts[i].platform || '').trim() || !String(accounts[i].account || '').trim()) {
				uni.showToast({ title: `第 ${i + 1} 个平台账号请填写平台和账号`, icon: 'none' })
				return
			}
		}

		saving.value = true
		try {
			await saveMyAnchorProfile({
				avatar: form.value.avatar || '',
				available_time: String(form.value.available_time || '').trim(),
				platform_accounts: accounts.map((it) => ({
					platform: String(it.platform || '').trim(),
					account: String(it.account || '').trim(),
					url: String(it.url || '').trim()
				}))
			})
			uni.showToast({ title: '保存成功', icon: 'success' })
			setTimeout(() => {
				uni.navigateBack({
					fail: () => uni.reLaunch({ url: '/pages/anchor-checkin/index' })
				})
			}, 800)
		} catch (e) {
			// 拦截器已提示
		} finally {
			saving.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		background: #f5f6f8;
		display: flex;
		flex-direction: column;
	}

	.topbar {
		position: sticky;
		top: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 88rpx;
		padding: 0 24rpx;
		background: #ffffff;
		border-bottom: 1rpx solid #eef0f3;
	}

	.topbar-back {
		width: 64rpx;
		font-size: 48rpx;
		line-height: 1;
		color: #1f2329;
	}

	.topbar-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1f2329;
	}

	.topbar-holder {
		width: 64rpx;
	}

	.body {
		flex: 1;
		height: 0;
		padding: 24rpx;
		box-sizing: border-box;
	}

	.hero {
		display: flex;
		align-items: center;
		padding: 32rpx 28rpx;
		margin-bottom: 24rpx;
		background: linear-gradient(135deg, #2b5cff 0%, #5b8bff 100%);
		border-radius: 24rpx;
		box-shadow: 0 12rpx 30rpx rgba(43, 92, 255, 0.25);
	}

	.hero-avatar {
		position: relative;
		width: 120rpx;
		height: 120rpx;
		margin-right: 24rpx;
		border-radius: 50%;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.25);
		flex-shrink: 0;
	}

	.hero-avatar-img {
		width: 100%;
		height: 100%;
	}

	.hero-avatar-text {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		font-size: 48rpx;
		color: #ffffff;
		font-weight: 600;
	}

	.hero-avatar-edit {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		background: #ffffff;
		color: #2b5cff;
		font-size: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero-info {
		flex: 1;
		min-width: 0;
	}

	.hero-name {
		display: block;
		font-size: 36rpx;
		font-weight: 600;
		color: #ffffff;
	}

	.hero-tags {
		display: flex;
		flex-wrap: wrap;
		margin-top: 12rpx;
		gap: 12rpx;
	}

	.tag {
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
		background: rgba(255, 255, 255, 0.22);
		color: #ffffff;
	}

	.tag-off {
		background: rgba(0, 0, 0, 0.22);
	}

	.tag-skill {
		background: rgba(255, 255, 255, 0.14);
	}

	.card {
		padding: 28rpx;
		margin-bottom: 24rpx;
		background: #ffffff;
		border-radius: 24rpx;
	}

	.card-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
		font-size: 28rpx;
		font-weight: 600;
		color: #1f2329;
	}

	.add-link {
		font-size: 26rpx;
		font-weight: 500;
		color: #2b5cff;
	}

	.card-tip {
		margin-top: 16rpx;
		font-size: 22rpx;
		color: #9aa1ac;
		line-height: 1.6;
	}

	.row {
		display: flex;
		justify-content: space-between;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f2f3f5;
		font-size: 28rpx;
	}

	.row:last-of-type {
		border-bottom: none;
	}

	.row-label {
		color: #8a919c;
	}

	.row-value {
		color: #1f2329;
		max-width: 70%;
		text-align: right;
	}

	.avatar-row {
		display: flex;
		align-items: center;
	}

	.avatar-preview {
		width: 120rpx;
		height: 120rpx;
		margin-right: 28rpx;
		border-radius: 50%;
		background: #eef1f6;
	}

	.avatar-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #8a919c;
		font-size: 44rpx;
	}

	.btn-ghost {
		height: 64rpx;
		padding: 0 28rpx;
		margin: 0;
		line-height: 64rpx;
		font-size: 24rpx;
		color: #2b5cff;
		background: #eef3ff;
		border-radius: 32rpx;
		border: none;
	}

	.btn-ghost::after {
		border: none;
	}

	.textarea {
		width: 100%;
		min-height: 140rpx;
		padding: 20rpx;
		box-sizing: border-box;
		font-size: 28rpx;
		color: #1f2329;
		background: #f7f8fa;
		border-radius: 16rpx;
	}

	.acct {
		padding: 20rpx;
		margin-bottom: 16rpx;
		background: #f7f8fa;
		border-radius: 16rpx;
	}

	.acct-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12rpx;
	}

	.acct-platform {
		font-size: 26rpx;
		color: #2b5cff;
		font-weight: 500;
	}

	.acct-del {
		font-size: 24rpx;
		color: #e5484d;
	}

	.acct-input {
		height: 72rpx;
		padding: 0 20rpx;
		margin-bottom: 12rpx;
		font-size: 26rpx;
		color: #1f2329;
		background: #ffffff;
		border-radius: 12rpx;
	}

	.acct-input:last-child {
		margin-bottom: 0;
	}

	.empty {
		padding: 30rpx 0;
		text-align: center;
		font-size: 24rpx;
		color: #9aa1ac;
	}

	.bottom-space {
		height: 40rpx;
	}

	.footer {
		position: sticky;
		bottom: 0;
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
		background: #ffffff;
		border-top: 1rpx solid #eef0f3;
	}

	.btn-save {
		height: 88rpx;
		line-height: 88rpx;
		font-size: 30rpx;
		font-weight: 600;
		color: #ffffff;
		background: #2b5cff;
		border-radius: 44rpx;
		border: none;
	}

	.btn-save.disabled {
		opacity: 0.6;
	}

	.ph {
		color: #b6bcc6;
	}

	.btn-save::after,
	.btn-ghost::after {
		border: none;
	}
</style>
