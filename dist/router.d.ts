/// <reference types="koa" />
/// <reference types="koa__router" />
import Router from "@koa/router";
import { StorageService } from "./storage";
import { AuthService } from "./auth";
export default function createRouter(storage: StorageService, auth: AuthService): Router<import("koa").DefaultState, import("koa").DefaultContext>;
