<template>
	<view class="page gf-page" :style="capsuleSafeStyle">
		<!-- 聊天头 -->
		<view class="chat-head">
			<view class="gf-back" @click="goBack">‹</view>
			<view class="ch-avatar">
				<image v-if="avatar" class="ch-avatar-img" :src="avatarUrl(avatar)" mode="aspectFill"></image>
				<text v-else class="ch-avatar-txt">{{ avatarText }}</text>
			</view>
			<view class="ch-mid">
				<view class="ch-name-row">
					<text class="ch-name">{{ displayName }}</text>
					<text v-if="!autoReply" class="ch-off-tag">自动回复已关</text>
				</view>
				<text class="ch-id">ID {{ shortId }}</text>
			</view>
			<view class="ch-acts">
				<view class="ch-act" @click="openRemark">备</view>
				<view class="ch-act" @click="openOrders">单</view>
				<view class="ch-act" @click="openProfile">析</view>
				<view class="ch-act" @click="openTakeover">接</view>
			</view>
		</view>

		<!-- 客户状态栏：自动回复开关 + 备注 -->
		<view class="cust-bar">
			<view class="cust-bar-item">
				<text class="cust-bar-label">自动回复</text>
				<switch class="cust-switch" :checked="autoReply" :disabled="autoReplyPending" color="#b23a2e" @change="toggleAutoReply" />
			</view>
			<view class="cust-bar-sep"></view>
			<view class="cust-bar-item grow" @click="openRemark">
				<text class="cust-bar-label">用户备注</text>
				<text class="cust-bar-value">{{ remark || '未设置，点击添加' }}</text>
				<text class="cust-bar-go">›</text>
			</view>
		</view>

		<!-- 会话切换条 -->
		<scroll-view scroll-x class="session-bar" v-if="sessions.length > 1">
			<view class="sess-chip" :class="{ on: activeKey === ALL_KEY }" @click="switchSession(ALL_KEY)">全部会话</view>
			<view v-for="s in sessions" :key="s.session_key" class="sess-chip"
				:class="{ on: activeKey === s.session_key }" @click="switchSession(s.session_key)">
				{{ s.open_kfid_label || s.open_kfid }}
				<text v-if="s.unread > 0" class="sess-unread">{{ s.unread }}</text>
			</view>
		</scroll-view>

		<!-- 会话内搜索 -->
		<view class="msg-search">
			<text class="search-ico">🔍</text>
			<input class="msg-search-input" v-model="contentKeyword" placeholder="搜索本客户消息" placeholder-class="ph" />
			<text v-if="contentKeyword" class="search-clear" @click="contentKeyword = ''">✕</text>
		</view>

		<!-- 消息区 -->
		<scroll-view scroll-y class="msg-scroll" :scroll-into-view="scrollAnchor" scroll-with-animation>
			<view class="msg-pad">
				<view v-if="loading && !displayMessages.length" class="gf-state">
					<text class="gf-state-text">加载中…</text>
				</view>
				<view v-else-if="!displayMessages.length" class="gf-state">
					<text class="gf-state-text">{{ contentKeyword ? '未找到匹配消息' : '暂无消息' }}</text>
				</view>

				<view v-for="(m, i) in displayMessages" :key="m.id || m.msgid || i" :id="'msg-' + i" class="msg-row"
					:class="{ right: m.direction == 2, hit: m._isHit }">
					<!-- 会话分隔条 -->
					<view v-if="showDivider(m, i)" class="session-divider">{{ dividerText(m) }}</view>

					<view class="msg-bubble" :class="{ mine: m.direction == 2 }" @longpress="onMsgLongPress(m)">
						<!-- 引用回复: 后端落库 reply_to_id; 客户在微信里看到的是服务端拼的纯文本引用前缀 -->
						<view v-if="m.reply_to_id" class="msg-quote" @click.stop="jumpToQuote(m)">
							<text class="msg-quote-who">{{ quoteWhoOf(quotedMessageOf(m)) }}</text>
							<text class="msg-quote-text">{{ quoteSummaryOf(quotedMessageOf(m)) }}</text>
						</view>
						<!-- 文本 -->
						<view v-if="isText(m)" class="msg-text" v-html="renderText(m)"></view>
						<!-- 图片 -->
						<view v-else-if="m.msg_type === 'image'" class="msg-media" @click="previewImage(m)">
							<image class="msg-img" :src="mediaSrc(m)" mode="widthFix" />
						</view>
						<!-- 语音 -->
						<view v-else-if="m.msg_type === 'voice'" class="msg-voice" @click="analyzeVoiceMsg(m)">
							<text class="voice-ico">▶</text>
							<text>语音 · 点击转文字</text>
						</view>
						<!-- 视频 -->
						<view v-else-if="m.msg_type === 'video'" class="msg-media" @click="previewVideo(m)">
							<text class="media-ph">▶ 视频 · 点击播放</text>
						</view>
						<!-- 文件 -->
						<view v-else-if="m.msg_type === 'file'" class="msg-file" @click="openFile(m)">
							<text class="file-ico">📄</text>
							<view><text class="file-name">{{ fileNameOf(m) }}</text><text class="file-size">{{ fileSizeOf(m) }}</text></view>
						</view>
						<!-- 图文链接 -->
						<view v-else-if="m.msg_type === 'link'" class="msg-link" @click="openLink(m)">
							<text class="link-title">{{ contentObj(m).title || '链接' }}</text>
							<text class="link-desc">{{ contentObj(m).desc || contentObj(m).description || '' }}</text>
							<text class="link-url">{{ contentObj(m).url || '' }}</text>
						</view>
						<!-- 菜单 -->
						<view v-else-if="m.msg_type === 'msgmenu'" class="msg-menu">
							<text v-if="contentObj(m).head_content" class="menu-head">{{ contentObj(m).head_content }}</text>
							<text v-for="(it, ix) in contentObj(m).list || contentObj(m).items || []" :key="ix" class="menu-item">{{ it.name || it.content }}</text>
							<text v-if="contentObj(m).tail_content" class="menu-tail">{{ contentObj(m).tail_content }}</text>
						</view>
						<!-- 小程序 -->
						<view v-else-if="m.msg_type === 'miniprogram'" class="msg-link" @click="openMini(m)">
							<text class="link-title">[小程序] {{ contentObj(m).title || '' }}</text>
							<text class="link-desc">{{ contentObj(m).appid || '' }}</text>
						</view>
						<!-- 位置 -->
						<view v-else-if="m.msg_type === 'location'" class="msg-link" @click="openLocation(m)">
							<text class="link-title">📍 {{ contentObj(m).name || '位置' }}</text>
							<text class="link-desc">{{ contentObj(m).address || '' }}</text>
						</view>
						<!-- 卡片/富文本 -->
						<view v-else class="msg-text" v-html="renderText(m)"></view>
					</view>

					<text class="msg-meta">{{ m.admin_name || (m.direction == 2 ? '客服' : '访客') }} · {{ shortTime(m.send_time || m.created_at) }}</text>
					<text v-if="m.recalled" class="msg-recalled">已撤回</text>
				</view>
			</view>
		</scroll-view>

		<!-- 输入区 -->
		<view class="chat-foot">
			<!-- 发件队列 -->
			<view v-if="outbox.length" class="outbox">
				<view v-for="task in outbox" :key="task.id" class="outbox-item">
					<text class="outbox-name">{{ task.name }}</text>
					<text class="outbox-state">{{ task.state === 'fail' ? '失败' : task.state === 'ok' ? '已发送' : task.progress + '%' }}</text>
					<text v-if="task.state === 'fail'" class="outbox-retry" @click="retryTask(task)">重试</text>
					<text class="outbox-x" @click="removeTask(task)">✕</text>
				</view>
			</view>
			<!-- 工具栏 -->
			<view class="tool-row">
				<view class="tool-btn" @click="chooseFile">文件</view>
				<view class="tool-btn" @click="openLinkModal">链接</view>
				<view class="tool-btn" @click="openMenuModal">菜单</view>
				<view class="tool-btn" @click="openMiniModal">小程序</view>
				<view class="tool-btn" @click="openLocationModal">位置</view>
				<view class="tool-btn" @click="openQuickPanel">快捷</view>
				<view class="tool-btn" @click="emojiVisible = !emojiVisible">表情</view>
			</view>
			<!-- 表情面板 -->
			<scroll-view v-if="emojiVisible" scroll-y class="emoji-panel">
				<text v-for="(e, ix) in emojis" :key="ix" class="emoji-item" @click="insertEmoji(e)">{{ e }}</text>
			</scroll-view>
			<!-- 快捷回复面板 -->
			<scroll-view v-if="quickVisible" scroll-y class="quick-panel">
				<view v-if="!quickReplies.length" class="gf-state small"><text class="gf-state-text">加载中…</text></view>
				<view v-for="q in quickReplies" :key="q.id" class="quick-item" @click="sendQuick(q)">
					<text class="quick-title">{{ q.title }}</text>
					<text class="quick-content">{{ q.content }}</text>
				</view>
			</scroll-view>
			<!-- 引用回复条: 长按消息选「引用回复」后出现, 发送成功/取消后清空 -->
			<view v-if="replyingTo" class="replying-bar">
				<text class="replying-tag">引用{{ quoteWhoOf(replyingTo) }}</text>
				<text class="replying-text">{{ quoteSummaryOf(replyingTo) }}</text>
				<text class="replying-cancel" @click="cancelReply">✕</text>
			</view>
			<!-- 输入框 -->
			<view class="input-row">
				<textarea class="msg-input" v-model="inputText" placeholder="输入消息…" placeholder-class="ph" :auto-height="true" />
				<view class="send-btn" :class="{ disabled: sending || !inputText.trim() }" @click="sendText">发送</view>
			</view>
		</view>

		<!-- ===== 弹层：订单信息 ===== -->
		<view v-if="orderVisible" class="gf-mask" @click="orderVisible = false">
			<view class="gf-sheet sheet-wide" @click.stop>
				<view class="gf-sheet-hd"><text>客户订单</text><text class="gf-sheet-x" @click="orderVisible = false">✕</text></view>
				<scroll-view scroll-y class="gf-sheet-bd">
					<view v-if="orderLoading" class="gf-state"><text class="gf-state-text">加载中…</text></view>
					<view v-else-if="!orderData.items || !orderData.items.length" class="gf-state"><text class="gf-state-text">暂无订单</text></view>
					<view v-else v-for="o in orderData.items" :key="o.id" class="order-item">
						<view class="order-line"><text class="order-no">{{ o.order_id }}</text><text class="gf-tag" :class="orderStatusClass(o.status)">{{ o.status_desc || o.status }}</text></view>
						<text class="order-product">{{ o.product_info }}</text>
						<text class="order-meta">¥{{ money(o.amount) }} · {{ o.pay_time || '未支付' }}</text>
					</view>
				</scroll-view>
			</view>
		</view>

		<!-- ===== 弹层：客户画像 ===== -->
		<view v-if="profileVisible" class="gf-mask" @click="profileVisible = false">
			<view class="gf-sheet sheet-wide" @click.stop>
				<view class="gf-sheet-hd"><text>客户分析</text><text class="gf-sheet-x" @click="profileVisible = false">✕</text></view>
				<scroll-view scroll-y class="gf-sheet-bd">
					<view v-if="profileLoading" class="gf-state"><text class="gf-state-text">扣子正在分析…（10-30秒）</text></view>
					<template v-else>
						<view v-if="!profile.has_analysis" class="gf-state">
							<text class="gf-state-text">尚未生成画像</text>
							<view class="gf-btn gf-btn-primary analyze-btn" @click="triggerAnalyze">AI 分析</view>
						</view>
						<view v-else>
							<view v-for="row in analysisRows" :key="row.label" class="profile-row">
								<text class="profile-label">{{ row.label }}</text>
								<text class="profile-value">{{ row.value }}</text>
							</view>
							<view class="gf-btn-ghost analyze-btn" @click="triggerAnalyze">重新分析</view>
						</view>
					</template>
				</scroll-view>
			</view>
		</view>

		<!-- ===== 弹层：转人工 ===== -->
		<view v-if="takeoverVisible" class="gf-mask" @click="takeoverVisible = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd"><text>接入转人工</text><text class="gf-sheet-x" @click="takeoverVisible = false">✕</text></view>
				<scroll-view scroll-y class="gf-sheet-bd">
					<view v-if="!servicers.length" class="gf-state"><text class="gf-state-text">暂无可接待人员</text></view>
					<view v-for="s in servicers" :key="s.userid" class="servicer-item" :class="{ on: selectedServicer === s.userid }" @click="selectedServicer = s.userid">
						<text class="servicer-name">{{ s.name }}</text>
						<text class="gf-tag" :class="s.status == 1 ? 'gf-tag-gold' : 'gf-tag-gray'">{{ s.status == 1 ? '正常' : '停用' }}</text>
					</view>
				</scroll-view>
				<view class="gf-sheet-ft">
					<view class="gf-btn gf-btn-ghost" @click="takeoverVisible = false">取消</view>
					<view class="gf-btn gf-btn-primary" @click="confirmTakeover">确认接入</view>
				</view>
			</view>
		</view>

		<!-- ===== 弹层：语音分析结果 ===== -->
		<view v-if="voiceVisible" class="gf-mask" @click="voiceVisible = false">
			<view class="gf-sheet sheet-wide" @click.stop>
				<view class="gf-sheet-hd"><text>语音处理</text><text class="gf-sheet-x" @click="voiceVisible = false">✕</text></view>
				<scroll-view scroll-y class="gf-sheet-bd">
					<view v-if="voiceLoading" class="gf-state"><text class="gf-state-text">处理中…</text></view>
					<template v-else>
						<text class="voice-result">{{ voiceResult.text || voiceResult.result || '无结果' }}</text>
						<view class="voice-actions">
							<view class="gf-btn-ghost voice-btn" @click="copyText(voiceResult.text || voiceResult.result)">复制</view>
							<view class="gf-btn-ghost voice-btn" @click="fillVoiceReply">填入输入框</view>
							<view class="gf-btn-primary voice-btn" @click="sendVoiceReply">发给访客</view>
						</view>
					</template>
				</scroll-view>
			</view>
		</view>

		<!-- ===== 弹层：发送链接/菜单/小程序/位置（通用表单） ===== -->
		<view v-if="sendModal" class="gf-mask" @click="sendModal = ''">
			<view class="gf-sheet sheet-wide" @click.stop>
				<view class="gf-sheet-hd"><text>{{ sendModalTitle }}</text><text class="gf-sheet-x" @click="sendModal = ''">✕</text></view>
				<scroll-view scroll-y class="gf-sheet-bd">
					<template v-if="sendModal === 'link'">
						<view class="gf-field"><text class="gf-label">标题</text><input class="gf-input" v-model="linkForm.title" placeholder="链接标题" /></view>
						<view class="gf-field"><text class="gf-label">描述</text><input class="gf-input" v-model="linkForm.desc" placeholder="描述（可选）" /></view>
						<view class="gf-field"><text class="gf-label">链接地址</text><input class="gf-input" v-model="linkForm.url" placeholder="https://" /></view>
					</template>
					<template v-else-if="sendModal === 'menu'">
						<view class="gf-field"><text class="gf-label">开头语</text><input class="gf-input" v-model="menuForm.head_content" placeholder="可选" /></view>
						<view v-for="(it, ix) in menuForm.items" :key="ix" class="gf-field menu-edit">
							<input class="gf-input" v-model="it.content" :placeholder="'菜单项 ' + (ix + 1)" />
							<text class="menu-del" @click="removeMenuItem(ix)">✕</text>
						</view>
						<view class="gf-btn-ghost add-menu" @click="addMenuItem">+ 添加菜单项</view>
						<view class="gf-field"><text class="gf-label">结尾语</text><input class="gf-input" v-model="menuForm.tail_content" placeholder="可选" /></view>
					</template>
					<template v-else-if="sendModal === 'miniprogram'">
						<view class="gf-field"><text class="gf-label">appid</text><input class="gf-input" v-model="miniForm.appid" placeholder="小程序 appid" /></view>
						<view class="gf-field"><text class="gf-label">标题</text><input class="gf-input" v-model="miniForm.title" placeholder="可选" /></view>
						<view class="gf-field"><text class="gf-label">页面路径</text><input class="gf-input" v-model="miniForm.pagepath" placeholder="pages/index/index" /></view>
						<view class="gf-field"><text class="gf-label">封面图</text><view class="gf-btn-ghost" @click="chooseMiniThumb">{{ miniForm.thumbPath ? '已选择封面' : '选择封面图' }}</view></view>
					</template>
					<template v-else-if="sendModal === 'location'">
						<view class="gf-field"><text class="gf-label">名称</text><input class="gf-input" v-model="locationForm.name" placeholder="位置名称" /></view>
						<view class="gf-field"><text class="gf-label">地址</text><input class="gf-input" v-model="locationForm.address" placeholder="详细地址" /></view>
						<view class="gf-field"><text class="gf-label">纬度</text><input class="gf-input" v-model="locationForm.latitude" placeholder="latitude" /></view>
						<view class="gf-field"><text class="gf-label">经度</text><input class="gf-input" v-model="locationForm.longitude" placeholder="longitude" /></view>
					</template>
				</scroll-view>
				<view class="gf-sheet-ft">
					<view class="gf-btn gf-btn-ghost" @click="sendModal = ''">取消</view>
					<view class="gf-btn gf-btn-primary" @click="confirmSend">发送</view>
				</view>
			</view>
		</view>

		<!-- 消息长按菜单 -->
		<view v-if="msgMenuVisible" class="ctx-mask" @click="msgMenuVisible = false">
			<view class="ctx-menu" @click.stop>
				<view v-if="msgMenuCanQuote" class="ctx-item" @click="quoteMsg">引用回复</view>
				<view v-if="msgMenuCanRecall" class="ctx-item" @click="recallMsg">撤回</view>
				<view v-if="msgMenuCanKb" class="ctx-item" @click="injectKb">注入知识库</view>
				<view class="ctx-item" @click="copyText(msgMenuText)">复制文本</view>
			</view>
		</view>

		<!-- 用户备注弹窗 -->
		<view v-if="remarkVisible" class="gf-mask" @click="remarkVisible = false">
			<view class="gf-sheet" @click.stop>
				<view class="gf-sheet-hd"><text>用户备注</text><text class="gf-sheet-x" @click="remarkVisible = false">✕</text></view>
				<view class="gf-sheet-bd">
					<text class="remark-tip">备注会优先显示在会话列表与聊天头部；留空保存可清除备注。</text>
					<textarea class="gf-textarea" v-model="remarkText" placeholder="例如：已付款待发货 / 老客户优先处理" placeholder-class="ph" maxlength="512" />
				</view>
				<view class="gf-sheet-ft">
					<view class="gf-btn gf-btn-ghost" @click="remarkVisible = false">取消</view>
					<view class="gf-btn gf-btn-main" :class="{ disabled: remarkSaving }" @click="saveRemark">{{ remarkSaving ? '保存中…' : '保存' }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getSessionList, getSessionMessages, sendSessionMessage, sendSessionFile, sendSessionLink,
		sendSessionMenu, sendSessionMiniprogram, sendSessionLocation, recallSessionMessage,
		readSession, takeoverSession, getServicerList, getSessionOrders, manualSync,
		getQuickReplyList, getCustomerProfile, analyzeCustomerProfile, analyzeVoice, mediaGetUrl,
		saveKnowledge, setAutoReply, setCustomerRemark
	} from '@/api/wxkf'
	import { goBack } from '@/utils/nav'
	import { kfOrderStatusGfClass } from '@/utils/wxkf-order'

	const ALL_KEY = '__all__'
	const SEARCH_CONTEXT = 2
	const EMOJIS = ['😀','😂','🥰','😍','😎','🤔','😭','😡','👍','👏','🙏','💪','❤️','🎉','🔥','✨','🌸','🍀','☀️','🌙','⭐','💯','✅','❌','📌','📎','📞','💬','🛒','💰']

	export default {
		data() {
			return {
				ALL_KEY,
				externalUserId: '',
				nickname: '访客',
				avatar: '',
				remark: '',
				autoReply: true,
				autoReplyPending: false,
				remarkVisible: false,
				remarkText: '',
				remarkSaving: false,
				customers: [],
				activeKey: ALL_KEY,
				loading: false,
				messages: [],
				recallEnabled: false,
				inputText: '',
				sending: false,
				contentKeyword: '',
				scrollAnchor: '',
				timer: null,
				// 弹层
				orderVisible: false, orderLoading: false, orderData: {},
				profileVisible: false, profileLoading: false, profile: {},
				takeoverVisible: false, servicers: [], selectedServicer: '',
				voiceVisible: false, voiceLoading: false, voiceResult: {}, voiceMsg: null,
				sendModal: '',
				linkForm: { title: '', desc: '', url: '' },
				menuForm: { head_content: '', items: [{ type: 'click', content: '' }], tail_content: '' },
				miniForm: { appid: '', title: '', pagepath: '', thumbPath: '' },
				locationForm: { name: '', address: '', latitude: '', longitude: '' },
				// 表情/快捷
				emojiVisible: false, quickVisible: false, quickReplies: [], emojis: EMOJIS,
				// 发件队列
				outbox: [], sendChainRunning: false,
				// 消息长按
				msgMenuVisible: false, msgMenuMsg: null,
				// 引用回复(临时状态, 不落库)
				replyingTo: null,
				// 媒体本地缓存 media_id -> 本地临时路径
				mediaCache: {}
			}
		},
		onLoad(options) {
			this.externalUserId = decodeURIComponent(options.external_userid || '')
			this.nickname = decodeURIComponent(options.nickname || '访客')
			this.loadMessages()
			this.loadCustomer()
			this.timer = setInterval(() => {
				this.loadMessages(true)
				this.loadCustomer(true)
			}, 10000)
		},
		onUnload() {
			if (this.timer) clearInterval(this.timer)
		},
		computed: {
			shortId() {
				const id = this.externalUserId || ''
				return id.length > 8 ? id.slice(0, 4) + '…' + id.slice(-4) : id
			},
			/** 头部名字：备注在前，微信昵称跟后；两者一致或缺失时取其一 */
			displayName() {
				const r = (this.remark || '').trim()
				const n = (this.nickname || '').trim()
				if (r && n && r !== n) return r + '（' + n + '）'
				return r || n || '访客'
			},
			avatarText() {
				const n = this.remark || this.nickname || this.externalUserId || '客'
				return String(n).slice(-2)
			},
			sessions() {
				const set = {}
				this.messages.forEach((m) => {
					if (m.open_kfid) {
						if (!set[m.open_kfid]) set[m.open_kfid] = {
							session_key: m.open_kfid, open_kfid: m.open_kfid,
							open_kfid_label: m.open_kfid_label || m.open_kfid, msg_count: 0, unread: 0
						}
						set[m.open_kfid].msg_count++
					}
				})
				return Object.values(set)
			},
			sendTargetKfid() {
				if (this.activeKey !== ALL_KEY) return this.activeKey
				for (let i = this.messages.length - 1; i >= 0; i--) {
					if (this.messages[i].open_kfid) return this.messages[i].open_kfid
				}
				return ''
			},
			filteredRaw() {
				if (this.activeKey === ALL_KEY) return this.messages
				return this.messages.filter((m) => m.open_kfid === this.activeKey || (!m.open_kfid && m.direction == 1))
			},
			displayMessages() {
				const kw = (this.contentKeyword || '').trim().toLowerCase()
				if (!kw) return this.filteredRaw.map((m) => Object.assign({}, m, { _isHit: false }))
				const raw = this.filteredRaw
				const hitIdx = {}
				raw.forEach((m, i) => {
					if (this.messageSearchText(m).toLowerCase().indexOf(kw) !== -1) hitIdx[i] = true
				})
				const keep = {}
				Object.keys(hitIdx).forEach((k) => {
					const i = Number(k)
					for (let j = Math.max(0, i - SEARCH_CONTEXT); j <= Math.min(raw.length - 1, i + SEARCH_CONTEXT); j++) keep[j] = true
				})
				return raw.map((m, i) => Object.assign({}, m, { _isHit: !!hitIdx[i] })).filter((m, i) => keep[i])
			},
			analysisRows() {
				const p = this.profile
				let obj = p.analysis
				if (typeof obj === 'string') { try { obj = JSON.parse(obj) } catch (e) { obj = {} } }
				obj = obj || {}
				const labels = {
					core_demand: '核心需求', kb_collect: '知识库命中', risk_tag: '风险标签',
					sentiment: '情感倾向', service_suggest: '服务建议', user_profile: '用户画像'
				}
				return Object.keys(labels).filter((k) => obj[k] != null).map((k) => ({
					label: labels[k],
					value: typeof obj[k] === 'string' ? obj[k] : JSON.stringify(obj[k])
				}))
			},
			msgMenuCanQuote() {
				const m = this.msgMenuMsg
				return !!(m && !m.recalled)
			},
			msgMenuCanRecall() {
				const m = this.msgMenuMsg
				return !!(m && m.can_recall && this.recallEnabled)
			},
			msgMenuCanKb() {
				const m = this.msgMenuMsg
				return !!(m && m.direction == 1 && (m.msg_type === 'text' || m.msg_type === 'voice'))
			},
			msgMenuText() {
				const m = this.msgMenuMsg
				return m ? this.messageSearchText(m) : ''
			},
			sendModalTitle() {
				return { link: '发送图文链接', menu: '发送菜单消息', miniprogram: '发送小程序', location: '发送地理位置' }[this.sendModal] || ''
			}
		},
		methods: {
			async loadMessages(silent = false) {
				if (!this.externalUserId) return
				if (!silent) this.loading = true
				try {
					const res = await getSessionMessages({
						external_userid: this.externalUserId, scope: 'all'
					})
					this.messages = (res && res.items) || []
					this.recallEnabled = !!(res && res.recall_enabled)
					if (!silent) {
						// 标记已读
						try { await readSession({ external_userid: this.externalUserId }) } catch (e) {}
						this.$nextTick(() => this.scrollToBottom())
					}
				} catch (e) {
				} finally {
					this.loading = false
				}
			},
			scrollToBottom() {
				const len = this.displayMessages.length
				if (len > 0) this.scrollAnchor = 'msg-' + (len - 1)
			},
			switchSession(key) {
				this.activeKey = key
				this.contentKeyword = ''
				this.$nextTick(() => this.scrollToBottom())
			},
			shortTime(t) { return t ? String(t).slice(5, 16) : '' },
			isText(m) { return !m.msg_type || m.msg_type === 'text' || m.msg_type === 'card' || m.msg_type === 'rich' },
			escapeHtml(s) {
				return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
			},
			renderText(m) {
				let text = typeof m.content === 'string' ? m.content : (m.content && m.content.content) || ''
				text = this.escapeHtml(text).replace(/\n/g, '<br/>')
				const kw = (this.contentKeyword || '').trim()
				if (kw && m._isHit) {
					const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
					text = text.replace(re, (x) => '<mark>' + x + '</mark>')
				}
				return text
			},
			messageSearchText(m) {
				if (this.isText(m)) return typeof m.content === 'string' ? m.content : (m.content && m.content.content) || ''
				const c = this.contentObj(m)
				return [c.title, c.desc, c.description, c.content, c.name, c.address, c.url].filter(Boolean).join(' ')
			},
			contentObj(m) {
				if (m.content && typeof m.content === 'object') return m.content
				if (typeof m.content === 'string') { try { return JSON.parse(m.content) } catch (e) { return {} } }
				return {}
			},
			showDivider(m, i) {
				if (this.activeKey !== ALL_KEY) return false
				const prev = this.displayMessages[i - 1]
				return !prev || prev.open_kfid !== m.open_kfid
			},
			dividerText(m) { return m.open_kfid_label || m.open_kfid || '会话' },
			mediaSrc(m) {
				const mid = m.media_id || (this.contentObj(m).media_id)
				return (mid && this.mediaCache[mid]) || m.media_url || ''
			},
			fileNameOf(m) { const c = this.contentObj(m); return c.filename || c.file_name || m.media_url?.split('/').pop() || '文件' },
			fileSizeOf(m) { const s = (this.contentObj(m).filesize || this.contentObj(m).file_size || 0); return s ? (s / 1024).toFixed(1) + ' KB' : '' },
			previewImage(m) {
				const src = this.mediaSrc(m)
				if (src) uni.previewImage({ urls: [src], current: src })
			},
			previewVideo(m) {
				const src = this.mediaSrc(m)
				if (!src) { uni.showToast({ title: '视频地址不可用', icon: 'none' }); return }
				// 移动端以复制到剪贴板提示（不确定项，见迁移规格）
				uni.setClipboardData({ data: src, success: () => uni.showToast({ title: '视频地址已复制', icon: 'none' }) })
			},
			openFile(m) {
				const src = this.mediaSrc(m)
				if (!src) return
				uni.setClipboardData({ data: src, success: () => uni.showToast({ title: '文件地址已复制', icon: 'none' }) })
			},
			openLink(m) { const u = this.contentObj(m).url; if (u) uni.setClipboardData({ data: u, success: () => uni.showToast({ title: '链接已复制', icon: 'none' }) }) },
			openMini(m) {},
			openLocation(m) {
				const c = this.contentObj(m)
				if (c.latitude && c.longitude) uni.openLocation({ latitude: Number(c.latitude), longitude: Number(c.longitude), name: c.name, address: c.address })
			},

			// ---- 发送文本 ----
			sendText() {
				const text = this.inputText.trim()
				if (!text || this.sending) return
				this.doSendText(text)
			},
			async doSendText(content) {
				this.sending = true
				const replyToId = (this.replyingTo && this.replyingTo.id) ? Number(this.replyingTo.id) : 0
				try {
					const res = await sendSessionMessage({
						open_kfid: this.sendTargetKfid, external_userid: this.externalUserId, content,
						reply_to_id: replyToId
					})
					this.inputText = ''
					this.replyingTo = null
					this.showSensitive(res && res.sensitive_alert)
					await this.loadMessages(true)
					this.scrollToBottom()
				} catch (e) {
				} finally { this.sending = false }
			},
			showSensitive(alert) {
				if (!alert) return
				uni.showModal({ title: '敏感词已打码', content: `${alert.category || ''}（命中 ${alert.hit_count || 0} 条，${alert.action || ''}）。敏感词已用 * 代替，其余内容照常发送，无需重发。`, showCancel: false })
			},

			// ---- 表情 ----
			insertEmoji(e) { this.inputText += e },

			// ---- 快捷回复 ----
			async openQuickPanel() {
				this.quickVisible = !this.quickVisible
				this.emojiVisible = false
				if (this.quickVisible && !this.quickReplies.length) {
					try { const r = await getQuickReplyList(); this.quickReplies = (r && r.list) || [] } catch (e) {}
				}
			},
			sendQuick(q) { if (q && q.content) this.doSendText(q.content) },

			// ---- 文件发送（串行队列） ----
			chooseFile() {
				uni.chooseFile({
					count: 1,
					success: (r) => {
						const f = (r.tempFiles || r.files || [])[0]
						if (f) this.enqueueTask({ name: f.name || '文件', path: f.path })
					}
				})
			},
			enqueueTask(task) {
				task.id = Date.now() + Math.random()
				task.state = 'wait'
				task.progress = 0
				this.outbox.push(task)
				this.runSendChain()
			},
			async runSendChain() {
				if (this.sendChainRunning) return
				this.sendChainRunning = true
				while (this.outbox.some((t) => t.state === 'wait')) {
					const task = this.outbox.find((t) => t.state === 'wait')
					task.state = 'sending'
					try {
						const res = await sendSessionFile(task.path, {
							open_kfid: this.sendTargetKfid, external_userid: this.externalUserId
						})
						task.state = 'ok'
						this.showSensitive(res && res.sensitive_alert)
					} catch (e) {
						task.state = 'fail'
					}
				}
				this.sendChainRunning = false
				setTimeout(() => { this.outbox = this.outbox.filter((t) => t.state !== 'ok') }, 1200)
			},
			retryTask(task) { task.state = 'wait'; task.progress = 0; this.runSendChain() },
			removeTask(task) { this.outbox = this.outbox.filter((t) => t.id !== task.id) },

			// ---- 发送各类消息弹层 ----
			openLinkModal() { this.sendModal = 'link' },
			openMenuModal() { this.sendModal = 'menu' },
			openMiniModal() { this.sendModal = 'miniprogram' },
			openLocationModal() { this.sendModal = 'location' },
			addMenuItem() { if (this.menuForm.items.length < 20) this.menuForm.items.push({ type: 'click', content: '' }) },
			removeMenuItem(ix) { if (this.menuForm.items.length > 1) this.menuForm.items.splice(ix, 1) },
			chooseMiniThumb() {
				uni.chooseImage({ count: 1, success: (r) => { this.miniForm.thumbPath = (r.tempFilePaths || [])[0] || '' } })
			},
			async confirmSend() {
				const base = { open_kfid: this.sendTargetKfid, external_userid: this.externalUserId }
				try {
					if (this.sendModal === 'link') {
						if (!this.linkForm.title || !this.linkForm.url) { uni.showToast({ title: '标题和链接必填', icon: 'none' }); return }
						await sendSessionLink(Object.assign({}, base, this.linkForm))
					} else if (this.sendModal === 'menu') {
						const items = this.menuForm.items.filter((it) => (it.content || '').trim())
						if (!items.length) { uni.showToast({ title: '至少填写一个菜单项', icon: 'none' }); return }
						await sendSessionMenu(Object.assign({}, base, { head_content: this.menuForm.head_content, tail_content: this.menuForm.tail_content, items }))
					} else if (this.sendModal === 'miniprogram') {
						if (!this.miniForm.appid || !this.miniForm.pagepath || !this.miniForm.thumbPath) { uni.showToast({ title: 'appid/路径/封面必填', icon: 'none' }); return }
						await sendSessionMiniprogram(this.miniForm.thumbPath, {
							open_kfid: base.open_kfid, external_userid: base.external_userid,
							appid: this.miniForm.appid, title: this.miniForm.title, pagepath: this.miniForm.pagepath
						})
					} else if (this.sendModal === 'location') {
						if (!this.locationForm.latitude || !this.locationForm.longitude) { uni.showToast({ title: '经纬度必填', icon: 'none' }); return }
						await sendSessionLocation(Object.assign({}, base, this.locationForm))
					}
					this.sendModal = ''
					await this.loadMessages(true)
					this.scrollToBottom()
				} catch (e) {}
			},

			// ---- 消息长按 / 引用回复 ----
			onMsgLongPress(m) { this.msgMenuMsg = m; this.msgMenuVisible = true },
			quoteMsg() {
				const m = this.msgMenuMsg
				this.msgMenuVisible = false
				if (!m || m.recalled) return
				this.replyingTo = m
			},
			cancelReply() { this.replyingTo = null },
			// 被引用的原消息是否还在当前会话里
			quotedMessageOf(m) {
				const id = m && m.reply_to_id
				if (!id) return null
				return this.messages.find((x) => String(x.id) === String(id)) || null
			},
			quoteWhoOf(m) {
				if (m && m.direction == 2) return '客服'
				// 只用微信昵称(this.nickname); 不能用 this.remark / displayName —— 那是含运营备注的
				const n = String(this.nickname || '').replace(/\s+/g, ' ').trim()
				if (!n) return '客户'
				return n.length > 20 ? n.slice(0, 20) + '…' : n
			},
			// 与后端 KfQuoteSummary 同口径: 一行摘要, 最多 60 字
			quoteSummaryOf(m) {
				if (!m) return '原消息不在当前会话中'
				const labels = { image: '[图片]', voice: '[语音]', video: '[视频]', file: '[文件]', link: '[链接]', miniprogram: '[小程序]', location: '[位置]', msgmenu: '[菜单消息]' }
				if (m.msg_type && m.msg_type !== 'text') return labels[m.msg_type] || '[' + m.msg_type + ']'
				const text = String(m.content || m.raw_content || '').replace(/\s+/g, ' ').trim()
				if (!text) return '[空消息]'
				return text.length > 60 ? text.slice(0, 60) + '…' : text
			},
			// 点引用卡片跳回原消息
			jumpToQuote(m) {
				const q = this.quotedMessageOf(m)
				if (!q) { uni.showToast({ title: '原消息不在当前会话中', icon: 'none' }); return }
				const idx = this.displayMessages.findIndex((x) => String(x.id || x.msgid) === String(q.id || q.msgid))
				if (idx >= 0) this.scrollAnchor = 'msg-' + idx
			},
			async recallMsg() {
				const m = this.msgMenuMsg
				this.msgMenuVisible = false
				if (!m) return
				const r = await new Promise((resolve) => uni.showModal({ title: '撤回消息', content: '确定撤回这条消息？', success: (x) => resolve(x.confirm) }))
				if (!r) return
				try {
					await recallSessionMessage({ id: m.id, external_userid: this.externalUserId, msgid: m.msgid, open_kfid: m.open_kfid })
					await this.loadMessages(true)
				} catch (e) {}
			},
			injectKb() {
				const m = this.msgMenuMsg
				this.msgMenuVisible = false
				if (!m) return
				const q = this.messageSearchText(m)
				uni.showModal({
					title: '注入知识库', content: '将客户问题与回答「加油」注入知识库？',
					success: async (r) => {
						if (!r.confirm) return
						try {
							await saveKnowledge({ id: 0, group_name: '客服问答', question: q, answer: '加油' })
							uni.showToast({ title: '已注入', icon: 'success' })
						} catch (e) {}
					}
				})
			},
			copyText(text) {
				if (!text) return
				uni.setClipboardData({ data: text, success: () => uni.showToast({ title: '已复制', icon: 'none' }) })
			},

			/** 微信头像 http 升级 https，避免混合内容拦截 */
			avatarUrl(url) {
				const s = url ? String(url).trim() : ''
				return s.indexOf('http://') === 0 ? 'https://' + s.slice(7) : s
			},

			// ---- 客户状态：头像/备注/自动回复（复用 session/list，避免新增接口）----
			async loadCustomer(silent = false) {
				try {
					const res = await getSessionList()
					const items = (res && res.items) || []
					const c = items.find((it) => it.external_userid === this.externalUserId)
					if (!c) return
					this.avatar = c.avatar || ''
					this.remark = c.remark || ''
					// 备注存在时头部优先展示备注，昵称作为补充
					if (c.nickname) this.nickname = c.nickname
					// 轮询时保留用户正在操作/乐观更新的开关值
					if (!this.autoReplyPending) this.autoReply = c.auto_reply !== false
				} catch (e) {
				}
			},
			/** 自动回复开关：乐观更新 + 失败回滚 */
			async toggleAutoReply(e) {
				if (this.autoReplyPending) return
				const prev = this.autoReply
				// 取 switch 的真实值，避免各端受控行为差异；无事件时回退为取反
				const next = e && e.detail && typeof e.detail.value === 'boolean' ? e.detail.value : !prev
				this.autoReply = next
				this.autoReplyPending = true
				try {
					await setAutoReply({ external_userid: this.externalUserId, enabled: next })
					uni.showToast({ title: next ? '已开启自动回复' : '已关闭自动回复', icon: 'none' })
				} catch (e) {
					this.autoReply = prev // 失败回滚
				} finally {
					setTimeout(() => { this.autoReplyPending = false }, 2000)
				}
			},
			openRemark() {
				this.remarkText = this.remark || ''
				this.remarkVisible = true
			},
			/** 用户备注：保存后同步本地显示 */
			async saveRemark() {
				if (this.remarkSaving) return
				this.remarkSaving = true
				try {
					const text = (this.remarkText || '').trim()
					await setCustomerRemark({ external_userid: this.externalUserId, remark: text })
					this.remark = text
					this.remarkVisible = false
					uni.showToast({ title: text ? '备注已保存' : '已清除备注', icon: 'success' })
				} catch (e) {
				} finally {
					this.remarkSaving = false
				}
			},

			// ---- 订单 ----
			async openOrders() {
				this.orderVisible = true
				this.orderLoading = true
				try {
					const d = await getSessionOrders({ external_userid: this.externalUserId })
					this.orderData = d || {}
				} catch (e) { this.orderData = {} } finally { this.orderLoading = false }
			},
			orderStatusClass(code) { return kfOrderStatusGfClass(code) },
			money(v) { return ((Number(v || 0) / 100).toFixed(2)) },

			// ---- 画像 ----
			async openProfile() {
				this.profileVisible = true
				this.profileLoading = true
				try { this.profile = (await getCustomerProfile({ external_userid: this.externalUserId })) || {} }
				catch (e) { this.profile = {} } finally { this.profileLoading = false }
			},
			async triggerAnalyze() {
				this.profileLoading = true
				try {
					this.profile = (await analyzeCustomerProfile({ external_userid: this.externalUserId, open_kfid: this.sendTargetKfid, max_rounds: 200 })) || this.profile
				} catch (e) {} finally { this.profileLoading = false }
			},

			// ---- 转人工 ----
			async openTakeover() {
				this.takeoverVisible = true
				try {
					const r = await getServicerList({ open_kfid: this.sendTargetKfid })
					this.servicers = ((r && r.items) || []).filter((s) => s.type == 2 && s.status == 1)
				} catch (e) { this.servicers = [] }
			},
			async confirmTakeover() {
				if (!this.selectedServicer) { uni.showToast({ title: '请选择接待人员', icon: 'none' }); return }
				try {
					await takeoverSession({ open_kfid: this.sendTargetKfid, external_userid: this.externalUserId, servicer_userid: this.selectedServicer })
					this.takeoverVisible = false
					uni.showToast({ title: '已接入', icon: 'success' })
				} catch (e) {}
			},

			// ---- 语音分析 ----
			async analyzeVoiceMsg(m) {
				const mid = m.media_id || this.contentObj(m).media_id
				if (!mid) { uni.showToast({ title: '缺少 media_id', icon: 'none' }); return }
				this.voiceMsg = m
				this.voiceVisible = true
				this.voiceLoading = true
				try {
					this.voiceResult = (await analyzeVoice({ media_id: mid, mode: 'asr', open_kfid: m.open_kfid, external_userid: this.externalUserId, msgid: m.msgid })) || {}
				} catch (e) { this.voiceResult = {} } finally { this.voiceLoading = false }
			},
			fillVoiceReply() {
				this.inputText = this.voiceResult.text || this.voiceResult.result || ''
				this.voiceVisible = false
			},
			sendVoiceReply() {
				const txt = this.voiceResult.text || this.voiceResult.result
				this.voiceVisible = false
				if (txt) this.doSendText(txt)
			},
			goBack() { uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/wxkf-workbench/index' }) }) }
		}
	}
</script>

<style lang="scss" scoped>
	@import '../../styles/guofeng-vars.scss';

	.page { height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
	.ph { color: $gf-ink-3; }

	/* 聊天头 */
	.chat-head {
		flex-shrink: 0; display: flex; align-items: center; gap: 14rpx;
		padding: var(--gf-capsule-safe, calc(52px + env(safe-area-inset-top))) 24rpx 18rpx;
		border-bottom: 1rpx solid $gf-line-soft;
	}
	.ch-avatar {
		flex-shrink: 0; width: 72rpx; height: 72rpx; border-radius: 10rpx; overflow: hidden;
		background: $gf-indigo; display: flex; align-items: center; justify-content: center;
	}
	.ch-avatar-img { width: 100%; height: 100%; display: block; }
	.ch-avatar-txt { color: #fdf6e6; font-size: 24rpx; font-weight: 700; }
	.ch-mid { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4rpx; }
	.ch-name-row { display: flex; align-items: center; gap: 10rpx; min-width: 0; }
	.ch-name { min-width: 0; font-size: 28rpx; font-weight: 700; color: $gf-ink; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.ch-off-tag {
		flex-shrink: 0; font-size: 18rpx; color: #c97a1e;
		padding: 2rpx 8rpx; border: 1rpx solid rgba(201, 122, 30, 0.5); border-radius: 6rpx;
		background: rgba(201, 122, 30, 0.08);
	}
	.ch-id { font-size: 19rpx; color: $gf-ink-3; }
	.ch-acts { display: flex; gap: 8rpx; }
	.ch-act {
		width: 56rpx; height: 60rpx; line-height: 58rpx; text-align: center;
		font-size: 24rpx; color: $gf-ink-2; border: 1rpx solid $gf-line; border-radius: 10rpx;
	}

	/* 客户状态栏 */
	.cust-bar {
		flex-shrink: 0; display: flex; align-items: center;
		margin: 0 24rpx; padding: 14rpx 20rpx;
		background: $gf-card; border: 1rpx solid $gf-line-soft; border-radius: 10rpx;
	}
	.cust-bar-item { display: flex; align-items: center; gap: 12rpx; }
	.cust-bar-item.grow { flex: 1; min-width: 0; }
	.cust-bar-label { flex-shrink: 0; font-size: 23rpx; color: $gf-ink-2; }
	.cust-switch { transform: scale(0.82); transform-origin: left center; }
	.cust-bar-sep { width: 1rpx; height: 36rpx; background: $gf-line-soft; margin: 0 20rpx; }
	.cust-bar-value { flex: 1; min-width: 0; font-size: 22rpx; color: $gf-ink; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.cust-bar-go { font-size: 32rpx; color: $gf-ink-3; }

	/* 备注弹窗 */
	.remark-tip { display: block; margin-bottom: 16rpx; font-size: 22rpx; line-height: 1.6; color: $gf-ink-3; }

	/* 会话条 */
	.session-bar { flex-shrink: 0; white-space: nowrap; padding: 12rpx 24rpx; border-bottom: 1rpx solid $gf-line-soft; }
	.sess-chip {
		display: inline-block; padding: 10rpx 20rpx; margin-right: 12rpx;
		font-size: 22rpx; color: $gf-ink-2; border: 1rpx solid $gf-line; border-radius: 999rpx;
	}
	.sess-chip.on { color: #fdf6e6; background: $gf-indigo; border-color: $gf-gold; }
	.sess-unread { margin-left: 8rpx; color: $gf-cinnabar; font-weight: 700; }

	/* 消息搜索 */
	.msg-search {
		flex-shrink: 0; display: flex; align-items: center; gap: 10rpx;
		margin: 12rpx 24rpx; padding: 0 18rpx; height: 64rpx;
		background: $gf-card; border: 1rpx solid $gf-line-soft; border-radius: 10rpx;
	}
	.search-ico { font-size: 22rpx; }
	.msg-search-input { flex: 1; font-size: 23rpx; color: $gf-ink; }
	.search-clear { font-size: 22rpx; color: $gf-ink-3; }

	/* 消息区 */
	.msg-scroll { flex: 1; min-height: 0; background: rgba(58, 74, 82, 0.03); }
	.msg-pad { padding: 20rpx 24rpx; }
	.msg-row { display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 24rpx; }
	.msg-row.right { align-items: flex-end; }
	.session-divider {
		align-self: center; margin: 8rpx 0 20rpx; padding: 6rpx 20rpx;
		font-size: 20rpx; color: $gf-ink-3; background: rgba(201, 162, 75, 0.12); border-radius: 999rpx;
	}
	.msg-bubble {
		max-width: 78%; padding: 18rpx 22rpx; border-radius: 4rpx 16rpx 16rpx 16rpx;
		background: $gf-card; border: 1rpx solid $gf-line-soft; box-shadow: 0 4rpx 12rpx rgba(26, 24, 21, 0.04);
	}
	.msg-bubble.mine { background: rgba(178, 58, 46, 0.08); border-color: rgba(178, 58, 46, 0.2); border-radius: 16rpx 4rpx 16rpx 16rpx; }
	.msg-row.hit .msg-bubble { border-color: $gf-cinnabar; box-shadow: 0 0 0 2rpx rgba(178, 58, 46, 0.2); }
	.msg-text { font-size: 26rpx; line-height: 1.6; color: $gf-ink; word-break: break-all; }
	/* 引用回复: 气泡内引用卡片 + 输入框引用条 */
	.msg-quote {
		display: flex; flex-direction: column; gap: 4rpx;
		margin-bottom: 12rpx; padding: 10rpx 14rpx;
		border-left: 6rpx solid $gf-cinnabar;
		background: rgba(26, 24, 21, 0.04); border-radius: 4rpx;
	}
	.msg-quote-who { font-size: 20rpx; color: $gf-cinnabar; font-weight: 600; }
	.msg-quote-text { font-size: 22rpx; color: $gf-ink-3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.replying-bar {
		display: flex; align-items: center; gap: 12rpx;
		margin-bottom: 12rpx; padding: 12rpx 16rpx;
		background: rgba(178, 58, 46, 0.06); border-left: 6rpx solid $gf-cinnabar; border-radius: 6rpx;
	}
	.replying-tag { flex-shrink: 0; font-size: 22rpx; color: $gf-cinnabar; font-weight: 600; }
	.replying-text { flex: 1; min-width: 0; font-size: 22rpx; color: $gf-ink-2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.replying-cancel { flex-shrink: 0; font-size: 24rpx; color: $gf-ink-3; padding: 0 6rpx; }
	.msg-meta { margin-top: 8rpx; font-size: 18rpx; color: $gf-ink-3; }
	.msg-recalled { margin-top: 6rpx; font-size: 18rpx; color: $gf-ink-3; font-style: italic; }
	.msg-media, .msg-file, .msg-link, .msg-menu { display: flex; flex-direction: column; gap: 6rpx; }
	.msg-img { max-width: 100%; border-radius: 8rpx; }
	.msg-voice { display: flex; align-items: center; gap: 10rpx; font-size: 24rpx; color: $gf-ink-2; }
	.voice-ico { color: $gf-cinnabar; }
	.media-ph { font-size: 24rpx; color: $gf-ink-2; }
	.msg-file { flex-direction: row; align-items: center; gap: 14rpx; }
	.file-ico { font-size: 40rpx; }
	.file-name { display: block; font-size: 24rpx; color: $gf-ink; }
	.file-size { display: block; font-size: 19rpx; color: $gf-ink-3; margin-top: 4rpx; }
	.link-title { font-size: 25rpx; font-weight: 600; color: $gf-ink; }
	.link-desc { font-size: 22rpx; color: $gf-ink-2; }
	.link-url { font-size: 19rpx; color: $gf-ink-3; word-break: break-all; }
	.menu-head, .menu-tail { font-size: 23rpx; color: $gf-ink-2; }
	.menu-item { display: block; padding: 10rpx 16rpx; margin-top: 6rpx; font-size: 23rpx; color: $gf-cinnabar; border: 1rpx solid $gf-line; border-radius: 8rpx; }

	/* 输入区 */
	.chat-foot { flex-shrink: 0; background: $gf-card; border-top: 1rpx solid $gf-line; padding: 12rpx 20rpx calc(12rpx + env(safe-area-inset-bottom)); }
	.outbox { margin-bottom: 10rpx; }
	.outbox-item { display: flex; align-items: center; gap: 12rpx; padding: 10rpx 14rpx; margin-bottom: 8rpx; background: rgba(58, 74, 82, 0.05); border-radius: 8rpx; }
	.outbox-name { flex: 1; font-size: 21rpx; color: $gf-ink; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.outbox-state { font-size: 20rpx; color: $gf-ink-3; }
	.outbox-retry, .outbox-x { font-size: 20rpx; color: $gf-cinnabar; }
	.tool-row { display: flex; flex-wrap: wrap; gap: 10rpx; margin-bottom: 12rpx; }
	.tool-btn { padding: 8rpx 14rpx; font-size: 20rpx; color: $gf-ink-2; border: 1rpx solid $gf-line; border-radius: 8rpx; }
	.input-row { display: flex; align-items: flex-end; gap: 12rpx; }
	.msg-input { flex: 1; min-height: 72rpx; max-height: 200rpx; padding: 16rpx; font-size: 25rpx; color: $gf-ink; background: rgba(58, 74, 82, 0.04); border: 1rpx solid $gf-line-soft; border-radius: 10rpx; }
	.send-btn { flex-shrink: 0; padding: 0 28rpx; height: 72rpx; line-height: 72rpx; font-size: 25rpx; font-weight: 700; color: #fdf6e6; background: linear-gradient(180deg, #c0463a 0%, $gf-cinnabar 100%); border-radius: 10rpx; }
	.send-btn.disabled { opacity: 0.45; }
	.emoji-panel, .quick-panel { max-height: 260rpx; margin-bottom: 12rpx; padding: 12rpx; background: rgba(58, 74, 82, 0.04); border-radius: 10rpx; }
	.emoji-item { display: inline-block; width: 64rpx; height: 64rpx; line-height: 64rpx; text-align: center; font-size: 36rpx; }
	.quick-item { padding: 14rpx; margin-bottom: 8rpx; background: $gf-card; border: 1rpx solid $gf-line-soft; border-radius: 8rpx; }
	.quick-title { display: block; font-size: 23rpx; font-weight: 600; color: $gf-ink; }
	.quick-content { display: block; margin-top: 6rpx; font-size: 21rpx; color: $gf-ink-3; }

	/* 弹层 */
	/* 底部弹框：两侧留白 + 居中，不撑满屏宽 */
	.gf-mask { align-items: center; }
	.gf-sheet {
		width: calc(100% - 64rpx);
		max-height: 76vh;
	}
	.sheet-wide { width: calc(100% - 40rpx); }
	.gf-sheet-bd { max-height: 56vh; }
	.order-item { padding: 16rpx 0; border-bottom: 1rpx solid $gf-line-soft; }
	.order-line { display: flex; justify-content: space-between; align-items: center; }
	.order-no { font-size: 23rpx; font-weight: 600; color: $gf-ink; }
	.order-product { display: block; margin-top: 8rpx; font-size: 22rpx; color: $gf-ink-2; }
	.order-meta { display: block; margin-top: 6rpx; font-size: 20rpx; color: $gf-cinnabar; }
	.profile-row { display: flex; gap: 16rpx; padding: 14rpx 0; border-bottom: 1rpx solid $gf-line-soft; }
	.profile-label { flex-shrink: 0; width: 140rpx; font-size: 22rpx; color: $gf-ink-3; }
	.profile-value { flex: 1; font-size: 23rpx; color: $gf-ink; line-height: 1.6; }
	.analyze-btn { margin-top: 24rpx; height: 72rpx; line-height: 72rpx; font-size: 24rpx; }
	.servicer-item { display: flex; align-items: center; justify-content: space-between; padding: 18rpx 16rpx; margin-bottom: 10rpx; border: 1rpx solid $gf-line-soft; border-radius: 8rpx; }
	.servicer-item.on { border-color: $gf-cinnabar; background: rgba(178, 58, 46, 0.06); }
	.servicer-name { font-size: 25rpx; color: $gf-ink; }
	.voice-result { display: block; font-size: 26rpx; line-height: 1.7; color: $gf-ink; }
	.voice-actions { display: flex; gap: 12rpx; margin-top: 24rpx; }
	.voice-btn { flex: 1; }
	.menu-edit { display: flex; align-items: center; gap: 10rpx; }
	.menu-del { font-size: 22rpx; color: $gf-cinnabar; }
	.add-menu { margin-bottom: 20rpx; height: 64rpx; line-height: 64rpx; font-size: 22rpx; }

	/* 长按菜单 */
	.ctx-mask { position: fixed; inset: 0; z-index: 99; }
	.ctx-menu { position: absolute; left: 50%; top: 40%; width: 240rpx; background: $gf-card; border: 1rpx solid $gf-line; border-radius: 12rpx; overflow: hidden; box-shadow: 0 8rpx 30rpx rgba(26, 24, 21, 0.18); }
	.ctx-item { padding: 22rpx 24rpx; font-size: 25rpx; color: $gf-ink; border-bottom: 1rpx solid $gf-line-soft; }
	.ctx-item:last-child { border-bottom: none; }
</style>
