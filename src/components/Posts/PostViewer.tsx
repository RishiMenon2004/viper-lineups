import { useContext, useState } from "react"
import { useMutation } from "convex/react"
import { Doc } from "../../../convex/_generated/dataModel"
import { api } from "../../../convex/_generated/api"

import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { Tag } from "../Tags"
import { TagObject } from "../Tags/tagObject"
import ImageViewer from "../ImageViewer"

import { MobileContext, PostContext } from "../../App"
export function PostViewer({
	togglePostWithId,
	isActive,
}:{
	togglePostWithId: () => void,
	isActive: boolean,
}) {

	const post = useContext(PostContext)

	const {isMobile, windowWidth} = useContext(MobileContext)

	const [postContainerTransform, setPostContainerTransform] = useState<number>(0)
	const [PostContainerTransition, setPostContainerTransition] = useState<string>("0.25s ease-in-out")
	const [openImageIndex, setOpenImageIndex] = useState<number>(-1)

	/* Handle Dragging the Focused Post */
	const [dragStartPosX, setDragMousePosXStart] = useState<number>(0)
	const [isDraggingPost, setIsDraggingPost] = useState<boolean>(false)

	function handlePostContainerDragStart(xCord: number) {
		openImageIndex < 0 && setIsDraggingPost(true)
		setPostContainerTransition("")
		setDragMousePosXStart(xCord)
	}

	function handlePostContainerDrag(xCord: number) {
		const startingPercent = (dragStartPosX/windowWidth)*100
		const currentPercent = (xCord/windowWidth)*100

		const percentDelta = Math.max(currentPercent - startingPercent, 0)

		if (isDraggingPost && isMobile) {
			setPostContainerTransform(percentDelta)
		}
	}

	function handlePostContainerDragEnd(xCord: number) {
		if (isDraggingPost && isMobile) {
			setIsDraggingPost(false)
			setPostContainerTransition("0.25s ease-in-out")

			const startingPercent = (dragStartPosX/windowWidth)*100
			const currentPercent = (xCord/windowWidth)*100
	
			const percentDelta = currentPercent - startingPercent

			if (percentDelta < 30) {
				setPostContainerTransform(0)
			} else {
				setPostContainerTransform(100)
				
				setTimeout(() => togglePostWithId(), 250)
			}
		}
	}

	/* Split images and put them into a grid of max. 5 */
	const getPostImages = post ? post.images : []
	
	function createImageGrids() {
		const postImageGrids:JSX.Element[] = []
	
		if (getPostImages) {
			const allImages = getPostImages
		
			let startIndex = 0

			for (let i = 1; i < Math.ceil(allImages.length/5) + 1; i++) {
				
				const imageSet = allImages.slice(startIndex, i*5)

				let gridRows = 6

				const gridImages = imageSet.map((image, index) => {

					let span = {row: 1, column: 1}
					
					switch (imageSet.length) {
						case 5: {
							span = {row: 3, column: 2}

							if (index < 2) {
								span = {row: 3, column: 3}
							}

							break
						}

						case 4: {
							span = {row: 3, column: 3}
							break
						}

						case 3: {
							span = {row: 2, column: 2}

							if (index === 0) {
								span = {row: 4, column: 4}
							}

							gridRows = 4
							
							break
						}

						case 2: {
							span = {row: 5, column: 3}
							gridRows = 5
							break
						}

						case 1: {
							span = {row: 5, column: 6}
							gridRows = 5
							break
						}
					}

					const globalIndex = allImages.findIndex(allImage => {
						return allImage === image
					})

					return (
						<div
						className="image"
						onClick={() => setOpenImageIndex(globalIndex)}
						key={index}
						style={{
							backgroundImage: `url(${image.url ? image.url : ""})`,
							gridRow: `span ${span.row}`, 
							gridColumn: `span ${span.column}`	
						}}
						/>
					)
				})

				startIndex = i * 5

				postImageGrids.push(<div className="image-grid" style={{
					gridTemplateRows: `repeat(${gridRows}, 1fr)`,
					aspectRatio: `16/${gridRows*1.5}`
				}}>{gridImages}</div>)
			}
		}

		return postImageGrids
	}

	const deletePost = useMutation(api.post.deletePost)

	function DeleteButton() {

		async function handleDeletePost(post: Doc<"posts">) {
			await deletePost({document: post})
			togglePostWithId()
		}

		return <button className="button red delete-post-button" onClick={() => void handleDeletePost(post)}>Delete Post</button>
	
	}

	return (<>
		<div className={"selected-post" + ((isMobile && isActive) ? " active" : "")}
		style={isMobile ? {
				transform: `TranslateX(${postContainerTransform}%)`,
				transition: `transform ${PostContainerTransition}`
			} : {}}>
							
			{isMobile && (
				<div 
					className="drag-region"
					onMouseDown={({clientX}) => {
						handlePostContainerDragStart(clientX)
					}}
					onMouseMove={({clientX}) => {
						handlePostContainerDrag(clientX)
					}}
					onMouseUp={({clientX}) => {
						handlePostContainerDragEnd(clientX)
					}}
					onTouchStart={({changedTouches}) => {
						handlePostContainerDragStart(changedTouches[0].clientX)
					}}
					onTouchMove={({changedTouches}) => {
						handlePostContainerDrag(changedTouches[0].clientX)
					}}
					onTouchEnd={({changedTouches}) => {
						handlePostContainerDragEnd(changedTouches[0].clientX)
					}}
				/>
			)}

			<div className="title" style={{backgroundImage: `var(--post-image-over-gradient), url(/maps/${post.map}.png)`}}>
				<div 
					tabIndex={0} 
					className="close-button"
					onClick={() => togglePostWithId()} 
					onKeyDown={(e) => {
						e.key === "Enter" && togglePostWithId()
					}}
				>
					<FontAwesomeIcon icon={faXmark}/>
				</div>
				
				<div className="title-text">{post.title}</div>
				
				<div className='map-name'>{post.map}</div>
			</div>
			
			<div className="content-grid">
				
				<div className='tags-container'>
					<Tag tag={post.side}/>
					{post.abilities.map((tag: TagObject, index: number) => {
						return <Tag key={index} tag={tag}/>
					})}
				</div>
				
				{post.body}
				
				<div className="image-grid-wrapper">
					{createImageGrids().map(imageGrid => {
						return imageGrid
					})}
				</div>
				
				{!isMobile && <div className="buttons-wrapper">
					<DeleteButton />
				</div>}
			</div>

		</div>
		{isMobile && (
			<div className="blur-background"
			style={{
				backdropFilter: `blur(${(100-postContainerTransform)/100 * 10}px)`,
				transition: `backdrop-filter ${PostContainerTransition}`
			}}/>
		)}
		{openImageIndex > -1 && <ImageViewer
			openImageIndexState={[openImageIndex, setOpenImageIndex]}
			images={post.images}
		/>}
	</>)
}