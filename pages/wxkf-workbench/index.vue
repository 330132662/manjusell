<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<view class="gf-topbar">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="gf-topbar-mid">
				<text class="gf-title">客服工作台</text>
				<text class="gf-subtitle">会话列表 · {{ customers.length }} 位客户</text>
			</view>
			<view class="topbar-holder">
				<view class="more-btn" @click="toggleMore">···</view>
			</view>
		</view>

		<!-- 标题栏下拉菜单 -->
		<view v-if="moreVisible" class="more-mask" @click="moreVisible = false">
			<view class="more-menu" @click.stop>
				<view class="more-menu-hd">快速切换</view>
				<view class="more-item" @click="goServicePage">
					<text class="more-item-ico ink">话</text>
					<view class="more-item-main">
						<text class="more-item-t">客户会话列表</text>
						<text class="more-item-d">当前 · 会话与消息处理</text>
					</view>
					<text v-if="isCurrentService" class="gf-tag gf-tag-red">当前</text>
				</view>
				<view class="more-item" @click="goDashboard">
					<view class="more-item-ico gold">数</view>
					<view class="more-item-main">
						<text class="more-item-t">客服数据看板</text>
						<text class="more-item-d">统计 · 趋势 · 排行</text>
					</view>
					<text class="more-item-go">›</text>
				</view>
				<view class="more-divider"></view>
				<view class="more-item" @click="goSwitchIdentity">
					<view class="more-item-ico red">换</view>
					<view class="more-item-main">
						<text class="more-item-t">切换身份</text>
						<text class="more-item-d">返回中转页重新选择主播 / 客服</text>
					</view>
					<text class="more-item-go">›</text>
				</view>
			</view>
		</view>

		<!-- 运营公告栏（默认收起，点击展开） -->
		<view class="kf-tip" :class="{ expanded: tipExpanded }">
			<view class="kf-tip-head" @click="toggleTip">
				<text class="kf-tip-icon">🌙</text>
				<text class="kf-tip-title">运营公告</text>
				<text v-if="!tipExpanded" class="kf-tip-summary">· 红线 6 条 · 高风险 6 条</text>
				<text class="kf-tip-arrow">{{ tipExpanded ? '收起' : '展开' }}</text>
			</view>
			<view v-if="tipExpanded" class="kf-tip-body">
				<view class="kf-tip-col">
					<text class="kf-tip-sub red">● 绝对红线〈触碰即重罚〉</text>
					<text v-for="(t, i) in redLines" :key="'r' + i" class="kf-tip-line">{{ i + 1 }}. {{ t }}</text>
				</view>
				<view class="kf-tip-col">
					<text class="kf-tip-sub orange">● 高风险行为〈容易拦截限流〉</text>
					<text v-for="(t, i) in riskLines" :key="'o' + i" class="kf-tip-line">{{ i + 1 }}. {{ t }}</text>
				</view>
			</view>
		</view>

		<!-- 操作条 -->
		<view class="action-bar">
			<view class="search-wrap">
				<text class="search-ico">🔍</text>
				<input class="search-input" v-model="nicknameKeyword" placeholder="搜索昵称 / ID" placeholder-class="ph" />
			</view>
			<view class="action-icons">
				<view class="act-btn" :class="{ on: notifyOn }" @click="toggleDesktopNotify">铃</view>
				<view class="act-btn" @click="readAll">读</view>
				<view class="act-btn" @click="reload">刷</view>
			</view>
		</view>

		<scroll-view scroll-y class="gf-scroll" refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onPullRefresh">
			<view class="gf-pad list-pad">
				<view v-if="loading && !customers.length" class="gf-state">
					<text class="gf-state-text">加载中…</text>
				</view>
				<view v-else-if="!filteredCustomers.length" class="gf-state">
					<text class="gf-state-ico">💬</text>
					<text class="gf-state-text">{{ nicknameKeyword ? '未找到客户' : '暂无会话' }}</text>
				</view>
				<view v-else class="gf-card customer-card" v-for="c in filteredCustomers" :key="c.external_userid"
					@click="openChat(c)" @longpress="openCustomerMenu(c)">
					<view class="c-head">
						<view class="c-avatar" :style="{ background: avatarUrl(c) ? 'transparent' : avatarColor(c) }">
							<image v-if="avatarUrl(c)" class="c-avatar-img" :src="avatarUrl(c)" mode="aspectFill"></image>
							<text v-else>{{ avatarText(c) }}</text>
						</view>
						<view class="c-mid">
							<view class="c-name-row">
								<view class="c-name">
									<text class="c-name-remark">{{ c.remark || c.nickname || '访客' }}</text>
									<text v-if="showNick(c)" class="c-name-nick">（{{ c.nickname }}）</text>
								</view>
								<text v-if="c.unread > 0" class="c-unread">{{ c.unread > 99 ? '99+' : c.unread }}</text>
							</view>
							<text class="c-preview">{{ c.last_msg_content || '暂无消息' }}</text>
						</view>
						<text class="c-time">{{ shortTime(c.last_msg_time) }}</text>
					</view>
					<view class="c-foot">
						<text v-if="c.session_count > 1" class="gf-tag gf-tag-ink">{{ c.session_count }} 个会话</text>
						<text v-if="c.auto_reply === false" class="gf-tag gf-tag-gray">自动回复已关</text>
						<text v-if="c.order_check_status" class="gf-tag" :class="orderStatusClass(c.order_check_status)">{{ orderStatusLabel(c.order_check_status) }}</text>
						<text class="c-admin">{{ c.last_msg_admin_name || c.last_admin_name || '' }}</text>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 客户备注弹窗 -->
		<view v-if="remarkVisible" class="gf-mask" @click="remarkVisible = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd"><text>客户备注</text><text class="gf-sheet-x" @click="remarkVisible = false">✕</text></view>
				<view class="gf-sheet-bd">
					<textarea class="gf-textarea" v-model="remarkText" placeholder="填写备注，留空清除" placeholder-class="ph" />
				</view>
				<view class="gf-sheet-ft">
					<view class="gf-btn gf-btn-ghost" @click="remarkVisible = false">取消</view>
					<view class="gf-btn gf-btn-primary" @click="saveRemark">保存</view>
				</view>
			</view>
		</view>

		<!-- 自定义长按菜单（替代后台右键） -->
		<view v-if="menuVisible" class="ctx-mask" @click="menuVisible = false">
			<view class="ctx-menu" :style="{ left: menuX + 'px', top: menuY + 'px' }" @click.stop>
				<view class="ctx-item" @click="openChat(menuCustomer)">进入会话</view>
				<view class="ctx-item" @click="onClickAddRemark">添加 / 编辑备注</view>
				<view class="ctx-item" @click="toggleAutoReply(menuCustomer)">{{ menuCustomer && menuCustomer.auto_reply === false ? '开启自动回复' : '关闭自动回复' }}</view>
				<view class="ctx-item" @click="openOrderStatus(menuCustomer)">标记订单状态</view>
			</view>
		</view>

		<!-- 订单状态选择弹层 -->
		<view v-if="orderStatusVisible" class="gf-mask" @click="orderStatusVisible = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd"><text>标记订单状态</text><text class="gf-sheet-x" @click="orderStatusVisible = false">✕</text></view>
				<scroll-view scroll-y class="gf-sheet-bd">
					<view v-for="opt in orderOptions" :key="opt.value" class="os-item"
						:class="{ on: orderStatusCustomer && (orderStatusCustomer.order_check_status || '') === opt.value }"
						@click="chooseOrderStatus(opt)">
						<text class="gf-tag" :class="'gf-tag-' + (opt.tone === 'orange' ? 'gold' : opt.tone === 'blue' ? 'ink' : opt.tone === 'green' ? 'ink' : opt.tone)">{{ opt.label }}</text>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getSessionList, readAllSessions, setAutoReply, setOrderStatus, setCustomerRemark
	} from '@/api/wxkf'
	import {
		backToEntry,
		enterWorkspace,
		SERVICE_PAGE,
		SERVICE_DASHBOARD_PAGE
	} from '@/utils/auth'
	import { kfOrderStatusLabel, kfOrderStatusGfClass, KF_ORDER_STATUS_OPTIONS } from '@/utils/wxkf-order'

	export default {
		data() {
			return {
				customers: [],
				loading: false,
				refreshing: false,
				nicknameKeyword: '',
				moreVisible: false,
				isCurrentService: true,
				tipExpanded: false,
				notifyOn: false,
				timer: null,
				remarkVisible: false,
				remarkText: '',
				remarkCustomer: null,
				menuVisible: false,
				menuX: 0,
				menuY: 0,
				menuCustomer: null,
				orderOptions: KF_ORDER_STATUS_OPTIONS,
				orderStatusVisible: false,
				orderStatusCustomer: null,
				autoReplyPending: {},
				orderStatusPending: {},
				// 运营公告静态文案（后台 index.vue 原样迁移）
				redLines: [
					'引导站外：私发微信/企微、群二维码、外网链接、收款码，引导脱离平台交易、私下转账',
					'敏感内容：涉黄赌毒、暴力、政治敏感、造谣、诋毁平台/竞品',
					'侵权违规：发送盗版资料、扫描件、无授权素材',
					'资质越界：擅自提供医疗、法律、金融等无资质咨询',
					'隐私泄露：外传客户手机号、地址、订单信息',
					'冒充官方：谎称微信、小店平台工作人员'
				],
				riskLines: [
					'利诱好评：索要好评截图、用福利换好评',
					'虚假宣传：夸大课程效果、承诺超出商品范围的服务',
					'乱发小程序：非订单交付场景、非同主体小程序卡片主动推送',
					'骚扰群发：批量发送广告、无关营销消息',
					'冲突激化：和客户争吵、言语过激，不按标准话术应对负面情绪',
					'违规素材：随意发送无关图片、视频'
				]
			}
		},
		onLoad() {
			this.load()
			this.timer = setInterval(() => this.load(true), 10000)
		},
		onShow() {
			this.load(true)
		},
		onUnload() {
			if (this.timer) clearInterval(this.timer)
		},
		computed: {
			filteredCustomers() {
				const kw = (this.nicknameKeyword || '').trim().toLowerCase()
				if (!kw) return this.customers
				return this.customers.filter((c) =>
					(c.nickname || '').toLowerCase().indexOf(kw) !== -1 ||
					c.external_userid.toLowerCase().indexOf(kw) !== -1 ||
					(c.remark || '').toLowerCase().indexOf(kw) !== -1
				)
			}
		},
		methods: {
			async load(silent = false) {
				if (!silent) this.loading = true
				try {
					const res = await getSessionList()
					const items = (res && res.items) || []
					// 轮询时保留正在编辑的本地乐观值（自动回复/订单状态）
					this.customers = items.map((it) => {
						const old = this.customers.find((c) => c.external_userid === it.external_userid)
						const o = {}
						if (old && this.autoReplyPending[it.external_userid]) o.auto_reply = old.auto_reply
						if (old && this.orderStatusPending[it.external_userid]) o.order_check_status = old.order_check_status
						return Object.assign({}, it, o)
					})
				} catch (e) {
				} finally {
					this.loading = false
					this.refreshing = false
				}
			},
			reload() { this.load() },
			onPullRefresh() { this.refreshing = true; this.load() },
			toggleTip() { this.tipExpanded = !this.tipExpanded },
			shortTime(t) {
				if (!t) return ''
				return String(t).slice(5, 16)
			},
			avatarText(c) {
				const n = c.remark || c.nickname || c.external_userid || '客'
				return String(n).slice(-2)
			},
			/** 微信头像：http 升级为 https，避免混合内容被拦截；无头像返回空串走文字兜底 */
			avatarUrl(c) {
				const s = c && c.avatar ? String(c.avatar).trim() : ''
				if (!s) return ''
				return s.indexOf('http://') === 0 ? 'https://' + s.slice(7) : s
			},
			/** 备注后是否仍需展示微信昵称：两者都存在且不一致时展示，避免重复 */
			showNick(c) {
				return !!(c && c.remark && c.nickname && c.remark !== c.nickname)
			},
			avatarColor(c) {
				const id = c.external_userid || ''
				let h = 0
				for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360
				return `hsl(${h}, 32%, 42%)`
			},
			orderStatusLabel(code) { return kfOrderStatusLabel(code) },
			orderStatusClass(code) {
				return kfOrderStatusGfClass(code)
			},
			openChat(c) {
				this.menuVisible = false
				uni.navigateTo({
					url: '/pages/wxkf-chat/index?external_userid=' + encodeURIComponent(c.external_userid) +
						'&nickname=' + encodeURIComponent(c.remark || c.nickname || '访客')
				})
			},
			// 长按打开菜单（替代右键），取触摸坐标
			openCustomerMenu(c) {
				this.menuCustomer = c
				const q = uni.createSelectorQuery && uni.createSelectorQuery()
				// 长按事件在 uni 端无坐标参数，默认居中显示
				this.menuX = (uni.getSystemInfoSync().windowWidth - 200) / 2
				this.menuY = uni.getSystemInfoSync().windowHeight / 2
				this.menuVisible = true
			},
			onClickAddRemark() {
				this.menuVisible = false
				this.remarkCustomer = this.menuCustomer
				this.remarkText = this.menuCustomer.remark || ''
				this.remarkVisible = true
			},
			async saveRemark() {
				const c = this.remarkCustomer
				if (!c) return
				try {
					await setCustomerRemark({ external_userid: c.external_userid, remark: this.remarkText })
					c.remark = this.remarkText
					this.remarkVisible = false
					uni.showToast({ title: '已保存', icon: 'success' })
				} catch (e) {}
			},
			// 自动回复开关：乐观更新 + 失败回滚
			async toggleAutoReply(c) {
				this.menuVisible = false
				if (!c || this.autoReplyPending[c.external_userid]) return
				const prev = c.auto_reply !== false
				const next = !prev
				c.auto_reply = next
				this.autoReplyPending[c.external_userid] = true
				try {
					await setAutoReply({ external_userid: c.external_userid, enabled: next })
					uni.showToast({ title: next ? '已开启自动回复' : '已关闭自动回复', icon: 'none' })
				} catch (e) {
					c.auto_reply = prev // 失败回滚
				} finally {
					setTimeout(() => { delete this.autoReplyPending[c.external_userid] }, 2000)
				}
			},
			openOrderStatus(c) {
				this.menuVisible = false
				this.orderStatusCustomer = c
				this.orderStatusVisible = true
			},
			// 订单状态标记：乐观更新 + 失败回滚
			async chooseOrderStatus(opt) {
				const c = this.orderStatusCustomer
				this.orderStatusVisible = false
				if (!c || this.orderStatusPending[c.external_userid]) return
				const prev = c.order_check_status || ''
				const next = opt.value
				c.order_check_status = next
				this.orderStatusPending[c.external_userid] = true
				try {
					await setOrderStatus({ external_userid: c.external_userid, status: next })
					uni.showToast({ title: next ? '已标记：' + opt.label : '已清除标记', icon: 'none' })
				} catch (e) {
					c.order_check_status = prev // 失败回滚
				} finally {
					setTimeout(() => { delete this.orderStatusPending[c.external_userid] }, 2000)
				}
			},
			async readAll() {
				try {
					await readAllSessions()
					uni.showToast({ title: '已全部已读', icon: 'success' })
					this.load(true)
				} catch (e) {}
			},
			// uni 端无 Web Notification，降级为本地开关提示（不确定项，见迁移规格第三节）
			toggleDesktopNotify() {
				this.notifyOn = !this.notifyOn
				uni.showToast({
					title: this.notifyOn ? '已开启提醒（依赖 App 推送）' : '已关闭提醒',
					icon: 'none'
				})
			},
			/** 标题栏下拉 */
			toggleMore() {
				this.moreVisible = !this.moreVisible
			},
			/** 客服其他页面：会话列表（当前页） */
			goServicePage() {
				this.moreVisible = false
				if (this.isCurrentService) return
				enterWorkspace(SERVICE_PAGE)
			},
			/** 客服其他页面：数据看板 */
			goDashboard() {
				this.moreVisible = false
				enterWorkspace(SERVICE_DASHBOARD_PAGE)
			},
			/** 切换身份：回中转页重新选择 */
			goSwitchIdentity() {
				this.moreVisible = false
				backToEntry()
			},
			goBack() { backToEntry() }
		}
	}
