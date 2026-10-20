const API_URL = 'http://localhost:3000/api';

// 1. Kiểm tra phân quyền Admin khi tải trang
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser || currentUser.role !== 'admin') {
    alert("Bạn không có quyền truy cập trang quản trị!");
    window.location.href = "../TiemSach-DangnhapDangky/TiemSachDangnhapDangky.html";
    return;
  }
  
  // Hiển thị tên tài khoản Admin lên Header
  const adminWelcomeName = document.getElementById('adminWelcomeName');
  if (adminWelcomeName) {
    adminWelcomeName.textContent = `Quản trị viên: ${currentUser.username}`;
  }

  loadAdminBooks();
  loadAdminOrders();
  loadAdminUsers();
});

function handleLogout() {
  localStorage.removeItem('currentUser');
  window.location.href = "../TiemSach-DangnhapDangky/TiemSachDangnhapDangky.html";
}

function switchTab(tabId, btnElement) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  btnElement.classList.add('active');
}

// ---------------- QUẢN LÝ SÁCH ----------------
function loadAdminBooks() {
  fetch(`${API_URL}/books`)
    .then(res => res.json())
    .then(books => {
      renderBookTable(books);
    })
    .catch(err => console.error("Lỗi kết nối Server lấy danh sách sách:", err));
}

function renderBookTable(books) {
  const tbody = document.getElementById('adminBookList');
  if (!tbody) return;
  tbody.innerHTML = '';

  books.forEach(book => {
    const stock = book.stock !== undefined ? Number(book.stock) : 0;
    const isAvailable = stock > 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${book.image_url}" class="book-thumb" alt="Cover"></td>
      <td><strong>${book.title}</strong></td>
      <td>${book.author}</td>
      <td>${book.category_id}</td>
      <td>${Number(book.price).toLocaleString('vi-VN')} đ</td>
      <td><strong>${stock}</strong></td>
      <td>${isAvailable ? '<span style="color: green; font-weight:600;">Còn hàng</span>' : '<span style="color: red; font-weight:600;">Hết hàng</span>'}</td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" onclick="openEditModal('${book.id}')">Sửa</button>
          <button class="btn-delete" onclick="deleteBook('${book.id}')">Xóa</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById('addBookForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const newBook = {
    title: document.getElementById('bookTitle').value.trim(),
    author: document.getElementById('bookAuthor').value.trim(),
    category_id: document.getElementById('bookCategory').value.trim(),
    price: Number(document.getElementById('bookPrice').value),
    stock: Number(document.getElementById('bookStock').value),
    image_url: document.getElementById('bookImage').value.trim(),
    description: document.getElementById('bookDescription').value.trim(),
    detail_page: "bookdetail.html"
  };

  fetch(`${API_URL}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newBook)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    this.reset();
    loadAdminBooks();
  })
  .catch(err => console.error("Lỗi khi thêm sách:", err));
});

function deleteBook(id) {
  if (confirm("Bạn có chắc chắn muốn xóa đầu sách này không?")) {
    fetch(`${API_URL}/books/${id}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadAdminBooks();
    })
    .catch(err => console.error("Lỗi khi xóa sách:", err));
  }
}

