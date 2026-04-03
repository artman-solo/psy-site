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

// --- НОВЫЙ БЛОК СТАТЬИ 2.0 ---
// Единый плеер для карточки и модалки

function resolvedAudioUrl(path) {
    try {
        return new URL(path, window.location.href).href;
    } catch {
        return path;
    }
}

function getSharedArticleAudio() {
    return document.getElementById('article-audio-sync');
}

function formatArticleTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function detachArticleAudioToHost() {
    const el = getSharedArticleAudio();
    const host = document.getElementById('article-audio-host');
    if (el) {
        el.removeAttribute('controls');
        el.classList.remove('is-audio-engine-only');
    }
    if (el && host && el.parentElement !== host) host.appendChild(el);
}

/** Кастомный плеер в модалке (два цвета: дорожка + прогресс); нативный timeline не используем — у него третий «буферный» слой. */
function mountModalArticlePlayer(slot, audioEl) {
    if (!slot || !audioEl) return;
    slot.innerHTML = '';
    audioEl.removeAttribute('controls');
    audioEl.classList.add('is-audio-engine-only');

    const wrap = document.createElement('div');
    wrap.className = 'article-modal-player flex flex-col gap-3 relative';

    const row = document.createElement('div');
    row.className = 'flex items-center gap-3 w-full';

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'article-modal-play shrink-0 w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center hover:bg-slate-700 transition-colors';
    playBtn.setAttribute('aria-label', 'Воспроизвести');

    const track = document.createElement('div');
    track.className = 'article-modal-track flex-1 h-2.5 rounded-full bg-slate-200 cursor-pointer relative overflow-hidden';
    const fill = document.createElement('div');
    fill.className = 'article-modal-progress-fill h-full rounded-full bg-slate-600 pointer-events-none';
    fill.style.width = '0%';
    track.appendChild(fill);

    const timeEl = document.createElement('span');
    timeEl.className = 'article-modal-time text-sm text-slate-600 tabular-nums shrink-0 min-w-[5.75rem] text-right';
    timeEl.textContent = '0:00 / 0:00';

    row.appendChild(playBtn);
    row.appendChild(track);
    row.appendChild(timeEl);
    wrap.appendChild(audioEl);
    wrap.appendChild(row);
    slot.appendChild(wrap);

    function updateChrome() {
        const d = audioEl.duration;
        const c = audioEl.currentTime;
        if (isFinite(d) && d > 0) {
            fill.style.width = `${(c / d) * 100}%`;
        } else {
            fill.style.width = '0%';
        }
        timeEl.textContent = `${formatArticleTime(c)} / ${formatArticleTime(isFinite(d) ? d : 0)}`;
        const playing = !audioEl.paused && !audioEl.ended;
        playBtn.innerHTML = playing
            ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>'
            : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>';
        playBtn.setAttribute('aria-label', playing ? 'Пауза' : 'Воспроизвести');
    }

    playBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if (audioEl.paused) {
            audioEl.play().catch(() => {});
        } else {
            audioEl.pause();
        }
    });

    track.addEventListener('click', e => {
        e.stopPropagation();
        const d = audioEl.duration;
        if (!isFinite(d) || d <= 0) return;
        const rect = track.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        audioEl.currentTime = ratio * d;
        updateChrome();
    });

    updateChrome();
    window.__articleModalPlayerUpdate = updateChrome;
}

function updateAudioButtons(id, isPlaying) {
    const btns = document.querySelectorAll(`button[data-article-audio-id="${id}"]`);
    btns.forEach(btn => {
        const icon = isPlaying
            ? '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>'
            : '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>';
        const text = isPlaying ? 'Пауза' : 'Слушать';
        btn.innerHTML = `${icon}<span>${text}</span>`;
        if (isPlaying) {
            btn.classList.add('bg-blue-600', 'text-white');
            btn.classList.remove('bg-blue-50', 'text-blue-600');
        } else {
            btn.classList.remove('bg-blue-600', 'text-white');
            btn.classList.add('bg-blue-50', 'text-blue-600');
        }
    });
}

