<template>
  <div id="app">
    <h1>留言板</h1>
    姓名: <input v-model="newSender" placeholder="輸入姓名"><br/>
    內容: <input v-model="newMessage" placeholder="輸入留言"><br/>
    <button @click="addSenderAndMessage">送出</button>
    <ul>
      <h1>留言列表</h1>
      <li v-for="message in messages" :key="message.id">
        <p>編號: {{ message.id }}</p>
        <p>姓名: {{ message.sender }}</p>
        <p>內容: {{ message.message }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      newSender: '',
      newMessage: '',
      senders: [],
      messages: [],
    };
  },
  created() {
    this.loadMessages();
  },
  methods: {
    addSenderAndMessage() {
      // 发送发送者和消息到后端
      axios.post('/api/messages', { sender: this.newSender, message: this.newMessage })
        .then(response => {
          this.newSender = '';
          this.newMessage = '';
          this.loadMessages();
        })
        .catch(error => {
          console.error('發生錯誤：', error);
        });
    },

    loadMessages() {
      // 获取留言消息列表，包括发送者信息
      axios.get('/api/messages')
        .then(response => {
          this.messages = response.data;
        })
        .catch(error => {
          console.error('發生錯誤：', error);
        });
    },
  },
};
</script>
