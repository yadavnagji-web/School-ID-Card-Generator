/**
 * School ID Card Generator - Main Application Logic
 * Professional ID Card Designs (Portrait & Landscape)
 * Direct Individual Photo Upload, Zero Text Leakage, Maximum A4 Utilization
 * Creative Teachers Tools (www.creativeteachers.in)
 */

// Application State
let appState = {
  mode: 'student', // 'student' or 'teacher'
  orientation: 'portrait', // 'portrait' or 'landscape'
  selectedTemplate: 'tpl-canva-blue',
  activeDataTab: 'bulk',
  currentIndex: 0,
  school: {
    name: 'रा.उ.मा.वि. साकोदरा (डूंगरपुर)',
    udise: '08240304502',
    session: '2026-27',
    address: 'चीखली, डूंगरपुर (राज.) 314030',
    logo: '',
    sign: ''
  },
  studentCards: [],
  teacherCards: [],
  bulkPhotos: {}, // Map of id/sr -> dataUrl
  manualPhoto: '',
  customDesign: {
    enabled: false,
    bg: '',
    hideSchoolHeader: false,
    hideFooter: false
  }
};

// 10 Student & 10 Teacher Templates Configurations
const templatesConfig = {
  student: [
    { id: 'tpl-canva-blue', name: '1. Modern Royal Blue & White', bg: 'linear-gradient(135deg, #1e3a8a, #2563eb)' },
    { id: 'tpl-diag-orange', name: '2. Geometric Diagonal (Navy & Orange)', bg: 'linear-gradient(135deg, #0f172a, #f97316)' },
    { id: 'tpl-burgundy-gold', name: '3. Corporate Burgundy & Gold', bg: 'linear-gradient(135deg, #831843, #d97706)' },
    { id: 'tpl-emerald-green', name: '4. Emerald Green Eco-Modern', bg: 'linear-gradient(135deg, #065f46, #059669)' },
    { id: 'tpl-cyber-cyan', name: '5. Tech Cyber Slate & Cyan', bg: 'linear-gradient(135deg, #0f172a, #06b6d4)' },
    { id: 'tpl-purple-wave', name: '6. Royal Purple & Magenta Wave', bg: 'linear-gradient(135deg, #581c87, #a855f7)' },
    { id: 'tpl-crimson-shield', name: '7. Crimson Academic Shield', bg: 'linear-gradient(135deg, #991b1b, #dc2626)' },
    { id: 'tpl-sunburst-amber', name: '8. Sunburst Amber & Navy', bg: 'linear-gradient(135deg, #1e3a8a, #f59e0b)' },
    { id: 'tpl-minimal-clean', name: '9. Minimalist Clean White', bg: 'linear-gradient(135deg, #e2e8f0, #2563eb)' },
    { id: 'tpl-vintage-green', name: '10. Vintage Heritage Green', bg: 'linear-gradient(135deg, #14532d, #eab308)' }
  ],
  teacher: [
    { id: 'tpl-tea-navy-gold', name: '1. Faculty Midnight Navy & Gold', bg: 'linear-gradient(135deg, #0f172a, #fbbf24)' },
    { id: 'tpl-tea-corporate-blue', name: '2. Corporate Royal Blue & White', bg: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' },
    { id: 'tpl-tea-official-minimal', name: '3. Minimalist Official Staff Pass', bg: 'linear-gradient(135deg, #ffffff, #0284c7)' },
    { id: 'tpl-tea-maroon-ddo', name: '4. Official DDO Burgundy & Rose', bg: 'linear-gradient(135deg, #701a75, #be123c)' },
    { id: 'tpl-tea-emerald-officer', name: '5. Senior Officer Emerald & Gold', bg: 'linear-gradient(135deg, #064e3b, #f59e0b)' },
    { id: 'tpl-tea-slate-executive', name: '6. Executive Slate Grey & Cobalt', bg: 'linear-gradient(135deg, #1e293b, #3b82f6)' },
    { id: 'tpl-tea-purple-faculty', name: '7. Royal Purple Faculty Badge', bg: 'linear-gradient(135deg, #4c1d95, #fbbf24)' },
    { id: 'tpl-tea-charcoal-matte', name: '8. Luxury Matte Charcoal & Silver', bg: 'linear-gradient(135deg, #18181b, #a1a1aa)' },
    { id: 'tpl-tea-teal-modern', name: '9. Modern Institute Teal & Navy', bg: 'linear-gradient(135deg, #0f766e, #0e7490)' },
    { id: 'tpl-tea-rajasthan-shiksha', name: '10. Rajasthan Shiksha Official Tri-Color', bg: 'linear-gradient(135deg, #f97316, #1e3a8a)' }
  ]
};

// Safe Base64 Icons (Zero HTML Attribute Breakage)
const defaultAvatarBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzk0YTNiOCI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==";
const defaultLogoBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Y1OWUwYiI+PHBhdGggZD0iTTEyIDNMMSA5bDExIDYgOS00LjkxVjE3aDJWOUwxMiAzeiBNNSAxMy4xOHY0TDEyIDIxbDctMy44MnYtNEwxMiAxN2wtNy0zLjgyeiIvPjwvc3ZnPg==";
const defaultSignBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMzAiPjxwYXRoIGQ9Ik0xMCAyMCBRIDMwIDUsIDUwIDIwIFQgOTAgMTUiIHN0cm9rZT0iIzI1NjNlYiIgZmlsbD0idHJhbnNwYXJlbnQiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==";

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  renderTemplateOptions();
  loadInitialDemoData();
  updateLiveCard();
});

