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
import type * as adminContent from "../adminContent.js";
import type * as adminDashboard from "../adminDashboard.js";
import type * as adminIssues from "../adminIssues.js";
import type * as adminSettings from "../adminSettings.js";
import type * as adminUsers from "../adminUsers.js";
import type * as admin_content from "../admin/content.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as carOrder from "../carOrder.js";
import type * as cars from "../cars.js";
import type * as crons from "../crons.js";
import type * as dev from "../dev.js";
import type * as dodo from "../dodo.js";
import type * as email_send from "../email/send.js";
import type * as email_templates from "../email/templates.js";
import type * as env from "../env.js";
import type * as explore from "../explore.js";
import type * as files from "../files.js";
import type * as freemium from "../freemium.js";
import type * as gdpr from "../gdpr.js";
import type * as http from "../http.js";
import type * as issues from "../issues.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_sanitize from "../lib/sanitize.js";
import type * as lib_userHelpers from "../lib/userHelpers.js";
import type * as migrations_fixUserIds from "../migrations/fixUserIds.js";
import type * as migrations_publishPartsForPublishedCars from "../migrations/publishPartsForPublishedCars.js";
import type * as modHotspots from "../modHotspots.js";
import type * as mutations_admin from "../mutations/admin.js";
import type * as mutations_adminContent from "../mutations/adminContent.js";
import type * as mutations_carPublishing from "../mutations/carPublishing.js";
import type * as notifications from "../notifications.js";
import type * as parts from "../parts.js";
import type * as scheduled from "../scheduled.js";
import type * as setAdmin from "../setAdmin.js";
import type * as subscriptions from "../subscriptions.js";
import type * as types from "../types.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminContent: typeof adminContent;
  adminDashboard: typeof adminDashboard;
  adminIssues: typeof adminIssues;
  adminSettings: typeof adminSettings;
  adminUsers: typeof adminUsers;
  "admin/content": typeof admin_content;
  analytics: typeof analytics;
  auth: typeof auth;
  carOrder: typeof carOrder;
  cars: typeof cars;
  crons: typeof crons;
  dev: typeof dev;
  dodo: typeof dodo;
  "email/send": typeof email_send;
  "email/templates": typeof email_templates;
  env: typeof env;
  explore: typeof explore;
  files: typeof files;
  freemium: typeof freemium;
  gdpr: typeof gdpr;
  http: typeof http;
  issues: typeof issues;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/sanitize": typeof lib_sanitize;
  "lib/userHelpers": typeof lib_userHelpers;
  "migrations/fixUserIds": typeof migrations_fixUserIds;
  "migrations/publishPartsForPublishedCars": typeof migrations_publishPartsForPublishedCars;
  modHotspots: typeof modHotspots;
  "mutations/admin": typeof mutations_admin;
  "mutations/adminContent": typeof mutations_adminContent;
  "mutations/carPublishing": typeof mutations_carPublishing;
  notifications: typeof notifications;
  parts: typeof parts;
  scheduled: typeof scheduled;
  setAdmin: typeof setAdmin;
  subscriptions: typeof subscriptions;
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

export declare const components: {
  resend: {
    lib: {
      cancelEmail: FunctionReference<
        "mutation",
        "internal",
        { emailId: string },
        null
      >;
      cleanupAbandonedEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      cleanupOldEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      createManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          replyTo?: Array<string>;
          subject: string;
          to: Array<string> | string;
        },
        string
      >;
      get: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          bcc?: Array<string>;
          bounced?: boolean;
          cc?: Array<string>;
          clicked?: boolean;
          complained: boolean;
          createdAt: number;
          deliveryDelayed?: boolean;
          errorMessage?: string;
          failed?: boolean;
          finalizedAt: number;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          opened: boolean;
          replyTo: Array<string>;
          resendId?: string;
          segment: number;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
          subject?: string;
          template?: {
            id: string;
            variables?: Record<string, string | number>;
          };
          text?: string;
          to: Array<string>;
        } | null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          bounced: boolean;
          clicked: boolean;
          complained: boolean;
          deliveryDelayed: boolean;
          errorMessage: string | null;
          failed: boolean;
          opened: boolean;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        } | null
      >;
      handleEmailEvent: FunctionReference<
        "mutation",
        "internal",
        { event: any },
        null
      >;
      sendEmail: FunctionReference<
        "mutation",
        "internal",
        {
          bcc?: Array<string>;
          cc?: Array<string>;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          options: {
            apiKey: string;
            initialBackoffMs: number;
            onEmailEvent?: { fnHandle: string };
            retryAttempts: number;
            testMode: boolean;
          };
          replyTo?: Array<string>;
          subject?: string;
          template?: {
            id: string;
            variables?: Record<string, string | number>;
          };
          text?: string;
          to: Array<string>;
        },
        string
      >;
      updateManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          emailId: string;
          errorMessage?: string;
          resendId?: string;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        },
        null
      >;
    };
  };
};
