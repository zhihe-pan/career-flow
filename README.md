# CareerFlow

面向校招与社招的 **求职过程驾驶舱**：用看板管理投递与面试节奏，配合简历素材库、面试日历与设置模块，把「机会—行动—复盘」收拢在一个界面里。界面采用玻璃拟态与暗色科技风，强调可读性与专注态。

---

## 功能概览

| 模块 | 说明 |
|------|------|
| **看板大厅** | 多阶段泳道（备选池 → 已投递 → 面试中 → Offer → 归档），支持拖拽改阶段、卡片详情、路径规划与 AI 相关入口 |
| **简历素材库** | 多版本素材管理与简历拼装相关能力 |
| **面试日历** | 面试排期与模拟面试舱（含波形、报告等演示向 UI） |
| **同窗交流** | 社区式面经与动态展示（示例数据） |
| **设置** | 个人信息、设备、隐私与 AI 偏好等配置 |

落地页与主应用分离：`/` 为介绍页，`/dashboard` 为工作台。

---

## 技术栈

- **框架**：React 18、TypeScript、Vite 5  
- **路由**：React Router 6  
- **状态**：Zustand（看板与业务数据）、TanStack Query（服务端状态占位）  
- **UI**：Tailwind CSS、shadcn/ui（Radix）、Framer Motion、Lucide Icons  
- **拖拽**：@dnd-kit  
- **后端 / BaaS（可选）**：Supabase 客户端与 Edge Functions（见 `supabase/`）

---

## 快速开始

### 环境要求

- Node.js **18+**（推荐 20 LTS）  
- 包管理器任选：`npm` / `pnpm` / `bun`

### 安装与运行

```bash
git clone https://github.com/zhihe-pan/CareerFlow.git
cd CareerFlow
npm install
npm run dev
```

浏览器访问终端提示的本地地址（一般为 `http://localhost:5173`）。

### 生产构建

```bash
npm run build
npm run preview   # 本地预览构建产物
```

---

## 环境变量

若使用 Supabase 等云端能力，请在项目根目录复制模板并填写：

```bash
cp .env.example .env
```

| 变量 | 说明 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | 匿名 / 可公开的前端密钥 |
| `VITE_SUPABASE_PROJECT_ID` | 项目 ID（若代码中有引用） |

**请勿将 `.env` 提交到 Git。** 仓库已通过 `.gitignore` 忽略该文件。

---

## 常用脚本

| 命令 | 作用 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run lint` | ESLint 检查 |
| `npm run test` | Vitest 单元测试（单次） |
| `npm run test:watch` | Vitest 监听模式 |

---

## 目录结构（节选）

```
src/
├── pages/           # 页面：Landing、Index（工作台）、NotFound
├── components/
│   ├── careerflow/  # 看板、简历库、日历、卡片与对话框等
│   ├── Settings/    # 设置各 Tab
│   └── ui/          # 通用 UI 组件
├── lib/             # 类型定义、store、工具函数
├── integrations/    # Supabase 客户端与类型
└── App.tsx          # 路由与全局 Provider
supabase/            # Supabase 配置与 Edge Functions
```

---

## GitHub Pages 部署

本仓库名为 `CareerFlow`，对应站点根路径为 **`/CareerFlow/`**，公开地址为：

**<https://zhihe-pan.github.io/CareerFlow/>**

### 一次性设置（在 GitHub 网页上）

1. 打开仓库 **Settings → Pages**。  
2. **Build and deployment** 里 **Source** 选择 **GitHub Actions**（不要选 Deploy from a branch）。  
3. 保存后，把默认分支的代码推送到 `main`，工作流 **Deploy to GitHub Pages** 会自动构建并发布。

### 构建说明

- 工作流使用 `npm run build -- --base=/CareerFlow/`，与 GitHub Pages 子路径一致。  
- 本地开发仍使用默认根路径 `npm run dev`，无需加 `base`。  
- 路由已通过 `BrowserRouter` 的 `basename` 与 `import.meta.env.BASE_URL` 对齐子路径。

若你 Fork 后仓库名不是 `CareerFlow`，请同时修改工作流里的 `--base=/你的仓库名/` 以及 Pages 文档中的 URL。

---

## 参与贡献

欢迎 Issue 与 Pull Request：先 Fork 本仓库，在分支上开发并尽量保持提交信息清晰可读。

---

## 许可证

若未另行指定，默认以仓库内 `LICENSE` 为准；若无 `LICENSE` 文件，使用前请与作者确认授权范围。

---

**作者**：Zhihe Pan · 仓库：<https://github.com/zhihe-pan/CareerFlow>
