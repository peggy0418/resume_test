const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = 10000; // 选择适合您的端口
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

// 模拟存储留言的数组
const messages = [];

app.post('/api/messages', (req, res) => {
  const { sender, message } = req.body;
  if (!sender || !message) {
    return res.status(400).json({ error: '請提供發送者和消息' });
  }

  const newMessage = { id: messages.length + 1, sender, message };
  messages.push(newMessage);

  // 这里应该将消息存储到数据库或其他持久性存储中

  res.json(newMessage);
});

app.get('/api/messages', (req, res) => {
  // 返回已存储的留言
  res.json(messages);
});

app.listen(PORT, () => {
  console.log(`服务器正在监听端口 ${PORT}`);
});
