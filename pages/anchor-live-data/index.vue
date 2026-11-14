<template>
	<view class="page gf-page">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">下播数据录入</text>
				<text class="gf-subtitle">UV / 峰值 / 下播前在线 + 截图</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<view v-if="!session" class="gf-state">
					<text class="gf-state-ico">空</text>
					<text class="gf-state-text">没有待录入的场次</text>
				</view>

				<template v-else>
					<view v-if="rejected" class="gf-notice red">
						<text class="gf-notice-main">被驳回：{{ data.why || '数据与截图不一致' }}，请重新录入</text>
					</view>

					<view class="gf-card">
						<view class="gf-row">
							<text class="gf-row-k">场次</text>
							<text class="gf-row-v">{{ mdhm(session.startAt) }}–{{ hm(session.endAt) }} · {{ session.roomNo }}</text>
						</view>
						<view class="gf-row">
							<text class="gf-row-k">本场单量 / 成交 GMV</text>
							<text class="gf-row-v strong">{{ stats.n }} 单 · {{ money(stats.gmv) }}</text>
						</view>
					</view>

					<view class="gf-card">
						<view class="gf-field">
							<text class="gf-label"><text class="gf-req">*</text>UV（观看人数）</text>
							<input class="gf-input" type="number" v-model="form.uv" placeholder="例如 2400" />
						</view>
						<view class="gf-field">
							<text class="gf-label"><text class="gf-req">*</text>在线峰值</text>
							<input class="gf-input" type="number" v-model="form.peak" placeholder="例如 320" />
						</view>
						<view class="gf-field">
							<text class="gf-label"><text class="gf-req">*</text>下播前在线</text>
							<input class="gf-input" type="number" v-model="form.last" placeholder="例如 138" />
						</view>
						<view class="gf-field">
							<text class="gf-label"><text class="gf-req">*</text>人均停留（秒）</text>
							<input class="gf-input" type="number" v-model="form.stay" placeholder="例如 210" />
						</view>
						<view class="gf-field">
							<text class="gf-label"><text class="gf-req">*</text>成交转化（%）</text>
							<input class="gf-input" type="number" v-model="form.conv" placeholder="例如 3.2" />
						</view>
						<view class="gf-field">
							<text class="gf-label"><text class="gf-req">*</text>后台数据截图（1–3 张）</text>
							<view class="gf-upload" :class="{ done: form.shot }" @click="form.shot = true">
								<text class="up-ico">{{ form.shot ? '✓' : '+' }}</text>
								<text>{{ form.shot ? '已上传' : '上传' }}</text>
							</view>
						</view>
					</view>

					<!-- 交接留存实时计算 -->
					<view class="gf-card ratio-card" :class="{ red }">
						<view class="ratio-top">
							<text class="gf-row-k">交接留存率</text>
							<text class="ratio-num">{{ ratioText }}</text>
						</view>
						<text class="gf-hint">
							{{
								red
									? '可能触发交接红线（扣 200）。若属自然波动，审核后可在「违规与申诉」申请交接免责。'
									: '下播前在线 ÷ 峰值；< 40% 且峰值 > 100 触发交接红线'
							}}
						</text>
					</view>

					<text class="gf-hint gf-hint-c">数据由运营 24h 内审核；未录入 KPI「交接留存」按 0 计</text>
				</template>
			</view>
		</scroll-view>

		<view v-if="session" class="gf-foot">
			<view class="gf-btn gf-btn-primary" :class="{ disabled: submitting }" @click="submit">
				{{ submitting ? '提交中…' : '提交' }}
			</view>
		</view>
	</view>
</template>

<script>
	import { getDataEntry, submitSessionData } from '@/api/mp'
	import { money, handRatio, isHandRed } from '@/utils/mp-format'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				id: '',
				session: null,
				stats: { n: 0, gmv: 0 },
				data: {},
				form: { uv: '', peak: '', last: '', stay: '', conv: '', shot: false },
				submitting: false
			}
		},
		computed: {
			rejected() {
				return this.data && this.data.st === '驳回'
			},
			ratio() {
				return handRatio(this.form.last, this.form.peak)
			},
			ratioText() {
				if (this.ratio === null) return '—'
				return (this.ratio * 100).toFixed(0) + '%'
			},
			red() {
				return isHandRed(this.form.last, this.form.peak)
			}
		},
		onLoad(q) {
			this.id = (q && q.id) || ''
			this.load()
		},
		methods: {
			money,
			hm(ts) {
				if (!ts) return '直播中'
				const d = new Date(ts)
				return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
			},
			mdhm(ts) {
				const d = new Date(ts)
				return (
					String(d.getMonth() + 1).padStart(2, '0') +
					'-' +
					String(d.getDate()).padStart(2, '0') +
					' ' +
					String(d.getHours()).padStart(2, '0') +
					':' +
					String(d.getMinutes()).padStart(2, '0')
				)
			},
			async load() {
				const d = await getDataEntry(this.id)
				if (!d) {
					this.session = null
					return
				}
				this.session = d.session
				this.stats = d.stats
				this.data = d.data || {}
				this.form = {
					uv: this.data.uv || '',
					peak: this.data.peak || '',
					last: this.data.last || '',
					stay: this.data.stay || '',
					conv: this.data.conv || '',
					shot: !!this.data.shot
				}
			},
			async submit() {
				if (this.submitting) return
				const keys = ['uv', 'peak', 'last', 'stay', 'conv']
				const empty = keys.some((k) => this.form[k] === '' || this.form[k] === null)
				if (empty) {
					uni.showToast({ title: '请填写全部数据', icon: 'none' })
					return
				}
				if (!this.form.shot) {
					uni.showToast({ title: '请上传后台截图', icon: 'none' })
					return
				}
				this.submitting = true
				try {
					await submitSessionData(this.session.id, this.form)
					uni.showToast({ title: '已提交，等待运营审核', icon: 'success' })
					setTimeout(() => {
						uni.redirectTo({ url: '/pages/anchor-live-summary/index?id=' + this.session.id })
					}, 500)
				} catch (e) {
					uni.showToast({ title: e.message || '提交失败', icon: 'none' })
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

	.up-ico {
		font-size: 34rpx;
		font-family: inherit;
	}

	.ratio-card {
		transition: background 0.18s;
	}

	.ratio-card.red {
		background: rgba(178, 58, 46, 0.06);
		border-color: rgba(178, 58, 46, 0.4);
	}

	.ratio-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8rpx;
	}

	.ratio-num {
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 44rpx;
		font-weight: 700;
		color: $gf-ink;
	}

	.ratio-card.red .ratio-num {
		color: $gf-cinnabar;
	}
</style>
