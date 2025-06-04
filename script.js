document.addEventListener('DOMContentLoaded', function() {
    // العناصر الأساسية
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const textInput = document.getElementById('textInput');
    const contactForm = document.getElementById('contactForm');
    
    // إنشاء عنصر Popup
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-container';
    document.body.appendChild(popupContainer);
    
    // مسار الصورة الخلفية
    const backgroundImageUrl = 'poster.png';
    let backgroundImage = new Image();
    
    // تحميل الصورة
    backgroundImage.onload = function() {
        drawCanvas();
    };
    backgroundImage.src = backgroundImageUrl;
    
    // تهيئة قسم التواصل
    setupContactForm();
    setupContactButtons();
    animateContactSection();

    // وظيفة عرض Popup متطورة
    function showPopup(type, message, buttons = null, duration = 5000) {
        closePopup();
        
        const popup = document.createElement('div');
        popup.className = `popup popup-${type}`;
        
        let buttonsHTML = '';
        if (buttons && Array.isArray(buttons)) {
            buttonsHTML = `<div class="popup-buttons">` +
                buttons.map(btn => 
                    `<button class="popup-btn ${btn.class || ''}">${btn.text}</button>`
                ).join('') +
                `</div>`;
        } else {
            buttonsHTML = `<button class="popup-btn">حسناً</button>`;
        }
        
        popup.innerHTML = `
            <div class="popup-content">
                <span class="popup-close">&times;</span>
                <div class="popup-icon">
                    ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
                     type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' :
                     type === 'info' ? '<i class="fas fa-info-circle"></i>' :
                     '<i class="fas fa-question-circle"></i>'}
                </div>
                <h3>${type === 'success' ? 'تم بنجاح!' : 
                      type === 'error' ? 'حدث خطأ!' : 
                      type === 'info' ? 'تنبيه' :
                      'تأكيد'}</h3>
                <p>${message}</p>
                ${buttonsHTML}
            </div>
        `;
        
        popupContainer.appendChild(popup);
        popupContainer.style.display = 'flex';
        
        // إضافة أحداث للأزرار المخصصة
        if (buttons && Array.isArray(buttons)) {
            buttons.forEach((btn, index) => {
                const buttonElem = popup.querySelectorAll('.popup-btn')[index];
                buttonElem.addEventListener('click', () => {
                    btn.action();
                    closePopup();
                });
            });
        } else {
            // زر افتراضي
            popup.querySelector('.popup-btn').addEventListener('click', closePopup);
        }
        
        // إغلاق عند النقر خارج المحتوى
        popupContainer.addEventListener('click', (e) => {
            if (e.target === popupContainer) closePopup();
        });
        
        // زر الإغلاق
        popup.querySelector('.popup-close').addEventListener('click', closePopup);
        
        // إغلاق تلقائي للنوافذ غير التأكيدية
        if (duration && type !== 'confirm') {
            setTimeout(closePopup, duration);
        }
    }
    
    function closePopup() {
        popupContainer.style.display = 'none';
        while (popupContainer.firstChild) {
            popupContainer.removeChild(popupContainer.firstChild);
        }
    }
    
    // وظائف الكانفاس
    function drawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        
        if (textInput.value) {
            drawText();
        }
    }
    
    function drawText() {
        const text = textInput.value;
        ctx.font = 'bold 60px font';
        ctx.fillStyle = '#242f65';
        ctx.textAlign = 'center';
        
        let fontSize = 50;
        const textWidth = ctx.measureText(text).width;
        
        while (textWidth > canvas.width * 0.9 && fontSize > 20) {
            fontSize -= 2;
            ctx.font = `bold ${fontSize}px font`;
        }
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(text, canvas.width / 2, 1036);
        
        ctx.shadowColor = 'transparent';
    }
    
    // تحميل الصورة
    function downloadImage() {
        const textValue = textInput.value.trim();
        const finalText = textValue ? `بطاقة تهنئة لـ ${textValue}` : 'بطاقة تهنئة';
        const btn = document.querySelector('.download-btn');
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
        btn.disabled = true;
        
        setTimeout(() => {
            try {
                const dataUrl = canvas.toDataURL('image/png', 1.0);
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `${finalText}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showPopup('success', 'تم تحميل البطاقة بنجاح!');
            } catch (error) {
                showPopup('error', 'حدث خطأ أثناء تحميل البطاقة: ' + error.message);
            } finally {
                btn.innerHTML = '<i class="fas fa-download"></i> تحميل البطاقة';
                btn.disabled = false;
            }
        }, 500);
    }
    
    // مشاركة الصورة
    function shareImage() {
        if (navigator.share) {
            canvas.toBlob((blob) => {
                const file = new File([blob], 'تهنئة.png', { type: 'image/png' });
                navigator.share({
                    title: 'بطاقة تهنئة',
                    text: textInput.value ? `بطاقة تهنئة لـ ${textInput.value}` : 'بطاقة تهنئة',
                    files: [file]
                }).then(() => {
                    showPopup('success', 'تمت المشاركة بنجاح!');
                }).catch((error) => {
                    if (error.name !== 'AbortError') {
                        showPopup('error', 'حدث خطأ أثناء المشاركة: ' + error.message);
                    }
                });
            }, 'image/png');
        } else {
            showPopup('info', 'لمعاينة خاصية المشاركة، يرجى استخدام متصفح مدعوم مثل Chrome على أندرويد');
        }
    }
    
    // إعدادات قسم التواصل
    function setupContactForm() {
        const requiredFields = contactForm.querySelectorAll('[required]');
        
        // التحقق أثناء الكتابة
        contactForm.querySelector('#email').addEventListener('input', function() {
            validateEmailField(this);
        });
        
        // التحقق عند فقدان التركيز
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateRequiredField(this);
            });
        });
        
        // إرسال النموذج
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            requiredFields.forEach(field => {
                if (!field.value) {
                    field.classList.add('error');
                    isValid = false;
                }
                
                if (field.id === 'email' && field.value && !validateEmail(field.value)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                showPopup('error', 'الرجاء تعبئة جميع الحقول المطلوبة بشكل صحيح');
                return;
            }
            
            submitContactForm(this);
        });
    }
    
    function validateEmailField(field) {
        const message = field.nextElementSibling;
        if (!field.value) {
            message.textContent = '';
            return;
        }
        
        if (!validateEmail(field.value)) {
            field.classList.add('error');
            message.textContent = 'البريد الإلكتروني غير صحيح';
            message.className = 'validation-message error-message';
        } else {
            field.classList.remove('error');
            message.textContent = 'البريد الإلكتروني صحيح';
            message.className = 'validation-message success-message';
        }
    }
    
    function validateRequiredField(field) {
        const message = field.nextElementSibling;
        if (!field.value) {
            field.classList.add('error');
            message.textContent = 'هذا الحقل مطلوب';
            message.className = 'validation-message error-message';
        } else {
            field.classList.remove('error');
            message.textContent = '';
            message.className = 'validation-message';
        }
    }
    
function submitContactForm(form) {
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const nameInput = form.querySelector('#name');
    const userName = nameInput.value.trim() || 'زائرنا الكريم';

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    submitBtn.disabled = true;

    // تحضير البيانات للإرسال
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        timestamp: new Date().toISOString() // إضافة وقت الإرسال
    };

    // إرسال البيانات إلى SheetDB
    fetch('https://sheetdb.io/api/v1/3vr6w42w4kps0', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        showPopup('success', `شكراً ${userName}، تم استلام رسالتك وسنتواصل معك قريباً`);
        form.reset();
    })
    .catch(error => {
        showPopup('error', 'حدث خطأ أثناء إرسال الرسالة: ' + error.message);
    })
    .finally(() => {
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال الرسالة';
        submitBtn.disabled = false;
    });
}
    
    function setupContactButtons() {
        document.querySelector('.email-btn').addEventListener('click', function(e) {
            e.preventDefault();
            showPopup('info', 'جارٍ فتح بريد إلكتروني جديد...', null, 2000);
            setTimeout(sendEmail, 500);
        });
        
        document.querySelector('.call-btn').addEventListener('click', function(e) {
            e.preventDefault();
            showPopup('confirm', 'هل تريد الاتصال بالرقم: +966 56 985 2222؟', [
                {
                    text: 'إلغاء',
                    action: () => {},
                    class: 'cancel-btn'
                },
                {
                    text: 'اتصال',
                    action: () => makeCall(),
                    class: 'confirm-btn'
                }
            ]);
        });
    }
    
    function animateContactSection() {
        const contactSection = document.getElementById('contact');
        contactSection.style.opacity = '0';
        contactSection.style.transform = 'translateY(20px)';
        contactSection.style.transition = 'all 0.6s ease';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    contactSection.style.opacity = '1';
                    contactSection.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(contactSection);
    }
    
    // الأحداث العامة
    textInput.addEventListener('input', drawCanvas);
    window.addEventListener('resize', drawCanvas);
    document.querySelector('.download-btn').addEventListener('click', downloadImage);
    document.querySelector('.share-btn').addEventListener('click', shareImage);
});

// وظائف مساعدة
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function sendEmail() {
    const email = 'info@aloola.edu.sa';
    const subject = 'استفسار عن الخدمات';
    const body = 'أرغب في الاستفسار عن...';
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function makeCall() {
    const phoneNumber = '+966569852222';
    window.location.href = `tel:${phoneNumber}`;
}




















// إضافة تأثير التمرير للسهم
document.querySelector('.hero-scroll-indicator').addEventListener('click', function() {
    window.scrollTo({
        top: document.querySelector('.container').offsetTop,
        behavior: 'smooth'
    });
});

// تأثيرات ظهور العناصر عند التمرير
const heroSection = document.querySelector('.hero-section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, { threshold: 0.1 });

observer.observe(heroSection);






