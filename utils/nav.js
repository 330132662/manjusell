/**
 * 统一返回导航。
 *
 * 背景：本项目 pages.json **没有配置 tabBar**，所以 uni.switchTab 一定失败：
 *   "switchTab:fail can not switch to no-tabBar page"
 * 页面栈只有一层时（分享直达、H5 刷新、从扫码进入）navigateBack 也是空操作，
 * 用户会卡死在当前页。这里统一收口：能退栈就退栈，退不了就 reLaunch 到落地页。
 *
 * @param {string} fallback 无法退栈时的落地页，默认主播工作台
 */
export function goBack(fallback = '/pages/anchor-profile/index') {
	const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
	if (pages && pages.length > 1) {
		uni.navigateBack()
		return
	}
	uni.reLaunch({ url: fallback })
}

export default { goBack }
