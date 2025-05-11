// Принудительно скрыть загрузочный экран через 3 секунды
setTimeout(function() {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('onboarding').style.display = 'block';
    document.getElementById('onboarding').classList.remove('hidden');
}, 3000);
// Основной файл приложения

const app = {
    // Telegram WebApp
    tg: null,
    
    // Данные пользователя
    user: null,
    
    // Текущий экран
    currentScreen: 'loading',
    
    // Текущая страница в основном приложении
    currentPage: 'swipes-page',
    
    // Потенциальные совпадения
    matches: [],
    
    // Текущая карточка
    currentCard: null,
    
    // Чаты
    chats: [],
    
    // Текущий открытый чат
    currentChat: null,
    
    // Инициализация приложения
    init: function() {
        // Получаем Telegram WebApp
        console.log('App component rendered');
        this.tg = window.Telegram?.WebApp;
        
        // Применяем цвета темы Telegram
        if (this.tg) {
            this.applyTelegramTheme();
        }
        
        // Настраиваем обработчики событий
        this.setupEventListeners();
        
        // Проверяем авторизацию
        this.checkAuth();
    },
    
    // Применение темы Telegram
    applyTelegramTheme: function() {
        if (!this.tg) return;
        
        // Получаем тему Telegram
        const colorScheme = this.tg.colorScheme || 'light';
        
        // Добавляем класс темы к body
        document.body.classList.add(`theme-${colorScheme}`);
        
        // Устанавливаем цвет фона
        document.body.style.backgroundColor = this.tg.backgroundColor || '';
        
        // Устанавливаем цвет текста
        const textColor = this.tg.themeParams?.text_color || '';
        if (textColor) {
            document.documentElement.style.setProperty('--text', textColor);
        }
        
        // Устанавливаем основной цвет
        const buttonColor = this.tg.themeParams?.button_color || '';
        if (buttonColor) {
            document.documentElement.style.setProperty('--primary', buttonColor);
        }
        
        // Расширяем WebApp на всю высоту
        this.tg.expand();
    },
    
    // Настройка обработчиков событий
setupEventListeners: function() {
    // Добавляем небольшую задержку для загрузки элементов
    setTimeout(() => {
        // Онбординг
        document.querySelector('.btn-next')?.addEventListener('click', this.handleNextOnboarding.bind(this));
        document.querySelector('.btn-skip')?.addEventListener('click', this.skipOnboarding.bind(this));
        
        // Точки онбординга
        document.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.getAttribute('data-slide'));
                this.showOnboardingSlide(slideIndex);
            });
        });
        
        // Форма регистрации
        document.getElementById('registration-form')?.addEventListener('submit', this.handleRegistration.bind(this));
        
        // Шаги регистрации
        document.querySelectorAll('.btn-next-step').forEach(button => {
            button.addEventListener('click', this.nextRegistrationStep.bind(this));
        });
        
        document.querySelectorAll('.btn-prev-step').forEach(button => {
            button.addEventListener('click', this.prevRegistrationStep.bind(this));
        });
        
        // Интересы
        document.querySelectorAll('.interest-tag').forEach(tag => {
            tag.addEventListener('click', this.toggleInterest.bind(this));
        });
        
        // Загрузка фото
        document.querySelectorAll('.photo-input').forEach(input => {
            input.addEventListener('change', this.handlePhotoUpload.bind(this));
        });
        
        // Нижняя навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', this.handleNavigation.bind(this));
        });
        
        // Свайпы
        document.getElementById('like')?.addEventListener('click', () => this.handleSwipe('like'));
        document.getElementById('dislike')?.addEventListener('click', () => this.handleSwipe('dislike'));
        document.getElementById('superlike')?.addEventListener('click', () => this.handleSwipe('superlike'));
        
        // Профиль
        document.getElementById('btn-edit-profile')?.addEventListener('click', this.editProfile.bind(this));
        document.getElementById('btn-settings')?.addEventListener('click', () => this.showPage('settings-page'));
        document.getElementById('btn-logout')?.addEventListener('click', this.handleLogout.bind(this));
        
        // Чат
        document.getElementById('chat-back')?.addEventListener('click', this.closeChat.bind(this));
        document.getElementById('send-message')?.addEventListener('click', this.sendMessage.bind(this));
        document.getElementById('message-input')?.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    },
    
    // Проверка авторизации
    checkAuth: function() {
        // Получаем данные пользователя
        const userData = localStorage.getItem('flirtya_user');
        
        if (userData) {
            this.user = JSON.parse(userData);
            
            // Переходим в основное приложение
            this.showScreen('main-app');
            this.loadUserData();
        } else {
            // Показываем онбординг или регистрацию
            const onboardingShown = localStorage.getItem('flirtya_onboarding_shown');
            
            if (onboardingShown) {
                this.showScreen('registration');
            } else {
                this.showScreen('onboarding');
            }
        }
    },
    
    // Показать определенный экран
    showScreen: function(screenId) {
        // Скрываем текущий экран
        document.getElementById(this.currentScreen)?.classList.add('hidden');
        
        // Показываем новый экран
        document.getElementById(screenId)?.classList.remove('hidden');
        
        // Обновляем текущий экран
        this.currentScreen = screenId;
        
        // Дополнительные действия при переключении экрана
        if (screenId === 'main-app') {
            // Загружаем совпадения
            this.loadMatches();
            // Загружаем чаты
            this.loadChats();
        } else if (screenId === 'loading') {
            // Через 2 секунды переходим дальше
            setTimeout(() => {
                this.checkAuth();
            }, 2000);
        }
    },
    
    // Обработка кнопки Next в онбординге
    handleNextOnboarding: function() {
        const activeSlide = document.querySelector('.slide.active');
        const activeIndex = parseInt(activeSlide.id.split('-')[1]) - 1;
        const nextIndex = activeIndex + 1;
        
        if (nextIndex < 3) {
            this.showOnboardingSlide(nextIndex);
        } else {
            // Сохраняем, что онбординг был показан
            localStorage.setItem('flirtya_onboarding_shown', 'true');
            
            // Переходим к регистрации
            this.showScreen('registration');
        }
    },
    
    // Показать определенный слайд онбординга
    showOnboardingSlide: function(index) {
        // Скрываем текущий слайд
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Обновляем точки
        document.querySelectorAll('.dot').forEach((dot, idx) => {
            dot.classList.toggle('active', idx === index);
        });
        
        // Показываем новый слайд
        document.getElementById(`slide-${index + 1}`).classList.add('active');
        
        // Обновляем текст кнопки Next
        const nextButton = document.querySelector('.btn-next');
        if (index === 2) {
            nextButton.textContent = i18n.t('get_started') || 'Get Started';
        } else {
            nextButton.textContent = i18n.t('next') || 'Next';
        }
    },
    
    // Пропустить онбординг
    skipOnboarding: function() {
        // Сохраняем, что онбординг был показан
        localStorage.setItem('flirtya_onboarding_shown', 'true');
        
        // Переходим к регистрации
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
    
    // Валидация шага регистрации
    validateRegistrationStep: function(step) {
        let isValid = true;
        
        // Проверка обязательных полей
        step.querySelectorAll('input[required], select[required]').forEach(field => {
            if (!field.value) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        // Специфичные проверки для разных шагов
        if (step.id === 'step-personal') {
            // Проверка возраста (18+)
            const birthdate = new Date(document.getElementById('birthdate').value);
            const age = this.calculateAge(birthdate);
            
            if (age < 18) {
                document.getElementById('birthdate').classList.add('error');
                alert(i18n.t('age_restriction'));
                isValid = false;
            }
        } else if (step.id === 'step-interests') {
            // Проверка выбора минимум 3 интересов
            const selectedInterests = document.querySelectorAll('.interest-tag.selected');
            if (selectedInterests.length < 3) {
                alert(i18n.t('select_interests'));
                isValid = false;
            }
        } else if (step.id === 'step-photos') {
            // Проверка загрузки хотя бы одного фото
            const hasPhoto = document.querySelector('.photo-preview img');
            if (!hasPhoto) {
                alert(i18n.t('photo_required'));
                isValid = false;
            }
        }
        
        return isValid;
    },
    
    // Расчет возраста
    calculateAge: function(birthdate) {
        const today = new Date();
        let age = today.getFullYear() - birthdate.getFullYear();
        const month = today.getMonth() - birthdate.getMonth();
        
        if (month < 0 || (month === 0 && today.getDate() < birthdate.getDate())) {
            age--;
        }
        
        return age;
    },
    
    // Переключение интереса
    toggleInterest: function(event) {
        const tag = event.target;
        tag.classList.toggle('selected');
        
        // Обновляем скрытое поле с выбранными интересами
        const selectedInterests = [];
        document.querySelectorAll('.interest-tag.selected').forEach(tag => {
            selectedInterests.push(tag.textContent);
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
        }
    },
    
    // Обработка отправки формы регистрации
    handleRegistration: function(event) {
        event.preventDefault();
        
        // Проверка согласия с условиями
        const termsAgreed = document.getElementById('terms-agree').checked;
        if (!termsAgreed) {
            alert(i18n.t('terms_agree_required'));
            return;
        }
        
        // Сбор данных формы
        const name = document.getElementById('name').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const birthdate = document.getElementById('birthdate').value;
        const country = document.getElementById('country').value;
        const city = document.getElementById('city').value;
        const goal = document.getElementById('goal').value;
        const interests = JSON.parse(document.getElementById('interests').value || '[]');
        
        // Сбор загруженных фото
        const photos = [];
        document.querySelectorAll('.photo-preview img').forEach(img => {
            photos.push(img.src);
        });
        
        // Создание объекта пользователя
        this.user = {
            id: this.tg?.initDataUnsafe?.user?.id || Date.now().toString(),
            name,
            gender,
            birthdate,
            country,
            city,
            goal,
            interests,
            photos,
            registrationDate: new Date().toISOString(),
            isVip: false,
            isVipPlus: false,
            superlikesLeft: 3
        };
        
        // Сохранение пользователя в localStorage
        localStorage.setItem('flirtya_user', JSON.stringify(this.user));
        
        // Отправка данных на сервер
        fetch('/api/profile/' + this.user.id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.user)
        })
        .catch(error => {
            console.error('Error saving profile:', error);
        });
        
        // Отправка данных в Telegram
        if (this.tg) {
            this.tg.sendData(JSON.stringify({
                action: 'registration_complete',
                userId: this.user.id
            }));
        }
        
        // Переход в основное приложение
        this.showScreen('main-app');
        this.loadUserData();
    },
    
    // Загрузка данных пользователя
    loadUserData: function() {
        if (!this.user) return;
        
        // Обновляем отображение профиля
        document.getElementById('profile-name').textContent = `${this.user.name}, ${this.calculateAge(new Date(this.user.birthdate))}`;
        document.getElementById('profile-location').textContent = `${this.user.city}, ${this.user.country}`;
        document.getElementById('profile-goal').textContent = i18n.t(`goal_${this.user.goal}`) || this.user.goal;
        
        // Обновляем интересы
        const interestsContainer = document.getElementById('profile-interests');
        interestsContainer.innerHTML = '';
        this.user.interests.forEach(interest => {
            const interestTag = document.createElement('div');
            interestTag.className = 'interest-badge';
            interestTag.textContent = interest;
            interestsContainer.appendChild(interestTag);
        });
        
        // Обновляем фото
        if (this.user.photos && this.user.photos.length > 0) {
            document.getElementById('profile-photo').src = this.user.photos[0];
            document.getElementById('user-avatar').src = this.user.photos[0];
        }
        
        // Обновляем значки
        const badgesContainer = document.getElementById('profile-badges');
        badgesContainer.innerHTML = '';
        
        if (this.user.isVipPlus) {
            const vipPlusBadge = document.createElement('div');
            vipPlusBadge.className = 'badge vip-plus';
            vipPlusBadge.textContent = 'VIP+';
            badgesContainer.appendChild(vipPlusBadge);
        } else if (this.user.isVip) {
            const vipBadge = document.createElement('div');
            vipBadge.className = 'badge vip';
            vipBadge.textContent = 'VIP';
            badgesContainer.appendChild(vipBadge);
        }
        
        // Обновляем счетчик суперлайков
        document.querySelector('.superlike-count').textContent = this.user.isVip || this.user.isVipPlus ? '∞' : this.user.superlikesLeft;
    },
    
    // Обработка навигации
    handleNavigation: function(event) {
        const item = event.currentTarget;
        const pageId = item.getAttribute('data-page');
        
        this.showPage(pageId);
    },
    
    // Показать определенную страницу
    showPage: function(pageId) {
        // Скрываем текущую страницу
        document.querySelector('.page.active')?.classList.remove('active');
        
        // Показываем новую страницу
        document.getElementById(pageId)?.classList.add('active');
        
        // Обновляем активный элемент в навигации
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-page') === pageId);
        });
        
        // Обновляем текущую страницу
        this.currentPage = pageId;
        
        // Дополнительные действия при переключении страницы
        if (pageId === 'swipes-page') {
            // Загружаем совпадения, если еще не загружены
            if (!this.currentCard) {
                this.loadMatches();
            }
        }
    },
    
    // Загрузка потенциальных совпадений
    loadMatches: function() {
        // Запрос на сервер
        fetch('/api/matches/' + this.user.id)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.matches && data.matches.length > 0) {
                    this.matches = data.matches;
                    this.showNextCard();
                } else {
                    // Показываем сообщение, если нет совпадений
                    document.querySelector('.no-cards-message').classList.remove('hidden');
                }
            })
            .catch(error => {
                console.error('Error loading matches:', error);
                // В случае ошибки используем демо-данные
                this.loadDemoMatches();
            });
    },
    
    // Загрузка демо-данных
    loadDemoMatches: function() {
        // Генерация демо-данных
        const names = ['Алексей', 'Мария', 'Иван', 'Елена', 'Дмитрий', 'Анна', 'Сергей', 'Ольга'];
        const cities = ['Москва', 'Санкт-Петербург', 'Киев', 'Минск', 'Алматы', 'Ташкент', 'Баку', 'Тбилиси'];
        const interests = ['Музыка', 'Кино', 'Спорт', 'Путешествия', 'Кулинария', 'Чтение', 'Танцы', 'Технологии'];
        
        this.matches = [];
        
        for (let i = 0; i < 10; i++) {
            const gender = this.user.gender === 'male' ? 'female' : 'male';
            const age = Math.floor(Math.random() * 15) + 20; // От 20 до 35 лет
            
            const userInterests = [];
            const interestCount = Math.floor(Math.random() * 3) + 2; // От 2 до 4 интересов
            for (let j = 0; j < interestCount; j++) {
                const interest = interests[Math.floor(Math.random() * interests.length)];
                if (!userInterests.includes(interest)) {
                    userInterests.push(interest);
                }
            }
            
            this.matches.push({
                id: `demo_${i}`,
                name: names[i % names.length],
                age,
                city: cities[i % cities.length],
                interests: userInterests,
                photos: [`assets/images/demo_${(i % 5) + 1}.jpg`],
                isOnline: Math.random() > 0.5
            });
        }
        
        this.showNextCard();
    },
    
    // Показать следующую карточку
    showNextCard: function() {
        const cardsContainer = document.querySelector('.cards-container');
        
        // Если карточек не осталось, показываем сообщение
        if (this.matches.length === 0) {
            cardsContainer.innerHTML = '';
            document.querySelector('.no-cards-message').classList.remove('hidden');
            return;
        }
        
        document.querySelector('.no-cards-message').classList.add('hidden');
        
        // Берем первый профиль из массива
        this.currentCard = this.matches[0];
        
        // Создаем карточку
        const card = document.createElement('div');
        card.className = 'card';
        card.id = `card-${this.currentCard.id}`;
        
        // Добавляем фото
        const photoDiv = document.createElement('div');
        photoDiv.className = 'card-photo';
        photoDiv.style.backgroundImage = `url('${this.currentCard.photos[0]}')`;
        
        // Добавляем информацию о профиле
        const infoDiv = document.createElement('div');
        infoDiv.className = 'card-info';
        
        const nameAge = document.createElement('h3');
        nameAge.className = 'name-age';
        nameAge.textContent = `${this.currentCard.name}, ${this.currentCard.age}`;
        
        const location = document.createElement('p');
        location.className = 'location';
        location.textContent = this.currentCard.city;
        
        const interestsDiv = document.createElement('div');
        interestsDiv.className = 'card-interests';
        this.currentCard.interests.forEach(interest => {
            const interestTag = document.createElement('span');
            interestTag.className = 'interest-badge';
            interestTag.textContent = interest;
            interestsDiv.appendChild(interestTag);
        });
        
        // Собираем все вместе
        infoDiv.appendChild(nameAge);
        infoDiv.appendChild(location);
        infoDiv.appendChild(interestsDiv);
        
        card.appendChild(photoDiv);
        card.appendChild(infoDiv);
        
        // Добавляем карточку в контейнер
        cardsContainer.innerHTML = '';
        cardsContainer.appendChild(card);
        
        // Настраиваем свайп
        this.setupCardSwipe(card);
    },
    
    // Настройка свайпа карточки
    setupCardSwipe: function(card) {
        let startX = 0;
        let startY = 0;
        
        card.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        card.addEventListener('touchmove', e => {
            if (!startX || !startY) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = currentX - startX;
            const diffY = currentY - startY;
            
            const rotate = diffX * 0.1;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                card.style.transform = `translateX(${diffX}px) rotate(${rotate}deg)`;
                
                if (diffX > 50) {
                    card.classList.add('like');
                    card.classList.remove('dislike');
                    card.classList.remove('superlike');
                } else if (diffX < -50) {
                    card.classList.add('dislike');
                    card.classList.remove('like');
                    card.classList.remove('superlike');
                } else {
                    card.classList.remove('like');
                    card.classList.remove('dislike');
                    card.classList.remove('superlike');
                }
            } else if (diffY < -50) {
                card.style.transform = `translateY(${diffY}px)`;
                card.classList.add('superlike');
                card.classList.remove('like');​​​​​​​​​​​​​​​​

          card.classList.remove('dislike');
            }
        });
        
        card.addEventListener('touchend', e => {
            const currentX = e.changedTouches[0].clientX;
            const currentY = e.changedTouches[0].clientY;
            const diffX = currentX - startX;
            const diffY = currentY - startY;
            
            if (diffX > 100) {
                this.handleSwipe('like');
            } else if (diffX < -100) {
                this.handleSwipe('dislike');
            } else if (diffY < -100) {
                this.handleSwipe('superlike');
            } else {
                card.style.transform = '';
                card.classList.remove('like');
                card.classList.remove('dislike');
                card.classList.remove('superlike');
            }
            
            startX = 0;
            startY = 0;
        });
    },
    
    // Обработка свайпа
    handleSwipe: function(type) {
        if (!this.currentCard) return;
        
        const card = document.getElementById(`card-${this.currentCard.id}`);
        if (!card) return;
        
        switch (type) {
            case 'like':
                card.classList.add('like');
                card.style.transform = 'translateX(1000px) rotate(30deg)';
                this.processSwipeResult('like');
                break;
                
            case 'dislike':
                card.classList.add('dislike');
                card.style.transform = 'translateX(-1000px) rotate(-30deg)';
                this.processSwipeResult('dislike');
                break;
                
            case 'superlike':
                // Проверяем, доступны ли суперлайки
                if (this.user.superlikesLeft <= 0 && !this.user.isVip && !this.user.isVipPlus) {
                    this.showSuperlikeModal();
                    return;
                }
                
                card.classList.add('superlike');
                card.style.transform = 'translateY(-1000px)';
                this.processSwipeResult('superlike');
                
                // Уменьшаем количество доступных суперлайков
                if (!this.user.isVip && !this.user.isVipPlus) {
                    this.user.superlikesLeft--;
                    localStorage.setItem('flirtya_user', JSON.stringify(this.user));
                    document.querySelector('.superlike-count').textContent = this.user.superlikesLeft;
                }
                break;
        }
    },
    
    // Обработка результата свайпа
    processSwipeResult: function(type) {
        setTimeout(() => {
            const swipedCard = this.matches.shift();
            
            // В реальном приложении здесь будет запрос на сервер
            this.saveSwipeResult(swipedCard.id, type);
            
            // Проверка на совпадение (для демо - случайно)
            if ((type === 'like' || type === 'superlike') && Math.random() > 0.7) {
                this.createMatch(swipedCard);
            }
            
            // Показываем следующую карточку
            this.showNextCard();
        }, 300);
    },
    
    // Сохранение результата свайпа
    saveSwipeResult: function(targetId, type) {
        // В реальном приложении здесь будет запрос на сервер
        if (!this.user.swipes) {
            this.user.swipes = [];
        }
        
        this.user.swipes.push({
            targetId,
            type,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('flirtya_user', JSON.stringify(this.user));
    },
    
    // Создание совпадения (матча)
    createMatch: function(matchedUser) {
        // В реальном приложении здесь будет запрос на сервер
        
        // Создаем чат
        if (!this.chats) {
            this.chats = [];
        }
        
        const chatId = `chat_${Date.now()}`;
        const chat = {
            id: chatId,
            userId: matchedUser.id,
            userName: matchedUser.name,
            userPhoto: matchedUser.photos[0],
            userAge: matchedUser.age,
            userCity: matchedUser.city,
            messages: [],
            lastActivity: new Date().toISOString(),
            unread: 0
        };
        
        this.chats.unshift(chat);
        localStorage.setItem('flirtya_chats', JSON.stringify(this.chats));
        
        // Обновляем счетчик непрочитанных чатов
        this.updateChatsBadge();
        
        // Показываем модальное окно совпадения
        this.showMatchModal(matchedUser);
    },
    
    // Показать модальное окно совпадения
    showMatchModal: function(matchedUser) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content match-modal">
                <h3>${i18n.t('its_a_match')}</h3>
                <p>${i18n.t('match_text').replace('{name}', matchedUser.name)}</p>
                <div class="modal-buttons">
                    <button class="btn-chat">${i18n.t('chat_now')}</button>
                    <button class="btn-continue">${i18n.t('continue_swiping')}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Настраиваем обработчики
        modal.querySelector('.btn-chat').addEventListener('click', () => {
            document.body.removeChild(modal);
            
            // Открываем чат с этим пользователем
            const chat = this.chats.find(c => c.userId === matchedUser.id);
            if (chat) {
                this.openChat(chat);
            }
        });
        
        modal.querySelector('.btn-continue').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    },
    
    // Показать модальное окно для покупки суперлайков
    showSuperlikeModal: function() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${i18n.t('out_of_superlikes')}</h3>
                <p>${i18n.t('superlike_modal_text')}</p>
                <div class="modal-buttons">
                    <button class="btn-buy-superlikes">${i18n.t('buy_superlikes')}</button>
                    <button class="btn-get-vip">${i18n.t('get_vip')}</button>
                    <button class="btn-close">${i18n.t('close')}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Настраиваем обработчики
        modal.querySelector('.btn-buy-superlikes').addEventListener('click', () => {
            document.body.removeChild(modal);
            // Открываем окно покупки суперлайков
            payment.handleItemPurchase({
                currentTarget: {
                    getAttribute: (attr) => attr === 'data-item' ? 'superlikes' : (attr === 'data-price' ? '2.99' : '5')
                }
            });
        });
        
        modal.querySelector('.btn-get-vip').addEventListener('click', () => {
            document.body.removeChild(modal);
            // Переходим на страницу VIP
            this.showPage('vip-page');
        });
        
        modal.querySelector('.btn-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
      }, 100); // Задержка 100мс  
    },
    
    // Загрузка чатов
    loadChats: function() {
        // В реальном приложении здесь будет запрос на сервер
        const savedChats = localStorage.getItem('flirtya_chats');
        if (savedChats) {
            this.chats = JSON.parse(savedChats);
            this.updateChatsList();
            this.updateChatsBadge();
        }
    },
    
    // Обновление списка чатов
    updateChatsList: function() {
        const chatsListContainer = document.querySelector('.chats-list');
        
        if (!this.chats || this.chats.length === 0) {
            chatsListContainer.innerHTML = `
                <div class="no-chats-message">${i18n.t('no_chats')}</div>
            `;
            return;
        }
        
        chatsListContainer.innerHTML = '';
        
        this.chats.forEach(chat => {
            const lastMessage = chat.messages && chat.messages.length > 0 ? 
                chat.messages[chat.messages.length - 1] : null;
            
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.setAttribute('data-chat-id', chat.id);
            
            chatItem.innerHTML = `
                <div class="chat-avatar">
                    <img src="${chat.userPhoto}" alt="${chat.userName}">
                </div>
                <div class="chat-info">
                    <div class="chat-name">${chat.userName}, ${chat.userAge}</div>
                    <div class="chat-preview${!lastMessage ? ' no-message' : ''}">
                        ${lastMessage ? lastMessage.text : i18n.t('new_match')}
                    </div>
                </div>
                <div class="chat-meta">
                    <div class="chat-time">
                        ${lastMessage ? this.formatTime(new Date(lastMessage.timestamp)) : this.formatTime(new Date(chat.lastActivity))}
                    </div>
                    ${chat.unread > 0 ? `<div class="unread-badge">${chat.unread}</div>` : ''}
                </div>
            `;
            
            chatItem.addEventListener('click', () => {
                this.openChat(chat);
            });
            
            chatsListContainer.appendChild(chatItem);
        });
    },
    
    // Обновление счетчика непрочитанных чатов
    updateChatsBadge: function() {
        if (!this.chats) return;
        
        const unreadCount = this.chats.reduce((sum, chat) => sum + (chat.unread || 0), 0);
        const badge = document.getElementById('chats-badge');
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    },
    
    // Открытие чата
    openChat: function(chat) {
        this.currentChat = chat;
        
        // Обновляем информацию о пользователе в шапке чата
        document.getElementById('chat-user-name').textContent = chat.userName;
        document.getElementById('chat-user-avatar').src = chat.userPhoto;
        
        // Обновляем статус пользователя (для демо - случайно)
        document.getElementById('chat-user-status').textContent = Math.random() > 0.5 ? 
            i18n.t('online') : i18n.t('offline');
        
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
        
        if (!this.currentChat.messages || this.currentChat.messages.length === 0) {
            // Если сообщений нет, показываем приветствие и подсказки
            messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <p>${i18n.t('chat_welcome_text').replace('{name}', this.currentChat.userName)}</p>
                </div>
                <div class="icebreakers">
                    <h4>${i18n.t('icebreakers')}</h4>
                    <div class="icebreaker" data-text="${i18n.t('icebreaker_1')}">${i18n.t('icebreaker_1')}</div>
                    <div class="icebreaker" data-text="${i18n.t('icebreaker_2').replace('[interest]', this.currentChat.interests ? this.currentChat.interests[0] : 'music')}">${i18n.t('icebreaker_2').replace('[interest]', this.currentChat.interests ? this.currentChat.interests[0] : 'music')}</div>
                    <div class="icebreaker" data-text="${i18n.t('icebreaker_3')}">${i18n.t('icebreaker_3')}</div>
                </div>
            `;
            
            // Добавляем обработчики для подсказок
            document.querySelectorAll('.icebreaker').forEach(icebreaker => {
                icebreaker.addEventListener('click', () => {
                    const text = icebreaker.getAttribute('data-text');
                    this.sendMessage(text);
                });
            });
            
            return;
        }
        
        // Отображаем сообщения
        let lastDate = null;
        
        this.currentChat.messages.forEach(message => {
            const messageDate = new Date(message.timestamp);
            const messageDay = messageDate.toDateString();
            
            // Добавляем разделитель даты, если это новый день
            if (lastDate !== messageDay) {
                messagesContainer.appendChild(this.createDateSeparator(messageDate));
                lastDate = messageDay;
            }
            
            // Создаем элемент сообщения
            messagesContainer.appendChild(this.createMessageElement(message));
        });
        
        // Прокручиваем к последнему сообщению
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    // Создание разделителя даты
    createDateSeparator: function(date) {
        const separator = document.createElement('div');
        separator.className = 'date-separator';
        
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            separator.textContent = i18n.t('today');
        } else if (date.toDateString() === yesterday.toDateString()) {
            separator.textContent = i18n.t('yesterday');
        } else {
            separator.textContent = date.toLocaleDateString();
        }
        
        return separator;
    },
    
    // Создание элемента сообщения
    createMessageElement: function(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender === 'user' ? 'outgoing' : 'incoming'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('p');
        messageText.className = 'message-text';
        messageText.textContent = message.text;
        
        const messageTime = document.createElement('span');
        messageTime.className = 'message-time';
        messageTime.textContent = this.formatTime(new Date(message.timestamp));
        
        messageContent.appendChild(messageText);
        messageContent.appendChild(messageTime);
        
        // Добавляем статус прочтения для исходящих сообщений
        if (message.sender === 'user') {
            const messageStatus = document.createElement('span');
            messageStatus.className = `message-status ${message.read ? 'read' : ''}`;
            messageStatus.textContent = message.read ? '✓✓' : '✓';
            messageContent.appendChild(messageStatus);
        }
        
        messageDiv.appendChild(messageContent);
        return messageDiv;
    },
    
    // Форматирование времени
    formatTime: function(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    // Отправка сообщения
    sendMessage: function(text) {
        if (!this.currentChat) return;
        
        // Если текст не передан, получаем его из поля ввода
        if (!text) {
            const input = document.getElementById('message-input');
            text = input.value.trim();
            
            if (!text) return;
            
            // Очищаем поле ввода
            input.value = '';
        }
        
        // Проверяем, может ли пользователь отправить первое сообщение
        if (!this.currentChat.messages || this.currentChat.messages.length === 0) {
            // Женщины и VIP могут отправлять первые сообщения
            if (this.user.gender !== 'female' && !this.user.isVip && !this.user.isVipPlus) {
                this.showVipRequiredModal();
                return;
            }
        }
        
        // Создаем сообщение
        const message = {
            id: Date.now().toString(),
            sender: 'user',
            text,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        // Добавляем сообщение в чат
        if (!this.currentChat.messages) {
            this.currentChat.messages = [];
        }
        
        this.currentChat.messages.push(message);
        this.currentChat.lastActivity = new Date().toISOString();
        
        // Сохраняем чаты
        localStorage.setItem('flirtya_chats', JSON.stringify(this.chats));
        
        // Обновляем отображение сообщений
        this.updateMessagesDisplay();
        
        // Имитируем ответ собеседника (для демо)
        this.simulateReply();
    },
    
    // Показать модальное окно о необходимости VIP
    showVipRequiredModal: function() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${i18n.t('vip_required')}</h3>
                <p>${i18n.t('vip_message_text')}</p>
                <div class="modal-buttons">
                    <button class="btn-get-vip">${i18n.t('get_vip')}</button>
                    <button class="btn-close">${i18n.t('close')}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Настраиваем обработчики
        modal.querySelector('.btn-get-vip').addEventListener('click', () => {
            document.body.removeChild(modal);
            // Закрываем чат и переходим на страницу VIP
            this.closeChat();
            this.showPage('vip-page');
        });
        
        modal.querySelector('.btn-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    },
    
    // Имитация ответа собеседника
    simulateReply: function() {
        // Показываем индикатор набора текста
        this.showTypingIndicator();
        
        // Через 2-5 секунд отправляем ответ
        setTimeout(() => {
            // Скрываем индикатор набора текста
            this.hideTypingIndicator();
            
            // Если чат уже закрыт, не отправляем ответ
            if (!this.currentChat) return;
            
            // Генерируем случайный ответ
            const replies = [
                'Привет! Как дела?',
                'Очень приятно познакомиться!',
                'Мне нравится твой профиль! Чем ты увлекаешься?',
                'Спасибо за сообщение! Чем занимаешься сегодня?',
                'Привет! Я заметил, что у нас есть общие интересы. Какой твой любимый?'
            ];
            
            const replyText = replies[Math.floor(Math.random() * replies.length)];
            
            // Создаем сообщение
            const message = {
                id: Date.now().toString(),
                sender: 'match',
                text: replyText,
                timestamp: new Date().toISOString(),
                read: true
            };
            
            // Добавляем сообщение в чат
            this.currentChat.messages.push(message);
            this.currentChat.lastActivity = new Date().toISOString();
            
            // Сохраняем чаты
            localStorage.setItem('flirtya_chats', JSON.stringify(this.chats));
            
            // Обновляем отображение сообщений
            this.updateMessagesDisplay();
        }, 2000 + Math.random() * 3000);
    },
    
    // Показать индикатор набора текста
    showTypingIndicator: function() {
        const messagesContainer = document.getElementById('messages-container');
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message incoming typing';
        typingDiv.id = 'typing-indicator';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'message-content';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingIndicator.appendChild(dot);
        }
        
        typingContent.appendChild(typingIndicator);
        typingDiv.appendChild(typingContent);
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    // Скрыть индикатор набора текста
    hideTypingIndicator: function() {
        document.getElementById('typing-indicator')?.remove();
    },
    
    // Отметить чат как прочитанный
    markChatAsRead: function(chatId) {
        const chatIndex = this.chats.findIndex(chat => chat.id === chatId);
        
        if (chatIndex >= 0) {
            this.chats[chatIndex].unread = 0;
            localStorage.setItem('flirtya_chats', JSON.stringify(this.chats));
            this.updateChatsBadge();
        }
    },
    
    // Закрытие чата
    closeChat: function() {
        this.currentChat = null;
        this.showScreen('main-app');
    },
    
    // Обновление статуса VIP
    updateVipStatus: function(productId) {
        if (productId === 'vip_monthly') {
            this.user.isVip = true;
            this.user.isVipPlus = false;
            this.user.vipExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        } else if (productId === 'vip_plus_monthly') {
            this.user.isVip = true;
            this.user.isVipPlus = true;
            this.user.vipExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        } else if (productId === 'superlikes') {
            this.user.superlikesLeft += 5;
        }
        
        // Сохраняем данные пользователя
        localStorage.setItem('flirtya_user', JSON.stringify(this.user));
        
        // Обновляем отображение
        document.querySelector('.superlike-count').textContent = this.user.isVip || this.user.isVipPlus ? '∞' : this.user.superlikesLeft;
        
        // Обновляем профиль
        this.loadUserData();
    },
    
    // Редактирование профиля
    editProfile: function() {
        // Показываем модальное окно (для демо)
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${i18n.t('edit_profile')}</h3>
                <p>${i18n.t('edit_profile_not_available')}</p>
                <div class="modal-buttons">
                    <button class="btn-close">${i18n.t('close')}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.btn-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    },
    
    // Обработка выхода
    handleLogout: function() {
        // Показываем модальное окно подтверждения
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${i18n.t('logout')}</h3>
                <p>${i18n.t('logout_confirmation')}</p>
                <div class="modal-buttons">
                    <button class="btn-confirm">${i18n.t('yes_logout')}</button>
                    <button class="btn-cancel">${i18n.t('cancel')}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Настраиваем обработчики
        modal.querySelector('.btn-confirm').addEventListener('click', () => {
            // Удаляем данные сессии
            localStorage.removeItem('flirtya_user');
            
            // Перезагружаем приложение
            location.reload();
        });
        
        modal.querySelector('.btn-cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    },
    
    // Получение ID пользователя
    getUserId: function() {
        return this.user?.id || (this.tg?.initDataUnsafe?.user?.id ? this.tg.initDataUnsafe.user.id.toString() : '');
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Запускаем приложение
    app.init();
});
