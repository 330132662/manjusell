<script setup>
	import {
		ref
	} from 'vue'

	// 当前激活的剧目分类(0=全部 / 1=话剧 / 2=戏曲 / 3=环境式)
	const xiangmu_xuanranQ8vX3 = ref(0)
	// 当前激活的动态筛选(0=全部 / 1=短视频 / 2=直播 / 3=排练)
	const dongtai_biaoqianK3mP2 = ref(0)
	// 顶部细条搜索词
	const chaxun_zhiT9xK1 = ref('')

	// 巡演 6 行
	const xunyan_liebiaoN7mR5 = ref([{
			haoma: '09',
			riqi: '08.09 · 周五',
			chengshi: '中国 · 上海',
			changci: '上海大剧院 · 主剧场'
		},
		{
			haoma: '12',
			riqi: '08.12 · 周一',
			chengshi: '中国 · 北京',
			changci: '国家大剧院 · 歌剧厅'
		},
		{
			haoma: '14',
			riqi: '08.14 · 周三',
			chengshi: '中国 · 杭州',
			changci: '杭州大剧院 · 歌剧院'
		},
		{
			haoma: '16',
			riqi: '08.16 · 周五',
			chengshi: '中国 · 广州',
			changci: '广州大剧院 · 实验剧场'
		},
		{
			haoma: '20',
			riqi: '08.20 · 周二',
			chengshi: '中国 · 成都',
			changci: '成都凤凰剧场 · 主厅'
		},
		{
			haoma: '24',
			riqi: '08.24 · 周六',
			chengshi: '中国 · 深圳',
			changci: '深圳保利剧院 · 主厅'
		}
	])

	// 中间红色购票面板底部那条音频条:23 根,故意做成非规整的高度
	const yinpin_gaoduS1tK8 = ref([13, 23, 31, 23, 13, 19, 31, 41, 29, 17, 13, 23, 37, 23, 13, 19, 31, 23, 13, 17, 29, 19,
		11
	])

	// 本季 6 部剧(每张用一个渐变色当封面)
	const bendi_liebiaoS5mC9 = ref([{
			mingzi: '牡丹亭·2049',
			zhuanchang: '白先勇 × AI 工作室',
			shichang: '120 分钟 / 限 200 座',
			renqi: '★★★★★',
			shuoming: '剩 14 场',
			se: 'linear-gradient(135deg,#ff5252 0%,#7a1f1f 100%)'
		},
		{
			mingzi: '雷雨·平行',
			zhuanchang: '曹禺经典 × 重写',
			shichang: '95 分钟 / 实验剧场',
			renqi: '★★★★☆',
			shuoming: '剩 6 场',
			se: 'linear-gradient(135deg,#ffb74d 0%,#5d3a17 100%)'
		},
		{
			mingzi: '夜行·灯笼',
			zhuanchang: '原创悬疑',
			shichang: '85 分钟 / 沉浸式',
			renqi: '★★★★★',
			shuoming: '本周末',
			se: 'linear-gradient(135deg,#5c6bc0 0%,#1a1f4a 100%)'
		},
		{
			mingzi: '朱鹮·记',
			zhuanchang: '舞蹈剧场',
			shichang: '70 分钟 / 无对白',
			renqi: '★★★★☆',
			shuoming: '剩 22 场',
			se: 'linear-gradient(135deg,#90a4ae 0%,#2c3e50 100%)'
		}
	])

	// 新戏速递两部(图层叠加星标)
	const xinxi_liebiaoL8tN4 = ref([{
			mingzi: '三体·黑暗森林',
			zimu: '科幻史诗 · 三小时',
			kuandu: 'wide',
			se: 'linear-gradient(180deg,#000000 0%,#1a237e 60%,#000 100%)'
		},
		{
			mingzi: '无人之境',
			zimu: '环境式 · 城市漫游',
			kuandu: 'norm',
			se: 'linear-gradient(180deg,#37474f 0%,#000 100%)'
		}
	])

	// 五个核心演员
	const jutuan_liebiaoP8mB2 = ref([{
			mingzi: '白婉清',
			zhiwei: '饰 杜丽娘',
			se: 'linear-gradient(135deg,#d7ccc8 0%,#4e342e 100%)'
		},
		{
			mingzi: '陆放',
			zhiwei: '饰 柳梦梅',
			se: 'linear-gradient(135deg,#90caf9 0%,#1a237e 100%)'
		},
		{
			mingzi: '沈岸',
			zhiwei: '饰 周朴园',
			se: 'linear-gradient(135deg,#b0bec5 0%,#263238 100%)'
		},
		{
			mingzi: '林芸',
			zhiwei: '饰 蘩漪',
			se: 'linear-gradient(135deg,#f8bbd0 0%,#880e4f 100%)'
		},
		{
			mingzi: '赵北辰',
			zhiwei: '饰 罗辑',
			se: 'linear-gradient(135deg,#ffe082 0%,#6d4c00 100%)'
		}
	])

	// 剧团动态 4 卡
	const dongtai_liebiaoF6rK1 = ref([{
			mingzi: '牡丹亭排练第一周·NG',
			zimu: '短视频 · 2 天前',
			leixing: '短视频',
			se: 'linear-gradient(135deg,#ff5252,#4e342e)'
		},
		{
			mingzi: '雷雨平行 · 末场现场',
			zimu: '直播 · 1 周前',
			leixing: '直播',
			se: 'linear-gradient(135deg,#7e57c2,#1a1a2e)'
		},
		{
			mingzi: '夜行灯笼 · 装台花絮',
			zimu: '排练 · 3 天前',
			leixing: '排练',
			se: 'linear-gradient(135deg,#26a69a,#1a1a1a)'
		},
		{
			mingzi: '三体特效团队访谈',
			zimu: '访谈 · 5 小时前',
			leixing: '短视频',
			se: 'linear-gradient(135deg,#42a5f5,#0d1b2a)'
		}
	])

	// 剧评 4 篇
	const pinglun_liebiaoG8sH9 = ref([{
			biaoti: '在 2049 年的伊甸园里重活一次：评《牡丹亭·2049》',
			zuozhe: '剧评人 · 林夕',
			riqi: '08 · 02',
			se: 'linear-gradient(135deg,#ff7043,#bf360c)'
		},
		{
			biaoti: '《雷雨·平行》里那个不存在的儿子，是 AI 的隐喻',
			zuozhe: '剧评人 · 沈从',
			riqi: '07 · 28',
			se: 'linear-gradient(135deg,#5c6bc0,#1a237e)'
		},
		{
			biaoti: '沉浸式最怕是让观众尴尬：评《夜行·灯笼》',
			zuozhe: '剧评人 · 苏阳',
			riqi: '07 · 24',
			se: 'linear-gradient(135deg,#26a69a,#004d40)'
		},
		{
			biaoti: '无对白也讲了一个完整故事：评《朱鹮·记》',
			zuozhe: '剧评人 · 沈园',
			riqi: '07 · 20',
			se: 'linear-gradient(135deg,#ffa726,#bf360c)'
		}
	])

	// 点导航上面那几格,先 toast 占位一下,真跳转以后接
	function dianji_daohang8hQw(t) {
		uni.showToast({
			title: '跳转·' + t,
			icon: 'none'
		})
	}

	function toAnchor(t) {
		uni.navigateTo({
			url: "/pages/anchor-login/index"
		})
	}
	// 切换剧目分类
	function qiehuan_ximaQ7aB4(idx) {
		xiangmu_xuanranQ8vX3.value = idx
	}
	// 切换动态筛选标签
	function qiehuan_biaoqingK3mP2(idx) {
		dongtai_biaoqianK3mP2.value = idx
	}
	// 点购票(红色按钮)
	function dianji_goupiaoL8tN4(idx) {
		uni.showToast({
			title: '购票 · ' + xunyan_liebiaoN7mR5.value[idx].chengshi,
			icon: 'none'
		})
	}
	// 点剧目卡片
	function dianji_ximaM7nR3(name) {
		uni.showToast({
			title: '进入《' + name + '》',
			icon: 'none'
		})
	}
	// 点演员头像
	function dianji_yanyuanQ3kR2(name) {
		uni.showToast({
			title: '查看 ' + name,
			icon: 'none'
		})
	}
	// 搜索动作
	function sousuo_dongzuoJ2vN5() {
		if (!chaxun_zhiT9xK1.value.trim()) {
			uni.showToast({
				title: '你先输点啥',
				icon: 'none'
			})
			return
		}
		uni.showToast({
			title: '搜:' + chaxun_zhiT9xK1.value,
			icon: 'none'
		})
	}
	// 语言切换
	function yuyan_qiehuanW4rB7() {
		uni.showToast({
			title: 'EN / 中 切换占位',
			icon: 'none'
		})
	}
	// 立即购票大按钮
	function dianji_choujiangP8mB2() {
		uni.showToast({
			title: '跳转购票页',
			icon: 'none'
		})
		uni.navigateTo({
			url: "/pages/user/user"
		})

	}
	// 跳 app store / google play
	function dianji_anzhuoM5nX3(t) {
		uni.showToast({
			title: '去 ' + t,
			icon: 'none'
		})
	}
	// 切换剧团动态里的标签 chip
