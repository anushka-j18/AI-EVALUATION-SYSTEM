import http from 'http';

const request = (path, method, body, token) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (data) headers['Content-Length'] = data.length;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { hostname: 'localhost', port: 5001, path, method, headers };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(responseBody || '{}') }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

async function test() {
  console.log("1. Logging in as Admin...");
  const adminLogin = await request('/api/admin/auth/login', 'POST', { email: 'admin@gmail.com', password: 'admin@123' });
  console.log("Admin Login Status:", adminLogin.status);
  const adminToken = adminLogin.data.token;
  if (!adminToken) return console.log("Failed to get admin token!");

  console.log("\n2. Creating new teacher via Admin...");
  const newTeacherPayload = {
    name: "Test New Teacher",
    email: "testnew@gmail.com",
    password: "newpass123",
    department: "IT",
    collegeName: "Test College",
    designation: "Assistant Professor",
    panel: "Panel X"
  };
  const createRes = await request('/api/admin/teachers', 'POST', newTeacherPayload, adminToken);
  console.log("Create Teacher Status:", createRes.status);
  console.log("Create Teacher Response:", createRes.data);

  if (createRes.status !== 201) return;

  console.log("\n3. Logging in as the new teacher...");
  const teacherLogin = await request('/api/auth/login', 'POST', { email: 'testnew@gmail.com', password: 'newpass123' });
  console.log("Teacher Login Status:", teacherLogin.status);
  console.log("Teacher Login Response:", teacherLogin.data);

  console.log("\n4. Cleaning up (deleting the test teacher)...");
  if (createRes.data.teacher && createRes.data.teacher._id) {
    const delRes = await request(`/api/admin/teachers/${createRes.data.teacher._id}`, 'DELETE', null, adminToken);
    console.log("Delete Status:", delRes.status);
  }
}

test();
