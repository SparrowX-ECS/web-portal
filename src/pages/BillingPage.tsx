import React, { useEffect, useState, useCallback } from 'react';
import type { InvoiceRead, InvoiceCreate, InvoiceStatus } from '../types/billing';
import { billingApi } from '../api/billingApi';
import {
  PlusIcon,
  RefreshIcon,
  EyeIcon,
  AlertIcon,
  CheckIcon,
  CloseIcon,
} from '../components/common/Icons';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

const INVOICE_STATUS_OPTIONS: InvoiceStatus[] = ['PENDING', 'PAID', 'CANCELLED'];

export const BillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRead | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await billingApi.listInvoices({
        status: statusFilter || null,
      });
      setInvoices(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load invoices';
      setError(msg);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const openCreateModal = () => {
    setCustomerId('');
    setAmount('');
    setCurrency('USD');
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openViewModal = (inv: InvoiceRead) => {
    setSelectedInvoice(inv);
    setIsViewOpen(true);
  };

  const openPayModal = (inv: InvoiceRead) => {
    setSelectedInvoice(inv);
    setFormError(null);
    setIsPayOpen(true);
  };

  const openCancelModal = (inv: InvoiceRead) => {
    setSelectedInvoice(inv);
    setFormError(null);
    setIsCancelOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const custIdNum = parseInt(customerId, 10);
    const parsedAmount = parseFloat(amount);

    if (isNaN(custIdNum) || custIdNum <= 0) {
      setFormError('Customer ID must be a positive integer.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Amount must be a positive number.');
      return;
    }
    if (!currency || currency.length !== 3) {
      setFormError('Currency must be a 3-letter code (e.g. USD).');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      const payload: InvoiceCreate = {
        customer_id: custIdNum,
        amount: parsedAmount.toFixed(2),
        currency: currency.toUpperCase(),
      };
      await billingApi.createInvoice(payload);
      setIsCreateOpen(false);
      loadInvoices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create invoice';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handlePayConfirm = async () => {
    if (!selectedInvoice) return;
    setFormLoading(true);
    setFormError(null);
    try {
      await billingApi.payInvoice(selectedInvoice.id);
      setIsPayOpen(false);
      loadInvoices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to pay invoice';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!selectedInvoice) return;
    setFormLoading(true);
    setFormError(null);
    try {
      await billingApi.cancelInvoice(selectedInvoice.id);
      setIsCancelOpen(false);
      loadInvoices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel invoice';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Billing & Invoices</h2>
          <p className="page-description">Customer invoices & payment status managed by Sophie Wilson (Finance Platform Team)</p>
        </div>
        <Button icon={<PlusIcon />} onClick={openCreateModal}>
          Create Invoice
        </Button>
      </div>

      <div className="toolbar">
        <div className="filters-group">
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | '')}
            aria-label="Filter by invoice status"
          >
            <option value="">All Statuses</option>
            {INVOICE_STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {statusFilter && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setStatusFilter('')}
            >
              Reset Filter
            </Button>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshIcon size={14} />}
          onClick={loadInvoices}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadInvoices} />}

      <Card>
        {loading ? (
          <LoadingSpinner message="Loading invoices..." />
        ) : invoices.length === 0 ? (
          <EmptyState
            title="No invoices found"
            description={
              statusFilter
                ? `No invoices match status filter "${statusFilter}".`
                : 'There are currently no customer invoices recorded.'
            }
            action={
              !statusFilter ? (
                <Button icon={<PlusIcon />} onClick={openCreateModal}>
                  Create First Invoice
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Customer ID</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Status</th>
                  <th>Date Issued</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>#{inv.id}</td>
                    <td style={{ fontWeight: 500 }}>Customer #{inv.customer_id}</td>
                    <td style={{ fontWeight: 600 }}>{inv.amount}</td>
                    <td>{inv.currency}</td>
                    <td>
                      <Badge status={inv.status}>{inv.status}</Badge>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="View Invoice Details"
                          onClick={() => openViewModal(inv)}
                          aria-label={`View invoice #${inv.id}`}
                        >
                          <EyeIcon />
                        </button>

                        {inv.status === 'PENDING' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              icon={<CheckIcon size={12} />}
                              onClick={() => openPayModal(inv)}
                            >
                              Pay
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={<CloseIcon size={12} />}
                              onClick={() => openCancelModal(inv)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Customer Invoice"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-invoice-form"
              loading={formLoading}
            >
              Issue Invoice
            </Button>
          </>
        }
      >
        <form id="create-invoice-form" onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {formError && (
            <div className="alert alert-danger" style={{ padding: 10 }}>
              <AlertIcon size={14} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="inv-cust-id">
              Customer ID <span className="required">*</span>
            </label>
            <input
              id="inv-cust-id"
              type="number"
              min="1"
              step="1"
              className="input"
              required
              placeholder="e.g. 1"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="inv-amount">
              Amount <span className="required">*</span>
            </label>
            <input
              id="inv-amount"
              type="number"
              min="0.01"
              step="0.01"
              className="input"
              required
              placeholder="e.g. 125.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="inv-currency">
              Currency Code (ISO-3) <span className="required">*</span>
            </label>
            <input
              id="inv-currency"
              type="text"
              className="input"
              required
              maxLength={3}
              minLength={3}
              placeholder="USD"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            />
          </div>
        </form>
      </Modal>

      {/* View Invoice Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Invoice #${selectedInvoice?.id}`}
        footer={
          <Button variant="secondary" onClick={() => setIsViewOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedInvoice && (
          <div className="detail-grid">
            <span className="detail-label">Invoice ID</span>
            <span className="detail-value">#{selectedInvoice.id}</span>

            <span className="detail-label">Customer ID</span>
            <span className="detail-value">#{selectedInvoice.customer_id}</span>

            <span className="detail-label">Total Amount</span>
            <span className="detail-value" style={{ fontWeight: 700, fontSize: 16 }}>
              {selectedInvoice.amount} {selectedInvoice.currency}
            </span>

            <span className="detail-label">Payment Status</span>
            <span className="detail-value">
              <Badge status={selectedInvoice.status}>{selectedInvoice.status}</Badge>
            </span>

            <span className="detail-label">Date Issued</span>
            <span className="detail-value">{new Date(selectedInvoice.created_at).toLocaleString()}</span>
          </div>
        )}
      </Modal>

      {/* Pay Confirmation Modal */}
      <Modal
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
        title={`Confirm Payment: Invoice #${selectedInvoice?.id}`}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPayOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              onClick={handlePayConfirm}
              loading={formLoading}
              icon={<CheckIcon />}
            >
              Mark as Paid
            </Button>
          </>
        }
      >
        {formError && (
          <div className="alert alert-danger" style={{ marginBottom: 14 }}>
            <span>{formError}</span>
          </div>
        )}
        <p>
          Mark invoice <strong>#{selectedInvoice?.id}</strong> for{' '}
          <strong>
            {selectedInvoice?.amount} {selectedInvoice?.currency}
          </strong>{' '}
          (Customer #{selectedInvoice?.customer_id}) as <strong>PAID</strong>?
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
          This operation transitions the invoice status from PENDING to PAID. This state change is permanent.
        </p>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title={`Confirm Cancellation: Invoice #${selectedInvoice?.id}`}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCancelOpen(false)}
              disabled={formLoading}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleCancelConfirm}
              loading={formLoading}
            >
              Cancel Invoice
            </Button>
          </>
        }
      >
        {formError && (
          <div className="alert alert-danger" style={{ marginBottom: 14 }}>
            <span>{formError}</span>
          </div>
        )}
        <p>
          Are you sure you want to cancel invoice <strong>#{selectedInvoice?.id}</strong>?
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
          Once cancelled, an invoice cannot be paid or reactivated.
        </p>
      </Modal>
    </>
  );
};
