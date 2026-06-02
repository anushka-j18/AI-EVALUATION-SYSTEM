import http from 'http';

const login = (path, email, password) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

async function test() {
  console.log("Testing Admin Login...");
  const adminRes = await login('/api/admin/auth/login', 'admin@gmail.com', 'admin@1234');
  console.log('Admin Status:', adminRes.statusCode);
  console.log('Admin Body:', adminRes.body);

  console.log("\nTesting Teacher Login...");
  const teacherRes = await login('/api/auth/login', 'teacher@gmail.com', 'teacher@1234');
  console.log('Teacher Status:', teacherRes.statusCode);
  console.log('Teacher Body:', teacherRes.body);
}

test();
