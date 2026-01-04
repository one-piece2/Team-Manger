# B2B TeamSync 前端项目实现指南

## 📋 项目概述

这是一个 **B2B 团队协作项目管理平台** 的前端实现指南，帮助你从零开始构建一个完整的企业级 SaaS 应用。

## 🎯 项目功能

| 模块 | 功能 |
|------|------|
| **认证系统** | 邮箱登录、Google OAuth、JWT Token 管理 |
| **工作空间** | 创建、编辑、删除、切换工作空间 |
| **项目管理** | 项目 CRUD、项目分析 |
| **任务管理** | 任务 CRUD、状态筛选、优先级、指派 |
| **成员管理** | 邀请成员、角色管理、权限控制 |
| **权限系统** | RBAC 基于角色的访问控制 |

## 🛠️ 技术栈

### 核心框架
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.3.1 | UI 框架 |
| TypeScript | 5.6.2 | 类型安全 |
| Vite | 6.0.5 | 构建工具 |

### 状态管理
| 技术 | 用途 |
|------|------|
| **Zustand** | 客户端状态 (Token、UI 状态) |
| **TanStack Query** | 服务端状态 (API 数据缓存) |
| **nuqs** | URL 状态同步 |

### UI 组件
| 技术 | 用途 |
|------|------|
| **shadcn/ui** | 组件库 |
| **Tailwind CSS** | 样式框架 |
| **Lucide React** | 图标库 |
| **Radix UI** | 无障碍原语组件 |

### 表单与验证
| 技术 | 用途 |
|------|------|
| **React Hook Form** | 表单管理 |
| **Zod** | Schema 验证 |

### 其他
| 技术 | 用途 |
|------|------|
| **Axios** | HTTP 请求 |
| **date-fns** | 日期处理 |
| **React Router** | 路由管理 |

## 📁 项目结构

```
src/
├── components/          # 组件
│   ├── ui/             # shadcn/ui 基础组件
│   ├── asidebar/       # 侧边栏组件
│   ├── auth/           # 认证相关组件
│   ├── workspace/      # 工作空间相关组件
│   │   ├── project/    # 项目管理组件
│   │   ├── task/       # 任务管理组件
│   │   ├── member/     # 成员管理组件
│   │   └── settings/   # 设置组件
│   ├── resuable/       # 可复用组件
│   └── skeleton-loaders/ # 骨架屏
├── context/            # React Context
├── hooks/              # 自定义 Hooks
│   └── api/            # API 相关 Hooks
├── lib/                # 工具库
│   ├── api.ts          # API 函数
│   ├── axios-client.ts # Axios 配置
│   └── utils.ts        # 工具函数
├── store/              # Zustand Store
├── types/              # TypeScript 类型
├── routes/             # 路由配置
├── layout/             # 布局组件
├── page/               # 页面组件
├── constant/           # 常量定义
└── hoc/                # 高阶组件
```

## 📚 实现顺序

按照以下顺序实现，每个步骤都有对应的详细文档：

| 序号 | 文档 | 内容 |
|------|------|------|
| 01 | `01-environment-setup.md` | 环境搭建与工具安装 |
| 02 | `02-project-initialization.md` | 项目初始化与配置 |
| 03 | `03-authentication.md` | 认证系统实现 |
| 04 | `04-state-management.md` | 状态管理配置 |
| 05 | `05-workspace-module.md` | 工作空间模块 |
| 06 | `06-project-module.md` | 项目管理模块 |
| 07 | `07-task-module.md` | 任务管理模块 |
| 08 | `08-member-module.md` | 成员管理模块 |
| 09 | `09-ui-components.md` | UI 组件详解 |
| 10 | `10-routing-permissions.md` | 路由与权限系统 |

## ⏱️ 预计时间

| 阶段 | 时间 |
|------|------|
| 环境搭建 + 项目初始化 | 2-3 小时 |
| 认证系统 | 4-6 小时 |
| 状态管理 | 2-3 小时 |
| 工作空间模块 | 4-6 小时 |
| 项目管理模块 | 3-4 小时 |
| 任务管理模块 | 6-8 小时 |
| 成员管理模块 | 3-4 小时 |
| UI 优化与测试 | 4-6 小时 |
| **总计** | **约 30-40 小时** |

## 🚀 开始实现

请按照文档顺序，从 `01-environment-setup.md` 开始！

---

> 💡 **提示**: 每个文档都包含完整的代码示例，你可以直接复制使用，也可以根据自己的理解进行修改。
