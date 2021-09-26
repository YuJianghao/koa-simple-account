import { IUserInfo } from "./storage";

declare module "koa" {
  interface DefaultState {
    user?: IUserInfo & { type: "access" | "refresh" };
  }
}
