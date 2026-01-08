// 1. Инициализация и отправка формы (EmailJS)
(function() { 
    emailjs.init("QTfMoRQNuslYMT_AZ"); // ЗАМЕНИТЕ НА ВАШ КЛЮЧ
})();

const contactForm = document.getElementById('email-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
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
    modalOverlay.onclick = function(e) {
        if (e.target === this) closeModal();
    };
}

// 5. Модальные окна (Сертификаты)
// Данные сертификатов
const certsData = [
    { src: 'img/cert1.jpg' },
    { src: 'img/cert2.jpg' },
    { src: 'img/cert3.jpg' } 
];

let currentModalIndex = 0;

// Открытие модалки (теперь по индексу)
function openCertByIndex(index) {
    currentModalIndex = index;
    const modal = document.getElementById('cert-modal');
    const img = document.getElementById('cert-img');
    
    if (modal && img) {
        img.src = certsData[currentModalIndex].src;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
}

// Закрытие
function closeCert() {
    const modal = document.getElementById('cert-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }
}

// Листание (новая логика)
function changeModalImg(step, event) {
    if (event) event.stopPropagation(); // Чтобы модалка не закрылась при клике на стрелку
    
    const img = document.getElementById('cert-img');
    img.style.opacity = '0'; // Плавное затухание
    
    setTimeout(() => {
        // Вычисляем новый индекс (зациклено)
        currentModalIndex = (currentModalIndex + step + certsData.length) % certsData.length;
        img.src = certsData[currentModalIndex].src;
        img.style.opacity = '1'; // Плавное появление
    }, 200);
}

// 6. Логика баннера Cookies
document.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');

    if (banner && acceptBtn) {
        // Проверяем, принимал ли уже пользователь куки
        if (!localStorage.getItem('cookiesAccepted')) {
            setTimeout(() => {
                banner.classList.remove('translate-y-full');
            }, 1000);
        }

        acceptBtn.addEventListener('click', function() {
            localStorage.setItem('cookiesAccepted', 'true');
            banner.classList.add('translate-y-full');
        });
    }
});