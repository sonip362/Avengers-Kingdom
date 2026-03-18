document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const clearBtn = document.getElementById('clearBtn');
    const crayonsGrid = document.getElementById('crayonsGrid');
    const brushSizeInput = document.getElementById('brushSize');

    // 12 vibrant crayon colors
    const colors = [
        { name: 'Spidey Red', hex: '#FF0000' },
        { name: 'Spidey Blue', hex: '#4169E1' },
        { name: 'Spider Black', hex: '#111111' },
        { name: 'Web White', hex: '#FFFFFF' },
        { name: 'Power Yellow', hex: '#FFFF00' },
        { name: 'Venom Green', hex: '#008000' },
        { name: 'Fire Orange', hex: '#FFA500' },
        { name: 'Mystic Purple', hex: '#800080' },
        { name: 'Goblin Green', hex: '#32CD32' },
        { name: 'Earth Brown', hex: '#8B4513' },
        { name: 'Steel Gray', hex: '#808080' },
        { name: 'Sky Cyan', hex: '#00FFFF' }
    ];

    let painting = false;
    let currentColor = colors[0].hex;
    let currentBrushSize = brushSizeInput.value;
    let currentLevel = 'spiderman'; // Initial level

    // --- Background Music ---
    const bgMusic = new Audio('music.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    bgMusic.load(); // Explicitly start loading

    function startMusic() {
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                console.log("Music started successfully");
                document.removeEventListener('click', startMusic);
                document.removeEventListener('touchstart', startMusic);
            }).catch(e => {
                console.log("Music play failed, waiting for stronger interaction", e);
            });
        }
    }
    document.addEventListener('click', startMusic);
    document.addEventListener('touchstart', startMusic);

    // --- Local Storage Persistence ---
    function saveDrawing() {
        localStorage.setItem(`drawing_app_${currentLevel}`, canvas.toDataURL());
    }

    function loadDrawing(level) {
        const saved = localStorage.getItem(`drawing_app_${level}`);
        // Clear canvas to white first
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (saved) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = saved;
        }
    }

    // --- Canvas Setup ---
    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

        canvas.width = rect.width;
        canvas.height = rect.height;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    loadDrawing(currentLevel);

    // Setup crayons
    colors.forEach((c, index) => {
        const crayon = document.createElement('div');
        crayon.classList.add('crayon');
        if (index === 0) crayon.classList.add('active');
        crayon.style.backgroundColor = c.hex;
        crayon.innerHTML = `<span class="crayon-label">${c.name}</span>`;
        crayon.addEventListener('click', () => {
            startMusic(); // Trigger music on selection
            document.querySelectorAll('.crayon').forEach(el => el.classList.remove('active'));
            crayon.classList.add('active');
            currentColor = c.hex;
        });
        crayonsGrid.appendChild(crayon);
    });

    // --- Drawing functions ---
    function startPosition(e) {
        startMusic(); // Trigger music on first draw
        painting = true;
        draw(e);
    }

    function finishedPosition() {
        if (painting) {
            painting = false;
            ctx.beginPath();
            saveDrawing(); 
        }
    }

    function draw(e) {
        if (!painting) return;

        const rect = canvas.getBoundingClientRect();
        let x, y;

        if (e.touches && e.touches[0]) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        ctx.lineWidth = currentBrushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = currentColor;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    // Event listeners
    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mouseout', finishedPosition);
    canvas.addEventListener('mousemove', draw);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startPosition(e);
    }, { passive: false });
    canvas.addEventListener('touchend', finishedPosition);
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e);
    }, { passive: false });

    brushSizeInput.addEventListener('input', (e) => {
        currentBrushSize = e.target.value;
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your masterpiece?')) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            saveDrawing(); 
        }
    });

    // --- Level Selection ---
    const levelBtns = document.querySelectorAll('.level-btn');
    const outlines = document.querySelectorAll('.outline-overlay');

    levelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            startMusic(); // Trigger music on level change
            saveDrawing();

            const level = btn.getAttribute('data-level');
            currentLevel = level;
            
            levelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            outlines.forEach(outline => {
                const outlineId = `${level}Outline`;
                if (outline.id === outlineId) {
                    outline.classList.add('visible');
                    outline.classList.remove('hidden');
                } else {
                    outline.classList.add('hidden');
                    outline.classList.remove('visible');
                }
            });

            loadDrawing(currentLevel);
        });
    });
});
