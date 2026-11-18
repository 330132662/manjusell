// 通用请求封装
import { BASE_URL, API_SECRET } from '@/utils/config'
import { LOGIN_GATE_PAGE } from '@/utils/auth'
// 命名导出：api 层需要拼接完整 URL 时使用（如 wxkf 媒体地址）；default 导出中仍保留，向后兼容
export { BASE_URL }
import aesEncrypt from '@/utils/aes'
import { utf8ToBase64 } from '@/utils/aes'
import { md5 } from '@/utils/md5'

/* ===================== 401 熔断 =====================
 * 任一接口返回 401 → 清除登录态 + 拦截后续全部业务请求 + reLaunch 未登录页。
 * 登录链路接口必须放行，否则用户无法重新登录（死锁）；登录成功后自动解除熔断。
 */
let unauthorized = false

// 熔断期间仍放行的接口（查验证码 / 提交登录 / 换登录态）
const AUTH_FREE_APIS = [
  '/admin/user/login',
  '/common/basetool/getCaptcha',
  '/wxapp/miniappLogin',
  '/wxapp/wxLoginTicket'
]
// 成功后解除熔断的接口
const LOGIN_APIS = [
  '/admin/user/login',
  '/wxapp/miniappLogin',
  '/wxapp/wxLoginTicket'
]

function isApiMatch(url, list) {
  if (!url || typeof url !== 'string') return false
  const path = url.split('?')[0]
  return list.some((p) => path === p)
}

/** 当前是否处于 401 熔断态 */
export function isUnauthorized() {
  return unauthorized
}

/** 解除熔断（登录成功后内部自动调用，也可外部手动调用） */
export function resetUnauthorized() {
  unauthorized = false
}

function triggerUnauthorized(msg) {
  if (unauthorized) return // 幂等：并发 401 只跳转 / 提示一次
  unauthorized = true
  uni.removeStorageSync('token')
  uni.showToast({ title: msg || '登录已失效，请重新登录', icon: 'none' })
  uni.reLaunch({ url: LOGIN_GATE_PAGE })
}

function is401(res, body) {
  if (res && res.statusCode === 401) return true
  // 业务码兜底：部分接口用 HTTP 200 + code=401 表达未授权
  if (body && (body.code === 401 || body.code === '401')) return true
  return false
}

function makeAuthError() {
  const err = new Error('登录已失效，请重新登录')
  err.isAuthError = true
  return err
}

/**
 * @param {Object} options { url, method, data, header }
 * @returns {Promise<any>} 约定后端返回结构: { code: 0, data: ..., message: '' }
 */
function request(options) {
  const { url, method = 'GET', data = {}, header = {} } = options
  const authFree = isApiMatch(url, AUTH_FREE_APIS)
  // 熔断态：拦截后续业务请求，不再发起网络请求（登录链路除外）
  if (unauthorized && !authFree) return Promise.reject(makeAuthError())
  const token = uni.getStorageSync('token')
  if (token) {
    const ts = Math.floor(Date.now() / 1000)
    // 后端 app.yaml DynamicToken=admin 开启动态token：Authorization 必须为 AES-CBC(token#时间戳)，且不带 Bearer
    header['Authorization'] = aesEncrypt(token + '#' + ts)
    // 接口对称加密校验头：base64(md5(apisecret+ts)#ts)
    header['apiverify'] = utf8ToBase64(md5(API_SECRET + ts) + '#' + ts)
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...header
      },
      success: (res) => {
        const body = res.data
        // 401：触发熔断（登录链路自身返回 401 不触发，避免登录页被反复踢出）
        if (is401(res, body) && !authFree) {
          triggerUnauthorized((body && body.message) || '')
          reject(makeAuthError())
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300 && body && body.code === 0) {
          // 登录成功 → 解除熔断，恢复正常请求
          if (isApiMatch(url, LOGIN_APIS)) resetUnauthorized()
          resolve(body.data)
        } else {
          const msg = (body && body.message) || ('请求失败 (' + res.statusCode + ')')
          uni.showToast({ title: msg, icon: 'none' })
          // 失败响应的 data 也挂到 Error 上(如 checkIn 被拦时携带未下播记录 open_record)
          const err = new Error(msg)
          err.data = body && body.data
          reject(err)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        reject(err)
      }
    })
  })
}

export const get = (url, data, header) => request({ url, method: 'GET', data, header })
export const post = (url, data, header) => request({ url, method: 'POST', data, header })

/**
 * 文件上传（multipart/form-data）
 * @param {String} url 相对路径，如 /admin/datacenter/upfile/upload
 * @param {String} filePath 本地临时文件路径
 * @param {Object} formData 附加表单字段
 * @param {String} fileKey 文件字段名，默认 file（发送小程序封面需传 thumb）
 * @returns {Promise<any>} 后端 data
 */
export function upload(url, filePath, formData = {}, fileKey = 'file') {
  // 熔断态：拦截后续上传请求
  if (unauthorized) return Promise.reject(makeAuthError())
  const header = {}
  const token = uni.getStorageSync('token')
  if (token) {
    const ts = Math.floor(Date.now() / 1000)
    header['Authorization'] = aesEncrypt(token + '#' + ts)
    header['apiverify'] = utf8ToBase64(md5(API_SECRET + ts) + '#' + ts)
  }

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + url,
      filePath,
      name: fileKey,
      formData,
      header,
      success: (res) => {
        let body = null
        try {
          body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
        } catch (e) {
          body = null
        }
        if (is401(res, body)) {
          triggerUnauthorized((body && body.message) || '')
          reject(makeAuthError())
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300 && body && body.code === 0) {
          resolve(body.data)
        } else {
          const msg = (body && body.message) || ('上传失败 (' + res.statusCode + ')')
          uni.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        }
      },
      fail: (err) => {
        uni.showToast({ title: '上传失败，请稍后重试', icon: 'none' })
        reject(err)
      }
    })
  })
}

export default { request, get, post, upload, BASE_URL, isUnauthorized, resetUnauthorized }
