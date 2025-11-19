/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminDashboard from "../adminDashboard.js";
import type * as adminUsers from "../adminUsers.js";
import type * as admin_content from "../admin/content.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as carOrder from "../carOrder.js";
import type * as cars from "../cars.js";
import type * as debug from "../debug.js";
import type * as env from "../env.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as lib_userHelpers from "../lib/userHelpers.js";
import type * as migrations_fixUserIds from "../migrations/fixUserIds.js";
import type * as migrations_publishPartsForPublishedCars from "../migrations/publishPartsForPublishedCars.js";
import type * as modHotspots from "../modHotspots.js";
import type * as mutations_admin from "../mutations/admin.js";
import type * as mutations_adminContent from "../mutations/adminContent.js";
import type * as mutations_carPublishing from "../mutations/carPublishing.js";
import type * as parts from "../parts.js";
import type * as types from "../types.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminDashboard: typeof adminDashboard;
  adminUsers: typeof adminUsers;
  "admin/content": typeof admin_content;
  analytics: typeof analytics;
  auth: typeof auth;
  carOrder: typeof carOrder;
  cars: typeof cars;
  debug: typeof debug;
  env: typeof env;
  files: typeof files;
  http: typeof http;
  "lib/userHelpers": typeof lib_userHelpers;
  "migrations/fixUserIds": typeof migrations_fixUserIds;
  "migrations/publishPartsForPublishedCars": typeof migrations_publishPartsForPublishedCars;
  modHotspots: typeof modHotspots;
  "mutations/admin": typeof mutations_admin;
  "mutations/adminContent": typeof mutations_adminContent;
  "mutations/carPublishing": typeof mutations_carPublishing;
  parts: typeof parts;
  types: typeof types;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
