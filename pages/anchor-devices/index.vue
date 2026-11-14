<template>
	<view class="page gf-page">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">账号与设备</text>
				<text class="gf-subtitle">所属视频号 · 借用资产</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<view class="gf-notice ink">
					<text class="gf-notice-main">
						视频号与设备均归公司所有，仅授权你在排班房间内使用；不得私自改密码、换绑手机号或外借。
					</text>
				</view>

				<view class="gf-card">
					<view class="gf-card-title">
						<text>我的视频号</text>
						<text class="gf-card-title-sub">{{ accounts.length }} 个</text>
					</view>
					<view v-if="accounts.length">
						<view v-for="a in accounts" :key="a.name" class="gf-li">
							<view class="gf-li-ico" :class="{ ink: a.kind === '主' }">{{ a.kind }}</view>
							<view class="gf-li-main">
								<text class="gf-li-t">{{ a.name }}</text>
								<text class="gf-li-d">{{ a.roomNo }} 直播间 · 权重 {{ a.k }}</text>
							</view>
							<text class="gf-tag" :class="a.status === '养号' ? 'gf-tag-gray' : 'gf-tag-ink'">
								{{ a.status }}
							</text>
						</view>
					</view>
					<view v-else class="gf-state small">
						<text class="gf-state-text">暂未分配视频号</text>
					</view>
				</view>

				<view class="gf-card">
					<view class="gf-card-title">
						<text>借用资产</text>
						<text class="gf-card-title-sub">离职须归还</text>
					</view>
					<view v-if="assets.length">
						<view v-for="a in assets" :key="a.id" class="gf-li">
							<view class="gf-li-ico">物</view>
							<view class="gf-li-main">
								<text class="gf-li-t">{{ a.name }}</text>
								<text class="gf-li-d">编号 {{ a.id }} · {{ a.at }} 领用</text>
							</view>
							<text class="gf-tag gf-tag-ink">{{ a.st }}</text>
						</view>
					</view>
					<view v-else class="gf-state small">
						<text class="gf-state-text">暂无借用资产</text>
					</view>
				</view>

				<text class="gf-hint gf-hint-c">
					设备故障请在开播前 30 分钟报备运营，避免判定迟到或黑天鹅。
				</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { getDevices } from '@/api/mp'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return { accounts: [], assets: [] }
		},
		onLoad() {
			this.load()
		},
		methods: {
			async load() {
				const d = await getDevices()
				this.accounts = d.accounts || []
				this.assets = d.assets || []
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
</style>
