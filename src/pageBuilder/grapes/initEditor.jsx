import styleSectors from './styleSectors';
import blocks from './blocks';
import { askItemCount, openFormModal } from '../utils/formModal';

export default function initEditor({ container, panels, initialHtml, initialCss }) {
  const e = window.grapesjs.init({
    container,
    height: '100%',
    width: 'auto',
    storageManager: false,
    plugins: ['gjs-preset-webpage', 'gjs-blocks-basic'],
    pluginsOpts: { 
      'gjs-preset-webpage': { blocks: [] }, 
      'gjs-blocks-basic': { blocks: [] } 
    },
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
    styleManager: { 
      appendTo: panels.styles, 
      sectors: styleSectors,
    },
    traitManager: { appendTo: panels.traits },
    panels: { defaults: [] },
    
    colorPicker: {
      appendTo: 'parent',
      offset: { top: 26, left: -166 },
    },
  });

  // بلوک‌ها
  blocks.forEach(b => {
    const blockConfig = { 
      label: b.label, 
      category: b.category
    };

    // 🎯 بلوک لیست با آیکن - با مودال دو مرحله‌ای
    if (b.id === 'icon-list') {
      blockConfig.activate = true; // فعال‌سازی رویداد کلیک
      blockConfig.select = true;
      
      e.on('block:drag:stop', (component) => {
        if (component && component.get('type') === 'icon-list-temp') {
          askItemCount()
            .then(count => openFormModal(count))
            .then(items => {
              console.log('✅ Final items:', items); // دیباگ
              
              // ساخت HTML نهایی
              let html = '<div style="padding: 20px;">';
              items.forEach((item, idx) => {
                let iconHTML = '';
                
                if (item.type === 'circle') {
                  iconHTML = `<div style="width: 12px; height: 12px; background: #1f2937; border-radius: 50%; flex-shrink: 0;"></div>`;
                } else if (item.type === 'icon' && item.value) {
                  iconHTML = `<i class="${item.value}" style="font-size: 20px; color: #10b981; flex-shrink: 0;"></i>`;
                } else if (item.type === 'image' && item.value) {
                  iconHTML = `<img src="${item.value}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 6px; flex-shrink: 0;" data-gjs-type="image" />`;
                }

                const marginBottom = idx === items.length - 1 ? '0' : '16px';
                
                html += `
                  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: ${marginBottom};">
                    ${iconHTML}
                    <p style="margin: 0; font-size: 16px; color: #374151;">${item.text}</p>
                  </div>
                `;
              });
              html += '</div>';
              
              // جایگزینی component موقت با محتوای نهایی
              component.replaceWith(html);
            })
            .catch(err => {
              console.log('❌ لغو شد:', err);
              component.remove(); // حذف اگر لغو شد
            });
        }
      });

      // یک بلوک موقت برای trigger کردن drag
      blockConfig.content = { type: 'icon-list-temp' };
      
      // تعریف کامپوننت موقت
      e.DomComponents.addType('icon-list-temp', {
        model: {
          defaults: {
            droppable: false,
            content: '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #ccc; border-radius: 12px; background: #f9fafb;">در حال بارگذاری...</div>',
          },
        },
      });
      
    } else {
      blockConfig.content = b.content;
    }
    
    e.BlockManager.add(b.id, blockConfig);
  });

  if (initialHtml) e.setComponents(initialHtml);
  if (initialCss) e.setStyle(initialCss);
  
  e.addStyle(`body{font-family:'Lahzeh', ui-sans-serif, system-ui, sans-serif}`);
  
  return e;
}