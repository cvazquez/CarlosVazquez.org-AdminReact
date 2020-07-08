import React from "react";
import Form from "./form";

export default class Edit extends React.Component {
	constructor(props) {
		super(props);

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
			id						: this.props.match ? this.props.match.params.id : null,
			error					: null,
			isLoaded				: false,
			categories				: null,
			categoriesByName		: {},
			categoriesById			: [],
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
			categoryNamesSelectedDisplay	: [],
			categoriesSelectedLowerCased	: [],
			postCategories					: [],
			updatePosted 					: false,
			deletedCategories				: false,
			savedCategories					: false,
			savePostFlickrSet				: false,
			saveStatus						: null,
			redirectCountDown				: this.intervalCountDown,
			series							: [],
			seriesByName					: {},
			seriesById						: [],
			seriesSelectedDisplay			: [],
			flickrSets						: []
		};
	}

	getPost() {
		fetch(`${process.env.REACT_APP_API_URL}/getPost/` + this.state.id)
			.then(res => res.json())
			.then(
				result => {
					const 	post 							= result.post[0],
							publishDate 					= new Date(post.publishAt),
							categoriesByName 				= {},
							categoriesById					= [],
							categoryNamesSelected 			= [],
							categoryNamesSelectedLowerCased = [],
							categoryNamesSelectedDisplay	= [],
							seriesByName					= {},
							seriesById						= [],
							seriesNameSelected				= [],
							seriesSelectedDisplay			= [];

					result.categories.forEach(item => {
						categoriesByName[item.name.toLowerCase()] = item.id;
						categoriesById[item.id] = item.name; // don't change case. Displays in category search overlay results
					});

					result.postCategories.forEach(postCategory => {
						categoryNamesSelected.push(postCategory.name);
						categoryNamesSelectedLowerCased.push(postCategory.name.toLowerCase());

						categoryNamesSelectedDisplay.push(
							<li key={postCategory.name}>
								{postCategory.name}
								<span className="close" data-name={postCategory.name} onClick={this.handleCategoryClickRemove}>x</span>
							</li>);
					});

					result.series.forEach(item => {
						seriesByName[item.name.toLowerCase()] = item.id;
						seriesById[item.id] = item.name; // don't change case. Displays in series search overlay results
					});

					result.postSeries.forEach(series => {
						seriesNameSelected.push(series.name);

						seriesSelectedDisplay.push(
							<li key={series.id}>
								{series.name}
								<span className="close" data-name={series.name} onClick={this.handleSeriesClickRemove}>x</span>
							</li>
						);
					});

					this.setState({
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
				},
				error => {
					this.setState({
						isLoaded	: false,
						error
					})
				}
			)
	}

	getCategories() {
		fetch(`${process.env.REACT_APP_API_URL}/getCategories`)
			.then(res => res.json())
			.then(
				result => {
					const 	categoriesByName	= {},
							categoriesById		= [];

					result.categories.forEach(item => {
						categoriesByName[item.name.toLowerCase()] = item.id;
						categoriesById[item.id] = item.name; // don't change case. Displays in category search overlay results
					});

					this.setState({
						isLoaded						: true,
						categories						: result.categories,
						categoriesByName				: categoriesByName,
						categoriesById					: categoriesById,
						categoryOverlay					: null
					});
				},
				error => {
					this.setState({
						isLoaded	: false,
						error
					})
				}
			)
	}

	getSeries() {
		fetch(`${process.env.REACT_APP_API_URL}/getSeries`)
			.then(res => res.json())
			.then(
				result => {
					const	seriesByName					= {},
							seriesById						= [];

					result.series.forEach(item => {
						seriesByName[item.name.toLowerCase()] = item.id;
						seriesById[item.id] = item.name; // don't change case. Displays in series search overlay results
					});

					this.setState({
						isLoaded	: true,
						series		: result.series,
						seriesByName,
						seriesById
					});
				},
				error => {
					this.setState({
						isLoaded	: false,
						error
					})
				}
			)
	}

	getNewPost() {
		fetch(`${process.env.REACT_APP_API_URL}/getNewPost`)
			.then(res => res.json())
			.then(
				result => {
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

					this.setState({
						isLoaded			: true,
						series				: result.series,
						seriesByName,
						seriesById,
						categories			: result.categories,
						categoriesByName	: categoriesByName,
						categoriesById		: categoriesById,
						categoryOverlay		: null,
						form
					});
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
		if(this.state.id) {
			this.getPost();
		} else {
			// New Page refresh
			this.getNewPost();
			this.setPublishAtDate();
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

	handleEditorChange = (content, editor) => {
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
		const	form				= this.state.form,
				fieldName			= event.target.name;

		form[fieldName] = event.target.value;

		this.setState({
			form
		});

		if(["publishYear", "publishMonth", "publishDay",	"publishHour", "publishMinute"].indexOf(fieldName) > -1) {
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
		const	state			= this.state,
				form			= state.form,
				dataSet			= event.currentTarget.dataset,
				categoryName	= dataSet.value,
				categoriesSelectedLowerCased = this.state.categoriesSelectedLowerCased;

		if(form.categoryNamesSelected.indexOf(categoryName) === -1) {
			form.categoryNamesSelected.push(categoryName);
			categoriesSelectedLowerCased.push(categoryName.toLowerCase());

			//form.categoryName = ""; //  A component is changing an uncontrolled input of type text to be controlled

			state.categoryNamesSelectedDisplay.unshift(
				<li key={categoryName}>
					{categoryName}
					<span className="close" data-name={categoryName} onClick={this.handleCategoryClickRemove}>x</span>
				</li>
			);

			this.setState({
				categoryNamesSelectedDisplay	: state.categoryNamesSelectedDisplay,
				categoryOverlay					: '',
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

	buildResultsOverlay(results) {
		return(
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
		)
	}

	escapeRegExp(text) {
		return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

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

	getAlertSaveStatus(postAdded) {
		return <div className="alert alert-success">
					Post Successfully Saved{postAdded ? `...Redirecting in ${this.state.redirectCountDown} Seconds` : ""}
				</div>
	}

	handleSubmit(event) {
		let action = this.state.id ? "updatePost" : "addPost";

		event.preventDefault();

		// Save comment to database
		fetch(`${process.env.REACT_APP_API_URL}/${action}`, {
							method	: 'POST',
							body	: JSON.stringify(this.state.form),
							headers	: {	'Content-Type': 'application/json'}
						})
						.then(res => res.json())
						.then(json => {

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
								}

							} else {
								if(json.savePost && json.savePost.message && json.savePost.message.length)
								this.setState({
									updatePosted	: false,
									saveStatus		: 	<div className="alert alert-danger">Error Saving Post.
															{	json.savePost && json.savePost.message && json.savePost.message.length ?
																	" " + json.savePost.message : " Unknown Error."
															}
														</div>
								});
							}

							(json.deletePostCategories && json.deletePostCategories.affectedRows && json.deletePostCategories.affectedRows > 0) &&
								this.setState({
									deletedCategories	: true
								});

							(json.savePostCategories && json.savePostCategories.affectedRows && json.savePostCategories.affectedRows > 0) &&
								this.setState({
									savedCategories	: true
								});

							(json.savePostFlickrSet && json.savePostFlickrSet.affectedRows && json.savePostFlickrSet.affectedRows > 0) &&
							this.setState({
								savePostFlickrSet	: true
							});
						});
	}

	handleSaveDraft() {
		// Save draft to database
		fetch(`${process.env.REACT_APP_API_URL}/saveDraft`, {
							method	: 'POST',
							body	: JSON.stringify(this.state.form),
							headers	: {	'Content-Type': 'application/json'}
						})
						.then(res => res.json())
						.then(json => {
							(json.status && json.status.affectedRows && json.status.affectedRows > 0) &&
								this.setState({
									updatePosted	: true
								});
						});
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
							handleCategoryInput				= {this.handleCategoryInput}
							handleTextUpdate				= {this.handleTextUpdate}
							handleSubmit					= {this.handleSubmit}
							handleEditorChange				= {this.handleEditorChange}
							handleSaveDraft					= {this.handleSaveDraft}
							handleSeriesSelection			= {this.handleSeriesSelection}
							saveStatus						= {this.state.saveStatus}
							categoryOverlay					= {this.state.categoryOverlay}
							categoryNamesSelectedDisplay	= {this.state.categoryNamesSelectedDisplay}
							series							= {this.state.series}
							seriesSelectedDisplay			= {this.state.seriesSelectedDisplay} />
			)
		}
	}

	render = () => <div>{this.post()}</div>
}