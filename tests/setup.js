/**
 * Vitest 全局 setup：模拟 uni-app 运行时
 *
 * 只 mock 纯逻辑模块真正用到的 API：storage、路由、getCurrentPages。
 * 每个用例前自动 reset，避免 installAuthGuard 包装后的 __authGuarded 标记跨用例残留。
 */
import { beforeEach } from 'vitest'

const store = new Map()
let pageStack = []
const calls = []

const urlOf = (o) => (typeof o === 'string' ? o : o && o.url)

function makeUni() {
	return {
		getStorageSync: (k) => store.get(k),
		setStorageSync: (k, v) => store.set(k, v),
		removeStorageSync: (k) => store.delete(k),

		navigateTo: (o) => { calls.push(['navigateTo', urlOf(o), o]); o?.success?.() },
		redirectTo: (o) => { calls.push(['redirectTo', urlOf(o), o]); o?.success?.() },
		reLaunch: (o) => { calls.push(['reLaunch', urlOf(o), o]); o?.success?.() },
		switchTab: (o) => { calls.push(['switchTab', urlOf(o), o]); o?.success?.() },
		navigateBack: (o) => { calls.push(['navigateBack', o && o.delta, o]); o?.success?.() },
		showToast: (o) => calls.push(['showToast', o && o.title, o])
	}
}

/** 重置到干净运行时。测试里可手动调用，beforeEach 也会自动调。 */
function resetEnv() {
	store.clear()
	calls.length = 0
	pageStack = []
	globalThis.uni = makeUni()
	globalThis.getCurrentPages = () => pageStack
}

/** 设置模拟页面栈，传路由字符串数组（不带前导斜杠，与真实 getCurrentPages 一致） */
function setPages(routes) {
	pageStack = (routes || []).map((route) => ({ route }))
}

/** 取某类路由调用记录：[name, url, options][] */
function callsOf(name) {
	return calls.filter((c) => c[0] === name)
}

globalThis.__testStore = store
globalThis.__testCalls = calls
globalThis.__resetEnv = resetEnv
globalThis.__setPages = setPages
globalThis.__callsOf = callsOf
globalThis.__urlsOf = (name) => callsOf(name).map((c) => c[1])

resetEnv()
beforeEach(() => resetEnv())
