<template>
	<view class="page gf-page">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">消息中心</text>
				<text class="gf-subtitle">未读 {{ unread }} 条</text>
			</view>
			<view class="gf-topbar-act" @click="readAll">全部已读</view>
		</view>

		<view class="gf-tabs">
			<view
				v-for="c in cats"
				:key="c"
				class="gf-tabs-i"
				:class="{ on: cat === c }"
				@click="switchCat(c)"
			>
				{{ c || '全部' }}
			</view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<view v-if="list.length">
					<view
						v-for="m in list"
						:key="m.id"
						class="gf-card msg"
						:class="{ unread: !m.read }"
						@click="open(m)"
					>
						<view class="msg-head">
							<text class="gf-tag" :class="tagOf(m.cat)">{{ m.cat }}</text>
							<text class="msg-t">{{ m.title }}</text>
							<i v-if="!m.read" class="msg-dot"></i>
						</view>
						<text class="msg-b">{{ m.body }}</text>
						<text class="msg-time">{{ mdhm(m.at) }}</text>
					</view>
				</view>
				<view v-else class="gf-state">
					<text class="gf-state-ico">信</text>
					<text class="gf-state-text">暂无{{ cat || '' }}消息</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { getMessages, readMessage, readAllMessages } from '@/api/mp'
	import { mdhmText } from '@/utils/mp-format'
	import { goBack } from '@/utils/nav'

	export default {
		data() {
			return {
				cats: ['', '排班', '工资', '合规', '审批'],
				cat: '',
				list: [],
				unread: 0
			}
		},
		onLoad(q) {
			if (q && q.cat) this.cat = q.cat
			this.load()
		},
		onShow() {
			this.load()
		},
		methods: {
			mdhm(ts) {
				return mdhmText(ts)
			},
			async load() {
				const d = await getMessages(this.cat)
				this.list = d.list || []
				this.unread = d.unread || 0
			},
			switchCat(c) {
				this.cat = c
				this.load()
			},
			tagOf(cat) {
				if (cat === '工资') return 'gf-tag-gold'
				if (cat === '合规') return 'gf-tag-red'
				if (cat === '排班') return 'gf-tag-ink'
				return 'gf-tag-gray'
			},
			async open(m) {
				if (!m.read) {
					await readMessage(m.id)
					m.read = true
					this.unread = Math.max(0, this.unread - 1)
				}
				if (m.go) {
					uni.navigateTo({ url: m.go, fail: () => uni.reLaunch({ url: m.go }) })
				}
			},
			readAll() {
				if (!this.unread) return
				uni.showModal({
					title: '全部已读',
					content: '把所有未读消息标记为已读？',
					success: async (r) => {
						if (!r.confirm) return
						await readAllMessages()
						uni.showToast({ title: '已全部已读', icon: 'success' })
						this.load()
					}
				})
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

	.gf-topbar-act {
		width: 110rpx;
		text-align: right;
		font-size: 21rpx;
		color: $gf-cinnabar;
	}

	.msg.unread {
		border-left: 6rpx solid $gf-cinnabar;
	}

	.msg-head {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.msg-t {
		flex: 1;
		font-size: 26rpx;
		font-weight: 700;
		color: $gf-ink;
		line-height: 1.45;
	}

	.msg-dot {
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		background: $gf-cinnabar;
		flex-shrink: 0;
	}

	.msg-b {
		display: block;
		margin-top: 10rpx;
		font-size: 22rpx;
		color: $gf-ink-2;
		line-height: 1.65;
	}

	.msg-time {
		display: block;
		margin-top: 10rpx;
		font-size: 19rpx;
		color: $gf-ink-3;
	}
</style>
