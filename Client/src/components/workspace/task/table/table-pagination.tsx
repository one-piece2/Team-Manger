import { type Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  // TanStack Table 的核心实例对象，用于读取状态和调用方法
  table: Table<TData>;
  pageNumber: number;
  pageSize: number;
  totalCount: number; // 所有数据个数
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function DataTablePagination<TData>({
  table,
  pageNumber,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps<TData>) {
  //当前页索引
  const pageIndex = table.getState().pagination.pageIndex;
  //const pageSize = table.getState().pagination.pageSize;
  //总页数
  const pageCount = Math.ceil(totalCount / pageSize);

  const handlePageSizeChange = (size: number) => {
    //更新table内部状态
    table.setPageSize(size);
    onPageSizeChange?.(size); 
  };

  const handlePageChange = (index: number) => {
    table.setPageIndex(index); 
    onPageChange?.(index + 1); 
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-2">
  {/* 起始值-结束值 */}
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {(pageNumber - 1) * pageSize + 1}-
        {Math.min(pageNumber * pageSize, totalCount)} of {totalCount}
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-x-8 lg:space-y-0">
        {/* 每页行数选择器 */}
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 页码信息 */}
        <div className="flex items-center">
          <div className="flex lg:w-[100px] items-center justify-center text-sm font-medium">
            Page {pageIndex + 1} of {pageCount}
          </div>

          {/* 分页控件 */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(0)}
              disabled={pageIndex === 0}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className=""
              onClick={() => handlePageChange(pageIndex - 1)}
              disabled={pageIndex === 0}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft /> Previous
            </Button>
            <Button
              variant="outline"
              className=""
              onClick={() => handlePageChange(pageIndex + 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <span className="sr-only">Go to next page</span>
              Next
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(pageCount - 1)}
              disabled={pageIndex >= pageCount - 1}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
