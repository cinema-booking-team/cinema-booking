// ===== ПРОСТАЯ КАРУСЕЛЬ ФОНОВ (сдвиг влево) =====
(function() {
    // Список фоновых картинок (ПРОВЕРЬ ИМЕНА ФАЙЛОВ!)
    const backgrounds = [
        '../images/1st.jpg',
        '../images/2nd.jpg',
        '../images/3nd.jpg',
        '../images/4nd.jpg',
        '../images/5nd.jpg',
        '../images/6nd.jpg',
    ];
    
    if (backgrounds.length === 0) return;
    
    let currentIndex = 0;
    const heroSection = document.getElementById('heroSection');
    
    // Устанавливаем первый фон
    heroSection.style.backgroundImage = `url('${backgrounds[0]}')`;
    heroSection.style.backgroundSize = 'cover';
    heroSection.style.backgroundPosition = 'center';
    heroSection.style.transition = `background-image var(--transition-speed) ease-in-out`;
    
    // Меняем фон каждые 4 секунды
    setInterval(() => {
        currentIndex = (currentIndex + 1) % backgrounds.length;
        heroSection.style.backgroundImage = `url('${backgrounds[currentIndex]}')`;
    }, 4000);
    
})();

// Функция покупки билета
function buyTicket(movieId) {
    alert(`🎬 Вы выбрали фильм ID: ${movieId}`);
}

// Плавный скролл
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

console.log('✅ Карусель фонов: смена каждые 4 секунды');