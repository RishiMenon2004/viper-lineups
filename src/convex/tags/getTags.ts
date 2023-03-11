import { query } from "../_generated/server";

export default query(async ({db}) => {
	return await (await db.query("tags").collect()).sort((a, b) => {
		if (a.id > b.id) {
			return 1
		}

		if (a.id < b.id) {
			return -1
		}

		return 0
	})
})