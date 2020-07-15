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

export const getLinks = function getLinks() {
	return [
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
	]
}

const App = function App() {
	const links = getLinks();

  return (
			<Router>
				<ul className="header" data-testid="header">
					{links.map(link => (
						<li key={link.text}>
							<Link	to			= {link.path}
									data-testid	= {link.text}>{link.text}</Link>
						</li>
					))}
				</ul>

				<Switch>
					<Route exact path="/">
					</Route>
					<Route exact path="/posts">
						<Posts />
					</Route>
					<Route exact	path		= "/posts/edit/:id"
									component	= {Edit} />
					<Route path="/posts/add">
						<Edit />
					</Route>
					<Route path="/categories">
						<Categories />
					</Route>
					<Route exact path="/series">
						<Series />
					</Route>
					<Route exact	path		= "/series/:id"
									component	= {SeriesManager} />
				</Switch>
			</Router>
	);
}

export default App;