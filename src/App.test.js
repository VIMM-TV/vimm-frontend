import { render, screen } from '@testing-library/react';
import App from './App';

test('renders VIMM application', () => {
  render(<App />);
  const logoElement = screen.getByText(/VIMM/i);
  expect(logoElement).toBeInTheDocument();
});
