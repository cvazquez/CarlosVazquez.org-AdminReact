import React from 'react';
import { render, cleanup } from '@testing-library/react';
import SeriesManager from '../series_manager';

afterEach(cleanup)

it('should take a snapshot', async () => {
	const { asFragment } = render(<SeriesManager id={1} />)

	expect(asFragment(await <SeriesManager id={1} />)).toMatchSnapshot()
})

it('renders without crashing', () => {
	render(<SeriesManager id = {1} />, <div />);
});

it('should return true when requesting list of series posts', ()=> {
	const	seriesManager = new SeriesManager({props	: {
															match	: 	{
																			params	: 	{
																							id : 1
																						}
																		}
															}
												});

 	return expect(seriesManager.getSeriesPostsById(1)).resolves.toBe(true);
}, 20000)