import { useQuery } from "../../convex/_generated/react"

function Tag({isSmall, id}: {isSmall?: boolean, id:any}) {
	
	const tagQuery = useQuery("tags/getTagByID", id)
	const tag = tagQuery !== undefined ? tagQuery.at(0) : {id: 0, displayText: ""} 
	
	return (
		<div className={"tag" + (isSmall ? ' small' : '')}>
			<img src={`/tag_icons/${tag?.id}.png`} className='icon' alt="tag icon"/>
			{tag?.displayText}
		</div>
	)
}

export default Tag