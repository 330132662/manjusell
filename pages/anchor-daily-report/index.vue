<template>
	<view class="page gf-page">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">今日日报</text>
				<text class="gf-subtitle">数据自动带出 · 补充复盘即可</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<view class="re-hero">
					<text class="re-l">今日数据 · 自动带出</text>
					<view class="re-grid">
						<view class="re-cell">
							<text class="re-v">{{ auto.sessions }}</text>
							<text class="re-k">场次</text>
						</view>
						<view class="re-cell">
							<text class="re-v">{{ dur }}</text>
							<text class="re-k">时长</text>
						</view>
						<view class="re-cell">
							<text class="re-v">{{ auto.orders }}</text>
							<text class="re-k">单量</text>
						</view>
						<view class="re-cell">
							<text class="re-v">{{ wan(auto.gmv) }}</text>
							<text class="re-k">GMV</text>
						</view>
					</view>
				</view>

				<view v-if="submitted" class="gf-notice ink">
					<text class="gf-notice-main">已于 {{ submittedAt }} 提交，可修改后重新提交。</text>
				</view>

				<view class="gf-card">
					<view class="gf-field">
						<text class="gf-label"><text class="gf-req">*</text>本场亮点</text>
						<textarea class="gf-textarea" v-model="form.highlights" placeholder="话术 / 互动 / 转化做得好的点" :maxlength="200" />
					</view>
					<view class="gf-field">
						<text class="gf-label"><text class="gf-req">*</text>问题与复盘</text>
						<textarea class="gf-textarea" v-model="form.problems" placeholder="掉人节点、违规风险、设备问题" :maxlength="200" />
					</view>
					<view class="gf-field">
						<text class="gf-label">明日计划</text>
						<textarea class="gf-textarea" v-model="form.plan" placeholder="明日要调整的动作" :maxlength="200" />
					</view>
					<view class="gf-field">
						<text class="gf-label">需要支持</text>
						<input class="gf-input" v-model="form.need" placeholder="如：需要补光 / 改脚本 / 加排班" />
					</view>
				</view>

				<text class="gf-hint gf-hint-c">日报于每日 24:00 前提交，组长与运营可见。</text>
			</view>
		</scroll-view>

		<view class="gf-foot">
			<view class="gf-btn gf-btn-primary" :class="{ disabled: submitting }" @click="submit">
				{{ submitting ? '提交中…' : submitted ? '重新提交' : '提交日报' }}
			</view>
		</view>
	</view>
</template>

<script>
	import { getDailyReport, submitDailyReport } from '@/api/mp'
	import { duration, wan, mdhmText } from '@/utils/mp-format'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				auto: { sessions: 0, duration: 0, orders: 0, gmv: 0 },
				form: { highlights: '', problems: '', plan: '', need: '' },
				submitted: false,
				submittedAt: '',
				submitting: false
			}
		},
		computed: {
			dur() {
				return duration(this.auto.duration)
			}
		},
		onLoad() {
			this.load()
		},
		methods: {
			wan,
			async load() {
				const d = await getDailyReport()
				this.auto = d.auto || this.auto
				if (d.report) {
					this.form = {
						highlights: d.report.highlights || '',
						problems: d.report.problems || '',
						plan: d.report.plan || '',
						need: d.report.need || ''
					}
					this.submitted = true
					this.submittedAt = mdhmText(d.report.at)
				}
			},
			async submit() {
				if (this.submitting) return
				if (!String(this.form.highlights || '').trim()) {
					uni.showToast({ title: '请填写本场亮点', icon: 'none' })
					return
				}
				if (!String(this.form.problems || '').trim()) {
					uni.showToast({ title: '请填写问题与复盘', icon: 'none' })
					return
				}
				this.submitting = true
				try {
					await submitDailyReport(this.form)
					uni.showToast({ title: '已提交', icon: 'success' })
					await this.load()
				} finally {
					this.submitting = false
				}
			},
			goBack() {
				goBack('/pages/anchor-mine/index')
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

	.re-hero {
		background: linear-gradient(150deg, #26241f 0%, #3a4a52 78%);
		border-radius: 18rpx;
		padding: 24rpx 20rpx 20rpx;
		margin-bottom: 18rpx;
		border: 1rpx solid rgba(201, 162, 75, 0.35);
	}

	.re-l {
		display: block;
		font-size: 20rpx;
		color: rgba(253, 246, 230, 0.6);
		padding-left: 6rpx;
	}

	.re-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		margin-top: 14rpx;
	}

	.re-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6rpx;
	}

	.re-v {
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 36rpx;
		font-weight: 700;
		color: #fdf6e6;
	}

	.re-k {
		font-size: 19rpx;
		color: rgba(253, 246, 230, 0.55);
	}
</style>
