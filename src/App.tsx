import './App.scss';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { useQuery } from './convex/_generated/react';

import { Tag } from './components/Tags';
import Search from './components/Search';
import Post from './components/Post';
import SortingBar from './components/SortingBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight, faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Document } from './convex/_generated/dataModel';

function App() {

	/* Used to swap out mobile and desktop elements */
	
    const [isMobile, setIsMobile] = useState(false)
    const [windowWidth, setWindowWidth] = useState(0)

	function getWindowWidth() {
        const {clientWidth: width} = document.body
        return width
    }

    function handleResize() {
        setWindowWidth(getWindowWidth())
        setIsMobile(windowWidth <= 600)
    }

	useEffect(() => {
		handleResize()

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    })

	/* =========================================== */

	const [isPostViewOpen, setIsPostViewOpen] = useState(false)
	const [currentOpenPostId, setCurrentOpenPostId] = useState<any>(null)
	const [openImageIndex, setOpenImageIndex] = useState<number>(-1)
	const [selectedTags, setSelectedTags] = useState<{abilities: string[], sides: string[]}>({abilities: [], sides: []})
	const [selectedMap, setSelectedMap] = useState("All")
	const [searchQuery, setSearchQuery] = useState("")

	const [startDragMousePosX, setStartDragMousePosX] = useState<number>(0)
	const [isDraggingPost, setIsDraggingPost] = useState<boolean>(false)
	const [focusedPostTransform, setfocusedPostTransform] = useState<string>("translateX(100%)")
	const [focusedPostTransition, setfocusedPostTransition] = useState<string>("transform 0.25s ease-in-out")
	const [isImageZoomed, setIsImageZoomed] = useState<boolean>(false)

	const postsQuery = useQuery("posts/getFilteredPosts", selectedTags, selectedMap)
	const postsContainer = useRef() as MutableRefObject<HTMLDivElement>

	/* Interrations */

	function handleSelectChange(e:any) {
		setSelectedMap(e.target.value)
	}
	
	function handleTagClick(tag:string, category:"ability"|"side") {
		let abilities = selectedTags.abilities
		let sides = selectedTags.sides

		switch(category) {
			case "ability": {
				if (abilities.includes(tag)) {
					let tagIndex = abilities.indexOf(tag)
		
					if (tagIndex > -1) { // only splice array when item is found
						abilities.splice(tagIndex, 1); // 2nd parameter means remove one item only
					}
			
				} else {
					abilities = [...abilities, tag]
				}
				break;
			}

			case "side": {
				if (sides.includes(tag)) {
					let tagIndex = sides.indexOf(tag)
		
					if (tagIndex > -1) { // only splice array when item is found
						sides.splice(tagIndex, 1); // 2nd parameter means remove one item only
					}
			
				} else {
					sides = [...sides, tag]
				}
				break;
			}
		}

		setSelectedTags({abilities: abilities, sides: sides})
	}

	function onSearchInputChange(value:any) {
		setSearchQuery(value)
	}

	/* Post Components */
	
	let finalPosts:JSX.Element = <></>

	function mapPosts(postsList:any) {
		let search = searchQuery
		let tags = ""
		let connector = ""

		if (searchQuery !== "") {
			search = `"${searchQuery}"`
		}
		
		if (selectedTags.abilities.length > 0 || selectedTags.sides.length > 0) {
			tags = "Selected Tags"
		}
		
		if (searchQuery !== "" && (selectedTags.abilities.length > 0 || selectedTags.sides.length > 0)) {
			connector = "and"
		}

		let notMatchingMessage = `No Posts Matching: ${search} ${connector} ${tags}`

		if (postsList !== undefined) {
			if (postsList.length <= 0 ) {
				finalPosts = <div className="fetching-message">{notMatchingMessage}</div>
			} else {
				finalPosts = postsList.map((post: any, index: number) => { return (
					<Post key={index} data={post} onClick={() => togglePostWithId(post._id.id, post._id)}/>
				)})
			}
		}  else {
			finalPosts = <div className="fetching-message">
				<FontAwesomeIcon className="spinner-icon" icon={faSpinner}/> Fetching...
			</div>
		}
	}
	
	function filterBySearchQuery(filter:string) {
		let filteredPosts = postsQuery

		if (filter !== "") {
			filteredPosts = postsQuery?.filter((post:Document<"posts">) => {
				const title = `${post.map} ${post.title} ${post.tags.join(" ").replace("_", " ")}`.toUpperCase()  
				
				let filterWords = filter.toUpperCase().split(" ")

				let hasMatch = false

				filterWords.every(word => {
					if (title.includes(word)) {
						hasMatch = true
						return true
					} else {
						hasMatch = false
						return false
					} 

				})
				
				return hasMatch
			})
			
		}
		
		mapPosts(filteredPosts)
	}

	filterBySearchQuery(searchQuery)

	/* Toggle Post Viewing */

	function togglePostWithId(dom_id:any, doc_id:any) {
		
		let posts = postsContainer.current.children
		let currentPost = posts.namedItem(dom_id)

		if (currentPost !== undefined) {
			Array.from(posts).forEach((post) => {
				if (post.classList.contains('selected')) {
					if(post !== currentPost) {
						post.classList.remove('selected')
						setIsPostViewOpen(false)
					}
				}
			})
	
			if (currentPost?.classList.contains('selected')) {
				currentPost.classList.remove('selected')
				setIsPostViewOpen(false)
				setfocusedPostTransform("translateX(100%)")
			} else {
				currentPost?.classList.add('selected')
				setIsPostViewOpen(true)
				setCurrentOpenPostId(doc_id)
				setfocusedPostTransform("translateX(0%)")
			}
		}
	}

	if (currentOpenPostId === null) {
		setCurrentOpenPostId(postsQuery?.at(0)?._id)
	}
	
	let focusedPost = postsQuery?.find((post) => {
		return post._id === currentOpenPostId
	})

	/* Handle Dragging the Focused Post */

	function handlefocusedPostDragStart(xCord: any) {
		setIsDraggingPost(true)
		setfocusedPostTransition("")
		setStartDragMousePosX(xCord)
	}

	function handlefocusedPostDrag(xCord: any) {
		let staringPercent = (startDragMousePosX/windowWidth)*100
		let currentPercent = (xCord/windowWidth)*100

		let percentDelta = Math.max(currentPercent - staringPercent, 0)

		if (isDraggingPost && isMobile) {
			setfocusedPostTransform(`translateX(${percentDelta}%)`)
		}
	}

	function handlefocusedPostDragEnd(xCord: any) {
		if (isDraggingPost && isMobile) {
			setIsDraggingPost(false)
			setfocusedPostTransition("transform 0.25s ease-in-out")

			let staringPercent = (startDragMousePosX/windowWidth)*100
			let currentPercent = (xCord/windowWidth)*100
	
			let percentDelta = currentPercent - staringPercent

			if (percentDelta <= 30) {
				setfocusedPostTransform("translateX(0%)")
			} else {
				setfocusedPostTransform("translateX(100%)")
				togglePostWithId(currentOpenPostId.id, currentOpenPostId)
			}
		}
	}

	function handleTouchStartPost(e:any) {
		const {clientX} = e.touches[0]
		handlefocusedPostDragStart(clientX)
	}

	function handleTouchMovePost({changedTouches}:any) {
		const {clientX} = changedTouches[0]
		handlefocusedPostDrag(clientX)
	}

	function handleTouchEndPost({changedTouches}:any) {
		const {clientX} = changedTouches[0]
		handlefocusedPostDragEnd(clientX)
	}

	/* const deletePost = useMutation("posts/deletePost")

	async function handleDeletePost(postId: Id<"posts"> | undefined) {
		await deletePost(postId)
	} */

	function createImageGrids() {
		let postImageGrids:any[] = []
	
		if (focusedPost !== undefined) {
			let allImages = focusedPost.images
			
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

	function handleImageZoom() {
		const target = viewImageRef.current as HTMLImageElement
		const {offsetLeft, offsetTop} = target
		setViewImagePos({x: offsetLeft, y: offsetTop})

		target.style.transform = ""

		if (isImageZoomed) {
			setViewImageDragStartPos({x: 0, y: 0})
			setViewImageDragOffset({x: 0, y:0})
		}

		setIsImageZoomed(oldValue => !oldValue)
	}

	const [viewImageOffset, setViewImagePos] = useState({x: 0, y: 0})
	const [viewImageDragStartPos, setViewImageDragStartPos] = useState<{x: number, y: number}>({x: 0, y:0})
	const [viewImageDragOffset, setViewImageDragOffset] = useState<{x: number, y: number}>({x: 0, y:0})
	const viewImageRef = useRef<HTMLImageElement | null>(null)

	function handleImageMouseMove(clientX:any, clientY:any) {

		const target = viewImageRef.current as HTMLImageElement

		const {clientWidth, clientHeight} = target

		if (isImageZoomed) {
			
			if (isMobile) {

				let {x: prevOffsetX, y: prevOffsetY} = viewImageDragOffset

				let newOffsetX = prevOffsetX + (clientX - viewImageDragStartPos.x)
				let newOffsetY = prevOffsetY + (clientY - viewImageDragStartPos.y)
				
				const clamppedOffsetX = Math.min(Math.max((newOffsetX), - clientWidth), clientWidth) * 0.5
				const clamppedOffsetY = Math.min(Math.max((newOffsetY), - clientHeight), clientHeight) * 0.5
				
				target.style.transform = `translate(${clamppedOffsetX}px, ${clamppedOffsetY}px)`
			} else {
				let offsetX = clientX - viewImageOffset.x
				let offsetY = clientY - viewImageOffset.y	
				const widthOffset = clientWidth/2
				const heightOffset = clientHeight/2
				
				const clamppedOffsetX = Math.min(Math.max((widthOffset - offsetX), -widthOffset), widthOffset)
				const clamppedOffsetY = Math.min(Math.max((heightOffset - offsetY), -heightOffset), heightOffset)
				target.style.transform = `translate(${clamppedOffsetX/2}px, ${clamppedOffsetY/2}px)`
			}
		}
	}

	function handleTouchStartImage({changedTouches}:any) {
		const {clientX, clientY} = changedTouches[0]
		isImageZoomed && setViewImageDragStartPos({x: clientX, y: clientY})
	}

	function handleTouchDragImage({changedTouches}:any) {
		const {clientX, clientY} = changedTouches[0]
		handleImageMouseMove(clientX, clientY)
	}

	function handleTouchEndImage({changedTouches}:any) {
		const target = viewImageRef.current as HTMLImageElement
		const {clientWidth, clientHeight} = target
		const {clientX, clientY} = changedTouches[0]

		let {x: prevOffsetX, y: prevOffsetY} = viewImageDragOffset
		
		let newOffsetX = prevOffsetX + (clientX - viewImageDragStartPos.x)
		let newOffsetY = prevOffsetY + (clientY - viewImageDragStartPos.y)

		const clamppedOffsetX = Math.min(Math.max((newOffsetX), - clientWidth), clientWidth)
		const clamppedOffsetY = Math.min(Math.max((newOffsetY), - clientHeight), clientHeight)
		
		setViewImageDragOffset({x: clamppedOffsetX, y: clamppedOffsetY})
	}

	return (
		<div className={"App" + ((isPostViewOpen && focusedPost !== undefined) ? " viewing-post" : "")} onMouseMove={({clientX}) => handlefocusedPostDrag(clientX)} onTouchMove={handleTouchMovePost} onMouseUp={({clientX}) => handlefocusedPostDragEnd(clientX)} onTouchEnd={handleTouchEndPost}>
			{!isMobile && <SortingBar floating={true} handleTagClick={handleTagClick} handleSelectChange={handleSelectChange}/>}
			
			<main className='main-area' tabIndex={-1}>
				<Search onChangeHandler={onSearchInputChange}/>
				{isMobile && <SortingBar floating={false} handleTagClick={handleTagClick} handleSelectChange={handleSelectChange}/>}
				<div ref={postsContainer} className="post-grid">
					{finalPosts}
			</div>
			</main>

			{focusedPost !== undefined && (<>

				<div className='selected-post' style={isMobile ? {transform: focusedPostTransform, transition: focusedPostTransition} : {}}>
					
					{isMobile && <div className="drag-region" onMouseDown={({clientX}) => handlefocusedPostDragStart(clientX)} onTouchStart={handleTouchStartPost}/>}
					
					<div className="title" style={{backgroundImage: `var(--post-image-over-gradient), url(/maps/${focusedPost?.map}.png)`}}>
						
						<div 
						tabIndex={0} 
						className="close-button" 
						onClick={() => togglePostWithId(focusedPost?._id.id, focusedPost?._id)} 
						onKeyDown={(e) => {
							e.key === "Enter" && togglePostWithId(focusedPost?._id.id, focusedPost?._id)
						}}>
							<FontAwesomeIcon icon={faXmark}/>
						</div>
						
						{focusedPost?.title}
						
						<div className='map-name'>{focusedPost?.map}</div>
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
				</div>
				{openImageIndex > -1 && <div className='view-image'
					onMouseMove={({nativeEvent}) => {!isMobile && handleImageMouseMove(nativeEvent.clientX, nativeEvent.clientY)}}>
					{(focusedPost.images.length > 1 && !isMobile) && <>
						<div className={`left-button ${openImageIndex === 0 && "disabled"}`} onClick={() => setOpenImageIndex( oldIndex => Math.max(oldIndex - 1, 0))}><FontAwesomeIcon icon={faCaretLeft}/></div>
						<div className={`right-button ${openImageIndex === (focusedPost?.images.length - 1) && "disabled"}`} onClick={() => setOpenImageIndex( oldIndex => Math.min(oldIndex + 1, focusedPost ? (focusedPost?.images.length - 1) : 1))}><FontAwesomeIcon icon={faCaretRight}/></div>
					</>}
					<img
						ref={viewImageRef}
						className={`${isImageZoomed && "zoomed"}`}
						src={focusedPost?.images[openImageIndex].url}
						alt={`Post Number: ${openImageIndex + 1}`}
						onClick={handleImageZoom}
						onTouchStart={e => handleTouchStartImage(e)}
						onTouchMove={e => handleTouchDragImage(e)}
						onTouchEnd={e => handleTouchEndImage(e)}/>
					<div 
						tabIndex={0} 
						className="close-button" 
						onClick={() => {
							setOpenImageIndex(-1)
							setIsImageZoomed(false)
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setOpenImageIndex(-1)
								setIsImageZoomed(false)
							}
						}}>
							<FontAwesomeIcon icon={faXmark}/>
					</div>
				</div>}
			</>)}
		</div>
	)
}

export default App;