const { Markup } = require('telegraf');
const userService = require('../services/userService');
const i18n = require('../../utils/i18n');

// Обработчик команды /start
const start = async (ctx) => {
  try {
    const userId = ctx.from.id;
    const user = await userService.getUser(userId);
    
    // Получаем язык пользователя
    const lang = ctx.session.language || 'en';
    
    // Если пользователь уже зарегистрирован
    if (user) {
      await ctx.reply(i18n.t(lang, 'welcome_back', { name: user.firstName }), 
        Markup.inlineKeyboard([
          [Markup.button.webApp(i18n.t(lang, 'open_app'), `https://t.me/FlirtyaOfficalBot/app`)],
          [Markup.button.callback(i18n.t(lang, 'settings'), 'settings')]
        ])
      );
    } else {
      // Если пользователь новый
      await ctx.reply(i18n.t(lang, 'welcome_new'), 
        Markup.inlineKeyboard([
          [Markup.button.webApp(i18n.t(lang, 'get_started'), `https://t.me/FlirtyaOfficalBot/app`)]
        ])
      );
      
      // Сохраняем базовую информацию о пользователе
      await userService.createUser({
        id: userId,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
        language: lang,
        registrationDate: new Date(),
        isComplete: false
      });
    }
  } catch (error) {
    console.error('Error in start command:', error);
    ctx.reply(i18n.t(ctx.session.language || 'en', 'error'));
  }
};

// Обработчик команды /help
const help = async (ctx) => {
  const lang = ctx.session.language || 'en';
  await ctx.reply(i18n.t(lang, 'help_text'), 
    Markup.inlineKeyboard([
      [Markup.button.webApp(i18n.t(lang, 'open_app'), `https://t.me/FlirtyaOfficalBot/app`)],
      [Markup.button.url(i18n.t(lang, 'contact_support'), 'https://t.me/flirtya_support')]
    ])
  );
};

// Обработчик команды /settings
const settings = async (ctx) => {
  const lang = ctx.session.language || 'en';
  await ctx.reply(i18n.t(lang, 'settings_text'), 
    Markup.inlineKeyboard([
      [Markup.button.callback(i18n.t(lang, 'change_language'), 'language')],
      [Markup.button.callback(i18n.t(lang, 'edit_profile'), 'edit_profile')],
      [Markup.button.callback(i18n.t(lang, 'delete_account'), 'delete_account')]
    ])
  );
};

// Обработчик команды /profile
const profile = async (ctx) => {
  try {
    const userId = ctx.from.id;
    const user = await userService.getUser(userId);
    const lang = ctx.session.language || 'en';
    
    if (!user || !user.isComplete) {
      return ctx.reply(i18n.t(lang, 'complete_profile'), 
        Markup.inlineKeyboard([
          [Markup.button.webApp(i18n.t(lang, 'complete_now'), `https://t.me/FlirtyaOfficalBot/app`)]
        ])
      );
    }
    
    // Формируем текст профиля
    let profileText = i18n.t(lang, 'profile_header', { name: user.firstName, age: user.age }) + '\n\n';
    
    if (user.city && user.country) {
      profileText += i18n.t(lang, 'profile_location', { city: user.city, country: user.country }) + '\n';
    }
    
    if (user.interests && user.interests.length > 0) {
      profileText += i18n.t(lang, 'profile_interests') + ' ' + user.interests.join(', ') + '\n';
    }
    
    if (user.goal) {
      profileText += i18n.t(lang, 'profile_goal') + ' ' + i18n.t(lang, `goal_${user.goal}`) + '\n';
    }
    
    if (user.isVip) {
      profileText += '✨ ' + i18n.t(lang, 'vip_active') + '\n';
    }
    
    if (user.isVipPlus) {
      profileText += '🌟 ' + i18n.t(lang, 'vip_plus_active') + '\n';
    }
    
    await ctx.reply(profileText, 
      Markup.inlineKeyboard([
        [Markup.button.webApp(i18n.t(lang, 'edit_profile'), `https://t.me/FlirtyaOfficalBot/app?page=profile`)],
        [Markup.button.webApp(i18n.t(lang, 'view_matches'), `https://t.me/FlirtyaOfficalBot/app?page=matches`)]
      ])
    );
  } catch (error) {
    console.error('Error in profile command:', error);
    ctx.reply(i18n.t(ctx.session.language || 'en', 'error'));
  }
};

// Обработчик команды /language
const language = async (ctx) => {
  const lang = ctx.session.language || 'en';
  await ctx.reply(i18n.t(lang, 'select_language'), 
    Markup.inlineKeyboard([
      [
        Markup.button.callback('English 🇬🇧', 'language:en'),
        Markup.button.callback('Русский 🇷🇺', 'language:ru')
      ]
    ])
  );
};

module.exports = {
  start,
  help,
  settings,
  profile,
  language
};
