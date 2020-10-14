import React from "react";
import { Link } from 'react-router-dom'
import { checkAPIResponse } from '../helpers/api'

export default class SelectOptions extends React.Component {
	constructor(props) {
		super(props);

		// Solves a Jest error
		this._isMounted = false;

		this.nameLower = props.name.toLowerCase();
		this.namePluralLower = props.namePlural.toLowerCase();

		this.state = {
			// componentDidMount api async call results
			error				: null,
			isLoaded			: false,
			isAdmin				: true,

			// Options list to display and edit
			options			: [],
			optionsByName	: {},
			optionsById		: {},

			// new options field
			newOptionsName			: "",

			// Toggles update alert className of existing options
			savedOptions		: null,

			// Toggles update alert className of new options
			newOptionsSaveStatus : null
		};

		this.optionsById = []; // use for before and after state comparisons when saving

		this.handleTextUpdate		= this.handleTextUpdate.bind(this);
		this.handleOptionsBlur		= this.handleOptionsBlur.bind(this);
		this.handleNewOptions		= this.handleNewOptions.bind(this);
		this.handleNewOptionsSubmit	= this.handleNewOptionsSubmit.bind(this);
	}

	// Request options to display and edit
	getOptions() {
		return new Promise(resolve => {
			fetch(`${process.env.REACT_APP_API_URL}/get${this.props.namePlural}`)
			.then(res => checkAPIResponse(res))
			.then(
				result => {
					if(result[this.namePluralLower] && Array.isArray(result[this.namePluralLower])) {
						const 	optionsByName	= {},
								optionsById		= {};

						result[this.namePluralLower].forEach(item => {
							// Get a options id by name
							optionsByName[item.name] = item.id;

							// Stores initial state of options id's name value, for comparison when value updates are made
							this.optionsById[item.id] = item.name;

							// Stores initial state of options id's name value, for comparison when value updates are made
							optionsById[item.id] = {
								name		: item.name,
								saveStatus	: null}; // don't change case. Displays in options search overlay results
						});

						this._isMounted && this.setState({
							isLoaded		: true,
							options			: result[this.namePluralLower],
							optionsByName,
							optionsById,
							isAdmin			: result.isAdmin
						});

						resolve(true)

					} else {
						throw(new Error(`getOptions() fetch missing ${this.props.name} array`));
					}
				},
				error => {
					this._isMounted && this.setState({
						isLoaded	: false,
						error
					});

					throw(new Error("getOptions Error: ", error));
				}
			)
		}).catch(error => {
			this.setState({
				error
			});

			console.error("API Request Options Fetch Error:", error);
		})
	}

	componentDidMount() {
		// API call to get list of options to display and edit
		this._isMounted = true;
		this._isMounted && this.getOptions();
	}

	componentWillUnmount() {
		this._isMounted = false;
	 }

	handleTextUpdate(e) {
		const	id			= e.currentTarget.dataset.id,
				optionsById	= this.state.optionsById;

		optionsById[id].name = e.target.value;

		this.setState({
			optionsById
		})
	}

	// If a options is updated, post update to API to save to DB
	updateOptions(optionsById, id, name) {
		fetch(`${process.env.REACT_APP_API_URL}/update${this.props.name}`, {
			method	: 'POST',
			body	: JSON.stringify({id,name}),
			headers	: {	'Content-Type': 'application/json'}
		})
		.then(res => checkAPIResponse(res))
		.then( result => {
			if(result.affectedRows && result.affectedRows > 0) {

				optionsById[id].saveStatus = <span className='blink'>{name.trim().length ? "SAVED" : "Deactivated"}!</span>;
				this.optionsById[id] = name;

				this.setState({
					optionsById
				});

				setTimeout(() => {
					optionsById[id].saveStatus = null;

					this.setState({
						optionsById
					});
				}, 5000)
			} else {
				optionsById[id].saveStatus = <span className='blink'>FAILED SAVING!</span>;

				this.setState({
					optionsById
				})
			}
		},
		error => {
			optionsById[id].saveStatus = <span className='blink'>FAILED SAVING!</span>;

			this.setState({
				error,
				optionsById
			})
		});
	}

