<template>
	<view class="page gf-page">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">合规自查</text>
				<text class="gf-subtitle">逐项确认后才能开播</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<view class="gf-notice">
					<text class="gf-notice-main">违规按四级处罚，并连带师傅（二级 20% / 三级 50% / 四级 100%）。</text>
				</view>

				<view class="gf-card">
					<view
						v-for="(t, i) in items"
						:key="i"
						class="ck-row"
						:class="{ on: checked.includes(i) }"
						@click="toggle(i)"
					>
						<view class="ck-box">{{ checked.includes(i) ? '✓' : '' }}</view>
						<text class="ck-text">{{ t }}</text>
					</view>
				</view>

				<view class="ck-all" @click="checkAll">
					<text>{{ checked.length === items.length ? '取消全选' : '全部勾选' }}</text>
					<text class="gf-hint">已确认 {{ checked.length }}/{{ items.length }}</text>
				</view>
			</view>
		</scroll-view>

		<view class="gf-foot">
			<view class="gf-btn gf-btn-primary" :class="{ disabled: !all || submitting }" @click="start">
				{{ submitting ? '开播中…' : '开始上播' }}
			</view>
		</view>
	</view>
</template>

<script>
	import { startLive } from '@/api/mp'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				roomId: '',
				checked: [],
				submitting: false,
				items: [
					'背景无二维码 / 微信号 / 收款码',
					'手牌无联系方式',
					'伴侣窗口无导流信息',
					'商品话术合规，无绝对化用语',
					'着装仪容符合要求',
					'网络正常（测速 ≥ 10Mbps）',
					'开启防碰瓷录屏存档'
				]
			}
		},
		computed: {
			all() {
				return this.checked.length === this.items.length
			}
		},
		onLoad(q) {
			this.roomId = (q && q.roomId) || ''
		},
		methods: {
			toggle(i) {
				const k = this.checked.indexOf(i)
				if (k >= 0) this.checked.splice(k, 1)
				else this.checked.push(i)
			},
			checkAll() {
				this.checked = this.checked.length === this.items.length ? [] : this.items.map((_, i) => i)
			},
			async start() {
				if (!this.all || this.submitting) return
				this.submitting = true
				try {
					await startLive({ roomId: this.roomId })
					uni.showToast({ title: '开播成功', icon: 'success' })
					setTimeout(() => {
						uni.reLaunch({ url: '/pages/anchor-live/index' })
					}, 500)
				} catch (e) {
					uni.showToast({ title: e.message || '开播失败', icon: 'none' })
				} finally {
					this.submitting = false
				}
			},
			goBack() {
				goBack('/pages/anchor-home/index')
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '../../styles/guofeng.scss';

	.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.topbar-holder {
		width: 64rpx;
	}

	.ck-row {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
		padding: 20rpx 0;
		border-bottom: 1rpx solid $gf-line-soft;
	}

	.ck-row:last-child {
		border-bottom: 0;
	}

	.ck-box {
		width: 40rpx;
		height: 40rpx;
		line-height: 36rpx;
		text-align: center;
		border-radius: 6rpx;
		border: 2rpx solid rgba(140, 130, 116, 0.45);
		color: #fdf6e6;
		font-size: 24rpx;
		font-weight: 700;
		flex-shrink: 0;
		margin-top: 2rpx;
	}

	.ck-row.on .ck-box {
		background: $gf-cinnabar;
		border-color: $gf-cinnabar;
	}

	.ck-text {
		flex: 1;
		font-size: 25rpx;
		color: $gf-ink;
		line-height: 1.55;
	}

	.ck-row.on .ck-text {
		color: $gf-ink-2;
	}

	.ck-all {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 6rpx;
		font-size: 24rpx;
		color: $gf-cinnabar;
	}
</style>
