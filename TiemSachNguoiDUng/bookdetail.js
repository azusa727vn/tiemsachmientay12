const API_URL = 'http://localhost:3000/api';
let currentBookData = null;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Lấy ID sách từ URL (?id=...)
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');

  if (!bookId) {
    alert("Không tìm thấy mã sản phẩm!");
    window.location.href = "homepage.html";
    return;
  }

  loadBookDetail(bookId);
});

// 2. Gọi API lấy danh sách sách và lọc theo ID
function loadBookDetail(id) {
  fetch(`${API_URL}/books`)
    .then(res => res.json())
    .then(books => {
      const book = books.find(b => b.id === id);
      if (!book) {
        alert("Tựa sách này không tồn tại hoặc đã bị xóa!");
        window.location.href = "homepage.html";
        return;
      }

      currentBookData = book;
      renderBookToUI(book);
    })
    .catch(err => {
      console.error("Lỗi khi tải chi tiết sách:", err);
      alert("Không thể kết nối đến máy chủ backend!");
    });
}

// 3. Render dữ liệu cuốn sách lên giao diện HTML
function renderBookToUI(book) {
  const stock = book.stock !== undefined ? Number(book.stock) : 0;
  const isAvailable = stock > 0;

  // Cập nhật tiêu đề trang
  document.getElementById('pageTitle').textContent = `${book.title} - Tiệm Sách Miền Tây`;
  document.getElementById('breadcrumbTitle').textContent = book.title;
  document.getElementById('breadcrumbCategory').textContent = book.category_id || 'Tủ Sách';

  // Cập nhật nội dung thông tin
  document.getElementById('bookTitle').textContent = book.title;
  document.getElementById('bookAuthor').textContent = book.author || 'Đang cập nhật';
  document.getElementById('bookCategory').textContent = book.category_id || 'Sách Hay';
  document.getElementById('bookPrice').textContent = `${Number(book.price).toLocaleString('vi-VN')} đ`;
  document.getElementById('bookStock').textContent = stock;
  document.getElementById('bookStatus').textContent = isAvailable ? 'Còn hàng' : 'Hết hàng';
  document.getElementById('bookStatus').style.color = isAvailable ? 'green' : 'red';
  document.getElementById('bookImage').src = book.image_url;

  // Cập nhật mô tả (nếu có trong dữ liệu)
  const descriptionContent = document.getElementById('bookDescription');
  if (book.description) {
    descriptionContent.innerHTML = `<p>${book.description}</p>`;
  } else {
    descriptionContent.innerHTML = `<p>Cuốn sách <strong>${book.title}</strong> của tác giả <strong>${book.author}</strong> là một trong những tựa sách nổi bật thuộc thể loại ${book.category_id}.</p>`;
  }
}

// Tăng/giảm số lượng mua
function updateQty(change) {
  const input = document.getElementById('quantityInput');
  let currentVal = parseInt(input.value) || 1;
  currentVal += change;
  if (currentVal < 1) currentVal = 1;
  
  if (currentBookData && currentVal > currentBookData.stock) {
    alert(`Số lượng tồn kho chỉ còn ${currentBookData.stock} cuốn!`);
    currentVal = currentBookData.stock;
  }
  input.value = currentVal;
}

// 4. Hàm hỗ trợ đồng bộ giỏ hàng lên Server Backend
function saveAndSyncCart(cartData) {
  localStorage.setItem('userCart', JSON.stringify(cartData));

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser && currentUser.id) {
    fetch(`${API_URL}/users/${currentUser.id}/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: cartData })
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

// 5. Xử lý sự kiện thêm vào giỏ hàng kết hợp đồng bộ
function handleAddToCart() {
  if (!currentBookData || currentBookData.stock <= 0) {
    alert("Sản phẩm hiện đã hết hàng!");
    return;
  }

  const qty = parseInt(document.getElementById('quantityInput').value) || 1;

  // Lấy giỏ hàng hiện tại từ localStorage
  let userCart = JSON.parse(localStorage.getItem('userCart')) || [];

  // Kiểm tra xem sản phẩm đã có trong giỏ chưa
  const existingIndex = userCart.findIndex(item => item.id === currentBookData.id);

  if (existingIndex > -1) {
    const totalNewQty = userCart[existingIndex].quantity + qty;
    if (totalNewQty > currentBookData.stock) {
      alert(`Số lượng trong giỏ hàng đã đạt giới hạn tồn kho (${currentBookData.stock} cuốn)!`);
      userCart[existingIndex].quantity = currentBookData.stock;
    } else {
      userCart[existingIndex].quantity = totalNewQty;
    }
  } else {
    userCart.push({
      id: currentBookData.id,
      title: currentBookData.title,
      price: currentBookData.price,
      image_url: currentBookData.image_url,
      quantity: qty
    });
  }

  // Lưu và đồng bộ lên server ngay lập tức
  saveAndSyncCart(userCart);
  alert(`Đã thêm ${qty} cuốn "${currentBookData.title}" vào giỏ hàng thành công!`);
}