/**
 * 主播工作台 · 本地演示数据（USE_MP_DEMO=true 时生效）
 *
 * 用途：业绩 / 工资 / 违规 / OKR / 制度签收等模块后端接口尚未提供，
 * 先用一份与原型 V1.6 口径一致的演示数据跑通界面与跳转。
 * 数据全部以「当前时间」为基准生成，保证任何时候打开都有「今天」的排班与场次。
 */
import { DAY, GOODS, DOC_LIST, todayStart, dayText, monthStart } from '@/utils/mp-format'

const MIN = 60000
const HOUR = 3600000

/** 固定种子随机数，保证每次生成的演示数据一致 */
function rng(seed) {
	let s = seed
	return () => {
		s = (s * 1103515245 + 12345) & 0x7fffffff
		return s / 0x7fffffff
	}
}

function roundTo(ts, stepMin) {
	return Math.ceil(ts / (stepMin * MIN)) * stepMin * MIN
}

export function createSeed() {
	const now = Date.now()
	const t0 = todayStart()
	const R = rng(20261114)

	const profile = {
		id: 'lihao',
		name: '李浩',
		pos: 'L3',
		posText: 'L3 金牌',
		group: '一组',
		groupName: '金牌一组',
		real: '李浩',
		mentor: 'zhao',
		emp: '全职',
		phone: '138****2504',
		join: '2025-03-01',
		bank: '招商银行 尾号 6688',
		probation: false,
		avatar: '',
		monthGmvBase: 38300
	}

	/* ---------- 直播间 / 视频号 ---------- */
	const rooms = [
		{ id: 'R01', no: '2504', name: '2504 直播间', accId: 'V01', accName: 'AI漫剧教学分享', status: '可播' },
		{ id: 'R02', no: '2103', name: '2103 直播间', accId: 'V02', accName: 'AI漫剧制作猫老师', status: '可播' },
		{ id: 'R03', no: '2506', name: '2506 直播间', accId: 'V03', accName: 'AI漫剧禾老师', status: '可播' },
		{ id: 'R04', no: '2507', name: '2507 直播间', accId: 'V04', accName: '鼎耀影视传媒', status: '可播' },
		{ id: 'R05', no: '2511', name: '2511 直播间', accId: 'V05', accName: '鼎耀养号 05', status: '养号' },
		{ id: 'R06', no: '技术测试', name: '技术测试间', accId: 'V06', accName: '技术测试号', status: '测试禁选' }
	]

	/* ---------- 排班：今天两场（第一场 5 分钟后开播，处于可扫码窗口） ---------- */
	const p1Start = roundTo(now + 5 * MIN, 10)
	const p1 = {
		id: 'P' + dayText(t0) + '01',
		date: dayText(t0),
		start: timeOf(p1Start),
		end: timeOf(p1Start + 2 * HOUR),
		startAt: p1Start,
		endAt: p1Start + 2 * HOUR,
		roomId: 'R01',
		roomNo: '2504',
		accId: 'V01',
		accName: 'AI漫剧教学分享',
		topic: 'AI漫剧教学分享',
		type: '正式',
		status: '已发布',
		confirm: 1,
		isLeaderView: false
	}
	const p2Start = p1Start + 2 * HOUR + 30 * MIN
	const p2 = {
		id: 'P' + dayText(t0) + '02',
		date: dayText(t0),
		start: timeOf(p2Start),
		end: timeOf(p2Start + 2 * HOUR),
		startAt: p2Start,
		endAt: p2Start + 2 * HOUR,
		roomId: 'R01',
		roomNo: '2504',
		accId: 'V01',
		accName: 'AI漫剧教学分享',
		topic: 'AI漫剧教学分享',
		type: '正式',
		status: '已发布',
		confirm: 1,
		isLeaderView: false
	}
	const p3Start = t0 + DAY + 15 * HOUR + 20 * MIN
	const p3 = {
		id: 'P' + dayText(t0 + DAY) + '01',
		date: dayText(t0 + DAY),
		start: timeOf(p3Start),
		end: timeOf(p3Start + 2 * HOUR),
		startAt: p3Start,
		endAt: p3Start + 2 * HOUR,
		roomId: 'R02',
		roomNo: '2103',
		accId: 'V02',
		accName: 'AI漫剧制作猫老师',
		topic: 'AI漫剧制作猫老师',
		type: '正式',
		status: '已发布',
		confirm: 0,
		isLeaderView: false
	}

	/* ---------- 历史场次（近 12 天） ---------- */
	const sessions = []
	const orders = []
	let seq = 1
	for (let d = 1; d <= 12; d++) {
		const dayBase = t0 - d * DAY
		const count = d % 3 === 0 ? 2 : 1
		for (let k = 0; k < count; k++) {
			const startAt = dayBase + (14 + k * 3) * HOUR
			const endAt = startAt + (110 + Math.round(R() * 30)) * MIN
			const peak = 120 + Math.round(R() * 300)
			const last = Math.round(peak * (0.28 + R() * 0.5))
			const uv = 1600 + Math.round(R() * 2600)
			const ordCount = 4 + Math.round(R() * 8)
			const att = R() > 0.88 ? '迟到 6 分钟' : '准时'
			const id = 'S' + String(seq++).padStart(4, '0')
			sessions.push({
				id,
				planId: '',
				date: dayText(dayBase),
				roomId: k ? 'R02' : 'R01',
				roomNo: k ? '2103' : '2504',
				accId: k ? 'V02' : 'V01',
				accName: k ? 'AI漫剧制作猫老师' : 'AI漫剧教学分享',
				anchorId: 'lihao',
				anchorName: '李浩',
				startAt,
				endAt,
				planEnd: startAt + 2 * HOUR,
				att,
				status: '已结束',
				data: {
					uv,
					peak,
					last,
					stay: 180 + Math.round(R() * 120),
					conv: Number((ordCount / (uv / 100)).toFixed(1)),
					shot: true,
					st: d > 3 ? '已通过' : '待审核',
					why: ''
				}
			})
			// 场次订单
			for (let i = 0; i < ordCount; i++) {
				const payAt = startAt + Math.round((endAt - startAt) * (i / ordCount)) + Math.round(R() * 60000)
				const refund = i === ordCount - 1 && R() > 0.75
				orders.push({
					id: '3721' + String(900000000000 + seq * 1000 + i),
					sessionId: id,
					accId: k ? 'V02' : 'V01',
					accName: k ? 'AI漫剧制作猫老师' : 'AI漫剧教学分享',
					amt: GOODS.price,
					payAt,
					status: refund ? '已支付' : i % 4 === 0 ? '已收货' : '已支付',
					refund: !!refund,
					anchorId: 'lihao',
					claim: '',
					flag: ''
				})
			}
		}
	}

	/* ---------- 正在直播的他人场次（用于演示「三重锁 / 交接班」） ---------- */
	sessions.unshift({
		id: 'SLIVE01',
		planId: '',
		date: dayText(t0),
		roomId: 'R02',
		roomNo: '2103',
		accId: 'V02',
		accName: 'AI漫剧制作猫老师',
		anchorId: 'pang',
		anchorName: '庞雪',
		startAt: now - 50 * MIN,
		endAt: 0,
		planEnd: now + 40 * MIN,
		att: '准时',
		status: '直播中',
		data: null
	})

	/* ---------- 今日订单（用于首页实时口径） ---------- */	for (let i = 0; i < 8; i++) {
		const payAt = now - (8 - i) * 17 * MIN
		orders.push({
			id: '3721' + String(990000000000 + i),
			sessionId: '',
			accId: 'V01',
			accName: 'AI漫剧教学分享',
			amt: GOODS.price,
			payAt,
			status: '已支付',
			refund: false,
			anchorId: 'lihao',
			claim: '',
			flag: ''
		})
	}

	/* ---------- 工资（上月，已推送待确认） ---------- */
	const period = monthText(new Date(now).setDate(1), -1)
	const inc = [
		{ no: 1, name: '底薪', f: 'L3 金牌 5000', amt: 5000 },
		{ no: 2, name: '执行力', f: '800 × 绩效系数 1.0（KPI 86）', amt: 800 },
		{ no: 3, name: '阶梯提成', f: '有效 GMV 42,758 × 5%', amt: 2137.9 },
		{ no: 4, name: '全勤', f: '全月无迟到早退', amt: 200 },
		{ no: 5, name: '二转奖励', f: '4980 单 × 2%', amt: 99.6 }
	]
	const ded = [
		{ no: 6, name: '考勤扣款', f: '迟到 1 次（≤10 分钟）', amt: 20 },
		{ no: 7, name: '交接红线', f: '本月无', amt: 0 },
		{ no: 8, name: '个税', f: '按劳务报酬预扣', amt: 126.75 }
	]
	const gross = inc.reduce((a, b) => a + b.amt, 0)
	const dedTotal = ded.reduce((a, b) => a + b.amt, 0)
	const payroll = {
		period,
		tpl: '主播标准工资条 V18.8',
		inc,
		ded,
		gross: Number(gross.toFixed(2)),
		dedTotal: Number(dedTotal.toFixed(2)),
		net: Number((gross - dedTotal).toFixed(2)),
		st: '待确认',
		pushAt: now - 6 * HOUR,
		paidAt: 0,
		objection: null
	}

	/* ---------- 预支 ---------- */
	const advances = [
		{
			id: 'AD01',
			amt: 1000,
			left: 600,
			reason: '家中临时用款',
			st: '扣回中',
			at: now - 26 * DAY
		}
	]

	/* ---------- 违规 / 交接红线 ---------- */
	const violations = [
		{
			id: 'V01',
			level: '一级',
			desc: '直播背景出现非合作品牌 logo',
			amt: 50,
			at: now - 3 * HOUR,
			appeal: '',
			linkTo: '',
			linkAmt: 0
		},
		{
			id: 'V02',
			level: '二级',
			desc: '直播中引导站外交易',
			amt: 100,
			at: now - 9 * DAY,
			appeal: '维持',
			linkTo: '',
			linkAmt: 0
		}
	]
	const handovers = [
		{
			id: 'H01',
			sessionId: sessions[0] ? sessions[0].id : '',
			at: sessions[0] ? sessions[0].endAt : now - 2 * DAY,
			st: '待处理',
			reason: ''
		}
	]

	/* ---------- 制度签收（肖像授权留待演示） ---------- */
	const signs = {}
	DOC_LIST.forEach((d, i) => {
		if (d.name !== '肖像授权') signs[d.name] = now - (30 - i * 3) * DAY
	})

	/* ---------- OKR ---------- */
	const okr = {
		q: '2026 Q4',
		o: '成为一组第一个稳定破 12 万的主播',
		krs: [
			['月有效 GMV 稳定 ≥ 12 万', 0.62],
			['交接留存率 ≥ 55%', 0.48],
			['D30 带教 1 名新人转正', 0.3]
		],
		st: '待签收'
	}

	/* ---------- 消息 ---------- */
	const msgs = [
		{
			id: 'N01',
			cat: '排班',
			title: 'pang 向你发起换班邀请',
			body: '24 小时内未处理将自动失效',
			at: now - 2 * HOUR,
			read: false,
			go: '/pages/swap-invite/index'
		},
		{
			id: 'N02',
			cat: '合规',
			title: '违规通知 · 一级',
			body: '直播背景出现非合作品牌 logo（扣 50），24 小时内可申诉',
			at: now - 3 * HOUR,
			read: false,
			go: '/pages/anchor-violations/index'
		},
		{
			id: 'N03',
			cat: '工资',
			title: period + ' 月工资条已推送',
			body: '请在 5 日内确认，逾期默认确认',
			at: now - 6 * HOUR,
			read: false,
			go: '/pages/anchor-payslip/index'
		},
		{
			id: 'N04',
			cat: '审批',
			title: '你的换班申请已通过',
			body: '运营已复核双方工时，排班已互换',
			at: now - 2 * DAY,
			read: true,
			go: '/pages/my-requests/index'
		},
		{
			id: 'N05',
			cat: '排班',
			title: '下周排班已公示',
			body: '周日 18:00 公示，可在「我的排班」查看',
			at: now - 3 * DAY,
			read: true,
			go: '/pages/my-schedule/index'
		}
	]

	/* ---------- 本组（组长视角） ---------- */
	const teamMembers = [
		{ id: 'zhao', name: '赵敏', pos: '组长', posText: '组长', live: false, sessions: 1, orders: 6, gmv: 1794 },
		{ id: 'lihao', name: '李浩', pos: 'L3', posText: 'L3 金牌', live: false, sessions: 0, orders: 8, gmv: 2392 },
		{ id: 'pang', name: '庞雪', pos: 'L2', posText: 'L2 正式', live: true, sessions: 1, orders: 4, gmv: 1196 },
		{ id: 'qin', name: '秦悦', pos: 'L3', posText: 'L3 金牌', live: false, sessions: 1, orders: 9, gmv: 2691 },
		{ id: 'chen', name: '陈默', pos: 'L1', posText: 'L1 实习', live: false, sessions: 0, orders: 0, gmv: 0 }
	]

	/* ---------- 下周待确认排班（组长 M3.3） ---------- */
	const teamPlans = []
	const nextMon = t0 + ((8 - new Date(t0).getDay()) % 7 || 7) * DAY
	;['lihao', 'pang', 'qin', 'chen'].forEach((aid, idx) => {
		for (let k = 0; k < 2; k++) {
			const s = nextMon + (idx % 3) * DAY + (14 + k * 3) * HOUR
			teamPlans.push({
				id: 'TP' + aid + k,
				anchor: aid,
				date: dayText(s),
				start: timeOf(s),
				end: timeOf(s + 2 * HOUR),
				roomNo: idx % 2 ? '2103' : '2504',
				type: '正式',
				status: '待确认',
				obj: false,
				objReason: ''
			})
		}
	})

	/* ---------- 换班邀请（pang → lihao） ---------- */
	const swapInvite = {
		id: 'SW1',
		from: 'pang',
		fromName: '庞雪',
		to: 'lihao',
		mineId: p3.id,
		mineText: p3.date + ' ' + p3.start + '–' + p3.end + ' · ' + p3.roomNo,
		theirsId: 'TPpang0',
		theirsText: teamPlans[2].date + ' ' + teamPlans[2].start + '–' + teamPlans[2].end + ' · ' + teamPlans[2].roomNo,
		reason: '周末家里有事，想和你换一下',
		at: now - 2 * HOUR,
		st: '待处理'
	}

	return {
		version: 1,
		profile,
		rooms,
		accounts: rooms.map((r) => ({ id: r.accId, name: r.accName, roomId: r.id })),
		schedules: [p1, p2, p3],
		sessions,
		orders,
		payroll,
		advances,
		violations,
		handovers,
		docs: DOC_LIST,
		signs,
		okr,
		notifications: msgs,
		reports: {},
		team: { members: teamMembers, plans: teamPlans },
		swapInvite,
		growth: {
			history: [31200, 36800, 42758],
			onboard: null,
			starSuggest: { to: 'L4', why: '连续 2 月 ≥10 万' }
		},
		monthStartAt: monthStart()
	}
}

function timeOf(ts) {
	const d = new Date(ts)
	return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

function monthText(ts, offset) {
	const d = new Date(ts)
	d.setMonth(d.getMonth() + offset)
	return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}
