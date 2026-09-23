import React, { useEffect, useState, useCallback } from 'react';
import type {
  NotificationRead,
  NotificationCreate,
  NotificationChannel,
  NotificationStatus,
} from '../types/notification';
import { notificationApi } from '../api/notificationApi';
import {
  PlusIcon,
  RefreshIcon,
  EyeIcon,
  AlertIcon,
  CheckIcon,
} from '../components/common/Icons';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<NotificationStatus | ''>('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [selectedNotification, setSelectedNotification] = useState<NotificationRead | null>(null);
  const [targetStatus, setTargetStatus] = useState<NotificationStatus>('sent');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Create form state
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<NotificationChannel>('email');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.listNotifications({
        channel: selectedChannel || null,
        status: selectedStatus || null,
      });
      setNotifications(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(msg);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [selectedChannel, selectedStatus]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const openCreateModal = () => {
    setRecipient('');
    setMessage('');
    setChannel('email');
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openViewModal = (n: NotificationRead) => {
    setSelectedNotification(n);
    setIsViewOpen(true);
  };

  const openStatusModal = (n: NotificationRead) => {
    setSelectedNotification(n);
    setTargetStatus(n.status === 'pending' ? 'sent' : n.status);
    setFormError(null);
    setIsStatusModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !message.trim()) {
      setFormError('Recipient and message are required.');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      const payload: NotificationCreate = {
        recipient: recipient.trim(),
        message: message.trim(),
        channel,
      };
      await notificationApi.createNotification(payload);
      setIsCreateOpen(false);
      loadNotifications();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to dispatch notification';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNotification) return;

    setFormLoading(true);
    setFormError(null);
    try {
      await notificationApi.updateNotificationStatus(selectedNotification.id, {
        status: targetStatus,
      });
      setIsStatusModalOpen(false);
      loadNotifications();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update notification status';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Notifications</h2>
          <p className="page-description">Customer notification dispatch & tracking (Communications Team)</p>
        </div>
        <Button icon={<PlusIcon />} onClick={openCreateModal}>
          Create Notification
        </Button>
      </div>

      <div className="toolbar">
        <div className="filters-group">
          <select
            className="select"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value as NotificationChannel | '')}
            aria-label="Filter by channel"
          >
            <option value="">All Channels</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
          </select>

          <select
            className="select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as NotificationStatus | '')}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>

          {(selectedChannel || selectedStatus) && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedChannel('');
                setSelectedStatus('');
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshIcon size={14} />}
          onClick={loadNotifications}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadNotifications} />}

      <Card>
        {loading ? (
          <LoadingSpinner message="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications found"
            description={
              selectedChannel || selectedStatus
                ? 'No notifications match the selected channel or status filters.'
                : 'There are currently no customer notifications registered.'
            }
            action={
              !selectedChannel && !selectedStatus ? (
                <Button icon={<PlusIcon />} onClick={openCreateModal}>
                  Create First Notification
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
                  <th>Recipient</th>
                  <th>Channel</th>
                  <th>Message Snippet</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>#{n.id}</td>
                    <td style={{ fontWeight: 600 }}>{n.recipient}</td>
                    <td>
                      <Badge channel={n.channel}>{n.channel}</Badge>
                    </td>
                    <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.message}
                    </td>
                    <td>
                      <Badge status={n.status}>{n.status}</Badge>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="View Details"
                          onClick={() => openViewModal(n)}
                          aria-label={`View details of notification #${n.id}`}
                        >
                          <EyeIcon />
                        </button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openStatusModal(n)}
                        >
                          Update Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Notification Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Customer Notification"
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
              form="create-notif-form"
              loading={formLoading}
            >
              Send Notification
            </Button>
          </>
        }
      >
        <form id="create-notif-form" onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {formError && (
            <div className="alert alert-danger" style={{ padding: 10 }}>
              <AlertIcon size={14} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="notif-channel">
              Channel <span className="required">*</span>
            </label>
            <select
              id="notif-channel"
              className="select"
              value={channel}
              onChange={(e) => setChannel(e.target.value as NotificationChannel)}
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="notif-recipient">
              Recipient <span className="required">*</span>
            </label>
            <input
              id="notif-recipient"
              type="text"
              className="input"
              required
              maxLength={320}
              placeholder={channel === 'email' ? 'customer@example.com' : '+15551234567'}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="notif-message">
              Message Content <span className="required">*</span>
            </label>
            <textarea
              id="notif-message"
              className="textarea"
              required
              maxLength={10000}
              placeholder="Enter the notification message to deliver..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'flex-end' }}>
              {message.length} / 10,000 characters
            </span>
          </div>
        </form>
      </Modal>

      {/* View Notification Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Notification #${selectedNotification?.id}`}
        footer={
          <Button variant="secondary" onClick={() => setIsViewOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedNotification && (
          <div className="detail-grid">
            <span className="detail-label">ID</span>
            <span className="detail-value">#{selectedNotification.id}</span>

            <span className="detail-label">Recipient</span>
            <span className="detail-value">{selectedNotification.recipient}</span>

            <span className="detail-label">Channel</span>
            <span className="detail-value">
              <Badge channel={selectedNotification.channel}>{selectedNotification.channel}</Badge>
            </span>

            <span className="detail-label">Current Status</span>
            <span className="detail-value">
              <Badge status={selectedNotification.status}>{selectedNotification.status}</Badge>
            </span>

            <span className="detail-label">Created At</span>
            <span className="detail-value">{new Date(selectedNotification.created_at).toLocaleString()}</span>

            <span className="detail-label">Full Message</span>
            <div
              className="detail-value"
              style={{
                backgroundColor: '#f8fafc',
                padding: 12,
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: 13,
              }}
            >
              {selectedNotification.message}
            </div>
          </div>
        )}
      </Modal>

      {/* Update Notification Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Update Status for Notification #${selectedNotification?.id}`}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsStatusModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="update-notif-status-form"
              icon={<CheckIcon />}
              loading={formLoading}
            >
              Update Status
            </Button>
          </>
        }
      >
        <form id="update-notif-status-form" onSubmit={handleStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {formError && (
            <div className="alert alert-danger" style={{ padding: 10 }}>
              <AlertIcon size={14} />
              <span>{formError}</span>
            </div>
          )}

          <p style={{ fontSize: 14 }}>
            Update the lifecycle state of the notification dispatched to{' '}
            <strong>{selectedNotification?.recipient}</strong>:
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="status-select">
              New Notification Status
            </label>
            <select
              id="status-select"
              className="select"
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as NotificationStatus)}
            >
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </form>
      </Modal>
    </>
  );
};
