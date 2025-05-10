// Файл для мультиязычности
const i18n = {
    // Доступные языки
    langs: ['en', 'ru'],
    
    // Текущий язык
    currentLang: 'en',
    
    // Переводы
    translations: {
        en: {
            // Онбординг
            onboarding_welcome: "Welcome to Flirtya",
            onboarding_subtitle: "Find your perfect match right here in Telegram",
            onboarding_swipe: "Swipe & Match",
            onboarding_swipe_text: "Find people who share your interests",
            onboarding_chat: "Chat & Connect",
            onboarding_chat_text: "Start meaningful conversations",
            next: "Next",
            skip: "Skip",
            
            // Регистрация
            create_account: "Create Account",
            name: "Name",
            email: "Email",
            password: "Password",
            birth_date: "Birth Date",
            gender: "Gender",
            male: "Male",
            female: "Female",
            country: "Country",
            city: "City",
            goal: "Goal",
            goal_love: "Love",
            goal_friendship: "Friendship",
            goal_chat: "Chat",
            interests: "Interests",
            select_interests: "Select at least 3 interests",
            add_photos: "Add Photos",
            add_photo: "Add Photo",
            terms_agree: "I agree to the Terms of Use",
            view_terms: "View Terms",
            register: "Register",
            back: "Back",
            
            // Свайпы
            no_more_people: "No more people nearby. Try again later!",
            
            // Чаты
            no_chats: "No matches yet. Start swiping to find matches!",
            
            // VIP
            upgrade_experience: "Upgrade Your Experience",
            vip_description: "Get access to premium features and boost your chances",
            per_month: "/month",
            vip_feature_1: "VIP badge",
            vip_feature_2: "Send messages first",
            vip_feature_3: "Unlimited likes",
            vip_feature_4: "3 Superlikes daily",
            vip_feature_5: "Extended filters",
            vip_feature_6: "Daily boost",
            vip_feature_7: "No ads",
            vip_plus_feature_1: "All VIP features",
            vip_plus_feature_2: "Priority visibility",
            vip_plus_feature_3: "Gifts, Stories, Read status",
            vip_plus_feature_4: "See who liked you",
            vip_plus_feature_5: "Anonymous mode",
            vip_plus_feature_6: "Gift VIP to others",
            get_vip: "Get VIP",
            get_vip_plus: "Get VIP+",
            other_purchases: "Other Purchases",
            superlikes: "Superlikes",
            superlikes_description: "Stand out and get noticed",
            boost: "Boost",
            boost_description: "Get more visibility for 1 hour",
            
            // Профиль
            edit_profile: "Edit Profile",
            settings: "Settings",
            logout: "Logout",
            
            // Навигация
            swipes: "Swipes",
            chats: "Chats",
            vip: "VIP",
            profile: "Profile",
            
            // Модальные окна
            purchase_confirmation: "Purchase Confirmation",
            confirm_purchase: "Would you like to purchase",
            for_price: "for",
            confirm: "Confirm",
            cancel: "Cancel",
            processing_payment: "Processing payment...",
            purchase_successful: "Purchase Successful",
            vip_activated: "VIP status has been activated on your account!",
            vip_plus_activated: "VIP+ status has been activated on your account!",
            close: "Close",
            
            // Ошибки
            error_occurred: "An error occurred. Please try again.",
            age_restriction: "You must be at least 18 years old to register."
        },
        ru: {
            // Онбординг
            onboarding_welcome: "Добро пожаловать в Flirtya",
            onboarding_subtitle: "Найдите свою идеальную пару прямо в Telegram",
            onboarding_swipe: "Свайп и совпадения",
            onboarding_swipe_text: "Найдите людей, которые разделяют ваши интересы",
            onboarding_chat: "Общайтесь и знакомьтесь",
            onboarding_chat_text: "Начните интересные беседы",
            next: "Далее",
            skip: "Пропустить",
            
            // Регистрация
            create_account: "Создать аккаунт",
            name: "Имя",
            email: "Email",
            password: "Пароль",
            birth_date: "Дата рождения",
            gender: "Пол",
            male: "Мужской",
            female: "Женский",
            country: "Страна",
            city: "Город",
            goal: "Цель",
            goal_love: "Любовь",
            goal_friendship: "Дружба",
            goal_chat: "Общение",
            interests: "Интересы",
            select_interests: "Выберите минимум 3 интереса",
            add_photos: "Добавьте фото",
            add_photo: "Добавить фото",
            terms_agree: "Я согласен с Условиями использования",
            view_terms: "Просмотреть условия",
            register: "Зарегистрироваться",
            back: "Назад",
            
            // Свайпы
            no_more_people: "Больше нет людей поблизости. Попробуйте позже!",
            
            // Чаты
            no_chats: "Пока нет совпадений. Начните свайпать, чтобы найти совпадения!",
            
            // VIP
            upgrade_experience: "Улучшите свой опыт",
            vip_description: "Получите доступ к премиум-функциям и повысьте свои шансы",
            per_month: "/месяц",
            vip_feature_1: "Значок VIP",
            vip_feature_2: "Отправка сообщений первым",
            vip_feature_3: "Безлимитные лайки",
            vip_feature_4: "3 суперлайка ежедневно",
            vip_feature_5: "Расширенные фильтры",
            vip_feature_6: "Ежедневный буст",
            vip_feature_7: "Без рекламы",
            vip_plus_feature_1: "Все функции VIP",
            vip_plus_feature_2: "Приоритетная видимость",
            vip_plus_feature_3: "Подарки, Истории, статус прочтения",
            vip_plus_feature_4: "Видно, кто лайкнул вас",
            vip_plus_feature_5: "Анонимный режим",
            vip_plus_feature_6: "Дарить VIP другим",
            get_vip: "Получить VIP",
            get_vip_plus: "Получить VIP+",
            other_purchases: "Другие покупки",
            superlikes: "Суперлайки",
            superlikes_description: "Выделитесь и будьте замечены",
            boost: "Буст",
            boost_description: "Получите больше видимости на 1 час",
            
            // Профиль
            edit_profile: "Редактировать профиль",
            settings: "Настройки",
            logout: "Выйти",
            
            // Навигация
            swipes: "Свайпы",
            chats: "Чаты",
            vip: "VIP",
            profile: "Профиль",
            
            // Модальные окна
            purchase_confirmation: "Подтверждение покупки",
            confirm_purchase: "Вы хотите приобрести",
            for_price: "за",
            confirm: "Подтвердить",
            cancel: "Отмена",
            processing_payment: "Обработка платежа...",
            purchase_successful: "Покупка успешна",
            vip_activated: "VIP статус был активирован на вашем аккаунте!",
            vip_plus_activated: "VIP+ статус был активирован на вашем аккаунте!",
            close: "Закрыть",
            
            // Ошибки
            error_occurred: "Произошла ошибка. Пожалуйста, попробуйте снова.",
            age_restriction: "Вам должно быть не менее 18 лет для регистрации."
        }
    },
    
    // Инициализация языка
    init: function() {
        // Определение языка пользователя
        const tg = window.Telegram?.WebApp;
        if (tg && tg.initDataUnsafe?.user?.language_code) {
            const userLang = tg.initDataUnsafe.user.language_code;
            // Проверяем, поддерживается ли язык пользователя
            if (userLang === 'ru') {
                this.currentLang = 'ru';
            }
        }
        
        // Применение переводов
        this.applyTranslations();
    },
    
    // Изменение языка
    setLanguage: function(lang) {
        if (this.langs.includes(lang)) {
            this.currentLang = lang;
            this.applyTranslations();
            // Сохраняем выбранный язык
            localStorage.setItem('flirtya_lang', lang);
        }
    },
    
    // Получение перевода по ключу
    t: function(key) {
        return this.translations[this.currentLang][key] || this.translations['en'][key] || key;
    },
    
    // Применение переводов ко всем элементам с атрибутом data-i18n
    applyTranslations: function() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    i18n.init();
});
```

### public/js/payment.js
```javascript
// Файл для интеграции с CryptoCloud

