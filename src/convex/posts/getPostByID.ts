import { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";

export default query(async ({db}, id: Id<string>) => {
	return await db.get(id)
})