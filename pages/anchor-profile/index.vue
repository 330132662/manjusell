<template>
	<view class="page gf-page">
		<!-- ===== 顶栏 ===== -->
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">我的档案</text>
				<text class="gf-subtitle">主播资料 · 由运营维护基础信息</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="body">
			<!-- ===== 主播名片 ===== -->
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
				<view class="hero-seal">
					<text>主播</text>
				</view>
			</view>

			<!-- ===== 今日数据 ===== -->
			<view class="datacard">
				<view class="data-item">
					<text class="data-value">{{ form.platform_accounts.length }}</text>
					<text class="data-label">已绑账号</text>
				</view>
				<view class="data-divider"></view>
				<view class="data-item">
					<text class="data-value">{{ form.available_time ? '已填' : '待填' }}</text>
					<text class="data-label">可用时段</text>
				</view>
				<view class="data-divider"></view>
				<view class="data-item">
					<text class="data-value">{{ profile.status === 1 ? '在职' : '停用' }}</text>
					<text class="data-label">当前状态</text>
				</view>
			</view>

			<!-- ===== 基本信息 ===== -->
			<view class="gf-card">
				<view class="gf-card-title">
					<text>基本信息</text>
					<text class="gf-card-title-sub">运营维护</text>
				</view>
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

			<!-- ===== 头像 ===== -->
			<view class="gf-card">
				<view class="gf-card-title">
					<text>头像</text>
					<text class="gf-card-title-sub">用于工作台展示</text>
				</view>
				<view class="avatar-row">
					<image v-if="form.avatar" class="avatar-preview" :src="form.avatar" mode="aspectFill" />
					<view v-else class="avatar-preview avatar-empty">{{ avatarText }}</view>
					<button class="btn-ghost" :loading="uploading" @click="chooseAvatar">
						{{ uploading ? '上传中…' : '更换头像' }}
					</button>
				</view>
			</view>

			<!-- ===== 可用时段 ===== -->
			<view class="gf-card">
				<view class="gf-card-title">
					<text>可用时段</text>
					<text class="gf-card-title-sub">早场 / 午场 / 晚场</text>
				</view>
				<view class="period-row">
					<text class="period-tag">早场</text>
					<text class="period-tag">午场</text>
					<text class="period-tag">晚场</text>
					<text class="period-hint">在下方写明具体时段</text>
				</view>
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

			<!-- ===== 平台账号 ===== -->
			<view class="gf-card">
				<view class="gf-card-title">
					<text>平台账号</text>
					<text class="add-link" @click="addAccount">＋ 添加</text>
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
					<text class="gf-state-ico">空</text>
					<text class="empty-text">还没有平台账号，点击右上角「＋ 添加」</text>
				</view>
			</view>

			<!-- ===== 排班与协作 ===== -->
			<view class="gf-card">
				<view class="gf-card-title">
					<text>排班与协作</text>
					<text class="gf-card-title-sub">常用入口</text>
				</view>
				<view class="nav-row" @click="go('/pages/my-schedule/index')">
					<text class="nav-seal">排</text>
					<view class="nav-main">
						<text class="nav-label">我的排班</text>
						<text class="nav-desc">查看排班 / 确认 / 换班请假</text>
					</view>
					<text class="nav-arrow">›</text>
				</view>
				<view class="nav-row" @click="go('/pages/grab-list/index')">
					<text class="nav-seal">抢</text>
					<view class="nav-main">
						<text class="nav-label">紧急顶班</text>
						<text class="nav-desc">抢下开放顶班的场次</text>
					</view>
					<text class="nav-arrow">›</text>
				</view>
				<view class="nav-row" @click="go('/pages/my-requests/index')">
					<text class="nav-seal">申</text>
					<view class="nav-main">
						<text class="nav-label">我的申请</text>
						<text class="nav-desc">换班 / 请假记录与进度</text>
					</view>
					<text class="nav-arrow">›</text>
				</view>
				<view class="nav-row" @click="go('/pages/my-notifications/index')">
					<text class="nav-seal">信</text>
					<view class="nav-main">
						<text class="nav-label">站内提醒</text>
						<text class="nav-desc">审核结果 / 替班通知 / 确认提醒</text>
					</view>
					<text class="nav-arrow">›</text>
				</view>
			</view>

			<view class="bottom-space"></view>
		</scroll-view>

		<!-- ===== 底部保存 + Tab ===== -->
		<view class="footer">
			<button class="btn-save" :class="{ disabled: saving }" :disabled="saving" @click="handleSave">
				{{ saving ? '保存中…' : '保 存' }}
			</button>
		</view>

		<view class="gf-tabbar">
			<navigator class="gf-tab" url="/pages/my-schedule/index" open-type="reLaunch">
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
			<navigator class="gf-tab on" url="/pages/anchor-profile/index" open-type="reLaunch">
				<text class="gf-tab-seal">我</text>
				<text class="gf-tab-txt">我的</text>
			</navigator>
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

	// 排班与协作入口
	function go(url) {
		uni.navigateTo({ url })
	}

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
@import '../../styles/guofeng.scss';

