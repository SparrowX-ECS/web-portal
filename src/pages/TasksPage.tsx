import React, { useEffect, useState, useCallback } from 'react';
import type { TaskRead, TaskCreate, TaskUpdate, TaskStatus } from '../types/task';
import { taskApi } from '../api/taskApi';
import {
  PlusIcon,
  RefreshIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  AlertIcon,
} from '../components/common/Icons';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

const TASK_STATUS_OPTIONS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'];

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState<TaskRead | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskApi.listTasks({
        status: statusFilter || null,
        assigned_to: assigneeFilter.trim() || null,
      });
      setTasks(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load tasks';
      setError(msg);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, assigneeFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setAssignedTo('');
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (t: TaskRead) => {
    setSelectedTask(t);
    setTitle(t.title);
    setDescription(t.description || '');
    setAssignedTo(t.assigned_to || '');
    setStatus(t.status);
    setFormError(null);
    setIsEditOpen(true);
  };

  const openViewModal = (t: TaskRead) => {
    setSelectedTask(t);
    setIsViewOpen(true);
  };

  const openDeleteModal = (t: TaskRead) => {
    setSelectedTask(t);
    setFormError(null);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      // Backend TaskCreate schema forbids extra properties
      const payload: TaskCreate = {
        title: title.trim(),
        description: description.trim() || null,
        assigned_to: assignedTo.trim() || null,
      };
      await taskApi.createTask(payload);
      setIsCreateOpen(false);
      loadTasks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create task';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      const payload: TaskUpdate = {
        title: title.trim(),
        description: description.trim() || null,
        assigned_to: assignedTo.trim() || null,
        status,
      };
      await taskApi.updateTask(selectedTask.id, payload);
      setIsEditOpen(false);
      loadTasks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update task';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleQuickStatusChange = async (task: TaskRead, nextStatus: TaskStatus) => {
    try {
      await taskApi.updateTask(task.id, { status: nextStatus });
      loadTasks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change task status';
      setError(msg);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTask) return;
    setFormLoading(true);
    setFormError(null);
    try {
      await taskApi.deleteTask(selectedTask.id);
      setIsDeleteOpen(false);
      loadTasks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete task';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Tasks</h2>
          <p className="page-description">Operational tasks managed by Daniel Brooks (Operations Team)</p>
        </div>
        <Button icon={<PlusIcon />} onClick={openCreateModal}>
          Create Task
        </Button>
      </div>

      <div className="toolbar">
        <div className="filters-group">
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
            aria-label="Filter by task status"
          >
            <option value="">All Statuses</option>
            {TASK_STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="input"
            placeholder="Filter by assignee..."
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            aria-label="Filter by assignee"
          />

          {(statusFilter || assigneeFilter) && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setStatusFilter('');
                setAssigneeFilter('');
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
          onClick={loadTasks}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadTasks} />}

      <Card>
        {loading ? (
          <LoadingSpinner message="Loading tasks..." />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description={
              statusFilter || assigneeFilter
                ? 'No tasks match the active filters.'
                : 'There are currently no tasks in the queue.'
            }
            action={
              !statusFilter && !assigneeFilter ? (
                <Button icon={<PlusIcon />} onClick={openCreateModal}>
                  Create First Task
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
                  <th>Title</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>#{t.id}</td>
                    <td style={{ fontWeight: 600 }}>{t.title}</td>
                    <td>{t.assigned_to || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                    <td>
                      <select
                        className="select"
                        style={{ fontSize: 12, padding: '2px 8px', height: 28 }}
                        value={t.status}
                        onChange={(e) => handleQuickStatusChange(t, e.target.value as TaskStatus)}
                        aria-label={`Change status for task #${t.id}`}
                      >
                        {TASK_STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="View Details"
                          onClick={() => openViewModal(t)}
                          aria-label={`View task #${t.id}`}
                        >
                          <EyeIcon />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit Task"
                          onClick={() => openEditModal(t)}
                          aria-label={`Edit task #${t.id}`}
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ color: 'var(--danger)' }}
                          title="Delete Task"
                          onClick={() => openDeleteModal(t)}
                          aria-label={`Delete task #${t.id}`}
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

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
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
              form="create-task-form"
              loading={formLoading}
            >
              Create Task
            </Button>
          </>
        }
      >
        <form id="create-task-form" onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {formError && (
            <div className="alert alert-danger" style={{ padding: 10 }}>
              <AlertIcon size={14} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Title <span className="required">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className="input"
              required
              maxLength={200}
              placeholder="e.g. Audit cloud cluster permissions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">
              Description
            </label>
            <textarea
              id="task-desc"
              className="textarea"
              maxLength={2000}
              placeholder="Detailed description of task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-assignee">
              Assigned To
            </label>
            <input
              id="task-assignee"
              type="text"
              className="input"
              maxLength={150}
              placeholder="e.g. Daniel Brooks or Operations Team"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Task #${selectedTask?.id}`}
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
              form="edit-task-form"
              loading={formLoading}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <form id="edit-task-form" onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {formError && (
            <div className="alert alert-danger" style={{ padding: 10 }}>
              <AlertIcon size={14} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="edit-task-title">
              Title <span className="required">*</span>
            </label>
            <input
              id="edit-task-title"
              type="text"
              className="input"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-task-desc">
              Description
            </label>
            <textarea
              id="edit-task-desc"
              className="textarea"
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-task-assignee">
              Assigned To
            </label>
            <input
              id="edit-task-assignee"
              type="text"
              className="input"
              maxLength={150}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-task-status">
              Status
            </label>
            <select
              id="edit-task-status"
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              {TASK_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* View Task Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Task #${selectedTask?.id}`}
        footer={
          <Button variant="secondary" onClick={() => setIsViewOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedTask && (
          <div className="detail-grid">
            <span className="detail-label">Task ID</span>
            <span className="detail-value">#{selectedTask.id}</span>

            <span className="detail-label">Title</span>
            <span className="detail-value" style={{ fontWeight: 600 }}>{selectedTask.title}</span>

            <span className="detail-label">Status</span>
            <span className="detail-value">
              <Badge status={selectedTask.status}>{selectedTask.status}</Badge>
            </span>

            <span className="detail-label">Assigned To</span>
            <span className="detail-value">{selectedTask.assigned_to || 'Unassigned'}</span>

            <span className="detail-label">Created At</span>
            <span className="detail-value">{new Date(selectedTask.created_at).toLocaleString()}</span>

            <span className="detail-label">Last Updated</span>
            <span className="detail-value">{new Date(selectedTask.updated_at).toLocaleString()}</span>

            <span className="detail-label">Description</span>
            <div
              className="detail-value"
              style={{
                backgroundColor: '#f8fafc',
                padding: 12,
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                whiteSpace: 'pre-wrap',
                fontSize: 13,
              }}
            >
              {selectedTask.description || 'No description provided.'}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Task Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Task Deletion"
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
              Delete Task
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
          Are you sure you want to delete task <strong>"{selectedTask?.title}"</strong> (ID #{selectedTask?.id})?
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
          This will permanently remove the task record from the Task API service.
        </p>
      </Modal>
    </>
  );
};
