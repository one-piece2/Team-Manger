export type CustomError = Error & {
  errorCode?: string;
};