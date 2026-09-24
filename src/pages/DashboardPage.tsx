import React, { useEffect, useState, useCallback } from 'react';
import type { NavSection } from '../types/common';
import type { SummaryReport } from '../types/reporting';
import type { NotificationRead } from '../types/notification';
import type { TaskRead } from '../types/task';
import type { InvoiceRead } from '../types/billing';
import { reportingApi } from '../api/reportingApi';
import { notificationApi } from '../api/notificationApi';
import { taskApi } from '../api/taskApi';
import { billingApi } from '../api/billingApi';
import {
  CustomersIcon,
  TasksIcon,
  BillingIcon,
  NotificationsIcon,
  RefreshIcon,
  AlertIcon,
} from '../components/common/Icons';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface DashboardPageProps {
  onNavigate: (section: NavSection) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationRead[]>([]);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);

  const [recentTasks, setRecentTasks] = useState<TaskRead[]>([]);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const [recentInvoices, setRecentInvoices] = useState<InvoiceRead[]>([]);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setSummaryError(null);
    setNotificationsError(null);
    setTasksError(null);
    setInvoicesError(null);

    // 1. Fetch Reporting API summary
    try {
      const summaryData = await reportingApi.getSummaryReport();
      setSummary(summaryData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load reporting summary';
      setSummaryError(msg);
      setSummary(null);
    }

    // 2. Fetch Notifications (recent)
    try {
      const notifs = await notificationApi.listNotifications();
      setNotifications(notifs.slice(0, 5));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load notifications';
      setNotificationsError(msg);
      setNotifications([]);
    }

    // 3. Fetch Recent Tasks
    try {
      const tasks = await taskApi.listTasks({ limit: 5 });
      setRecentTasks(tasks);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load tasks';
      setTasksError(msg);
      setRecentTasks([]);
    }

    // 4. Fetch Recent Invoices
    try {
      const invoices = await billingApi.listInvoices({ limit: 5 });
      setRecentInvoices(invoices);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load invoices';
      setInvoicesError(msg);
      setRecentInvoices([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return <LoadingSpinner message="Loading SparrowX dashboard data..." />;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Operational Overview</h2>
          <p className="page-description">Live metrics aggregated across SparrowX backend services</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshIcon size={14} />}
          onClick={loadDashboardData}
        >
          Refresh Data
        </Button>
      </div>

      {/* Metrics Cards Grid from Reporting API */}
      <div className="metrics-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Customers</span>
            <div className="stat-icon">
              <CustomersIcon size={20} />
            </div>
          </div>
          <div className="stat-value">
            {summary ? summary.customers : '—'}
          </div>
          <div className="stat-subtext">
            {summaryError ? (
              <span style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <AlertIcon size={12} /> Reporting API unavailable
              </span>
            ) : (
              'Via Reporting API (/api/reporting/summary)'
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Open Tasks</span>
            <div className="stat-icon" style={{ color: 'var(--warning)', backgroundColor: 'var(--warning-light)' }}>
              <TasksIcon size={20} />
            </div>
          </div>
          <div className="stat-value">
            {summary ? summary.open_tasks : '—'}
          </div>
          <div className="stat-subtext">
            {summaryError ? (
              <span style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <AlertIcon size={12} /> Reporting API unavailable
              </span>
            ) : (
              'Status TODO or IN_PROGRESS'
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Pending Invoices</span>
            <div className="stat-icon" style={{ color: 'var(--info)', backgroundColor: 'var(--info-light)' }}>
              <BillingIcon size={20} />
            </div>
          </div>
          <div className="stat-value">
            {summary ? summary.pending_invoices : '—'}
          </div>
          <div className="stat-subtext">
            {summaryError ? (
              <span style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <AlertIcon size={12} /> Reporting API unavailable
              </span>
            ) : (
              'Invoices awaiting payment'
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Recent Notifications</span>
            <div className="stat-icon" style={{ color: 'var(--success)', backgroundColor: 'var(--success-light)' }}>
              <NotificationsIcon size={20} />
            </div>
          </div>
          <div className="stat-value">
            {notificationsError ? '—' : notifications.length}
          </div>
          <div className="stat-subtext">
            {notificationsError ? (
              <span style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <AlertIcon size={12} /> Notification API unavailable
              </span>
            ) : (
              'Tracked customer alerts'
            )}
          </div>
        </div>
      </div>

      {summaryError && (
        <div className="alert alert-warning">
          <AlertIcon style={{ flexShrink: 0 }} />
          <div>
            <strong>Reporting Service Notice:</strong> {summaryError}
          </div>
        </div>
      )}

      {/* Activity Tables Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Recent Tasks */}
        <Card
          title="Recent Tasks"
          action={
            <Button variant="secondary" size="sm" onClick={() => onNavigate('tasks')}>
              View All Tasks
            </Button>
          }
        >
          {tasksError ? (
            <div className="alert alert-danger" style={{ margin: 0 }}>
              <span>{tasksError}</span>
            </div>
          ) : recentTasks.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No tasks found.</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 500 }}>{t.title}</td>
                      <td>{t.assigned_to || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                      <td>
                        <Badge status={t.status}>{t.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Recent Invoices */}
        <Card
          title="Recent Invoices"
          action={
            <Button variant="secondary" size="sm" onClick={() => onNavigate('billing')}>
              View All Invoices
            </Button>
          }
        >
          {invoicesError ? (
            <div className="alert alert-danger" style={{ margin: 0 }}>
              <span>{invoicesError}</span>
            </div>
          ) : recentInvoices.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No invoices found.</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600 }}>#{inv.id}</td>
                      <td>Customer #{inv.customer_id}</td>
                      <td>{inv.amount} {inv.currency}</td>
                      <td>
                        <Badge status={inv.status}>{inv.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Notifications Card */}
      <Card
        title="Recent Customer Notifications"
        action={
          <Button variant="secondary" size="sm" onClick={() => onNavigate('notifications')}>
            View All Notifications
          </Button>
        }
      >
        {notificationsError ? (
          <div className="alert alert-danger" style={{ margin: 0 }}>
            <span>{notificationsError}</span>
          </div>
        ) : notifications.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No notifications found.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Message</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 500 }}>{n.recipient}</td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.message}
                    </td>
                    <td>
                      <Badge channel={n.channel}>{n.channel}</Badge>
                    </td>
                    <td>
                      <Badge status={n.status}>{n.status}</Badge>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
};
