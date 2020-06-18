import React from "react";
import { Editor } from '@tinymce/tinymce-react';

export default class Edit extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			id			: props.match.params.id,
			error		: null,
			isLoaded	: false,
			form		: {
				title			: null,
				teaser			: null,
				metaDescription	: null,
				metaKeyWords	: null,
				publishAt		: null
			},
			updatePosted : false

		};

		this.handleEditorChange = this.handleEditorChange.bind(this);
		this.handleTextUpdate = this.handleTextUpdate.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	getPost() {
		fetch("http://dev.api.carlosvazquez.org/blog/api/admin/getPost/" + this.state.id)
			.then(res => res.json())
			.then(
				result => {
					this.setState({
						isLoaded	: true,
						form		: {
							title			: result.post[0].title,
							teaser			: result.post[0].teaser,
							content			: result.post[0].content,
							metaDescription	: result.post[0].metaDescription,
							metaKeyWords	: result.post[0].metaKeyWords,
							publishAt		: result.post[0].publishAt,
							entryId			: result.post[0].id
						}
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
		const {error, isLoaded} = this.state;

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
										value={this.state.form.title}
										placeholder="Title"
										onChange={this.handleTextUpdate} />

								<input 	type="text"
										name="teaser"
										value={this.state.form.teaser}
										placeholder="Teaser"
										onChange={this.handleTextUpdate} />

								<input 	type="text"
										name="metaDescription"
										value={this.state.form.metaDescription}
										placeholder="Meta Description"
										onChange={this.handleTextUpdate} />

								<input 	type="text"
										name="metaKeyWords"
										value={this.state.form.metaKeyWords}
										placeholder="Meta Keywords"
										onChange={this.handleTextUpdate} />

								<input 	type="text"
										name="publishAt"
										value={this.state.form.publishAt}
										placeholder="Publish Date/Time"
										onChange={this.handleTextUpdate} />

								{/* <select name="categories"></select> */}
							</div>

							<div className="editor">
								<Editor
									initialValue	= {this.state.form.content}
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