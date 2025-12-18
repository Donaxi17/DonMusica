
// Test script to check URL headers
const https = require('https');
const url = 'https://www.dropbox.com/scl/fi/sbbbhwe6ymhsdcjd0ev2f/Bye-Bye?rlkey=vz5umrtc7145t07m671sfbsgh&st=gghkdxjo&raw=1';

https.get(url, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
}).on('error', (e) => {
    console.error(e);
});
