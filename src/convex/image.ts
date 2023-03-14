import { query } from "./_generated/server"
import { mutation } from "./_generated/server"

export const generateUploadUrl = mutation(async ({ storage }) => {
	return await storage.generateUploadUrl()
})

export const sendImage = mutation(async ({db, storage}, storageId) => {
	console.log("uploading")
	const downloadUrl = await storage.getUrl(storageId) as string
	const imageDocument = {storageId: storageId, downloadUrl: downloadUrl}
	await db.insert("images", imageDocument)
})

export const getImages = query(async ({db}) => {
	return await db.query("images").collect()
})

export const getImage = query(async ({db}, storageId) => {
	return await db
	.query("images")
	.filter(q => q.eq(q.field("storageId"), storageId))
	.unique()
})

export const getPostImages = query(async ({db}, documentId) => {
	const post = await db.query("posts").filter(q => q.eq(q.field("_id"), documentId)).unique()
	const postImageStorageIDs = post?.images.map(image => {
		return image.storageId
	})

	const postImageDownloadUrls:string[] = []

	if (postImageStorageIDs) {
		for (const storageId of postImageStorageIDs) {
			const image = await db.query("images").filter(q => q.eq(q.field("storageId"), storageId)).unique()

			const downloadUrl = image?.downloadUrl
			if (downloadUrl) {
				postImageDownloadUrls.push(downloadUrl)
			}
		}
	}

	return postImageDownloadUrls
})

export const deleteImage =  mutation(async ({ db, storage }, storageId) => {
	const imageDocuments = await db.query("images").filter(q => q.eq(q.field("storageId"), storageId)).collect()

	for (const imageDocument of imageDocuments) {
		db.delete(imageDocument._id)
	}

	return await storage.delete(storageId)
})