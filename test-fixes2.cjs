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

  // 测试1: 复盘报告 - 传递字符串形式的 page/pageSize
  console.log('\n=== 测试1: 复盘报告列表 (字符串参数) ===');
  const reportRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/reports?page=1&pageSize=20',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  console.log('状态码:', reportRes.statusCode);
  if (reportRes.statusCode === 200) {
    console.log('✅ 复盘报告查询成功！');
    console.log('  总数:', reportRes.body.total);
    console.log('  报告数:', reportRes.body.items?.length || 0);
  } else {
    console.log('❌ 复盘报告查询失败:', JSON.stringify(reportRes.body));
  }

  // 测试2: 复盘报告 - 带日期筛选
  console.log('\n=== 测试2: 复盘报告列表 (带日期筛选) ===');
  const reportRes2 = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/reports?page=1&pageSize=10&startDate=2026-01-01&endDate=2026-12-31',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  console.log('状态码:', reportRes2.statusCode);
  if (reportRes2.statusCode === 200) {
    console.log('✅ 复盘报告查询成功！');
    console.log('  总数:', reportRes2.body.total);
    console.log('  报告数:', reportRes2.body.items?.length || 0);
  } else {
    console.log('❌ 复盘报告查询失败:', JSON.stringify(reportRes2.body));
  }

  // 测试3: 复盘报告统计
  console.log('\n=== 测试3: 复盘报告统计 ===');
  const statsRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/reports/stats',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  console.log('状态码:', statsRes.statusCode);
  if (statsRes.statusCode === 200) {
    console.log('✅ 复盘报告统计查询成功！');
    console.log('  总事件数:', statsRes.body.totalIncidents);
    console.log('  待处置:', statsRes.body.pendingIncidents);
    console.log('  已处置:', statsRes.body.resolvedIncidents);
    console.log('  今日事件:', statsRes.body.todayIncidents);
    console.log('  平均响应:', statsRes.body.avgResponseTime);
  } else {
    console.log('❌ 复盘报告统计查询失败:', JSON.stringify(statsRes.body));
  }

  // 测试4: 事件列表 - 再次验证
  console.log('\n=== 测试4: 事件列表 (字符串参数) ===');
  const incidentRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/incidents?page=1&pageSize=10',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  console.log('状态码:', incidentRes.statusCode);
  if (incidentRes.statusCode === 200) {
    console.log('✅ 事件列表查询成功！');
    console.log('  总数:', incidentRes.body.total);
    console.log('  事件数:', incidentRes.body.items?.length || 0);
  } else {
    console.log('❌ 事件列表查询失败:', JSON.stringify(incidentRes.body));
  }

  console.log('\n=== 所有测试完成 ===');
  console.log('\n前端功能需要在浏览器中手动验证：');
  console.log('1. 通知中心 - 点击单条通知应标记为已读');
  console.log('2. 通知中心 - 点击"全部已读"应标记所有为已读');
  console.log('3. 全屏按钮 - 点击应切换全屏状态');
}

main().catch(console.error);
