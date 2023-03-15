import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import { TagObject } from "./tagObject"

export function Tag({isSmall, tag}: {isSmall?: boolean, tag:TagObject | undefined}) {

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

export function SelectableTag({tag, onClick, isSmall, isSelected}: {tag:TagObject, onClick:Function, isSmall?:boolean, isSelected?:boolean}) {
	const [selected, setSelected] = useState(false)
	
	let classList = ['tag', 'selectable']

	isSmall && classList.push('small')

	let handleClick = () => {
		if (isSelected === undefined) {
			setSelected(!selected)
		}
		onClick()
	}

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
		<div tabIndex={0} onClick={handleClick} onKeyDown={(e) => {e.key === "Enter" && handleClick()}} className={classList.join(' ') + (selected || isSelected ? ' selected' : '')}>
			<TagContents/>
		</div>
	)
}