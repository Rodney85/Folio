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
import type * as adminUsers from "../adminUsers.js";
import type * as admin_content from "../admin/content.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as carOrder from "../carOrder.js";
import type * as cars from "../cars.js";
import type * as debug from "../debug.js";
import type * as dev from "../dev.js";
import type * as dodo from "../dodo.js";
import type * as env from "../env.js";
import type * as explore from "../explore.js";
import type * as files from "../files.js";
import type * as freemium from "../freemium.js";
import type * as http from "../http.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_sanitize from "../lib/sanitize.js";
import type * as lib_userHelpers from "../lib/userHelpers.js";
import type * as migrations_fixUserIds from "../migrations/fixUserIds.js";
import type * as migrations_publishPartsForPublishedCars from "../migrations/publishPartsForPublishedCars.js";
import type * as modHotspots from "../modHotspots.js";
import type * as mutations_admin from "../mutations/admin.js";
import type * as mutations_adminContent from "../mutations/adminContent.js";
import type * as mutations_carPublishing from "../mutations/carPublishing.js";
import type * as parts from "../parts.js";
import type * as payments from "../payments.js";
import type * as types from "../types.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminContent: typeof adminContent;
  adminDashboard: typeof adminDashboard;
  adminUsers: typeof adminUsers;
  "admin/content": typeof admin_content;
  analytics: typeof analytics;
  auth: typeof auth;
  carOrder: typeof carOrder;
  cars: typeof cars;
  debug: typeof debug;
  dev: typeof dev;
  dodo: typeof dodo;
  env: typeof env;
  explore: typeof explore;
  files: typeof files;
  freemium: typeof freemium;
  http: typeof http;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/sanitize": typeof lib_sanitize;
  "lib/userHelpers": typeof lib_userHelpers;
  "migrations/fixUserIds": typeof migrations_fixUserIds;
  "migrations/publishPartsForPublishedCars": typeof migrations_publishPartsForPublishedCars;
  modHotspots: typeof modHotspots;
  "mutations/admin": typeof mutations_admin;
  "mutations/adminContent": typeof mutations_adminContent;
  "mutations/carPublishing": typeof mutations_carPublishing;
  parts: typeof parts;
  payments: typeof payments;
  types: typeof types;
  users: typeof users;
  webhooks: typeof webhooks;
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
  dodopayments: {
    lib: {
      checkout: FunctionReference<
        "action",
        "internal",
        {
          apiKey: string;
          environment: "test_mode" | "live_mode";
          payload: {
            allowed_payment_method_types?: Array<string>;
            billing_address?: {
              city?: string;
              country: string;
              state?: string;
              street?: string;
              zipcode?: string;
            };
            billing_currency?: string;
            confirm?: boolean;
            customer?:
              | { email: string; name?: string; phone_number?: string }
              | { customer_id: string };
            customization?: {
              force_language?: string;
              show_on_demand_tag?: boolean;
              show_order_details?: boolean;
              theme?: string;
            };
            discount_code?: string;
            feature_flags?: {
              allow_currency_selection?: boolean;
              allow_discount_code?: boolean;
              allow_phone_number_collection?: boolean;
              allow_tax_id?: boolean;
              always_create_new_customer?: boolean;
            };
            force_3ds?: boolean;
            metadata?: Record<string, string>;
            product_cart: Array<{
              addons?: Array<{ addon_id: string; quantity: number }>;
              amount?: number;
              product_id: string;
              quantity: number;
            }>;
            return_url?: string;
            show_saved_payment_methods?: boolean;
            subscription_data?: {
              on_demand?: {
                adaptive_currency_fees_inclusive?: boolean;
                mandate_only: boolean;
                product_currency?: string;
                product_description?: string;
                product_price?: number;
              };
              trial_period_days?: number;
            };
          };
        },
        { checkout_url: string }
      >;
      customerPortal: FunctionReference<
        "action",
        "internal",
        {
          apiKey: string;
          dodoCustomerId: string;
          environment: "test_mode" | "live_mode";
          send_email?: boolean;
        },
        { portal_url: string }
      >;
    };
  };
};
