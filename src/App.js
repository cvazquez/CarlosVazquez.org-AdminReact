import React from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
  } from "react-router-dom";
import Posts from './components/posts';

function handlePostsClick() {
	if(document.getElementById("posts")) document.getElementById("posts").style.display = 'grid';
}

export default function App() {
  return (
		<Router>
			<div>
				<ul>
					<li>
						<Link to="/">Home</Link>
					</li>
					<li>
						<Link to="/posts" onClick={handlePostsClick}>Posts</Link>
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
				</Switch>
			</div>
		</Router>
	);
}