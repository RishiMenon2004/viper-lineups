import { v } from "convex/values"
import { mutation } from "./_generated/server"

export const generateUploadUrl = mutation({
	handler: async ({ storage }) => {
		return await storage.generateUploadUrl()
	}
})

export const deleteImage =  mutation({
	args: {
		storageId: v.id("_storage"),
	},
	handler: async ({ storage }, { storageId }) => {
		return await storage.delete( storageId )
	}
})