function syncPlayButtonsFromPlayerState() {
    const el = getSharedArticleAudio();
    if (!el) return;
    const id = window.__articleAudioActiveId;
    const playing = Boolean(id) && !el.paused && !el.ended;
    document.querySelectorAll('button[data-article-audio-id]').forEach(btn => {
        const bid = btn.getAttribute('data-article-audio-id');
        updateAudioButtons(bid, playing && bid === id);
    });
}

async function initArticles() {
    const grid = document.getElementById('articles-grid');
    if (!grid) return; // Чтобы не было ошибок, если сетки нет на странице

    try {
        const response = await fetch('articles.json');
        const articles = await response.json();

        articles.forEach(article => {
            // Считаем время прочтения
            const words = article.fullText.replace(/<[^>]*>/g, '').split(/\s+/).length;
            const time = Math.ceil(words / 200);

            const card = `
                <article onclick="openArticle('${article.id}')" 
                        class="group cursor-pointer bg-white p-5 rounded-[2rem] border border-blue-50 shadow-sm transition-all duration-300 flex flex-col h-full">
                    
                    <div class="aspect-video bg-slate-100 rounded-2xl mb-5 overflow-hidden flex-shrink-0">
                        <img src="${article.image}" alt="${article.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>

                    <div class="flex-grow">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-blue-600 text-xs font-bold uppercase tracking-widest">${article.category}</span>
                            <span class="text-slate-300">•</span>
                            <span class="text-slate-400 text-xs flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                ${time} мин
                            </span>
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 mb-3 font-serif line-clamp-2">${article.title}</h3>
                        <p class="text-slate-600 text-sm line-clamp-3 leading-relaxed">${article.preview}</p>
                    </div>

                    <div class="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                        <div class="flex items-center text-slate-600 group-hover:text-blue-600 transition-colors text-sm font-semibold gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                            <span>Читать</span>
                        </div>

                        ${article.audioUrl ? `
                            <button type="button" data-article-audio-id="${article.id}"
                                    onclick="event.stopPropagation(); playAudio('${article.audioUrl}', '${article.id}')"
                                    class="article-audio-btn flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 text-xs font-bold uppercase tracking-wider shrink-0">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"></path>
                                </svg>
                                Слушать
                            </button>
                        ` : ''}
                    </div>
                </article>
            `;
            grid.innerHTML += card;
        });

        // Функция открытия статьи (теперь она глобальная через window)
        window.openArticle = (id) => {
            const art = articles.find(a => a.id === id);
            const modalBody = document.getElementById('modal-body');
            const overlay = document.getElementById('modal-overlay');
        
            if (art && modalBody && overlay) {
                detachArticleAudioToHost();
                // 1. Сначала вставляем контент
                modalBody.innerHTML = `
                    <div class="max-w-3xl mx-auto"> 
                        <span class="text-blue-500 font-bold text-xs uppercase tracking-widest">${art.category}</span>
                        <h2 class="text-3xl md:text-4xl font-serif text-slate-900 mt-2 mb-8">${art.title}</h2>
                        ${art.audioUrl ? `
                        <div class="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <p class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Озвучка статьи</p>
                            <div id="modal-audio-slot"></div>
                        </div>
                        ` : ''}
                        <div class="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
                            ${art.fullText}
                        </div>
                        <div class="mt-12 pt-8 border-t border-slate-100 text-center">
                            <p class="text-slate-600 mb-6 text-lg font-medium">Чувствуете, что вам нужна поддержка?</p>
                            <button onclick="goToContacts()" class="inline-block bg-gradient-to-br from-sky-500 via-blue-600 to-blue-800 
                            hover:from-sky-600 hover:via-blue-700 hover:to-blue-900 
                            text-white px-10 py-4 rounded-full font-semibold tracking-wide 
                            transition-all duration-500 hover:-translate-y-1 
                            hover:shadow-xl hover:shadow-sky-900/30 text-center">
                                Записаться на консультацию
                            </button>
                        </div>
                    </div>
                `;

                if (art.audioUrl) {
                    const slot = document.getElementById('modal-audio-slot');
                    const el = getSharedArticleAudio();
                    if (slot && el) {
                        const target = resolvedAudioUrl(art.audioUrl);
                        const cur = el.src ? el.src : '';
                        if (cur !== target) {
                            el.pause();
                            el.src = art.audioUrl;
                            window.__articleAudioActiveId = art.id;
                            document.querySelectorAll('button[data-article-audio-id]').forEach(btn => {
                                const bid = btn.getAttribute('data-article-audio-id');
                                updateAudioButtons(bid, false);
                            });
                        }
                        mountModalArticlePlayer(slot, el);
                    }
                }
                
                // 2. Показываем оверлей
                overlay.classList.remove('hidden');
                overlay.classList.add('flex');
                document.body.style.overflow = 'hidden';

                syncPlayButtonsFromPlayerState();
        
                // 3. ГАРАНТИРОВАННЫЙ СБРОС (с микро-задержкой)
                setTimeout(() => {
                    modalBody.scrollTo({ top: 0, behavior: 'instant' });
                    modalBody.scrollTop = 0; // дублируем для старых браузеров
                }, 10);
            }
        };
    } catch (error) {
        console.error("Ошибка при загрузке статей:", error);
    }
}

