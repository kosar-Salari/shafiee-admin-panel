// src/services/commentsService.js
import http from './http';

// گرفتن همه کامنت‌ها
export const getAllComments = async () => {
    const res = await http.get('/admin/manage-comments/');
    // سرور میگه { data: [...] }، پس اینجا فقط آرایه رو برگردون
    return res.data?.data || [];
};

// فقط کامنت‌های تایید نشده (اگه جایی لازم شد)
export const getUnacceptedComments = async () => {
    const res = await http.get('/admin/manage-comments/unaccepted');
    return res.data?.data || [];
};

// تایید کامنت
export const acceptComment = async (id) => {
    const res = await http.patch(`/admin/manage-comments/${id}/accept`);
    return res.data;
};

// حذف کامنت
export const deleteCommentById = async (id) => {
    const res = await http.delete(`/admin/manage-comments/${id}`);
    return res.data;
};

// پاسخ به کامنت
export const replyToComment = async (id, { name, email, content }) => {
    const res = await http.post(`/admin/manage-comments/${id}/reply`, {
        name,
        email,
        content,
    });
    return res.data;
};
