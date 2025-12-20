import { useEffect, useMemo, useState } from 'react';
import http from '../services/http';
import * as XLSX from 'xlsx';

const toFaDateTime = (iso) => {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const downloadExcel = (rows, fileName) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Consultations');
  XLSX.writeFile(wb, fileName);
};

export default function Consultations() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');


  const effectiveLimit = search.trim() ? 1000 : limit;
  const effectivePage = search.trim() ? 1 : page;

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await http.get('/admin/manage-consultation/all', {
          params: { page: effectivePage, limit: effectiveLimit },
        });

        const data = res?.data?.data ?? [];
        const pag = res?.data?.pagination ?? {
          page: effectivePage,
          limit: effectiveLimit,
          total: Array.isArray(data) ? data.length : 0,
          totalPages: 1,
        };

        if (!mounted) return;

        setItems(Array.isArray(data) ? data : []);
        setPagination(pag);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'خطا در دریافت درخواست‌های مشاوره');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [effectivePage, effectiveLimit]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((x) => {
      const haystack = [
        x?.id,
        x?.fullName,
        x?.phone,
        x?.educationLevel,
        x?.major,
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
      const res = await http.get('/admin/manage-consultation/allforexcel');

      const data =
        res?.data?.data?.consultations ??
        res?.data?.data?.items ??
        res?.data?.data ??
        res?.data?.consultations ??
        res?.data ??
        [];

      const list = Array.isArray(data) ? data : [];

      const rows = list.map((x) => ({
        id: x?.id ?? '',
        fullName: x?.fullName ?? '',
        phone: x?.phone ?? '',
        educationLevel: x?.educationLevel ?? '',
        major: x?.major ?? '',
        isViewed: x?.isViewed ? 'دیده‌شده' : 'جدید',
        createdAt: x?.createdAt ?? '',
        updatedAt: x?.updatedAt ?? '',
      }));

      downloadExcel(rows, `consultations-${new Date().toISOString().slice(0, 10)}.xlsx`);
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
          <h2 className="text-xl font-bold text-slate-800">درخواست‌های فرم مشاوره</h2>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="جستجو: نام، شماره، مقطع، رشته..."
            className="w-full md:w-80 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />

          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className={`px-4 py-3 rounded-xl border ${
              exporting
                ? 'bg-slate-50 text-slate-400 border-slate-200'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="خروجی اکسل از کل درخواست‌های مشاوره"
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

          {!search.trim() ? (
            <div className="text-sm text-slate-500">
              صفحه {pagination?.page || page} از {pagination?.totalPages || 1} | کل: {pagination?.total || 0}
            </div>
          ) : (
            <div className="text-sm text-slate-500">حالت جستجو فعال است (فچ با limit بالا)</div>
          )}
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
                  <th className="px-4 py-3 font-semibold">مقطع</th>
                  <th className="px-4 py-3 font-semibold">رشته</th>
                  <th className="px-4 py-3 font-semibold">وضعیت</th>
                  <th className="px-4 py-3 font-semibold">تاریخ ثبت</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((x) => (
                  <tr key={x.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-700">{x.id}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{x.fullName || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{x.phone || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{x.educationLevel || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{x.major || '-'}</td>
                    <td className="px-4 py-3">
                      {x.isViewed ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-700 border border-emerald-100">
                          دیده‌شده
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-amber-50 text-amber-700 border border-amber-100">
                          جدید
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{toFaDateTime(x.createdAt)}</td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      موردی برای نمایش وجود ندارد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!search.trim() && (
          <div className="px-4 py-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev || loading}
              className={`px-4 py-2 rounded-xl border ${
                !canPrev || loading
                  ? 'text-slate-400 border-slate-200 bg-slate-50'
                  : 'text-slate-700 border-slate-200 hover:bg-slate-50'
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
                !canNext || loading
                  ? 'text-slate-400 border-slate-200 bg-slate-50'
                  : 'text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              بعدی
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
