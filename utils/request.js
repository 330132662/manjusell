// 通用请求封装
import { BASE_URL } from '@/utils/config'

/**
 * @param {Object} options { url, method, data, header }
 * @returns {Promise<any>} 约定后端返回结构: { code: 0, data: ..., message: '' }
 */
function request(options) {
  const { url, method = 'GET', data = {}, header = {} } = options
  const token = uni.getStorageSync('token')
  if (token) {
    header['Authorization'] = 'Bearer ' + token
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
        if (res.statusCode >= 200 && res.statusCode < 300 && body && body.code === 0) {
          resolve(body.data)
        } else {
          const msg = (body && body.message) || ('请求失败 (' + res.statusCode + ')')
          uni.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
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

export default { request, get, post, BASE_URL }
