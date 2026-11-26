import { render, screen } from '@testing-library/react';
import App from './App.jsx';

describe('App', () => {
  it('renders RailBite heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'RailBite' })).toBeInTheDocument();
  });
});
