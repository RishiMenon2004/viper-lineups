/* eslint-disable */
/**
 * Generated API.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@0.10.0.
 * To regenerate, run `npx convex codegen`.
 * @module
 */

import type { ApiFromModules } from "convex/api";
import type * as posts_getAllPosts from "../posts/getAllPosts";
import type * as posts_getFilteredPosts from "../posts/getFilteredPosts";
import type * as posts_getPostByID from "../posts/getPostByID";
import type * as tags_getTagByID from "../tags/getTagByID";
import type * as tags_getTags from "../tags/getTags";

/**
 * A type describing your app's public Convex API.
 *
 * This `API` type includes information about the arguments and return
 * types of your app's query and mutation functions.
 *
 * This type should be used with type-parameterized classes like
 * `ConvexReactClient` to create app-specific types.
 */
export type API = ApiFromModules<{
  "posts/getAllPosts": typeof posts_getAllPosts;
  "posts/getFilteredPosts": typeof posts_getFilteredPosts;
  "posts/getPostByID": typeof posts_getPostByID;
  "tags/getTagByID": typeof tags_getTagByID;
  "tags/getTags": typeof tags_getTags;
}>;