function openEditModal(id) {
  fetch(`${API_URL}/books`)
    .then(res => res.json())
    .then(books => {
      const bookToEdit = books.find(b => b.id === id);
      if (!bookToEdit) return;

      document.getElementById('editBookId').value = bookToEdit.id;
      document.getElementById('editBookTitle').value = bookToEdit.title;
      document.getElementById('editBookAuthor').value = bookToEdit.author;
      document.getElementById('editBookCategory').value = bookToEdit.category_id;
      document.getElementById('editBookPrice').value = bookToEdit.price;
      document.getElementById('editBookStock').value = bookToEdit.stock !== undefined ? bookToEdit.stock : 0;
      document.getElementById('editBookImage').value = bookToEdit.image_url;
      document.getElementById('editBookDescription').value = bookToEdit.description || '';

      document.getElementById('editModal').classList.add('active');
    });
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

document.getElementById('editBookForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const bookId = document.getElementById('editBookId').value;
  const updatedData = {
    title: document.getElementById('editBookTitle').value.trim(),
    author: document.getElementById('editBookAuthor').value.trim(),
    category_id: document.getElementById('editBookCategory').value.trim(),
    price: Number(document.getElementById('editBookPrice').value),
    stock: Number(document.getElementById('editBookStock').value),
    image_url: document.getElementById('editBookImage').value.trim(),
    description: document.getElementById('editBookDescription').value.trim()
  };

  fetch(`${API_URL}/books/${bookId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    closeEditModal();
    loadAdminBooks();
  })
  .catch(err => console.error("Lỗi khi cập nhật sách:", err));
});


// ---------------- QUẢN LÝ ĐƠN HÀNG ----------------
function loadAdminOrders() {
  fetch(`${API_URL}/orders`)
    .then(res => res.json())
    .then(orders => {
      renderOrderTable(orders);
    })
    .catch(err => console.error("Lỗi khi tải danh sách đơn hàng:", err));
}

function renderOrderTable(orders) {
  const tbody = document.getElementById('adminOrderList');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888;">Chưa có đơn hàng nào.</td></tr>`;
    return;
  }

  // Đảo ngược để đơn mới nhất hiển thị lên đầu
  [...orders].reverse().forEach(order => {
    const tr = document.createElement('tr');
    
    const itemsDetail = order.items.map(item => `• ${item.title} (x${item.quantity})`).join('<br>');
    
    let statusBadge = `<span style="color: #f59e0b; font-weight: 600;">${order.status}</span>`;
    if (order.status === 'Đã duyệt') statusBadge = `<span style="color: green; font-weight: 600;">Đã duyệt</span>`;
    if (order.status === 'Đã hủy') statusBadge = `<span style="color: red; font-weight: 600;">Đã hủy</span>`;

    let actionBtns = '';
    if (order.status === 'Chờ duyệt') {
      actionBtns = `
        <button class="btn-edit" onclick="updateOrderStatus('${order.id}', 'Đã duyệt')">Duyệt</button>
        <button class="btn-delete" onclick="updateOrderStatus('${order.id}', 'Đã hủy')">Hủy</button>
      `;
    } else {
      actionBtns = `<span style="color: #888; font-size: 13px;">Hoàn tất</span>`;
    }

    tr.innerHTML = `
      <td><strong>${order.id}</strong></td>
      <td>${order.username}</td>
      <td style="font-size: 13px;">${itemsDetail}</td>
      <td><strong style="color: #ef4444;">${Number(order.totalAmount).toLocaleString('vi-VN')} đ</strong></td>
      <td style="font-size: 12px; color: #666;">${order.createdAt}</td>
      <td>${statusBadge}</td>
      <td><div class="action-btns">${actionBtns}</div></td>
    `;
    tbody.appendChild(tr);
  });
}

function updateOrderStatus(orderId, newStatus) {
  if (confirm(`Bạn có chắc chắn muốn chuyển đơn hàng này sang trạng thái "${newStatus}" không?`)) {
    fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadAdminOrders();
      loadAdminBooks(); // Tải lại bảng sách để cập nhật tồn kho đã trừ
      loadAdminUsers(); // Tải lại bảng người dùng để cập nhật thống kê tiền/sách đã mua
    })
    .catch(err => console.error("Lỗi khi cập nhật trạng thái đơn:", err));
  }
}


