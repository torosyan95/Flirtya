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
    const self = this;
    
    // Добавляем обработчики сразу для уже существующих элементов
    const btnNext = document.querySelector('.btn-next');
    const btnSkip = document.querySelector('.btn-skip');
    
    if (btnNext) btnNext.addEventListener('click', this.handleNextOnboarding.bind(this));
    if (btnSkip) btnSkip.addEventListener('click', this.skipOnboarding.bind(this));
    
    // Добавляем обработчики для будущих элементов
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-next')) {
            e.preventDefault();
            self.handleNextOnboarding();
        }
        if (e.target.closest('.btn-skip')) {
            e.preventDefault();
            self.skipOnboarding();
        }
        if (e.target.closest('.btn-next-step')) {
            e.preventDefault();
            self.nextRegistrationStep(e);
        }
        if (e.target.closest('.btn-prev-step')) {
            e.preventDefault();
            self.prevRegistrationStep(e);
        }
        if (e.target.closest('.interest-tag')) {
            e.preventDefault();
            self.toggleInterest(e);
        }
        if (e.target.closest('.nav-item')) {
            e.preventDefault();
            self.handleNavigation(e);
        }
        if (e.target.closest('#like')) {
            e.preventDefault();
            self.handleSwipe('like');
        }
        if (e.target.closest('#dislike')) {
            e.preventDefault();
            self.handleSwipe('dislike');
        }
        if (e.target.closest('#superlike')) {
            e.preventDefault();
            self.handleSwipe('superlike');
        }
        if (e.target.closest('#btn-edit-profile')) {
            e.preventDefault();
            self.editProfile();
        }
        if (e.target.closest('#btn-settings')) {
            e.preventDefault();
            self.showPage('settings-page');
        }
        if (e.target.closest('#btn-logout')) {
            e.preventDefault();
            self.handleLogout();
        }
        if (e.target.closest('#chat-back')) {
            e.preventDefault();
            self.closeChat();
        }
        if (e.target.closest('#send-message')) {
            e.preventDefault();
            self.sendMessage();
        }
    });
    
    // Добавляем другие обработчики
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'registration-form') {
            e.preventDefault();
            self.handleRegistration(e);
        }
    });
    
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('photo-input')) {
            self.handlePhotoUpload(e);
        }
    });
    
    document.addEventListener('keypress', function(e) {
        if (e.target.id === 'message-input' && e.key === 'Enter') {
            e.preventDefault();
            self.sendMessage();
        }
    });
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

// Фиксируем кнопки принудительно
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Ждем немного и добавляем обработчики
    setTimeout(function() {
        const btnNext = document.querySelector('.btn-next');
        const btnSkip = document.querySelector('.btn-skip');
        
        if (btnNext) {
            btnNext.onclick = function() {
                console.log('Next clicked');
                if (window.app && window.app.handleNextOnboarding) {
                    window.app.handleNextOnboarding();
                }
            };
        }
        
        if (btnSkip) {
            btnSkip.onclick = function() {
                console.log('Skip clicked');
                if (window.app && window.app.skipOnboarding) {
                    window.app.skipOnboarding();
                }
            };
        }
    }, 1000);
});
