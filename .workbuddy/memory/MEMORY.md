# 项目长期约定

## 去AI味规则（diskreleax 技能）
- 用户说"去AI味"时,必须应用 `~/.workbuddy/skills/diskreleax/skill.md` 的规则。
- 标识符命名混淆:规范前缀 + 4~8 位随机后缀(≥1 大写 + 1 小写 + 1 数字,无连续重复/键盘顺序)。
- 前端禁止 AI 味:机械对称布局、紫渐变+毛玻璃、统一命名风格、英文模板注释、过分规整的 4/8 倍数间距。
- 该技能未在会话可用列表注册(Skill 工具会报 not found,文件名是 skill.md 小写且带 git 仓库),调用前需手动读该 skill.md,或先让用户在 UI 技能面板启用/信任它。

## sddy（鼎耀系统用户端 / uni-app Vue3）约定
- 网络层：`utils/request.js` 封装 uni.request，约定后端统一返回 `{code:0,data,...}`，失败弹 toast；token 存 storage 由封装自动注入 Authorization 头。
- 接口层：`api/index.js` 暴露 wechatLogin(code) / getOrderList()；`utils/config.js` 的 USE_MOCK=true 时返回假数据便于无后端预览，接真实后端改 BASE_URL 并置 false。
- 微信登录：mp-weixin 用 uni.login({provider:'weixin'}) 取 code；H5/App 需微信网页授权 OAuth 重定向取 code。
