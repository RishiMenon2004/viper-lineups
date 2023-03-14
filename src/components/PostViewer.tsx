import { faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useState } from "react"
import { MobileContext } from "../App"
import { Document } from "../convex/_generated/dataModel"
import { useMutation } from "../convex/_generated/react"
import ImageViewer from "./ImageViewer"
import { Tag } from "./Tags"
import { TagObject } from "./Tags/TagObject"

function PostViewer({
	togglePostWithId,
	isActive,
	post,
}:{
	togglePostWithId: Function,
	isActive: boolean,
	post: Document<"posts">
}) {

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
		let startingPercent = (dragStartPosX/windowWidth)*100
		let currentPercent = (xCord/windowWidth)*100

		let percentDelta = Math.max(currentPercent - startingPercent, 0)

		if (isDraggingPost && isMobile) {
			setPostContainerTransform(percentDelta)
		}
	}

	function handlePostContainerDragEnd(xCord: number) {
		if (isDraggingPost && isMobile) {
			setIsDraggingPost(false)
			setPostContainerTransition("0.25s ease-in-out")

			let startingPercent = (dragStartPosX/windowWidth)*100
			let currentPercent = (xCord/windowWidth)*100
	
			let percentDelta = currentPercent - startingPercent

			if (percentDelta < 30) {
				setPostContainerTransform(0)
			} else {
				setPostContainerTransform(100)
				
				setTimeout(() => togglePostWithId(), 250)
			}
		}
	}

	const deletePost = useMutation("post:deletePost")

	async function handleDeletePost(post: Document<"posts">) {
		togglePostWithId(post._id)
		await deletePost(post)
	}

	/* Split images and put them into a grid of max. 5 */
	const getPostImages = post.images
	
	function createImageGrids() {
		let postImageGrids:any[] = []
	
		if (getPostImages) {
			let allImages = getPostImages
		
			let startIndex:number = 0

			for (let i = 1; i < Math.ceil(allImages.length/5) + 1; i++) {
				
				let imageSet = allImages.slice(startIndex, i*5)
				
				let gridImages = imageSet.map((image, index) => {

					let span = {row: 1, column: 1}
					
					switch (imageSet.length) {
						case 5: {
							switch (index) {
								case 0: span = {row: 3, column: 3}; break;
								case 1: span = {row: 3, column: 3}; break;
								case 2: span = {row: 3, column: 2}; break;
								case 3: span = {row: 3, column: 2}; break;
								case 4: span = {row: 3, column: 2}; break;
							}
							break;
						}
						case 4: {
							switch (index) {
								case 0: span = {row: 3, column: 3}; break;
								case 1: span = {row: 3, column: 3}; break;
								case 2: span = {row: 3, column: 3}; break;
								case 3: span = {row: 3, column: 3}; break;
							}
							break;
						}
						case 3: {
							switch (index) {
								case 0: span = {row: 4, column: 4}; break;
								case 1: span = {row: 2, column: 2}; break;
								case 2: span = {row: 2, column: 2}; break;
							}
							break;
						}
						case 2: {
							switch (index) {
								case 0: span = {row: 5, column: 3}; break;
								case 1: span = {row: 5, column: 3}; break;
							}
							break;
						}
						case 1: {
							switch (index) {
								case 0: span = {row: 5, column: 6}; break;
							}
							break;
						}
					}

					let globalIndex = allImages.findIndex(allImage => {
						return allImage === image
					})

					return (
						<div
						className="image"
						onClick={() => setOpenImageIndex(globalIndex)}
						key={index} 
						style={{
							backgroundImage: `url(${image.url})`,
							gridRow: `span ${span.row}`, 
							gridColumn: `span ${span.column}`}}
						/>
					)
				})

				startIndex = i * 5

				postImageGrids.push(<div className="image-grid">{gridImages}</div>)
			}
		}

		return postImageGrids
	}

	const PostContent = () => {
		if (post) {
			return (<>
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
						{post.tags.map((tag: TagObject, index: number) => {
							return <Tag key={index} tag={tag}/>
						})}
					</div>
					
					{post.body}
					
					{createImageGrids().map(imageGrid => {
						return imageGrid
					})}
					
					<div className="post-buttons">
						<button onClick={() => handleDeletePost(post)}>Delete Post</button>
					</div>
				</div>
			</>)
		} else {
			return (<>
				<div className="title placeholder" style={{backgroundImage: `var(--post-image-over-gradient), url(/maps/Ascent.png)`}}>
				<FontAwesomeIcon className="spinner-icon" spin icon={faSpinner}/>
					<div className='map-name placeholder'><FontAwesomeIcon className="spinner-icon" spin icon={faSpinner}/></div>
				</div>
				
				<div className="content-grid">
					
					<div className='tags-container'>
						<Tag tag={undefined}/>
					</div>

					<FontAwesomeIcon className="spinner-icon" spin icon={faSpinner}/>
				</div>
			</>)
		}
	}

	console.log(isActive)

	return (<>
		<div className={"selected-post" + ((isMobile && isActive) ? " active" : "")}
		style={isMobile ? {
				transform: `TranslateX(${postContainerTransform}%)`,
				transition: `transform ${PostContainerTransition}`
			} : {}}>
							
			{isMobile && (
				<div 
					className="drag-region"
					onMouseDown={({clientX}) => handlePostContainerDragStart(clientX)}
					onMouseMove={({clientX}) => handlePostContainerDrag(clientX)}
					onMouseUp={({clientX}) => handlePostContainerDragEnd(clientX)}
					onTouchStart={({changedTouches}) => handlePostContainerDragStart(changedTouches[0].clientX)}
					onTouchMove={({changedTouches}) => handlePostContainerDrag(changedTouches[0].clientX)}
					onTouchEnd={({changedTouches}) => handlePostContainerDragEnd(changedTouches[0].clientX)}
				/>
			)}

			<PostContent/>

		</div>
		{isMobile && (
			<div className="blur-background"
			style={{
				backdropFilter: `blur(${(100-Math.max(postContainerTransform, 1))/100 * 10}px)`,
				transition: `backdrop-filter ${PostContainerTransition}`
			}}/>
		)}
		{openImageIndex > -1 && <ImageViewer
			openImageIndexState={[openImageIndex, setOpenImageIndex]}
			images={post.images}
		/>}
	</>)
}

export default PostViewer