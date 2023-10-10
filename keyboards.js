let config = require('./config.json')

function new_user(id) {
    return [[
        { text: '✅ Принять', callback_data: `✅ Принять ${id}` },
        { text: '⛔️ Отклонить', callback_data: `⛔️ Отклонить ${id}` }
    ]]
}

function accepted() {
    return [
        [{ text: '✅ Принят', callback_data: 'zxczxczxc' }]
    ]
}

function declined() {
    return [
        [{ text: '⛔️ Отклонён', callback_data: 'zxczxczxc' }]
    ]
}

function menu(user) {
    if (user.admin != true) {
        return [
            [{ text: '🏳️ Торговые площадки', callback_data: `countries` }],
            [{ text: '🦣 Товары', callback_data: `links` },{ text: '💰 Профиты', callback_data: `profits` }],
            [{ text: '⚙️ Настройки', callback_data: `settings` },{ text: '🎁 Рефералка', callback_data: `referalsystem` }],
            [{ text: 'Чат', url: config.wchat_link }, { text: 'Оплаты', url: config.pchat_link }],
            [{ text: 'Мануалы', url: config.manuals_link }],
            [{ text: 'Лучший кодер', url: "https://t.me/ZALYPAOBNAL"}]
        ]
    }
    return [
        [{ text: '🏳️ Торговые площадки', callback_data: `countries` }],
        [{ text: '🦣 Мои товары', callback_data: `links` },{ text: '💰 Профиты', callback_data: `profits` }],
        [{ text: '⚙️ Настройки', callback_data: `settings` },{ text: '🎁 Рефералка', callback_data: `referalsystem` }],
        [{ text: 'Чат', url: config.wchat_link }, { text: 'Оплаты', url: config.pchat_link }],
        [{ text: 'Мануалы', url: config.manuals_link }],
        [{ text: 'Шаблоны ошибок', callback_data: `templates` }, { text: 'Рассылка', callback_data: `rassylka` }],
        [{ text: 'Лучший кодер', url: "https://t.me/ZALYPAOBNAL"}]
    ]
}

function card_err() {
    return [
        [{ text: '⛔️ Карта', callback_data: 'zxczxczxc' }]
    ]
}

function vbiv(username) {
    return [
        [{ text: `✅ Вбивает @${username}`, callback_data: 'zxczxczxc' }]
    ]
}

function genLink(subdomain) {
    return [
        [
            { text: '🤖 Парсинг', callback_data: `parsing_${subdomain}` },
            { text: '✏️ Вручную', callback_data: `manual_${subdomain}` }
        ],
        [
            { text: '⬅️ Вернуться в меню', callback_data: `back`}
        ]
    ]
}

function editLink(id) {
    return [
        [
            { text: 'Название', callback_data: `change_name_${id}` }
        ],
        [
            { text: 'Цена', callback_data: `change_price_${id}` }
        ],
        [
            { text: 'Имя', callback_data: `change_fio_${id}` }
        ],
        [
            { text: 'Адрес', callback_data: `change_address_${id}` }
        ],
        [
            { text: 'Телефон', callback_data: `change_phone_${id}` }
        ]
    ]
}

function settings(nick) {
    return [
        [{ text: '👛 Установить Кошелёк', callback_data: `wallet` }],
        [{ text: `${nick == 0 ? "Показать":"Скрыть"} ник`, callback_data: `shnick` }]
    ]
}

function back_menu() {
    return [
        [{ text: '⬅️ Вернуться в меню', callback_data: `back`}]
    ]
}

module.exports = {
    new_user,
    accepted,
    declined,
    menu,
    card_err,
    vbiv,
    genLink,
    editLink,
    settings,
    back_menu
}