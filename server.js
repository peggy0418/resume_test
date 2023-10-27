const express = require('express');
const app = express();
const port =10000;
const cors=require('cors');
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1', // 连接到MySQL容器的主机名
  user: 'root', // MySQL用户名
  password: 'root', // 你在容器创建时设置的密码
  database: 'test_1026', // 你在容器创建时设置的数据库名称
});

// 连接到数据库
connection.connect((err) => {
  if (err) {
    console.error('无法连接到MySQL数据库：', err);
    return;
  }
  console.log('已成功连接到MySQL数据库');
});

// 使用中间件来解析JSON请求主体
app.use(express.json());
app.use(cors());

// 在内存中存储留言（你可以根据需求替换为数据库存储）
const messages = [];

// 创建一个新留言的API端点
app.post('/api/messages', (req, res) => {
  const { sender, message } = req.body;

  if (!sender || !message) {
    return res.status(400).json({ error: '需要提供发送者和消息' });
  }

  const sql = 'INSERT INTO test (sender, message) VALUES (?, ?)';
  const values = [sender, message];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('插入数据时发生错误：', err);
      return res.status(500).json({ error: '无法插入数据' });
    }
    console.log('資料成功匯入')

    const newMessage = {
      id: result.insertId, // 使用插入的行ID
      sender,
      message,
    };

    res.status(201).json(newMessage);
  });
});

// 获取所有留言的API端点
app.get('/api/messages', (req, res) => {
  const sql = 'SELECT * FROM test'; // 查询所有留言的SQL语句

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('获取数据时发生错误：', err);
      return res.status(500).json({ error: '无法获取数据' });
    }

    // 将查询结果发送到前端
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
});
