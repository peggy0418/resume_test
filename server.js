const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(cors());

const messages = [];

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'test_1026',
});

connection.connect(err => {
  if (err) {
    console.error('無法連接到資料庫:', err);
  } else {
    console.log('成功連接資料庫!');
  }
});


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
      res.status(error.response.status).json({ error: '請求失敗' });
    } else if (error.request) {
      res.status(500).json({ error: '沒有收到響應' });
    } else {
      res.status(500).json({ error: '請求錯誤' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
