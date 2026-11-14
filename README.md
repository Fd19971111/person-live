# 生活集 · Personal Space

一个自托管的个人生活数据工作台：把记账、计划、学习、灵感、电影、旅行、运动、音乐、相册九个生活域
收进同一套界面里，用一张用户模块表自由增减与排序，一屏仪表盘跨域聚合。

前后端分离，数据全部保存在自己的数据库与磁盘上，不依赖任何第三方服务。

---

## 功能模块

| 模块 | 能力 |
| --- | --- |
| 仪表盘 | 本月结余、学习/运动连续天数、常听歌曲等跨域聚合，4 个统计块 + 4 张卡片 |
| 记账 | 收支流水、分类占比环形图、月度趋势折线、CSV 批量导入/导出、多条件筛选、分页 |
| 计划 | 看板视图（待处理 / 进行中 / 已完成）、拖拽换列、截止日、手动排序 |
| 学习 | 课程进度（章/节/课可切换）、学习时长记录、笔记与标签、周目标、连续天数 |
| 灵感 | 卡片流、标签、来源（链接/书名）、置顶、卡片配色 |
| 电影 | 想看/在看/已看完、个人评分、导演与年份、类型标签 |
| 旅行 | 目的地、省份/国家、出发日期、天数、星级回顾 |
| 运动 | 项目、时长、公里、千卡、近 7 日柱状统计 |
| 音乐 | 歌单、歌手、专辑、星级（只做记录，不含音频文件与播放器） |
| 相册 | 分类、批量上传、备注、占用统计、**只读分享链接** |
| 设计系统 | 主题配色、玻璃质感档位、圆角、密度、动效，全站实时生效 |
| 数据导出 | 一键打包全部业务表 + 相册原图为 ZIP |

## 技术栈

**前端** React 19 · Vite 8 · TypeScript 5 · Tailwind CSS 4 · 自研设计系统（无 UI 组件库）

**后端** Go 1.27 · GoFrame v2 · MySQL 8 · JWT（access + refresh）· bcrypt

## 目录结构

```
person-live/
├─ api/                      Go 后端
│  ├─ api/                   接口定义（按业务域分 v1 包，g.Meta 声明路由）
│  ├─ cmd/
│  │  ├─ migrate/            按文件名顺序执行 SQL 并记录版本
│  │  └─ seed/               创建演示账号与演示数据
│  ├─ internal/
│  │  ├─ cmd/                路由注册与服务启动
│  │  ├─ controller/         控制器（只做参数转换）
│  │  ├─ logic/              业务逻辑（按域分包）
│  │  ├─ middleware/         JWT 鉴权中间件
│  │  └─ consts/             上下文键与常量
│  ├─ manifest/
│  │  ├─ config/config.yaml  配置
│  │  └─ sql/                建表与演示数据脚本
│  └─ storage/album/         相册文件（按 user_id 分目录）
└─ web/                      React 前端
   ├─ src/api/               接口封装（统一 request：自动带 token、401 刷新重放）
   ├─ src/features/          按模块拆分的页面
   ├─ src/components/        通用组件与图标
   ├─ src/auth/              登录态与鉴权页
   └─ src/theme.ts           设计系统（主题/玻璃/圆角/密度）
```

## 快速开始

### 环境要求

- Go 1.27 及以上
- Node.js 20 及以上，pnpm
- MySQL 8

### 1. 准备数据库

```sql
CREATE DATABASE study DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 修改配置

编辑 `api/manifest/config/config.yaml`：

```yaml
database:
  default:
    link: "mysql:用户名:密码@tcp(127.0.0.1:3306)/study?charset=utf8mb4&parseTime=true&loc=UTC"

jwt:
  secret: "换成你自己的随机字符串"   # 上线前必须替换
```

### 3. 建表并启动后端

```bash
cd api
go mod download
go run ./cmd/migrate     # 建表，可重复执行，已应用的版本会跳过
go run ./cmd/seed        # 可选：创建演示账号 admin / 123456 并写入演示数据
go run main.go           # 服务监听 :8000
```

### 4. 启动前端

```bash
cd web
pnpm install
pnpm dev                 # http://localhost:5173
```

开发环境下 Vite 已把 `/api` 与 `/uploads` 代理到 `http://127.0.0.1:8000`，无需额外配置。
生产构建执行 `pnpm build`，产物在 `web/dist`，交给 Nginx 托管并把 `/api`、`/uploads` 反向代理到后端即可。

用 `admin / 123456` 登录，或自行注册新账号（注册后邮箱验证链接会打印在后端日志里，未接 SMTP 时不会真的发信）。

## 可讲的技术点

- **鉴权**：access token 只存内存，refresh token 走 HttpOnly Cookie，401 时自动续期并重放请求；会话按 family 管理，支持踢下线。
- **模块化**：`user_module` 表统一管理模块的显示、排序、隐藏，删除即隐藏，可随时加回，数据不丢。
- **迁移机制**：`cmd/migrate` 记录 `schema_migration` 版本表，SQL 按文件名顺序执行，重复运行安全。
- **数据可携带**：`GET /api/user/export` 把 16 张业务表与相册原图打成 ZIP，导出内容不含密码哈希与会话令牌。
- **只读分享**：相册分享用 HMAC 签名令牌自证，服务端不建表；令牌带有效期与相册范围，分享单个相册不会泄露其他相册。
- **设计系统**：主题、玻璃档位、圆角、密度、动效全部走 CSS 变量，切换即时生效并持久化到浏览器。

## 常见问题

**后端启动报 `listen tcp :8000: bind`**
端口被占用，改 `config.yaml` 里的 `server.address`，或结束占用 8000 的进程。

**前端页面空白 / 接口 404**
确认后端已在 8000 端口运行；生产环境检查 Nginx 是否把 `/api` 与 `/uploads` 代理到了后端。

**登录后立刻掉线**
检查浏览器是否拦截了 Cookie，或 `auth.cookieSecure` 与当前是否 HTTPS 是否匹配。

**相册上传失败**
确认 `api/storage/album` 目录可写（程序启动时会自动创建）。

## 许可

本源码仅供购买者本人学习与二次开发使用，不得转售、公开分发或用于商业售卖。
不含部署服务与定制开发。

## 技术栈关键词

React 19 / Vite / TypeScript / Tailwind CSS / GoFrame / Go / MySQL / JWT / RBAC / 前后端分离 / 个人管理系统 / 生活管理 / 记账系统 / 毕设 / 课程设计
