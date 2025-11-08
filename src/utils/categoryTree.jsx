// src/utils/categoryTree.js

export function buildTree(flat = []) {
  const byId = new Map();
  flat.forEach(it => {
    const id = String(it.id);
    const parentId = it.parentId != null ? String(it.parentId) : null;
    byId.set(id, { ...it, id, parentId, children: [] });
  });

  const roots = [];
  byId.forEach(node => {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export function insertNode(tree = [], node) {
  const copy = structuredClone(tree);
  const n = {
    ...node,
    id: String(node.id),
    parentId: node.parentId != null ? String(node.parentId) : null,
    children: node.children ?? [],
  };

  if (!n.parentId) {
    copy.push(n);
    return copy;
  }
  const placed = place(copy, n);
  if (!placed) copy.push(n);
  return copy;
}

function place(nodes, node) {
  for (const n of nodes) {
    if (String(n.id) === String(node.parentId)) {
      n.children = n.children || [];
      n.children.push(node);
      return true;
    }
    if (n.children?.length && place(n.children, node)) return true;
  }
  return false;
}

export function removeNode(tree = [], id) {
  const copy = structuredClone(tree);
  const removeRec = (nodes) => {
    return nodes.filter(n => {
      if (String(n.id) === String(id)) return false;
      if (n.children?.length) n.children = removeRec(n.children);
      return true;
    });
  };
  return removeRec(copy);
}

export function getPath(tree = [], id) {
  const path = [];
  const dfs = (nodes) => {
    for (const n of nodes) {
      path.push(n.name);
      if (String(n.id) === String(id)) return true;
      if (n.children?.length && dfs(n.children)) return true;
      path.pop();
    }
    return false;
  };
  return dfs(tree) ? [...path] : [];
}

// NEW: نقشه‌ی مسیرِ هر دسته برای برچسب‌گذاری دراپ‌داون
export function getPathMap(tree = [], sep = ' / ') {
  const map = {};
  const walk = (nodes, trail = []) => {
    nodes.forEach(n => {
      const label = [...trail, n.name].join(sep);
      map[String(n.id)] = label;
      if (n.children?.length) walk(n.children, [...trail, n.name]);
    });
  };
  walk(tree, []);
  return map;
}
