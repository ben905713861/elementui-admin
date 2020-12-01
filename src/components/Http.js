import Axios from 'axios'
import Router from '@/router/index'
import { Message } from 'element-ui'

Axios.defaults.baseURL = 'http://huodong6.dev';

let instance = Axios.create({
	headers: {
		'Content-Type': 'application/json',
	},
})

instance.interceptors.request.use(
	config => {
		let accessToken = window.sessionStorage.getItem('accessToken');
		if(accessToken) {
			config.headers.Authorization = 'Bearer' + accessToken;
		}
		return config;
	},
)

instance.interceptors.response.use(
	response => {
		return Promise.resolve(response.data);
	},
	//接口错误状态处理，也就是说无响应时的处理
	error => {
		switch(error.response.status) {
		case 401:
			Message.error('登录信息失效');
			noLogin();
			break;
		case 403:
			Message.error('没有操作权限');
			break;
		case 404:
			Message.error('资源不存在');
			break;
		case 405:
			Message.error('请求方法不被允许');
			break;
		case 500:
			Message.error('服务器错误');
			break;
		case 502:
		case 504:
			Message.error('请求超时');
			break;
		}
		return Promise.reject(error.response)
	}
)

instance.ajax = (path, option) => {
	if(path == null || path == '') {
		throw new Error('path不得为空');
	}
	var method = option.method == undefined ? 'get' : option.method.toLowerCase();
	var data = option.data == undefined ? null : option.data;
	var truefun = option.truefun == undefined ? null : option.truefun;
	var falsefun = option.falsefun == undefined ? null : option.falsefun;
	var endfun = option.endfun == undefined ? null : option.endfun;
	var errfun = option.errfun == undefined ? null : option.errfun;
	var use_alert = option.use_alert == undefined ? true : option.use_alert;
	var sync = option.sync == undefined ? true : option.sync;
	
	if(method == 'get') {
		data = {
			params: data,
		}
	}
	instance[method](path, data).then(res => {
		if(res.status == 0) {
			truefun && truefun(res.data);
			if(method != 'get' && use_alert) {
				Message.success('操作成功');
			}
		} else {
			Message.error(res.msg);
			falsefun && falsefun(res);
		}
		endfun && endfun();
	}).catch(res => {
		errfun && errfun(res);
	});
}

instance.loginSuccess = accessToken => {
	window.sessionStorage.setItem('accessToken', accessToken);
}

instance.logout = () => {
	window.sessionStorage.removeItem('accessToken');
}

function noLogin() {
	Router.push('/login');
}

export default instance;
	