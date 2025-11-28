import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getUsers, updateUserRole, toggleUserDisabled, deleteUser } from '../services/userService';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers({ limit: 100 });
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error loading users', err);
      setError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (u) => {
    try {
      const newRole = u.role === 'admin' ? 'user' : 'admin';
      await updateUserRole(u._id, newRole);
      setUsers((prev) => prev.map(item => item._id === u._id ? { ...item, role: newRole } : item));
    } catch (err) {
      console.error('Error updating role', err);
      setError(err.response?.data?.message || err.message || 'Failed to update role');
    }
  };

  const handleDisableToggle = async (u) => {
    try {
      const disabled = !u.disabled;
      await toggleUserDisabled(u._id, disabled);
      setUsers((prev) => prev.map(item => item._id === u._id ? { ...item, disabled } : item));
    } catch (err) {
      console.error('Error toggling disabled', err);
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    }
  };

  const confirmDelete = (u) => {
    setDeleteTarget(u);
    setShowDeleteModal(true);
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget._id);
      setUsers((prev) => prev.filter(u => u._id !== deleteTarget._id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting user', err);
      setError(err.response?.data?.message || err.message || 'Delete failed');
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-grow max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Admin - Users</h1>
        {error && <p className="text-red-600 mb-2">{error}</p>}

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="bg-white p-4 rounded shadow overflow-hidden ring-1 ring-black/5">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disabled</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.role || 'user'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{u.disabled ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="inline-flex items-center gap-2">
                          <button onClick={() => handleRoleToggle(u)} className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded">{u.role === 'admin' ? 'Demote' : 'Promote'}</button>
                          <button onClick={() => handleDisableToggle(u)} className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded">{u.disabled ? 'Enable' : 'Disable'}</button>
                          <button onClick={() => confirmDelete(u)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-2">Confirm delete</h3>
              <p className="text-gray-700 mb-4">Are you sure you want to delete the user "{deleteTarget?.email}"? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={doDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminUsersPage;
