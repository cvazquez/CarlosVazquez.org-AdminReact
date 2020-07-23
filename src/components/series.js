import React from "react";
import { Link } from 'react-router-dom'
import { checkAPIResponse } from '../helpers/api'

export default class Series extends React.Component {
	constructor(props) {
		super(props);

		// Solves a Jest error
		this._isMounted = false;

		this.state = {
			// componentDidMount api async call results
			error				: null,
			isLoaded			: false,

			// Series list to display and edit
			series			: [],
			seriesByName	: {},
			seriesById		: {},

			// new series field
			newSeriesName			: "",

			// Toggles update alert className of existing series
			savedSeries		: null,

			// Toggles update alert className of new series
			newSeriesSaveStatus : null
		};

		this.seriesById = []; // use for before and after state comparisons when saving

		this.handleTextUpdate		= this.handleTextUpdate.bind(this);
		this.handleSeriesBlur		= this.handleSeriesBlur.bind(this);
		this.handleNewSeries		= this.handleNewSeries.bind(this);
		this.handleNewSeriesSubmit	= this.handleNewSeriesSubmit.bind(this);
	}

	// Request series to display and edit
	getSeries() {
		fetch(`${process.env.REACT_APP_API_URL}/getSeries`)
			.then(res => checkAPIResponse(res))
			.then(
				result => {

					if(result.series && Array.isArray(result.series)) {
						const 	seriesByName	= {},
								seriesById		= {};

						result.series.forEach(item => {
							// Get a series id by name
							seriesByName[item.name] = item.id;

							// Stores initial state of series id's name value, for comparison when value updates are made
							this.seriesById[item.id] = item.name;

							// Stores initial state of series id's name value, for comparison when value updates are made
							seriesById[item.id] = {
								name		: item.name,
								saveStatus	: null}; // don't change case. Displays in series search overlay results
						});

						this._isMounted && this.setState({
							isLoaded		: true,
							series			: result.series,
							seriesByName	: seriesByName,
							seriesById		: seriesById
						});

					} else {
						throw(new Error("getSeries() fetch missing series array"));
					}
				},
				error => {
					this._isMounted && this.setState({
						isLoaded	: false,
						error
					});

					throw(new Error("getSeries Error: ", error));
				}
			).catch(error => {
				this.setState({
					error
				});

				console.error("API Request Series Fetch Error:", error);
			})
	}

	componentDidMount() {
		// API call to get list of series to display and edit
		this._isMounted = true;
		this._isMounted && this.getSeries();
	}

	componentWillUnmount() {
		this._isMounted = false;
	 }

	handleTextUpdate(e) {
		const	id			= e.currentTarget.dataset.id,
				seriesById	= this.state.seriesById;

		seriesById[id].name = e.target.value;

		this.setState({
			seriesById
		})
	}

	// If a series is updated, post update to API to save to DB
	updateSeries(seriesById, id, name) {
		fetch(`${process.env.REACT_APP_API_URL}/updateSeries`, {
			method	: 'POST',
			body	: JSON.stringify({id,name}),
			headers	: {	'Content-Type': 'application/json'}
		})
		.then(res => checkAPIResponse(res))
		.then( result => {
			if(result.affectedRows && result.affectedRows > 0) {

				seriesById[id].saveStatus = <span className='blink'>{name.trim().length ? "SAVED" : "Deactivated"}!</span>;
				this.seriesById[id] = name;

				this.setState({
					seriesById
				});

				setTimeout(() => {
					seriesById[id].saveStatus = null;

					this.setState({
						seriesById
					});
				}, 5000)
			} else {
				seriesById[id].saveStatus = <span className='blink'>FAILED SAVING!</span>;

				this.setState({
					seriesById
				})
			}
		},
		error => {
			seriesById[id].saveStatus = <span className='blink'>FAILED SAVING!</span>;

			this.setState({
				error,
				seriesById
			})
		});
	}

	handleSeriesBlur(e) {
		// A blanked out series will deactivate it
		const	id		= e.currentTarget.dataset.id,
				name	= e.target.value;

		if(this.seriesById[id] === name) return;

		this.updateSeries(this.state.seriesById, id, name)
	}

	handleNewSeries(e) {
		this.setState({
			newSeriesName : e.target.value
		});
	}

	addSeries(newSeriesName) {
		fetch(`${process.env.REACT_APP_API_URL}/addSeries`, {
			method	: 'POST',
			body	: JSON.stringify({newSeries : newSeriesName}),
			headers	: {	'Content-Type': 'application/json'}
		})
		.then(res => checkAPIResponse(res))
		.then( result => {
			if(result.addSeries.affectedRows && result.addSeries.affectedRows > 0) {

				this.setState({
					newSeriesSaveStatus	 : <span className='blink'>SAVED "{newSeriesName}"!</span>,
					savedSeries			: newSeriesName,
					newSeriesName				: ""
				});

				this.getSeries();

				setTimeout(() => {
					this.setState({
						newSeriesSaveStatus : null
					});
				}, 5000);

			} else {
				this.setState({
					newSeriesSaveStatus : <span className='blink'>FAILED SAVING! {result.addSeries.message}</span>
				})
			}
		},
		error => {
			this.setState({
				error,
				newSeriesSaveStatus : <span className='blink'>FAILED SAVING!</span>
			})
		});
	}

	handleNewSeriesSubmit(e) {
		e.preventDefault();

		this.addSeries(this.state.newSeriesName);
	}

	render() {
		const {error, isLoaded, seriesByName, seriesById, newSeriesName, newSeriesSaveStatus} = this.state;

		if (error) {
			return <div>Error: {error.message}</div>;
		  } else if (!isLoaded) {
			return <div>Loading...</div>;
		  } else {
			return (
				<div>
					<div className="lists">
						{/* Form and field to save a new series */}
						<form action="POST" onSubmit={this.handleNewSeriesSubmit}>
							<input	className	= "list"
									type		= "text"
									value		= {newSeriesName}
									onChange	= {this.handleNewSeries}
									onBlur		= {this.handleNewSeriesBlur}
									placeholder	= "Add a New Series" />

							<button type="button" onClick={this.handleNewSeriesSubmit}>Add</button>
							<span className="new-list-save-status">{newSeriesSaveStatus}</span>
						</form>

						{/* Lookp through existing list of series to edit */}
						{Object.keys(seriesByName).map((key) => (
							<div key		= {key}>
								<input	className	=  {this.state.savedSeries === seriesById[seriesByName[key]].name ? "series saved" : "series"}
										type		= "text"
										value		= {seriesById[seriesByName[key]].name}
										data-id		= {seriesByName[key]}
										data-testid	= {seriesById[seriesByName[key]].name}
										onChange	= {this.handleTextUpdate}
										onBlur		= {this.handleSeriesBlur} />
								<span className="list-save-status">{seriesById[seriesByName[key]].saveStatus}</span>
								<span className="series-manage">
									[<Link	to			=	{{
																pathname	: `/series/${seriesByName[key]}`,
																state		: { name : seriesById[seriesByName[key]].name}
															}}
											className	= "series-manage-click"
											data-testid	= {seriesById[seriesByName[key]].name + "_manage"}>
										manage
									</Link>]
								</span>
							</div>
						))}
					</div>
				</div>
			)
		}
	}
}
