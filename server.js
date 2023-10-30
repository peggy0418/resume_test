const express = require('express');
const app = express();
const port =10000;
const cors=require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

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

  const sql = 'INSERT INTO messages (sender, message) VALUES (?, ?)';
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
  const sql = 'SELECT * FROM messages'; // 查询所有留言的SQL语句

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('获取数据时发生错误：', err);
      return res.status(500).json({ error: '无法获取数据' });
    }

    // 将查询结果发送到前端
    res.json(results);
  });
});
// 编辑留言的API端点
app.put('/api/messages/:id', (req, res) => {
  const msg_id = req.params.id; // 从URL参数中获取要编辑的留言的ID
  const { message } = req.body; // 从请求主体中获取新的留言内容

  if (!message) {
    return res.status(400).json({ error: '需要提供新的留言内容' });
  }

  // 更新数据库中的留言记录
  const sql = 'UPDATE messages SET message = ? WHERE msg_id = ?';
  const values = [message, msg_id];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('更新留言时发生错误：', err);
      return res.status(500).json({ error: '无法更新留言' });
    }

    if (result.affectedRows === 0) {
      // 如果没有受影响的行数，表示未找到匹配的留言
      return res.status(404).json({ error: '未找到匹配的留言' });
    }

    // 更新成功
    res.status(200).json({ message: '留言已成功更新' });
  });
});

// 刪除留言
app.delete('/api/messages/:id', (req, res) => {
  console.log(req.params)
  const msg_id = req.params.id; // 从URL参数中获取要删除的留言的ID

  // 在数据库中执行删除操作
  const sql = 'DELETE FROM messages WHERE msg_id = ?';
  const values = [msg_id];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('删除数据时发生错误：', err);
      return res.status(500).json({ error: '无法删除留言' });
    }

    if (result.affectedRows === 0) {
      // 如果没有受影响的行数，表示未找到匹配的留言
      return res.status(404).json({ error: '未找到匹配的留言' });
    }

    // 删除成功
    res.status(204).send();
  });
});

app.post('/api/register', (req, res) => {
  const { user_name, user_email, user_password } = req.body;

  // 在这里进行验证，确保提供了必要的注册信息

  // 哈希用户密码
  bcrypt.hash(user_password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('密码哈希时发生错误：', err);
      return res.status(500).json({ error: '无法注册用户' });
    }

    // 在数据库中插入用户信息，使用hashedPassword代替原始密码
    const sql = 'INSERT INTO users (user_name, user_email, user_password) VALUES (?, ?, ?)';
    const values = [user_name, user_email, hashedPassword];

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('插入用户数据时发生错误：', err);
        return res.status(500).json({ error: '无法注册用户' });
      }

      console.log('用户注册成功');

      // 返回成功注册的消息或其他需要的信息
      res.status(201).json({ message: '註冊成功!' });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { user_email, user_password } = req.body;

  // 在这里进行验证，确保提供了必要的登录信息
  if (!user_email || !user_password) {
    return res.status(400).json({ error: '需要提供用户名和密码' });
  }

  // 查询数据库以获取存储的哈希密码
  const sql = 'SELECT user_password FROM users WHERE user_email = ?';
  const values = [user_email];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('查询数据库时发生错误：', err);
      return res.status(500).json({ error: '无法验证登录' });
    }

    // 如果查询结果包含匹配的用户记录
    if (results.length > 0) {
      const storedHashedPassword = results[0].user_password;

      // 使用bcrypt.compare()来比较密码
      bcrypt.compare(user_password, storedHashedPassword, (err, passwordMatch) => {
        if (err) {
          console.error('密码比较时发生错误：', err);
          return res.status(500).json({ error: '无法验证登录' });
        }

        if (passwordMatch) {
          // 用户登录成功
          console.log('用户登录成功');
          res.status(200).json({ message: '登录成功' });
        } else {
          // 用户登录失败
          console.log('用户登录失败');
          res.status(401).json({ error: '电子邮件或密码错误' });
        }
      });
    } else {
      // 用户登录失败（未找到匹配的用户记录）
      console.log('用户登录失败');
      res.status(401).json({ error: '电子邮件或密码错误' });
    }
  });
});

app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
});
