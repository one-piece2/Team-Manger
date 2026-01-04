import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  //渲染单元格内容
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import TableSkeleton from "@/components/skeleton-loaders/table-skeleton";
import { DataTablePagination } from "./table-pagination";


//分页参数
interface PaginationProps {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// 表格组件的主 Props 接口
// 使用泛型 <TData, TValue> 让表格可以接受任何类型的数据
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]; //列定义
  data: TData[];   //表格数据数组
  isLoading?: boolean; //是否加载中
  filtersToolbar?: React.ReactNode; //过滤工具栏
  pagination?: PaginationProps; //分页参数
  onPageChange?: (page: number) => void; //页面变化时的回调
  onPageSizeChange?: (size: number) => void; //页面大小变化时的回调
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  filtersToolbar,
  pagination,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  //解构分页参数
  const { totalCount = 0, pageNumber = 1, pageSize = 10 } = pagination || {};
  //排序状态
  const [sorting, setSorting] = React.useState<SortingState>([]);
  //列过滤状态
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  //列可见性状态
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
    //行选择状态
  const [rowSelection, setRowSelection] = React.useState({});
//初始化table实例
  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    //状态管理
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex: pageNumber - 1, pageSize },
    },
    //状态变化时的回调
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    //获取核心行模型
    getCoreRowModel: getCoreRowModel(),
    //获取分页行模型
    getPaginationRowModel: getPaginationRowModel(),
    //获取排序后的行模型
    getSortedRowModel: getSortedRowModel(),
    //获取过滤后的行模型
    getFilteredRowModel: getFilteredRowModel(),
    //列可见性变化时的回调
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  return (
    <div className="w-full space-y-2">
      <div className="block w-full lg:flex lg:items-center lg:justify-between">
        {filtersToolbar && <div className="flex-1"> {filtersToolbar}</div>}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto w-full lg:w-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              //筛选出可以隐藏的列
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        {isLoading ? (
          <TableSkeleton columns={6} rows={10} />
        ) : (
          <Table>
            <TableHeader>
              
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {/* 先判断是否有数据行 */}
              {table.getRowModel().rows?.length ? (
              // 遍历行数据
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {/* 遍历当前行可见的单元格 */}
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      <DataTablePagination
        table={table}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
