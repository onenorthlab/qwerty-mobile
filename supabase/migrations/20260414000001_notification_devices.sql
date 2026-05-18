-- Migration: notification_devices
-- Round 11 — Push Notifications
-- 设备注册表：记录每台已安装应用的设备信息

CREATE TABLE IF NOT EXISTS public.notification_devices (
  id TEXT PRIMARY KEY,                        -- 设备唯一 ID（客户端生成，持久化）
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_name TEXT,                           -- 设备名称，例如 "张三的 iPhone"
  app_version TEXT,                           -- 应用版本号
  onesignal_player_id TEXT,                   -- OneSignal Player ID（用于定向推送）
  is_current_device BOOLEAN NOT NULL DEFAULT false,
  is_push_enabled BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引：加速按用户查询
CREATE INDEX IF NOT EXISTS idx_notification_devices_user_id
  ON public.notification_devices(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_devices_user_status
  ON public.notification_devices(user_id, status);

-- 唯一约束：同一用户不能重复注册同一个 OneSignal Player ID
CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_devices_player_id
  ON public.notification_devices(user_id, onesignal_player_id)
  WHERE onesignal_player_id IS NOT NULL AND status = 'active';

-- 行级安全（RLS）：用户只能读写自己的设备记录
ALTER TABLE public.notification_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notification devices"
  ON public.notification_devices FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
