/**
 * 全局登录态守卫（uni 端）
 *
 * 设计目标：全端「未登录一律跳转到未登录页」。
 * 登录态口径：与现有页面保持一致，以本地缓存 token（主播登录态）为准。
 *
 * 实现思路：
 *  1) 全局包装 uni 的路由 API（navigateTo / redirectTo / reLaunch / switchTab），
 *     在跳转前判断目标页是否需要登录，未登录则改跳未登录页；
 *     —— 该方式不依赖页面生命周期，Vue2 / Vue3、任意端均生效。
 *  2) App.vue 的 onLaunch / onShow 调用 guardCurrentPage()，兜底处理
 *     冷启动直达、H5 刷新、后台切回等「不经过路由 API」的场景。
 *
 * 白名单：未登录页自身、主播登录页。二者必须放行，否则会死循环 / 无法登录。
 */

// 未登录落地页
export const LOGIN_GATE_PAGE = '/pages/not-logged/index'
// 登录成功后落地页（主播工作台）
export const HOME_PAGE = '/pages/anchor-home/index'
// 主播登录页
export const LOGIN_PAGE = '/pages/anchor-login/index'

// 无需登录即可访问的页面（算法按完整路径匹配）
const AUTH_FREE_PAGES = [LOGIN_GATE_PAGE, LOGIN_PAGE]

/** 是否已登录 */
export function isLogged() {
	return !!uni.getStorageSync('token')
}

/** 统一的路径归一化：去掉 query/hash，补齐前导斜杠 */
function normalizePath(url) {
	if (!url || typeof url !== 'string') return ''
	let path = url.split('?')[0].split('#')[0]
	if (path.charAt(0) !== '/') path = '/' + path
	return path
}

/** 当前页面路径（形如 /pages/xxx/index） */
export function currentPath() {
	const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
	const cur = pages && pages[pages.length - 1]
	return cur && cur.route ? normalizePath(cur.route) : ''
}

/** 该路径是否无需登录 */
export function isAuthFree(path) {
	const p = normalizePath(path)
	return AUTH_FREE_PAGES.indexOf(p) !== -1
}

/**
 * 前往主播登录页。登录页在白名单内，不会被守卫拦截。
 */
export function goLoginPage() {
	uni.navigateTo({ url: LOGIN_PAGE })
}

/**
 * 判断一次跳转是否应被拦截：未登录 且 目标页需登录
 * @param {string} url 目标地址
 * @returns {boolean}
 */
export function shouldBlock(url) {
	const path = normalizePath(url)
	if (!path) return false
	if (isAuthFree(path)) return false
	return !isLogged()
}

/**
 * 拦截兜底：检查「当前页面」是否处于未登录越权状态，是则跳未登录页；
 * 若已登录却停留在未登录落地页，则送回工作台。
 * 供 App.vue onLaunch / onShow 调用。
 */
export function guardCurrentPage() {
	const path = currentPath()
	if (!path) return

	// 已登录停留在落地页 -> 回工作台（避免登录后看到未登录页）
	if (isLogged() && path === LOGIN_GATE_PAGE) {
		uni.reLaunch({ url: HOME_PAGE })
		return
	}

	// 未登录且处于需登录页面 -> 去未登录页
	if (!isLogged() && !isAuthFree(path)) {
		uni.reLaunch({ url: LOGIN_GATE_PAGE })
	}
}

/**
 * 安装全局路由守卫：包装 uni 路由 API。
 * 幂等设计，重复调用不会重复包装。
 */
export function installAuthGuard() {
	const methods = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab']
	methods.forEach((name) => {
		try {
			const original = uni[name]
			if (typeof original !== 'function' || original.__authGuarded) return

			const guarded = function (options = {}) {
				const url = typeof options === 'string' ? options : options && options.url
				if (shouldBlock(url)) {
					// 已在落地页则忽略，避免重复 reLaunch
					if (currentPath() === LOGIN_GATE_PAGE) return
					return original.call(uni, { url: LOGIN_GATE_PAGE })
				}
				return original.call(uni, options)
			}
			guarded.__authGuarded = true
			uni[name] = guarded
		} catch (e) {
			// 个别端/运行时不允许改写 uni 方法时静默降级：
			// 页面级 onLoad 守卫（App.vue + 各业务页）仍是主防线，不影响启动
		}
	})
}

export default {
	LOGIN_GATE_PAGE,
	HOME_PAGE,
	LOGIN_PAGE,
	isLogged,
	currentPath,
	isAuthFree,
	goLoginPage,
	shouldBlock,
	guardCurrentPage,
	installAuthGuard
}
