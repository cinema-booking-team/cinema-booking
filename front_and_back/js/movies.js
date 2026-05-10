// ===== КОНФИГ =====
const API_URL = 'http://127.0.0.1:8000/api';
let currentUser = JSON.parse(localStorage.getItem('user'));

// ===== КАРУСЕЛЬ ФОНОВ =====
(function() {
    const backgrounds = [
        '../images/1st.jpg', '../images/2nd.jpg', '../images/3nd.jpg',
        '../images/4nd.jpg', '../images/5nd.jpg', '../images/6nd.jpg',
    ];
    if (backgrounds.length === 0) return;
    let currentIndex = 0;
    const heroSection = document.getElementById('heroSection');
    if (!heroSection) return;
    heroSection.style.backgroundImage = `url('${backgrounds[0]}')`;
    heroSection.style.backgroundSize = 'cover';
    heroSection.style.backgroundPosition = 'center';
    heroSection.style.transition = `background-image 1s ease-in-out`;
    setInterval(() => {
        currentIndex = (currentIndex + 1) % backgrounds.length;
        heroSection.style.backgroundImage = `url('${backgrounds[currentIndex]}')`;
    }, 4000);
})();

// ===== ЗАГРУЗКА ФИЛЬМОВ ИЗ API =====
async function loadMovies() {
    try {
        const res = await fetch(`${API_URL}/movies/`);
        const movies = await res.json();
        const container = document.getElementById('movies-list');
        if (!container) return;
        container.innerHTML = '';
        movies.forEach(movie => {
            container.innerHTML += `
                <div class="col-lg-3 col-md-4 col-sm-6">
                    <div class="movie-card">
                        <div class="movie-poster">
                            <img src="${movie.poster_url}" alt="${movie.title}"
                                 onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/bc13fe?text=${encodeURIComponent(movie.title.substring(0,10))}'">
                            <div class="movie-rating">★ ${movie.rating}</div>
                            <div class="movie-overlay">
                                <button class="btn-book" onclick="buyTicket(${movie.id})">Купить билет</button>
                            </div>
                        </div>
                        <div class="movie-info">
                            <h3>${movie.title}</h3>
                            <p class="movie-genre">${movie.genre}</p>
                            <p class="movie-duration">${movie.duration} мин | ${movie.age_limit}</p>
                            <div class="movie-price">${parseFloat(movie.price).toLocaleString()} ₽</div>
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) {
        console.log('Фильмы загружены из статики (API не доступен)');
    }
}

// ===== ПОКУПКА БИЛЕТА =====
function buyTicket(movieId) {
    if (!currentUser) {
        alert('Сначала войдите в аккаунт!');
        window.location.href = 'login.html';
        return;
    }
    const show_date = prompt('Дата сеанса (ГГГГ-ММ-ДД):', '2025-05-20');
    const show_time = prompt('Время сеанса (ЧЧ:ММ):', '19:00');
    const row_num = prompt('Ряд:', '5');
    const seat_num = prompt('Место:', '12');

    fetch(`${API_URL}/buy/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: currentUser.id,
            movie_id: movieId,
            show_date, show_time,
            row_num: parseInt(row_num),
            seat_num: parseInt(seat_num)
        })
    })
    .then(r => r.json())
    .then(data => {
        alert(`Билет куплен! Штрихкод: ${data.barcode}`);
    });
}

// ===== РЕГИСТРАЦИЯ =====
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const inputs = this.querySelectorAll('input');
        const password = inputs[2].value;
        const password2 = inputs[3].value;
        if (password !== password2) { alert('Пароли не совпадают'); return; }

        const res = await fetch(`${API_URL}/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullname: inputs[0].value,
                email: inputs[1].value,
                password: password
            })
        });
        const data = await res.json();
        if (res.ok) {
            alert('Регистрация успешна!');
            window.location.href = 'login.html';
        } else {
            alert(data.error);
        }
    });
}

// ===== ВХОД =====
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const inputs = this.querySelectorAll('input');
        const res = await fetch(`${API_URL}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: inputs[0].value,
                password: inputs[1].value
            })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('user', JSON.stringify(data));
            alert(`Добро пожаловать, ${data.fullname}!`);
            window.location.href = 'movies.html';
        } else {
            alert(data.error);
        }
    });
}

