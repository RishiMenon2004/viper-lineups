import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  images: defineTable({
    storageId: s.string(),
    downloadUrl: s.string(),
  }),
  posts: defineTable({
    body: s.string(),
    images: s.array(s.object({ cover: s.boolean(), url: s.string() })),
    map: s.string(),
    tags: s.array(s.string()),
    title: s.string(),
  }),
  tags: defineTable({
    category: s.string(),
    displayText: s.string(),
    id: s.string(),
  }),
});