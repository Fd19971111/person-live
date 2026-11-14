# 生活集 · Personal Space

把记账、计划、学习、灵感、电影、旅行、运动、音乐、相册收进同一个界面 —— 一个自托管的个人生活数据工作台。

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Go](https://img.shields.io/badge/Go-1.27-00ADD8?logo=go&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

<!-- 截图建议放在 docs/screenshots/ 下，放好后取消下面两行的注释 -->
<!-- ![仪表盘](docs/screenshots/dashboard.png) -->
<!-- ![记账](docs/screenshots/finance.png) -->

## 为什么做这个

市面上的工具都在做单一领域：记账一个 App、待办一个 App、相册一个 App。但它们共享同一份生活，数据却被切成互不相识的几块。

这里换了个思路：九个生活域共用一套模块系统、一套设计语言、一个数据库。模块可以增删、可以拖拽排序，某个领域暂时不想用就隐藏，数据保留，随时加回。

所有数据都在自己的服务器上，不依赖任何第三方服务，也不会因为某个 App 停止运营而丢失。

## 功能

| 模块 | 能力 |
| --- | --- |
| 仪表盘 | 本月结余、学习与运动连续天数、常听歌曲等跨域聚合，一屏看完全部生活指标 |
| 记账 | 收支流水、分类占比环形图、月度趋势折线、CSV 批量导入导出、多条件筛选、分页 |
| 计划 | 看板视图（待处理 / 进行中 / 已完成）、拖拽换列、截止日、手动排序 |
| 学习 | 课程进度（章 / 节 / 课可切换）、学习时长记录、笔记与标签、周目标、连续天数 |
| 灵感 | 卡片流、标签、来源（链接或书名）、置顶、卡片配色 |
| 电影 | 想看 / 在看 / 已看完、个人评分、导演与年份、类型标签 |
| 旅行 | 目的地、省份 / 国家、出发日期、天数、星级回顾 |
| 运动 | 项目、时长、公里、千卡、近 7 日柱状统计 |
| 音乐 | 歌单、歌手、专辑、星级（只做记录，不含音频文件与播放器） |
| 相册 | 分类、批量上传、备注、占用统计、只读分享链接 |
| 设计系统 | 主题配色、玻璃质感档位、圆角、密度、动效，全站实时生效 |
| 数据导出 | 一键把全部业务表与相册原图打包成 ZIP |

## 技术栈

**前端** React 19 · Vite 8 · TypeScript 5 · Tailwind CSS 4 · 自研设计系统（未使用 UI 组件库）

**后端** Go 1.27 · GoFrame v2 · MySQL 8 · JWT（access + refresh）· bcrypt

## 架构

```
浏览器
  │
  ├─ web/  React 单页应用（Vite 开发服务器 :5173）
  │     └─ /api、/uploads 由 Vite 代理到后端
  │
  └─ api/  Go HTTP 服务（:8000）
        ├─ /api/*        业务接口，JWT 鉴权
        ├─ /api/public/* 免登录只读接口（相册分享）
        ├─ /uploads/*    相册静态文件
        └─ MySQL         业务数据
```

```
person-live/
├─ api/                      Go 后端
│  ├─ api/                   接口定义（按业务域分 v1 包，用 g.Meta 声明路由）
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
   └─ src/theme.ts           设计系统（主题 / 玻璃 / 圆角 / 密度）
```

## 快速开始

### 环境要求

- Go 1.27 及以上
- Node.js 20 及以上 + pnpm
- MySQL 8

### 1. 克隆

```bash
git clone https://github.com/Fd19971111/person-live.git
cd person-live
```

### 2. 建库

```sql
CREATE DATABASE study DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 修改配置

编辑 `api/manifest/config/config.yaml`：

```yaml
database:
  default:
    link: "mysql:用户名:密码@tcp(127.0.0.1:3306)/study?charset=utf8mb4&parseTime=true&loc=UTC"

jwt:
  secret: "换成你自己的随机字符串"
```

### 4. 建表并启动后端

```bash
cd api
go mod download
go run ./cmd/migrate     # 建表，可重复执行，已应用的版本会自动跳过
go run ./cmd/seed        # 可选：创建演示账号 admin / 123456 并写入演示数据
go run main.go           # 服务监听 :8000
```

### 5. 启动前端

```bash
cd web
pnpm install
pnpm dev                 # http://localhost:5173
```

用 `admin / 123456` 登录，也可以直接注册新账号。未接入 SMTP 时，邮箱验证链接会打印在后端日志里。

生产构建执行 `pnpm build`，产物在 `web/dist`，交给 Nginx 托管并把 `/api`、`/uploads` 反向代理到后端即可。

## 配置说明

`api/manifest/config/config.yaml` 中的关键项：

| 配置 | 说明 |
| --- | --- |
| `server.address` | 监听地址，默认 `:8000` |
| `database.default.link` | MySQL 连接串 |
| `jwt.secret` | 令牌签名密钥，**部署前必须替换** |
| `jwt.accessTtl` / `refreshTtl` | 访问令牌与刷新令牌有效期 |
| `auth.cookieSecure` | 走 HTTPS 时置为 `true` |
| `auth.webBaseUrl` | 邮件中验证链接的前端地址 |

接口的 OpenAPI 描述在 `http://localhost:8000/api.json`，Swagger 界面在 `/swagger`。

## 实现细节

几个自己比较满意的地方：

- **鉴权**：access token 只存在内存，refresh token 走 HttpOnly Cookie。前端 401 时自动续期并重放原请求，用户无感知。会话按 family 管理，改密码可踢掉全部设备。
- **模块化**：`user_module` 一张表管理九个领域的显示、排序与隐藏。"删除"只是置 `hidden`，数据不动，随时加回。
- **迁移机制**：`cmd/migrate` 用 `schema_migration` 记录已应用版本，SQL 按文件名顺序执行，重复运行安全。
- **数据可携带**：`GET /api/user/export` 把 16 张业务表与相册原图打成 ZIP，导出内容不含密码哈希与会话令牌。
- **只读分享**：相册分享用 HMAC 签名令牌自证，服务端不建表。令牌带有效期与相册范围，分享单个相册不会泄露其他相册的名字。
- **设计系统**：主题、玻璃档位、圆角、密度、动效全部走 CSS 变量，切换即时生效并持久化到浏览器。

## Roadmap

- [ ] 数据导入（目前只支持导出）
- [ ] 移动端布局适配
- [ ] Docker Compose 一键部署
- [ ] 更多生活领域模块

## 参与贡献

欢迎提 Issue 和 PR。提交前请确保 `go build ./...` 与 `pnpm build` 都能通过。

## License

[MIT](LICENSE)
