<template>
	<view class="page gf-page">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">制度签收</text>
				<text class="gf-subtitle">版本 {{ version }} · 签署后具备约束力</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<view v-if="unsignedCount" class="gf-notice red">
					<text class="gf-notice-main">
						还有 {{ unsignedCount }} 项制度未签收，未签收不影响发薪但会影响晋升与绩效考核。
					</text>
				</view>
				<view v-else class="gf-notice ink">
					<text class="gf-notice-main">全部制度已签收，谢谢配合。</text>
				</view>

				<view class="gf-card">
					<view class="gf-card-title">
						<text>制度与协议</text>
						<text class="gf-card-title-sub">{{ docs.length }} 项</text>
					</view>
					<view v-for="d in docs" :key="d.name" class="gf-li" @click="openDoc(d)">
						<view class="gf-li-ico" :class="d.signedAt ? 'ink' : 'red'">{{ d.signedAt ? '已' : '未' }}</view>
						<view class="gf-li-main">
							<text class="gf-li-t">{{ d.name }}</text>
							<text class="gf-li-d">{{ d.desc }}</text>
						</view>
						<text v-if="d.signedAt" class="gf-tag gf-tag-ink">{{ dayOf(d.signedAt) }}</text>
						<text v-else class="gf-tag gf-tag-red">待签</text>
						<text class="gf-li-go">›</text>
					</view>
				</view>

				<text class="gf-hint gf-hint-c">
					签署记录含时间戳，可在「我的」-「制度签收」随时复查。
				</text>
			</view>
		</scroll-view>

		<!-- 签署弹层 -->
		<view v-if="show" class="gf-mask" @click="show = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd">
					{{ doc.name }}
					<text class="gf-sheet-x" @click="show = false">✕</text>
				</view>
				<view class="gf-sheet-bd">
					<text class="doc-desc">{{ doc.desc }}</text>
					<view class="gf-divider"></view>
					<view v-if="doc.signedAt" class="gf-row">
						<text class="gf-row-k">签署时间</text>
						<text class="gf-row-v">{{ fullOf(doc.signedAt) }}</text>
					</view>
					<view v-else class="agree" @click="agree = !agree">
						<view class="gf-check-ico" :class="agree ? '' : 'no'">{{ agree ? '✓' : '!' }}</view>
						<text class="agree-t">我已阅读并同意《{{ doc.name }}》全部条款</text>
					</view>
				</view>
				<view class="gf-sheet-ft">
					<view class="gf-btn gf-btn-ghost" @click="show = false">{{ doc.signedAt ? '关闭' : '取消' }}</view>
					<view
						v-if="!doc.signedAt"
						class="gf-btn gf-btn-primary"
						:class="{ disabled: !agree }"
						@click="sign"
					>
						确认签署
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getRules, signDoc } from '@/api/mp'
	import { dayText, mdhmText } from '@/utils/mp-format'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				version: '',
				docs: [],
				show: false,
				doc: {},
				agree: false
			}
		},
		computed: {
			unsignedCount() {
				return this.docs.filter((d) => !d.signedAt).length
			}
		},
		onLoad() {
			this.load()
		},
		methods: {
			dayOf(ts) {
				return dayText(ts).slice(5) + ' 已签'
			},
			fullOf(ts) {
				return mdhmText(ts)
			},
			async load() {
				const d = await getRules()
				this.version = d.version
				this.docs = d.docs || []
			},
			openDoc(d) {
				this.doc = d
				this.agree = false
				this.show = true
			},
			async sign() {
				if (!this.agree) {
					uni.showToast({ title: '请先勾选同意', icon: 'none' })
					return
				}
				await signDoc(this.doc.name)
				this.show = false
				uni.showToast({ title: '已签署', icon: 'success' })
				this.load()
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

	.doc-desc {
		display: block;
		font-size: 24rpx;
		color: $gf-ink-2;
		line-height: 1.75;
	}

	.agree {
		display: flex;
		align-items: center;
		gap: 14rpx;
	}

	.agree-t {
		flex: 1;
		font-size: 23rpx;
		color: $gf-ink-2;
		line-height: 1.6;
	}
</style>
