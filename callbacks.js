const { Markup } = require('telegraf');
const userService = require('../services/userService');
const paymentService = require('../services/paymentService');
const i18n = require('../../utils/i18n');

// Обработчик изменения языка
const changeLanguage = async (ctx) => {
  try {
    const newLang = ctx.match[1]; // en или ru
    ctx.session.language = newLang;
    
    // Сохраняем выбранный язык в профиле пользователя
    await userService.updateUser(ctx.from.id, { language: newLang });
    
    await ctx.answerCbQuery(i18n.t(newLang, 'language_changed'));
    await ctx.editMessageText(i18n.t(newLang, 'language_updated'), 
      Markup.inlineKeyboard([
        [Markup.button.webApp(i18n.t(newLang, 'open_app'), `https://t.me/FlirtyaOfficalBot/app`)]
      ])
    );
  } catch (error) {
    console.error('Error in changeLanguage callback:', error);
    ctx.answerCbQuery(i18n.t(ctx.session.language || 'en', 'error'));
  }
};

// Обработчик открытия WebApp
const openWebapp = async (ctx) => {
  try {
    const lang = ctx.session.language || 'en';
    await ctx.answerCbQuery();
    await ctx.reply(i18n.t(lang, 'opening_webapp'),
      Markup.keyboard([
        [Markup.button.webApp(i18n.t(lang, 'open_flirtya'), `https://t.me/FlirtyaOfficalBot/app`)]
      ]).resize()
    );
  } catch (error) {
    console.error('Error in openWebapp callback:', error);
    ctx.answerCbQuery(i18n.t(ctx.session.language || 'en', 'error'));
  }
};

// Обработчик VIP функций
const handleVip = async (ctx) => {
  try {
    const action = ctx.match[1]; // buy, info, plus
    const lang = ctx.session.language || 'en';
    
    switch (action) {
      case 'buy':
        // Создаём счёт для оплаты VIP
        const invoice = await paymentService.createInvoice(ctx.from.id, 'vip_30days', 19.99);
        await ctx.reply(i18n.t(lang, 'vip_purchase'), invoice);
        break;
        
      case 'plus':
        // Создаём счёт для оплаты VIP+
        const invoicePlus = await paymentService.createInvoice(ctx.from.id, 'vip_plus_30days', 24.99);
        await ctx.reply(i18n.t(lang, 'vip_plus_purchase'), invoicePlus);
        break;
        
      case 'info':
      default:
        // Показываем информацию о VIP
        const vipInfoText = i18n.t(lang, 'vip_info_text');
        await ctx.editMessageText(vipInfoText, 
          Markup.inlineKeyboard([
            [Markup.button.callback(i18n.t(lang, 'buy_vip'), 'vip:buy')],
            [Markup.button.callback(i18n.t(lang, 'buy_vip_plus'), 'vip:plus')],
            [Markup.button.callback(i18n.t(lang, 'back'), 'settings')]
          ])
        );
        break;
    }
  } catch (error) {
    console.error('Error in handleVip callback:', error);
    ctx.answerCbQuery(i18n.t(ctx.session.language || 'en', 'error'));
  }
};

// Обработчик редактирования профиля
const editProfile = async (ctx) => {
  try {
    const lang = ctx.session.language || 'en';
    await ctx.answerCbQuery();
    await ctx.reply(i18n.t(lang, 'edit_profile_text'),
      Markup.inlineKeyboard([
        [Markup.button.webApp(i18n.t(lang, 'edit_profile'), `https://t.me/FlirtyaOfficalBot/app?page=profile&edit=true`)]
      ])
    );
  } catch (error) {
    console.error('Error in editProfile callback:', error);
    ctx.answerCbQuery(i18n.t(ctx.session.language || 'en', 'error'));
  }
};

// Обработчик удаления аккаунта
const deleteAccount = async (ctx) => {
  try {
    const lang = ctx.session.language || 'en';
    await ctx.answerCbQuery();
    await ctx.reply(i18n.t(lang, 'delete_confirmation'), 
      Markup.inlineKeyboard([
        [
          Markup.button.callback(i18n.t(lang, 'yes_delete'), 'confirm_delete'),
          Markup.button.callback(i18n.t(lang, 'cancel'), 'cancel_delete')
        ]
      ])
    );
  } catch (error) {
    console.error('Error in deleteAccount callback:', error);
    ctx.answerCbQuery(i18n.t(ctx.session.language || 'en', 'error'));
  }
};

// Обработчик подтверждения удаления аккаунта
const confirmDelete = async (ctx) => {
  try {
    const userId = ctx.from.id;
    const lang = ctx.session.language || 'en';
    
    // Удаляем аккаунт
    await userService.deleteUser(userId);
    
    await ctx.answerCbQuery(i18n.t(lang, 'account_deleted'));
    await ctx.editMessageText(i18n.t(lang, 'account_deleted_text'));
    
    // Сбрасываем сессию
    ctx.session = {};
  } catch (error) {
    console.error('Error in confirmDelete callback:', error);
    ctx.answerCbQuery(i18n.t(ctx.session.language || 'en', 'error'));
  }
};

// Обработчик отмены удаления аккаунта
const cancelDelete = async (ctx) => {
  try {
    const lang = ctx.session.language || 'en';
    await ctx.answerCbQuery(i18n.t(lang, 'delete_canceled'));
    await ctx.editMessageText(i18n.t(lang, 'delete_canceled_text'), 
      Markup.inlineKeyboard([
        [Markup.button.callback(i18n.t(lang, 'back_to_settings'), 'settings')]
      ])
    );
  } catch (error) {
    console.error('Error in cancelDelete callback:', error);
    ctx.answerCbQuery(i18n.t(ctx.session.language || 'en', 'error'));
  }
};

module.exports = {
  changeLanguage,
  openWebapp,
  handleVip,
  editProfile,
  deleteAccount,
  confirmDelete,
  cancelDelete
};
