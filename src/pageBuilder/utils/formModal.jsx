// src/utils/formModal.js

/**
 * مودال اول: دریافت تعداد آیتم‌ها
 */
export function askItemCount() {
  return new Promise((resolve, reject) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: 'Lahzeh', ui-sans-serif, system-ui, sans-serif;
      animation: fadeIn 0.2s ease;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 20px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 25px 80px rgba(0,0,0,0.4);
      padding: 0;
      animation: slideUp 0.3s ease;
    `;

    modal.innerHTML = `
      <div style="padding: 32px; text-align: center;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 10px 30px rgba(102,126,234,0.4);">
          <span style="font-size: 40px;">📝</span>
        </div>
        <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 800; color: #1f2937;">چند مورد می‌خواهید؟</h2>
        <p style="margin: 0 0 28px 0; font-size: 15px; color: #6b7280; line-height: 1.6;">تعداد آیتم‌های لیست خود را مشخص کنید</p>
        
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 24px;">
          ${[1,2,3,4,5,6,7,8,9,10].map(n => `
            <button class="count-btn" data-count="${n}" style="
              padding: 16px;
              background: ${n === 3 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6'};
              color: ${n === 3 ? 'white' : '#374151'};
              border: 2px solid ${n === 3 ? '#667eea' : '#e5e7eb'};
              border-radius: 12px;
              font-size: 18px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: ${n === 3 ? '0 4px 12px rgba(102,126,234,0.3)' : 'none'};
            ">${n}</button>
          `).join('')}
        </div>

        <div style="display: flex; gap: 12px;">
          <button id="count-cancel" style="flex: 1; padding: 14px; background: white; color: #6b7280; border: 2px solid #d1d5db; border-radius: 12px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s;">لغو</button>
          <button id="count-submit" style="flex: 2; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(102,126,234,0.3);">ادامه →</button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    let selectedCount = 3;

    // انتخاب تعداد
    modal.querySelectorAll('.count-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        selectedCount = parseInt(e.target.dataset.count);
        modal.querySelectorAll('.count-btn').forEach(b => {
          const count = parseInt(b.dataset.count);
          b.style.background = count === selectedCount ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6';
          b.style.color = count === selectedCount ? 'white' : '#374151';
          b.style.borderColor = count === selectedCount ? '#667eea' : '#e5e7eb';
          b.style.boxShadow = count === selectedCount ? '0 4px 12px rgba(102,126,234,0.3)' : 'none';
          b.style.transform = count === selectedCount ? 'scale(1.05)' : 'scale(1)';
        });
      });
    });

    // Hover effects
    modal.querySelectorAll('.count-btn').forEach(btn => {
      btn.addEventListener('mouseenter', (e) => {
        if (parseInt(e.target.dataset.count) !== selectedCount) {
          e.target.style.background = '#e5e7eb';
          e.target.style.transform = 'scale(1.05)';
        }
      });
      btn.addEventListener('mouseleave', (e) => {
        if (parseInt(e.target.dataset.count) !== selectedCount) {
          e.target.style.background = '#f3f4f6';
          e.target.style.transform = 'scale(1)';
        }
      });
    });

    const closeModal = () => {
      document.body.removeChild(overlay);
      reject('لغو شد');
    };

    modal.querySelector('#count-cancel').addEventListener('click', closeModal);
    modal.querySelector('#count-submit').addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(selectedCount);
    });

    // Animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      #count-cancel:hover { background: #f3f4f6; border-color: #9ca3af; }
      #count-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102,126,234,0.4); }
    `;
    document.head.appendChild(style);
  });
}

/**
 * مودال دوم: دریافت جزئیات هر آیتم
 */
export function openFormModal(count) {
  return new Promise((resolve, reject) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: 'Lahzeh', ui-sans-serif, system-ui, sans-serif;
      animation: fadeIn 0.2s ease;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 20px;
      width: 100%;
      max-width: 650px;
      max-height: 85vh;
      overflow: hidden;
      box-shadow: 0 25px 80px rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      padding: 28px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    `;
    header.innerHTML = `
      <div>
        <h2 style="margin: 0 0 4px 0; font-size: 22px; font-weight: 800; color: white;">✨ تنظیمات ${count} مورد لیست</h2>
        <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.85);">برای هر مورد، نوع و متن را مشخص کنید</p>
      </div>
      <button id="modal-close" style="background: rgba(255,255,255,0.2); border: none; font-size: 24px; cursor: pointer; color: white; padding: 0; width: 36px; height: 36px; border-radius: 10px; transition: all 0.2s; font-weight: 300;">✕</button>
    `;

    const body = document.createElement('div');
    body.style.cssText = 'padding: 28px 32px; overflow-y: auto; flex: 1;';

    const items = [];
    for (let i = 1; i <= count; i++) {
      const itemDiv = document.createElement('div');
      itemDiv.style.cssText = `
        margin-bottom: ${i === count ? '0' : '24px'};
        padding: 24px;
        background: linear-gradient(145deg, #f9fafb 0%, #f3f4f6 100%);
        border-radius: 16px;
        border: 2px solid #e5e7eb;
        transition: all 0.3s;
      `;
      itemDiv.addEventListener('mouseenter', () => {
        itemDiv.style.borderColor = '#667eea';
        itemDiv.style.boxShadow = '0 4px 16px rgba(102,126,234,0.15)';
      });
      itemDiv.addEventListener('mouseleave', () => {
        itemDiv.style.borderColor = '#e5e7eb';
        itemDiv.style.boxShadow = 'none';
      });

      itemDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px;">
          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 16px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(102,126,234,0.3);">${i}</div>
          <select class="item-type" data-index="${i}" style="flex: 1; padding: 12px 16px; border: 2px solid #d1d5db; border-radius: 12px; font-size: 15px; font-weight: 600; background: white; cursor: pointer; transition: all 0.2s; color: #1f2937;">
            <option value="circle">⚫ دایره مشکی</option>
            <option value="icon">🎨 آیکن FontAwesome</option>
            <option value="image">🖼️ عکس (آپلود یا لینک)</option>
          </select>
        </div>

        <div class="value-container" data-index="${i}" style="margin-bottom: 16px;">
          <!-- محتوا داینامیک -->
        </div>

        <div>
          <label style="display: block; font-size: 14px; font-weight: 700; color: #374151; margin-bottom: 8px;">
            ✍️ متن مورد ${i}
          </label>
          <input type="text" class="item-text" data-index="${i}" value="مورد ${i} لیست" style="width: 100%; padding: 12px 16px; border: 2px solid #d1d5db; border-radius: 12px; font-size: 15px; font-weight: 500; transition: all 0.2s;" />
        </div>
      `;

      body.appendChild(itemDiv);
      items.push(itemDiv);
    }

    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 24px 32px;
      border-top: 2px solid #e5e7eb;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      flex-shrink: 0;
      background: #fafbfc;
    `;
    footer.innerHTML = `
      <button id="modal-cancel" style="padding: 14px 28px; background: white; color: #6b7280; border: 2px solid #d1d5db; border-radius: 12px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s;">لغو</button>
      <button id="modal-submit" style="padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">✅ ساخت لیست</button>
    `;

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // 🎯 تابع آپدیت فیلد value
    function updateValueField(index, type) {
      const container = body.querySelector(`.value-container[data-index="${index}"]`);
      container.innerHTML = '';

      if (type === 'icon') {
        container.innerHTML = `
          <label style="display: block; font-size: 14px; font-weight: 700; color: #374151; margin-bottom: 8px;">
            🎨 کلاس آیکن FontAwesome
          </label>
          <input type="text" class="item-value" data-index="${index}" placeholder="مثال: fas fa-check-circle" style="width: 100%; padding: 12px 16px; border: 2px solid #d1d5db; border-radius: 12px; font-size: 14px; font-weight: 500; font-family: 'Courier New', monospace; transition: all 0.2s;" />
          <p style="font-size: 12px; color: #6b7280; margin-top: 8px; line-height: 1.5;">💡 از <a href="https://fontawesome.com/icons" target="_blank" style="color: #667eea; font-weight: 600; text-decoration: none;">fontawesome.com/icons</a> کد آیکن رو کپی کنید</p>
        `;
      } else if (type === 'image') {
        container.innerHTML = `
          <label style="display: block; font-size: 14px; font-weight: 700; color: #374151; margin-bottom: 8px;">
            🖼️ انتخاب عکس
          </label>
          <div style="display: flex; gap: 10px; margin-bottom: 12px;">
            <button class="upload-btn" data-index="${index}" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(16,185,129,0.3);">
              📤 آپلود عکس
            </button>
            <button class="link-btn" data-index="${index}" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(59,130,246,0.3);">
              🔗 لینک عکس
            </button>
          </div>
          <input type="file" class="file-input" data-index="${index}" accept="image/*" style="display: none;" />
          <div style="position: relative;">
            <input type="text" class="item-value" data-index="${index}" placeholder="لینک یا Base64 عکس..." readonly style="width: 100%; padding: 12px 16px; border: 2px solid #d1d5db; border-radius: 12px; font-size: 13px; background: #f9fafb; color: #4b5563; font-family: 'Courier New', monospace; padding-right: 44px;" />
            <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 18px;">🖼️</span>
          </div>
        `;

        const uploadBtn = container.querySelector('.upload-btn');
        const fileInput = container.querySelector('.file-input');
        const valueInput = container.querySelector('.item-value');
        const linkBtn = container.querySelector('.link-btn');

        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              valueInput.value = ev.target.result;
              valueInput.style.color = '#10b981';
            };
            reader.readAsDataURL(file);
          }
        });

        linkBtn.addEventListener('click', () => {
          const url = prompt('لینک عکس را وارد کنید:', 'https://via.placeholder.com/40x40');
          if (url) {
            valueInput.value = url;
            valueInput.style.color = '#3b82f6';
          }
        });
      }
    }

    // اولیه‌سازی
    for (let i = 1; i <= count; i++) {
      updateValueField(i, 'circle');
    }

    // تغییر type
    body.querySelectorAll('.item-type').forEach((select) => {
      select.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        const type = e.target.value;
        updateValueField(index, type);
      });
      select.addEventListener('focus', (e) => {
        e.target.style.borderColor = '#667eea';
        e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.1)';
      });
      select.addEventListener('blur', (e) => {
        e.target.style.borderColor = '#d1d5db';
        e.target.style.boxShadow = 'none';
      });
    });

    // Focus effects for text inputs
    body.querySelectorAll('.item-text').forEach(input => {
      input.addEventListener('focus', (e) => {
        e.target.style.borderColor = '#667eea';
        e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.1)';
      });
      input.addEventListener('blur', (e) => {
        e.target.style.borderColor = '#d1d5db';
        e.target.style.boxShadow = 'none';
      });
    });

    const closeModal = () => {
      document.body.removeChild(overlay);
      reject('لغو شد');
    };

    header.querySelector('#modal-close').addEventListener('click', closeModal);
    footer.querySelector('#modal-cancel').addEventListener('click', closeModal);

    // ✅ ساخت لیست
    footer.querySelector('#modal-submit').addEventListener('click', () => {
      const data = [];
      for (let i = 1; i <= count; i++) {
        const type = body.querySelector(`.item-type[data-index="${i}"]`).value;
        const text = body.querySelector(`.item-text[data-index="${i}"]`).value;
        let value = '';

        if (type === 'icon' || type === 'image') {
          const input = body.querySelector(`.item-value[data-index="${i}"]`);
          value = input ? input.value.trim() : '';
        }

        data.push({ type, value, text });
      }
      
      console.log('✅ Data collected:', data); // برای دیباگ
      document.body.removeChild(overlay);
      resolve(data);
    });

    // Styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      #modal-close:hover { background: rgba(255,255,255,0.3); transform: rotate(90deg); }
      #modal-cancel:hover { background: #f3f4f6; border-color: #9ca3af; }
      #modal-submit:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16,185,129,0.4); }
      .upload-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(16,185,129,0.4); }
      .link-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(59,130,246,0.4); }
      .item-type:hover { border-color: #9ca3af; }
      .item-text:hover, .item-value:hover { border-color: #9ca3af; }
    `;
    document.head.appendChild(style);
  });
}