<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<!-- ===== 头图：问候 / 身份 / 消息 ===== -->
		<view class="gf-hero">
			<view class="gf-hero-hi">
				<text class="gf-hero-av">{{ avatarText }}</text>
				<view class="hero-id">
					<text class="gf-hero-name">{{ greet }}，{{ profile.name || profile.id }}</text>
					<view class="gf-hero-tags">
						<text class="gf-hero-tag">{{ profile.posText }}</text>
						<text class="gf-hero-tag">{{ profile.groupName }}</text>
						<text v-if="profile.probation" class="gf-hero-tag warn">试用期</text>
					</view>
				</view>
				<view class="gf-hero-bell" @click="go('/pages/anchor-messages/index')">
					信
					<i v-if="unread > 0"></i>
				</view>
			</view>
		</view>

		<!-- ===== 主行动区（叠在头图上） ===== -->
		<view class="gf-lift">
			<view v-if="action.type === 'live'" class="gf-action" @click="goLive">
				<view class="gf-action-ico">播</view>
				<view class="gf-action-main">
					<text class="gf-action-t">直播中 · 我要下播</text>
					<text class="gf-action-d">{{ live.roomNo }} · 已播 {{ clockText }}</text>
				</view>
				<text class="gf-action-go">›</text>
			</view>

			<view v-else-if="action.type === 'data'" class="gf-action gold" @click="goData">
				<view class="gf-action-ico">录</view>
				<view class="gf-action-main">
					<text class="gf-action-t">录入本场数据</text>
					<text class="gf-action-d">{{ action.desc }}</text>
				</view>
				<text class="gf-action-go">›</text>
			</view>

			<view v-else-if="action.type === 'scan'" class="gf-action ink" @click="goScan">
				<view class="gf-action-ico">扫</view>
				<view class="gf-action-main">
					<text class="gf-action-t">扫码上播</text>
					<text class="gf-action-d">{{ action.desc }}</text>
				</view>
				<text class="gf-action-go">›</text>
			</view>

			<view v-else-if="action.type === 'wait'" class="gf-action gray">
				<view class="gf-action-ico">候</view>
				<view class="gf-action-main">
					<text class="gf-action-t">{{ action.time }} 可扫码</text>
					<text class="gf-action-d">{{ action.desc }}</text>
				</view>
			</view>

			<view v-else class="gf-action ink" @click="goScan">
				<view class="gf-action-ico">扫</view>
				<view class="gf-action-main">
					<text class="gf-action-t">扫码上播</text>
					<text class="gf-action-d">今日无排班 · 计划外开播需运营授权码</text>
				</view>
				<text class="gf-action-go">›</text>
			</view>

			<view v-if="action.type === 'wait'" class="scan-alt" @click="goScan">
				<text>需计划外开播？扫码并输入运营授权码</text>
			</view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<!-- ===== 今日排班 ===== -->
				<view class="gf-card">
					<view class="gf-card-title">
						<text>今日排班</text>
						<text class="gf-card-title-sub" @click="go('/pages/my-schedule/index')">全部 ›</text>
					</view>
					<view v-if="todayPlans.length">
						<view v-for="p in todayPlans" :key="p.id" class="gf-li" @click="go('/pages/my-schedule/index')">
							<view class="gf-li-ico" :class="{ ink: p.status === '已发布' }">{{ p.roomNo }}</view>
							<view class="gf-li-main">
								<text class="gf-li-t">{{ p.start }} – {{ p.end }}</text>
								<text class="gf-li-d">{{ p.roomNo }} · {{ p.accName }} · {{ p.type }}</text>
							</view>
							<text class="gf-tag" :class="tagCls(p.status)">{{ p.status }}</text>
						</view>
					</view>
					<view v-else class="gf-state small">
						<text class="gf-state-text">今日休息，好好放松</text>
					</view>
				</view>

				<!-- ===== 数据四宫格 ===== -->
				<view class="gf-kpi-grid">
					<view class="gf-kpi" @click="go('/pages/anchor-performance/index')">
						<text class="gf-kpi-l">今日单量</text>
						<text class="gf-kpi-v">{{ stats.todayOrders }}</text>
						<text class="gf-kpi-s">实时 · 订单到达即算</text>
					</view>
					<view class="gf-kpi" @click="go('/pages/anchor-performance/index')">
						<text class="gf-kpi-l">今日成交 GMV</text>
						<text class="gf-kpi-v">{{ wan(stats.todayGmv) }}</text>
						<text class="gf-kpi-s">元</text>
					</view>
					<view class="gf-kpi" @click="go('/pages/anchor-performance/index')">
						<text class="gf-kpi-l">本月成交 GMV</text>
						<text class="gf-kpi-v">{{ wan(stats.monthGmv) }}</text>
						<text class="gf-kpi-s">提成按有效 GMV 核算</text>
					</view>
					<view class="gf-kpi" @click="openCommission">
						<text class="gf-kpi-l">阶梯进度 · {{ pct(stats.tierRate) }}</text>
						<view class="gf-prog tier-prog"><i :style="{ width: tierPercent + '%' }"></i></view>
						<text class="gf-kpi-s">{{ tierText }}</text>
					</view>
				</view>

				<!-- ===== 本组看板（组长 / 副组长） ===== -->
				<view v-if="leader" class="gf-card team-card" @click="go('/pages/anchor-team-board/index')">
					<view class="gf-card-title">
						<text>本组看板</text>
						<text class="gf-card-title-sub">›</text>
					</view>
					<view class="gf-kpi-grid three">
						<view class="team-cell">
							<text class="gf-kpi-v small">{{ wan(team.eff) }}</text>
							<text class="gf-kpi-s">团队人效</text>
						</view>
						<view class="team-cell">
							<text class="gf-kpi-v small">{{ team.effK }}</text>
							<text class="gf-kpi-s">人效系数</text>
						</view>
						<view class="team-cell">
							<text class="gf-kpi-v small">{{ team.liveCount }}</text>
							<text class="gf-kpi-s">本组在播</text>
						</view>
					</view>
				</view>

				<!-- ===== 待办 ===== -->
				<view class="gf-card">
					<view class="gf-card-title">
						<text>待办</text>
						<text v-if="todos.length" class="todo-count">{{ todos.length }}</text>
					</view>
					<view v-if="todos.length">
						<view v-for="(t, i) in todos" :key="i" class="gf-li" @click="go(t.url)">
							<view class="gf-li-ico" :class="t.type === 'red' ? 'red' : t.type === 'ink' ? 'ink' : ''">{{ t.icon }}</view>
							<view class="gf-li-main">
								<text class="gf-li-t">{{ t.title }}</text>
								<text class="gf-li-d">{{ t.desc }}</text>
							</view>
							<text class="gf-li-go">›</text>
						</view>
					</view>
					<view v-else class="gf-state small">
						<text class="gf-state-text">暂无待办</text>
					</view>
				</view>

				<view class="gf-hint gf-hint-c">数据实时同步 · 以真实扫码开播为准</view>
			</view>
		</scroll-view>

		<gf-tabbar active="home" :schedule-badge="badges.schedule" :mine-badge="badges.mine" />

		<!-- ===== 提成预估弹层 ===== -->
		<view v-if="est.show" class="gf-mask" @click="est.show = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd">
					提成预估
					<text class="gf-sheet-x" @click="est.show = false">×</text>
				</view>
				<view class="gf-sheet-bd">
					<view class="est-top">
						<text class="gf-hint">本月预估阶梯提成</text>
						<text class="est-num">{{ money(est.amount) }}</text>
						<text class="gf-hint">成交 GMV {{ money(est.gmv) }} × {{ pct(est.rate) }} · 不乘 K / 团队系数</text>
					</view>
					<view class="gf-row">
						<text class="gf-row-k">当前档位</text>
						<text class="gf-row-v">{{ pct(est.rate) }}</text>
					</view>
					<view class="gf-row">
						<text class="gf-row-k">距下一档</text>
						<text class="gf-row-v">{{ est.next ? '差 ¥' + wan(est.gap) + ' → ' + pct(est.next.r) : '已达最高档' }}</text>
					</view>
					<view class="gf-row">
						<text class="gf-row-k">法定假上浮</text>
						<text class="gf-row-v">法定假场次提成 × 50%</text>
					</view>
					<view class="gf-notice ink est-note">
						<text class="gf-notice-main">预估以成交计；正式工资按有效 GMV（过退单期）于每月 15 日核算。</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import GfTabbar from '@/components/gf-tabbar/gf-tabbar.vue'
	import { getWorkbench, getCommission, getTeamBoard } from '@/api/mp'
	import { wan, pct, money, clock as clockFmt, greetText, hmText } from '@/utils/mp-format'
	import { isLogged } from '@/utils/auth'

	export default {
		components: { GfTabbar },
		data() {
			return {
				profile: {},
				todayPlans: [],
				stats: { todayOrders: 0, todayGmv: 0, monthGmv: 0, tierRate: 0.05, nextTier: null, tierGap: 0 },
				todos: [],
				unread: 0,
				leader: false,
				live: null,
				pending: null,
				nextPlan: null,
				badges: { schedule: 0, mine: 0 },
				team: { eff: 0, effK: 0, liveCount: 0 },
				est: { show: false, amount: 0, gmv: 0, rate: 0.05, next: null, gap: 0 },
				timer: null,
				nowTick: Date.now()
			}
		},
		computed: {
			avatarText() {
				return (this.profile.name || '主').slice(-1)
			},
			greet() {
				return greetText()
			},
			clockText() {
				if (!this.live) return ''
				return clockFmt(this.nowTick - this.live.startAt)
			},
			tierPercent() {
				const s = this.stats
				if (!s.nextTier) return 100
				return Math.min(100, (s.validGmv / s.nextTier.min) * 100)
			},
			tierText() {
				const s = this.stats
				if (s.nextTier) return '距 ' + pct(s.nextTier.r) + ' 档还差 ¥' + wan(s.tierGap)
				return '已达最高档'
			},
			/** 主行动按钮状态机（与原型 5 态一致） */
			action() {
				if (this.live) return { type: 'live' }
				if (this.pending) {
					return {
						type: 'data',
						desc:
							hmText(this.pending.endAt) +
							' 下播 · ' +
							(this.pending.data && this.pending.data.st === '驳回' ? '被驳回需重填' : 'UV / 峰值 / 下播前在线 + 截图')
					}
				}
				const p = this.nextPlan
				if (p && Date.now() >= p.startAt - 10 * 60000) {
					const late = Math.floor((Date.now() - p.startAt) / 60000)
					return {
						type: 'scan',
						desc: p.roomNo + ' · ' + p.start + '–' + p.end + ' · ' + (late > 0 ? '已迟到 ' + late + ' 分钟' : '可以扫码了')
					}
				}
				if (p) {
					return {
						type: 'wait',
						time: hmText(p.startAt - 10 * 60000),
						desc: '下一场 ' + p.roomNo + ' · ' + p.start + ' 开始（提前 10 分钟开放）'
					}
				}
				return { type: 'none' }
			}
		},
		onLoad() {
			// 未登录一律跳未登录页（冷启动直达工作台的兜底）
			if (!isLogged()) {
				uni.reLaunch({ url: '/pages/not-logged/index' })
				return
			}
			this.load()
		},
		onShow() {
			if (!isLogged()) return
			this.load()
			if (this.timer) clearInterval(this.timer)
			this.timer = setInterval(() => {
				this.nowTick = Date.now()
			}, 1000)
		},
		onHide() {
			if (this.timer) clearInterval(this.timer)
			this.timer = null
		},
		onUnload() {
			if (this.timer) clearInterval(this.timer)
		},
		methods: {
			wan,
			pct,
			money,
			async load() {
				try {
					const d = await getWorkbench()
					this.profile = d.profile
					this.todayPlans = d.todayPlans
					this.stats = d.stats
					this.todos = d.todos
					this.unread = d.unread
					this.leader = d.leader
					this.live = d.live
					this.pending = d.pending
					this.nextPlan = d.nextPlan
					this.badges = d.badges
					if (d.leader) {
						const t = await getTeamBoard()
						if (!t.forbidden) {
							this.team = {
								eff: t.eff,
								effK: t.effK,
								liveCount: t.members.filter((m) => m.live).length
							}
						}
					}
				} catch (e) {
					uni.showToast({ title: e.message || '加载失败', icon: 'none' })
				}
			},
			async openCommission() {
				const d = await getCommission()
				this.est = { show: true, ...d }
			},
			tagCls(s) {
				if (s === '进行中' || s === '已发布') return 'gf-tag-ink'
				if (s === '已完成') return 'gf-tag-gray'
				return 'gf-tag-gold'
			},
			go(url) {
				if (!url) return
				uni.navigateTo({
					url,
					fail: () => uni.reLaunch({ url })
				})
			},
			goLive() {
				uni.navigateTo({ url: '/pages/anchor-live/index' })
			},
			goData() {
				uni.navigateTo({ url: '/pages/anchor-live-data/index?id=' + this.pending.id })
			},
			goScan() {
				const roomId = this.nextPlan ? this.nextPlan.roomId : ''
				uni.navigateTo({ url: '/pages/anchor-scan/index?roomId=' + roomId })
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
		display: flex;
		flex-direction: column;
	}

	.scan-alt {
		text-align: center;
		font-size: 21rpx;
		color: $gf-ink-3;
		margin-top: 14rpx;
		text-decoration: underline;
	}

	.tier-prog {
		margin: 14rpx 0 8rpx;
	}

	.team-card {
		margin-top: 18rpx;
	}

	.team-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4rpx;
	}

	.todo-count {
		min-width: 36rpx;
		height: 36rpx;
		line-height: 36rpx;
		padding: 0 10rpx;
		border-radius: 8rpx;
		background: rgba(178, 58, 46, 0.1);
		color: $gf-cinnabar;
		font-family: inherit;
		font-size: 20rpx;
		text-align: center;
	}

	.est-top {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
		padding: 6rpx 0 24rpx;
	}

	.est-num {
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 64rpx;
		font-weight: 700;
		color: $gf-cinnabar;
		line-height: 1.1;
	}

	.est-note {
		margin: 20rpx 0 0;
	}
</style>
