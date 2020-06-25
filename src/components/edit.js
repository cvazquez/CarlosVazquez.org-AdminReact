import React from "react";
import Form from "./form";
import { Redirect } from 'react-router-dom'

export default class Edit extends React.Component {
	constructor(props) {
		const date = new Date();

		super(props);

		this.state = {
			id						: props.match.params.id,
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
				entryId					: null
			},
			categoryNamesSelectedDisplay	: [],
			categoriesSelectedLowerCased	: [],
			postCategories					: [],
			updatePosted 					: false,
			deletedCategories				: false,
			savedCategories					: false,
			saveStatus						: null,
			redirect						: null
		};

		//this.setPublishAtDate();

		this.handleEditorChange			= this.handleEditorChange.bind(this);
		this.handleTextUpdate 			= this.handleTextUpdate.bind(this);
		this.handleSaveDraft			= this.handleSaveDraft.bind(this);
		this.handleSubmit 				= this.handleSubmit.bind(this);
		this.handleCategoryInput 		= this.handleCategoryInput.bind(this);
		this.handleCategoryClick 		= this.handleCategoryClick.bind(this);
		this.handleCategoryClickRemove 	= this.handleCategoryClickRemove.bind(this);
		this.handleSearchResultsClose 	= this.handleSearchResultsClose.bind(this);
	}

	getPost() {
		fetch(`${process.env.REACT_APP_API_URL}/blog/api/admin/getPost/` + this.state.id)
			.then(res => res.json())
			.then(
				result => {
					const 	post = result.post[0],
							publishDate = new Date(post.publishAt),
							categoriesByName = {},
							categoriesById	= [],
							categoryNamesSelected = [],
							categoryNamesSelectedLowerCased = [],
							categoryNamesSelectedDisplay = [];

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
							categoryNamesSelected	: categoryNamesSelected
						},
						categoryNamesSelectedDisplay	: categoryNamesSelectedDisplay,
						categoriesSelectedLowerCased	: categoryNamesSelectedLowerCased,
						postCategories					: result.postCategories
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
		fetch(`${process.env.REACT_APP_API_URL}/blog/api/admin/getCategories`)
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

	componentDidMount() {
		if(this.state.id) {
			this.getPost();
		} else {
			this.getCategories();
		}
	}

	componentDidUpdate(prevProps) {
		if(this.props.match.params.id !== prevProps.match.params.id) {
			this.setState({
				id : this.props.match.params.id
			});
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
				fieldName			= event.target.name,
				publishDateFields	= ["publishYear", "publishMonth", "publishDay",	"publishHour", "publishMinute"];

		form[fieldName] = event.target.value;

		if(publishDateFields.indexOf(fieldName) > -1) {
			form.publishAt = this.setPublishAtDate();
		} else {
			this.setState({
				form
			});
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
			categoryNamesSelectedDisplay : categoryNamesSelectedDisplay,
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

	handleSubmit(event) {
		let action;
		event.preventDefault();

		if(this.state.id) {
			action = "updatePost";
		} else {
			action = "addPost";
		}

		// Save comment to database
		fetch(`${process.env.REACT_APP_API_URL}/blog/api/admin/${action}`, {
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
									saveStatus		: <div className="alert alert-success">Post Successfully Saved{postAdded ? "...Redirecting in 5 Seconds" : ""}</div>
								});

								setTimeout(()=>{
									this.setState({saveStatus	: null,
													redirect	: postAdded ? `/posts/edit/${json.savePost.insertId}` : null
												});

								}, 5000);
							} else {
								this.setState({
									updatePosted	: false,
									saveStatus		: <div className="alert alert-danger">Error Saving Post</div>
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
						});
	}

	handleSaveDraft() {
		// Save draft to database
		fetch(`${process.env.REACT_APP_API_URL}/blog/api/admin/saveDraft`, {
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

		if(this.state.redirect) {
			return <Redirect to={this.state.redirect} />
		}

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
							saveStatus						= {this.state.saveStatus}
							categoryOverlay					= {this.state.categoryOverlay}
							categoryNamesSelectedDisplay	= {this.state.categoryNamesSelectedDisplay} />
			)
		}
	}

	render = () => <div>{this.post()}</div>
}