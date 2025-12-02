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

          if (tagName === 'img') {
            selected.addAttributes({ src });
          } else if (tagName === 'video') {
            selected.addAttributes({ src, controls: true });
          } else if (tagName === 'audio') {
            selected.addAttributes({ src, controls: true });
          } else if (tagName === 'a') {
            selected.addAttributes({ href: src, target: '_blank' });
          } else {
            if (uploadedAsset.get('type') === 'image') {
              const img = e.DomComponents.addComponent({
                type: 'image',
                src,
              });
              selected.append(img);
            } else if (uploadedAsset.get('type') === 'video') {
              const video = e.DomComponents.addComponent({
                tagName: 'video',
                type: 'video',
                src,
                controls: true,
              });
              selected.append(video);
            } else if (uploadedAsset.get('type') === 'audio') {
              const audio = e.DomComponents.addComponent({
                tagName: 'audio',
                type: 'audio',
                src,
                controls: true,
              });
              selected.append(audio);
            } else {
              const link = e.DomComponents.addComponent({
                tagName: 'a',
                type: 'link',
                content: uploadedAsset.get('name') || 'دانلود فایل',
                attributes: { href: src, target: '_blank' },
              });
              selected.append(link);
            }
          }
        } catch (err) {
          console.error('خطا در آپلود فایل به S3:', err);
          alert('خطا در آپلود فایل. لطفاً دوباره تلاش کنید.');
        }
      },
    },
  });

  setupButtonBehavior(e);

  e.on('load', () => {
    const wrapper = e.getWrapper();
    if (wrapper) {
      wrapper.addStyle({
        'padding-bottom': '120px',
      });

      const wrapperClasses = wrapper.getClasses();
      if (!wrapperClasses.includes('page-wrapper')) {
        wrapper.addClass('page-wrapper');
      }
    }

    const existingCss = e.getCss() || '';
    if (!existingCss.includes('.page-wrapper > *')) {
      e.setStyle(
        `${existingCss}
.page-wrapper > * {
  margin-bottom: 50px;
}
`
      );
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
      }
    }
  });

  e.on('rte:enable', () => {
    const rteToolbar = document.querySelector('.gjs-rte-toolbar');
    if (rteToolbar) {
      rteToolbar.style.display = 'none';
    }
  });

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

    while (parentElement && parentElement.nodeType !== 1) {
      parentElement = parentElement.parentNode;
    }

    if (!parentElement) return;

    const span = doc.createElement('span');
    span.style[styleProp] = styleValue;

    span.textContent = selectedText;

    range.deleteContents();
    range.insertNode(span);

    sel.removeAllRanges();
    const newRange = doc.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
  };

  e.Commands.add('bold', {
    run(editor) {
      applyTextStyle('font-weight', 'bold');
    },
  });

  e.Commands.add('italic', {
    run(editor) {
      applyTextStyle('font-style', 'italic');
    },
  });

  e.Commands.add('underline', {
    run(editor) {
      applyTextStyle('text-decoration', 'underline');
    },
  });

  e.Commands.add('strikethrough', {
    run(editor) {
      applyTextStyle('text-decoration', 'line-through');
    },
  });

  let lastSelected = null;

  e.on('component:selected', (component) => {
    lastSelected = component;

    const toolbar = [];
    const componentType = component.get('type');
    const tagName = (component.get('tagName') || '').toLowerCase();

    const hasActiveStyle = (comp, prop, val) => {
      const style = comp.getStyle() || {};
      const current = style[prop];
      if (!current) return false;
      if (prop === 'text-decoration') {
        return String(current).includes(val);
      }
      return String(current) === String(val);
    };

    const frame = e.Canvas.getFrameEl();
    let hasSelectionRange = false;

    if (frame && frame.contentDocument) {
      const sel = frame.contentDocument.getSelection();
      hasSelectionRange = sel && sel.rangeCount > 0 && sel.toString().trim().length > 0;
    }

    if (hasSelectionRange) {
      toolbar.push(
        {
          attributes: {
            class: 'fa fa-bold',
            title: 'بولد',
            style: 'background: #4f46e5; color: white;',
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
            style: 'background: #4b5563; color: white;',
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
            style: 'background: #4b5563; color: white;',
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
            style: 'background: #6b7280; color: white;',
          },
          command(editor) {
            editor.runCommand('strikethrough');
            setTimeout(() => {
              if (lastSelected) editor.select(lastSelected);
            }, 50);
          },
        }
      );
    } else {
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
              style: `background: ${isBold ? '#4f46e5' : '#1f2937'}; color: white; ${isBold ? 'box-shadow: 0 0 0 2px #818cf8;' : ''}`,
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
              style: `background: ${isItalic ? '#4f46e5' : '#374151'}; color: white; ${isItalic ? 'box-shadow: 0 0 0 2px #818cf8;' : ''}`,
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
              style: `background: ${isUnderline ? '#4f46e5' : '#4b5563'}; color: white; ${isUnderline ? 'box-shadow: 0 0 0 2px #818cf8;' : ''}`,
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
              style: `background: ${isStrike ? '#4f46e5' : '#6b7280'}; color: white; ${isStrike ? 'box-shadow: 0 0 0 2px #818cf8;' : ''}`,
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

      if (tagName !== 'body') {
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
            base['margin-left'] = '0';
            base['margin-right'] = 'auto';
          } else if (pos === 'center') {
            base['margin-left'] = 'auto';
            base['margin-right'] = 'auto';
          } else if (pos === 'left') {
            base['margin-left'] = 'auto';
            base['margin-right'] = '0';
          }

          img.addStyle(base);
        };

        const alignBlock = (comp, pos) => {
          const style = { display: 'block' };

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

          comp.addStyle(style);
        };

        const alignCommand = (pos) => (editor) => {
          const selected = editor.getSelected();
          if (!selected) return;

          const button = findButton(selected);
          if (button) {
            alignBlock(button, pos);
            return;
          }

          const mediaWrapper = findMediaWrapper(selected);
          if (mediaWrapper) {
            alignBlock(mediaWrapper, pos);
            return;
          }

          if (selected.get('tagName') === 'img') {
            alignImage(selected, pos);
            return;
          }

          if (selected.get('type') === 'file-download-box') {
            selected.removeStyle('float');
            selected.removeStyle('margin-left');
            selected.removeStyle('margin-right');

            const style = {
              display: 'flex',
              'align-items': 'center',
            };

            if (pos === 'right') {
              style['margin-left'] = '0';
              style['margin-right'] = 'auto';
              style['justify-content'] = 'flex-start';
            } else if (pos === 'center') {
              style['margin-left'] = 'auto';
              style['margin-right'] = 'auto';
              style['justify-content'] = 'center';
            } else if (pos === 'left') {
              style['margin-left'] = 'auto';
              style['margin-right'] = '0';
              style['justify-content'] = 'flex-end';
            }

            selected.addStyle(style);
            return;
          }

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
    }
  });

  e.Commands.add('align-right', {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) return;

      selected.addStyle({
        display: 'block',
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
        display: 'block',
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
        display: 'block',
        'margin-left': 'auto',
        'margin-right': '0',
      });

      editor.trigger('component:update', selected);
      selected.view.render();
    }
  });

  e.Commands.add('toggle-link', {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) return;

      let componentForModal = selected;

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

  e.Commands.add('remove-link', {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) return;

      let linkComponent = selected;

      if (linkComponent.get('tagName') !== 'a') {
        const parent = linkComponent.parent();
        if (parent && parent.get('tagName') === 'a') {
          linkComponent = parent;
        } else {
          return;
        }
      }

      const parent = linkComponent.parent();
      if (!parent) return;

      const index = linkComponent.index();
      const children = [...linkComponent.components().models];

      children.forEach((child, i) => {
        parent.append(child, { at: index + i });
      });

      linkComponent.remove();

      if (children[0]) {
        editor.select(children[0]);
      }
    },
  });

  e.Commands.add('open-link-settings', {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) return;

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

  e.Commands.add('remove-link-preserve', {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) return;

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

        editor.select(children[0]);
      }
    },
  });

  e.Commands.add('open-image-media-modal', {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected) {
        alert('لطفاً ابتدا یک تصویر را انتخاب کنید');
        return;
      }

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

  blocks.forEach((b) => {
    const blockConfig = {
      label: b.label,
      category: b.category,
    };

    if (b.id === 'video-upload') {
      blockConfig.activate = true;
      blockConfig.select = true;
      blockConfig.content = { type: 'video-upload-temp' };

      e.DomComponents.addType('video-upload-temp', {
        model: {
          defaults: {
            droppable: false,
            content:
              '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #667eea; border-radius: 12px; background: #f9fafb;">از مدال، ویدیو را انتخاب کنید.</div>',
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

    else if (b.id === 'audio-upload') {
      blockConfig.activate = true;
      blockConfig.select = true;
      blockConfig.content = { type: 'audio-upload-temp' };

      e.DomComponents.addType('audio-upload-temp', {
        model: {
          defaults: {
            droppable: false,
            content:
              '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #f093fb; border-radius: 12px; background: #f9fafb;">از مدال، صوت را انتخاب کنید.</div>',
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

    else if (b.id === 'file-upload') {
      blockConfig.activate = true;
      blockConfig.select = true;
      blockConfig.content = { type: 'file-upload-temp' };

      e.DomComponents.addType('file-upload-temp', {
        model: {
          defaults: {
            droppable: false,
            content:
              '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #4facfe; border-radius: 12px; background: #f9fafb;">از مدال، فایل را انتخاب کنید.</div>',
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

    else if (b.id === 'iframe-embed') {
      blockConfig.activate = true;
      blockConfig.select = true;
      blockConfig.content = { type: 'iframe-upload-temp' };

      e.DomComponents.addType('iframe-upload-temp', {
        model: {
          defaults: {
            droppable: false,
            content:
              '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #22c55e; border-radius: 12px; background: #f9fafb;">از مدال، آدرس آیفریم را وارد کنید.</div>',
          },
        },
      });

      e.on('block:drag:stop', (component) => {
        if (component && component.get('type') === 'iframe-upload-temp') {
          window.dispatchEvent(
            new CustomEvent('grapes:open-media-modal', {
              detail: { type: 'iframe', component },
            }),
          );
        }
      });
    }

    else if (b.id === 'icon-list') {
      blockConfig.activate = true;
      blockConfig.select = true;
      blockConfig.content = { type: 'icon-list-temp' };

      e.DomComponents.addType('icon-list-temp', {
        model: {
          defaults: {
            droppable: false,
            content: '<div style="padding: 20px; text-align: center; color: #999; border: 2px dashed #ccc; border-radius: 12px; background: #f9fafb;">در حال بارگذاری.</div>',
          },
          init() {
            setTimeout(() => {
              askItemCount()
                .then((count) => {
                  return openFormModal(count);
                })
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

                  this.replaceWith(html);
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
          'border',
          'border-width',
          'border-style',
          'border-color',
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
        this.el.style.cursor = 'pointer';
        this.el.style.minHeight = '60px';
      },
    },
  });

  return e;
}
