import './App.scss';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { useQuery } from './convex/_generated/react';

import { Tag } from './components/Tags';
import Search from './components/Search';
import Post from './components/Post';
import SortingBar from './components/SortingBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

function App() {

    const [isMobile, setIsMobile] = useState(false)
    const [windowWidth, setWindowWidth] = useState(0)

	const getWindowWidth = () => {
        const {clientWidth: width} = document.body
        return width
    }

    const handleResize = () => {
        setWindowWidth(getWindowWidth())
        setIsMobile(windowWidth < 600)
    }

	useEffect(() => {
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    })

	const [isPostViewOpen, setIsPostViewOpen] = useState(false)
	const [currentOpenPostId, setCurrentOpenPostId] = useState<any>(null)
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [selectedMap, setSelectedMap] = useState("All")

	const postsContainer = useRef() as MutableRefObject<HTMLDivElement>

	const handleSelectChange = (e:any) => {
		setSelectedMap(e.target.value)
	}

	const postsQuery = useQuery("posts/getFilteredPosts", selectedTags, selectedMap)
	let posts

	if (postsQuery !== undefined) {
		posts = postsQuery.map((post: any, index: number) => {
			return <Post key={index} id={post._id.id} title={post.title}
				tags={post.tags.map((tag: string, index: number) => {
					return index < 3 && <Tag key={index} isSmall={true} id={tag}/>
				})}
				images={[
					"/post_test_images/Ascent.png",
					"/post_test_images/Ascent.png",
					"/post_test_images/Ascent.png",
					"/post_test_images/Ascent.png"
				]}
				onClick={() => togglePostWithId(post._id.id, post._id)}
			/>
		})
	} else {
		posts = <h1>uh, loading</h1>
	}

	const togglePostWithId = (dom_id:any, doc_id:any) => {
		
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
			} else {
				currentPost?.classList.add('selected')
				setIsPostViewOpen(true)
				setCurrentOpenPostId(doc_id)
			}
		}
	}

	if (currentOpenPostId === null) {
		setCurrentOpenPostId(postsQuery?.at(0)._id)
	}
	
	let viewPost = postsQuery?.find((post:any) => {
		return post._id === currentOpenPostId
	})

	function handleTagClick(tag:string) {
		let array = selectedTags

		if (array.includes(tag)) {
			let tagIndex = array.indexOf(tag)

			if (tagIndex > -1) { // only splice array when item is found
				array.splice(tagIndex, 1); // 2nd parameter means remove one item only
			}
	
		} else {
			array = [...array, tag]
		}
		
		setSelectedTags([...array])
	}

	return (
		<div className={"App" + ((isPostViewOpen && viewPost !== undefined) ? " viewing_post" : "")}>
			{!isMobile && <SortingBar floating={true} handleTagClick={handleTagClick} handleSelectChange={handleSelectChange}/>}
			<main className='main_area' tabIndex={-1}>
				<Search />
				{isMobile && <SortingBar floating={false} handleTagClick={handleTagClick} handleSelectChange={handleSelectChange}/>}
				<div ref={postsContainer} className="post_grid">
					{posts}
				</div>
			</main>
			{viewPost !== undefined && (
				<div className='view_post'>
					<div className="title" style={{backgroundImage: `linear-gradient(to top, hsl(0, 0%, 0%, 75%), transparent 100%) ,url(/maps/${viewPost?.map}.png)`}}>
						<div className="close_button" onClick={() => togglePostWithId(viewPost._id.id, viewPost._id)}>
							<FontAwesomeIcon icon={faXmark}/>
						</div>
						{viewPost?.title}
						<div className='map_indicator'>{viewPost?.map}</div>
					</div>
					<div className='tags_container'>
						{viewPost?.tags.map((tag: string, index: number) => {
							return <Tag key={index} id={tag}/>
						})}
					</div>
				</div>
			)}
		</div>
	);
}

export default App;