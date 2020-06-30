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


export default function App() {
  return (
		<Router>
			<div>
				<ul className="header">
					<li>
						<Link to="/">Home</Link>
					</li>
					<li>
						<Link to="/posts">Posts</Link>
					</li>
					<li>
						<Link to="/posts/add">Add</Link>
					</li>
					<li>
						<Link to="/categories">Categories</Link>
					</li>
					<li>
						<Link to="/series">Series</Link>
					</li>
				</ul>

				<hr />

				<Switch>
					<Route exact path="/">
					</Route>
					<Route exact path="/posts">
						<Posts />
					</Route>
					<Route exact	path="/posts/edit/:id"
									component={Edit} />
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
			</div>
		</Router>
	);
}