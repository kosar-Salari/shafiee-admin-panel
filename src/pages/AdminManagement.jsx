// src/pages/AdminManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Shield,
  User,
  Calendar,
} from 'lucide-react';

import {
  getAdmins,
  createAdmin as apiCreateAdmin,
  deleteAdmin as apiDeleteAdmin,
} from '../services/adminService';

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [creating, setCreating] = useState(false);

  const [resultModal, setResultModal] = useState({
    open: false,
    type: 'success',
    title: '',
    message: '',
  });

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
    username: '',
  });

  useEffect(() => {
    refreshAdmins();
  }, []);

  async function refreshAdmins() {
    setLoading(true);
    setError('');
    try {
      const list = await getAdmins();
      setAdmins(list);
    } catch (e) {
      console.error(e);
      setError('خطا در دریافت لیست ادمین‌ها');
    } finally {
      setLoading(false);
    }
  }

  const startCreateAdmin = () => {
    setShowCreateModal(true);
    setAdminForm({ username: '', password: '' });
  };

  const handleCreateAdmin = async () => {
    const { username, password } = adminForm;
    if (!username.trim() || !password.trim()) {
      setResultModal({
        open: true,
        type: 'error',
        title: 'خطای اعتبارسنجی',
        message: 'لطفاً نام کاربری و رمز عبور را وارد کنید.',
      });
      return;
    }

    setCreating(true);
    try {
      await apiCreateAdmin({ username: username.trim(), password });
      await refreshAdmins();
      setShowCreateModal(false);
      setAdminForm({ username: '', password: '' });
      setResultModal({
        open: true,
        type: 'success',
        title: 'ادمین ایجاد شد',
        message: `ادمین «${username}» با موفقیت اضافه شد.`,
      });
    } catch (e) {
      console.error(e);
      const apiErrors = e?.data?.errors;
      const serverMsg = e?.data?.message || e?.data?.error;
      const msg = Array.isArray(apiErrors) && apiErrors.length
        ? apiErrors.map((x) => `${x.path}: ${x.msg}`).join(' | ')
        : serverMsg || 'ایجاد ادمین ناموفق بود.';
      setResultModal({
        open: true,
        type: 'error',
        title: 'خطا در ایجاد',
        message: msg,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleAskDeleteAdmin = (admin) => {
    // جلوگیری از حذف superadmin
    if (admin.role === 'superadmin') {
      setResultModal({
        open: true,
        type: 'error',
        title: 'عملیات غیرمجاز',
        message: 'امکان حذف ادمین اصلی (superadmin) وجود ندارد.',
      });
      return;
    }
    setConfirmDelete({ open: true, id: admin.id, username: admin.username });
  };

  const performDelete = async (id, username) => {
    try {
      await apiDeleteAdmin(id);
      await refreshAdmins();
      setResultModal({
        open: true,
        type: 'success',
        title: 'ادمین حذف شد',
        message: `ادمین «${username}» با موفقیت حذف شد.`,
      });
    } catch (e) {
      console.error(e);
      const apiErrors = e?.response?.data?.errors;
      const serverMsg = e?.response?.data?.message || e?.response?.data?.error;
      const msg = Array.isArray(apiErrors) && apiErrors.length
        ? apiErrors.map((x) => `${x.path}: ${x.msg}`).join(' | ')
        : serverMsg || 'حذف ادمین ناموفق بود.';
      setResultModal({
        open: true,
        type: 'error',
        title: 'خطا در حذف',
        message: msg,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-lahzeh" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                مدیریت ادمین‌ها
              </h1>
              <p className="text-gray-600">
                مدیریت کاربران ادمین سیستم
              </p>
            </div>
            <button
              onClick={startCreateAdmin}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <Plus size={20} />
              ایجاد ادمین جدید
            </button>
          </div>
        </div>

        {/* Admin List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading ? (
            <p className="text-gray-500 text-center py-8">در حال دریافت لیست ادمین‌ها...</p>
          ) : error ? (
            <p className="text-red-600 text-center py-8">{error}</p>
          ) : admins.length === 0 ? (
            <p className="text-gray-500 text-center py-8">هنوز ادمینی ثبت نشده است</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-bold text-gray-700">
                      نام کاربری
                    </th>
                    <th className="text-right py-3 px-4 font-bold text-gray-700">
                      نقش
                    </th>
                    <th className="text-right py-3 px-4 font-bold text-gray-700">
                      تاریخ ایجاد
                    </th>
                    <th className="text-right py-3 px-4 font-bold text-gray-700">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <User size={18} className="text-gray-400" />
                          <span className="font-medium">{admin.username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {admin.role === 'superadmin' ? (
                            <>
                              <Shield size={18} className="text-purple-600" />
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                ادمین اصلی
                              </span>
                            </>
                          ) : (
                            <>
                              <User size={18} className="text-blue-600" />
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                ادمین
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span className="text-sm">
                            {new Date(admin.createdAt).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {admin.role !== 'superadmin' && (
                          <button
                            onClick={() => handleAskDeleteAdmin(admin)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="حذف ادمین"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Create Admin */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-2xl font-bold mb-6">ایجاد ادمین جدید</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    نام کاربری
                  </label>
                  <input
                    type="text"
                    placeholder="نام کاربری ادمین"
                    value={adminForm.username}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, username: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    رمز عبور
                  </label>
                  <input
                    type="password"
                    placeholder="رمز عبور"
                    value={adminForm.password}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, password: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateAdmin}
                  disabled={creating}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {creating ? 'در حال ایجاد...' : 'ایجاد ادمین'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Result */}
        {resultModal.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-start gap-3">
                {resultModal.type === 'success' ? (
                  <CheckCircle2 className="text-green-600 shrink-0" size={28} />
                ) : (
                  <AlertTriangle className="text-red-600 shrink-0" size={28} />
                )}
                <div>
                  <h4 className="text-lg font-bold mb-1">{resultModal.title}</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {resultModal.message}
                  </p>
                </div>
              </div>
              <div className="mt-6 text-left">
                <button
                  onClick={() =>
                    setResultModal((m) => ({ ...m, open: false }))
                  }
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                >
                  باشه
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {confirmDelete.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
              <p className="text-lg font-bold mb-4">
                آیا از حذف ادمین «{confirmDelete.username}» مطمئن هستید؟
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() =>
                    setConfirmDelete({ open: false, id: null, username: '' })
                  }
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  خیر
                </button>
                <button
                  onClick={() => {
                    const { id, username } = confirmDelete;
                    setConfirmDelete({ open: false, id: null, username: '' });
                    performDelete(id, username);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  بله، حذف شود
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
