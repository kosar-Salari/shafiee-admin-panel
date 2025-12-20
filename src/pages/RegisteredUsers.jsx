// src/pages/RegisteredUsers.jsx
import { useEffect, useMemo, useState } from 'react';
import http from '../services/http';
import * as XLSX from 'xlsx';
import Modal from '../components/Modal';
import {
  adminActivateUser,
  adminDeactivateUser,
  adminSetUserPassword,
  adminSetUserPhone,
} from '../services/adminUsersService';

const toFaDateTime = (iso) => {
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const downloadExcel = (rows, fileName) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Users');
  XLSX.writeFile(wb, fileName);
};

// تلاش برای تشخیص وضعیت فعال بودن کاربر از روی فیلدهای مختلف
const getIsActive = (u) => {
  if (typeof u?.isActive === 'boolean') return u.isActive;
  if (typeof u?.active === 'boolean') return u.active;
  if (typeof u?.isDisabled === 'boolean') return !u.isDisabled;
  if (typeof u?.disabled === 'boolean') return !u.disabled;
  if (typeof u?.status === 'string') return u.status.toLowerCase() === 'active';
  return null; // نامشخص
};

export default function RegisteredUsers() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ totalUsers: 0, totalPages: 1, currentPage: 1 });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // مودال‌ها
  const [modal, setModal] = useState({ open: false, type: null, user: null });
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const closeModal = () => {
    setModal({ open: false, type: null, user: null });
    setFormPhone('');
    setFormPassword('');
    setSaving(false);
  };

  const openPhoneModal = (user) => {
    setSuccess('');
    setError('');
    setFormPhone(user?.phone || '');
    setModal({ open: true, type: 'phone', user });
  };

  const openPasswordModal = (user) => {
    console.log('selected user:', user);

    setSuccess('');
    setError('');
    setFormPassword('');
    setModal({ open: true, type: 'password', user });
  };

  const fetchPaged = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await http.get('/admin/manage-users/getUsersPaged', {
        params: { page, pageSize },
      });

      const payload = res?.data?.data;
      const users = payload?.users ?? [];
      const meta = {
        totalUsers: payload?.totalUsers ?? 0,
        totalPages: payload?.totalPages ?? 1,
        currentPage: payload?.currentPage ?? page,
      };

      setItems(users);
      setPagination(meta);
    } catch (e) {
      setError(e?.response?.data?.message || 'خطا در دریافت لیست کاربران');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await fetchPaged();
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((x) => {
      const haystack = [x?.id, x?.fullName, x?.phone, x?.educationStatus, x?.createdAt]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [items, search]);

  const canPrev = page > 1;
  const canNext = page < (pagination?.totalPages || 1);

  const handleExportExcel = async () => {
    setExporting(true);
    setError('');
    try {
      const res = await http.get('/admin/manage-users/getUsers');
      const users = res?.data?.data?.users ?? res?.data?.data ?? res?.data?.users ?? res?.data ?? [];

      const rows = (Array.isArray(users) ? users : []).map((u) => ({
        id: u.id ?? '',
        fullName: u.fullName ?? '',
        phone: u.phone ?? '',
        educationStatus: u.educationStatus ?? '',
        isActive: getIsActive(u) === null ? '' : (getIsActive(u) ? 'active' : 'inactive'),
        createdAt: u.createdAt ?? '',
        updatedAt: u.updatedAt ?? '',
      }));

      downloadExcel(rows, `registered-users-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (e) {
      setError(e?.response?.data?.message || 'خطا در دریافت اطلاعات برای اکسل');
    } finally {
      setExporting(false);
    }
  };

  const handleSavePhone = async () => {
    const userId = modal?.user?.id;
    const phone = formPhone.trim();

    if (!userId) return;
    if (!phone) {
      setError('شماره جدید را وارد کنید');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await adminSetUserPhone(userId, phone);
      setSuccess('شماره کاربر با موفقیت تغییر کرد.');
      closeModal();
      await fetchPaged();
    } catch (e) {
      setError(e?.response?.data?.message || 'خطا در تغییر شماره');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    const u = modal?.user;
    const userId = u?.id;

    if (!userId) {
      setError('شناسه کاربر نامعتبر است');
      return;
    }

    if (!formPassword || !formPassword.trim()) {
      setError('رمز جدید را وارد کنید');
      return;
    }

    const p = String(formPassword);

    if (p.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await adminSetUserPassword(u, p);

      setSuccess('رمز عبور کاربر با موفقیت تغییر کرد.');
      closeModal();

      // ✅ جلوگیری از بهم‌ریختن صفحه به خاطر autofill مرورگر
      setSearch('');

      // ✅ همسان‌سازی UI با دیتا
      await fetchPaged();
    } catch (e) {
      const data = e?.response?.data;
      console.log('set-user-password error:', data);

      const msg =
        Array.isArray(data?.error)
          ? data.error.map((x) => `${x?.path || ''}: ${x?.msg || 'Invalid'}`).join(' - ')
          : data?.message || 'خطا در تغییر رمز عبور';

      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user) => {
    const userId = user?.id;
    if (!userId) return;

    const isActive = getIsActive(user);
    const willDeactivate = isActive === null ? true : isActive === true;

    const ok = window.confirm(
      willDeactivate ? 'آیا از غیرفعال کردن این کاربر مطمئن هستید؟' : 'آیا از فعال کردن این کاربر مطمئن هستید؟'
    );
    if (!ok) return;

    setError('');
    setSuccess('');
    try {
      if (willDeactivate) {
        await adminDeactivateUser(userId);
        setSuccess('کاربر غیرفعال شد.');
      } else {
        await adminActivateUser(userId);
        setSuccess('کاربر فعال شد.');
      }
      await fetchPaged();
    } catch (e) {
      setError(e?.response?.data?.message || 'خطا در تغییر وضعیت کاربر');
    }
  };

  return (
    <div className="font-lahzeh">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">کاربران ثبت نام شده</h2>
          <p className="text-sm text-slate-500 mt-1">عملیات ادمین: تغییر شماره/رمز و فعال‌سازی از طریق روت‌های ادمین</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو: نام، شماره، وضعیت تحصیلی..."
            autoComplete="off"
            name="admin-users-search"
            data-lpignore="true"
            className="w-full md:w-80 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />

          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className={`px-4 py-3 rounded-xl border ${
              exporting ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="خروجی اکسل از کل کاربران"
          >
            {exporting ? 'در حال ساخت...' : 'خروجی اکسل'}
          </button>
        </div>
      </div>

      {(error || success) && (
        <div className="mb-4 space-y-2">
          {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-100">{error}</div>}
          {success && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">{success}</div>}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-600">{loading ? 'در حال دریافت...' : `تعداد نمایش داده شده: ${filtered.length}`}</div>
          <div className="text-sm text-slate-500">
            صفحه {pagination?.currentPage || page} از {pagination?.totalPages || 1} | کل: {pagination?.totalUsers || 0}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-right">
            <thead className="bg-slate-50">
              <tr className="text-slate-600 text-sm">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">نام و نام خانوادگی</th>
                <th className="px-4 py-3 font-semibold">شماره تماس</th>
                <th className="px-4 py-3 font-semibold">وضعیت تحصیلی</th>
                <th className="px-4 py-3 font-semibold">تاریخ ثبت</th>
                <th className="px-4 py-3 font-semibold">وضعیت</th>
                <th className="px-4 py-3 font-semibold">عملیات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.map((x) => {
                const isActive = getIsActive(x);

                return (
                  <tr key={x.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-700">{x.id}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{x.fullName || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{x.phone || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{x.educationStatus || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{toFaDateTime(x.createdAt)}</td>

                    <td className="px-4 py-3">
                      {isActive === null ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-slate-50 text-slate-600 border border-slate-100">نامشخص</span>
                      ) : isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-700 border border-emerald-100">فعال</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-amber-50 text-amber-700 border border-amber-100">غیرفعال</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button
                          onClick={() => openPhoneModal(x)}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
                        >
                          تغییر شماره
                        </button>

                        <button
                          onClick={() => openPasswordModal(x)}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
                        >
                          تغییر رمز
                        </button>

                        <button
                          onClick={() => handleToggleActive(x)}
                          className={`px-3 py-2 rounded-xl border text-xs ${
                            isActive === false
                              ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          {isActive === false ? 'فعال‌سازی' : 'غیرفعال‌سازی'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">موردی برای نمایش وجود ندارد.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev || loading}
            className={`px-4 py-2 rounded-xl border ${
              !canPrev || loading ? 'text-slate-400 border-slate-200 bg-slate-50' : 'text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            قبلی
          </button>

          <div className="text-sm text-slate-600">صفحه {page} از {pagination?.totalPages || 1}</div>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!canNext || loading}
            className={`px-4 py-2 rounded-xl border ${
              !canNext || loading ? 'text-slate-400 border-slate-200 bg-slate-50' : 'text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            بعدی
          </button>
        </div>
      </div>

      {/* مودال تغییر شماره */}
      <Modal open={modal.open && modal.type === 'phone'} title={`تغییر شماره کاربر (ID: ${modal?.user?.id ?? '-'})`} onClose={closeModal}>
        <div className="space-y-3">
          <div className="text-sm text-slate-600">
            شماره فعلی: <span className="font-mono">{modal?.user?.phone || '-'}</span>
          </div>

          <input
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            placeholder="شماره جدید"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />

          <div className="flex gap-2 justify-end">
            <button onClick={closeModal} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50" disabled={saving}>
              انصراف
            </button>
            <button
              onClick={handleSavePhone}
              className={`px-4 py-2 rounded-xl border ${
                saving ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
              }`}
              disabled={saving}
            >
              {saving ? 'در حال ثبت...' : 'ثبت'}
            </button>
          </div>
        </div>
      </Modal>

      {/* مودال تغییر پسورد */}
      <Modal open={modal.open && modal.type === 'password'} title={`تغییر رمز کاربر (ID: ${modal?.user?.id ?? '-'})`} onClose={closeModal}>
        <div className="space-y-3">
          <input
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            placeholder="رمز جدید (حداقل ۸ کاراکتر)"
            type="password"
            autoComplete="new-password"
            name="admin-set-user-password"
            data-lpignore="true"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />

          <div className="flex gap-2 justify-end">
            <button onClick={closeModal} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50" disabled={saving}>
              انصراف
            </button>
            <button
              onClick={handleSavePassword}
              className={`px-4 py-2 rounded-xl border ${
                saving ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
              }`}
              disabled={saving}
            >
              {saving ? 'در حال ثبت...' : 'ثبت'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
