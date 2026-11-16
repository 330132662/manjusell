<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">换班邀请</text>
				<text class="gf-subtitle">24 小时内处理，逾期自动失效</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<block v-if="inv">
					<view class="gf-card inv-head">
						<view class="inv-av">{{ inv.fromName ? inv.fromName.slice(-1) : '班' }}</view>
						<view class="inv-main">
							<text class="inv-t">{{ inv.fromName }} 想和你换班</text>
							<text class="inv-d">{{ mdhm(inv.at) }} 发起 · 剩余 {{ leftText }}</text>
						</view>
					</view>

					<view class="gf-card">
						<view class="swap-row">
							<view class="swap-cell">
								<text class="swap-k">我的场次（换出）</text>
								<text class="swap-t">{{ inv.mineText }}</text>
							</view>
							<view class="swap-arrow">⇄</view>
							<view class="swap-cell">
								<text class="swap-k">{{ inv.fromName }} 的场次（换入）</text>
								<text class="swap-t">{{ inv.theirsText }}</text>
							</view>
						</view>
					</view>

					<view class="gf-card">
						<view class="gf-card-title"><text>换班原因</text></view>
						<text class="rs-text">{{ inv.reason || '未填写' }}</text>
					</view>

					<view class="gf-notice ink">
						<text class="gf-notice-main">
							同意后需运营复核双方工时与房间账号，审批通过才生效；换班不改变当月工时上限。
						</text>
					</view>
				</block>

				<view v-else class="gf-state">
					<text class="gf-state-ico">班</text>
					<text class="gf-state-text">暂无待处理的换班邀请</text>
					<view class="gf-btn gf-btn-ghost gf-btn-sm back-btn" @click="goBack">返回排班</view>
				</view>
			</view>
		</scroll-view>

		<view v-if="inv" class="gf-foot">
			<view class="gf-btn gf-btn-ghost" @click="openReject">拒绝</view>
			<view class="gf-btn gf-btn-primary" @click="agree">同意换班</view>
		</view>

		<!-- 拒绝原因 -->
		<view v-if="rejectShow" class="gf-mask" @click="rejectShow = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd">
					拒绝换班
					<text class="gf-sheet-x" @click="rejectShow = false">✕</text>
				</view>
				<view class="gf-sheet-bd">
					<view class="gf-field">
						<text class="gf-label"><text class="gf-req">*</text>拒绝原因</text>
						<textarea class="gf-textarea" v-model="rejectReason" placeholder="如：当天已有其他安排" :maxlength="200" />
					</view>
				</view>
				<view class="gf-sheet-ft">
					<view class="gf-btn gf-btn-ghost" @click="rejectShow = false">取消</view>
					<view class="gf-btn gf-btn-danger" @click="reject">确认拒绝</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getSwapInvite, replySwapInvite } from '@/api/mp'
	import { mdhmText, clock } from '@/utils/mp-format'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				inv: null,
				left: 0,
				rejectShow: false,
				rejectReason: '',
				timer: null
			}
		},
		computed: {
			leftText() {
				return this.left > 0 ? clock(this.left) : '已超时'
			}
		},
		onLoad() {
			this.load()
		},
		onShow() {
			this.startTimer()
		},
		onHide() {
			this.stopTimer()
		},
		onUnload() {
			this.stopTimer()
		},
		methods: {
			mdhm(ts) {
				return mdhmText(ts)
			},
			async load() {
				this.inv = await getSwapInvite()
				this.tick()
			},
			startTimer() {
				this.stopTimer()
				this.timer = setInterval(() => this.tick(), 1000)
			},
			stopTimer() {
				if (this.timer) clearInterval(this.timer)
				this.timer = null
			},
			tick() {
				if (!this.inv) {
					this.left = 0
					return
				}
				this.left = Math.max(0, this.inv.at + 86400000 - Date.now())
			},
			agree() {
				uni.showModal({
					title: '同意换班',
					content: '同意后提交运营复核，审批通过即互换排班。',
					success: async (r) => {
						if (!r.confirm) return
						await replySwapInvite(true, '')
						uni.showToast({ title: '已同意，待审批', icon: 'success' })
						setTimeout(() => uni.reLaunch({ url: '/pages/my-schedule/index' }), 600)
					}
				})
			},
			openReject() {
				this.rejectReason = ''
				this.rejectShow = true
			},
			async reject() {
				if (!String(this.rejectReason || '').trim()) {
					uni.showToast({ title: '请填写拒绝原因', icon: 'none' })
					return
				}
				await replySwapInvite(false, this.rejectReason)
				this.rejectShow = false
				uni.showToast({ title: '已拒绝', icon: 'success' })
				setTimeout(() => uni.reLaunch({ url: '/pages/my-schedule/index' }), 600)
			},
			goBack() {
				goBack('/pages/my-schedule/index')
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

	.inv-head {
		display: flex;
		align-items: center;
		gap: 18rpx;
	}

	.inv-av {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 38rpx;
		font-weight: 700;
		color: #fdf6e6;
		background: linear-gradient(135deg, #3a4a52 0%, #2a363c 100%);
		border: 1rpx solid rgba(201, 162, 75, 0.5);
		flex-shrink: 0;
	}

	.inv-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.inv-t {
		font-size: 28rpx;
		font-weight: 700;
		color: $gf-ink;
	}

	.inv-d {
		font-size: 21rpx;
		color: $gf-ink-3;
	}

	.swap-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.swap-cell {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		padding: 16rpx;
		border-radius: 12rpx;
		background: rgba(201, 162, 75, 0.07);
		border: 1rpx solid rgba(201, 162, 75, 0.22);
	}

	.swap-k {
		font-size: 19rpx;
		color: $gf-ink-3;
	}

	.swap-t {
		font-size: 23rpx;
		color: $gf-ink;
		font-weight: 600;
		line-height: 1.5;
	}

	.swap-arrow {
		font-size: 30rpx;
		color: $gf-cinnabar;
		flex-shrink: 0;
	}

	.rs-text {
		display: block;
		font-size: 25rpx;
		color: $gf-ink-2;
		line-height: 1.7;
	}

	.back-btn {
		margin-top: 24rpx;
		width: 240rpx;
	}
</style>
