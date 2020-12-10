const state = {
	questionModuleId: 0,
	activityId: 0,
	headerTitle: '',
}

const mutations = {
	setQuestionModuleId(state, questionModuleId) {
		state.questionModuleId = questionModuleId;
	},
	setActivityId(state, activityId) {
		state.activityId = activityId;
	},
	setHeaderTitle(state, headerTitle) {
		state.headerTitle = headerTitle;
	},
}

export default {
	namespaced: true,
	state,
	mutations,
}