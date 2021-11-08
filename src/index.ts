import path from "path";
import fs from "fs";
import { Context, Next } from "koa";
import compose from "koa-compose";
import JsonDB from "simple-json-db";
import { defaultUserInfo } from "./constants";
import { IAuthInfo, IUserInfoWithPwd, StorageService } from "./storage";
import { debug } from "./utils";
import createRouter from "./router";
import { AuthService } from "./auth";
import {
  BasicAuthError,
  EmptyAuthticationHeaderError,
  InvalidAuthticationHeaderError,
  InvalidTokenError,
  NotBasicAuthError,
  TokenBlockedError,
  TokenDecodeError,
  TokenTypeError,
} from "./errors";

interface IConfig {
  path: string;
  secret: string;
  expiresIn: string;
  refreshableIn: string;
  base?: string;
}

const initialize = (config: IConfig) => {
  //#region storage
  const dirname = path.dirname(config.path); // db file
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname);
    debug(`create database: ${dirname}`);
  }
  const storage = new StorageService(new JsonDB(config.path));
  const auth = new AuthService(storage);
  if (!storage.installed()) {
    storage.setUserInfo(defaultUserInfo);
    storage.setInstalled();
    debug(`first install: set defualt userinfo`);
  }
  //#endregion

  //#region storage helpers
  const setAuthInfo = (newInfo: Partial<IAuthInfo> = {}) => {
    storage.setAuthInfo({ ...storage.getAuthInfo(), ...newInfo });
  };
  const setUserInfo = ({
    username,
    password,
  }: Partial<IUserInfoWithPwd> = {}) => {
    username && storage.changeUsername(username);
    password && storage.changePassword(password);
  };
  //#endregion

  //#region auth info
  const authInfo: IAuthInfo = {
    secret: config.secret,
    expiresIn: config.expiresIn,
    refreshableIn: config.refreshableIn,
  };
  if (!storage.installed()) setAuthInfo(authInfo);
  //#endregion

  //#region router
  const router = createRouter(storage, auth);
  router.prefix(config.base || "");
  //#endregion
  return { router, auth, setAuthInfo, setUserInfo };
};

const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (err) {
    if (
      err instanceof EmptyAuthticationHeaderError ||
      err instanceof InvalidAuthticationHeaderError ||
      err instanceof TokenBlockedError ||
      err instanceof InvalidTokenError ||
      err instanceof TokenTypeError ||
      err instanceof TokenDecodeError ||
      err instanceof NotBasicAuthError ||
      err instanceof BasicAuthError
    ) {
      ctx.body = err.name;
      ctx.status = 401;
    } else throw err;
  }
};

export function createSimpleAccount(config: IConfig) {
  const { router, auth, setAuthInfo, setUserInfo } = initialize(config);
  const middleware = compose([
    errorHandler,
    router.routes(),
    router.allowedMethods(),
  ]);

  return {
    middleware,
    auth: auth.createMiddleware.bind(auth),
    setAuthInfo,
    setUserInfo,
  };
}