// ---------------- QUẢN LÝ TÀI KHOẢN (KÈM THỐNG KÊ SÁCH VÀ TIỀN ĐÃ MUA) ----------------
function loadAdminUsers() {
  Promise.all([
    fetch(`${API_URL}/users`).then(res => res.json()),
    fetch(`${API_URL}/orders`).then(res => res.json())
  ])
  .then(([users, orders]) => {
    const tbody = document.getElementById('adminUserList');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #888;">Chưa có tài khoản nào.</td></tr>`;
      return;
    }

    users.forEach(user => {
      // Lọc các đơn hàng đã được duyệt của user này
      const userApprovedOrders = orders.filter(o => o.username === user.username && o.status === 'Đã duyệt');

      // Tổng số sách đã mua
      const totalBooksBought = userApprovedOrders.reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0);

      // Tổng số tiền đã chi
      const totalMoneySpent = userApprovedOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

      const tr = document.createElement('tr');
      const roleClass = user.role === 'admin' ? 'role-admin' : 'role-customer';
      const roleLabel = user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng';

      tr.innerHTML = `
        <td><strong>${user.username}</strong></td>
        <td>${user.email || 'Chưa cập nhật'}</td>
        <td>${user.number || 'Chưa cập nhật'}</td>
        <td><strong style="color: #2563eb;">${totalBooksBought}</strong> cuốn</td>
        <td><strong style="color: #ef4444;">${totalMoneySpent.toLocaleString('vi-VN')} đ</strong></td>
        <td><span class="role-badge ${roleClass}">${roleLabel}</span></td>
        <td>${user.createdAt || 'N/A'}</td>
        <td>
          <div class="action-btns">
            <button class="btn-edit" onclick="openAdminEditUserModal('${user.id}')">Sửa</button>
            <button class="btn-delete" onclick="deleteUser('${user.id}', '${user.username}')">Xóa</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  })
  .catch(err => console.error("Lỗi khi tải dữ liệu tài khoản:", err));
}

function openAdminEditUserModal(userId) {
  fetch(`${API_URL}/users`)
    .then(res => res.json())
    .then(users => {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      document.getElementById('editOriginalUsername').value = user.id;
      document.getElementById('adminEditUsername').value = user.username;
      document.getElementById('adminEditEmail').value = user.email || '';
      document.getElementById('adminEditNumber').value = user.number || '';
      document.getElementById('adminEditRole').value = user.role || 'customer';
      document.getElementById('adminEditPassword').value = '';

      document.getElementById('adminEditUserModal').classList.add('active');
    });
}

function closeAdminEditUserModal() {
  document.getElementById('adminEditUserModal').classList.remove('active');
}

document.getElementById('adminEditUserForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const userId = document.getElementById('editOriginalUsername').value;

  const updatedUserData = {
    username: document.getElementById('adminEditUsername').value.trim(),
    email: document.getElementById('adminEditEmail').value.trim(),
    number: document.getElementById('adminEditNumber').value.trim(),
    role: document.getElementById('adminEditRole').value,
    password: document.getElementById('adminEditPassword').value.trim()
  };

  fetch(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedUserData)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    closeAdminEditUserModal();
    loadAdminUsers();
  })
  .catch(err => console.error("Lỗi khi cập nhật tài khoản:", err));
});

function deleteUser(userId, username) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (username === currentUser.username) {
    alert("Bạn không thể xóa tài khoản Admin đang đăng nhập!");
    return;
  }

  if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}" không?`)) {
    fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadAdminUsers();
    })
    .catch(err => console.error("Lỗi khi xóa tài khoản:", err));
  }
}


// Kiểm tra phiên đăng nhập liên tục (Chống đăng nhập song song)
function watchSession() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const currentToken = localStorage.getItem('sessionToken');

  if (!currentUser || !currentUser.id) return;

  fetch(`${API_URL}/check-session/${currentUser.id}?token=${currentToken}`)
    .then(res => res.json())
    .then(data => {
      if (!data.valid) {
        alert("Tài khoản của bạn đã được đăng nhập ở một thiết bị khác. Phiên làm việc này sẽ kết thúc!");
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('userCart');
        window.location.href = "../TiemSach-DangnhapDangky/TiemSach-DangnhapDangky.html";
      }
    })
    .catch(err => console.error("Lỗi kiểm tra phiên:", err));
}

// Gọi kiểm tra ngay khi tải trang và lặp lại mỗi 10 giây
document.addEventListener("DOMContentLoaded", () => {
  watchSession();
  setInterval(watchSession, 10000); // 10 giây kiểm tra 1 lần với server
});