// 业务接口层
import { post, get, upload } from '@/utils/request'
import { BASE_URL, USE_MOCK, USE_LIVE_API_MOCK } from '@/utils/config'
import { md5 } from '@/utils/md5'
import { aesDecrypt } from '@/utils/aes'

/**
 * 微信登录（双端）
 *  - H5：走服务号网页授权 OAuth，返回授权入口地址，由页面跳转过去；
 *        后端 /wxapp/wxlogin 把 back(myurl) 编码进 state -> 微信授权页 ->
 *        oauth_redirect_base_url 指向的回调路由解码 state 拿到 myurl 并跳转
 *  - 微信小程序：uni.login 拿到 code 后调后端 /wxapp/miniappLogin 换 openid/token
 */

// H5 微信网页授权入口地址
// 最终跳转地址(myurl)由后端 wxchannel.yaml 的 oauth_back_url 配置决定(也可传 back 参数覆盖)
// uni 端无需处理 state, 后端会把 myurl 编码进 state, 由回调路由解码跳转
export function getWxLoginUrl(back) {
  let url = BASE_URL + '/wxapp/wxlogin'
  if (back) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + 'back=' + encodeURIComponent(back)
  }
  return url
}

// H5 OAuth 回调后：用 URL 上的一次性 ticket 换完整登录态
// 后端流程: wxcallback 把登录态存 Redis(60秒) 生成 32 位 ticket 302 回前端 ->
// 前端拿 ticket 调本接口换取 { token, uid, openid, union_id, nickname, avatar }
// ticket 一次性, 取后即焚, 防重放; token 不直接拼 URL, 避免特殊字符被 hash 路由破坏
export function wxLoginTicket(ticket) {
  return post('/wxapp/wxLoginTicket', { ticket })
}

// 微信小程序登录：code 换 token/openid
export function miniappLogin(code) {
  if (USE_MOCK) {
    return Promise.resolve({
      openid: 'mock_openid_' + Date.now(),
      union_id: 'mock_unionid_' + Date.now(),
      token: 'mock_token_' + Math.random().toString(36).slice(2),
      nickname: '微信用户',
      avatar: ''
    })
  }
  return post('/wxapp/miniappLogin', { code })
}

/**
 * 获取当前登录用户信息
 * 后端约定:
 *   GET /wxapp/myProfile  (header 自动带动态token)
 *   返回 { uid, nickname, avatar, sex, mobile, score, union_id, order_total, order_match }
 */
export function getMyProfile() {
  if (USE_MOCK) {
    return Promise.resolve({
      uid: 1,
      nickname: '微信用户',
      avatar: '',
      sex: 0,
      mobile: '',
      score: 0,
      union_id: 'mock_unionid',
      order_total: 0,
      order_match: true
    })
  }
  return get('/wxapp/myProfile')
}

/**
 * 获取当前用户的订单列表
 * 后端约定:
 *   GET /wxapp/myOrders  (header 自动带动态token)
 *   返回 { total, list, page, page_size, union_id }
 *   订单字段: order_id, product_info, status, status_desc, real_fee, created_at ...
 */
