<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<!-- ===== 顶栏 ===== -->
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">账号登录</text>
				<text class="gf-subtitle">工作台 · 账号密码登录</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<view class="gf-notice">
					<text class="gf-notice-main">请使用账号登录，登录后即可签到开播、查看排班与业绩工资。</text>
				</view>

				<view class="gf-card form-card">
					<view class="gf-card-title">
						<text>登录信息</text>
						<text class="gf-seal">登</text>
					</view>

					<view class="gf-field">
						<text class="gf-label"><text class="gf-req">*</text>用户名</text>
						<input
							class="gf-input"
							v-model="username"
							placeholder="请输入用户名"
							placeholder-class="ph"
							:maxlength="32"
						/>
					</view>

					<view class="gf-field">
						<text class="gf-label"><text class="gf-req">*</text>密码</text>
						<view class="pwd-wrap">
							<input
								class="gf-input"
								:password="!showPwd"
								v-model="password"
								placeholder="请输入密码"
								placeholder-class="ph"
								:maxlength="64"
							/>
							<text class="pwd-eye" @click="showPwd = !showPwd">{{ showPwd ? '🙈' : '👁' }}</text>
						</view>
					</view>

					<!-- 图形验证码 -->
					<view class="gf-field" v-if="captchaShow">
						<text class="gf-label"><text class="gf-req">*</text>验证码</text>
						<view class="captcha-row">
							<input
								class="gf-input captcha-input"
								v-model="captchaText"
								:maxlength="6"
								placeholder="请输入验证码"
								placeholder-class="ph"
							/>
							<view class="captcha-box" @click="fetchCaptcha">
								<image v-if="captchaImg" class="captcha-img" :src="captchaImg" mode="aspectFit" />
								<text v-if="captchaExpired" class="captcha-exp">已过期 · 点击刷新</text>
							</view>
						</view>
					</view>

					<view class="remember-row" @click="remember = !remember">
						<view class="check" :class="{ on: remember }">
							<text v-if="remember" class="check-mark">✓</text>
						</view>
						<text class="remember-text">记住用户名和密码</text>
					</view>

					<button
						class="gf-btn gf-btn-primary gf-btn-block btn-login"
						:class="{ disabled: submitting }"
						:disabled="submitting"
						@click="handleLogin"
					>
						{{ submitting ? '登录中…' : '登　录' }}
					</button>

					<text v-if="error" class="error">{{ error }}</text>
				</view>

				<!-- <text class="gf-hint gf-hint-c">登录即代表同意工作台相关约定</text> -->
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { anchorLogin, getCaptcha } from '@/api'
import { goBack as navBack } from '@/utils/nav'
import { HOME_PAGE } from '@/utils/auth'

const REMEMBER_KEY = 'anchor_remember'

const username = ref('')
const password = ref('')
const remember = ref(true)
const showPwd = ref(false)
const submitting = ref(false)
const error = ref('')

// 图形验证码
const captchaText = ref('')
const captchaCodeid = ref('')
const captchaImg = ref('')
const captchaShow = ref(false)
const captchaExpired = ref(false)
let captchaTimer = null

onMounted(() => {
  // 回填记住的用户名密码
  const saved = uni.getStorageSync(REMEMBER_KEY)
  if (saved) {
    username.value = saved.username || ''
    password.value = saved.password || ''
    remember.value = true
  }
  // 加载图形验证码
  fetchCaptcha()
})

onBeforeUnmount(() => {
  if (captchaTimer) {
    clearTimeout(captchaTimer)
    captchaTimer = null
  }
})

// 获取/刷新验证码；登录失败或点击图片时调用
async function fetchCaptcha() {
  captchaExpired.value = false
  captchaText.value = ''
  try {
    const data = await getCaptcha()
    captchaCodeid.value = data.id || ''
    captchaShow.value = !!data.show
    captchaImg.value = data.img || ''
    scheduleCaptchaExpiry(data.expireTime)
  } catch (e) {
    captchaShow.value = false
  }
}

