import React from 'react'
import {Link} from 'react-router-dom'
import { checkAPIResponse } from '../helpers/api'

export default class SeriesManager extends React.Component {
 	constructor(props) {
		super(props);

		this.state = {
			id			: props.match.params.id,
			loading		: true,
			error		: null,
			seriesPosts : null,
			name		: props.location.state && props.location.state.name,  // TODO - this will not exist when copy/pasting url
			postsById	: []
		};

		this.handleSequenceChange = this.handleSequenceChange.bind(this);
	}

	componentDidMount() {
		fetch(`${process.env.REACT_APP_API_URL}/getSeriesPostsById/${this.state.id}`)
			.then(res => checkAPIResponse(res))
			.then(result => {
				let postsById = [];

				result.seriesPosts.forEach(post => {
					postsById[post.entryId] = {
						sequence	: post.sequence,
						title		: post.title,
						saveStatus	: null
					}
				});

				this.setState({
					seriesPosts : result.seriesPosts,
					loading		: false,
					postsById
				})
			},
			error => {

			})
	}

	handleSequenceChange(e) {
		const	sequence	= e.target.value,
				entryId		= e.currentTarget.dataset.entryid,
				postsById	= this.state.postsById;

		postsById[entryId].sequence = sequence;

		fetch(`${process.env.REACT_APP_API_URL}/updatePostSeriesSequence`,
			{
				method	: 'POST',
				body	: JSON.stringify({
					postId		: entryId,
					seriesId	: this.state.id,
					sequence
				}),
				headers	: {	'Content-Type': 'application/json'}
			})
			.then(res => checkAPIResponse(res))
			.then(results => {
				postsById[entryId].saveStatus = "Saved Successfully!";

				this.setState({
					postsById
				});

				setTimeout(() => {
					postsById[entryId].saveStatus = null;

					this.setState({
						postsById
					})
				}, 5000);
			},
			error => {
				postsById[entryId].saveStatus = "Error saving!!";

				this.setState({
					postsById,
					error
				})
			});
	}

	render() {
		const {loading, error, name, seriesPosts, postsById} = this.state;

		if(error) {
			return <>Error Loading</>
		} else if(loading) {
			return <>Loading...</>
		} else {
			const sequenceOptions = [];

			for(let x = 1; x < seriesPosts.length+1; x++) {
				sequenceOptions.push(<option value={x} key={x}>{x}</option>)
			}

			return <div className="series-manager">
						<div className="series-manager-name">{name}</div>

						<ul className="series-sequences">
							{this.state.seriesPosts.map((post) => (
								<li key={post.entryId}>
									<select	name			= "sequence"
											value			= {postsById[post.entryId].sequence}
											data-entryid	= {post.entryId}
											onChange		= {this.handleSequenceChange}>
										{sequenceOptions}
									</select>

									<Link to	= {`/posts/edit/${post.entryId}`}>
										{post.title}
									</Link>
									<span>{postsById[post.entryId].saveStatus}</span>
								</li>
							))}
						</ul>
					</div>
		}
	}
}