// ===== МОИ БИЛЕТЫ =====
async function loadTickets() {
    if (!currentUser) return;
    const container = document.querySelector('.tickets-list');
    if (!container) return;
    try {
        const res = await fetch(`${API_URL}/tickets/${currentUser.id}/`);
        const tickets = await res.json();
        container.innerHTML = '';
        tickets.forEach(t => {
            container.innerHTML += `
                <div class="ticket-card">
                    <div class="ticket-poster">
                        <img src="${t.poster_url}" alt="${t.movie_title}"
                             onerror="this.src='https://via.placeholder.com/80x120/1a1a1a/bc13fe?text=Фильм'">
                    </div>
                    <div class="ticket-info">
                        <div class="ticket-movie-title"><h3>${t.movie_title}</h3></div>
                        <div class="ticket-details">
                            <div class="detail-item"><i class="fas fa-calendar-alt"></i><span>${t.show_date}</span></div>
                            <div class="detail-item"><i class="fas fa-clock"></i><span>${t.show_time}</span></div>
                            <div class="detail-item"><i class="fas fa-chair"></i><span>Ряд ${t.row_num}, Место ${t.seat_num}</span></div>
                        </div>
                        <div class="ticket-footer">
                            <div class="ticket-price"><span class="price-value">${parseFloat(t.price).toLocaleString()} ₽</span></div>
                            <button class="btn-cancel" onclick="cancelTicket(${t.id})"><i class="fas fa-times"></i> Отменить</button>
                        </div>
                    </div>
                    <div class="ticket-barcode"><i class="fas fa-qrcode"></i><span>№ ${t.barcode}</span></div>
                </div>`;
        });
    } catch (e) {
        console.log('Билеты не загружены');
    }
}

async function cancelTicket(ticketId) {
    if (!confirm('Отменить билет?')) return;
    await fetch(`${API_URL}/cancel/${ticketId}/`, { method: 'DELETE' });
    alert('Билет отменён');
    loadTickets();
}

// ===== АДМИНКА =====
async function loadAdmin() {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
        const stats = await fetch(`${API_URL}/admin/stats/`).then(r => r.json());
        document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = stats.total_tickets;
        document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = stats.total_users;
        document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = stats.total_revenue.toLocaleString();

        const tickets = await fetch(`${API_URL}/admin/tickets/`).then(r => r.json());
        const tbody = document.querySelector('.admin-table tbody');
        tbody.innerHTML = '';
        tickets.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td>${t.barcode}</td>
                    <td>${t.user_name}</td>
                    <td>${t.movie_title}</td>
                    <td>${t.show_date}</td>
                    <td>${t.show_time}</td>
                    <td>${t.row_num}-${t.seat_num}</td>
                    <td>${parseFloat(t.price).toLocaleString()} ₽</td>
                    <td><button class="btn-delete" onclick="deleteTicket(${t.id})"><i class="fas fa-trash"></i></button></td>
                </tr>`;
        });
    } catch (e) {
        console.log('Админка работает в демо-режиме');
    }
}

async function deleteTicket(ticketId) {
    if (!confirm('Удалить билет?')) return;
    await fetch(`${API_URL}/admin/tickets/${ticketId}/`, { method: 'DELETE' });
    loadAdmin();
}

// ===== ОБНОВЛЕНИЕ МЕНЮ =====
function updateNav() {
    if (!currentUser) return;
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');
    const nav = document.querySelector('.navbar-nav');

    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';

    // Кнопка Админ-панель (вставляем перед Выходом)
    if (currentUser.role === 'admin') {
        const hasAdmin = document.querySelector('a[href="admin.html"]');
        const logoutLink = document.querySelector('a[href="#"][onclick="logout()"]');
        if (!hasAdmin && nav) {
            const adminLi = document.createElement('li');
            adminLi.className = 'nav-item';
            adminLi.innerHTML = `<a class="nav-link" href="admin.html"><i class="fas fa-chart-line"></i> Админ-панель</a>`;
            if (logoutLink) {
                logoutLink.parentElement.before(adminLi);
            } else {
                nav.appendChild(adminLi);
            }
        }
    }

    // Кнопка Выход
    const hasLogout = document.querySelector('a[href="#"][onclick="logout()"]');
    if (!hasLogout && nav) {
        nav.insertAdjacentHTML('beforeend', `<li class="nav-item"><a class="nav-link" href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Выход</a></li>`);
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'movies.html';
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    loadMovies();
    loadTickets();
    loadAdmin();
    updateNav();
});