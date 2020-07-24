import React from 'react';
import { render, cleanup } from '@testing-library/react';
import Categories from '../categories';

afterEach(cleanup)

it('should take a snapshot', async () => {
	const { asFragment } = render(<Categories />)

	expect(asFragment(await <Categories />)).toMatchSnapshot()
})

it('renders without crashing', () => {
	render(<Categories />, <div />);
});

test('should return true when requesting list of categories', ()=> {
	const	categories = new Categories();

 	return expect(categories.getCategories()).resolves.toBe(true);
}, 20000)