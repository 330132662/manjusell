// 业务接口层
import { post, get } from '@/utils/request'
import { USE_MOCK } from '@/utils/config'

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
