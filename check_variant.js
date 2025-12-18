
const https = require('https');

// Variant 1: dl.dropboxusercontent.com without raw=1
const url1 = 'https://dl.dropboxusercontent.com/scl/fi/sbbbhwe6ymhsdcjd0ev2f/Bye-Bye?rlkey=vz5umrtc7145t07m671sfbsgh&st=gghkdxjo';

console.log('Checking dl.dropboxusercontent.com...');
https.get(url1, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Content-Type:', res.headers['content-type']);
    console.log('Redirect location:', res.headers.location);
}).on('error', (e) => {
    console.error(e);
});
