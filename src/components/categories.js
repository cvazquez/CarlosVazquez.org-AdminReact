import React from "react";
import { checkAPIResponse } from '../helpers/api'

export default class Categories extends React.Component {
	constructor(props) {
		super(props);

		// Solves a Jest error
		this._isMounted = false;

		this.state = {
			// componentDidMount api async call results
			error				: null,
			isLoaded			: false,

			// Categories list to display and edit
			categoriesByName	: {},
			categoriesById		: {},

			// new category field
			newCategory			: "",

			// Toggles update alert className of existing category
			savedCategory		: null,

			// Toggles update alert className of new category
			newCategorySaveStatus : null
		};

		this.categoriesById = []; // use for before and after state comparisons when saving

		this.handleTextUpdate			= this.handleTextUpdate.bind(this);
		this.handleCategoryBlur			= this.handleCategoryBlur.bind(this);
		this.handleNewCategory			= this.handleNewCategory.bind(this);
		this.handleNewCategorySubmit	= this.handleNewCategorySubmit.bind(this);
	}

	// Request categories to display and edit
	getCategories() {
		fetch(`${process.env.REACT_APP_API_URL}/getCategories`)
			.then(res => checkAPIResponse(res))
			.then(
				result => {

					if(result.categories && Array.isArray(result.categories)) {
						const 	categoriesByName	= {},
								categoriesById		= {};

						result.categories.forEach(item => {
							// Get a categories id by name
							categoriesByName[item.name] = item.id;

							// Stores initial state of category id's name value, for comparison when value updates are made
							this.categoriesById[item.id] = item.name;

							// Get a categories name by id
							categoriesById[item.id] = {
								name		: item.name,
								saveStatus	: null}; // don't change case. Displays in category search overlay results
						});

						this._isMounted && this.setState({
							isLoaded			: true,
							categoriesByName	: categoriesByName,
							categoriesById		: categoriesById
						});
					} else {
						throw(new Error("getCategories() fetch missing categories array"));
					}
				},
				error => {
					this._isMounted && this.setState({
						isLoaded	: false,
						error
					})

					console.log("No Response from API getting categories", error)
				}
			).catch(error => {

				this.setState({
					error
				});

				console.error("API Request Categories Fetch Error:", error);
			})
	}

	componentDidMount() {
		// API call to get list of categories to display and edit
		this._isMounted = true;
		this._isMounted && this.getCategories();
	}

	componentWillUnmount() {
		this._isMounted = false;
	 }

	handleTextUpdate(e) {
		const	id				= e.currentTarget.dataset.id,
				categoriesById	= this.state.categoriesById;

		categoriesById[id].name = e.target.value;

		this.setState({
			categoriesById
		})
	}

	updateCategory(id, name, categoriesById) {
		fetch(`${process.env.REACT_APP_API_URL}/updateCategory`, {
			method	: 'POST',
			body	: JSON.stringify({id,name}),
			headers	: {	'Content-Type': 'application/json'}
		})
		.then(res => checkAPIResponse(res))
		.then( result => {
			if(result.affectedRows && result.affectedRows > 0) {

				categoriesById[id].saveStatus = <span className='blink'>SAVED!</span>;
				this.categoriesById[id] = name;

				this.setState({
					categoriesById
				});

				setTimeout(() => {
					categoriesById[id].saveStatus = null;

					this.setState({
						categoriesById
					});
				}, 5000)
			} else {
				categoriesById[id].saveStatus = <span className='blink'>FAILED SAVING!</span>;

				this.setState({
					categoriesById
				});

				throw(new Error("Failed Saving updated category."))
			}
		},
		error => {
			categoriesById[id].saveStatus = <span className='blink'>FAILED SAVING!</span>;

			this.setState({
				error,
				categoriesById
			})

			console.log("No Response from API saving categories", error)
		}).catch(error => console.error("API Request Saving Updated category Fetch Error:", error));
	}

	// If a category is updated, post update to API to save to DB
	handleCategoryBlur(e) {
		// A blanked out category will deactivate it
		const	id		= e.currentTarget.dataset.id,
				name	= e.target.value.trim();

		// Used to reinit the category names for comparison later
		let categoriesById = this.state.categoriesById;

		// Category name didn't update, no need to save. Exit function
		if(this.categoriesById[id] === name) return;

		this.updateCategory(id, name, categoriesById)
	}

	handleNewCategory(e) {
		// Normal react text field value update
		this.setState({
			newCategory : e.target.value
		});
	}

	addCategory(newCategory) {
		fetch(`${process.env.REACT_APP_API_URL}/addCategory`, {
			method	: 'POST',
			body	: JSON.stringify({newCategory}),
			headers	: {	'Content-Type': 'application/json'}
		})
		.then(res => checkAPIResponse(res))
		.then( result => {
			if(result.addedCategory.affectedRows && result.addedCategory.affectedRows > 0) {

				this.setState({
					newCategorySaveStatus	: <span className='blink'>SAVED "{newCategory}"!</span>,
					savedCategory			: newCategory,
					newCategory				: ""
				});

				this.getCategories();

				setTimeout(() => {
					this.setState({
						newCategorySaveStatus : null
					});
				}, 5000);

			} else {
				this.setState({
					newCategorySaveStatus : <span className='blink'>FAILED SAVING! {result.addedCategory.message}</span>
				});

				throw(new Error("Failed saving new category. No DB rows affected"));
			}
		},
		error => {
			this.setState({
				error,
				newCategorySaveStatus : <span className='blink'>FAILED SAVING!</span>
			});


		}).catch(error => console.log("Fetch Promise Error Saving New Category"));
	}

	handleNewCategorySubmit(e) {
		e.preventDefault();

		this.addCategory(this.state.newCategory);
	}

	render() {
		const {error, isLoaded, categoriesByName, categoriesById, newCategory, newCategorySaveStatus} = this.state;

		if (error) {
			return <div>Error: {error.message}</div>;
		  } else if (!isLoaded) {
			return <div>Loading...</div>;
		  } else {
			return <div>
					<div className="lists">
						{/* Form and field to save a new category */}
						<form action="POST" onSubmit={this.handleNewCategorySubmit}>
							<input	className	= "category"
									type		= "text"
									value		= {newCategory}
									onChange	= {this.handleNewCategory}
									onBlur		= {this.handleNewCategoryBlur}
									placeholder	= "Add a New Category" />

							<button type="button" onClick={this.handleNewCategorySubmit}>Add</button>
							<span className="new-category-save-status">{newCategorySaveStatus}</span>
						</form>

						{/* Lookp through existing list of categories to edit */}
						{Object.keys(categoriesByName).map(key =>
							<div key		= {key}>
								<input	className	=  {this.state.savedCategory === categoriesById[categoriesByName[key]].name ? "category saved" : "category"}
										type		= "text"
										value		= {categoriesById[categoriesByName[key]].name}
										data-id		= {categoriesByName[key]}
										data-testid	= {categoriesById[categoriesByName[key]].name}
										onChange	= {this.handleTextUpdate}
										onBlur		= {this.handleCategoryBlur} />
								<span className="category-save-status">{categoriesById[categoriesByName[key]].saveStatus}</span>
							</div>
						)}
					</div>
				</div>
		}
	}
}