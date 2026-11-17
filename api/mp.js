/**
 * 主播工作台 M0–M9 · 数据层门面
 *
 * 设计原则：
 *  1. 页面只依赖本文件导出的函数，不直接读写 storage，便于后续替换为真实接口；
 *  2. 真实接口优先：排班 / 开播 / 下播 / 工作台 / 业绩 / 团队 / 我的 已在 api/index.js 提供；
 *     写操作、工资、违规、OKR、制度签收等后端未提供，使用本地演示数据（USE_MP_DEMO）；
 *  3. 所有写操作立刻落 storage，返回 Promise，页面可以 await 后刷新。
 */
import {
	getMySchedules,
	getMyLiveRecords,
	liveCheckIn,
	liveCheckOut,
	getLiveOffices,
	getLiveAccounts,
	getMyNotifications,
	getAnchorWorkbench,
	getAnchorPerformance,
	getAnchorTeamBoard,
	getAnchorMine
} from './index'
import { createSeed } from './mp-seed'
import { USE_MP_DEMO } from '@/utils/config'
import {
	DAY,
	HOUR,
	TIERS,
	tierOf,
	nextTierOf,
	orderValidity,
	handRatio,
	isHandRed,
	HAND_RULE,
	DOC_LIST,
	ONBOARD_NODES,
	KPI_ITEMS,
	kpiCoef,
	money,
	dayText,
	todayStart,
	monthStart
} from '@/utils/mp-format'

const KEY = 'mp_state_v1'
const SESSION_KEY = 'mp_session_ctx'

let state = null

/* ============================ 基础读写 ============================ */

function load() {
	if (state) return state
	try {
		const raw = uni.getStorageSync(KEY)
		if (raw && raw.version === 1) {
			state = raw
			return state
		}
	} catch (e) {
		/* ignore */
	}
	state = createSeed()
	save()
	return state
}

function save() {
	try {
		uni.setStorageSync(KEY, state)
	} catch (e) {
		/* 存储超限时忽略，内存态仍可用 */
	}
}

/** 重置演示数据（我的 → 消息设置 → 底部入口 / 控制台可调） */
export function resetDemo() {
	state = createSeed()
	save()
	return state
}

/**
 * 切换演示身份（仅演示模式可用）：普通主播 L3 ⇄ 组长。
 * 组长视角会解锁「本组排班确认」「本组看板」等按钮，方便演示权限差异。
 */
export function switchDemoRole() {
	if (!USE_MP_DEMO) return null
	const s = load()
	const leader = s.profile.pos === '组长'
	s.profile.pos = leader ? 'L3' : '组长'
	s.profile.posText = leader ? 'L3 金牌' : '组长'
	save()
	return s.profile
}