const payment = {
    // Токен приложения (будет заменен на реальный на сервере)
    shop_id: 'SHOP_ID_PLACEHOLDER',
    
    // Инициализация
    init: function() {
        // Настройка обработчиков для кнопок покупки
        document.querySelectorAll('.btn-buy').forEach(button => {
            button.addEventListener('click', this.handleVipPurchase.bind(this));
        });
        
        document.querySelectorAll('.btn-buy-item').forEach(button => {
            button.addEventListener('click', this.handleItemPurchase.bind(this));
        });
        
        // Проверка статуса платежа, если вернулись после оплаты
        this.checkPaymentStatus();
    },
    
    // Обработка покупки VIP
    handleVipPurchase: function(event) {
        const button = event.currentTarget;
        const plan = button.getAttribute('data-plan');
        const price = button.getAttribute('data-price');
        
        this.createPayment(plan, price);
    },
    
    // Обработка покупки отдельных товаров
    handleItemPurchase: function(event) {
        const button = event.currentTarget;
        const item = button.getAttribute('data-item');
        const price = button.getAttribute('data-price');
        const quantity = button.getAttribute('data-quantity') || 1;
        
        this.createPayment(item, price, quantity);
    },
    
    // Создание платежа
    createPayment: function(productId, amount, quantity = 1) {
        // Показываем модальное окно подтверждения
        this.showConfirmationModal(productId, amount, quantity);
    },
    
    // Показать модальное окно подтверждения
    showConfirmationModal: function(productId, amount, quantity) {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        // Определяем название товара
        let productName = '';
        if (productId === 'vip_monthly') {
            productName = 'VIP (' + i18n.t('per_month').replace('/', '') + ')';
        } else if (productId === 'vip_plus_monthly') {
            productName = 'VIP+ (' + i18n.t('per_month').replace('/', '') + ')';
        } else if (productId === 'superlikes') {
            productName = quantity + ' ' + i18n.t('superlikes');
        } else if (productId === 'boost') {
            productName = i18n.t('boost');
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${i18n.t('purchase_confirmation')}</h3>
                <p>${i18n.t('confirm_purchase')} ${productName} ${i18n.t('for_price')} $${amount}?</p>
                <div class="modal-buttons">
                    <button class="btn-confirm" data-product="${productId}" data-amount="${amount}">${i18n.t('confirm')}</button>
                    <button class="btn-cancel">${i18n.t('cancel')}</button>
                </div>
            </div>
        `;
        
        // Добавляем модальное окно на страницу
        document.body.appendChild(modal);
        
        // Настраиваем обработчики
        modal.querySelector('.btn-confirm').addEventListener('click', () => {
            // Обновляем содержимое модального окна
            modal.querySelector('.modal-content').innerHTML = `
                <h3>${i18n.t('processing_payment')}</h3>
                <p>${i18n.t('processing_payment')}</p>
            `;
            
            // Отправляем запрос на создание платежа
            fetch('/api/payment/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: app.getUserId(),
                    productId: productId,
                    amount: parseFloat(amount),
                    currency: 'USD'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.payment && data.payment.pay_url) {
                    // Сохраняем данные платежа
                    localStorage.setItem('flirtya_payment', JSON.stringify({
                        id: data.payment.id,
                        productId: productId,
                        amount: amount
                    }));
