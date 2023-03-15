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

posts = {

  title: string,

  body: string,

  map: string,

  side: tag,
  
  abilities: tag[],

  images: image[],

}.index({
  "by_map": ["map"]
})

*/

export const tagSchema = s.object({ displayText: s.string(), id: s.string() })
export const imageSchema = s.object({ cover: s.boolean(), storageId: s.string(), url: s.optional(s.string()) })

export default defineSchema({
  posts: defineTable({
    abilities: s.array(tagSchema),
    body: s.string(),
    images: s.array(imageSchema),
    map: s.string(),
    side: tagSchema,
    tags: s.array(
      s.object({
        category: s.string(),
        displayText: s.string(),
        id: s.string(),
      })
    ),
    title: s.string(),
  }).index("by_map", ["map"])
});