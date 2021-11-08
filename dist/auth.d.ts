import { Context, Next } from "koa";
import { IUserInfoWithPwd, StorageService } from "./storage";
import { tokenType } from "./types";
export declare class AuthService {
    private storage;
    constructor(storage: StorageService);
    resolveAuthorizationHeader(ctx: Context): string;
    createMiddleware(type?: tokenType): (ctx: Context, next: Next) => Promise<void>;
    sign(user: IUserInfoWithPwd): {
        accessToken: string;
        refreshToken: string;
    };
}
