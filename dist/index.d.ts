/// <reference types="koa" />
/// <reference types="koa__router" />
interface IConfig {
    path: string;
    secret: string;
    expiresIn: string;
    refreshableIn: string;
    base?: string;
}
export declare function createSimpleAccount(config: IConfig): {
    middleware: import("koa").Middleware<import("koa").DefaultState, import("koa").Context & import("koa").DefaultContext & import("@koa/router").RouterParamContext<import("koa").DefaultState, import("koa").DefaultContext>, any>;
    auth: (type?: "access" | "refresh") => (ctx: import("koa").Context, next: import("koa").Next) => Promise<void>;
};
export {};