.page {
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.body {
	flex: 1;
	overflow: hidden;
	padding: 22rpx 28rpx 0;
}

/* ===== 名片 ===== */
.hero {
	position: relative;
	display: flex;
	align-items: center;
	gap: 22rpx;
	padding: 26rpx 24rpx;
	margin-bottom: 20rpx;
	border-radius: 20rpx;
	border: 1rpx solid $gf-line;
	background: linear-gradient(150deg, #fffdf7 0%, #f7ecd7 100%);
	box-shadow: 0 8rpx 22rpx rgba(26, 24, 21, 0.06);
	overflow: hidden;
}

.hero::after {
	content: '';
	position: absolute;
	right: -40rpx;
	bottom: -60rpx;
	width: 240rpx;
	height: 240rpx;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(201, 162, 75, 0.16) 0%, rgba(201, 162, 75, 0) 70%);
}

.hero-avatar {
	position: relative;
	width: 128rpx;
	height: 128rpx;
	border-radius: 50%;
	border: 2rpx solid $gf-gold;
	background: #fffdf7;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: visible;
	flex-shrink: 0;
	box-shadow: 0 0 0 6rpx rgba(201, 162, 75, 0.12);
}

.hero-avatar-img {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.hero-avatar-text {
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 54rpx;
	font-weight: 700;
	color: $gf-cinnabar;
}

.hero-avatar-edit {
	position: absolute;
	right: -6rpx;
	bottom: -6rpx;
	width: 44rpx;
	height: 44rpx;
	line-height: 40rpx;
	text-align: center;
	border-radius: 50%;
	border: 1rpx solid $gf-gold;
	background: $gf-cinnabar;
	color: #fdf6e6;
	font-size: 19rpx;
}

.hero-info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
	z-index: 1;
}

.hero-name {
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 40rpx;
	font-weight: 700;
	color: $gf-ink;
	letter-spacing: 2rpx;
}

.hero-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
}

.tag {
	height: 38rpx;
	line-height: 36rpx;
	padding: 0 14rpx;
	border-radius: 4rpx;
	font-size: 19rpx;
	border: 1rpx solid transparent;
}

.tag-on {
	color: #2f6a52;
	background: rgba(58, 106, 82, 0.08);
	border-color: rgba(58, 106, 82, 0.32);
}

.tag-off {
	color: $gf-ink-3;
	background: rgba(140, 130, 116, 0.09);
	border-color: rgba(140, 130, 116, 0.3);
}

.tag-skill {
	color: #8a6a1f;
	background: rgba(201, 162, 75, 0.14);
	border-color: rgba(201, 162, 75, 0.45);
}

.hero-seal {
	position: absolute;
	right: 20rpx;
	top: 18rpx;
	width: 62rpx;
	height: 62rpx;
	border: 2rpx solid rgba(178, 58, 46, 0.75);
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: rgba(178, 58, 46, 0.85);
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 20rpx;
	font-weight: 700;
	line-height: 1.1;
	text-align: center;
	transform: rotate(-8deg);
	opacity: 0.85;
}

/* ===== 数据卡 ===== */
.datacard {
	display: flex;
	align-items: center;
	justify-content: space-around;
	padding: 22rpx 10rpx;
	margin-bottom: 20rpx;
	border-radius: 16rpx;
	border: 1rpx solid $gf-line-soft;
	background: rgba(255, 253, 247, 0.82);
}

.data-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6rpx;
}

.data-value {
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 36rpx;
	font-weight: 700;
	color: $gf-ink;
	line-height: 1;
}

.data-label {
	font-size: 19rpx;
	color: $gf-ink-3;
	letter-spacing: 1rpx;
}

.data-divider {
	width: 1rpx;
	height: 44rpx;
	background: $gf-line-soft;
}

/* ===== 信息行 ===== */
.row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 18rpx 0;
	border-bottom: 1rpx dashed $gf-line-soft;
}

.row:last-of-type {
	border-bottom: none;
}

.row-label {
	font-size: 23rpx;
	color: $gf-ink-3;
	letter-spacing: 1rpx;
}

.row-value {
	font-size: 25rpx;
	color: $gf-ink;
	font-weight: 700;
}

.card-tip {
	margin-top: 14rpx;
	padding: 12rpx 14rpx;
	border-radius: 8rpx;
	background: rgba(201, 162, 75, 0.08);
	font-size: 19rpx;
	color: $gf-ink-2;
	line-height: 1.6;
}

/* ===== 头像 ===== */
.avatar-row {
	display: flex;
	align-items: center;
	gap: 22rpx;
}

.avatar-preview {
	width: 112rpx;
	height: 112rpx;
	border-radius: 50%;
	border: 2rpx solid $gf-gold;
	box-shadow: 0 0 0 5rpx rgba(201, 162, 75, 0.12);
}

.avatar-empty {
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fffdf7;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 44rpx;
	color: $gf-cinnabar;
}

