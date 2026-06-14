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

  // 先查看有哪些预案
  console.log('\n=== 预案列表 ===');
  const plansRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/plans',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log('预案数量:', plansRes.body?.length || 0);
  (plansRes.body || []).forEach(p => {
    console.log('  - ' + p.name + ' (类型: ' + p.incidentType + ', 严重: ' + p.severity + ')');
  });

  // 创建一个新事件
  console.log('\n=== 创建事件 ===');
  const incidentData = JSON.stringify({
    tunnelId: 1,
    mileage: 12500,
    type: 'breakdown',
    severity: 'moderate',
    source: 'manual',
    reporterName: '测试员',
    description: '测试事件 - 车辆抛锚'
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
  
  console.log('创建状态:', createRes.statusCode);
  console.log('事件编号:', createRes.body?.incidentNo);
  console.log('事件状态:', createRes.body?.status);
  console.log('预案ID:', createRes.body?.planId);
  console.log('事件ID:', createRes.body?.id);
  
  const incidentId = createRes.body?.id;
  
  // 手动触发预案执行
  console.log('\n=== 手动触发预案 ===');
  const execData = JSON.stringify({ incidentId });
  const execRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/executions',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  }, execData);
  
  console.log('执行状态:', execRes.statusCode);
  console.log('响应:', JSON.stringify(execRes.body, null, 2).substring(0, 1000));
  
  // 等5秒
  console.log('\n等待5秒，等待动作执行...');
  await new Promise(r => setTimeout(r, 5000));
  
  // 查询执行状态
  console.log('\n=== 查询执行状态 ===');
  const statusRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/executions/incident/' + incidentId,
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  console.log('查询状态:', statusRes.statusCode);
  const exec = statusRes.body;
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
  console.log('\n=== 时间线 ===');
  const timelineRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/timelines/incident/' + incidentId,
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  console.log('时间线记录数:', timelineRes.body?.length || 0);
  (timelineRes.body || []).forEach((t, i) => {
    console.log('  ' + (i+1) + '. [' + t.timestamp + '] ' + t.event + ' - ' + (t.detail || ''));
  });
}

main().catch(console.error);
