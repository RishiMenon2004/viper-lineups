import { useEffect, useState } from "react"

type TagProps = {
	tag:TagObject,
	isSmall?:boolean,
	isSelected?:boolean,
	selectable?:boolean,
	onClick?: () => void
}

import { TagObject } from "./"

/**
 * Clickable Tags
 * 
 * @param {TagObject} props.tag  -  gets the Display text and ID used when stored in the db
 * @param {boolean} props.isSmall - when true, renders a smaller sized tag
 * @param {boolean} prop.selectable - when true, renders a non-interactive display tag
 * @param {boolean} prop.isSelected - overrides selected state
 * @param {boolean} prop.onClick - event handler for click interaction
 */
export function Tag(props: TagProps) {
	const {
		tag,
		isSmall,
		selectable,
		isSelected,
		onClick
	} = props

	const [selected, setSelected] = useState(false)
	const [classList, setClassList] = useState<string[]>([])

	useEffect(() => {
		setClassList(() => {
			const newClassList = [];
			isSmall && newClassList.push('small');
			selectable && newClassList.push('selectable');
			(selected || isSelected) && newClassList.push('selected');

			return newClassList
		})
	}, [isSmall, selectable, selected, isSelected])


	const handleClick = () => {
		if(selectable && onClick) {
			isSelected ?? setSelected(!selected)
			onClick()
		}
	}

	tag
	
	return (
		<div tabIndex={0}
		onClick={handleClick}
		onKeyDown={(e) => {e.key === "Enter" && handleClick()}}
		className={`tag ${classList.join(' ')}`}>
			<img src={`/tag_icons/${tag.id}.png`} className='icon' alt="tag icon"/>
			{tag.displayText}
		</div>
	)
}