.btn-ghost {
	height: 66rpx;
	line-height: 64rpx;
	padding: 0 26rpx;
	border-radius: 8rpx;
	border: 1rpx solid $gf-line;
	background: rgba(255, 253, 247, 0.92);
	color: $gf-ink-2;
	font-size: 23rpx;
	letter-spacing: 1rpx;
}

.btn-ghost::after {
	border: none;
}

/* ===== 可用时段 ===== */
.period-row {
	display: flex;
	align-items: center;
	gap: 10rpx;
	margin-bottom: 14rpx;
	flex-wrap: wrap;
}

.period-tag {
	height: 40rpx;
	line-height: 38rpx;
	padding: 0 16rpx;
	border: 1rpx solid rgba(201, 162, 75, 0.5);
	border-radius: 4rpx;
	font-size: 20rpx;
	color: #8a6a1f;
	background: rgba(201, 162, 75, 0.1);
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
}

.period-hint {
	font-size: 19rpx;
	color: $gf-ink-3;
}

.textarea {
	width: 100%;
	min-height: 140rpx;
	padding: 18rpx;
	box-sizing: border-box;
	border: 1rpx solid $gf-line-soft;
	border-radius: 10rpx;
	background: rgba(255, 253, 247, 0.9);
	font-size: 24rpx;
	color: $gf-ink;
	line-height: 1.6;
}

.ph {
	color: $gf-ink-3;
	font-size: 23rpx;
}

/* ===== 平台账号 ===== */
.add-link {
	font-size: 21rpx;
	color: $gf-cinnabar;
	border: 1rpx solid rgba(178, 58, 46, 0.4);
	border-radius: 6rpx;
	padding: 4rpx 14rpx;
	background: rgba(178, 58, 46, 0.05);
}

.acct {
	padding: 16rpx;
	margin-bottom: 14rpx;
	border: 1rpx solid $gf-line-soft;
	border-radius: 12rpx;
	background: rgba(255, 253, 247, 0.9);
}

.acct-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10rpx;
}

.acct-platform {
	display: inline-block;
	height: 44rpx;
	line-height: 42rpx;
	padding: 0 16rpx;
	border: 1rpx solid rgba(58, 74, 82, 0.3);
	border-radius: 4rpx;
	color: $gf-indigo;
	background: rgba(58, 74, 82, 0.06);
	font-size: 21rpx;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
}

.acct-del {
	font-size: 20rpx;
	color: $gf-ink-3;
	padding: 4rpx 10rpx;
	border-bottom: 1rpx solid rgba(140, 130, 116, 0.4);
}

.acct-input {
	height: 70rpx;
	padding: 0 16rpx;
	margin-top: 10rpx;
	border: 1rpx solid $gf-line-soft;
	border-radius: 8rpx;
	background: #fffdf7;
	font-size: 23rpx;
	color: $gf-ink;
}

.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	padding: 30rpx 10rpx;
}

.empty-text {
	font-size: 22rpx;
	color: $gf-ink-3;
	letter-spacing: 1rpx;
}

/* ===== 常用入口 ===== */
.nav-row {
	display: flex;
	align-items: center;
	gap: 18rpx;
	padding: 20rpx 4rpx;
	border-bottom: 1rpx dashed $gf-line-soft;
}

.nav-row:last-of-type {
	border-bottom: none;
}

.nav-seal {
	width: 58rpx;
	height: 58rpx;
	line-height: 54rpx;
	text-align: center;
	border: 1rpx solid $gf-line;
	border-radius: 6rpx;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 24rpx;
	font-weight: 700;
	color: $gf-ink-2;
	background: rgba(201, 162, 75, 0.08);
	flex-shrink: 0;
}

.nav-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.nav-label {
	font-size: 26rpx;
	color: $gf-ink;
	font-weight: 700;
	letter-spacing: 1rpx;
}

.nav-desc {
	font-size: 20rpx;
	color: $gf-ink-3;
}

.nav-arrow {
	font-size: 30rpx;
	color: rgba(201, 162, 75, 0.8);
}

.bottom-space {
	height: 24rpx;
}

/* ===== 底部 ===== */
.footer {
	flex-shrink: 0;
	padding: 12rpx 28rpx 8rpx;
	background: rgba(255, 253, 247, 0.96);
	border-top: 1rpx solid $gf-line-soft;
}

.btn-save {
	height: 84rpx;
	line-height: 82rpx;
	border-radius: 12rpx;
	background: linear-gradient(180deg, #c0463a 0%, $gf-cinnabar 100%);
	color: #fdf6e6;
	font-size: 30rpx;
	font-weight: 700;
	letter-spacing: 8rpx;
	border: 1rpx solid $gf-gold;
	box-shadow: 0 8rpx 20rpx rgba(178, 58, 46, 0.22);
}

.btn-save.disabled {
	background: linear-gradient(180deg, #cfc4b1 0%, #bdb2a0 100%);
	border-color: rgba(201, 162, 75, 0.4);
	box-shadow: none;
	color: #fffdf7;
}

.btn-save::after {
	border: none;
}
</style>
