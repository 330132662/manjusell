/**
 * request.js 单测 —— 401 熔断
 *
 * 重点回归：401 后拦截后续业务请求、放行登录链路、登录成功解除、并发幂等。
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
	get, post, upload, isUnauthorized, resetUnauthorized
} from '../utils/request.js'
import { LOGIN_GATE_PAGE } from '../utils/auth.js'

const { __urlsOf: urlsOf, __callsOf: callsOf, __testStore: store } = globalThis

// 控制「下一次请求」的响应；默认成功。自己计数，不依赖 setup 的调用记录。
let responder
let reqCount
let uploadCount
beforeEach(() => {
	resetUnauthorized()
	reqCount = 0
	uploadCount = 0
	responder = () => ({ statusCode: 200, data: { code: 0, data: { ok: true } } })
	uni.request = (opts) => {
		reqCount++
		opts.success(responder(opts))
	}
	uni.uploadFile = (opts) => {
		uploadCount++
		const res = responder(opts)
		opts.success(typeof res.data === 'object' ? { ...res, data: JSON.stringify(res.data) } : res)
	}
})

const respond401 = (code = 401) => {
	responder = () => ({ statusCode: 401, data: { code, message: 'token expired' } })
}
const respondBiz401 = () => {
	responder = () => ({ statusCode: 200, data: { code: 401, message: '未登录' } })
}

describe('request · 401 触发熔断', () => {
	it('HTTP 401：清 token、reLaunch 未登录页、提示、请求 reject', async () => {
		uni.setStorageSync('token', 'old-token')
		respond401()
		let rejected = false
		try {
			await get('/admin/schedule/me/mine')
		} catch (e) {
			rejected = true
			expect(e.isAuthError).toBe(true)
		}
		expect(rejected).toBe(true)
		expect(store.has('token')).toBe(false)
		expect(urlsOf('reLaunch')).toEqual([LOGIN_GATE_PAGE])
		expect(callsOf('showToast').length).toBe(1)
		expect(isUnauthorized()).toBe(true)
	})

	it('业务码 200 + code=401 也触发', async () => {
		respondBiz401()
		await expect(post('/admin/x/y')).rejects.toMatchObject({ isAuthError: true })
		expect(isUnauthorized()).toBe(true)
		expect(urlsOf('reLaunch')).toEqual([LOGIN_GATE_PAGE])
	})

	it('upload 的 401 同样触发', async () => {
		respond401()
		await expect(upload('/admin/up', '/tmp/x.png')).rejects.toMatchObject({ isAuthError: true })
		expect(isUnauthorized()).toBe(true)
		expect(urlsOf('reLaunch')).toEqual([LOGIN_GATE_PAGE])
	})
})

describe('request · 熔断后拦截', () => {
	it('后续业务请求直接 reject，不再发起网络请求', async () => {
		respond401()
		await get('/admin/a').catch(() => {})
		expect(reqCount).toBe(1)

		// 熔断后再次请求
		let msg = ''
		try {
			await get('/admin/b')
		} catch (e) {
			msg = e.message
		}
		expect(msg).toContain('登录已失效')
		expect(reqCount).toBe(1) // 未再调用 uni.request
		expect(uploadCount).toBe(0)
	})

	it('并发 401 幂等：只 reLaunch / 提示一次', async () => {
		respond401()
		await Promise.allSettled([
			get('/admin/a'), post('/admin/b'), get('/admin/c')
		])
		expect(urlsOf('reLaunch')).toHaveLength(1)
		expect(callsOf('showToast')).toHaveLength(1)
	})
})

describe('request · 登录链路放行与解除', () => {
	it('熔断后登录接口仍放行', async () => {
		respond401()
		await get('/admin/a').catch(() => {})
		// 登录接口不受熔断拦截，能发出
		responder = () => ({ statusCode: 200, data: { code: 0, data: 'new-token' } })
		const token = await post('/admin/user/login', { username: 'a' })
		expect(token).toBe('new-token')
		expect(reqCount).toBe(2)
	})

	it('登录成功后自动解除熔断，业务请求恢复', async () => {
		respond401()
		await get('/admin/a').catch(() => {})
		expect(isUnauthorized()).toBe(true)

		responder = () => ({ statusCode: 200, data: { code: 0, data: 'new-token' } })
		await post('/admin/user/login', { username: 'a' })
		expect(isUnauthorized()).toBe(false)

		await get('/admin/b')
		expect(reqCount).toBe(3)
	})

	it('验证码接口自身返回 401 不触发熔断（避免登录页被踢）', async () => {
		respond401()
		await expect(get('/common/basetool/getCaptcha')).rejects.toBeTruthy()
		expect(isUnauthorized()).toBe(false)
		expect(urlsOf('reLaunch')).toHaveLength(0)
	})

	it('resetUnauthorized 可手动解除', async () => {
		respond401()
		await get('/admin/a').catch(() => {})
		expect(isUnauthorized()).toBe(true)
		resetUnauthorized()
		expect(isUnauthorized()).toBe(false)
	})
})
