'use strict';

// For webscrapping we need to: 
// 1. login to website using Puppeteer
// 2. Get the url
// 3. Get the info from web page using Cheerio

// Filesystem раскомментить, если нужно делать скриншоты
// const fs = require('fs');

// Puppeteer for running the headless browser
const puppeteer = require('puppeteer');
// Cheerio for extractin the content from the scraped pages
const cheerio = require('cheerio');
const { text } = require('cheerio/lib/api/manipulation');

// Express чтобы запустить сервер и пользоваться ботом
const express = require('express');

// Telegraf для отправки информации по таймеру
const telegraf = require('telegraf').Telegraf;
// http://t.me/MironovNodeBot
const BOT_TOKEN = '2116463434:AAH64K2xovrKRMtMVHItoEvCcH2Rhjsdt3M';
const CHAT_ID = '227862173';

const cron = require('node-cron');

// Запускаю сервер express
const expressApp = express();
const port = process.env.PORT || 3000;
expressApp.get('/./', (req, res) => {
    res.send('Running');
});
expressApp.listen(port, () => {
    console.log(`Listening on port ${port}`);
});




// Указываем url сайта, который будем скраппить
// МВИДЕО
const url_mvideo = [
    'https://www.mvideo.ru/promo/sony-ps5-plus-gamepad',
    'https://www.mvideo.ru/products/konsol-sony-playstation-5-digital-edition-40074203',
    'https://www.mvideo.ru/products/konsol-sony-playstation-5-40073270'
];

// СИТИЛИНК
const url_citilink = [
    'https://www.citilink.ru/product/igrovaya-konsol-playstation-5-digital-edition-ps719398806-belyi-cherny-1583761/',
    'https://www.citilink.ru/product/igrovaya-konsol-playstation-5-ps719398707-belyi-chernyi-1497117/',
    'https://www.citilink.ru/product/igrovaya-konsol-playstation-5-ps719398707-belyi-chernyi-1607200/',
    'https://www.citilink.ru/product/igrovaya-konsol-playstation-5-ps719398707-belyi-chernyi-1607201/'
];

// DNS
// Сейчас убрали карусель и поставили на странице товара надпись "Старт продаж с 31 декабря"
// const url_dns = 'https://www.dns-shop.ru/ordering/027b1e6d3e890811/';
// Делаю скраппинг только по первой странице всего каталога товаров
const url_dns = [
    'https://www.dns-shop.ru/catalog/17a8978216404e77/konsoli-playstation/?stock=0&f[tgcd]=16zi0l',
    'https://www.dns-shop.ru/product/44f657d4ac493332/igrovaa-konsol-playstation-5-digital-edition/',
    'https://www.dns-shop.ru/product/2645e72c6fca1b80/igrovaa-konsol-playstation-5/'
];

// Vk Мвидео
const url_vk = 'https://vk.com/mvideo/';


function scrapeMvideo1() {
    // Создаю массив, в который буду пушить все полученные данные с сайта
    let data = [];
    // Запускаю Puppeteer
    puppeteer.launch({ args: ['--no-sandbox'] })
        .then(async (browser) => {
            // Открываю в браузере новую страницу
            let page = await browser.newPage();
            // Ставлю ширину и высоту окна
            page.setViewport({ width: 1366, height: 768 });
            // Ставлю user-agent, чтобы сайты пропускали
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0');
            // Перехожу на первую ссылку и жду, пока загрузится DOM
            await page.goto(url_mvideo[0], { waitUntil: 'domcontentloaded' });

            // Делаю паузу на 10 секунд, чтобы наверняка все загрузилось, в т.ч. для захвата скриншота
            await page.waitForTimeout(10000);

            // Получаю DOM страницы сайта
            await page.content()
                .then((success) => {
                    // Загружаю html в Cheerio
                    const $ = cheerio.load(success);
                    // Делаю выборку по элементу html и вытаскиваю от туда текст. Пушу это в массив
                    data.push(url_mvideo[0]);
                    data.push($('.TIBlock .TIBlock-content-wrap .TIBlock-content .TIBlock-text .content-quote').text().trim() ? 'ФОРМА ЗАКРЫТА' : 'ЧТО-ТО ПОМЕНЯЛОСЬ НА ПРОМО-СТРАНИЦЕ!');
                });

                // Сохраняю новый скриншот
                // await page.screenshot({ path: `mvideo/mvideo_${Date.now()}.png` });

            await browser.close();
        })
        .catch((err) => {
            console.log(" CAUGHT WITH AN ERROR ", err);
        })

        return data;
}

