import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/* 


tag = {
  displayText: string,
  id: string,
}

image = {
  cover: boolean,
  storageId: string,
  url?: string,
}

post = {

  title: string,

  body: string,

  map: string,

  side: tag,
  
  abilities: tag[],

  images: image[],

}

*/

export const tagSchema = v.object({
  displayText: v.string(),
  id: v.string()
})

export const imageSchema = v.object({
  cover: v.boolean(),
  storageId: v.id("_storage"),
  url: v.optional(v.string())
})

export const postSchema = v.object({
  abilities: v.array(tagSchema),
  body: v.string(),
  images: v.array(imageSchema),
  map: v.string(),
  side: tagSchema,
  title: v.string(),
})

export default defineSchema({
  posts: defineTable(postSchema).index("by_map", ["map"])
});