
import React from 'react';
import { Link } from 'react-router-dom'

export default class Posts extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error		: null,
			isLoaded	: false,
			entries		: []
		};
	}

	componentDidMount() {
		fetch(`${process.env.REACT_APP_API_URL}/getPosts`)
			.then(res => res.json())
			.then(
				result => {
					this.setState({
						isLoaded	: true,
						entries		: result.posts
					})
				},
				error => {
					this.setState({
						isLoaded	: false,
						error
					})
				}
			)
	}

	render = () => {
		const {error, isLoaded, entries} = this.state;

		if (error) {
			return <div>Error: {error.message}</div>;
		  } else if (!isLoaded) {
			return <div>Loading...</div>;
		  } else {
			return (
					<div className="grid-container posts">
						<div>Id</div>
						<div>Title</div>
						<div>Actions</div>
						<div>Created</div>
						<div>Published</div>
						<div>Deleted</div>
						{entries.map(entry => (
							<React.Fragment key={entry.id}>
								<div>{entry.id}</div>
								<div>{entry.title}</div>
								<div>Delete&nbsp;
									<Link	to	= {`/posts/edit/${entry.id}`}
											key	= {`Entry${entry.id}`}>Edit</Link>
								</div>
								<div>{entry.createdAt}</div>
								<div>{entry.publishAt}</div>
								<div>{entry.deletedAt}</div>
							</React.Fragment>
						))}
					</div>
			)
		}
	}
}
