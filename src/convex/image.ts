import { mutation } from "./_generated/server"

export const generateUploadUrl = mutation(async ({ storage }) => {
	return await storage.generateUploadUrl()
})

export const deleteImage =  mutation(async ({ storage }, storageId) => {
	await storage.delete(storageId)
})