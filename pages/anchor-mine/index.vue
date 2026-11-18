<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<!-- ===== 头图：身份 / 成长 ===== -->
		<view class="gf-hero">
			<view class="gf-hero-hi">
				<text class="gf-hero-av">{{ avatarText }}</text>
				<view class="hero-id">
					<text class="gf-hero-name">{{ profile.name || profile.id }}</text>
					<view class="gf-hero-tags">
						<text class="gf-hero-tag">{{ profile.posText }}</text>
						<text class="gf-hero-tag">{{ profile.groupName }}</text>
						<text class="gf-hero-tag">{{ profile.emp }}</text>
					</view>
				</view>
				<view class="gf-hero-bell" @click="go('/pages/anchor-messages/index')">
					信
					<i v-if="badges.message"></i>
				</view>
			</view>
		</view>

		<view class="gf-lift">
			<view class="gf-action ink" @click="go('/pages/anchor-growth/index')">
				<view class="gf-action-ico">升</view>
				<view class="gf-action-main">
					<text class="gf-action-t">{{ growth.text || profile.posText }}</text>
					<view class="gf-prog growth-prog"><i :style="{ width: growthPercent + '%' }"></i></view>
				</view>
				<text class="gf-action-go">›</text>
			</view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<!-- 工资 / KPI -->
				<view class="gf-kpi-grid">
					<view class="gf-kpi" @click="go('/pages/anchor-salary/index')">
						<text class="gf-kpi-l">我的工资 · {{ salary.period }}</text>
						<text class="gf-kpi-v small">{{ salaryText }}</text>
						<text class="gf-kpi-s">{{ badges.salary || '查看工资条与预支' }}</text>
					</view>
					<view class="gf-kpi" @click="go('/pages/anchor-okr/index')">
						<text class="gf-kpi-l">KPI 系数</text>
						<text class="gf-kpi-v">{{ kpi.coef }}</text>
						<text class="gf-kpi-s">{{ badges.okr || '得分 ' + kpi.score }}</text>
					</view>
				</view>

				<!-- 功能切换 -->
				<view class="gf-card">
					<view class="gf-card-title"><text>功能切换1</text><text class="gf-card-title-sub">选择工作台</text></view>
					<view class="gf-li" @click="goAnchor">
						<view class="gf-li-ico red"></view>
						<view class="gf-li-main">
							<text class="gf-li-t">切换</text>
							<text class="gf-li-d"></text>
						</view>
						<text class="gf-tag gf-tag-red"></text>
						<text class="gf-li-go">›</text>
					</view>
					<!-- <view class="gf-li" @click="goService">
						<view class="gf-li-ico ink">客</view>
						<view class="gf-li-main">
							<text class="gf-li-t">客服工作台</text>
							<text class="gf-li-d">客户会话 · 消息处理 · 数据看板</text>
						</view>
						<text class="gf-li-go">›</text>
					</view> -->
				</view>

				<!-- 工作 -->
				<view class="gf-card">
					<view class="gf-card-title"><text>我的工作</text></view>
					<view class="gf-li" @click="go('/pages/my-schedule/index')">
						<view class="gf-li-ico ink">排</view>
						<view class="gf-li-main">
							<text class="gf-li-t">我的排班</text>
							<text class="gf-li-d">下周排班 · 换班 · 请假</text>
						</view>
						<text class="gf-li-go">›</text>
					</view>
					<view class="gf-li" @click="go('/pages/anchor-attendance/index')">
						<view class="gf-li-ico ink">勤</view>
						<view class="gf-li-main">
							<text class="gf-li-t">考勤日历</text>
							<text class="gf-li-d">迟到 / 缺勤 / 情绪假记录</text>
						</view>
						<text class="gf-li-go">›</text>
					</view>
					<view class="gf-li" @click="go('/pages/anchor-devices/index')">
						<view class="gf-li-ico ink">号</view>
						<view class="gf-li-main">
							<text class="gf-li-t">账号与设备</text>
							<text class="gf-li-d">所属视频号 · 借用资产</text>
						</view>
						<text class="gf-li-go">›</text>
					</view>
					<view class="gf-li" @click="go('/pages/anchor-daily-report/index')">
						<view class="gf-li-ico ink">报</view>
						<view class="gf-li-main">
							<text class="gf-li-t">今日日报</text>
							<text class="gf-li-d">数据自动带出 · 补充复盘</text>
						</view>
						<text class="gf-li-go">›</text>
					</view>
				</view>

				<!-- 合规与制度 -->
				<view class="gf-card">
					<view class="gf-card-title"><text>合规与制度</text></view>
					<view class="gf-li" @click="go('/pages/anchor-violations/index')">
						<view class="gf-li-ico red">规</view>
						<view class="gf-li-main">
							<text class="gf-li-t">违规与交接红线</text>
							<text class="gf-li-d">24 小时内可申诉</text>
						</view>
						<text v-if="badges.violation" class="gf-tag gf-tag-red">{{ badges.violation }}</text>
						<text class="gf-li-go">›</text>
					</view>
					<view class="gf-li" @click="go('/pages/anchor-rules/index')">
						<view class="gf-li-ico">章</view>
						<view class="gf-li-main">
							<text class="gf-li-t">制度签收</text>
							<text class="gf-li-d">薪资 / 考勤 / 交接 / 竞业 / 肖像</text>
						</view>
						<text v-if="badges.rules" class="gf-tag gf-tag-gold">{{ badges.rules }}</text>
						<text class="gf-li-go">›</text>
					</view>
					<view class="gf-li" @click="go('/pages/anchor-okr/index')">
						<view class="gf-li-ico">标</view>
						<view class="gf-li-main">
							<text class="gf-li-t">OKR 与 KPI</text>
							<text class="gf-li-d">季度目标 · 本月考核</text>
						</view>
						<text v-if="badges.okr" class="gf-tag gf-tag-gold">{{ badges.okr }}</text>
						<text class="gf-li-go">›</text>
					</view>
				</view>

				<!-- 账号 -->
				<view class="gf-card">
					<view class="gf-card-title"><text>账号信息</text></view>
					<view class="gf-row">
						<text class="gf-row-k">手机号</text>
						<text class="gf-row-v">{{ profile.phone }}</text>
					</view>
					<view class="gf-row">
						<text class="gf-row-k">入职日期</text>
						<text class="gf-row-v">{{ profile.join }}</text>
					</view>
					<view class="gf-row">
						<text class="gf-row-k">结算账户</text>
						<text class="gf-row-v">{{ profile.bank }}</text>
					</view>
					<view class="gf-row">
						<text class="gf-row-k">带教组长</text>
						<text class="gf-row-v">{{ profile.mentor }}</text>
					</view>
					<view class="gf-li" @click="go('/pages/anchor-profile/index')">
						<view class="gf-li-ico ink">档</view>
						<view class="gf-li-main">
							<text class="gf-li-t">我的资料</text>
							<text class="gf-li-d">头像 / 昵称 / 收款信息维护</text>
						</view>
						<text class="gf-li-go">›</text>
					</view>
				</view>

				<view class="logout" @click="logout">退出登录</view>
				<text class="gf-hint gf-hint-c" @longpress="demoMenu">鼎耀传媒 · 主播工作台 V1.6</text>
			</view>
		</scroll-view>

		<gf-tabbar active="mine" />
	</view>
