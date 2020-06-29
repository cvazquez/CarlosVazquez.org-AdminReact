import React from 'react'
import {Link} from 'react-router-dom'


export default class SeriesManager extends React.Component {
 	constructor(props) {
		super(props);

		this.state = {
			id			: props.match.params.id,
			loading		: true,
			error		: null,
			seriesPosts : null,
			name		: props.location.state && props.location.state.name
		};
	}

	componentDidMount() {
		fetch(`${process.env.REACT_APP_API_URL}/getSeriesPostsById/${this.state.id}`)
			.then(res => res.json())
			.then(result => {
				this.setState({
					seriesPosts : result.seriesPosts,
					loading		: false
				})
			},
			error => {

			})
	}

	render() {
		const {loading, error, seriesPosts} = this.state;

		if(error) {
			return <>Error Loading</>
		} else if(loading) {
			return <>Loading...</>
		} else {
			return <div>
						Series Manager : {this.state.name}

						<ul>
							{seriesPosts.map(post => (
								<li key={post.entryId}>{post.sequence} -
								<Link to	= {`/posts/edit/${post.entryId}`}>
									{post.title}
								</Link>  - {post.createdAt}</li>
							))}
						</ul>
					</div>
		}
	}
}