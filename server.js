const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(cors());

const messages = [];

app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.post('/api/messages', (req, res) => {
  const newMessage = req.body;
  messages.push(newMessage);
  res.json(newMessage);
});

app.get('/api/data', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:10000/api/messages');
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({ error: '请求失败' });
    } else if (error.request) {
      res.status(500).json({ error: '没有收到响应' });
    } else {
      res.status(500).json({ error: '请求错误' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
