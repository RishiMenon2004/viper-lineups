import { useState } from "react"
import { useQuery } from "../../convex/_generated/react"

function SelectableTag({id, onClick, isSmall}: {id:string, onClick:Function, isSmall?:boolean}) {
	const [selected, setSelected] = useState(false)
	
	let classList = ['tag', 'selectable']

	isSmall && classList.push('small')

	let handleClick = () => {
		setSelected(!selected)
		onClick()
	}

	const tagQuery = useQuery("tags/getTagByID", id)
	let tag = tagQuery !== undefined ? tagQuery[0] : {id: 0, displayText: ""} 

	return (
		<div tabIndex={0} onClick={() => {handleClick()}} onKeyDown={(e) => {e.key === "Enter" && handleClick()}} className={classList.join(' ') + (selected ? ' selected' : '')}>
			<img src={`/tag_icons/${tag.id}.png`} className='icon' alt="tag icon"/>
			{tag.displayText}
		</div>
	)
}

export default SelectableTag