import JsonDB from "simple-json-db";
export interface IUserInfo {
    username: string;
}
export interface IUserInfoWithPwd extends IUserInfo {
    password: string;
}
export interface IAuthInfo {
    secret: string;
    expiresIn: string;
    refreshableIn: string;
}
export interface IInstall {
    installed: boolean;
    time: number;
}
export declare class StorageService {
    private db;
    constructor(db: JsonDB);
    setDB(db: JsonDB): void;
    installed(): boolean;
    getAuthInfo(): IAuthInfo;
    setAuthInfo(authInfo: IAuthInfo): void;
    setInstalled(): void;
    changeUsername(username: string): void;
    changePassword(password: string): void;
    getUserInfo(): IUserInfoWithPwd;
    setUserInfo(userInfo: IUserInfoWithPwd): void;
    getblocklist(): string[];
    isBlocked(token: string): boolean;
    block(tokens: string | string[]): void;
}