// Универсальная функция закрытия (для всех модалок)
window.closeModal = () => {
    detachArticleAudioToHost();
    const overlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
    document.body.style.overflow = ''; // Возвращаем дефолтный скролл

    if (modalBody) {
        modalBody.innerHTML = ''; 
        modalBody.scrollTop = 0;
    }
    window.__articleModalPlayerUpdate = null;
    syncPlayButtonsFromPlayerState();
};

// Обработка клика по фону оверлея
const overlay = document.getElementById('modal-overlay');
if (overlay) {
    overlay.onclick = function(e) {
        if (e.target === this) closeModal();
    };
}

window.playAudio = (url, id) => {
    const el = getSharedArticleAudio();
    if (!el) return;
    const target = resolvedAudioUrl(url);
    const cur = el.src ? el.src : '';

    if (window.__articleAudioActiveId === id && cur === target) {
        if (el.paused) {
            el.play().catch(e => {
                console.error('Ошибка воспроизведения:', url, e);
                alert('Файл озвучки временно недоступен');
            });
        } else {
            el.pause();
        }
        syncPlayButtonsFromPlayerState();
        return;
    }

    el.pause();
    document.querySelectorAll('button[data-article-audio-id]').forEach(btn => {
        const bid = btn.getAttribute('data-article-audio-id');
        updateAudioButtons(bid, false);
    });

    el.src = url;
    window.__articleAudioActiveId = id;

    el.play().catch(e => {
        console.error('Ошибка воспроизведения. Проверьте путь к файлу:', url, e);
        alert('Файл озвучки временно недоступен');
        window.__articleAudioActiveId = null;
        syncPlayButtonsFromPlayerState();
    });

    syncPlayButtonsFromPlayerState();
};

document.addEventListener('DOMContentLoaded', () => {
    initArticles();

    const el = getSharedArticleAudio();
    if (el) {
        el.addEventListener('timeupdate', () => {
            if (typeof window.__articleModalPlayerUpdate === 'function') window.__articleModalPlayerUpdate();
        });
        el.addEventListener('play', () => {
            syncPlayButtonsFromPlayerState();
            if (typeof window.__articleModalPlayerUpdate === 'function') window.__articleModalPlayerUpdate();
        });
        el.addEventListener('pause', () => {
            syncPlayButtonsFromPlayerState();
            if (typeof window.__articleModalPlayerUpdate === 'function') window.__articleModalPlayerUpdate();
        });
        el.addEventListener('ended', () => {
            el.currentTime = 0;
            const id = window.__articleAudioActiveId;
            if (id) updateAudioButtons(id, false);
            syncPlayButtonsFromPlayerState();
            if (typeof window.__articleModalPlayerUpdate === 'function') window.__articleModalPlayerUpdate();
        });
        el.addEventListener('loadedmetadata', () => {
            if (typeof window.__articleModalPlayerUpdate === 'function') window.__articleModalPlayerUpdate();
        });
        el.addEventListener('seeked', () => {
            if (typeof window.__articleModalPlayerUpdate === 'function') window.__articleModalPlayerUpdate();
        });
    }
});

// Переход к контактам
function goToContacts() {
    closeModal();
    setTimeout(() => {
        document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
}

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