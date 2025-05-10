// Импорт необходимых модулей
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const paymentService = require('./services/payment');
const storageService = require('./services/storage');

// Инициализация Express приложения
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Инициализация бота
// Токен будет храниться в переменных окружения Vercel
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.first_name;
  
  // Сохраняем пользователя
  storageService.saveUser(userId, {
    chatId,
    name: userName,
    registrationDate: new Date()
  });
  
  // Отправляем приветственное сообщение с кнопкой для открытия WebApp
  bot.sendMessage(chatId, `Привет, ${userName}! Добро пожаловать в Flirtya - приложение для знакомств прямо в Telegram.`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Открыть Flirtya', web_app: { url: process.env.WEBAPP_URL } }]
      ]
    }
  });
});

// Обработка команды /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Flirtya - это приложение для знакомств. Используйте команду /start, чтобы открыть приложение.');
});

// Обработка команды /profile
bot.onText(/\/profile/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Получаем профиль пользователя
  const user = storageService.getUser(userId);
  
  if (user && user.profile) {
    let profileText = `👤 *Ваш профиль:*\n\n`;
    profileText += `Имя: ${user.profile.name}\n`;
    profileText += `Возраст: ${user.profile.age}\n`;
    profileText += `Город: ${user.profile.city}\n`;
    profileText += `Интересы: ${user.profile.interests.join(', ')}\n`;
    
    if (user.isVip) {
      profileText += `\n✨ *VIP статус активен*`;
    }
    
    bot.sendMessage(chatId, profileText, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Редактировать профиль', web_app: { url: `${process.env.WEBAPP_URL}?page=profile` } }],
          [{ text: 'Купить VIP', web_app: { url: `${process.env.WEBAPP_URL}?page=vip` } }]
        ]
      }
    });
  } else {
    bot.sendMessage(chatId, 'Вы еще не заполнили свой профиль. Сделайте это в приложении:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Открыть Flirtya', web_app: { url: process.env.WEBAPP_URL } }]
        ]
      }
    });
  }
});

// Обработка платежных уведомлений
app.post('/api/payment/callback', async (req, res) => {
  try {
    const { userId, productId, amount, currency, status } = req.body;
    
    if (status === 'successful') {
      // Обновляем статус пользователя
      storageService.updateUserPayment(userId, productId);
      
      // Отправляем уведомление пользователю
      const user = storageService.getUser(userId);
      if (user && user.chatId) {
        let message = '';
        
        if (productId === 'vip_monthly') {
          message = 'Поздравляем! VIP статус успешно активирован на вашем аккаунте!';
        } else if (productId === 'vip_plus_monthly') {
          message = 'Поздравляем! VIP+ статус успешно активирован на вашем аккаунте!';
        } else if (productId === 'superlikes') {
          message = 'Супер-лайки успешно добавлены на ваш аккаунт!';
        }
        
        bot.sendMessage(user.chatId, message);
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// API для получения данных профиля
app.get('/api/profile/:userId', (req, res) => {
  const userId = req.params.userId;
  const user = storageService.getUser(userId);
  
  if (user) {
    res.json({ success: true, profile: user.profile });
  } else {
    res.status(404).json({ success: false, error: 'User not found' });
  }
});

// API для обновления профиля
app.post('/api/profile/:userId', (req, res) => {
  const userId = req.params.userId;
  const profileData = req.body;
  
  storageService.updateUserProfile(userId, profileData);
  res.json({ success: true });
});

// API для получения потенциальных совпадений
app.get('/api/matches/:userId', (req, res) => {
  const userId = req.params.userId;
  const user = storageService.getUser(userId);
  
  if (user && user.profile) {
    const matches = storageService.getPotentialMatches(userId, user.profile);
    res.json({ success: true, matches });
  } else {
    res.status(400).json({ success: false, error: 'Profile not complete' });
  }
});

// API для создания платежа
app.post('/api/payment/create', async (req, res) => {
  try {
    const { userId, productId, amount, currency } = req.body;
    const payment = await paymentService.createPayment(userId, productId, amount, currency);
    res.json({ success: true, payment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Обработка ошибок бота
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});
