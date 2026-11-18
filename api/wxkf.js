/**
 * 微信客服模块接口（uni 端）
 *
 * 由后台 dyvue/src/api/wxkf.ts 与 wxkfdash.ts 迁移而来。
 * 关键差异：后台 defHttp 会自动拼接 apiUrl(域名 + /admin)，
 * uni 端 BASE_URL 不含 /admin，故这里所有路径显式带 /admin 前缀。
 *
 * 请求头（动态 token + apiverify）由 utils/request.js 统一注入，
 * get/post 已解包 code===0 的 data；upload 同样返回 data。
 */
import { get, post, upload, BASE_URL } from '@/utils/request'

const P = '/admin/wxkf'

// ===================== 会话与消息 =====================

// 会话列表：一个客户(external_userid)一行，行内 sessions[] 标明各客服账号会话
export const getSessionList = () => get(`${P}/session/list`)

// 消息记录：scope='all' 按客户取全部账号消息
export const getSessionMessages = (params) => get(`${P}/session/messages`, params)

// 发送文本 → { msgid, sensitive_alert? }
export const sendSessionMessage = (params) => post(`${P}/session/send`, params)

// 发送文件/图片（服务端判定 image/video/file，含 2M/10M/20M 限制）
export const sendSessionFile = (filePath, formData) => upload(`${P}/session/sendFile`, filePath, formData)

// 发送图文链接
export const sendSessionLink = (params) => post(`${P}/session/sendLink`, params)

// 发送菜单消息
export const sendSessionMenu = (params) => post(`${P}/session/sendMenu`, params)

// 发送小程序消息（封面随表单上传）
export const sendSessionMiniprogram = (filePath, formData) =>
	upload(`${P}/session/sendMiniprogram`, filePath, formData, 'thumb')

// 发送地理位置
export const sendSessionLocation = (params) => post(`${P}/session/sendLocation`, params)

// 撤回消息（仅 2 分钟内可撤）
export const recallSessionMessage = (params) => post(`${P}/session/recall`, params)

// 转人工接入
export const takeoverSession = (params) => post(`${P}/session/takeover`, params)

// 标记已读 / 全部已读
export const readSession = (params) => post(`${P}/session/read`, params)
export const readAllSessions = () => post(`${P}/session/readAll`)

// 客户设置：自动回复 / 订单状态 / 备注
export const setAutoReply = (params) => post(`${P}/session/autoReply`, params)
export const setOrderStatus = (params) => post(`${P}/session/orderStatus`, params)
export const setCustomerRemark = (params) => post(`${P}/session/remark`, params)

// 手动全量同步 → { fetched }
export const manualSync = () => post(`${P}/session/manualSync`)

// 客户订单 → { items, total, finished_count, unconfirmed_count, matched_by, last_sync_time, ... }
export const getSessionOrders = (params) => get(`${P}/session/orders`, params)

// ===================== 接待人员 =====================

export const getServicerList = (params) => get(`${P}/servicer/list`, params)

// ===================== 快捷回复 =====================

export const getQuickReplyList = () => get(`${P}/quickReply/list`)
export const saveQuickReply = (params) => post(`${P}/quickReply/save`, params)
export const deleteQuickReply = (params) => post(`${P}/quickReply/delete`, params)

// ===================== 全局搜索 =====================

export const searchGlobal = (params) => get(`${P}/search/global`, params)

// ===================== 客户画像 =====================

export const getCustomerProfile = (params) => get(`${P}/customerProfile/get`, params)
export const analyzeCustomerProfile = (params) => post(`${P}/customerProfile/analyze`, params)

// ===================== 语音分析 / 媒体 =====================

// mode: asr(转文字) / intent(分析意愿) / reply(生成回复)
export const analyzeVoice = (params) => post(`${P}/voice/analyze`, params)

// 取媒体二进制：uni 端用 uni.request responseType 自行处理，这里仅暴露 URL
export const mediaGetUrl = (params) => {
	const qs = Object.keys(params || {})
		.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
		.join('&')
	return `${BASE_URL}${P}/media/get${qs ? '?' + qs : ''}`
}

// ===================== 知识库（注入客服问答） =====================

// 后台 /knowledge/save，uni 端补 /admin 前缀
export const saveKnowledge = (params) => post('/admin/knowledge/save', params)

// ===================== 数据看板 =====================

// 一次拿到概览 + 趋势 + 管理员回复排行 + 访客消息排行
// days: 7/30/90/3650（>90 视为全部时间）
export const getDashboardStat = (params) => get(`${P}/dashboard/stat`, params)

export default {
	getSessionList,
	getSessionMessages,
	sendSessionMessage,
	sendSessionFile,
	sendSessionLink,
	sendSessionMenu,
	sendSessionMiniprogram,
	sendSessionLocation,
	recallSessionMessage,
	takeoverSession,
	readSession,
	readAllSessions,
	setAutoReply,
	setOrderStatus,
	setCustomerRemark,
	manualSync,
	getSessionOrders,
	getServicerList,
	getQuickReplyList,
	saveQuickReply,
	deleteQuickReply,
	searchGlobal,
	getCustomerProfile,
	analyzeCustomerProfile,
	analyzeVoice,
	mediaGetUrl,
	saveKnowledge,
	getDashboardStat
}
