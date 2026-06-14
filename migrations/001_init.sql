CREATE DATABASE IF NOT EXISTS tunnel_incident DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tunnel_incident;

CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(50) NOT NULL,
  `role` ENUM('admin','operator') NOT NULL DEFAULT 'operator',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB;

CREATE TABLE `tunnel` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `length` INT NOT NULL COMMENT '隧道长度(米)',
  `direction_count` TINYINT NOT NULL DEFAULT 2 COMMENT '方向数',
  `start_location` VARCHAR(200) NOT NULL,
  `end_location` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB;

CREATE TABLE `device` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tunnel_id` INT NOT NULL,
  `type` ENUM('led_screen','light_group','barrier','camera') NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `location` VARCHAR(200) NOT NULL,
  `mileage` INT NOT NULL COMMENT '里程桩位置(米)',
  `status` ENUM('online','offline','malfunction') NOT NULL DEFAULT 'online',
  `content` TEXT COMMENT 'LED屏显示内容或设备参数',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tunnel_id` (`tunnel_id`),
  CONSTRAINT `fk_device_tunnel` FOREIGN KEY (`tunnel_id`) REFERENCES `tunnel` (`id`)
) ENGINE=InnoDB;

CREATE TABLE `incident` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `incident_no` VARCHAR(20) NOT NULL,
  `tunnel_id` INT NOT NULL,
  `mileage` INT NOT NULL COMMENT '里程桩位置(米)',
  `type` ENUM('breakdown','rear_end','intrusion','fire','wrong_way','debris') NOT NULL,
  `severity` ENUM('minor','moderate','major','critical') NOT NULL,
  `source` ENUM('manual','video_detection','public_report') NOT NULL,
  `reporter_name` VARCHAR(50) DEFAULT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('pending','responding','resolved','closed') NOT NULL DEFAULT 'pending',
  `plan_id` INT DEFAULT NULL,
  `created_by` INT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `closed_at` DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_incident_no` (`incident_no`),
  KEY `idx_tunnel_id` (`tunnel_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_type_severity` (`type`, `severity`),
  CONSTRAINT `fk_incident_tunnel` FOREIGN KEY (`tunnel_id`) REFERENCES `tunnel` (`id`),
  CONSTRAINT `fk_incident_user` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`)
) ENGINE=InnoDB;

CREATE TABLE `emergency_plan` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `incident_type` ENUM('breakdown','rear_end','intrusion','fire','wrong_way','debris') NOT NULL,
  `severity` ENUM('minor','moderate','major','critical') NOT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type_severity` (`incident_type`, `severity`)
) ENGINE=InnoDB;

CREATE TABLE `plan_action` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `plan_id` INT NOT NULL,
  `step` INT NOT NULL,
  `action_type` ENUM('led_display','light_full','light_enhance','tunnel_close','tunnel_open','notify_fire','notify_medical','speed_limit') NOT NULL,
  `parameters` JSON NOT NULL,
  `description` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_plan_id` (`plan_id`),
  CONSTRAINT `fk_action_plan` FOREIGN KEY (`plan_id`) REFERENCES `emergency_plan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `plan_execution` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `incident_id` INT NOT NULL,
  `plan_id` INT NOT NULL,
  `status` ENUM('executing','completed','interrupted') NOT NULL DEFAULT 'executing',
  `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completed_at` DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_incident_id` (`incident_id`),
  CONSTRAINT `fk_execution_incident` FOREIGN KEY (`incident_id`) REFERENCES `incident` (`id`),
  CONSTRAINT `fk_execution_plan` FOREIGN KEY (`plan_id`) REFERENCES `emergency_plan` (`id`)
) ENGINE=InnoDB;

CREATE TABLE `action_execution` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `execution_id` INT NOT NULL,
  `action_id` INT NOT NULL,
  `status` ENUM('pending','executing','completed','skipped','adjusted','failed') NOT NULL DEFAULT 'pending',
  `parameters` JSON DEFAULT NULL,
  `operator_id` INT DEFAULT NULL,
  `remark` TEXT DEFAULT NULL,
  `started_at` DATETIME(3) DEFAULT NULL,
  `completed_at` DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_execution_id` (`execution_id`),
  CONSTRAINT `fk_action_exec_execution` FOREIGN KEY (`execution_id`) REFERENCES `plan_execution` (`id`),
  CONSTRAINT `fk_action_exec_action` FOREIGN KEY (`action_id`) REFERENCES `plan_action` (`id`),
  CONSTRAINT `fk_action_exec_user` FOREIGN KEY (`operator_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB;

