const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  // 登录
  const loginData = JSON.stringify({ username: 'admin', password: '123456' });
  const loginRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, loginData);
  
  console.log('登录状态:', loginRes.statusCode);
  const token = loginRes.body.accessToken;
  console.log('Token 已获取\n');

  // 创建事件
  const incidentData = JSON.stringify({
    tunnelId: 1,
    mileage: 12500,
    type: 'breakdown',
    severity: 'moderate',
    source: 'manual',
    reporterName: '张值班员',
    description: '车辆抛锚停在行车道'
  });
  
  const createRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/incidents',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  }, incidentData);
  
  console.log('创建事件状态:', createRes.statusCode);
  const incident = createRes.body;
  console.log('事件编号:', incident.incidentNo);
  console.log('事件状态:', incident.status);
  console.log('预案ID:', incident.planId);
  console.log('事件ID:', incident.id);

  // 等3秒后查询执行状态
  console.log('\n等待3秒，查询预案执行状态...');
  await new Promise(r => setTimeout(r, 3000));
  
  const execRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/executions/incident/' + incident.id,
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  console.log('\n预案执行状态:', execRes.statusCode);
  const exec = execRes.body;
  if (exec && exec.planName) {
    console.log('预案名称:', exec.planName);
    console.log('执行状态:', exec.status);
    console.log('动作数量:', exec.actions?.length || 0);
    (exec.actions || []).forEach((a, i) => {
      console.log('  动作' + (i+1) + ': ' + a.description + ' - ' + a.status);
    });
  } else {
    console.log('未找到执行记录');
    console.log('响应:', JSON.stringify(exec, null, 2));
  }

  // 查询时间线
  console.log('\n查询时间线...');
  const timelineRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/timelines/incident/' + incident.id,
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  console.log('时间线记录数:', timelineRes.body?.length || 0);
  (timelineRes.body || []).forEach((t, i) => {
    console.log('  ' + (i+1) + '. [' + t.timestamp + '] ' + t.event + ' - ' + (t.detail || ''));
  });
}

main().catch(console.error);
