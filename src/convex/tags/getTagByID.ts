import { query } from "../_generated/server";

export default query(async ({db}, id:string) => {
	return await db
	.query("tags")
	.filter(q => q.eq(q.field("id"), id))
	.collect()
})