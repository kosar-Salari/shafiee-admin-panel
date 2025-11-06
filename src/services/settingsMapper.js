// src/services/settingsMapper.js
const RTL_RIGHT_IS_BIGGER = true; 
// اگر بک می‌گوید "rightmost = position 1" این را false کن.

export function apiToLocal(api) {
  const d = api?.data || api || {};

  const apiMenu = Array.isArray(d.menuItems) ? d.menuItems : [];
  // اگر RIGHT_IS_BIGGER=true ⇒ راست‌ترین position بزرگ‌تر است، پس صعودی می‌چینیم تا idx=0 چپ‌تر شود
  // اگر false بود، برعکس کن.
  const sortedMenu = [...apiMenu].sort((a, b) =>
    RTL_RIGHT_IS_BIGGER
      ? (a.position ?? 0) - (b.position ?? 0)
      : (b.position ?? 0) - (a.position ?? 0)
  );

  const menuItems = sortedMenu.map((m, idx) => ({
    id: `m-${idx + 1}`,
    label: m.text || "",
    pageSlug: (m.link || "/").replace(/^\//, ""),
    active: true,
    order: idx + 1,
    children: [],
  }));

  const apiFooters = Array.isArray(d.footerColumns) ? d.footerColumns : [];
  const footerColumns = apiFooters.map((col, ci) => ({
    id: `f-${ci + 1}`,
    title: col.title || "",
    order: ci + 1,
    links: (col.items || [])
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((it, li) => ({
        id: `l-${ci + 1}-${li + 1}`,
        text: it.text || "",
        url: it.link || "",
        icon: "",
        position: it.position ?? li + 1,
      })),
  }));

  return {
    logo: d.logo || "",
    mainBanner: d.mainBanner || "",
    rightBanner: d.rightBanner || "",
    leftBanner: d.leftBanner || "",
    newsActive: !!d.newsActive,
    articlesActive: !!d.articlesActive,
    newsCount: Number(d.newsCount ?? 5),
    articlesCount: Number(d.articlesCount ?? 5),
    menuItems,
    footerColumns,
    imageLinks1: Array.isArray(d.imageLinks1) ? d.imageLinks1 : [],
    imageLinks2: Array.isArray(d.imageLinks2) ? d.imageLinks2 : [],
  };
}

export function localToApi(local) {
  const {
    logo, mainBanner, rightBanner, leftBanner,
    newsActive, articlesActive, newsCount, articlesCount,
    menuItems = [], footerColumns = [], imageLinks1 = [], imageLinks2 = [],
  } = local || {};

  const topLevel = [...menuItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const total = topLevel.length;

  const apiMenu = topLevel.map((m, idx) => ({
    text: m.label || "",
    link: `/${(m.pageSlug || "").replace(/^\//, "")}`,
    position: RTL_RIGHT_IS_BIGGER ? (total - idx) : (idx + 1),
  }));

  const apiFooter = [...footerColumns]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((col) => ({
      title: col.title || "",
      items: (col.links || []).map((lnk, idx) => ({
        text: lnk.text || "",
        link: lnk.url || "",
        position: lnk.position ?? (idx + 1),
      })),
    }));

  return {
    logo: logo || "",
    mainBanner: mainBanner || "",
    rightBanner: rightBanner || "",
    leftBanner: leftBanner || "",
    newsActive: !!newsActive,
    articlesActive: !!articlesActive,
    newsCount: Number(newsCount ?? 5),
    articlesCount: Number(articlesCount ?? 5),
    footerColumns: apiFooter,
    menuItems: apiMenu,
    imageLinks1,
    imageLinks2,
  };
}
