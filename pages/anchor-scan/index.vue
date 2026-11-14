<template>
	<view class="scan-page">
		<!-- ===== 顶栏 ===== -->
		<view class="scan-head">
			<view class="scan-back" @click="goBack">×</view>
			<text class="scan-title">扫码上播</text>
			<view class="scan-holder"></view>
		</view>

		<!-- ===== 取景框 ===== -->
		<view class="scan-box">
			<i class="c1"></i>
			<i class="c2"></i>
			<i class="c3"></i>
			<i class="c4"></i>
			<view class="scan-line"></view>
		</view>

		<text class="scan-tip">将房间门口 / 机位旁的专属二维码放入框内</text>
		<text class="scan-tip sub">识别后自动进入上播校验（四维 + 三重锁）</text>
		<text class="scan-alt" @click="goCheckin">直连后端签到（旧版）›</text>

		<!-- ===== 底部操作 ===== -->
		<view class="scan-acts">
			<view class="scan-act" @click="doScan">
				<view class="scan-act-ico">扫</view>
				<text class="scan-act-t">扫一扫</text>
			</view>
			<view class="scan-act" @click="openCode">
				<view class="scan-act-ico">码</view>
				<text class="scan-act-t">输入门牌码</text>
			</view>
			<view class="scan-act" @click="light = !light">
				<view class="scan-act-ico" :class="{ on: light }">灯</view>
				<text class="scan-act-t">{{ light ? '关灯' : '开灯' }}</text>
			</view>
		</view>

		<!-- ===== 门牌码弹层 ===== -->
		<view v-if="showCode" class="gf-mask" @click="showCode = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd">
					输入门牌码
					<text class="gf-sheet-x" @click="showCode = false">×</text>
				</view>
				<view class="gf-sheet-bd">
					<text class="gf-hint">门牌码印在二维码下方，也可直接选择直播间</text>
					<view class="gf-chips code-chips">
						<view v-for="r in rooms" :key="r.id" class="gf-chip" @click="pickRoom(r)">{{ r.no }}</view>
					</view>
					<view v-if="!rooms.length" class="gf-state small">
						<text class="gf-state-text">暂无可用直播间</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getScanRooms } from '@/api/mp'
	import { goBack } from '@/utils/nav'
	import { USE_MP_DEMO } from '@/utils/config'

	export default {
		data() {
			return {
				roomId: '',
				rooms: [],
				showCode: false,
				light: false,
				timer: null
			}
		},
		onLoad(q) {
			this.roomId = (q && q.roomId) || ''
			this.loadRooms()
			// 演示模式：2.2 秒后模拟识别成功，直接进入校验（与原型一致）
			if (USE_MP_DEMO) {
				this.timer = setTimeout(() => {
					if (this.roomId) this.toVerify(this.roomId)
				}, 2200)
			}
		},
		onUnload() {
			if (this.timer) clearTimeout(this.timer)
		},
		methods: {
			async loadRooms() {
				try {
					this.rooms = await getScanRooms()
					if (!this.roomId && this.rooms.length) this.roomId = this.rooms[0].id
				} catch (e) {
					this.rooms = []
				}
			},
			openCode() {
				if (this.timer) clearTimeout(this.timer)
				this.showCode = true
			},
			pickRoom(r) {
				this.showCode = false
				this.toVerify(r.id)
			},
			doScan() {
				if (this.timer) clearTimeout(this.timer)
				// #ifdef MP-WEIXIN || APP-PLUS
				uni.scanCode({
					onlyFromCamera: true,
					success: (res) => {
						const code = String(res.result || '')
						const hit = this.rooms.find((r) => code.indexOf(String(r.no)) >= 0)
						this.toVerify(hit ? hit.id : this.roomId)
					},
					fail: () => {
						uni.showToast({ title: '未识别到房间码', icon: 'none' })
					}
				})
				// #endif
				// #ifdef H5
				uni.showToast({ title: 'H5 暂不支持相机扫码，请选择门牌码', icon: 'none' })
				this.showCode = true
				// #endif
			},
			toVerify(roomId) {
				if (!roomId) {
					uni.showToast({ title: '请先选择直播间', icon: 'none' })
					this.showCode = true
					return
				}
				uni.redirectTo({ url: '/pages/anchor-verify/index?roomId=' + roomId })
			},
			goBack() {
				goBack('/pages/anchor-home/index')
			},
			/** 旧版签到页（直连 liveCheckIn）保留为联调兜底 */
			goCheckin() {
				if (this.timer) clearTimeout(this.timer)
				uni.navigateTo({ url: '/pages/anchor-checkin/index' })
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '../../styles/guofeng.scss';

	.scan-page {
		position: relative;
		min-height: 100vh;
		background: #0d0f0e;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.scan-head {
		display: flex;
		align-items: center;
		padding: 22rpx 28rpx;
		padding-top: calc(22rpx + env(safe-area-inset-top));
		color: #fdf6e6;
		flex-shrink: 0;
	}

	.scan-back {
		width: 64rpx;
		height: 64rpx;
		line-height: 58rpx;
		text-align: center;
		border-radius: 50%;
		font-size: 36rpx;
		background: rgba(253, 246, 230, 0.1);
	}

	.scan-title {
		flex: 1;
		text-align: center;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 34rpx;
		letter-spacing: 4rpx;
	}

	.scan-holder {
		width: 64rpx;
	}

	.scan-box {
		position: relative;
		width: 500rpx;
		height: 500rpx;
		margin: 150rpx auto 0;
		border-radius: 20rpx;
		background: rgba(255, 255, 255, 0.03);
	}

	.scan-box i {
		position: absolute;
		width: 60rpx;
		height: 60rpx;
		border: 6rpx solid #c9a24b;
	}

	.scan-box .c1 {
		left: 0;
		top: 0;
		border-right: 0;
		border-bottom: 0;
		border-radius: 20rpx 0 0 0;
	}

	.scan-box .c2 {
		right: 0;
		top: 0;
		border-left: 0;
		border-bottom: 0;
		border-radius: 0 20rpx 0 0;
	}

	.scan-box .c3 {
		left: 0;
		bottom: 0;
		border-right: 0;
		border-top: 0;
		border-radius: 0 0 0 20rpx;
	}

	.scan-box .c4 {
		right: 0;
		bottom: 0;
		border-left: 0;
		border-top: 0;
		border-radius: 0 0 20rpx 0;
	}

	.scan-line {
		position: absolute;
		left: 24rpx;
		right: 24rpx;
		height: 3rpx;
		background: linear-gradient(90deg, rgba(201, 162, 75, 0), #e8c77a, rgba(201, 162, 75, 0));
		box-shadow: 0 0 16rpx rgba(232, 199, 122, 0.8);
		animation: scanmove 2s ease-in-out infinite;
	}

	@keyframes scanmove {
		0% {
			top: 30rpx;
		}
		50% {
			top: 460rpx;
		}
		100% {
			top: 30rpx;
		}
	}

	.scan-tip {
		display: block;
		text-align: center;
		margin-top: 40rpx;
		font-size: 26rpx;
		color: rgba(253, 246, 230, 0.78);
	}

	.scan-tip.sub {
		margin-top: 10rpx;
		font-size: 21rpx;
		color: rgba(253, 246, 230, 0.42);
	}

	.scan-alt {
		align-self: center;
		margin-top: 28rpx;
		font-size: 21rpx;
		color: rgba(232, 199, 122, 0.75);
		text-decoration: underline;
	}

	.scan-acts {
		margin-top: auto;
		display: flex;
		justify-content: space-around;
		padding: 0 40rpx 100rpx;
		padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
	}

	.scan-act {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
	}

	.scan-act-ico {
		width: 104rpx;
		height: 104rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 36rpx;
		color: #fdf6e6;
		background: rgba(253, 246, 230, 0.12);
		border: 1rpx solid rgba(253, 246, 230, 0.22);
	}

	.scan-act-ico.on {
		background: #fdf6e6;
		color: #1a1815;
	}

	.scan-act-t {
		font-size: 21rpx;
		color: rgba(253, 246, 230, 0.8);
	}

	.code-chips {
		margin-top: 24rpx;
	}
</style>
