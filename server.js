const express = require('express');
const app = express();
const port = 10000;
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");

const connection = mysql.createConnection({
  host: '127.0.0.1', // localhost
  user: 'root', //資料庫用戶名
  password: 'root', // 資料庫帳號
  database: 'test_1026', // 資料庫名稱
});
const secretKey = 'Auth'; //JWT TOKEN

// 連接資料庫
connection.connect((err) => {
  if (err) {
    console.error('無法連接到mysql資料庫：', err);
    return;
  }
  console.log('mysql資料庫連接成功');
});

app.use(express.json()); //解決body-parser的舊問題
app.use(cors()); //解決跨域

// 初始留言
const messages = [];

// 建立新留言
app.post('/api/messages', verifyToken,(req, res) => {
  const { sender, message } = req.body;

  if (!sender || !message) {
    return res.status(400).json({ error: '需要提供sender或message' });
  }

  const sql = 'INSERT INTO messages (sender, message) VALUES (?, ?)';
  const values = [sender, message];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('插入資料時發生錯誤：', err);
      return res.status(500).json({ error: '無法插入資料' });
    }
    console.log('資料成功匯入')

    const newMessage = {
      id: result.insertId, // 留言列表ID
      sender,
      message,
    };

    res.status(201).json(newMessage);
  });
});

// JWT驗證
function verifyToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: '未提供Token' });
  }

  jwt.verify(token, jwtSecretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: '無效Token' });
    }

    req.user = decoded;
    next();
  });
}

// 取得留言列表
app.get('/api/messages', verifyToken,(req, res) => {
  const sql = 'SELECT * FROM messages'; // 查詢全部的留言

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('獲取資料失敗：', err);
      return res.status(500).json({ error: '無法取得資料' });
    }

    if (!req.user) {
      return res.status(401).json({ error: '請先進行登入' });
    }

    // 如果有Token，將結果發送到前端
    res.json(results);
  });
});

// 編輯留言
app.put('/api/messages/:id',verifyToken, (req, res) => {
  const msg_id = req.params.id; // 取得要編輯的留言ID
  const { message } = req.body; // 編輯留言內容

  if (!message) {
    return res.status(400).json({ error: '新的留言內容為空' });
  }

  // 更新資料庫的留言內容(編輯的那筆)
  const sql = 'UPDATE messages SET message = ? WHERE msg_id = ?';
  const values = [message, msg_id];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('更新留言發生錯誤：', err);
      return res.status(500).json({ error: '無法更新留言' });
    }

    if (result.affectedRows === 0) {
      // 如果沒有偵測到有異動的行數，代表沒有找到匹配的留言
      return res.status(404).json({ error: '未找到匹配的留言' });
    }

    // 更新成功
    res.status(200).json({ message: '留言成功更新' });
  });
});

// 刪除留言
app.delete('/api/messages/:id',verifyToken, (req, res) => {
  console.log(req.params)
  const msg_id = req.params.id; // 找到要刪除的留言ID

  // 在資料庫DELETE
  const sql = 'DELETE FROM messages WHERE msg_id = ?';
  const values = [msg_id];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('刪除資料時發生錯誤：', err);
      return res.status(500).json({ error: '無法刪除留言' });
    }

    if (result.affectedRows === 0) {
      // 如果沒有偵測到有異動的行數，代表沒有找到匹配的留言
      return res.status(404).json({ error: '未找到匹配的留言' });
    }

    // 刪除成功
    res.status(204).send();
  });
});

//使用者註冊 
app.post('/api/register', (req, res) => {
  const { user_name, user_email, user_password } = req.body;

  // hash psw
  bcrypt.hash(user_password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('密碼雜湊時發生錯誤：', err);
      return res.status(500).json({ error: '無法註冊' });
    }

    // 將資料放進資料庫，密碼使用雜湊過的編碼
    const sql = 'INSERT INTO users (user_name, user_email, user_password) VALUES (?, ?, ?)';
    const values = [user_name, user_email, hashedPassword];

    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('使用者註冊資料錯誤：', err);
        return res.status(500).json({ error: '無法註冊使用者' });
      }

      console.log('使用者註冊成功');

      // 將註冊資料存到payload(不可以有密碼)
      const payload = {
        user_email: user_email, // 使用者email
        user_name: user_name, // 使用者名稱
      };

      // JWT TOKEN (1小時後過期)
      const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

      // 註冊成功
      res.status(201).json({ message: '註冊成功!',token });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { user_email, user_password } = req.body;

  // 登入資料
  if (!user_email || !user_password) {
    return res.status(400).json({ error: '需要提供使用者名稱和密碼' });
  }

  // 查詢資料庫
  const sql = 'SELECT user_password FROM users WHERE user_email = ?';
  const values = [user_email];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('查詢資料發生錯誤：', err);
      return res.status(500).json({ error: '登入驗證錯誤' });
    }

    // 如果使用者資料存在
    if (results.length > 0) {
      const storedHashedPassword = results[0].user_password;

      // 使用bcrypt.compare來驗證密碼
      bcrypt.compare(user_password, storedHashedPassword, (err, passwordMatch) => {
        if (err) {
          console.error('密碼驗證發生錯誤：', err);
          return res.status(500).json({ error: '登入驗證失敗' });
        }

        if (passwordMatch) {
          // 使用者登入成功
          const payload = { user_id: user.user_id, user_name: user.user_name };
          const token = jwt.sign(payload, jwtSecretKey, { expiresIn: '1h' });
          console.log('使用者登入成功');
          res.status(200).json({ message: '登入成功' });
        } else {
          // 使用者登入失敗
          console.log('使用者登入失敗');
          res.status(401).json({ error: '信箱或密碼錯誤' });
        }
      });
    } else {
      // 使用者登入失敗（沒有找到用戶）
      console.log('使用者登入失敗');
      res.status(401).json({ error: '信箱或密碼錯誤' });
    }
  });
});

app.listen(port, () => {
  console.log(`port: ${port}`);
});
