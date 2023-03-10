import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { Document } from "../convex/_generated/dataModel";
import { Tag } from './Tags';

function Post({onClick, data}: {onClick: Function, data: Document<"posts">}) {

	let images = [
		"/post_test_images/Ascent.png",
		"/post_test_images/Ascent.png",
		"/post_test_images/Ascent.png",
		"/post_test_images/Ascent.png"
	]

	return (
		<article id={data._id.id} className="card_post" onClick={() => onClick()} onKeyDown={(e) => {e.key === "Enter" && onClick()}} tabIndex={0}>
			<div className='card_title' style={{backgroundImage: `var(--post-image-over-gradient), url(/maps/${data.map}.png)`}}>
				<div className='map_name'>
					{data.map}
				</div>
				<h3>{data.title}</h3>
			</div>
			<div className='card_description'>
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint nemo quaerat doloribus, voluptates consequuntur, impedit ut eos laborum, perspiciatis excepturi enim vero qui odio quas cum consequatur unde aperiam temporibus.
			</div>
			<div className='card_content' style={{backgroundImage: `url(${images.at(0)})`}}>
				<div className='post_details'>
					<div className='tags_container'>
						{data.tags.map((tag: string, index: number) => {
							return index < 3 && <Tag key={index} isSmall={true} id={tag}/>
						})}
					</div>
					<div className='images_overflow'>
						<FontAwesomeIcon icon={faImage}/> +1
					</div>
				</div>
			</div>
		</article>
	)
}

export default Post