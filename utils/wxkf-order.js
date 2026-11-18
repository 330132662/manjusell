/**
 * 客服订单状态标记工具（由后台 wxkf.ts 迁移）
 *
 * 运营口径标记，与交易状态无关；后端存 value 字符串 code。
 * tone 映射到国风 gf-tag 色：gray→gray, orange→gold, blue→ink, green→ink, red→red
 */

export const KF_ORDER_STATUS_OPTIONS = [
	{ value: '', label: '订单状态', tone: 'gray' },
	{ value: 'pending', label: '待核对', tone: 'orange' },
	{ value: 'wait_pay', label: '待付款', tone: 'gray' },
	{ value: 'wait_ship', label: '待发货', tone: 'orange' },
	{ value: 'shipped', label: '已发货', tone: 'blue' },
	{ value: 'finished', label: '已完成', tone: 'green' },
	{ value: 'verified', label: '已核对', tone: 'green' },
	{ value: 'exception', label: '核对异常', tone: 'red' },
	{ value: 'refunded', label: '退款/取消', tone: 'gray' },
	{ value: 'no_order', label: '查无订单', tone: 'gray' }
]

// tone -> 国风 gf-tag 后缀
const TONE_TO_GF = {
	gray: 'gray',
	orange: 'gold',
	blue: 'ink',
	green: 'ink',
	red: 'red'
}

// tone -> 后台 arcoblue tag 色（保持与后台术语一致，供按需使用）
const TONE_TO_ARCO = {
	gray: 'gray',
	orange: 'orange',
	blue: 'arcoblue',
	green: 'green',
	red: 'red'
}

export function kfOrderStatusOption(value) {
	const code = String(value || '')
	return KF_ORDER_STATUS_OPTIONS.find((o) => o.value === code) || {
		value: code,
		label: code || '订单状态',
		tone: 'gray'
	}
}

export function kfOrderStatusLabel(value) {
	return kfOrderStatusOption(value).label
}

export function kfOrderStatusTone(value) {
	return kfOrderStatusOption(value).tone
}

export function kfOrderStatusTagColor(value) {
	return TONE_TO_ARCO[kfOrderStatusTone(value)]
}

export function kfOrderStatusGfClass(value) {
	return 'gf-tag-' + TONE_TO_GF[kfOrderStatusTone(value)]
}

export default {
	KF_ORDER_STATUS_OPTIONS,
	kfOrderStatusOption,
	kfOrderStatusLabel,
	kfOrderStatusTone,
	kfOrderStatusTagColor,
	kfOrderStatusGfClass
}