function scrapeMvideo2() {
    // Создаю массив, куда буду записывать данные
    let data = [];
    // Запускаю Puppeteer
    puppeteer.launch({ args: ['--no-sandbox'] })
        .then(async (browser) => {
            // Открываю в браузере новую страницу
            let page = await browser.newPage();
            // Ставлю ширину и высоту окна
            page.setViewport({ width: 1366, height: 768 });
            // Ставлю user-agent, чтобы сайты пропускали
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0');
            // Перехожу на первую ссылку и жду, пока загрузится DOM
            await page.goto(url_mvideo[1], { waitUntil: 'domcontentloaded' });

            // Делаю паузу на 10 секунд, чтобы наверняка все загрузилось, в т.ч. для захвата скриншота
            await page.waitForTimeout(10000);

            // Получаю DOM страницы сайта
            await page.content()
                .then((success) => {
                    // Загружаю html в Cheerio
                    const $ = cheerio.load(success);
                    // Делаю выборку по элементу html и вытаскиваю от туда текст. Далее пушу это в массив
                    data.push(url_mvideo[1]);
                    data.push($('h1.title').text().substr(0, $('h1.title').text().length - 8));
                    data.push(!$('.product-notification__text') ? 'В НАЛИЧИИ' : 'НЕДОСТУПЕН ДЛЯ ПРОДАЖИ');
                    data.push($('span.price__main-value').text());
                });

                // Сохраняю новый скриншот
                // await page.screenshot({ path: `mvideo/mvideo_${Date.now()}.png` });

            await browser.close();
        })
        .catch((err) => {
            console.log(" CAUGHT WITH AN ERROR ", err);
        })

        return data;
}

function scrapeMvideo3() {
    // Создаю массив, куда буду записывать данные
    let data = [];
    // Запускаю Puppeteer
    puppeteer.launch({ args: ['--no-sandbox'] })
        .then(async (browser) => {
            // Открываю в браузере новую страницу
            let page = await browser.newPage();
            // Ставлю ширину и высоту окна
            page.setViewport({ width: 1366, height: 768 });
            // Ставлю user-agent, чтобы сайты пропускали
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0');
            // Перехожу на первую ссылку и жду, пока загрузится DOM
            await page.goto(url_mvideo[2], { waitUntil: 'domcontentloaded' });

            // Делаю паузу на 10 секунд, чтобы наверняка все загрузилось, в т.ч. для захвата скриншота
            await page.waitForTimeout(10000);

            // Получаю DOM страницы сайта
            await page.content()
                .then((success) => {
                    // Загружаю html в Cheerio
                    const $ = cheerio.load(success);
                    // Делаю выборку по элементу html и вытаскиваю от туда текст. Далее пушу это в массив
                    data.push(url_mvideo[2]);
                    data.push($('h1.title').text().substr(0, $('h1.title').text().length - 8));
                    data.push(!$('.product-notification__text') ? 'В НАЛИЧИИ' : 'НЕДОСТУПЕН ДЛЯ ПРОДАЖИ');
                    data.push($('span.price__main-value').text());
                });

                // Сохраняю новый скриншот
                // await page.screenshot({ path: `mvideo/mvideo_${Date.now()}.png` });

            await browser.close();
        })
        .catch((err) => {
            console.log(" CAUGHT WITH AN ERROR ", err);
        })

        return data;
}

