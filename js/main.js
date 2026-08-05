document.addEventListener('DOMContentLoaded', () => {

    // ===== DEFAULT ISSUES DATA =====
    const defaultIssues = [
        {
            id: 'default_1',
            title: 'Hostel Wi-Fi Down',
            category: 'wifi',
            location: 'Block B',
            description: 'Wi-Fi in Block B has been non-functional for 2 days during mid-term preparation.',
            icon: '📡',
            votes: 42,
            status: 'pending'
        },
        {
            id: 'default_2',
            title: 'Library AC Repair',
            category: 'hostel',
            location: '3rd Floor',
            description: '3rd-floor quiet zone air conditioning unit is leaking water and making loud noise.',
            icon: '❄️',
            votes: 18,
            status: 'progress'
        },
        {
            id: 'default_3',
            title: 'Mess Quality Issue',
            category: 'mess',
            location: 'Central Dining',
            description: 'Food served during evening dinner was undercooked and cold for multiple students.',
            icon: '🍲',
            votes: 65,
            status: 'resolved'
        }
    ];

    // Helper: Retrieve all combined & status-updated issues
    function getAllIssues() {
        const storedCustom = JSON.parse(localStorage.getItem('campusIssues')) || [];
        const statusMap = JSON.parse(localStorage.getItem('issueStatusMap')) || {};
        const voteMap = JSON.parse(localStorage.getItem('issueVotesMap')) || {};

        const combined = [...storedCustom, ...defaultIssues];

        // Deduplicate by ID
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

        return unique.map(issue => {
            const currentStatus = statusMap[issue.id] || issue.status || 'pending';
            const extraVotes = voteMap[issue.id] ? 1 : 0;
            return {
                ...issue,
                status: currentStatus,
                totalVotes: (issue.votes || 0) + extraVotes,
                hasVoted: !!voteMap[issue.id]
            };
        }).sort((a, b) => b.totalVotes - a.totalVotes); // Sort by highest votes
    }

    // ===== 1. PERSISTENT DARK MODE TOGGLE =====
    const themeToggleBtn = document.getElementById('themeToggle');

    function updateIcon() {
        const isDark = document.documentElement.classList.contains('dark-mode');
        if (themeToggleBtn) {
            themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
        }
    }

    if (document.documentElement.classList.contains('dark-mode')) {
        document.body.classList.add('dark-mode');
    }
    updateIcon();

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark-mode');
            document.body.classList.toggle('dark-mode');
            
            const isDark = document.documentElement.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateIcon();
        });
    }

    // ===== 2. LOGIN / REGISTER FORM REDIRECTS =====
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email')?.value || '';
            if (email.toLowerCase().includes('admin')) {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.location.href = 'dashboard.html';
        });
    }

    // ===== 3. CREATE ISSUE FORM =====
    const createIssueForm = document.getElementById('createIssueForm');
    if (createIssueForm) {
        createIssueForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('issueTitle').value;
            const category = document.getElementById('category').value;
            const location = document.getElementById('location').value;
            const description = document.getElementById('description').value;

            const icons = {
                wifi: '📡',
                hostel: '❄️',
                mess: '🍲',
                academics: '📚',
                other: '📌'
            };

            const newIssue = {
                id: 'custom_' + Date.now(),
                title: title,
                category: category,
                location: location,
                description: description,
                icon: icons[category] || '📌',
                votes: 1,
                status: 'pending'
            };

            const storedIssues = JSON.parse(localStorage.getItem('campusIssues')) || [];
            storedIssues.unshift(newIssue);
            localStorage.setItem('campusIssues', JSON.stringify(storedIssues));

            alert('Issue submitted successfully!');
            window.location.href = 'dashboard.html';
        });
    }

    // ===== 4. STUDENT DASHBOARD RENDER =====
    const stepsContainer = document.querySelector('.steps');

   if (stepsContainer && !window.location.pathname.includes('admin-dashboard.html') && window.location.pathname.includes('dashboard.html')) {
        renderDashboardIssues();
    }

    function renderDashboardIssues() {
        const issues = getAllIssues();
        const activeIssues = issues.filter(i => i.status !== 'resolved');
        const resolvedIssues = issues.filter(i => i.status === 'resolved');

        let html = '';

        activeIssues.forEach((issue, index) => {
            const badge = getStatusBadge(issue.status);
            const votedClass = issue.hasVoted ? 'voted' : '';
            const votedText = issue.hasVoted ? `I Am Affected (${issue.totalVotes}) ✓` : `I Am Affected (${issue.totalVotes})`;

            html += `
                <div class="step-card" data-category="${issue.category}" style="text-align: left; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <span style="font-size: 11px; font-weight: 700; color: #a855f7; background: rgba(168, 85, 247, 0.1); padding: 2px 8px; border-radius: 6px;">Priority #${index + 1}</span>
                        ${badge}
                    </div>
                    <div class="step-number" style="margin: 0 0 12px 0;">${issue.icon}</div>
                    <span class="eyebrow" style="margin-bottom: 6px;">${issue.category.toUpperCase()} &bull; ${issue.location}</span>
                    <h3>${issue.title}</h3>
                    <p>${issue.description}</p>
                    <div style="margin-top: 20px;">
                        <button class="btn btn-pill vote-btn ${votedClass}" data-id="${issue.id}" data-basevotes="${issue.votes || 0}" style="width: 100%; ${issue.hasVoted ? 'opacity: 0.85;' : ''}">${votedText}</button>
                    </div>
                </div>
            `;
        });

        stepsContainer.innerHTML = html;

        // Cleanup any pre-existing student solved containers
        document.querySelectorAll('#studentSolvedWrapper, .student-solved-container').forEach(el => el.remove());

        // Create fresh container
        const studentSolvedSection = document.createElement('div');
        studentSolvedSection.id = 'studentSolvedWrapper';
        studentSolvedSection.className = 'student-solved-container';
        studentSolvedSection.style.cssText = 'grid-column: 1 / -1; margin-top: 40px; text-align: center; width: 100%;';

        studentSolvedSection.innerHTML = `
            <button id="toggleSolvedBtn" class="btn btn-ghost" style="padding: 10px 24px; border: 1px solid #2ecc71; color: #2ecc71; font-weight: 600;">
                Solved ✓ (${resolvedIssues.length})
            </button>
            <div id="solvedGrid" class="steps" style="display: none; margin-top: 25px;">
                ${resolvedIssues.map(issue => `
                    <div class="step-card" data-category="${issue.category}" style="text-align: left; opacity: 0.8; border-color: rgba(46, 204, 113, 0.3);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            ${getStatusBadge('resolved')}
                        </div>
                        <div class="step-number" style="margin: 0 0 12px 0;">${issue.icon}</div>
                        <span class="eyebrow" style="margin-bottom: 6px;">${issue.category.toUpperCase()} &bull; ${issue.location}</span>
                        <h3>${issue.title}</h3>
                        <p>${issue.description}</p>
                        <div style="margin-top: 15px; font-size: 13px; color: #2ecc71; font-weight: 600;">
                            ✓ Resolved by Administration (${issue.totalVotes} votes resolved)
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        stepsContainer.parentNode.appendChild(studentSolvedSection);

        const toggleSolvedBtn = document.getElementById('toggleSolvedBtn');
        const solvedGrid = document.getElementById('solvedGrid');
        if (toggleSolvedBtn && solvedGrid) {
            toggleSolvedBtn.onclick = () => {
                const isHidden = solvedGrid.style.display === 'none';
                solvedGrid.style.display = isHidden ? 'grid' : 'none';
                toggleSolvedBtn.innerText = isHidden ? `Hide Solved Issues (${resolvedIssues.length})` : `Solved ✓ (${resolvedIssues.length})`;
            };
        }

        attachVoteListeners();
        attachFilterListeners();
    }

    function getStatusBadge(status) {
        if (status === 'resolved') {
            return `<span style="background: rgba(46, 204, 113, 0.15); color: #2ecc71; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1px solid #2ecc71;">✅ Resolved</span>`;
        } else if (status === 'progress') {
            return `<span style="background: rgba(241, 196, 15, 0.15); color: #f39c12; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1px solid #f39c12;">⚙️ In Progress</span>`;
        }
        return `<span style="background: rgba(155, 89, 182, 0.15); color: #9b59b6; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1px solid #9b59b6;">⏳ Pending</span>`;
    }

    // ===== 5. ADMIN DASHBOARD RENDER =====
    const adminIssuesContainer = document.getElementById('adminIssuesContainer');

    if (adminIssuesContainer) {
        renderAdminIssues();
    }

    function renderAdminIssues() {
        const issues = getAllIssues();
        const activeIssues = issues.filter(i => i.status !== 'resolved');
        const resolvedIssues = issues.filter(i => i.status === 'resolved');

        let html = '';

        activeIssues.forEach((issue, index) => {
            html += `
                <div class="step-card" style="text-align: left;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <span style="font-size: 11px; font-weight: 700; color: #a855f7; background: rgba(168, 85, 247, 0.1); padding: 2px 8px; border-radius: 6px;">Priority #${index + 1} (${issue.totalVotes} Votes)</span>
                    </div>
                    <div class="step-number" style="margin: 0 0 12px 0;">${issue.icon}</div>
                    <span class="eyebrow" style="margin-bottom: 6px;">${issue.category.toUpperCase()} &bull; ${issue.location}</span>
                    <h3>${issue.title}</h3>
                    <p>${issue.description}</p>
                    <div style="margin-top: 20px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <span style="font-size: 13px; font-weight: 600;">Status:</span>
                        <select class="status-select" data-id="${issue.id}" style="padding: 8px 12px; border-radius: 8px; border: 1px solid var(--card-border); background: var(--bg-color); color: var(--text-color); font-size: 13px;">
                            <option value="pending" ${issue.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
                            <option value="progress" ${issue.status === 'progress' ? 'selected' : ''}>⚙️ In Progress</option>
                            <option value="resolved">✅ Resolved</option>
                        </select>
                    </div>
                </div>
            `;
        });

        adminIssuesContainer.innerHTML = html;

        // Cleanup any pre-existing admin solved containers
        document.querySelectorAll('#adminSolvedWrapper, .admin-solved-container').forEach(el => el.remove());

        // Create fresh container
        const adminSolvedSection = document.createElement('div');
        adminSolvedSection.id = 'adminSolvedWrapper';
        adminSolvedSection.className = 'admin-solved-container';
        adminSolvedSection.style.cssText = 'margin-top: 40px; text-align: center; width: 100%;';

        adminSolvedSection.innerHTML = `
            <button id="adminToggleSolvedBtn" class="btn btn-ghost" style="padding: 10px 24px; border: 1px solid #2ecc71; color: #2ecc71; font-weight: 600;">
                Solved ✓ (${resolvedIssues.length})
            </button>
            <div id="adminSolvedGrid" class="steps" style="display: none; margin-top: 25px;">
                ${resolvedIssues.map(issue => `
                    <div class="step-card" style="text-align: left; opacity: 0.85; border-color: rgba(46, 204, 113, 0.3);">
                        <div class="step-number" style="margin: 0 0 12px 0;">${issue.icon}</div>
                        <span class="eyebrow" style="margin-bottom: 6px;">${issue.category.toUpperCase()} &bull; ${issue.location}</span>
                        <h3>${issue.title}</h3>
                        <p>${issue.description}</p>
                        <div style="margin-top: 20px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                            <span style="font-size: 13px; font-weight: 600;">Status:</span>
                            <select class="status-select" data-id="${issue.id}" style="padding: 8px 12px; border-radius: 8px; border: 1px solid #2ecc71; background: var(--bg-color); color: var(--text-color); font-size: 13px;">
                                <option value="pending">⏳ Pending</option>
                                <option value="progress">⚙️ In Progress</option>
                                <option value="resolved" selected>✅ Resolved</option>
                            </select>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        adminIssuesContainer.parentNode.appendChild(adminSolvedSection);

        const adminToggleSolvedBtn = document.getElementById('adminToggleSolvedBtn');
        const adminSolvedGrid = document.getElementById('adminSolvedGrid');
        if (adminToggleSolvedBtn && adminSolvedGrid) {
            adminToggleSolvedBtn.onclick = () => {
                const isHidden = adminSolvedGrid.style.display === 'none';
                adminSolvedGrid.style.display = isHidden ? 'grid' : 'none';
                adminToggleSolvedBtn.innerText = isHidden ? `Hide Solved Issues (${resolvedIssues.length})` : `Solved ✓ (${resolvedIssues.length})`;
            };
        }

        attachStatusChangeListeners();
        updateAdminStats();
    }

    function attachStatusChangeListeners() {
        const selects = document.querySelectorAll('.status-select');
        selects.forEach(select => {
            select.onchange = (e) => {
                const issueId = e.target.getAttribute('data-id');
                const newStatus = e.target.value;

                if (issueId) {
                    const statusMap = JSON.parse(localStorage.getItem('issueStatusMap')) || {};
                    statusMap[issueId] = newStatus;
                    localStorage.setItem('issueStatusMap', JSON.stringify(statusMap));
                }

                renderAdminIssues();
            };
        });
    }

    function updateAdminStats() {
        const issues = getAllIssues();
        let total = issues.length;
        let pending = issues.filter(i => i.status === 'pending' || i.status === 'progress').length;
        let resolved = issues.filter(i => i.status === 'resolved').length;

        const totalElem = document.getElementById('totalIssuesCount');
        const pendingElem = document.getElementById('pendingIssuesCount');
        const resolvedElem = document.getElementById('resolvedIssuesCount');

        if (totalElem) totalElem.innerText = total;
        if (pendingElem) pendingElem.innerText = pending;
        if (resolvedElem) resolvedElem.innerText = resolved;
    }

    // ===== 6. INTERACTIVE VOTE AND FILTER LISTENERS =====
    function attachVoteListeners() {
        const affectedButtons = document.querySelectorAll('.vote-btn');
        affectedButtons.forEach(button => {
            button.onclick = function () {
                const id = this.getAttribute('data-id');
                const baseVotes = parseInt(this.getAttribute('data-basevotes')) || 0;
                const voteMap = JSON.parse(localStorage.getItem('issueVotesMap')) || {};

                if (!voteMap[id]) {
                    voteMap[id] = true;
                    this.classList.add('voted');
                    this.style.opacity = '0.85';
                    this.innerText = `I Am Affected (${baseVotes + 1}) ✓`;
                } else {
                    delete voteMap[id];
                    this.classList.remove('voted');
                    this.style.opacity = '1';
                    this.innerText = `I Am Affected (${baseVotes})`;
                }

                localStorage.setItem('issueVotesMap', JSON.stringify(voteMap));
                renderDashboardIssues();
            };
        });
    }

    function attachFilterListeners() {
        const filterContainer = document.getElementById('filterContainer');
        const issueCards = document.querySelectorAll('.steps .step-card');

        if (filterContainer) {
            const filterButtons = filterContainer.querySelectorAll('button');

            filterButtons.forEach(btn => {
                btn.onclick = () => {
                    const category = btn.getAttribute('data-category');

                    filterButtons.forEach(b => {
                        b.classList.remove('btn-pill');
                        b.classList.add('btn-ghost');
                    });
                    btn.classList.remove('btn-ghost');
                    btn.classList.add('btn-pill');

                    issueCards.forEach(card => {
                        const cardCategory = card.getAttribute('data-category');
                        if (category === 'all' || cardCategory === category) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                };
            });
        }
    }
});

// CURSOR FOLLOW EFFECT
document.addEventListener('DOMContentLoaded', () => {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    window.addEventListener('mousemove', (e) => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
    });
});
