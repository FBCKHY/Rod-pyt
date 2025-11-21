-- 更新订阅状态枚举类型,添加 'pending' 和 'contacted' 状态
-- 注意: 在MySQL中修改ENUM类型需要使用ALTER TABLE MODIFY

ALTER TABLE subscriptions 
MODIFY COLUMN status ENUM('subscribed', 'unsubscribed', 'pending', 'contacted') 
DEFAULT 'subscribed' 
COMMENT '订阅状态';