function scrapeCitilink1() {
    // Создаю массив, в который буду пушить все полученные данные с сайта
    let data = [];
    // Запускаю Puppeteer
    puppeteer.launch({ args: ['--no-sandbox'] })
        .then(async (browser) => {
            // Открываю в браузере новую страницу
            let page = await browser.newPage();
            // Ставлю ширину и высоту окна
            page.setViewport({ width: 1366, height: 768 });
            // Ставлю user-agent, чтобы сайты пропускали
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0');
            // Перехожу на первую ссылку и жду, пока загрузится DOM
            await page.goto(url_citilink[0], { waitUntil: 'domcontentloaded' });

            // Делаю паузу на 10 секунд, чтобы наверняка все загрузилось, в т.ч. для захвата скриншота
            await page.waitForTimeout(10000);

            // Получаю DOM страницы сайта
            await page.content()
                .then((success) => {
                    // Загружаю html в Cheerio
                    const $ = cheerio.load(success);
                    // Делаю выборку по элементу html и вытаскиваю от туда текст. Пушу это в массив
                    data.push(url_citilink[0]);
                    data.push($('.ProductHeader__title').text().trim());
                    data.push($('.ProductHeader__not-available-header').text().toUpperCase().trim() ? $('.ProductHeader__not-available-header').text().toUpperCase().trim() : 'В НАЛИЧИИ');
                    data.push($('.ProductHeader__not-available-date').text().trim() ? $('.ProductHeader__not-available-date').text().trim() : 'ЧТО-ТО ПОМЕНЯЛОСЬ');
                });

                // Сохраняю новый скриншот
                // await page.screenshot({ path: `citilink/citilink_${Date.now()}.png` });

            await browser.close();
        })
        .catch((err) => {
            console.log(" CAUGHT WITH AN ERROR ", err);
        });

        return data;
}

function scrapeCitilink2() {
    // Создаю массив, в который буду пушить все полученные данные с сайта
    let data = [];
    // Запускаю Puppeteer
    puppeteer.launch({ args: ['--no-sandbox'] })
        .then(async (browser) => {
            // Открываю в браузере новую страницу
            let page = await browser.newPage();
            // Ставлю ширину и высоту окна
            page.setViewport({ width: 1366, height: 768 });
            // Ставлю user-agent, чтобы сайты пропускали
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0');
            // Перехожу на первую ссылку и жду, пока загрузится DOM
            await page.goto(url_citilink[1], { waitUntil: 'domcontentloaded' });

            // Делаю паузу на 10 секунд, чтобы наверняка все загрузилось, в т.ч. для захвата скриншота
            await page.waitForTimeout(10000);

            // Получаю DOM страницы сайта
            await page.content()
                .then((success) => {
                    // Загружаю html в Cheerio
                    const $ = cheerio.load(success);
                    // Делаю выборку по элементу html и вытаскиваю от туда текст. Пушу это в массив
                    data.push(url_citilink[1]);
                    data.push($('.ProductHeader__title').text().trim());
                    data.push($('.ProductHeader__not-available-header').text().toUpperCase().trim() ? $('.ProductHeader__not-available-header').text().toUpperCase().trim() : 'В НАЛИЧИИ');
                    data.push($('.ProductHeader__not-available-date').text().trim() ? $('.ProductHeader__not-available-date').text().trim() : 'ЧТО-ТО ПОМЕНЯЛОСЬ');
                });

                // Сохраняю новый скриншот
                // await page.screenshot({ path: `citilink/citilink_${Date.now()}.png` });

            await browser.close();
        })
        .catch((err) => {
            console.log(" CAUGHT WITH AN ERROR ", err);
        });

        return data;
}

function scrapeCitilink3() {
    // Создаю массив, в который буду пушить все полученные данные с сайта
    let data = [];
    // Запускаю Puppeteer
    puppeteer.launch({ args: ['--no-sandbox'] })
        .then(async (browser) => {
            // Открываю в браузере новую страницу
            let page = await browser.newPage();
            // Ставлю ширину и высоту окна
            page.setViewport({ width: 1366, height: 768 });
            // Ставлю user-agent, чтобы сайты пропускали
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0');
            // Перехожу на первую ссылку и жду, пока загрузится DOM
            await page.goto(url_citilink[2], { waitUntil: 'domcontentloaded' });

            // Делаю паузу на 10 секунд, чтобы наверняка все загрузилось, в т.ч. для захвата скриншота
            await page.waitForTimeout(10000);

            // Получаю DOM страницы сайта
            await page.content()
                .then((success) => {
                    // Загружаю html в Cheerio
                    const $ = cheerio.load(success);
                    // Делаю выборку по элементу html и вытаскиваю от туда текст. Пушу это в массив
                    data.push(url_citilink[2]);
                    data.push($('.ProductHeader__title').text().trim());
                    data.push($('.ProductHeader__not-available-header').text().toUpperCase().trim() ? $('.ProductHeader__not-available-header').text().toUpperCase().trim() : 'В НАЛИЧИИ');
                    data.push($('.ProductHeader__not-available-date').text().trim() ? $('.ProductHeader__not-available-date').text().trim() : 'ЧТО-ТО ПОМЕНЯЛОСЬ');
                });

                // Сохраняю новый скриншот
                // await page.screenshot({ path: `citilink/citilink_${Date.now()}.png` });

            await browser.close();
        })
        .catch((err) => {
            console.log(" CAUGHT WITH AN ERROR ", err);
        });

        return data;
}

