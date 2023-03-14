import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useQuery } from "../../convex/_generated/react"

function Tag({isSmall, id}: {isSmall?: boolean, id:any}) {
	
	const tagQuery = useQuery("tags/getTagByID", id)
	const tag = tagQuery?.at(0)

	const TagContents = () => {
		if (tag !== undefined) {
			return (<>
				<img src={`/tag_icons/${tag.id}.png`} className='icon' alt="tag icon"/>
				{tag.displayText}
			</>)
		}

		return (<>
			<FontAwesomeIcon className="spinner-icon" spin icon={faSpinner}/>
		</>)
	}
	
	return (
		<div className={"tag" + (isSmall ? ' small' : '')}>
			<TagContents/>
		</div>
	)
}

export default Tag