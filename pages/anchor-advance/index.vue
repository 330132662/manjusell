<template>
	<view class="page gf-page">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">工资预支</text>
				<text class="gf-subtitle">额度按提成与在岗天数折算 · 发放日扣回</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<!-- 可借额度 -->
				<view class="adv-hero">
					<text class="adv-l">当前可借</text>
					<text class="adv-num">{{ money(quota.q) }}</text>
					<text class="adv-s">已借未还 {{ money(quota.owe) }}</text>
				</view>

				<!-- 额度构成 -->
				<view class="gf-card">
					<view class="gf-card-title">
						<text>额度构成</text>
						<text class="gf-card-title-sub">实时测算</text>
					</view>
					<view v-for="p in quota.parts" :key="p[0]" class="gf-row">
						<text class="gf-row-k">{{ p[0] }}</text>
						<text class="gf-row-v">{{ money(p[1]) }}</text>
					</view>
					<view class="gf-row">
						<text class="gf-row-k">可借额度</text>
						<text class="gf-row-v strong">{{ money(quota.q) }}</text>
					</view>
				</view>

				<!-- 申请表单 -->
				<view v-if="flex" class="gf-notice red">
					<text class="gf-notice-main">灵活用工身份由平台代发，不支持内部预支。</text>
				</view>

				<view v-else class="gf-card">
					<view class="gf-field">
						<text class="gf-label"><text class="gf-req">*</text>预支金额</text>
						<input class="gf-input" type="digit" v-model="amtText" placeholder="不超过可借额度" />
						<view class="gf-chips quick">
							<view v-for="q in quick" :key="q.k" class="gf-chip" @click="amtText = String(q.v)">
								{{ q.k }}
							</view>
						</view>
					</view>
					<view class="gf-field">
						<text class="gf-label"><text class="gf-req">*</text>用途说明</text>
						<input class="gf-input" v-model="reason" placeholder="如：房租 / 医疗 / 家庭开支" />
					</view>
				</view>

				<view v-if="inflight" class="gf-notice">
					<text class="gf-notice-main">已有一笔预支在审批或待放款，同一时间只允许一笔。</text>
				</view>

				<view class="gf-card">
					<view class="gf-card-title">
						<text>预支记录</text>
						<text class="gf-card-title-sub">近 3 笔</text>
					</view>
					<view v-if="records.length">
						<view v-for="r in records" :key="r.id" class="gf-li">
							<view class="gf-li-ico" :class="r.st === '已还清' ? 'ink' : ''">借</view>
							<view class="gf-li-main">
								<text class="gf-li-t">{{ money(r.amt) }} · {{ r.reason }}</text>
								<text class="gf-li-d">{{ mdhm(r.at) }} 申请 · 剩余 {{ money(r.left) }}</text>
							</view>
							<text class="gf-tag" :class="tagCls(r.st)">{{ r.st }}</text>
						</view>
					</view>
					<view v-else class="gf-state small">
						<text class="gf-state-text">暂无预支记录</text>
					</view>
				</view>

				<text class="gf-hint gf-hint-c">
					预支从当月工资扣回；离职未结清按协议从结算款中一次性扣除。
				</text>
			</view>
		</scroll-view>

		<view v-if="!flex" class="gf-foot">
			<view
				class="gf-btn gf-btn-primary"
				:class="{ disabled: submitting || inflight || !quota.q }"
				@click="submit"
			>
				{{ submitting ? '提交中…' : '提交预支申请' }}
			</view>
		</view>
	</view>
</template>

<script>
	import { getAdvance, applyAdvance } from '@/api/mp'
	import { money, mdhmText } from '@/utils/mp-format'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				quota: { q: 0, owe: 0, parts: [] },
				records: [],
				inflight: false,
				flex: false,
				amtText: '',
				reason: '',
				submitting: false
			}
		},
		computed: {
			quick() {
				const q = this.quota.q || 0
				const list = [
					{ k: '全部', v: q },
					{ k: '一半', v: Math.floor(q / 2 / 100) * 100 },
					{ k: '2000', v: Math.min(2000, q) }
				]
				return list.filter((i) => i.v > 0)
			}
		},
		onLoad() {
			this.load()
		},
		methods: {
			money,
			mdhm(ts) {
				return mdhmText(ts)
			},
			async load() {
				const d = await getAdvance()
				this.quota = d.quota
				this.records = d.records
				this.inflight = d.inflight
				this.flex = d.flex
			},
			tagCls(st) {
				if (st === '审批中' || st === '待放款') return 'gf-tag-gold'
				if (st === '扣回中') return 'gf-tag-ink'
				if (st === '已还清') return 'gf-tag-gray'
				return 'gf-tag-gray'
			},
			async submit() {
				if (this.submitting) return
				if (this.inflight) {
					uni.showToast({ title: '已有预支在处理中', icon: 'none' })
					return
				}
				const amt = Number(this.amtText)
				if (!amt || amt <= 0) {
					uni.showToast({ title: '请输入预支金额', icon: 'none' })
					return
				}
				if (amt > this.quota.q) {
					uni.showToast({ title: '超出可借额度', icon: 'none' })
					return
				}
				if (!String(this.reason || '').trim()) {
					uni.showToast({ title: '请填写用途', icon: 'none' })
					return
				}
				this.submitting = true
				try {
					await applyAdvance(amt, this.reason)
					uni.showToast({ title: '已提交，待审批', icon: 'success' })
					this.amtText = ''
					this.reason = ''
					await this.load()
				} catch (e) {
					uni.showToast({ title: e.message || '提交失败', icon: 'none' })
				} finally {
					this.submitting = false
				}
			},
			goBack() {
				goBack('/pages/anchor-salary/index')
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

	.adv-hero {
		background: linear-gradient(150deg, #26241f 0%, #3a4a52 78%);
		border-radius: 18rpx;
		padding: 26rpx 26rpx 24rpx;
		margin-bottom: 18rpx;
		border: 1rpx solid rgba(201, 162, 75, 0.35);
	}

	.adv-l {
		display: block;
		font-size: 20rpx;
		color: rgba(253, 246, 230, 0.6);
	}

	.adv-num {
		display: block;
		margin: 8rpx 0 6rpx;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 62rpx;
		font-weight: 700;
		color: #fdf6e6;
		line-height: 1.1;
	}

	.adv-s {
		font-size: 20rpx;
		color: rgba(232, 199, 122, 0.85);
	}

	.quick {
		margin-top: 12rpx;
	}
</style>
