import Debug from "debug";
export class Error2 extends Error {
  constructor(public status: number, message: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function error(status: number, message: string) {
  return new Error2(status, message);
}

export const debug = Debug("koa-simple-account");
