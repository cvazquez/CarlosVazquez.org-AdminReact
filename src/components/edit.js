/*
	Form to edit and add blog posts
*/

import React from "react";
import Form from "./form";
import { checkAPIResponse, setSavedPostStatuses } from '../helpers/api'
import { getlistItemDisplay } from '../helpers/form'

export default class Edit extends React.Component {
	constructor(props) {
		super(props);

		this._isMounted = false;

		this.intervalCountDown = 5;
		this.state = this.initState();

		this.handleEditorChange			= this.handleEditorChange.bind(this);
		this.handleTextUpdate 			= this.handleTextUpdate.bind(this);
		this.handleSaveDraft			= this.handleSaveDraft.bind(this);
		this.handleSubmit 				= this.handleSubmit.bind(this);
		this.handleCategoryInput 		= this.handleCategoryInput.bind(this);
		this.handleCategoryClick 		= this.handleCategoryClick.bind(this);
		this.handleCategoryClickRemove 	= this.handleCategoryClickRemove.bind(this);
		this.handleSearchResultsClose 	= this.handleSearchResultsClose.bind(this);
		this.handleSeriesClickRemove	= this.handleSeriesClickRemove.bind(this);
		this.handleSeriesSelection		= this.handleSeriesSelection.bind(this);
	}

	initState() {
		const date = new Date();

		return {
			// A new post will have a null value
			id								: this.props.match ? this.props.match.params.id : null,

			// Loading Async Init
			error							: null,
			isLoaded						: false,
			isAdmin							: true,

			// Category
			postCategories					: [],
			categories						: null,
			categoriesByName				: {},
			categoriesById					: [],
			categoryNamesSelectedDisplay	: [],
			categoriesSelectedLowerCased	: [],

			// Series
			series							: [],
			seriesByName					: {},
			seriesById						: [],
			seriesSelectedDisplay			: [],

			// Flickr Photos
			flickrSets						: [],

			form		: {
				entryId					: null,
				title					: "",
				teaser					: "",
				metaDescription			: "",
				metaKeyWords			: "",

				// Publish At Date
				publishAt				: "",
				publishYear				: date.getFullYear(),
				publishMonth			: date.getMonth()+1,
				publishDay				: date.getDate(),
				publishHour				: date.getHours(),
				publishMinute			: date.getMinutes(),

				// Categories
				categoryName			: "",
				categoryNamesSelected 	: [],

				// Series
				seriesNameSelected		: [],
				postSeriesSelected		: [],

				// Flickr photos
				flickrSets				: [],
				flickrSetId				: ""
			},

			// API Post (Save) Statuses
			savedPostFlickrSet				: false,
			savedPostFlickrSetStatus		: null,

			deletedPostCategories			: false,
			deletedPostCategoriesStatus		: null,
			savedPostCategories				: false,
			savedPostCategoriesStatus		: null,

			savedPostSeries					: false,
			savedPostSeriesStatus			: null,
			deletedPostSeries				: false,
			deletedPostSeriesStatus			: null,

			updatePosted 					: false,
			saveStatus						: null,

			saveDraftStatus					: null,

			redirectCountDown				: this.intervalCountDown
		};
	}

	// Common indexed states
	setIndexedStates(series, categories) {
		const	seriesByName		= {},
				seriesById			= [],
				categoriesByName	= {},
				categoriesById		= [];

		// Access all series by name and id (reverse lookup)
		series.forEach(item => {
			seriesByName[item.name.toLowerCase()] = item.id;
			seriesById[item.id] = item.name; // don't change case. Displays in series search overlay results
		});

		// Access all categories by name and id (reverse lookup)
		categories.forEach(item => {
			categoriesByName[item.name.toLowerCase()] = item.id;
			categoriesById[item.id] = item.name; // don't change case. Displays in category search overlay results
		});

		this._isMounted && this.setState({
			seriesByName,
			seriesById,
			categoriesByName,
			categoriesById
		})
	}

