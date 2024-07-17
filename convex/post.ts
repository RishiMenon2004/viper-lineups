import { query } from "./_generated/server"
import { mutation } from "./_generated/server"
import { Doc, Id } from "./_generated/dataModel"
import { TagObject } from "../src/components/Tags/tagObject"
import { postSchema } from "./schema"

export const createNewPost = mutation({
	args: {
		post: postSchema
	},
	handler: async({ db }, { post }) => {
		await db.insert("posts", post)
	}
})

export const getPost = query(async ({db, storage}, {documentId}: {documentId: Id<"posts">}) => {
	const post = await db.query("posts").filter(q => q.eq(q.field("_id"), documentId)).unique()

	if (post) {
		for (const image of post.images) {
			const downloadUrl =  await storage.getUrl(image.storageId)
			if (downloadUrl) {
				image.url = downloadUrl
			}
		}
	}

	return post
})

function hasTag(tag: TagObject, inArray: TagObject[]) {
	return inArray.find(checkTag => {
		return checkTag.id === tag.id
	}) !== undefined
}

export const getFilteredPosts = query(async ({db, storage}, {tags: { abilities, sides }, map}: {tags:{abilities: TagObject[], sides: TagObject[]}, map:string}) => {

	let posts = (map !== "" && map !== "All") ? 
	await db
		.query("posts")
		.withIndex("by_map", q => q.eq("map", map))
		.order("desc")
		.collect()
	: await db
		.query("posts")
		.order("desc")
		.collect()

	let postsFilteredByTags = posts

	if (sides.length !== 0) {
		const postsFilteredBySidesTags = postsFilteredByTags.filter(post => {
			return hasTag(post.side, sides)
		})

		postsFilteredByTags = postsFilteredBySidesTags
	}

	if (abilities.length !== 0){
		const postsFilteredByAbilityTags = postsFilteredByTags.filter(post => {
			let hasOneTag = false
			post.abilities.every(postTag => {
				hasOneTag = hasTag(postTag, abilities)
				return !hasOneTag
			})
			return hasOneTag
		})
		postsFilteredByTags = postsFilteredByAbilityTags
	}
	
	posts = postsFilteredByTags

	for (const post of posts) {
		for (const image of post.images) {
			const downloadUrl =  await storage.getUrl(image.storageId)
			if (downloadUrl) {
				image.url = downloadUrl
			}
		}
	}

	return posts
})

export const deletePost = mutation(async({db, storage}, {document}: {document: Doc<"posts">}) => {

	if (document){
		const postImages = document.images.map(image => {return image.storageId})

		for (const storageId of postImages) {
			await storage.delete(storageId)
		}

		await db.delete(document._id)

		return "Successfully Deleted"
	}
})