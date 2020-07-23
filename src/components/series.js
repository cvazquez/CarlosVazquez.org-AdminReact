import React from "react";
import { Link } from 'react-router-dom'
import { checkAPIResponse } from '../helpers/api'

export default class Series extends React.Component {
	constructor(props) {
		super(props);

		this._isMounted = false;

		this.state = {
			error				: null,
			isLoaded			: false,
			series			: [],
			seriesByName	: {},
			seriesById		: {},
			newSeries			: "",
			savedSeries		: null,
			newSeriesSaveStatus : null
		};

		this.seriesById = []; // use for before and after state comparisons when saving

		this.handleTextUpdate		= this.handleTextUpdate.bind(this);
		this.handleSeriesBlur		= this.handleSeriesBlur.bind(this);
		this.handleNewSeries		= this.handleNewSeries.bind(this);
		this.handleNewSeriesSubmit	= this.handleNewSeriesSubmit.bind(this);
	}

	getSeries() {
		fetch(`${process.env.REACT_APP_API_URL}/getSeries`)
			.then(res => checkAPIResponse(res))
			.then(
				result => {
					const 	seriesByName	= {},
							seriesById		= {};

					result.series.forEach(item => {
						seriesByName[item.name] = item.id;
						this.seriesById[item.id] = item.name;

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
				},
				error => {
					this._isMounted && this.setState({
						isLoaded	: false,
						error
					})
				}
			)
	}

	componentDidMount() {
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

	handleSeriesBlur(e) {
		// A blanked out series will deactivate it
		const	id		= e.currentTarget.dataset.id,
				name	= e.target.value;

		let seriesById = this.state.seriesById;

		if(this.seriesById[id] === name) return;

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

	handleNewSeries(e) {
		this.setState({
			newSeries : e.target.value
		});
	}

	handleNewSeriesSubmit(e) {
		e.preventDefault();

		fetch(`${process.env.REACT_APP_API_URL}/addSeries`, {
			method	: 'POST',
			body	: JSON.stringify({newSeries : this.state.newSeries}),
			headers	: {	'Content-Type': 'application/json'}
		})
		.then(res => checkAPIResponse(res))
		.then( result => {
			if(result.addSeries.affectedRows && result.addSeries.affectedRows > 0) {

				this.setState({
					newSeriesSaveStatus	 : <span className='blink'>SAVED "{this.state.newSeries}"!</span>,
					savedSeries			: this.state.newSeries,
					newSeries				: ""
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

	render() {
		const {error, isLoaded, seriesByName, seriesById, newSeries, newSeriesSaveStatus} = this.state;

		if (error) {
			return <div>Error: {error.message}</div>;
		  } else if (!isLoaded) {
			return <div>Loading...</div>;
		  } else {
			return (
				<div>
					<div className="lists">
						<form action="POST" onSubmit={this.handleNewSeriesSubmit}>
							<input	className	= "list"
									type		= "text"
									value		= {newSeries}
									onChange	= {this.handleNewSeries}
									onBlur		= {this.handleNewSeriesBlur}
									placeholder	= "Add a New Series" />

							<button type="button" onClick={this.handleNewSeriesSubmit}>Add</button>
							<span className="new-list-save-status">{newSeriesSaveStatus}</span>
						</form>

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
