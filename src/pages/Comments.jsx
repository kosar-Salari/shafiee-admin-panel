// src/pages/Comments.jsx
import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Check,
  Reply,
  Trash2,
  Search,
  Filter,
  Tag,
} from 'lucide-react';

import {
  getAllComments,
  acceptComment,
  deleteCommentById,
  replyToComment,
} from '../services/commentsService';

const Comments = () => {
  const [flatComments, setFlatComments] = useState([]); // لیست فلت از سرور
  const [comments, setComments] = useState([]); // لیست نِست‌شده برای نمایش
  const [filterStatus, setFilterStatus] = useState('all'); // all | pending | approved
  const [filterSection, setFilterSection] = useState('all'); // all | article | news | page | key | other
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // id کامنت/ریپلایی که در حال پاسخ دادن به آنیم
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // کمک‌کننده: تشخیص وضعیت تایید از سمت بک‌اند
  const isAcceptedFromBackend = (item) => {
    return (
      item.isAccepted === true ||
      item.accepted === true ||
      item.is_accepted === true ||
      item.status === 'ACCEPTED' ||
      item.status === 'accepted' ||
      item.status === 'PUBLISHED' ||
      item.status === 'published'
    );
  };

  // کمک‌کننده: تبدیل آیتم خام بک‌اند به مدل داخلی ما
  const mapItemToComment = (item) => {
    let targetType = 'other';
    let targetLabel = 'نامشخص';
    let targetKey = item.key || '';

    if (item.articleId || item.articleTitle) {
      targetType = 'article';
      targetLabel = item.articleTitle || item.postTitle || 'مقاله';
    } else if (item.newsId || item.newsTitle) {
      targetType = 'news';
      targetLabel = item.newsTitle || item.postTitle || 'خبر';
    } else if (item.pageId || item.pageTitle) {
      targetType = 'page';
      targetLabel = item.pageTitle || item.postTitle || 'صفحه';
    } else if (item.key) {
      targetType = 'key';
      targetLabel = item.key;
    }

    const isReply = !!item.parentId;

    // تشخیص ادمین: هم فیلدهای بک، هم ایمیل/نامی که خودت برای ادمین استفاده می‌کنی
    const isAdmin =
      item.isAdmin === true ||
      item.is_admin === true ||
      item.byAdmin === true ||
      item.email === 'admin' || // اگر ایمیل خاصی برای ادمین داری اینجا ست کن
      item.name === 'ادمین';

    return {
      id: item.id || item._id,
      parentId: item.parentId || null,
      author: item.name,
      email: item.email,
      content: item.content,
      date: item.createdAt
        ? new Date(item.createdAt).toLocaleDateString('fa-IR')
        : '',
      status: isAcceptedFromBackend(item) ? 'approved' : 'pending',
      isReply,
      isAdmin,
      replies: [],
      targetType,
      targetLabel,
      targetKey,
    };
  };

  // ساخت درخت کامنت‌ها از روی فهرست فلت (پشتیبانی از چند سطح)
  const buildCommentTree = (mappedList) => {
    const byId = {};
    mappedList.forEach((c) => {
      byId[c.id] = { ...c, replies: [] };
    });

    mappedList.forEach((c) => {
      if (c.parentId && byId[c.parentId]) {
        byId[c.parentId].replies.push(byId[c.id]);
      }
    });

    const topLevel = mappedList
      .filter((c) => !c.parentId || !byId[c.parentId])
      .map((c) => byId[c.id]);

    return topLevel;
  };

  // --- لود اولیه کامنت‌ها از سرور
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError('');

      const raw = await getAllComments();

      const list = Array.isArray(raw) ? raw : raw?.data || [];
      const mapped = list.map(mapItemToComment);
      const tree = buildCommentTree(mapped);

      setFlatComments(mapped);
      setComments(tree);
    } catch (err) {
      console.error(err);
      setError('خطا در دریافت کامنت‌ها. لطفا دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // --- تغییر وضعیت کامنت در استیت بعد از موفقیت API
  const updateCommentStatus = async (id, newStatus) => {
    if (newStatus === 'approved') {
      try {
        await acceptComment(id);
        setFlatComments((prev) => {
          const updated = prev.map((c) =>
            c.id === id ? { ...c, status: 'approved' } : c
          );
          setComments(buildCommentTree(updated));
          return updated;
        });
      } catch (err) {
        console.error(err);
        alert('خطا در تایید کامنت');
      }
      return;
    }
  };

  const deleteComment = async (id) => {
    if (
      !window.confirm('آیا مطمئن هستید که می‌خواهید این کامنت را حذف کنید؟')
    ) {
      return;
    }

    try {
      await deleteCommentById(id);
      setFlatComments((prev) => {
        // خود کامنت و تمام ریپلای‌هایش را حذف کن
        const updated = prev.filter(
          (c) => c.id !== id && c.parentId !== id
        );
        setComments(buildCommentTree(updated));
        return updated;
      });
    } catch (err) {
      console.error(err);
      alert('خطا در حذف کامنت');
    }
  };

  // ریپلای ادمین با تایید خودکار در بک‌اند
  const addReply = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      const reply = await replyToComment(commentId, {
        name: 'ادمین',
        email: 'admin@example.com',
        content: replyText,
      });

      const replyData = reply?.data || reply;
      const replyId = replyData?.id || replyData?._id;

      if (replyId) {
        try {
          await acceptComment(replyId);
        } catch (err) {
          console.error('خطا در تایید خودکار پاسخ ادمین:', err);
        }
      }

      await fetchComments();

      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
      alert('خطا در ارسال پاسخ');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'در انتظار',
      },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'تایید شده',
      },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  const getSectionBadge = (comment) => {
    let label = '';
    let color = '';

    switch (comment.targetType) {
      case 'article':
        label = 'مقاله';
        color = 'bg-emerald-50 text-emerald-700 border-emerald-100';
        break;
      case 'news':
        label = 'خبر';
        color = 'bg-sky-50 text-sky-700 border-sky-100';
        break;
      case 'page':
        label = 'صفحه';
        color = 'bg-purple-50 text-purple-700 border-purple-100';
        break;
      case 'key':
        label = `بلاک (کلید: ${comment.targetKey})`;
        color = 'bg-amber-50 text-amber-700 border-amber-100';
        break;
      default:
        label = 'سایر';
        color = 'bg-gray-50 text-gray-600 border-gray-100';
    }

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border ${color}`}
      >
        <Tag className="w-3 h-3" />
        {label}
      </span>
    );
  };

  // فیلتر روی کامنت‌های ریشه (Top-level) برای لیست اصلی
  const filteredComments = comments.filter((comment) => {
    const matchesStatus =
      filterStatus === 'all' || comment.status === filterStatus;

    const matchesSection =
      filterSection === 'all' || comment.targetType === filterSection;

    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (comment.author || '').toLowerCase().includes(search) ||
      (comment.content || '').toLowerCase().includes(search) ||
      (comment.targetLabel || '').toLowerCase().includes(search) ||
      (comment.targetKey || '').toLowerCase().includes(search);

    return matchesStatus && matchesSection && matchesSearch;
  });

  // آمار: همه‌ی کامنت‌ها و ریپلای‌ها به‌جز آیتم‌های ادمین
  const countable = flatComments.filter((c) => !c.isAdmin);
  const stats = {
    total: countable.length,
    pending: countable.filter((c) => c.status === 'pending').length,
    approved: countable.filter((c) => c.status === 'approved').length,
  };

  // رندر بازگشتی ریپلای‌ها (چند سطحی)
  const renderReplies = (replies, level = 1) => {
    if (!replies || replies.length === 0) return null;

    return (
      <div
        className={`mt-4 space-y-3 ${
          level === 1 ? 'mr-13' : `mr-${13 + level * 2}`
        }`}
      >
        {replies.map((reply) => (
          <div
            key={reply.id}
            className="bg-blue-50 rounded-xl p-4 border-r-4 border-blue-400"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                  {reply.author?.charAt(0) || 'A'}
                </div>
                <div>
                  <span className="font-bold text-sm text-gray-800">
                    {reply.author || 'کاربر'}
                  </span>
                  <p className="text-[11px] text-gray-400">
                    {reply.date}
                  </p>
                </div>
              </div>
              <div>{getStatusBadge(reply.status)}</div>
            </div>

            <p className="text-gray-700 text-sm mr-10 mb-3">
              {reply.content}
            </p>

            {/* اکشن‌های ریپلای */}
            <div className="flex gap-2 mt-1">
              {reply.status === 'pending' && (
                <button
                  onClick={() => updateCommentStatus(reply.id, 'approved')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs font-medium"
                >
                  <Check className="w-3 h-3" />
                  تایید
                </button>
              )}
              <button
                onClick={() =>
                  setReplyingTo(replyingTo === reply.id ? null : reply.id)
                }
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs font-medium"
              >
                <Reply className="w-3 h-3" />
                پاسخ
              </button>
              <button
                onClick={() => deleteComment(reply.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs font-medium"
              >
                <Trash2 className="w-3 h-3" />
                حذف
              </button>
            </div>

            {/* فرم پاسخ به همین ریپلای */}
            {replyingTo === reply.id && (
              <div className="mt-3 pr-6">
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                  rows="3"
                  placeholder="پاسخ خود را بنویسید..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => addReply(reply.id)}
                    disabled={!replyText.trim()}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition ${
                      !replyText.trim()
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    }`}
                  >
                    ارسال پاسخ
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            )}

            {/* اگر این ریپلای خودش ریپلای‌هایی دارد، بازگشتی نمایششان می‌دهیم */}
            {reply.replies && reply.replies.length > 0 && (
              <div className="mt-3">
                {renderReplies(reply.replies, level + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 font-lahzeh"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  مدیریت کامنت‌ها
                </h1>
                <p className="text-gray-500 text-sm">
                  مدیریت و پاسخگویی به نظرات کاربران در مقالات، اخبار و صفحات
                </p>
              </div>
            </div>

            {loading && (
              <span className="text-sm text-gray-500">
                در حال بارگذاری...
              </span>
            )}
            {error && (
              <span className="text-sm text-red-500">{error}</span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.total}
              </div>
              <div className="text-sm text-blue-800">
                کل کامنت‌ها (غیر ادمین)
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {stats.pending}
              </div>
              <div className="text-sm text-yellow-800">در انتظار تایید</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {stats.approved}
              </div>
              <div className="text-sm text-green-800">تایید شده</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="جستجو در کامنت‌ها، نویسنده یا عنوان محتوا..."
                className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-5 h-5" />
                <select
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="pending">در انتظار</option>
                  <option value="approved">تایید شده</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="text-gray-400 w-5 h-5" />
                <select
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                >
                  <option value="all">همه بخش‌ها</option>
                  <option value="article">مقالات</option>
                  <option value="news">اخبار</option>
                  <option value="page">صفحات</option>
                  <option value="key">بلاک‌های کلیدی</option>
                  <option value="other">سایر</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {loading && comments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                در حال بارگذاری کامنت‌ها...
              </p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">کامنتی یافت نشد</p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {comment.author?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {comment.author || 'بدون نام'}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {comment.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(comment.status)}
                        {getSectionBadge(comment)}
                      </div>
                    </div>

                    <div className="mr-13 space-y-1">
                      <p className="text-xs text-gray-500">
                        عنوان محتوا:{' '}
                        <span className="font-semibold text-blue-700">
                          {comment.targetLabel}
                        </span>
                      </p>
                      {comment.targetKey && comment.targetType === 'key' && (
                        <p className="text-xs text-gray-500">
                          کلید:{' '}
                          <span className="font-mono">
                            {comment.targetKey}
                          </span>
                        </p>
                      )}
                      <p className="text-gray-700 leading-relaxed mb-1">
                        {comment.content}
                      </p>
                      <p className="text-xs text-gray-400">
                        {comment.date}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ریپلای‌ها (چندسطحی) */}
                {comment.replies && comment.replies.length > 0 && (
                  <>{renderReplies(comment.replies, 1)}</>
                )}

                {/* فرم پاسخ برای کامنت ریشه */}
                {replyingTo === comment.id && (
                  <div className="mr-13 mt-4">
                    <textarea
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                      rows="3"
                      placeholder="پاسخ خود را بنویسید..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    ></textarea>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => addReply(comment.id)}
                        disabled={!replyText.trim()}
                        className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                          !replyText.trim()
                            ? 'bg-blue-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                        }`}
                      >
                        ارسال پاسخ
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions برای کامنت ریشه */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  {comment.status === 'pending' && (
                    <button
                      onClick={() =>
                        updateCommentStatus(comment.id, 'approved')
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                    >
                      <Check className="w-4 h-4" />
                      تایید
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                  >
                    <Reply className="w-4 h-4" />
                    پاسخ
                  </button>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium mr-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Comments;
