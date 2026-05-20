const http = require('http');

const loginData = JSON.stringify({ email: 'admin@taskflow.com', password: 'adminpassword123' });
const loginOpts = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData),
  },
};

const loginReq = http.request(loginOpts, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', async () => {
    console.log('LOGIN_STATUS', res.statusCode);
    console.log('LOGIN_BODY', body);
    try {
      const token = JSON.parse(body).token;
      if (!token) return;

      const projectData = JSON.stringify({
        name: 'XTest Project',
        description: 'Desc',
        startDate: '2026-06-01',
        dueDate: '2026-06-30',
      });
      const projectOpts = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/projects',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(projectData),
          Authorization: `Bearer ${token}`,
        },
      };
      const projectReq = http.request(projectOpts, (projectRes) => {
        let pb = '';
        projectRes.on('data', (chunk) => pb += chunk);
        projectRes.on('end', () => {
          console.log('PROJECT_STATUS', projectRes.statusCode);
          console.log('PROJECT_BODY', pb);
          process.exit(0);
        });
      });
      projectReq.on('error', (e) => { console.error('PROJECT_ERR', e.message); process.exit(1); });
      projectReq.write(projectData);
      projectReq.end();
    } catch (e) {
      console.error('PARSE_ERR', e.message);
      process.exit(1);
    }
  });
});
loginReq.on('error', (e) => { console.error('LOGIN_ERR', e.message); process.exit(1); });
loginReq.write(loginData);
loginReq.end();