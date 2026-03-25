import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OverseasLeaveApprovals from './OverseasLeaveApprovals';
import '@testing-library/jest-dom';

const queryClient = new QueryClient();

describe('OverseasLeaveApprovals Component', () => {
    it('renders without crashing and shows loading state initially', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <OverseasLeaveApprovals />
            </QueryClientProvider>
        );

        // Tests React Query's loading state
        expect(screen.getByText(/Loading requests with React Query.../i)).toBeInTheDocument();
    });
});
