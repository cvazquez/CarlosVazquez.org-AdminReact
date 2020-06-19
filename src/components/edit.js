import React from "react";
import { Editor } from '@tinymce/tinymce-react';

export default class Edit extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			id			: props.match.params.id,
			error		: null,
			isLoaded	: false,
			categories	: null,
			category	: null,
			categoriesByName	: {},
			categoriesById		: [],
			form		: {
				title			: null,
				teaser			: null,
				metaDescription	: null,
				metaKeyWords	: null,
				publishAt		: null,
				categoryNamesSelected : []
			},
			updatePosted : false
		};

		this.handleEditorChange = this.handleEditorChange.bind(this);
		this.handleTextUpdate = this.handleTextUpdate.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleCategoryUpdate = this.handleCategoryUpdate.bind(this);
		this.handleCategoryClick = this.handleCategoryClick.bind(this);
		this.handleCategoryClickRemove = this.handleCategoryClickRemove.bind(this);
	}

	getPost() {
		fetch(`${process.env.REACT_APP_API_URL}/blog/api/admin/getPost/` + this.state.id)
			.then(res => res.json())
			.then(
				result => {
					const 	post = result.post[0],
							categoriesByName = {},
							categoriesById	= [];

					result.categories.forEach((item, index) => {
						categoriesByName[item.name] = item.id;
						categoriesById[item.id] = item.name;
					})

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
							entryId			: post.id,
							categoryNamesSelected	: []
						},
						categoryNamesSelectedDisplay : []
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
		const form = this.state.form;

		form[event.target.name] = event.target.value;

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

		form.categoryNamesSelected.push(categoryName);
		state.categoryNamesSelectedDisplay.push(
				<li key={categoryName}>
					{categoryName}
					<span className="close" data-name={categoryName} onClick={this.handleCategoryClickRemove}>x</span>
				</li>);

		this.setState({
			categoryNamesSelectedDisplay : state.categoryNamesSelectedDisplay,
			form
		})
	}

	buildResultsOverlay(results) {
		return(
			<div className="search-results-container">
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

	handleCategoryUpdate(event) {
		const results = event.target.value.trim().length ? this.state.categoriesById.filter(term => {
							const regex = RegExp(event.target.value, "gi");
							return regex.test(term);
						}) : '';

		this.setState({
			categoryOverlay	: this.buildResultsOverlay(results)
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
							(json.status && json.status.affectedRows && json.status.affectedRows > 0) &&
								this.setState({
									updatePosted	: true
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

								<input 	type="text"
										name="publishAt"
										value={form.publishAt}
										placeholder="Publish Date/Time"
										onChange={this.handleTextUpdate} />

								<input	type		= "text"
										autoComplete = "off"
										name		= "categories"
										placeholder	= "Start Typing a Category"
										value		= {form.categoryName}
										onChange	= {this.handleCategoryUpdate} />
								<ul className="category-names-selected">{this.state.categoryNamesSelectedDisplay}</ul>
								<div>{this.state.categoryOverlay}</div>
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