const { Telegraf, session, Scenes } = require('telegraf');
const express = require('express');
const path = require('path');
const fs = require('fs');
const commandHandlers = require('./handlers/commands');
const messageHandlers = require('./handlers/messages');
const callbackHandlers = require('./handlers/callbacks');
const languageMiddleware = require('./middlewares/language');
const authMiddleware = require('./middlewares/auth');
const config = require('../config/bot');

// Создаем экземпляр бота
const bot = new Telegraf(process.env.BOT_TOKEN || '8038493543:AAEl1pczUYnm7WDsGBRyGYfjk-PJgQ46sGg');

// Настраиваем middleware для сессий и языка
bot.use(session());
bot.use(languageMiddleware);
bot.use(authMiddleware);

// Регистрируем обработчики команд
bot.command('start', commandHandlers.start);
bot.command('help', commandHandlers.help);
bot.command('settings', commandHandlers.settings);
bot.command('profile', commandHandlers.profile);
bot.command('language', commandHandlers.language);

// Регистрируем обработчики inline-кнопок
bot.action(/language:(.+)/, callbackHandlers.changeLanguage);
bot.action('open_webapp', callbackHandlers.openWebapp);
bot.action(/vip:(.+)/, callbackHandlers.handleVip);
bot.action('edit_profile', callbackHandlers.editProfile);
bot.action('delete_account', callbackHandlers.deleteAccount);

// Обработчик текстовых сообщений
bot.on('message', messageHandlers.handleMessage);

// Настраиваем Express для WebApp
const app = express();
const PORT = process.env.PORT || 3000;

// Раздаем статические файлы
app.use(express.static(path.join(__dirname, '../webapp')));

// API для WebApp
app.use(express.json());

// Эндпоинт для получения информации о пользователе
app.get('/api/users/:id', (req, res) => {
  // Здесь будет логика получения информации о пользователе
  res.json({ success: true, user: {} });
});

// Эндпоинт для обновления профиля
app.post('/api/users/:id/update', (req, res) => {
  // Здесь будет логика обновления профиля
  res.json({ success: true });
});

// Эндпоинт для получения списка подходящих пользователей
app.get('/api/users/:id/matches', (req, res) => {
  // Здесь будет логика получения списка подходящих пользователей
  res.json({ success: true, matches: [] });
});

// Эндпоинт для обработки свайпов
app.post('/api/swipes', (req, res) => {
  // Здесь будет логика обработки свайпов
  res.json({ success: true });
});

// Эндпоинт для получения сообщений
app.get('/api/chats/:id/messages', (req, res) => {
  // Здесь будет логика получения сообщений
  res.json({ success: true, messages: [] });
});

// Эндпоинт для отправки сообщений
app.post('/api/chats/:id/messages', (req, res) => {
  // Здесь будет логика отправки сообщений
  res.json({ success: true });
});

// Эндпоинт для обработки платежей
app.post('/api/payments', (req, res) => {
  // Здесь будет логика обработки платежей
  res.json({ success: true });
});

// Запускаем Express сервер
app.listen(PORT, () => {
  console.log(`WebApp running on port ${PORT}`);
});

// Запускаем бота
bot.launch().then(() => {
  console.log('Bot started successfully');
}).catch((err) => {
  console.error('Error starting bot:', err);
});

// Обработка завершения работы
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
