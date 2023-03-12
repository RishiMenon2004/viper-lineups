import { mutation } from "../_generated/server"

export default mutation(async ({ db, storage }, storageId) => {
	const imageDocuments = await db.query("images").filter(q => q.eq(q.field("storageId"), storageId)).collect()

	for (const imageDocument of imageDocuments) {
		db.delete(imageDocument._id)
	}

	return await storage.delete(storageId)
})