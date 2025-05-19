// Simple script to test CORS with OPTIONS request
import https from 'https';

const API_URL = 'https://l4cy74gnlb.execute-api.us-east-1.amazonaws.com/Prod';
const PATH = '/verify-admin-password';

console.log(`Sending OPTIONS request to ${API_URL}${PATH}`);

// First, perform OPTIONS request
const options = {
  method: 'OPTIONS',
  hostname: 'l4cy74gnlb.execute-api.us-east-1.amazonaws.com',
  path: '/Prod/verify-admin-password',
  headers: {
    'Origin': 'https://d2zxqh5o1e3yfb.cloudfront.net',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Admin-Token'
  }
};

const req = https.request(options, (res) => {
  console.log(`OPTIONS Response status: ${res.statusCode}`);
  console.log('Response headers:');
  console.log(JSON.stringify(res.headers, null, 2));
  
  res.on('data', (chunk) => {
    console.log(`Response body: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.end();

// Now also test the actual POST request
setTimeout(() => {
  console.log('\nNow sending POST request...');
  
  const postOptions = {
    method: 'POST',
    hostname: 'l4cy74gnlb.execute-api.us-east-1.amazonaws.com',
    path: '/Prod/verify-admin-password',
    headers: {
      'Origin': 'https://d2zxqh5o1e3yfb.cloudfront.net',
      'Content-Type': 'application/json'
    }
  };
  
  const postReq = https.request(postOptions, (res) => {
    console.log(`POST Response status: ${res.statusCode}`);
    console.log('Response headers:');
    console.log(JSON.stringify(res.headers, null, 2));
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Response body: ${data}`);
    });
  });
  
  postReq.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
  });
  
  postReq.write(JSON.stringify({ password: 'test' }));
  postReq.end();
}, 1000); 