// Toggle Design Accordion Open / Close
function toggleDesignAccordion() {
  const body = document.getElementById('design-accordion-body');
  const arrow = document.getElementById('accordion-arrow');
  const isHidden = body.style.display === 'none';

  body.style.display = isHidden ? 'block' : 'none';
  arrow.classList.toggle('open', isHidden);
}

// Switch Orientation (Portrait vs Landscape)
function setOrientation(orient) {
  appState.orientation = orient;
  document.getElementById('btn-orient-portrait').classList.toggle('active', orient === 'portrait');
  document.getElementById('btn-orient-landscape').classList.toggle('active', orient === 'landscape');
  updateLiveCard();
}

// Switch Mode (Student vs Teacher)
function setMode(mode) {
  appState.mode = mode;
  document.getElementById('tab-student').classList.toggle('active', mode === 'student');
  document.getElementById('tab-teacher').classList.toggle('active', mode === 'teacher');

  document.getElementById('manual-student-fields').style.display = mode === 'student' ? 'block' : 'none';
  document.getElementById('manual-teacher-fields').style.display = mode === 'teacher' ? 'block' : 'none';

  // Set default template for mode
  appState.selectedTemplate = mode === 'student' ? 'tpl-canva-blue' : 'tpl-tea-navy-gold';
  renderTemplateOptions();
  appState.currentIndex = 0;
  updateLiveCard();
  renderDataTable();
}

// Render Template Options in Panel (10 Options per mode)
function renderTemplateOptions() {
  const container = document.getElementById('template-options-container');
  container.innerHTML = '';

  const list = templatesConfig[appState.mode];
  const activeTpl = list.find(t => t.id === appState.selectedTemplate) || list[0];
  document.getElementById('current-design-name').innerText = activeTpl.name;

  list.forEach(t => {
    const card = document.createElement('div');
    card.className = `template-card ${appState.selectedTemplate === t.id ? 'active' : ''}`;
    card.onclick = () => {
      appState.selectedTemplate = t.id;
      if (appState.customDesign) appState.customDesign.enabled = false;
      document.getElementById('current-design-name').innerText = t.name;
      renderTemplateOptions();
      updateLiveCard();
    };

    card.innerHTML = `
      <div class="template-thumb" style="background:${t.bg}">
        <span>${t.name.split('.')[0]}</span>
      </div>
      <div class="template-name">${t.name}</div>
    `;
    container.appendChild(card);
  });
}

// Switch between Bulk Excel Tab and Manual Single Form Tab
function switchDataTab(tab) {
  appState.activeDataTab = tab;
  document.getElementById('btn-subtab-bulk').classList.toggle('active', tab === 'bulk');
  document.getElementById('btn-subtab-manual').classList.toggle('active', tab === 'manual');

  document.getElementById('data-tab-bulk').style.display = tab === 'bulk' ? 'block' : 'none';
  document.getElementById('data-tab-manual').style.display = tab === 'manual' ? 'block' : 'none';
}

// Handle School Logo and Sign Upload
function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      appState.school.logo = event.target.result;
      updateLiveCard();
    };
    reader.readAsDataURL(file);
  }
}

function handleSignUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      appState.school.sign = event.target.result;
      updateLiveCard();
    };
    reader.readAsDataURL(file);
  }
}

// Handle Single Card Photo Upload
function handleSinglePhotoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      appState.manualPhoto = event.target.result;
      updateLiveCard();
    };
    reader.readAsDataURL(file);
  }
}

// Handle Bulk Photos Upload (Match by SR No, Roll No, or Emp ID)
function handleBulkPhotosUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  let loaded = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')).trim().toLowerCase();

    const reader = new FileReader();
    reader.onload = (event) => {
      appState.bulkPhotos[nameWithoutExt] = event.target.result;
      loaded++;
      if (loaded === files.length) {
        alert(`✅ कुल ${loaded} फोटो सफलतापूर्वक लोड किए गए!`);
        updateLiveCard();
        renderDataTable();
      }
    };
    reader.readAsDataURL(file);
  }
}

