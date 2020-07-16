/*
	 Display a list of Blog posts to Edit/Deactivate

	 TODOS:
		 * Add ability to show deactivated posts
		 * Add ability to sort title, id and date columns
 */

import React from 'react';
import { Link } from 'react-router-dom'
import { checkAPIResponse } from '../helpers/api'

export default class Posts extends React.Component {
	constructor(props) {
		super(props);

		this._isMounted = false; // Fixes an unmounted component error in Jest

		this.state = {
			// Async check if posts have loaded
			error		: null,
			isLoaded	: false,

			// Posts loaded from API call
			activeEntries	: [],

			// Deactivation confirmation overlay/modal and its properties
			activateModal	: false,
			deleteTitle		: "",
			deleteId		: null, // Post currently deleting
			deletedIds		: [], // History of posts deleted, to use when refreshing active entries
			deleteResponseInvalid : null
		};

		// Delete Modal Handlers
		this.handleDeleteClick		= this.handleDeleteClick.bind(this);
		this.handleDeleteOKClick	= this.handleDeleteOKClick.bind(this);
		this.handleDeleteCancel		= this.handleDeleteCancel.bind(this)
	}

	// API request blog posts, to display and edit
	getPosts() {
		fetch(`${process.env.REACT_APP_API_URL}/getPosts`)
			.then(res => checkAPIResponse(res))
			.then(
				result => {
					if(result.posts && Array.isArray(result.posts)) {

						// Update render state to display active entries only and replace loading text
						this._isMounted && this.setState({
							isLoaded		: true,
							activeEntries	: result.posts.filter(entry => entry.deletedAt === null)
						})

					} else {
						 throw new Error("Result posts response is invalid. Check API response")
					}

				},
				error => {
					this._isMounted && this.setState({
						isLoaded	: false,
						error
					})

					console.log("No Response from API to retrieve posts", error)
				}
			)
			.catch(error => {
				this._isMounted && this.setState({
					isLoaded	: false,
					error
				})

				console.error("API Request Fetch Error:", error)
			})
	}

	componentDidMount() {
		// When this component loads, retrieve list of posts to edit
		this._isMounted = true;
		this._isMounted && this.getPosts();
	}

	componentWillUnmount() {
		this._isMounted = false;
	 }


	/*
		This Modal will display when a post's Deactivate link is clicked, to confirm the deactivation of a post
		Default is hidden
	*/
	getDeleteConfirmationModal = () =>
		<div className={this.state.activateModal ? "lightbox" : "hidden"}>
			<span	className	= {this.state.activateModal ? "close-x" : "hidden"}
					onClick		= {this.handleDeleteCancel}>x</span>
			<div className="deactivation-confirmation">
				Confirm Deactivation of "{this.state.deleteTitle}"?

				<div className="deactivation-buttons">
					<button onClick	= {this.handleDeleteOKClick}>OK</button>
					<button onClick	= {this.handleDeleteCancel}>Cancel</button>
				</div>

				{this.state.deleteResponseInvalid}
			</div>
		</div>


	// When a post's Deactivate link is clicked
	handleDeleteClick(e) {
		const	post	= e.currentTarget.dataset; // Title and id of the post clicked

		// Add an opaque overlay over entire body
		document.body.classList.add('overlay');

		this.setState({
			activateModal 	: true, // Display modal

			deleteTitle	: post.title, // Pass the post's title to the modal to display
			deleteId	: post.id // Pass post id to API request to deactive this post
		});
	}


	// The user confirmation deactivation of the post. Send a request to API to deactivate in DB
	handleDeleteOKClick() {
		fetch(`${process.env.REACT_APP_API_URL}/deactivatePostById/${this.state.deleteId}`)
			.then(res => checkAPIResponse(res))
			.then(result => {

				if(result.deactivated && result.deactivated.affectedRows && result.deactivated.affectedRows > 0) {
					// Process successfull deactivate response

					// get current list of deleted ids and append to
					let deletedIds = this.state.deletedIds;

					deletedIds.push(parseInt(this.state.deleteId));

					this.setState({
						// Remove deleted posts from entries displayed to user
						activeEntries	: this.state.activeEntries.filter(entry => deletedIds.indexOf(entry.id) === -1),

						// Update list of deleted post ids
						deletedIds
					});

					// Remove delete confirmation modal
					this.handleDeleteCancel();

				} else {
					// Post did NOT deactivate successfully. Display message to user.
					this.setState({
						deleteResponseInvalid	: "Error deactivating post. Try again."
					})

					throw new Error("Deactivate response is invalid. Check API response")
				}
			},
			error => {
				// Post did NOT deactivate successfully. Display message to user.
				this.setState({
					deleteResponseInvalid	: "Error deactivating post. Try again."
				})

				console.log("No Response from API to deactivate post", error)

			}).catch(error => {
				// Post did NOT deactivate successfully. Display message to user.
				this.setState({
					deleteResponseInvalid	: "Error deactivating post. Try again."
				})

				console.error("API Request Fetch Error:", error)
			})
	}

	// removes the delete confirmation overlay/modal and its properties
	handleDeleteCancel() {
		this.setState({
			activateModal 	: "",
			deleteTitle		: "",
			deleteId		: null,
			deleteResponseInvalid : null
		})

		document.body.classList.remove('overlay');
	}

	// display list of posts to edit/deactivate
	render = () => {
		const 	{error} = this.state;

		if (error) {

			// Display error message from the API call
			return <div>Error: {error.message}</div>;

		  } else if (!this.state.isLoaded) {

			// While the API call is waiting for a response
			return <div>Loading...</div>;

		  } else {
			// API call response is successful. Display list of posts.

			return (
				<>
					{	// When Deactivate is clicked, display the confirmation modal
						this.getDeleteConfirmationModal()
					}

					<div className="grid-container posts">
						<div className="grid-header-wrapper">
							<div>Id</div>
							<div>Title</div>
							<div>Actions</div>
							<div>Created</div>
							<div>Published</div>
							<div>Deleted</div>
						</div>
						{	// Loop through list of posts and display, with id, title, dates and links to Edit/Deactivate,

							this.state.activeEntries.map((entry) => (
							<React.Fragment key={entry.id}>
								<div className="grid-row-wrapper">
									<div>{entry.id}</div>
									<div>{entry.title}</div>
									<div>
										<Link	to			= {`/posts/edit/${entry.id}`}
												key			= {`Entry${entry.id}`}
												className	= "edit"
												data-testid	= {entry.id}>
											Edit&nbsp;
										</Link>
										<span	onClick		= {this.handleDeleteClick}
												data-id		= {entry.id}
												data-title	= {entry.title}
												className	= "delete">
											Deactivate
										</span>
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
