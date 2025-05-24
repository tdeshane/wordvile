import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders word games collection heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Word Games Collection/i);
  expect(headingElement).toBeInTheDocument();
});
