const TOKEN_KEY = 'admin_token';
const ADMIN_INFO_KEY = 'admin_info';

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  return String(role ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '');
}

function toBool(v) {
  // پشتیبانی از true/false, "true"/"false", 1/0, "1"/"0"
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true' || s === '1') return true;
    if (s === 'false' || s === '0') return false;
  }
  return false;
}

function decodeJwt(token) {
  try {
    const payloadPart = token?.split?.('.')[1];
    if (!payloadPart) return null;

    const b64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);

    const json = atob(padded);
    return safeJsonParse(json);
  } catch {
    return null;
  }
}

function extractUsername(obj) {
  return (
    obj?.username ??
    obj?.data?.username ??
    obj?.admin?.username ??
    obj?.user?.username ??
    ''
  );
}

function extractRole(obj) {
  return (
    obj?.role ??
    obj?.data?.role ??
    obj?.admin?.role ??
    obj?.user?.role ??
    null
  );
}

// ✅ استخراج IsMain از ساختارهای مختلف
function extractIsMain(obj) {
  return (
    obj?.IsMain ??
    obj?.isMain ??
    obj?.is_main ??
    obj?.data?.IsMain ??
    obj?.data?.isMain ??
    obj?.admin?.IsMain ??
    obj?.admin?.isMain ??
    obj?.user?.IsMain ??
    obj?.user?.isMain ??
    null
  );
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function setAdminInfo(info) {
  // ✅ adminInfo را استاندارد ذخیره می‌کنیم: username + role + isMain
  const normalized = {
    username: info?.username ?? '',
    role: normalizeRole(info?.role) || 'admin',
    isMain: toBool(info?.isMain ?? info?.IsMain),
  };
  localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(normalized));
}

export function getAdminInfo() {
  const token = getToken();
  const payload = token ? decodeJwt(token) : null;

  const raw = localStorage.getItem(ADMIN_INFO_KEY);
  const parsed = safeJsonParse(raw);

  // اولویت: اگر JWT اطلاعات بدهد، مرجع آن است
  const usernameFromToken = payload ? extractUsername(payload) : '';
  const roleFromTokenRaw = payload ? extractRole(payload) : null;
  const roleFromToken = roleFromTokenRaw ? normalizeRole(roleFromTokenRaw) : '';
  const isMainFromToken = payload ? toBool(extractIsMain(payload)) : false;

  const storedUsername = parsed?.username ?? '';
  const storedRole = normalizeRole(parsed?.role) || '';
  const storedIsMain = toBool(parsed?.isMain ?? parsed?.IsMain);

  // اگر توکن چیزی دارد، خروجی را از توکن بساز و sync کن
  if (payload && (usernameFromToken || roleFromToken || isMainFromToken)) {
    const finalInfo = {
      username: usernameFromToken || storedUsername || '',
      role: roleFromToken || storedRole || 'admin',
      isMain: Boolean(isMainFromToken || storedIsMain),
    };

    const needsSync =
      !parsed ||
      storedUsername !== finalInfo.username ||
      storedRole !== finalInfo.role ||
      storedIsMain !== finalInfo.isMain;

    if (needsSync) {
      localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(finalInfo));
    }

    return finalInfo;
  }

  // اگر توکن چیزی نداد، از storage برگردان
  if (parsed && typeof parsed === 'object') {
    return {
      username: storedUsername,
      role: storedRole || 'admin',
      isMain: storedIsMain,
    };
  }

  return null;
}

export function clearAdminInfo() {
  localStorage.removeItem(ADMIN_INFO_KEY);
}

// ✅ superadmin/main را بر اساس IsMain تشخیص بده (و در صورت نبودن، role)
export function isSuperadmin(adminInfo) {
  if (toBool(adminInfo?.isMain ?? adminInfo?.IsMain)) return true;
  return normalizeRole(adminInfo?.role) === 'superadmin';
}