CREATE TABLE `incident_timeline` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `incident_id` INT NOT NULL,
  `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `event` VARCHAR(100) NOT NULL,
  `operator_id` INT DEFAULT NULL,
  `detail` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_incident_id` (`incident_id`),
  KEY `idx_timestamp` (`timestamp`),
  CONSTRAINT `fk_timeline_incident` FOREIGN KEY (`incident_id`) REFERENCES `incident` (`id`),
  CONSTRAINT `fk_timeline_user` FOREIGN KEY (`operator_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB;

INSERT INTO `user` (`username`, `password`, `display_name`, `role`) VALUES
('admin', '$2a$10$PfdhA6XpDIQtjJ2sw55Pu.PWQ/Wh/N0wNTGTs0gLLMtEcz37doj1i', '系统管理员', 'admin'),
('operator01', '$2a$10$PfdhA6XpDIQtjJ2sw55Pu.PWQ/Wh/N0wNTGTs0gLLMtEcz37doj1i', '值班员张三', 'operator'),
('operator02', '$2a$10$PfdhA6XpDIQtjJ2sw55Pu.PWQ/Wh/N0wNTGTs0gLLMtEcz37doj1i', '值班员李四', 'operator');

INSERT INTO `tunnel` (`name`, `code`, `length`, `direction_count`, `start_location`, `end_location`) VALUES
('青山隧道', 'QS-001', 3200, 2, 'G15沈海高速K125+300', 'G15沈海高速K128+500'),
('龙门隧道', 'LM-002', 4500, 2, 'G15沈海高速K200+100', 'G15沈海高速K204+600'),
('云岭隧道', 'YL-003', 2800, 2, 'G25长深高速K88+500', 'G25长深高速K91+300');

INSERT INTO `device` (`tunnel_id`, `type`, `name`, `location`, `mileage`, `status`, `content`) VALUES
(1, 'led_screen', '青山隧道入口LED屏', '隧道入口前方200m', 0, 'online', '正常通行'),
(1, 'led_screen', '青山隧道中段LED屏', '隧道中段', 1600, 'online', '正常通行'),
(1, 'led_screen', '青山隧道出口LED屏', '隧道出口前方100m', 3200, 'online', '正常通行'),
(1, 'light_group', '青山隧道灯组A', '隧道入口-800m', 800, 'online', '{"brightness": 50}'),
(1, 'light_group', '青山隧道灯组B', '隧道800m-1600m', 1600, 'online', '{"brightness": 50}'),
(1, 'light_group', '青山隧道灯组C', '隧道1600m-2400m', 2400, 'online', '{"brightness": 50}'),
(1, 'light_group', '青山隧道灯组D', '隧道2400m-出口', 3200, 'online', '{"brightness": 50}'),
(1, 'barrier', '青山隧道入口拦车器', '隧道入口', 0, 'online', '{"closed": false}'),
(1, 'barrier', '青山隧道出口拦车器', '隧道出口', 3200, 'online', '{"closed": false}'),
(1, 'camera', '青山隧道入口摄像头', '隧道入口', 0, 'online', NULL),
(1, 'camera', '青山隧道中段摄像头', '隧道中段', 1600, 'online', NULL),
(1, 'camera', '青山隧道出口摄像头', '隧道出口', 3200, 'online', NULL),
(2, 'led_screen', '龙门隧道入口LED屏', '隧道入口前方200m', 0, 'online', '正常通行'),
(2, 'led_screen', '龙门隧道中段LED屏', '隧道中段', 2250, 'online', '正常通行'),
(2, 'led_screen', '龙门隧道出口LED屏', '隧道出口前方100m', 4500, 'online', '正常通行'),
(2, 'light_group', '龙门隧道灯组A', '隧道入口-1500m', 1500, 'online', '{"brightness": 50}'),
(2, 'light_group', '龙门隧道灯组B', '隧道1500m-3000m', 3000, 'online', '{"brightness": 50}'),
(2, 'light_group', '龙门隧道灯组C', '隧道3000m-出口', 4500, 'online', '{"brightness": 50}'),
(2, 'barrier', '龙门隧道入口拦车器', '隧道入口', 0, 'online', '{"closed": false}'),
(2, 'barrier', '龙门隧道出口拦车器', '隧道出口', 4500, 'online', '{"closed": false}'),
(3, 'led_screen', '云岭隧道入口LED屏', '隧道入口前方200m', 0, 'online', '正常通行'),
(3, 'led_screen', '云岭隧道出口LED屏', '隧道出口前方100m', 2800, 'online', '正常通行'),
(3, 'light_group', '云岭隧道灯组A', '隧道入口-1400m', 1400, 'online', '{"brightness": 50}'),
(3, 'light_group', '云岭隧道灯组B', '隧道1400m-出口', 2800, 'online', '{"brightness": 50}'),
(3, 'barrier', '云岭隧道入口拦车器', '隧道入口', 0, 'online', '{"closed": false}'),
(3, 'barrier', '云岭隧道出口拦车器', '隧道出口', 2800, 'online', '{"closed": false}');

INSERT INTO `emergency_plan` (`name`, `incident_type`, `severity`, `enabled`) VALUES
('车辆抛锚一般预案', 'breakdown', 'minor', 1),
('车辆抛锚较大预案', 'breakdown', 'moderate', 1),
('追尾事故较大预案', 'rear_end', 'moderate', 1),
('追尾事故重大预案', 'rear_end', 'major', 1),
('人员闯入重大预案', 'intrusion', 'major', 1),
('火灾重大预案', 'fire', 'major', 1),
('火灾特别重大预案', 'fire', 'critical', 1),
('车辆逆行重大预案', 'wrong_way', 'major', 1),
('物品散落一般预案', 'debris', 'minor', 1);

INSERT INTO `plan_action` (`plan_id`, `step`, `action_type`, `parameters`, `description`) VALUES
(1, 1, 'led_display', '{"text": "前方故障 慢行通过"}', '上游LED屏提示'),
(1, 2, 'light_enhance', '{"brightness": 80}', '隧道灯组增强照明'),
(2, 1, 'led_display', '{"text": "前方故障 注意避让"}', '上游LED屏告警'),
(2, 2, 'light_full', '{}', '隧道灯组全亮'),
(2, 3, 'speed_limit', '{"limit": 40}', '限速40km/h'),
(3, 1, 'led_display', '{"text": "前方事故 减速慢行"}', '上游LED屏告警'),
(3, 2, 'light_full', '{}', '隧道灯组全亮'),
(3, 3, 'speed_limit', '{"limit": 30}', '限速30km/h'),
(3, 4, 'notify_medical', '{"message": "隧道内追尾事故，需急救"}', '通知医疗急救'),
(4, 1, 'led_display', '{"text": "前方重大事故 禁止通行"}', '上游LED屏紧急告警'),
(4, 2, 'light_full', '{}', '隧道灯组全亮'),
(4, 3, 'tunnel_close', '{"direction": "both"}', '封闭隧道双向'),
(4, 4, 'notify_medical', '{"message": "隧道内重大追尾事故，需急救"}', '通知医疗急救'),
(5, 1, 'led_display', '{"text": "紧急：行人闯入 立即停车"}', 'LED屏紧急告警'),
(5, 2, 'light_full', '{}', '隧道灯组全亮'),
(5, 3, 'tunnel_close', '{"direction": "entry"}', '封闭隧道入口'),
(5, 4, 'speed_limit', '{"limit": 20}', '限速20km/h'),
(6, 1, 'led_display', '{"text": "火灾紧急 立即停车撤离"}', 'LED屏火灾告警'),
(6, 2, 'light_full', '{}', '隧道灯组全亮'),
(6, 3, 'tunnel_close', '{"direction": "both"}', '封闭隧道双向'),
(6, 4, 'notify_fire', '{"message": "隧道内火灾，需消防支援"}', '通知消防'),
(6, 5, 'notify_medical', '{"message": "隧道内火灾，需急救"}', '通知医疗急救'),
(7, 1, 'led_display', '{"text": "重大火灾 立即停车撤离"}', 'LED屏紧急告警'),
(7, 2, 'light_full', '{}', '隧道灯组全亮'),
(7, 3, 'tunnel_close', '{"direction": "both"}', '封闭隧道双向'),
(7, 4, 'notify_fire', '{"message": "隧道内重大火灾，紧急消防支援"}', '紧急通知消防'),
(7, 5, 'notify_medical', '{"message": "隧道内重大火灾，紧急急救"}', '紧急通知医疗'),
(7, 6, 'speed_limit', '{"limit": 0}', '全线停车'),
(8, 1, 'led_display', '{"text": "逆行车辆 紧急避让"}', 'LED屏紧急告警'),
(8, 2, 'light_full', '{}', '隧道灯组全亮'),
(8, 3, 'tunnel_close', '{"direction": "entry"}', '封闭隧道入口'),
(8, 4, 'speed_limit', '{"limit": 0}', '紧急停车'),
(9, 1, 'led_display', '{"text": "前方散落物 注意避让"}', '上游LED屏提示'),
(9, 2, 'light_enhance', '{"brightness": 80}', '隧道灯组增强照明');