function scrapeCitilink4() {
    // Создаю массив, в который буду пушить все полученные данные с сайта
    let data = [];
    // Запускаю Puppeteer
    puppeteer.launch({ args: ['--no-sandbox'] })
        .then(async (browser) => {
            // Открываю в браузере новую страницу
            let page = await browser.newPage();
            // Ставлю ширину и высоту окна
            page.setViewport({ width: 1366, height: 768 });
            // Ставлю user-agent, чтобы сайты пропускали
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0');
            // Перехожу на первую ссылку и жду, пока загрузится DOM
            await page.goto(url_citilink[3], { waitUntil: 'domcontentloaded' });

            // Делаю паузу на 10 секунд, чтобы наверняка все загрузилось, в т.ч. для захвата скриншота
            await page.waitForTimeout(10000);

            // Получаю DOM страницы сайта
            await page.content()
                .then((success) => {
                    // Загружаю html в Cheerio
                    const $ = cheerio.load(success);
                    // Делаю выборку по элементу html и вытаскиваю от туда текст. Пушу это в массив
                    data.push(url_citilink[3]);
                    data.push($('.ProductHeader__title').text().trim());
                    data.push($('.ProductHeader__not-available-header').text().toUpperCase().trim() ? $('.ProductHeader__not-available-header').text().toUpperCase().trim() : 'В НАЛИЧИИ');
                    data.push($('.ProductHeader__not-available-date').text().trim() ? $('.ProductHeader__not-available-date').text().trim() : 'ЧТО-ТО ПОМЕНЯЛОСЬ');
                });

                // Сохраняю новый скриншот
                // await page.screenshot({ path: `citilink/citilink_${Date.now()}.png` });

            await browser.close();
        })
        .catch((err) => {
            console.log(" CAUGHT WITH AN ERROR ", err);
        });

        return data;
}

// старая функция для скраппинга в карусели ДНС
function scrapeDns() {
    // Создаю массив, в который буду пушить все полученные данные с сайта
    let data = [];
    // Запускаю Puppeteer
    puppeteer.launch({ args: ['--no-sandbox'] })
        .then(async (browser) => {
            // Открываю в браузере новую страницу
            let page = await browser.newPage();
            // Ставлю ширину и высоту окна
            page.setViewport({ width: 1366, height: 768 });
            // Ставлю user-agent, чтобы сайты пропускали
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0');
            // Перехожу на первую ссылку и жду, пока загрузится DOM
            await page.goto(url_dns, { waitUntil: 'domcontentloaded' });

            // Делаю паузу на 10 секунд, чтобы наверняка все загрузилось, в т.ч. для захвата скриншота
            await page.waitForTimeout(10000);

            // Получаю DOM страницы сайта
            await page.content()
                .then((success) => {
                    // Загружаю html в Cheerio
                    const $ = cheerio.load(success);
                    // Делаю выборку по элементу html и вытаскиваю от туда текст. Пушу это в массив
                    const dnsList = $('.hype-landing-products__item-title');
                    const dnsArr = [];
                    dnsList.each((idx, el) => {
                        data.push([$(el).text().trim(), 'link']);
                    });
                });

                // Сохраняю новый скриншот
                // await page.screenshot({ path: `dns/dns_${Date.now()}.png` });

            await browser.close();
        })
        .catch((err) => {
            console.log(" CAUGHT WITH AN ERROR ", err);
        });

        return data;
}

