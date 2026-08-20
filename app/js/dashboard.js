// ============================================================
//  DASHBOARD.JS
//  Interactive behaviour for all dashboard pages.
//
//  SECTIONS (use Ctrl+F to jump):
//    1. SIDEBAR TOGGLE & OUTSIDE-CLICK CLOSE
//    2. SIDEBAR DROPDOWNS
//    3. CHART DATA
//    4. MODAL HELPERS
//    5. TOAST NOTIFICATIONS
//    6. BELL / NOTIFICATION PANEL
// ============================================================


// ============================================================
//  1. SIDEBAR TOGGLE & OUTSIDE-CLICK CLOSE
//  Clicking the hamburger icon collapses/expands the sidebar.
//  On mobile (<= 900px), clicking outside the sidebar also closes it.
// ============================================================
const hamburgerBtn   = document.getElementById('hamburgerBtn');
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// On mobile (<= 900px) the sidebar is collapsed by default
if (window.innerWidth <= 900 && sidebar) {
    sidebar.classList.add('collapsed');
}

hamburgerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        if (sidebarOverlay) {
            sidebarOverlay.classList.toggle('active', !sidebar.classList.contains('collapsed'));
        }
    }
});

// Tap the overlay to close sidebar on mobile
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.add('collapsed');
        sidebarOverlay.classList.remove('active');
    });
}

// Prevent sidebar clicks from bubbling up to document
if (sidebar) {
    sidebar.addEventListener('click', (e) => e.stopPropagation());
}

// Close sidebar when clicking anywhere in main content on mobile overlay mode
document.addEventListener('click', () => {
    if (window.innerWidth <= 900 && sidebar && !sidebar.classList.contains('collapsed')) {
        sidebar.classList.add('collapsed');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }
});


// ============================================================
//  2. SIDEBAR DROPDOWNS
//  Each nav item expands a dropdown when clicked.
// ============================================================
document.querySelectorAll('.dropdown-trigger').forEach(button => {
    button.addEventListener('click', function () {
        const targetMenu = document.getElementById(this.dataset.target);
        const isOpen     = targetMenu.classList.contains('open');

        // Close all open dropdowns first
        document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
        document.querySelectorAll('.sidebar-item.open').forEach(b => b.classList.remove('open'));

        // Then open the clicked one (if it was closed)
        if (!isOpen) {
            targetMenu.classList.add('open');
            this.classList.add('open');
        }
    });
});




// ============================================================
//  4. CHART DATA
//  Edit the labels array and the data arrays to change the chart.
//  Each dataset is one coloured bar group.
// ============================================================

// Dashboard Chart (Co-Curricular Engagement Metrics)
const dashboardChart = document.getElementById('dashboardChart');

if (dashboardChart) {
    const engagementLabels = [
        'Club Participation', 'Event Attendance', 'Achievement Submissions',
        'Community Service', 'Leadership Roles', 'Award Recognitions'
    ];

    const engagementData = [
        {
            label: 'Current Year',
            data: [78, 85, 42, 65, 55, 38],
            backgroundColor: '#2563eb'
        },
        {
            label: 'Previous Year',
            data: [65, 72, 35, 58, 48, 30],
            backgroundColor: '#10b981'
        }
    ];

    new Chart(dashboardChart.getContext('2d'), {
        type: 'bar',
        data: { labels: engagementLabels, datasets: engagementData },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, font: { size: 11 }, padding: 12 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { font: { size: 10 } },
                    grid:  { color: '#f0f0f0' }
                },
                x: {
                    ticks: { font: { size: 10 } },
                    grid:  { display: false }
                }
            }
        }
    });
}








// ============================================================
//  6. MODAL HELPERS
//  openModal / closeModal show or hide a popup dialog.
//  Clicking outside the modal box or the × button also closes it.
// ============================================================

// Opens a modal by its HTML id
function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
        el.classList.add('active');
        el.style.display = 'flex';
    }
}

// Closes a modal by its HTML id
function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
        el.classList.remove('active');
        el.style.display = 'none';
    }
}

