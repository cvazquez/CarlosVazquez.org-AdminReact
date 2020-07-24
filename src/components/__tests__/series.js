import React from 'react';
import { render, cleanup } from '@testing-library/react';
import Series from '../series';

afterEach(cleanup)

it('should take a snapshot', async () => {
	const { asFragment } = render(<Series />)

	expect(asFragment(await <Series />)).toMatchSnapshot()
})

it('renders without crashing', () => {
	render(<Series />, <div />);
});

test('should return true when requesting list of series', ()=> {
	const	series = new Series();

 	return expect(series.getSeries()).resolves.toBe(true);
}, 20000);