"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("path"),t=require("fs"),r=require("koa-compose"),s=require("simple-json-db"),n=require("debug"),o=require("@koa/router"),a=require("basic-auth"),i=require("jsonwebtoken");function u(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var c=u(e),d=u(t),h=u(r),f=u(s),l=u(n),p=u(o),g=u(a),b=u(i);const w="install",y="user",m="auth",I="blocklist",k={username:"admin",password:"admin"};class v{constructor(e){this.db=e}setDB(e){this.db=e}installed(){const e=this.db.get(w);return null==e?void 0:e.installed}getAuthInfo(){return this.db.get(m)}setAuthInfo(e){this.db.set(m,e)}setInstalled(){this.db.set(w,{installed:!0,time:(new Date).valueOf()})}changeUsername(e){const t=this.getUserInfo();t.username=e,this.setUserInfo(t)}changePassword(e){const t=this.getUserInfo();t.password=e,this.setUserInfo(t)}getUserInfo(){return this.db.get(y)}setUserInfo(e){this.db.set(y,e)}getblocklist(){return this.db.get(I)||[]}isBlocked(e){return this.getblocklist().includes(e)}block(e){Array.isArray(e)||(e=[e]);const t=this.getblocklist();e.forEach((e=>t.push(e))),this.db.set(I,t)}}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */function A(e,t,r,s){return new(r||(r=Promise))((function(n,o){function a(e){try{u(s.next(e))}catch(e){o(e)}}function i(e){try{u(s.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?n(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(a,i)}u((s=s.apply(e,t||[])).next())}))}class E extends Error{constructor(e,t){super(t),this.status=e,Error.captureStackTrace(this,this.constructor)}}function U(e,t){return new E(e,t)}const q=l.default("koa-simple-account"),x=(e,t)=>A(void 0,void 0,void 0,(function*(){try{yield t()}catch(t){t instanceof E?(e.status=t.status,e.body=t.message):(e.status=500,e.body="server internal error",console.error(t))}}));class M{constructor(e){this.storage=e}resolveAuthorizationHeader(e){if(!e.header||!e.header.authorization)throw U(401,"Authtication Error");const t=e.header.authorization.split(" ");if(2===t.length){const e=t[0],r=t[1];if(/^Bearer$/i.test(e))return r}throw U(401,"Authtication Error")}createMiddleware(e="access"){return(t,r)=>A(this,void 0,void 0,(function*(){const s=this.resolveAuthorizationHeader(t);if(this.storage.isBlocked(s))throw q("token has been blocked"),U(401,"Authentication Error");try{b.default.verify(s,this.storage.getAuthInfo().secret)}catch(e){throw e instanceof Error&&["JsonWebTokenError","TokenExpiredError"].includes(e.name)?(q("fail to verify token"),U(401,"Authentication Error")):e}const n=b.default.decode(s);if(!n||"string"==typeof n||"string"!=typeof n.username||"string"!=typeof n.type||"access"!==n.type&&"refresh"!==n.type)throw q("fail to decode token: ",n),new Error("TokenDecodeError");if(n.type!==e)throw q(`wrong token type: ${e} is required but found ${n.type}`),U(401,"Authentication Error");t.state.user={username:n.username,type:n.type},yield r()}))}sign(e){q(`sign for ${e.username}`);const t=this.storage.getAuthInfo();return{accessToken:b.default.sign({username:e.username,type:"access"},t.secret,{expiresIn:t.expiresIn}),refreshToken:b.default.sign({username:e.username,type:"refresh"},t.secret,{expiresIn:t.refreshableIn})}}}const $=e=>{const t=c.default.dirname(e.path);d.default.existsSync(t)||(d.default.mkdirSync(t),q(`create database: ${t}`));const r=new v(new f.default(e.path)),s=new M(r);r.installed()||(r.setUserInfo(k),r.setInstalled(),q("first install: set defualt userinfo"));const n={secret:e.secret,expiresIn:e.expiresIn,refreshableIn:e.refreshableIn},o=(e={})=>{r.setAuthInfo(Object.assign(Object.assign({},n),e))};r.installed()||o();const a=function(e,t){const r=new p.default;return r.post("/signin",(r=>{const s=g.default.parse(r.request.headers.authorization||"");if(!s)throw q("basic auth required"),U(401,"Authentication Error");const n=e.getUserInfo();if(s.name!==n.username||s.pass!==n.password)throw q("basic auth failed"),U(401,"Authentication Error");q(`${n.username} signin`),r.body=t.sign(n)})),r.post("/refresh",t.createMiddleware("refresh"),(r=>{const s=e.getUserInfo();q(`${s.username} refresh`),r.body=t.sign(s)})),r.post("/signout",t.createMiddleware("refresh"),(r=>{const s=t.resolveAuthorizationHeader(r);s&&e.block(s);const n=r.request.body.access;n&&e.block(n),r.status=200})),r.put("/info",t.createMiddleware("access"),(t=>{const{username:r,password:s}=t.request.body;r&&e.changeUsername(r),s&&e.changePassword(s),t.status=200})),r.get("/info",t.createMiddleware("access"),(t=>{t.body={username:e.getUserInfo().username}})),r.use(((e,t)=>A(this,void 0,void 0,(function*(){yield t()})))),r}(r,s);a.prefix(e.base||"");return{router:a,auth:s,setAuthInfo:o,setUserInfo:({username:e,password:t}={})=>{e&&r.changeUsername(e),t&&r.changePassword(t)}}};exports.createSimpleAccount=function(e){const{router:t,auth:r,setAuthInfo:s}=$(e);return{middleware:h.default([x,t.routes(),t.allowedMethods()]),auth:r.createMiddleware.bind(r),setAuthInfo:s}};
