# 09 - UI 组件详解

## 📋 概述

本项目使用 **shadcn/ui** 作为组件库，基于 Radix UI 原语构建。本文档介绍核心 UI 组件的使用和自定义。

---

## 1️⃣ 安装 shadcn/ui 组件

使用 CLI 安装组件：

```bash
# 初始化 shadcn/ui
npx shadcn@latest init

# 安装常用组件
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add toast
npx shadcn@latest add tooltip
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add calendar
npx shadcn@latest add checkbox
npx shadcn@latest add popover
npx shadcn@latest add scroll-area
npx shadcn@latest add separator
npx shadcn@latest add sheet
npx shadcn@latest add skeleton
npx shadcn@latest add textarea
npx shadcn@latest add sidebar
npx shadcn@latest add breadcrumb
npx shadcn@latest add command
npx shadcn@latest add pagination
```

---

## 2️⃣ 核心组件

### Button 组件

```typescript
// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

**使用示例：**

```tsx
<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button disabled>Disabled</Button>
```

---

### Toast 组件

```typescript
// src/hooks/use-toast.ts
import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

// 使用示例
import { toast } from "@/hooks/use-toast"

// 成功提示
toast({
  title: "Success",
  description: "Operation completed successfully",
  variant: "success",
})

// 错误提示
toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
})
```

---

## 3️⃣ 可复用组件

### 确认对话框

```typescript
// src/components/resuable/confirm-dialog.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**使用示例：**

```tsx
const { open, onOpenDialog, onCloseDialog } = useConfirmDialog();

<ConfirmDialog
  isOpen={open}
  isLoading={isPending}
  onClose={onCloseDialog}
  onConfirm={handleDelete}
  title="Delete Item"
  description="Are you sure you want to delete this item?"
  confirmText="Delete"
  cancelText="Cancel"
/>
```

---

### 权限守卫组件

```typescript
// src/components/resuable/permission-guard.tsx
import { ReactNode } from "react";
import { useAuthContext } from "@/context/auth-provider";
import { PermissionType } from "@/constant";

interface PermissionsGuardProps {
  requiredPermission: PermissionType;
  children: ReactNode;
  fallback?: ReactNode;
}

const PermissionsGuard = ({
  requiredPermission,
  children,
  fallback = null,
}: PermissionsGuardProps) => {
  const { hasPermission } = useAuthContext();

  if (!hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionsGuard;
```

**使用示例：**

```tsx
import PermissionsGuard from "@/components/resuable/permission-guard";
import { Permissions } from "@/constant";

<PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
  <Button>Create Project</Button>
</PermissionsGuard>

// 带 fallback
<PermissionsGuard 
  requiredPermission={Permissions.DELETE_TASK}
  fallback={<span>No permission</span>}
>
  <Button variant="destructive">Delete</Button>
</PermissionsGuard>
```

---

## 4️⃣ Emoji 选择器

### src/components/emoji-picker/index.tsx

```typescript
import { useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

const EmojiPickerComponent = ({ value, onChange }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: { native: string }) => {
    onChange(emoji.native);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[80px] text-2xl">
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Picker
          data={data}
          onEmojiSelect={handleSelect}
          theme="light"
          previewPosition="none"
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPickerComponent;
```

---

## 5️⃣ 骨架屏加载

### src/components/skeleton-loaders/workspace-skeleton.tsx

```typescript
import { Skeleton } from "@/components/ui/skeleton";

const WorkspaceSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[150px]" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-[100px] rounded-lg" />
        <Skeleton className="h-[100px] rounded-lg" />
        <Skeleton className="h-[100px] rounded-lg" />
      </div>
      <Skeleton className="h-[300px] rounded-lg" />
    </div>
  );
};

export default WorkspaceSkeleton;
```

### src/components/skeleton-loaders/task-skeleton.tsx

```typescript
import { Skeleton } from "@/components/ui/skeleton";

const TaskSkeleton = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-6 w-[80px] rounded-full" />
          <Skeleton className="h-6 w-[60px] rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      ))}
    </div>
  );
};

export default TaskSkeleton;
```

---

## 6️⃣ 侧边栏组件

### src/components/asidebar/asidebar.tsx

```typescript
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavProjects />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
```

---

## 7️⃣ 页面头部

### src/components/header.tsx

```typescript
import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Header = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {pathSegments.map((segment, index) => {
            const isLast = index === pathSegments.length - 1;
            const href = "/" + pathSegments.slice(0, index + 1).join("/");

            return (
              <React.Fragment key={segment}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="capitalize">
                      {segment.replace(/-/g, " ")}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href} className="capitalize">
                      {segment.replace(/-/g, " ")}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
};

export default Header;
```

---

## 8️⃣ 数据表格

### src/components/workspace/task/table/table.tsx

```typescript
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./table-pagination";
import { DataTableToolbar } from "./table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
```

---

## ✅ 组件清单

| 组件 | 路径 | 用途 |
|------|------|------|
| Button | `ui/button.tsx` | 按钮 |
| Card | `ui/card.tsx` | 卡片容器 |
| Dialog | `ui/dialog.tsx` | 对话框 |
| Form | `ui/form.tsx` | 表单 |
| Input | `ui/input.tsx` | 输入框 |
| Select | `ui/select.tsx` | 下拉选择 |
| Table | `ui/table.tsx` | 表格 |
| Toast | `ui/toast.tsx` | 提示消息 |
| Avatar | `ui/avatar.tsx` | 头像 |
| Badge | `ui/badge.tsx` | 徽章 |
| Skeleton | `ui/skeleton.tsx` | 骨架屏 |
| ConfirmDialog | `resuable/confirm-dialog.tsx` | 确认对话框 |
| PermissionsGuard | `resuable/permission-guard.tsx` | 权限守卫 |
| EmojiPicker | `emoji-picker/index.tsx` | Emoji 选择器 |

---

## ➡️ 下一步

继续阅读 `10-routing-permissions.md` 了解路由和权限系统。
