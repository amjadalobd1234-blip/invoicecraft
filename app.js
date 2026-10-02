/*!
 * InvoiceCraft — Professional Invoice Generator
 * Pure HTML/CSS/JavaScript · No backend · Data stays in the browser (localStorage)
 *
 * Sections:
 *  1. Config            6. Editor UI (form, items, totals)
 *  2. Translations      7. Live preview (invoice HTML)
 *  3. Helpers           8. Drafts, autosave, numbering
 *  4. State             9. PDF export & print
 *  5. Calculations     10. Actions, events & init
 *                      11. Share (WhatsApp · email · image)
 *                      12. Saved clients (+ export / import)
 *                      13. Service templates
 */
(() => {
  'use strict';

  /* =====================================================================
     1. CONFIG — tweak these to rebrand / customize
     ===================================================================== */
  const KEYS = {                         // localStorage keys
    autosave: 'ic.autosave',
    drafts:   'ic.drafts',
    counter:  'ic.counter',
    prefs:    'ic.prefs',
    clients:  'invoicecraft.clients',   // saved clients (export/import friendly)
    services: 'invoicecraft.services'   // reusable service templates
  };
  const NUMBER_PREFIX = 'INV-';          // → INV-001, INV-002 …
  const NUMBER_PAD = 3;
  const AUTOSAVE_MS = 30000;             // auto-save every 30 seconds
  const PAGE_W = 794, PAGE_H = 1123;     // A4 at 96 dpi (CSS px)
  const MAX_LOGO_MB = 5;
  const TEMPLATES = ['minimal', 'classic', 'modern'];
  const ACCENTS = ['#2563eb', '#1e40af', '#0284c7', '#4f46e5', '#0f766e', '#334155', '#0f172a'];
  const CURRENCIES = ['USD', 'EUR', 'GBP', 'IQD', 'SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD',
                      'EGP', 'MAD', 'TRY', 'CAD', 'AUD', 'CHF', 'INR', 'PKR', 'JPY', 'CNY', 'BRL', 'MXN', 'NGN', 'ZAR'];

  /* =====================================================================
     2. TRANSLATIONS (English / Arabic)
     ===================================================================== */
  const I18N = {
    en: {
      brandTag: 'Invoice Generator', new: 'New', sample: 'Sample Data', save: 'Save Draft', drafts: 'Load Draft',
      clear: 'Clear All', print: 'Print', download: 'Download PDF', langToggle: 'العربية',
      tabEdit: 'Edit', tabPreview: 'Preview',
      secDesign: 'Design', template: 'Template', tplMinimal: 'Minimal', tplClassic: 'Classic', tplModern: 'Modern',
      accent: 'Accent color', customColor: 'Custom color',
      secFrom: 'Your Business', secClient: 'Bill To', secDetails: 'Invoice Details', secItems: 'Line Items',
      secTotals: 'Tax & Discount', secNotes: 'Notes & Terms',
      logoDrop: 'Click or drop your logo', logoHint: `PNG, JPG or SVG · max ${MAX_LOGO_MB} MB`, logoRemove: 'Remove',
      name: 'Full name', company: 'Company', email: 'Email', phone: 'Phone', address: 'Address',
      phName: 'Jane Doe', phCompany: 'Acme Studio', phEmail: 'jane@acme.com', phPhone: '+1 555 000 1234',
      phAddress: 'Street, City, Country', phClientName: 'Client name', phClientCompany: 'Client company',
      phClientEmail: 'billing@client.com',
      invNumber: 'Invoice #', currency: 'Currency', issueDate: 'Issue date', dueDate: 'Due date',
      dueIn: 'Due in (days):', dueNow: 'On receipt',
      status: 'Status stamp', stNone: 'None', stUnpaid: 'Unpaid', stPaid: 'Paid', stOverdue: 'Overdue',
      description: 'Description', qty: 'Qty', rate: 'Rate', amount: 'Amount',
      phItem: 'Item or service description', addItem: 'Add item', removeItem: 'Remove item',
      taxRate: 'Tax rate (%)', discount: 'Discount',
      notes: 'Notes', terms: 'Payment terms',
      phNotes: 'Thank you for your business!', phTerms: 'e.g. Payment due within 14 days. Bank: … IBAN: …',
      subtotal: 'Subtotal', tax: 'Tax', discountLbl: 'Discount', total: 'Total', amountDue: 'Amount due',
      privacy: '🔒 100% private — your data never leaves this browser.',
      livePreview: 'Live preview', previewSub: 'A4 · updates as you type',
      // Invoice document labels
      invTitle: 'Invoice', invFrom: 'From', invTo: 'Bill to', invIssued: 'Issue date', invDue: 'Due date',
      invNotes: 'Notes', invTerms: 'Payment terms', invThanks: 'Thank you for your business!',
      invNoItems: 'No line items yet — add your first item in the editor.',
      // Status & messages
      statusSaved: 'Saved {t}', statusUnsaved: 'Unsaved changes', statusReady: 'Auto-save on',
      draftsTitle: 'Saved drafts', draftsEmpty: 'No drafts yet',
      draftsEmptyHint: 'Click “Save Draft” to keep an invoice for later.', open: 'Open', del: 'Delete',
      noClient: 'No client', cancel: 'Cancel',
      confirmClearTitle: 'Clear everything?',
      confirmClearMsg: 'All fields of the current invoice will be erased. Saved drafts are not affected.',
      confirmClearOk: 'Clear all',
      confirmDelTitle: 'Delete this draft?', confirmDelMsg: 'Draft {n} will be permanently deleted.', confirmDelOk: 'Delete',
      toastSaved: 'Draft {n} saved', toastLoaded: 'Draft {n} opened', toastDeleted: 'Draft deleted',
      toastCleared: 'Invoice cleared', toastSample: 'Sample invoice loaded', toastNew: 'New invoice {n} — your business details were kept',
      toastPdf: 'Generating PDF…', toastPdfOk: 'PDF downloaded', toastPdfErr: 'Could not create the PDF. Try Print → “Save as PDF”.',
      toastLib: 'PDF engine not loaded (offline?). Use Print → “Save as PDF” instead.',
      toastLogoBig: `Logo is too large (max ${MAX_LOGO_MB} MB)`, toastBadImg: 'Please choose an image file',
      toastQuota: 'Browser storage is full — delete some drafts or use a smaller logo.',
      toastWelcome: 'Welcome! Here’s a sample invoice — press “New” to start your own.',
      // ---- Share, clients, services (v2) ----
      shareGroup: 'Share invoice',
      shareWa: 'WhatsApp', shareMail: 'Gmail', shareImg: 'Copy image',
      shareWaTitle: 'Share on WhatsApp', shareMailTitle: 'Send by email (Gmail or your mail app)', shareImgTitle: 'Copy invoice as an image',
      toastImgBusy: 'Preparing image…', toastImgCopied: 'Invoice copied as image ✓',
      toastImgDownloaded: 'Clipboard not supported here — image downloaded instead ✓',
      toastImgErr: 'Could not create the image. Try Download PDF instead.',
      toastTextCopied: 'No client email — invoice text copied to clipboard ✓', toastCopyFail: 'Could not copy the text',
      secClients: 'Saved Clients', clientSearchPh: 'Search by name, company or email',
      clientUse: 'Use', clientEdit: 'Edit', clientDel: 'Delete', clientAdd: '+ Add new client',
      clientsExport: 'Export clients', clientsImport: 'Import clients',
      clientsEmpty: 'No saved clients yet', clientsEmptyHint: 'Add a client, or save one after downloading an invoice.',
      clientsNoMatch: 'No clients match your search',
      clientStats: 'Invoices: {c} · Billed: {t}',
      clientFormAdd: 'Add client', clientFormEdit: 'Edit client', saveBtn: 'Save', back: 'Back',
      clientNeedName: 'Please enter a name or a company.', clientBadEmail: 'Please enter a valid email address.',
      clientDupEmail: 'A client with this email already exists.',
      toastClientSaved: 'Client saved', toastClientUpdated: 'Client updated', toastClientDeleted: 'Client deleted',
      toastClientUsed: '{n} filled in “Bill To”',
      confirmDelClientTitle: 'Delete this client?', confirmDelClientMsg: '{n} will be removed from your saved clients.',
      askSaveClient: 'Ask me to save new clients after downloading a PDF',
      saveClientTitle: 'Save this client for future use?', saveClientYes: 'Yes, save', saveClientNo: 'No, thanks', saveClientNever: 'Don’t ask again',
      toastNeverAsk: 'Got it — you can turn this back on in Saved Clients',
      toastClientsExported: 'Exported {n} client(s)', toastClientsNone: 'There are no saved clients to export yet',
      toastClientsImported: 'Imported {n} client(s)', toastClientsSkipped: ' · {s} duplicate(s) skipped',
      toastImportBad: 'Invalid file — choose a JSON file exported from InvoiceCraft',
      servicesBtn: 'Saved services', servicesTitle: 'Saved services', servicesHint: 'Tap a service to add it to your invoice.',
      serviceSearchPh: 'Search services', serviceAdd: '+ Add new service',
      serviceFormAdd: 'New service', serviceFormEdit: 'Edit service', serviceName: 'Service name', serviceDesc: 'Description (optional)',
      phServiceName: 'e.g. Logo design', phServiceDesc: 'e.g. 3 concepts + 2 revisions',
      servicesEmpty: 'No saved services yet', servicesEmptyHint: 'Add one here, or tap the star next to any item description to save it.',
      servicesNoMatch: 'No services match your search',
      serviceUsed: 'Used {n}×', serviceNeedName: 'Please enter a service name.', serviceDup: 'A service with this name already exists.',
      toastServiceSaved: 'Service saved', toastServiceUpdated: 'Service updated', toastServiceDeleted: 'Service deleted',
      toastServiceAdded: '“{n}” added to the invoice',
      confirmDelServiceTitle: 'Delete this service?', confirmDelServiceMsg: '“{n}” will be removed from your saved services.',
      starSave: 'Save as a reusable service', starSaved: 'Saved — click to update its price'
    },
    ar: {
      brandTag: 'مُنشئ الفواتير', new: 'جديدة', sample: 'بيانات تجريبية', save: 'حفظ كمسودة', drafts: 'فتح مسودة',
      clear: 'مسح الكل', print: 'طباعة', download: 'تحميل PDF', langToggle: 'English',
      tabEdit: 'تحرير', tabPreview: 'معاينة',
      secDesign: 'التصميم', template: 'القالب', tplMinimal: 'بسيط', tplClassic: 'كلاسيكي', tplModern: 'عصري',
      accent: 'اللون الأساسي', customColor: 'لون مخصص',
      secFrom: 'بيانات عملك', secClient: 'فاتورة إلى', secDetails: 'تفاصيل الفاتورة', secItems: 'البنود',
      secTotals: 'الضريبة والخصم', secNotes: 'ملاحظات وشروط',
      logoDrop: 'انقر أو اسحب شعارك هنا', logoHint: `PNG أو JPG أو SVG · الحد ${MAX_LOGO_MB} ميغابايت`, logoRemove: 'إزالة',
      name: 'الاسم الكامل', company: 'الشركة', email: 'البريد الإلكتروني', phone: 'الهاتف', address: 'العنوان',
      phName: 'محمد أحمد', phCompany: 'استوديو الإبداع', phEmail: 'name@company.com', phPhone: '+964 770 000 0000',
      phAddress: 'الشارع، المدينة، الدولة', phClientName: 'اسم العميل', phClientCompany: 'شركة العميل',
      phClientEmail: 'billing@client.com',
      invNumber: 'رقم الفاتورة', currency: 'العملة', issueDate: 'تاريخ الإصدار', dueDate: 'تاريخ الاستحقاق',
      dueIn: 'الاستحقاق خلال (أيام):', dueNow: 'عند الاستلام',
      status: 'ختم الحالة', stNone: 'بدون', stUnpaid: 'غير مدفوعة', stPaid: 'مدفوعة', stOverdue: 'متأخرة',
      description: 'الوصف', qty: 'الكمية', rate: 'السعر', amount: 'المبلغ',
      phItem: 'وصف المنتج أو الخدمة', addItem: 'إضافة بند', removeItem: 'حذف البند',
      taxRate: 'نسبة الضريبة (%)', discount: 'الخصم',
      notes: 'ملاحظات', terms: 'شروط الدفع',
      phNotes: 'شكراً لتعاملكم معنا!', phTerms: 'مثال: يُستحق الدفع خلال 14 يوماً. البنك: … رقم الحساب: …',
      subtotal: 'المجموع الفرعي', tax: 'الضريبة', discountLbl: 'الخصم', total: 'الإجمالي', amountDue: 'المبلغ المستحق',
      privacy: '🔒 خصوصية تامة — بياناتك لا تغادر متصفحك أبداً.',
      livePreview: 'معاينة مباشرة', previewSub: 'A4 · تتحدث أثناء الكتابة',
      invTitle: 'فاتورة', invFrom: 'من', invTo: 'فاتورة إلى', invIssued: 'تاريخ الإصدار', invDue: 'تاريخ الاستحقاق',
      invNotes: 'ملاحظات', invTerms: 'شروط الدفع', invThanks: 'شكراً لتعاملكم معنا!',
      invNoItems: 'لا توجد بنود بعد — أضف أول بند من المحرر.',
      statusSaved: 'حُفظ {t}', statusUnsaved: 'تغييرات غير محفوظة', statusReady: 'الحفظ التلقائي مفعّل',
      draftsTitle: 'المسودات المحفوظة', draftsEmpty: 'لا توجد مسودات بعد',
      draftsEmptyHint: 'اضغط «حفظ كمسودة» للاحتفاظ بالفاتورة لاحقاً.', open: 'فتح', del: 'حذف',
      noClient: 'بدون عميل', cancel: 'إلغاء',
      confirmClearTitle: 'مسح كل شيء؟', confirmClearMsg: 'سيتم مسح جميع حقول الفاتورة الحالية. المسودات المحفوظة لن تتأثر.',
      confirmClearOk: 'مسح الكل',
      confirmDelTitle: 'حذف هذه المسودة؟', confirmDelMsg: 'سيتم حذف المسودة {n} نهائياً.', confirmDelOk: 'حذف',
      toastSaved: 'تم حفظ المسودة {n}', toastLoaded: 'تم فتح المسودة {n}', toastDeleted: 'تم حذف المسودة',
      toastCleared: 'تم مسح الفاتورة', toastSample: 'تم تحميل فاتورة تجريبية', toastNew: 'فاتورة جديدة {n} — تم الاحتفاظ ببيانات عملك',
      toastPdf: 'جارٍ إنشاء ملف PDF…', toastPdfOk: 'تم تحميل ملف PDF', toastPdfErr: 'تعذّر إنشاء PDF. جرّب الطباعة ← «حفظ كـ PDF».',
      toastLib: 'محرك PDF غير محمّل (بدون اتصال؟). استخدم الطباعة ← «حفظ كـ PDF».',
      toastLogoBig: `حجم الشعار كبير جداً (الحد ${MAX_LOGO_MB} ميغابايت)`, toastBadImg: 'يرجى اختيار ملف صورة',
      toastQuota: 'مساحة التخزين ممتلئة — احذف بعض المسودات أو استخدم شعاراً أصغر.',
      toastWelcome: 'مرحباً! هذه فاتورة تجريبية — اضغط «جديدة» لبدء فاتورتك.',
      // ---- المشاركة والعملاء والخدمات (v2) ----
      shareGroup: 'مشاركة الفاتورة',
      shareWa: 'واتساب', shareMail: 'جيميل', shareImg: 'نسخ كصورة',
      shareWaTitle: 'مشاركة عبر واتساب', shareMailTitle: 'إرسال بالبريد (Gmail أو تطبيق البريد)', shareImgTitle: 'نسخ الفاتورة كصورة',
      toastImgBusy: 'جارٍ تجهيز الصورة…', toastImgCopied: 'تم نسخ الفاتورة كصورة ✓',
      toastImgDownloaded: 'النسخ غير مدعوم هنا — تم تحميل الصورة بدلاً من ذلك ✓',
      toastImgErr: 'تعذّر إنشاء الصورة. جرّب تحميل PDF.',
      toastTextCopied: 'لا يوجد بريد للعميل — تم نسخ نص الفاتورة ✓', toastCopyFail: 'تعذّر نسخ النص',
      secClients: 'العملاء المحفوظون', clientSearchPh: 'ابحث بالاسم أو الشركة أو البريد',
      clientUse: 'استخدم', clientEdit: 'تعديل', clientDel: 'حذف', clientAdd: '+ إضافة عميل جديد',
      clientsExport: 'تصدير العملاء', clientsImport: 'استيراد العملاء',
      clientsEmpty: 'لا يوجد عملاء محفوظون بعد', clientsEmptyHint: 'أضف عميلاً جديداً، أو احفظه بعد تحميل فاتورة.',
      clientsNoMatch: 'لا توجد نتائج مطابقة',
      clientStats: 'الفواتير: {c} · المفوتر: {t}',
      clientFormAdd: 'إضافة عميل', clientFormEdit: 'تعديل العميل', saveBtn: 'حفظ', back: 'رجوع',
      clientNeedName: 'أدخل اسم العميل أو الشركة.', clientBadEmail: 'أدخل بريداً إلكترونياً صحيحاً.',
      clientDupEmail: 'يوجد عميل بنفس البريد الإلكتروني بالفعل.',
      toastClientSaved: 'تم حفظ العميل', toastClientUpdated: 'تم تحديث العميل', toastClientDeleted: 'تم حذف العميل',
      toastClientUsed: 'تمت تعبئة «فاتورة إلى» ببيانات {n}',
      confirmDelClientTitle: 'حذف هذا العميل؟', confirmDelClientMsg: 'سيتم حذف {n} من العملاء المحفوظين.',
      askSaveClient: 'اسألني عن حفظ العميل الجديد بعد تحميل PDF',
      saveClientTitle: 'حفظ هذا العميل للاستخدام المستقبلي؟', saveClientYes: 'نعم، احفظ', saveClientNo: 'لا، شكراً', saveClientNever: 'لا تسأل مرة أخرى',
      toastNeverAsk: 'تم — يمكنك إعادة تفعيل ذلك من «العملاء المحفوظون»',
      toastClientsExported: 'تم تصدير {n} عميل', toastClientsNone: 'لا يوجد عملاء محفوظون لتصديرهم بعد',
      toastClientsImported: 'تم استيراد {n} عميل', toastClientsSkipped: ' · تم تخطي {s} مكرر',
      toastImportBad: 'ملف غير صالح — اختر ملف JSON تم تصديره من InvoiceCraft',
      servicesBtn: 'الخدمات المحفوظة', servicesTitle: 'الخدمات المحفوظة', servicesHint: 'اضغط على خدمة لإضافتها إلى الفاتورة.',
      serviceSearchPh: 'ابحث في الخدمات', serviceAdd: '+ إضافة خدمة جديدة',
      serviceFormAdd: 'خدمة جديدة', serviceFormEdit: 'تعديل الخدمة', serviceName: 'اسم الخدمة', serviceDesc: 'الوصف (اختياري)',
      phServiceName: 'مثال: تصميم شعار', phServiceDesc: 'مثال: 3 مقترحات + تعديلان',
      servicesEmpty: 'لا توجد خدمات محفوظة بعد', servicesEmptyHint: 'أضف خدمة من هنا، أو اضغط النجمة بجانب وصف أي بند لحفظه.',
      servicesNoMatch: 'لا توجد خدمات مطابقة',
      serviceUsed: 'استُخدمت {n} مرة', serviceNeedName: 'أدخل اسم الخدمة.', serviceDup: 'توجد خدمة بهذا الاسم بالفعل.',
      toastServiceSaved: 'تم حفظ الخدمة', toastServiceUpdated: 'تم تحديث الخدمة', toastServiceDeleted: 'تم حذف الخدمة',
      toastServiceAdded: 'تمت إضافة «{n}» إلى الفاتورة',
      confirmDelServiceTitle: 'حذف هذه الخدمة؟', confirmDelServiceMsg: 'سيتم حذف «{n}» من الخدمات المحفوظة.',
      starSave: 'حفظ كخدمة قابلة لإعادة الاستخدام', starSaved: 'محفوظة — اضغط لتحديث السعر'
    }
  };

  /* =====================================================================
     3. HELPERS
     ===================================================================== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nl2br = (s) => esc(s).replace(/\n/g, '<br>');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayISO = () => toISO(new Date());
  const addDays = (iso, days) => {
    const d = new Date((iso || todayISO()) + 'T00:00:00');
    if (isNaN(d)) return '';
    d.setDate(d.getDate() + days);
    return toISO(d);
  };
  const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  const setPath = (obj, path, val) => {
    const keys = path.split('.'); const last = keys.pop();
    keys.reduce((o, k) => o[k], obj)[last] = val;
  };
  const hexToRgba = (hex, a) => {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(full, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  };

  /** Safe localStorage wrapper (handles quota errors & private mode). */
  const store = {
    get(key, fallback = null) {
      try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch { toast(t('toastQuota'), 'error'); return false; }
    },
    remove(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } }
  };

  /* =====================================================================
     4. STATE
     ===================================================================== */
  let prefs = Object.assign({ lang: 'en' }, store.get(KEYS.prefs, {}));
  let state = null;         // current invoice (set in init)
  let dirty = false;        // unsaved changes since last autosave
  let lastSavedAt = null;

  /** Translate a key, with optional {placeholders}. */
  function t(key, vars) {
    let s = (I18N[prefs.lang] && I18N[prefs.lang][key]) ?? I18N.en[key] ?? key;
    if (vars) Object.keys(vars).forEach((k) => { s = s.replace(`{${k}}`, vars[k]); });
    return s;
  }

  /* ---- Invoice numbering (INV-001, INV-002 …) ---- */
  const getCounter = () => parseInt(store.get(KEYS.counter, 0), 10) || 0;
  const numberValue = (str) => { const m = String(str || '').match(/(\d+)(?!.*\d)/); return m ? parseInt(m[1], 10) : 0; };
  const nextNumber = () => NUMBER_PREFIX + pad(getCounter() + 1, NUMBER_PAD);
  /** Mark a number as "used" (on save / download / print) so the next "New" gets the following one. */
  function commitNumber(str) {
    const n = numberValue(str);
    if (n > getCounter()) store.set(KEYS.counter, n);
  }

  /** A fresh, empty invoice. `keep` lets us carry over sender info/design. */
  function blankState(keep = {}) {
    const today = todayISO();
    return {
      template: keep.template || 'modern',
      accent: keep.accent || ACCENTS[0],
      sender: keep.sender ? clone(keep.sender) : { name: '', company: '', address: '', email: '', phone: '', logo: '' },
      client: { name: '', company: '', address: '', email: '', phone: '' },
      invoice: { number: nextNumber(), date: today, due: addDays(today, 14), currency: keep.currency || 'USD', status: '' },
      items: [{ desc: '', qty: 1, rate: '' }],
      taxRate: '', discount: '', discountType: 'percent',
      notes: '', terms: ''
    };
  }

  /** Merge loaded data over defaults so older/partial saves never break the app. */
  function normalize(data) {
    const base = blankState();
    if (!data || typeof data !== 'object') return base;
    const s = Object.assign(base, data);
    s.sender = Object.assign(blankState().sender, data.sender || {});
    s.client = Object.assign(blankState().client, data.client || {});
    s.invoice = Object.assign(blankState().invoice, data.invoice || {});
    s.items = Array.isArray(data.items) && data.items.length ? data.items : base.items;
    if (!TEMPLATES.includes(s.template)) s.template = 'modern';
    return s;
  }

  /** Demo invoice — localized for EN / AR. */
  function sampleState() {
    const today = todayISO();
    const logo = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e3a8a"/><stop offset="1" stop-color="#38bdf8"/></linearGradient></defs>' +
      '<rect width="120" height="120" rx="28" fill="url(#g)"/>' +
      '<path d="M32 84V36l28 26 28-26v48" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    const base = {
      template: state ? state.template : 'modern',
      accent: state ? state.accent : ACCENTS[0],
      invoice: { number: nextNumber(), date: today, due: addDays(today, 14), currency: 'USD', status: 'unpaid' },
      discountType: 'percent'
    };
    if (prefs.lang === 'ar') {
      return normalize(Object.assign(base, {
        sender: { name: 'أحمد الساعدي', company: 'استوديو الرافدين للتصميم', address: 'شارع الجزائر، مجمع النخيل\nالبصرة، العراق',
                  email: 'ahmed@rafidain.studio', phone: '+964 780 123 4567', logo },
        client: { name: 'سارة الموسوي', company: 'شركة دجلة للتقنية', address: 'حي المنصور، شارع 14\nبغداد، العراق', email: 'finance@dijlah.tech' },
        items: [
          { desc: 'تصميم هوية بصرية متكاملة (شعار، ألوان، خطوط)', qty: 1, rate: 1500 },
          { desc: 'تصميم واجهات موقع إلكتروني — 6 صفحات', qty: 6, rate: 300 },
          { desc: 'تطوير الواجهة الأمامية (ساعة)', qty: 20, rate: 40 },
          { desc: 'باقة صيانة ودعم شهرية', qty: 1, rate: 200 }
        ],
        taxRate: 5, discount: 10,
        notes: 'شكراً لثقتكم بنا، سعدنا بالعمل معكم ونتطلع لمشاريع قادمة!',
        terms: 'يُستحق الدفع خلال 14 يوماً من تاريخ الفاتورة.\nتحويل بنكي: مصرف الرافدين — رقم الحساب 0123456789'
      }));
    }
    return normalize(Object.assign(base, {
      sender: { name: 'Sarah Mitchell', company: 'Mitchell Creative Studio', address: '221 Harbor Street, Suite 4\nSan Francisco, CA 94107',
                email: 'hello@mitchellstudio.co', phone: '+1 (415) 555-0132', logo },
      client: { name: 'James Carter', company: 'Northwind Technologies', address: '1200 Market Avenue\nAustin, TX 78701', email: 'accounts@northwind.io' },
      items: [
        { desc: 'Brand identity design (logo, palette, typography)', qty: 1, rate: 1800 },
        { desc: 'Website UI/UX design — 6 pages', qty: 6, rate: 350 },
        { desc: 'Front-end development (hours)', qty: 24, rate: 85 },
        { desc: 'Monthly maintenance retainer', qty: 1, rate: 250 }
      ],
      taxRate: 8, discount: 5,
      notes: 'Thank you for choosing Mitchell Creative Studio — it was a pleasure working with you!',
      terms: 'Payment is due within 14 days.\nBank transfer: Bank of America · IBAN US12 3456 7890 1234 · SWIFT BOFAUS3N'
    }));
  }

  /* =====================================================================
     5. CALCULATIONS & FORMATTING
     ===================================================================== */
  function totals(s = state) {
    const subtotal = s.items.reduce((sum, it) => sum + num(it.qty) * num(it.rate), 0);
    const discount = s.discountType === 'fixed'
      ? Math.min(num(s.discount), subtotal)
      : subtotal * Math.min(num(s.discount), 100) / 100;
    const tax = (subtotal - discount) * num(s.taxRate) / 100;   // tax applied after discount
    return { subtotal, discount, tax, total: subtotal - discount + tax };
  }

  const locale = () => (prefs.lang === 'ar' ? 'ar-u-nu-latn' : 'en-US');   // Arabic text, Latin digits

  /** Currency amounts always use Western formatting ("$1,500.00") for clarity in both languages. */
  function money(value, currency = state.invoice.currency) {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(value || 0);
    } catch {
      try { return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value || 0); }
      catch { return `${(value || 0).toFixed(2)} ${currency}`; }
    }
  }
  /** Wrap left-to-right runs (money, phones, emails, numbers) so they never get scrambled in RTL. */
  const ltr = (html) => `<span class="ltr">${html}</span>`;
  const M = (value, currency, prefix = '') => ltr(prefix + money(value, currency));
  const qtyFmt = (v) => new Intl.NumberFormat(locale(), { maximumFractionDigits: 3 }).format(num(v));

  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return new Intl.DateTimeFormat(locale(), { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
  }

  function currencySymbol(code) {
    try {
      const part = new Intl.NumberFormat('en-US', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' })
        .formatToParts(0).find((p) => p.type === 'currency');
      return part ? part.value : code;
    } catch { return code; }
  }

  /* =====================================================================
     6. EDITOR UI
     ===================================================================== */

  /** Apply the language to the whole UI (text, placeholders, direction). */
  function applyLanguage() {
    const html = document.documentElement;
    html.lang = prefs.lang;
    html.dir = prefs.lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
    $$('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    buildCurrencyOptions();
    buildSwatches();
    renderItems();
    renderMiniTotals();
    updateSaveStatus();
    renderClients();
    renderServices();
    renderPreview();
  }

  function buildCurrencyOptions() {
    const sel = $('#currencySelect');
    let names = null;
    try { names = new Intl.DisplayNames([prefs.lang], { type: 'currency' }); } catch { /* old browsers */ }
    sel.innerHTML = CURRENCIES.map((c) =>
      `<option value="${c}">${c} — ${esc(names ? names.of(c) : c)}</option>`).join('');
    sel.value = state.invoice.currency;
  }

  function buildSwatches() {
    const isCustom = !ACCENTS.includes(state.accent);
    $('#swatches').innerHTML = ACCENTS.map((c) =>
      `<button type="button" class="swatch${c === state.accent ? ' active' : ''}" style="background:${c}"
        data-action="accent" data-value="${c}" aria-label="${c}"></button>`).join('') +
      `<label class="swatch swatch-custom${isCustom ? ' active' : ''}" title="${esc(t('customColor'))}">
        <input type="color" id="customAccent" value="${esc(state.accent)}"></label>`;
  }

  /** Push the state into every form control. */
  function fillForm() {
    $$('[data-bind]').forEach((el) => {
      const v = getPath(state, el.dataset.bind);
      el.value = v ?? '';
    });
    $$('.tpl-btn').forEach((b) => b.classList.toggle('active', b.dataset.value === state.template));
    $$('[data-action="discount-type"]').forEach((b) => b.classList.toggle('active', b.dataset.value === state.discountType));
    $$('.tpl-thumb').forEach((el) => el.style.setProperty('--a', state.accent));
    buildCurrencyOptions();
    buildSwatches();
    updateLogoUI();
    renderItems();
    renderMiniTotals();
  }

  function updateLogoUI() {
    const logo = state.sender.logo;
    const img = $('#logoPreview');
    img.hidden = !logo;
    if (logo) img.src = logo; else img.removeAttribute('src');
    $('#dzEmpty').hidden = !!logo;
    $('#logoRemove').hidden = !logo;
  }

  /** (Re)build item rows. Only called on add/remove/load so typing never loses focus. */
  function renderItems() {
    $('#itemsList').innerHTML = state.items.map((it, i) => `
      <div class="item-row" data-index="${i}">
        <div class="cell cell-desc"><span class="cell-label">${esc(t('description'))}</span>
          <input type="text" data-field="desc" value="${esc(it.desc)}" placeholder="${esc(t('phItem'))}" aria-label="${esc(t('description'))}">
          <button type="button" class="star-btn" data-action="service-star" hidden><svg class="ic"><use href="#i-star"/></svg></button></div>
        <div class="cell cell-qty"><span class="cell-label">${esc(t('qty'))}</span>
          <input type="number" data-field="qty" value="${esc(it.qty)}" min="0" step="any" inputmode="decimal" placeholder="1" aria-label="${esc(t('qty'))}"></div>
        <div class="cell cell-rate"><span class="cell-label">${esc(t('rate'))}</span>
          <input type="number" data-field="rate" value="${esc(it.rate)}" min="0" step="any" inputmode="decimal" placeholder="0.00" aria-label="${esc(t('rate'))}"></div>
        <div class="item-amount">${M(num(it.qty) * num(it.rate))}</div>
        <button type="button" class="icon-btn danger" data-action="remove-item" title="${esc(t('removeItem'))}" aria-label="${esc(t('removeItem'))}">
          <svg class="ic"><use href="#i-trash"/></svg></button>
      </div>`).join('');
    state.items.forEach((_, i) => updateStar(i));
  }

  function updateRowAmount(i) {
    const row = $(`.item-row[data-index="${i}"] .item-amount`);
    if (row) row.innerHTML = M(num(state.items[i].qty) * num(state.items[i].rate));
  }

  function renderMiniTotals() {
    const x = totals();
    $('#miniTotals').innerHTML = `
      <div class="row"><span>${t('subtotal')}</span><span>${M(x.subtotal)}</span></div>
      ${x.discount ? `<div class="row"><span>${t('discountLbl')}</span><span>${M(x.discount, undefined, '−')}</span></div>` : ''}
      ${x.tax ? `<div class="row"><span>${t('tax')} (${num(state.taxRate)}%)</span><span>${M(x.tax)}</span></div>` : ''}
      <div class="row total"><span>${t('total')}</span><span>${M(x.total)}</span></div>`;
    $('#fixedBtn').textContent = currencySymbol(state.invoice.currency);
  }

  function updateSaveStatus() {
    const el = $('#saveStatus');
    el.classList.toggle('unsaved', dirty);
    const time = lastSavedAt ? new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit' }).format(lastSavedAt) : '';
    $('.txt', el).textContent = dirty ? t('statusUnsaved') : (lastSavedAt ? t('statusSaved', { t: time }) : t('statusReady'));
  }

  function updateDraftCount() {
    const n = store.get(KEYS.drafts, []).length;
    const el = $('#draftCount');
    el.textContent = n;
    el.hidden = n === 0;
  }

  /* =====================================================================
     7. LIVE PREVIEW — builds the invoice document HTML
     ===================================================================== */
  function renderPreview() {
    const s = state, x = totals(), sd = s.sender, cl = s.client;
    const inv = $('#invoice');
    inv.className = `inv tpl-${s.template}`;
    inv.dir = prefs.lang === 'ar' ? 'rtl' : 'ltr';
    inv.lang = prefs.lang;
    inv.style.setProperty('--accent', s.accent);
    inv.style.setProperty('--accent-soft', hexToRgba(s.accent, 0.08));

    const fromName = sd.company || sd.name;
    const clientName = cl.company || cl.name;
    const line = (v) => (v ? `<div class="inv-line">${nl2br(v)}</div>` : '');
    const lineLtr = (v) => (v ? `<div class="inv-line">${ltr(esc(v))}</div>` : '');
    const statusLabel = { paid: t('stPaid'), unpaid: t('stUnpaid'), overdue: t('stOverdue') }[s.invoice.status];

    const rows = s.items.filter((it) => it.desc || num(it.rate) || num(it.qty) > 1);
    const rowsHTML = rows.length
      ? rows.map((it, i) => `
          <tr>
            <td class="c-idx">${pad(i + 1)}</td>
            <td class="c-desc">${nl2br(it.desc) || '—'}</td>
            <td class="c-num">${qtyFmt(it.qty)}</td>
            <td class="c-num">${M(num(it.rate))}</td>
            <td class="c-num c-amt">${M(num(it.qty) * num(it.rate))}</td>
          </tr>`).join('')
      : `<tr class="inv-empty"><td colspan="5">${t('invNoItems')}</td></tr>`;

    const discountLabel = s.discountType === 'percent' && num(s.discount) ? ` (${num(s.discount)}%)` : '';
    const contact = [sd.email, sd.phone].filter(Boolean).map((v) => ltr(esc(v))).join('  ·  ');

    inv.innerHTML = `
      <header class="inv-top">
        <div class="inv-brand">
          ${sd.logo ? `<img class="inv-logo" src="${sd.logo}" alt="">` : ''}
          <div>
            ${fromName ? `<div class="inv-company">${esc(fromName)}</div>` : ''}
            ${sd.company && sd.name ? `<div class="inv-person">${esc(sd.name)}</div>` : ''}
          </div>
        </div>
        <div class="inv-heading">
          <h1 class="inv-title">${t('invTitle')}</h1>
          <div class="inv-number">${ltr('# ' + esc(s.invoice.number))}</div>
          ${statusLabel ? `<span class="inv-badge badge-${s.invoice.status}">${statusLabel}</span>` : ''}
        </div>
      </header>

      <div class="inv-body">
        <section class="inv-parties">
          <div class="inv-party">
            <span class="inv-label">${t('invFrom')}</span>
            ${fromName ? `<div class="inv-party-name">${esc(fromName)}</div>` : ''}
            ${sd.company && sd.name ? line(sd.name) : ''}
            ${line(sd.address)}${lineLtr(sd.email)}${lineLtr(sd.phone)}
          </div>
          <div class="inv-party">
            <span class="inv-label">${t('invTo')}</span>
            ${clientName ? `<div class="inv-party-name">${esc(clientName)}</div>` : ''}
            ${cl.company && cl.name ? line(cl.name) : ''}
            ${line(cl.address)}${lineLtr(cl.email)}${lineLtr(cl.phone)}
          </div>
          <div class="inv-dates">
            <div><span class="inv-label">${t('invIssued')}</span><strong>${fmtDate(s.invoice.date)}</strong></div>
            <div><span class="inv-label">${t('invDue')}</span><strong>${fmtDate(s.invoice.due)}</strong></div>
            <div class="inv-due-amt"><span class="inv-label">${t('amountDue')}</span><strong>${M(x.total)}</strong></div>
          </div>
        </section>

        <table class="inv-table">
          <thead><tr>
            <th class="c-idx">#</th>
            <th class="c-desc">${t('description')}</th>
            <th class="c-num">${t('qty')}</th>
            <th class="c-num">${t('rate')}</th>
            <th class="c-num">${t('amount')}</th>
          </tr></thead>
          <tbody>${rowsHTML}</tbody>
        </table>

        <section class="inv-summary">
          <div class="inv-extra">
            ${s.notes ? `<div><span class="inv-label">${t('invNotes')}</span><p>${nl2br(s.notes)}</p></div>` : ''}
            ${s.terms ? `<div><span class="inv-label">${t('invTerms')}</span><p>${nl2br(s.terms)}</p></div>` : ''}
          </div>
          <div class="inv-totals">
            <div class="inv-row"><span>${t('subtotal')}</span><span>${M(x.subtotal)}</span></div>
            ${x.discount ? `<div class="inv-row"><span>${t('discountLbl')}${discountLabel}</span><span>${M(x.discount, undefined, '−')}</span></div>` : ''}
            ${num(s.taxRate) ? `<div class="inv-row"><span>${t('tax')} (${num(s.taxRate)}%)</span><span>${M(x.tax)}</span></div>` : ''}
            <div class="inv-row inv-grand"><span>${t('total')}</span><span>${M(x.total)}</span></div>
          </div>
        </section>
      </div>

      <footer class="inv-foot">
        <strong>${t('invThanks')}</strong>
        <span>${contact}</span>
      </footer>`;

    $('#tplChip').textContent = t('tpl' + s.template[0].toUpperCase() + s.template.slice(1));
    fitPreview();
  }

  /** Scale the A4 paper to fit the preview column. */
  function fitPreview() {
    const wrap = $('#paperWrap'), paper = $('#paperScale');
    const avail = wrap.clientWidth;
    if (!avail) return;                       // hidden (mobile edit tab)
    const scale = Math.min(1, avail / PAGE_W);
    paper.style.transform = `scale(${scale})`;
    paper.style.left = `${Math.max(0, (avail - PAGE_W * scale) / 2)}px`;
    wrap.style.height = `${paper.offsetHeight * scale}px`;
  }

  /* =====================================================================
     8. DRAFTS, AUTOSAVE, CHANGE TRACKING
     ===================================================================== */
  let rafId = 0;
  /** Called after every edit: mark dirty and re-render preview on the next frame. */
  function changed() {
    dirty = true;
    updateSaveStatus();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => { renderPreview(); renderMiniTotals(); });
  }

  function autosave(force = false) {
    if (!dirty && !force) return;
    if (store.set(KEYS.autosave, state)) {
      dirty = false;
      lastSavedAt = new Date();
      updateSaveStatus();
    }
  }

  function saveDraft() {
    const drafts = store.get(KEYS.drafts, []);
    const entry = {
      id: state.invoice.number || nextNumber(),
      savedAt: Date.now(),
      client: state.client.company || state.client.name,
      total: totals().total,
      currency: state.invoice.currency,
      data: clone(state)
    };
    const idx = drafts.findIndex((d) => d.id === entry.id);
    if (idx >= 0) drafts.splice(idx, 1);
    drafts.unshift(entry);                                  // newest first
    if (!store.set(KEYS.drafts, drafts)) return;
    commitNumber(entry.id);
    autosave(true);
    updateDraftCount();
    toast(t('toastSaved', { n: entry.id }));
  }

  function openDrafts() {
    const drafts = store.get(KEYS.drafts, []);
    const list = $('#draftsList');
    if (!drafts.length) {
      list.innerHTML = `<div class="empty"><svg class="ic"><use href="#i-folder"/></svg>
        <strong>${t('draftsEmpty')}</strong>${t('draftsEmptyHint')}</div>`;
    } else {
      const dt = new Intl.DateTimeFormat(locale(), { dateStyle: 'medium', timeStyle: 'short' });
      list.innerHTML = drafts.map((d) => `
        <div class="draft">
          <div class="draft-icon"><svg class="ic"><use href="#i-file"/></svg></div>
          <div class="draft-info">
            <strong>${esc(d.id)}</strong>
            <span>${esc(d.client || t('noClient'))} · ${dt.format(new Date(d.savedAt))}</span>
          </div>
          <div class="draft-total">${M(d.total, d.currency)}</div>
          <div class="draft-actions">
            <button class="btn btn-sm btn-primary" data-action="draft-load" data-id="${esc(d.id)}">${t('open')}</button>
            <button class="icon-btn danger" data-action="draft-delete" data-id="${esc(d.id)}" title="${t('del')}" aria-label="${t('del')}">
              <svg class="ic"><use href="#i-trash"/></svg></button>
          </div>
        </div>`).join('');
    }
    openModal('#draftsModal');
  }

  function loadDraft(id) {
    const d = store.get(KEYS.drafts, []).find((x) => x.id === id);
    if (!d) return;
    state = normalize(d.data);
    fillForm();
    renderPreview();
    autosave(true);
    closeModals();
    toast(t('toastLoaded', { n: id }));
  }

  async function deleteDraft(id) {
    const ok = await confirmDialog(t('confirmDelTitle'), t('confirmDelMsg', { n: id }), t('confirmDelOk'));
    if (!ok) return;
    store.set(KEYS.drafts, store.get(KEYS.drafts, []).filter((x) => x.id !== id));
    updateDraftCount();
    openDrafts();
    toast(t('toastDeleted'));
  }

  /* =====================================================================
     9. PDF EXPORT (jsPDF + html2canvas) & PRINT
     The preview is rendered to a canvas → embedded in an A4 PDF.
     This keeps Arabic shaping, fonts, logos & template styling pixel-perfect.
     ===================================================================== */
  /** e.g. "INV-001_Acme" — used for PDF and PNG file names. */
  function invoiceFileBase() {
    return [state.invoice.number, state.client.company || state.client.name]
      .filter(Boolean).join('_').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '-') || 'invoice';
  }

  async function downloadPDF(btn) {
    if (!window.jspdf || !window.html2canvas) { toast(t('toastLib'), 'error'); return; }
    const buttons = $$('[data-action="download"]');
    buttons.forEach((b) => b.classList.add('loading'));
    toast(t('toastPdf'), 'info');
    const host = document.createElement('div');
    let pdfOk = false;
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;

      // Render an unscaled clone off-screen (the preview itself is CSS-scaled)
      host.style.cssText = `position:fixed;top:0;left:-${PAGE_W * 3}px;width:${PAGE_W}px;z-index:-1;pointer-events:none;`;
      const doc = $('#invoice').cloneNode(true);
      doc.removeAttribute('id');
      host.appendChild(doc);
      document.body.appendChild(host);

      const canvas = await window.html2canvas(doc, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
        windowWidth: PAGE_W, scrollX: 0, scrollY: 0
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
      const mmPerPx = 210 / PAGE_W;
      const ratio = canvas.width / doc.offsetWidth;          // canvas px per CSS px
      const totalH = doc.offsetHeight;

      if (totalH <= PAGE_H + 4) {
        // Single page — the common case
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, Math.min(297, totalH * mmPerPx));
      } else {
        // Multi-page: slice at row boundaries so no line item is cut in half
        const rootTop = doc.getBoundingClientRect().top;
        const breaks = $$('.inv-top, .inv-parties, thead, tbody tr, .inv-extra > div, .inv-totals, .inv-summary', doc)
          .map((el) => el.getBoundingClientRect().bottom - rootTop);
        const MARGIN = 40;                                     // top/bottom margin on continuation pages (px)
        let start = 0, page = 0;
        while (start < totalH - 1) {
          const top = page ? MARGIN : 0;
          let end = start + (PAGE_H - top - MARGIN);
          if (end >= totalH) end = totalH;
          else {
            const fits = breaks.filter((b) => b > start + 120 && b <= end);
            if (fits.length) end = Math.max(...fits);
          }
          const slice = document.createElement('canvas');
          slice.width = canvas.width;
          slice.height = Math.max(1, Math.round((end - start) * ratio));
          const ctx = slice.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, slice.width, slice.height);
          ctx.drawImage(canvas, 0, Math.round(start * ratio), canvas.width, slice.height, 0, 0, canvas.width, slice.height);
          if (page) pdf.addPage();
          pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', 0, top * mmPerPx, 210, (end - start) * mmPerPx);
          start = end; page++;
        }
        // Page numbers
        const count = pdf.getNumberOfPages();
        for (let i = 1; i <= count; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setTextColor(148, 163, 184);
          pdf.text(`${i} / ${count}`, 105, 292, { align: 'center' });
        }
      }

      const fileBase = invoiceFileBase();
      pdf.setProperties({ title: `${t('invTitle')} ${state.invoice.number}`, author: state.sender.company || state.sender.name, creator: 'InvoiceCraft' });
      pdf.save(`${fileBase}.pdf`);

      commitNumber(state.invoice.number);
      autosave(true);
      toast(t('toastPdfOk'));
      pdfOk = true;
    } catch (err) {
      console.error('[InvoiceCraft] PDF error:', err);
      toast(t('toastPdfErr'), 'error');
    } finally {
      host.remove();
      buttons.forEach((b) => b.classList.remove('loading'));
    }
    if (pdfOk) afterDownload();       // update client totals / offer to save the client
  }

  function printInvoice() {
    commitNumber(state.invoice.number);
    autosave(true);
    const prevView = document.body.dataset.view;
    document.body.dataset.view = 'preview';                  // ensure preview is visible on mobile
    setTimeout(() => {
      window.print();
      document.body.dataset.view = prevView;
      fitPreview();
    }, 50);
  }

  /* =====================================================================
     11. SHARE — WhatsApp · Email · Copy as image
     ===================================================================== */
  /** Plain-text facts about the current invoice, used by every share option. */
  function shareInfo() {
    const s = state, sd = s.sender, cl = s.client;
    const cur = s.invoice.currency;
    const fmt = (iso) => {
      const d = new Date((iso || '') + 'T00:00:00');
      return isNaN(d) ? '—' : new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
    };
    const amount = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totals().total);
    return {
      number: s.invoice.number,
      from: sd.company || sd.name || '',
      clientName: cl.name || cl.company || '',
      clientEmail: (cl.email || '').trim(),
      date: fmt(s.invoice.date), due: fmt(s.invoice.due),
      total: `${amount} ${cur}`
    };
  }

  /** Open a URL from a user click without being blocked as a pop-up. */
  function openLink(url, newTab) {
    const a = document.createElement('a');
    a.href = url;
    if (newTab) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function shareWhatsApp() {
    const i = shareInfo();
    const text = [
      `فاتورة رقم ${i.number}${i.from ? ` من ${i.from}` : ''}`,
      `المبلغ الإجمالي: ${i.total}`,
      `Invoice #${i.number}${i.from ? ` from ${i.from}` : ''}`,
      `Total: ${i.total}`
    ].join('\n');
    openLink(`https://wa.me/?text=${encodeURIComponent(text)}`, true);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); return true; }
    } catch { /* fall through to the legacy method */ }
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }

  async function shareEmail() {
    const i = shareInfo();
    const subject = `Invoice #${i.number}${i.from ? ` from ${i.from}` : ''}`;
    const body = [
      `Dear ${i.clientName || 'Customer'},`, '',
      'Please find your invoice details below.', '',
      `Invoice: #${i.number}`, `Date: ${i.date}`, `Due: ${i.due}`, `Total: ${i.total}`, '',
      'Thank you for your business.'
    ].join('\r\n');
    if (/^\S+@\S+\.\S+$/.test(i.clientEmail)) {
      const to = encodeURIComponent(i.clientEmail).replace(/%40/g, '@');
      openLink(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } else {
      const ok = await copyText(`${subject}\n\n${body.replace(/\r\n/g, '\n')}`);
      toast(t(ok ? 'toastTextCopied' : 'toastCopyFail'), ok ? 'success' : 'error');
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  /** Render the invoice (unscaled, off-screen) to a canvas. */
  async function captureInvoice(scale = 2) {
    if (!window.html2canvas) throw new Error('html2canvas not loaded');
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const host = document.createElement('div');
    host.style.cssText = `position:fixed;top:0;left:-${PAGE_W * 3}px;width:${PAGE_W}px;z-index:-1;pointer-events:none;`;
    const doc = $('#invoice').cloneNode(true);
    doc.removeAttribute('id');
    host.appendChild(doc);
    document.body.appendChild(host);
    try {
      return await window.html2canvas(doc, { scale, useCORS: true, backgroundColor: '#ffffff', logging: false, windowWidth: PAGE_W, scrollX: 0, scrollY: 0 });
    } finally { host.remove(); }
  }

  async function copyInvoiceImage() {
    const buttons = $$('[data-action="copy-image"]');
    if (buttons.some((b) => b.classList.contains('loading'))) return;
    buttons.forEach((b) => b.classList.add('loading'));
    try {
      // Start rendering right away; the Clipboard API accepts a promise so the click gesture is preserved (Safari).
      const blobPromise = captureInvoice(2).then((canvas) => new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png')));
      blobPromise.catch(() => {});                       // errors are handled below
      if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
        try {
          await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blobPromise })]);
          toast(t('toastImgCopied'));
          return;
        } catch (err) { console.warn('[InvoiceCraft] Clipboard unavailable, downloading PNG instead:', err); }
      }
      downloadBlob(await blobPromise, `${invoiceFileBase()}.png`);
      toast(t('toastImgDownloaded'), 'info');
    } catch (err) {
      console.error('[InvoiceCraft] Image error:', err);
      toast(t('toastImgErr'), 'error');
    } finally {
      buttons.forEach((b) => b.classList.remove('loading'));
    }
  }

  /* =====================================================================
     12. SAVED CLIENTS — localStorage "invoicecraft.clients"
     ===================================================================== */
  const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
      }));
  const norm = (v) => String(v ?? '').trim().toLowerCase();
  const str = (v, max) => String(v ?? '').trim().slice(0, max);
  const round2 = (n) => Math.round(n * 100) / 100;
  const isEmail = (v) => /^\S+@\S+\.\S+$/.test(String(v).trim());

  /** Coerce anything (old saves, imported files) into a well-formed client record. */
  function cleanClient(c, keepId = true) {
    const now = Date.now();
    const out = {
      id: keepId && typeof c.id === 'string' && c.id ? c.id : uid(),
      name: str(c.name, 120), company: str(c.company, 120), email: str(c.email, 160),
      phone: str(c.phone, 60), address: str(c.address, 400),
      createdAt: Number.isFinite(+c.createdAt) && +c.createdAt > 0 ? +c.createdAt : now,
      lastUsedAt: Number.isFinite(+c.lastUsedAt) && +c.lastUsedAt > 0 ? +c.lastUsedAt : now,
      invoiceCount: Math.max(0, Math.floor(num(c.invoiceCount))),
      totalBilled: Math.max(0, round2(num(c.totalBilled))),
      currency: CURRENCIES.includes(c.currency) ? c.currency : 'USD',
      billed: {}
    };
    if (c.billed && typeof c.billed === 'object') {
      Object.keys(c.billed).slice(0, 5000).forEach((k) => { if (Number.isFinite(+c.billed[k])) out.billed[k] = +c.billed[k]; });
    }
    return out;
  }
  const getClients = () => { const a = store.get(KEYS.clients, []); return Array.isArray(a) ? a.filter((c) => c && typeof c === 'object').map((c) => cleanClient(c)) : []; };
  const saveClients = (list) => store.set(KEYS.clients, list);

  /** Same client? Email decides when both have one; otherwise name + company. */
  function sameClient(a, b) {
    const ea = norm(a.email), eb = norm(b.email);
    if (ea && eb) return ea === eb;
    if (!norm(a.name) && !norm(a.company)) return false;
    return norm(a.name) === norm(b.name) && norm(a.company) === norm(b.company);
  }
  const clientTitle = (c) => c.name || c.company || c.email;
  const initials = (c) => {
    const w = clientTitle(c).replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter(Boolean);
    return ((w[0] || '?')[0] + (w.length > 1 ? w[1][0] : '')).toUpperCase();
  };

  /** Add an invoice to a client's totals (safe to call again for the same invoice number). */
  function recordBilling(c, invNumber, total, currency) {
    const key = invNumber || `#${Date.now()}`;
    if (Object.prototype.hasOwnProperty.call(c.billed, key)) c.totalBilled = round2(Math.max(0, c.totalBilled - c.billed[key] + total));
    else { c.invoiceCount += 1; c.totalBilled = round2(c.totalBilled + total); }
    c.billed[key] = total;
    c.currency = currency;
    c.lastUsedAt = Date.now();
  }

  function renderClients() {
    const all = getClients();
    const badge = $('#clientCount');
    badge.textContent = all.length; badge.hidden = !all.length;
    $('#clientSearchBox').hidden = all.length < 1;
    const q = norm($('#clientSearch').value);
    const rows = all
      .filter((c) => !q || [c.name, c.company, c.email, c.phone].some((v) => norm(v).includes(q)))
      .sort((a, b) => b.lastUsedAt - a.lastUsedAt || clientTitle(a).localeCompare(clientTitle(b)));
    const list = $('#clientList');
    if (!all.length) {
      list.innerHTML = `<div class="empty compact"><svg class="ic"><use href="#i-users"/></svg><strong>${esc(t('clientsEmpty'))}</strong>${esc(t('clientsEmptyHint'))}</div>`;
      return;
    }
    if (!rows.length) { list.innerHTML = `<div class="empty compact">${esc(t('clientsNoMatch'))}</div>`; return; }
    list.innerHTML = rows.map((c) => {
      const sub = c.name && c.company ? c.company : c.email;
      const stats = c.invoiceCount ? t('clientStats', { c: c.invoiceCount, t: '\u2066' + money(c.totalBilled, c.currency) + '\u2069' }) : '';
      return `
      <div class="client-row" data-id="${esc(c.id)}">
        <div class="avatar" aria-hidden="true">${esc(initials(c))}</div>
        <div class="client-info">
          <strong>${esc(clientTitle(c))}</strong>
          ${sub ? `<span>${esc(sub)}</span>` : ''}
          ${stats ? `<small>${esc(stats)}</small>` : ''}
        </div>
        <div class="client-actions">
          <button type="button" class="btn btn-sm btn-primary" data-action="client-use" data-id="${esc(c.id)}">${esc(t('clientUse'))}</button>
          <button type="button" class="icon-btn" data-action="client-edit" data-id="${esc(c.id)}" title="${esc(t('clientEdit'))}" aria-label="${esc(t('clientEdit'))}"><svg class="ic"><use href="#i-pencil"/></svg></button>
          <button type="button" class="icon-btn danger" data-action="client-delete" data-id="${esc(c.id)}" title="${esc(t('clientDel'))}" aria-label="${esc(t('clientDel'))}"><svg class="ic"><use href="#i-trash"/></svg></button>
        </div>
      </div>`;
    }).join('');
  }

  /** Quick fill: copies the client into “Bill To”. Line items are untouched. */
  function useClient(id) {
    const list = getClients();
    const c = list.find((x) => x.id === id);
    if (!c) return;
    ['name', 'company', 'email', 'phone', 'address'].forEach((k) => {
      state.client[k] = c[k];
      const el = $(`[data-bind="client.${k}"]`);
      if (el) el.value = c[k];
    });
    c.lastUsedAt = Date.now();
    saveClients(list);
    renderClients();
    changed();
    toast(t('toastClientUsed', { n: clientTitle(c) }));
  }

  let editingClientId = null;
  function openClientForm(id) {
    editingClientId = id || null;
    const c = id ? getClients().find((x) => x.id === id) : null;
    const f = $('#clientForm');
    ['name', 'company', 'email', 'phone', 'address'].forEach((k) => { f.elements[k].value = c ? c[k] : ''; });
    $('#clientFormTitle').textContent = t(c ? 'clientFormEdit' : 'clientFormAdd');
    formError('#clientFormError', '');
    openModal('#clientModal');
    setTimeout(() => f.elements.name.focus(), 40);
  }
  function formError(sel, msg) { const el = $(sel); el.textContent = msg; el.hidden = !msg; }

  function submitClientForm(e) {
    e.preventDefault();
    const f = e.target;
    const data = {};
    ['name', 'company', 'email', 'phone', 'address'].forEach((k) => { data[k] = f.elements[k].value.trim(); });
    if (!data.name && !data.company) return formError('#clientFormError', t('clientNeedName'));
    if (data.email && !isEmail(data.email)) return formError('#clientFormError', t('clientBadEmail'));
    const list = getClients();
    if (data.email && list.some((c) => c.id !== editingClientId && norm(c.email) === norm(data.email))) {
      return formError('#clientFormError', t('clientDupEmail'));
    }
    if (editingClientId) {
      const c = list.find((x) => x.id === editingClientId);
      if (c) Object.assign(c, cleanClient(Object.assign({}, c, data)));
    } else {
      list.push(cleanClient(Object.assign({ id: uid() }, data), false));
    }
    if (!saveClients(list)) return;
    closeModals();
    renderClients();
    toast(t(editingClientId ? 'toastClientUpdated' : 'toastClientSaved'));
  }

  async function deleteClient(id) {
    const c = getClients().find((x) => x.id === id);
    if (!c) return;
    const ok = await confirmDialog(t('confirmDelClientTitle'), t('confirmDelClientMsg', { n: clientTitle(c) }), t('confirmDelOk'));
    if (!ok) return;
    saveClients(getClients().filter((x) => x.id !== id));
    renderClients();
    toast(t('toastClientDeleted'));
  }

  /* ---- Auto-save prompt shown after “Download PDF” ---- */
  let promptResolve = null;
  function askSaveClient() {
    const cl = state.client;
    $('#saveClientMsg').textContent = [cl.name, cl.company].filter(Boolean).join(' · ') || cl.email;
    $('#saveClientModal').hidden = false;
    setTimeout(() => $('[data-action="save-client-yes"]').focus(), 40);
    return new Promise((resolve) => { promptResolve = resolve; });
  }
  function resolvePrompt(value) {
    $('#saveClientModal').hidden = true;
    if (promptResolve) { promptResolve(value); promptResolve = null; }
  }

  /** After a successful PDF: update a known client's totals, or offer to save a new one. */
  async function afterDownload() {
    const cl = state.client;
    if (!(cl.name || cl.company || cl.email)) return;
    const list = getClients();
    const total = totals().total, cur = state.invoice.currency, invNo = state.invoice.number;
    const known = list.find((c) => sameClient(c, cl));
    if (known) {
      ['name', 'company', 'email', 'phone', 'address'].forEach((k) => { if (!known[k] && cl[k]) known[k] = str(cl[k], 400); });
      recordBilling(known, invNo, total, cur);
      saveClients(list); renderClients();
      return;
    }
    if (prefs.askSaveClient === false) return;
    const answer = await askSaveClient();
    if (answer === 'never') {
      prefs.askSaveClient = false;
      store.set(KEYS.prefs, prefs);
      $('#askSaveClient').checked = false;
      toast(t('toastNeverAsk'), 'info');
    } else if (answer === 'yes') {
      const c = cleanClient({ id: uid(), name: cl.name, company: cl.company, email: cl.email, phone: cl.phone, address: cl.address }, false);
      recordBilling(c, invNo, total, cur);
      list.push(c);
      if (saveClients(list)) { renderClients(); toast(t('toastClientSaved')); }
    }
  }

  /* ---- Export / import ---- */
  function exportClients() {
    const list = getClients();
    if (!list.length) { toast(t('toastClientsNone'), 'info'); return; }
    const payload = { app: 'InvoiceCraft', type: 'clients', version: 1, exportedAt: new Date().toISOString(), clients: list };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `invoicecraft-clients-${todayISO()}.json`);
    toast(t('toastClientsExported', { n: list.length }));
  }

  async function importClients(file) {
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('too large');
      const data = JSON.parse(await readFileText(file));
      const incoming = Array.isArray(data) ? data : (data && Array.isArray(data.clients) ? data.clients : null);
      if (!incoming) throw new Error('no clients array');
      const list = getClients();
      const ids = new Set(list.map((c) => c.id));
      let added = 0, skipped = 0;
      incoming.forEach((raw) => {
        if (!raw || typeof raw !== 'object') return;
        const c = cleanClient(raw);
        if (!c.name && !c.company && !c.email) return;
        if (list.some((x) => sameClient(x, c))) { skipped++; return; }      // duplicate (by email)
        if (ids.has(c.id)) c.id = uid();
        ids.add(c.id);
        list.push(c); added++;
      });
      if (added && !saveClients(list)) return;
      renderClients();
      toast(t('toastClientsImported', { n: added }) + (skipped ? t('toastClientsSkipped', { s: skipped }) : ''), added ? 'success' : 'info');
    } catch (err) {
      console.error('[InvoiceCraft] Import error:', err);
      toast(t('toastImportBad'), 'error');
    }
  }
  const readFileText = (file) => (file.text ? file.text() : new Promise((resolve, reject) => {
    const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsText(file);
  }));

  /* =====================================================================
     13. SERVICE TEMPLATES — localStorage "invoicecraft.services"
     ===================================================================== */
  function cleanService(s, keepId = true) {
    return {
      id: keepId && typeof s.id === 'string' && s.id ? s.id : uid(),
      name: str(s.name, 160), description: str(s.description, 300),
      defaultRate: Math.max(0, round2(num(s.defaultRate))),
      defaultQty: num(s.defaultQty) > 0 ? num(s.defaultQty) : 1,
      usageCount: Math.max(0, Math.floor(num(s.usageCount)))
    };
  }
  const getServices = () => { const a = store.get(KEYS.services, []); return Array.isArray(a) ? a.filter((s) => s && typeof s === 'object').map((s) => cleanService(s)) : []; };
  const saveServices = (list) => store.set(KEYS.services, list);
  /** The text a service puts into an invoice row. */
  const serviceText = (s) => (s.description ? `${s.name} — ${s.description}` : s.name);
  const findServiceByText = (text) => { const q = norm(text); return q ? getServices().find((s) => norm(s.name) === q || norm(serviceText(s)) === q) : null; };

  function updateServiceCount() {
    const n = getServices().length;
    const el = $('#serviceCount');
    el.textContent = n; el.hidden = !n;
  }

  function renderServices() {
    updateServiceCount();
    const all = getServices();
    const q = norm($('#serviceSearch').value);
    const rows = all
      .filter((s) => !q || norm(s.name).includes(q) || norm(s.description).includes(q))
      .sort((a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name));
    const list = $('#serviceList');
    if (!all.length) {
      list.innerHTML = `<div class="empty compact"><svg class="ic"><use href="#i-star"/></svg><strong>${esc(t('servicesEmpty'))}</strong>${esc(t('servicesEmptyHint'))}</div>`;
    } else if (!rows.length) {
      list.innerHTML = `<div class="empty compact">${esc(t('servicesNoMatch'))}</div>`;
    } else {
      list.innerHTML = rows.map((s) => `
        <div class="service-row">
          <button type="button" class="service-main" data-action="service-use" data-id="${esc(s.id)}">
            <span class="svc-ico"><svg class="ic"><use href="#i-star"/></svg></span>
            <span class="svc-info">
              <strong>${esc(s.name)}</strong>
              ${s.description ? `<span>${esc(s.description)}</span>` : ''}
              ${s.usageCount ? `<small>${esc(t('serviceUsed', { n: s.usageCount }))}</small>` : ''}
            </span>
            <span class="svc-price">${M(s.defaultRate)}<small>${ltr('× ' + esc(qtyFmt(s.defaultQty)))}</small></span>
          </button>
          <button type="button" class="icon-btn" data-action="service-edit" data-id="${esc(s.id)}" title="${esc(t('clientEdit'))}" aria-label="${esc(t('clientEdit'))}"><svg class="ic"><use href="#i-pencil"/></svg></button>
          <button type="button" class="icon-btn danger" data-action="service-delete" data-id="${esc(s.id)}" title="${esc(t('clientDel'))}" aria-label="${esc(t('clientDel'))}"><svg class="ic"><use href="#i-trash"/></svg></button>
        </div>`).join('');
    }
    $$('.item-row').forEach((row) => updateStar(+row.dataset.index));
  }

  function showServicePane(pane) {
    $('#svcListPane').hidden = pane !== 'list';
    $('#svcFormPane').hidden = pane !== 'form';
  }
  function openServices() {
    $('#serviceSearch').value = '';
    showServicePane('list');
    renderServices();
    openModal('#servicesModal');
  }

  let editingServiceId = null;
  function openServiceForm(id) {
    editingServiceId = id || null;
    const s = id ? getServices().find((x) => x.id === id) : null;
    const f = $('#svcFormPane');
    f.elements.name.value = s ? s.name : '';
    f.elements.description.value = s ? s.description : '';
    f.elements.defaultRate.value = s ? s.defaultRate : '';
    f.elements.defaultQty.value = s ? s.defaultQty : 1;
    $('#svcFormTitle').textContent = t(s ? 'serviceFormEdit' : 'serviceFormAdd');
    formError('#svcFormError', '');
    showServicePane('form');
    setTimeout(() => f.elements.name.focus(), 40);
  }

  function submitServiceForm(e) {
    e.preventDefault();
    const f = e.target;
    const data = { name: f.elements.name.value.trim(), description: f.elements.description.value.trim(),
                   defaultRate: f.elements.defaultRate.value, defaultQty: f.elements.defaultQty.value };
    if (!data.name) return formError('#svcFormError', t('serviceNeedName'));
    const list = getServices();
    if (list.some((s) => s.id !== editingServiceId && norm(s.name) === norm(data.name))) return formError('#svcFormError', t('serviceDup'));
    if (editingServiceId) {
      const s = list.find((x) => x.id === editingServiceId);
      if (s) Object.assign(s, cleanService(Object.assign({}, s, data)));
    } else {
      list.push(cleanService(Object.assign({ usageCount: 0 }, data), false));
    }
    if (!saveServices(list)) return;
    toast(t(editingServiceId ? 'toastServiceUpdated' : 'toastServiceSaved'));
    showServicePane('list');
    renderServices();
  }

  async function deleteService(id) {
    const s = getServices().find((x) => x.id === id);
    if (!s) return;
    const ok = await confirmDialog(t('confirmDelServiceTitle'), t('confirmDelServiceMsg', { n: s.name }), t('confirmDelOk'));
    if (!ok) return;
    saveServices(getServices().filter((x) => x.id !== id));
    renderServices();
    toast(t('toastServiceDeleted'));
  }

  /** Click a saved service → it becomes a line item (an empty last row is reused). */
  function useService(id) {
    const list = getServices();
    const s = list.find((x) => x.id === id);
    if (!s) return;
    const item = { desc: serviceText(s), qty: s.defaultQty, rate: s.defaultRate || '' };
    const last = state.items[state.items.length - 1];
    if (last && !String(last.desc).trim() && !num(last.rate)) state.items[state.items.length - 1] = item;
    else state.items.push(item);
    s.usageCount += 1;
    saveServices(list);
    closeModals();
    renderItems(); updateServiceCount(); changed();
    toast(t('toastServiceAdded', { n: s.name }));
  }

  /** ⭐ next to an item description: save (or refresh) it as a reusable service. */
  function starItem(btn) {
    const i = +btn.closest('.item-row').dataset.index;
    const it = state.items[i];
    const name = String(it.desc || '').trim();
    if (!name) return;
    const list = getServices();
    const known = findServiceByText(name);
    if (known) {
      const s = list.find((x) => x.id === known.id);
      if (num(it.rate)) s.defaultRate = round2(num(it.rate));
      if (num(it.qty) > 0) s.defaultQty = num(it.qty);
      if (saveServices(list)) toast(t('toastServiceUpdated'));
    } else {
      list.push(cleanService({ name, description: '', defaultRate: it.rate, defaultQty: it.qty || 1, usageCount: 0 }, false));
      if (saveServices(list)) toast(t('toastServiceSaved'));
    }
    updateServiceCount();
    updateStar(i);
  }

  /** Show the ⭐ only when the row has a description; fill it when already saved. */
  function updateStar(i) {
    const btn = $(`.item-row[data-index="${i}"] .star-btn`);
    if (!btn || !state.items[i]) return;
    const text = String(state.items[i].desc || '').trim();
    const saved = !!text && !!findServiceByText(text);
    btn.hidden = text.length < 2;
    btn.classList.toggle('active', saved);
    btn.title = t(saved ? 'starSaved' : 'starSave');
    btn.setAttribute('aria-label', btn.title);
  }

  /* =====================================================================
     10. ACTIONS, MODALS, TOASTS, EVENTS, INIT
     ===================================================================== */

  function handleLogo(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast(t('toastBadImg'), 'error'); return; }
    if (file.size > MAX_LOGO_MB * 1024 * 1024) { toast(t('toastLogoBig'), 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Downscale to max 480px to keep localStorage small & PDFs crisp
        let w = img.naturalWidth || 480, h = img.naturalHeight || 240;
        const r = Math.min(1, 480 / Math.max(w, h));
        w = Math.round(w * r); h = Math.round(h * r);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        try { state.sender.logo = c.toDataURL('image/png'); } catch { state.sender.logo = reader.result; }
        updateLogoUI();
        changed();
      };
      img.onerror = () => toast(t('toastBadImg'), 'error');
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function toast(message, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, type === 'error' ? 4500 : 2600);
  }

  function openModal(sel) { $(sel).hidden = false; }
  function closeModals() {
    $$('.modal').forEach((m) => { m.hidden = true; });
    if (promptResolve) resolvePrompt('no');
  }

  let confirmResolve = null;
  function confirmDialog(title, message, okText) {
    $('#confirmTitle').textContent = title;
    $('#confirmMsg').textContent = message;
    $('#confirmOk').textContent = okText;
    $('#confirmModal').hidden = false;
    setTimeout(() => $('#confirmOk').focus(), 30);
    return new Promise((resolve) => { confirmResolve = resolve; });
  }
  function resolveConfirm(value) {
    $('#confirmModal').hidden = true;
    if (confirmResolve) { confirmResolve(value); confirmResolve = null; }
  }

  function setView(view) {
    document.body.dataset.view = view;
    $$('.mobile-tabs .tab').forEach((b) => b.classList.toggle('active', b.dataset.value === view));
    window.scrollTo({ top: 0 });
    if (view === 'preview') requestAnimationFrame(fitPreview);
  }

  /** All clickable actions (buttons use data-action="…"). */
  const ACTIONS = {
    new() {
      state = blankState({ sender: state.sender, template: state.template, accent: state.accent, currency: state.invoice.currency });
      fillForm(); renderPreview(); autosave(true);
      toast(t('toastNew', { n: state.invoice.number }));
    },
    sample() {
      state = sampleState();
      fillForm(); renderPreview(); changed();
      toast(t('toastSample'));
    },
    save: saveDraft,
    drafts: openDrafts,
    async clear() {
      const ok = await confirmDialog(t('confirmClearTitle'), t('confirmClearMsg'), t('confirmClearOk'));
      if (!ok) return;
      state = blankState({ template: state.template, accent: state.accent });
      fillForm(); renderPreview(); autosave(true);
      toast(t('toastCleared'));
    },
    print: printInvoice,
    download: downloadPDF,
    lang() {
      prefs.lang = prefs.lang === 'ar' ? 'en' : 'ar';
      store.set(KEYS.prefs, prefs);
      applyLanguage();
    },
    'add-item'() {
      state.items.push({ desc: '', qty: 1, rate: '' });
      renderItems(); changed();
      const inputs = $$('.item-row [data-field="desc"]');
      inputs[inputs.length - 1].focus();
    },
    'remove-item'(btn) {
      const i = +btn.closest('.item-row').dataset.index;
      state.items.splice(i, 1);
      if (!state.items.length) state.items.push({ desc: '', qty: 1, rate: '' });
      renderItems(); changed();
    },
    template(btn) {
      state.template = btn.dataset.value;
      $$('.tpl-btn').forEach((b) => b.classList.toggle('active', b === btn));
      changed();
    },
    accent(btn) { setAccent(btn.dataset.value); },
    due(btn) {
      state.invoice.due = addDays(state.invoice.date, +btn.dataset.value);
      $('#dueInput').value = state.invoice.due;
      changed();
    },
    'discount-type'(btn) {
      state.discountType = btn.dataset.value;
      $$('[data-action="discount-type"]').forEach((b) => b.classList.toggle('active', b === btn));
      changed();
    },
    'logo-remove'() { state.sender.logo = ''; updateLogoUI(); changed(); },
    'close-modal': closeModals,
    'confirm-yes'() { resolveConfirm(true); },
    'confirm-no'() { resolveConfirm(false); },
    'draft-load'(btn) { loadDraft(btn.dataset.id); },
    'draft-delete'(btn) { deleteDraft(btn.dataset.id); },
    view(btn) { setView(btn.dataset.value); },
    // Share
    'share-whatsapp': shareWhatsApp,
    'share-email': shareEmail,
    'copy-image': copyInvoiceImage,
    // Saved clients
    'client-add'() { openClientForm(); },
    'client-use'(btn) { useClient(btn.dataset.id); },
    'client-edit'(btn) { openClientForm(btn.dataset.id); },
    'client-delete'(btn) { deleteClient(btn.dataset.id); },
    'clients-export': exportClients,
    'clients-import'() { $('#clientsFile').click(); },
    'save-client-yes'() { resolvePrompt('yes'); },
    'save-client-no'() { resolvePrompt('no'); },
    'save-client-never'() { resolvePrompt('never'); },
    // Service templates
    'services-open': openServices,
    'service-add'() { openServiceForm(); },
    'service-edit'(btn) { openServiceForm(btn.dataset.id); },
    'service-delete'(btn) { deleteService(btn.dataset.id); },
    'service-use'(btn) { useService(btn.dataset.id); },
    'service-back'() { showServicePane('list'); },
    'service-star': starItem
  };

  function setAccent(color) {
    state.accent = color;
    $$('.swatch').forEach((s) => s.classList.toggle('active', s.dataset.value === color));
    const custom = $('.swatch-custom');
    if (custom) custom.classList.toggle('active', !ACCENTS.includes(color));
    $$('.tpl-thumb').forEach((el) => el.style.setProperty('--a', color));
    changed();
  }

  function bindEvents() {
    // Generic click delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn || !ACTIONS[btn.dataset.action]) return;
      e.preventDefault();
      ACTIONS[btn.dataset.action](btn, e);
    });

    // Form inputs → state (two-way binding)
    const onInput = (e) => {
      const el = e.target;
      if (el.id === 'customAccent') { setAccent(el.value); return; }
      if (el.dataset.bind) {
        setPath(state, el.dataset.bind, el.value);
        if (el.dataset.bind === 'invoice.currency') state.items.forEach((_, i) => updateRowAmount(i));
      } else if (el.dataset.field) {
        const i = +el.closest('.item-row').dataset.index;
        state.items[i][el.dataset.field] = el.value;
        updateRowAmount(i);
        if (el.dataset.field === 'desc') updateStar(i);
      } else return;
      changed();
    };
    const editor = $('#editor');
    editor.addEventListener('input', onInput);
    editor.addEventListener('change', onInput);

    // Enter in the last item's description adds a new row
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.dataset.field === 'desc') {
        e.preventDefault();
        const rows = $$('.item-row');
        const row = e.target.closest('.item-row');
        if (row === rows[rows.length - 1]) ACTIONS['add-item']();
        else $('[data-field="desc"]', rows[rows.indexOf(row) + 1]).focus();
      }
    });

    // Saved clients & services: search, forms, import, preferences
    $('#clientSearch').addEventListener('input', renderClients);
    $('#serviceSearch').addEventListener('input', renderServices);
    $('#clientForm').addEventListener('submit', submitClientForm);
    $('#svcFormPane').addEventListener('submit', submitServiceForm);
    $('#clientsFile').addEventListener('change', (e) => { importClients(e.target.files[0]); e.target.value = ''; });
    $('#askSaveClient').addEventListener('change', (e) => { prefs.askSaveClient = e.target.checked; store.set(KEYS.prefs, prefs); });

    // Logo upload + drag & drop
    $('#logoInput').addEventListener('change', (e) => { handleLogo(e.target.files[0]); e.target.value = ''; });
    const dz = $('#dropzone');
    ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
    dz.addEventListener('drop', (e) => handleLogo(e.dataTransfer.files[0]));

    // Keyboard shortcuts: Ctrl/Cmd+S save · Ctrl/Cmd+P print · Esc closes dialogs
    document.addEventListener('keydown', (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); saveDraft(); }
      else if (mod && e.key.toLowerCase() === 'p') { e.preventDefault(); printInvoice(); }
      else if (e.key === 'Escape') { if (confirmResolve) resolveConfirm(false); else closeModals(); }
    });

    // Keep preview scaled to its column
    let lastW = 0;
    new ResizeObserver(() => {
      const w = $('#paperWrap').clientWidth;
      if (w !== lastW) { lastW = w; fitPreview(); }
    }).observe($('#paperWrap'));
    if (document.fonts) document.fonts.ready.then(fitPreview);

    // Auto-save every 30 s, and whenever the tab is hidden/closed
    setInterval(() => autosave(), AUTOSAVE_MS);
    document.addEventListener('visibilitychange', () => { if (document.hidden) autosave(); });
    window.addEventListener('beforeunload', () => autosave());
    window.addEventListener('afterprint', fitPreview);
  }

  function init() {
    const saved = store.get(KEYS.autosave);
    const firstVisit = !saved && !getCounter() && !store.get(KEYS.drafts, []).length;
    state = saved ? normalize(saved) : (firstVisit ? sampleState() : blankState());
    if (saved) lastSavedAt = null;

    bindEvents();
    fillForm();
    applyLanguage();          // also renders preview
    updateDraftCount();
    $('#askSaveClient').checked = prefs.askSaveClient !== false;
    if (firstVisit) setTimeout(() => toast(t('toastWelcome'), 'info'), 600);

    // Offline support (service worker needs http/https — not file://)
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