	// Retrieve existing post to edit
	getPost() {
		fetch(`${process.env.REACT_APP_API_URL}/getPost/` + this.state.id)
			.then(res => checkAPIResponse(res))
			.then(
				result => {
					if(result && result.post && Array.isArray(result.post) && result.post.length === 1) {
						const 	post 							= result.post[0],
								publishDate 					= new Date(post.publishAt),

								// Manage Category Selection
								categoryNamesSelected 			= [],
								categoryNamesSelectedLowerCased = [],
								categoryNamesSelectedDisplay	= [],

								// Manage Series Selection
								seriesNameSelected				= [],
								seriesSelectedDisplay			= [];

						this.setIndexedStates(result.series, result.categories);

						// ******* Populate Category Objects *******
							// Loop through categories already attached to a post
							result.postCategories.forEach(postCategory => {
								// Create arrays of normal and lowercased category names, for auto-complete use
								categoryNamesSelected.push(postCategory.name);
								categoryNamesSelectedLowerCased.push(postCategory.name.toLowerCase());

								// Create an array of html list elements to display categories
								categoryNamesSelectedDisplay.push(getlistItemDisplay(postCategory.name, postCategory.name, this.handleCategoryClickRemove));
							});


						// ******** Populate Series Objects *********
							// Loop through series already attached to a post
							result.postSeries.forEach(series => {
								// Add series to an array, to add/remove series, and post to save
								seriesNameSelected.push(series.name);

								// Create an array of html list elements to display series
								seriesSelectedDisplay.push(getlistItemDisplay(series.id, series.name, this.handleSeriesClickRemove));
							});

						this._isMounted && this.setState({
							isLoaded			: true,
							isAdmin				: result.isAdmin,

							form		: {
								title					: post.title,
								teaser					: post.teaser,
								content					: post.content,
								metaDescription			: post.metaDescription,
								metaKeyWords			: post.metaKeyWords,
								publishAt				: post.publishAt,
								publishYear				: publishDate.getFullYear(),
								publishMonth			: publishDate.getMonth()+1,
								publishDay				: publishDate.getDate(),
								publishHour				: publishDate.getHours(),
								publishMinute			: publishDate.getMinutes(),
								entryId					: post.id,
								categoryNamesSelected,
								seriesNameSelected,
								postSeriesSelected		: result.postSeries,
								flickrSets				: result.flickrSets,
								flickrSetId				: typeof(post.flickrSetId) === "undefined" || post.flickrSetId === null ? "" : post.flickrSetId
							},

							categoryNamesSelectedDisplay	: categoryNamesSelectedDisplay,
							categoriesSelectedLowerCased	: categoryNamesSelectedLowerCased,
							postCategories					: result.postCategories,
							categories						: result.categories,
							categoryOverlay					: null,

							series							: result.series,
							seriesSelectedDisplay
						});
					} else {
						throw new Error("Result post response is invalid. Check API response")
					}
				},
				error => {
					this._isMounted && this.setState({
						isLoaded	: false,
						error
					})

					console.log("No Response from API to retrieve post", error)
				}
			).catch(error => {
				this._isMounted && this.setState({
					isLoaded	: false,
					error
				})

				console.error("API Request Fetch Error:", error)
			})
	}

	getNewPost() {
		fetch(`${process.env.REACT_APP_API_URL}/getNewPost`)
			.then(res => checkAPIResponse(res))
			.then(
				result => {
					if(result.series && result.categories && result.flickrSets) {
						const	form				= this.state.form;

						this.setIndexedStates(result.series, result.categories);

						form.flickrSets = result.flickrSets;

						this._isMounted && this.setState({
							isLoaded			: true,
							series				: result.series,
							categories			: result.categories,
							categoryOverlay		: null,
							form,
							isAdmin				: result.isAdmin
						});
					} else {
						throw new Error("Result new post response is invalid. Check API response")
					}
				},
				error => {
					this._isMounted && this.setState({
						isLoaded	: false,
						error
					})

					console.log("No Response from API to retrieve new post", error)
				}
			).catch(error => {
				this._isMounted && this.setState({
					isLoaded	: false,
					error
				})

				console.error("API Request Fetch Error for new post:", error)
			})
	}