// Listen for any click on a close button or the overlay background
document.addEventListener('click', event => {
    // 1. Check data-close attribute
    const dataCloseBtn = event.target.closest('[data-close]');
    if (dataCloseBtn) {
        closeModal(dataCloseBtn.dataset.close);
        return;
    }

    // 2. Check any button/element with close classes
    const closeBtn = event.target.closest('.modal-close, .notif-close, .close-modal, .opm-close, .afm-close, .btn-modal-close, [data-dismiss="modal"], #closeQrModalBtn, #notifClose, #closeAchModal, #cancelAchBtn, #closeOverrideModal, #cancelOverride');
    if (closeBtn) {
        if (closeBtn.id === 'closeQrModalBtn' || closeBtn.matches('[data-close-qr]')) {
            if (typeof window.closeGlobalQrModal === 'function') {
                window.closeGlobalQrModal();
            }
        }
        const parentModal = closeBtn.closest('.modal-overlay, .qr-modal-overlay, .org-profile-overlay, .app-form-overlay, .notif-panel, .notif-overlay');
        if (parentModal) {
            parentModal.classList.remove('active', 'open');
            parentModal.style.display = 'none';
        }
        return;
    }

    // 3. Click directly on the dark overlay (not the modal box)
    if (event.target.classList.contains('modal-overlay') || 
        event.target.classList.contains('qr-modal-overlay') ||
        event.target.classList.contains('org-profile-overlay') ||
        event.target.classList.contains('app-form-overlay') ||
        event.target.classList.contains('modal-backdrop')) {
        event.target.classList.remove('active', 'open');
        event.target.style.display = 'none';
        if (event.target.id === 'qrModalOverlay' && typeof window.closeGlobalQrModal === 'function') {
            window.closeGlobalQrModal();
        }
    }
});

// ESC key to close all open modals/drawers
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active, .qr-modal-overlay.active, .org-profile-overlay.active, .app-form-overlay.active, .notif-panel.active, .notif-panel.open, .modal-overlay[style*="display: flex"], [id$="Modal"][style*="display: flex"]').forEach(m => {
            m.classList.remove('active', 'open');
            m.style.display = 'none';
        });
        if (typeof window.closeGlobalQrModal === 'function') {
            window.closeGlobalQrModal();
        }
    }
});


// ============================================================
//  7. TOAST NOTIFICATIONS
//  Shows a card-style popup in the top-right corner.
//
//  Types:
//    'success'  → green  "Submitted"
//    'updated'  → blue   "Updated"
//    'warning'  → yellow "Warning"
//    'error'    → red    "Error"
//
//  Usage: showToast('Your message here', 'success')
// ============================================================

// Maps each type to the bold label shown at the top of the card
const TOAST_LABELS = {
    success : 'Submitted',
    updated : 'Updated',
    warning : 'Warning',
    error   : 'Error'
};

