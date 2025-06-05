document.addEventListener('DOMContentLoaded', function() {
    // العناصر الأساسية
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const textInput = document.getElementById('textInput');
    const templateSelect = document.getElementById('templateSelect');
    const contactForm = document.getElementById('contactForm');
    
    // إنشاء عنصر Popup
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-container';
    document.body.appendChild(popupContainer);
    
    // متغيرات التطبيق
    let currentTemplate = 'poster-thumb.png';
    let backgroundImage = new Image();
    const templates = {
        'poster-thumb.png': {
            name: 'التصميم الأول',
            textPosition: { x: canvas.width / 2, y: 1036 },
            textColor: '#242f65',
            fontSize: 60,
            fontStyle: 'bold'
        },
        'template2-thumb.png': {
            name: 'التصميم الثاني',
            textPosition: { x: canvas.width / 2, y: 1600 },
            textColor: '#ffffff',
            fontSize: 70,
            fontStyle: 'normal'
        },
        'template3-thumb.png': {
            name: 'التصميم الثالث',
            textPosition: { x: canvas.width / 2, y: 1300 },
            textColor: '#000',
            fontSize: 70,
            fontStyle: 'bold'
        },
        'template4-thumb.png': {
            name: 'التصميم الرابع',
            textPosition: { x: canvas.width / 2, y: 1400 },
            textColor: '#000',
            fontSize: 70,
            fontStyle: 'normal'
        },
    };

    // تهيئة التطبيق
    initApp();

    // وظائف التهيئة
    function initApp() {
        loadTemplate(currentTemplate);
        setupTemplateGallery();
        setupContactForm();
        setupContactButtons();
        animateContactSection();
        setupEventListeners();
    }

    function setupEventListeners() {
        textInput.addEventListener('input', drawCanvas);
        window.addEventListener('resize', drawCanvas);
        document.querySelector('.download-btn').addEventListener('click', downloadImage);
        document.querySelector('.share-btn').addEventListener('click', shareImage);
        
        templateSelect.addEventListener('change', function() {
            const selectedTemplate = this.value;
            loadTemplate(selectedTemplate);
            updateSelectedTemplateInGallery(selectedTemplate);
            showPopup('success', `تم تحميل قالب ${templates[selectedTemplate].name} بنجاح`, null, 2000);
        });
    }

    // وظائف إدارة القوالب
    function loadTemplate(templateUrl) {
        currentTemplate = templateUrl;
        backgroundImage = new Image();
        backgroundImage.onload = function() {
            drawCanvas();
        };
        backgroundImage.src = templateUrl;
    }

    function setupTemplateGallery() {
        document.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', function() {
                const template = this.getAttribute('data-template');
                loadTemplate(template);
                templateSelect.value = template;
                updateSelectedTemplateInGallery(template);
                showPopup('success', `تم تحميل قالب ${templates[template].name} بنجاح`, null, 2000);
            });
        });
    }

    function updateSelectedTemplateInGallery(template) {
        document.querySelectorAll('.template-item').forEach(item => {
            item.classList.remove('selected-template');
            if (item.getAttribute('data-template') === template) {
                item.classList.add('selected-template');
            }
        });
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
        const templateConfig = templates[currentTemplate];
        
        ctx.font = `${templateConfig.fontStyle} ${templateConfig.fontSize}px font`;
        ctx.fillStyle = templateConfig.textColor;
        ctx.textAlign = 'center';
        
        // ضبط حجم الخط ليناسب العرض
        let fontSize = templateConfig.fontSize;
        const maxWidth = canvas.width * 0.8;
        let textWidth;
        
        do {
            ctx.font = `${templateConfig.fontStyle} ${fontSize}px font`;
            textWidth = ctx.measureText(text).width;
            if (textWidth > maxWidth && fontSize > 20) {
                fontSize -= 2;
            }
        } while (textWidth > maxWidth && fontSize > 20);
        
        // تأثير الظل للنصوص الداكنة
        if (templateConfig.textColor === '#242f65' || templateConfig.textColor === '#000000') {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        } else {
            ctx.shadowColor = 'transparent';
        }
        
        ctx.fillText(text, templateConfig.textPosition.x, templateConfig.textPosition.y);
        ctx.shadowColor = 'transparent';
    }

    // وظائف تحميل ومشاركة البطاقة
    function downloadImage() {
        const textValue = textInput.value.trim();
        const templateName = templates[currentTemplate].name;
        const finalText = textValue ? `بطاقة_${templateName}_لـ_${textValue}` : `بطاقة_${templateName}`;
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

    function shareImage() {
        if (navigator.share) {
            canvas.toBlob((blob) => {
                const templateName = templates[currentTemplate].name;
                const file = new File([blob], `بطاقة_${templateName}.png`, { type: 'image/png' });
                navigator.share({
                    title: `بطاقة ${templateName}`,
                    text: textInput.value ? `بطاقة ${templateName} لـ ${textInput.value}` : `بطاقة ${templateName}`,
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
            showSocialShareOptions();
        }
    }

    function showSocialShareOptions() {
        const templateName = templates[currentTemplate].name;
        const text = textInput.value ? `بطاقة ${templateName} لـ ${textInput.value}` : `بطاقة ${templateName}`;
        const imageUrl = canvas.toDataURL('image/png');
        
        showPopup('info', 'اختر منصة للمشاركة:', [
            {
                text: '<i class="fab fa-whatsapp"></i> واتساب',
                action: () => shareOnWhatsApp(text, imageUrl),
                class: 'whatsapp-btn'
            },
            {
                text: '<i class="fab fa-twitter"></i> تويتر',
                action: () => shareOnTwitter(text, imageUrl),
                class: 'twitter-btn'
            },
            {
                text: '<i class="fab fa-instagram"></i> انستقرام',
                action: () => shareOnInstagram(text, imageUrl),
                class: 'instagram-btn'
            },
            {
                text: 'إلغاء',
                action: () => {},
                class: 'cancel-btn'
            }
        ]);
    }

    // وظائف مشاركة على المنصات الاجتماعية
    function shareOnWhatsApp(text, imageUrl) {
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }

    function shareOnTwitter(text, imageUrl) {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }

    function shareOnInstagram(text, imageUrl) {
        const url = `https://www.instagram.com/`;
        window.open(url, '_blank');
        
        setTimeout(() => {
            showPopup('info', 'للمشاركة على انستقرام، يرجى حفظ الصورة أولاً ثم مشاركتها من التطبيق');
        }, 1000);
    }

    // وظائف قسم التواصل
    function setupContactForm() {
        const requiredFields = contactForm.querySelectorAll('[required]');
        
        contactForm.querySelector('#email').addEventListener('input', function() {
            validateEmailField(this);
        });
        
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateRequiredField(this);
            });
        });
        
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

        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            timestamp: new Date().toISOString()
        };

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

    // وظيفة عرض Popup
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
        
        if (buttons && Array.isArray(buttons)) {
            buttons.forEach((btn, index) => {
                const buttonElem = popup.querySelectorAll('.popup-btn')[index];
                buttonElem.addEventListener('click', () => {
                    btn.action();
                    closePopup();
                });
            });
        } else {
            popup.querySelector('.popup-btn').addEventListener('click', closePopup);
        }
        
        popupContainer.addEventListener('click', (e) => {
            if (e.target === popupContainer) closePopup();
        });
        
        popup.querySelector('.popup-close').addEventListener('click', closePopup);
        
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
});

// وظائف مساعدة عامة
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

// تأثير التمرير للسهم
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
