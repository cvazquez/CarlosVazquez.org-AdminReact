import React from 'react'
import {Link} from 'react-router-dom'
import { checkAPIResponse } from '../helpers/api'
import { selectOptionsSequenceFactory } from '../helpers/form'

export default class SeriesManager extends React.Component {
 	constructor(props) {
		super(props);

		this._isMounted = false;

		this.state = {
			id			: props.match && props.match.params.id,
			loading		: true,
			error		: null,
			seriesPosts : [],
			name		: props.location && props.location.state && props.location.state.name,  // TODO - this will not exist when copy/pasting url
			postsById	: [],
			isAdmin		: true,
		};

		this.handleSequenceChange = this.handleSequenceChange.bind(this);
	}

	getSeriesPostsById(id) {
		return new Promise(resolve => {
			fetch(`${process.env.REACT_APP_API_URL}/getSeriesPostsById/${id}`)
				.then(res => checkAPIResponse(res))
				.then(results => {
					if(results.seriesPosts && Array.isArray(results.seriesPosts)) {

						let postsById = [];

						results.seriesPosts.forEach(post => {
							postsById[post.entryId] = {
								sequence	: post.sequence,
								title		: post.title,
								saveStatus	: null
							}
						});

						this._isMounted && this.setState({
							seriesPosts : results.seriesPosts,
							loading		: false,
							postsById,
							isAdmin		: results.isAdmin
						})

						resolve(true);
					} else {
						throw(new Error("API did not return any posts for this series. Try adding some."))
					}
				},
				error => {
					throw(new Error("getSeriesPostsById Error: ", error));
				})
			})
			.catch(error => {
				this._isMounted && this.setState({
					error
				});
			})
	}

	componentDidMount() {
		this._isMounted = true;

		// Get list of posts, and their sequence in this Series
		this.getSeriesPostsById(this.state.id);
	}

	componentWillUnmount() {
		this._isMounted = false;
	 }

	updatePostSeriesSequence(postId, seriesId, sequence, postsById) {
		fetch(`${process.env.REACT_APP_API_URL}/updatePostSeriesSequence`,
			{
				method	: 'POST',
				body	: JSON.stringify({
					postId,
					seriesId,
					sequence
				}),
				headers	: {	'Content-Type': 'application/json'}
			})
			.then(res => checkAPIResponse(res))
			.then(results => {

				if(results.saveSequence && results.saveSequence.affectedRows && results.saveSequence.affectedRows === 1) {

					// Display success save status of this post's sequence in series
					postsById[postId].saveStatus = "Saved Successfully!";

					this._isMounted && this.setState({
						postsById
					});

					setTimeout(() => {
						// Remove display status
						postsById[postId].saveStatus = null;

						this._isMounted && this.setState({
							postsById
						})
					}, 5000);
				} else {

					throw(new Error("Series Posts Update failed. No DB records updated. Refresh and try again."));
				}

			},
			error => {
				throw(new Error("Series Posts Update failed. API might be down. Refresh And Try Again. : ", error));
			})
			.catch(error => {
				// Display failed save status of this post's sequence in series
				postsById[postId].saveStatus = "Failed saving!!";

				this._isMounted && this.setState({
					postsById,
					error
				})
			});
	}

	// The select options drop down of the posts sequence in the series was changed. Initiate an API change
	handleSequenceChange(e) {
		const	sequence	= e.target.value,
				postId		= e.currentTarget.dataset.entryid,
				postsById	= this.state.postsById,
				seriesId	= this.state.id;

		// Update the sequence of the post
		postsById[postId].sequence = sequence;

		// API call to DB update this posts series sequence
		this.updatePostSeriesSequence(postId, seriesId, sequence, postsById)
	}

	render() {
		const	{loading, error, name, seriesPosts, postsById} = this.state,
				demoMessage = !this.state.isAdmin && <div className="alert alert-danger">Demo Mode</div>;

		if(error) {
			return <>Error Loading This Series Post Sequence. Refresh page and try again.</>
		} else if(loading) {
			return <>Loading...</>
		} else {
			/* 	For each post in a series,
				display a drop down sequence of numbers,
				from 1 to number of posts in the series,
				to control the order of each post in the series
			*/
			return <div className="series-manager">
						{demoMessage}
						<div className="series-manager-name">{name}</div>

						<ul className="series-sequences">
							{	// Loop through each post in sequence
								this.state.seriesPosts.map((post) => (
								<li key={post.entryId}>

									{/* Select the order this post should show in series list */}
									<select	name			= "sequence"
											value			= {postsById[post.entryId].sequence}
											data-entryid	= {post.entryId}
											onChange		= {this.handleSequenceChange}>
										{selectOptionsSequenceFactory(1, seriesPosts.length)}
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