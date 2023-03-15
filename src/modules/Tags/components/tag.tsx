import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import { TagObject } from "./TagObject"

function Tag({isSmall, tag}: {isSmall?: boolean, tag:TagObject | undefined}) {

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