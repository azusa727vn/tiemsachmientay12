const API_URL = 'http://localhost:3000/api';

function flipCard() {
    const TrucXoay = document.getElementById('TrucXoay');
    TrucXoay.classList.toggle('is-flipped');
}

// 1. Đăng ký tài khoản mới qua API POST
document.getElementById('formRegister').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('reg-fullname').value.trim();
    const email = document.getElementById('reg-username').value.trim();
    const number = document.getElementById('reg-number').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    const newUser = {
        username: username,
        email: email,
        number: number,
        password: password
    };

    fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            document.getElementById('formRegister').reset();
            flipCard(); // Xoay về trang đăng nhập
        } else {
            alert(data.message);
        }
    })
    .catch(err => {
        console.error("Lỗi đăng ký:", err);
        alert("Không thể kết nối đến máy chủ backend!");
    });
});

// 2. Đăng nhập hệ thống qua API POST & Xử lý Nhớ Mật Khẩu
document.getElementById('formLogin').addEventListener('submit', function(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('login-username').value.trim();
    const passwordInput = document.getElementById('login-password').value.trim();
    const rememberMeCheckbox = document.getElementById('rememberMe');

    fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameInput, passwordInput })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Đăng nhập thành công!");
    
            // Lưu thông tin user và sessionToken nhận từ server vào localStorage
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('sessionToken', data.user.sessionToken);

            if (data.user.role === 'admin') {
                window.location.href = "../TiemSachAdmin.Re0/admin.html";
            } else {
                window.location.href = "../TiemSachNguoiDUng/homepage.html";
            }
        } else {
            alert(data.message);
        }
    })
    .catch(err => {
        console.error("Lỗi đăng nhập:", err);
        alert("Sai tên đăng nhập hoặc mật khẩu, hoặc máy chủ chưa chạy!");
    });
});

// 3. Khởi tạo các sự kiện và tự động điền mật khẩu đã lưu
document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.getElementById('login-password');
    const togglePassword = document.getElementById('togglePassword');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const usernameInput = document.getElementById('login-username');

    // CHỨC NĂNG HIỂN THỊ / ẨN MẬT KHẨU
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? '👁️' : '🔒';
        });
    }

    // CHỨC NĂNG TỰ ĐỘNG ĐIỀN NẾU ĐÃ NHỚ MẬT KHẨU
    const savedAccount = JSON.parse(localStorage.getItem('savedAccount'));
    if (savedAccount && usernameInput && passwordInput) {
        usernameInput.value = savedAccount.username || '';
        passwordInput.value = savedAccount.password || '';
        if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
    }
});


// Trong hàm xử lý đăng nhập thành công:
if (data.success) {
    alert("Đăng nhập thành công!");
    
    // Lưu thông tin user (bao gồm sessionToken) vào localStorage
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    // Lưu riêng token để tiện kiểm tra nhanh
    localStorage.setItem('sessionToken', data.user.sessionToken);

    if (data.user.role === 'admin') {
        window.location.href = "../TiemSachAdmin.Re0/admin.html";
    } else {
        window.location.href = "../TiemSachNguoiDUng/homepage.html";
    }
}