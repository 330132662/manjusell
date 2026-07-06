<script>
	export default {
		onLaunch: function() {
			console.log('AI短剧学院启动成功')
		},
		onShow: function() {
			console.log('应用显示')
		},
		onHide: function() {
			console.log('应用隐藏')
		}
	}
</script>

<style lang="scss">
	@import '@/uni.scss';
	
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