// 按后端返回的过期时间戳做本地过期提醒
function scheduleCaptchaExpiry(expireTime) {
  if (captchaTimer) clearTimeout(captchaTimer)
  if (!expireTime) return
  const remain = Number(expireTime) - Date.now()
  if (remain <= 0) {
    captchaExpired.value = true
    return
  }
  captchaTimer = setTimeout(() => {
    captchaExpired.value = true
  }, remain)
}

async function handleLogin() {
  if (submitting.value) return
  error.value = ''
  const u = username.value.trim()
  const p = password.value

  if (!u) {
    error.value = '请输入用户名'
    return
  }
  if (!p) {
    error.value = '请输入密码'
    return
  }
  if (captchaShow.value && !captchaText.value.trim()) {
    error.value = '请输入验证码'
    return
  }

  submitting.value = true
  try {
    const token = await anchorLogin({
      username: u,
      password: p,
      captcha: captchaText.value.trim(),
      codeid: captchaCodeid.value
    })
    // 登录成功：保存 token，供签到页请求带 Bearer 头
    uni.setStorageSync('token', token)

    // 记住 / 清除 用户名密码
    if (remember.value) {
      uni.setStorageSync(REMEMBER_KEY, { username: u, password: p })
    } else {
      uni.removeStorageSync(REMEMBER_KEY)
    }

    uni.showToast({ title: '登录成功', icon: 'success' })
    goEntry()
  } catch (e) {
    error.value = (e && e.message) || '登录失败，请检查账号密码'
    // 失败后刷新验证码并清空输入
    fetchCaptcha()
  } finally {
    submitting.value = false
  }
}

function goEntry() {
  // 登录后先进入功能切换页，由用户选择主播 / 客服工作台
  uni.reLaunch({ url: HOME_PAGE })
}

function goBack() {
  // 能退栈则退回来源页，否则回未登录落地页
  navBack('/pages/not-logged/index')
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

	.form-card {
		padding-top: 28rpx;
	}

	/* 占位符颜色（国风墨色） */
	.ph {
		color: $gf-ink-3;
	}

	/* 密码显隐 */
	.pwd-wrap {
		position: relative;
	}
	.pwd-eye {
		position: absolute;
		right: 20rpx;
		top: 0;
		height: 84rpx;
		line-height: 84rpx;
		font-size: 32rpx;
	}

	/* 验证码 */
	.captcha-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}
	.captcha-input {
		flex: 1;
	}
	.captcha-box {
		position: relative;
		width: 210rpx;
		height: 84rpx;
		border-radius: 10rpx;
		overflow: hidden;
		border: 1rpx solid $gf-line-soft;
		background: #fffdf7;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		cursor: pointer;
	}
	.captcha-img {
		width: 100%;
		height: 100%;
	}
	.captcha-exp {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20rpx;
		color: #fdf6e6;
		background: rgba(26, 24, 21, 0.65);
	}

	/* 记住账号 */
	.remember-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin: 4rpx 0 36rpx;
	}
	.check {
		width: 36rpx;
		height: 36rpx;
		border-radius: 8rpx;
		border: 2rpx solid $gf-line;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s, border-color 0.15s;
	}
	.check.on {
		background: $gf-cinnabar;
		border-color: $gf-cinnabar;
	}
	.check-mark {
		color: #fdf6e6;
		font-size: 24rpx;
		font-weight: 700;
	}
	.remember-text {
		font-size: 24rpx;
		color: $gf-ink-2;
	}

	/* 登录按钮沿用 gf-btn-main，仅微调高度 */
	.btn-login {
		height: 96rpx;
	}

	.error {
		display: block;
		margin-top: 20rpx;
		text-align: center;
		font-size: 24rpx;
		color: $gf-cinnabar;
	}
</style>