export function getOrderList() {
  if (USE_MOCK) {
    return Promise.resolve({
      total: 4,
      list: [
        { order_id: 'NO20260904001', product_info: 'AI剧本创作 · 年度会员', real_fee: 29900, status: '20', status_desc: '待发货', created_at: '2026-09-04 18:20' },
        { order_id: 'NO20260821002', product_info: '数字人表演 · 单课', real_fee: 9900, status: '100', status_desc: '已完成', created_at: '2026-08-21 10:05' },
        { order_id: 'NO20260815003', product_info: '自动化剪辑 · 训练营', real_fee: 19900, status: '10', status_desc: '待付款', created_at: '2026-08-15 21:42' },
        { order_id: 'NO20260730004', product_info: '短剧运营与分发 · 会员', real_fee: 15900, status: '250', status_desc: '已取消', created_at: '2026-07-30 09:11' }
      ]
    })
  }
  return get('/wxapp/myOrders')
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

// 当前登录主播的直播记录列表（后端强制按登录 uid 过滤，主播只能看自己的）
// 返回 { page, pageSize, total, items: [{id, office_no, account_name, start_time, end_time, order_count}] }
export function getMyLiveRecords({ page = 1, pageSize = 10 } = {}) {
  if (USE_LIVE_API_MOCK) {
    return Promise.resolve({ page, pageSize, total: 0, items: [] })
  }
  return get('/admin/wxchannel/live/myRecords', { page, pageSize })
}

// ===================== 主播「我的资料」 =====================
// 后端按 token 里的 uid 匹配 gf_anchor_resource.user_id
// 返回 { id, name, avatar, phone, gender, skills, skills_array, available_time,
//        platform_accounts: [{platform, account, url}], status }
export function getMyAnchorProfile() {
  if (USE_LIVE_API_MOCK) {
    return Promise.resolve({
      id: 888,
      user_id: 888,
      name: '主播',
      avatar: '',
      phone: '',
      gender: 2,
      skills: '美妆,穿搭',
      skills_array: ['美妆', '穿搭'],
      available_time: '周一至周五 9:00-18:00',
      platform_accounts: [{ platform: '抖音', account: 'demo', url: '' }],
      status: 1
    })
  }
  return get('/admin/schedule/anchor/me')
}

// 主播端只允许改头像/可用时段/平台账号
export function saveMyAnchorProfile({ avatar = '', available_time = '', platform_accounts = [] } = {}) {
  if (USE_LIVE_API_MOCK) {
    return Promise.resolve({ ok: true })
  }
  return post('/admin/schedule/anchor/me/save', {
    avatar,
    available_time,
    platform_accounts
  })
}

// 上传头像，返回 { id, url, ... }
export function uploadAnchorAvatar(filePath) {
  if (USE_LIVE_API_MOCK) {
    return Promise.resolve({ id: Date.now(), url: filePath })
  }
  return upload('/admin/datacenter/upfile/upload', filePath, {
    pid: 0,
    filetype: 'image'
  })
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

// ===================== 主播自助与协同 =====================
// 统一说明：全部按登录 token 里的 uid 隔离，前端不传 anchor_id
// 后端前缀 /admin/schedule/me/*，返回结构 { code, message, data }

// 我的排班（view: week / month / range）
export function getMySchedules({ view = 'week', date = '', start_date = '', end_date = '' } = {}) {
  if (USE_LIVE_API_MOCK) {
    return Promise.resolve({
      anchor_id: 888,
      anchor_name: '主播',
      view,
      start_date: '2026-10-19',
      end_date: '2026-10-25',
      days: [],
      summary: { count: 0, minutes: 0, hours: 0, unconfirmed: 0, need_confirm: 0 }
    })
  }
  return get('/admin/schedule/me/schedules', { view, date, start_date, end_date })
}

// 我的申请（type: 0全部 1换班 2请假；status: -1全部 0待审核 1已通过 2已驳回 3已生效 4已取消）
export function getMyRequests({ page = 1, pageSize = 20, type = 0, status = -1 } = {}) {
  if (USE_LIVE_API_MOCK) {
    return Promise.resolve({ list: [], total: 0, page, page_size: pageSize, pending: 0 })
  }
  return get('/admin/schedule/me/requests', { page, pageSize, type, status })
}

// 发起换班（req_type: 1单方代班 2互调；互调必须带 to_plan_id）
export function applySwap({ req_type = 1, from_plan_id, to_anchor_id, to_plan_id = 0, reason = '' }) {
  if (USE_LIVE_API_MOCK) return Promise.resolve({ id: 1, status: 0 })
  return post('/admin/schedule/me/swap/apply', { req_type, from_plan_id, to_anchor_id, to_plan_id, reason })
}

// 发起请假 / 休班（auto_cover=1 表示审核通过后按候选自动替班）
export function applyLeave({
  leave_type = 1,
  start_date,
  end_date = '',
  start_time = '',
  end_time = '',
  plan_ids = '',
  auto_cover = 0,
  reason = ''
}) {
  if (USE_LIVE_API_MOCK) return Promise.resolve({ id: 1, plan_count: 0 })
  return post('/admin/schedule/me/leave/apply', {
    leave_type,
    start_date,
    end_date,
    start_time,
    end_time,
    plan_ids,
    auto_cover,
    reason
  })
}

// 取消本人申请（type: 1换班 2请假）
export function cancelMyRequest({ id, type, reason = '' }) {
  if (USE_LIVE_API_MOCK) return Promise.resolve({})
  return post('/admin/schedule/me/request/cancel', { id, type, reason })
}

// 换班候选：可代班主播 covers + 可互调场次 mutual
export function getSwapCandidates({ from_plan_id, date = '', limit = 5 }) {
  if (USE_LIVE_API_MOCK) {
    return Promise.resolve({ covers: [], blocked: [], mutual: [], reason: '' })
  }
  return get('/admin/schedule/me/swap/candidates', { from_plan_id, date, limit })
}

// 请假前替班候选预览（plan_ids 逗号分隔）
export function getLeaveSuggestions({ plan_ids, limit = 3 }) {
  if (USE_LIVE_API_MOCK) return Promise.resolve({ items: [], suggestions: [] })
  return get('/admin/schedule/me/leave/suggestions', { plan_ids, limit })
}

// 可抢场次（scope: 1可抢 2我抢到的）
export function getGrabbableList({ page = 1, pageSize = 20, scope = 1 } = {}) {
  if (USE_LIVE_API_MOCK) return Promise.resolve({ list: [], total: 0, page, page_size: pageSize })
  return get('/admin/schedule/me/cover/list', { page, pageSize, scope })
}

// 抢班
export function grabCover({ id }) {
  if (USE_LIVE_API_MOCK) return Promise.resolve({ cover_id: id })
  return post('/admin/schedule/me/cover/grab', { id })
}

// 确认 / 拒接排班（action: 1确认 2拒接）
export function confirmMyPlan({ plan_id, action = 1, reject_reason = '' }) {
  if (USE_LIVE_API_MOCK) return Promise.resolve({ plan_id, status: 1 })
  return post('/admin/schedule/me/plan/confirm', { plan_id, action, reject_reason })
}

// 站内提醒
export function getMyNotifications({ page = 1, pageSize = 20, status = -1, type = 0 } = {}) {
  if (USE_LIVE_API_MOCK) return Promise.resolve({ list: [], total: 0, unread: 0 })
  return get('/admin/schedule/me/notifications', { page, pageSize, status, type })
}

// 标记已读（ids 为空 = 全部已读）
export function readMyNotifications({ ids = '' } = {}) {
  if (USE_LIVE_API_MOCK) return Promise.resolve({ updated: 0 })
  return post('/admin/schedule/me/notifications/read', { ids })
}
