export default {
	arrange(treeRows) {
		let permissionId2entity = {};
		treeRows.forEach((row) => {
			permissionId2entity[row.permissionId] = row;
			if(row.parentId != 0) {
				if(permissionId2entity[row.parentId].children == undefined) {
					permissionId2entity[row.parentId].children = [];
				}
				permissionId2entity[row.parentId].children.push(row);
			}
		});
		let newList = [];
		for(let permissionId in permissionId2entity) {
			if(permissionId2entity[permissionId].parentId == 0) {
				newList.push(permissionId2entity[permissionId]);
			}
		}
		return newList;
	},
	
}
