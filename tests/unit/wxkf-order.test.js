/**
 * wxkf-order.js 单测 —— 客服订单状态标记（后台口径迁移）
 */
import { describe, it, expect } from 'vitest'
import {
	KF_ORDER_STATUS_OPTIONS, kfOrderStatusOption, kfOrderStatusLabel,
	kfOrderStatusTone, kfOrderStatusTagColor, kfOrderStatusGfClass
} from '../utils/wxkf-order.js'

describe('wxkf-order · 状态选项表', () => {
	it('枚举完整且 value 唯一（含空值占位项）', () => {
		expect(KF_ORDER_STATUS_OPTIONS).toHaveLength(10)
		const values = KF_ORDER_STATUS_OPTIONS.map((o) => o.value)
		expect(new Set(values).size).toBe(values.length)
		expect(values[0]).toBe('')
		expect(values).toContain('pending')
		expect(values).toContain('refunded')
	})

	it('每项均有 label 与 tone，tone 在已知色板内', () => {
		const tones = ['gray', 'orange', 'blue', 'green', 'red']
		KF_ORDER_STATUS_OPTIONS.forEach((o) => {
			expect(o.label).toBeTruthy()
			expect(tones).toContain(o.tone)
		})
	})

	it('关键状态 label 与后台口径一致', () => {
		expect(kfOrderStatusLabel('pending')).toBe('待核对')
		expect(kfOrderStatusLabel('wait_pay')).toBe('待付款')
		expect(kfOrderStatusLabel('shipped')).toBe('已发货')
		expect(kfOrderStatusLabel('verified')).toBe('已核对')
		expect(kfOrderStatusLabel('exception')).toBe('核对异常')
		expect(kfOrderStatusLabel('no_order')).toBe('查无订单')
	})
})

describe('wxkf-order · 未知值与空值兜底', () => {
	it('空值返回占位项 label', () => {
		expect(kfOrderStatusLabel('')).toBe('订单状态')
		expect(kfOrderStatusLabel(null)).toBe('订单状态')
		expect(kfOrderStatusLabel(undefined)).toBe('订单状态')
	})

	it('未知 code 原样回显 label，不丢失信息，tone 降级 gray', () => {
		const opt = kfOrderStatusOption('weird_status')
		expect(opt).toEqual({ value: 'weird_status', label: 'weird_status', tone: 'gray' })
		expect(kfOrderStatusTone('weird_status')).toBe('gray')
		expect(kfOrderStatusGfClass('weird_status')).toBe('gf-tag-gray')
	})

	it('数字入参按字符串处理；0 走空值兜底', () => {
		// 实现用 String(value || '')，数字 0 会被当作空值（状态 code 实际为字符串，不影响业务）
		expect(kfOrderStatusOption(0).value).toBe('')
		expect(kfOrderStatusOption(2).value).toBe('2')
		expect(kfOrderStatusLabel('0')).toBe('0')
	})
})

describe('wxkf-order · 色板映射', () => {
	it('tone → 国风 gf-tag class', () => {
		expect(kfOrderStatusGfClass('')).toBe('gf-tag-gray')
		expect(kfOrderStatusGfClass('pending')).toBe('gf-tag-gold')
		expect(kfOrderStatusGfClass('shipped')).toBe('gf-tag-ink')
		expect(kfOrderStatusGfClass('finished')).toBe('gf-tag-ink')
		expect(kfOrderStatusGfClass('exception')).toBe('gf-tag-red')
	})

	it('tone → 后台 arco 色（保持术语一致，供按需使用）', () => {
		expect(kfOrderStatusTagColor('shipped')).toBe('arcoblue')
		expect(kfOrderStatusTagColor('pending')).toBe('orange')
		expect(kfOrderStatusTagColor('exception')).toBe('red')
		expect(kfOrderStatusTagColor('refunded')).toBe('gray')
	})

	it('所有枚举项的 gf class 均可生成', () => {
		KF_ORDER_STATUS_OPTIONS.forEach((o) => {
			expect(kfOrderStatusGfClass(o.value)).toMatch(/^gf-tag-(gray|gold|ink|red)$/)
		})
	})
})
