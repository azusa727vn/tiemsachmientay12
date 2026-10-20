const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(process.cwd()));

// Đường dẫn file database trên server
const dbFilePath = path.join(process.cwd(), 'data.json');

// Hàm đọc database
const readDB = () => {
  const data = fs.readFileSync(dbFilePath, 'utf-8');
  return JSON.parse(data);
};

// Hàm ghi database
const writeDB = (data) => {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

// --- API SÁCH (BOOKS) ---
// Lấy danh sách sách
app.get('/api/books', (req, res) => {
  const db = readDB();
  res.json(db.books);
});

// Thêm sách mới
app.post('/api/books', (req, res) => {
  const db = readDB();
  const newBook = { 
    id: "book-" + Date.now(), 
    ...req.body,
    description: req.body.description || "Chưa có mô tả cho cuốn sách này."
  };
  db.books.push(newBook);
  writeDB(db);
  res.json({ success: true, message: "Thêm sách thành công!", book: newBook });
});

// Sửa sách
app.put('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.books = db.books.map(book => book.id === id ? { ...book, ...req.body } : book);
  writeDB(db);
  res.json({ success: true, message: "Cập nhật sách thành công!" });
});

// Xóa sách
app.delete('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.books = db.books.filter(book => book.id !== id);
  writeDB(db);
  res.json({ success: true, message: "Xóa sách thành công!" });
});


// --- API TÀI KHOẢN (USERS) ---
// Lấy danh sách user
app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});

// Đăng ký tài khoản
app.post('/api/register', (req, res) => {
  const db = readDB();
  const { username, email } = req.body;
  
  const existing = db.users.find(u => u.username === username || u.email === email);
  if (existing) {
    return res.status(400).json({ success: false, message: "Tên tài khoản hoặc Email đã tồn tại!" });
  }

  const newUser = { id: "user-" + Date.now(), ...req.body, role: "customer", createdAt: new Date().toLocaleDateString('vi-VN') };
  db.users.push(newUser);
  writeDB(db);
  res.json({ success: true, message: "Đăng ký thành công!" });
});

// Đăng nhập (Đã tích hợp sinh sessionToken chống đăng nhập song song)
app.post('/api/login', (req, res) => {
  const db = readDB();
  const { usernameInput, passwordInput } = req.body;

  const foundUser = db.users.find(u => (u.username === usernameInput || u.email === usernameInput) && u.password === passwordInput);
  if (foundUser) {
    // Tạo mã token phiên làm việc duy nhất
    const newSessionToken = "TOKEN-" + Date.now() + "-" + Math.random().toString(36).substring(2);
    foundUser.sessionToken = newSessionToken;
    writeDB(db);

    res.json({ success: true, user: foundUser });
  } else {
    res.status(401).json({ success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" });
  }
});

// API Kiểm tra token phiên làm việc hiện tại
app.get('/api/check-session/:id', (req, res) => {
  const { id } = req.params;
  const clientToken = req.query.token;
  const db = readDB();
  const user = db.users.find(u => u.id === id || u.username === id);
  if (!user) {
    return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản!" });
  }
  // Chỉ kích hoạt đá thiết bị khi client có gửi token lên và token đó khác với server
  if (clientToken && clientToken !== "undefined" && user.sessionToken && user.sessionToken !== clientToken) {
    return res.json({ valid: false, message: "Tài khoản đã được đăng nhập ở thiết bị khác!" });
  }
  res.json({ valid: true });
});

// Cập nhật thông tin User (bao gồm cả thăng chức/hạ cấp role)
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  
  const userIndex = db.users.findIndex(u => u.id === id || u.username === id);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản!" });
  }

  db.users[userIndex] = {
    ...db.users[userIndex],
    username: req.body.username !== undefined ? req.body.username : db.users[userIndex].username,
    email: req.body.email !== undefined ? req.body.email : db.users[userIndex].email,
    number: req.body.number !== undefined ? req.body.number : db.users[userIndex].number,
    role: req.body.role !== undefined ? req.body.role : db.users[userIndex].role,
    password: req.body.password ? req.body.password : db.users[userIndex].password
  };

  writeDB(db);
  res.json({ success: true, message: "Cập nhật tài khoản thành công!", user: db.users[userIndex] });
});

// Xóa User
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  
  db.users = db.users.filter(user => user.id !== id);
  writeDB(db);
  res.json({ success: true, message: "Xóa tài khoản thành công!" });
});


// --- API ĐƠN HÀNG (ORDERS) ---
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json(db.orders || []);
});

app.post('/api/orders', (req, res) => {
  const db = readDB();
  if (!db.orders) db.orders = [];

  const newOrder = {
    id: "ORD-" + Date.now(),
    username: req.body.username,
    items: req.body.items,
    totalAmount: req.body.totalAmount,
    status: "Chờ duyệt",
    createdAt: new Date().toLocaleString('vi-VN')
  };

  db.orders.push(newOrder);
  writeDB(db);
  res.json({ success: true, message: "Đặt hàng thành công!", order: newOrder });
});

app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDB();

  const order = db.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
  }

  if (order.status === "Chờ duyệt" && status === "Đã duyệt") {
    order.items.forEach(item => {
      const book = db.books.find(b => b.id === item.id);
      if (book) {
        book.stock = Math.max(0, (Number(book.stock) || 0) - item.quantity);
      }
    });
  }

  order.status = status;
  writeDB(db);
  res.json({ success: true, message: `Đã cập nhật trạng thái đơn hàng thành "${status}"!` });
});


// --- API GIỎ HÀNG (CART) ---
app.get('/api/users/:id/cart', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const user = db.users.find(u => u.id === id || u.username === id);
  
  if (!user) {
    return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản!" });
  }

  res.json({ success: true, cart: user.cart || [] });
});

app.put('/api/users/:id/cart', (req, res) => {
  const { id } = req.params;
  const { cart } = req.body;
  const db = readDB();
  
  const userIndex = db.users.findIndex(u => u.id === id || u.username === id);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản!" });
  }

  db.users[userIndex].cart = cart || [];
  writeDB(db);

  res.json({ success: true, message: "Đã đồng bộ giỏ hàng lên server!", cart: db.users[userIndex].cart });
});


// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});