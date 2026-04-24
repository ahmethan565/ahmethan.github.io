const https = require('https');

https.get('https://4hmethan.itch.io/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/<div class="game_cell[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
    if (match) {
      console.log(match[0]);
    }
  });
}).on('error', console.error);
