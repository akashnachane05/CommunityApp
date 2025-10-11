import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';

export default function ChangePasswordDialog({ open, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const focusRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setErr('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    // focus first input
    setTimeout(() => focusRef.current?.focus(), 0);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const submit = async () => {
    setErr('');
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setErr('Please fill all fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErr('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setErr('New password must be at least 8 characters.');
      return;
    }
    try {
      setSaving(true);
      await api.put('/users/change-password', { currentPassword, newPassword });
      alert('Password updated successfully.');
      onClose?.();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to update password.';
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  // Render at body level with a very high z-index so nothing covers it
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 bg-white w-full max-w-md rounded-lg p-6 shadow-2xl pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        {err && <div className="mb-3 text-red-600 text-sm">{err}</div>}
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Current Password</label>
            <input
              ref={focusRef}
              type="password"
              className="w-full border rounded px-3 py-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm New Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}