// Individual Manual Photo Upload from Table Row (FEATURE REQUEST)
function triggerRowPhotoUpload(index) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const list = getCurrentCardsList();
        if (list[index]) {
          list[index].photo = evt.target.result;
          appState.currentIndex = index;
          updateLiveCard();
          renderDataTable();
          alert(`✅ फोटो सफलतापूर्वक अपडेट किया गया!`);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

// Read School Info from Inputs
function readSchoolInfo() {
  appState.school.name = document.getElementById('school-name').value || 'रा.उ.मा.वि. साकोदरा (डूंगरपुर)';
  appState.school.udise = document.getElementById('school-udise').value || '08240304502';
  appState.school.session = document.getElementById('school-session').value || '2026-27';
  appState.school.address = document.getElementById('school-address').value || 'चीखली, डूंगरपुर (राज.)';
}

// Current Active Cards List
function getCurrentCardsList() {
  return appState.mode === 'student' ? appState.studentCards : appState.teacherCards;
}

// Clean Photo Resolver (Ensures NO broken code or alt text leak)
function getCardPhoto(item) {
  if (item.photo) return item.photo;
  if (appState.manualPhoto && appState.activeDataTab === 'manual') return appState.manualPhoto;

  const keysToTry = [
    String(item.SR_No || '').trim().toLowerCase(),
    String(item.Roll_No || '').trim().toLowerCase(),
    String(item.Emp_ID || '').trim().toLowerCase(),
    String(item.Student_Name || item.Teacher_Name || '').trim().toLowerCase()
  ];

  for (const k of keysToTry) {
    if (k && appState.bulkPhotos[k]) {
      return appState.bulkPhotos[k];
    }
  }

  return defaultAvatarBase64;
}

// Update Live Interactive Preview Card
function updateLiveCard() {
  readSchoolInfo();
  const list = getCurrentCardsList();
  const box = document.getElementById('live-card-render-box');

  if (list.length === 0) {
    box.innerHTML = `<div style="color:#64748b; font-size:14px; text-align:center; padding:50px 20px;">
      कार्ड सूची खाली है। कृपया एक्सेल अपलोड करें या 'डेमो डेटा लोड करें' बटन दबाएं।
    </div>`;
    document.getElementById('cards-count-badge').innerText = '0 कार्ड';
    document.getElementById('current-card-indicator').innerText = '0 / 0';
    return;
  }

  if (appState.currentIndex >= list.length) {
    appState.currentIndex = 0;
  }

  const currentItem = list[appState.currentIndex];
  document.getElementById('cards-count-badge').innerText = `${list.length} कार्ड`;
  document.getElementById('current-card-indicator').innerText = `${appState.currentIndex + 1} / ${list.length}`;

  box.innerHTML = generateCardHTML(currentItem, appState.selectedTemplate, appState.orientation, 'live-qr-code');

  // Render QR Code inside this card
  setTimeout(() => {
    const qrContainer = document.getElementById('live-qr-code');
    if (qrContainer) {
      qrContainer.innerHTML = '';
      const qrData = appState.mode === 'student' 
        ? `SR:${currentItem.SR_No || ''}|Name:${currentItem.Student_Name || ''}|Class:${currentItem.Class_Section || ''}|Ph:${currentItem.Mobile_No || ''}`
        : `EmpID:${currentItem.Emp_ID || ''}|Name:${currentItem.Teacher_Name || ''}|Desig:${currentItem.Designation || ''}|Ph:${currentItem.Mobile_No || ''}`;
      
      new QRCode(qrContainer, {
        text: qrData,
        width: 44,
        height: 44,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  }, 50);

  renderDataTable();
}

// Generate Card HTML (Supports both Portrait & Landscape for all templates)
function generateCardHTML(item, templateClass, orientation = 'portrait', qrId = '') {
  const photoUrl = getCardPhoto(item);
  const isStudent = appState.mode === 'student';
  const roleLabel = isStudent ? 'विद्यार्थी पहचान-पत्र' : 'शिक्षक पहचान-पत्र';
  const personName = isStudent ? (item.Student_Name || 'विद्यार्थी का नाम') : (item.Teacher_Name || 'शिक्षक का नाम');
  const subTitle = isStudent ? `Class: ${item.Class_Section || '10th'}` : (item.Designation || 'अध्यापक');

  const logoSrc = appState.school.logo || defaultLogoBase64;
  const signSrc = appState.school.sign || defaultSignBase64;

  // Custom Background Design Check
  const isCustom = appState.customDesign && appState.customDesign.enabled && !!appState.customDesign.bg;
  const activeTemplateClass = isCustom ? 'tpl-custom-bg' : (templateClass || 'tpl-canva-blue');
  const customBgStyle = isCustom 
    ? `background-image: url('${appState.customDesign.bg}'); background-size: 100% 100%; background-repeat: no-repeat; background-position: center;` 
    : '';
  const headerHideClass = (isCustom && appState.customDesign.hideSchoolHeader) ? 'custom-header-hidden' : '';
  const footerTransparentClass = (isCustom && appState.customDesign.hideFooter) ? 'custom-footer-transparent' : '';

  // Clean Image Tags with NO text leakage
  const photoMarkup = `<img src="${photoUrl}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.src='${defaultAvatarBase64}'">`;
  const logoMarkup = `<img src="${logoSrc}" class="school-logo" style="width:38px; height:38px; object-fit:contain; display:block;" onerror="this.src='${defaultLogoBase64}'">`;

  // Details Table Rows - Bold, Centered and Vertically Balanced
  let detailsRows = '';
  if (isStudent) {
    detailsRows = `
      <tr><td class="lbl">Father's Name:</td><td class="val">${item.Father_Name || '-'}</td></tr>
      <tr><td class="lbl">Scholar / SR No:</td><td class="val">${item.SR_No || '-'}</td></tr>
      <tr><td class="lbl">Roll No / Class:</td><td class="val">${item.Roll_No || '-'} (${item.Class_Section || '-'})</td></tr>
      <tr><td class="lbl">Date of Birth:</td><td class="val">${item.DOB || '-'}</td></tr>
      <tr><td class="lbl">Mobile / Ph:</td><td class="val">${item.Mobile_No || '-'}</td></tr>
      <tr><td class="lbl">Address:</td><td class="val">${item.Address || '-'}</td></tr>
    `;
  } else {
    detailsRows = `
      <tr><td class="lbl">Employee ID:</td><td class="val">${item.Emp_ID || '-'}</td></tr>
      <tr><td class="lbl">Designation:</td><td class="val">${item.Designation || '-'}</td></tr>
      <tr><td class="lbl">Subject/Dept:</td><td class="val">${item.Subject || '-'}</td></tr>
      <tr><td class="lbl">Mobile No:</td><td class="val">${item.Mobile_No || '-'}</td></tr>
    `;
  }

  // --- RENDERING LANDSCAPE (HORIZONTAL) CARD ---
  if (orientation === 'landscape') {
    return `
      <div class="id-card ${activeTemplateClass} card-horizontal ${headerHideClass} ${footerTransparentClass}" style="${customBgStyle}">
        <div class="card-punch-hole"></div>

        <!-- Landscape Header: 1. School Name, 2. Address & U-DISE, 3. Role & Session -->
        <div class="card-header">
          ${logoMarkup}
          <div class="landscape-header-content">
            <div class="school-name">${appState.school.name}</div>
            <div class="school-address">${appState.school.address} • U-DISE: ${appState.school.udise}</div>
            <div class="header-tier-role">
              <span class="badge-role card-top-badge">${roleLabel} (सत्र: ${appState.school.session})</span>
            </div>
          </div>
        </div>

        <!-- Landscape Left Col: Photo & QR -->
        <div class="card-left-col">
          <div class="photo-container">
            ${photoMarkup}
          </div>
          <div class="qr-box" id="${qrId}"></div>
        </div>

        <!-- Landscape Right Col: Info & Sign (Centered & Space Filled) -->
        <div class="card-right-col">
          <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
            <div class="person-name">${personName}</div>
            <div class="person-sub">${subTitle}</div>
            <table class="details-table">
              <tbody>${detailsRows}</tbody>
            </table>
          </div>

          <div style="display:flex; justify-content:flex-end; align-items:center; margin-top:2px;">
            <div class="sign-box">
              <img src="${signSrc}" class="sign-img">
              <div class="sign-text">प्रधानाचार्य / संस्था प्रधान</div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // --- RENDERING PORTRAIT (VERTICAL) CARD ---
  return `
    <div class="id-card ${activeTemplateClass} ${headerHideClass} ${footerTransparentClass}" style="${customBgStyle}">
      <div class="card-punch-hole"></div>

      <!-- Card Header: 1. School Name, 2. Address & U-DISE, 3. Role & Session -->
      <div class="card-header">
        <div class="header-tier-school">
          ${logoMarkup}
          <div class="school-name">${appState.school.name}</div>
        </div>
        <div class="header-tier-address school-address">${appState.school.address} • U-DISE: ${appState.school.udise}</div>
        <div class="header-tier-role">
          <span class="badge-role card-top-badge">${roleLabel} (सत्र: ${appState.school.session})</span>
        </div>
      </div>

      <!-- Card Body (Centered, Bold, Beautiful Space Filling) -->
      <div class="card-body">
        <div class="photo-container">
          ${photoMarkup}
        </div>
        <div class="person-name">${personName}</div>
        <div class="person-sub">${subTitle}</div>

        <table class="details-table">
          <tbody>
            ${detailsRows}
          </tbody>
        </table>
      </div>

      <!-- Card Footer -->
      <div class="card-footer">
        <div class="qr-box" id="${qrId}"></div>
        <div class="sign-box">
          <img src="${signSrc}" class="sign-img">
          <div class="sign-text">प्रधानाचार्य / संस्था प्रधान</div>
        </div>
      </div>
    </div>
  `;
}

// Navigation between loaded cards
function prevCard() {
  const list = getCurrentCardsList();
  if (list.length === 0) return;
  appState.currentIndex = (appState.currentIndex - 1 + list.length) % list.length;
  updateLiveCard();
}

function nextCard() {
  const list = getCurrentCardsList();
  if (list.length === 0) return;
  appState.currentIndex = (appState.currentIndex + 1) % list.length;
  updateLiveCard();
}

// Add Single Card from Manual Form
function addManualCardToList() {
  if (appState.mode === 'student') {
    const card = {
      SR_No: document.getElementById('m-stu-sr').value.trim(),
      Roll_No: document.getElementById('m-stu-roll').value.trim(),
      Student_Name: document.getElementById('m-stu-name').value.trim(),
      Father_Name: document.getElementById('m-stu-fname').value.trim(),
      Class_Section: document.getElementById('m-stu-class').value.trim(),
      DOB: document.getElementById('m-stu-dob').value.trim(),
      Mobile_No: document.getElementById('m-stu-mobile').value.trim(),
      Address: document.getElementById('m-stu-address').value.trim(),
      photo: appState.manualPhoto
    };
    appState.studentCards.push(card);
    appState.currentIndex = appState.studentCards.length - 1;
  } else {
    const card = {
      Emp_ID: document.getElementById('m-tea-empid').value.trim(),
      Teacher_Name: document.getElementById('m-tea-name').value.trim(),
      Designation: document.getElementById('m-tea-desig').value.trim(),
      Subject: document.getElementById('m-tea-sub').value.trim(),
      Mobile_No: document.getElementById('m-tea-mobile').value.trim(),
      photo: appState.manualPhoto
    };
    appState.teacherCards.push(card);
    appState.currentIndex = appState.teacherCards.length - 1;
  }

  alert('✅ नया कार्ड सफलतापूर्वक सूची में जोड़ा गया!');
  updateLiveCard();
}

// Handle Excel / CSV Upload via SheetJS
function handleExcelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (rows.length === 0) {
        alert('⚠️ चयनित एक्सेल फाइल में कोई डेटा नहीं मिला!');
        return;
      }

      // Process and map rows
      const mappedCards = rows.map((r, idx) => {
        if (appState.mode === 'student') {
          return {
            SR_No: r.SR_No || r['एस.आर.'] || r['SR No'] || (idx + 101),
            Roll_No: r.Roll_No || r['रोल नंबर'] || r['Roll No'] || (idx + 1),
            Student_Name: r.Student_Name || r['नाम'] || r['Student Name'] || r['विद्यार्थी का नाम'] || `Student ${idx+1}`,
            Father_Name: r.Father_Name || r['पिता का नाम'] || r['Father Name'] || '',
            Class_Section: r.Class_Section || r['कक्षा'] || r['Class'] || '10th',
            DOB: r.DOB || r['जन्मतिथि'] || '15/07/2010',
            Mobile_No: r.Mobile_No || r['मोबाइल'] || r['Mobile'] || '',
            Address: r.Address || r['पता'] || ''
          };
        } else {
          return {
            Emp_ID: r.Emp_ID || r['एम्प्लॉई आईडी'] || r['Employee ID'] || `RJ-DU-${idx + 1001}`,
            Teacher_Name: r.Teacher_Name || r['नाम'] || r['Teacher Name'] || `Teacher ${idx+1}`,
            Designation: r.Designation || r['पद'] || 'अध्यापक',
            Subject: r.Subject || r['विषय'] || 'सामान्य',
            Mobile_No: r.Mobile_No || r['मोबाइल'] || ''
          };
        }
      });

      if (appState.mode === 'student') {
        appState.studentCards = mappedCards;
      } else {
        appState.teacherCards = mappedCards;
      }

      appState.currentIndex = 0;
      alert(`🎉 बधाई! कुल ${mappedCards.length} कार्ड्स का डेटा सफलतापूर्वक लोड कर लिया गया है।`);
      updateLiveCard();
    } catch (err) {
      console.error(err);
      alert('❌ एक्सेल फाइल पढ़ने में त्रुटि हुई! कृपया प्रारूप जांचें।');
    }
  };
  reader.readAsBinaryString(file);
}

// Download Pre-made Sample CSV
function downloadSampleFile() {
  let content = '';
  let filename = '';

  if (appState.mode === 'student') {
    content = "SR_No,Roll_No,Student_Name,Father_Name,Class_Section,DOB,Mobile_No,Address\n" +
              "101,1,Aarav Sharma,Rajesh Sharma,10th - A,15/07/2010,9876543210,Sakodara Dungarpur\n" +
              "102,2,Pooja Yadav,Nagji Yadav,10th - A,22/03/2010,9982151938,Main Market Chikhli\n" +
              "103,3,Rahul Meena,Suresh Meena,10th - B,05/11/2009,9829123456,Dungarpur Rajasthan";
    filename = "Sample_Student_Data.csv";
  } else {
    content = "Emp_ID,Teacher_Name,Designation,Subject,Mobile_No\n" +
              "RJ-DU-1021,Nagji Yadav,Lecturer,Computer Science,9982151938\n" +
              "RJ-DU-1022,Mahesh Joshi,Principal & PEEO,Administration,9414123456\n" +
              "RJ-DU-1023,Sunita Sharma,Senior Teacher,Mathematics,9829987654";
    filename = "Sample_Teacher_Data.csv";
  }

  const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Load Initial Demo Data
function loadDemoData() {
  loadInitialDemoData();
  alert('⚡ डेमो डेटा सफलतापूर्वक लोड हो गया है!');
  updateLiveCard();
}

function loadInitialDemoData() {
  appState.studentCards = [
    { SR_No: '101', Roll_No: '1', Student_Name: 'Aarav Sharma', Father_Name: 'Rajesh Sharma', Class_Section: '10th - A', DOB: '15/07/2010', Mobile_No: '9876543210', Address: 'Sakodara, Dungarpur' },
    { SR_No: '102', Roll_No: '2', Student_Name: 'Pooja Yadav', Father_Name: 'Nagji Yadav', Class_Section: '10th - A', DOB: '22/03/2010', Mobile_No: '9982151938', Address: 'Chikhli, Dungarpur' },
    { SR_No: '103', Roll_No: '3', Student_Name: 'Rahul Meena', Father_Name: 'Suresh Meena', Class_Section: '10th - B', DOB: '05/11/2009', Mobile_No: '9829123456', Address: 'Dungarpur Road' },
    { SR_No: '104', Roll_No: '4', Student_Name: 'Priya Patel', Father_Name: 'Mahesh Patel', Class_Section: '10th - A', DOB: '18/09/2010', Mobile_No: '9414098765', Address: 'Station Road Sagwara' },
    { SR_No: '105', Roll_No: '5', Student_Name: 'Vikram Singh', Father_Name: 'Kailash Singh', Class_Section: '9th - A', DOB: '12/01/2011', Mobile_No: '9785123456', Address: 'Civil Lines Dungarpur' },
    { SR_No: '106', Roll_No: '6', Student_Name: 'Kavita Dave', Father_Name: 'Dinesh Dave', Class_Section: '9th - B', DOB: '30/08/2011', Mobile_No: '9828456789', Address: 'Shivaji Nagar Sakodara' },
    { SR_No: '107', Roll_No: '7', Student_Name: 'Deepak Kumar', Father_Name: 'Ramesh Kumar', Class_Section: '8th - A', DOB: '14/04/2012', Mobile_No: '9636789012', Address: 'Govt School Chikhli' },
    { SR_No: '108', Roll_No: '8', Student_Name: 'Anjali Jain', Father_Name: 'Prakash Jain', Class_Section: '8th - B', DOB: '25/12/2012', Mobile_No: '9413234567', Address: 'Gandhi Chowk Dungarpur' }
  ];

  appState.teacherCards = [
    { Emp_ID: 'RJ-DU-1021', Teacher_Name: 'Nagji Yadav', Designation: 'Lecturer (School Edu)', Subject: 'Computer Science', Mobile_No: '9982151938' },
    { Emp_ID: 'RJ-DU-1022', Teacher_Name: 'Mahesh Chandra Joshi', Designation: 'Principal & PEEO', Subject: 'Administration', Mobile_No: '9414123456' },
    { Emp_ID: 'RJ-DU-1023', Teacher_Name: 'Sunita Sharma', Designation: 'Senior Teacher', Subject: 'Mathematics', Mobile_No: '9829987654' },
    { Emp_ID: 'RJ-DU-1024', Teacher_Name: 'Rameshwar Lal Meena', Designation: 'Teacher Level-2', Subject: 'English', Mobile_No: '9785456123' },
    { Emp_ID: 'RJ-DU-1025', Teacher_Name: 'Pravin Kumar Patidar', Designation: 'Teacher Level-2', Subject: 'Science', Mobile_No: '9636112233' },
    { Emp_ID: 'RJ-DU-1026', Teacher_Name: 'Kiran Bala Rao', Designation: 'Teacher Level-1', Subject: 'All Primary', Mobile_No: '9828778899' },
    { Emp_ID: 'RJ-DU-1027', Teacher_Name: 'Dharmendra Trivedi', Designation: 'Physical Teacher (PTI)', Subject: 'Physical Education', Mobile_No: '9413554433' },
    { Emp_ID: 'RJ-DU-1028', Teacher_Name: 'Mukesh Kumar Jain', Designation: 'Junior Assistant (LDC)', Subject: 'Office & Accounts', Mobile_No: '9414998877' }
  ];
}

// Render Data Table in Bottom Preview with DIRECT INDIVIDUAL PHOTO UPLOAD BUTTON
function renderDataTable() {
  const tbody = document.getElementById('cards-data-tbody');
  tbody.innerHTML = '';

  const list = getCurrentCardsList();
  list.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #e2e8f0';
    tr.style.cursor = 'pointer';
    tr.style.background = index === appState.currentIndex ? '#eff6ff' : 'transparent';
    tr.onclick = () => {
      appState.currentIndex = index;
      updateLiveCard();
    };

    const idVal = appState.mode === 'student' ? item.SR_No : item.Emp_ID;
    const nameVal = appState.mode === 'student' ? item.Student_Name : item.Teacher_Name;
    const subVal = appState.mode === 'student' ? item.Class_Section : item.Designation;
    const hasPhoto = !!(item.photo || appState.bulkPhotos[String(idVal).toLowerCase()]);

    tr.innerHTML = `
      <td style="padding:6px 10px;">${index + 1}</td>
      <td style="padding:6px 10px; font-weight:600;">${idVal || '-'}</td>
      <td style="padding:6px 10px; font-weight:700;">${nameVal || '-'}</td>
      <td style="padding:6px 10px;">${subVal || '-'}</td>
      <td style="padding:6px 10px;">${item.Mobile_No || '-'}</td>
      <td style="padding:6px 10px; white-space:nowrap;">
        <span style="display:inline-block; padding:2px 7px; border-radius:10px; font-size:10.5px; font-weight:bold; margin-right:6px; background:${hasPhoto ? '#dcfce7; color:#15803d' : '#fef3c7; color:#b45309'};">
          ${hasPhoto ? '✓ उपलब्ध' : 'डिफ़ॉल्ट'}
        </span>
        <button style="background:${hasPhoto ? '#f1f5f9; color:#475569' : '#2563eb; color:#ffffff'}; border:1px solid #cbd5e1; border-radius:4px; padding:3px 8px; font-size:11px; font-weight:600; cursor:pointer;" onclick="triggerRowPhotoUpload(${index}); event.stopPropagation();">
          ${hasPhoto ? '✏️ बदलें' : '📷 फोटो लगाएं'}
        </button>
      </td>
      <td style="padding:6px 10px;">
        <button style="background:#fee2e2; color:#b91c1c; border:none; border-radius:4px; padding:3px 7px; font-size:11px; cursor:pointer;" onclick="deleteCard(${index}, event)">हटाएं</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteCard(index, e) {
  e.stopPropagation();
  const list = getCurrentCardsList();
  list.splice(index, 1);
  if (appState.currentIndex >= list.length) {
    appState.currentIndex = Math.max(0, list.length - 1);
  }
  updateLiveCard();
}

function clearAllData() {
  const list = getCurrentCardsList();
  if (!list || list.length === 0) {
    alert('वर्तमान में हटाने के लिए कोई कार्ड लोड नहीं है।');
    return;
  }
  if (confirm(`क्या आप वाकई सभी ${list.length} कार्ड्स को एक साथ हटाना चाहते हैं (Bulk Delete)?`)) {
    if (appState.mode === 'student') {
      appState.studentCards = [];
    } else {
      appState.teacherCards = [];
    }
    appState.currentIndex = 0;
    updateLiveCard();
  }
}

// Trigger Print A4 Sheets (MAXIMUM USE OF A4 PAPER)
// Landscape: 10 Cards Per A4 Sheet (2 columns x 5 rows)
// Portrait: 9 Cards Per A4 Sheet (3 columns x 3 rows)
function triggerPrintA4() {
  const list = getCurrentCardsList();
  if (list.length === 0) {
    alert('⚠️ प्रिंट करने के लिए कोई कार्ड उपलब्ध नहीं है!');
    return;
  }

  const printContainer = document.getElementById('print-output-container');
  printContainer.innerHTML = '';

  const isPortrait = appState.orientation === 'portrait';
  // Maximum capacity per page
  const cardsPerPage = isPortrait ? 9 : 10;
  const totalPages = Math.ceil(list.length / cardsPerPage);

  for (let p = 0; p < totalPages; p++) {
    const pageDiv = document.createElement('div');
    pageDiv.className = `a4-page ${isPortrait ? 'print-portrait-mode' : 'print-landscape-mode'}`;

    const pageCards = list.slice(p * cardsPerPage, (p + 1) * cardsPerPage);
    pageCards.forEach((item, cardIdx) => {
      const qrId = `print-qr-${p}-${cardIdx}`;
      const cardHtml = generateCardHTML(item, appState.selectedTemplate, appState.orientation, qrId);
      
      const cardWrapper = document.createElement('div');
      cardWrapper.innerHTML = cardHtml;
      pageDiv.appendChild(cardWrapper.firstElementChild);

      // Render QR code
      setTimeout(() => {
        const qrEl = document.getElementById(qrId);
        if (qrEl) {
          qrEl.innerHTML = '';
          const qrData = appState.mode === 'student' 
            ? `SR:${item.SR_No || ''}|Name:${item.Student_Name || ''}|Class:${item.Class_Section || ''}|Ph:${item.Mobile_No || ''}`
            : `EmpID:${item.Emp_ID || ''}|Name:${item.Teacher_Name || ''}|Desig:${item.Designation || ''}|Ph:${item.Mobile_No || ''}`;
          
          const qrSize = isPortrait ? 36 : 30;
          new QRCode(qrEl, {
            text: qrData,
            width: qrSize,
            height: qrSize,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
          });
        }
      }, 50);
    });

    printContainer.appendChild(pageDiv);
  }

  // Allow QR codes rendering then print
  setTimeout(() => {
    window.print();
  }, 400);
}

/* ==========================================================================
   CUSTOM BLANK ID CARD DESIGN MANAGEMENT
   Allows users to upload custom background images and generate cards over them
   ========================================================================== */

// Toggle custom design accordion panel
function toggleCustomDesignPanel() {
  const body = document.getElementById('custom-design-body');
  const arrow = document.getElementById('custom-design-arrow');
  if (!body) return;
  const isHidden = body.style.display === 'none' || body.style.display === '';
  body.style.display = isHidden ? 'block' : 'none';
  if (arrow) arrow.textContent = isHidden ? '▲' : '▼';
}

// Handle Custom Blank Background Image Upload
function handleCustomBgUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const dataUrl = evt.target.result;
    appState.customDesign.bg = dataUrl;
    appState.customDesign.enabled = true;

    // Show preview thumbnail
    const thumb = document.getElementById('custom-bg-thumb');
    const wrap = document.getElementById('custom-bg-preview-wrap');
    if (thumb) thumb.src = dataUrl;
    if (wrap) wrap.style.display = 'block';

    const currentDesignName = document.getElementById('current-design-name');
    if (currentDesignName) currentDesignName.textContent = '🖼️ कस्टम ब्लैंक डिज़ाइन (Active)';

    alert('🎉 कस्टम ब्लैंक डिज़ाइन बैकग्राउंड सफलतापूर्वक लोड हो गया है और कार्ड पर लागू कर दिया गया है!');
    updateLiveCard();
  };
  reader.readAsDataURL(file);
}

// Enable Custom Design Mode
function enableCustomDesignMode() {
  if (!appState.customDesign.bg) {
    alert('⚠️ कृपया पहले अपनी ब्लैंक कार्ड बैकग्राउंड इमेज (.jpg या .png) चुनें!');
    return;
  }
  appState.customDesign.enabled = true;
  const currentDesignName = document.getElementById('current-design-name');
  if (currentDesignName) currentDesignName.textContent = '🖼️ कस्टम ब्लैंक डिज़ाइन (Active)';
  alert('✓ कस्टम ब्लैंक डिज़ाइन सक्रिय कर दिया गया है!');
  updateLiveCard();
}

// Remove Custom Background
function removeCustomBg() {
  appState.customDesign.bg = '';
  appState.customDesign.enabled = false;
  const input = document.getElementById('custom-card-bg-input');
  if (input) input.value = '';
  const wrap = document.getElementById('custom-bg-preview-wrap');
  if (wrap) wrap.style.display = 'none';

  const currentDesignName = document.getElementById('current-design-name');
  const list = templatesConfig[appState.mode];
  const curTpl = list.find(t => t.id === appState.selectedTemplate) || list[0];
  if (currentDesignName) currentDesignName.textContent = curTpl ? curTpl.name : 'Inbuilt Theme';

  alert('कस्टम बैकग्राउंड हटा दिया गया है। इनबिल्ट थीम पर वापस स्विच किया गया।');
  updateLiveCard();
}

// Toggle hiding default school header
function toggleCustomHeaderHide(checked) {
  appState.customDesign.hideSchoolHeader = checked;
  updateLiveCard();
}

// Toggle transparent footer
function toggleCustomFooterHide(checked) {
  appState.customDesign.hideFooter = checked;
  updateLiveCard();
}

// How to Use Modal Controls
function openHowToUseModal() {
  const modal = document.getElementById('how-to-use-modal');
  if (modal) modal.style.display = 'flex';
}

function closeHowToUseModal() {
  const modal = document.getElementById('how-to-use-modal');
  if (modal) modal.style.display = 'none';
}

