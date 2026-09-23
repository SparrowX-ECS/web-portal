import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../App';
import { customerApi } from '../api/customerApi';
import { reportingApi } from '../api/reportingApi';
import { taskApi } from '../api/taskApi';
import { billingApi } from '../api/billingApi';
import { notificationApi } from '../api/notificationApi';

describe('SparrowX Web Portal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock API health checks to return healthy
    vi.spyOn(customerApi, 'checkHealth').mockResolvedValue({ status: 'ok' });
    vi.spyOn(notificationApi, 'checkHealth').mockResolvedValue({ status: 'ok' });
    vi.spyOn(taskApi, 'checkHealth').mockResolvedValue({ status: 'ok' });
    vi.spyOn(billingApi, 'checkHealth').mockResolvedValue({ status: 'ok' });
    vi.spyOn(reportingApi, 'checkHealth').mockResolvedValue({ status: 'ok' });

    // Mock dashboard endpoints
    vi.spyOn(reportingApi, 'getSummaryReport').mockResolvedValue({
      customers: 42,
      open_tasks: 7,
      pending_invoices: 3,
    });
    vi.spyOn(notificationApi, 'listNotifications').mockResolvedValue([
      {
        id: 1,
        recipient: 'alice@example.com',
        message: 'Welcome to SparrowX!',
        channel: 'email',
        status: 'sent',
        created_at: new Date().toISOString(),
      },
    ]);
    vi.spyOn(taskApi, 'listTasks').mockResolvedValue([
      {
        id: 101,
        title: 'Initial Cluster Setup',
        description: 'Provision initial Kubernetes cluster',
        assigned_to: 'Daniel Brooks',
        status: 'IN_PROGRESS',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
    vi.spyOn(billingApi, 'listInvoices').mockResolvedValue([
      {
        id: 201,
        customer_id: 1,
        amount: '150.00',
        currency: 'USD',
        status: 'PENDING',
        created_at: new Date().toISOString(),
      },
    ]);

    // Mock customer endpoints
    vi.spyOn(customerApi, 'listCustomers').mockResolvedValue([
      {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+15551234567',
        company: 'SparrowX Labs',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  });

  it('renders application with sidebar and dashboard by default', async () => {
    render(<App />);

    // Brand and header exist
    expect(screen.getByText('SparrowX')).toBeInTheDocument();
    expect(screen.getByText('Web Portal')).toBeInTheDocument();

    // Dashboard title appears
    await waitFor(() => {
      expect(screen.getByText('Operational Overview')).toBeInTheDocument();
    });

    // Real data metrics appear
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('navigates across all sections correctly', async () => {
    render(<App />);

    // Navigate to Customers
    fireEvent.click(screen.getByRole('button', { name: /Customers/i }));
    await waitFor(() => {
      expect(screen.getByText('Add Customer')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    // Navigate to Notifications
    fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));
    await waitFor(() => {
      expect(screen.getByText('Create Notification')).toBeInTheDocument();
    });

    // Navigate to Tasks
    fireEvent.click(screen.getByRole('button', { name: /Tasks/i }));
    await waitFor(() => {
      expect(screen.getByText('Create Task')).toBeInTheDocument();
    });

    // Navigate to Billing
    fireEvent.click(screen.getByRole('button', { name: /Billing/i }));
    await waitFor(() => {
      expect(screen.getByText('Billing & Invoices')).toBeInTheDocument();
    });

    // Navigate to Reports
    vi.spyOn(reportingApi, 'getCustomerReport').mockResolvedValue({ customers: 42 });
    vi.spyOn(reportingApi, 'getTaskReport').mockResolvedValue({ open_tasks: 7 });
    vi.spyOn(reportingApi, 'getBillingReport').mockResolvedValue({ pending_invoices: 3 });

    fireEvent.click(screen.getByRole('button', { name: /Reports/i }));
    await waitFor(() => {
      expect(screen.getByText('Operational Reports & Aggregates')).toBeInTheDocument();
    });
  });

  it('displays API error message when a service is unavailable', async () => {
    vi.spyOn(customerApi, 'listCustomers').mockRejectedValue(
      new Error('Customer API service is unavailable')
    );

    render(<App />);

    // Go to customers page
    fireEvent.click(screen.getByRole('button', { name: /Customers/i }));

    await waitFor(() => {
      expect(screen.getByText(/Customer API service is unavailable/i)).toBeInTheDocument();
    });
  });

  it('validates and submits customer creation form', async () => {
    const createSpy = vi.spyOn(customerApi, 'createCustomer').mockResolvedValue({
      id: 2,
      name: 'Bob Smith',
      email: 'bob@example.com',
      phone: null,
      company: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    render(<App />);

    // Go to customers
    fireEvent.click(screen.getByRole('button', { name: /Customers/i }));

    await waitFor(() => {
      expect(screen.getByText('Add Customer')).toBeInTheDocument();
    });

    // Open add customer modal
    fireEvent.click(screen.getByText('Add Customer'));

    expect(screen.getByText('Add New Customer')).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Bob Smith' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'bob@example.com' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /^Create Customer$/i }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: null,
        company: null,
      });
    });
  });
});
