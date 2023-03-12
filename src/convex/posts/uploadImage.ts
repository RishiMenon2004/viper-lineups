import { mutation } from "../_generated/server";

export const generateUploadUrl = mutation(async ({ storage }) => {
	return await storage.generateUploadUrl()
})

export const sendImage = mutation(async ({db, storage}, storageId) => {
	console.log("uploading")
	const downloadUrl = await storage.getUrl(storageId) as string
	const imageDocument = {storageId: storageId, downloadUrl: downloadUrl}
	await db.insert("images", imageDocument)
})