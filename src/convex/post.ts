import { query } from "./_generated/server"
import { mutation } from "./_generated/server"
import { TagObject } from "../components/Tags/TagObject"
import { Document } from "./_generated/dataModel"

export const createNewPost = mutation(async({db}, {title, body, images, tags, map}: any) => {
	const post = {title, body, images, tags, map}
	await db.insert("posts", post)
})

export const getPost = query(async ({db, storage}, documentId) => {
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

export const getFilteredPosts = query(async ({db, storage}, tags:{abilities: TagObject[], sides: TagObject[]}, map:string) => {

	let posts = await db
	.query("posts")
	.order("desc")
	.collect()
	
	if (map !== "" && map !== "All") {
		const postsFilteredByMap = posts.filter(post => {
			return post.map === map
		})

		posts = postsFilteredByMap
	}


	let postsFilteredByTags = posts

	if (tags.sides.length !== 0){
		const postsFilteredBySidesTags = postsFilteredByTags.filter(post => {
			let hasOneTag = false
			
			tags.sides.every((tag:TagObject) => {
				if (post.tags.find(postTag => postTag.id === tag.id )) {
					hasOneTag = true
					console.log("sides", hasOneTag)
					return false
				}

				return true
			})

			return hasOneTag
		})

		postsFilteredByTags = postsFilteredBySidesTags
	}

	if (tags.abilities.length !== 0){
		const postsFilteredByAbilityTags = postsFilteredByTags.filter(post => {
			let hasOneTag = false
			
			tags.abilities.every((tag:TagObject) => {
				if (post.tags.find(postTag => postTag.id === tag.id )) {
					hasOneTag = true
					console.log("ability", hasOneTag)
					return false
				}

				return true
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
				console.log("got", downloadUrl)
				image.url = downloadUrl
				console.log("set", image.url)
			}
		}
	}

	return posts
})

export const deletePost = mutation(async({db, storage}, document?: Document<"posts">, documentId?: string) => {
	if (documentId !== undefined) {
		document = (await db.query("posts").collect()).find(post => {
			return post._id.id === documentId
		})
	}
	
	if (document){
		const postImages = document.images.map(image => {return image.storageId})

		for (const storageId of postImages) {
			await storage.delete(storageId)
		}

		await db.delete(document._id)

		return "Successfully Deleted"
	}
})