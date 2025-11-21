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

  // ===========================
  // 🔧 غیرفعال کردن RTE toolbar پیش‌فرض
  // ===========================
  e.on('rte:enable', () => {
    const rteToolbar = document.querySelector('.gjs-rte-toolbar');
    if (rteToolbar) {
      rteToolbar.style.display = 'none';
    }
  });

  // ===========================
  // 📝 دستورات متنی
  // ===========================
  const applyTextStyle = (styleProp, styleValue) => {
    const selected = e.getSelected();
    if (!selected) return;

    const frame = e.Canvas.getFrameEl();
    if (!frame || !frame.contentDocument) return;

    const doc = frame.contentDocument;
    const sel = doc.getSelection();

    if (!sel || sel.rangeCount === 0) {
      const currentStyle = selected.getStyle(styleProp);

      if (currentStyle === styleValue || (styleProp === 'font-weight' && (currentStyle === '700' || currentStyle === 'bold') && styleValue === 'bold')) {
        if (styleProp === 'font-weight') {
          selected.removeStyle(styleProp);
        } else if (styleProp === 'font-style') {
          selected.removeStyle(styleProp);
        } else if (styleProp === 'text-decoration') {
          selected.removeStyle(styleProp);
        }
      } else {
        selected.addStyle({ [styleProp]: styleValue });
      }
      return;
    }

    const range = sel.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) {
      const currentStyle = selected.getStyle(styleProp);
      if (currentStyle === styleValue || (styleProp === 'font-weight' && (currentStyle === '700' || currentStyle === 'bold') && styleValue === 'bold')) {
        selected.removeStyle(styleProp);
      } else {
        selected.addStyle({ [styleProp]: styleValue });
      }
      return;
    }

    let parentElement = range.commonAncestorContainer;
    if (parentElement.nodeType === 3) {
      parentElement = parentElement.parentElement;
    }

    if (parentElement && parentElement.tagName === 'SPAN' && parentElement.hasAttribute('style')) {
      const inlineStyle = parentElement.getAttribute('style');
      const styles = {};
      inlineStyle.split(';').forEach(rule => {
        const parts = rule.split(':');
        if (parts.length === 2) {
          const prop = parts[0].trim();
          const val = parts[1].trim();
          if (prop) styles[prop] = val;
        }
      });

      let isActive = false;

      if (styleProp === 'font-weight') {
        isActive = styles[styleProp] === 'bold' || styles[styleProp] === '700';
      } else if (styleProp === 'font-style') {
        isActive = styles[styleProp] === 'italic';
      } else if (styleProp === 'text-decoration') {
        isActive = styles[styleProp] === styleValue;
      }

      if (isActive) {
        delete styles[styleProp];

        const newStyleString = Object.entries(styles)
          .map(([k, v]) => `${k}: ${v}`)
          .join('; ');

        if (newStyleString.trim()) {
          parentElement.setAttribute('style', newStyleString);
        } else {
          parentElement.removeAttribute('style');
        }

        const newRange = doc.createRange();
        newRange.selectNodeContents(parentElement);
        sel.removeAllRanges();
        sel.addRange(newRange);

        e.getWrapper().view.render();
        return;

      } else {
        styles[styleProp] = styleValue;

        const newStyleString = Object.entries(styles)
          .map(([k, v]) => `${k}: ${v}`)
          .join('; ');

        parentElement.setAttribute('style', newStyleString);

        const newRange = doc.createRange();
        newRange.selectNodeContents(parentElement);
        sel.removeAllRanges();
        sel.addRange(newRange);

        e.getWrapper().view.render();
        return;
      }
    }

    const span = doc.createElement('span');
    span.style[styleProp] = styleValue;
    span.textContent = selectedText;

    range.deleteContents();
    range.insertNode(span);

    const newRange = doc.createRange();
    newRange.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(newRange);

    e.getWrapper().view.render();
  };

  e.Commands.add('bold', {
    run(editor) {
      applyTextStyle('font-weight', 'bold');
    }
  });

  e.Commands.add('italic', {
    run(editor) {
      applyTextStyle('font-style', 'italic');
    }
  });

  e.Commands.add('underline', {
    run(editor) {
      applyTextStyle('text-decoration', 'underline');
    }
  });

  e.Commands.add('strikethrough', {
    run(editor) {
      applyTextStyle('text-decoration', 'line-through');
    }
  });

  // ===========================
  // 🎯 دستورات تراز برای همه المان‌ها
  // ===========================

  // تابع کمکی برای چک کردن تراز
  const getAlignment = (component) => {
    const float = component.getStyle('float');
    const marginLeft = component.getStyle('margin-left');
    const marginRight = component.getStyle('margin-right');
    const textAlign = component.getStyle('text-align');

    // برای تصاویر و block elements
    if (marginLeft === 'auto' && marginRight === 'auto') return 'center';
    if (float === 'right') return 'right';
    if (float === 'left') return 'left';
    
    // برای المان‌های متنی
    if (textAlign === 'center') return 'center';
    if (textAlign === 'right') return 'right';
    if (textAlign === 'left') return 'left';

    return null;
  };

  // تراز راست
  e.Commands.add('align-right', {
    run(editor, sender, options) {
      const component = options?.target || editor.getSelected();
      if (!component) return;

      const tagName = component.get('tagName');
      const isTextElement = ['text', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'a', 'button'].includes(tagName);
      const isImage = tagName === 'img';

      if (isImage) {
        // برای تصاویر
        component.setStyle({
          'display': 'block',
          'float': 'right',
          'margin-right': '0',
          'margin-left': '20px',
          'margin-top': '10px',
          'margin-bottom': '10px',
          'clear': 'none'
        });
      } else if (isTextElement) {
        // برای المان‌های متنی
        component.setStyle({
          'text-align': 'right',
          'float': 'none',
          'margin-left': '0',
          'margin-right': '0'
        });
      } else {
        // برای سایر المان‌ها (div, section, ...)
        component.setStyle({
          'display': 'block',
          'float': 'right',
          'margin-right': '0',
          'margin-left': '20px',
          'clear': 'none'
        });
      }

      setTimeout(() => editor.select(component), 50);
    },
  });

  // تراز وسط
  e.Commands.add('align-center', {
    run(editor, sender, options) {
      const component = options?.target || editor.getSelected();
      if (!component) return;

      const tagName = component.get('tagName');
      const isTextElement = ['text', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'a', 'button'].includes(tagName);
      const isImage = tagName === 'img';

      if (isImage) {
        // برای تصاویر
        component.setStyle({
          'display': 'block',
          'float': 'none',
          'margin-right': 'auto',
          'margin-left': 'auto',
          'margin-top': '10px',
          'margin-bottom': '10px',
          'clear': 'both'
        });
      } else if (isTextElement) {
        // برای المان‌های متنی
        component.setStyle({
          'text-align': 'center',
          'float': 'none',
          'margin-left': 'auto',
          'margin-right': 'auto'
        });
      } else {
        // برای سایر المان‌ها
        component.setStyle({
          'display': 'block',
          'float': 'none',
          'margin-right': 'auto',
          'margin-left': 'auto',
          'clear': 'both'
        });
      }

      setTimeout(() => editor.select(component), 50);
    },
  });

  // تراز چپ
  e.Commands.add('align-left', {
    run(editor, sender, options) {
      const component = options?.target || editor.getSelected();
      if (!component) return;

      const tagName = component.get('tagName');
      const isTextElement = ['text', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'a', 'button'].includes(tagName);
      const isImage = tagName === 'img';

      if (isImage) {
        // برای تصاویر
        component.setStyle({
          'display': 'block',
          'float': 'left',
          'margin-right': '20px',
          'margin-left': '0',
          'margin-top': '10px',
          'margin-bottom': '10px',
          'clear': 'none'
        });
      } else if (isTextElement) {
        // برای المان‌های متنی
        component.setStyle({
          'text-align': 'left',
          'float': 'none',
          'margin-left': '0',
          'margin-right': '0'
        });
      } else {
        // برای سایر المان‌ها
        component.setStyle({
          'display': 'block',
          'float': 'left',
          'margin-right': '20px',
          'margin-left': '0',
          'clear': 'none'
        });
      }

      setTimeout(() => editor.select(component), 50);
    },
  });

  // ===========================
  // 🎯 تولبار + حفظ انتخاب + نشانگر Active
  // ===========================
  let lastSelected = null;

  const hasActiveStyle = (component, styleProp, styleValue) => {
    if (!component) return false;
    const currentStyle = component.getStyle(styleProp);
    return currentStyle === styleValue;
  };

  e.on('component:selected', (component) => {
    lastSelected = component;

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

    component.set('toolbar', []);

    let toolbar = [];
    const tagName = component.get('tagName');
    const componentType = component.get('type');

    // 🔗 دکمه لینک
    toolbar.push({
      attributes: {
        class: 'fa fa-link',
        title: '🔗 افزودن لینک',
        style: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;'
      },
      command: 'open-link-modal',
    });

    // 📝 دکمه‌های متن
    const textElements = ['text', 'link', 'default', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'a'];

    if (textElements.includes(componentType) || textElements.includes(tagName)) {
      const isBold = hasActiveStyle(component, 'font-weight', 'bold') || hasActiveStyle(component, 'font-weight', '700');
      const isItalic = hasActiveStyle(component, 'font-style', 'italic');
      const isUnderline = component.getStyle('text-decoration')?.includes('underline');
      const isStrike = component.getStyle('text-decoration')?.includes('line-through');

      toolbar.push(
        {
          attributes: {
            class: 'fa fa-bold',
            title: 'بولد',
            style: `background: ${isBold ? '#4f46e5' : '#1f2937'}; color: white; ${isBold ? 'box-shadow: 0 0 0 2px #818cf8;' : ''}`
          },
          command(editor) {
            editor.runCommand('bold');
            setTimeout(() => {
              if (lastSelected) editor.select(lastSelected);
            }, 50);
          },
        },
        {
          attributes: {
            class: 'fa fa-italic',
            title: 'ایتالیک',
            style: `background: ${isItalic ? '#4f46e5' : '#374151'}; color: white; ${isItalic ? 'box-shadow: 0 0 0 2px #818cf8;' : ''}`
          },
          command(editor) {
            editor.runCommand('italic');
            setTimeout(() => {
              if (lastSelected) editor.select(lastSelected);
            }, 50);
          },
        },
        {
          attributes: {
            class: 'fa fa-underline',
            title: 'خط زیر',
            style: `background: ${isUnderline ? '#4f46e5' : '#4b5563'}; color: white; ${isUnderline ? 'box-shadow: 0 0 0 2px #818cf8;' : ''}`
          },
          command(editor) {
            editor.runCommand('underline');
            setTimeout(() => {
              if (lastSelected) editor.select(lastSelected);
            }, 50);
          },
        },
        {
          attributes: {
            class: 'fa fa-strikethrough',
            title: 'خط خورده',
            style: `background: ${isStrike ? '#4f46e5' : '#6b7280'}; color: white; ${isStrike ? 'box-shadow: 0 0 0 2px #818cf8;' : ''}`
          },
          command(editor) {
            editor.runCommand('strikethrough');
            setTimeout(() => {
              if (lastSelected) editor.select(lastSelected);
            }, 50);
          },
        }
      );
    }

    // ✨ دکمه‌های تراز برای همه المان‌ها (به جز body)
    if (tagName !== 'body') {
      const currentAlignment = getAlignment(component);

      toolbar.push(
        {
          attributes: {
            class: 'fa fa-align-right',
            title: 'تراز راست',
            style: `background: ${currentAlignment === 'right' ? '#059669' : '#10b981'}; color: white; ${currentAlignment === 'right' ? 'box-shadow: 0 0 0 2px #34d399;' : ''}`
          },
          command: {
            run: (editor, sender, options) => {
              editor.runCommand('align-right', { target: component });
            },
          },
        },
        {
          attributes: {
            class: 'fa fa-align-center',
            title: 'تراز وسط',
            style: `background: ${currentAlignment === 'center' ? '#0d9488' : '#14b8a6'}; color: white; ${currentAlignment === 'center' ? 'box-shadow: 0 0 0 2px #2dd4bf;' : ''}`
          },
          command: {
            run: (editor, sender, options) => {
              editor.runCommand('align-center', { target: component });
            },
          },
        },
        {
          attributes: {
            class: 'fa fa-align-left',
            title: 'تراز چپ',
            style: `background: ${currentAlignment === 'left' ? '#0891b2' : '#06b6d4'}; color: white; ${currentAlignment === 'left' ? 'box-shadow: 0 0 0 2px #22d3ee;' : ''}`
          },
          command: {
            run: (editor, sender, options) => {
              editor.runCommand('align-left', { target: component });
            },
          },
        }
      );
    }

    // 🎬 دکمه‌های عمومی
    toolbar.push(
      {
        attributes: {
          class: 'fa fa-copy',
          title: '📋 کپی',
          style: 'background: #3b82f6; color: white;'
        },
        command: 'tlb-clone',
      },
      {
        attributes: {
          class: 'fa fa-trash',
          title: '🗑️ حذف',
          style: 'background: #ef4444; color: white;'
        },
        command: 'tlb-delete',
      }
    );

    component.set('toolbar', toolbar);
  });

  // ===========================
  // 🎬 تابع آپلود
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

  if (initialHtml) e.setComponents(initialHtml);
  if (initialCss) e.setStyle(initialCss);

  e.addStyle(
    `body{font-family:'Lahzeh', ui-sans-serif, system-ui, sans-serif}`
  );

  return e;
}