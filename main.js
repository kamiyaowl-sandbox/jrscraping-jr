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
  const result = [];
  for(url of targetUrls){
    console.log('goto', url);
    await page.goto(url);

    const entries = await page.evaluate(() => {
        const trs = document.getElementsByTagName('tr');
        const arr = [];
        //最後に処理したデータが遅延情報持ちならこっちに入れる
        let delayData = null;

        for(let i = 0 ; i < trs.length ; ++i) {
          const tr = trs[i];

          if(delayData) {
            //遅延データも入れて返す
            arr.push({
              name: delayData.tr.children[0].textContent,
              status: delayData.tr.children[1].children[0].alt,
              time: delayData.tr.children[2].textContent,
              message: tr.children[0].textContent,// 遅延情報の行はこれだけ
              hasHistory: delayData.hasHistory,
            });
            delayData = null;
          } else {
            const hasTime = tr.getElementsByClassName('time').length > 0;
            // 遅延情報に履歴があればこっちのいずれか
            const hasHistory = tr.getElementsByClassName('history').length > 0;
            const hasTime02 = tr.getElementsByClassName('time02').length > 0;
            if(hasHistory | hasTime | hasTime02) {
              delayData = {
                tr: tr,
                hasHistory: hasHistory,
              };
              continue;
            } else {
              arr.push({
                name: tr.children[0].textContent,
                status: tr.children[1].children[0].alt,
              });
            }
          }
        }
        return arr;
      }
    );
    entries.forEach(v => result.push(v));
  }
  result.forEach(v => {
    console.log(v);
  });
  await browser.close();
})();