// src/pageBuilder/grapes/buttonSetup.js
export function setupButtonBehavior(editor) {
  // وقتی یه بلاک رها می‌شه روی صفحه
  editor.on('block:drag:stop', (component) => {
    if (!component) return;

    let btn = component;

    // اگه خود بلاک container باشه، دنبال <a data-button-variant> بگرد
    if (btn.get('tagName') !== 'a') {
      const found = component.find('a[data-button-variant]')[0];
      if (!found) return;
      btn = found;
    }

    const attrs = btn.getAttributes() || {};
    if (!attrs['data-button-variant']) return;

    // دکمه رو انتخاب کن
    editor.select(btn);

    // 🔥 مدال تنظیمات دکمه رو باز کن
    editor.runCommand('open-button-modal', { componentId: btn.getId() });
  });

  // ✅ Command برای تعویض آیکن/عکس
  editor.Commands.add('change-button-icon', {
    async run(editor) {
      const selected = editor.getSelected();
      if (!selected) return;

      // پیدا کردن img داخل دکمه
      const imgComponent = selected.find('img[data-gjs-type="image"]')[0];
      if (!imgComponent) {
        alert('این دکمه آیکن/عکس ندارد');
        return;
      }

      // باز کردن Asset Manager
      const am = editor.AssetManager;
      
      am.open({
        select: (asset) => {
          imgComponent.addAttributes({ src: asset.get('src') });
          am.close();
        },
        types: ['image'],
        accept: 'image/*',
      });
    },
  });

  // ✅ اضافه کردن دکمه تعویض آیکن به تولبار
  editor.on('component:selected', (component) => {
    const attrs = component.getAttributes() || {};
    
    if (attrs['data-button-variant'] === 'with-icon') {
      const toolbar = component.get('toolbar') || [];
      
      const hasIconButton = toolbar.some(item => 
        item.command === 'change-button-icon'
      );

      if (!hasIconButton) {
        toolbar.unshift({
          attributes: {
            class: 'fa fa-image',
            title: '🖼️ تعویض آیکن/عکس',
            style: 'background: #10b981; color: white;'
          },
          command: 'change-button-icon',
        });

        component.set('toolbar', toolbar);
      }
    }
  });
}