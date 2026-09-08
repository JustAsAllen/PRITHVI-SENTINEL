/**
 * PRITHVI SENTINEL - Sequential Event Log Tracker
 */
const TimelineEngine = (() => {
    const renderTimeline = (incident) => {
        const container = document.getElementById('timeline-track');
        if (!container || !incident) return;

        container.innerHTML = '';
        incident.timeline.forEach((item, index) => {
            const isLast = index === incident.timeline.length - 1;
            container.innerHTML += `
                <div class="timeline-step completed">
                    <span class="timeline-dot"></span>
                    <span class="mono-text t-time">${item.time}</span>
                    <span class="t-msg">${item.msg}</span>
                    ${!isLast ? '<span style="color:var(--text-muted);">→</span>' : ''}
                </div>
            `;
        });
    };

    return {
        renderTimeline
    };
})();