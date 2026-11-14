/**
 * 主播工作台 · 格式化与业务口径
 * 只做纯函数计算，不依赖页面与网络，便于单测与复用。
 */

export const DAY = 86400000
export const HOUR = 3600000
export const MIN = 60000

/** 补零 */
export function pad(n) {
	return String(n).padStart(2, '0')
}

/** 金额：1234.5 -> ¥1,234.50 */
export function money(v) {
	if (v === null || v === undefined || isNaN(v)) return '—'
	const n = Math.abs(Number(v))
		.toFixed(2)
		.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	return (v < 0 ? '-' : '') + '¥' + n
}

/** 万元口径：36500 -> 3.65万 */
export function wan(v) {
	const n = Number(v) || 0
	return n >= 10000 ? (n / 10000).toFixed(2) + '万' : n.toFixed(0)
}

/** 百分比：0.4123 -> 41% */
export function pct(v, d = 0) {
	return (Number(v) * 100).toFixed(d) + '%'
}

/** 时长：毫秒 -> 1h 59m */
export function duration(ms) {
	if (!ms || ms < 0) ms = 0
	const m = Math.floor(ms / 60000)
	return Math.floor(m / 60) + 'h ' + pad(m % 60) + 'm'
}

/** 计时器：毫秒 -> HH:MM:SS */
export function clock(ms) {
	if (!ms || ms < 0) ms = 0
	const s = Math.floor(ms / 1000)
	return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60)
}

/** 单号脱敏：3721000012345678 -> 3721****5678 */
export function maskNo(id) {
	const s = String(id || '')
	if (s.length <= 8) return s
	return s.slice(0, 4) + '****' + s.slice(-4)
}

/** 时间戳 -> 2026-11-14 */
export function dayText(ts) {
	const d = new Date(ts)
	return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

/** 时间戳 -> 11-14 15:20 */
export function mdhmText(ts) {
	const d = new Date(ts)
	return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

/** 时间戳 -> 15:20 */
export function hmText(ts) {
	const d = new Date(ts)
	return pad(d.getHours()) + ':' + pad(d.getMinutes())
}

/** 'YYYY-MM-DD' + 'HH:MM' -> 时间戳 */
export function toTs(date, hm) {
	if (!date) return 0
	const d = new Date(date.replace(/-/g, '/') + ' ' + (hm || '00:00') + ':00')
	return d.getTime()
}

/** 今天 0 点 */
export function todayStart() {
	const d = new Date()
	d.setHours(0, 0, 0, 0)
	return d.getTime()
}

/** 本月 1 日 0 点 */
export function monthStart() {
	const d = new Date()
	return new Date(d.getFullYear(), d.getMonth(), 1).getTime()
}

/** 问候语 */
export function greetText() {
	const h = new Date().getHours()
	if (h < 12) return '上午好'
	if (h < 18) return '下午好'
	return '晚上好'
}

/** 提成阶梯（全额跳档）：5% / 8% / 10%，首席固定 12% */
export const TIERS = [
	{ min: 0, r: 0.05 },
	{ min: 60000, r: 0.08 },
	{ min: 100000, r: 0.1 }
]

export function tierOf(gmv, pos) {
	if (pos === '首席') return { min: 0, r: 0.12 }
	let r = TIERS[0]
	TIERS.forEach((t) => {
		if (gmv >= t.min) r = t
	})
	return r
}

export function nextTierOf(gmv, pos) {
	if (pos === '首席') return null
	return TIERS.find((t) => t.min > gmv) || null
}

/** 交接红线：峰值 > 100 且 下播前在线 ÷ 峰值 < 40% */
export const HAND_RULE = { ratio: 0.4, peak: 100, pen: 200 }

export function handRatio(last, peak) {
	if (!peak || !last) return null
	return Number(last) / Number(peak)
}

export function isHandRed(last, peak) {
	const r = handRatio(last, peak)
	return r !== null && Number(peak) > HAND_RULE.peak && r < HAND_RULE.ratio
}

/** 订单有效性：收货满 7 天或支付满 15 天为有效，退款无效，取消不参与 */
export function orderValidity(o, now = Date.now()) {
	if (o.status === '已取消') return '不参与'
	if (o.refund) return '无效'
	const age = now - o.payAt
	return (o.status === '已收货' && age >= 7 * DAY) || age >= 15 * DAY ? '有效' : '待判定'
}

/** 单价（商品固定 299） */
export const GOODS = { name: '短剧漫剧视频制作全流程实战陪跑课', price: 299 }

/** 状态 -> 视觉标签类型：gold 金 / red 朱砂 / ink 黛青 / gray 灰 / ok 墨绿 */
export function tagType(status) {
	const map = {
		已发布: 'ink',
		进行中: 'ink',
		直播中: 'red',
		待确认: 'gold',
		待审核: 'gold',
		审批中: 'gold',
		待处理: 'gold',
		待签收: 'gold',
		待核算: 'gray',
		待判定: 'gray',
		已结束: 'gray',
		已完成: 'gray',
		有效: 'ok',
		已确认: 'ok',
		已发放: 'ok',
		准时: 'ok',
		通过: 'ok',
		异常: 'red',
		已驳回: 'red',
		缺勤: 'red',
		已退款: 'red',
		异议中: 'red',
		迟到: 'gold',
		早退: 'gold',
		未通过: 'red'
	}
	return map[status] || 'gray'
}

/** 职位展示 */
export const POS_TEXT = {
	L1: 'L1 实习',
	L2: 'L2 正式',
	L3: 'L3 金牌',
	L4: 'L4 王牌',
	首席: '首席',
	副组长: '副组长',
	组长: '组长'
}

/** 30 天起步节点 */
export const ONBOARD_NODES = ['D1 签约', '第 1 周 跟播', '第 2 周 试播 ≤1h', '第 3 周 试播 ≤1.5h', '第 4 周 答辩', 'D30 转正定级']

/** KPI 四项权重 */
export const KPI_ITEMS = [
	{ key: 'GMV', weight: 40, desc: '个人有效 GMV 达成率' },
	{ key: '交接留存', weight: 20, desc: '下播前在线 ÷ 峰值' },
	{ key: '转化', weight: 20, desc: '成交 ÷ UV' },
	{ key: '合规', weight: 20, desc: '违规扣分' }
]

/** KPI 得分 -> 系数 */
export function kpiCoef(score) {
	if (score >= 90) return 1.2
	if (score >= 80) return 1.0
	if (score >= 70) return 0.8
	if (score >= 60) return 0.6
	return 0.4
}

/** 资料 / 制度文档 */
export const DOC_LIST = [
	{ name: '薪资制度 V18.8', desc: '12 类工资条、阶梯提成、KPI 系数、20 日发放、5 日异议' },
	{ name: '考勤与排班', desc: '排班窗口 6:00–23:00、上播 ≤6h、在岗 ≤8h、情绪假每季 1 天' },
	{ name: '交接班与黑天鹅规则', desc: '下播前在线 < 峰值 40% 且峰值 > 100 扣 200 / 场；中控断播经认定豁免' },
	{ name: '竞业协议', desc: '离职后 2 年内不得从事同类直播业务' },
	{ name: '肖像授权', desc: '授权公司在直播与切片中使用本人肖像' }
]
