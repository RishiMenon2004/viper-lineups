import { useState } from "react"

import { TagObject } from "./"

/**
 * Clickable Tags
 * 
 * when isSmall is true, becomes a display tag on posts
 */
export function Tag({tag, isSmall, selectable, isSelected, onClick}: {tag:TagObject, isSmall?:boolean, isSelected?:boolean, selectable?:boolean, onClick?: () => void}) {
	const [selected, setSelected] = useState(false)
	
	const classList = ['tag']

	isSmall && classList.push('small')
	selectable && classList.push('selectable')

	const handleClick = () => {
		if(selectable && onClick)
			{if (isSelected === undefined) {
				setSelected(!selected)
			}
			onClick()
		}
	}

	tag
	
	return (
		<div tabIndex={0} onClick={handleClick} onKeyDown={(e) => {e.key === "Enter" && handleClick()}} className={classList.join(' ') + (selected || isSelected ? ' selected' : '')}>
			<img src={`/tag_icons/${tag.id}.png`} className='icon' alt="tag icon"/>
			{tag.displayText}
		</div>
	)
}