import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';

function Post({onClick, data, tags, id}: any) {

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
						{tags.map((tag:any) => {
							return tag
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