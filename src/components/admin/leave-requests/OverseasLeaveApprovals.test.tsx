import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OverseasLeaveApprovals from './OverseasLeaveApprovals';
import '@testing-library/jest-dom';

const queryClient = new QueryClient();

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock;

describe('OverseasLeaveApprovals Component', () => {
    it('renders without crashing and shows loading state initially', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <OverseasLeaveApprovals />
            </QueryClientProvider>
        );

        // Since we mocked fetch, it might resolve too fast. 
        // But the 'loading' state in the component is true initially.
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });
});
