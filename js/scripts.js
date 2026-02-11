// 0. Глобальные флаги
let isManualScrolling = false; // Тот самый флаг для исправления бага подсветки

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
                // --- ДОБАВЛЯЕМ ДЛЯ АНАЛИТИКИ ---
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'form_lead_sent',
                    'form_name': 'contact_form'
                });
                
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

function openMobileMenu() {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.add('active');
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 0);
}

function closeMobileMenu() {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuBtn.focus();
}

if (menuBtn && mobileMenu) {
    menuBtn.onclick = openMobileMenu;
    if (closeBtn) closeBtn.onclick = closeMobileMenu;
    document.querySelectorAll('.mobile-link').forEach(l => {
        l.onclick = closeMobileMenu;
    });
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
let modalOpener = null;

function openModal(id) {
    const overlay = document.getElementById('modal-overlay');
    const targetArticle = document.getElementById(id);

    if (overlay && targetArticle) {
        modalOpener = document.activeElement;

        // 1. Сначала прячем все статьи (на случай, если какая-то осталась открытой)
        document.querySelectorAll('.modal-content').forEach(m => m.classList.add('hidden'));

        // 2. Показываем оверлей и конкретную статью
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        targetArticle.classList.remove('hidden');

        // 3. Блокируем скролл на двух уровнях (для надежности на iOS)
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        // 4. Фокус на кнопку «Закрыть» для клавиатуры и скринридеров
        const closeBtn = targetArticle.querySelector('.modal-close');
        if (closeBtn) setTimeout(() => closeBtn.focus(), 0);
    }
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');

        // Прячем контент, чтобы при следующем открытии не было багов
        document.querySelectorAll('.modal-content').forEach(m => m.classList.add('hidden'));

        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';

        // Возврат фокуса элементу, открывшему модалку
        if (modalOpener && typeof modalOpener.focus === 'function') modalOpener.focus();
        modalOpener = null;
    }
}

// Клик по фону и закрытие по Escape (статьи)
const modalOverlay = document.getElementById('modal-overlay');
if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });
}
document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
        return;
    }
    if (modalOverlay && !modalOverlay.classList.contains('hidden')) closeModal();
    const certModal = document.getElementById('cert-modal');
    if (certModal && !certModal.classList.contains('hidden')) closeCert();
});

// 5. Сертификаты (Бесконечная лента и Модалка)
const certsData = [
    { src: 'img/certs/cert0.webp' },
    { src: 'img/certs/cert1.webp' },
    { src: 'img/certs/cert2.webp' },
    { src: 'img/certs/cert3.webp' },
    { src: 'img/certs/cert4.webp' },
    { src: 'img/certs/cert5.webp' },
    { src: 'img/certs/cert6.webp' },
    { src: 'img/certs/cert7.webp' },
    { src: 'img/certs/cert8.webp' },
    { src: 'img/certs/cert9.webp' },
    { src: 'img/certs/cert10.webp' },
    { src: 'img/certs/cert11.webp' },
    { src: 'img/certs/cert12.webp' },
    { src: 'img/certs/cert13.webp' },
    { src: 'img/certs/cert14.webp' },
    { src: 'img/certs/cert15.webp' },
    { src: 'img/certs/cert16.webp' },
    { src: 'img/certs/cert17.webp' },
    { src: 'img/certs/cert18.webp' },
    { src: 'img/certs/cert19.webp' },
    { src: 'img/certs/cert20.webp' },
    { src: 'img/certs/cert21.webp' },
    { src: 'img/certs/cert22.webp' },
    { src: 'img/certs/cert23.webp' },
    { src: 'img/certs/cert24.webp' },
    { src: 'img/certs/cert25.webp' },
    { src: 'img/certs/cert26.webp' },
    { src: 'img/certs/cert27.webp' }
];

let currentModalIndex = 0;

// 5.1 Инициализация ленты
function initCertsMarquee() {
    const track = document.getElementById('certs-track');
    if (!track) return;

    const doubleCerts = [...certsData, ...certsData];

    track.innerHTML = doubleCerts.map((cert, index) => `
        <div class="marquee-item cursor-pointer px-3" onclick="openCertByIndex(${index % certsData.length})">
            <div style="width: 220px; height: 110px; overflow: hidden; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; position: relative;">
                <img src="${cert.src}" 
                     alt="Сертификат"
                     loading="lazy" 
                     style="width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important;">
            </div>
        </div>
    `).join('');
}

// 5.2 Модальное окно сертификатов
let certOpener = null;

function openCertByIndex(index) {
    currentModalIndex = index;
    certOpener = document.activeElement;
    const modal = document.getElementById('cert-modal');
    const img = document.getElementById('cert-img');
    const track = document.getElementById('certs-track');

    if (modal && img) {
        img.src = certsData[currentModalIndex].src;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
        if (track) track.style.animationPlayState = 'paused';
        const closeBtn = document.getElementById('cert-modal-close');
        if (closeBtn) setTimeout(() => closeBtn.focus(), 0);
    }
}

function closeCert() {
    const modal = document.getElementById('cert-modal');
    const track = document.getElementById('certs-track');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
        if (track) track.style.animationPlayState = 'running';
        if (certOpener && typeof certOpener.focus === 'function') certOpener.focus();
        certOpener = null;
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

function goToContacts() {
    // 1. Сначала закрываем модалку (вызываем твою готовую функцию)
    closeModal();

    // 2. Небольшая задержка, чтобы браузер успел вернуть скролл (overflow: auto)
    setTimeout(() => {
        const contactSection = document.getElementById('contacts'); // Убедись, что у блока контактов есть id="contacts"
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100); // 100 миллисекунд хватит
}

// Автоматическая подсветка активной ссылки меню при скролле и клике
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, #btn-nav-book, #btn-hero-book, #btn-hero-services');
    let isManualScrolling = false; // Флаг, чтобы не сбивать подсветку при ручном переходе

    // Настройки для IntersectionObserver
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
    };

    // Observer следит за секциями и подсвечивает соответствующую nav-link
    const observer = new IntersectionObserver((entries) => {
        if (isManualScrolling) return;
    
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    // ПРОВЕРКА: Если у ссылки НЕТ id кнопки записи, только тогда вешаем активный класс
                    if (link.id !== 'btn-nav-book') {
                        const isTarget = link.getAttribute('href') === `#${id}`;
                        link.classList.toggle('nav-link-active', isTarget);
                    }
                });
            }
        });
    }, observerOptions);

    // Навешиваем observer на каждую секцию
    sections.forEach(section => observer.observe(section));

    // Обработчик клика по ссылке меню — вручную подсвечиваем
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            isManualScrolling = true;

            // Снимаем выделение у всех, выделяем кликнутую
            navLinks.forEach(l => l.classList.remove('nav-link-active'));
            link.classList.add('nav-link-active');

            // Через 1 сек разблокируем автоматическую подсветку (scrollIntoView и скролл успеют пройти)
            setTimeout(() => {
                isManualScrolling = false;
            }, 1000);
        });
    });

    // Если прокручено вверх совсем, убираем подсветку
    window.addEventListener('scroll', () => {
        if (window.scrollY < 100 && !isManualScrolling) {
            navLinks.forEach(link => link.classList.remove('nav-link-active'));
        }
    });
});