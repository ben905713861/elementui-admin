import Vuex from "vuex"
import Vue from 'vue'
import NavTabs from './navTabs'
import Role from './role'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        navTabs: NavTabs,
        role: Role,
    }
})