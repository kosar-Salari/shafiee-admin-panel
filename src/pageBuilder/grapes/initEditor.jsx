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
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
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

            let assetType = 'image';
            if (file.type.startsWith('video/')) {
              assetType = 'video';
            } else if (file.type.startsWith('audio/')) {
              assetType = 'audio';
            } else if (
              file.type === 'application/pdf' || 
              file.type.includes('document') || 
              file.type.includes('zip') ||
              file.type.includes('sheet') ||
              file.type.includes('text')
            ) {
              assetType = 'document';
            }

            const asset = am.add({
              src: url,
              type: assetType,
              name: file.name,
            });

            uploadedAssets.push(asset);
          }

          if (uploadedAssets.length) {
            const selected = e.getSelected();
            if (selected) {
              const tagName = selected.get('tagName');
              const uploadedAsset = uploadedAssets[0];
              
              if (tagName === 'img') {
                selected.addAttributes({ src: uploadedAsset.get('src') });
              } else if (tagName === 'video') {
                selected.addAttributes({ src: uploadedAsset.get('src') });
              } else if (tagName === 'audio') {
                selected.addAttributes({ src: uploadedAsset.get('src') });
              } else if (tagName === 'a') {
                selected.addAttributes({ 
                  href: uploadedAsset.get('src'),
                  download: uploadedAsset.get('name') || 'file'
                });
              }
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
  // 🎨 RTL
  // ===========================
  e.on('load', () => {
    const frame = e.Canvas.getFrameEl();
    if (frame && frame.contentDocument) {
      const doc = frame.contentDocument;
      if (doc.documentElement) {
        doc.documentElement.setAttribute('dir', 'rtl');
      }
      if (doc.body) {
        doc.body.setAttribute('dir', 'rtl');
        doc.body.style.direction = 'rtl';
        doc.body.style.textAlign = 'right';
        doc.body.style.padding = '20px';
        doc.body.style.boxSizing = 'border-box';
      }
    }
  });

  e.on('component:selected', (component) => {
    if (component.get('tagName') === 'body') {
      component.set('stylable', [
        'padding',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'background-color',
        'margin',
      ]);
    }
  });

  // ===========================
  // 🎬 تابع باز کردن مودال آپلود
  // ===========================
  function openUploadModal(accept, onUpload) {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      
      input.onchange = async (ev) => {
        const file = ev.target.files[0];
        if (!file) {
          reject('فایلی انتخاب نشد');
          return;
        }

        try {
          const url = await uploadFileToS3(file);
          resolve({ url, file });
        } catch (err) {
          reject(err);
        }
      };

      input.click();
    });
  }

  // ===========================
  // 📦 بلوک‌ها
  // ===========================
  blocks.forEach((b) => {
    const blockConfig = {
      label: b.label,
      category: b.category,
    };

    // ✅ بلوک آپلود ویدیو
    if (b.id === 'video-upload') {
      blockConfig.activate = true;
      blockConfig.select = true;

      e.on('block:drag:stop', (component) => {
        if (component && component.get('type') === 'video-upload-temp') {
          openUploadModal('video/*')
            .then(({ url, file }) => {
              const videoHTML = `
                <video 
                  controls 
                  src="${url}"
                  style="
                    width: 100%; 
                    max-width: 800px; 
                    height: auto; 
                    border-radius: 16px; 
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15); 
                    display: block; 
                    margin: 20px auto; 
                    background: #000;
                  "
                  data-gjs-type="video"
                >
                  مرورگر شما از ویدیو پشتیبانی نمی‌کند.
                </video>
              `;
              component.replaceWith(videoHTML);
            })
            .catch((err) => {
              console.log('❌ آپلود لغو شد:', err);
              component.remove();
            });
        }
      });

      blockConfig.content = { type: 'video-upload-temp' };

      e.DomComponents.addType('video-upload-temp', {
        model: {
          defaults: {
            droppable: false,
            content: '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #667eea; border-radius: 12px; background: #f9fafb;">در حال بارگذاری ویدیو...</div>',
          },
        },
      });
    }

    // ✅ بلوک آپلود صوت
    else if (b.id === 'audio-upload') {
      blockConfig.activate = true;
      blockConfig.select = true;

      e.on('block:drag:stop', (component) => {
        if (component && component.get('type') === 'audio-upload-temp') {
          openUploadModal('audio/*')
            .then(({ url, file }) => {
              const audioHTML = `
                <audio 
                  controls 
                  src="${url}"
                  style="
                    width: 100%; 
                    max-width: 600px; 
                    display: block; 
                    margin: 20px auto; 
                    border-radius: 12px; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                  "
                  data-gjs-type="audio"
                >
                  مرورگر شما از صوت پشتیبانی نمی‌کند.
                </audio>
              `;
              component.replaceWith(audioHTML);
            })
            .catch((err) => {
              console.log('❌ آپلود لغو شد:', err);
              component.remove();
            });
        }
      });

      blockConfig.content = { type: 'audio-upload-temp' };

      e.DomComponents.addType('audio-upload-temp', {
        model: {
          defaults: {
            droppable: false,
            content: '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #f093fb; border-radius: 12px; background: #f9fafb;">در حال بارگذاری صوت...</div>',
          },
        },
      });
    }

    // ✅ بلوک آپلود فایل
    else if (b.id === 'file-upload') {
      blockConfig.activate = true;
      blockConfig.select = true;

      e.on('block:drag:stop', (component) => {
        if (component && component.get('type') === 'file-upload-temp') {
          openUploadModal('*/*')
            .then(({ url, file }) => {
              const fileHTML = `
                <div 
                  style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    padding: 24px 32px; 
                    border-radius: 16px; 
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15); 
                    display: inline-flex; 
                    align-items: center; 
                    gap: 16px; 
                    margin: 20px 0; 
                    max-width: 500px;
                  "
                  data-gjs-type="file-download-box"
                >
                  <div style="
                    width: 48px; 
                    height: 48px; 
                    background: rgba(255,255,255,0.2); 
                    border-radius: 12px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    flex-shrink: 0;
                  ">
                    <i class="fas fa-file" style="font-size: 24px; color: white;"></i>
                  </div>
                  <div style="flex: 1;">
                    <h4 style="margin: 0 0 4px 0; color: white; font-size: 16px; font-weight: 600;">${file.name}</h4>
                    <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 13px;">حجم: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <a 
                    href="${url}" 
                    download="${file.name}" 
                    style="
                      padding: 10px 20px; 
                      background: white; 
                      color: #667eea; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: 600; 
                      font-size: 14px; 
                      flex-shrink: 0;
                    "
                  >
                    دانلود
                  </a>
                </div>
              `;
              component.replaceWith(fileHTML);
            })
            .catch((err) => {
              console.log('❌ آپلود لغو شد:', err);
              component.remove();
            });
        }
      });

      blockConfig.content = { type: 'file-upload-temp' };

      e.DomComponents.addType('file-upload-temp', {
        model: {
          defaults: {
            droppable: false,
            content: '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #4facfe; border-radius: 12px; background: #f9fafb;">در حال بارگذاری فایل...</div>',
          },
        },
      });
    }

    // لیست آیکن
    else if (b.id === 'icon-list') {
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
  // 🎨 Component Type: file-download-box (قابل ویرایش)
  // ===========================
  e.DomComponents.addType('file-download-box', {
    model: {
      defaults: {
        tagName: 'div',
        draggable: true,
        droppable: false,
        editable: true,
        stylable: [
          'background',
          'background-color',
          'background-image',
          'padding',
          'margin',
          'border-radius',
          'box-shadow',
          'width',
          'max-width',
        ],
        traits: [
          {
            type: 'text',
            label: 'لینک دانلود',
            name: 'data-download-url',
            changeProp: 1,
          },
        ],
      },
    },
  });

  // ===========================
  // 📝 مقدار اولیه HTML/CSS
  // ===========================
  if (initialHtml) e.setComponents(initialHtml);
  if (initialCss) e.setStyle(initialCss);

  e.addStyle(
    `body{font-family:'Lahzeh', ui-sans-serif, system-ui, sans-serif}`
  );

  return e;
}