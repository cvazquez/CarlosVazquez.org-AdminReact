import React from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
  } from "react-router-dom";
import Posts from './components/posts';
import Categories from './components/categories'

function handlePostsClick() {
	if(document.getElementById("posts")) document.getElementById("posts").style.display = 'grid';
}

export default function App() {
  return (
		<Router>
			<div>
				<ul className="header">
					<li>
						<Link to="/">Home</Link>
					</li>
					<li>
						<Link to="/posts" onClick={handlePostsClick}>Posts</Link>
					</li>
					<li>
						<Link to="/posts/add" onClick={handlePostsClick}>Add</Link>
					</li>
					<li>
						<Link to="/categories">Categories</Link>
					</li>
				</ul>

				<hr />

				<Switch>
					<Route exact path="/">
					</Route>
					<Route exact path="/posts">
						<Posts />
					</Route>
					<Route path="/posts/edit">
						<Posts />
					</Route>
					<Route path="/posts/add">
						<Posts />
					</Route>
					<Route path="/categories">
						<Categories />
					</Route>
				</Switch>
			</div>
		</Router>
	);
}