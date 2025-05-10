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

// Переходим на страницу оплаты
                    window.location.href = data.payment.pay_url;
                } else {
                    // Показываем ошибку
                    modal.querySelector('.modal-content').innerHTML = `
                        <h3>${i18n.t('error_occurred')}</h3>
                        <p>${data.error || i18n.t('error_occurred')}</p>
                        <div class="modal-buttons">
                            <button class="btn-close">${i18n.t('close')}</button>
                        </div>
                    `;
                    
                    modal.querySelector('.btn-close').addEventListener('click', () => {
                        document.body.removeChild(modal);
                    });
                }
            })
            .catch(error => {
                console.error('Payment error:', error);
                // Показываем ошибку
                modal.querySelector('.modal-content').innerHTML = `
                    <h3>${i18n.t('error_occurred')}</h3>
                    <p>${i18n.t('error_occurred')}</p>
                    <div class="modal-buttons">
                        <button class="btn-close">${i18n.t('close')}</button>
                    </div>
                `;
                
                modal.querySelector('.btn-close').addEventListener('click', () => {
                    document.body.removeChild(modal);
                });
            });
        });
        
        modal.querySelector('.btn-cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    },
    
    // Проверка статуса платежа
    checkPaymentStatus: function() {
        // Получаем параметры URL
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        const productId = urlParams.get('product');
        
        if (status && productId) {
            // Удаляем параметры из URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Обрабатываем успешный платеж
            if (status === 'success') {
                // Получаем сохраненные данные платежа
                const paymentData = JSON.parse(localStorage.getItem('flirtya_payment') || '{}');
                
                // Показываем сообщение об успешной покупке
                const modal = document.createElement('div');
                modal.className = 'modal';
                
                let successMessage = '';
                if (productId === 'vip_monthly') {
                    successMessage = i18n.t('vip_activated');
                } else if (productId === 'vip_plus_monthly') {
                    successMessage = i18n.t('vip_plus_activated');
                } else if (productId === 'superlikes') {
                    successMessage = i18n.t('superlikes_added');
                } else if (productId === 'boost') {
                    successMessage = i18n.t('boost_activated');
                }
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <h3>${i18n.t('purchase_successful')}</h3>
                        <p>${successMessage}</p>
                        <div class="modal-buttons">
                            <button class="btn-close">${i18n.t('close')}</button>
                        </div>
                    </div>
                `;
                
                // Добавляем модальное окно на страницу
                document.body.appendChild(modal);
                
                // Настраиваем обработчик
                modal.querySelector('.btn-close').addEventListener('click', () => {
                    document.body.removeChild(modal);
                    
                    // Обновляем интерфейс
                    app.updateVipStatus(productId);
                });
                
                // Очищаем сохраненные данные платежа
                localStorage.removeItem('flirtya_payment');
            } else if (status === 'fail') {
                // Показываем сообщение об ошибке
                const modal = document.createElement('div');
                modal.className = 'modal';
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <h3>${i18n.t('error_occurred')}</h3>
                        <p>${i18n.t('error_occurred')}</p>
                        <div class="modal-buttons">
                            <button class="btn-close">${i18n.t('close')}</button>
                        </div>
                    </div>
                `;
                
                // Добавляем модальное окно на страницу
                document.body.appendChild(modal);
                
                // Настраиваем обработчик
                modal.querySelector('.btn-close').addEventListener('click', () => {
                    document.body.removeChild(modal);
                });
                
                // Очищаем сохраненные данные платежа
                localStorage.removeItem('flirtya_payment');
            }
        }
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    payment.init();
});
