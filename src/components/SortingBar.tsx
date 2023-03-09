import { useQuery } from "../convex/_generated/react";
import { SelectableTag } from "./Tags";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFilter } from '@fortawesome/free-solid-svg-icons';

export default function SortingBar({floating, handleTagClick, handleSelectChange}: {floating:boolean, handleTagClick:Function, handleSelectChange:Function}) {
	
	const tagsQuery = useQuery("tags/getTags")

	const sideTags = tagsQuery?.filter(tag => {
		return tag.category === "sides"
	})

	const abilityTags = tagsQuery?.filter(tag => {
		return tag.category === "abilities"
	})

	return (
		<div className={'sorting_bar' + (floating ? " floating" : "")}>
			{/* <span className="sort_title"><FontAwesomeIcon icon={faFilter}/>Filters</span> */}
			{/* <div className='seperator'></div> */}
			<p>Map</p>
			<div className='map_select'>
				<select onChange={e => handleSelectChange(e)}>
					<option>All</option>
					<option>Ascent</option>
					<option>Fracture</option>
					<option>Haven</option>
					<option>Icebox</option>
					<option>Lotus</option>
					<option>Pearl</option>
					<option>Split</option>
					<option>Bind</option>
					<option>Breeze</option>
				</select>
			</div>
			<div className='seperator'></div>
			<p>Side</p>
			<div className='tags_container'>
				{sideTags?.map((tag, index) => {
					return <SelectableTag key={index} onClick={() => handleTagClick(tag.id)} id={tag.id}/>
				})}
			</div>
			<div className='seperator'></div>
			<p>Ability</p>
			<div className='tags_container'>
				{abilityTags?.map((tag, index) => {
					return <SelectableTag key={index} onClick={() => handleTagClick(tag.id)} id={tag.id}/>
				})}
			</div>
		</div>
	)
}