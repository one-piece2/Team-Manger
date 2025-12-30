import { parseAsString, useQueryStates } from "nuqs";
//URL 状态使用 nuqs 同步
const useTaskTableFilter = () => {
  const [filters, setFilters] = useQueryStates({
    status: parseAsString.withDefault(""),
    priority: parseAsString.withDefault(""),
    assignedTo: parseAsString.withDefault(""),
    keyword: parseAsString.withDefault(""),
    projectId: parseAsString.withDefault(""),
  });
//读:filters对象会自动从当前 URL (?status=done&keyword=bug) 中读取对应的值。如果没有，就用 "" (默认值)。
//写 (Write): 当你调用 setFilters({ status: 'in-progress' }) 时，它不仅会更新 React 的状态让组件重渲染，还会自动修改浏览器的 URL。
  return { filters, setFilters };
};

export default useTaskTableFilter;