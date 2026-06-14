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

  // 测试1: 事件列表 - 传递字符串形式的 page/pageSize
  console.log('\n=== 测试1: 事件列表 (字符串参数) ===');
  const listRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/incidents?page=1&pageSize=20',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  console.log('状态码:', listRes.statusCode);
  if (listRes.statusCode === 200) {
    console.log('✅ 事件列表查询成功！');
    console.log('  总数:', listRes.body.total);
    console.log('  事件数:', listRes.body.items?.length || 0);
  } else {
    console.log('❌ 事件列表查询失败:', JSON.stringify(listRes.body));
  }

  // 测试2: 新建预案 - 不传递 parameters
  console.log('\n=== 测试2: 新建预案 (无parameters) ===');
  const planData = JSON.stringify({
    name: '测试预案-无参数',
    incidentType: 'breakdown',
    severity: 'minor',
    actions: [
      { step: 1, actionType: 'led_display', description: 'LED屏显示警示信息' },
      { step: 2, actionType: 'light_full', description: '灯光全部拉亮' },
    ]
  });
  
  const planRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/plans',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  }, planData);
  
  console.log('状态码:', planRes.statusCode);
  if (planRes.statusCode === 201) {
    console.log('✅ 新建预案成功！');
    console.log('  预案ID:', planRes.body.id);
    console.log('  预案名称:', planRes.body.name);
    console.log('  动作数:', planRes.body.actions?.length || 0);
    planRes.body.actions?.forEach((a, i) => {
      console.log(`    动作${i+1}: ${a.description} - parameters:`, a.parameters);
    });
  } else {
    console.log('❌ 新建预案失败:', JSON.stringify(planRes.body));
  }

  // 测试3: 新建预案 - 传递 parameters
  console.log('\n=== 测试3: 新建预案 (有parameters) ===');
  const planData2 = JSON.stringify({
    name: '测试预案-有参数',
    incidentType: 'rear_end',
    severity: 'minor',
    actions: [
      { step: 1, actionType: 'led_display', parameters: { text: '前方事故，慢行' }, description: 'LED屏显示警示信息' },
      { step: 2, actionType: 'speed_limit', parameters: { speed: 60 }, description: '限速60' },
    ]
  });
  
  const planRes2 = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/plans',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  }, planData2);
  
  console.log('状态码:', planRes2.statusCode);
  if (planRes2.statusCode === 201) {
    console.log('✅ 新建预案成功！');
    console.log('  预案ID:', planRes2.body.id);
    console.log('  预案名称:', planRes2.body.name);
    console.log('  动作数:', planRes2.body.actions?.length || 0);
    planRes2.body.actions?.forEach((a, i) => {
      console.log(`    动作${i+1}: ${a.description} - parameters:`, a.parameters);
    });
  } else {
    console.log('❌ 新建预案失败:', JSON.stringify(planRes2.body));
  }

  // 测试4: 新建事件
  console.log('\n=== 测试4: 上报事件 ===');
  const incidentData = JSON.stringify({
    tunnelId: 1,
    mileage: 12500,
    type: 'breakdown',
    severity: 'minor',
    source: 'manual',
    reporterName: '测试员',
    description: '测试事件上报'
  });
  
  const incidentRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/incidents',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  }, incidentData);
  
  console.log('状态码:', incidentRes.statusCode);
  if (incidentRes.statusCode === 201) {
    console.log('✅ 事件上报成功！');
    console.log('  事件编号:', incidentRes.body.incidentNo);
    console.log('  事件状态:', incidentRes.body.status);
    console.log('  预案ID:', incidentRes.body.planId);
  } else {
    console.log('❌ 事件上报失败:', JSON.stringify(incidentRes.body));
  }

  console.log('\n=== 所有测试完成 ===');
}

main().catch(console.error);
