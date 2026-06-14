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
    // 检查现有预案
    const [plans] = await connection.execute('SELECT id, name, incident_type, severity FROM emergency_plan ORDER BY id');
    console.log('现有预案:');
    plans.forEach(p => console.log(`  ${p.id}. ${p.name} (${p.incident_type} + ${p.severity})`));

    // 补充缺失的预案模板
    const missingPlans = [
      {
        name: '车辆抛锚-较大事故处置预案',
        incidentType: 'breakdown',
        severity: 'moderate',
        actions: [
          { step: 1, action_type: 'led_display', parameters: JSON.stringify({ text: '前方事故，减速慢行' }), description: '上游LED屏显示警示信息' },
          { step: 2, action_type: 'light_full', parameters: JSON.stringify({}), description: '隧道内灯光全部拉亮' },
          { step: 3, action_type: 'speed_limit', parameters: JSON.stringify({ speed: 60 }), description: '限速60公里/小时' },
        ],
      },
      {
        name: '追尾事故-一般事故处置预案',
        incidentType: 'rear_end',
        severity: 'minor',
        actions: [
          { step: 1, action_type: 'led_display', parameters: JSON.stringify({ text: '前方事故，注意避让' }), description: '上游LED屏显示警示信息' },
          { step: 2, action_type: 'light_enhance', parameters: JSON.stringify({ brightness: 80 }), description: '增强隧道内照明' },
        ],
      },
      {
        name: '追尾事故-重大事故处置预案',
        incidentType: 'rear_end',
        severity: 'major',
        actions: [
          { step: 1, action_type: 'led_display', parameters: JSON.stringify({ text: '前方事故，请减速停车' }), description: '上游LED屏显示警示信息' },
          { step: 2, action_type: 'light_full', parameters: JSON.stringify({}), description: '隧道内灯光全部拉亮' },
          { step: 3, action_type: 'tunnel_close', parameters: JSON.stringify({ direction: 'single' }), description: '封闭事故方向车道' },
          { step: 4, action_type: 'notify_medical', parameters: JSON.stringify({}), description: '通知医疗急救' },
        ],
      },
      {
        name: '人员闯入-较大事故处置预案',
        incidentType: 'intrusion',
        severity: 'moderate',
        actions: [
          { step: 1, action_type: 'led_display', parameters: JSON.stringify({ text: '注意行人，减速避让' }), description: 'LED屏提示注意行人' },
          { step: 2, action_type: 'light_full', parameters: JSON.stringify({}), description: '隧道内灯光全部拉亮' },
          { step: 3, action_type: 'speed_limit', parameters: JSON.stringify({ speed: 40 }), description: '限速40公里/小时' },
        ],
      },
    ];

    for (const plan of missingPlans) {
      // 检查是否已存在
      const [existing] = await connection.execute(
        'SELECT id FROM emergency_plan WHERE incident_type = ? AND severity = ?',
        [plan.incidentType, plan.severity]
      );
      
      if (existing.length > 0) {
        console.log(`\n预案已存在，跳过: ${plan.name}`);
        continue;
      }

      // 插入预案
      const [result] = await connection.execute(
        'INSERT INTO emergency_plan (name, incident_type, severity, enabled) VALUES (?, ?, ?, 1)',
        [plan.name, plan.incidentType, plan.severity]
      );
      
      const planId = result.insertId;
      console.log(`\n创建预案: ${plan.name} (ID: ${planId})`);

      // 插入动作
      for (const action of plan.actions) {
        await connection.execute(
          'INSERT INTO plan_action (plan_id, step, action_type, parameters, description) VALUES (?, ?, ?, ?, ?)',
          [planId, action.step, action.action_type, action.parameters, action.description]
        );
        console.log(`  - 动作${action.step}: ${action.description}`);
      }
    }

    console.log('\n完成！');
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
