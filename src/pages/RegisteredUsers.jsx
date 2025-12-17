import { useEffect, useMemo, useState } from 'react';
import http from '../services/http';
import * as XLSX from 'xlsx';

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

export default function RegisteredUsers() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ totalUsers: 0, totalPages: 1, currentPage: 1 });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

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

        if (!mounted) return;
        setItems(users);
        setPagination(meta);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'خطا در دریافت لیست کاربران');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPaged();
    return () => {
      mounted = false;
    };
  }, [page, pageSize]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((x) => {
      const haystack = [
        x?.id,
        x?.fullName,
        x?.phone,
        x?.educationStatus,
        x?.createdAt,
      ]
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

  return (
    <div className="font-lahzeh">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">کاربران ثبت نام شده</h2>
          <p className="text-sm text-slate-500 mt-1">
            لیست: <span className="font-mono">GET /admin/manage-users/getUsersPaged</span> | اکسل: <span className="font-mono">GET /admin/manage-users/getUsers</span>
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو: نام، شماره، وضعیت تحصیلی..."
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {loading ? 'در حال دریافت...' : `تعداد نمایش داده شده: ${filtered.length}`}
          </div>
          <div className="text-sm text-slate-500">
            صفحه {pagination?.currentPage || page} از {pagination?.totalPages || 1} | کل: {pagination?.totalUsers || 0}
          </div>
        </div>

        {error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead className="bg-slate-50">
                <tr className="text-slate-600 text-sm">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">نام و نام خانوادگی</th>
                  <th className="px-4 py-3 font-semibold">شماره تماس</th>
                  <th className="px-4 py-3 font-semibold">وضعیت تحصیلی</th>
                  <th className="px-4 py-3 font-semibold">تاریخ ثبت</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((x) => (
                  <tr key={x.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-700">{x.id}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{x.fullName || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{x.phone || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{x.educationStatus || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{toFaDateTime(x.createdAt)}</td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      موردی برای نمایش وجود ندارد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

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

          <div className="text-sm text-slate-600">
            صفحه {page} از {pagination?.totalPages || 1}
          </div>

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
    </div>
  );
}
