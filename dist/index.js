"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("path"),t=require("fs"),r=require("koa-compose"),s=require("simple-json-db"),n=require("debug"),o=require("@koa/router"),a=require("jsonwebtoken");function c(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var i=c(e),u=c(t),d=c(r),h=c(s),f=c(n),l=c(o),p=c(a);
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
***************************************************************************** */
function g(e,t,r,s){return new(r||(r=Promise))((function(n,o){function a(e){try{i(s.next(e))}catch(e){o(e)}}function c(e){try{i(s.throw(e))}catch(e){o(e)}}function i(e){var t;e.done?n(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(a,c)}i((s=s.apply(e,t||[])).next())}))}const w="install",m="user",b="auth",y="blocklist",k={username:"admin",password:"admin"};class I{constructor(e){this.db=e}setDB(e){this.db=e}installed(){const e=this.db.get(w);return null==e?void 0:e.installed}getAuthInfo(){return this.db.get(b)}setAuthInfo(e){this.db.set(b,e)}setInstalled(){this.db.set(w,{installed:!0,time:(new Date).valueOf()})}changeUsername(e){const t=this.getUserInfo();t.username=e,this.setUserInfo(t)}changePassword(e){const t=this.getUserInfo();t.password=e,this.setUserInfo(t)}getUserInfo(){return this.db.get(m)}setUserInfo(e){this.db.set(m,e)}getblocklist(){return this.db.get(y)||[]}isBlocked(e){return this.getblocklist().includes(e)}block(e){Array.isArray(e)||(e=[e]);const t=this.getblocklist();e.forEach((e=>t.push(e))),this.db.set(y,t)}}const E=f.default("koa-simple-account");class v extends Error{constructor(){super(),Error.captureStackTrace(this,this.constructor),this.name="EmptyAuthticationHeaderError"}}class A extends Error{constructor(){super(),Error.captureStackTrace(this,this.constructor),this.name="InvalidAuthticationHeaderError"}}class x extends Error{constructor(){super(),Error.captureStackTrace(this,this.constructor),this.name="TokenBlockedError"}}class T extends Error{constructor(){super(),Error.captureStackTrace(this,this.constructor),this.name="InvalidTokenError"}}class U extends Error{constructor(e){super(),this.expectedType=e,Error.captureStackTrace(this,this.constructor),this.name="TokenTypeError"}}class q extends Error{constructor(){super(),Error.captureStackTrace(this,this.constructor),this.name="TokenDecodeError"}}class S extends Error{constructor(){super(),Error.captureStackTrace(this,this.constructor),this.name="NotBasicAuthError"}}class B extends Error{constructor(){super(),Error.captureStackTrace(this,this.constructor),this.name="BasicAuthError"}}class M{constructor(e){this.storage=e}resolveBasicAuth(e){const t=e.request.body;if(t&&"username"in t&&"password"in t)return t;throw new S}resolveAuthorizationHeader(e){if(!e.header||!e.header.authorization)throw new v;const t=e.header.authorization.split(" ");if(2===t.length){const e=t[0],r=t[1];if(/^Bearer$/i.test(e))return r}throw new A}createMiddleware(e="access"){return(t,r)=>g(this,void 0,void 0,(function*(){const s=this.resolveAuthorizationHeader(t);if(this.storage.isBlocked(s))throw E("token has been blocked"),new x;try{p.default.verify(s,this.storage.getAuthInfo().secret)}catch(e){throw e instanceof Error&&["JsonWebTokenError","TokenExpiredError"].includes(e.name)?(E("fail to verify token"),new T):e}const n=p.default.decode(s);if(!n||"string"==typeof n||"string"!=typeof n.username||"string"!=typeof n.type||"access"!==n.type&&"refresh"!==n.type)throw E("fail to decode token: ",n),new q;if(n.type!==e)throw E(`wrong token type: ${e} is required but found ${n.type}`),new U(e);t.state.user={username:n.username,type:n.type},yield r()}))}sign(e){E(`sign for ${e.username}`);const t=this.storage.getAuthInfo();return{accessToken:p.default.sign({username:e.username,type:"access"},t.secret,{expiresIn:t.expiresIn}),refreshToken:p.default.sign({username:e.username,type:"refresh"},t.secret,{expiresIn:t.refreshableIn})}}}const $=e=>{const t={secret:e.secret,expiresIn:e.expiresIn,refreshableIn:e.refreshableIn},r=i.default.dirname(e.path);u.default.existsSync(r)||(u.default.mkdirSync(r),E(`create database: ${r}`));const s=new I(new h.default(e.path)),n=new M(s);s.installed()||(s.setUserInfo(k),s.setAuthInfo(t),s.setInstalled(),E("first install: set defualt userinfo"));const o=function(e,t){const r=new l.default;return r.post("/signin",(r=>{const s=t.resolveBasicAuth(r),n=e.getUserInfo();if(s.username!==n.username||s.password!==n.password)throw E("basic auth failed"),new B;E(`${n.username} signin`),r.body=t.sign(n)})),r.post("/refresh",t.createMiddleware("refresh"),(r=>{const s=e.getUserInfo();E(`${s.username} refresh`),r.body=t.sign(s)})),r.post("/signout",t.createMiddleware("refresh"),(r=>{const s=t.resolveAuthorizationHeader(r);s&&e.block(s);const n=r.request.body.access;n&&e.block(n),r.status=200})),r.put("/info",t.createMiddleware("access"),(t=>{const{username:r,password:s}=t.request.body;r&&e.changeUsername(r),s&&e.changePassword(s),t.status=200})),r.get("/info",t.createMiddleware("access"),(t=>{t.body={username:e.getUserInfo().username}})),r.use(((e,t)=>g(this,void 0,void 0,(function*(){yield t()})))),r}(s,n);return o.prefix(e.base||""),{router:o,auth:n,setAuthInfo:(e={})=>{s.setAuthInfo(Object.assign(Object.assign({},s.getAuthInfo()),e))},setUserInfo:({username:e,password:t}={})=>{e&&s.changeUsername(e),t&&s.changePassword(t)}}},j=(e,t)=>g(void 0,void 0,void 0,(function*(){try{yield t()}catch(t){if(!(t instanceof v||t instanceof A||t instanceof x||t instanceof T||t instanceof U||t instanceof q||t instanceof S||t instanceof B))throw t;e.body=t.name,e.status=401}}));exports.createSimpleAccount=function(e){const{router:t,auth:r,setAuthInfo:s,setUserInfo:n}=$(e);return{middleware:d.default([j,t.routes(),t.allowedMethods()]),auth:r.createMiddleware.bind(r),setAuthInfo:s,setUserInfo:n}};
