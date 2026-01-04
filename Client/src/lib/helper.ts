
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
export const getAvatarColor = (initials: string): string => {
  const colors = [
    "bg-red-500 text-white",
    "bg-blue-500 text-white",
    "bg-green-500 text-white",
    "bg-yellow-500 text-black",
    "bg-purple-500 text-white",
    "bg-pink-500 text-white",
    "bg-teal-500 text-white",
    "bg-orange-500 text-black",
    "bg-gray-500 text-white",
  ];


  const hash = initials
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return colors[hash % colors.length];
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
