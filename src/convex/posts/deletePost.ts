import { mutation } from "../_generated/server";

export default mutation(async({db, storage}, documentId) => {
	const document = await (await db.query("posts").filter(q => q.eq(q.field("_id"), documentId)).collect()).at(0)

	if (document !== undefined) {
		const postImages = document?.images.map(image => {return image.url})

		console.log(postImages)

		const imageDocuments = (await db.query("images").collect()).filter(imageDoc => {
			return postImages?.includes(imageDoc.downloadUrl)
		})

		for (const imageDoc of imageDocuments) {
			await storage.delete(imageDoc.storageId)
			await db.delete(imageDoc._id)
		}
	}

	try {
		await db.delete(documentId)
	} 
	catch (err) {
		console.error(err)
		return ("Task Unsuccessful")
	}

	return "Successfully Deleted"
})