const RTL_RIGHT_IS_BIGGER = true;

/** API → UI */
export function apiToLocal(api) {
  const d = api?.data || api || {};

  // menuItems
  const apiMenu = Array.isArray(d.menuItems) ? d.menuItems : [];
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

  // footerColumns
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

  // لینک‌های بالا/پایین بنر
  const imageLinks1 = Array.isArray(d.imageLinks1) ? d.imageLinks1.slice().sort((a,b)=>(a.position??0)-(b.position??0)) : [];
  const imageLinks2 = Array.isArray(d.imageLinks2) ? d.imageLinks2.slice().sort((a,b)=>(a.position??0)-(b.position??0)) : [];
  const imageLinksMain = Array.isArray(d.imageLinksMain) ? d.imageLinksMain.slice().sort((a,b)=>(a.position??0)-(b.position??0)) : [];

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
    imageLinks1, // [{image, link, position}]
    imageLinks2, // [{image, link, position}]
    imageLinksMain, // [{image, imageMobile, link, position}] - slider banners
  };
}

/** UI → API */
export function localToApi(local) {
  const {
    logo, mainBanner, rightBanner, leftBanner,
    newsActive, articlesActive, newsCount, articlesCount,
    menuItems = [], footerColumns = [], imageLinks1 = [], imageLinks2 = [], imageLinksMain = [],
  } = local || {};

  // منو
  const topLevel = [...menuItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const total = topLevel.length;
  const apiMenu = topLevel.map((m, idx) => ({
    text: m.label || "",
    link: `/${(m.pageSlug || "").replace(/^\//, "")}`,
    position: RTL_RIGHT_IS_BIGGER ? (total - idx) : (idx + 1),
  }));

  // فوتر
  const apiFooter = [...footerColumns]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((col) => ({
      title: col.title || "",
      items: (col.links || [])
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((lnk, idx) => ({
          text: lnk.text || "",
          link: lnk.url || "",
          position: lnk.position ?? (idx + 1),
        })),
    }));

  // لینک‌های بنر (جفتش همون فرمت خواسته‌شده‌ی بک‌اند)
  const norm = (arr=[]) =>
    arr
      .slice()
      .sort((a,b)=>(a.position??0)-(b.position??0))
      .map((x, i) => ({
        image: x.image || "",
        link: x.link || "",
        position: x.position ?? (i + 1),
      }));

  // برای imageLinksMain که imageMobile هم دارد
  const normMain = (arr=[]) =>
    arr
      .slice()
      .sort((a,b)=>(a.position??0)-(b.position??0))
      .map((x, i) => ({
        image: x.image || "",
        imageMobile: x.imageMobile || x.image || "",
        link: x.link || "",
        position: x.position ?? (i + 1),
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
    imageLinks1: norm(imageLinks1),
    imageLinks2: norm(imageLinks2),
    imageLinksMain: normMain(imageLinksMain),
  };
}
