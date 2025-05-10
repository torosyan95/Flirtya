const axios = require('axios');

// API CryptoCloud будет скрыт в переменных окружения Vercel
const SHOP_ID = process.env.CRYPTO_SHOP_ID || '7Bk7hDgvwMijMywQ';
const API_KEY = process.env.CRYPTO_API_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1dWlkIjoiTlRJNE16TT0iLCJ0eXBlIjoicHJvamVjdCIsInYiOiJhMWI4MDM0OTdlNjk3N2M2NDc1ZmRmYmZlNDk2MGRkY2NhMzc3MDEwYTY0MWMzMDNiMTU1Y2UwMGYxNmYzYzhkIiwiZXhwIjo4ODE0NjY1Njg1NH0.asoFscnn93zMxMCPtyQI-TqlreIXd3xqL-IJCtDsIc4';

// Функция для создания платежа
async function createPayment(userId, productId, amount, currency = 'USD') {
  try {
    const callbackUrl = `${process.env.WEBAPP_URL}/api/payment/callback`;
    const successUrl = `${process.env.WEBAPP_URL}?status=success&product=${productId}`;
    const failUrl = `${process.env.WEBAPP_URL}?status=fail&product=${productId}`;
    
    const paymentData = {
      shop_id: SHOP_ID,
      amount,
      currency,
      order_id: `${userId}_${productId}_${Date.now()}`,
      callback_url: callbackUrl,
      success_url: successUrl,
      fail_url: failUrl,
      meta: {
        userId,
        productId
      }
    };
    
    const response = await axios.post('https://api.cryptocloud.plus/v1/invoice/create', paymentData, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

// Функция для проверки статуса платежа
async function checkPaymentStatus(invoiceId) {
  try {
    const response = await axios.get(`https://api.cryptocloud.plus/v1/invoice/info?uuid=${invoiceId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
}

module.exports = {
  createPayment,
  checkPaymentStatus
};
```

### services/storage.js
```javascript
// Для демонстрации используем хранение в памяти
// В реальном проекте нужно использовать базу данных
const users = {};
const matches = {};
const chats = {};

// Генерация демо-данных
function generateDemoUsers() {
  const demoUsers = [];
  const names = ['Алексей', 'Мария', 'Иван', 'Елена', 'Дмитрий', 'Анна', 'Сергей', 'Ольга'];
  const cities = ['Москва', 'Санкт-Петербург', 'Киев', 'Минск', 'Алматы', 'Ташкент', 'Баку', 'Тбилиси'];
  const interests = ['Музыка', 'Кино', 'Спорт', 'Путешествия', 'Кулинария', 'Чтение', 'Танцы', 'Технологии'];
  
  for (let i = 0; i < 20; i++) {
    const gender = i % 2 === 0 ? 'male' : 'female';
    const age = Math.floor(Math.random() * 15) + 20; // От 20 до 35 лет
    
    const userInterests = [];
    const interestCount = Math.floor(Math.random() * 3) + 2; // От 2 до 4 интересов
    for (let j = 0; j < interestCount; j++) {
      const interest = interests[Math.floor(Math.random() * interests.length)];
      if (!userInterests.includes(interest)) {
        userInterests.push(interest);
      }
    }
    
    demoUsers.push({
      id: `demo_${i}`,
      profile: {
        name: names[i % names.length],
        age,
        gender,
        city: cities[i % cities.length],
        interests: userInterests,
        photos: [`demo_photo_${i % 5 + 1}.jpg`]
      },
      isVip: i < 5, // Первые 5 пользователей имеют VIP
      isOnline: Math.random() > 0.5
    });
  }
  
  return demoUsers;
}

// Сохранение пользователя
function saveUser(userId, userData) {
  if (!users[userId]) {
    users[userId] = {
      id: userId,
      ...userData
    };
  } else {
    users[userId] = {
      ...users[userId],
      ...userData
    };
  }
  
  return users[userId];
}

// Получение пользователя
function getUser(userId) {
  return users[userId];
}

// Обновление профиля пользователя
function updateUserProfile(userId, profileData) {
  if (users[userId]) {
    users[userId].profile = {
      ...users[userId].profile,
      ...profileData
    };
  }
  
  return users[userId];
}

// Обновление статуса оплаты
function updateUserPayment(userId, productId) {
  if (!users[userId]) return null;
  
  if (productId === 'vip_monthly') {
    users[userId].isVip = true;
    users[userId].vipExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 дней
  } else if (productId === 'vip_plus_monthly') {
    users[userId].isVip = true;
    users[userId].isVipPlus = true;
    users[userId].vipExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 дней
  } else if (productId === 'superlikes') {
    users[userId].superlikesCount = (users[userId].superlikesCount || 0) + 5;
  }
  
  return users[userId];
}

// Получение потенциальных совпадений
function getPotentialMatches(userId, userProfile) {
  // Для демо используем сгенерированных пользователей
  if (Object.keys(matches).length === 0) {
    matches.demoUsers = generateDemoUsers();
  }
  
  // Фильтрация по полу (противоположный для гетеро)
  const filteredMatches = matches.demoUsers.filter(match => {
    // Базовая фильтрация по полу
    const genderMatch = userProfile.gender === 'male' ? match.profile.gender === 'female' : match.profile.gender === 'male';
    
    // Не показываем уже лайкнутых или дизлайкнутых
    const notSwiped = !users[userId]?.swipedUsers?.includes(match.id);
    
    return genderMatch && notSwiped;
  });
  
  return filteredMatches;
}

// Сохранение результата свайпа
function saveSwipeResult(userId, targetId, result) {
  if (!users[userId]) return false;
  
  if (!users[userId].swipedUsers) {
    users[userId].swipedUsers = [];
  }
  
  users[userId].swipedUsers.push(targetId);
  
  if (result === 'like' || result === 'superlike') {
    if (!users[userId].likes) {
      users[userId].likes = [];
    }
    users[userId].likes.push(targetId);
    
    // Проверяем взаимный лайк
    const targetUser = getUser(targetId);
    if (targetUser && targetUser.likes && targetUser.likes.includes(userId)) {
      createMatch(userId, targetId);
      return true; // Матч создан
    }
  }
  
  return false; // Матч не создан
}

// Создание матча
function createMatch(user1Id, user2Id) {
  const matchId = `match_${user1Id}_${user2Id}`;
  
  matches[matchId] = {
    id: matchId,
    users: [user1Id, user2Id],
    createdAt: new Date()
  };
  
  // Создаем чат для этого матча
  createChat(matchId, user1Id, user2Id);
  
  return matches[matchId];
}

// Создание чата
function createChat(matchId, user1Id, user2Id) {
  const chatId = `chat_${matchId}`;
  
  chats[chatId] = {
    id: chatId,
    matchId,
    users: [user1Id, user2Id],
    messages: [],
    createdAt: new Date()
  };
  
  return chats[chatId];
}

// Добавление сообщения в чат
function addMessage(chatId, userId, text) {
  if (!chats[chatId]) return null;
  
  const message = {
    id: `msg_${Date.now()}`,
    chatId,
    userId,
    text,
    createdAt: new Date(),
    read: false
  };
  
  chats[chatId].messages.push(message);
  return message;
}

// Получение чатов пользователя
function getUserChats(userId) {
  return Object.values(chats).filter(chat => chat.users.includes(userId));
}

// Получение сообщений чата
function getChatMessages(chatId) {
  return chats[chatId]?.messages || [];
}

module.exports = {
  saveUser,
  getUser,
  updateUserProfile,
  updateUserPayment,
  getPotentialMatches,
  saveSwipeResult,
  addMessage,
  getUserChats,
  getChatMessages
};
