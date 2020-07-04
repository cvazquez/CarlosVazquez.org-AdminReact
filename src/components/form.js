import React from "react";
import { Editor } from '@tinymce/tinymce-react';

export default class Form extends React.Component {
	render() {
		const	form 	= this.props.form,
				d 		= new Date(),
				years	= [],
				months	= [],
				days	= [],
				hours	= [],
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

		return(
			<div className="edit">
				<form method="post" onSubmit={this.props.handleSubmit}>
					<div className="meta-fields">
						<input 	type="text"
								name="title"
								value={form.title}
								placeholder="Title"
								onChange={this.props.handleTextUpdate} />

						<input 	type="text"
								name="teaser"
								value={form.teaser}
								placeholder="Teaser"
								onChange={this.props.handleTextUpdate} />

						<input 	type="text"
								name="metaDescription"
								value={form.metaDescription}
								placeholder="Meta Description"
								onChange={this.props.handleTextUpdate} />

						<input 	type="text"
								name="metaKeyWords"
								value={form.metaKeyWords}
								placeholder="Meta Keywords"
								onChange={this.props.handleTextUpdate} />

						<div>
							<select	name		= "publishYear"
									value		= {form.publishYear}
									onChange	= {this.props.handleTextUpdate}>
								{years}
							</select>
							<select	name		= "publishMonth"
									value		= {form.publishMonth}
									onChange	= {this.props.handleTextUpdate}>
								{months}
							</select>
							<select	name		= "publishDay"
									value		= {form.publishDay}
									onChange	= {this.props.handleTextUpdate}>
								{days}
							</select>

							&nbsp;&nbsp;&nbsp;
							<select	name		= "publishHour"
									value		= {form.publishHour}
									onChange	= {this.props.handleTextUpdate}>
								{hours}
							</select>
							<select	name		= "publishMinute"
									value		= {form.publishMinute}
									onChange	= {this.props.handleTextUpdate}>
								{minutes}
							</select>
						</div>

						<input	type		= "text"
								autoComplete = "off"
								name		= "categories"
								placeholder	= "Start Typing a Category"
								value		= {form.categoryName}
								onChange	= {this.props.handleCategoryInput} />
						<div>{this.props.categoryOverlay}</div>
						<ul className="category-names-selected">{this.props.categoryNamesSelectedDisplay}</ul>

						<select name		= "series"
								value		= {form.seriesId}
								onChange	= {this.props.handleSeriesSelection}>
								<option value="">-- Add to a Series --</option>
							{this.props.series.map(series => (
								<option key		= {series.id}
										value	= {series.id}>
										{series.name}
								</option>
							))}
						</select>
						<ul className="series-names-selected">
							{this.props.seriesSelectedDisplay}
						</ul>

						<select name		= "flickrSetId"
								value		= {form.flickrSetId}
								onChange	= {this.props.handleTextUpdate}>
								<option value="">-- Attach To A Flickr Set --</option>
							{form.flickrSets.map(flickrSet => (
								<option key		= {flickrSet.id}
										value	= {flickrSet.id}>
										{flickrSet.title}
								</option>
							))}
						</select>					</div>

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
							onEditorChange	= {this.props.handleEditorChange}
							onSaveContent	= {this.props.handleSaveDraft}
						/>
					</div>

					<div className="save-status">{this.props.saveStatus}</div>

					<input type="submit" name="submitPost" value="Save" />
				</form>
			</div>
		)
	}
}