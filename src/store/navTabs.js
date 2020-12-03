const state = {
	activeTabName: 'Home',
	permissionMap: {},
	tabMap: {},
}

const mutations = {
	initPermissionMap(state, map) {
		state.permissionMap = map;
	},
	switchTab(state, index) {
		state.activeTabName = index;
	},
	addTab(state, index) {
		//根据权限id拿到path
		let permission = state.permissionMap[index];
		let path = permission.path;
		if(path.substr(0, 1) != '/') {
			path = '/' + path;
		}
		let component = resolve => require(['@/views' + path], resolve);
		state.tabMap[index] = {
			label: permission.name,
			component: component,
		}
		state.activeTabName = index;
	},
	closeTab(state, name) {
		delete state.tabMap[name];
		//删除选项卡后，归位
		let keys = Object.keys(state.tabMap);
		if(keys.length == 0) {
			state.activeTabName = 'Home';
		} else {
			//待关闭的选项卡是当前显示的选项卡，寻找上一个
			if(name == state.activeTabName) {
				state.activeTabName = keys[keys.length - 1];
			} else {
				//刷新一下，不然顶tab不会变化
				let temp = state.activeTabName;
				state.activeTabName = 'Home';
				state.activeTabName = temp;
			}
		}
		
	},
}

export default {
	namespaced: true,
	state,
	mutations,
}