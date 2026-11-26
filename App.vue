<script>
	import { guardCurrentPage } from '@/utils/auth'

	export default {
		onLaunch: function() {
			console.log('鼎耀服务平台启动成功')
			// 冷启动兜底：未登录直达需登录页时跳未登录页
			guardCurrentPage()
			this.setupUpdateManager()
		},
		onShow: function() {
			console.log('应用显示')
			// 后台切回 / H5 刷新兜底
			guardCurrentPage()
		},
		onHide: function() {
			console.log('应用隐藏')
		},
		methods: {
			/** 微信小程序版本更新：新包下载完成后弹窗询问重启，立即用上新版 */
			setupUpdateManager() {
				// #ifdef MP-WEIXIN
				const um = uni.getUpdateManager()
				um.onUpdateReady(() => {
					uni.showModal({
						title: '更新提示',
						content: '新版本已经准备好，是否重启应用？',
						success: (res) => {
							if (res.confirm) um.applyUpdate()
						}
					})
				})
				um.onUpdateFailed(() => {
					uni.showModal({
						title: '更新提示',
						content: '新版本下载失败，请删除当前小程序后重新搜索打开',
						showCancel: false
					})
				})
				// #endif
			}
		}
	}
</script>

<style lang="scss">
	@import '@/uni.scss';
	/* 国风视觉系统改为全局单份引入：避免每个页面 scoped style 重复编译导致主包膨胀 */
	@import '@/styles/guofeng.scss';
	
	/* 全局基础样式 */
	page {
		background-color: $color-bg-surface;
		font-family: $font-body;
		font-size: $text-base;
		color: $color-text-primary;
		line-height: $leading-normal;
	}
	
	/* 禁用原生导航栏(使用自定义导航) */
	uni-page-head {
		display: none;
	}

	/* 小程序自定义导航：顶部交互区统一置于胶囊下方。
	 * 根节点由 main.js 的全局 mixin 注入 --gf-capsule-safe（胶囊底部 + 8px）。 */
	/* #ifdef MP-WEIXIN */
	.gf-hero,
	.gf-topbar,
	.topbar,
	.navbar,
	.nav-bar,
	.top-nav-mobile,
	.live-head,
	.scan-head,
	.daohang_barQ3kR2,
	.hero-section,
	.page > .hero {
		padding-top: var(--gf-capsule-safe, calc(52px + env(safe-area-inset-top))) !important;
	}
	/* #endif */
	
	/* 全局容器 */
	.container {
		padding: $spacing-lg;
	}
	
	/* 渐变文字全局样式 */
	.gradient-text {
		background: $gradient-primary;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	/* 玻璃态卡片全局样式 */
	.glass-card {
		background: $glass-bg;
		backdrop-filter: blur($glass-blur);
		-webkit-backdrop-filter: blur($glass-blur);
		border: 1px solid $glass-border;
		border-radius: $radius-lg;
	}
	
	/* 悬浮光晕效果 */
	.glow-hover {
		transition: box-shadow 0.3s ease, transform 0.3s ease;
		&:active {
			box-shadow: $glow-primary;
			transform: translateY(-2px);
		}
	}
	
	/* 主按钮样式 */
	.btn-primary {
		background: $gradient-primary;
		color: #FFFFFF;
		border-radius: $radius-md;
		padding: $spacing-md $spacing-xl;
		font-weight: 600;
		font-size: $text-base;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.15s ease, transform 0.15s ease;
		&:active {
			opacity: 0.9;
			transform: translateY(-1px);
		}
	}
	
	/* 次按钮样式 */
	.btn-secondary {
		border: 1px solid $color-border;
		color: $color-text-secondary;
		background: transparent;
		border-radius: $radius-md;
		padding: $spacing-md $spacing-xl;
		font-weight: 500;
		font-size: $text-base;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.15s ease, border-color 0.15s ease;
		&:active {
			color: $color-text-primary;
			border-color: $color-primary;
		}
	}
	
	/* Badge徽章 */
	.badge {
		display: inline-flex;
		align-items: center;
		padding: $spacing-xs $spacing-sm;
		border-radius: $radius-full;
		font-size: $text-xs;
		font-weight: 600;
		background: $gradient-accent;
		color: $color-primary;
	}
	
	/* 隐藏滚动条 */
	.no-scrollbar::-webkit-scrollbar {
		display: none;
		width: 0;
		height: 0;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	
	/* 文字截断 */
	.text-truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	/* 多行截断 */
	.text-clamp-2 {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
</style>
