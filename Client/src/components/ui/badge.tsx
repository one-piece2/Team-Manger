import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border-0 px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-blue-500 text-white [a&]:hover:bg-blue-600",
        secondary:
          "bg-gray-500 text-white [a&]:hover:bg-gray-600",
        destructive:
          "bg-red-500 text-white [a&]:hover:bg-red-600",
        outline:
          "border border-gray-300 bg-white text-gray-700 [a&]:hover:bg-gray-100",
        // 任务状态颜色
        done:
          "bg-green-100 text-green-700 [a&]:hover:bg-green-200",
        inProgress:
          "bg-yellow-100 text-yellow-700 [a&]:hover:bg-yellow-200",
        todo:
          "bg-blue-100 text-blue-700 [a&]:hover:bg-blue-200",
        inReview:
          "bg-purple-100 text-purple-700 [a&]:hover:bg-purple-200",
        backlog:
          "bg-gray-100 text-gray-700 [a&]:hover:bg-gray-200",
        // 任务优先级颜色
        urgent:
          "bg-red-100 text-red-700 [a&]:hover:bg-red-200",
        high:
          "bg-orange-100 text-orange-700 [a&]:hover:bg-orange-200",
        medium:
          "bg-yellow-100 text-yellow-700 [a&]:hover:bg-yellow-200",
        low:
          "bg-gray-100 text-gray-600 [a&]:hover:bg-gray-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
