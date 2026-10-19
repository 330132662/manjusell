<template>
	<view class="page">
		<view class="topbar">
			<view class="topbar-back" @click="goBack">‹</view>
			<text class="topbar-title">请假 / 休班</text>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="body">
			<view class="card">
				<view class="card-title">申请类型</view>
				<view class="tabs">
					<view class="tab" :class="{ on: form.leave_type === 1 }" @click="form.leave_type = 1">请假</view>
					<view class="tab" :class="{ on: form.leave_type === 2 }" @click="form.leave_type = 2">休班</view>
				</view>
				<text class="hint">请假与休班都会占用可用时段，审核通过后相关场次需要替班。</text>
			</view>

			<view class="card">
				<view class="card-title">时间范围</view>
				<view class="row">
					<text class="row-label">开始日期</text>
					<picker mode="date" :value="form.start_date" @change="(e) => onStart(e.detail.value)">
						<text class="row-value">{{ form.start_date || '请选择' }}</text>
					</picker>
					<text class="row-arrow">›</text>
				</view>
				<view class="row">
					<text class="row-label">结束日期</text>
					<picker mode="date" :value="form.end_date || form.start_date" @change="(e) => onEnd(e.detail.value)">
						<text class="row-value">{{ form.end_date || form.start_date || '同开始日期' }}</text>
					</picker>
					<text class="row-arrow">›</text>
				</view>

				<view class="row">
					<text class="row-label">按时段请假</text>
					<switch :checked="partial" color="#1a535c" style="transform: scale(0.8)" @change="onPartial" />
				</view>

				<view v-if="partial" class="row">
					<text class="row-label">时段</text>
					<picker mode="time" :value="form.start_time" @change="(e) => (form.start_time = e.detail.value)">
						<text class="row-value">{{ form.start_time || '开始时间' }}</text>
					</picker>
					<text class="row-dash">-</text>
					<picker mode="time" :value="form.end_time" @change="(e) => (form.end_time = e.detail.value)">
						<text class="row-value">{{ form.end_time || '结束时间' }}</text>
					</picker>
				</view>
			</view>

			<view class="card">
				<view class="card-title">
					涉及排班
					<text class="card-title-sub">共 {{ planIds.length }} 场</text>
				</view>
				<view v-if="planIds.length === 0" class="empty">
					<text class="empty-text">该时间范围内没有你的排班</text>
					<text class="empty-tip">仍可提交请假，仅登记不可用时段</text>
				</view>
				<view v-for="it in suggestions" :key="it.plan_id" class="slot">
					<view class="slot-head">
						<text class="slot-time">{{ it.plan_date }} {{ it.start_time }}-{{ it.end_time }}</text>
						<text class="slot-tag" :class="it.coverable ? 'ok' : 'warn'">
							{{ it.coverable ? '有候选' : '暂无候选' }}
						</text>
					</view>
					<text class="slot-topic">{{ it.topic || '未命名场次' }}</text>
					<text v-if="it.covers && it.covers.length" class="slot-cover">
						首选：{{ it.covers[0].anchor_name }}（{{ it.covers[0].score }} 分）
					</text>
					<text v-else class="slot-cover warn">{{ it.reason || '需运营人工安排' }}</text>
				</view>
			</view>

			<view class="card">
				<view class="row">
					<text class="row-label">审核通过后自动替班</text>
					<switch :checked="!!form.auto_cover" color="#1a535c" style="transform: scale(0.8)" @change="onAutoCover" />
				</view>
				<text class="hint">
					打开后，运营同意请假时会按候选第一名自动把场次改派给他人；未覆盖的场次会留在「顶班管理」由运营处理。
				</text>
			</view>

			<view class="card">
				<view class="card-title">请假原因</view>
				<textarea
					v-model="form.reason"
					class="textarea"
					placeholder="选填，便于运营判断"
					maxlength="200"
				/>
			</view>

			<view class="footer">
				<view class="submit" :class="{ disabled: !form.start_date || submitting }" @click="submit">
					{{ submitting ? '提交中…' : '提交申请' }}
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { applyLeave, getLeaveSuggestions } from '@/api/index'

	export default {
		data() {
			return {
				partial: false,
				submitting: false,
				planIds: [],
				suggestions: [],
				form: {
					leave_type: 1,
					start_date: '',
					end_date: '',
					start_time: '',
					end_time: '',
					auto_cover: 1,
					reason: ''
				}
			}
		},
		onLoad(options) {
			const ids = (options.plan_ids || '').split(',').filter(Boolean)
			this.planIds = ids.map((x) => Number(x))
			const d = options.date || this.fmt(new Date())
			this.form.start_date = d
			this.form.end_date = d
			if (this.planIds.length) this.loadSuggestions()
		},
		methods: {
			fmt(d) {
				const y = d.getFullYear()
				const m = String(d.getMonth() + 1).padStart(2, '0')
				const day = String(d.getDate()).padStart(2, '0')
				return y + '-' + m + '-' + day
			},
			pickDate(which) {
				const cur = which === 'start' ? this.form.start_date : this.form.end_date || this.form.start_date
				// 兼容保留：部分端不支持 picker 时可用手动输入
				uni.showModal({
					title: which === 'start' ? '开始日期' : '结束日期',
					editable: true,
					placeholderText: 'YYYY-MM-DD',
					content: cur || '',
					success: (r) => {
						if (!r.confirm) return
						if (which === 'start') this.onStart((r.content || '').trim())
						else this.onEnd((r.content || '').trim())
					}
				})
			},
			onStart(v) {
				if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
					uni.showToast({ title: '日期格式应为 YYYY-MM-DD', icon: 'none' })
					return
				}
				this.form.start_date = v
				if (!this.form.end_date || this.form.end_date < v) this.form.end_date = v
			},
			onEnd(v) {
				if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
					uni.showToast({ title: '日期格式应为 YYYY-MM-DD', icon: 'none' })
					return
				}
				if (v < this.form.start_date) {
					uni.showToast({ title: '结束日期不能早于开始日期', icon: 'none' })
					return
				}
				this.form.end_date = v
			},
			onPartial(e) {
				this.partial = e.detail.value
				if (!this.partial) {
					this.form.start_time = ''
					this.form.end_time = ''
				}
			},
			onAutoCover(e) {
				this.form.auto_cover = e.detail.value ? 1 : 0
			},
			async loadSuggestions() {
				try {
					const res = await getLeaveSuggestions({ plan_ids: this.planIds.join(','), limit: 3 })
					this.suggestions = res.items || []
				} catch (e) {
					this.suggestions = []
				}
			},
			async submit() {
				if (!this.form.start_date) {
					uni.showToast({ title: '请选择开始日期', icon: 'none' })
					return
				}
				if (this.partial && (!this.form.start_time || !this.form.end_time)) {
					uni.showToast({ title: '请选择请假时段', icon: 'none' })
					return
				}
				this.submitting = true
				try {
					const res = await applyLeave({
						leave_type: this.form.leave_type,
						start_date: this.form.start_date,
						end_date: this.form.end_date || this.form.start_date,
						start_time: this.form.start_time,
						end_time: this.form.end_time,
						plan_ids: this.planIds.join(','),
						auto_cover: this.form.auto_cover,
						reason: this.form.reason
					})
					uni.showToast({
						title: '已提交（' + (res.plan_count || 0) + ' 场）',
						icon: 'success'
					})
					setTimeout(() => {
						uni.redirectTo({ url: '/pages/my-requests/index' })
					}, 800)
				} catch (e) {
					/* request 层已 toast */
				} finally {
					this.submitting = false
				}
			},
			goBack() {
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss" scoped>
.page {
	height: 100vh;
	background: #f4f7f5;
	display: flex;
	flex-direction: column;
}

.topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 96rpx;
	padding: 0 24rpx;
	background: #1a535c;
	color: #fff;
	flex-shrink: 0;
}

