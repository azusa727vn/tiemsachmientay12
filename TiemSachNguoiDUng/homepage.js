const API_URL = 'http://localhost:3000/api'; // Nếu bạn dùng API từ Backend Node.js
let allBooks = []; // Biến lưu toàn bộ danh sách sách gốc để phục vụ tìm kiếm

document.addEventListener("DOMContentLoaded", () => {
  loadBooksFromBackend();
  setupUserAccountUI();
  setupSearchListener();
});

// Tải danh sách sách từ Server/Backend
function loadBooksFromBackend() {
  fetch(`${API_URL}/books`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Không thể kết nối tới server sách');
      }
      return response.json();
    })
    .then(books => {
      allBooks = books; // Lưu trữ danh sách gốc
      displayBooksGrid(allBooks);
    })
    .catch(error => {
      console.error('Lỗi khi tải dữ liệu sách từ server:', error);
    });
}

// Hiển thị danh sách sách ra màn hình
function displayBooksGrid(books) {
  const booksGrid = document.getElementById('books-grid');
  if (!booksGrid) return;
  booksGrid.innerHTML = '';

  if (books.length === 0) {
    booksGrid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">Không tìm thấy tựa sách phù hợp với từ khóa của bạn.</p>`;
    return;
  }

  books.forEach(book => {
    const stock = book.stock !== undefined ? Number(book.stock) : 0;
    const statusText = stock > 0 ? 'Còn hàng' : 'Hết hàng';
    const statusClass = stock > 0 ? 'in-stock' : 'out-of-stock';

    const bookItem = document.createElement('div');
    bookItem.classList.add('book-item');
    bookItem.style.cursor = 'pointer';
    
    // Khi click vào sách sẽ chuyển đến trang giới thiệu chi tiết riêng
    bookItem.onclick = () => {
      window.location.href = `bookdetail.html?id=${book.id}`;
    };

    bookItem.innerHTML = `
      <div class="book-image" style="background-image: url('${book.image_url}');">
        <span class="book-status ${statusClass}">${statusText}</span>
      </div>
      <div class="book-info">
        <span class="book-category">Loại: ${book.category_id}</span>
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">Tác giả: ${book.author}</p>
        <p class="book-price">${Number(book.price).toLocaleString('vi-VN')} đ</p>
      </div>
    `;
    booksGrid.appendChild(bookItem);
  });
}

// Xử lý chức năng tìm kiếm thời gian thực (Real-time search)
function setupSearchListener() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase().trim();

    // Lọc sách theo tiêu đề, tác giả hoặc thể loại
    const filteredBooks = allBooks.filter(book => {
      const title = book.title ? book.title.toLowerCase() : '';
      const author = book.author ? book.author.toLowerCase() : '';
      const category = book.category_id ? book.category_id.toLowerCase() : '';

      return title.includes(keyword) || author.includes(keyword) || category.includes(keyword);
    });

    displayBooksGrid(filteredBooks);
  });
}

