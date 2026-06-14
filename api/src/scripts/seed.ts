import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Tunnel } from '../entities/tunnel.entity';
import { Device, DeviceType, DeviceStatus } from '../entities/device.entity';
import { EmergencyPlan } from '../entities/emergency-plan.entity';
import { PlanAction, ActionType } from '../entities/plan-action.entity';
import { IncidentType, Severity } from '../entities/incident.entity';

const dataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'tunnel_incident',
  entities: [__dirname + '/../entities/**/*.entity.{ts,js}'],
  synchronize: true,
});

async function runSeed() {
  console.log('Seeding database...');
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const tunnelRepo = dataSource.getRepository(Tunnel);
  const deviceRepo = dataSource.getRepository(Device);
  const planRepo = dataSource.getRepository(EmergencyPlan);
  const planActionRepo = dataSource.getRepository(PlanAction);

  const existingUsers = await userRepo.count();
  if (existingUsers === 0) {
    const hashedPwd = bcrypt.hashSync('123456', 10);
    await userRepo.save([
      userRepo.create({ username: 'admin', password: hashedPwd, displayName: '系统管理员', role: 'admin' as any }),
      userRepo.create({ username: 'operator01', password: hashedPwd, displayName: '值班员张三', role: 'operator' as any }),
      userRepo.create({ username: 'operator02', password: hashedPwd, displayName: '值班员李四', role: 'operator' as any }),
    ]);
    console.log('Users seeded.');
  }

  const existingTunnels = await tunnelRepo.count();
  let tunnels: Tunnel[] = [];
  if (existingTunnels === 0) {
    tunnels = await tunnelRepo.save([
      tunnelRepo.create({ name: '莲花山隧道', code: 'LHS-001', length: 3200, directionCount: 2, startLocation: 'K120+000', endLocation: 'K123+200' }),
      tunnelRepo.create({ name: '青山隧道', code: 'QS-002', length: 2800, directionCount: 2, startLocation: 'K150+000', endLocation: 'K152+800' }),
      tunnelRepo.create({ name: '凤凰岭隧道', code: 'FHL-003', length: 4500, directionCount: 2, startLocation: 'K200+000', endLocation: 'K204+500' }),
    ]);
    console.log('Tunnels seeded.');
  } else {
    tunnels = await tunnelRepo.find();
  }

  const existingDevices = await deviceRepo.count();
  if (existingDevices === 0) {
    const devices: Device[] = [];
    for (const tunnel of tunnels) {
      const types: DeviceType[] = [DeviceType.LED_SCREEN, DeviceType.LIGHT_GROUP, DeviceType.BARRIER, DeviceType.CAMERA];
      const typeNames: Record<DeviceType, string[]> = {
        [DeviceType.LED_SCREEN]: ['入口LED屏', '中间段LED屏', '出口LED屏'],
        [DeviceType.LIGHT_GROUP]: ['入口照明组', '中段照明组', '出口照明组'],
        [DeviceType.BARRIER]: ['入口道闸', '出口道闸'],
        [DeviceType.CAMERA]: ['摄像头1号', '摄像头2号', '摄像头3号', '摄像头4号'],
      };
      for (const type of types) {
        const names = typeNames[type];
        const step = Math.floor(tunnel.length / (names.length + 1));
        names.forEach((name, idx) => {
          devices.push(deviceRepo.create({
            tunnelId: tunnel.id,
            type,
            name: `${tunnel.name}-${name}`,
            location: `K${Math.floor((step * (idx + 1)) / 1000)}+${(step * (idx + 1)) % 1000}`,
            mileage: step * (idx + 1),
            status: DeviceStatus.ONLINE,
            content: type === DeviceType.LED_SCREEN ? '正常通行' : null,
          }));
        });
      }
    }
    await deviceRepo.save(devices);
    console.log('Devices seeded.');
  }

  const existingPlans = await planRepo.count();
  if (existingPlans === 0) {
    const plans = [
      {
        name: '车辆抛锚-一般事故处置预案',
        type: IncidentType.BREAKDOWN,
        severity: Severity.MINOR,
        actions: [
          { step: 1, actionType: ActionType.LED_DISPLAY, parameters: { text: '前方事故，慢行' }, description: '上游LED屏显示警示信息' },
          { step: 2, actionType: ActionType.LIGHT_ENHANCE, parameters: { brightness: 80 }, description: '增强隧道内照明亮度' },
        ],
      },
      {
        name: '车辆抛锚-重大事故处置预案',
        type: IncidentType.BREAKDOWN,
        severity: Severity.MAJOR,
        actions: [
          { step: 1, actionType: ActionType.LED_DISPLAY, parameters: { text: '前方事故，请减速' }, description: '上游LED屏显示警示信息' },
          { step: 2, actionType: ActionType.LIGHT_FULL, parameters: {}, description: '隧道内灯光全部拉亮' },
          { step: 3, actionType: ActionType.SPEED_LIMIT, parameters: { speed: 40 }, description: '限速40公里/小时' },
        ],
      },
      {
        name: '追尾事故-较大事故处置预案',
        type: IncidentType.REAR_END,
        severity: Severity.MODERATE,
        actions: [
          { step: 1, actionType: ActionType.LED_DISPLAY, parameters: { text: '前方事故，减速慢行' }, description: '上游LED屏显示警示信息' },
          { step: 2, actionType: ActionType.LIGHT_FULL, parameters: {}, description: '隧道内灯光全部拉亮' },
          { step: 3, actionType: ActionType.NOTIFY_MEDICAL, parameters: {}, description: '通知医疗急救' },
        ],
      },
      {
        name: '人员闯入-一般事故处置预案',
        type: IncidentType.INTRUSION,
        severity: Severity.MINOR,
        actions: [
          { step: 1, actionType: ActionType.LED_DISPLAY, parameters: { text: '注意避让行人' }, description: 'LED屏提示注意避让' },
          { step: 2, actionType: ActionType.LIGHT_ENHANCE, parameters: { brightness: 80 }, description: '增强照明便于观察' },
        ],
      },
      {
        name: '火灾-特别重大事故处置预案',
        type: IncidentType.FIRE,
        severity: Severity.CRITICAL,
        actions: [
          { step: 1, actionType: ActionType.LED_DISPLAY, parameters: { text: '前方火灾，立即停车撤离' }, description: '上游LED屏显示火灾警示' },
          { step: 2, actionType: ActionType.LIGHT_FULL, parameters: {}, description: '隧道内灯光全部拉亮' },
          { step: 3, actionType: ActionType.TUNNEL_CLOSE, parameters: { direction: 'both' }, description: '封闭隧道双向交通' },
          { step: 4, actionType: ActionType.NOTIFY_FIRE, parameters: {}, description: '通知消防部门' },
          { step: 5, actionType: ActionType.NOTIFY_MEDICAL, parameters: {}, description: '通知医疗急救' },
        ],
      },
      {
        name: '车辆逆行-重大事故处置预案',
        type: IncidentType.WRONG_WAY,
        severity: Severity.MAJOR,
        actions: [
          { step: 1, actionType: ActionType.LED_DISPLAY, parameters: { text: '注意对向车辆，减速' }, description: 'LED屏提示注意逆行车辆' },
          { step: 2, actionType: ActionType.LIGHT_FULL, parameters: {}, description: '隧道内灯光全部拉亮' },
          { step: 3, actionType: ActionType.TUNNEL_CLOSE, parameters: { direction: 'single' }, description: '封闭逆行方向' },
        ],
      },
      {
        name: '物品散落-一般事故处置预案',
        type: IncidentType.DEBRIS,
        severity: Severity.MINOR,
        actions: [
          { step: 1, actionType: ActionType.LED_DISPLAY, parameters: { text: '前方路障，注意避让' }, description: 'LED屏提示注意路障' },
          { step: 2, actionType: ActionType.LIGHT_ENHANCE, parameters: { brightness: 70 }, description: '增强照明' },
        ],
      },
    ];

    for (const planData of plans) {
      const plan = planRepo.create({
        name: planData.name,
        incidentType: planData.type,
        severity: planData.severity,
        enabled: true,
      });
      const savedPlan = await planRepo.save(plan);
      const actions = planData.actions.map((a) =>
        planActionRepo.create({
          planId: savedPlan.id,
          step: a.step,
          actionType: a.actionType,
          parameters: a.parameters,
          description: a.description,
        }),
      );
      await planActionRepo.save(actions);
    }
    console.log('Plans seeded.');
  }

  console.log('Database seeded successfully!');
  await dataSource.destroy();
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
