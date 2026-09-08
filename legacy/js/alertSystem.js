/**
 * PRITHVI SENTINEL - Fire Alert & Authority Notification System
 */
const AlertSystem = (() => {
    let alertHistory = [];
    let toastQueue = [];
    let toastTimer = null;

    const authorities = [
        { name: "District Disaster Management", role: "Primary Response", contact: "DDMA Control Room" },
        { name: "State Pollution Control Board", role: "Environmental Authority", contact: "SPCB Helpline" },
        { name: "Fire Services Department", role: "Fire Response Unit", contact: "Fire Station" },
        { name: "Agricultural Dept. (Crop Residue)", role: "Regulatory Body", contact: "Agri Control" },
        { name: "National Disaster Response Force", role: "Backup Response", contact: "NDRF Cell" }
    ];

    const severityConfig = {
        CRITICAL: { color: "#ff2d55", label: "CRITICAL", autoNotify: true },
        "HIGH RISK": { color: "#ff8c00", label: "HIGH RISK", autoNotify: true },
        WATCH: { color: "#00f0ff", label: "WATCH", autoNotify: false },
        LOW: { color: "#00ff88", label: "LOW", autoNotify: false }
    };

    const init = () => {
        document.getElementById('alert-modal-close')?.addEventListener('click', closeModal);
        document.getElementById('alert-btn-dismiss')?.addEventListener('click', closeModal);
        document.getElementById('alert-btn-view')?.addEventListener('click', () => {
            closeModal();
            if (typeof UIController !== 'undefined') {
                UIController.switchTab('mission-control');
            }
        });

        document.getElementById('alert-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'alert-overlay') closeModal();
        });
    };

    const showToast = (message, type = 'info', duration = 4000) => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            alert: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
            warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close">&times;</button>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
        container.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('toast-visible'));

        setTimeout(() => removeToast(toast), duration);
    };

    const removeToast = (toast) => {
        if (!toast || !toast.parentNode) return;
        toast.classList.remove('toast-visible');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    };

    const triggerFireAlert = (incident) => {
        if (!incident) return;

        const severity = severityConfig[incident.threatLevel] || severityConfig.WATCH;
        const now = new Date().toLocaleTimeString();

        const alertRecord = {
            id: `ALERT-${Date.now()}`,
            incidentId: incident.id,
            state: incident.state,
            district: incident.district,
            confidence: incident.confidence,
            burnArea: incident.burnAreaHa,
            threatLevel: incident.threatLevel,
            severity: severity,
            timestamp: now,
            status: 'DISPATCHING'
        };

        alertHistory.unshift(alertRecord);

        showToast(`Fire detected at ${incident.state} - ${incident.district}. Alerting authorities...`, 'alert', 6000);

        if (severity.autoNotify) {
            setTimeout(() => {
                openAlertModal(incident, alertRecord);
                simulateAuthorityDispatch(alertRecord);
            }, 1200);
        } else {
            showToast(`Low-intensity event at ${incident.state}. Monitoring only.`, 'info', 3000);
        }
    };

    const openAlertModal = (incident, alertRecord) => {
        const overlay = document.getElementById('alert-overlay');
        if (!overlay) return;

        document.getElementById('alert-location').textContent = `${incident.state} - ${incident.district}`;
        document.getElementById('alert-confidence').textContent = `${incident.confidence}%`;
        document.getElementById('alert-area').textContent = `${incident.burnAreaHa} hectares`;
        document.getElementById('alert-threat').textContent = incident.threatLevel;

        const listEl = document.getElementById('alert-authorities-list');
        listEl.innerHTML = '';
        authorities.forEach((auth, i) => {
            setTimeout(() => {
                const item = document.createElement('div');
                item.className = 'alert-authority-item';
                item.innerHTML = `
                    <div class="authority-info">
                        <span class="authority-name">${auth.name}</span>
                        <span class="authority-role">${auth.role}</span>
                    </div>
                    <span class="authority-status badge badge-cyan">NOTIFYING...</span>
                `;
                listEl.appendChild(item);

                setTimeout(() => {
                    item.querySelector('.authority-status').className = 'authority-status badge badge-green';
                    item.querySelector('.authority-status').textContent = 'NOTIFIED';
                }, 600 + Math.random() * 800);
            }, i * 300);
        });

        overlay.classList.add('alert-overlay-visible');
        document.body.style.overflow = 'hidden';

        animateDispatchSteps();
    };

    const animateDispatchSteps = () => {
        const steps = ['alert-step-verify', 'alert-step-dispatch', 'alert-step-notified'];
        steps.forEach((stepId, i) => {
            setTimeout(() => {
                document.getElementById(stepId)?.classList.add('completed');
            }, (i + 1) * 1200);
        });
    };

    const simulateAuthorityDispatch = (alertRecord) => {
        setTimeout(() => {
            showToast(`Alert ${alertRecord.id} dispatched to all authorities`, 'success', 4000);
        }, 3500);
    };

    const closeModal = () => {
        const overlay = document.getElementById('alert-overlay');
        if (overlay) {
            overlay.classList.remove('alert-overlay-visible');
            document.body.style.overflow = '';
        }

        ['alert-step-verify', 'alert-step-dispatch', 'alert-step-notified'].forEach(id => {
            document.getElementById(id)?.classList.remove('completed');
        });
    };

    const getAlertHistory = () => alertHistory;

    return {
        init,
        triggerFireAlert,
        showToast,
        closeModal,
        getAlertHistory,
        authorities
    };
})();
