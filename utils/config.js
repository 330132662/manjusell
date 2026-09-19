// 全局配置
// TODO: 替换为你的真实后端域名（微信小程序需在后台配置 request 合法域名）  https://wwwapi.dingyaoai.com http://localhost:8600
export const BASE_URL = 'http://localhost:8600'

// 后端未就绪时设为 true，接口直接返回本地假数据，方便先看 UI；
// 接入真实后端后改为 false 即可走真实网络请求。
export const USE_MOCK = true

// 主播模块(直播间/办公室下拉、开播签到、下播签退、主播登录)单独开关：
// 后台已在 localhost:8600 跑起来时置为 false，让这几个接口走真实后端。
export const USE_LIVE_API_MOCK = false

// ===== 后端接口对称加密验证(与 backend_web 的 .env / 后端 app.yaml 一致) =====
// 接口对称解密验证密钥（app.apisecret / VITE_ENCRYPT）
export const API_SECRET = 'gofly@888'
// 动态 token 的 AES-CBC 密钥与偏移量（后端 cryptojs/cryptojs.go 与 web CryptoJS.ts 一致）
export const AES_KEY = 'eI2lI3zL0qD0hY7m'
export const AES_IV = '6289984834922396'
