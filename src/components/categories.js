import React from "react";

export default class Categories extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error				: null,
			isLoaded			: false,
			categories			: [],
			categoriesByName	: {},
			categoriesById		: {}
		};

		this.categoriesById = []; // use for before and after state comparisons when saving

		this.handleTextUpdate = this.handleTextUpdate.bind(this);
		this.handleCategoryBlur = this.handleCategoryBlur.bind(this);
	}

	getCategories() {
		fetch(`${process.env.REACT_APP_API_URL}/blog/api/admin/getCategories`)
			.then(res => res.json())
			.then(
				result => {
					const 	categoriesByName	= {},
							categoriesById		= {};

					result.categories.forEach(item => {
						categoriesByName[item.name] = item.id;
						this.categoriesById[item.id] = item.name;

						categoriesById[item.id] = {
							name		: item.name,
							saveStatus	: null}; // don't change case. Displays in category search overlay results
					});

					this.setState({
						isLoaded						: true,
						categories						: result.categories,
						categoriesByName				: categoriesByName,
						categoriesById					: categoriesById
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
		this.getCategories();
	}

	handleTextUpdate(e) {
		const	id				= e.currentTarget.dataset.id,
				categoriesById	= this.state.categoriesById;

		categoriesById[id].name = e.target.value;

		this.setState({
			categoriesById
		})
	}

	handleCategoryBlur(e) {
		const	id		= e.currentTarget.dataset.id,
				name	= e.target.value;

		let categoriesById = this.state.categoriesById;

		if(this.categoriesById[id] === name) return;

		fetch(`${process.env.REACT_APP_API_URL}/blog/api/admin/updateCategory`, {
				method	: 'POST',
				body	: JSON.stringify({id,name}),
				headers	: {	'Content-Type': 'application/json'}
			})
			.then(res => res.json())
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
					})
				}
			},
			error => {
				categoriesById[id].saveStatus = <span className='blink'>FAILED SAVING!</span>;

				this.setState({
					error,
					categoriesById
				})
			});
	}

	render() {
		const {error, isLoaded, categoriesByName, categoriesById} = this.state;

		if (error) {
			return <div>Error: {error.message}</div>;
		  } else if (!isLoaded) {
			return <div>Loading...</div>;
		  } else {
			return (
				<div className="categories">
					{Object.keys(categoriesByName).map((key) => (
						<div key		= {key}>
							<input	className	= "category"
									type		= "text"
									value		= {categoriesById[categoriesByName[key]].name}
									data-id		= {categoriesByName[key]}
									onChange	= {this.handleTextUpdate}
									onBlur		= {this.handleCategoryBlur} />
							<span className="category-save-status">{categoriesById[categoriesByName[key]].saveStatus}</span>
						</div>
					))}
				</div>
			)
		}
	}
}