import React from "react";
import { Editor } from '@tinymce/tinymce-react';

export default class Edit extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			id						: props.match.params.id,
			error					: null,
			isLoaded				: false,
			categories				: null,
			category				: null,
			categoriesByName		: {},
			categoriesById			: [],
			form		: {
				title					: null,
				teaser					: null,
				metaDescription			: null,
				metaKeyWords			: null,
				publishAt				: null,
				publishYear				: null,
				publishMonth			: null,
				publishDay				: null,
				publishHour				: null,
				publishMinute			: null,
				categoryNamesSelected 	: []
			},
			categoryNamesSelectedDisplay	: [],
			postCategories					: [],
			updatePosted 					: false,
			deletedCategories				: false,
			savedCategories					: false

		};

		this.handleEditorChange			= this.handleEditorChange.bind(this);
		this.handleTextUpdate 			= this.handleTextUpdate.bind(this);
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
						categoriesById[item.id] = item.name.toLowerCase();
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
						isLoaded	: true,
						categories	: result.categories,
						categoriesByName	: categoriesByName,
						categoriesById		: categoriesById,
						categoryOverlay		: null,
						form		: {
							title			: post.title,
							teaser			: post.teaser,
							content			: post.content,
							metaDescription	: post.metaDescription,
							metaKeyWords	: post.metaKeyWords,
							publishAt		: post.publishAt,
							publishYear		: publishDate.getFullYear(),
							publishMonth	: publishDate.getMonth()+1,
							publishDay		: publishDate.getDate(),
							publishHour		: publishDate.getHours(),
							publishMinute	: publishDate.getMinutes(),
							entryId			: post.id,
							categoryNamesSelected	: categoryNamesSelected
						},
						categoryNamesSelectedDisplay : categoryNamesSelectedDisplay,
						categoriesSelectedLowerCased : categoryNamesSelectedLowerCased,
						postCategories		: result.postCategories
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
		this.getPost();
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

	handleTextUpdate(event) {
		const	form				= this.state.form,
				fieldName			= event.target.name,
				publishDateFields	= ["publishYear", "publishMonth", "publishDay",	"publishHour", "publishMinute"];

		form[fieldName] = event.target.value;

		if(publishDateFields.indexOf(fieldName) > -1) {
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
		}

		this.setState({
			form
		});
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
		const	state	= this.state,
				form	= state.form,
				dataSet	= event.currentTarget.dataset,
				categoryName	= dataSet.value;

		if(form.categoryNamesSelected.indexOf(categoryName) === -1) {
			form.categoryNamesSelected.push(categoryName);

			state.categoryNamesSelectedDisplay.unshift(
				<li key={categoryName}>
					{categoryName}
					<span className="close" data-name={categoryName} onClick={this.handleCategoryClickRemove}>x</span>
				</li>
			);

			this.setState({
				categoryNamesSelectedDisplay : state.categoryNamesSelectedDisplay,
				form
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
							return (regex.test(term) && this.state.categoriesSelectedLowerCased.indexOf(term) === -1);
						}) : '';

		this.setState({
			categoryOverlay	: searchTerms.length ? this.buildResultsOverlay(results, searchTerms) : ''
		});
	}

	handleSubmit(event) {
		event.preventDefault();

		// Save comment to database
		fetch(`${process.env.REACT_APP_API_URL}/blog/api/admin/updatePost`, {
							method	: 'POST',
							body	: JSON.stringify(this.state.form),
							headers	: {	'Content-Type': 'application/json'}
						})
						.then(res => res.json())
						.then(json => {
							(json.savePost && json.savePost.affectedRows && json.savePost.affectedRows > 0) &&
								this.setState({
									updatePosted	: true
								});

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

	saveDraft() {
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

		if (error) {
			return <div>Error: {error.message}</div>;
		  } else if (!isLoaded) {
			return <div>Loading...</div>;
		  } else {
				const d = new Date(),
					  years		= [],
					  months	= [],
					  days		= [],
					  hours		= [],
					  minutes	= [];

				for(let x = d.getFullYear(); x > 2005; x--) {
					years.push(<option value={x} key={x}>{x}</option>);
				}

				for(let x = 1; x < 13; x++) {
					months.push(<option value={x} key={x}>{x < 10 ? `0${x}` : x}</option>);
				}

				for(let x = 1; x < 32; x++) {
					days.push(<option value={x} key={x}>{x < 10 ? `0${x}` : x}</option>);
				}

				for(let x = 0; x < 24; x++) {
					hours.push(<option value={x} key={x}>{x < 10 ? `0${x}` : x}</option>);
				}

				for(let x = 0; x < 61; x++) {
					minutes.push(<option value={x} key={x}>{x < 10 ? `0${x}` : x}</option>);
				}

			return (
					<div className="edit">
						<form method="post" onSubmit={this.handleSubmit}>
							<div className="meta-fields">

								<input 	type="text"
										name="title"
										value={form.title}
										placeholder="Title"
										onChange={this.handleTextUpdate} />

								<input 	type="text"
										name="teaser"
										value={form.teaser}
										placeholder="Teaser"
										onChange={this.handleTextUpdate} />

								<input 	type="text"
										name="metaDescription"
										value={form.metaDescription}
										placeholder="Meta Description"
										onChange={this.handleTextUpdate} />

								<input 	type="text"
										name="metaKeyWords"
										value={form.metaKeyWords}
										placeholder="Meta Keywords"
										onChange={this.handleTextUpdate} />


								<div>
									<select	name		= "publishYear"
											value		= {form.publishYear}
											onChange	= {this.handleTextUpdate}>
										{years}
									</select>
									<select	name		= "publishMonth"
											value		= {form.publishMonth}
											onChange	= {this.handleTextUpdate}>
										{months}
									</select>
									<select	name		= "publishDay"
											value		= {form.publishDay}
											onChange	= {this.handleTextUpdate}>
										{days}
									</select>

									&nbsp;&nbsp;&nbsp;
									<select	name		= "publishHour"
											value		= {form.publishHour}
											onChange	= {this.handleTextUpdate}>
										{hours}
									</select>
									<select	name		= "publishMinute"
											value		= {form.publishMinute}
											onChange	= {this.handleTextUpdate}>
										{minutes}
									</select>
								</div>

								<input	type		= "text"
										autoComplete = "off"
										name		= "categories"
										placeholder	= "Start Typing a Category"
										value		= {form.categoryName}
										onChange	= {this.handleCategoryInput} />
								<div>{this.state.categoryOverlay}</div>
								<ul className="category-names-selected">{this.state.categoryNamesSelectedDisplay}</ul>
							</div>

							<div className="editor">
								<Editor
									initialValue	= {form.content}
									apiKey			= {process.env.REACT_APP_TINYMCE_API_KEY}
									init			= {{
										menubar	: false,
										plugins	: [
											'save advlist autolink lists link image charmap print preview anchor',
											'searchreplace visualblocks code fullscreen',
											'insertdatetime media table paste code help wordcount'
										],
										toolbar	:
											`save undo redo | formatselect | bold italic backcolor |
											alignleft aligncenter alignright alignjustify |
											bullist numlist outdent indent | removeformat | help`,
										save_onsavecallback: function () {}
									}}
									onEditorChange={this.handleEditorChange}
									onSaveContent={ev => this.saveDraft()}
								/>
							</div>

							<input type="submit" name="submitPost" value="Save" />
						</form>
					</div>
			)
		}
	}

	render = () => <div>{this.post()}</div>
}