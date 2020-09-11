import React from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
  } from "react-router-dom";
import Posts from './components/posts';
import Edit from './components/edit';
import Categories from './components/categories'
import Series from './components/series'
import SeriesManager from './components/series_manager'

// Create an array of nav link objects, to loop over and display in nav bar at top of page
const getNavLinks = () => [
		{
			path	: "/",
			text	: "Home"
		},
		{
			path	: "/posts",
			text	: "Posts"
		},
		{
			path	: "/posts/add",
			text	: "Add"
		},
		{
			path	: "/categories",
			text	: "Categories"
		},
		{
			path	: "/series",
			text	: "Series"
		},
	],

	getNavHeader = () =>
		<ul className="header" data-testid="header">
		{	// Loop through nav links and display at top of page
			getNavLinks().map(link =>
				<li key={link.text}>
					<Link	to			= {link.path}
							data-testid	= {link.text}>
						{link.text}
					</Link>
				</li>
			)
		}
		</ul>
,

// Displays our nav links and controls routes from links
	App = () =>
			<Router>
				{getNavHeader()}

				{/* React Router controlls paths from nav link clicks */}
				<Switch>
					{/* Exact paths keep each sub folder from overriding parent path */}
					<Route exact	path		= "/" />
					<Route exact	path		= "/posts"
									component	= {Posts} />
					<Route 			path		= "/posts/edit/:id"
									component	= {Edit} />
					<Route 			path		= "/posts/add"
									component	= {Edit} />
					<Route 			path		= "/categories"
									component	= {Categories} />
					<Route exact 	path		= "/series"
									component	= {Series} />
					<Route 			path		= "/series/:id"
									component	= {SeriesManager} />
				</Switch>
			</Router>
;

export default App;
export {getNavLinks as getLinks } // For testing