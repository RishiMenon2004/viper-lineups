import { query } from "../_generated/server";

export const getAllImages = query(async ({db}) => {
	return await db.query("images").collect()
})

export const getImage = query(async ({db}, storageId) => {
	const image = await db
	.query("images")
	.filter(q => q.eq(q.field("storageId"), storageId))
	.collect()

	return image.at(0)
})