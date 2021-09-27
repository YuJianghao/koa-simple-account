import path from "path";
import fs from "fs";
import compose from "koa-compose";
import JsonDB from "simple-json-db";
import { defaultUserInfo } from "./constants";
import { IAuthInfo, StorageService } from "./storage";
import { errorHandler } from "./error";
import { debug } from "./utils";
import createRouter from "./router";
import { AuthService } from "./auth";

interface IConfig {
  path: string;
  secret: string;
  expiresIn: string;
  refreshableIn: string;
  base?: string;
}
const initialize = (config: IConfig) => {
  // db file
  const dirname = path.dirname(config.path);
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
  const authInfo: IAuthInfo = {
    secret: config.secret,
    expiresIn: config.expiresIn,
    refreshableIn: config.refreshableIn,
  };
  storage.setAuthInfo(authInfo);
  const router = createRouter(storage, auth);
  router.prefix(config.base || "");
  return { router, auth };
};

export function createSimpleAccount(config: IConfig) {
  const { router, auth } = initialize(config);
  const middleware = compose([
    errorHandler,
    router.routes(),
    router.allowedMethods(),
  ]);

  return { middleware, auth: auth.createMiddleware.bind(auth) };
}
