const state = {
	activeTabName: 'Home',
	permissionMap: {},
	path2permissionId: {},
	tabMap: {},
}

const mutations = {
	initPermissionMap(state, map) {
		state.permissionMap = map;
		for(let permissionId in map) {
			let path = map[permissionId].path;
			if(path == '') {
				continue;
			}
			state.path2permissionId[path] = permissionId;
		}
	},
	switchTab(state, index) {
		state.activeTabName = index;
	},
	addTab(state, index) {
		index = index.toString();
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
	closeTab(state, index, lastTabPermissionId) {
		delete state.tabMap[index];
		//删除选项卡后，归位
		let keys = Object.keys(state.tabMap);
		if(keys.length == 0) {
			state.activeTabName = 'Home';
		} else {
			//有指定上一个页面的，删除选项卡后跳回
			if(lastTabPermissionId != null) {
				state.activeTabName = lastTabPermissionId.toString();
			} else {
				//待关闭的选项卡是当前显示的选项卡，寻找上一个
				if(index == state.activeTabName) {
					state.activeTabName = keys[keys.length - 1];
				} else {
					//刷新一下，不然顶tab不会变化
					let temp = state.activeTabName;
					state.activeTabName = 'Home';
					state.activeTabName = temp;
				}
			}
		}
	},
}

export default {
	namespaced: true,
	state,
	mutations,
}