function showToast(message, type = 'success', title = null) {
    // Create the toast element once and reuse it
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-label">
                <span class="toast-dot"></span>
                <span class="toast-title"></span>
            </div>
            <div class="toast-msg"></div>`;
        document.body.appendChild(toast);
    }

    // Auto-detect a suitable title if not explicitly provided
    let displayTitle = title;
    if (!displayTitle) {
        const msgLower = message.toLowerCase();
        if (msgLower.includes('approve') || msgLower.includes('accept')) {
            displayTitle = 'Approved';
        } else if (msgLower.includes('reject') || msgLower.includes('decline')) {
            displayTitle = 'Rejected';
        } else if (msgLower.includes('delet') || msgLower.includes('remov')) {
            displayTitle = 'Deleted';
        } else if (msgLower.includes('register') || msgLower.includes('join')) {
            displayTitle = 'Registered';
        } else if (msgLower.includes('update') || msgLower.includes('edit') || msgLower.includes('save') || msgLower.includes('chang')) {
            displayTitle = 'Updated';
        } else if (msgLower.includes('create') || msgLower.includes('add') || msgLower.includes('new')) {
            displayTitle = 'Created';
        } else {
            displayTitle = TOAST_LABELS[type] ?? type;
        }
    }

    // Capitalize first letter of displayTitle
    displayTitle = displayTitle.charAt(0).toUpperCase() + displayTitle.slice(1);

    // Auto-map type if type is default success but action is delete/reject
    let displayType = type;
    if (displayType === 'success') {
        if (displayTitle === 'Deleted' || displayTitle === 'Rejected') {
            displayType = 'error'; // Map to red for deleted/rejected
        }
    }

    // Set the label and message
    toast.querySelector('.toast-title').textContent = displayTitle;
    toast.querySelector('.toast-msg').textContent   = message;

    // Swap the colour class
    toast.className = `toast ${displayType}`;

    // Trigger animation (force reflow so class change restarts transition)
    void toast.offsetWidth;
    toast.classList.add('show');

    // Auto-hide after 3.5 seconds
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── Save a toast to show AFTER a page reload ─────────────────
function reloadWithToast(message, type, title = null) {
    sessionStorage.setItem('pending_toast', JSON.stringify({ message, type, title }));
    location.reload();
}

// On every page load: check if there's a pending toast and show it
window.addEventListener('DOMContentLoaded', () => {
    const pending = sessionStorage.getItem('pending_toast');
    if (pending) {
        sessionStorage.removeItem('pending_toast');
        const { message, type, title } = JSON.parse(pending);
        // Small delay so the DOM is fully painted before the toast appears
        setTimeout(() => showToast(message, type, title), 150);
    }
});

// Avatar initial is rendered server-side from the PHP session — no JS needed.


// ============================================================
//  BELL / NOTIFICATION PANEL
//  Sidebar bell icon toggles the notification panel.
//  Clicking an unread item or "Mark all as read" clears the badge.
// ============================================================
const bellBtn      = document.getElementById('bellBtn');
const bellBadge    = document.getElementById('bellBadge');
const notifPanel   = document.getElementById('notifPanel');
const notifOverlay = document.getElementById('notifOverlay');
const notifClose   = document.getElementById('notifClose');
const notifMarkAll = document.getElementById('notifMarkAll');

function openNotifPanel() {
    notifPanel.classList.add('active');
    notifOverlay.classList.add('active');
}

function closeNotifPanel() {
    notifPanel.classList.remove('active');
    notifOverlay.classList.remove('active');
}

function updateBellBadge() {
    const hasUnread = document.querySelector('#notifList .notif-item.unread');
    bellBadge?.classList.toggle('has-notif', !!hasUnread);
}

// Set initial badge state on page load
updateBellBadge();

bellBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = notifPanel.classList.contains('active');
    isOpen ? closeNotifPanel() : openNotifPanel();
});

// Close when clicking the × button or the overlay
notifClose?.addEventListener('click', closeNotifPanel);
notifOverlay?.addEventListener('click', closeNotifPanel);

// Mark individual item as read on click
document.getElementById('notifList')?.addEventListener('click', (e) => {
    const item = e.target.closest('.notif-item');
    if (item) {
        item.classList.remove('unread');
        updateBellBadge();
    }
});

// Mark all as read
notifMarkAll?.addEventListener('click', () => {
    document.querySelectorAll('#notifList .notif-item.unread')
        .forEach(el => el.classList.remove('unread'));
    updateBellBadge();
});

// Profile dropdown toggle & layout generator
function initProfileDropdown() {
    const avatar = document.getElementById('avatarBtn');
    if (avatar && !avatar.closest('.avatar-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'avatar-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        
        avatar.parentNode.insertBefore(wrapper, avatar);
        wrapper.appendChild(avatar);
        
        avatar.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isShown = dropdown.style.display === 'block';
            dropdown.style.display = isShown ? 'none' : 'block';
        });
        
        const email = window.SESS_USER_EMAIL || 'user@bcp.edu.ph';
        const dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown';
        dropdown.style.display = 'none';
        dropdown.style.position = 'absolute';
        dropdown.style.top = '40px';
        dropdown.style.right = '0';
        dropdown.style.background = '#ffffff';
        dropdown.style.borderRadius = '12px';
        dropdown.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        dropdown.style.border = '1px solid #e2e8f0';
        dropdown.style.width = '220px';
        dropdown.style.zIndex = '10000';
        dropdown.style.overflow = 'hidden';
        dropdown.style.textAlign = 'left';
        
        dropdown.innerHTML = `
            <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; text-align: left;">
                <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px; font-family: sans-serif;">Signed in as</div>
                <div style="font-weight: 700; color: #1e293b; font-size: 0.88rem; font-family: sans-serif; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${email}</div>
            </div>
            <div style="padding: 4px 0;">
                <a href="../dashboard/account.php" style="display: flex; align-items: center; gap: 10px; padding: 10px 20px; color: #334155; text-decoration: none; font-size: 0.88rem; font-weight: 500; font-family: sans-serif; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='none'">
                    <i class="fa-solid fa-user-circle" style="color: #64748b; font-size: 1.1rem; width: 18px;"></i> Profile
                </a>
                <a href="../auth/signout.php" style="display: flex; align-items: center; gap: 10px; padding: 10px 20px; color: #ef4444; text-decoration: none; font-size: 0.88rem; font-weight: 500; font-family: sans-serif; transition: background 0.2s;" onmouseover="this.style.background='#fdf2f2'" onmouseout="this.style.background='none'">
                    <i class="fa-solid fa-sign-out-alt" style="color: #ef4444; font-size: 1.1rem; width: 18px;"></i> Sign out
                </a>
            </div>
        `;
        
        wrapper.appendChild(dropdown);
        
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileDropdown);
} else {
    initProfileDropdown();
}






