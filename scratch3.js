const https = require('https');
https.get('https://4hmethan.itch.io', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const parts = data.split('<div class="game_cell');
    const games = [];
    for (let i = 1; i < parts.length; i++) {
      const cell = parts[i];
      const titleM = cell.match(/<div class="game_title">[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/);
      const thumbM = cell.match(/data-lazy_src="([^"]+)"/);
      const fallbackThumbM = cell.match(/data-background_image="([^"]+)"/);
      const thumb = thumbM ? thumbM[1] : (fallbackThumbM ? fallbackThumbM[1] : '');
      const genreM = cell.match(/<div class="game_genre">([^<]+)<\/div>/);
      
      if (titleM) {
        games.push({
          title: titleM[2].trim(),
          link: titleM[1],
          thumb: thumb
        });
      }
    }
    console.log(games);
  });
});
