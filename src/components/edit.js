/*
	Form to edit and add blog posts
*/

import React from "react";
import Form from "./form";
import { checkAPIResponse, setSavedPostStatuses } from '../helpers/api'

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
			id								: this.props.match ? this.props.match.params.id : null,

			// Loading Async Init
			error							: null,
			isLoaded						: false,

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

			// Flickr
			flickrSets						: [],

			form		: {
				title					: "",
				teaser					: "",
				metaDescription			: "",
				metaKeyWords			: "",
				publishAt				: "",
				publishYear				: date.getFullYear(),
				publishMonth			: date.getMonth()+1,
				publishDay				: date.getDate(),
				publishHour				: date.getHours(),
				publishMinute			: date.getMinutes(),
				categoryName			: "",
				categoryNamesSelected 	: [],
				entryId					: null,
				seriesNameSelected		: [],
				postSeriesSelected		: [],
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

	getPost() {
		fetch(`${process.env.REACT_APP_API_URL}/getPost/` + this.state.id)
			.then(res => checkAPIResponse(res))
			.then(
				result => {
					if(result && result.post && Array.isArray(result.post) && result.post.length === 1) {
						const 	post 							= result.post[0],
								publishDate 					= new Date(post.publishAt),

								// Manage Category Selection
								categoriesByName 				= {},
								categoriesById					= [],
								categoryNamesSelected 			= [],
								categoryNamesSelectedLowerCased = [],
								categoryNamesSelectedDisplay	= [],

								// Manage Series Selection
								seriesByName					= {},
								seriesById						= [],
								seriesNameSelected				= [],
								seriesSelectedDisplay			= [];


						// ******* Populate Category Objects *******

							// Access all categories by name and id (reverse lookup)
							result.categories.forEach(item => {
								categoriesByName[item.name.toLowerCase()] = item.id;
								categoriesById[item.id] = item.name; // don't change case. Displays in category search overlay results
							});

							// Loop through categories already attached to a post
							result.postCategories.forEach(postCategory => {
								// Create arrays of normal and lowercased category names, for auto-complete use
								categoryNamesSelected.push(postCategory.name);
								categoryNamesSelectedLowerCased.push(postCategory.name.toLowerCase());

								// Create an array of html list elements to display categories
								categoryNamesSelectedDisplay.push(
									<li key={postCategory.name}>
										{postCategory.name}
										<span className="close" data-name={postCategory.name} onClick={this.handleCategoryClickRemove}>x</span>
									</li>);
							});


						// ******** Populate Series Objects *********
							// Access all series by name and id (reverse lookup)
							result.series.forEach(item => {
								seriesByName[item.name.toLowerCase()] = item.id;
								seriesById[item.id] = item.name; // don't change case. Displays in series search overlay results
							});

							// Loop through series already attached to a post
							result.postSeries.forEach(series => {
								// Add series to an array, to add/remove series, and post to save
								seriesNameSelected.push(series.name);

								// Create an array of html list elements to display series
								seriesSelectedDisplay.push(
									<li key={series.id}>
										{series.name}
										<span className="close" data-name={series.name} onClick={this.handleSeriesClickRemove}>x</span>
									</li>
								);
							});


						this._isMounted && this.setState({
							isLoaded			: true,
							categories			: result.categories,
							categoriesByName	: categoriesByName,
							categoriesById		: categoriesById,
							categoryOverlay		: null,
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
							// this breaks typing in the field ???	categoryName			: "",
								categoryNamesSelected,
								seriesNameSelected,
								postSeriesSelected		: result.postSeries,
								flickrSets				: result.flickrSets,
								flickrSetId				: typeof(post.flickrSetId) === "undefined" || post.flickrSetId === null ? "" : post.flickrSetId
							},
							categoryNamesSelectedDisplay	: categoryNamesSelectedDisplay,
							categoriesSelectedLowerCased	: categoryNamesSelectedLowerCased,
							postCategories					: result.postCategories,
							series							: result.series,
							seriesByName,
							seriesById,
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
						const	seriesByName		= {},
								seriesById			= [],
								categoriesByName	= {},
								categoriesById		= [],
								form				= this.state.form;

						result.series.forEach(item => {
							seriesByName[item.name.toLowerCase()] = item.id;
							seriesById[item.id] = item.name; // don't change case. Displays in series search overlay results
						});

						result.categories.forEach(item => {
							categoriesByName[item.name.toLowerCase()] = item.id;
							categoriesById[item.id] = item.name; // don't change case. Displays in category search overlay results
						});

						form.flickrSets = result.flickrSets;

						this._isMounted && this.setState({
							isLoaded			: true,
							series				: result.series,
							seriesByName,
							seriesById,
							categories			: result.categories,
							categoriesByName,
							categoriesById,
							categoryOverlay		: null,
							form
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

	handleEditorChange(content) {
		const form = this.state.form;

		form.content = content;

		this.setState({
			form
		});
	}

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

	handleTextUpdate(event) {
		const	form		= this.state.form,
				fieldName	= event.target.name;

		form[fieldName] = event.target.value;

		this.setState({
			form
		});

		if(["publishYear", "publishMonth", "publishDay", "publishHour", "publishMinute"].indexOf(fieldName) > -1) {
			this.setPublishAtDate();
		}
	}

	handleCategoryClickRemove(event) {
		const	form = this.state.form,
				categoryNamesSelectedDisplay = [],
				categoryNamesSelected = form.categoryNamesSelected;

		form.categoryNamesSelected = categoryNamesSelected.filter(categoryName => categoryName !== event.currentTarget.dataset.name);

		for(let index in form.categoryNamesSelected) {
			categoryNamesSelectedDisplay.push(
				<li key={form.categoryNamesSelected[index]}>
					{form.categoryNamesSelected[index]}
					<span className="close" data-name={form.categoryNamesSelected[index]} onClick={this.handleCategoryClickRemove}>x</span>
				</li>);
		}

		this.setState({
			categoryNamesSelectedDisplay,
			form
		})
	}

	handleSeriesClickRemove(event) {
		const	form = this.state.form,
				seriesSelectedDisplay = [],
				seriesSelected = form.seriesNameSelected;

		form.seriesNameSelected = seriesSelected.filter(series => series !== event.currentTarget.dataset.name);

		if(form.seriesNameSelected.length) {
			for(let index in form.seriesNameSelected) {
				seriesSelectedDisplay.push(
					<li key={form.seriesNameSelected[index]}>
						{form.seriesNameSelected[index]}
						<span	className	= "close"
								data-name	= {form.seriesNameSelected[index]}
								onClick		= {this.handleSeriesClickRemove}>x</span>
					</li>);
			}
		}

		this.setState({
			seriesSelectedDisplay,
			form
		})
	}

	handleCategoryClick(event) {
		const	state							= this.state,
				form							= state.form,
				categoryName					= event.currentTarget.dataset.value,
				categoryNamesSelectedDisplay	= state.categoryNamesSelectedDisplay,
				categoriesSelectedLowerCased 	= state.categoriesSelectedLowerCased;

		if(form.categoryNamesSelected.indexOf(categoryName) === -1) {
			form.categoryNamesSelected.push(categoryName);
			categoriesSelectedLowerCased.push(categoryName.toLowerCase());

			//form.categoryName = ""; //  A component is changing an uncontrolled input of type text to be controlled

			categoryNamesSelectedDisplay.unshift(
				<li key={categoryName}>
					{categoryName}
					<span className="close" data-name={categoryName} onClick={this.handleCategoryClickRemove}>x</span>
				</li>
			);

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
									<li key			= {result}
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

		seriesSelectedDisplay.push(
			<li key={id}>
				{name}
				<span className="close" data-name={name} onClick={this.handleSeriesClickRemove}>x</span>
			</li>
		);

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

				setSavedPostStatuses("Deleted Post Categories", "deletedPostCategories", json, this);
				setSavedPostStatuses("Saved Post Categories", "savedPostCategories", json, this);
				setSavedPostStatuses("Save Flickr Set", "savedPostFlickrSet", json, this);
				setSavedPostStatuses("Saved Post Series", "savedPostSeries", json, this);
				setSavedPostStatuses("Deleted Post Series", "deletedPostSeries", json, this);

				if(json.savePost && json.savePost.affectedRows && json.savePost.affectedRows > 0) {
					let  postAdded = action === "addPost" && json.savePost.insertId > 0 ? true : false;

					this.setState({
						id				: postAdded ? json.savePost.insertId : this.state.id,
						updatePosted	: true,
						saveStatus		: this.getAlertSaveStatus(postAdded)
					});

					if(postAdded) {
						setInterval(() => {
							this.setState({redirectCountDown : this.state.redirectCountDown - 1});

							this.setState({
								saveStatus : this.getAlertSaveStatus(true)
							})
						}, 1000);

						setTimeout(() => {
							document.location.href = `/posts/edit/${json.savePost.insertId}`;
						}, 5000);
					} else {
						setTimeout(() => this.setState({
							saveStatus	: null
						}), 5000);
					}

				} else {
					if(json.savePost && json.savePost.message && json.savePost.message.length) {
						this.setState({
							updatePosted	: false,
							saveStatus		: 	<div className="alert alert-danger">Error Saving Post.
													{	json.savePost && json.savePost.message && json.savePost.message.length ?
															" " + json.savePost.message : " Unknown Error."
													}
												</div>
						});
					}
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
		const {error, isLoaded, form} = this.state;

		if (error) {
			return <div>Error: {error.message}</div>;
		  } else if (!isLoaded) {
			return <div>Loading...</div>;
		  } else {
			return (
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
			)
		}
	}

	render = () => <div>{this.post()}</div>
}