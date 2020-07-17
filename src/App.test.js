/*
	TODO :
		* Simulate Updated Post
		* Simulate New Post
*/

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

	// /posts
	it('should navigate to the posts page loading', ()=> {
		const { container, getByTestId } = renderWithRouter(<App />)

		fireEvent.click(getByTestId('Posts'))

		expect(container.innerHTML).toMatch('Loading...')
	})

	it('should navigate to the posts page loaded', async () => {
		const { getByText , getByTestId } = renderWithRouter(<App />)

		fireEvent.click(getByTestId('Posts'))

		const posts = await waitForElement(() => getByText("Title"))

		expect(posts).toHaveTextContent('Title')
	})

	// /posts/add
	it('should navigate to the add page loading', ()=> {
		const { container, getByTestId } = renderWithRouter(<App />)

		fireEvent.click(getByTestId('Add'))

		expect(container.innerHTML).toMatch('Loading...')
	})

	it('should navigate to the add page loaded', async () => {
		const { getByTestId } = renderWithRouter(<App />)

		fireEvent.click(getByTestId('Add'))

		const add = await waitForElement(() => getByTestId("Save"))

		expect(add).toHaveAttribute('type', 'submit')
	})

	// /posts/edit
	it('should navigate to the edit page loading', async ()=> {
		const { container, getByTestId, getByText } = renderWithRouter(<App />)

		fireEvent.click(getByTestId('Posts'))

		await waitForElement(() => getByText("Title"))

		fireEvent.click(getByTestId('38'))

		expect(container.innerHTML).toMatch('Loading...')
	})

	it('should navigate to the edit page loaded', async ()=> {
		const { getByTestId, getByText } = renderWithRouter(<App />)

		fireEvent.click(getByTestId('Posts'))

		await waitForElement(() => getByText("Title"))

		fireEvent.click(getByTestId('38'))

		const edit = await waitForElement(() => getByTestId("Save"))

		expect(edit).toHaveAttribute('type', 'submit')
	})

	// /categories
	it('should navigate to the categories page loading', ()=> {
		const { container, getByTestId } = renderWithRouter(<App />)

		fireEvent.click(getByTestId('Categories'))

		expect(container.innerHTML).toMatch('Loading...')
	})

	it('should navigate to the categories page loaded', async ()=> {
		const { getByTestId } = renderWithRouter(<App />)

		fireEvent.click(getByTestId('Categories'))

		const posts = await waitForElement(() => getByTestId("About Me"))

		expect(posts).toHaveClass('category')
	})

	// /series
	it('should navigate to the series page loading', ()=> {
		const { container, getByTestId } = renderWithRouter(<App />)

		fireEvent.click(getByTestId('Series'))

		expect(container.innerHTML).toMatch('Loading...')
	})

	it('should navigate to the series page loaded', async ()=> {
		const { getByTestId } = renderWithRouter(<App />)

		fireEvent.click(getByTestId('Series'))

		const	series			= await waitForElement(() => getByTestId("Patagonia")),
				seriesManage	= getByTestId("Patagonia_manage");

		expect(series).toHaveClass('series')
		expect(seriesManage).toHaveClass('series-manage-click')
	})