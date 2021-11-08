import { Context, Next } from "koa";
import jwt from "jsonwebtoken";
import { IUserInfoWithPwd, StorageService } from "./storage";
import { debug } from "./utils";
import {
  EmptyAuthticationHeaderError,
  InvalidAuthticationHeaderError,
  InvalidTokenError,
  TokenBlockedError,
  TokenDecodeError,
  TokenTypeError,
} from "./errors";
import { tokenType } from "./types";

export class AuthService {
  constructor(private storage: StorageService) {}
  resolveAuthorizationHeader(ctx: Context) {
    if (!ctx.header || !ctx.header.authorization) {
      throw new EmptyAuthticationHeaderError();
    }

    const parts = ctx.header.authorization.split(" ");

    if (parts.length === 2) {
      const scheme = parts[0];
      const credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        return credentials;
      }
    }
    throw new InvalidAuthticationHeaderError();
  }

  createMiddleware(type: tokenType = "access") {
    return async (ctx: Context, next: Next) => {
      const token = this.resolveAuthorizationHeader(ctx);
      if (this.storage.isBlocked(token)) {
        debug("token has been blocked");
        throw new TokenBlockedError();
      }
      try {
        jwt.verify(token, this.storage.getAuthInfo().secret);
      } catch (err) {
        if (
          err instanceof Error &&
          ["JsonWebTokenError", "TokenExpiredError"].includes(err.name)
        ) {
          debug(`fail to verify token`);
          throw new InvalidTokenError();
        } else throw err;
      }
      const user = jwt.decode(token);

      if (
        user &&
        typeof user !== "string" &&
        typeof user.username === "string" &&
        typeof user.type === "string" &&
        (user.type === "access" || user.type === "refresh")
      ) {
        if (user.type !== type) {
          debug(`wrong token type: ${type} is required but found ${user.type}`);
          throw new TokenTypeError(type);
        } else {
          ctx.state.user = { username: user.username, type: user.type };
          await next();
        }
      } else {
        debug(`fail to decode token: `, user);
        throw new TokenDecodeError();
      }
    };
  }

  sign(user: IUserInfoWithPwd) {
    debug(`sign for ${user.username}`);
    const authInfo = this.storage.getAuthInfo();
    const accessToken = jwt.sign(
      { username: user.username, type: "access" },
      authInfo.secret,
      {
        expiresIn: authInfo.expiresIn,
      }
    );
    const refreshToken = jwt.sign(
      { username: user.username, type: "refresh" },
      authInfo.secret,
      {
        expiresIn: authInfo.refreshableIn,
      }
    );
    return { accessToken, refreshToken };
  }
}
