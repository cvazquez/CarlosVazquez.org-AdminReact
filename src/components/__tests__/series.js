import React from 'react';
import { render, cleanup } from '@testing-library/react';
import Series from '../series';

afterEach(cleanup)

/* it('should take a snapshot', async () => {
	const { asFragment } = render(<Posts />)

	expect(asFragment(await <Posts />)).toMatchSnapshot()
}) */


it('renders without crashing', () => {
	render(<Series />, <div />);
});