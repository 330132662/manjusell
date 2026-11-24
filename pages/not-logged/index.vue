<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="gf-topbar-mid">
				<text class="gf-title">鼎耀工作台</text>
				<!-- <text class="gf-subtitle">公告 · 登录</text> -->
			</view>
			<view class="topbar-holder"></view>
		</view>

		<scroll-view scroll-y class="gf-scroll">
			<view class="gf-pad">
				<!-- ===== 上：公告板（暂时隐藏） ===== -->
				<view v-if="false" class="gf-card board">
					<view class="gf-card-title">
						<text>公告板</text>
						<text class="gf-card-title-sub">{{ notices.length }} 则公告</text>
					</view>

					<view class="board-lead">
						<text class="board-lead-mark">告</text>
						<text class="board-lead-text">欢迎来到企业工作台，如果您是学员，请通过购买渠道联系陪跑老师。</text>
					</view>

					<view v-if="notices.length">
						<view v-for="item in notices" :key="item.id" class="notice"
							:class="{ open: expandedId === item.id }" @click="toggleNotice(item.id)">
							<view class="notice-head">
								<text class="notice-tag" :class="item.tagClass">{{ item.tag }}</text>
								<text class="notice-title">{{ item.title }}</text>
								<text class="notice-arrow">{{ expandedId === item.id ? '收起' : '展开' }}</text>
							</view>
							<text class="notice-date">{{ item.date }}</text>
							<view v-if="expandedId === item.id" class="notice-body">
								<text class="notice-content">{{ item.content }}</text>
							</view>
						</view>
					</view>
					<view v-else class="gf-state small">
						<text class="gf-state-text">暂无公告</text>
					</view>
				</view>

				<!-- ===== 学员中心入口（暂时跳转 anchor-mine） ===== -->
				<view class="student-card" @click="go('/pages/contact-teacher/index')">
					<view class="login-card-hd">
						<view class="gf-seal student-seal">学</view>
						<view class="login-card-hd-txt">
							<text class="login-card-title">学员中心</text>
							<text class="login-card-sub">课程学习 · 学习进度</text>
						</view>
					</view>
					<text class="login-card-desc">查看课程 · 跟进学习进度</text>
					<button class="gf-btn-main student-btn">进入学员中心</button>
				</view>

				<!-- ===== 下：登录入口 ===== -->
				<view class="login-card">
					<view class="login-card-hd">
						<view class="gf-seal">播</view>
						<view class="login-card-hd-txt">
							<text class="login-card-title">登录入口</text>
							<text class="login-card-sub">请由此登录工作台</text>
						</view>
					</view>

					<text class="login-card-desc">排班开播 · 客户服务</text>

					<button class="gf-btn-main login-btn" @click="goAnchorLogin">
						进入登录
					</button>
					<!-- <text class="login-hint">请使用账号密码登录，登录后方可进入工作台</text> -->
				</view>

				<!-- <text class="gf-hint gf-hint-c">浏览公告无需登录；如需相关操作，请从上方入口登录。</text> -->

				<!-- ===== 底部：视频播放器（COS 视频，不自动播放） ===== -->
				<view class="gf-card video-card">
					<view class="gf-card-title">
						<text>{{ videoTitle }}</text>
						<text v-if="videoUrl" class="gf-card-title-sub">点击播放</text>
					</view>

					<video v-if="videoUrl" class="video-player" :src="videoUrl" :poster="videoPoster" :autoplay="false"
						:controls="true" :show-play-btn="true" :show-fullscreen-btn="true"
						:enable-progress-gesture="true" object-fit="contain" @error="onVideoError"></video>
					<view v-else class="video-placeholder">
						<text class="video-placeholder-ico">▶</text>
						<text class="video-placeholder-text">视频地址未配置</text>
						<text class="video-placeholder-sub">请在 utils/config.js 填写 COS_VIDEO_URL</text>
					</view>

				</view>
				<!-- 联系技术老师：小程序端用企业微信官方「联系我」插件，点击展示企微二维码 -->
			<!-- #ifdef MP-WEIXIN -->
			<view v-if="contactPlugId" class="contact-card gf-card">
				<view class="gf-card-title">
					<text>联系技术老师</text>
					<text class="gf-card-title-sub">点击添加企业微信</text>
				</view>
				<contact-cell
					:plugid="contactPlugId"
					@startmessage="onContactStart"
					@completemessage="onContactComplete"
				></contact-cell>
			</view>
			<!-- #endif -->

			<!-- #ifndef MP-WEIXIN -->
			<view class="gf-li" @click="go('/pages/contact-teacher/index')">
				<view class="gf-li-ico red">师</view>
				<view class="gf-li-main">
					<text class="gf-li-t">联系技术老师</text>
					<text class="gf-li-d">开播 / 设备 / 账号问题一对一解答</text>
				</view>
				<text class="gf-li-go">›</text>
			</view>
			<!-- #endif -->
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		goLoginPage,
		isLogged,
		HOME_PAGE
	} from '@/utils/auth'
	import {
		COS_VIDEO_URL,
		COS_VIDEO_POSTER,
		COS_VIDEO_TITLE,
		WECOM_CONTACT_PLUGID
	} from '@/utils/config'

	export default {
		onLoad() {
			// 已登录用户不应停留在未登录页（如冷启动落到首页），直接回工作台
			if (isLogged()) {
				uni.reLaunch({
					url: HOME_PAGE
				})
			}
		},
		data() {
			return {
				expandedId: 0,
				videoUrl: COS_VIDEO_URL,
				videoPoster: COS_VIDEO_POSTER,
				videoTitle: COS_VIDEO_TITLE || '视频介绍',
				// 企业微信「联系我」插件 plugid（utils/config.js），为空时小程序端不渲染插件入口
				contactPlugId: WECOM_CONTACT_PLUGID || '',
				notices: [

					{
						id: 3,
						tag: '测评',
						tagClass: 'gf-tag-ink',
						title: '本月结业测评时间安排',
						date: '2026-11-08',
						content: '本月结业测评定于 11 月 28 日 19:00 开始，请留意个人排班与站内提醒，提前做好复习准备。'
					},

				]
			}
		},
		methods: {
			toggleNotice(id) {
				this.expandedId = this.expandedId === id ? 0 : id
			},
			goAnchorLogin() {
				goLoginPage()
			},
			onVideoError() {
				uni.showToast({
					title: '视频加载失败，请稍后重试',
					icon: 'none'
				})
			},
			go(url) {
				uni.navigateTo({
					url
				})
			},
			/** 「联系我」插件：点击开始 */
			onContactStart() {},
			/** 「联系我」插件：点击完成回调，非 0 为异常（-3002 配置获取失败 / -3006 已是好友走二维码展示 等） */
			onContactComplete(e) {
				const r = (e && e.detail) || {}
				if (r.errcode !== 0) {
					uni.showToast({
						title: '拉起添加失败(' + (r.errcode || '?') + ')，请稍后重试',
						icon: 'none'
					})
				}
			},
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

	/* 公告板 */
	.board-lead {
		display: flex;
		align-items: flex-start;
		gap: 14rpx;
		padding: 16rpx 18rpx;
		margin-bottom: 8rpx;
		background: rgba(201, 162, 75, 0.1);
		border: 1rpx solid $gf-line-soft;
		border-radius: 10rpx;
	}

	.board-lead-mark {
		flex-shrink: 0;
		width: 40rpx;
		height: 40rpx;
		line-height: 40rpx;
		text-align: center;
		font-size: 22rpx;
		font-weight: 700;
		color: $gf-cinnabar;
		border: 2rpx solid $gf-cinnabar;
		border-radius: 6rpx;
		background: rgba(178, 58, 46, 0.06);
	}

	.board-lead-text {
		flex: 1;
		font-size: 23rpx;
		line-height: 1.6;
		color: $gf-ink-2;
	}

	.notice {
		padding: 20rpx 4rpx;
		border-bottom: 1rpx solid $gf-line-soft;
	}

	.notice-head {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.notice-tag {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		height: 38rpx;
		padding: 0 14rpx;
		border-radius: 6rpx;
		font-size: 20rpx;
		line-height: 1;
		letter-spacing: 1rpx;
	}

	.notice-title {
		flex: 1;
		font-size: 27rpx;
		font-weight: 600;
		color: $gf-ink;
		line-height: 1.4;
	}

	.notice-arrow {
		flex-shrink: 0;
		font-size: 21rpx;
		color: $gf-ink-3;
	}

	.notice-date {
		display: block;
		margin-top: 10rpx;
		margin-left: 2rpx;
		font-size: 21rpx;
		color: $gf-ink-3;
	}

	.notice-body {
		margin-top: 14rpx;
		padding: 16rpx 18rpx;
		background: rgba(255, 255, 255, 0.7);
		border-left: 4rpx solid $gf-gold;
		border-radius: 0 8rpx 8rpx 0;
	}

	.notice-content {
		font-size: 24rpx;
		line-height: 1.7;
		color: $gf-ink-2;
	}

	/* 学员中心入口 */
	.student-card {
		position: relative;
		background: $gf-card;
		border: 1rpx solid $gf-line;
		border-radius: 18rpx;
		padding: 30rpx 28rpx 28rpx;
		margin-bottom: 22rpx;
		box-shadow: 0 8rpx 24rpx rgba(58, 74, 82, 0.08);
		overflow: hidden;
	}

	.student-card::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 6rpx;
		background: linear-gradient(90deg, $gf-ink 0%, $gf-gold 60%, rgba(201, 162, 75, 0.2) 100%);
	}

	.student-seal {
		background: rgba(58, 74, 82, 0.08);
		border-color: $gf-ink;
		color: $gf-ink;
	}

	.student-btn {
		width: 100%;
		background: linear-gradient(90deg, $gf-ink 0%, #2e3a41 100%);
	}

	/* 登录入口 */
	.login-card {
		position: relative;
		background: $gf-card;
		border: 1rpx solid $gf-line;
		border-radius: 18rpx;
		padding: 30rpx 28rpx 28rpx;
		margin-bottom: 22rpx;
		box-shadow: 0 8rpx 24rpx rgba(178, 58, 46, 0.08);
		overflow: hidden;
	}

	.login-card::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 6rpx;
		background: linear-gradient(90deg, $gf-cinnabar 0%, $gf-gold 60%, rgba(201, 162, 75, 0.2) 100%);
	}

	.login-card-hd {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.login-card-hd-txt {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.login-card-title {
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 34rpx;
		font-weight: 700;
		color: $gf-ink;
		letter-spacing: 2rpx;
	}

	.login-card-sub {
		font-size: 22rpx;
		color: $gf-ink-3;
	}

	.login-card-desc {
		display: block;
		margin: 20rpx 0 24rpx;
		font-size: 24rpx;
		line-height: 1.6;
		color: $gf-ink-2;
	}

	.login-btn {
		width: 100%;
	}

	.login-hint {
		display: block;
		margin-top: 18rpx;
		text-align: center;
		font-size: 20rpx;
		color: $gf-ink-3;
	}

	/* 视频播放器 */
	.video-card {
		padding-bottom: 20rpx;
	}

	.video-player {
		display: block;
		width: 100%;
		/* rpx 随屏宽等比缩放，接近 16:9；不用 padding 撑高以兼容小程序/App 原生 video */
		height: 390rpx;
		background: #000;
		border-radius: 10rpx;
	}

	.video-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 360rpx;
		background: rgba(58, 74, 82, 0.06);
		border: 1rpx dashed $gf-line;
		border-radius: 10rpx;
	}

	.video-placeholder-ico {
		width: 80rpx;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		border-radius: 50%;
		border: 2rpx solid $gf-line;
		font-size: 34rpx;
		color: $gf-cinnabar;
		padding-left: 4rpx;
	}

	.video-placeholder-text {
		margin-top: 18rpx;
		font-size: 26rpx;
		color: $gf-ink-2;
	}

	.video-placeholder-sub {
		margin-top: 8rpx;
		font-size: 20rpx;
		color: $gf-ink-3;
	}
</style>
