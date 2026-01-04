# 01 - 环境搭建与工具安装

## 📋 前置要求

### 必需软件

| 软件 | 版本要求 | 下载地址 |
|------|---------|---------|
| Node.js | >= 18.0.0 | https://nodejs.org/ |
| npm | >= 9.0.0 | 随 Node.js 安装 |
| VS Code | 最新版 | https://code.visualstudio.com/ |
| Git | 最新版 | https://git-scm.com/ |

### 检查安装

```bash
# 检查 Node.js 版本
node -v
# 应该显示 v18.x.x 或更高

# 检查 npm 版本
npm -v
# 应该显示 9.x.x 或更高

# 检查 Git 版本
git --version
```

## 🔧 VS Code 插件推荐

### 必装插件

| 插件名 | 用途 |
|--------|------|
| **ESLint** | 代码检查 |
| **Prettier** | 代码格式化 |
| **TypeScript Vue Plugin (Volar)** | TS 支持 |
| **Tailwind CSS IntelliSense** | Tailwind 智能提示 |
| **Auto Rename Tag** | 自动重命名标签 |
| **Error Lens** | 行内错误显示 |

### 推荐插件

| 插件名 | 用途 |
|--------|------|
| **GitLens** | Git 增强 |
| **Thunder Client** | API 测试 |
| **Import Cost** | 显示导入包大小 |
| **Path Intellisense** | 路径智能提示 |

## 📁 创建项目目录

```bash
# 创建项目目录
mkdir B2B-TeamSync-Frontend
cd B2B-TeamSync-Frontend
```

## 🚀 使用 Vite 创建 React + TypeScript 项目

```bash
# 使用 Vite 创建项目
npm create vite@latest . -- --template react-ts

# 安装依赖
npm install
```

## 📦 安装项目依赖

### 1. UI 组件库依赖

```bash
# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui 依赖
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge

# Radix UI 原语组件
npm install @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover
npm install @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator
npm install @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip

# 图标库
npm install lucide-react
```

### 2. 状态管理依赖

```bash
# Zustand - 客户端状态管理
npm install zustand

# TanStack Query - 服务端状态管理
npm install @tanstack/react-query

# nuqs - URL 状态同步
npm install nuqs
```

### 3. 表单与验证

```bash
# React Hook Form
npm install react-hook-form @hookform/resolvers

# Zod 验证
npm install zod
```

### 4. 路由与 HTTP

```bash
# React Router
npm install react-router-dom

# Axios
npm install axios
```

### 5. 其他工具

```bash
# 日期处理
npm install date-fns

# 日期选择器
npm install react-day-picker

# 表格组件
npm install @tanstack/react-table

# 命令面板
npm install cmdk

# Emoji 选择器
npm install emoji-mart @emoji-mart/data @emoji-mart/react

# Immer (不可变数据)
npm install immer
```

### 6. 开发依赖

```bash
# TypeScript 类型
npm install -D @types/node
```

## ✅ 验证安装

运行以下命令确保项目可以启动：

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173`，应该能看到 Vite + React 的默认页面。

## 📝 完整的 package.json

安装完成后，你的 `package.json` 应该类似这样：

```json
{
  "name": "b2b-teamsync-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@emoji-mart/data": "^1.2.1",
    "@emoji-mart/react": "^1.1.1",
    "@hookform/resolvers": "^3.9.1",
    "@radix-ui/react-avatar": "^1.1.2",
    "@radix-ui/react-checkbox": "^1.1.3",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-popover": "^1.1.4",
    "@radix-ui/react-scroll-area": "^1.2.2",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-separator": "^1.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.2",
    "@radix-ui/react-toast": "^1.2.4",
    "@radix-ui/react-tooltip": "^1.1.6",
    "@tanstack/react-query": "^5.62.11",
    "@tanstack/react-table": "^8.20.6",
    "axios": "^1.7.9",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "emoji-mart": "^5.6.0",
    "immer": "^10.1.1",
    "lucide-react": "^0.469.0",
    "nuqs": "^2.2.3",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.2",
    "react-router-dom": "^7.1.1",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.1",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@eslint/js": "^9.17.0",
    "@types/node": "^22.10.2",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.17.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.16",
    "globals": "^15.14.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.6.2",
    "typescript-eslint": "^8.18.2",
    "vite": "^6.0.5"
  }
}
```

---

## ➡️ 下一步

完成环境搭建后，请继续阅读 `02-project-initialization.md` 进行项目配置。
