<template>
  <div id="app">
    <h1>留言板</h1>
    <input v-model="newMessage" @keyup.enter="addMessage" placeholder="輸入留言">
    <ul>
      <li v-for="message in messages" :key="message.id">{{ message.text }}</li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios'; // 导入 Axios 库

export default {
  data() {
    return {
      newMessage: '',
      messages: [],
    };
  },
  created() {
    this.loadMessages();
  },
  methods: {
    addMessage() {
      axios.post('http://localhost:10000/api/messages', { text: this.newMessage })
        .then(response => {
          this.newMessage = '';
          this.loadMessages();
        })
        .catch(error => {
          console.error('发生错误：', error);
        });
    },
    loadMessages() {
      axios.get('http://localhost:10000/api/messages')
        .then(response => {
          this.messages = response.data;
        })
        .catch(error => {
          console.error('发生错误：', error);
        });
    },
  },
};
</script>
