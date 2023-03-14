import { faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useState } from "react"
import { MobileContext } from "../App"
import { Id } from "../convex/_generated/dataModel"
import { useQuery } from "../convex/_generated/react"
import ImageViewer from "./ImageViewer"
import { Tag } from "./Tags"

function PostViewer({
	currentOpenPostId,
	togglePostWithId,
	focusedPostTransformState,
	isActive,
}:{
	currentOpenPostId: Id<"posts">, 
	togglePostWithId: Function, 
	focusedPostTransformState?: [string, Function],
	isActive: boolean,
}) {

	const {isMobile, windowWidth} = useContext(MobileContext)

	// const [focusedPostTransform, setFocusedPostTransform] = focusedPostTransformState
	const [focusedPostTransform, setFocusedPostTransform] = useState<number>(-1)
	const [focusedPostTransition, setFocusedPostTransition] = useState<string>("0.25s ease-in-out")
	const [openImageIndex, setOpenImageIndex] = useState<number>(-1)

	/* Handle Dragging the Focused Post */
	const [dragStartPosX, setDragMousePosXStart] = useState<number>(0)
	const [isDraggingPost, setIsDraggingPost] = useState<boolean>(false)

	const focusedPost = useQuery("posts/getPosts:getPost", currentOpenPostId)

	function handleFocusedPostDragStart(xCord: number) {
		openImageIndex < 0 && setIsDraggingPost(true)
		setFocusedPostTransition("")
		setDragMousePosXStart(xCord)
	}

	function handleFocusedPostDrag(xCord: number) {
		let startingPercent = (dragStartPosX/windowWidth)*100
		let currentPercent = (xCord/windowWidth)*100

		let percentDelta = Math.max(currentPercent - startingPercent, 0)

		if (isDraggingPost && isMobile) {
			setFocusedPostTransform(percentDelta)
		}
	}

	function handleFocusedPostDragEnd(xCord: number) {
		if (isDraggingPost && isMobile) {
			setIsDraggingPost(false)
			setFocusedPostTransition("0.25s ease-in-out")

			let startingPercent = (dragStartPosX/windowWidth)*100
			let currentPercent = (xCord/windowWidth)*100
	
			let percentDelta = currentPercent - startingPercent

			if (percentDelta < 30) {
				setFocusedPostTransform(0)
			} else {
				setFocusedPostTransform(100)
				
				setTimeout(() => togglePostWithId(), 250)
			}
		}
	}

	/* const deletePost = useMutation("posts/deletePost")

	async function handleDeletePost(postId: Id<"posts"> | undefined) {
		await deletePost(postId)
	} */

	/* Split images and put them into a grid of max. 5 */

	function createImageGrids() {
		let postImageGrids:any[] = []
	
		if (focusedPost !== undefined) {
			let allImages = focusedPost?.images !== undefined ? focusedPost?.images : []
		
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
		if (focusedPost !== undefined && focusedPost !== null) {
			return (<>
				<div className="title" style={{backgroundImage: `var(--post-image-over-gradient), url(/maps/${focusedPost?.map}.png)`}}>
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
					
					{focusedPost.title}
					
					<div className='map-name'>{focusedPost.map}</div>
				</div>
				
				<div className="content-grid">
					
					<div className='tags-container'>
						{focusedPost?.tags.map((tag: string, index: number) => {
							return <Tag key={index} id={tag}/>
						})}
					</div>
					
					{focusedPost.body}
					
					{createImageGrids()}
					
					{/* <div className="post-buttons">
						<button onClick={() => handleDeletePost(focusedPost?._id)}>Delete Post</button>
					</div> */}
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
						<Tag id={"placeholder"}/>
					</div>

					<FontAwesomeIcon className="spinner-icon" spin icon={faSpinner}/>
				</div>
			</>)
		}
	}

	console.log(isActive)

	return (<>
		<div className={"blur-background" + ((isMobile && isActive) ? " active" : "")}
		style={{
			backdropFilter: `blur(${(100-focusedPostTransform)/100 * 10}px)`,
			transition: `backdrop-filter ${focusedPostTransition}`
		}}>

		</div>
		<div className={"selected-post" + ((isMobile && isActive) ? " active" : "")}
		style={isMobile ? {
				transform: `TranslateX(${focusedPostTransform}%)`,
				transition: `transform ${focusedPostTransition}`
			} : {}}>
							
			{isMobile && (
				<div 
					className="drag-region"
					onMouseDown={({clientX}) => handleFocusedPostDragStart(clientX)}
					onMouseMove={({clientX}) => handleFocusedPostDrag(clientX)}
					onMouseUp={({clientX}) => handleFocusedPostDragEnd(clientX)}
					onTouchStart={({changedTouches}) => handleFocusedPostDragStart(changedTouches[0].clientX)}
					onTouchMove={({changedTouches}) => handleFocusedPostDrag(changedTouches[0].clientX)}
					onTouchEnd={({changedTouches}) => handleFocusedPostDragEnd(changedTouches[0].clientX)}
				/>
			)}

			<PostContent/>

		</div>
		{openImageIndex > -1 && <ImageViewer
			openImageIndexState={[openImageIndex, setOpenImageIndex]}
			currentOpenPostId={currentOpenPostId}
		/>}
	</>)
}

export default PostViewer