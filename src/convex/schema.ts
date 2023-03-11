import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
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