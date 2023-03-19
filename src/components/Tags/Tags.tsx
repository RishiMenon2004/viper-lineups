import { useState } from "react"

import { TagObject } from "./"

export function Tag({tag, isSmall, selectable, isSelected, onClick}: {tag:TagObject, isSmall?:boolean, isSelected?:boolean, selectable?:boolean, onClick?:Function}) {
	const [selected, setSelected] = useState(false)
	
	let classList = ['tag']

	isSmall && classList.push('small')
	selectable && classList.push('selectable')

	let handleClick = () => {
		if(selectable && onClick)
			{if (isSelected === undefined) {
				setSelected(!selected)
			}
			onClick()
		}
	}
	
	return (
		<div tabIndex={0} onClick={handleClick} onKeyDown={(e) => {e.key === "Enter" && handleClick()}} className={classList.join(' ') + (selected || isSelected ? ' selected' : '')}>
			<img src={`/tag_icons/${tag.id}.png`} className='icon' alt="tag icon"/>
			{tag.displayText}
		</div>
	)
}