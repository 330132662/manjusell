// 全局配置
// TODO: 替换为你的真实后端域名（微信小程序需在后台配置 request 合法域名）  https://wwwapi.dingyaoai.com http://localhost:8600
export const BASE_URL = 'https://wwwapi.dingyaoai.com'
// export const BASE_URL = 'http://localhost:8600'
// 后端未就绪时设为 true，接口直接返回本地假数据，方便先看 UI；
// 接入真实后端后改为 false 即可走真实网络请求。
export const USE_MOCK = false

// 主播模块(直播间/办公室下拉、开播签到、下播签退、主播登录)单独开关：
// 后台已在 localhost:8600 跑起来时置为 false，让这几个接口走真实后端。
export const USE_LIVE_API_MOCK = false

// 主播工作台 M0–M9：业绩 / 工资 / 违规 / OKR / 制度签收等模块后端尚未提供接口，
// 置 true 时读本地演示数据（含排班、场次、订单），便于真机联调界面与跳转。
// 后端对应接口就绪后置 false，页面无需改动。
export const USE_MP_DEMO = true

// ===== 后端接口对称加密验证(与 backend_web 的 .env / 后端 app.yaml 一致) =====
// 接口对称解密验证密钥（app.apisecret / VITE_ENCRYPT）
export const API_SECRET = 'gofly@888'
// 动态 token 的 AES-CBC 密钥与偏移量（后端 cryptojs/cryptojs.go 与 web CryptoJS.ts 一致）
export const AES_KEY = 'eI2lI3zL0qD0hY7m'
export const AES_IV = '6289984834922396'

// ===== 未登录页底部视频播放器（COS 视频） =====
// 填入腾讯云 COS 的视频文件地址（需为 https，且小程序端需把该域名加入 downloadFile 合法域名）
// 留空时页面显示「视频地址未配置」占位，填好后自动渲染播放器
export const COS_VIDEO_URL = 'https://dywww-1258673263.cos.ap-guangzhou.myqcloud.com/uploads/20260903/4d24f6cb5c13fc2877b76e8c653927f6.mp4'
// 可选：视频封面图地址（COS 图片），留空则不显示封面
export const COS_VIDEO_POSTER = '鼎耀AI'
// 视频标题（显示在播放器卡片顶部）
export const COS_VIDEO_TITLE = '鼎耀AI'
