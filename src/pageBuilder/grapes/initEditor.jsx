import styleSectors from './styleSectors';
import blocks from './blocks';

export default function initEditor({ container, panels, initialHtml, initialCss }) {
  const e = window.grapesjs.init({
    container,
    height: '100%',
    width: 'auto',
    storageManager: false,
    plugins: ['gjs-preset-webpage', 'gjs-blocks-basic'],
    pluginsOpts: { 'gjs-preset-webpage': { blocks: [] }, 'gjs-blocks-basic': { blocks: [] } },
    canvas: {
      styles: [
        'https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css',
        '/fonts/lahzeh.css',
      ],
    },
    deviceManager: {
      devices: [
        { id: 'desktop', name: 'Desktop', width: '' },
        { id: 'tablet', name: 'Tablet', width: '768px', widthMedia: '992px' },
        { id: 'mobile', name: 'Mobile', width: '375px', widthMedia: '768px' },
      ],
    },
    blockManager: { appendTo: panels.blocks },
    layerManager: { appendTo: panels.layers },
    styleManager: { appendTo: panels.styles, sectors: styleSectors },
    traitManager: { appendTo: panels.traits },
    panels: { defaults: [] },
  });

  // بلوک‌ها
  blocks.forEach(b => e.BlockManager.add(b.id, { label: b.label, category: b.category, content: b.content }));

  if (initialHtml) e.setComponents(initialHtml);
  if (initialCss) e.setStyle(initialCss);

  // تضمین پیش‌فرض بودن فونت داخل Canvas
  e.addStyle(`body{font-family:'Lahzeh', ui-sans-serif, system-ui, sans-serif}`);

  return e;
}