<template>
  <view class="user-page">
    <!-- 未登录：微信授权登录 -->
    <view v-if="!userInfo" class="login-wrap">
      <view class="login-card">
        <view class="login-logo">
          <uni-icons type="weixin" size="44" color="#FFFFFF"></uni-icons>
        </view>
        <text class="login-title">AI短剧影院</text>
        <text class="login-sub">授权登录后查看你的订单</text>

        <button class="wechat-btn" :disabled="logging" @click="handleLogin">
          <uni-icons type="weixin" size="20" color="#FFFFFF"></uni-icons>
          <text class="wechat-btn-text">{{ logging ? '登录中…' : '微信授权登录' }}</text>
        </button>

        <text v-if="error" class="login-error">{{ error }}</text>
        <text class="login-tip">登录即表示同意《用户协议》与《隐私政策》</text>
      </view>
    </view>

    <!-- 已登录：用户信息 + 订单列表 -->
    <view v-else class="profile-wrap">
      <view class="profile-header">
        <image
          v-if="userInfo.avatar"
          class="avatar"
          :src="userInfo.avatar"
          mode="aspectFill"
        ></image>
        <view v-else class="avatar avatar-default">
          <text class="avatar-char">{{ avatarChar }}</text>
        </view>
        <view class="profile-meta">
          <text class="profile-name">{{ userInfo.nickname || '微信用户' }}</text>
          <text class="profile-openid">uid: {{ userInfo.uid }} · {{ userInfo.order_match ? '订单已匹配' : '未匹配订单' }}</text>
        </view>
        <view class="logout-btn" @click="handleLogout">退出</view>
      </view>

      <view class="order-section">
        <view class="section-bar">
          <text class="section-title">我的订单</text>
          <text class="section-count">共 {{ orders.length }} 笔</text>
        </view>

        <view v-if="loadingOrders" class="state-box">
          <uni-icons type="refresh" size="22" color="#4ECDC4"></uni-icons>
          <text class="state-text">订单加载中…</text>
        </view>

        <view v-else-if="orders.length === 0" class="state-box">
          <uni-icons type="cart" size="28" color="rgba(26,83,92,0.35)"></uni-icons>
          <text class="state-text">暂无订单</text>
        </view>

        <view v-else class="order-list">
          <view
            v-for="order in orders"
            :key="order.order_no"
            class="order-item"
            @click="onOrderClick(order)"
          >
            <view class="order-top">
              <text class="order-no">订单号 {{ order.order_no }}</text>
              <text class="order-status" :class="'st-' + order.status">
                {{ statusText(order.status) }}
              </text>
            </view>
            <text class="order-title text-clamp-2">{{ order.title }}</text>
            <view class="order-bottom">
              <text class="order-time">{{ order.create_time }}</text>
              <text class="order-amount">¥{{ formatAmount(order.amount) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getWxLoginUrl, miniappLogin, getMyProfile, getOrderList } from '@/api'

const logging = ref(false)
const loadingOrders = ref(false)
const userInfo = ref(null)
const orders = ref([])
const error = ref('')

const avatarChar = computed(() => {
  const name = userInfo.value && userInfo.value.nickname
  return name ? name.charAt(0) : '微'
})

onLoad((options) => {
  // H5 OAuth 回调: 后端 302 回来时把 token/uid 放在 URL 参数里
  // #ifdef H5
  if (options && options.token) {
    uni.setStorageSync('token', decodeURIComponent(options.token))
    if (options.uid) uni.setStorageSync('uid', options.uid)
    cleanUrlParams()
    loadProfile()
    return
  }
  // #endif

  // 已登录过则直接复用本地凭证并拉订单
  const cached = uni.getStorageSync('userInfo')
  if (cached && cached.uid) {
    userInfo.value = cached
    fetchOrders()
  }
})

// H5: 清理 URL 上的 token/uid 参数, 避免刷新重复登录
function cleanUrlParams() {
  // #ifdef H5
  try {
    const url = new URL(window.location.href)
    // hash 路由模式下, 查询参数在 # 后面
    const hash = url.hash
    if (hash.indexOf('?') !== -1) {
      const [path, query] = hash.split('?')
      const params = new URLSearchParams(query)
      params.delete('token')
      params.delete('uid')
      url.hash = path + (params.toString() ? '?' + params.toString() : '')
      window.history.replaceState({}, '', url.toString())
    }
  } catch (e) {
    // ignore
  }
  // #endif
}

// 拉取当前登录用户信息(小程序登录后/H5回调后调用)
async function loadProfile() {
  try {
    const res = await getMyProfile()
    userInfo.value = res
    uni.setStorageSync('userInfo', res)
    fetchOrders()
  } catch (e) {
    error.value = '获取用户信息失败，请重新登录'
  }
}

// 微信授权登录主流程
async function handleLogin() {
  if (logging.value) return
  logging.value = true
  error.value = ''
  try {
    // #ifdef MP-WEIXIN
    // 微信小程序: uni.login 静默拿 code, 再调后端 code2session 换 token
    const loginRes = await uni.login({ provider: 'weixin' })
    const code = loginRes && loginRes.code
    if (!code) throw new Error('获取微信凭证失败，请重试')
    const res = await miniappLogin(code)
    if (res && res.token) uni.setStorageSync('token', res.token)
    if (res && res.uid) uni.setStorageSync('uid', res.uid)
    // 小程序登录只返回 openid/unionid, 昵称头像通过 myProfile 取
    await loadProfile()
    uni.showToast({ title: '登录成功', icon: 'success' })
    // #endif

    // #ifdef H5
    // 服务号网页授权必须在微信内置浏览器中完成
    if (!isWechatBrowser()) {
      error.value = '请在微信中打开此页面进行授权登录'
      return
    }
    // 跳后端 /wxapp/wxlogin, 后端再跳微信授权页, 授权完跳回本页带 token
    window.location.href = getWxLoginUrl()
    // #endif
  } catch (e) {
    error.value = (e && e.message) || '登录失败，请重试'
  } finally {
    logging.value = false
  }
}

// 拉取订单列表
async function fetchOrders() {
  loadingOrders.value = true
  try {
    const res = await getOrderList()
    const list = (res && res.list) || []
    orders.value = list.map(normalizeOrder)
  } catch (e) {
    orders.value = []
  } finally {
    loadingOrders.value = false
  }
}

// 后端字段映射成页面展示字段
function normalizeOrder(o) {
  return {
    order_no: o.order_id || o.out_order_no || '',
    title: o.product_info || '',
    amount: Number(o.real_fee || 0) / 100,
    status: o.status || '',
    status_desc: o.status_desc || '',
    create_time: o.created_at || o.create_time || ''
  }
}

function handleLogout() {
  uni.removeStorageSync('userInfo')
  uni.removeStorageSync('token')
  uni.removeStorageSync('uid')
  userInfo.value = null
  orders.value = []
}

function onOrderClick(order) {
  uni.showToast({ title: '订单 ' + order.order_no, icon: 'none' })
}

// 判断是否在微信内置浏览器中(H5)
function isWechatBrowser() {
  // #ifdef H5
  const ua = (navigator && navigator.userAgent) || ''
  return /MicroMessenger/i.test(ua)
  // #endif
  // #ifndef H5
  return false
  // #endif
}

// 后端订单状态码 -> 文案
function statusText(status) {
  const map = {
    '10': '待付款',
    '20': '待发货',
    '21': '部分发货',
    '30': '待收货',
    '100': '已完成',
    '250': '已取消'
  }
  return map[status] || '未知'
}

function formatAmount(n) {
  return Number(n || 0).toFixed(2)
}
</script>

<style lang="scss" scoped>
.user-page {
  min-height: 100vh;
  background: #F7FFF7;
  padding: 32rpx;
  box-sizing: border-box;
}

/* ===== 登录卡片 ===== */
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  box-sizing: border-box;
}

