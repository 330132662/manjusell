/**
 * mp-format.js 单测 —— 主播工作台格式化与业务口径（纯函数）
 */
import { describe, it, expect } from 'vitest'
import {
	DAY, money, wan, pct, duration, clock, maskNo, dayText, mdhmText, hmText,
	toTs, tierOf, nextTierOf, handRatio, isHandRed, orderValidity,
	tagType, kpiCoef, KPI_ITEMS, TIERS, HAND_RULE
} from '../utils/mp-format.js'

describe('mp-format · 数值与文本格式化', () => {
	it('money：千分位、两位小数、正负号、空值', () => {
		expect(money(1234.5)).toBe('¥1,234.50')
		expect(money(-1234.5)).toBe('-¥1,234.50')
		expect(money(0)).toBe('¥0.00')
		expect(money(null)).toBe('—')
		expect(money(undefined)).toBe('—')
		expect(money('abc')).toBe('—')
	})

	it('wan：满 1 万转万元，否则原值', () => {
		expect(wan(36500)).toBe('3.65万')
		expect(wan(10000)).toBe('1.00万')
		expect(wan(9999)).toBe('9999')
		expect(wan(0)).toBe('0')
	})

	it('pct：0.4123 → 41%，支持小数位', () => {
		expect(pct(0.4123)).toBe('41%')
		expect(pct(0.4123, 1)).toBe('41.2%')
		expect(pct(1)).toBe('100%')
	})

	it('duration / clock：时长与计时器', () => {
		expect(duration(7140000)).toBe('1h 59m')
		expect(duration(0)).toBe('0h 00m')
		expect(duration(-100)).toBe('0h 00m')
		expect(clock(3661000)).toBe('01:01:01')
		expect(clock(0)).toBe('00:00:00')
	})

	it('maskNo：单号脱敏，短号原样', () => {
		expect(maskNo('3721000012345678')).toBe('3721****5678')
		expect(maskNo('1234')).toBe('1234')
		expect(maskNo('')).toBe('')
	})

	it('时间戳格式化与 toTs 往返', () => {
		const ts = toTs('2026-11-14', '15:20')
		expect(ts).toBeGreaterThan(0)
		expect(dayText(ts)).toBe('2026-11-14')
		expect(mdhmText(ts)).toBe('11-14 15:20')
		expect(hmText(ts)).toBe('15:20')
		expect(toTs('')).toBe(0)
	})
})

describe('mp-format · 提成与 KPI 口径', () => {
	it('tierOf：全额跳档，首席固定 12%', () => {
		expect(tierOf(0, 'L2')).toEqual(TIERS[0])
		expect(tierOf(59999, 'L2').r).toBe(0.05)
		expect(tierOf(60000, 'L2').r).toBe(0.08)
		expect(tierOf(100000, 'L2').r).toBe(0.1)
		expect(tierOf(1, '首席')).toEqual({ min: 0, r: 0.12 })
	})

	it('nextTierOf：下一档与封顶', () => {
		expect(nextTierOf(0, 'L2').min).toBe(60000)
		expect(nextTierOf(60000, 'L2').min).toBe(100000)
		expect(nextTierOf(200000, 'L2')).toBeNull()
		expect(nextTierOf(0, '首席')).toBeNull()
	})

	it('kpiCoef：分档系数', () => {
		expect(kpiCoef(90)).toBe(1.2)
		expect(kpiCoef(85)).toBe(1.0)
		expect(kpiCoef(75)).toBe(0.8)
		expect(kpiCoef(65)).toBe(0.6)
		expect(kpiCoef(59)).toBe(0.4)
	})

	it('KPI 权重合计 100', () => {
		expect(KPI_ITEMS.reduce((s, i) => s + i.weight, 0)).toBe(100)
	})
})

describe('mp-format · 交接红线与订单有效性', () => {
	it('handRatio：缺值返回 null', () => {
		expect(handRatio(30, 100)).toBe(0.3)
		expect(handRatio(0, 100)).toBeNull()
		expect(handRatio(30, 0)).toBeNull()
	})

	it('isHandRed：峰值 > 100 且留存 < 40% 才触红线', () => {
		expect(HAND_RULE).toEqual({ ratio: 0.4, peak: 100, pen: 200 })
		expect(isHandRed(30, 200)).toBe(true)   // 15% 留存
		expect(isHandRed(30, 100)).toBe(false)  // 峰值未超过 100
		expect(isHandRed(90, 200)).toBe(false)  // 45% 留存
	})

	it('orderValidity：取消不参与 / 退款无效 / 满期有效', () => {
		const now = 1800000000000
		expect(orderValidity({ status: '已取消' }, now)).toBe('不参与')
		expect(orderValidity({ status: '已收货', refund: true }, now)).toBe('无效')
		expect(orderValidity({ status: '已收货', payAt: now - 7 * DAY }, now)).toBe('有效')
		expect(orderValidity({ status: '已收货', payAt: now - 6 * DAY }, now)).toBe('待判定')
		expect(orderValidity({ status: '已完成', payAt: now - 15 * DAY }, now)).toBe('有效')
		expect(orderValidity({ status: '已完成', payAt: now - 14 * DAY }, now)).toBe('待判定')
	})
})

describe('mp-format · 标签色映射', () => {
	it('已知状态命中，未知状态降级 gray', () => {
		expect(tagType('直播中')).toBe('red')
		expect(tagType('待审核')).toBe('gold')
		expect(tagType('待核对')).toBe('gray') // 未收录口径，降级 gray
		expect(tagType('有效')).toBe('ok')
		expect(tagType('已发布')).toBe('ink')
		expect(tagType('已完成')).toBe('gray')
		expect(tagType('未知状态')).toBe('gray')
	})
})
