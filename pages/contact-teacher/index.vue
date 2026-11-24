<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">联系技术老师</text>
				<text class="gf-subtitle">开播 · 设备 · 账号问题，一对一解答</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<!-- 技术老师名片 -->
				<view class="gf-card teacher-card">
					<view class="teacher-avatar">师</view>
					<view class="teacher-info">
						<text class="teacher-name">技术老师</text>
						<text class="teacher-desc">企业微信 · 实时在线</text>
					</view>
					<text class="gf-tag gf-tag-ink">官方</text>
				</view>

				<!-- 咨询范围 -->
				<view class="gf-card">
					<view class="gf-card-title">
						<text>可以咨询哪些问题</text>
						<text class="gf-card-title-sub">回复时间 9:00-22:00</text>
					</view>
					<view v-for="item in topics" :key="item.t" class="gf-li">
						<view class="gf-li-ico" :class="item.red ? 'red' : 'ink'">{{ item.ico }}</view>
						<view class="gf-li-main">
							<text class="gf-li-t">{{ item.t }}</text>
							<text class="gf-li-d">{{ item.d }}</text>
						</view>
					</view>
				</view>

				<!-- 添加入口 -->
				<view class="gf-card action-card">
					<button class="gf-btn gf-btn-primary" :class="{ disabled: adding }" @click="addTeacher">
						{{ adding ? '正在打开…' : '添加技术老师' }}
					</button>
					<text class="gf-hint gf-hint-c">
						点击后将打开微信客服会话，添加企业微信技术老师后可随时留言咨询。
					</text>
					<!-- 企业 ID 未配置 / 调用失败时的降级入口 -->
					<view v-if="fallback" class="link-box" @click="copyLink">
						<text class="link-text">{{ TECH_TEACHER_KF_URL }}</text>
						<text class="link-copy">复制</text>
					</view>
					<text v-if="fallbackTip" class="gf-hint gf-hint-c warn">{{ fallbackTip }}</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { TECH_TEACHER_KF_URL, WXKF_CORP_ID } from '@/utils/config'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				TECH_TEACHER_KF_URL,
				adding: false,
				// 降级开关：企业ID未配置 或 openCustomerServiceChat 调用失败时展示复制链接
				fallback: false,
				fallbackTip: '',
				topics: [
					{ ico: '播', t: '开播异常', d: '推流失败 · 画面卡顿 · 掉线重连', red: true },
					{ ico: '备', t: '设备问题', d: '手机设置 · 麦克风摄像头 · 网络诊断' },
					{ ico: '号', t: '账号绑定', d: '视频号绑定 · 登录异常 · 资产借用' },
					{ ico: '他', t: '其他技术问题', d: '小程序使用 · 工资系统故障反馈' }
				]
			}
		},
		methods: {
			/** 点击添加：调官方「小程序打开微信客服」接口（wx.openCustomerServiceChat） */
			addTeacher() {
				if (this.adding) return
				this.adding = true
				this.fallbackTip = ''

				// #ifdef MP-WEIXIN
				if (!WXKF_CORP_ID) {
					this.adding = false
					this.fallback = true
					this.fallbackTip = '尚未配置企业 ID（utils/config.js 的 WXKF_CORP_ID），请先复制链接到微信打开添加。'
					return
				}
				// 该接口要求必须在点击行为中调用（此处即点击事件回调内）
				uni.openCustomerServiceChat()
				wx.openCustomerServiceChat({
					extInfo: { url: TECH_TEACHER_KF_URL },
					corpId: WXKF_CORP_ID,
					showToast: true,
					success: () => {
						this.adding = false
					},
					fail: (err) => {
						this.adding = false
						this.fallback = true
						this.fallbackTip = '打开客服会话失败（' + ((err && err.errMsg) || '未知原因') + '），可复制下方链接到微信打开。'
					}
				})
				// #endif

				// #ifndef MP-WEIXIN
				this.adding = false
				this.fallback = true
				this.fallbackTip = '当前环境不支持直接拉起微信客服，请复制链接后在微信中打开添加。'
				this.copyLink()
				// #endif
			},
			copyLink() {
				uni.setClipboardData({
					data: TECH_TEACHER_KF_URL,
					success: () => uni.showToast({ title: '链接已复制', icon: 'none' })
				})
			},
			goBack() {
				// 兜底落地页用未登录页：从 not-logged 直达本页再返回时，锚定工作台会被登录守卫再次弹回
				goBack('/pages/not-logged/index')
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

	/* 技术老师名片 */
	.teacher-card {
		display: flex;
		align-items: center;
		gap: 22rpx;
	}

	.teacher-avatar {
		width: 92rpx;
		height: 92rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #b23a2e 0%, #8f2d24 100%);
		color: #fdf6e6;
		font-size: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.teacher-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.teacher-name {
		font-size: 32rpx;
		font-weight: 600;
		color: $gf-ink;
	}

	.teacher-desc {
		font-size: 23rpx;
		color: $gf-ink-2;
	}

	/* 添加按钮 */
	.action-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}

	.action-card .gf-btn {
		width: 100%;
	}

	.gf-hint.warn {
		color: #8f2d24;
	}

	/* 链接降级展示 */
	.link-box {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
		padding: 18rpx 22rpx;
		background: rgba(26, 24, 21, 0.05);
		border: 1rpx dashed rgba(58, 74, 82, 0.4);
		border-radius: 10rpx;
	}

	.link-text {
		flex: 1;
		min-width: 0;
		font-size: 21rpx;
		color: $gf-ink-2;
		word-break: break-all;
		line-height: 1.5;
	}

	.link-copy {
		flex-shrink: 0;
		font-size: 23rpx;
		color: #b23a2e;
		font-weight: 600;
	}
</style>
