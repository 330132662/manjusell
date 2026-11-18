/**
 * auth.js 单测 —— 登录守卫与页面栈治理
 *
 * 重点回归：功能切换页作为栈底，身份切换后返回不串台到别的身份主页。
 */
import { describe, it, expect } from 'vitest'
import * as auth from '../utils/auth.js'

const {
	LOGIN_GATE_PAGE, ENTRY_PAGE, HOME_PAGE, ANCHOR_PAGE, SERVICE_PAGE,
	SERVICE_DASHBOARD_PAGE, LOGIN_PAGE,
	isLogged, currentPath, isAuthFree, goLoginPage, enterWorkspace,
	switchWorkspace, backToEntry, shouldBlock, guardCurrentPage, installAuthGuard
} = auth

const { __setPages: setPages, __callsOf: callsOf, __urlsOf: urlsOf, __testStore: store } = globalThis

describe('auth · 常量与登录态口径', () => {
	it('登录后首页指向功能切换页，且兼容旧 HOME_PAGE 引用', () => {
		expect(ENTRY_PAGE).toBe('/pages/entry/index')
		expect(HOME_PAGE).toBe(ENTRY_PAGE)
		expect(ANCHOR_PAGE).toBe('/pages/anchor-home/index')
		expect(SERVICE_PAGE).toBe('/pages/wxkf-workbench/index')
		expect(SERVICE_DASHBOARD_PAGE).toBe('/pages/wxkf-dashboard/index')
	})

	it('isLogged 以本地 token 为准', () => {
		expect(isLogged()).toBe(false)
		uni.setStorageSync('token', 'abc')
		expect(isLogged()).toBe(true)
		uni.removeStorageSync('token')
		expect(isLogged()).toBe(false)
	})

	it('currentPath 取栈顶并做路径归一化', () => {
		expect(currentPath()).toBe('')
		setPages(['pages/entry/index', 'pages/wxkf-chat/index'])
		expect(currentPath()).toBe('/pages/wxkf-chat/index')
	})
})

describe('auth · 白名单与拦截判定', () => {
	it('未登录页与登录页免登录，且忽略 query / hash / 无斜杠', () => {
		expect(isAuthFree(LOGIN_GATE_PAGE)).toBe(true)
		expect(isAuthFree(LOGIN_PAGE)).toBe(true)
		expect(isAuthFree('pages/anchor-login/index?from=x')).toBe(true)
		expect(isAuthFree(`${LOGIN_PAGE}#x`)).toBe(true)
	})

	it('工作台页面需登录', () => {
		expect(isAuthFree(ANCHOR_PAGE)).toBe(false)
		expect(isAuthFree(SERVICE_PAGE)).toBe(false)
		expect(isAuthFree(SERVICE_DASHBOARD_PAGE)).toBe(false)
	})

	it('shouldBlock：未登录且目标需登录才拦截', () => {
		expect(shouldBlock(SERVICE_PAGE)).toBe(true)
		expect(shouldBlock(LOGIN_PAGE)).toBe(false)
		expect(shouldBlock(LOGIN_GATE_PAGE)).toBe(false)
		expect(shouldBlock('')).toBe(false)
		uni.setStorageSync('token', 'abc')
		expect(shouldBlock(SERVICE_PAGE)).toBe(false)
	})
})

