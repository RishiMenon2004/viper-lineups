import './App.scss';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { useQuery } from './convex/_generated/react';

import { Tag } from './components/Tags';
import Search from './components/Search';
import Post from './components/Post';
import SortingBar from './components/SortingBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';
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
	const [selectedTags, setSelectedTags] = useState<{abilities: string[], sides: string[]}>({abilities: [], sides: []})
	const [selectedMap, setSelectedMap] = useState("All")
	const [searchQuery, setSearchQuery] = useState("")

	const [startDragMousePosX, setStartDragMousePosX] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [viewPostTransform, setViewPostTransform] = useState("translateX(100%)")
	const [viewPostTransition, setViewPostTransition] = useState("transform 0.25s ease-in-out")

	const postsQuery = useQuery("posts/getFilteredPosts", selectedTags, selectedMap)
	const postsContainer = useRef() as MutableRefObject<HTMLDivElement>
	const viewPostRef = useRef() as MutableRefObject<HTMLDivElement>

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
				finalPosts = <div className="fetching_message">{notMatchingMessage}</div>
			} else {
				finalPosts = postsList.map((post: any, index: number) => {
					return <Post key={index} data={post}
						onClick={() => togglePostWithId(post._id.id, post._id)}
					/>
				})
			}
		}  else {
			finalPosts = <div className="fetching_message"><FontAwesomeIcon icon={faSpinner}/> Fetching...</div>
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
				setViewPostTransform("translateX(100%)")
			} else {
				currentPost?.classList.add('selected')
				setIsPostViewOpen(true)
				setCurrentOpenPostId(doc_id)
				setViewPostTransform("translateX(0%)")
			}
		}
	}

	if (currentOpenPostId === null) {
		setCurrentOpenPostId(postsQuery?.at(0)?._id)
	}
	
	let viewPost = postsQuery?.find((post) => {
		return post._id === currentOpenPostId
	})

	function handleViewPostDragStart(xCord: any) {
		setIsDragging(true)
		setViewPostTransition("")
		setStartDragMousePosX(xCord)
	}

	function handleViewPostDrag(xCord: any) {
		let staringPercent = (startDragMousePosX/windowWidth)*100
		let currentPercent = (xCord/windowWidth)*100

		let percentDelta = Math.max(currentPercent - staringPercent, 0)

		if (isDragging && isMobile && percentDelta > 10) {
			setViewPostTransform(`translateX(${percentDelta}%)`)
		}
	}

	function handleViewPostDragEnd(xCord: any) {
		if (isDragging && isMobile) {
			setIsDragging(false)
			setViewPostTransition("transform 0.25s ease-in-out")

			let staringPercent = (startDragMousePosX/windowWidth)*100
			let currentPercent = (xCord/windowWidth)*100
			console.log(isDragging)
	
			let percentDelta = currentPercent - staringPercent

			if (percentDelta <= 30) {
				setViewPostTransform("translateX(0%)")
			} else {
				setViewPostTransform("translateX(100%)")
				togglePostWithId(currentOpenPostId.id, currentOpenPostId)
			}
		}
	}

	function handleTouchStart(e:any) {
		const {clientX} = e.touches[0]
		handleViewPostDragStart(clientX)
	}

	function handleTouchMove(e:any) {
		const {clientX} = e.changedTouches[0]
		handleViewPostDrag(clientX)
	}

	function handleTouchEnd(e:any) {
		const {clientX} = e.changedTouches[0]
		handleViewPostDragEnd(clientX)
	}
 
	return (
		<div className={"App" + ((isPostViewOpen && viewPost !== undefined) ? " viewing_post" : "")} onMouseMove={({clientX}) => handleViewPostDrag(clientX)} onTouchMove={handleTouchMove} onMouseUp={({clientX}) => handleViewPostDragEnd(clientX)} onTouchEnd={handleTouchEnd}>
			{!isMobile && <SortingBar floating={true} handleTagClick={handleTagClick} handleSelectChange={handleSelectChange}/>}
			<main className='main_area' tabIndex={-1}>
				<Search onChangeHandler={onSearchInputChange}/>
				{isMobile && <SortingBar floating={false} handleTagClick={handleTagClick} handleSelectChange={handleSelectChange}/>}
				<div ref={postsContainer} className="post_grid">
					{finalPosts}
				</div>
			</main>
			{viewPost !== undefined && (
				<div ref={viewPostRef} className='view_post' style={isMobile ? {transform: viewPostTransform, transition: viewPostTransition} : {}}>
					{isMobile && <div className="drag_region" onMouseDown={({clientX}) => handleViewPostDragStart(clientX)} onTouchStart={handleTouchStart}></div>}
					<div className="title" style={{backgroundImage: `var(--post-image-over-gradient), url(/maps/${viewPost?.map}.png)`}}>
						<div className="close_button" onClick={() => togglePostWithId(viewPost?._id.id, viewPost?._id)}>
							<FontAwesomeIcon icon={faXmark}/>
						</div>
						{viewPost?.title}
						<div className='map_name'>{viewPost?.map}</div>
					</div>
					<div className='tags_container'>
						{viewPost?.tags.map((tag: string, index: number) => {
							return <Tag key={index} id={tag}/>
						})}
					</div>
				</div>
			)}
		</div>
	)
}

export default App;