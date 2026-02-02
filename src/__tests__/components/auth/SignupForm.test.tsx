import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignupForm } from '@/components/auth/SignupForm';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

global.fetch = jest.fn();

describe('SignupForm', () => {
    const mockPush = jest.fn();
    const mockRefresh = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            refresh: mockRefresh
        });
        (global.fetch as jest.Mock).mockClear();
        mockPush.mockClear();
        mockRefresh.mockClear();
    });

    it('should render signup form', () => {
        render(<SignupForm />);

        expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should show error when passwords do not match', async () => {
        render(<SignupForm />);

        const nameInput = screen.getByLabelText(/^name$/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        });

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should submit form with valid data', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, user: { id: 1, email: 'john@example.com' } })
        });

        render(<SignupForm />);

        const nameInput = screen.getByLabelText(/^name$/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123',
                    remember: false
                })
            });
        });

        expect(mockPush).toHaveBeenCalledWith('/');
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('should display error on failed signup', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Email already exists' })
        });

        render(<SignupForm />);

        const nameInput = screen.getByLabelText(/^name$/i);
        const emailInput = screen.getByLabelText(/^email$/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
        });

        expect(mockPush).not.toHaveBeenCalled();
    });
});
