import { query } from "../_generated/server";

export default query(async ({db}, id) => {
	return await db.get(id)
})