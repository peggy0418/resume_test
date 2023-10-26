import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import axios from 'axios';

// 设置后端 API 地址
axios.defaults.baseURL = 'http://localhost:10000'; // 修改为您的后端地址



createApp(App).use(store).use(router).mount('#app')