function setupUserAccountUI() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const navActionArea = document.getElementById('navActionArea');

  if (!navActionArea) return;

  // Xóa sạch nội dung cũ trong navActionArea (nếu có) trước khi render lại
  // Lưu ý: Giữ lại nút Giỏ hàng và Ô tìm kiếm nếu chúng nằm trong khối này
  const cartBtn = navActionArea.querySelector('button[onclick*="openCartModal"]');
  const searchInput = document.getElementById('searchInput');

  // Đảm bảo xóa các phần tử thông tin user cũ
  const existingUserSection = navActionArea.querySelector('.user-account-section');
  if (existingUserSection) {
    existingUserSection.remove();
  }

  // Tạo container chứa cụm thông tin user / nút đăng nhập
  const userSection = document.createElement('div');
  userSection.className = 'user-account-section';
  userSection.style.cssText = "display: flex; align-items: center; gap: 6px; margin-left: 8px;";

  if (currentUser) {
    // --- TRƯỜNG HỢP: ĐÃ ĐĂNG NHẬP ---
    
    // Rút gọn tên nếu dài hơn 8 ký tự
    let displayName = currentUser.username || "";
    if (displayName.length > 8) {
      displayName = displayName.substring(0, 8) + "...";
    }

    // Khối hiển thị "Xin chào" thành 2 dòng
    const userContainer = document.createElement('div');
    userContainer.style.cssText = "display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2; margin-right: 4px;";

    const helloSpan = document.createElement('span');
    helloSpan.style.cssText = "font-size: 11px; color: var(--text-muted); font-weight: 500;";
    helloSpan.textContent = "Xin chào,";

    const nameSpan = document.createElement('span');
    nameSpan.style.cssText = "font-size: 13px; font-weight: 700; color: var(--primary); white-space: nowrap;";
    nameSpan.textContent = displayName;

    userContainer.appendChild(helloSpan);
    userContainer.appendChild(nameSpan);

    // Nút Sửa tài khoản
    const editProfileBtn = document.createElement('button');
    editProfileBtn.className = 'btn btn-secondary';
    editProfileBtn.style.cssText = "padding: 6px 8px; font-size: 12px; cursor: pointer;";
    editProfileBtn.textContent = 'Sửa';
    editProfileBtn.onclick = () => openProfileModal(currentUser);

    // Nút Đăng xuất
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn btn-secondary';
    logoutBtn.style.cssText = "padding: 6px 10px; font-size: 12px; background-color: #dc3545; color: white; border: none; cursor: pointer;";
    logoutBtn.textContent = 'Đăng xuất';
    logoutBtn.onclick = () => {
      localStorage.removeItem('currentUser');
      alert("Đã đăng xuất thành công!");
      location.reload(); // Tải lại trang để đổi thành nút Đăng nhập
    };

    userSection.appendChild(userContainer);
    userSection.appendChild(editProfileBtn);
    userSection.appendChild(logoutBtn);

  } else {
    
    //trong trường hợp chưa đăng nhập
    const loginBtn = document.createElement('button');
    loginBtn.className = 'btn btn-primary';
    loginBtn.style.cssText = "padding: 6px 14px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;";
    loginBtn.textContent = '🔑 Đăng nhập';
    loginBtn.onclick = () => {
      window.location.href = "../TiemSach-DangnhapDangky/TiemSachDangnhapDangky.html";
    };

    userSection.appendChild(loginBtn);
  }

  navActionArea.appendChild(userSection);
}

function openProfileModal(user) {
  document.getElementById('profileUsername').value = user.username;
  document.getElementById('profileEmail').value = user.email || '';
  document.getElementById('profileNumber').value = user.number || '';
  document.getElementById('profilePassword').value = '';
  document.getElementById('userProfileModal').style.display = 'flex';
}

function closeProfileModal() {
  document.getElementById('userProfileModal').style.display = 'none';
}


// Xử lý cập nhật thông tin cá nhân duy nhất
document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.getElementById('userProfileForm');
  if (profileForm) {
    // Xóa bỏ tất cả các listener cũ bằng cách gán onsubmit trực tiếp
    profileForm.onsubmit = function(e) {
      e.preventDefault();
      
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        window.location.href = "../TiemSach-DangnhapDangky/TiemSachDangnhapDangky.html";
        return;
      }

      // Xác định ID định danh của user
      const userId = currentUser.id || currentUser.username;

      const updatedData = {
        username: document.getElementById('profileUsername').value.trim(),
        email: document.getElementById('profileEmail').value.trim(),
        number: document.getElementById('profileNumber').value.trim(),
        password: document.getElementById('profilePassword').value.trim()
      };

      // Gửi Yêu cầu Cập nhật lên Server
      fetch(`${API_URL}/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })
      .then(res => {
        if (!res.ok) {
          throw new Error("Lỗi phản hồi từ server (Status: " + res.status + ")");
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          alert("Cập nhật thông tin tài khoản thành công!");
          
          // Lưu thông tin mới đồng bộ vào localStorage
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          
          // Cập nhật tài khoản nhớ mật khẩu nếu có
          let savedAccount = JSON.parse(localStorage.getItem('savedAccount'));
          if (savedAccount) {
            savedAccount.username = data.user.username;
            if (updatedData.password) savedAccount.password = updatedData.password;
            localStorage.setItem('savedAccount', JSON.stringify(savedAccount));
          }

          closeProfileModal();
          location.reload(); // Tải lại trang để cập nhật tên người dùng mới lên Header
        } else {
          alert(data.message || "Cập nhật thất bại!");
        }
      })
      .catch(err => {
        console.error("Lỗi khi cập nhật tài khoản:", err);
        alert("Không thể kết nối đến máy chủ backend hoặc đường dẫn API chưa đúng!");
      });
    };
  }
});


// Khởi tạo giỏ hàng (ưu tiên lấy từ server nếu đã đăng nhập, nếu chưa lấy tạm localStorage)
let userCart = [];

document.addEventListener("DOMContentLoaded", () => {
  setupUserAccountUI();
  setupSearchListener();
  
  // Đồng bộ giỏ hàng từ Server nếu user đã đăng nhập
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser && currentUser.id) {
    fetch(`${API_URL}/users/${currentUser.id}/cart`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          userCart = data.cart || [];
          localStorage.setItem('userCart', JSON.stringify(userCart)); // Lưu đệm cục bộ
          updateCartBadge();
        }
      })
      .catch(err => console.error("Không thể tải giỏ hàng từ server:", err));
  } else {
    userCart = JSON.parse(localStorage.getItem('userCart')) || [];
    updateCartBadge();
  }
});

// Hàm hỗ trợ lưu giỏ hàng đồng thời vào localStorage và đẩy lên Server Backend
function saveAndSyncCart() {
  localStorage.setItem('userCart', JSON.stringify(userCart));
  updateCartBadge();

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser && currentUser.id) {
    fetch(`${API_URL}/users/${currentUser.id}/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: userCart })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        console.warn("Đồng bộ giỏ hàng thất bại trên server");
      }
    })
    .catch(err => console.error("Lỗi kết nối khi đồng bộ giỏ hàng:", err));
  }
}