function scrapeDns1() {
    // Создаю массив, в который буду пушить все полученные данные с сайта
    let data = [];
    // Запускаю Puppeteer
    puppeteer.launch({ args: ['--no-sandbox'] })
        .then(async (browser) => {
            // Открываю в браузере новую страницу
            let page = await browser.newPage();
            // Ставлю ширину и высоту окна
            page.setViewport({ width: 1366, height: 768 });
            // Ставлю user-agent, чтобы сайты пропускали
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0');
            // Перехожу на первую ссылку и жду, пока загрузится DOM
            await page.goto(url_dns[0], { waitUntil: 'domcontentloaded' });

            // Делаю паузу на 10 секунд, чтобы наверняка все загрузилось, в т.ч. для захвата скриншота
            await page.waitForTimeout(10000);

            // Получаю DOM страницы сайта
            await page.content()
                .then((success) => {
                    // Загружаю html в Cheerio
                    const $ = cheerio.load(success);
                    // Делаю выборку по элементу html и вытаскиваю от туда текст. Пушу это в массив
                    const dnsList = $('.catalog-product.ui-button-widget');
                    dnsList.each((idx, el) => {
                        data.push( [$(el).children('.catalog-product__name').text().trim().substr(0, 44)], ['https://dns-shop.ru' + $(el).children('a').attr('href')], $(el).children('.product-buy').text().trim() ? [$(el).children('.product-buy').text().trim()] : ['ЧТО-ТО ПОМЕНЯЛОСЬ'], $(el).children('.catalog-product__avails').text().trim() ? [$(el).children('.catalog-product__avails').text().trim() +'\n'] : ['ЧТО-ТО ПОМЕНЯЛОСЬ \n'] );
                    });
                });

                // Сохраняю новый скриншот
                // await page.screenshot({ path: `dns/dns_${Date.now()}.png` });

            await browser.close();
        })
        .catch((err) => {
            console.log(" CAUGHT WITH AN ERROR ", err);
        });

        return data;
}

function vkontakte() {
    // Создаю массив, в который буду пушить все полученные данные с сайта
    let data = [];
    // Запускаю Puppeteer
    puppeteer.launch({ args: ['--no-sandbox'] })
        .then(async (browser) => {
            // Открываю в браузере новую страницу
            let page = await browser.newPage();
            // Ставлю ширину и высоту окна
            page.setViewport({ width: 1366, height: 768 });
            // Ставлю user-agent, чтобы сайты пропускали
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0');
            // Перехожу на первую ссылку и жду, пока загрузится DOM
            await page.goto(url_vk, { waitUntil: 'domcontentloaded' });

            // Делаю паузу на 10 секунд, чтобы наверняка все загрузилось, в т.ч. для захвата скриншота
            await page.waitForTimeout(10000);

            // Получаю DOM страницы сайта
            await page.content()
                .then((success) => {
                    // Загружаю html в Cheerio
                    const $ = cheerio.load(success);
                    // Делаю выборку по элементу html и вытаскиваю от туда текст. Пушу это в массив
                    data.push(`Сообщетсво ВКонтакте М.ВИДЕО`);
                    let postList = ($('.wall_post_text'));
                    for (let i = 0; i < postList.length; i++) {
                        if (i === 3) {
                            // Добавляю данные только первых двух постов
                            break;
                        }
                        data.push( [$(postList[i]).text().trim() + '\n'] );
                    }
                });

                // Сохраняю новый скриншот
                // await page.screenshot({ path: `path/name_${Date.now()}.png` });

            await browser.close();
        })
        .catch((err) => {
            console.log(" CAUGHT WITH AN ERROR ", err);
        });

        return data;
}

// Удаляю все старые скриншоты
// fs.readdirSync('mvideo/').forEach(file => {
//     fs.unlinkSync(`mvideo/${file}`);
// });
// fs.readdirSync('citilink/').forEach(file => {
//     fs.unlinkSync(`citilink/${file}`);
// });
// fs.readdirSync('dns/').forEach(file => {
//     fs.unlinkSync(`dns/${file}`);
// });


const bot = new telegraf(BOT_TOKEN);
bot.start((ctx) => ctx.reply('Привет! Меня создал @mironov_ma'));
// bot.command('test', (ctx) => ctx.reply('Выполняю какую-то комманду.'));
bot.hears('Привет', (ctx) => ctx.reply('Что нужно?'));

// */60 8-22 * * * ежедневно каждый час с 8:00 до 22:00
cron.schedule('*/2 * * * *', () => {
    let data = [
        scrapeMvideo1(),
        scrapeMvideo2(),
        scrapeMvideo3(),
        scrapeCitilink1(),
        scrapeCitilink2(),
        scrapeCitilink3(),
        scrapeCitilink4(),
        scrapeDns1(),
        vkontakte()
    ];

    setTimeout(() => {
        let result = data.map(e => e.join(' \n'));
        for (let i = 0; i < result.length; i++) {
            bot.telegram.sendMessage(CHAT_ID, `${String.fromCodePoint(0x1F539)} Сообщение номер ${i+1}: \n${result[i]}`);
        }
        console.log('Message send!');
    }, 50000);
});

bot.launch();