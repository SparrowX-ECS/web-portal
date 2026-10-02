import React, { useEffect, useState, useCallback } from 'react';
import type { CustomerRead, CustomerCreate, CustomerUpdate } from '../types/customer';
import { customerApi } from '../api/customerApi';
import {
  PlusIcon,
  SearchIcon,
  RefreshIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  AlertIcon,
} from '../components/common/Icons';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRead | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  const loadCustomers = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerApi.listCustomers({ search: search?.trim() || undefined });
      setCustomers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load customers';
      setError(msg);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    loadCustomers('');
  };

  const openCreateModal = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (c: CustomerRead) => {
    setSelectedCustomer(c);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone || '');
    setCompany(c.company || '');
    setFormError(null);
    setIsEditOpen(true);
  };

  const openViewModal = (c: CustomerRead) => {
    setSelectedCustomer(c);
    setIsViewOpen(true);
  };

  const openDeleteModal = (c: CustomerRead) => {
    setSelectedCustomer(c);
    setFormError(null);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError('Name and email are required.');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      const payload: CustomerCreate = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        company: company.trim() || null,
      };
      await customerApi.createCustomer(payload);
      setIsCreateOpen(false);
      loadCustomers(searchQuery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create customer';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    if (!name.trim() || !email.trim()) {
      setFormError('Name and email are required.');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      const payload: CustomerUpdate = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        company: company.trim() || null,
      };
      await customerApi.updateCustomer(selectedCustomer.id, payload);
      setIsEditOpen(false);
      loadCustomers(searchQuery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update customer';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;
    setFormLoading(true);
    setFormError(null);
    try {
      await customerApi.deleteCustomer(selectedCustomer.id);
      setIsDeleteOpen(false);
      loadCustomers(searchQuery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete customer';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-description">Customer accounts managed by Alex Morgan (Customer Experience Team)</p>
        </div>
        <Button icon={<PlusIcon />} onClick={openCreateModal}>
          Add Customer
        </Button>
      </div>

      <div className="toolbar">
        <form onSubmit={handleSearch} className="filters-group">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search name, email, company..."
              className="input search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search customers"
            />
          </div>
          <Button type="submit" variant="secondary" icon={<SearchIcon />}>
            Search
          </Button>
          {searchQuery && (
            <Button type="button" variant="secondary" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </form>

        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshIcon size={14} />}
          onClick={() => loadCustomers(searchQuery)}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => loadCustomers(searchQuery)} />}

      <Card>
        {loading ? (
          <LoadingSpinner message="Loading customer directory..." />
        ) : customers.length === 0 ? (
          <EmptyState
            title="No customers found"
            description={
              searchQuery
                ? `No customers matched your search "${searchQuery}". Try a different keyword.`
                : 'There are currently no customer accounts recorded in the database.'
            }
            action={
              !searchQuery ? (
                <Button icon={<PlusIcon />} onClick={openCreateModal}>
                  Add Your First Customer
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>#{c.id}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>{c.company || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="View Details"
                          onClick={() => openViewModal(c)}
                          aria-label={`View details for ${c.name}`}
                        >
                          <EyeIcon />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit Customer"
                          onClick={() => openEditModal(c)}
                          aria-label={`Edit ${c.name}`}
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ color: 'var(--danger)' }}
                          title="Delete Customer"
                          onClick={() => openDeleteModal(c)}
                          aria-label={`Delete ${c.name}`}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Customer Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Customer"
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
              form="create-customer-form"
              loading={formLoading}
            >
              Create Customer
            </Button>
          </>
        }
      >
        <form id="create-customer-form" onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {formError && (
            <div className="alert alert-danger" style={{ padding: 10 }}>
              <AlertIcon size={14} />
              <span>{formError}</span>
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="create-name">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="create-name"
              type="text"
              className="input"
              required
              maxLength={100}
              placeholder="Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="create-email">
              Email Address <span className="required">*</span>
            </label>
            <input
              id="create-email"
              type="email"
              className="input"
              required
              maxLength={254}
              placeholder="alex@sparrowx.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="create-phone">
              Phone Number
            </label>
            <input
              id="create-phone"
              type="tel"
              className="input"
              maxLength={30}
              placeholder="+1 (555) 019-2834"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="create-company">
              Company
            </label>
            <input
              id="create-company"
              type="text"
              className="input"
              maxLength={150}
              placeholder="Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Customer #${selectedCustomer?.id}`}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-customer-form"
              loading={formLoading}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <form id="edit-customer-form" onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {formError && (
            <div className="alert alert-danger" style={{ padding: 10 }}>
              <AlertIcon size={14} />
              <span>{formError}</span>
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-name">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="edit-name"
              type="text"
              className="input"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-email">
              Email Address <span className="required">*</span>
            </label>
            <input
              id="edit-email"
              type="email"
              className="input"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-phone">
              Phone Number
            </label>
            <input
              id="edit-phone"
              type="tel"
              className="input"
              maxLength={30}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-company">
              Company
            </label>
            <input
              id="edit-company"
              type="text"
              className="input"
              maxLength={150}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* View Customer Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Customer Details: ${selectedCustomer?.name}`}
        footer={
          <Button variant="secondary" onClick={() => setIsViewOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedCustomer && (
          <div className="detail-grid">
            <span className="detail-label">Customer ID</span>
            <span className="detail-value">#{selectedCustomer.id}</span>

            <span className="detail-label">Full Name</span>
            <span className="detail-value">{selectedCustomer.name}</span>

            <span className="detail-label">Email</span>
            <span className="detail-value">{selectedCustomer.email}</span>

            <span className="detail-label">Phone</span>
            <span className="detail-value">{selectedCustomer.phone || 'Not provided'}</span>

            <span className="detail-label">Company</span>
            <span className="detail-value">{selectedCustomer.company || 'Not provided'}</span>

            <span className="detail-label">Created At</span>
            <span className="detail-value">{new Date(selectedCustomer.created_at).toLocaleString()}</span>

            <span className="detail-label">Last Updated</span>
            <span className="detail-value">{new Date(selectedCustomer.updated_at).toLocaleString()}</span>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Deletion"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={formLoading}
            >
              Delete Customer
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
          Are you sure you want to permanently delete customer <strong>{selectedCustomer?.name}</strong> (ID #{selectedCustomer?.id})?
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
          This action will immediately remove the customer record from the Customer API database.
        </p>
      </Modal>
    </>
  );
};
