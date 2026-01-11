// 1. Инициализация и отправка формы (EmailJS)
(function () {
    emailjs.init("QTfMoRQNuslYMT_AZ"); // ЗАМЕНИТЕ НА ВАШ КЛЮЧ
})();

const contactForm = document.getElementById('email-form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const btn = document.getElementById('submit-btn');
        const success = document.getElementById('success-screen');

        btn.disabled = true;
        btn.innerText = "Отправка...";

        emailjs.sendForm('service_f38c7mr', 'template_i7r0e5h', this) // ЗАМЕНИТЕ НА ВАШИ ID
            .then(() => {
                // Показываем экран успеха
                if (success) {
                    success.classList.remove('hidden');
                    success.classList.add('flex');
                }
                contactForm.classList.add('invisible');

                // Авто-возврат через 5 секунд
                setTimeout(() => {
                    if (success) {
                        success.classList.add('hidden');
                        success.classList.remove('flex');
                    }
                    contactForm.classList.remove('invisible');
                    contactForm.reset();
                    btn.disabled = false;
                    btn.innerText = "Отправить запрос";
                }, 5000);
            })
            .catch((error) => {
                alert("Ошибка при отправке.");
                btn.disabled = false;
                btn.innerText = "Отправить запрос";
            });
    });
}

// 2. Бургер-меню
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const closeBtn = document.getElementById('close-btn');

if (menuBtn && mobileMenu) {
    menuBtn.onclick = () => mobileMenu.classList.add('active');
    closeBtn.onclick = () => mobileMenu.classList.remove('active');
    document.querySelectorAll('.mobile-link').forEach(l => l.onclick = () => mobileMenu.classList.remove('active'));
}

// 3. Карусель отзывов
const track = document.getElementById('carouselTrack');
const container = document.getElementById('carouselContainer');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

if (track && container) {
    const cards = Array.from(track.children);
    cards.forEach(card => track.appendChild(card.cloneNode(true)));

    let index = 0;
    let isMoving = false;
    let autoScrollInterval = null;
    let isMouseOver = false;

    const getVisibleCards = () => {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    };

    const updatePosition = (smooth = true) => {
        track.style.transition = smooth ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
        track.style.transform = `translateX(-${index * (100 / getVisibleCards())}%)`;
    };

    const handleNext = () => {
        if (isMoving) return;
        isMoving = true;
        index++;
        updatePosition();
        if (index >= cards.length) {
            setTimeout(() => {
                index = 0;
                updatePosition(false);
                isMoving = false;
            }, 600);
        } else {
            setTimeout(() => { isMoving = false; }, 600);
        }
    };

    if (nextBtn) nextBtn.onclick = handleNext;
    if (prevBtn) {
        prevBtn.onclick = () => {
            if (isMoving) return;
            isMoving = true;
            if (index <= 0) {
                index = cards.length;
                updatePosition(false);
                setTimeout(() => {
                    index--;
                    updatePosition(true);
                    setTimeout(() => { isMoving = false; }, 600);
                }, 10);
            } else {
                index--;
                updatePosition();
                setTimeout(() => { isMoving = false; }, 600);
            }
        };
    }

    const startAutoScroll = (delay) => {
        stopAutoScroll();
        autoScrollInterval = setTimeout(function scroll() {
            if (!isMouseOver) handleNext();
            autoScrollInterval = setTimeout(scroll, 4000);
        }, delay);
    };

    const stopAutoScroll = () => {
        clearTimeout(autoScrollInterval);
        autoScrollInterval = null;
    };

    container.onmouseenter = () => { isMouseOver = true; };
    container.onmouseleave = () => { isMouseOver = false; };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) startAutoScroll(7000);
            else stopAutoScroll();
        });
    }, { threshold: 0.5 });

    observer.observe(container);
    window.addEventListener('resize', () => { index = 0; updatePosition(false); });
}

// 4. Модальные окна (Статьи)
function openModal(id) {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        document.querySelectorAll('.modal-content').forEach(m => m.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }
}

// Тапаут для статей
const modalOverlay = document.getElementById('modal-overlay');
if (modalOverlay) {
    modalOverlay.onclick = function (e) {
        if (e.target === this) closeModal();
    };
}

