import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from '@testing-library/react';
import App, {getLinks} from './App';
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'

afterEach(cleanup)

it('renders without crashing', () => {
	render(<App />, <div />);
});



it('should take a snapshot', () => {
	const { asFragment } = render(<App />)

	expect(asFragment(<App />)).toMatchSnapshot()
})

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


	const renderWithRouter = (component) => {
		const history = createMemoryHistory()
			return {
				...render (
					<Router history={history}>
					{component}
					</Router>
				)
			}
	}

	it('should render the home page', () => {

		const { container, getByTestId } = renderWithRouter(<App />)
		const navbar = getByTestId('header')
		const link = getByTestId('Posts')

		expect(container.innerHTML).toMatch('Home')
		expect(navbar).toContainElement(link)
	})

	it('should navigate to the posts page', ()=> {
		const { container, getByTestId } = renderWithRouter(<App />)

		fireEvent.click(getByTestId('Posts'))

		expect(container.innerHTML).toMatch('Loading...')
	})

	it('should navigate to the posts page resolved', async () => {
		const { getByText , getByTestId } = renderWithRouter(<App />)

		fireEvent.click(getByTestId('Posts'))

		const posts = await waitForElement(() => getByText("Title"))

		expect(posts).toHaveTextContent('Title')
	})

	// /categories
	it('should navigate to the categories page with the params', async ()=> {
		const { getByTestId } = renderWithRouter(<App />)

		fireEvent.click(getByTestId('Categories'))

		const posts = await waitForElement(() => getByTestId("About Me"))

		expect(posts).toHaveClass('category')
		//expect(posts).toHaveClass('value', expect.stringContaining('About'))
	})