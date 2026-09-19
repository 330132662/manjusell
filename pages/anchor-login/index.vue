<template>
  <view class="page">
    <view class="hero">
      <view class="hero-badge">
        <text class="hero-badge-dot"></text>
        <text class="hero-badge-text">主播工作台</text>
      </view>
      <text class="hero-title">账号登录</text>
      <text class="hero-sub">使用账号密码登录后进行签到开播</text>
    </view>

    <view class="form">
      <view class="input-row">
        <text class="input-label">用户名</text>
        <input
          class="input"
          v-model="username"
          placeholder="请输入用户名"
          placeholder-class="ph"
          :maxlength="32"
        />
      </view>

      <view class="input-row">
        <text class="input-label">密码</text>
        <view class="pwd-wrap">
          <input
            class="input"
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
      <view class="input-row" v-if="captchaShow">
        <text class="input-label">验证码</text>
        <view class="captcha-row">
          <input
            class="input captcha-input"
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

      <button class="btn-login" :class="{ disabled: submitting }" :disabled="submitting" @click="handleLogin">
        {{ submitting ? '登录中…' : '登　录' }}
      </button>

      <text v-if="error" class="error">{{ error }}</text>
      <text class="tip">登录即代表同意主播工作台相关约定</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { anchorLogin, getCaptcha } from '@/api'

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
  // 已登录(token 有效状态)直接进签到页
  // if (uni.getStorageSync('token')) {
  //   goCheckin()
  //   return
  // }
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
    goCheckin()
  } catch (e) {
    error.value = (e && e.message) || '登录失败，请检查账号密码'
    // 失败后刷新验证码并清空输入
    fetchCaptcha()
  } finally {
    submitting.value = false
  }
}

function goCheckin() {
  uni.reLaunch({ url: '/pages/anchor-checkin/index' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f4f7f5;
  box-sizing: border-box;
  padding: 0 48rpx;
}

/* ===== 顶部区 ===== */
.hero {
  padding: 120rpx 8rpx 64rpx;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  background: rgba(78, 205, 196, 0.14);
  border: 1rpx solid rgba(78, 205, 196, 0.4);
  border-radius: 999rpx;
  padding: 8rpx 22rpx;
}
.hero-badge-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #16a69a;
}
.hero-badge-text {
  font-size: 24rpx;
  color: #16a69a;
  font-weight: 600;
}
.hero-title {
  display: block;
  margin-top: 28rpx;
  font-size: 52rpx;
  font-weight: 800;
  color: #1a535c;
}
.hero-sub {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  color: rgba(26, 83, 92, 0.55);
}

/* ===== 表单 ===== */
.form {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx 36rpx 48rpx;
  box-shadow: 0 12rpx 40rpx rgba(26, 83, 92, 0.06);
}
.input-row {
  margin-bottom: 32rpx;
}
.input-label {
  display: block;
  font-size: 26rpx;
  color: rgba(26, 83, 92, 0.6);
  margin-bottom: 12rpx;
}
.input {
  width: 100%;
  height: 92rpx;
  background: #f4f7f5;
  border: 1rpx solid #e6ece9;
  border-radius: 16rpx;
  padding: 0 28rpx;
  font-size: 30rpx;
  color: #1a535c;
  box-sizing: border-box;
}
.ph {
  color: rgba(26, 83, 92, 0.35);
}
.pwd-wrap {
  position: relative;
}
.pwd-eye {
  position: absolute;
  right: 24rpx;
  top: 0;
  height: 92rpx;
  line-height: 92rpx;
  font-size: 32rpx;
}

/* ===== 验证码 ===== */
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
  height: 92rpx;
  border-radius: 16rpx;
  overflow: hidden;
  border: 1rpx solid #e6ece9;
  background: #eef3f0;
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
  font-size: 22rpx;
  color: #ffffff;
  background: rgba(10, 20, 18, 0.55);
}

.remember-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: 8rpx 0 40rpx;
}
.check {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  border: 2rpx solid #c4cfca;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s;
}
.check.on {
  background: #16a69a;
  border-color: #16a69a;
}
.check-mark {
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 700;
}
.remember-text {
  font-size: 26rpx;
  color: rgba(26, 83, 92, 0.7);
}

.btn-login {
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
.btn-login.disabled {
  opacity: 0.55;
}

.error {
  display: block;
  margin-top: 24rpx;
  text-align: center;
  font-size: 26rpx;
  color: #ff6b6b;
}
.tip {
  display: block;
  margin-top: 32rpx;
  text-align: center;
  font-size: 22rpx;
  color: rgba(26, 83, 92, 0.4);
}
</style>