</script>

<style lang="scss" scoped>
	@import '../../styles/guofeng-vars.scss';

	.page { height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
	.topbar-holder { width: 64rpx; display: flex; align-items: center; justify-content: flex-end; }
	.more-btn {
		width: 56rpx; height: 56rpx; line-height: 48rpx; text-align: center;
		font-size: 30rpx; font-weight: 700; letter-spacing: 2rpx;
		color: $gf-cinnabar; border: 1rpx solid $gf-line; border-radius: 10rpx;
		background: $gf-card;
		&:active { background: rgba(178, 58, 46, 0.06); }
	}

	/* 标题栏下拉 */
	.more-mask {
		position: fixed; left: 0; right: 0; top: 0; bottom: 0; z-index: 90;
	}
	.more-menu {
		position: fixed; right: 20rpx;
		top: calc(var(--gf-capsule-safe, 96rpx) + 96rpx);
		width: 480rpx;
		background: $gf-card; border: 1rpx solid $gf-line; border-radius: 14rpx;
		box-shadow: 0 12rpx 36rpx rgba(26, 24, 21, 0.16);
		padding: 8rpx 0; overflow: hidden;
	}
	.more-menu-hd {
		padding: 16rpx 24rpx 12rpx;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		font-size: 24rpx; font-weight: 700; color: $gf-ink; letter-spacing: 2rpx;
	}
	.more-item {
		display: flex; align-items: center; gap: 16rpx;
		padding: 20rpx 24rpx;
		&:active { background: rgba(201, 162, 75, 0.08); }
	}
	.more-item-ico {
		flex-shrink: 0; width: 52rpx; height: 52rpx; line-height: 52rpx; text-align: center;
		border-radius: 8rpx; font-size: 24rpx; font-weight: 700;
		font-family: 'STKaiti', 'Kaiti SC', 'KaiTi', '楷体', serif;
		&.ink { color: $gf-indigo; border: 2rpx solid $gf-indigo; background: rgba(58, 74, 82, 0.06); }
		&.gold { color: #8a6a1f; border: 2rpx solid $gf-gold; background: rgba(201, 162, 75, 0.1); }
		&.red { color: $gf-cinnabar; border: 2rpx solid $gf-cinnabar; background: rgba(178, 58, 46, 0.06); }
	}
	.more-item-main { flex: 1; display: flex; flex-direction: column; gap: 6rpx; }
	.more-item-t { font-size: 27rpx; font-weight: 600; color: $gf-ink; }
	.more-item-d { font-size: 20rpx; color: $gf-ink-3; }
	.more-item-go { font-size: 38rpx; color: $gf-ink-3; }
	.more-divider { height: 1rpx; background: $gf-line-soft; margin: 8rpx 24rpx; }

	/* 运营公告 */
	.kf-tip {
		flex-shrink: 0;
		margin: 16rpx 28rpx 0;
		background: $gf-card;
		border: 1rpx solid $gf-line;
		border-radius: 12rpx;
		overflow: hidden;
	}
	.kf-tip-head { display: flex; align-items: center; gap: 10rpx; padding: 18rpx 20rpx; }
	.kf-tip-icon { font-size: 26rpx; }
	.kf-tip-title { font-size: 26rpx; font-weight: 700; color: $gf-ink; }
	.kf-tip-summary { flex: 1; font-size: 20rpx; color: $gf-ink-3; }
	.kf-tip-arrow { font-size: 20rpx; color: $gf-cinnabar; }
	.kf-tip-body { padding: 0 20rpx 20rpx; }
	.kf-tip-col { margin-top: 16rpx; }
	.kf-tip-sub { display: block; font-size: 22rpx; font-weight: 700; margin-bottom: 8rpx; }
	.kf-tip-sub.red { color: $gf-cinnabar; }
	.kf-tip-sub.orange { color: #c97a1e; }
	.kf-tip-line { display: block; font-size: 20rpx; line-height: 1.7; color: $gf-ink-2; }

	/* 操作条 */
	.action-bar { flex-shrink: 0; display: flex; gap: 14rpx; align-items: center; padding: 16rpx 28rpx; }
	.search-wrap {
		flex: 1; display: flex; align-items: center; gap: 10rpx; height: 72rpx;
		background: $gf-card; border: 1rpx solid $gf-line-soft; border-radius: 10rpx; padding: 0 18rpx;
	}
	.search-ico { font-size: 24rpx; }
	.search-input { flex: 1; font-size: 25rpx; color: $gf-ink; }
	.ph { color: $gf-ink-3; }
	.action-icons { display: flex; gap: 8rpx; }
	.act-btn {
		width: 64rpx; height: 64rpx; line-height: 64rpx; text-align: center;
		font-size: 24rpx; color: $gf-ink-2; border: 1rpx solid $gf-line;
		border-radius: 10rpx; background: $gf-card;
	}
	.act-btn.on { color: #fdf6e6; background: $gf-cinnabar; border-color: $gf-gold; }

	.list-pad { padding-top: 4rpx; }
	.customer-card { padding: 22rpx 20rpx; }
	.c-head { display: flex; align-items: center; gap: 16rpx; }
	.c-avatar {
		flex-shrink: 0; width: 76rpx; height: 76rpx; border-radius: 12rpx;
		display: flex; align-items: center; justify-content: center;
		color: #fdf6e6; font-size: 24rpx; font-weight: 700;
		overflow: hidden;
	}
	.c-avatar-img { width: 100%; height: 100%; display: block; }
	.c-mid { flex: 1; min-width: 0; }
	.c-name-row { display: flex; align-items: center; gap: 12rpx; }
	.c-name { flex: 1; min-width: 0; font-size: 27rpx; font-weight: 600; color: $gf-ink; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.c-name-remark { color: $gf-ink; }
	.c-name-nick { margin-left: 6rpx; font-size: 22rpx; font-weight: 400; color: $gf-ink-3; }
	.c-unread {
		flex-shrink: 0; min-width: 34rpx; height: 34rpx; line-height: 34rpx; text-align: center;
		padding: 0 8rpx; font-size: 20rpx; color: #fdf6e6; background: $gf-cinnabar; border-radius: 999rpx;
	}
	.c-preview { display: block; margin-top: 8rpx; font-size: 22rpx; color: $gf-ink-3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.c-time { flex-shrink: 0; font-size: 19rpx; color: $gf-ink-3; }
	.c-foot { display: flex; align-items: center; flex-wrap: wrap; gap: 10rpx; margin-top: 16rpx; }
	.c-admin { margin-left: auto; font-size: 19rpx; color: $gf-ink-3; }

	/* 备注弹窗 */
	.gf-sheet { width: 84vw; }
	.gf-sheet-bd { padding: 10rpx 0 20rpx; }
	.gf-sheet-ft { display: flex; gap: 16rpx; }
	.gf-sheet-ft .gf-btn { flex: 1; }

	/* 长按菜单 */
	.ctx-mask { position: fixed; inset: 0; z-index: 99; }
	.ctx-menu {
		position: absolute; width: 200rpx; background: $gf-card;
		border: 1rpx solid $gf-line; border-radius: 12rpx; overflow: hidden;
		box-shadow: 0 8rpx 30rpx rgba(26, 24, 21, 0.18);
	}
	.ctx-item { padding: 22rpx 24rpx; font-size: 25rpx; color: $gf-ink; border-bottom: 1rpx solid $gf-line-soft; }
	.ctx-item:last-child { border-bottom: none; }

	/* 订单状态选择 */
	.os-item { padding: 18rpx 20rpx; margin-bottom: 8rpx; border: 1rpx solid $gf-line-soft; border-radius: 8rpx; }
	.os-item.on { border-color: $gf-cinnabar; background: rgba(178, 58, 46, 0.05); }
</style>
