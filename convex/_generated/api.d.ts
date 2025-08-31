/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin_content from "../admin/content.js";
import type * as admin from "../admin.js";
import type * as adminDashboard from "../adminDashboard.js";
import type * as adminUsers from "../adminUsers.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as carOrder from "../carOrder.js";
import type * as cars from "../cars.js";
import type * as debug from "../debug.js";
import type * as files from "../files.js";
import type * as http_checkout from "../http/checkout.js";
import type * as http_customerPortal from "../http/customerPortal.js";
import type * as http_webhooks from "../http/webhooks.js";
import type * as http from "../http.js";
import type * as internal_subscriptions from "../internal/subscriptions.js";
import type * as migrations_publishPartsForPublishedCars from "../migrations/publishPartsForPublishedCars.js";
import type * as modHotspots from "../modHotspots.js";
import type * as mutations_admin from "../mutations/admin.js";
import type * as mutations_adminContent from "../mutations/adminContent.js";
import type * as mutations_carPublishing from "../mutations/carPublishing.js";
import type * as parts from "../parts.js";
import type * as subscriptions from "../subscriptions.js";
import type * as types from "../types.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "admin/content": typeof admin_content;
  admin: typeof admin;
  adminDashboard: typeof adminDashboard;
  adminUsers: typeof adminUsers;
  analytics: typeof analytics;
  auth: typeof auth;
  carOrder: typeof carOrder;
  cars: typeof cars;
  debug: typeof debug;
  files: typeof files;
  "http/checkout": typeof http_checkout;
  "http/customerPortal": typeof http_customerPortal;
  "http/webhooks": typeof http_webhooks;
  http: typeof http;
  "internal/subscriptions": typeof internal_subscriptions;
  "migrations/publishPartsForPublishedCars": typeof migrations_publishPartsForPublishedCars;
  modHotspots: typeof modHotspots;
  "mutations/admin": typeof mutations_admin;
  "mutations/adminContent": typeof mutations_adminContent;
  "mutations/carPublishing": typeof mutations_carPublishing;
  parts: typeof parts;
  subscriptions: typeof subscriptions;
  types: typeof types;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
