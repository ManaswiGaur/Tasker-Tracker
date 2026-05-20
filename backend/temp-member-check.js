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

      const registerData = JSON.stringify({
        name: 'Member User',
        email: `member${Date.now()}@example.com`,
        password: 'memberpass',
        role: 'MEMBER',
      });
      const registerOpts = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(registerData),
        },
      };
      const regReq = http.request(registerOpts, (regRes) => {
        let rb = '';
        regRes.on('data', (chunk) => rb += chunk);
        regRes.on('end', async () => {
          console.log('REGISTER_STATUS', regRes.statusCode);
          console.log('REGISTER_BODY', rb);
          try {
            const userId = JSON.parse(rb).user.id;
            const projectData = JSON.stringify({
              name: 'XTest AddMember Project',
              description: 'Desc',
              startDate: '2026-07-01',
              dueDate: '2026-07-31',
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
                try {
                  const project = JSON.parse(pb);
                  const addMemberData = JSON.stringify({ userId });
                  const addMemberOpts = {
                    hostname: 'localhost',
                    port: 5000,
                    path: `/api/projects/${project.id}/members`,
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Content-Length': Buffer.byteLength(addMemberData),
                      Authorization: `Bearer ${token}`,
                    },
                  };
                  const addMemberReq = http.request(addMemberOpts, (memberRes) => {
                    let mb = '';
                    memberRes.on('data', (chunk) => mb += chunk);
                    memberRes.on('end', () => {
                      console.log('ADD_MEMBER_STATUS', memberRes.statusCode);
                      console.log('ADD_MEMBER_BODY', mb);
                      process.exit(0);
                    });
                  });
                  addMemberReq.on('error', (e) => { console.error('ADD_MEMBER_ERR', e.message); process.exit(1); });
                  addMemberReq.write(addMemberData);
                  addMemberReq.end();
                } catch (e) {
                  console.error('PROJECT_PARSE_ERR', e.message);
                  process.exit(1);
                }
              });
            });
            projectReq.on('error', (e) => { console.error('PROJECT_ERR', e.message); process.exit(1); });
            projectReq.write(projectData);
            projectReq.end();
          } catch (e) {
            console.error('REGISTER_PARSE_ERR', e.message);
            process.exit(1);
          }
        });
      });
      regReq.on('error', (e) => { console.error('REGISTER_ERR', e.message); process.exit(1); });
      regReq.write(registerData);
      regReq.end();
    } catch (e) {
      console.error('PARSE_ERR', e.message);
      process.exit(1);
    }
  });
});
loginReq.on('error', (e) => { console.error('LOGIN_ERR', e.message); process.exit(1); });
loginReq.write(loginData);
loginReq.end();