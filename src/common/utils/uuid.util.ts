import { v4 as uuidv4 } from 'uuid';
//邀请码
export const generateInviteCode = (): string => {
  return uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
};

//任务码
export const generateTaskCode = (): string => {
  return `TASK-${uuidv4().substring(0, 8).toUpperCase()}`;
};