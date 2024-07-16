import { ChangeEvent, Dispatch, SetStateAction } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleHalfStroke, faLocationCrosshairs, faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";

import { TagObject, AbilityTags, SideTags, Tag } from "./Tags"

export default function SortingBar({floating, handleTagClick, handleSelectChange}: {floating:boolean, handleTagClick:(tag: TagObject, category: "ability"|"side") => void, handleSelectChange: Dispatch<SetStateAction<string>>}) {
	
	const sideTags = SideTags
	const abilityTags = AbilityTags

	return (
		<div className={'sorting-bar' + (floating ? " floating" : "")}>
			<div className='section'>
				<div className="section-name">
					<FontAwesomeIcon icon={faLocationCrosshairs}/>
					Map
				</div>
				<div className="section-content">
					<select
					className="map-selector"
					onChange={(e:ChangeEvent<HTMLSelectElement>) => handleSelectChange(e.target.value)}
					>
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
			</div>
			
			<div className='section'>
				<div className="section-name">
					<FontAwesomeIcon icon={faCircleHalfStroke}/>
					Side
				</div>
				<div className="section-content">
					{sideTags?.map((tag:TagObject, index:number) => {
						return <Tag key={index} onClick={() => handleTagClick(tag, "side")} tag={tag} selectable/>
					})}
				</div>
			</div>

			<div className='section'>
				<div className="section-name">
					<FontAwesomeIcon icon={faScrewdriverWrench}/>
					Ability
				</div>
				<div className="section-content" tabIndex={-1}>
					{abilityTags?.map((tag:TagObject, index:number) => {
						return <Tag key={index} onClick={() => handleTagClick(tag, "ability")} tag={tag} selectable/>
					})}
				</div>
			</div>
		</div>
	)
}