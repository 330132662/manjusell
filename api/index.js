// 业务接口层
import { post, get } from '@/utils/request'
import { USE_MOCK, USE_LIVE_API_MOCK } from '@/utils/config'
import { md5 } from '@/utils/md5'
import { aesDecrypt } from '@/utils/aes'

/**
 * 微信登录：用 wx.login 拿到的 code 换取 openid / token
 * 后端约定:
 *   POST /auth/wechat-login  { code }
 *   返回 { openid, token?, nickname?, avatar? }
 */
export function wechatLogin(code) {
  if (USE_MOCK) {
    return Promise.resolve({
      openid: 'mock_openid_' + Date.now(),
      token: 'mock_token_' + Math.random().toString(36).slice(2),
      nickname: '微信用户',
      avatar: ''
    })
  }
  return post('/auth/wechat-login', { code })
}

/**
 * 获取当前用户的订单列表
 * 后端约定:
 *   GET /order/list  (header 自动带 Authorization: Bearer <token>)
 *   返回 { list: Order[] }
 *   Order: { order_no, title, amount, status, create_time, cover? }
 */
export function getOrderList() {
  if (USE_MOCK) {
    return Promise.resolve({
      list: [
        { order_no: 'NO20260904001', title: 'AI剧本创作 · 年度会员', amount: 299.0, status: 'paid', create_time: '2026-09-04 18:20' },
        { order_no: 'NO20260821002', title: '数字人表演 · 单课', amount: 99.0, status: 'completed', create_time: '2026-08-21 10:05' },
        { order_no: 'NO20260815003', title: '自动化剪辑 · 训练营', amount: 199.0, status: 'unpaid', create_time: '2026-08-15 21:42' },
        { order_no: 'NO20260730004', title: '短剧运营与分发 · 会员', amount: 159.0, status: 'cancelled', create_time: '2026-07-30 09:11' }
      ]
    })
  }
  return get('/order/list')
}

// ===================== 主播 开播/下播 签到签退 =====================
// 真实后端接口在 F:\codes\dingyao-core-backend，
// 路由挂载在 /admin 下：
//   GET  /admin/wxchannel/live/offices   办公室门牌号下拉 -> [{id,no}]
//   GET  /admin/wxchannel/live/accounts  直播间/视频号下拉 -> [{id,source_name}]
//   POST /admin/wxchannel/live/checkIn   {office_id, account_id} -> 开播签到
//   POST /admin/wxchannel/live/checkOut  {id?} -> 下播签退(自动匹配未下播记录)
// 接真实后端时：BASE_URL 需指向后端域名(去掉 /api 前缀)，并将 token 写入 storage。

// 办公室(房间)门牌号下拉
export function getLiveOffices() {
  if (USE_LIVE_API_MOCK) {
    return Promise.resolve({
      items: [
        { id: 1, no: 'A01' },
        { id: 2, no: 'A02' },
        { id: 3, no: 'B01' },
        { id: 4, no: 'B02' }
      ]
    })
  }
  return get('/admin/wxchannel/live/offices')
}

// 直播间(主播要选择的视频号)下拉
export function getLiveAccounts() {
  if (USE_LIVE_API_MOCK) {
    return Promise.resolve({
      items: [
        { id: 1, source_name: '鼎耀优选 · 主号' },
        { id: 2, source_name: 'AI短剧好物馆' },
        { id: 3, source_name: '鼎耀百货' }
      ]
    })
  }
  return get('/admin/wxchannel/live/accounts')
}

// 上播签到：必填 office_id(扫码绑定房间) + account_id(选视频号)
export function liveCheckIn({ office_id, account_id }) {
  if (USE_LIVE_API_MOCK) {
    return Promise.resolve({
      id: Date.now(),
      streamer_id: 888,
      start_time: new Date().toLocaleString('zh-CN', { hour12: false })
    })
  }
  return post('/admin/wxchannel/live/checkIn', { office_id, account_id })
}

// 下播签退：不传 id 时自动匹配当前主播最近一条未下播记录
export function liveCheckOut() {
  if (USE_LIVE_API_MOCK) {
    return Promise.resolve({
      id: Date.now(),
      streamer_id: 888,
      start_time: '',
      end_time: new Date().toLocaleString('zh-CN', { hour12: false })
    })
  }
  return post('/admin/wxchannel/live/checkOut', {})
}

// 获取当前登录主播(后台用户)信息，其中 id 即直播记录里的 streamer_id（用于按主播查询直播状态）
export function getAnchorUserinfo() {
  if (USE_LIVE_API_MOCK) {
    return Promise.resolve({ id: 888, username: 'anchor', nickname: '主播' })
  }
  return get('/admin/user/getUserinfo')
}

// 直播记录列表：streamer_id>0 时按主播过滤；end_time 为空 = 未下播（即正在直播中）
// 返回 { page, pageSize, total, items: [{id, office_id, office_no, account_id, account_name, start_time, end_time}] }
export function getLiveRecords({ streamer_id = 0, page = 1, pageSize = 10 } = {}) {
  if (USE_LIVE_API_MOCK) {
    return Promise.resolve({ page, pageSize, total: 0, items: [] })
  }
  return get('/admin/wxchannel/live/records', { streamer_id, page, pageSize })
}

// ===================== 主播账号登录 =====================
// 后端：POST /admin/user/login  { username, password, captcha, codeid }
//   noLogin:1 + noAuth:1(无需登录) 返回 data 为一串 token，请求头用 Bearer <token>。
// 记住用户名密码：仅保存在本地 storage，勾选后可免输快速再次登录。

// 获取图形验证码：?type=image -> { id, show, img(base64), expireTime }
export function getCaptcha() {
  if (USE_LIVE_API_MOCK) {
    const img =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAPCAYAAAB0j9HjAAAAF0lEQVR4nGP8z8DwnwGEgImJCS6CAADJAAQBoOT78wAAAABJRU5ErkJggg=='
    return Promise.resolve({ id: 'mock_captcha', show: true, img, expireTime: Date.now() + 60000 })
  }
  return get('/common/basetool/getCaptcha', { type: 'image' })
}

// 主播账号登录(用户名密码 + 图形验证码)
export function anchorLogin({ username, password, captcha, codeid }) {
  if (USE_LIVE_API_MOCK) {
    // mock 校验非空即算登录成功，data 即 token
    if (!username || !password) {
      return Promise.reject(new Error('请输入用户名和密码'))
    }
    return Promise.resolve('mock_token_' + Math.random().toString(36).slice(2))
  }
  return post('/admin/user/login', {
    username,
    // 与 web 后台登录一致：明文密码先做客户端 MD5，后端再按 salt 二次加密比对
    password: md5(password),
    captcha,
    codeid
  }).then((data) => {
    // 登录返回的是 AES 加密的 token，入库前先解密（对齐 web 的 setToken(Decrypt(token))）
    try {
      return aesDecrypt(data)
    } catch (e) {
      return data
    }
  })
}
