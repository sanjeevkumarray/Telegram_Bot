const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require ('dotenv') .config();
const TOKEN =process.env.TOKEN;
const bot = new TelegramBot( {polling: true});

let subscribers = {};

bot.onText(/\/start/, (msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to Weather Updates Bot! Would you like to subscribe for weather updates?', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Yes', callback_data: 'subscribe' },
          { text: 'No', callback_data: 'unsubscribe' }
        ]
      ]
    }
  });
});

// Callback query for subscribing/unsubscribing
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  switch (query.data) {
    case 'subscribe':
      subscribers[chatId] = true;
      bot.answerCallbackQuery(query.id, 'You have been subscribed for weather updates.');
      break;
    case 'unsubscribe':
      delete subscribers[chatId];
      bot.answerCallbackQuery(query.id, 'You have been unsubscribed from weather updates.');
      break;
    default:
      break;
  }
});

// Fetch weather updates and send to subscribers
setInterval(() => {
  axios.get('http://api.openweathermap.org/data/2.5/weather?q=London,uk&appid=55304762d6mshb4544cccced84a6p17f0b7jsn16a0ba68844e')
    .then(response => {
      const weather = response.data.weather[0].main;
      const temperature = Math.round(response.data.main.temp - 273.15);
      Object.keys(subscribers).forEach((chatId) => {
        bot.sendMessage(chatId, `Current weather in London: ${weather}. Temperature: ${temperature}°C.`);
      });
    })
    .catch(error => {
      console.log(error);
    });
}, 3600000); // Send weather updates every hour

// Admin panel
bot.onText(/\/admin/, (msg, match) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to the admin panel. What would you like to do?', {
      reply_markup: {
        keyboard: [
          ['Manage subscribers'],
          ['Update bot settings'],
          ['Exit admin panel']
        ]
      }
    });
  });
  
  // Handle admin commands
bot.onText(/\/manage_subscribers/, (msg, match) => {
    const chatId = msg.chat.id;
    const numSubscribers = Object.keys(subscribers).length;
    bot.sendMessage(chatId, `There are ${numSubscribers} subscribers.`);
  });

// Start the bot
bot.on('polling_error', (error) => {
  console.log(error);
});

console.log('Bot is running...');
