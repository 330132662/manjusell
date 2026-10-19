<template>
	<view class="page gf-page">
		<!-- ===== 顶栏 ===== -->
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">紧急顶班</text>
				<text class="gf-subtitle">可抢场次 · 抢到即归你出镜</text>
			</view>
			<view class="topbar-holder"></view>
		</view>

		<!-- ===== 切换 ===== -->
		<view class="filters">
			<view class="chip" :class="{ on: scope === 1 }" @click="setScope(1)">
				<text class="chip-seal">抢</text>
				<text class="chip-txt">可抢场次</text>
			</view>
			<view class="chip" :class="{ on: scope === 2 }" @click="setScope(2)">
				<text class="chip-seal">得</text>
				<text class="chip-txt">我抢到的</text>
			</view>
		</view>

		<scroll-view scroll-y class="body" @scrolltolower="loadMore">
			<view v-if="loading && list.length === 0" class="gf-state">
				<text class="gf-state-text">加载中…</text>
			</view>

			<view v-else-if="list.length === 0" class="gf-state">
				<text class="gf-state-ico">闲</text>
				<text class="gf-state-text">{{ scope === 1 ? '当前没有可抢的场次' : '还没有抢到过场次' }}</text>
			</view>

			<view v-else class="list">
				<view v-for="it in list" :key="it.id" class="gf-card grab-card">
					<view class="card-head">
						<text class="slot-time">{{ it.plan_date }} {{ it.start_time }}-{{ it.end_time }}</text>
						<text class="tag" :class="it.grabbable ? 'ok' : 'gray'">{{ it.status_label }}</text>
					</view>

					<text class="topic">{{ it.topic || '未命名场次' }}</text>

					<view class="meta">
						<view class="meta-item">
							<text class="meta-tag">原</text>
							<text class="meta-txt">{{ it.anchor_name || '—' }}</text>
						</view>
						<view v-if="it.room" class="meta-item">
							<text class="meta-tag">间</text>
							<text class="meta-txt">{{ it.room }}</text>
						</view>
						<view v-if="it.way" class="meta-item">
							<text class="meta-tag">式</text>
							<text class="meta-txt">{{ it.way_label }}</text>
						</view>
					</view>

					<view v-if="it.grab_deadline" class="deadline">
						<text class="deadline-mark">限</text>
						<text class="deadline-txt">抢班截止 {{ it.grab_deadline }}</text>
					</view>

					<view class="card-foot">
						<text class="foot-tip">{{ it.remark || '顶班后这场排班归你出镜' }}</text>
						<view v-if="it.grabbable" class="btn primary" @click="grab(it)">
							{{ grabbingId === it.id ? '抢班中…' : '立即抢班' }}
						</view>
						<text v-else-if="scope === 2" class="mine">已归你</text>
					</view>
				</view>

				<view v-if="list.length >= total" class="list-end">没有更多了</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { getGrabbableList, grabCover } from '@/api/index'
	import { goBack as navBack } from '@/utils/nav'

	export default {
		data() {
			return {
				scope: 1,
				page: 1,
				pageSize: 10,
				total: 0,
				list: [],
				loading: false,
				grabbingId: 0
			}
		},
		onLoad() {
			this.load(true)
		},
		onPullDownRefresh() {
			this.load(true).then(() => uni.stopPullDownRefresh())
		},
		methods: {
			setScope(s) {
				this.scope = s
				this.load(true)
			},
			async load(reset) {
				if (reset) {
					this.page = 1
					this.list = []
				}
				this.loading = true
				try {
					const res = await getGrabbableList({
						page: this.page,
						pageSize: this.pageSize,
						scope: this.scope
					})
					const rows = res.list || []
					this.list = reset ? rows : this.list.concat(rows)
					this.total = res.total || 0
				} catch (e) {
				} finally {
					this.loading = false
				}
			},
			loadMore() {
				if (this.list.length >= this.total || this.loading) return
				this.page += 1
				this.load(false)
			},
			grab(it) {
				uni.showModal({
					title: '确认抢班',
					content:
						'抢下 ' + it.plan_date + ' ' + it.start_time + '-' + it.end_time + ' 后，这场排班归你出镜，确定？',
					success: async (r) => {
						if (!r.confirm) return
						this.grabbingId = it.id
						try {
							await grabCover({ id: it.id })
							uni.showToast({ title: '抢班成功', icon: 'success' })
							this.load(true)
						} catch (e) {
							// 手慢了等业务失败提示已由 request 层 toast
							this.load(true)
						} finally {
							this.grabbingId = 0
						}
					}
				})
			},
			goBack() {
				// 统一返回：本项目未配置 tabBar，不能用 switchTab
				navBack()
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

/* ===== 切换 ===== */
.filters {
	display: flex;
	gap: 16rpx;
	padding: 20rpx 28rpx 14rpx;
	flex-shrink: 0;
}

.chip {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	height: 74rpx;
	border: 1rpx solid $gf-line-soft;
	border-radius: 12rpx;
	background: rgba(255, 253, 247, 0.85);
}

.chip-seal {
	width: 38rpx;
	height: 38rpx;
	line-height: 34rpx;
	text-align: center;
	border: 1rpx solid rgba(140, 130, 116, 0.4);
	border-radius: 4rpx;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 20rpx;
	font-weight: 700;
	color: $gf-ink-3;
}

.chip-txt {
	font-size: 25rpx;
	color: $gf-ink-2;
	letter-spacing: 1rpx;
}

.chip.on {
	border-color: $gf-cinnabar;
	background: rgba(178, 58, 46, 0.06);
}

.chip.on .chip-seal {
	border-color: $gf-cinnabar;
	background: $gf-cinnabar;
	color: #fdf6e6;
}

.chip.on .chip-txt {
	color: $gf-cinnabar;
	font-weight: 700;
}

/* ===== 列表 ===== */
.body {
	flex: 1;
	overflow: hidden;
	padding: 6rpx 28rpx 0;
}

.grab-card {
	padding: 24rpx 24rpx 20rpx;
}

.card-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12rpx;
	margin-bottom: 10rpx;
}

.slot-time {
	font-size: 26rpx;
	font-weight: 700;
	color: $gf-ink;
	letter-spacing: 1rpx;
}

.tag {
	height: 36rpx;
	line-height: 34rpx;
	padding: 0 12rpx;
	border-radius: 4rpx;
	font-size: 18rpx;
	border: 1rpx solid transparent;
}

.tag.ok {
	color: $gf-cinnabar;
	background: rgba(178, 58, 46, 0.08);
	border-color: rgba(178, 58, 46, 0.35);
}

.tag.gray {
	color: $gf-ink-3;
	background: rgba(140, 130, 116, 0.09);
	border-color: rgba(140, 130, 116, 0.3);
}

.topic {
	display: block;
	font-size: 30rpx;
	font-weight: 700;
	color: $gf-ink;
	line-height: 1.45;
	margin-bottom: 12rpx;
	letter-spacing: 1rpx;
}

.meta {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx 18rpx;
	margin-bottom: 12rpx;
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 6rpx;
}

.meta-tag {
	width: 28rpx;
	height: 28rpx;
	line-height: 26rpx;
	text-align: center;
	border: 1rpx solid $gf-line;
	border-radius: 3rpx;
	font-size: 17rpx;
	color: #8a6a1f;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	background: rgba(201, 162, 75, 0.08);
}

.meta-txt {
	font-size: 21rpx;
	color: $gf-ink-2;
}

/* ===== 截止 ===== */
.deadline {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 10rpx 14rpx;
	margin-bottom: 14rpx;
	border-radius: 8rpx;
	background: rgba(178, 58, 46, 0.055);
	border: 1rpx dashed rgba(178, 58, 46, 0.32);
}

.deadline-mark {
	width: 28rpx;
	height: 28rpx;
	line-height: 26rpx;
	text-align: center;
	border: 1rpx solid $gf-cinnabar;
	border-radius: 3rpx;
	font-size: 17rpx;
	color: $gf-cinnabar;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
}

.deadline-txt {
	font-size: 21rpx;
	color: $gf-cinnabar;
}

/* ===== 底部操作 ===== */
.card-foot {
	display: flex;
	align-items: center;
	gap: 14rpx;
	padding-top: 14rpx;
	border-top: 1rpx dashed $gf-line-soft;
}

.foot-tip {
	flex: 1;
	font-size: 20rpx;
	color: $gf-ink-3;
	line-height: 1.5;
}

.btn.primary {
	flex-shrink: 0;
	height: 64rpx;
	line-height: 62rpx;
	padding: 0 26rpx;
	border-radius: 8rpx;
	background: linear-gradient(180deg, #c0463a 0%, $gf-cinnabar 100%);
	color: #fdf6e6;
	font-size: 23rpx;
	font-weight: 700;
	letter-spacing: 2rpx;
	border: 1rpx solid $gf-gold;
	box-shadow: 0 6rpx 16rpx rgba(178, 58, 46, 0.22);
}

.mine {
	flex-shrink: 0;
	height: 56rpx;
	line-height: 52rpx;
	padding: 0 16rpx;
	border: 2rpx solid $gf-indigo;
	border-radius: 4rpx;
	color: $gf-indigo;
	font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
	font-size: 21rpx;
	font-weight: 700;
	background: rgba(58, 74, 82, 0.06);
}

.list-end {
	text-align: center;
	padding: 24rpx 0 60rpx;
	font-size: 20rpx;
	color: $gf-ink-3;
	letter-spacing: 2rpx;
}
</style>
