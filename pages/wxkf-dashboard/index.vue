<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">客服数据看板</text>
				<text class="gf-subtitle">{{ rangeText }}</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<view class="filter-bar">
			<view class="day-tabs">
				<view
					v-for="opt in dayOptions"
					:key="opt.value"
					class="day-tab"
					:class="{ on: days === opt.value }"
					@click="switchDays(opt.value)"
				>{{ opt.label }}</view>
			</view>
			<view class="refresh-btn" :class="{ disabled: loading }" @click="fetchData">
				{{ loading ? '刷新中' : '刷新' }}
			</view>
		</view>

		<scroll-view scroll-y class="gf-scroll" refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onPullRefresh">
			<view class="gf-pad">
				<text class="sub-line">管理员回复口径：仅统计后台实际发送成功的消息</text>

				<!-- 告警条 -->
				<view v-if="loadError" class="gf-notice red">
					<text class="gf-notice-main">接口请求失败：{{ loadError }}。请检查后端日志（常见于线上库缺少 admin_id 列）。</text>
				</view>
				<view v-else-if="data && !backendUpdated" class="gf-notice">
					<text class="gf-notice-main">后端接口仍是旧版本（未返回访客排行数据）。请重新构建 Go 服务并重启后再刷新本页。</text>
				</view>

				<view v-if="loading && !data" class="gf-state">
					<text class="gf-state-text">加载中…</text>
				</view>

				<template v-else-if="data">
					<!-- 指标卡 -->
					<view class="metric-grid">
						<view v-for="m in metrics" :key="m.label" class="metric-card">
							<text class="metric-label">{{ m.label }}</text>
							<view class="metric-value-row">
								<text class="metric-value" :style="{ color: m.color }">{{ m.value }}</text>
								<text class="metric-unit">{{ m.unit }}</text>
							</view>
							<text class="metric-tip">{{ m.tip }}</text>
						</view>
					</view>

					<!-- 消息趋势（移动端以分组柱状呈现三条序列） -->
					<view class="gf-card chart-card">
						<view class="gf-card-title">
							<text>消息趋势</text>
							<text class="gf-card-title-sub">按天统计</text>
						</view>
						<view class="legend">
							<view class="legend-i"><i class="dot dot-visitor"></i><text>访客消息</text></view>
							<view class="legend-i"><i class="dot dot-admin"></i><text>管理员回复</text></view>
							<view class="legend-i"><i class="dot dot-ai"></i><text>AI 回复</text></view>
						</view>
						<view v-if="trend.dates.length" class="chart-body">
							<view v-for="(d, i) in trend.dates" :key="i" class="chart-col">
								<view class="chart-bars">
									<view class="chart-bar-wrap"><view class="chart-bar visitor" :style="{ height: barH(trend.incoming[i]) }"></view></view>
									<view class="chart-bar-wrap"><view class="chart-bar admin" :style="{ height: barH(trend.admin_reply[i]) }"></view></view>
									<view class="chart-bar-wrap"><view class="chart-bar ai" :style="{ height: barH(trend.ai_reply[i]) }"></view></view>
								</view>
								<text class="chart-x">{{ d }}</text>
							</view>
						</view>
						<view v-else class="gf-state small"><text class="gf-state-text">暂无趋势数据</text></view>
					</view>

					<!-- 访客消息排行 -->
					<view class="gf-card">
						<view class="gf-card-title">
							<text>访客消息数量排行</text>
							<text class="gf-tag gf-tag-gold">TOP 50</text>
						</view>
						<text class="rank-rule">按 external_userid 统计区间内访客消息（direction=1，不含系统事件），未建档访客显示脱敏 ID。</text>
						<view v-if="!visitorRank.length" class="gf-state small">
							<text class="gf-state-text">{{ visitorEmptyText }}</text>
							<text class="diag-text">{{ diagText }}</text>
							<view class="empty-actions">
								<view v-if="!backendUpdated" class="gf-btn-ghost empty-btn" @click="fetchData">部署完成后重试</view>
								<view v-else-if="days !== 3650" class="gf-btn-main empty-btn" @click="switchAllTime">切换到「全部时间」</view>
							</view>
						</view>
						<view v-else>
							<view v-for="item in visitorRank" :key="item.external_userid" class="rank-item">
								<view class="rank-no" :class="{ top: item.rank <= 3 }">{{ item.rank }}</view>
								<view class="rank-main">
									<view class="rank-line">
										<text class="rank-name">{{ item.visitor_name }}</text>
										<text class="rank-count">{{ item.msg_count }} 条</text>
									</view>
									<view class="rank-bar"><view class="rank-bar-fill visitor" :style="{ width: visitorBarWidth(item.msg_count) }"></view></view>
									<text class="rank-meta">文本 {{ item.text_count }} · 其它 {{ item.other_count }} · 最近 {{ item.last_at || '-' }}</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 管理员回复排行 -->
					<view class="gf-card">
						<view class="gf-card-title">
							<text>管理员回复数量排行</text>
							<text class="gf-tag gf-tag-ink">admin-send*</text>
						</view>
						<text class="rank-rule">只统计企微发送接口返回成功后落库的消息（intent 以 admin-send 开头），且归属后台账号。</text>
						<view v-if="unassignedCount > 0" class="gf-notice">
							<text class="gf-notice-main">另有 {{ unassignedCount }} 条历史发送未归属账号（部署前存量数据），未计入排行。</text>
						</view>
						<view v-if="!rank.length" class="gf-state small">
							<text class="gf-state-text">所选时间段内暂无管理员回复记录（操作人归属从本次部署后开始累计）</text>
						</view>
						<view v-else>
							<view v-for="item in rank" :key="item.admin_id" class="rank-item">
								<view class="rank-no" :class="{ top: item.rank <= 3 }">{{ item.rank }}</view>
								<view class="rank-main">
									<view class="rank-line">
										<text class="rank-name">{{ item.admin_name }}</text>
										<text class="rank-count">{{ item.reply_count }} 条</text>
									</view>
									<view class="rank-bar"><view class="rank-bar-fill" :style="{ width: barWidth(item.reply_count) }"></view></view>
									<text class="rank-meta">文本 {{ item.text_count }} · 其它 {{ item.other_count }} · 最近回复 {{ item.last_reply_at || '-' }}</text>
								</view>
							</view>
						</view>
					</view>
				</template>

				<view v-else-if="!loadError" class="gf-state">
					<text class="gf-state-text">暂无数据</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { getDashboardStat } from '@/api/wxkf'
	import { backToEntry } from '@/utils/auth'

	export default {
		data() {
			return {
				days: 1,
				dayOptions: [
					{ label: '今日', value: 1 },
					{ label: '近7天', value: 7 },
					{ label: '近30天', value: 30 },
					{ label: '近90天', value: 90 },
					{ label: '全部', value: 3650 }
				],
				loading: false,
				refreshing: false,
				loadError: '',
				data: null,
				autoAllTried: false
			}
		},
		onLoad() {
			this.fetchData()
		},
		computed: {
			rangeText() {
				const r = this.data && this.data.range
				if (!r) return '统计区间 · 加载中'
				return r.all ? `全部时间（截至 ${r.end}）` : `${r.start} ~ ${r.end}（${r.days} 天）`
			},
			summary() {
				return (this.data && this.data.summary) || {}
			},
			trend() {
				const t = (this.data && this.data.trend) || {}
				return {
					dates: t.dates || [],
					incoming: t.incoming || [],
					admin_reply: t.admin_reply || [],
					ai_reply: t.ai_reply || []
				}
			},
			rank() {
				return (this.data && this.data.admin_rank) || []
			},
			visitorRank() {
				return (this.data && this.data.visitor_rank) || []
			},
			unassignedCount() {
				return (this.data && this.data.unassigned_count) || 0
			},
			backendUpdated() {
				return !!this.data && Array.isArray(this.data.visitor_rank)
			},
			metrics() {
				const s = this.summary
				return [
					{ label: '消息总量', value: s.total_messages ?? 0, unit: '条', color: '#1a1815', tip: `含其它 ${s.other_messages ?? 0} 条系统/欢迎语等` },
					{ label: '访客消息', value: s.incoming ?? 0, unit: '条', color: '#165DFF', tip: '不含 enter_session 等系统事件' },
					{ label: '咨询访客', value: s.visitors ?? 0, unit: '人', color: '#4080FF', tip: '按 external_userid 去重' },
					{ label: '管理员回复', value: s.admin_replies ?? 0, unit: '条', color: '#00B42A', tip: '后台实际发送成功' },
					{ label: 'AI 回复', value: s.ai_replies ?? 0, unit: '条', color: '#FF7D00', tip: '扣子自动回复' },
					{ label: '新增客户', value: s.new_customers ?? 0, unit: '人', color: '#722ED1', tip: '区间内首次建档' }
				]
			},
			maxReply() {
				return Math.max(1, ...this.rank.map((i) => i.reply_count))
			},
			maxVisitorMsg() {
				return Math.max(1, ...this.visitorRank.map((i) => i.msg_count))
			},
			maxTrend() {
				const all = [...this.trend.incoming, ...this.trend.admin_reply, ...this.trend.ai_reply]
				return Math.max(1, ...all)
			},
			visitorEmptyText() {
				if (!this.data) return '接口请求失败，请检查网络或后端日志'
				if (!Array.isArray(this.data.visitor_rank)) return '后端未更新：接口没有返回访客排行数据'
				if ((this.summary.total_messages ?? 0) === 0) return '所选时间段内没有任何消息日志'
				if ((this.summary.incoming ?? 0) > 0 || (this.summary.empty_uid ?? 0) > 0)
					return '区间内有访客消息，但都缺少 external_userid，无法按访客归组'
				return '所选时间段内暂无访客消息'
			},
			diagText() {
				if (!this.data) return '诊断：等待接口响应'
				const r = this.rangeText
				const s = this.summary
				return `诊断：${r} · 消息总量 ${s.total_messages ?? 0} 条 · 访客消息 ${s.incoming ?? 0} 条 · 空ID ${s.empty_uid ?? 0} 条 · 接口 ${this.data.api || '旧版'}`
			}
		},
		methods: {
			async fetchData() {
				this.loading = true
				this.loadError = ''
				try {
					let d = await getDashboardStat({ days: this.days })
					this.data = d
					// 近 N 天(N>1)无日志且后端为新版时，自动回退全部时间（仅一次）
					// "今日"(days=1) 不回退: 当天暂无消息属正常, 切到全部时间反而不符合用户选择
					if (!this.autoAllTried && this.days > 1 && this.days !== 3650 && Array.isArray(d.visitor_rank) && ((d.summary && d.summary.total_messages) ?? 0) === 0) {
						this.autoAllTried = true
						this.days = 3650
						d = await getDashboardStat({ days: 3650 })
						this.data = d
					}
				} catch (e) {
					this.loadError = (e && e.message) || (e && e.toString && e.toString()) || '未知错误'
				} finally {
					this.loading = false
					this.refreshing = false
				}
			},
			switchDays(v) {
				if (this.days === v || this.loading) return
				this.days = v
				this.autoAllTried = false
				this.fetchData()
			},
			switchAllTime() {
				this.days = 3650
				this.autoAllTried = false
				this.fetchData()
			},
			onPullRefresh() {
				this.refreshing = true
				this.fetchData()
			},
			barH(v) {
				const h = Math.max(0, Math.round((Number(v || 0) / this.maxTrend) * 100))
				return h + '%'
			},
			barWidth(count) {
				return Math.max(3, Math.round((count / this.maxReply) * 100)) + '%'
			},
			visitorBarWidth(count) {
				return Math.max(3, Math.round((count / this.maxVisitorMsg) * 100)) + '%'
			},
			goBack() {
				backToEntry()
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '../../styles/guofeng-vars.scss';

	.page { height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
	.topbar-holder { width: 64rpx; }

	.filter-bar {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16rpx;
		padding: 16rpx 28rpx;
		border-bottom: 1rpx solid $gf-line-soft;
	}
	.day-tabs { display: flex; flex-wrap: wrap; gap: 10rpx; }
	.day-tab {
		padding: 10rpx 18rpx;
		font-size: 22rpx;
		color: $gf-ink-2;
		border: 1rpx solid $gf-line;
		border-radius: 8rpx;
		background: rgba(255, 253, 247, 0.9);
	}
	.day-tab.on { color: #fdf6e6; background: $gf-cinnabar; border-color: $gf-gold; }
	.refresh-btn {
		flex-shrink: 0;
		padding: 10rpx 22rpx;
		font-size: 22rpx;
		color: $gf-cinnabar;
		border: 1rpx solid $gf-cinnabar;
		border-radius: 8rpx;
	}
	.refresh-btn.disabled { opacity: 0.5; }

	.sub-line { display: block; font-size: 21rpx; color: $gf-ink-3; margin-bottom: 16rpx; }

	/* 指标卡 */
	.metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; margin-bottom: 24rpx; }
	.metric-card {
		background: $gf-card;
		border: 1rpx solid $gf-line;
		border-radius: 14rpx;
		padding: 20rpx;
	}
	.metric-label { display: block; font-size: 23rpx; color: $gf-ink-2; }
	.metric-value-row { display: flex; align-items: baseline; margin-top: 12rpx; }
	.metric-value { font-size: 44rpx; font-weight: 700; line-height: 1.1; }
	.metric-unit { font-size: 22rpx; color: $gf-ink-3; margin-left: 6rpx; }
	.metric-tip { display: block; margin-top: 10rpx; font-size: 19rpx; line-height: 1.5; color: $gf-ink-3; }

	/* 趋势图 */
	.legend { display: flex; gap: 24rpx; margin-bottom: 18rpx; }
	.legend-i { display: flex; align-items: center; gap: 8rpx; font-size: 20rpx; color: $gf-ink-2; }
	.dot { width: 16rpx; height: 16rpx; border-radius: 4rpx; }
	.dot-visitor { background: #165DFF; }
	.dot-admin { background: #00B42A; }
	.dot-ai { background: #FF7D00; }
	.chart-body {
		display: flex;
		align-items: flex-end;
		gap: 6rpx;
		height: 320rpx;
		padding-top: 10rpx;
		overflow-x: auto;
	}
	.chart-col { flex: 1; min-width: 40rpx; display: flex; flex-direction: column; align-items: center; height: 100%; }
	.chart-bars { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 2rpx; }
	.chart-bar-wrap { flex: 1; max-width: 14rpx; height: 100%; display: flex; align-items: flex-end; }
	.chart-bar { width: 100%; border-radius: 3rpx 3rpx 0 0; min-height: 2rpx; }
	.chart-bar.visitor { background: #165DFF; }
	.chart-bar.admin { background: #00B42A; }
	.chart-bar.ai { background: #FF7D00; }
	.chart-x { margin-top: 8rpx; font-size: 16rpx; color: $gf-ink-3; white-space: nowrap; }

	/* 排行 */
	.rank-rule { display: block; font-size: 20rpx; line-height: 1.7; color: $gf-ink-2; margin-bottom: 12rpx; }
	.rank-item { display: flex; gap: 16rpx; padding: 18rpx 4rpx; border-bottom: 1rpx solid $gf-line-soft; }
	.rank-no {
		flex-shrink: 0; width: 44rpx; height: 44rpx; line-height: 44rpx; text-align: center;
		font-size: 22rpx; color: $gf-ink-2; background: rgba(140, 130, 116, 0.12); border-radius: 8rpx;
	}
	.rank-no.top { color: #fdf6e6; background: $gf-cinnabar; }
	.rank-main { flex: 1; min-width: 0; }
	.rank-line { display: flex; align-items: center; justify-content: space-between; gap: 12rpx; }
	.rank-name { flex: 1; font-size: 25rpx; color: $gf-ink; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.rank-count { flex-shrink: 0; font-size: 23rpx; font-weight: 600; color: $gf-ink-2; }
	.rank-bar { height: 10rpx; margin: 12rpx 0 8rpx; background: rgba(140, 130, 116, 0.12); border-radius: 6rpx; overflow: hidden; }
	.rank-bar-fill { height: 100%; background: $gf-indigo; border-radius: 6rpx; transition: width 0.3s ease; }
	.rank-bar-fill.visitor { background: #00B42A; }
	.rank-meta { font-size: 19rpx; color: $gf-ink-3; }
	.diag-text { display: block; margin-top: 12rpx; font-size: 19rpx; color: $gf-ink-3; line-height: 1.6; text-align: center; }
	.empty-actions { display: flex; justify-content: center; margin-top: 20rpx; }
	.empty-btn { padding: 0 28rpx; height: 64rpx; line-height: 64rpx; font-size: 22rpx; }
</style>