</script>

<template>
	<view class="shouye_wrapM7nR3">

		<!-- ===== 顶部那根细黑导航条 ===== -->
		<view class="daohang_barQ3kR2">
			<view class="daohang_zuoL8tN4">
				<text class="daohang_logoP9xK1">AI剧场</text>
				<text class="daohang_zimuK3mP2">AI THEATRE</text>
			</view>

			<view class="daohang_zhongJ5tL9">
				<text class="navLinkV1cX6" :class="{ navLinkOnF3gY2: true }" @click="dianji_daohang8hQw('剧评')">剧评</text>
				<text class="navLinkV1cX6" @click="dianji_daohang8hQw('新闻')">新闻</text>
				<text class="navLinkV1cX6" @click="dianji_daohang8hQw('票务')">票务</text>
				<text class="navLinkV1cX6" @click="toAnchor()">内部-主播</text>
			</view>

			<view class="daohang_youD8hK5">
				<view class="searchBarN6pT1">
					<text class="daohang_chaxun_icoL4rB7">⌕</text>
					<input class="daohang_chaxun_inS5mC9" v-model="chaxun_zhiT9xK1" placeholder="搜剧目 / 演员 / 剧评"
						placeholder-class="daohang_chaxun_phG2vH8" />
				</view>
				<view class="daohang_huiyuanP7xK3" @click="dianji_daohang8hQw('会员')">开通会员</view>
				<text class="daohang_dengluR9qN4" @click="dianji_daohang8hQw('登录')">登录 / 注册</text>
				<view class="daohang_yuyanT6wM2">
					<text class="daohang_yuyan_onY3zB8">中</text>
					<text class="daohang_yuyan_offH5jV1" @click="yuyan_qiehuanW4rB7">EN</text>
				</view>
			</view>
		</view>

		<!-- ===== 首屏大图 ===== -->
		<view class="shouye_heroA8cF6">

			<!-- 左侧那根细竖条:0 + 5 个小圆头像 -->
			<view class="shouye_cetiaoE2nL9">
				<text class="shouye_cetiao_szI4kP3">0</text>
				<view class="shouye_cetiao_dian1O7tR5"></view>
				<view class="shouye_cetiao_dian2U1vX8"></view>
				<view class="shouye_cetiao_dian3C9mW4"></view>
				<view class="shouye_cetiao_dian4B5nY2"></view>
				<view class="shouye_cetiao_dian5D3pT7"></view>
			</view>

			<view class="shouye_hero_kuangF6rK1">
				<!-- 左上方文字块 -->
				<view class="shouye_hero_zuoG8sH9">
					<text class="shouye_hero_xiangJ2vN5">AI THEATRE · 2026 季</text>
					<view class="shouye_hero_biaotiK9pT2">
						<text class="shouye_hero_xieyiL7mW4">七百六十万次</text>
						<text class="shouye_hero_daM5nX3"> 全网同时观看</text>
					</view>
					<text class="shouye_hero_wenQ8vR1">每晚九点,一场好戏。本季六部年度大作轮替驻场,你坐前排还是买站票随你——台上没人能看见台下谁在哭。</text>
					<view class="shouye_hero_anniuS3tL6">
						<view class="shouye_anniu_hongP4kM7" @click="dianji_choujiangP8mB2">买票进剧场</view>
						<view class="shouye_anniu_xianT2jH9" @click="dianji_daohang8hQw('排期')">看本季排期</view>
					</view>
				</view>

				<!-- 中间那张大背景图(纯 CSS 画的舞台光感) -->
				<view class="shouye_hero_renxiangV9bN5">
					<view class="shouye_hero_guangyuanW4gK8"></view>
					<text class="shouye_hero_zimuX6zC3">[ 实时舞台 · 主视角 ]</text>
				</view>

				<!-- 左下小播放卡片(当前正在演的剧目) -->
				<!-- <view class="shouye_kaB7mQ5">
					<view class="shouye_ka_tupianC8tD4">封</view>
					<view class="shouye_ka_wenziF5vS2">
						<text class="shouye_ka_biaotiH3nT7">牡丹亭 · 2049</text>
						<text class="shouye_ka_zimuJ9kL1">正在直播 · 已售 78%</text>
						<view class="shouye_ka_caozuoK2pV6">
							<text class="shouye_ka_btnN4rX9">进直播间</text>
							<text class="shouye_ka_btnN4rX9">＋收藏</text>
						</view>
					</view>
					<view class="heroAvatarsP8mB2">
						<view class="shouye_ka_tx1R5sG3"></view>
						<view class="shouye_ka_tx2S1tK8"></view>
						<view class="shouye_ka_tx3T7wL2"></view>
						<text class="shouye_ka_tx_szV5zN6">＋24</text>
					</view>
				</view> -->
			</view>
		</view>

		<!-- ===== 本季剧目 · 6 部热演 ===== -->
		<view class="bendi_quW3xP9">
			<view class="bendi_qu_biaotiX9mR1">
				<text class="bendi_qu_biaoti_ziM7nR3">本季剧目 · 6 部热演</text>
				<view class="bendi_qu_kongQ3kR2" @click="dianji_daohang8hQw('全部剧目')">查看全部 ›</view>
			</view>
			<view class="bendi_qu_fenleiK3mP2">
				<text v-for="(it,idx) in [{n:'全部',i:0},{n:'话剧',i:1},{n:'戏曲',i:2},{n:'环境式',i:3}]" :key="idx"
					:class="xiangmu_xuanranQ8vX3===it.i ? 'bendi_fenlei_onL8tN4' : 'bendi_fenleiX7dQ4'"
					@click="qiehuan_ximaQ7aB4(it.i)">{{ it.n }}</text>
			</view>
			<view class="bendi_qu_gridB8nR1">
				<view class="bendi_qu_cardZ9jT5" v-for="(it,idx) in bendi_liebiaoS5mC9" :key="idx"
					@click="dianji_ximaM7nR3(it.mingzi)">
					<view class="bendi_qu_card_tupianW2kH7" :style="{ background: it.se }">
						<text class="bendi_qu_card_renqiQ4vP8">{{ it.renqi }}</text>
						<text class="bendi_qu_card_zimuJ5tL9">{{ it.shuoming }}</text>
					</view>
					<view class="bendi_qu_card_wenbenV1cX6">
						<text class="bendi_qu_card_biaotiF3gY2">{{ it.mingzi }}</text>
						<text class="bendi_qu_card_xiaoziD8hK5">{{ it.zhuanchang }} · {{ it.shichang }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- ===== 新戏速递(1 大 + 1 中) ===== -->
		<view class="xinxi_quN6pT1">
			<view class="xinxi_qu_biaotiL4rB7">
				<text class="xinxi_biaotiS5mC9">新戏速递</text>
				<text class="xinxi_zimuG2vH8">本周新开票 · 两部</text>
			</view>
			<view class="xinxi_qu_gridP7xK3">
				<view class="xinxi_qu_kuanR9qN4" :style="{ background: xinxi_liebiaoL8tN4[0].se }"
					@click="dianji_ximaM7nR3(xinxi_liebiaoL8tN4[0].mingzi)">
					<text class="xinxi_kuan_xingT6wM2">★ NEW</text>
					<view class="xinxi_kuan_kongY3zB8"></view>
					<text class="xinxi_kuan_biaotiH5jV1">{{ xinxi_liebiaoL8tN4[0].mingzi }}</text>
					<text class="xinxi_kuan_zimuA8cF6">{{ xinxi_liebiaoL8tN4[0].zimu }}</text>
				</view>
				<view class="xinxi_qu_zhongE2nL9" :style="{ background: xinxi_liebiaoL8tN4[1].se }"
					@click="dianji_ximaM7nR3(xinxi_liebiaoL8tN4[1].mingzi)">
					<text class="xinxi_zhong_xingI4kP3">★ NEW</text>
					<text class="xinxi_zhong_biaotiO7tR5">{{ xinxi_liebiaoL8tN4[1].mingzi }}</text>
					<text class="xinxi_zhong_zimuU1vX8">{{ xinxi_liebiaoL8tN4[1].zimu }}</text>
				</view>
			</view>
		</view>

		<!-- ===== 剧团阵容(5 个) ===== -->
		<view class="jutuan_quC9mW4">
			<view class="jutuan_qu_biaotiB5nY2">
				<text class="jutuan_biaotiD3pT7">剧团阵容</text>
				<text class="jutuan_zimuF6rK1">本季主创 · 5 位</text>
			</view>
			<view class="jutuan_qu_gridG8sH9">
				<view class="jutuan_qu_cardJ2vN5" v-for="(it,idx) in jutuan_liebiaoP8mB2" :key="idx"
					@click="dianji_yanyuanQ3kR2(it.mingzi)">
					<view class="artistAvatarK9pT2" :style="{ background: it.se }">
						<text class="jutuan_qu_tx_zimuL7mW4">{{ it.mingzi.slice(0,1) }}</text>
					</view>
					<text class="jutuan_qu_mingM5nX3">{{ it.mingzi }}</text>
					<text class="jutuan_qu_zhiQ8vR1">{{ it.zhiwei }}</text>
				</view>
			</view>
		</view>

		<!-- ===== 巡演日程(表格 6 行) ===== -->
		<view class="xunyan_quS3tL6">
			<view class="xunyan_qu_biaotiP4kM7">
				<text class="xunyan_biaotiT2jH9">八月巡演 · 12 城</text>
				<text class="xunyan_zimuV9bN5">点击购票 · 现货发售</text>
			</view>
			<view class="xunyan_qu_biaotouW4gK8">
				<text class="xunyan_th_rqX6zC3">日期</text>
				<text class="xunyan_th_csB7mQ5">城市</text>
				<text class="xunyan_th_ccC8tD4">剧场</text>
				<text class="xunyan_th_btnF5vS2">操作</text>
			</view>
			<view class="tourRowH3nT7" v-for="(it,idx) in xunyan_liebiaoN7mR5" :key="idx">
				<view class="xunyan_hang_rqJ9kL1">
					<text class="xunyan_hang_haoK2pV6">{{ it.haoma }}</text>
					<text class="xunyan_hang_rq_zmN4rX9">{{ it.riqi }}</text>
				</view>
				<view class="xunyan_hang_csP8mB2">
					<text class="xunyan_hang_cs_zmR5sG3">{{ it.chengshi }}</text>
				</view>
				<view class="xunyan_hang_ccS1tK8">
					<text class="xunyan_hang_cc_zmT7wL2">{{ it.changci }}</text>
				</view>
				<view class="xunyan_hang_btnV5zN6" :class="idx===0 ? 'xunyan_btn_hongW3xP9' : 'xunyan_btn_xianX9mR1'"
					@click="dianji_goupiaoL8tN4(idx)">
					<text v-if="idx===0" class="xunyan_btn_ziM7nR3">购票</text>
					<text v-else class="xunyan_btn_zi_xianQ3kR2">购票</text>
				</view>
			</view>
		</view>

		<!-- ===== 中间大卡:歌手(演员)+ 红色购票面板 ===== -->
		<view class="dahu_quK3mP2">
			<view class="ctaCardL8tN4">
				<!-- 左侧人物 -->
				<view class="dahu_qu_renxiangX7dQ4">
					<view class="dahu_qu_renxiang_topB8nR1"></view>
					<view class="dahu_qu_renxiang_botZ9jT5"></view>
					<text class="dahu_qu_renxiang_zmW2kH7">[ 录音棚 · 主创定妆 ]</text>
					<!-- 音频条 -->
					<view class="dahu_qu_yinpinQ4vP8">
						<view v-for="(h, idx) in yinpin_gaoduS1tK8" :key="idx" class="dahu_yinpin_tiaoJ5tL9"
							:style="{ height: h + 'rpx' }"></view>
					</view>
					<view class="dahu_qu_renxiang_yingV1cX6"></view>
				</view>
				<!-- 右侧红色购票面板 -->
				<view class="dahu_qu_youF3gY2">
					<text class="dahu_you_biaotiD8hK5">立即购票</text>
					<text class="dahu_you_zimuN6pT1">新季六部 · 8 月起 · 上海 / 北京 / 杭州 / 广州 / 成都 / 深圳</text>
					<view class="dahu_you_anniuL4rB7">
						<view class="dahu_anniu_hongS5mC9" @click="dianji_choujiangP8mB2">选座购票</view>
						<view class="dahu_anniu_xianG2vH8" @click="dianji_daohang8hQw('下载')">下载客户端</view>
					</view>
					<view class="dahu_you_biaozhiP7xK3">
						<view class="dahu_biaozhi_kR9qN4" @click="dianji_anzhuoM5nX3('App Store')">
							<text class="dahu_biaozhi_xiaoT6wM2">iOS</text>
							<text class="dahu_biaozhi_daY3zB8">App Store</text>
						</view>
						<view class="dahu_biaozhi_kH5jV1" @click="dianji_anzhuoM5nX3('Google Play')">
							<text class="dahu_biaozhi_xiaoA8cF6">Android</text>
							<text class="dahu_biaozhi_daE2nL9">Google Play</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- ===== 剧团动态 ===== -->
		<view class="dongtai_quI4kP3">
			<view class="dongtai_qu_biaotiO7tR5">
				<text class="dongtai_biaotiU1vX8">剧团动态</text>
				<view class="dongtai_qu_fenleiquC9mW4">
					<text v-for="(it,idx) in [{n:'全部',i:0},{n:'短视频',i:1},{n:'直播',i:2},{n:'排练花絮',i:3}]" :key="idx"
						:class="dongtai_biaoqianK3mP2===it.i ? 'dongtai_fenlei_onB5nY2' : 'dongtai_fenleiD3pT7'"
						@click="qiehuan_biaoqingK3mP2(it.i)">{{ it.n }}</text>
				</view>
			</view>
			<view class="dongtai_qu_gridF6rK1">
				<view class="dongtai_qu_cardG8sH9" v-for="(it,idx) in dongtai_liebiaoF6rK1" :key="idx">
					<view class="dongtai_qu_tupianJ2vN5" :style="{ background: it.se }">
						<text class="dongtai_qu_tupian_playK9pT2">▶</text>
					</view>
					<view class="dongtai_qu_wenbenL7mW4">
						<text class="dongtai_qu_biaotiM5nX3">{{ it.mingzi }}</text>
						<text class="dongtai_qu_zimuQ8vR1">{{ it.zimu }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- ===== 剧评精选 ===== -->
		<view class="pinglun_quS3tL6">
			<view class="pinglun_qu_biaotiP4kM7">
				<text class="pinglun_biaotiT2jH9">剧评精选</text>
				<text class="pinglun_zimuV9bN5">主笔评 · 共 24 篇</text>
			</view>
			<view class="pinglun_qu_gridW4gK8">
				<view class="pinglun_qu_cardX6zC3" v-for="(it,idx) in pinglun_liebiaoG8sH9" :key="idx">
					<view class="pinglun_qu_tupianB7mQ5" :style="{ background: it.se }">
						<text class="pinglun_qu_tupian_riqiC8tD4">{{ it.riqi }}</text>
					</view>
					<view class="pinglun_qu_wenbenF5vS2">
						<text class="pinglun_qu_biaotiH3nT7">{{ it.biaoti }}</text>
						<text class="pinglun_qu_zimuJ9kL1">{{ it.zuozhe }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- ===== 底部红通栏下载区 ===== -->
		<view class="partnerBandK2pV6">
			<view class="hongdi_qu_kuangN4rX9">
				<view class="hongdi_qu_zuoP8mB2">
					<text class="hongdi_zuo_biaotiR5sG3">AI剧场</text>
					<text class="hongdi_zuo_zimuS1tK8">好戏不停 · 客户端下载</text>
					<text class="hongdi_zuo_xiangT7wL2">购票 · 直播 · 排练花絮 · 一站搞定</text>
				</view>
				<view class="hongdi_qu_youV5zN6">
					<view class="hongdi_biaozhi_kW3xP9" @click="dianji_anzhuoM5nX3('App Store')">
						<text class="hongdi_biaozhi_xiaoX9mR1">iOS</text>
						<text class="hongdi_biaozhi_daM7nR3">App Store 下载</text>
					</view>
					<view class="hongdi_biaozhi_kQ3kR2" @click="dianji_anzhuoM5nX3('Google Play')">
						<text class="hongdi_biaozhi_xiaoK3mP2">Android</text>
						<text class="hongdi_biaozhi_daL8tN4">Google Play 下载</text>
					</view>
				</view>
			</view>
		</view>

		<!-- ===== 多列页脚 ===== -->
		<view class="yemei_quX7dQ4">
			<view class="yemei_qu_gridB8nR1">
				<view class="yemei_qu_lieZ9jT5">
					<text class="yemei_lie_biaotiW2kH7">帮助</text>
					<text class="yemei_lie_lianjieQ4vP8">购票流程</text>
					<text class="yemei_lie_lianjieQ4vP8">入场须知</text>
					<text class="yemei_lie_lianjieQ4vP8">退换政策</text>
					<text class="yemei_lie_lianjieQ4vP8">FAQ</text>
				</view>
				<view class="yemei_qu_lieJ5tL9">
					<text class="yemei_lie_biaotiV1cX6">公司</text>
					<text class="yemei_lie_lianjieF3gY2">关于 AI剧场</text>
					<text class="yemei_lie_lianjieF3gY2">剧团合作</text>
					<text class="yemei_lie_lianjieF3gY2">商务洽谈</text>
					<text class="yemei_lie_lianjieF3gY2">加入我们</text>
				</view>
				<view class="yemei_qu_lieD8hK5">
					<text class="yemei_lie_biaotiN6pT1">联系我们</text>
					<text class="yemei_lie_lianjieL4rB7">hi@ai-theatre.com</text>
					<text class="yemei_lie_lianjieL4rB7">400-888-2026</text>
					<text class="yemei_lie_lianjieL4rB7">上海 徐汇 衡复路 7 号</text>
				</view>
				<view class="yemei_qu_lieS5mC9">
					<text class="yemei_lie_biaotiG2vH8">条款</text>
					<text class="yemei_lie_lianjieP7xK3">服务协议</text>
					<text class="yemei_lie_lianjieP7xK3">隐私政策</text>
					<text class="yemei_lie_lianjieP7xK3">Cookie 设置</text>
					<text class="yemei_lie_lianjieP7xK3">ICP 备案 沪 2026-007</text>
				</view>
			</view>
			<view class="footerBottomR9qN4">
				<text class="yemei_dibu_wziT6wM2">© 2026 AI剧场 · 沪公网安备 31010402001188 号</text>
				<view class="yemei_dibu_shejiaoY3zB8">
					<text class="yemei_shejiao_kH5jV1">微</text>
					<text class="yemei_shejiao_kA8cF6">博</text>
					<text class="yemei_shejiao_kE2nL9">红</text>
					<text class="yemei_shejiao_kI4kP3">抖</text>
				</view>
			</view>
		</view>

	</view>
</template>

<style scoped>
	/* 全文件刻意用「非整倍数」间距——13 / 17 / 19 / 23 / 29 / 31 / 37 / 41 / 43 / 47 / 53 / 59 / 67 / 71 / 79 / 83 rpx,不是 4/8 倍 */

	/* ====== 容器底色 ====== */
	.shouye_wrapM7nR3 {
		width: 100%;
		background: #000;
		color: #fff;
		font-family: "Inter", "PingFang SC", system-ui, sans-serif;
		padding-bottom: 73rpx;
	}

	/* ====== 顶部导航(细黑条) ====== */
	.daohang_barQ3kR2 {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 17rpx 47rpx;
		background: #0a0a0a;
		border-bottom: 1rpx solid #1a1a1a;
	}

	.daohang_zuoL8tN4 {
		display: flex;
		align-items: baseline;
		gap: 11rpx;
	}

	.daohang_logoP9xK1 {
		color: #fff;
		font-size: 33rpx;
		font-weight: 700;
		letter-spacing: 1rpx;
	}

	.daohang_zimuK3mP2 {
		color: #6f6f6f;
		/* font-size: 15rpx; */
		letter-spacing: 3rpx;
		text-transform: uppercase;
	}

	.daohang_zhongJ5tL9 {
		display: flex;
		gap: 41rpx;
	}

	.navLinkV1cX6 {
		color: #b8b8b8;
		/* font-size: 28rpx; */
		padding: 7rpx 11rpx;
		cursor: pointer;
		transition: color .15s ease;
	}

	.navLinkV1cX6:hover {
		color: #fff;
	}

	.navLinkOnF3gY2 {
		color: #fff;
	}

	.daohang_youD8hK5 {
		display: flex;
		align-items: center;
		gap: 19rpx;
	}

	.searchBarN6pT1 {
		display: flex;
		align-items: center;
		gap: 7rpx;
		background: #141414;
		border: 1rpx solid #1f1f1f;
		border-radius: 197rpx;
		padding: 5rpx 17rpx;
		width: 197rpx;
	}

	.daohang_chaxun_icoL4rB7 {
		color: #6f6f6f;
		/* font-size: 18rpx; */
	}

	.daohang_chaxun_inS5mC9 {
		background: transparent;
		color: #fff;
		/* font-size: 15rpx; */
		flex: 1;
		outline: none;
	}

	.daohang_chaxun_phG2vH8 {
		color: #5a5a5a;
		/* font-size: 15rpx; */
	}

	.daohang_huiyuanP7xK3 {
		border: 1rpx solid #e63027;
		color: #e63027;
		border-radius: 197rpx;
		padding: 5rpx 19rpx;
		/* font-size: 15rpx; */
	}

	.daohang_dengluR9qN4 {
		background: #e63027;
		color: #fff;
		border-radius: 197rpx;
		padding: 7rpx 23rpx;
		/* font-size: 15rpx; */
	}

	.daohang_yuyanT6wM2 {
		display: flex;
		gap: 9rpx;
		align-items: center;
		/* font-size: 15rpx; */
	}

	.daohang_yuyan_onY3zB8 {
		color: #fff;
	}

	.daohang_yuyan_offH5jV1 {
		color: #6f6f6f;
	}

	/* ====== 首屏大图 ====== */
	.shouye_heroA8cF6 {
		position: relative;
		width: 100%;
		display: flex;
		background: #0a0a0a;
		padding: 23rpx 47rpx 47rpx 67rpx;
	}

	.shouye_cetiaoE2nL9 {
		width: 31rpx;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 17rpx;
		padding-top: 47rpx;
	}

	.shouye_cetiao_szI4kP3 {
		color: #fff;
		/* font-size: 18rpx; */
		font-weight: 600;
	}

	.shouye_cetiao_dian1O7tR5,
	.shouye_cetiao_dian2U1vX8,
	.shouye_cetiao_dian3C9mW4,
	.shouye_cetiao_dian4B5nY2,
	.shouye_cetiao_dian5D3pT7 {
		width: 19rpx;
		height: 19rpx;
		border-radius: 50%;
		border: 1rpx solid #2a2a2a;
	}

	.shouye_cetiao_dian1O7tR5 {
		background: linear-gradient(135deg, #ff8a65, #bf360c);
	}

	.shouye_cetiao_dian2U1vX8 {
		background: linear-gradient(135deg, #90a4ae, #37474f);
	}

	.shouye_cetiao_dian3C9mW4 {
		background: linear-gradient(135deg, #fff59d, #6d4c00);
	}

	.shouye_cetiao_dian4B5nY2 {
		background: linear-gradient(135deg, #80cbc4, #1b5e20);
	}

	.shouye_cetiao_dian5D3pT7 {
		background: linear-gradient(135deg, #b39ddb, #311b92);
	}

	.shouye_hero_kuangF6rK1 {
		flex: 1;
		position: relative;
		min-height: 697rpx;
		background:
			radial-gradient(circle at 73% 29%, rgba(230, 48, 39, .21) 0%, transparent 47%),
			radial-gradient(circle at 17% 73%, rgba(255, 255, 255, .07) 0%, transparent 47%),
			linear-gradient(135deg, #000 0%, #0a0a0a 47%, #000 100%);
		border-radius: 11rpx;
		overflow: hidden;
	}

	.shouye_hero_zuoG8sH9 {
		position: absolute;
		top: 47rpx;
		left: 41rpx;
		z-index: 9;
		width: 367rpx;
	}

	.shouye_hero_xiangJ2vN5 {
		color: #e63027;
		/* font-size: 15rpx; */
		letter-spacing: 7rpx;
		text-transform: uppercase;
		font-weight: 600;
	}

	.shouye_hero_biaotiK9pT2 {
		margin-top: 19rpx;
		line-height: 1;
	}

	.shouye_hero_xieyiL7mW4 {
		font-family: "Cormorant Garamond", "Noto Serif SC", serif;
		font-style: italic;
		font-weight: 600;
		font-size: 79rpx;
		color: #fff;
		letter-spacing: -1rpx;
	}

	.shouye_hero_daM5nX3 {
		color: #b8b8b8;
		font-size: 31rpx;
		font-weight: 300;
		letter-spacing: 1rpx;
	}

	.shouye_hero_wenQ8vR1 {
		display: block;
		margin-top: 23rpx;
		color: #8c8c8c;
		font-size: 16rpx;
		line-height: 1.7;
	}

	.shouye_hero_anniuS3tL6 {
		display: flex;
		gap: 13rpx;
		margin-top: 31rpx;
		font-size: 100rpx;
	}

	.shouye_anniu_hongP4kM7 {
		background: #e63027;
		color: #fff;
		padding: 13rpx 29rpx;
		border-radius: 197rpx;
		font-size: 26rpx;
		font-weight: 600;
	}

	.shouye_anniu_xianT2jH9 {
		border: 1rpx solid #fff;
		color: #fff;
		padding: 13rpx 29rpx;
		border-radius: 197rpx;
		font-size: 26rpx;
	}

	.shouye_hero_renxiangV9bN5 {
		position: absolute;
		inset: 0 31rpx 0 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.shouye_hero_guangyuanW4gK8 {
		position: absolute;
		width: 397rpx;
		height: 397rpx;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255, 255, 255, .21) 0%, transparent 67%);
	}

	.shouye_hero_zimuX6zC3 {
		position: relative;
		z-index: 9;
		color: #fff;
		font-size: 18rpx;
		letter-spacing: 5rpx;
		text-transform: uppercase;
		opacity: .43;
	}

	.shouye_kaB7mQ5 {
		position: absolute;
		left: 41rpx;
		bottom: 31rpx;
		z-index: 9;
		display: flex;
		align-items: center;
		gap: 17rpx;
		background: rgba(17, 17, 17, .87);
		backdrop-filter: blur(9rpx);
		border: 1rpx solid #1f1f1f;
		border-radius: 13rpx;
		padding: 13rpx 19rpx 13rpx 13rpx;
		width: 433rpx;
	}

	.shouye_ka_tupianC8tD4 {
		width: 67rpx;
		height: 67rpx;
		border-radius: 9rpx;
		flex-shrink: 0;
		background: linear-gradient(135deg, #ff5252, #7a1f1f);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 15rpx;
		font-weight: 600;
	}

	.shouye_ka_wenziF5vS2 {
		flex: 1;
	}

	.shouye_ka_biaotiH3nT7 {
		color: #fff;
		font-size: 18rpx;
		font-weight: 600;
	}

	.shouye_ka_zimuJ9kL1 {
		color: #8c8c8c;
		font-size: 15rpx;
		margin-top: 5rpx;
		display: block;
	}

	.shouye_ka_caozuoK2pV6 {
		display: flex;
		gap: 11rpx;
		margin-top: 9rpx;
	}

	.shouye_ka_btnN4rX9 {
		color: #e63027;
		font-size: 15rpx;
	}

	.heroAvatarsP8mB2 {
		display: flex;
		align-items: center;
		gap: -7rpx;
		flex-shrink: 0;
	}

	.shouye_ka_tx1R5sG3,
	.shouye_ka_tx2S1tK8,
	.shouye_ka_tx3T7wL2 {
		width: 29rpx;
		height: 29rpx;
		border-radius: 50%;
		border: 1rpx solid #0a0a0a;
		margin-left: -7rpx;
	}

	.shouye_ka_tx1R5sG3 {
		background: linear-gradient(135deg, #ff8a65, #bf360c);
	}

	.shouye_ka_tx2S1tK8 {
		background: linear-gradient(135deg, #90a4ae, #37474f);
	}

	.shouye_ka_tx3T7wL2 {
		background: linear-gradient(135deg, #fff59d, #6d4c00);
	}

	.shouye_ka_tx_szV5zN6 {
		color: #8c8c8c;
		font-size: 15rpx;
		margin-left: 11rpx;
	}

	/* ====== 本季剧目 ====== */
	.bendi_quW3xP9 {
		padding: 71rpx 47rpx 47rpx;
	}

	.bendi_qu_biaotiX9mR1 {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 23rpx;
	}

	.bendi_qu_biaoti_ziM7nR3 {
		color: #fff;
		font-size: 29rpx;
		font-weight: 700;
	}

	.bendi_qu_kongQ3kR2 {
		color: #8c8c8c;
		font-size: 15rpx;
	}

	.bendi_qu_fenleiK3mP2 {
		display: flex;
		gap: 13rpx;
		margin-bottom: 31rpx;
	}

	.bendi_fenleiX7dQ4 {
		background: #141414;
		color: #8c8c8c;
		padding: 9rpx 23rpx;
		border-radius: 197rpx;
		font-size: 15rpx;
	}

	.bendi_fenlei_onL8tN4 {
		background: #e63027;
		color: #fff;
		padding: 9rpx 23rpx;
		border-radius: 197rpx;
		font-size: 15rpx;
		font-weight: 600;
	}

	.bendi_qu_gridB8nR1 {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 19rpx;
	}

	.bendi_qu_cardZ9jT5 {
		cursor: pointer;
		transition: transform .15s ease;
	}

	.bendi_qu_cardZ9jT5:hover {
		transform: translateY(-5rpx);
	}

	.bendi_qu_card_tupianW2kH7 {
		width: 100%;
		aspect-ratio: 1 / 1;
		border-radius: 9rpx;
		padding: 17rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
		overflow: hidden;
	}

	.bendi_qu_card_renqiQ4vP8 {
		color: #fff;
		font-size: 16rpx;
		letter-spacing: 1rpx;
	}

	.bendi_qu_card_zimuJ5tL9 {
		color: rgba(255, 255, 255, .79);
		font-size: 16rpx;
		align-self: flex-end;
	}

	.bendi_qu_card_wenbenV1cX6 {
		padding: 13rpx 5rpx 0;
	}

	.bendi_qu_card_biaotiF3gY2 {
		display: block;
		color: #fff;
		font-size: 18rpx;
		font-weight: 600;
	}

	.bendi_qu_card_xiaoziD8hK5 {
		display: block;
		color: #6f6f6f;
		font-size: 15rpx;
		margin-top: 7rpx;
	}

	/* ====== 新戏速递 ====== */
	.xinxi_quN6pT1 {
		padding: 47rpx 47rpx 0;
	}

	.xinxi_qu_biaotiL4rB7 {
		margin-bottom: 23rpx;
	}

	.xinxi_biaotiS5mC9 {
		color: #fff;
		font-size: 29rpx;
		font-weight: 700;
	}

	.xinxi_zimuG2vH8 {
		display: block;
		color: #6f6f6f;
		font-size: 15rpx;
		margin-top: 7rpx;
	}

	.xinxi_qu_gridP7xK3 {
		display: grid;
		grid-template-columns: 1.7fr 1fr;
		gap: 19rpx;
		margin-top: 31rpx;
	}

	.xinxi_qu_kuanR9qN4 {
		min-height: 367rpx;
		border-radius: 11rpx;
		padding: 23rpx;
		position: relative;
		overflow: hidden;
		cursor: pointer;
		display: flex;
		flex-direction: column;
	}

	.xinxi_kuan_xingT6wM2 {
		color: #e63027;
		font-size: 15rpx;
		letter-spacing: 3rpx;
		font-weight: 600;
	}

	.xinxi_kuan_kongY3zB8 {
		flex: 1;
	}

	.xinxi_kuan_biaotiH5jV1 {
		color: #fff;
		font-size: 31rpx;
		font-weight: 700;
	}

	.xinxi_kuan_zimuA8cF6 {
		color: rgba(255, 255, 255, .79);
		font-size: 15rpx;
		margin-top: 7rpx;
		display: block;
	}

	.xinxi_qu_zhongE2nL9 {
		min-height: 197rpx;
		border-radius: 11rpx;
		padding: 23rpx;
		position: relative;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.xinxi_zhong_xingI4kP3 {
		color: #e63027;
		font-size: 15rpx;
		letter-spacing: 3rpx;
		font-weight: 600;
		position: absolute;
		top: 19rpx;
		left: 19rpx;
	}

	.xinxi_zhong_biaotiO7tR5 {
		color: #fff;
		font-size: 23rpx;
		font-weight: 700;
	}

	.xinxi_zhong_zimuU1vX8 {
		color: rgba(255, 255, 255, .79);
		font-size: 15rpx;
		margin-top: 7rpx;
		display: block;
	}

	/* ====== 剧团阵容 ====== */
	.jutuan_quC9mW4 {
		padding: 73rpx 47rpx 31rpx;
	}

	.jutuan_qu_biaotiB5nY2 {
		margin-bottom: 31rpx;
	}

	.jutuan_biaotiD3pT7 {
		color: #fff;
		font-size: 29rpx;
		font-weight: 700;
	}

	.jutuan_zimuF6rK1 {
		display: block;
		color: #6f6f6f;
		font-size: 15rpx;
		margin-top: 7rpx;
	}

	.jutuan_qu_gridG8sH9 {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 17rpx;
	}

	.jutuan_qu_cardJ2vN5 {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		text-align: center;
	}

	.artistAvatarK9pT2 {
		width: 100%;
		aspect-ratio: 1 / 1;
		border-radius: 9rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	.jutuan_qu_tx_zimuL7mW4 {
		color: rgba(255, 255, 255, .79);
		font-size: 43rpx;
		font-weight: 700;
	}

	.jutuan_qu_mingM5nX3 {
		color: #fff;
		font-size: 16rpx;
		margin-top: 11rpx;
		font-weight: 500;
	}

	.jutuan_qu_zhiQ8vR1 {
		color: #6f6f6f;
		font-size: 15rpx;
		margin-top: 5rpx;
	}

	/* ====== 巡演列表 ====== */
	.xunyan_quS3tL6 {
		padding: 67rpx 47rpx;
	}

	.xunyan_qu_biaotiP4kM7 {
		margin-bottom: 23rpx;
	}

	.xunyan_biaotiT2jH9 {
		color: #fff;
		font-size: 29rpx;
		font-weight: 700;
	}

	.xunyan_zimuV9bN5 {
		display: block;
		color: #6f6f6f;
		font-size: 15rpx;
		margin-top: 7rpx;
	}

	.xunyan_qu_biaotouW4gK8 {
		display: flex;
		align-items: center;
		padding: 13rpx 0;
		border-bottom: 1rpx solid #1a1a1a;
		font-size: 15rpx;
		color: #6f6f6f;
	}

	.xunyan_th_rqX6zC3 {
		width: 187rpx;
		flex-shrink: 0;
	}

	.xunyan_th_csB7mQ5 {
		width: 217rpx;
		flex-shrink: 0;
	}

	.xunyan_th_ccC8tD4 {
		flex: 1;
	}

	.xunyan_th_btnF5vS2 {
		width: 173rpx;
		text-align: right;
	}

	.tourRowH3nT7 {
		display: flex;
		align-items: center;
		padding: 23rpx 0;
		border-bottom: 1rpx solid #141414;
	}

	.xunyan_hang_rqJ9kL1 {
		width: 187rpx;
		flex-shrink: 0;
		display: flex;
		align-items: baseline;
		gap: 11rpx;
	}

	.xunyan_hang_haoK2pV6 {
		color: #e63027;
		font-size: 41rpx;
		font-weight: 700;
		line-height: 1;
	}

	.xunyan_hang_rq_zmN4rX9 {
		color: #6f6f6f;
		font-size: 15rpx;
	}

	.xunyan_hang_csP8mB2 {
		width: 217rpx;
		flex-shrink: 0;
	}

	.xunyan_hang_cs_zmR5sG3 {
		color: #fff;
		font-size: 16rpx;
	}

	.xunyan_hang_ccS1tK8 {
		flex: 1;
	}

	.xunyan_hang_cc_zmT7wL2 {
		color: #8c8c8c;
		font-size: 15rpx;
	}

	.xunyan_hang_btnV5zN6 {
		width: 173rpx;
		text-align: right;
	}

	.xunyan_btn_hongW3xP9 {
		display: inline-block;
		background: #e63027;
		color: #fff;
		padding: 11rpx 23rpx;
		border-radius: 197rpx;
		font-size: 15rpx;
	}

	.xunyan_btn_xianX9mR1 {
		display: inline-block;
		border: 1rpx solid #e63027;
		color: #e63027;
		padding: 9rpx 19rpx;
		border-radius: 197rpx;
		font-size: 15rpx;
	}

	.xunyan_btn_ziM7nR3,
	.xunyan_btn_zi_xianQ3kR2 {
		color: inherit;
		font-size: inherit;
	}

	/* ====== 中间大红色购票面板 ====== */
	.dahu_quK3mP2 {
		padding: 47rpx 47rpx 73rpx;
	}

	.ctaCardL8tN4 {
		display: grid;
		grid-template-columns: 1.4fr 1fr;
		gap: 19rpx;
		background: #0a0a0a;
		border-radius: 13rpx;
		overflow: hidden;
		min-height: 397rpx;
	}

	.dahu_qu_renxiangX7dQ4 {
		position: relative;
		overflow: hidden;
		background:
			radial-gradient(circle at 53% 37%, rgba(255, 255, 255, .13) 0%, transparent 53%),
			linear-gradient(135deg, #000 0%, #1a1a1a 47%, #0a0a0a 100%);
	}

	.dahu_qu_renxiang_topB8nR1 {
		position: absolute;
		top: 31rpx;
		left: 31rpx;
		width: 73rpx;
		height: 73rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, .07);
		border: 1rpx solid rgba(255, 255, 255, .13);
	}

	.dahu_qu_renxiang_botZ9jT5 {
		position: absolute;
		bottom: 31rpx;
		left: 31rpx;
		right: 31rpx;
		height: 137rpx;
		background: linear-gradient(180deg, transparent, #000);
	}

	.dahu_qu_renxiang_zmW2kH7 {
		position: absolute;
		top: 31rpx;
		left: 47%;
		color: rgba(255, 255, 255, .5);
		font-size: 15rpx;
		letter-spacing: 5rpx;
		text-transform: uppercase;
	}

	.dahu_qu_renxiang_yingV1cX6 {
		position: absolute;
		top: 47%;
		left: 47%;
		width: 67rpx;
		height: 67rpx;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255, 255, 255, .21), transparent 73%);
	}

	.dahu_qu_yinpinQ4vP8 {
		position: absolute;
		bottom: 23rpx;
		left: 31rpx;
		right: 31rpx;
		display: flex;
		gap: 5rpx;
		align-items: flex-end;
		height: 41rpx;
	}

	.dahu_yinpin_tiaoJ5tL9 {
		width: 5rpx;
		background: #e63027;
		border-radius: 1rpx;
	}

	.dahu_qu_youF3gY2 {
		background: #e63027;
		padding: 41rpx 31rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.dahu_you_biaotiD8hK5 {
		color: #fff;
		font-size: 41rpx;
		font-weight: 700;
		line-height: 1;
	}

	.dahu_you_zimuN6pT1 {
		color: rgba(255, 255, 255, .87);
		font-size: 15rpx;
		line-height: 1.7;
		margin-top: 13rpx;
	}

	.dahu_you_anniuL4rB7 {
		display: flex;
		gap: 11rpx;
		margin-top: 23rpx;
	}

	.dahu_anniu_hongS5mC9 {
		background: #fff;
		color: #e63027;
		padding: 13rpx 23rpx;
		border-radius: 197rpx;
		font-size: 16rpx;
		font-weight: 600;
	}

	.dahu_anniu_xianG2vH8 {
		border: 1rpx solid #fff;
		color: #fff;
		padding: 13rpx 23rpx;
		border-radius: 197rpx;
		font-size: 16rpx;
	}

	.dahu_you_biaozhiP7xK3 {
		display: flex;
		gap: 11rpx;
		margin-top: 19rpx;
	}

	.dahu_biaozhi_kR9qN4,
	.dahu_biaozhi_kH5jV1 {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: rgba(0, 0, 0, .21);
		padding: 9rpx 19rpx;
		border-radius: 9rpx;
	}

	.dahu_biaozhi_xiaoT6wM2 {
		color: rgba(255, 255, 255, .79);
		font-size: 16rpx;
	}

	.dahu_biaozhi_xiaoA8cF6 {
		color: rgba(255, 255, 255, .79);
		font-size: 16rpx;
	}

	.dahu_biaozhi_daY3zB8 {
		color: #fff;
		font-size: 15rpx;
		margin-top: 3rpx;
	}

	.dahu_biaozhi_daE2nL9 {
		color: #fff;
		font-size: 15rpx;
		margin-top: 3rpx;
	}

	/* ====== 剧团动态 ====== */
	.dongtai_quI4kP3 {
		padding: 47rpx 47rpx 31rpx;
	}

	.dongtai_qu_biaotiO7tR5 {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 23rpx;
	}

	.dongtai_biaotiU1vX8 {
		color: #fff;
		font-size: 29rpx;
		font-weight: 700;
	}

	.dongtai_qu_fenleiquC9mW4 {
		display: flex;
		gap: 11rpx;
	}

	.dongtai_fenleiD3pT7 {
		background: #141414;
		color: #8c8c8c;
		padding: 9rpx 23rpx;
		border-radius: 197rpx;
		font-size: 15rpx;
	}

	.dongtai_fenlei_onB5nY2 {
		background: #fff;
		color: #000;
		padding: 9rpx 23rpx;
		border-radius: 197rpx;
		font-size: 15rpx;
		font-weight: 600;
	}

	.dongtai_qu_gridF6rK1 {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 19rpx;
	}

	.dongtai_qu_cardG8sH9 {
		cursor: pointer;
	}

	.dongtai_qu_tupianJ2vN5 {
		width: 100%;
		aspect-ratio: 16/9;
		border-radius: 9rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dongtai_qu_tupian_playK9pT2 {
		width: 53rpx;
		height: 53rpx;
		border-radius: 50%;
		background: rgba(0, 0, 0, .43);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18rpx;
	}

	.dongtai_qu_wenbenL7mW4 {
		padding: 13rpx 5rpx 0;
	}

	.dongtai_qu_biaotiM5nX3 {
		display: block;
		color: #fff;
		font-size: 16rpx;
		font-weight: 500;
	}

	.dongtai_qu_zimuQ8vR1 {
		display: block;
		color: #6f6f6f;
		font-size: 15rpx;
		margin-top: 7rpx;
	}

	/* ====== 剧评精选 ====== */
	.pinglun_quS3tL6 {
		padding: 71rpx 47rpx 47rpx;
	}

	.pinglun_qu_biaotiP4kM7 {
		margin-bottom: 23rpx;
	}

	.pinglun_biaotiT2jH9 {
		color: #fff;
		font-size: 29rpx;
		font-weight: 700;
	}

	.pinglun_zimuV9bN5 {
		display: block;
		color: #6f6f6f;
		font-size: 15rpx;
		margin-top: 7rpx;
	}

	.pinglun_qu_gridW4gK8 {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 19rpx;
	}

	.pinglun_qu_cardX6zC3 {
		cursor: pointer;
	}

	.pinglun_qu_tupianB7mQ5 {
		width: 100%;
		aspect-ratio: 4/3;
		border-radius: 9rpx;
		position: relative;
		display: flex;
		align-items: flex-end;
	}

	.pinglun_qu_tupian_riqiC8tD4 {
		color: #fff;
		font-size: 23rpx;
		font-weight: 700;
		margin: 17rpx;
	}

	.pinglun_qu_wenbenF5vS2 {
		padding: 13rpx 5rpx 0;
	}

	.pinglun_qu_biaotiH3nT7 {
		display: block;
		color: #fff;
		font-size: 16rpx;
		font-weight: 500;
		line-height: 1.5;
	}

	.pinglun_qu_zimuJ9kL1 {
		display: block;
		color: #6f6f6f;
		font-size: 15rpx;
		margin-top: 9rpx;
	}

	/* ====== 底部红通栏下载 ====== */
	.partnerBandK2pV6 {
		background: #e63027;
		padding: 67rpx 47rpx;
		margin-top: 41rpx;
	}

	.hongdi_qu_kuangN4rX9 {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 31rpx;
	}

	.hongdi_qu_zuoP8mB2 {
		display: flex;
		flex-direction: column;
		gap: 5rpx;
	}

	.hongdi_zuo_biaotiR5sG3 {
		color: #fff;
		font-size: 47rpx;
		font-weight: 700;
		letter-spacing: -1rpx;
	}

	.hongdi_zuo_zimuS1tK8 {
		color: rgba(255, 255, 255, .87);
		font-size: 18rpx;
		margin-top: 11rpx;
		display: block;
	}

	.hongdi_zuo_xiangT7wL2 {
		color: rgba(255, 255, 255, .79);
		font-size: 15rpx;
		margin-top: 7rpx;
		display: block;
	}

	.hongdi_qu_youV5zN6 {
		display: flex;
		gap: 13rpx;
	}

	.hongdi_biaozhi_kW3xP9,
	.hongdi_biaozhi_kQ3kR2 {
		display: flex;
		flex-direction: column;
		background: #000;
		padding: 13rpx 23rpx;
		border-radius: 11rpx;
	}

	.hongdi_biaozhi_xiaoX9mR1,
	.hongdi_biaozhi_xiaoK3mP2 {
		color: rgba(255, 255, 255, .79);
		font-size: 15rpx;
	}

	.hongdi_biaozhi_daM7nR3,
	.hongdi_biaozhi_daL8tN4 {
		color: #fff;
		font-size: 18rpx;
		font-weight: 600;
		margin-top: 3rpx;
	}

	/* ====== 页脚 ====== */
	.yemei_quX7dQ4 {
		background: #000;
		padding: 67rpx 47rpx 31rpx;
	}

	.yemei_qu_gridB8nR1 {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 31rpx;
		padding-bottom: 41rpx;
	}

	.yemei_qu_lieZ9jT5,
	.yemei_qu_lieJ5tL9,
	.yemei_qu_lieD8hK5,
	.yemei_qu_lieS5mC9 {
		display: flex;
		flex-direction: column;
		gap: 5rpx;
	}

	.yemei_lie_biaotiW2kH7,
	.yemei_lie_biaotiV1cX6,
	.yemei_lie_biaotiN6pT1,
	.yemei_lie_biaotiG2vH8 {
		display: block;
		color: #fff;
		font-size: 16rpx;
		font-weight: 600;
		margin-bottom: 13rpx;
	}

	.yemei_lie_lianjieQ4vP8,
	.yemei_lie_lianjieF3gY2,
	.yemei_lie_lianjieL4rB7,
	.yemei_lie_lianjieP7xK3 {
		display: block;
		color: #6f6f6f;
		font-size: 35rpx;
		margin-bottom: 7rpx;
		cursor: pointer;
	}

	.footerBottomR9qN4 {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 23rpx;
		border-top: 1rpx solid #1a1a1a;
	}

	.yemei_dibu_wziT6wM2 {
		color: #6f6f6f;
		font-size: 15rpx;
	}

	.yemei_dibu_shejiaoY3zB8 {
		display: flex;
		gap: 11rpx;
	}

	.yemei_shejiao_kH5jV1,
	.yemei_shejiao_kA8cF6,
	.yemei_shejiao_kE2nL9,
	.yemei_shejiao_kI4kP3 {
		width: 31rpx;
		height: 31rpx;
		border-radius: 50%;
		background: #141414;
		color: #8c8c8c;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 15rpx;
	}

	/* ====== 三端响应式 ====== */
	@media (min-width: 768px) and (max-width: 1023px) {

		/* 平板:导航折叠 + 多列降级 + 大块占用比例调整 */
		.daohang_barQ3kR2 {
			padding: 17rpx 31rpx;
		}

		.searchBarN6pT1 {
			width: 137rpx;
		}

		.daohang_zhongJ5tL9 {
			gap: 29rpx;
		}

		.bendi_qu_gridB8nR1 {
			grid-template-columns: repeat(3, 1fr);
		}

		.xinxi_qu_gridP7xK3 {
			grid-template-columns: 1fr 1fr;
		}

		.jutuan_qu_gridG8sH9 {
			grid-template-columns: repeat(3, 1fr);
		}

		.xunyan_th_rqX6zC3,
		.xunyan_hang_rqJ9kL1 {
			width: 137rpx;
		}

		.xunyan_th_csB7mQ5,
		.xunyan_hang_csP8mB2 {
			width: 167rpx;
		}

		.xunyan_th_btnF5vS2,
		.xunyan_hang_btnV5zN6 {
			width: 137rpx;
		}

		.ctaCardL8tN4 {
			grid-template-columns: 1fr;
		}

		.dahu_qu_renxiangX7dQ4 {
			min-height: 297rpx;
		}

		.dongtai_qu_gridF6rK1 {
			grid-template-columns: repeat(2, 1fr);
		}

		.pinglun_qu_gridW4gK8 {
			grid-template-columns: repeat(2, 1fr);
		}

		.yemei_qu_gridB8nR1 {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 767px) {

		/* 手机:全部单列,顶导航只留 logo + 中间按钮 */
		.daohang_barQ3kR2 {
			padding: 17rpx 19rpx;
		}

		.daohang_zhongJ5tL9 {
			display: none;
		}

		.searchBarN6pT1 {
			display: none;
		}

		.daohang_yuyanT6wM2 {
			display: none;
		}

		.daohang_dengluR9qN4 {
			font-size: 15rpx;
			padding: 7rpx 17rpx;
		}

		.shouye_heroA8cF6 {
			padding: 19rpx;
		}

		.shouye_hero_kuangF6rK1 {
			min-height: 547rpx;
		}

		.shouye_hero_zuoG8sH9 {
			width: auto;
			right: 23rpx;
		}

		.shouye_hero_xieyiL7mW4 {
			/* font-size: 53rpx; */
		}

		.shouye_kaB7mQ5 {
			width: auto;
			right: 19rpx;
			left: 19rpx;
			bottom: 19rpx;
		}

		.bendi_qu_gridB8nR1 {
			grid-template-columns: repeat(2, 1fr);
			gap: 13rpx;
		}

		.xinxi_qu_gridP7xK3 {
			grid-template-columns: 1fr;
		}

		.xinxi_qu_kuanR9qN4 {
			min-height: 247rpx;
		}

		.xinxi_qu_zhongE2nL9 {
			min-height: 167rpx;
		}

		.jutuan_qu_gridG8sH9 {
			grid-template-columns: repeat(2, 1fr);
			gap: 13rpx;
		}

		.xunyan_quS3tL6 {
			padding: 47rpx 19rpx;
		}

		.tourRowH3nT7 {
			flex-wrap: wrap;
		}

		.xunyan_hang_rqJ9kL1 {
			width: 100%;
			margin-bottom: 7rpx;
		}

		.xunyan_hang_csP8mB2,
		.xunyan_hang_ccS1tK8 {
			display: none;
		}

		.xunyan_th_csB7mQ5,
		.xunyan_th_ccC8tD4 {
			display: none;
		}

		.xunyan_hang_btnV5zN6 {
			width: auto;
			flex: 1;
			text-align: right;
		}

		.ctaCardL8tN4 {
			grid-template-columns: 1fr;
		}

		.dahu_qu_renxiangX7dQ4 {
			min-height: 247rpx;
		}

		.dongtai_qu_gridF6rK1 {
			grid-template-columns: 1fr;
		}

		.pinglun_qu_gridW4gK8 {
			grid-template-columns: 1fr;
		}

		.yemei_qu_gridB8nR1 {
			grid-template-columns: 1fr 1fr;
		}

		.hongdi_qu_kuangN4rX9 {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	/* ====== 宽屏(桌面)把内容收进常规宽度并居中,比例更接近普通网页 ====== */
	@media (min-width: 1024px) {
		.shouye_wrapM7nR3 {
			max-width: 1240px;
			margin: 0 auto;
			box-sizing: border-box;
		}
	}
</style>

<style lang="scss">
	/* 桌面端页面底色与居中黑块两侧保持一致,避免露出亮色空白 */
	@media (min-width: 1024px) {
		page {
			background: #000;
		}
	}
</style>
