
const https = require('https');

// Variant 2: dl.dropboxusercontent.com WITH raw=1
const url2 = 'https://dl.dropboxusercontent.com/scl/fi/sbbbhwe6ymhsdcjd0ev2f/Bye-Bye?rlkey=vz5umrtc7145t07m671sfbsgh&st=gghkdxjo&raw=1';

console.log('Checking dl with raw=1...');
https.get(url2, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Content-Type:', res.headers['content-type']);
}).on('error', (e) => {
    console.error(e);
});
