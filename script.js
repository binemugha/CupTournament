// Track winners
const winners = {};

function selectWinner(element, matchCode) {
    const players = element.querySelectorAll('.player-name:not(.placeholder)');
    if (players.length < 2) return;

    const currentWinner = winners[matchCode];
    let nextIndex = 0;

    if (currentWinner !== undefined) {
        const names = Array.from(players).map(p => p.textContent);
        const currentIndex = names.indexOf(currentWinner);
        nextIndex = (currentIndex + 1) % (players.length + 1);
    }

    players.forEach(p => {
        p.style.color = '#f8fafc';
        p.style.textShadow = 'none';
    });

    if (nextIndex < players.length) {
        const winner = players[nextIndex];
        winner.style.color = '#22c55e';
        winner.style.textShadow = '0 0 10px rgba(34, 197, 94, 0.6)';
        winners[matchCode] = winner.textContent;
        element.classList.add('winner');
    } else {
        delete winners[matchCode];
        element.classList.remove('winner');
    }

    updateBracket();
}

function updateBracket() {
    const updates = {
        'SF1': ['Winner QF1', 'Winner QF2'],
        'SF2': ['Winner QF3', 'Winner QF4'],
        'FINAL': ['Winner SF1', 'Winner SF2']
    };

    document.querySelectorAll('.match-box').forEach(box => {
        const code = box.querySelector('.match-code')?.textContent;
        if (!code || !updates[code]) return;

        const placeholders = box.querySelectorAll('.player-name.placeholder');
        placeholders.forEach((ph, i) => {
            const sourceCode = updates[code][i];
            if (winners[sourceCode]) {
                ph.textContent = winners[sourceCode];
                ph.classList.remove('placeholder');
                ph.style.color = '#94a3b8';
            } else {
                ph.textContent = sourceCode;
                ph.classList.add('placeholder');
            }
        });
    });

    if (winners['FINAL']) {
        document.getElementById('championCrown').classList.add('active');
    } else {
        document.getElementById('championCrown').classList.remove('active');
    }

    // Redraw connectors after bracket updates (positions may shift slightly)
    setTimeout(drawConnectors, 350);
}

// Connector drawing
const connections = [
    { from: 'QF1', to: 'SF1' },
    { from: 'QF2', to: 'SF1' },
    { from: 'SF1', to: 'FINAL' },
    { from: 'SF2', to: 'FINAL' },
    { from: 'QF3', to: 'SF2' },
    { from: 'QF4', to: 'SF2' }
];

function drawConnectors() {
    const svg = document.getElementById('connectorSvg');
    const bracket = document.getElementById('bracket');
    if (!svg || !bracket) return;

    const bracketRect = bracket.getBoundingClientRect();

    // Clear existing paths (keep defs)
    const defs = svg.querySelector('defs');
    svg.innerHTML = '';
    if (defs) svg.appendChild(defs);

    connections.forEach(conn => {
        const fromEl = document.querySelector(`[data-match="${conn.from}"]`);
        const toEl = document.querySelector(`[data-match="${conn.to}"]`);
        if (!fromEl || !toEl) return;

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        let x1, y1, x4, y4;

        if (fromRect.left < toRect.left) {
            x1 = fromRect.right - bracketRect.left;
            y1 = fromRect.top + fromRect.height / 2 - bracketRect.top;
            x4 = toRect.left - bracketRect.left;
            y4 = toRect.top + toRect.height / 2 - bracketRect.top;
        } else {
            x1 = fromRect.left - bracketRect.left;
            y1 = fromRect.top + fromRect.height / 2 - bracketRect.top;
            x4 = toRect.right - bracketRect.left;
            y4 = toRect.top + toRect.height / 2 - bracketRect.top;
        }

        const midX = (x1 + x4) / 2;

        // Glow layer (wide, blurry)
        const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        glowPath.setAttribute('d', `M ${x1},${y1} L ${midX},${y1} L ${midX},${y4} L ${x4},${y4}`);
        glowPath.setAttribute('stroke', 'rgba(252, 194, 27, 0.35)');
        glowPath.setAttribute('stroke-width', '8');
        glowPath.setAttribute('fill', 'none');
        glowPath.setAttribute('stroke-linejoin', 'round');
        glowPath.setAttribute('stroke-linecap', 'round');
        glowPath.setAttribute('filter', 'url(#glow)');
        svg.appendChild(glowPath);

        // Secondary glow layer (blue)
        const blueGlow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        blueGlow.setAttribute('d', `M ${x1},${y1} L ${midX},${y1} L ${midX},${y4} L ${x4},${y4}`);
        blueGlow.setAttribute('stroke', 'rgba(0, 82, 165, 0.25)');
        blueGlow.setAttribute('stroke-width', '5');
        blueGlow.setAttribute('fill', 'none');
        blueGlow.setAttribute('stroke-linejoin', 'round');
        blueGlow.setAttribute('stroke-linecap', 'round');
        svg.appendChild(blueGlow);

        // Main line
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1},${y1} L ${midX},${y1} L ${midX},${y4} L ${x4},${y4}`);
        path.setAttribute('stroke', 'rgba(252, 194, 27, 0.95)');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('filter', 'url(#glow-blue)');
        svg.appendChild(path);
    });
}

// Draw connectors on load and resize
window.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure fonts and layout are settled
    setTimeout(drawConnectors, 100);
    setTimeout(drawConnectors, 500);
});

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawConnectors, 100);
});
