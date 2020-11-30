import Vue from 'vue'
import Router from 'vue-router'
import Index from "@/views/layout/Index"
import Login from "@/views/Login"

Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '/',
			name: 'Index',
			component: Index
		},
		{
			path: '/login',
			name: 'Login',
			component: Login
		},
	]
})