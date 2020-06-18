import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('Has Home Text', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Home/i);
  expect(linkElement).toBeInTheDocument();
});

test('Has Post Text', () => {
	const { getByText } = render(<App />);
	const linkElement = getByText(/Post/i);
	expect(linkElement).toBeInTheDocument();
  });
