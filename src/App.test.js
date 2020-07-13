import React from 'react';
import { render } from '@testing-library/react';
import App, {getLinks} from './App';


it('renders without crashing', () => {
	render(<App />, <div />);
  });

test('Has Home Text', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Home/);
  expect(linkElement).toBeInTheDocument();
});

test('Has Post Text', () => {
	const { getByText } = render(<App />);
	const linkElement = getByText(/Post/);
	expect(linkElement).toBeInTheDocument();
  });

  test('Links should match', () => {
	const obj = getLinks();

	expect(obj).toEqual(
	  expect.objectContaining([{
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
		}])
	);
  });