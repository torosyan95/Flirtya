// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Основной объект приложения
const app = {
    // Текущий язык
    currentLanguage: 'en',
    
    // Данные пользователя
    user: null,
    
    // Массив потенциальных совпадений
    potentialMatches: [],
    
    // Текущая активная карточка
    currentCard: null,
    
    // Массив чатов
    chats: [],
    
    // Текущий открытый чат
    currentChat: null,
    
    // Состояние VIP
    vipStatus: {
        isVip: false,
        isVipPlus: false,
        expiryDate: null,
        superlikesLeft: 3,
        boosted: false
    },
    
    // Инициализация приложения
    init: function() {
        this.loadTranslations();
        this.setupEventListeners();
        
        // Получаем данные пользователя из Telegram
        const user = tg.initDataUnsafe?.user;
        if (user) {
            this.loadUserData(user.id);
        } else {
            // Если не получилось получить данные из Telegram, показываем онбординг
            this.showScreen('onboarding');
        }
    },
    
    // Загрузка переводов
    loadTranslations: function() {
        // Определяем язык пользователя
        const userLanguage = tg.initDataUnsafe?.user?.language_code || 'en';
        this.currentLanguage = userLanguage === 'ru' ? 'ru' : 'en';
        
        // Загружаем перевод
        this.loadLanguageFile(this.currentLanguage);
    },
    
    // Загрузка языкового файла
    loadLanguageFile: function(lang) {
        fetch(`i18n/${lang}.json`)
            .then(response => response.json())
            .then(translations => {
                this.translations = translations;
                this.applyTranslations();
            })
            .catch(error => {
                console.error('Error loading translations:', error);
                // Если не удалось загрузить перевод, используем английский по умолчанию
                if (lang !== 'en') {
                    this.loadLanguageFile('en');
                }
            });
    },
    
    // Применение переводов к элементам с атрибутом data-i18n
    applyTranslations: function() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[key]) {
                element.textContent = this.translations[key];
            }
        });
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Онбординг
        document.querySelector('.btn-next').addEventListener('click', this.nextOnboardingSlide.bind(this));
        document.querySelector('.btn-skip').addEventListener('click', this.skipOnboarding.bind(this));
        
        // Точки онбординга
        document.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.getAttribute('data-slide'));
                this.showOnboardingSlide(slideIndex);
            });
        });
        
        // Регистрация и вход
        document.getElementById('registration-form').addEventListener('submit', this.handleRegistration.bind(this));
        document.getElementById('login-form').addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('go-to-login').addEventListener('click', () => this.showScreen('login'));
        document.getElementById('go-to-register').addEventListener('click', () => this.showScreen('registration'));
        document.getElementById('forgot-password').addEventListener('click', this.handleForgotPassword.bind(this));
        
        // Шаги регистрации
        document.querySelectorAll('.btn-next-step').forEach(button => {
            button.addEventListener('click', this.nextRegistrationStep.bind(this));
        });
        
        document.querySelectorAll('.btn-prev-step').forEach(button => {
            button.addEventListener('click', this.prevRegistrationStep.bind(this));
        });
        
        // Выбор интересов
        document.querySelectorAll('.interest-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('selected');
                this.updateSelectedInterests();
            });
        });
        
        // Загрузка фото
        document.querySelectorAll('.photo-input').forEach(input => {
            input.addEventListener('change', this.handlePhotoUpload.bind(this));
        });
        
        // Просмотр условий использования
        document.getElementById('view-terms').addEventListener('click', this.showTerms.bind(this));
        
        // Нижняя навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.getAttribute('data-page');
                this.showPage(pageId);
            });
        });
        
        // Свайпы
        document.getElementById('like').addEventListener('click', () => this.handleSwipe('like'));
        document.getElementById('dislike').addEventListener('click', () => this.handleSwipe('dislike'));
        document.getElementById('superlike').addEventListener('click', () => this.handleSwipe('superlike'));
        
        // VIP покупки
        document.querySelectorAll('.btn-buy').forEach(button => {
            button.addEventListener('click', () => {
                const plan = button.getAttribute('data-plan');
                const period = button.getAttribute('data-period');
                const price = button.getAttribute('data-price');
                this.handleVipPurchase(plan, period, price);
            });
        });
        
        document.querySelectorAll('.btn-buy-item').forEach(button => {
            button.addEventListener('click', () => {
                const item = button.getAttribute('data-item');
                const price = button.getAttribute('data-price');
                const quantity = button.getAttribute('data-quantity');
                this.handleItemPurchase(item, price, quantity);
            });
        });
        
        // Профиль
        document.getElementById('btn-edit-profile').addEventListener('click', this.editProfile.bind(this));
        document.getElementById('btn-settings').addEventListener('click', () => this.showPage('settings-page'));
        document.getElementById('btn-logout').addEventListener('click', this.handleLogout.bind(this));
        document.getElementById('edit-profile-photo').addEventListener('click', this.editProfilePhoto.bind(this));
        
        // Настройки
        document.querySelectorAll('.btn-language').forEach(button => {
            button.addEventListener('click', () => {
                const lang = button.getAttribute('data-lang');
                this.changeLanguage(lang);
            });
        });
        
        document.querySelectorAll('.btn-option').forEach(button => {
            button.addEventListener('click', () => {
                const optionsContainer = button.closest('.setting-options');
                optionsContainer.querySelectorAll('.btn-option').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                this.saveSettings();
            });
        });
        
        document.querySelectorAll('.setting-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', this.saveSettings.bind(this));
        });
        
        document.querySelectorAll('.setting-item input[type="range"]').forEach(range => {
            range.addEventListener('input', this.updateRangeValue.bind(this));
            range.addEventListener('change', this.saveSettings.bind(this));
        });
        
        document.getElementById('btn-change-password').addEventListener('click', this.showChangePasswordModal.bind(this));
        document.getElementById('btn-delete-account').addEventListener('click', this.showDeleteAccountConfirmation.bind(this));
        document.getElementById('btn-contact-support').addEventListener('click', this.contactSupport.bind(this));
        document.getElementById('btn-terms').addEventListener('click', this.showTerms.bind(this));
        document.getElementById('btn-privacy').addEventListener('click', this.showPrivacyPolicy.bind(this));
        
        // Чат
        document.getElementById('chat-back').addEventListener('click', () => {
            this.currentChat = null;
            this.showScreen('main-app');
            this.showPage('chats-page');
        });
    },
    
    // Переключение экранов (онбординг, регистрация, вход, основное приложение)
    showScreen: function(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
        
        // Дополнительная логика при переключении экранов
        if (screenId === 'main-app') {
            this.loadPotentialMatches();
            this.loadChats();
        }
    },
    
    // Переключение между страницами в основном приложении
    showPage: function(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
        
        // Дополнительная логика при переключении страниц
        if (pageId === 'swipes-page') {
            if (this.potentialMatches.length === 0) {
                this.loadPotentialMatches();
            }
        } else if (pageId === 'chats-page') {
            this.loadChats();
        } else if (pageId === 'profile-page') {
            this.updateProfileDisplay();
        }
    },
    
    // Показать следующий слайд онбординга
    nextOnboardingSlide: function() {
        const activeSlide = document.querySelector('.slide.active');
        const activeIndex = parseInt(activeSlide.id.split('-')[1]) - 1;
        const nextIndex = activeIndex + 1;
        
        if (nextIndex < 3) {
            this.showOnboardingSlide(nextIndex);
        } else {
            this.showScreen('registration');
        }
    },
    
    // Показать определенный слайд онбординга
    showOnboardingSlide: function(index) {
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active');
        });
        
        document.querySelectorAll('.dot').forEach(dot => {
            dot.classList.remove('active');
        });
        
        document.getElementById(`slide-${index + 1}`).classList.add('active');
        document.querySelector(`.dot[data-slide="${index}"]`).classList.add('active');
        
        const nextButton = document.querySelector('.btn-next');
        if (index === 2) {
            nextButton.textContent = this.translations.get_started || 'Get Started';
        } else {
            nextButton.textContent = this.translations.next || 'Next';
        }
    },
    
    // Пропустить онбординг
    skipOnboarding: function() {
        this.showScreen('registration');
    },
    
    // Следующий шаг регистрации
    nextRegistrationStep: function(event) {
        const currentStep = event.target.closest('.form-step');
        const currentIndex = Array.from(currentStep.parentNode.children).indexOf(currentStep);
        const nextStep = currentStep.parentNode.children[currentIndex + 1];
        
        // Проверка валидности полей текущего шага
        if (this.validateRegistrationStep(currentStep)) {
            currentStep.classList.remove('active');
            nextStep.classList.add('active');
        }
    },
    
    // Предыдущий шаг регистрации
    prevRegistrationStep: function(event) {
        const currentStep = event.target.closest('.form-step');
        const currentIndex = Array.from(currentStep.parentNode.children).indexOf(currentStep);
        const prevStep = currentStep.parentNode.children[currentIndex - 1];
        
        currentStep.classList.remove('active');
        prevStep.classList.add('active');
    },
    
    // Проверка валидности полей регистрации
    validateRegistrationStep: function(step) {
        const inputs = step.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
        
        // Специальная проверка для определенных шагов
        if (step.id === 'step-personal') {
            // Проверка возраста (18+)
            const birthdate = new Date(document.getElementById('birthdate').value);
            const age = this.calculateAge(birthdate);
            
            if (age < 18) {
                document.getElementById('birthdate').classList.add('error');
                alert(this.translations.age_restriction || 'You must be at least 18 years old to register.');
                isValid = false;
            }
        } else if (step.id === 'step-interests') {
            // Проверка выбора минимум 3 интересов
            const selectedInterests = document.querySelectorAll('.interest-tag.selected');
            if (selectedInterests.length < 3) {
                alert(this.translations.select_min_interests || 'Please select at least 3 interests.');
                isValid = false;
            }
        } else if (step.id === 'step-photos') {
            // Проверка загрузки хотя бы одного фото
            const hasPhoto = document.querySelector('.photo-preview img');
            if (!hasPhoto) {
                alert(this.translations.photo_required || 'Please upload at least one photo.');
                isValid = false;
            }
        }
        
        return isValid;
    },
    
    // Расчет возраста по дате рождения
    calculateAge: function(birthdate) {
        const today = new Date();
        let age = today.getFullYear() - birthdate.getFullYear();
        const m = today.getMonth() - birthdate.getMonth();
        
        if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
            age--;
        }
        
        return age;
    },
    
    // Обновление выбранных интересов
    updateSelectedInterests: function() {
        const selectedInterests = [];
        document.querySelectorAll('.interest-tag.selected').forEach(tag => {
            selectedInterests.push(tag.getAttribute('data-interest'));
        });
        
        document.getElementById('interests').value = JSON.stringify(selectedInterests);
    },
    
    // Обработка загрузки фото
    handlePhotoUpload: function(event) {
        const input = event.target;
        const photoBox = input.closest('.photo-upload-box');
        const preview = photoBox.querySelector('.photo-preview');
        
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                preview.innerHTML = '';
                preview.appendChild(img);
                photoBox.classList.add('has-photo');
            };
            
            reader.readAsDataURL(input.files[0]);
            
            // Сохраняем фото в localStorage
            this.savePhotoToStorage(input.files[0], input.id);
        }
    },
    
    // Сохранение фото в localStorage
    savePhotoToStorage: function(file, inputId) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            localStorage.setItem(`flirtya_${inputId}`, e.target.result);
        };
        
        reader.readAsDataURL(file);
    },
    
    // Обработка отправки формы регистрации
    handleRegistration: function(event) {
        event.preventDefault();
        
        // Проверка согласия с условиями
        const termsAgreed = document.getElementById('terms-agree').checked;
        if (!termsAgreed) {
            alert(this.translations.terms_agreement_required || 'You must agree to the Terms of Use to register.');
            return;
        }
        
        // Сбор данных формы
        const formData = new FormData(event.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'), // В реальном приложении пароль должен хешироваться
            birthdate: formData.get('birthdate'),
            gender: formData.get('gender'),
            country: formData.get('country'),
            city: formData.get('city'),
            goal: formData.get('goal'),
            interests: JSON.parse(formData.get('interests') || '[]'),
            favoriteMusic: formData.get('favorite-music'),
            threeWords: formData.get('three-words'),
            referralCode: formData.get('referral-code'),
            photos: [],
            registrationDate: new Date().toISOString(),
            isComplete: true,
            isVip: false,
            isVipPlus: false,
            verified: false,
            language: this.currentLanguage
        };
        
        // Получение фото из localStorage
        for (let i = 1; i <= 3; i++) {
            const photoData = localStorage.getItem(`flirtya_photo-${i}`);
            if (photoData) {
                userData.photos.push(photoData);
            }
        }
        
        // Генерация уникального ID пользователя (в реальном приложении это бы делал сервер)
        userData.id = Date.now().toString();
        
        // Сохранение данных пользователя
        localStorage.setItem('flirtya_user', JSON.stringify(userData));
        this.user = userData;
        
        // Переход в основное приложение
        this.showScreen('main-app');
        
        // Отправка уведомления в Telegram о завершении регистрации
        if (tg.initDataUnsafe?.user) {
            tg.sendData(JSON.stringify({
                action: 'registration_complete',
                userId: userData.id
            }));
        }
    },
    
    // Обработка входа
    handleLogin: function(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // В реальном приложении здесь была бы проверка на сервере
        // Для этого примера просто проверяем с данными из localStorage
        const userData = JSON.parse(localStorage.getItem('flirtya_user') || 'null');
        
        if (userData && userData.email === email && userData.password === password) {
            this.user = userData;
            this.showScreen('main-app');
            
            // Отправка уведомления в Telegram о входе
            if (tg.initDataUnsafe?.user) {
                tg.sendData(JSON.stringify({
                    action: 'login_complete',
                    userId: userData.id
                }));
            }
        } else {
            alert(this.translations.login_error || 'Invalid email or password.');
        }
    },
    
    // Обработка "Забыли пароль"
    handleForgotPassword: function() {
        // В реальном приложении здесь была бы логика сброса пароля
        alert(this.translations.password_reset_info || 'A password reset link has been sent to your email.');
    },
    
    // Загрузка данных пользователя
    loadUserData: function(userId) {
        // В реальном приложении здесь был бы запрос к серверу
        // Для этого примера просто получаем из localStorage
        const userData = JSON.parse(localStorage.getItem('flirtya_user') || 'null');
        
        if (userData) {
            this.user = userData;
            this.vipStatus.isVip = userData.isVip;
            this.vipStatus.isVipPlus = userData.isVipPlus;
            
            // Если профиль заполнен, переходим в основное приложение
            if (userData.isComplete) {
                this.showScreen('main-app');
            } else {
                // Иначе показываем форму регистрации
                this.showScreen('registration');
            }
        } else {
            // Если пользователь не найден, показываем онбординг
            this.showScreen('onboarding');
        }
    },
    
    // Загрузка потенциальных совпадений
    loadPotentialMatches: function() {
        // В реальном приложении здесь был бы запрос к серверу
        // Для этого примера просто генерируем демо-данные
        this.potentialMatches = this.generateDemoMatches();
        this.showNextCard();
    },
    
    // Генерация демо-данных для потенциальных совпадений
    generateDemoMatches: function() {
        const demoMatches = [];
        const names = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn'];
        const cities = ['New York', 'Los Angeles', 'London', 'Paris', 'Tokyo', 'Moscow', 'Berlin'];
        const interests = ['Music', 'Movies', 'Travel', 'Food', 'Sports', 'Art', 'Books', 'Technology'];
        const goals = ['love', 'friendship', 'chat'];
        
        // Генерация 10 случайных профилей
        for (let i = 0; i < 10; i++) {
            const age = Math.floor(Math.random() * 15) + 20; // Возраст от 20 до 35
            const randomInterests = [];
            
            // Выбор 2-5 случайных интересов
            const numInterests = Math.floor(Math.random() * 4) + 2;
            for (let j = 0; j < numInterests; j++) {
                const interest = interests[Math.floor(Math.random() * interests.length)];
                if (!randomInterests.includes(interest)) {
                    randomInterests.push(interest);
                }
            }
            
            demoMatches.push({
                id: `demo-${i}`,
                name: names[Math.floor(Math.random() * names.length)],
                age: age,
                city: cities[Math.floor(Math.random() * cities.length)],
                distance: Math.floor(Math.random() * 50) + 1, // Расстояние от 1 до 50 км
                interests: randomInterests,
                goal: goals[Math.floor(Math.random() * goals.length)],
                photo: `assets/images/demo-avatar-${(i % 5) + 1}.jpg`,
                online: Math.random() > 0.5,
                verified: Math.random() > 0.7
            });
        }
        
        return demoMatches;
    },
    
    // Показать следующую карточку
    showNextCard: function() {
        const cardsContainer = document.querySelector('.cards-container');
        
        // Если карточек не осталось, показываем сообщение
        if (this.potentialMatches.length === 0) {
            cardsContainer.innerHTML = '';
            document.querySelector('.no-cards-message').classList.remove('hidden');
            return;
        }
        
        document.querySelector('.no-cards-message').classList.add('hidden');
        
        // Берем первый профиль из массива
        this.currentCard = this.potentialMatches[0];
        
        // Создаем карточку
        const card = document.createElement('div');
        card.className = 'card';
        card.id = `card-${this.currentCard.id}`;
        
        // Добавляем фото
        const photoDiv = document.createElement('div');
        photoDiv.className = 'card-photo';
        photoDiv.style.backgroundImage = `url('${this.currentCard.photo}')`;
        
        // Добавляем информацию о профиле
        const infoDiv = document.createElement('div');
        infoDiv.className = 'card-info';
        
        const nameAge = document.createElement('h3');
        nameAge.className = 'name-age';
        nameAge.textContent = `${this.currentCard.name}, ${this.currentCard.age}`;
        
        const location = document.createElement('p');
        location.className = 'location';
        location.textContent = `${this.currentCard.city} (${this.currentCard.distance} km)`;
        
        const interestsDiv = document.createElement('div');
        interestsDiv.className = 'card-interests';
        this.currentCard.interests.forEach(interest => {
            const interestTag = document.createElement('span');
            interestTag.className = 'interest-badge';
            interestTag.textContent = interest;
            interestsDiv.appendChild(interestTag);
        });
        
        // Добавляем значки (если есть)
        const badgesDiv = document.createElement('div');
        badgesDiv.className = 'card-badges';
        
        if (this.currentCard.verified) {
            const verifiedBadge = document.createElement('span');
            verifiedBadge.className = 'verified-badge';
            verifiedBadge.innerHTML = '✓';
            verifiedBadge.title = this.translations.verified || 'Verified';
            badgesDiv.appendChild(verifiedBadge);
        }
        
        if (this.currentCard.online) {
            const onlineBadge = document.createElement('span');
            onlineBadge.className = 'online-badge';
            onlineBadge.textContent = this.translations.online || 'Online';
            badgesDiv.appendChild(onlineBadge);
        }
        
        // Собираем все вместе
        infoDiv.appendChild(nameAge);
        infoDiv.appendChild(location);
        infoDiv.appendChild(interestsDiv);
        infoDiv.appendChild(badgesDiv);
        
        card.appendChild(photoDiv);
        card.appendChild(infoDiv);
        
        // Добавляем карточку в контейнер
        cardsContainer.innerHTML = '';
        cardsContainer.appendChild(card);
        
        // Добавляем обработчики свайпов на карточку
        this.setupCardSwipe(card);
    },
    
    // Настройка свайпов на карточке
    setupCardSwipe: function(card) {
        let startX = 0;
        let startY = 0;
        let distX = 0;
        let distY = 0;
        
        card.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, false);
        
        card.addEventListener('touchmove', e => {
            if (!startX || !startY) return;
            
            distX = e.touches[0].clientX - startX;
            distY = e.touches[0].clientY - startY;
            
            // Если движение преимущественно горизонтальное
            if (Math.abs(distX) > Math.abs(distY)) {
                e.preventDefault();
                
                // Вращение и перемещение карточки
                const rotate = distX * 0.1;
                card.style.transform = `translateX(${distX}px) rotate(${rotate}deg)`;
                
                // Индикаторы лайка/дизлайка
                if (distX > 50) {
                    card.classList.add('like');
                    card.classList.remove('dislike');
                    card.classList.remove('superlike');
                } else if (distX < -50) {
                    card.classList.add('dislike');
                    card.classList.remove('like');
                    card.classList.remove('superlike');
                } else {
                    card.classList.remove('like');
                    card.classList.remove('dislike');
                    card.classList.remove('superlike');
                }
            }
            
            // Если движение преимущественно вертикальное вверх
            if (distY < -50 && Math.abs(distY) > Math.abs(distX)) {
                e.preventDefault();
                
                // Перемещение карточки вверх
                card.style.transform = `translateY(${distY}px)`;
                
                // Индикатор суперлайка
                card.classList.add('superlike');
                card.classList.remove('like');
                card.classList.remove('dislike');
            }
        }, false);
        
        card.addEventListener('touchend', e => {
            // Если свайп был достаточно сильным
            if (distX > 100) {
                this.handleSwipe('like');
            } else if (distX < -100) {
                this.handleSwipe('dislike');
            } else if (distY < -100) {
                this.handleSwipe('superlike');
            } else {
                // Возвращаем карточку на место
                card.style.transform = '';
                card.classList.remove('like');
                card.classList.remove('dislike');
                card.classList.remove('superlike');
            }
            
            // Сбрасываем переменные
            startX = 0;
            startY = 0;
            distX = 0;
            distY = 0;
        }, false);
    },
    
    // Обработка свайпа
    handleSwipe: function(type) {
        if (!this.currentCard) return;
        
        const card = document.getElementById(`card-${this.currentCard.id}`);
        if (!card) return;
        
        switch (type) {
            case 'like':
                card.

// Продолжение метода handleSwipe
    handleSwipe: function(type) {
        if (!this.currentCard) return;
        
        const card = document.getElementById(`card-${this.currentCard.id}`);
        if (!card) return;
        
        switch (type) {
            case 'like':
                card.classList.add('like');
                card.style.transform = 'translateX(1000px) rotate(30deg)';
                this.processSwipe('like');
                break;
                
            case 'dislike':
                card.classList.add('dislike');
                card.style.transform = 'translateX(-1000px) rotate(-30deg)';
                this.processSwipe('dislike');
                break;
                
            case 'superlike':
                // Проверяем, доступны ли суперлайки
                if (this.vipStatus.superlikesLeft <= 0 && !this.vipStatus.isVip && !this.vipStatus.isVipPlus) {
                    this.showSuperlikeModal();
                    return;
                }
                
                card.classList.add('superlike');
                card.style.transform = 'translateY(-1000px)';
                this.processSwipe('superlike');
                
                // Уменьшаем количество доступных суперлайков
                if (!this.vipStatus.isVip && !this.vipStatus.isVipPlus) {
                    this.vipStatus.superlikesLeft--;
                    document.querySelector('.superlike-count').textContent = this.vipStatus.superlikesLeft;
                    
                    // Сохраняем состояние
                    localStorage.setItem('flirtya_vip_status', JSON.stringify(this.vipStatus));
                }
                break;
        }
    },
    
    // Обработка результата свайпа
    processSwipe: function(type) {
        setTimeout(() => {
            // Убираем текущую карточку из массива
            const swipedCard = this.potentialMatches.shift();
            
            // Симулируем случайный матч (в реальном приложении это определялось бы на сервере)
            if (type === 'like' || type === 'superlike') {
                const isMatch = type === 'superlike' ? true : Math.random() > 0.7;
                
                if (isMatch) {
                    this.createMatch(swipedCard);
                }
            }
            
            // Показываем следующую карточку
            this.showNextCard();
        }, 300);
    },
    
    // Показ модального окна для покупки суперлайков
    showSuperlikeModal: function() {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'superlike-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const modalHeader = document.createElement('h3');
        modalHeader.textContent = this.translations.out_of_superlikes || 'Out of Superlikes';
        
        const modalText = document.createElement('p');
        modalText.textContent = this.translations.superlike_modal_text || 'You\'ve used all your daily Superlikes. Get more or upgrade to VIP for unlimited Superlikes.';
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'modal-buttons';
        
        const buyButton = document.createElement('button');
        buyButton.className = 'btn-buy-modal';
        buyButton.textContent = this.translations.buy_superlikes || 'Buy 3 Superlikes ($0.99)';
        buyButton.addEventListener('click', () => {
            this.handleItemPurchase('superlikes', 0.99, 3);
            document.body.removeChild(modal);
        });
        
        const vipButton = document.createElement('button');
        vipButton.className = 'btn-vip-modal';
        vipButton.textContent = this.translations.get_vip || 'Get VIP';
        vipButton.addEventListener('click', () => {
            this.showPage('vip-page');
            document.body.removeChild(modal);
        });
        
        const closeButton = document.createElement('button');
        closeButton.className = 'btn-close-modal';
        closeButton.textContent = this.translations.close || 'Close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        buttonsContainer.appendChild(buyButton);
        buttonsContainer.appendChild(vipButton);
        buttonsContainer.appendChild(closeButton);
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalText);
        modalContent.appendChild(buttonsContainer);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    },
    
    // Создание матча
    createMatch: function(matchedUser) {
        // Создаем чат
        const chatId = `chat-${Date.now()}`;
        const newChat = {
            id: chatId,
            userId: matchedUser.id,
            userName: matchedUser.name,
            userPhoto: matchedUser.photo,
            userAge: matchedUser.age,
            userCity: matchedUser.city,
            lastMessage: null,
            unread: 0,
            messages: [],
            createdAt: new Date().toISOString()
        };
        
        // Добавляем чат в массив
        this.chats.unshift(newChat);
        
        // Сохраняем чаты в localStorage
        localStorage.setItem('flirtya_chats', JSON.stringify(this.chats));
        
        // Обновляем счетчик непрочитанных чатов
        this.updateChatsBadge();
        
        // Показываем модальное окно с матчем
        this.showMatchModal(matchedUser);
    },
    
    // Показ модального окна с матчем
    showMatchModal: function(matchedUser) {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal match-modal';
        modal.id = 'match-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const matchHeader = document.createElement('h2');
        matchHeader.className = 'match-header';
        matchHeader.textContent = this.translations.its_a_match || 'It\'s a Match!';
        
        const matchText = document.createElement('p');
        matchText.className = 'match-text';
        matchText.textContent = this.translations.match_text || `You and ${matchedUser.name} liked each other.`;
        
        const photosContainer = document.createElement('div');
        photosContainer.className = 'match-photos';
        
        const yourPhoto = document.createElement('div');
        yourPhoto.className = 'your-photo';
        yourPhoto.style.backgroundImage = `url('${this.user.photos[0]}')`;
        
        const matchPhoto = document.createElement('div');
        matchPhoto.className = 'match-photo';
        matchPhoto.style.backgroundImage = `url('${matchedUser.photo}')`;
        
        photosContainer.appendChild(yourPhoto);
        photosContainer.appendChild(matchPhoto);
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'modal-buttons';
        
        const chatButton = document.createElement('button');
        chatButton.className = 'btn-chat-now';
        chatButton.textContent = this.translations.chat_now || 'Chat Now';
        chatButton.addEventListener('click', () => {
            // Находим чат с этим пользователем
            const chat = this.chats.find(c => c.userId === matchedUser.id);
            if (chat) {
                this.openChat(chat);
            }
            document.body.removeChild(modal);
        });
        
        const continueButton = document.createElement('button');
        continueButton.className = 'btn-continue-swiping';
        continueButton.textContent = this.translations.continue_swiping || 'Continue Swiping';
        continueButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        buttonsContainer.appendChild(chatButton);
        buttonsContainer.appendChild(continueButton);
        
        modalContent.appendChild(matchHeader);
        modalContent.appendChild(matchText);
        modalContent.appendChild(photosContainer);
        modalContent.appendChild(buttonsContainer);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    },
    
    // Загрузка чатов
    loadChats: function() {
        // В реальном приложении здесь был бы запрос к серверу
        // Для этого примера просто получаем из localStorage
        const savedChats = localStorage.getItem('flirtya_chats');
        this.chats = savedChats ? JSON.parse(savedChats) : [];
        
        this.updateChatsList();
        this.updateChatsBadge();
    },
    
    // Обновление списка чатов
    updateChatsList: function() {
        const chatsListContainer = document.querySelector('.chats-list');
        
        if (this.chats.length === 0) {
            chatsListContainer.innerHTML = `<div class="no-chats-message">${this.translations.no_chats || 'No matches yet. Start swiping to find matches!'}</div>`;
            return;
        }
        
        chatsListContainer.innerHTML = '';
        
        this.chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.setAttribute('data-chat-id', chat.id);
            
            const chatAvatar = document.createElement('div');
            chatAvatar.className = 'chat-avatar';
            
            const avatarImg = document.createElement('img');
            avatarImg.src = chat.userPhoto;
            avatarImg.alt = chat.userName;
            
            chatAvatar.appendChild(avatarImg);
            
            const chatInfo = document.createElement('div');
            chatInfo.className = 'chat-info';
            
            const chatName = document.createElement('div');
            chatName.className = 'chat-name';
            chatName.textContent = `${chat.userName}, ${chat.userAge}`;
            
            const chatPreview = document.createElement('div');
            chatPreview.className = 'chat-preview';
            
            if (chat.lastMessage) {
                chatPreview.textContent = chat.lastMessage.text.length > 30 
                    ? chat.lastMessage.text.substring(0, 30) + '...' 
                    : chat.lastMessage.text;
            } else {
                chatPreview.textContent = this.translations.new_match || 'New match! Say hello!';
                chatPreview.classList.add('no-message');
            }
            
            chatInfo.appendChild(chatName);
            chatInfo.appendChild(chatPreview);
            
            const chatMeta = document.createElement('div');
            chatMeta.className = 'chat-meta';
            
            const chatTime = document.createElement('div');
            chatTime.className = 'chat-time';
            
            if (chat.lastMessage) {
                chatTime.textContent = this.formatMessageTime(new Date(chat.lastMessage.timestamp));
            } else {
                chatTime.textContent = this.formatMessageTime(new Date(chat.createdAt));
            }
            
            chatMeta.appendChild(chatTime);
            
            if (chat.unread > 0) {
                const unreadBadge = document.createElement('div');
                unreadBadge.className = 'unread-badge';
                unreadBadge.textContent = chat.unread;
                chatMeta.appendChild(unreadBadge);
            }
            
            chatItem.appendChild(chatAvatar);
            chatItem.appendChild(chatInfo);
            chatItem.appendChild(chatMeta);
            
            chatItem.addEventListener('click', () => {
                this.openChat(chat);
            });
            
            chatsListContainer.appendChild(chatItem);
        });
    },
    
    // Обновление счетчика непрочитанных чатов
    updateChatsBadge: function() {
        const unreadCount = this.chats.reduce((count, chat) => count + chat.unread, 0);
        const chatsBadge = document.getElementById('chats-badge');
        
        if (unreadCount > 0) {
            chatsBadge.textContent = unreadCount;
            chatsBadge.style.display = 'block';
        } else {
            chatsBadge.style.display = 'none';
        }
    },
    
    // Открытие чата
    openChat: function(chat) {
        this.currentChat = chat;
        
        // Обновляем информацию о пользователе в шапке чата
        document.getElementById('chat-user-name').textContent = chat.userName;
        document.getElementById('chat-user-avatar').src = chat.userPhoto;
        document.getElementById('chat-user-status').textContent = Math.random() > 0.5 
            ? (this.translations.online || 'Online') 
            : (this.translations.offline || 'Offline');
        
        // Отображаем сообщения
        this.updateMessagesDisplay();
        
        // Отмечаем сообщения как прочитанные
        this.markChatAsRead(chat.id);
        
        // Показываем экран чата
        this.showScreen('chat-room');
    },
    
    // Обновление отображения сообщений
    updateMessagesDisplay: function() {
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.innerHTML = '';
        
        if (!this.currentChat || !this.currentChat.messages || this.currentChat.messages.length === 0) {
            // Если сообщений нет, показываем приветственное сообщение
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            
            const welcomeText = document.createElement('p');
            welcomeText.textContent = this.translations.chat_welcome_text || `You matched with ${this.currentChat.userName}. Say hello!`;
            
            welcomeDiv.appendChild(welcomeText);
            messagesContainer.appendChild(welcomeDiv);
            
            // Добавляем подсказки для начала разговора (icebreakers)
            const icebreakersDiv = document.createElement('div');
            icebreakersDiv.className = 'icebreakers';
            
            const icebreakersTitle = document.createElement('h4');
            icebreakersTitle.textContent = this.translations.icebreakers || 'Conversation Starters';
            
            const icebreakersContainer = document.createElement('div');
            icebreakersContainer.className = 'icebreakers-container';
            
            const icebreakers = [
                this.translations.icebreaker_1 || 'Hey! How\'s your day going?',
                this.translations.icebreaker_2 || 'I noticed you like [interest]. What got you into that?',
                this.translations.icebreaker_3 || 'If you could travel anywhere right now, where would you go?'
            ];
            
            icebreakers.forEach(text => {
                const icebreaker = document.createElement('div');
                icebreaker.className = 'icebreaker';
                icebreaker.textContent = text;
                
                icebreaker.addEventListener('click', () => {
                    this.sendMessage(text);
                });
                
                icebreakersContainer.appendChild(icebreaker);
            });
            
            icebreakersDiv.appendChild(icebreakersTitle);
            icebreakersDiv.appendChild(icebreakersContainer);
            
            messagesContainer.appendChild(icebreakersDiv);
            return;
        }
        
        // Отображаем сообщения
        let lastDate = null;
        
        this.currentChat.messages.forEach(message => {
            const messageDate = new Date(message.timestamp);
            const messageDay = messageDate.toLocaleDateString();
            
            // Добавляем разделитель даты, если это новый день
            if (lastDate !== messageDay) {
                const dateDiv = document.createElement('div');
                dateDiv.className = 'date-separator';
                dateDiv.textContent = this.formatMessageDate(messageDate);
                messagesContainer.appendChild(dateDiv);
                lastDate = messageDay;
            }
            
            // Создаем элемент сообщения
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.sender === 'user' ? 'outgoing' : 'incoming'}`;
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            
            const messageText = document.createElement('p');
            messageText.className = 'message-text';
            messageText.textContent = message.text;
            
            const messageTime = document.createElement('span');
            messageTime.className = 'message-time';
            messageTime.textContent = this.formatMessageTime(messageDate);
            
            messageContent.appendChild(messageText);
            messageContent.appendChild(messageTime);
            
            // Добавляем статус прочтения для исходящих сообщений
            if (message.sender === 'user') {
                const messageStatus = document.createElement('span');
                messageStatus.className = 'message-status';
                
                if (message.read) {
                    messageStatus.textContent = '✓✓';
                    messageStatus.classList.add('read');
                } else {
                    messageStatus.textContent = '✓';
                }
                
                messageContent.appendChild(messageStatus);
            }
            
            messageDiv.appendChild(messageContent);
            messagesContainer.appendChild(messageDiv);
        });
        
        // Прокручиваем к последнему сообщению
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    // Форматирование даты сообщения
    formatMessageDate: function(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return this.translations.today || 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return this.translations.yesterday || 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    },
    
    // Форматирование времени сообщения
    formatMessageTime: function(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    // Отправка сообщения
    sendMessage: function(text) {
        if (!this.currentChat || !text) return;
        
        // Проверяем, может ли пользователь отправлять сообщения
        const isFirstMessage = !this.currentChat.messages || this.currentChat.messages.length === 0;
        const isWoman = this.user.gender === 'female';
        const canSendMessage = this.vipStatus.isVip || this.vipStatus.isVipPlus || isWoman || !isFirstMessage;
        
        if (!canSendMessage) {
            // Показываем модальное окно с предложением купить VIP
            this.showVipMessageModal();
            return;
        }
        
        // Создаем объект сообщения
        const newMessage = {
            id: Date.now().toString(),
            text: text,
            timestamp: new Date().toISOString(),
            sender: 'user',
            read: false
        };
        
        // Инициализируем массив сообщений, если он не существует
        if (!this.currentChat.messages) {
            this.currentChat.messages = [];
        }
        
        // Добавляем сообщение в чат
        this.currentChat.messages.push(newMessage);
        
        // Обновляем последнее сообщение
        this.currentChat.lastMessage = newMessage;
        
        // Сохраняем чаты в localStorage
        localStorage.setItem('flirtya_chats', JSON.stringify(this.chats));
        
        // Обновляем отображение сообщений
        this.updateMessagesDisplay();
        
        // Очищаем поле ввода
        document.querySelector('.message-input input').value = '';
        
        // Симулируем ответ (в реальном приложении здесь был бы запрос к серверу)
        this.simulateReply();
    },
    
    // Показ модального окна с предложением купить VIP для отправки сообщений
    showVipMessageModal: function() {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'vip-message-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const modalHeader = document.createElement('h3');
        modalHeader.textContent = this.translations.vip_required || 'VIP Required';
        
        const modalText = document.createElement('p');
        modalText.textContent = this.translations.vip_message_text || 'Only VIP members can send the first message. Upgrade to VIP to start the conversation.';
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'modal-buttons';
        
        const vipButton = document.createElement('button');
        vipButton.className = 'btn-vip-modal';
        vipButton.textContent = this.translations.get_vip || 'Get VIP';
        vipButton.addEventListener('click', () => {
            this.showScreen('main-app');
            this.showPage('vip-page');
            document.body.removeChild(modal);
        });
        
        const closeButton = document.createElement('button');
        closeButton.className = 'btn-close-modal';
        closeButton.textContent = this.translations.close || 'Close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        buttonsContainer.appendChild(vipButton);
        buttonsContainer.appendChild(closeButton);
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalText);
        modalContent.appendChild(buttonsContainer);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    },
    
    // Симуляция ответа собеседника
    simulateReply: function() {
        if (!this.currentChat) return;
        
        // Показываем индикатор набора текста
        this.showTypingIndicator();
        
        // Симулируем задержку ответа
        setTimeout(() => {
            // Скрываем индикатор набора текста
            this.hideTypingIndicator();
            
            // Генерируем случайный ответ
            const replies = [
                'Hey there! How are you?',
                'Nice to meet you!',
                'I like your profile! What do you do for fun?',
                'Thanks for the message! What are you up to today?',
                'Hello! I noticed we have similar interests. What\'s your favorite?'
            ];
            
            const replyText = replies[Math.floor(Math.random() * replies.length)];
            
            // Создаем объект сообщения
            const newMessage = {
                id: Date.now().toString(),
                text: replyText,
                timestamp: new Date().toISOString(),
                sender: 'match',
                read: true
            };
            
            // Добавляем сообщение в чат
            this.currentChat.messages.push(newMessage);
            
            // Обновляем последнее сообщение
            this.currentChat.lastMessage = newMessage;
            
            // Если чат не открыт, увеличиваем счетчик непрочитанных
            if (!document.getElementById('chat-room').classList.contains('hidden')) {
                this.currentChat.unread = (this.currentChat.unread || 0) + 1;
                this.updateChatsBadge();
            }
            
            // Сохраняем чаты в localStorage
            localStorage.setItem('flirtya_chats', JSON.stringify(this.chats));
            
            // Обновляем отображение сообщений
            this.updateMessagesDisplay();
        }, 2000 + Math.random() * 3000); // Случайная задержка от 2 до 5 секунд
    },
    
    // Показ индикатора набора текста
    showTypingIndicator: function() {
        const messagesContainer = document.getElementById('messages-container');
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message incoming typing';
        typingDiv.id = 'typing-indicator';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dot.className = 'typing-dot';
            typingContent.appendChild(dot);
        }
        
        typingDiv.appendChild(typingContent);
        messagesContainer.appendChild(typingDiv);
        
        // Прокручиваем к индикатору
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    // Скрытие индикатора набора текста
    hideTypingIndicator: function() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    },
    
    // Отметка чата как прочитанного
    markChatAsRead: function(chatId) {
        const chatIndex = this.chats.findIndex(chat => chat.id === chatId);
        
        if (chatIndex !== -1) {
            this.chats[chatIndex].unread = 0;
            
            // Сохраняем чаты в localStorage
            localStorage.setItem('flirtya_chats', JSON.stringify(this.chats));
            
            // Обновляем счетчик непрочитанных чатов
            this.updateChatsBadge();
        }
    },
    
    // Обработка покупки VIP
    handleVipPurchase: function(plan, period, price) {
        // В реальном приложении здесь была бы интеграция с платежной системой
        
        // Симулируем успешную покупку
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'payment-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const modalHeader = document.createElement('h3');
        modalHeader.textContent = this.translations.purchase_confirmation || 'Purchase Confirmation';
        
        const modalText = document.createElement('p');
        modalText.textContent = `${this.translations.confirm_purchase || 'Would you like to purchase'} ${plan === 'vip' ? 'VIP' : 'VIP+'} ${this.translations.for_price || 'for'} $${price}?`;
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'modal-buttons';
        
        const confirmButton = document.createElement('button');
        confirmButton.className = 'btn-confirm';
        confirmButton.textContent = this.translations.confirm || 'Confirm';
        confirmButton.addEventListener('click', () => {
            // Симулируем процесс оплаты
            modalText.textContent = this.translations.processing_payment || 'Processing payment...';
            buttonsContainer.style.display = 'none';
            
            setTimeout(() => {
                // Обновляем статус VIP
                if (plan === 'vip') {
                    this.vipStatus.isVip = true;
                    this.vipStatus.isVipPlus = false;
                } else {
                    this.vipStatus.isVip = true;
                    this.vipStatus.isVipPlus = true;
                }
                
                // Устанавливаем срок действия (30 дней)
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);
                this.vipStatus.expiryDate = expiryDate.toISOString();
                
                // Сохраняем статус VIP в localStorage
                localStorage.setItem('flirtya_vip_status', JSON.stringify(this.vipStatus));
                
                // Обновляем пользователя
                this.user.isVip = this.vipStatus.isVip;
                this.user.isVipPlus = this.vipStatus.isVipPlus;
                localStorage.setItem('flirtya_user', JSON.stringify(this.user));
                
                // Показываем сообщение об успешной покупке
                modalHeader.textContent = this.translations.purchase_successful || 'Purchase Successful';
                modalText.textContent = plan === 'vip' 
                    ? (this.translations.vip_activated || 'VIP status has been activated on your account!')
                    : (this.translations.vip_plus_activated || 'VIP+ status has been activated on your account!');
                
                const closeButton = document.createElement('button');
                closeButton.className = 'btn-close-modal';
                closeButton.textContent = this.translations.close || 'Close';
                closeButton.addEventListener('click', () => {
                    document.body.removeChild(modal);
                    
                    // Обновляем интерфейс
                    this.updateVipInterface();
                });
                
                buttonsContainer.innerHTML = '';
                buttonsContainer.appendChild(closeButton);
                buttonsContainer.style.display = 'flex';
                
                // Отправляем уведомление в Telegram о покупке
                if (tg.initDataUnsafe?.user) {
                    tg.sendData(JSON.stringify({
                        action: 'vip_purchased',
                        plan: plan,
                        price: price
                    }));
                }
            }, 2000);
        });

const cancelButton = document.createElement('button');
        cancelButton.className = 'btn-cancel';
        cancelButton.textContent = this.translations.cancel || 'Cancel';
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        buttonsContainer.appendChild(confirmButton);
        buttonsContainer.appendChild(cancelButton);
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalText);
        modalContent.appendChild(buttonsContainer);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    },
    
    // Обработка покупки других товаров (суперлайки, прочитано и т.д.)
    handleItemPurchase: function(item, price, quantity) {
        // В реальном приложении здесь была бы интеграция с платежной системой
        
        // Симулируем успешную покупку
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'payment-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const modalHeader = document.createElement('h3');
        modalHeader.textContent = this.translations.purchase_confirmation || 'Purchase Confirmation';
        
        let itemName = '';
        switch (item) {
            case 'superlikes':
                itemName = quantity + ' ' + (this.translations.superlikes || 'Superlikes');
                break;
            case 'read-status':
                itemName = this.translations.read_status || 'Read Status';
                break;
            case 'boost':
                itemName = this.translations.boost || 'Boost';
                break;
        }
        
        const modalText = document.createElement('p');
        modalText.textContent = `${this.translations.confirm_purchase || 'Would you like to purchase'} ${itemName} ${this.translations.for_price || 'for'} $${price}?`;
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'modal-buttons';
        
        const confirmButton = document.createElement('button');
        confirmButton.className = 'btn-confirm';
        confirmButton.textContent = this.translations.confirm || 'Confirm';
        confirmButton.addEventListener('click', () => {
            // Симулируем процесс оплаты
            modalText.textContent = this.translations.processing_payment || 'Processing payment...';
            buttonsContainer.style.display = 'none';
            
            setTimeout(() => {
                // Обновляем соответствующий счетчик
                switch (item) {
                    case 'superlikes':
                        this.vipStatus.superlikesLeft += quantity;
                        document.querySelector('.superlike-count').textContent = this.vipStatus.superlikesLeft;
                        break;
                    case 'read-status':
                        // Включаем статус прочтения для всех сообщений
                        this.enableReadStatus();
                        break;
                    case 'boost':
                        // Включаем буст на 1 час
                        this.vipStatus.boosted = true;
                        setTimeout(() => {
                            this.vipStatus.boosted = false;
                            localStorage.setItem('flirtya_vip_status', JSON.stringify(this.vipStatus));
                        }, 3600000); // 1 час
                        break;
                }
                
                // Сохраняем статус VIP в localStorage
                localStorage.setItem('flirtya_vip_status', JSON.stringify(this.vipStatus));
                
                // Показываем сообщение об успешной покупке
                modalHeader.textContent = this.translations.purchase_successful || 'Purchase Successful';
                
                let successMessage = '';
                switch (item) {
                    case 'superlikes':
                        successMessage = this.translations.superlikes_added || `${quantity} Superlikes have been added to your account!`;
                        break;
                    case 'read-status':
                        successMessage = this.translations.read_status_activated || 'Read Status has been activated for your messages!';
                        break;
                    case 'boost':
                        successMessage = this.translations.boost_activated || 'Your profile has been boosted for 1 hour!';
                        break;
                }
                
                modalText.textContent = successMessage;
                
                const closeButton = document.createElement('button');
                closeButton.className = 'btn-close-modal';
                closeButton.textContent = this.translations.close || 'Close';
                closeButton.addEventListener('click', () => {
                    document.body.removeChild(modal);
                });
                
                buttonsContainer.innerHTML = '';
                buttonsContainer.appendChild(closeButton);
                buttonsContainer.style.display = 'flex';
                
                // Отправляем уведомление в Telegram о покупке
                if (tg.initDataUnsafe?.user) {
                    tg.sendData(JSON.stringify({
                        action: 'item_purchased',
                        item: item,
                        price: price
                    }));
                }
            }, 2000);
        });
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'btn-cancel';
        cancelButton.textContent = this.translations.cancel || 'Cancel';
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        buttonsContainer.appendChild(confirmButton);
        buttonsContainer.appendChild(cancelButton);
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalText);
        modalContent.appendChild(buttonsContainer);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    },
    
    // Включение статуса прочтения для всех сообщений
    enableReadStatus: function() {
        // Обновляем все сообщения пользователя
        this.chats.forEach(chat => {
            if (chat.messages) {
                chat.messages.forEach(message => {
                    if (message.sender === 'user') {
                        message.read = true;
                    }
                });
            }
        });
        
        // Сохраняем чаты в localStorage
        localStorage.setItem('flirtya_chats', JSON.stringify(this.chats));
        
        // Обновляем отображение сообщений, если открыт чат
        if (this.currentChat) {
            this.updateMessagesDisplay();
        }
    },
    
    // Обновление интерфейса в зависимости от статуса VIP
    updateVipInterface: function() {
        // Обновляем счетчик суперлайков
        document.querySelector('.superlike-count').textContent = this.vipStatus.isVip || this.vipStatus.isVipPlus 
            ? '∞' 
            : this.vipStatus.superlikesLeft;
        
        // Обновляем кнопки покупки VIP
        const vipButtons = document.querySelectorAll('.btn-buy[data-plan="vip"]');
        vipButtons.forEach(button => {
            if (this.vipStatus.isVip) {
                button.textContent = this.translations.active || 'Active';
                button.disabled = true;
                button.classList.add('active');
            } else {
                button.textContent = this.translations.get_vip || 'Get VIP';
                button.disabled = false;
                button.classList.remove('active');
            }
        });
        
        // Обновляем кнопки покупки VIP+
        const vipPlusButtons = document.querySelectorAll('.btn-buy[data-plan="vip-plus"]');
        vipPlusButtons.forEach(button => {
            if (this.vipStatus.isVipPlus) {
                button.textContent = this.translations.active || 'Active';
                button.disabled = true;
                button.classList.add('active');
            } else {
                button.textContent = this.translations.get_vip_plus || 'Get VIP+';
                button.disabled = false;
                button.classList.remove('active');
            }
        });
        
        // Обновляем значки VIP в профиле
        const profileBadges = document.getElementById('profile-badges');
        profileBadges.innerHTML = '';
        
        if (this.vipStatus.isVipPlus) {
            const vipPlusBadge = document.createElement('span');
            vipPlusBadge.className = 'badge vip-plus';
            vipPlusBadge.textContent = 'VIP+';
            profileBadges.appendChild(vipPlusBadge);
        } else if (this.vipStatus.isVip) {
            const vipBadge = document.createElement('span');
            vipBadge.className = 'badge vip';
            vipBadge.textContent = 'VIP';
            profileBadges.appendChild(vipBadge);
        }
        
        if (this.user.verified) {
            const verifiedBadge = document.createElement('span');
            verifiedBadge.className = 'badge verified';
            verifiedBadge.innerHTML = '✓';
            profileBadges.appendChild(verifiedBadge);
        }
        
        // Обновляем настройки, доступные только для VIP+
        const vipOnlySettings = document.querySelectorAll('.vip-only input');
        vipOnlySettings.forEach(input => {
            input.disabled = !this.vipStatus.isVipPlus;
        });
    },
    
    // Обновление отображения профиля
    updateProfileDisplay: function() {
        // Обновляем фото профиля
        if (this.user.photos && this.user.photos.length > 0) {
            document.getElementById('profile-photo').src = this.user.photos[0];
            document.getElementById('user-avatar').src = this.user.photos[0];
        }
        
        // Обновляем имя и возраст
        const age = this.calculateAge(new Date(this.user.birthdate));
        document.getElementById('profile-name').textContent = `${this.user.name}, ${age}`;
        
        // Обновляем местоположение
        document.getElementById('profile-location').textContent = this.user.city ? `${this.user.city}, ${this.user.country}` : this.user.country;
        
        // Обновляем цель
        document.getElementById('profile-goal').textContent = this.translations[`goal_${this.user.goal}`] || this.user.goal;
        
        // Обновляем интересы
        const interestsContainer = document.getElementById('profile-interests');
        interestsContainer.innerHTML = '';
        
        if (this.user.interests && this.user.interests.length > 0) {
            this.user.interests.forEach(interest => {
                const interestTag = document.createElement('span');
                interestTag.className = 'interest-badge';
                interestTag.textContent = interest;
                interestsContainer.appendChild(interestTag);
            });
        } else {
            const noInterests = document.createElement('p');
            noInterests.className = 'no-interests';
            noInterests.textContent = this.translations.no_interests || 'No interests added';
            interestsContainer.appendChild(noInterests);
        }
        
        // Обновляем информацию о себе
        document.getElementById('profile-music').textContent = this.user.favoriteMusic || '-';
        document.getElementById('profile-words').textContent = this.user.threeWords || '-';
        
        // Обновляем значки VIP
        this.updateVipInterface();
    },
    
    // Редактирование профиля
    editProfile: function() {
        // В реальном приложении здесь была бы форма редактирования профиля
        alert(this.translations.edit_profile_alert || 'Profile editing is not implemented in this demo.');
    },
    
    // Редактирование фото профиля
    editProfilePhoto: function() {
        // В реальном приложении здесь была бы возможность загрузить новое фото
        alert(this.translations.edit_photo_alert || 'Photo editing is not implemented in this demo.');
    },
    
    // Изменение языка
    changeLanguage: function(lang) {
        if (lang === this.currentLanguage) return;
        
        this.currentLanguage = lang;
        
        // Загружаем перевод
        this.loadLanguageFile(lang);
        
        // Обновляем интерфейс
        document.querySelectorAll('.btn-language').forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-lang') === lang);
        });
        
        // Сохраняем выбранный язык
        if (this.user) {
            this.user.language = lang;
            localStorage.setItem('flirtya_user', JSON.stringify(this.user));
        }
    },
    
    // Обновление значения ползунка
    updateRangeValue: function(event) {
        const range = event.target;
        const valueElement = document.getElementById(`${range.id}-value`);
        
        if (valueElement) {
            valueElement.textContent = range.value;
        }
    },
    
    // Сохранение настроек
    saveSettings: function() {
        // В реальном приложении здесь была бы логика сохранения настроек на сервере
        console.log('Settings saved');
        
        // Сохраняем настройки в localStorage
        const settings = {
            lookingFor: document.querySelector('.setting-options .btn-option.active[data-option]').getAttribute('data-option'),
            ageMin: document.getElementById('age-min').value,
            ageMax: document.getElementById('age-max').value,
            distance: document.getElementById('distance').value,
            notifications: {
                matches: document.getElementById('notif-matches').checked,
                messages: document.getElementById('notif-messages').checked,
                likes: document.getElementById('notif-likes').checked
            },
            privacy: {
                showOnline: document.getElementById('privacy-online').checked,
                anonymous: document.getElementById('privacy-anonymous').checked
            }
        };
        
        localStorage.setItem('flirtya_settings', JSON.stringify(settings));
    },
    
    // Показ модального окна смены пароля
    showChangePasswordModal: function() {
        // В реальном приложении здесь было бы модальное окно для смены пароля
        alert(this.translations.change_password_alert || 'Password changing is not implemented in this demo.');
    },
    
    // Показ модального окна подтверждения удаления аккаунта
    showDeleteAccountConfirmation: function() {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'delete-account-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content danger';
        
        const modalHeader = document.createElement('h3');
        modalHeader.textContent = this.translations.delete_account || 'Delete Account';
        
        const modalText = document.createElement('p');
        modalText.textContent = this.translations.delete_account_confirmation || 'Are you sure you want to delete your account? This action cannot be undone.';
        
        const warningText = document.createElement('p');
        warningText.className = 'warning-text';
        warningText.textContent = this.translations.delete_account_warning || 'All your data, matches, and conversations will be permanently lost.';
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'modal-buttons';
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn-delete';
        deleteButton.textContent = this.translations.yes_delete || 'Yes, Delete';
        deleteButton.addEventListener('click', () => {
            // Удаляем аккаунт
            this.deleteAccount();
            document.body.removeChild(modal);
        });
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'btn-cancel';
        cancelButton.textContent = this.translations.cancel || 'Cancel';
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        buttonsContainer.appendChild(deleteButton);
        buttonsContainer.appendChild(cancelButton);
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalText);
        modalContent.appendChild(warningText);
        modalContent.appendChild(buttonsContainer);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    },
    
    // Удаление аккаунта
    deleteAccount: function() {
        // Удаляем все данные пользователя из localStorage
        localStorage.removeItem('flirtya_user');
        localStorage.removeItem('flirtya_chats');
        localStorage.removeItem('flirtya_vip_status');
        localStorage.removeItem('flirtya_settings');
        
        // Удаляем фото
        for (let i = 1; i <= 3; i++) {
            localStorage.removeItem(`flirtya_photo-${i}`);
        }
        
        // Отправляем уведомление в Telegram об удалении аккаунта
        if (tg.initDataUnsafe?.user) {
            tg.sendData(JSON.stringify({
                action: 'account_deleted'
            }));
        }
        
        // Перезагружаем приложение
        location.reload();
    },
    
    // Выход из аккаунта
    handleLogout: function() {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'logout-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const modalHeader = document.createElement('h3');
        modalHeader.textContent = this.translations.logout || 'Logout';
        
        const modalText = document.createElement('p');
        modalText.textContent = this.translations.logout_confirmation || 'Are you sure you want to logout?';
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'modal-buttons';
        
        const logoutButton = document.createElement('button');
        logoutButton.className = 'btn-logout';
        logoutButton.textContent = this.translations.yes_logout || 'Yes, Logout';
        logoutButton.addEventListener('click', () => {
            // Удаляем сессию
            localStorage.removeItem('flirtya_session');
            
            // Отправляем уведомление в Telegram о выходе
            if (tg.initDataUnsafe?.user) {
                tg.sendData(JSON.stringify({
                    action: 'logout'
                }));
            }
            
            // Перезагружаем приложение
            location.reload();
        });
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'btn-cancel';
        cancelButton.textContent = this.translations.cancel || 'Cancel';
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        buttonsContainer.appendChild(logoutButton);
        buttonsContainer.appendChild(cancelButton);
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalText);
        modalContent.appendChild(buttonsContainer);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    },
    
    // Связь с поддержкой
    contactSupport: function() {
        // В реальном приложении здесь был бы переход в чат с поддержкой
        
        // Открываем чат с поддержкой в Telegram
        if (tg.initDataUnsafe?.user) {
            tg.openTelegramLink('https://t.me/flirtya_support');
        } else {
            alert(this.translations.contact_support_alert || 'Support contact is not available in demo mode.');
        }
    },
    
    // Показ условий использования
    showTerms: function() {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'terms-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content terms';
        
        const modalHeader = document.createElement('h3');
        modalHeader.textContent = this.translations.terms_of_use || 'Terms of Use';
        
        const modalText = document.createElement('div');
        modalText.className = 'terms-content';
        
        // Содержимое условий использования
        modalText.innerHTML = `
            <h4>${this.translations.terms_header_1 || 'Welcome to Flirtya'}</h4>
            <p>${this.translations.terms_text_1 || 'Please read these terms carefully before using the application:'}</p>
            
            <h5>1. ${this.translations.terms_disclaimer || 'Disclaimer'}</h5>
            <ul>
                <li>${this.translations.terms_disclaimer_1 || 'The creator of this bot is not responsible for you not being able to meet someone.'}</li>
                <li>${this.translations.terms_disclaimer_2 || 'All expenses in the application are made with your consent and are not refundable.'}</li>
                <li>${this.translations.terms_disclaimer_3 || 'We do not guarantee that you will find love or serious relationships - it depends only on your luck and behavior.'}</li>
            </ul>
            
            <h5>2. ${this.translations.terms_paid_features || 'Paid Features'}</h5>
            <ul>
                <li>${this.translations.terms_paid_1 || 'All purchases (VIP, superlikes, message read status, etc.) are non-refundable, even if you do not use them or delete your account.'}</li>
                <li>${this.translations.terms_paid_2 || 'The administration reserves the right to delete any account in case of violation of the rules - even with an active VIP status.'}</li>
            </ul>
            
            <h5>3. ${this.translations.terms_safety || 'Communication Safety'}</h5>
            <ul>
                <li>${this.translations.terms_safety_1 || 'Flirtya is not responsible for contacts and communication outside the platform.'}</li>
                <li>${this.translations.terms_safety_2 || 'We do not verify the authenticity of Instagram, Telegram, WhatsApp, and other accounts that someone may mention in the chat.'}</li>
            </ul>
            
            <h5>4. ${this.translations.terms_behavior || 'Rules of Behavior'}</h5>
            <ul>
                <li>${this.translations.terms_behavior_1 || 'Respect other users. Insults, offers of intimate services, fake profiles are prohibited.'}</li>
                <li>${this.translations.terms_behavior_2 || 'Your account may be deleted without warning for breaking the rules.'}</li>
            </ul>
            
            <h5>5. ${this.translations.terms_data || 'Consent to Data Processing'}</h5>
            <ul>
                <li>${this.translations.terms_data_1 || 'By registering, you consent to the storage of your data in the local storage of the device.'}</li>
            </ul>
        `;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'btn-close-modal';
        closeButton.textContent = this.translations.close || 'Close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalText);
        modalContent.appendChild(closeButton);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    },
    
    // Показ политики конфиденциальности
    showPrivacyPolicy: function() {
        // В реальном приложении здесь было бы модальное окно с политикой конфиденциальности
        this.showTerms(); // Используем тот же метод для демо
    }
};

// Инициализация приложения при загрузке документа
document.addEventListener('DOMContentLoaded', () => {
    // Скрываем загрузочный экран после небольшой задержки
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        app.init();
    }, 1500);
});