describe('auth · 栈治理（防身份串台）', () => {
	it('enterWorkspace 用 navigateTo 保留中转页栈底', () => {
		setPages(['pages/entry/index'])
		enterWorkspace(SERVICE_PAGE)
		expect(urlsOf('navigateTo')).toEqual([SERVICE_PAGE])
		expect(callsOf('reLaunch')).toHaveLength(0)
	})

	it('enterWorkspace 已在目标页则不重复入栈', () => {
		setPages(['pages/entry/index', 'pages/wxkf-workbench/index'])
		enterWorkspace(SERVICE_PAGE)
		expect(callsOf('navigateTo')).toHaveLength(0)
	})

	it('enterWorkspace 支持 { url } 入参，空目标不跳转', () => {
		setPages(['pages/entry/index'])
		enterWorkspace({ url: ANCHOR_PAGE })
		enterWorkspace('')
		expect(urlsOf('navigateTo')).toEqual([ANCHOR_PAGE])
	})

	it('switchWorkspace 先清栈回中转页并带 next 参数，最终栈恒为 [entry, target]', () => {
		setPages(['pages/entry/index', 'pages/anchor-home/index'])
		switchWorkspace(SERVICE_PAGE)
		expect(urlsOf('reLaunch')).toEqual([
			`${ENTRY_PAGE}?next=${encodeURIComponent(SERVICE_PAGE)}`
		])
		// 不在栈内叠加 navigateTo，避免旧身份页面残留
		expect(callsOf('navigateTo')).toHaveLength(0)
	})

	it('backToEntry：栈内有中转页则回退到它（delta 精确）', () => {
		setPages(['pages/entry/index', 'pages/wxkf-workbench/index'])
		backToEntry()
		expect(callsOf('navigateBack')).toEqual([
			['navigateBack', 1, expect.objectContaining({ delta: 1 })]
		])
		expect(callsOf('reLaunch')).toHaveLength(0)
	})

	it('backToEntry：深层栈回退到中转页', () => {
		setPages(['pages/entry/index', 'pages/wxkf-workbench/index', 'pages/wxkf-chat/index'])
		backToEntry()
		expect(callsOf('navigateBack')[0][1]).toBe(2)
	})

	it('backToEntry：已在中转页不重复跳转', () => {
		setPages(['pages/entry/index'])
		backToEntry()
		expect(callsOf('navigateBack')).toHaveLength(0)
		expect(callsOf('reLaunch')).toHaveLength(0)
	})

	it('backToEntry：栈被清空或 H5 刷新直达时重建中转页', () => {
		setPages([])
		backToEntry()
		expect(urlsOf('reLaunch')).toEqual([ENTRY_PAGE])

		setPages(['pages/wxkf-dashboard/index'])
		backToEntry()
		expect(urlsOf('reLaunch')).toEqual([ENTRY_PAGE, ENTRY_PAGE])
	})

	it('切换身份后返回不会落到其他身份主页（组合回归）', () => {
		setPages(['pages/entry/index', 'pages/anchor-home/index'])
		switchWorkspace(SERVICE_PAGE)
		// 模拟中转页 onLoad 读 next 后 enterWorkspace
		setPages(['pages/entry/index'])
		enterWorkspace(SERVICE_PAGE)
		// 此时栈：[entry, wxkf-workbench]，返回只回 entry
		setPages(['pages/entry/index', 'pages/wxkf-workbench/index'])
		backToEntry()
		expect(callsOf('navigateBack')).toHaveLength(1)
		expect(urlsOf('reLaunch')).toHaveLength(1) // 仅 switchWorkspace 那次
		expect(urlsOf('reLaunch')[0]).toContain(ENTRY_PAGE)
		expect(urlsOf('reLaunch')[0]).not.toBe(ANCHOR_PAGE)
	})
})

describe('auth · 冷启动 / 后台切回兜底', () => {
	it('未登录停留在需登录页 → reLaunch 到未登录页', () => {
		setPages(['pages/wxkf-workbench/index'])
		guardCurrentPage()
		expect(urlsOf('reLaunch')).toEqual([LOGIN_GATE_PAGE])
	})

	it('已登录停留在未登录页 → 回功能切换页', () => {
		uni.setStorageSync('token', 'abc')
		setPages(['pages/not-logged/index'])
		guardCurrentPage()
		expect(urlsOf('reLaunch')).toEqual([HOME_PAGE])
	})

	it('未登录页自身、空栈均不动作', () => {
		setPages(['pages/not-logged/index'])
		guardCurrentPage()
		setPages([])
		guardCurrentPage()
		expect(callsOf('reLaunch')).toHaveLength(0)
	})
})

describe('auth · 全局路由守卫', () => {
	it('未登录访问工作台时，navigateTo 被改为跳未登录页', () => {
		installAuthGuard()
		uni.navigateTo({ url: SERVICE_PAGE })
		expect(urlsOf('navigateTo')).toEqual([LOGIN_GATE_PAGE])
	})

	it('白名单页放行；已登录访问工作台放行', () => {
		installAuthGuard()
		uni.navigateTo({ url: LOGIN_PAGE })
		uni.setStorageSync('token', 'abc')
		uni.navigateTo({ url: SERVICE_PAGE })
		expect(urlsOf('navigateTo')).toEqual([LOGIN_PAGE, SERVICE_PAGE])
	})

	it('已在未登录页时忽略拦截，避免重复 reLaunch', () => {
		setPages(['pages/not-logged/index'])
		installAuthGuard()
		uni.navigateTo({ url: SERVICE_PAGE })
		expect(callsOf('navigateTo')).toHaveLength(0)
	})

	it('包装幂等：重复安装不会叠加', () => {
		installAuthGuard()
		installAuthGuard()
		uni.navigateTo({ url: LOGIN_PAGE })
		expect(callsOf('navigateTo')).toHaveLength(1)
	})

	it('四个路由方法均被守护', () => {
		installAuthGuard()
		expect(uni.navigateTo.__authGuarded).toBe(true)
		expect(uni.redirectTo.__authGuarded).toBe(true)
		expect(uni.reLaunch.__authGuarded).toBe(true)
		expect(uni.switchTab.__authGuarded).toBe(true)
	})
})
