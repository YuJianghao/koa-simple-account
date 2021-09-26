import { Context, Next } from "koa";
import { IInternalUserInfo, StorageService } from "./storage";
declare type tokenType = "access" | "refresh";
export declare class AuthService {
    private storage;
    constructor(storage: StorageService);
    resolveAuthorizationHeader(ctx: Context): string;
    createMiddleware(type?: tokenType): (ctx: Context, next: Next) => Promise<void>;
    sign(user: IInternalUserInfo): {
        accessToken: string;
        refreshToken: string;
    };
}
export {};
