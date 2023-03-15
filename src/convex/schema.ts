import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  posts: defineTable({
    body: s.string(),
    images: s.array(s.object({ cover: s.boolean(), storageId: s.string(), url: s.optional(s.string()) })),
    map: s.string(),
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