.login-card {
  width: 100%;
  max-width: 560rpx;
  background: #FFFFFF;
  border: 1px solid rgba(26, 83, 92, 0.12);
  border-radius: 24rpx;
  padding: 64rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 12rpx 40rpx rgba(26, 83, 92, 0.08);
}

.login-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28rpx;
}

.login-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1A535C;
}

.login-sub {
  font-size: 26rpx;
  color: rgba(26, 83, 92, 0.65);
  margin-top: 12rpx;
  margin-bottom: 56rpx;
}

.wechat-btn {
  width: 100%;
  height: 92rpx;
  background: #07C160;
  color: #FFFFFF;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
  line-height: 92rpx;

  &[disabled] {
    opacity: 0.6;
  }

  &::after {
    border: none;
  }
}

.wechat-btn-text {
  color: #FFFFFF;
}

.login-error {
  margin-top: 24rpx;
  font-size: 24rpx;
  color: #FF6B6B;
}

.login-tip {
  margin-top: 32rpx;
  font-size: 22rpx;
  color: rgba(26, 83, 92, 0.4);
  text-align: center;
}

/* ===== 已登录：用户信息 ===== */
.profile-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: linear-gradient(135deg, #1A535C 0%, #4ECDC4 100%);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  color: #FFFFFF;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(255, 255, 255, 0.6);
}

.avatar-default {
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-char {
  font-size: 40rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.profile-meta {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 34rpx;
  font-weight: 700;
  display: block;
}

.profile-openid {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-top: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  padding: 10rpx 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #FFFFFF;
}

/* ===== 订单区 ===== */
.order-section {
  margin-top: 32rpx;
}

.section-bar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A535C;
}

.section-count {
  font-size: 24rpx;
  color: rgba(26, 83, 92, 0.5);
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 96rpx 0;
}

.state-text {
  font-size: 26rpx;
  color: rgba(26, 83, 92, 0.5);
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-item {
  background: #FFFFFF;
  border: 1px solid rgba(26, 83, 92, 0.12);
  border-radius: 16rpx;
  padding: 28rpx;
  transition: transform 0.15s;

  &:active {
    transform: translateY(-2rpx);
  }
}

.order-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.order-no {
  font-size: 24rpx;
  color: rgba(26, 83, 92, 0.55);
}

.order-status {
  font-size: 22rpx;
  font-weight: 600;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;

  &.st-10 { background: rgba(255, 230, 109, 0.18); color: #B58900; }
  &.st-20, &.st-21 { background: rgba(78, 205, 196, 0.15); color: #1A9C8C; }
  &.st-30 { background: rgba(78, 205, 196, 0.15); color: #1A9C8C; }
  &.st-100 { background: rgba(26, 83, 92, 0.1); color: #1A535C; }
  &.st-250 { background: rgba(26, 83, 92, 0.06); color: rgba(26, 83, 92, 0.45); }
}

.order-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A535C;
  line-height: 1.5;
}

.order-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18rpx;
}

.order-time {
  font-size: 22rpx;
  color: rgba(26, 83, 92, 0.45);
}

.order-amount {
  font-size: 32rpx;
  font-weight: 700;
  color: #FF6B6B;
}
</style>
