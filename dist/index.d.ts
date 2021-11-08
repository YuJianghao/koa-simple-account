/// <reference types="koa__router" />
import { Context, Next } from "koa";
import { IAuthInfo, IUserInfoWithPwd } from "./storage";
interface IConfig {
    path: string;
    secret: string;
    expiresIn: string;
    refreshableIn: string;
    base?: string;
}
export declare function createSimpleAccount(config: IConfig): {
    middleware: import("koa").Middleware<import("koa").DefaultState, Context & import("koa").DefaultContext & import("@koa/router").RouterParamContext<import("koa").DefaultState, import("koa").DefaultContext>, any>;
    auth: (type?: import("./types").tokenType) => (ctx: Context, next: Next) => Promise<void>;
    setAuthInfo: (newInfo?: Partial<IAuthInfo>) => void;
    setUserInfo: ({ username, password, }?: Partial<IUserInfoWithPwd>) => void;
};
export {};