.topbar-back {
	width: 64rpx;
	font-size: 48rpx;
	line-height: 96rpx;
}

.topbar-title {
	font-size: 34rpx;
	font-weight: 700;
}

.topbar-holder {
	width: 64rpx;
}

.body {
	flex: 1;
	overflow: hidden;
	padding: 24rpx 32rpx 0;
	box-sizing: border-box;
}

.card {
	background: #fff;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(26, 83, 92, 0.05);
}

.card-title {
	font-size: 26rpx;
	font-weight: 700;
	color: #1a3a3f;
	margin-bottom: 12rpx;
}

.card-title-sub {
	font-size: 20rpx;
	font-weight: 400;
	color: rgba(26, 83, 92, 0.45);
	margin-left: 12rpx;
}

.tabs {
	display: flex;
	gap: 16rpx;
	margin-bottom: 12rpx;
}

.tab {
	flex: 1;
	text-align: center;
	padding: 18rpx 0;
	font-size: 26rpx;
	color: #1a535c;
	background: #eef4f2;
	border-radius: 999rpx;
}

.tab.on {
	background: #1a535c;
	color: #fff;
	font-weight: 700;
}

.hint {
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.55);
	line-height: 30rpx;
}

.row {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 18rpx 0;
	border-bottom: 1rpx solid #f1f5f3;
}

.row:last-child {
	border-bottom: none;
}

.row-label {
	flex: 1;
	font-size: 26rpx;
	color: #1a3a3f;
}

.row-value {
	font-size: 26rpx;
	color: #1a535c;
	font-weight: 600;
}

.row-dash {
	color: rgba(26, 83, 92, 0.4);
}

.row-arrow {
	color: rgba(26, 83, 92, 0.3);
	font-size: 30rpx;
}

.slot {
	padding: 16rpx;
	background: #f7f9f8;
	border-radius: 14rpx;
	margin-bottom: 12rpx;
}

.slot-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.slot-time {
	font-size: 26rpx;
	font-weight: 700;
	color: #1a535c;
}

.slot-tag {
	font-size: 18rpx;
	padding: 3rpx 12rpx;
	border-radius: 999rpx;
}

.slot-tag.ok {
	background: #e6f4ea;
	color: #1f7a3d;
}

.slot-tag.warn {
	background: #fdf1e0;
	color: #b87516;
}

.slot-topic {
	display: block;
	margin-top: 6rpx;
	font-size: 22rpx;
	color: #2c4a4e;
}

.slot-cover {
	display: block;
	margin-top: 6rpx;
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.6);
}

.slot-cover.warn {
	color: #b87516;
}

.empty {
	padding: 24rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.empty-text {
	font-size: 24rpx;
	color: rgba(26, 83, 92, 0.6);
}

.empty-tip {
	font-size: 20rpx;
	color: rgba(26, 83, 92, 0.4);
}

.textarea {
	width: 100%;
	height: 140rpx;
	font-size: 24rpx;
	color: #2c4a4e;
	background: #f7f9f8;
	border-radius: 12rpx;
	padding: 16rpx;
	box-sizing: border-box;
}

.footer {
	padding: 20rpx 0 60rpx;
}

.submit {
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	background: #1a535c;
	color: #fff;
	font-size: 28rpx;
	font-weight: 700;
	border-radius: 999rpx;
}

.submit.disabled {
	background: #b9c9c6;
}
</style>
