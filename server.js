const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

// 在這裡配置路由和數據存儲
// 例如，處理留言的GET和POST請求
const messages = [];

app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.post('/api/messages', (req, res) => {
  const newMessage = req.body;
  messages.push(newMessage);
  res.json(newMessage);
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