	handleOptionsBlur(e) {
		// A blanked out options will deactivate it
		const	id		= e.currentTarget.dataset.id,
				name	= e.target.value;

		if(this.optionsById[id] === name) return;

		this.updateOptions(this.state.optionsById, id, name)
	}

	handleNewOptions(e) {
		this.setState({
			newOptionsName : e.target.value
		});
	}

	addOptions(newOption) {
		fetch(`${process.env.REACT_APP_API_URL}/add${this.props.name}`, {
			method	: 'POST',
			body	: JSON.stringify({newOption}),
			headers	: {	'Content-Type': 'application/json'}
		})
		.then(res => checkAPIResponse(res))
		.then( result => {
			const optionName = "added" + this.props.name;

			if(result[optionName].affectedRows && result[optionName].affectedRows > 0) {

				this.setState({
					newOptionsSaveStatus	 : <span className='blink'>SAVED "{newOption}"!</span>,
					savedOptions			: newOption,
					newOptionsName				: ""
				});

				this.getOptions();

				setTimeout(() => {
					this.setState({
						newOptionsSaveStatus : null
					});
				}, 5000);

			} else {
				this.setState({
					newOptionsSaveStatus : <span className='blink'>FAILED SAVING! {result[optionName].message}</span>
				})
			}
		},
		error => {
			this.setState({
				error,
				newOptionsSaveStatus : <span className='blink'>FAILED SAVING!</span>
			})
		});
	}

	handleNewOptionsSubmit(e) {
		e.preventDefault();

		this.addOptions(this.state.newOptionsName);
	}

	render() {
		const	{error, isLoaded, optionsByName, optionsById, newOptionsName, newOptionsSaveStatus} = this.state,
				demoMessage = !this.state.isAdmin && <div className="alert alert-danger">Demo Mode</div>;

		if (error) {
			return <div>Error: {error.message}</div>;
		  } else if (!isLoaded) {
			return <div>Loading...</div>;
		  } else {
			return (
				<div>
					{demoMessage}
					<div className="lists">
						{/* Form and field to save a new options */}
						<form action="POST" onSubmit={this.handleNewOptionsSubmit}>
							<input	className	= "list"
									type		= "text"
									value		= {newOptionsName}
									onChange	= {this.handleNewOptions}
									onBlur		= {this.handleNewOptionsBlur}
									placeholder	= {`Add a New ${this.props.name}`} />

							<button type="button" onClick={this.handleNewOptionsSubmit}>Add</button>
							<span className="new-list-save-status">{newOptionsSaveStatus}</span>
						</form>

						{/* Lookp through existing list of options to edit */}
						{Object.keys(optionsByName).map((key) => (
							<div key		= {key}>
								<input	className	=  {this.state.savedOptions === optionsById[optionsByName[key]].name ? this.nameLower + " saved" : this.nameLower}
										type		= "text"
										value		= {optionsById[optionsByName[key]].name}
										data-id		= {optionsByName[key]}
										data-testid	= {optionsById[optionsByName[key]].name}
										onChange	= {this.handleTextUpdate}
										onBlur		= {this.handleOptionsBlur} />
								<span className="list-save-status">{optionsById[optionsByName[key]].saveStatus}</span>

								{this.props.name === "Series" &&
									<span className="options-manage">
										[<Link	to			=	{{
																	pathname	: `/series/${optionsByName[key]}`,
																	state		: { name : optionsById[optionsByName[key]].name}
																}}
												className	= "series-manage-click"
												data-testid	= {optionsById[optionsByName[key]].name + "_manage"}>
											manage
										</Link>]
									</span>
		  						}
							</div>
						))}
					</div>
				</div>
			)
		}
	}
}