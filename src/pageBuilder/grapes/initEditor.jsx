// src/pageBuilder/grapes/initEditor.js
import styleSectors from './styleSectors';
import blocks from './blocks';
import { askItemCount, openFormModal } from '../utils/formModal';
import { uploadFileToS3 } from '../../services/filesService';

export default function initEditor({ container, panels, initialHtml, initialCss }) {
  const e = window.grapesjs.init({
    container,
    height: '100%',
    width: 'auto',
    storageManager: false,

    plugins: ['gjs-preset-webpage', 'gjs-blocks-basic'],
    pluginsOpts: {
      'gjs-preset-webpage': { blocks: [] },
      'gjs-blocks-basic': { blocks: [] },
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

    // ✅ مدیریت مدیا: آپلود مستقیم به S3
    assetManager: {
      upload: false,
      autoAdd: true,
      multiUpload: true,

      async uploadFile(ev) {
        try {
          const files =
            ev.dataTransfer?.files ||
            ev.target?.files ||
            ev.files ||
            [];

          if (!files.length) return;

          const am = e.AssetManager;
          const uploadedAssets = [];

          for (let i = 0; i < files.length; i++) {
            const file = files[i];

            const url = await uploadFileToS3(file);

            const asset = am.add({
              src: url,
              // اگر بعداً ویدیو خواستی اینجا type رو تنظیم کن
              // type: file.type.startsWith('video/') ? 'video' : 'image',
            });

            uploadedAssets.push(asset);
          }

          // اگر یک image انتخاب شده بود، src را روی اولین آپلود ست کن
          if (uploadedAssets.length) {
            const selected = e.getSelected();
            if (selected && selected.is('image')) {
              selected.addAttributes({ src: uploadedAssets[0].get('src') });
            }
          }
        } catch (err) {
          console.error('خطا در آپلود فایل به S3:', err);
          alert('خطا در آپلود فایل. لطفاً دوباره تلاش کنید.');
        }
      },
    },
  });

  // ===========================
  // بلوک‌ها
  // ===========================
  blocks.forEach((b) => {
    const blockConfig = {
      label: b.label,
      category: b.category,
    };

    if (b.id === 'icon-list') {
      blockConfig.activate = true;
      blockConfig.select = true;

      e.on('block:drag:stop', (component) => {
        if (component && component.get('type') === 'icon-list-temp') {
          askItemCount()
            .then((count) => openFormModal(count))
            .then((items) => {
              let html = '<div style="padding: 20px;">';
              items.forEach((item, idx) => {
                let iconHTML = '';

                if (item.type === 'circle') {
                  iconHTML = `
                    <div style="
                      width: 12px;
                      height: 12px;
                      background: #1f2937;
                      border-radius: 50%;
                      flex-shrink: 0;
                    "></div>`;
                } else if (item.type === 'icon' && item.value) {
                  iconHTML = `
                    <i class="${item.value}"
                       style="font-size: 20px; color: #10b981; flex-shrink: 0;"></i>`;
                } else if (item.type === 'image' && item.value) {
                  iconHTML = `
                    <img src="${item.value}"
                         style="width: 32px; height: 32px; object-fit: cover; border-radius: 6px; flex-shrink: 0;"
                         data-gjs-type="image" />`;
                }

                const marginBottom = idx === items.length - 1 ? '0' : '16px';

                html += `
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: ${marginBottom};
                  ">
                    ${iconHTML}
                    <p style="margin: 0; font-size: 16px; color: #374151;">
                      ${item.text}
                    </p>
                  </div>
                `;
              });
              html += '</div>';

              component.replaceWith(html);
            })
            .catch((err) => {
              console.log('❌ لغو شد:', err);
              component.remove();
            });
        }
      });

      blockConfig.content = { type: 'icon-list-temp' };

      e.DomComponents.addType('icon-list-temp', {
        model: {
          defaults: {
            droppable: false,
            content:
              '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #ccc; border-radius: 12px; background: #f9fafb;">در حال بارگذاری...</div>',
          },
        },
      });
    } else {
      blockConfig.content = b.content;
    }

    e.BlockManager.add(b.id, blockConfig);
  });

  // ===========================
  // مقدار اولیه HTML/CSS
  // ===========================
  if (initialHtml) e.setComponents(initialHtml);
  if (initialCss) e.setStyle(initialCss);

  e.addStyle(
    `body{font-family:'Lahzeh', ui-sans-serif, system-ui, sans-serif}`
  );

  return e;
}
