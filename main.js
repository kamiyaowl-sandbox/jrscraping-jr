const config = require("config");
const puppeteer = require('puppeteer');
const cheerio = require("cheerio");

(async () => {
  const browser = await puppeteer.launch(config.puppeteerOptions);
  const page = await browser.newPage();
  const targetUrls = [
    'http://traininfo.jreast.co.jp/train_info/kanto.aspx',
    'http://traininfo.jreast.co.jp/train_info/tohoku.aspx',
    'http://traininfo.jreast.co.jp/train_info/shinetsu.aspx',
    'http://traininfo.jreast.co.jp/train_info/shinkansen.aspx',
    'http://traininfo.jreast.co.jp/train_info/chyokyori.aspx',
  ];
  for(url of targetUrls){
    console.log('goto', url);
    await page.goto(url);

    const names = await page.$$eval('.text-tit-xlarge', list => list.map(data => data.textContent));
    const statuses = await page.$$eval('td > img', list => list.map(data => data.alt));
    console.log(names, statuses);
  }
  await browser.close();
})();