<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="gf-topbar-mid">
				<text class="gf-title">我的业绩</text>
				<text class="gf-subtitle">场次 · 日 · 月 三种口径</text>
			</view>
		</view>

		<view class="gf-tabs">
			<view v-for="t in tabs" :key="t.key" class="gf-tabs-i" :class="{ on: tab === t.key }" @click="switchTab(t.key)">
				{{ t.label }}
			</view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<view v-if="leader" class="gf-notice ink" @click="go('/pages/anchor-team-board/index')">
					<text class="gf-notice-main">查看本组看板（人效 / 组员 / 组长上播）→</text>
				</view>

				<!-- 总览 -->
				<view class="overview">
					<view class="ov-grid">
						<view v-for="(o, i) in overviewCells" :key="i" class="ov-cell">
							<text class="ov-v">{{ o.v }}</text>
							<text class="ov-l">{{ o.l }}</text>
						</view>
					</view>
					<text class="ov-tip">近 7 天 · 归属小店 / 测试号的订单不计入本人</text>
				</view>

				<!-- 按场次 -->
				<template v-if="tab === 's'">
					<view
						v-for="s in sessions"
						:key="s.id"
						class="gf-card session-card"
						@click="goOrders(s.id)"
					>
						<view class="sc-head">
							<text class="sc-time">{{ md(s.startAt) }} {{ hm(s.startAt) }}–{{ s.endAt ? hm(s.endAt) : '直播中' }}</text>
							<text v-if="s.status === '直播中'" class="gf-tag gf-tag-red">直播中</text>
							<text v-else class="gf-tag" :class="s.att === '准时' ? 'gf-tag-ink' : 'gf-tag-gold'">{{ s.att }}</text>
						</view>
						<text class="sc-sub">
							{{ s.roomNo }} · {{ s.accName }} · {{ dur((s.endAt || nowTick) - s.startAt) }}{{
								s.data && s.data.peak ? ' · 留存 ' + ratio(s.data) : ''
							}}
						</text>
						<view class="sc-foot">
							<view class="sc-cell">
								<text class="sc-v">{{ s.orders }}</text>
								<text class="sc-l">单量</text>
							</view>
							<view class="sc-cell">
								<text class="sc-v">{{ money(s.gmv) }}</text>
								<text class="sc-l">成交 GMV</text>
							</view>
							<text class="gf-li-go">›</text>
						</view>
					</view>
					<view v-if="!sessions.length" class="gf-state">
						<text class="gf-state-ico">空</text>
						<text class="gf-state-text">还没有场次记录</text>
					</view>
				</template>

				<!-- 按日 -->
				<template v-else-if="tab === 'd'">
					<view class="gf-card">
						<view v-for="d in days" :key="d.date" class="day-row">
							<text class="day-l">{{ d.label }}</text>
							<view class="gf-prog day-prog"><i :style="{ width: barWidth(d.gmv) + '%' }"></i></view>
							<text class="day-v">{{ d.n }} 单 · {{ wan(d.gmv) }}</text>
						</view>
					</view>
				</template>

				<!-- 按月 -->
				<template v-else>
					<view class="gf-card">
						<view class="gf-card-title">
							<text>{{ month.period }} 月度结果</text>
							<text class="gf-card-title-sub">有效口径</text>
						</view>
						<view class="gf-row">
							<text class="gf-row-k">有效 GMV</text>
							<text class="gf-row-v strong">{{ money(month.validGmv) }}</text>
						</view>
						<view class="gf-row">
							<text class="gf-row-k">有效单 / 成交单</text>
							<text class="gf-row-v">{{ month.validOrders }} / {{ month.orders }}</text>
						</view>
						<view class="gf-row">
							<text class="gf-row-k">KPI 得分 / 系数</text>
							<text class="gf-row-v">{{ month.kpi }} / {{ month.coef }}</text>
						</view>
						<view class="gf-row">
							<text class="gf-row-k">阶梯档</text>
							<text class="gf-tag gf-tag-ink">{{ pct(month.tier.r) }}</text>
						</view>
					</view>

					<view class="gf-card">
						<view class="gf-card-title">
							<text>本月 GMV 榜</text>
							<text class="gf-card-title-sub">前 3 名 + 我的排名</text>
						</view>
						<view v-for="(r, i) in rankTop" :key="r.id" class="gf-row">
							<text class="gf-row-k">{{ ['一', '二', '三'][i] }} · {{ r.name }}</text>
							<text class="gf-row-v">{{ wan(r.gmv) }}</text>
						</view>
						<view class="rank-me">
							<text>我的排名</text>
							<text class="rank-me-v">第 {{ myRank }} 名</text>
						</view>
					</view>
				</template>

				<view class="fab-space"></view>
			</view>
		</scroll-view>

		<view class="gf-fab" @click="openCommission">提成预估</view>

		<gf-tabbar active="performance" />

		<!-- 提成预估 -->
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
						<text class="gf-hint">成交 GMV {{ money(est.gmv) }} × {{ pct(est.rate) }}</text>
					</view>
					<view class="gf-row">
						<text class="gf-row-k">距下一档</text>
						<text class="gf-row-v">{{ est.next ? '差 ¥' + wan(est.gap) + ' → ' + pct(est.next.r) : '已达最高档' }}</text>
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
	import { getPerformance, getCommission } from '@/api/mp'
	import { money, wan, pct, duration as durFmt } from '@/utils/mp-format'

	export default {
		components: { GfTabbar },
		data() {
			return {
				tab: 's',
				tabs: [
					{ key: 's', label: '按场次' },
					{ key: 'd', label: '按日' },
					{ key: 'm', label: '按月' }
				],
				loading: false,
				leader: false,
				overview: { gmv: 0, orders: 0, valid: 0, refund: 0, pending: 0, sessions: 0 },
				sessions: [],
				days: [],
				month: { period: '', validGmv: 0, validOrders: 0, orders: 0, kpi: 0, coef: 1, tier: { r: 0.05 } },
				rank: [],
				myRank: 0,
				est: { show: false, amount: 0, gmv: 0, rate: 0.05, next: null, gap: 0 },
				nowTick: Date.now()
			}
		},
		computed: {
			overviewCells() {
				const o = this.overview
				return [
					{ l: '成交 GMV', v: wan(o.gmv) },
					{ l: '成交单', v: o.orders },
					{ l: '有效单', v: o.valid },
					{ l: '退款', v: o.refund },
					{ l: '待判定', v: o.pending },
					{ l: '场次', v: o.sessions }
				]
			},
			rankTop() {
				return this.rank.slice(0, 3)
			},
			maxDayGmv() {
				return Math.max.apply(null, this.days.map((d) => d.gmv).concat([1]))
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
			wan,
			pct,
			dur(ms) {
				return durFmt(ms)
			},
			hm(ts) {
				const d = new Date(ts)
				return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
			},
			md(ts) {
				const d = new Date(ts)
				return String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
			},
			ratio(data) {
				if (!data || !data.peak) return '—'
				return ((data.last / data.peak) * 100).toFixed(0) + '%'
			},
			barWidth(gmv) {
				return Math.max(4, (gmv / this.maxDayGmv) * 100)
			},
			async load() {
				this.loading = true
				try {
					const d = await getPerformance(this.tab)
					this.overview = d.overview
					this.sessions = d.sessions
					this.days = d.days
					this.month = { ...d.month, period: (d.month && d.month.period) || '' }
					this.rank = d.rank
					this.myRank = d.myRank
					this.leader = ['组长', '副组长'].indexOf((d.profile && d.profile.pos) || '') >= 0
				} catch (e) {
					uni.showToast({ title: e.message || '加载失败', icon: 'none' })
				} finally {
					this.loading = false
				}
			},
			switchTab(k) {
				this.tab = k
				this.load()
			},
			async openCommission() {
				const d = await getCommission()
				this.est = { show: true, ...d }
			},
			goOrders(id) {
				uni.navigateTo({ url: '/pages/anchor-session-orders/index?id=' + id })
			},
			go(url) {
				uni.navigateTo({ url })
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

	.overview {
		background: linear-gradient(150deg, #26241f 0%, #3a4a52 70%);
		border-radius: 18rpx;
		padding: 26rpx 24rpx 20rpx;
		margin-bottom: 18rpx;
		border: 1rpx solid rgba(201, 162, 75, 0.35);
	}

	.ov-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx 10rpx;
	}

	.ov-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4rpx;
	}

	.ov-v {
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 36rpx;
		font-weight: 700;
		color: #fdf6e6;
	}

	.ov-l {
		font-size: 19rpx;
		color: rgba(253, 246, 230, 0.55);
	}

	.ov-tip {
		display: block;
		text-align: center;
		margin-top: 16rpx;
		font-size: 19rpx;
		color: rgba(253, 246, 230, 0.42);
	}

	.session-card {
		padding: 22rpx 24rpx;
	}

	.sc-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12rpx;
	}

	.sc-time {
		font-size: 27rpx;
		font-weight: 700;
		color: $gf-ink;
	}

	.sc-sub {
		display: block;
		margin-top: 8rpx;
		font-size: 21rpx;
		color: $gf-ink-3;
	}

	.sc-foot {
		display: flex;
		align-items: center;
		margin-top: 16rpx;
		padding-top: 14rpx;
		border-top: 1rpx dashed $gf-line-soft;
	}

	.sc-cell {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2rpx;
	}

	.sc-v {
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 32rpx;
		font-weight: 700;
		color: $gf-ink;
	}

	.sc-l {
		font-size: 19rpx;
		color: $gf-ink-3;
	}

	.day-row {
		display: flex;
		align-items: center;
		gap: 14rpx;
		padding: 14rpx 0;
	}

	.day-l {
		width: 84rpx;
		font-size: 21rpx;
		color: $gf-ink-2;
		flex-shrink: 0;
	}

	.day-prog {
		flex: 1;
	}

	.day-v {
		width: 150rpx;
		text-align: right;
		font-size: 20rpx;
		color: $gf-ink-3;
		flex-shrink: 0;
	}

	.rank-me {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 12rpx -24rpx -22rpx;
		padding: 20rpx 24rpx;
		background: rgba(201, 162, 75, 0.12);
		font-size: 23rpx;
		color: $gf-ink-2;
	}

	.rank-me-v {
		font-family: 'STKaiti', serif;
		font-size: 30rpx;
		font-weight: 700;
		color: $gf-cinnabar;
	}

	.fab-space {
		height: 140rpx;
	}

	.est-top {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
		padding-bottom: 24rpx;
	}

	.est-num {
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 62rpx;
		font-weight: 700;
		color: $gf-cinnabar;
	}

	.est-note {
		margin-top: 20rpx;
	}
</style>
