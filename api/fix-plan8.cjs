const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'tunnel_incident'
  });

  try {
    // 给 plan 8 添加动作
    const actions = [
      { plan_id: 8, step: 1, action_type: 'led_display', parameters: JSON.stringify({ text: '前方事故，减速慢行' }), description: '上游LED屏显示警示信息' },
      { plan_id: 8, step: 2, action_type: 'light_full', parameters: JSON.stringify({}), description: '隧道内灯光全部拉亮' },
      { plan_id: 8, step: 3, action_type: 'speed_limit', parameters: JSON.stringify({ speed: 60 }), description: '限速60公里/小时' },
    ];

    for (const action of actions) {
      await connection.execute(
        'INSERT INTO plan_action (plan_id, step, action_type, parameters, description) VALUES (?, ?, ?, ?, ?)',
        [action.plan_id, action.step, action.action_type, action.parameters, action.description]
      );
      console.log(`Added action ${action.step} to plan ${action.plan_id}: ${action.description}`);
    }

    // 验证
    const [rows] = await connection.execute(
      'SELECT * FROM plan_action WHERE plan_id = ? ORDER BY step',
      [8]
    );
    console.log('\nPlan 8 actions:');
    rows.forEach(r => console.log(`  ${r.step}. ${r.action_type} - ${r.description}`));
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
