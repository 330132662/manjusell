import App from './App'
import { getCapsuleSafeStyle } from './utils/mp-capsule'

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
