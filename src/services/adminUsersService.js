// src/services/adminUsersService.js
import http from "./http";

export async function adminSetUserPhone(userId, phone) {
  const res = await http.post(
    `/admin/manage-users/set-user-phone/${String(userId)}`,
    { phone: String(phone) }
  );
  return res?.data;
}

function isUserIdValidationError(data) {
  return Array.isArray(data?.error) && data.error.some((x) => x?.path === "userId");
}

// ✅ امضا: (user, password) تا phone هم داشته باشیم
export async function adminSetUserPassword(user, password) {
  const pass = String(password);

  // تلاش 1: userId = id به صورت string (برای عبور از validator)
  const payload1 = { userId: String(user?.id), password: pass };
  console.log("set-user-password payload1:", payload1);

  try {
    const res = await http.post("/admin/manage-users/set-user-password", payload1);
    return res?.data;
  } catch (e) {
    const data = e?.response?.data;

    // اگر خطا مربوط به userId بود، تلاش 2: userId = phone
    if (isUserIdValidationError(data) && user?.phone) {
      const payload2 = { userId: String(user.phone), password: pass };
      console.log("set-user-password payload2:", payload2);

      const res2 = await http.post("/admin/manage-users/set-user-password", payload2);
      return res2?.data;
    }

    throw e;
  }
}

export async function adminActivateUser(userId) {
  const res = await http.post(`/admin/manage-users/activate-user/${String(userId)}`);
  return res?.data;
}

export async function adminDeactivateUser(userId) {
  const res = await http.post(`/admin/manage-users/deactivate-user/${String(userId)}`);
  return res?.data;
}
