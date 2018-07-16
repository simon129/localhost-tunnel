const PORT = 8080;

const https = require('https');
const fs = require('fs');
const url = require('url');
const request = require('request');
const cheerio = require('cheerio');

const options = {
    key: fs.readFileSync(__dirname + '/key.pem'),
    cert: fs.readFileSync(__dirname + '/cert.pem')
};

https.createServer(options, (req, res) => {
    // https://www.facebook.com/embed/instantgames/140541263458756/player?game_url=https://localhost:8080/https://playcanv.as/p/GspfDaJd/
    if (req.url.indexOf('/playcanv.as/') > -1) {
        // playCanvas 必須找出網頁裡面第二層真正的iFrame
        console.log('[playCanvas]', req.url);

        request({
            url: req.url.slice(1),
            headers: { 'User-Agent': 'Mozilla/5.0', } // user-agent 要設定, 不然playCanvas 不會回應
        }, (e, r, body) => {
            var $ = cheerio.load(body)
            var iframe = $('iframe').attr('src');

            var iframeSrc = url.resolve('https://playcanv.as/', iframe);
            console.log('[playCanvsc] iframe', iframeSrc);

            redirect(iframeSrc, req, res);
        });
    } else {
        // https://www.facebook.com/embed/instantgames/140541263458756/player?game_url=https://localhost:8080/
        // 要轉到creator http://localhost:7456/

        // 學creator, 把 /build 轉到 /build/
        if (req.url == '/build') {
            res.writeHead(301, { Location: '/build/' });
            res.end();
        } else {
            var uri = url.resolve('http://localhost:7456/', req.url.slice(1));
            console.log(uri)
            redirect(uri, req, res);
        }
    }
}).listen(PORT);

function redirect(uri, req, res) {
    var x = request(uri).on('error', e => console.error(e));
    req.pipe(x).pipe(res);
}
