//密码加密
import * as bcrypt from 'bcrypt';
//密码加密的轮数
const SALT_ROUNDS = 10;
//密码加密
export const hashValue = async (value: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(value, salt);
};
//密码比较
export const compareValue = async (
  value: string,
  hashedValue: string,
): Promise<boolean> => {
  return bcrypt.compare(value, hashedValue);
};