// Cập nhật số lượng hiển thị trên nút Giỏ hàng
function updateCartBadge() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const totalQty = userCart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalQty;
  }
}

// Mở Modal Giỏ hàng
function openCartModal() {
  renderCartUI();
  document.getElementById('cartModal').style.display = 'flex';
}

// Đóng Modal Giỏ hàng
function closeCartModal() {
  document.getElementById('cartModal').style.display = 'none';
}

// Hiển thị danh sách sản phẩm trong Giỏ hàng
function renderCartUI() {
  const container = document.getElementById('cartItemsList');
  const totalPriceEl = document.getElementById('cartTotalPrice');
  if (!container) return;
  container.innerHTML = '';

  if (userCart.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">Giỏ hàng của bạn đang trống.</p>`;
    if (totalPriceEl) totalPriceEl.textContent = '0 đ';
    return;
  }

  let totalMoney = 0;

  userCart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    totalMoney += itemTotal;

    const div = document.createElement('div');
    div.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9;";
    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; width: 50%;">
        <img src="${item.image_url}" style="width: 45px; height: 60px; object-fit: cover; border-radius: 4px;">
        <div>
          <strong style="font-size: 14px; display: block;">${item.title}</strong>
          <span style="font-size: 12px; color: var(--text-muted);">${Number(item.price).toLocaleString('vi-VN')} đ</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button onclick="changeCartQty(${index}, -1)" style="padding: 2px 8px; cursor: pointer;">-</button>
        <span style="font-size: 14px; font-weight: 600;">${item.quantity}</span>
        <button onclick="changeCartQty(${index}, 1)" style="padding: 2px 8px; cursor: pointer;">+</button>
      </div>
      <span style="font-size: 14px; font-weight: 700; color: var(--primary); width: 20%; text-align: right;">
        ${itemTotal.toLocaleString('vi-VN')} đ
      </span>
      <button onclick="removeFromCart(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 16px; margin-left: 10px;">🗑️</button>
    `;
    container.appendChild(div);
  });

  if (totalPriceEl) totalPriceEl.textContent = `${totalMoney.toLocaleString('vi-VN')} đ`;
}

// Thay đổi số lượng item trong giỏ (Gọi hàm saveAndSyncCart để đồng bộ)
function changeCartQty(index, change) {
  userCart[index].quantity += change;
  if (userCart[index].quantity <= 0) {
    userCart.splice(index, 1);
  }
  saveAndSyncCart();
  renderCartUI();
}

// Xóa 1 mặt hàng khỏi giỏ (Gọi hàm saveAndSyncCart để đồng bộ)
function removeFromCart(index) {
  userCart.splice(index, 1);
  saveAndSyncCart();
  renderCartUI();
}

// Thanh toán đơn hàng
function checkoutCart() {
  if (userCart.length === 0) {
    alert("Giỏ hàng của bạn đang trống!");
    return;
  }
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    alert("Vui lòng đăng nhập trước khi thanh toán!");
    window.location.href = "../TiemSach-DangnhapDangky/TiemSachDangnhapDangky.html";
    return;
  }

  const totalMoney = userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const orderData = {
    username: currentUser.username,
    items: userCart,
    totalAmount: totalMoney
  };

  fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    
    // Sau khi đặt hàng thành công, làm trống giỏ hàng trên cả Client lẫn Server
    userCart = [];
    saveAndSyncCart();
    
    closeCartModal();
  })
  .catch(err => {
    console.error("Lỗi khi gửi đơn hàng:", err);
    alert("Không thể kết nối đến máy chủ để tạo đơn hàng!");
  });
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
  setInterval(watchSession, 5000); // 10 giây kiểm tra 1 lần với server
});