// 5. Сертификаты (Бесконечная лента и Модалка)
const certsData = [
    { src: 'img/cert0.webp' },
    { src: 'img/cert1.webp' },
    { src: 'img/cert2.webp' },
    { src: 'img/cert3.webp' },
    { src: 'img/cert4.webp' },
    { src: 'img/cert5.webp' },
    { src: 'img/cert6.webp' },
    { src: 'img/cert7.webp' },
    { src: 'img/cert8.webp' },
    { src: 'img/cert9.webp' },
    { src: 'img/cert10.webp' },
    { src: 'img/cert11.webp' },
    { src: 'img/cert12.webp' },
    { src: 'img/cert13.webp' },
    { src: 'img/cert14.webp' },
    { src: 'img/cert15.webp' },
    { src: 'img/cert16.webp' },
    { src: 'img/cert17.webp' },
    { src: 'img/cert18.webp' },
    { src: 'img/cert19.webp' },
    { src: 'img/cert20.webp' },
    { src: 'img/cert21.webp' },
    { src: 'img/cert22.webp' },
    { src: 'img/cert23.webp' },
    { src: 'img/cert24.webp' },
    { src: 'img/cert25.webp' },
    { src: 'img/cert26.webp' },
    { src: 'img/cert27.webp' }
];

let currentModalIndex = 0;

// 5.1 Инициализация ленты
function initCertsMarquee() {
    const track = document.getElementById('certs-track');
    if (!track) return;

    const doubleCerts = [...certsData, ...certsData];

    track.innerHTML = doubleCerts.map((cert, index) => `
        <div class="marquee-item cursor-pointer px-3" onclick="openCertByIndex(${index % certsData.length})">
            <div style="width: 220px; height: 160px; overflow: hidden; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; position: relative;">
                <img src="${cert.src}" 
                     alt="Сертификат" 
                     style="width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important;">
            </div>
        </div>
    `).join('');
}

// 5.2 Модальное окно (без изменений)
function openCertByIndex(index) {
    currentModalIndex = index;
    const modal = document.getElementById('cert-modal');
    const img = document.getElementById('cert-img');
    const track = document.getElementById('certs-track');

    if (modal && img) {
        img.src = certsData[currentModalIndex].src;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
        // Останавливаем ленту
        if (track) track.style.animationPlayState = 'paused';
    }
}

function closeCert() {
    const modal = document.getElementById('cert-modal');
    const track = document.getElementById('certs-track');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
        // Запускаем ленту
        if (track) track.style.animationPlayState = 'running';
    }
}

function changeModalImg(step, event) {
    if (event) event.stopPropagation();
    const img = document.getElementById('cert-img');
    img.style.opacity = '0';

    setTimeout(() => {
        currentModalIndex = (currentModalIndex + step + certsData.length) % certsData.length;
        img.src = certsData[currentModalIndex].src;
        img.style.opacity = '1';
    }, 200);
}

// Переменные для отслеживания свайпа
let touchStartX = 0;
let touchEndX = 0;

// Функция для обработки жеста
function handleSwipe() {
    const swipeThreshold = 50; // Минимальное расстояние для свайпа в пикселях
    if (touchEndX < touchStartX - swipeThreshold) {
        // Свайп влево — следующий сертификат
        changeModalImg(1);
    }
    if (touchEndX > touchStartX + swipeThreshold) {
        // Свайп вправо — предыдущий сертификат
        changeModalImg(-1);
    }
}

// 6. Единая инициализация (Android & iOS)
document.addEventListener('DOMContentLoaded', () => {
    // 6.1 Запуск ленты сертификатов
    initCertsMarquee();

    // 6.2 Настройка свайпа и защиты картинки
    const modalImg = document.getElementById('cert-img');
    if (modalImg) {
        modalImg.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        // Блокируем скролл страницы только при горизонтальном свайпе (для Android)
        modalImg.addEventListener('touchmove', e => {
            let moveX = e.changedTouches[0].screenX;
            if (Math.abs(touchStartX - moveX) > 10) {
                if (e.cancelable) e.preventDefault();
            }
        }, { passive: false });

        modalImg.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        // Запрещаем системное перетаскивание картинки
        modalImg.ondragstart = () => false;
    }

    // 6.3 Логика баннера Cookies
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    if (banner && acceptBtn) {
        if (!localStorage.getItem('cookiesAccepted')) {
            setTimeout(() => {
                banner.classList.remove('translate-y-full');
            }, 1000);
        }
        acceptBtn.onclick = function () {
            localStorage.setItem('cookiesAccepted', 'true');
            banner.classList.add('translate-y-full');
        };
    }

    // 8. Автоматический расчет опыта (мгновенное отображение)
    const experienceElement = document.getElementById('experience-years');
    if (experienceElement) {
        const startYear = parseInt(experienceElement.getAttribute('data-target'));
        const currentYear = new Date().getFullYear();
        // Просто подставляем результат вычитания сразу
        experienceElement.textContent = currentYear - startYear;
    }
});