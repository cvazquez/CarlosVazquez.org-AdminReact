import React from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link
  } from "react-router-dom";
import Posts from './components/posts';
import Edit from './components/edit';
import SelectOptions from './components/select_options';
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
				<Routes>
					{/* Exact paths keep each sub folder from overriding parent path */}
					<Route exact	path		= "/"
									element		= "" />
					<Route exact	path		= "/posts"
									element		= {<Posts />} />
					<Route 			path		= "/posts/edit/:id"
									element		= {<Edit />} />
					<Route 			path		= "/posts/add"
									element		= {<Edit />} />
					<Route 			path		= "/categories"
									element		= {
										<SelectOptions	name		= "Category"
														namePlural 	= "Categories"
										/>
									}
					/>
					<Route exact 	path		= "/series"
									element		= {
										<SelectOptions	name		= "Series"
														namePlural	= "Series"
										/>
									}
					/>
					<Route 			path		= "/series/:id"
									element		= {<SeriesManager />} />
				</Routes>
			</Router>
;

export default App;
export {getNavLinks as getLinks } // For testing