</template>

<script>
	import {
		getMine,
		switchDemoRole,
		resetDemo
	} from '@/api/mp'
	import {
		money
	} from '@/utils/mp-format'
	import {
		switchWorkspace,
		ANCHOR_PAGE,
		SERVICE_PAGE
	} from '@/utils/auth'
	import GfTabbar from '@/components/gf-tabbar/gf-tabbar.vue'

	export default {
		components: {
			GfTabbar
		},
		data() {
			return {
				profile: {},
				growth: {},
				kpi: {
					score: 0,
					coef: 1
				},
				salary: {
					st: '',
					period: ''
				},
				badges: {}
			}
		},
		computed: {
			avatarText() {
				const n = this.profile.name || this.profile.id || ''
				return n ? n.slice(-1) : '播'
			},
			growthPercent() {
				return Math.round((Number(this.growth.progress) || 0) * 100)
			},
			salaryText() {
				const map = {
					待核算: '待核算',
					待确认: '待确认',
					异议中: '异议中',
					已确认: '已确认',
					已发放: '已发放'
				}
				return map[this.salary.st] || '查看'
			}
		},
		onLoad() {
			this.load()
		},
		onShow() {
			this.load()
		},
		methods: {
			money,
			async load() {
				const d = await getMine()
				this.profile = d.profile || {}
				this.growth = d.growth || {}
				this.kpi = d.kpi || {
					score: 0,
					coef: 1
				}
				this.salary = d.salary || {
					st: '',
					period: ''
				}
				this.badges = d.badges || {}
			},
			go(url) {
				uni.navigateTo({
					url,
					fail: () => uni.reLaunch({
						url
					})
				})
			},
			/** 切换工作台：经中转页清栈后进入目标，避免返回键串到其他身份主页 */
			goAnchor() {
				uni.reLaunch({
					url: "/pages/entry/index"
				})
			},
			goService() {
				switchWorkspace(SERVICE_PAGE)
			},
			/** 长按版本号：演示身份切换 / 重置演示数据（仅演示模式） */
			demoMenu() {
				uni.showActionSheet({
					itemList: ['切换演示身份（主播 ⇄ 组长）', '重置演示数据'],
					success: (r) => {
						if (r.tapIndex === 0) {
							const p = switchDemoRole()
							uni.showToast({
								title: p ? '当前：' + p.posText : '演示模式未开启',
								icon: 'none'
							})
							this.load()
						} else if (r.tapIndex === 1) {
							resetDemo()
							uni.showToast({
								title: '演示数据已重置',
								icon: 'success'
							})
							this.load()
						}
					}
				})
			},
			logout() {
				uni.showModal({
					title: '退出登录',
					content: '退出后需重新用手机号登录',
					success: (r) => {
						if (!r.confirm) return
						try {
							uni.removeStorageSync('token')
							uni.removeStorageSync('mp_session_ctx')
						} catch (e) {}
						uni.reLaunch({
							url: '/pages/not-logged/index'
						})
					}
				})
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

	.hero-id {
		flex: 1;
		min-width: 0;
	}

	.growth-prog {
		margin-top: 12rpx;
		background: rgba(253, 246, 230, 0.2);
	}

	.growth-prog i {
		background: linear-gradient(90deg, #e8c77a 0%, #fdf6e6 100%);
	}

	.logout {
		margin-top: 20rpx;
		height: 86rpx;
		line-height: 86rpx;
		text-align: center;
		font-size: 25rpx;
		color: #8f2d24;
		background: rgba(255, 253, 247, 0.92);
		border: 1rpx solid rgba(178, 58, 46, 0.28);
		border-radius: 12rpx;
		letter-spacing: 2rpx;
	}
</style>
