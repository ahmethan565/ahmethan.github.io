const https = require('https');

function fetchTest(useUA) {
  const options = {};
  if (useUA) {
    options.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5'
    };
  }
  https.get('https://4hmethan.itch.io', options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const matches = [...data.matchAll(/<div class="game_cell[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g)];
      console.log(`With UA=${useUA}: Found ${matches.length} games. Status: ${res.statusCode}`);
    });
  });
}
fetchTest(false);
fetchTest(true);
