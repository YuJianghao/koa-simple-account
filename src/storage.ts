import JsonDB from "simple-json-db";
import { KEYS } from "./constants";
export interface IUserInfo {
  username: string;
}
export interface IInternalUserInfo extends IUserInfo {
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

export class StorageService {
  constructor(private db: JsonDB) {}

  setDB(db: JsonDB) {
    this.db = db;
  }
  installed() {
    const install = this.db.get(KEYS.install) as IInstall;
    return install?.installed;
  }
  getAuthInfo(): IAuthInfo {
    return this.db.get(KEYS.auth) as IAuthInfo;
  }
  setAuthInfo(authInfo: IAuthInfo) {
    this.db.set(KEYS.auth, authInfo);
  }
  setInstalled() {
    this.db.set(KEYS.install, {
      installed: true,
      time: new Date().valueOf(),
    });
  }
  changeUsername(username: string) {
    const info = this.getUserInfo();
    info.username = username;
    this.setUserInfo(info);
  }
  changePassword(password: string) {
    const info = this.getUserInfo();
    info.password = password;
    this.setUserInfo(info);
  }
  getUserInfo(): IInternalUserInfo {
    return this.db.get(KEYS.user) as IInternalUserInfo;
  }
  setUserInfo(userInfo: IInternalUserInfo) {
    this.db.set(KEYS.user, userInfo);
  }
  getblocklist() {
    return (this.db.get(KEYS.blocklist) as string[]) || [];
  }
  isBlocked(token: string) {
    const blocklist = this.getblocklist();
    return blocklist.includes(token);
  }
  block(tokens: string | string[]) {
    if (!Array.isArray(tokens)) tokens = [tokens];
    const blocklist = this.getblocklist();
    tokens.forEach((token) => blocklist.push(token));
    this.db.set(KEYS.blocklist, blocklist);
  }
}