	componentDidMount() {
		this._isMounted = true;

		if(this.state.id) {
			this._isMounted && this.getPost();
		} else {
			// New Page refresh
			this._isMounted && this.getNewPost();
			this._isMounted && this.setPublishAtDate();
		}
	}

	componentDidUpdate(prevProps) {
		if(this.props.match && prevProps.match && this.props.match.params.id !== prevProps.match.params.id) {
			this.setState({
				id : this.props.match.params.id
			});
		}  else if(Object.keys(this.props).length === 0 && Object.keys(prevProps).length !== 0) {
			// New state change (from edit)
			this.setState(this.initState());
			this.getNewPost();
			this.setPublishAtDate();
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
	 }

	 // TinyMCE content field update
	handleEditorChange(content) {
		const form = this.state.form;

		form.content = content;

		this.setState({
			form
		});
	}

	// Format the publish date form fields into a valid date format
	setPublishAtDate() {
		const form = this.state.form;

		form.publishAt =	form.publishYear +
							"-" +
							(form.publishMonth < 10 ? "0" : "") +
							+
							form.publishMonth +
							"-" +
							(form.publishDay < 10 ? "0" : "") +
							form.publishDay +
							" " +
							(form.publishHour < 10 ? "0" : "") +
							form.publishHour +
							":" +
							(form.publishMinute < 10 ? "0" : "") +
							form.publishMinute +
							":00";

		this.setState({
			form
		});
	}

	// Set form fields state
	handleTextUpdate(event) {
		const	form		= this.state.form,
				fieldName	= event.target.name;

		form[fieldName] = event.target.value;

		this.setState({
			form
		});

		// Separate function for publish at field, to format a proper date
		if(["publishYear", "publishMonth", "publishDay", "publishHour", "publishMinute"].indexOf(fieldName) > -1) {
			this.setPublishAtDate();
		}
	}

	// Trigger when the user clicks to remove existing Categories applied to the post
	handleCategoryClickRemove(event) {
		const	form = this.state.form,
				categoryNamesSelectedDisplay = [];

		let 	categoriesSelectedLowerCased = this.state.categoriesSelectedLowerCased;


		// Remove the clicked on category from the existing list of categories selected
		form.categoryNamesSelected = form.categoryNamesSelected.filter(categoryName => categoryName !== event.currentTarget.dataset.name);

		// Then lowercase them for use in category search
		categoriesSelectedLowerCased = form.categoryNamesSelected.map(category => category.toLowerCase());

		// Update the displayed list of categories selected
		for(let index in form.categoryNamesSelected) {
			categoryNamesSelectedDisplay.push(getlistItemDisplay(index, form.categoryNamesSelected[index], this.handleCategoryClickRemove));
		}

		// Replace displayed and searchable list of categories, and category form field, san removed category
		this.setState({
			categoryNamesSelectedDisplay,
			categoriesSelectedLowerCased,
			form
		})
	}

	// User clicks to remove a series
	handleSeriesClickRemove(event) {
		const	form = this.state.form,
				seriesSelectedDisplay = []; // temp variable to update series selected displayed to user

		// Update series submitted in form, without the removed series
		form.seriesNameSelected = form.seriesNameSelected.filter(series => series !== event.currentTarget.dataset.name);

		// if series selected still exists, after removing one, then update the display list, san removed series.
		// Otherwise, the series selected/displayed is now empty.
		if(form.seriesNameSelected.length) {
			for(let index in form.seriesNameSelected) {
				// recreate the list of series selected
				seriesSelectedDisplay.push(getlistItemDisplay(index, form.seriesNameSelected[index], this.handleSeriesClickRemove));
			}
		}

		// Update state of series displayed to user and submitted in form
		this.setState({
			seriesSelectedDisplay,
			form
		})
	}

	// From the category search modal results, add a category clicked, to the selected category list
	handleCategoryClick(event) {
		const	state							= this.state,
				form							= state.form,
				categoryName					= event.currentTarget.dataset.value,
				categoryNamesSelectedDisplay	= state.categoryNamesSelectedDisplay,
				categoriesSelectedLowerCased 	= state.categoriesSelectedLowerCased;

		// If the category name is not already selected, then add to list of categories selected
		// Note: categories should't appear in search overlay, to select, if already selected
		if(form.categoryNamesSelected.indexOf(categoryName) === -1) {
			// Update the categories selected form key and lowercased comparison key
			form.categoryNamesSelected.push(categoryName);
			categoriesSelectedLowerCased.push(categoryName.toLowerCase());

			// Add selected category to the top of the categories selected display
			categoryNamesSelectedDisplay.unshift(getlistItemDisplay(categoryName, categoryName, this.handleCategoryClickRemove));

			// Update state of categories selected and clear the category overlay results
			this.setState({
				categoryOverlay					: '',
				categoryNamesSelectedDisplay,
				form,
				categoriesSelectedLowerCased
			})
		}
	}

	handleSearchResultsClose() {
		this.setState({
			categoryOverlay	: ''
		});
	}

	buildResultsOverlay = results =>
				<div className="search-results-container">
					<div className="close" onClick={this.handleSearchResultsClose}>x</div>
					<ul className="search-results-overlay">
						{
							results.length ?
								results.map((result, index) => (
									<li key			= {index}
										data-value	= {result}
										data-id		= {index}
										onClick		= {this.handleCategoryClick}>
										{result}
									</li>
								)) : "No Results Founds"
						}
					</ul>
				</div>

	escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

	handleCategoryInput(event) {
		const 	searchTerms	= event.target.value.toLowerCase().trim(),
				results 	= searchTerms.length ? this.state.categoriesById.filter(term => {
								const regex = RegExp(this.escapeRegExp(searchTerms), "gi");

								// Found by regular expression and not in current categories list
							return (regex.test(term) && this.state.categoriesSelectedLowerCased.indexOf(term.toLowerCase()) === -1);
						}) : '';

		this.setState({
			categoryOverlay	: searchTerms.length ? this.buildResultsOverlay(results, searchTerms) : ''
		});
	}

	handleSeriesSelection(e) {
		let state 					= this.state,
			seriesSelectedDisplay 	= state.seriesSelectedDisplay,
			form					= state.form,
			id						= e.target.value,
			name					= state.seriesById[id];

		seriesSelectedDisplay.push(getlistItemDisplay(id, name, this.handleSeriesClickRemove));

		form.postSeriesSelected.push({
			id, name
		})

		form.seriesNameSelected.push(name);

		this.setState({
			seriesSelectedDisplay,
			form
		});
	}

	getAlertSaveStatus = postAdded =>
		<div className="alert alert-success">
			Post Successfully Saved{postAdded ? `...Redirecting in ${this.state.redirectCountDown} Seconds` : ""}
		</div>

	handleSubmit(event) {
		let action = this.state.id ? "updatePost" : "addPost";

		event.preventDefault();

		// Save post to database
		fetch(`${process.env.REACT_APP_API_URL}/${action}`, {
				method	: 'POST',
				body	: JSON.stringify(this.state.form),
				headers	: {	'Content-Type': 'application/json'}
			})
			.then(res => checkAPIResponse(res))
			.then(json => {
				let savedPostStatuses = new Set();

				// Display alert messages for components of form
				savedPostStatuses.add(setSavedPostStatuses("Deleted Post Categories", "deletedPostCategories", json, this));
				savedPostStatuses.add(setSavedPostStatuses("Saved Post Categories", "savedPostCategories", json, this));
				savedPostStatuses.add(setSavedPostStatuses("Saved Flickr Set", "savedPostFlickrSet", json, this));
				savedPostStatuses.add(setSavedPostStatuses("Saved Post Series", "savedPostSeries", json, this));
				savedPostStatuses.add(setSavedPostStatuses("Deleted Post Series", "deletedPostSeries", json, this));
				savedPostStatuses.delete(null);

				// Check status of main elements of form (no including components above)
				if(json.savePost && json.savePost.affectedRows && json.savePost.affectedRows > 0) {
					// Main form saved successfully

					// Check if adding a new post or editing an existing one
					let  postAdded = action === "addPost" && json.savePost.insertId > 0 ? true : false;

					// Depending on edit or add, set state to display correct message
					this.setState({
						id				: postAdded ? json.savePost.insertId : this.state.id,
						updatePosted	: true,
						saveStatus		: this.getAlertSaveStatus(postAdded)
					});

					if(postAdded) {
						// A new post was added. Set a countdown for a redirect to the edit form
						setInterval(() => {
							this.setState({redirectCountDown : this.state.redirectCountDown - 1});

							this.setState({
								saveStatus : this.getAlertSaveStatus(true)
							})
						}, 1000);

						// Redirect to Edit form
						setTimeout(() => {
							document.location.href = `/posts/edit/${json.savePost.insertId}`;
						}, 5000);
					} else {
						// Edit saved, clear out success message in 5 seconds
						setTimeout(() => this.setState({
							saveStatus	: null
						}), 5000);
					}

				} else {
					// Post was not saved successfully. Display error return or unknown for none
					this.setState({
						updatePosted	: false,
						saveStatus		: 	<div className="alert alert-danger">Error Saving Post.
												{	json.savePost && json.savePost.message && json.savePost.message.length ?
														" " + json.savePost.message : " Unknown Error."
												}
											</div>
					});
				}


			},
			error => console.log("No Response from API saving post", error)
		).catch(error => console.error("API Request Fetch Error saving post:", error));
	}

	handleSaveDraft() {

		this.setState({
			saveDraftStatus	: <div className="alert alert-success">Saving draft...</div>
		})

		// Save draft to database
		fetch(`${process.env.REACT_APP_API_URL}/saveDraft`, {
			method	: 'POST',
			body	: JSON.stringify(this.state.form),
			headers	: {	'Content-Type': 'application/json'}
		})
		.then(res => checkAPIResponse(res))
		.then(json => {
			(json.status && json.status.affectedRows && json.status.affectedRows > 0) &&
				this.setState({
					updatePosted	: true,
					saveDraftStatus	: <div className="alert alert-success">Draft Saved!!!</div>
				});

				setTimeout(() => this.setState({
					saveDraftStatus : null
				}), 5000);
			}, error => console.log("No Response from API saving draft", error)
		).catch(error => console.error("API Request Fetch Error saving draft:", error));
	}

	post() {
		const	{error, isLoaded, form} = this.state,
				demoMessage = !this.state.isAdmin && <div className="alert alert-danger">Demo Mode</div>;

		if (error) {
			return <div>Error: {error.message}</div>;
		} else if (!isLoaded) {
			return <div>Loading...</div>;
		} else {
			return <>{demoMessage}
					<Form	form							= {form}

							// Handlers
							handleCategoryInput				= {this.handleCategoryInput}
							handleTextUpdate				= {this.handleTextUpdate}
							handleSubmit					= {this.handleSubmit}
							handleEditorChange				= {this.handleEditorChange}
							handleSaveDraft					= {this.handleSaveDraft}
							handleSeriesSelection			= {this.handleSeriesSelection}

							// Category Selection
							categoryOverlay					= {this.state.categoryOverlay}
							categoryNamesSelectedDisplay	= {this.state.categoryNamesSelectedDisplay}

							// Series Selection
							series							= {this.state.series}
							seriesSelectedDisplay			= {this.state.seriesSelectedDisplay}

							// Save Statuses
							saveStatus						= {this.state.saveStatus}
							saveDraftStatus					= {this.state.saveDraftStatus}

							deletedPostCategoriesStatus		= {this.state.deletedPostCategoriesStatus}
							savedPostCategoriesStatus		= {this.state.savedPostCategoriesStatus}
							savedPostFlickrSetStatus		= {this.state.savedPostFlickrSetStatus}
							savedPostSeriesStatus			= {this.state.savedPostSeriesStatus}
							deletedPostSeriesStatus			= {this.state.deletedPostSeriesStatus}
					/>
			</>
		}
	}

	render = () => <div>{this.post()}</div>
}