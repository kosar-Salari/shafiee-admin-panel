import React, { useState } from 'react';
import { MessageSquare, Check, X, Reply, Trash2, Eye, EyeOff, Search, Filter } from 'lucide-react';

const Comments = () => {
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'علی محمدی',
      email: 'ali@example.com',
      content: 'مقاله بسیار عالی بود. ممنون از محتوای مفید',
      postTitle: 'آموزش React',
      date: '1403/08/10',
      status: 'pending',
      replies: []
    },
    {
      id: 2,
      author: 'سارا احمدی',
      email: 'sara@example.com',
      content: 'آیا می‌توانید در مورد Hooks بیشتر توضیح دهید؟',
      postTitle: 'آموزش React',
      date: '1403/08/09',
      status: 'approved',
      replies: [
        {
          id: 21,
          author: 'ادمین',
          content: 'حتما، به زودی مقاله جامعی در مورد Hooks منتشر می‌کنیم',
          date: '1403/08/09'
        }
      ]
    },
    {
      id: 3,
      author: 'رضا کریمی',
      email: 'reza@example.com',
      content: 'محتوای بی‌کیفیت و تبلیغاتی',
      postTitle: 'معرفی محصول جدید',
      date: '1403/08/08',
      status: 'spam',
      replies: []
    },
    {
      id: 4,
      author: 'مریم نوری',
      email: 'maryam@example.com',
      content: 'عالی بود! منتظر مقالات بعدی هستم',
      postTitle: 'راهنمای کامل TypeScript',
      date: '1403/08/07',
      status: 'approved',
      replies: []
    },
    {
      id: 5,
      author: 'حسین رضایی',
      email: 'hossein@example.com',
      content: 'آیا می‌توانید یک پروژه عملی هم اضافه کنید؟',
      postTitle: 'آموزش Next.js',
      date: '1403/08/06',
      status: 'pending',
      replies: []
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const updateCommentStatus = (id, newStatus) => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, status: newStatus } : comment
    ));
  };

  const deleteComment = (id) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این کامنت را حذف کنید؟')) {
      setComments(comments.filter(comment => comment.id !== id));
    }
  };

  const addReply = (commentId) => {
    if (!replyText.trim()) return;

    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [
            ...comment.replies,
            {
              id: Date.now(),
              author: 'ادمین',
              content: replyText,
              date: new Date().toLocaleDateString('fa-IR')
            }
          ]
        };
      }
      return comment;
    }));

    setReplyText('');
    setReplyingTo(null);
  };

  const filteredComments = comments.filter(comment => {
    const matchesStatus = filterStatus === 'all' || comment.status === filterStatus;
    const matchesSearch = comment.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.postTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'در انتظار' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'تایید شده' },
      spam: { bg: 'bg-red-100', text: 'text-red-800', label: 'اسپم' }
    };
    const badge = badges[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const stats = {
    total: comments.length,
    pending: comments.filter(c => c.status === 'pending').length,
    approved: comments.filter(c => c.status === 'approved').length,
    spam: comments.filter(c => c.status === 'spam').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 font-lahzeh" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">مدیریت کامنت‌ها</h1>
                <p className="text-gray-500 text-sm">مدیریت و پاسخگویی به نظرات کاربران</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.total}</div>
              <div className="text-sm text-blue-800">کل کامنت‌ها</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
              <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
              <div className="text-sm text-yellow-800">در انتظار تایید</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.approved}</div>
              <div className="text-sm text-green-800">تایید شده</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl">
              <div className="text-3xl font-bold text-red-600 mb-1">{stats.spam}</div>
              <div className="text-sm text-red-800">اسپم</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="جستجو در کامنت‌ها، نویسنده یا عنوان مقاله..."
                className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">همه</option>
                <option value="pending">در انتظار</option>
                <option value="approved">تایید شده</option>
                <option value="spam">اسپم</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {filteredComments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">کامنتی یافت نشد</p>
            </div>
          ) : (
            filteredComments.map(comment => (
              <div key={comment.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {comment.author.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{comment.author}</h3>
                        <p className="text-xs text-gray-500">{comment.email}</p>
                      </div>
                      {getStatusBadge(comment.status)}
                    </div>
                    <div className="mr-13">
                      <p className="text-sm text-gray-600 mb-2">
                        مقاله: <span className="font-semibold text-blue-600">{comment.postTitle}</span>
                      </p>
                      <p className="text-gray-700 leading-relaxed mb-2">{comment.content}</p>
                      <p className="text-xs text-gray-400">{comment.date}</p>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="mr-13 mt-4 space-y-3">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="bg-blue-50 rounded-xl p-4 border-r-4 border-blue-400">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                            A
                          </div>
                          <span className="font-bold text-sm text-gray-800">{reply.author}</span>
                          <span className="text-xs text-gray-400">{reply.date}</span>
                        </div>
                        <p className="text-gray-700 text-sm mr-10">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
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
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium"
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

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  {comment.status === 'pending' && (
                    <button
                      onClick={() => updateCommentStatus(comment.id, 'approved')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                    >
                      <Check className="w-4 h-4" />
                      تایید
                    </button>
                  )}
                  {comment.status === 'approved' && (
                    <button
                      onClick={() => updateCommentStatus(comment.id, 'pending')}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium"
                    >
                      <EyeOff className="w-4 h-4" />
                      لغو تایید
                    </button>
                  )}
                  {comment.status !== 'spam' ? (
                    <button
                      onClick={() => updateCommentStatus(comment.id, 'spam')}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                    >
                      <X className="w-4 h-4" />
                      اسپم
                    </button>
                  ) : (
                    <button
                      onClick={() => updateCommentStatus(comment.id, 'pending')}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      لغو اسپم
                    </button>
                  )}
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
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