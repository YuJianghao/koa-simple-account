# Use [@winwin/koa-authentication](https://github.com/YuJianghao/koa-authentication) instead

---

# koa-simple-account

## Why?

Sometimes I just need a simple account system, and this is the implementation.

## How to use?

```ts
/** SETUP **/
const app = new Koa();
// Your koa app instance.

const account = createAccount({
  path: path.resolve(__dirname, "../data/account.db"),
  // path for database
  secret: "secret",
  // jwt secret
  expiresIn: "10min",
  // access token expire time
  refreshableIn: "7d",
  // refresh token expire time
});

app.use(account.middleware);
// This provide auth routes.
// If you want to mount it to aother route, use `koa-mount`.

/** USAGE **/
const router = new Router();
// Your koa router
router.get("/protected-by-access-token", account.auth(), (ctx) => {
  // Some routes require access token.
  // Do something then ...
});
router.get("/protected-by-refresh-token", account.auth("refresh"), (ctx) => {
  // Some routes require refresh token.
  // Do something then ...
});
```

## Integrate with web

The simple way is to use [@winwin/vue-simple-account](https://github.com/YuJianghao/vue-simple-account).

Or you can:

- POST `/signin` with basic authentication, get access token and refresh token.
- POST `/signout` with authentication header: `BEARER ${accessToken}` to signout.
- POST `/refresh` with refresh token to refresh tokens.
- GET `/info` with access token to get username.
- PUT `/info` with `username`,`password` in request body to update user info.
