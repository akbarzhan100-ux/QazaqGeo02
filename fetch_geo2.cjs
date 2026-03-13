const https = require('https');

https.get('https://raw.githubusercontent.com/gazraim-png/qazaqgeo-learn/main/src/data/kazakhstan-regions.json', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const geo = JSON.parse(data);
    geo.features.forEach(f => {
      if (f.properties.NAME_2 === 'Tselinogradskiy' || f.properties.NAME_2 === 'Almaty (Alma-Ata)') {
        console.log(f.properties.NAME_2, f.geometry.type);
      }
    });
  });
});
