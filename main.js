import App from './App'
import { getCapsuleSafeStyle } from './utils/mp-capsule'
import { installAuthGuard } from './utils/auth'

// 全局登录守卫：包装 uni 路由 API，未登录访问需登录页面时统一跳未登录页。
// 幂等，重复调用不会重复包装。
installAuthGuard()

// 全局注入胶囊安全区变量：所有页面根节点用 :style="capsuleSafeStyle" 承接
const capsuleMixin = {
	data() {
		return {
			capsuleSafeStyle: getCapsuleSafeStyle()
		}
	}
}

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
Vue.mixin(capsuleMixin)
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	app.mixin(capsuleMixin)
	return {
		app
	}
}
// #endif
