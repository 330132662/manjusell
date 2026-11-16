<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">上播校验</text>
				<text class="gf-subtitle">人 · 场 · 地 · 时 + 三重锁 + 授权</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<!-- 房间卡 -->
				<view class="gf-card room-card">
					<view class="room-ico">{{ room.no || '—' }}</view>
					<view class="room-main">
						<text class="room-no">{{ room.name || '直播间' }}</text>
						<text class="room-sub">{{ room.accName || '未绑定视频号' }}</text>
					</view>
					<text class="gf-tag" :class="result.ok ? 'gf-tag-ink' : 'gf-tag-red'">{{ result.ok ? '校验通过' : '未通过' }}</text>
				</view>

				<view v-if="loading" class="gf-state">
					<text class="gf-state-text">校验中…</text>
				</view>

				<!-- 校验项 -->
				<view v-else class="gf-card">
					<view v-for="c in result.checks" :key="c.key" class="gf-check">
						<view class="gf-check-ico" :class="!c.ok ? 'no' : c.warn ? 'wt' : ''">
							{{ !c.ok ? '✕' : c.warn ? '!' : '✓' }}
						</view>
						<view class="gf-check-main">
							<text class="gf-check-t">{{ c.title }}</text>
							<text class="gf-check-d" :class="{ err: !c.ok, warn: c.warn }">{{ c.desc }}</text>

							<!-- 缺授权码 -->
							<view v-if="c.fix === 'auth'" class="gf-check-fix">
								<view class="gf-btn gf-btn-ghost gf-btn-sm" @click="openAuth">输入授权码</view>
								<view class="gf-btn gf-btn-ghost gf-btn-sm" @click="callOps">联系运营</view>
							</view>

							<!-- 未签肖像授权 -->
							<view v-if="c.fix === 'sign'" class="gf-check-fix">
								<view class="gf-btn gf-btn-ghost gf-btn-sm" @click="go('/pages/anchor-rules/index')">去签署</view>
							</view>

							<!-- 上一场未下播 -->
							<view v-if="c.fix === 'hand'" class="gf-check-fix">
								<view class="gf-btn gf-btn-ghost gf-btn-sm" @click="notifyOther">通知对方下播</view>
								<view class="gf-btn gf-btn-ghost gf-btn-sm" @click="callOps">请运营结束</view>
							</view>
						</view>
					</view>
				</view>

				<view class="gf-notice ink">
					<text class="gf-notice-main">归属以真实扫码为准：开播后该视频号的订单按支付时间实时归属到你的场次。</text>
				</view>
			</view>
		</scroll-view>

		<view class="gf-foot">
			<template v-if="result.ok">
				<view class="gf-btn gf-btn-primary" @click="next">下一步：合规自查</view>
			</template>
			<template v-else>
				<view class="gf-btn gf-btn-ghost" @click="rescan">重新扫码</view>
				<view class="gf-btn gf-btn-primary disabled">校验未通过</view>
			</template>
		</view>

		<!-- 授权码弹层 -->
		<view v-if="auth.show" class="gf-mask" @click="auth.show = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd">
					输入运营授权码
					<text class="gf-sheet-x" @click="auth.show = false">×</text>
				</view>
				<view class="gf-sheet-bd">
					<text class="gf-hint">6 位数字，由运营在 PC「直播看板 → 生成授权码」发放，30 分钟内一次性有效。</text>
					<input class="gf-input auth-input" v-model="auth.code" type="number" :maxlength="6" placeholder="······" />
					<text class="gf-hint demo-hint">演示环境可使用 888888</text>
				</view>
				<view class="gf-sheet-ft">
					<view class="gf-btn gf-btn-ghost" @click="auth.show = false">取消</view>
					<view class="gf-btn gf-btn-primary" @click="submitAuth">验证</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { verifyStart, notifyOccupying } from '@/api/mp'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				roomId: '',
				room: {},
				loading: true,
				result: { ok: false, checks: [] },
				auth: { show: false, code: '' }
			}
		},
		onLoad(q) {
			this.roomId = (q && q.roomId) || ''
			this.load()
		},
		onShow() {
			if (!this.loading) this.load()
		},
		methods: {
			async load(code) {
				this.loading = true
				try {
					const r = await verifyStart({ roomId: this.roomId, code: code || this.auth.code })
					this.result = r
					this.room = r.room
				} catch (e) {
					uni.showToast({ title: e.message || '校验失败', icon: 'none' })
				} finally {
					this.loading = false
				}
			},
			openAuth() {
				this.auth = { show: true, code: '' }
			},
			async submitAuth() {
				const code = String(this.auth.code || '').trim()
				if (code.length !== 6) {
					uni.showToast({ title: '请输入 6 位授权码', icon: 'none' })
					return
				}
				await this.load(code)
				this.auth.show = false
				if (this.result.ok) uni.showToast({ title: '校验通过', icon: 'success' })
				else uni.showToast({ title: '授权码无效或已过期', icon: 'none' })
			},
			async notifyOther() {
				const ok = await notifyOccupying()
				if (ok) {
					uni.showToast({ title: '已通知对方下播', icon: 'none' })
					setTimeout(() => this.load(), 800)
				}
			},
			callOps() {
				uni.showToast({ title: '正在呼叫 运营', icon: 'none' })
			},
			next() {
				if (!this.result.ok) return
				uni.navigateTo({
					url: '/pages/anchor-compliance/index?roomId=' + encodeURIComponent(this.roomId)
				})
			},
			rescan() {
				uni.redirectTo({ url: '/pages/anchor-scan/index?roomId=' + this.roomId })
			},
			go(url) {
				uni.navigateTo({ url })
			},
			goBack() {
				goBack('/pages/anchor-home/index')
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '../../styles/guofeng-vars.scss';
.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.topbar-holder {
		width: 64rpx;
	}

	.room-card {
		display: flex;
		align-items: center;
		gap: 18rpx;
	}

	.room-ico {
		width: 86rpx;
		height: 86rpx;
		border-radius: 14rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 26rpx;
		font-weight: 700;
		color: #8a6a1f;
		background: rgba(201, 162, 75, 0.14);
		border: 1rpx solid rgba(201, 162, 75, 0.36);
		flex-shrink: 0;
	}

	.room-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.room-no {
		font-size: 30rpx;
		font-weight: 700;
		color: $gf-ink;
	}

	.room-sub {
		font-size: 21rpx;
		color: $gf-ink-3;
	}

	.auth-input {
		margin: 24rpx 0 12rpx;
		height: 110rpx;
		font-size: 44rpx;
		letter-spacing: 16rpx;
		text-align: center;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	}

	.demo-hint {
		display: block;
		text-align: center;
		color: #8a6a1f;
	}
</style>
