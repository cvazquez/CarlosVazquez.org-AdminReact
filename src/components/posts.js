
import React from 'react';
import { Link } from 'react-router-dom'

export default class Posts extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error		: null,
			isLoaded	: false,
			entries		: [],
			activeEntries	: [],
			overlay		: "",
			deleteTitle	: "",
			deleteId	: null,
			deletedIds	: []
		};

		this.handleDeleteClick = this.handleDeleteClick.bind(this);
		this.handleDeleteOKClick = this.handleDeleteOKClick.bind(this);
		this.handleDeleteCancel = this.handleDeleteCancel.bind(this)
	}

	getPosts() {
		fetch(`${process.env.REACT_APP_API_URL}/getPosts`)
			.then(res => res.json())
			.then(
				result => {
					this.setState({
						isLoaded		: true,
						entries			: result.posts,
						activeEntries	: result.posts.filter(entry => entry.deletedAt === null)
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

	componentDidMount() {
		this.getPosts();
	}

	displayLightBox() {
		const 	{overlay, deleteTitle} = this.state;

		return <div className={overlay === "" ? "hidden" : "lightbox"}>
					<span	className	= {overlay === "" ? "hidden" : "close-x"}
								onClick	= {this.handleDeleteCancel}>x</span>
					<div className="deactivation-confirmation">
						Confirm Deactivation of "{deleteTitle}"?

						<div className="deactivation-buttons">
							<button onClick={this.handleDeleteOKClick}>OK</button>
							<button onClick={this.handleDeleteCancel}>Cancel</button>
						</div>
					</div>
				</div>
	}

	handleDeleteClick(e) {
		const	post	= e.currentTarget.dataset,
				id		= post.id,
				title	= post.title;

		document.body.classList.add('overlay');

		this.setState({
			overlay 	: "overlay",
			deleteTitle	: title,
			deleteId	: id
		});
	}

	handleDeleteOKClick() {
		fetch(`${process.env.REACT_APP_API_URL}/deactivatePostById/${this.state.deleteId}`)
			.then(res => res.json())
			.then(result => {
				if(result.deactivated && result.deactivated.affectedRows && result.deactivated.affectedRows > 0) {
					let deletedIds = this.state.deletedIds;

					deletedIds.push(parseInt(this.state.deleteId));

					this.setState({
						activeEntries	: this.state.activeEntries.filter(entry => deletedIds.indexOf(entry.id) === -1),
						deletedIds
					});

					this.handleDeleteCancel();
				}
			},
			error => {
				console.log(error)
			})
	}

	handleDeleteCancel() {
		this.setState({
			overlay 	: "",
			deleteTitle	: "",
			deleteId	: null
		})

		document.body.classList.remove('overlay');
	}

	render = () => {
		const 	{error, isLoaded, activeEntries} = this.state;

		if (error) {
			return <div>Error: {error.message}</div>;
		  } else if (!isLoaded) {
			return <div>Loading...</div>;
		  } else {
			return (
				<>
					{this.displayLightBox()}

					<div className="grid-container posts">
						<div className="grid-header-wrapper">
							<div>Id</div>
							<div>Title</div>
							<div>Actions</div>
							<div>Created</div>
							<div>Published</div>
							<div>Deleted</div>
						</div>
						{activeEntries.map((entry, index) => (
							<React.Fragment key={entry.id}>
								<div className="grid-row-wrapper">
									<div>{entry.id}</div>
									<div>{entry.title}</div>
									<div>
										<span	onClick		= {this.handleDeleteClick}
												data-id		= {entry.id}
												data-title	= {entry.title}
												className	= "delete">Deactivate </span>
										<Link	to			= {`/posts/edit/${entry.id}`}
												key			= {`Entry${entry.id}`}
												className	= "edit">Edit</Link>
									</div>
									<div>{entry.createdAt}</div>
									<div>{entry.publishAt}</div>
									<div>{entry.deletedAt}</div>
								</div>
							</React.Fragment>
						))}
					</div>
				</>
			)
		}
	}
}
