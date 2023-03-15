import { defineSchema, defineTable, s } from "convex/schema";

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

export const tagSchema = s.object({
  displayText: s.string(),
  id: s.string()
})

export const imageSchema = s.object({
  cover: s.boolean(),
  storageId: s.string(),
  url: s.optional(s.string())
})

export const postSchema = s.object({
  abilities: s.array(tagSchema),
  body: s.string(),
  images: s.array(imageSchema),
  map: s.string(),
  side: tagSchema,
  title: s.string(),
})

export default defineSchema({
  posts: defineTable(postSchema).index("by_map", ["map"])
});