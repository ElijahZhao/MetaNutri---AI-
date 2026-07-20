# 部署指南

## 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 4GB 内存
- 至少 10GB 磁盘空间

## Docker 部署

### 一键启动

```bash
docker-compose up -d
```

### 服务访问

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:3000 |
| 后端 | http://localhost:8000 |
| Redis | http://localhost:6379 |

### 配置环境变量

创建 `.env` 文件：

```env
# 后端配置
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///./app.db
REDIS_URL=redis://redis:6379/0

# JWT配置
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# 前端配置
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 停止服务

```bash
docker-compose down
```

### 查看日志

```bash
docker-compose logs -f
```

## 生产环境部署

### Nginx 反向代理

创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL 配置

使用 Let's Encrypt 配置 HTTPS：

```bash
certbot --nginx -d your-domain.com
```

### 数据库迁移

```bash
docker-compose exec backend python -m app.scripts.import_sample_data
```

## 监控

### 健康检查

后端提供健康检查接口：

```http
GET /health
```

响应：

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 日志收集

配置 ELK Stack 收集日志：

1. 安装 Elasticsearch、Logstash、Kibana
2. 配置 Logstash 输入来自 Docker 容器
3. 在 Kibana 中创建仪表盘

## 性能优化

### Redis 缓存

Redis 用于缓存：

- 用户认证信息
- 数据查询结果
- 预测模型结果

### 数据库优化

- 为常用查询字段创建索引
- 定期清理过期数据
- 使用连接池管理数据库连接

### 前端优化

- 启用 Gzip 压缩
- 使用 CDN 加速静态资源
- 配置浏览器缓存策略

## 备份

### 数据库备份

```bash
docker-compose exec backend sqlite3 app.db ".backup backup.db"
```

### 自动备份脚本

创建 `backup.sh`：

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec backend sqlite3 app.db ".backup /backup/backup_$DATE.db"
find /backup -name "*.db" -mtime +7 -delete
```

配置 cron 定时执行：

```bash
0 2 * * * /path/to/backup.sh
```

## 升级

### 更新代码

```bash
git pull origin main
docker-compose up -d --build
```

### 数据迁移

如果数据库 schema 有变化：

```bash
docker-compose exec backend python -m app.scripts.migrate
```

## 故障排除

### 服务无法启动

检查 Docker Compose 配置：

```bash
docker-compose config
```

### 数据库连接失败

确保数据库文件权限正确：

```bash
chown -R 1000:1000 backend/data
```

### 前端无法访问后端

检查防火墙设置：

```bash
ufw allow 8000/tcp
```

### 内存不足

增加 Docker 可用内存或调整资源限制：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
```
