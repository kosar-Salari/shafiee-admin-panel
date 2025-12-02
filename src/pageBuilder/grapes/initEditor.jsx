



// src/pageBuilder/grapes/initEditor.js
import styleSectors from './styleSectors';
import blocks from './blocks';
import { askItemCount, openFormModal } from '../utils/formModal';
import { uploadFileToS3 } from '../../services/filesService';
import { setupButtonBehavior } from './buttonSetup';

export default function initEditor({ container, panels, initialHtml, initialCss }) {
  const e = window.grapesjs.init({
    container,
    height: '100%',
    width: 'auto',
    storageManager: false,

    plugins: ['gjs-blocks-basic'],
    pluginsOpts: {
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

          if (!uploadedAssets.length) return;

          const selected = e.getSelected();
          if (!selected) return;

          const uploadedAsset = uploadedAssets[0];
          const src = uploadedAsset.get('src');
          const tagName = (selected.get('tagName') || '').toLowerCase();

          if (tagName === 'img' || tagName === 'video' || tagName === 'audio') {
            // فقط همون رفتاری که قبلش داشتی
            selected.addAttributes({ src });
          } else if (tagName === 'a') {
            selected.addAttributes({
              href: src,
              download: uploadedAsset.get('name') || 'file',
            });
          }
        } catch (err) {
          console.error('خطا در آپلود فایل به S3:', err);
          alert('خطا در آپلود فایل. لطفاً دوباره تلاش کنید.');
        }
      },
    },

  });

  setupButtonBehavior(e);

  e.on('component:add', (component) => {
    const wrapper = e.getWrapper();
    const parent = component.parent && component.parent();

    // فقط المان‌هایی که مستقیم داخل صفحه‌اند (نه داخل کانتینرها)
    if (parent === wrapper) {
      const style = component.getStyle ? component.getStyle() : {};

      // اگر خودش margin-bottom مشخص نکرده بود، پیش‌فرض بگذار
      if (!style['margin-bottom'] && !style.margin) {
        component.addStyle({
          'margin-bottom': '50px',
        });
      }
    }
  });
  // ===========================
  // 🎨 RTL
  // ===========================
  // ===========================
  // 🎨 RTL + فاصله انتهای صفحه
  // ===========================
  e.on('load', () => {
    // ✅ به خود wrapper (ریشه‌ی صفحه) padding-bottom بده
    const wrapper = e.getWrapper();
    if (wrapper) {
      wrapper.addStyle({
        'padding-bottom': '120px',   // هرچقدر دوست داری اینجا فاصله باشه
      });
    }

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

        // ❌ این خط را دیگر لازم نداریم
        // doc.body.style.paddingBottom = '50px';
      }
    }
  });


  e.on('rte:enable', () => {
    const rteToolbar = document.querySelector('.gjs-rte-toolbar');
    if (rteToolbar) {
      rteToolbar.style.display = 'none';
    }
  });

  // ===========================
  // 📝 دستورات متنی - با قابلیت Toggle
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
  // 🎯 تولبار + حفظ انتخاب + نشانگر Active
  // ===========================
  let lastSelected = null;

  const hasActiveStyle = (component, styleProp, styleValue) => {
    if (!component) return false;
    const currentStyle = component.getStyle(styleProp);
    return currentStyle === styleValue;
  };

  // ✅ قسمت component:selected در initEditor.js را با این جایگزین کن:

  // ✅ این کد رو جایگزین قسمت component:selected در initEditor.js کن

  e.on('component:selected', (component) => {
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
      // 🆕 اگر روی خود iframe کلیک شده، والد iframe-wrapper را انتخاب کن
      if (component.get('tagName') === 'iframe') {
        const parent = component.parent && component.parent();
        const attrs = parent?.getAttributes ? parent.getAttributes() : {};
        if (attrs && attrs['data-gjs-type'] === 'iframe-wrapper') {
          e.select(parent);
          return; // دوباره event برای parent صدا زده می‌شود
        }
      }

      // 🆕 اگر روی خود audio کلیک شده، والد audio-wrapper را انتخاب کن
      if (component.get('tagName') === 'audio') {
        const parent = component.parent && component.parent();
        const attrs = parent?.getAttributes ? parent.getAttributes() : {};
        if (attrs && attrs['data-gjs-type'] === 'audio-wrapper') {
          e.select(parent);
          return;
        }
      }


      lastSelected = component;

      // محدود کردن استایل برای body
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

      // ----------------- پیدا کردن نزدیک‌ترین <a> (برای متن داخل لینک) -----------------
      let linkComponent = null;
      let cur = component;
      while (cur) {
        if (cur.get('tagName') === 'a') {
          linkComponent = cur;
          break;
        }
        cur = cur.parent && cur.parent();
      }

      const tagName = component.get('tagName');
      const componentType = component.get('type');

      const isButton =
        !!linkComponent &&
        !!((linkComponent.getAttributes() || {})['data-button-variant']);

      // تولبار را از اول بساز
      const toolbar = [];

      // ===========================
      // 🔗 دکمه لینک / تنظیمات دکمه
      // ===========================
      if (isButton) {
        // برای دکمه‌ها فقط تنظیمات دکمه
        toolbar.push({
          attributes: {
            class: 'fa fa-cog',
            title: '⚙️ تنظیمات دکمه',
            style:
              'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;',
          },
          command(editor) {
            editor.runCommand('open-button-modal');
          },
        });
      } else {
        // برای متن/لینک‌ معمولی – همیشه آیکن لینک را نشان بده
        toolbar.push({
          attributes: {
            class: 'fa fa-link',
            title: linkComponent ? '🔗 ویرایش لینک' : '🔗 افزودن لینک',
            style:
              'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;',
          },
          command() {
            const target = linkComponent || component;
            window.dispatchEvent(
              new CustomEvent('grapes:open-link-modal', {
                detail: { component: target },
              }),
            );
          },
        });
      }

      // ===========================
      // 🔓 دکمه حذف لینک + پاک کردن استایل‌های لینک
      // ===========================
      if (linkComponent && !isButton) {
        toolbar.push({
          attributes: {
            class: 'fa fa-unlink',
            title: '🔓 حذف لینک',
            style: 'background: #ef4444; color: white;',
          },
          command(editor) {
            const link = linkComponent;
            const parent = link.parent();
            if (!parent) return;

            const children = link.components().models.slice();
            const index = link.index();

            // ۱) CSS هاور مربوط به متن لینک را از CSS کلی ادیتور پاک کن
            let css = editor.getCss() || '';
            children.forEach((child) => {
              const childId = child.getId && child.getId();
              if (childId) {
                const re = new RegExp(`#${childId}:hover[\\s\\S]*?}`, 'g');
                css = css.replace(re, '');
              }

              // ۲) استایل‌های لینک‌طور روی خود متن را پاک کن
              child.removeStyle('color');
              child.removeStyle('text-decoration');
              child.removeStyle('transition');
              child.removeStyle('transform');
            });
            editor.setStyle(css);

            // ۳) children را از داخل <a> در بیار و بنداز سر جای خود لینک
            children.forEach((child, i) => {
              parent.append(child, { at: index + i });
            });

            // ۴) خود لینک را حذف کن
            link.remove();

            // ۵) دوباره یکی از بچه‌ها را انتخاب کن
            if (children[0]) {
              editor.select(children[0]);
            }
          },
        });
      }

      // ===========================
      // 📝 ابزارهای متنی (Bold/Italic/Underline/Strike)
      // ===========================
      const textElements = [
        'text',
        'link',
        'default',
        'p',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'span',
        'div',
        'a',
      ];

      if (
        textElements.includes(componentType) ||
        textElements.includes(tagName)
      ) {
        const isBold =
          hasActiveStyle(component, 'font-weight', 'bold') ||
          hasActiveStyle(component, 'font-weight', '700');
        const isItalic = hasActiveStyle(component, 'font-style', 'italic');
        const textDecoration = component.getStyle('text-decoration') || '';
        const isUnderline = String(textDecoration).includes('underline');
        const isStrike = String(textDecoration).includes('line-through');

        toolbar.push(
          {
            attributes: {
              class: 'fa fa-bold',
              title: 'بولد',
              style: `background: ${isBold ? '#4f46e5' : '#1f2937'
                }; color: white; ${isBold ? 'box-shadow: 0 0 0 2px #818cf8;' : ''
                }`,
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
              style: `background: ${isItalic ? '#4f46e5' : '#374151'
                }; color: white; ${isItalic ? 'box-shadow: 0 0 0 2px #818cf8;' : ''
                }`,
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
              style: `background: ${isUnderline ? '#4f46e5' : '#4b5563'
                }; color: white; ${isUnderline ? 'box-shadow: 0 0 0 2px #818cf8;' : ''
                }`,
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
              style: `background: ${isStrike ? '#4f46e5' : '#6b7280'
                }; color: white; ${isStrike ? 'box-shadow: 0 0 0 2px #818cf8;' : ''
                }`,
            },
            command(editor) {
              editor.runCommand('strikethrough');
              setTimeout(() => {
                if (lastSelected) editor.select(lastSelected);
              }, 50);
            },
          },
        );
      }

      // ===========================
      // 📐 تراز راست/وسط/چپ (برای همه جز body)
      // ===========================
      if (tagName !== 'body') {
        // پیدا کردن نزدیک‌ترین دکمه (<a data-button-variant>)
        const findButton = (comp) => {
          let cur = comp;
          while (cur) {
            if (cur.get && cur.get('tagName') === 'a') {
              const aAttrs = cur.getAttributes ? cur.getAttributes() : {};
              if (aAttrs['data-button-variant']) {
                return cur;
              }
            }
            cur = cur.parent && cur.parent();
          }
          return null;
        };

        // 🆕 پیدا کردن نزدیک‌ترین wrapper آیفریم یا صوت
        const findMediaWrapper = (comp) => {
          let cur = comp;
          while (cur) {
            const attrs = cur.getAttributes ? cur.getAttributes() : {};
            const type = cur.get ? cur.get('type') : null;

            if (
              attrs['data-gjs-type'] === 'iframe-wrapper' ||
              type === 'iframe-wrapper' ||
              attrs['data-gjs-type'] === 'audio-wrapper' ||
              type === 'audio-wrapper'
            ) {
              return cur;
            }

            cur = cur.parent && cur.parent();
          }
          return null;
        };

        const alignImage = (img, pos) => {
          if (!img) return;
          img.removeStyle('float');
          img.removeStyle('margin-left');
          img.removeStyle('margin-right');

          const base = { display: 'block' };

          if (pos === 'right') {
            img.addStyle({
              ...base,
              'margin-left': '0',
              'margin-right': 'auto',
            });
          } else if (pos === 'center') {
            img.addStyle({
              ...base,
              'margin-left': 'auto',
              'margin-right': 'auto',
            });
          } else if (pos === 'left') {
            img.addStyle({
              ...base,
              'margin-left': 'auto',
              'margin-right': '0',
            });
          }
        };

        const alignBlock = (el, pos) => {
          if (!el) return;

          // فقط margin و float را دستکاری می‌کنیم؛ display دست‌نخورده می‌ماند
          el.removeStyle('float');
          el.removeStyle('margin-left');
          el.removeStyle('margin-right');

          const style = {};

          if (pos === 'right') {
            style['margin-left'] = '0';
            style['margin-right'] = 'auto';
          } else if (pos === 'center') {
            style['margin-left'] = 'auto';
            style['margin-right'] = 'auto';
          } else if (pos === 'left') {
            style['margin-left'] = 'auto';
            style['margin-right'] = '0';
          }

          el.addStyle(style);
        };

        const alignCommand = (pos) => (editor) => {
          const selected = editor.getSelected();
          if (!selected) return;

          // ۱) اگر داخل دکمه‌ایم → والد دکمه را تراز کن
          const btn = findButton(selected);
          if (btn) {
            const parent = btn.parent && btn.parent();
            if (parent) {
              parent.removeStyle('margin-left');
              parent.removeStyle('margin-right');
              parent.removeStyle('float');

              parent.addStyle({
                display: 'block',
                'text-align':
                  pos === 'right'
                    ? 'right'
                    : pos === 'center'
                      ? 'center'
                      : 'left',
              });
            }
            return;
          }

          // 🆕 ۲) اگر آیفریم، صوت، یا داخل wrapper هستیم → خود wrapper را تراز کن
          const mediaWrapper = findMediaWrapper(selected);
          if (mediaWrapper) {
            alignBlock(mediaWrapper, pos);
            return;
          }

          // ۳) اگر خود المان img بود → تراز روی خود عکس
          if (selected.get('tagName') === 'img') {
            alignImage(selected, pos);
            return;
          }
          // ۴) اگر خود کامپوننت فایل است → هم خودش تراز شود هم محتوا فلکسی بماند
          if (selected.get('type') === 'file-download-box') {
            // حذف استایل‌های قدیمی margin/float
            selected.removeStyle('float');
            selected.removeStyle('margin-left');
            selected.removeStyle('margin-right');

            const style = {
              display: 'flex',          // مطمئن شو فلکس می‌ماند
              'align-items': 'center',
            };

            // چون صفحه RTL است:
            // right = سمت راست، left = سمت چپ
            if (pos === 'right') {
              style['margin-left'] = '0';
              style['margin-right'] = 'auto';
              style['justify-content'] = 'flex-start';   // آیکون/متن سمت راست
            } else if (pos === 'center') {
              style['margin-left'] = 'auto';
              style['margin-right'] = 'auto';
              style['justify-content'] = 'center';
            } else if (pos === 'left') {
              style['margin-left'] = 'auto';
              style['margin-right'] = '0';
              style['justify-content'] = 'flex-end';      // آیکون/متن سمت چپ
            }

            selected.addStyle(style);
            return; // دیگر alignBlock روی این نوع اجرا نشود
          }

          // ۵) بقیه‌ی المان‌ها (div, p, ...) → مثل قبل با margin
          alignBlock(selected, pos);

          // ۴) بقیه‌ی المان‌ها (div, p, ...) → مثل قبل با margin
          alignBlock(selected, pos);
        };

        toolbar.push(
          {
            attributes: {
              class: 'fa fa-align-right',
              title: '→ تراز راست',
              style: 'background: #10b981; color: white;',
            },
            command: alignCommand('right'),
          },
          {
            attributes: {
              class: 'fa fa-align-center',
              title: '○ تراز وسط',
              style: 'background: #14b8a6; color: white;',
            },
            command: alignCommand('center'),
          },
          {
            attributes: {
              class: 'fa fa-align-left',
              title: '← تراز چپ',
              style: 'background: #06b6d4; color: white;',
            },
            command: alignCommand('left'),
          },
        );
      }

      // ===========================
      // 📋 کپی / حذف
      // ===========================
      toolbar.push(
        {
          attributes: {
            class: 'fa fa-copy',
            title: '📋 کپی',
            style: 'background: #3b82f6; color: white;',
          },
          command: 'tlb-clone',
        },
        {
          attributes: {
            class: 'fa fa-trash',
            title: '🗑️ حذف',
            style: 'background: #ef4444; color: white;',
          },
          command: 'tlb-delete',
        },
      );

      component.set('toolbar', toolbar);
    });



  });
  // ===========================
  // ✅ اضافه کردن Commands برای تراز
  // ===========================

  e.Commands.add('align-right', {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) return;

      selected.addStyle({
        'display': 'block',
        'margin-left': '0',
        'margin-right': 'auto',
      });

      editor.trigger('component:update', selected);
      selected.view.render();
    }
  });

  e.Commands.add('align-center', {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) return;

      selected.addStyle({
        'display': 'block',
        'margin-left': 'auto',
        'margin-right': 'auto',
      });

      editor.trigger('component:update', selected);
      selected.view.render();
    }
  });

  e.Commands.add('align-left', {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) return;

      selected.addStyle({
        'display': 'block',
        'margin-left': 'auto',
        'margin-right': '0',
      });

      editor.trigger('component:update', selected);
      selected.view.render();
    }
  });


  // ✅ Command برای باز کردن مدال لینک (افزودن / ویرایش)
  e.Commands.add('toggle-link', {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) return;

      let componentForModal = selected;

      // اگر داخل یک <a> هستیم، خودِ <a> را برای مدال بفرست
      const parent = selected.parent();
      if (selected.get('tagName') !== 'a' && parent && parent.get('tagName') === 'a') {
        componentForModal = parent;
      }

      window.dispatchEvent(
        new CustomEvent('grapes:open-link-modal', {
          detail: { component: componentForModal },
        })
      );
    },
  });

  // ✅ Command برای «حذف لینک»
  e.Commands.add('remove-link', {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) return;

      let linkComponent = selected;

      // اگر خود انتخاب <a> نیست، ببین داخل لینک هست یا نه
      if (linkComponent.get('tagName') !== 'a') {
        const parent = linkComponent.parent();
        if (parent && parent.get('tagName') === 'a') {
          linkComponent = parent;
        } else {
          // چیزی برای حذف نیست
          return;
        }
      }

      const parent = linkComponent.parent();
      if (!parent) return;

      const index = linkComponent.index();
      const children = [...linkComponent.components().models];

      // بچه‌های لینک را به جای خودش در والد قرار بده
      children.forEach((child, i) => {
        parent.append(child, { at: index + i });
      });

      linkComponent.remove();

      if (children[0]) {
        editor.select(children[0]);
      }
    },
  });
  // 🎯 باز کردن مدال لینک (برای ساخت یا ویرایش)
  e.Commands.add('open-link-settings', {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) return;

      // اگر داخل یک لینک است، خود <a> را برای مدال بفرست
      let component = selected;
      let current = selected;
      while (current) {
        if (current.get && current.get('tagName') === 'a') {
          component = current;
          break;
        }
        current = current.parent && current.parent();
      }

      window.dispatchEvent(
        new CustomEvent('grapes:open-link-modal', {
          detail: { component },
        }),
      );
    },
  });
  // 🔓 حذف لینک و نگه داشتن محتوا
  e.Commands.add('remove-link', {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) return;

      // پیدا کردن نزدیک‌ترین <a>
      let linkComponent = selected;
      while (linkComponent && linkComponent.get('tagName') !== 'a') {
        linkComponent =
          linkComponent.parent && linkComponent.parent();
      }

      if (!linkComponent || linkComponent.get('tagName') !== 'a') return;

      const parent = linkComponent.parent();
      const index = linkComponent.index();
      const children = [...linkComponent.components().models];

      if (parent && children.length) {
        children.forEach((child, i) => {
          parent.append(child, { at: index + i });
        });

        linkComponent.remove();

        // انتخاب اولین بچه بعد از حذف
        editor.select(children[0]);
      }
    },
  });



  // ===========================
  // 🎬 تابع آپلود
  // ===========================

  // ✅ باز کردن مدال مدیا برای تصویر
  e.Commands.add('open-image-media-modal', {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) {
        alert('لطفاً ابتدا یک تصویر را انتخاب کنید');
        return;
      }

      // اگر خود المان img نیست، سعی کن نزدیک‌ترین img را پیدا کنی
      let target = selected;
      if (target.get('tagName') !== 'img') {
        const imgInside = target.find && target.find('img')[0];
        if (imgInside) {
          target = imgInside;
        }
      }

      if (target.get('tagName') !== 'img') {
        alert('این المان تصویر نیست');
        return;
      }

      window.dispatchEvent(
        new CustomEvent('grapes:open-media-modal', {
          detail: { type: 'image', component: target },
        }),
      );
    },
  });

  // ===========================
  // 📦 بلوک‌ها
  // ===========================
  blocks.forEach((b) => {
    const blockConfig = {
      label: b.label,
      category: b.category,
    };

    // ویدیو
    if (b.id === 'video-upload') {
      blockConfig.activate = true;
      blockConfig.select = true;
      blockConfig.content = { type: 'video-upload-temp' };

      e.DomComponents.addType('video-upload-temp', {
        model: {
          defaults: {
            droppable: false,
            content:
              '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #667eea; border-radius: 12px; background: #f9fafb;">از مدال، ویدیو را انتخاب کنید...</div>',
          },
        },
      });

      e.on('block:drag:stop', (component) => {
        if (component && component.get('type') === 'video-upload-temp') {
          window.dispatchEvent(
            new CustomEvent('grapes:open-media-modal', {
              detail: { type: 'video', component },
            }),
          );
        }
      });
    }

    // صوت
    else if (b.id === 'audio-upload') {
      blockConfig.activate = true;
      blockConfig.select = true;
      blockConfig.content = { type: 'audio-upload-temp' };

      e.DomComponents.addType('audio-upload-temp', {
        model: {
          defaults: {
            droppable: false,
            content:
              '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #f093fb; border-radius: 12px; background: #f9fafb;">از مدال، صوت را انتخاب کنید...</div>',
          },
        },
      });

      e.on('block:drag:stop', (component) => {
        if (component && component.get('type') === 'audio-upload-temp') {
          window.dispatchEvent(
            new CustomEvent('grapes:open-media-modal', {
              detail: { type: 'audio', component },
            }),
          );
        }
      });
    }

    // فایل
    else if (b.id === 'file-upload') {
      blockConfig.activate = true;
      blockConfig.select = true;
      blockConfig.content = { type: 'file-upload-temp' };

      e.DomComponents.addType('file-upload-temp', {
        model: {
          defaults: {
            droppable: false,
            content:
              '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #4facfe; border-radius: 12px; background: #f9fafb;">از مدال، فایل را انتخاب کنید...</div>',
          },
        },
      });

      e.on('block:drag:stop', (component) => {
        if (component && component.get('type') === 'file-upload-temp') {
          window.dispatchEvent(
            new CustomEvent('grapes:open-media-modal', {
              detail: { type: 'file', component },
            }),
          );
        }
      });
    }
    // 🌐 آیفریم
    else if (b.id === 'iframe-embed') {
      blockConfig.activate = true;
      blockConfig.select = true;
      blockConfig.content = { type: 'iframe-upload-temp' };

      e.DomComponents.addType('iframe-upload-temp', {
        model: {
          defaults: {
            droppable: false,
            content:
              '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #22c55e; border-radius: 12px; background: #f9fafb;">از مدال، آدرس آیفریم را وارد کنید...</div>',
          },
        },
      });

      e.on('block:drag:stop', (component) => {
        if (component && component.get('type') === 'iframe-upload-temp') {
          window.dispatchEvent(
            new CustomEvent('grapes:open-media-modal', {
              detail: { type: 'iframe', component }, // 🟣 همون type که به MediaModal دادیم
            }),
          );
        }
      });
    }

    // ✅ FIX: لیست با آیکن - اصلاح کامل
    else if (b.id === 'icon-list') {
      blockConfig.activate = true;
      blockConfig.select = true;
      blockConfig.content = { type: 'icon-list-temp' };

      // تعریف کامپوننت موقت
      e.DomComponents.addType('icon-list-temp', {
        model: {
          defaults: {
            droppable: false,
            content: '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #ccc; border-radius: 12px; background: #f9fafb;">در حال بارگذاری...</div>',
          },
          init() {
            // ✅ فوراً بعد از اضافه شدن به صفحه، مدال باز می‌شه
            setTimeout(() => {
              console.log('🎯 Component icon-list-temp added, opening modal...');

              askItemCount()
                .then((count) => {
                  console.log('✅ Item count received:', count);
                  return openFormModal(count);
                })
                .then((items) => {
                  console.log('✅ Form data received:', items);

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

                  // جایگزینی کامپوننت موقت با HTML نهایی
                  this.replaceWith(html);
                  console.log('✅ Component replaced with final HTML');
                })
                .catch((err) => {
                  console.log('❌ Modal cancelled:', err);
                  this.remove();
                });
            }, 100);
          }
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
          'border',           // ✅ اضافه شد
          'border-width',     // ✅ اضافه شد
          'border-style',     // ✅ اضافه شد
          'border-color',     // ✅ اضافه شد
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
  // ✅ کامپوننت مخصوص رَپر آیفریم — قابل ریسایز
  e.DomComponents.addType('iframe-wrapper', {
    model: {
      defaults: {
        tagName: 'div',
        draggable: true,
        droppable: false,
        resizable: 1,
        stylable: [
          'width',
          'max-width',
          'margin',
          'border-radius',
          'box-shadow',
        ],
      },
    },
  });

  // ✅ کامپوننت مخصوص رَپر صوت — قابل ریسایز و سلکت
  e.DomComponents.addType('audio-wrapper', {
    model: {
      defaults: {
        tagName: 'div',
        draggable: true,
        droppable: true,
        selectable: true,
        hoverable: true,
        resizable: 1,
        stylable: [
          'width',
          'max-width',
          'margin',
          'border-radius',
          'box-shadow',
        ],
      },
    },
    view: {
      onRender() {
        // جلوگیری از سلکت شدن audio داخلی
        const audioEl = this.el.querySelector('audio');
        if (audioEl) {
          audioEl.style.pointerEvents = 'none';
        }
      },
    },
  });

  if (initialHtml) e.setComponents(initialHtml);
  if (initialCss) e.setStyle(initialCss);

  e.addStyle(
    `body{font-family:'Lahzeh', ui-sans-serif, system-ui, sans-serif}`
  );
  // ✅ کامپوننت wrapper برای لیست‌ها - راحت‌تر قابل انتخاب
  e.DomComponents.addType('list-wrapper', {
    model: {
      defaults: {
        tagName: 'div',
        draggable: true,
        droppable: true,
        selectable: true,
        hoverable: true,
        highlightable: true,
        stylable: [
          'background',
          'background-color',
          'padding',
          'margin',
          'border-radius',
          'border',
          'border-width',
          'border-style',
          'border-color',
          'box-shadow',
          'width',
          'max-width',
        ],
        traits: [],
      },
    },
    view: {
      onRender() {
        // اطمینان از اینکه wrapper به راحتی قابل کلیک است
        this.el.style.cursor = 'pointer';
        this.el.style.minHeight = '60px';
      },
    },
  });
  return e;
}


