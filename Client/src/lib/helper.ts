
// export const transformOptions = (options: string[]) =>
//   options.map((value) => ({
//     label: value
//       .replace(/_/g, " ")
//       .toLowerCase()
//       .replace(/\b\w/g, (c) => c.toUpperCase()),
//     value,
//   }));

// 输入 const statuses = ["TODO", "IN_PROGRESS", "COMPLETED"];
// 输出
//[
 // { label: "Todo", value: "TODO", icon: undefined },
 // { label: "In Progress", value: "IN_PROGRESS", icon: undefined },
 // { label: "Completed", value: "COMPLETED", icon: undefined }
//]
export const transformOptions = (
  options: string[],
  iconMap?: Record<string, React.ComponentType<{ className?: string }>>
) =>
  options.map((value) => ({
    label: value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    value: value,
    icon: iconMap ? iconMap[value] : undefined,
  }));

  //将下划线格式的状态转换为带空格的显示文本
export const transformStatusEnum = (status: string): string => {
  return status.replace(/_/g, " ");
};
//将用户输入的文本转换回枚举格式
export const formatStatusToEnum = (status: string): string => {
  return status.toUpperCase().replace(/\s+/g, "_");
};

//根据用户名生成一致的头像背景色
export const getAvatarColor = (name: string): string => {
  if (!name) return "bg-gray-500 text-white";
  
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const index = hash % 9;
  
  // 使用 switch 语句确保 Tailwind 可以识别所有类名
  switch (index) {
    case 0:
      return "bg-red-500 text-white";
    case 1:
      return "bg-blue-500 text-white";
    case 2:
      return "bg-green-500 text-white";
    case 3:
      return "bg-yellow-500 text-black";
    case 4:
      return "bg-purple-500 text-white";
    case 5:
      return "bg-pink-500 text-white";
    case 6:
      return "bg-teal-500 text-white";
    case 7:
      return "bg-orange-500 text-black";
    case 8:
      return "bg-indigo-500 text-white";
    default:
      return "bg-purple-500 text-white";
  }
};

//获取头像缩写
export const getAvatarFallbackText = (name: string) => {
  if (!name) return "NA";
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2); // Ensure only two initials
  return initials || "NA";
};

//将任务状态映射到 Badge 变体
export const getStatusBadgeVariant = (status: string): "done" | "inProgress" | "todo" | "inReview" | "backlog" | "outline" => {
  switch (status) {
    case "DONE":
      return "done";
    case "IN_REVIEW":
      return "inReview";
    case "IN_PROGRESS":
      return "inProgress";
    case "TODO":
      return "todo";
    case "BACKLOG":
      return "backlog";
    default:
      return "outline";
  }
};

//将任务优先级映射到 Badge 变体
export const getPriorityBadgeVariant = (priority: string): "urgent" | "high" | "medium" | "low" | "outline" => {
  switch (priority) {
    case "URGENT":
      return "urgent";
    case "HIGH":
      return "high";
    case "MEDIUM":
      return "medium";
    case "LOW":
      return "low";
    default:
      return "outline";
  }
};

// export const getRandomColor = (): string => {
//   const colors = [
//     "bg-red-500 text-white",
//     "bg-blue-500 text-white",
//     "bg-green-500 text-white",
//     "bg-yellow-500 text-black",
//     "bg-purple-500 text-white",
//     "bg-pink-500 text-white",
//     "bg-teal-500 text-white",
//     "bg-orange-500 text-black",
//     "bg-gray-500 text-white",
//   ];
//   return colors[Math.floor(Math.random() * colors.length)];
// };
