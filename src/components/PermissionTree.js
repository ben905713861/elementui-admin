export default {
	arrange(treeRows) {
		let permissionId2entity = {};
		//记录permissionId顺序
		let permissionIds = [];
		treeRows.forEach((row) => {
			permissionId2entity[row.permissionId] = row;
			permissionIds.push(row.permissionId);
			if(row.isHidden) {
				return;
			}
			if(row.parentId != 0) {
				if(permissionId2entity[row.parentId].children == undefined) {
					permissionId2entity[row.parentId].children = [];
				}
				permissionId2entity[row.parentId].children.push(row);
			}
		});
		let newList = [];
		permissionIds.forEach(permissionId => {
			if(permissionId2entity[permissionId].parentId == 0) {
				newList.push(permissionId2entity[permissionId]);
			}
		});
		return newList;
	},
	
}