function sid(prefix) {
	return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/* ============================ 通用派生 ============================ */

function nowTs() {
	return Date.now()
}

function plansOfDay(day) {
	const s = load()
	return s.schedules
		.filter((p) => p.date === day && !['已取消', '草稿'].includes(p.status))
		.sort((a, b) => a.startAt - b.startAt)
}

function todayPlans() {
	return plansOfDay(dayText(todayStart()))
}

function nextPlan() {
	const t = nowTs()
	return load()
		.schedules.filter((p) => p.endAt > t && !['已完成', '缺勤', '已取消'].includes(p.status))
		.sort((a, b) => a.startAt - b.startAt)[0]
}

function liveSession() {
	return load().sessions.find((s) => s.status === '直播中' && s.anchorId === me().id) || null
}

function pendingDataSession() {
	return (
		load().sessions.find(
			(s) => s.anchorId === me().id && s.status === '已结束' && s.data && ['待录入', '驳回'].includes(s.data.st)
		) || null
	)
}

function sessionById(id) {
	return load().sessions.find((s) => String(s.id) === String(id)) || null
}

function ordersOfSession(id) {
	return load().orders.filter((o) => String(o.sessionId) === String(id))
}

/** 有效口径：不退款、未取消 */
function effective(list) {
	return list.filter((o) => !o.refund && o.status !== '已取消')
}

function stats(list) {
	const v = effective(list)
	return {
		n: v.length,
		gmv: v.reduce((a, o) => a + Number(o.amt || 0), 0),
		refund: list.filter((o) => o.refund).length,
		total: list.length
	}
}

function myOrders(from, to) {
	const s = load()
	return s.orders.filter((o) => o.anchorId === s.profile.id && o.payAt >= from && o.payAt < (to || nowTs() + DAY))
}

function monthOrders() {
	return myOrders(monthStart()).filter((o) => !o.refund)
}

function validGmv() {
	return monthOrders()
		.filter((o) => orderValidity(o) === '有效')
		.reduce((a, o) => a + o.amt, 0)
}

function unreadCount() {
	return load().notifications.filter((m) => !m.read).length
}

function unsignedDocs() {
	const s = load()
	return s.docs.filter((d) => !s.signs[d.name])
}

function appealableViolations() {
	const t = nowTs()
	return load().violations.filter((v) => !v.appeal && t - v.at < DAY)
}

function me() {
	return load().profile
}

function isLeader() {
	return ['组长', '副组长'].includes(me().pos)
}

/* ============================ M2 首页 ============================ */

export async function getWorkbench() {
	// 后端聚合接口优先（schedule 模块的 /admin/schedule/me/workbench）
	try {
		const r = await getAnchorWorkbench()
		if (r && typeof r === 'object' && r.profile) {
			const s = load()
			const todos = []
			// 未读通知（后端聚合已返回 unread）
			// 待办清单：仍按本地 storage 驱动（写操作、审批等后端还没补）
			if (s.swapInvite && s.swapInvite.st === '待处理' && s.swapInvite.to === me().id) {
				todos.push({ icon: '换', title: '换班邀请', desc: s.swapInvite.fromName + ' 想与你换班', url: '/pages/swap-invite/index', type: 'purple' })
			}
			if (s.payroll.st === '待确认') {
				todos.push({ icon: '薪', title: '工资条待确认', desc: s.payroll.period + ' 月 · 实发 ' + money(s.payroll.net), url: '/pages/anchor-payslip/index', type: 'gold' })
			}
			if (unsignedDocs().length) {
				todos.push({ icon: '制', title: '制度待签收', desc: unsignedDocs().map((d) => d.name).join('、'), url: '/pages/anchor-rules/index', type: 'gray' })
			}
			const localProfile = me()
			return {
				profile: { ...r.profile, posText: localProfile.posText },
				greet: new Date().getHours(),
				todayPlans: r.todayPlans || [],
				live: r.live || null,
				nextPlan: r.nextPlan || null,
				stats: {
					todayOrders: r.stats?.todayOrders ?? 0,
					todayGmv: r.stats?.todayGmv ?? 0,
					monthGmv: r.stats?.monthGmv ?? 0,
					validGmv: r.stats?.monthGmv ?? 0,
					tierRate: 0,
					nextTier: null,
					tierGap: 0
				},
				todos,
				unread: r.unread ?? 0,
				leader: !!r.leader,
				badges: {
					schedule: (s.swapInvite && s.swapInvite.st === '待处理' ? 1 : 0) + (me().pos === '组长' ? (r.todayPlans || []).length : 0),
					mine: r.unread ?? 0
				}
			}
		}
	} catch (e) { /* 后端失败 → 走本地 seed */ }

	const s = load()
	const live = liveSession()
	const pend = pendingDataSession()
	const next = nextPlan()
	const today = stats(myOrders(todayStart()))
	const month = stats(monthOrders())
	const gmv = validGmv()
	const tier = tierOf(gmv, me().pos)
	const nextTier = nextTierOf(gmv, me().pos)

	const todos = []
	if (s.swapInvite && s.swapInvite.st === '待处理' && s.swapInvite.to === me().id) {
		todos.push({
			icon: '换',
			title: '换班邀请',
			desc: s.swapInvite.fromName + ' 想与你换班',
			url: '/pages/swap-invite/index',
			type: 'purple'
		})
	}
	if (me().pos === '组长') {
		const pendCount = s.team.plans.filter((p) => p.status === '待确认' && !p.obj).length
		if (pendCount) {
			todos.push({ icon: '排', title: '本组排班待确认', desc: pendCount + ' 个班次 · 周六 18:00 截止', url: '/pages/team-schedule/index', type: 'ink' })
		}
	}
	if (pend) todos.push({ icon: '录', title: '录入本场数据', desc: 'UV / 峰值 / 下播前在线 + 截图', url: '/pages/anchor-live-data/index?id=' + pend.id, type: 'gold' })
	const hasEndedToday = s.sessions.some((x) => x.endAt >= todayStart() && x.anchorId === me().id)
	if (hasEndedToday && !s.reports[dayText(todayStart())]) {
		todos.push({ icon: '报', title: '写今日日报', desc: '下播后 24h 内提交', url: '/pages/anchor-daily-report/index', type: 'ink' })
	}
	if (s.payroll.st === '待确认') {
		todos.push({ icon: '薪', title: '工资条待确认', desc: s.payroll.period + ' 月 · 实发 ' + money(s.payroll.net), url: '/pages/anchor-payslip/index', type: 'gold' })
	}
	appealableViolations().forEach((v) => {
		todos.push({ icon: '诉', title: '违规可申诉', desc: v.level + ' · 剩 ' + Math.ceil((DAY - (nowTs() - v.at)) / HOUR) + ' 小时', url: '/pages/anchor-violations/index', type: 'red' })
	})
	if (s.okr && s.okr.st === '待签收') {
		todos.push({ icon: '标', title: 'OKR 待签收', desc: s.okr.o, url: '/pages/anchor-okr/index', type: 'ink' })
	}
	const uns = unsignedDocs()
	if (uns.length) {
		todos.push({ icon: '制', title: '制度待签收', desc: uns.map((d) => d.name).join('、'), url: '/pages/anchor-rules/index', type: 'gray' })
	}

	return {
		profile: me(),
		greet: new Date().getHours(),
		todayPlans: todayPlans(),
		live,
		pending: pend,
		nextPlan: next,
		stats: {
			todayOrders: today.n,
			todayGmv: today.gmv,
			monthGmv: month.gmv,
			validGmv: gmv,
			tierRate: tier.r,
			nextTier,
			tierGap: nextTier ? nextTier.min - gmv : 0
		},
		todos,
		unread: unreadCount(),
		leader: isLeader(),
		badges: {
			schedule: (s.swapInvite && s.swapInvite.st === '待处理' ? 1 : 0) + (me().pos === '组长' ? s.team.plans.filter((p) => p.status === '待确认' && !p.obj).length : 0),
			mine: unreadCount() + unsignedDocs().length + (s.payroll.st === '待确认' ? 1 : 0) + appealableViolations().length
		}
	}
}

/** 提成预估（首页第 4 格 / 业绩页 FAB / 工资条） */
export async function getCommission() {
	const gmv = validGmv()
	const tier = tierOf(gmv, me().pos)
	const next = nextTierOf(gmv, me().pos)
	return {
		gmv,
		rate: tier.r,
		amount: Number((gmv * tier.r).toFixed(2)),
		next,
		gap: next ? next.min - gmv : 0
	}
}

/* ============================ M2.1 扫码 ============================ */

export async function getScanRooms() {
	const s = load()
	let rooms = s.rooms.filter((r) => r.status !== '测试禁选')
	// 真实接口可用时以接口为准（失败则用演示房间）
	if (!USE_MP_DEMO) {
		try {
			const res = await getLiveOffices()
			const items = (res && (res.items || res.list)) || []
			if (items.length) {
				rooms = items.map((it) => {
					const local = s.rooms.find((r) => String(r.no) === String(it.no))
					return {
						id: it.id,
						no: it.no,
						name: local ? local.name : it.no + ' 直播间',
						accId: local ? local.accId : '',
						accName: local ? local.accName : '',
						status: local ? local.status : '可播'
					}
				})
				s.realRooms = rooms
				save()
			}
		} catch (e) {
			/* 保持演示数据 */
		}
	}
	return rooms
}

/** 房间查找：兼容真实接口 id 与演示房间 id */
function findRoom(roomId) {
	const s = load()
	return (
		(s.realRooms || []).find((r) => String(r.id) === String(roomId)) ||
		s.rooms.find((r) => String(r.id) === String(roomId)) ||
		s.rooms[0]
	)
}

export async function getRoomAccounts(roomId) {
	const s = load()
	try {
		const res = await getLiveAccounts()
		const items = (res && (res.items || res.list)) || []
		if (!USE_MP_DEMO && items.length) {
			return items.map((it) => ({ id: it.id, name: it.source_name }))
		}
	} catch (e) {
		/* ignore */
	}
	const r = s.rooms.find((x) => String(x.id) === String(roomId))
	return r ? [{ id: r.accId, name: r.accName }] : []
}

/* ============================ M2.2 四维校验 ============================ */

/** 运营授权码：演示环境统一 888888；真实环境由运营后台生成 */
const DEMO_AUTH_CODE = '888888'

export async function verifyStart({ roomId, code }) {
	const s = load()
	const t = nowTs()
	const room = findRoom(roomId)
	const today = dayText(todayStart())
	const plans = plansOfDay(today)
	const plan = plans.find((p) => String(p.roomNo) === String(room.no) && p.endAt > t && p.startAt - 10 * 60000 <= t)
	const anyPlan = plans.find((p) => p.endAt > t)
	const authOk = !!code && code === DEMO_AUTH_CODE
	const checks = []

	// 人
	checks.push({
		key: '人',
		ok: true,
		title: '本人在岗',
		desc: me().name + ' · ' + me().posText + ' · ' + me().groupName
	})

	// 场
	checks.push({
		key: '场',
		ok: !!plan || authOk,
		title: '有排班或计划外授权',
		desc: plan
			? '排班 ' + plan.start + '–' + plan.end + ' · ' + plan.type
			: authOk
			? '已使用运营授权码（计划外开播）'
			: anyPlan
			? '你的排班在 ' + anyPlan.roomNo + '，' + anyPlan.start + ' 开始；计划外开播需授权码'
			: '今日该房间无你的排班，需运营授权码',
		fix: !plan && !authOk ? 'auth' : ''
	})

	// 地
	const roomOk = room.status === '可播' || (room.status === '养号' && plan && plan.type === '养号')
	checks.push({
		key: '地',
		ok: !!roomOk,
		title: '房间码 = 排班房间',
		desc: roomOk ? room.no + ' · 绑定 ' + (room.accName || '—') : room.no + ' 状态为「' + room.status + '」，不可开播'
	})

	// 时
	let timeOk = true
	let timeWarn = false
	let timeDesc = ''
	if (plan) {
		const late = Math.round((t - plan.startAt) / 60000)
		if (late > 0) {
			timeOk = true
			timeWarn = true
			timeDesc = '已迟到 ' + late + ' 分钟，仍可开播，按考勤规则计'
		} else {
			timeDesc = '可扫码窗口：' + plan.start + ' 起'
		}
	} else if (authOk) {
		timeDesc = '授权码 30 分钟内有效'
	} else {
		timeOk = false
		timeDesc = '不在任何排班时段内'
	}
	checks.push({ key: '时', ok: timeOk, warn: timeWarn, title: '时段内', desc: timeDesc })

	// 锁：同房间/同视频号是否有他人直播中
	const occupy = s.sessions.find(
		(x) => x.status === '直播中' && (String(x.accId) === String(room.accId) || String(x.roomNo) === String(room.no))
	)
	if (occupy) {
		const auto = occupy.planEnd && occupy.planEnd <= t
		const mine = occupy.anchorId === me().id
		checks.push({
			key: '锁',
			ok: !!auto,
			title: mine ? '三重锁' : '交接班',
			desc: mine
				? '你在 ' + occupy.roomNo + ' 仍有进行中场次，请先下播'
				: auto
				? '上一场（' + occupy.anchorName + '）计划已结束，开播时自动结束上一场'
				: occupy.anchorName + ' 仍在直播（计划至 ' + hm(occupy.planEnd) + '）',
			fix: auto || mine ? '' : 'hand',
			handName: auto || mine ? '' : occupy.anchorName
		})
	} else {
		checks.push({ key: '锁', ok: true, title: '三重锁', desc: '视频号 / 主播 / 房间 同时段唯一' })
	}

	// 授权
	const signed = s.signs['肖像授权']
	checks.push({
		key: '授权',
		ok: !!signed,
		title: '肖像授权已签署',
		desc: signed ? '已签署 ' + dayText(signed) : '未签署肖像授权，请先在「我的 → 规则与制度签收」签署',
		fix: signed ? '' : 'sign'
	})

	return {
		room,
		plan,
		checks,
		ok: checks.every((c) => c.ok),
		auth: authOk
	}
}

/** 通知对方下播（演示：4 秒后结束对方场次） */
export async function notifyOccupying() {
	const s = load()
	const occ = s.sessions.find((x) => x.status === '直播中' && x.anchorId !== me().id)
	if (!occ) return false
	occ.status = '已结束'
	occ.endAt = nowTs()
	occ.data = { uv: 0, peak: 0, last: 0, stay: 0, conv: 0, shot: false, st: '待录入', why: '' }
	save()
	return true
}

/* ============================ M2.3 合规自查 / 开播 ============================ */

export async function startLive({ roomId, code }) {
	const s = load()
	const t = nowTs()
	const room = findRoom(roomId)
	const today = dayText(todayStart())
	const plan = plansOfDay(today).find((p) => String(p.roomNo) === String(room.no) && p.endAt > t)

	// 真实后端：用运营后台配置的视频号 id 签到
	let accId = room.accId
	if (!USE_MP_DEMO) {
		try {
			const items = await getRoomAccounts(room.id)
			if (items && items.length) accId = items[0].id
		} catch (e) {
			/* ignore */
		}
	}

	// 先结束同房间/同视频号遗留场次（交接班）
	s.sessions
		.filter(
			(x) =>
				x.status === '直播中' &&
				(x.anchorId === me().id || String(x.accId) === String(accId) || String(x.roomNo) === String(room.no))
		)
		.forEach((x) => {
			x.status = '已结束'
			x.endAt = t
			x.att = '未主动下播'
			x.data = { uv: 0, peak: 0, last: 0, stay: 0, conv: 0, shot: false, st: '待录入', why: '' }
		})

	const session = {
		id: 'S' + t,
		planId: plan ? plan.id : '',
		date: today,
		roomId: room.id,
		roomNo: room.no,
		accId,
		accName: room.accName,
		anchorId: me().id,
		anchorName: me().name,
		startAt: t,
		endAt: 0,
		planEnd: plan ? plan.endAt : 0,
		att: plan ? (t > plan.startAt + 60000 ? '迟到 ' + Math.round((t - plan.startAt) / 60000) + ' 分钟' : '准时') : '计划外',
		status: '直播中',
		data: null
	}
	s.sessions.unshift(session)
	if (plan) plan.status = '进行中'
	save()

	// 同步真实后端（失败不阻断本地演示）
	try {
		const res = await liveCheckIn({ office_id: room.id, account_id: accId })
		if (res && res.id) {
			session.remoteId = res.id
			save()
		}
	} catch (e) {
		/* 后端未提供接口时忽略 */
	}

	return session
}

/* ============================ M2.4 直播中 ============================ */

export async function getLiveBoard() {
	const live = liveSession()
	if (!live) return { live: null }
	const os = ordersOfSession(live.id)
	const st = stats(os)
	return {
		live,
		orders: os.slice(-5).reverse(),
		stats: st,
		elapsed: nowTs() - live.startAt,
		planEnd: live.planEnd,
		overPlan: live.planEnd > 0 && nowTs() > live.planEnd
	}
}

/** 模拟一笔订单（演示用，真实环境由后端推送） */
export async function mockOrder(sessionId) {
	const s = load()
	const ses = sessionById(sessionId) || liveSession()
	if (!ses) return null
	const o = {
		id: '3721' + Date.now(),
		sessionId: ses.id,
		accId: ses.accId,
		accName: ses.accName,
		amt: 299,
		payAt: nowTs(),
		status: '已支付',
		refund: false,
		anchorId: me().id,
		claim: '',
		flag: ''
	}
	s.orders.unshift(o)
	save()
	return o
}

export async function endLive({ early } = {}) {
	const s = load()
	const live = liveSession()
	if (!live) return null
	const t = nowTs()
	live.status = '已结束'
	live.endAt = t
	if (early) live.att = '早退'
	live.data = { uv: 0, peak: 0, last: 0, stay: 0, conv: 0, shot: false, st: '待录入', why: '' }
	const plan = s.schedules.find((p) => p.id === live.planId)
	if (plan) plan.status = '已完成'
	save()

	try {
		await liveCheckOut({ id: live.remoteId || 0, end_time: fmtDateTime(t) })
	} catch (e) {
		/* ignore */
	}
	return live
}

/* ============================ M2.5 / M2.6 下播数据 ============================ */

export async function getDataEntry(sessionId) {
	const ses = sessionId ? sessionById(sessionId) : pendingDataSession()
	if (!ses) return null
	return {
		session: ses,
		stats: stats(ordersOfSession(ses.id)),
		data: ses.data || {},
		red: ses.data && isHandRed(ses.data.last, ses.data.peak)
	}
}

export async function submitSessionData(sessionId, payload) {
	const s = load()
	// 与 getDataEntry 保持一致：未带 id 时落到「待录数据」的那一场
	const ses = sessionId ? sessionById(sessionId) : pendingDataSession()
	if (!ses) throw new Error('场次不存在')
	const red = isHandRed(payload.last, payload.peak)
	ses.data = {
		uv: Number(payload.uv),
		peak: Number(payload.peak),
		last: Number(payload.last),
		stay: Number(payload.stay),
		conv: Number(payload.conv),
		shot: !!payload.shot,
		st: '待审核',
		why: ''
	}
	// 触发交接红线的场次进入违规池
	if (red) {
		const exists = s.handovers.some((h) => h.sessionId === ses.id)
		if (!exists) {
			s.handovers.unshift({ id: sid('H'), sessionId: ses.id, at: nowTs(), st: '待处理', reason: '' })
		}
	}
	save()
	return ses
}

export async function getSummary(sessionId) {
	const s = load()
	const ses = sessionId
		? sessionById(sessionId)
		: s.sessions.filter((x) => x.anchorId === me().id && x.endAt).sort((a, b) => b.endAt - a.endAt)[0]
	if (!ses) return null
	const st = stats(ordersOfSession(ses.id))
	return {
		session: ses,
		stats: st,
		duration: ses.endAt - ses.startAt,
		ratio: ses.data && ses.data.peak ? handRatio(ses.data.last, ses.data.peak) : null,
		dataStatus: ses.data ? ses.data.st : '—'
	}
}

/* ============================ M3 排班（补充） ============================ */

export async function getScheduleExtra() {
	const s = load()
	return {
		swapInvite: s.swapInvite && s.swapInvite.st === '待处理' && s.swapInvite.to === me().id ? s.swapInvite : null,
		leaderPending: me().pos === '组长' ? s.team.plans.filter((p) => p.status === '待确认' && !p.obj).length : 0,
		restTaken: 1,
		monthRest: 4,
		emoLeft: 1
	}
}

/* ============================ M3.2 换班邀请 ============================ */

export async function getSwapInvite() {
	const s = load()
	const inv = s.swapInvite
	if (!inv || inv.st !== '待处理') return null
	return {
		...inv,
		mine: s.schedules.find((p) => p.id === inv.mineId) || null,
		theirs: s.team.plans.find((p) => p.id === inv.theirsId) || null
	}
}

export async function replySwapInvite(agree, reason) {
	const s = load()
	const inv = s.swapInvite
	if (!inv) return false
	inv.st = agree ? '已同意' : '已拒绝'
	inv.reason = reason || inv.reason
	s.notifications.unshift({
		id: sid('N'),
		cat: '审批',
		title: agree ? '你已同意换班，等待运营审批' : '你已拒绝换班邀请',
		body: agree ? '运营复核双方工时后生效' : reason || '未填写原因',
		at: nowTs(),
		read: false,
		go: '/pages/my-requests/index'
	})
	save()
	return true
}

/* ============================ M3.3 本组排班确认 ============================ */

export async function getTeamSchedule() {
	if (me().pos !== '组长') return { forbidden: true, plans: [] }
	const s = load()
	const days = []
	s.team.plans.forEach((p) => {
		let d = days.find((x) => x.date === p.date)
		if (!d) {
			d = { date: p.date, plans: [] }
			days.push(d)
		}
		d.plans.push(p)
	})
	days.sort((a, b) => (a.date > b.date ? 1 : -1))
	return {
		forbidden: false,
		days,
		pending: s.team.plans.filter((p) => p.status === '待确认' && !p.obj).length,
		// 组员档案，供页面把 anchor id 渲染成姓名
		members: s.team.members
	}
}

export async function confirmTeamPlan(id) {
	const s = load()
	const p = s.team.plans.find((x) => x.id === id)
	if (!p) return false
	p.status = '待公示'
	save()
	return true
}

export async function objectTeamPlan(id, reason) {
	const s = load()
	const p = s.team.plans.find((x) => x.id === id)
	if (!p) return false
	p.obj = true
	p.objReason = reason
	p.status = '待公示'
	save()
	return true
}

export async function confirmAllTeamPlans() {
	const s = load()
	s.team.plans.filter((p) => p.status === '待确认' && !p.obj).forEach((p) => (p.status = '待公示'))
	save()
	return true
}

/* ============================ M4 业绩 ============================ */

export async function getPerformance(tab) {
	// 后端聚合优先
	try {
		const r = await getAnchorPerformance()
		if (r && r.overview) {
			const localProfile = me()
			return {
				tab,
				profile: { ...r.profile, posText: localProfile.posText },
				overview: r.overview,
				sessions: r.sessions || [],
				days: r.days || [],
				month: {
					period: r.month,
					validGmv: r.overview.validGmv,
					validOrders: r.overview.orders,
					orders: r.overview.orders,
					kpi: 0,
					coef: 1.0,
					tier: null
				},
				rank: r.rank || [],
				myRank: (r.rank || []).findIndex((x) => String(x.id) === String(me().id)) + 1
			}
		}
	} catch (e) { /* 后端失败 → 走本地 */ }

	const s = load()
	const all = myOrders(monthStart() - 30 * DAY)
	const month = myOrders(monthStart())
	const st = stats(all)
	const valid = month.filter((o) => orderValidity(o) === '有效')
	const sessions = s.sessions.filter((x) => x.anchorId === me().id).sort((a, b) => b.startAt - a.startAt)

	const list = sessions.map((x) => {
		const os = ordersOfSession(x.id)
		const o = stats(os)
		return { ...x, orders: o.n, gmv: o.gmv }
	})

	const days = Array.from({ length: 7 }, (_, i) => {
		const d = todayStart() - i * DAY
		const os = all.filter((o) => o.payAt >= d && o.payAt < d + DAY)
		const o = stats(os)
		return { date: dayText(d), label: i === 0 ? '今天' : dayText(d).slice(5), n: o.n, gmv: o.gmv }
	})

	const rank = [
		{ id: 'xieyahao', name: '谢亚豪', gmv: 47840 },
		{ id: 'zhao', name: '赵敏', gmv: 32890 },
		{ id: 'lihao', name: '李浩', gmv: validGmv() },
		{ id: 'qin', name: '秦悦', gmv: 26910 },
		{ id: 'pang', name: '庞雪', gmv: 17940 }
	].sort((a, b) => b.gmv - a.gmv)

	return {
		tab,
		profile: me(),
		overview: {
			gmv: st.gmv,
			orders: st.n,
			valid: valid.length,
			refund: st.refund,
			pending: month.filter((o) => orderValidity(o) === '待判定').length,
			sessions: sessions.filter((x) => x.startAt >= monthStart()).length
		},
		sessions: list,
		days,
		month: {
			period: load().payroll.period,
			validGmv: validGmv(),
			validOrders: valid.length,
			orders: month.length,
			kpi: 86,
			coef: kpiCoef(86),
			tier: tierOf(validGmv(), me().pos)
		},
		rank,
		myRank: rank.findIndex((r) => r.id === me().id) + 1
	}
}

/* ============================ M4.1 本场订单 ============================ */

export async function getSessionOrders(sessionId) {
	const s = load()
	const ses = sessionId
		? sessionById(sessionId)
		: s.sessions.filter((x) => x.anchorId === me().id && x.endAt).sort((a, b) => b.endAt - a.endAt)[0]
	if (!ses) return null
	const os = ordersOfSession(ses.id)
	return {
		session: ses,
		stats: stats(os),
		orders: os.map((o) => ({ ...o, validity: orderValidity(o) })).sort((a, b) => b.payAt - a.payAt),
		candidates: s.orders
			.filter((o) => o.accId === ses.accId && o.anchorId !== me().id && Math.abs(o.payAt - ses.startAt) < 3 * HOUR)
			.slice(0, 4)
	}
}

export async function claimOrder({ orderId, reason }) {
	const s = load()
	const o = s.orders.find((x) => String(x.id) === String(orderId))
	if (o) {
		o.flag = '掉单申诉'
		o.claim = reason
		o.anchorId = me().id
	}
	s.notifications.unshift({
		id: sid('N'),
		cat: '审批',
		title: '掉单申诉已提交',
		body: '运营将在 24 小时内核实',
		at: nowTs(),
		read: false,
		go: '/pages/anchor-session-orders/index'
	})
	save()
	return true
}

/* ============================ M4.3 本组看板 ============================ */

export async function getTeamBoard() {
	// 后端聚合优先（组长视角）
	try {
		const r = await getAnchorTeamBoard()
		if (r && typeof r === 'object') {
			if (r.forbidden) return r
			const gmv = (r.members || []).reduce((a, m) => a + (Number(m.gmv) || 0), 0)
			const den = r.den || (r.members || []).filter((m) => String(m.id) !== String(me().id)).length
			const eff = Number(r.eff) || (den ? (gmv / (den || 1)) : 0)
			const effK = eff >= 70000 ? 1.2 : eff >= 50000 ? 1.0 : eff >= 30000 ? 0.7 : 0
			return {
				forbidden: false,
				gmv,
				eff,
				effK,
				den,
				leaderSessions: 11,
				leaderTarget: 15,
				members: r.members || []
			}
		}
	} catch (e) { /* 后端失败 → 走本地 */ }

	if (!isLeader()) return { forbidden: true }
	const s = load()
	const members = s.team.members
	const gmv = members.filter((m) => m.id !== 'zhao').reduce((a, m) => a + m.gmv, 0)
	const den = members.filter((m) => m.id !== 'zhao').length
	const eff = den ? gmv / den : 0
	const effK = eff >= 70000 ? 1.2 : eff >= 50000 ? 1.0 : eff >= 30000 ? 0.7 : 0
	return {
		forbidden: false,
		gmv,
		eff,
		effK,
		den,
		leaderSessions: 11,
		leaderTarget: 15,
		members
	}
}

/* ============================ M5 工资 ============================ */

function payslipOf(period) {
	const s = load()
	const p = s.payroll
	if (!period || period === p.period) return { ...p, isCurrent: true }
	// 历史期：按比例模拟，保证列表可点开
	const k = period === prevPeriod(p.period) ? 0.96 : 0.91
	const inc = p.inc.map((i) => ({ ...i, amt: Number((i.amt * k).toFixed(2)) }))
	const ded = p.ded.map((i) => ({ ...i, amt: Number((i.amt * k).toFixed(2)) }))
	const gross = inc.reduce((a, b) => a + b.amt, 0)
	const dedTotal = ded.reduce((a, b) => a + b.amt, 0)
	return {
		...p,
		period,
		inc,
		ded,
		gross: Number(gross.toFixed(2)),
		dedTotal: Number(dedTotal.toFixed(2)),
		net: Number((gross - dedTotal).toFixed(2)),
		st: '已发放',
		paidAt: period + '-20',
		isCurrent: false
	}
}

function prevPeriod(period) {
	const [y, m] = period.split('-').map(Number)
	const d = new Date(y, m - 1, 1)
	d.setMonth(d.getMonth() - 1)
	return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

export async function getSalary() {
	const s = load()
	const p = s.payroll
	const cur = p.st === '待确认' || p.st === '异议中' || p.st === '已确认' ? p : null
	const history = [
		{ period: p.period, net: p.net, st: p.st, paidAt: p.paidAt, current: true },
		{ period: prevPeriod(p.period), net: Number((p.net * 0.96).toFixed(2)), st: '已发放', paidAt: prevPeriod(p.period) + '-20', current: false },
		{ period: prevPeriod(prevPeriod(p.period)), net: Number((p.net * 0.91).toFixed(2)), st: '已发放', paidAt: prevPeriod(prevPeriod(p.period)) + '-20', current: false }
	]
	return {
		period: p.period,
		net: p.net,
		st: p.st,
		tpl: p.tpl,
		history,
		flex: me().emp === '灵活用工',
		canAdvance: me().emp !== '灵活用工',
		quota: advanceQuota().q
	}
}

export async function getPayslip(period) {
	return payslipOf(period)
}

export async function confirmPayslip() {
	const s = load()
	s.payroll.st = '已确认'
	s.payroll.confirmAt = nowTs()
	save()
	return true
}

export async function submitPayObjection(items, reason) {
	const s = load()
	s.payroll.st = '异议中'
	s.payroll.objection = { items, reason, at: nowTs(), result: '' }
	s.notifications.unshift({
		id: sid('N'),
		cat: '工资',
		title: '工资异议已提交',
		body: '财务 → 经理 → 总监处理中，20 日照常发放',
		at: nowTs(),
		read: false,
		go: '/pages/anchor-payslip/index'
	})
	save()
	return true
}

/* ============================ M5.3 预支 ============================ */

export function advanceQuota() {
	const s = load()
	const p = s.payroll
	const comm = (p.inc.find((i) => i.name === '阶梯提成') || { amt: 0 }).amt
	const base = 5000 * (new Date().getDate() / 30)
	const owe = s.advances.filter((a) => ['扣回中', '已放款', '待放款'].includes(a.st)).reduce((x, a) => x + (a.left === undefined ? a.amt : a.left), 0)
	const q = comm * 0.6 + base * 0.5 - owe - comm * 0.1
	const quota = Math.max(0, Math.floor(q / 100) * 100)
	return {
		q: quota,
		owe,
		parts: [
			['阶梯提成 × 60%', Number((comm * 0.6).toFixed(2))],
			['底薪按日折算 × 50%', Number(base.toFixed(2))],
			['未还借款', -owe],
			['风险预留 10%', Number((-comm * 0.1).toFixed(2))]
		]
	}
}

export async function getAdvance() {
	const s = load()
	const quota = advanceQuota()
	const inflight = s.advances.some((a) => ['待放款', '审批中'].includes(a.st))
	return {
		quota,
		inflight,
		records: s.advances,
		flex: me().emp === '灵活用工'
	}
}

export async function applyAdvance(amt, reason) {
	const s = load()
	const q = advanceQuota()
	if (!amt || amt <= 0) throw new Error('请输入金额')
	if (amt > q.q) throw new Error('超出可借额度 ' + money(q.q))
	s.advances.unshift({
		id: sid('AD'),
		amt: Number(amt),
		left: Number(amt),
		reason,
		st: '审批中',
		at: nowTs()
	})
	save()
	return true
}

/* ============================ M6 我的 ============================ */

export async function getMine() {
	// 后端聚合优先：profile + attendance + assets + unread
	try {
		const r = await getAnchorMine()
		if (r && r.profile) {
			const s = load()
			const p = s.payroll
			const localProfile = me()
			return {
				profile: { ...r.profile, posText: localProfile.posText },
				attendance: r.attendance || null,
				assets: r.assets || [],
				growth: {
					onboard: null,
					text: localProfile.posText,
					progress: 0
				},
				kpi: { scored: true, score: 86, coef: kpiCoef(86) },
				salary: { st: p.st, period: p.period },
				badges: {
					salary: p.st === '待确认' ? '待确认' : '',
					okr: s.okr && s.okr.st === '待签收' ? '待签收' : '',
					violation: appealableViolations().length ? appealableViolations().length + ' 条可申诉' : '',
					rules: unsignedDocs().length ? unsignedDocs().length + ' 项待签' : '',
					message: r.unread || ''
				}
			}
		}
	} catch (e) { /* 后端失败 → 走本地 */ }

	const s = load()
	const p = s.payroll
	const ob = s.growth.onboard
	return {
		profile: me(),
		growth: {
			onboard: ob,
			text: ob ? '30 天起步 · 第 ' + (Math.floor((nowTs() - ob.start) / DAY) + 1) + ' 天' : me().posText + ' · 本月建议 升 L4',
			progress: ob ? ob.nodes.filter(Boolean).length / ONBOARD_NODES.length : 0.68
		},
		kpi: { scored: true, score: 86, coef: kpiCoef(86) },
		salary: { st: p.st, period: p.period },
		badges: {
			salary: p.st === '待确认' ? '待确认' : '',
			okr: s.okr && s.okr.st === '待签收' ? '待签收' : '',
			violation: appealableViolations().length ? appealableViolations().length + ' 条可申诉' : '',
			rules: unsignedDocs().length ? unsignedDocs().length + ' 项待签' : '',
			message: unreadCount() || ''
		}
	}
}

export async function getDevices() {
	const s = load()
	return {
		accounts: s.rooms
			.filter((r) => r.accName)
			.map((r) => ({ name: r.accName, kind: r.status === '养号' ? '养号' : '主', k: r.status === '养号' ? 0.8 : 1.0, roomNo: r.no, status: r.status })),
		assets: [
			{ id: 'ZC-0231', name: '直播一体机', at: '2025-03-05', st: '使用中' },
			{ id: 'ZC-0457', name: '补光灯 ×2', at: '2025-03-05', st: '使用中' }
		]
	}
}

export async function getAttendance() {
	const s = load()
	const d = new Date()
	const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
	const first = new Date(d.getFullYear(), d.getMonth(), 1).getDay()
	const cells = []
	for (let i = 1; i <= days; i++) {
		const day = new Date(d.getFullYear(), d.getMonth(), i).getTime()
		let type = ''
		if (day <= todayStart()) {
			const ses = s.sessions.filter((x) => x.startAt >= day && x.startAt < day + DAY)
			if (!ses.length) type = 'rest'
			else if (ses.some((x) => x.att === '黑天鹅豁免')) type = 'bs'
			else if (ses.some((x) => String(x.att).indexOf('迟到') === 0)) type = 'late'
			else type = 'ok'
		}
		cells.push({ day: i, type, today: i === d.getDate() })
	}
	return {
		month: d.getMonth() + 1,
		firstWeekday: first,
		cells,
		late: s.sessions.filter((x) => String(x.att).indexOf('迟到') === 0).length,
		pigeon: 0,
		emoLeft: 1,
		restTaken: 1,
		monthRest: 4
	}
}

function violationView(v) {
	const t = nowTs()
	const can = !v.appeal && t - v.at < DAY
	return {
		...v,
		can,
		leftText: can ? clockText(DAY - (t - v.at)) : '',
		isLink: false
	}
}

export async function getViolations() {
	const s = load()
	const list = s.violations.map(violationView)
	const hands = s.handovers.map((h) => {
		const ses = sessionById(h.sessionId)
		return {
			...h,
			sessionText: ses ? dayText(ses.endAt) + ' ' + hm(ses.endAt) + ' 场' : h.sessionId,
			ratio: ses && ses.data && ses.data.peak ? handRatio(ses.data.last, ses.data.peak) : null
		}
	})
	return {
		violations: list,
		handovers: hands,
		empty: !list.length && !hands.length
	}
}

export async function submitViolationAppeal(id, reason) {
	const s = load()
	const v = s.violations.find((x) => x.id === id)
	if (!v) return false
	v.appeal = '审批中'
	v.appealReason = reason
	save()
	return true
}

export async function submitHandoverFree(sessionId, reason) {
	const s = load()
	const h = s.handovers.find((x) => x.sessionId === sessionId || x.id === sessionId)
	if (!h) return false
	h.st = '免责审批中'
	h.reason = reason
	save()
	return true
}

export async function getRules() {
	const s = load()
	return {
		version: 'V18.8-r1',
		docs: s.docs.map((d) => ({ ...d, signedAt: s.signs[d.name] || 0 }))
	}
}

export async function signDoc(name) {
	const s = load()
	s.signs[name] = nowTs()
	save()
	return true
}

export async function getGrowth() {
	const s = load()
	const ob = s.growth.onboard
	return {
		profile: me(),
		onboard: ob
			? {
					...ob,
					day: Math.min(30, Math.floor((nowTs() - ob.start) / DAY) + 1),
					nodes: ONBOARD_NODES.map((t, i) => ({
						text: t,
						done: !!ob.nodes[i],
						// 当前节点 = 第一个未完成项
						active: i === ONBOARD_NODES.findIndex((_, k) => !ob.nodes[k])
					}))
			  }
			: null,
		history: s.growth.history,
		suggest: s.growth.starSuggest,
		nextLevel: {
			L1: ['L2', 'D30 答辩 ≥70 定级 / 稳定 ≥5 万'],
			L2: ['L3', '连续 2 月 ≥7 万'],
			L3: ['L4', '连续 2 月 ≥10 万'],
			L4: ['首席', '连续 2 月 ≥12 万且竞聘前三']
		}[me().pos]
	}
}

/* ============================ M7 消息 ============================ */

export async function getMessages(cat) {
	const s = load()
	let list = s.notifications
	if (cat) list = list.filter((m) => m.cat === cat)
	return {
		list: list.slice().sort((a, b) => b.at - a.at),
		unread: unreadCount()
	}
}

export async function readMessage(id) {
	const s = load()
	const m = s.notifications.find((x) => x.id === id)
	if (m) m.read = true
	save()
	return m
}

export async function readAllMessages() {
	const s = load()
	s.notifications.forEach((m) => (m.read = true))
	save()
	return true
}

/* ============================ M8 日报 ============================ */

export async function getDailyReport() {
	const s = load()
	const key = dayText(todayStart())
	const ss = s.sessions.filter((x) => x.startAt >= todayStart() && x.startAt < todayStart() + DAY)
	const st = stats(ss.reduce((arr, x) => arr.concat(ordersOfSession(x.id)), []))
	return {
		auto: {
			sessions: ss.length,
			duration: ss.reduce((a, x) => a + ((x.endAt || nowTs()) - x.startAt), 0),
			orders: st.n,
			gmv: st.gmv
		},
		report: s.reports[key] || null
	}
}

export async function submitDailyReport(payload) {
	const s = load()
	const key = dayText(todayStart())
	s.reports[key] = { ...payload, at: nowTs() }
	save()
	return true
}

/* ============================ M9 OKR / KPI ============================ */

export async function getOkr() {
	const s = load()
	const scores = { GMV: 88, 交接留存: 82, 转化: 79, 合规: 95 }
	const score = Number(
		(KPI_ITEMS.reduce((a, i) => a + scores[i.key] * i.weight, 0) / 100).toFixed(1)
	)
	return {
		okr: s.okr,
		kpi: {
			period: s.payroll.period,
			items: KPI_ITEMS.map((i) => ({ ...i, score: scores[i.key] })),
			score,
			coef: kpiCoef(score)
		}
	}
}

export async function signOkr() {
	const s = load()
	s.okr.st = '已签收'
	save()
	return true
}

/* ============================ 工具 ============================ */

function hm(ts) {
	if (!ts) return '—'
	const d = new Date(ts)
	return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

function fmtDateTime(ts) {
	const d = new Date(ts)
	const p = (n) => String(n).padStart(2, '0')
	return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds())
}

function clockText(ms) {
	if (ms < 0) ms = 0
	const s2 = Math.floor(ms / 1000)
	const p = (n) => String(n).padStart(2, '0')
	return p(Math.floor(s2 / 3600)) + ':' + p(Math.floor((s2 % 3600) / 60)) + ':' + p(s2 % 60)
}
