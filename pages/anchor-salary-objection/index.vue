<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">工资异议</text>
				<text class="gf-subtitle">逐项核对 · 5 日内提出</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<view class="gf-card">
					<view class="gf-field">
						<text class="gf-label"><text class="gf-req">*</text>异议项（可多选）</text>
						<view class="gf-chips">
							<view
								v-for="it in items"
								:key="it.no"
								class="gf-chip"
								:class="{ on: selected.indexOf(it.no) >= 0 }"
								@click="toggle(it.no)"
							>
								{{ it.no }}. {{ it.name }}
							</view>
						</view>
					</view>

					<view class="gf-field">
						<text class="gf-label"><text class="gf-req">*</text>原因</text>
						<textarea
							class="gf-textarea"
							v-model="reason"
							placeholder="请说明异议原因，并附可核对的凭证"
							:maxlength="300"
						/>
					</view>

					<view class="gf-field">
						<text class="gf-label">凭证</text>
						<view class="gf-upload" :class="{ done: proof }" @click="proof = true">
							<text class="up-ico">{{ proof ? '✓' : '+' }}</text>
							<text>{{ proof ? '已上传' : '上传' }}</text>
						</view>
					</view>
				</view>

				<view class="gf-notice ink">
					<text class="gf-notice-main">
						财务 → 经理 → 总监处理；20 日照常发放，异议成立的差额次月补发，属核算差错按差额双倍补。
					</text>
				</view>
			</view>
		</scroll-view>

		<view class="gf-foot">
			<view class="gf-btn gf-btn-primary" :class="{ disabled: submitting }" @click="submit">
				{{ submitting ? '提交中…' : '提交异议' }}
			</view>
		</view>
	</view>
</template>

<script>
	import { getPayslip, submitPayObjection } from '@/api/mp'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				period: '',
				items: [],
				selected: [],
				reason: '上月 18 日场次迟到为扫码设备故障，已报备运营',
				proof: false,
				submitting: false
			}
		},
		onLoad(q) {
			this.period = (q && q.p) || ''
			this.load()
		},
		methods: {
			async load() {
				const p = await getPayslip(this.period)
				const all = p.inc.concat(p.ded)
				this.items = all.filter((i) => i.amt || ['全勤', '执行力'].indexOf(i.name) >= 0)
			},
			toggle(no) {
				const k = this.selected.indexOf(no)
				if (k >= 0) this.selected.splice(k, 1)
				else this.selected.push(no)
			},
			async submit() {
				if (this.submitting) return
				if (!this.selected.length) {
					uni.showToast({ title: '请选择异议项', icon: 'none' })
					return
				}
				if (!String(this.reason || '').trim()) {
					uni.showToast({ title: '请填写原因', icon: 'none' })
					return
				}
				this.submitting = true
				try {
					const names = this.items
						.filter((i) => this.selected.indexOf(i.no) >= 0)
						.map((i) => i.name)
						.join('、')
					await submitPayObjection(names, this.reason)
					uni.showToast({ title: '已提交，处理结果将通知你', icon: 'success' })
					setTimeout(() => {
						uni.redirectTo({ url: '/pages/anchor-salary/index' })
					}, 600)
				} catch (e) {
					uni.showToast({ title: e.message || '提交失败', icon: 'none' })
				} finally {
					this.submitting = false
				}
			},
			goBack() {
				goBack('/pages/anchor-payslip/index')
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

	.up-ico {
		font-size: 34rpx;
	}
</style>
