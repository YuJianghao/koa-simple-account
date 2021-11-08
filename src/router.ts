import { Context } from "koa";
import Router from "@koa/router";
import basicAuth from "basic-auth";
import { StorageService } from "./storage";
import { AuthService } from "./auth";
import { debug } from "./utils";
import { BasicAuthError, NotBasicAuthError } from "./errors";

export default function createRouter(
  storage: StorageService,
  auth: AuthService
) {
  const router = new Router();

  router.post("/signin", (ctx: Context) => {
    const user = basicAuth.parse(ctx.request.headers.authorization || "");
    if (!user) {
      debug("basic auth required");
      throw new NotBasicAuthError();
    }
    const target = storage.getUserInfo();
    if (user.name !== target.username || user.pass !== target.password) {
      debug("basic auth failed");
      throw new BasicAuthError();
    }
    debug(`${target.username} signin`);
    ctx.body = auth.sign(target);
  });

  router.post("/refresh", auth.createMiddleware("refresh"), (ctx: Context) => {
    const target = storage.getUserInfo();
    debug(`${target.username} refresh`);
    ctx.body = auth.sign(target);
  });

  router.post("/signout", auth.createMiddleware("refresh"), (ctx: Context) => {
    const refreshToken = auth.resolveAuthorizationHeader(ctx);
    if (refreshToken) storage.block(refreshToken);
    const accessToken = ctx.request.body.access as string;
    if (accessToken) storage.block(accessToken);
    ctx.status = 200;
  });

  router.put("/info", auth.createMiddleware("access"), (ctx: Context) => {
    const { username, password }: { username?: string; password?: string } =
      ctx.request.body;
    if (username) storage.changeUsername(username);
    if (password) storage.changePassword(password);
    ctx.status = 200;
  });

  router.get("/info", auth.createMiddleware("access"), (ctx: Context) => {
    ctx.body = { username: storage.getUserInfo().username };
  });

  router.use(async (ctx, next) => {
    await next();
  });

  return router;
}
