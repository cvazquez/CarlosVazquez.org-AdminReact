import React from 'react';
import { render, cleanup } from '@testing-library/react';
import Posts from '../posts';

afterEach(cleanup)

/* it('should take a snapshot', async () => {
	const { asFragment } = render(<Posts />)

	expect(asFragment(await <Posts />)).toMatchSnapshot()
}) */


it('renders without crashing', () => {
	render(<Posts />, <div />);
});