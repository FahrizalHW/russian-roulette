document.addEventListener('DOMContentLoaded', function() {
    const setupScreen = document.getElementById('setup');
    const gameScreen = document.getElementById('game');
    const gameOver = document.getElementById('game-over');
    const overlay = document.getElementById('overlay');
    const animationContainer = document.getElementById('animation-container');

    const startBtn = document.getElementById('start-btn');
    const spinBtn = document.getElementById('spin-btn');
    const shootBtn = document.getElementById('shoot-btn');
    const restartBtn = document.getElementById('restart-btn');

    const playerNamesInput = document.getElementById('player-names');
    const currentPlayerDisplay = document.getElementById('current-player');
    const messageDisplay = document.getElementById('message');
    const playersList = document.getElementById('players-list');
    const resultMessage = document.getElementById('result-message');
    const winnerDisplay = document.getElementById('winner-display');
    const winnerName = document.getElementById('winner-name');
    const playersCount = document.getElementById('count');

    const gunshotSound = document.getElementById('gunshot');
    const emptyClickSound = document.getElementById('empty-click');
    const cylinderSpinSound = document.getElementById('cylinder-spin');
    const gameStartSound = document.getElementById('game-start');
    const playerDiedSound = document.getElementById('player-died');
    const gameWinSound = document.getElementById('game-win');

    let players = [];
    let currentPlayerIndex = 0;
    let cylinderChambers = [0, 0, 0, 0, 0, 0]; 
    let currentChamber = 0;
    let difficultyBullets = 1; 
    let gameActive = false;

    playerNamesInput.addEventListener('input', function() {
        const names = playerNamesInput.value.split(',').filter(name => name.trim() !== '');
        playersCount.textContent = names.length;
    });

    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            difficultyBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            difficultyBullets = parseInt(this.getAttribute('data-bullets'));
        });
    });

    startBtn.addEventListener('click', function() {
        const playerNames = playerNamesInput.value.split(',')
            .map(name => name.trim())
            .filter(name => name !== '');
            
        if (playerNames.length < 2) {
            alert('Masukkan minimal 2 pemain!');
            return;
        }
        
        startGame(playerNames);
    });

    spinBtn.addEventListener('click', function() {
        if (!gameActive) return;
        spinCylinder();
    });

    shootBtn.addEventListener('click', function() {
        if (!gameActive) return;
        shoot();
    });
    
    restartBtn.addEventListener('click', function() {
        resetGame();
    });
    
    function startGame(playerNames) {
        players = playerNames.map(name => ({
            name: name,
            alive: true
        }));
        
        currentPlayerIndex = 0;
        loadCylinder();
        
        updatePlayersList();
        currentPlayerDisplay.textContent = players[currentPlayerIndex].name;
        messageDisplay.textContent = "Tarik pelatuk atau putar silinder!";

        setupScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
        gameOver.style.display = 'none';
        
        gameStartSound.play();

        gameActive = true;

        currentPlayerDisplay.classList.add('animate__animated', 'animate__headShake');

        showOverlay('GAME DIMULAI!', 'animate__bounceIn', 1500);
    }
    
    function loadCylinder() {
        cylinderChambers = [0, 0, 0, 0, 0, 0];
        
        for (let i = 0; i < difficultyBullets; i++) {
            let chamberIndex;
            do {
                chamberIndex = Math.floor(Math.random() * 6);
            } while (cylinderChambers[chamberIndex] === 1);
            
            cylinderChambers[chamberIndex] = 1;
        }
        
        currentChamber = Math.floor(Math.random() * 6);           
        updateCylinderDisplay();
    }
    
    function spinCylinder() {
        cylinderSpinSound.play();            
        disableButtons(true);     
        
        const cylinder = document.querySelector('.cylinder');
        cylinder.classList.add('spinning');  
        
        setTimeout(function() {
            currentChamber = Math.floor(Math.random() * 6);
            cylinder.classList.remove('spinning');
            updateCylinderDisplay();
            messageDisplay.textContent = "Silinder telah diputar! Tarik pelatuk!";
            disableButtons(false);
        }, 1000);
    }
    
    function shoot() {
        
        disableButtons(true);
        const hasBullet = cylinderChambers[currentChamber] === 1; 
        
        if (hasBullet) {
            gunshotSound.play();
        } else {
            emptyClickSound.play();
        }   
        animateGun(hasBullet);
    
        setTimeout(function() {
            if (hasBullet) {
                
                playerDied();
            } else {
                
                currentChamber = (currentChamber + 1) % 6;
                nextPlayer();
                updateCylinderDisplay();
                messageDisplay.textContent = "Klik! Aman untuk giliran ini.";
                disableButtons(false);
            }
        }, hasBullet ? 1500 : 800);
    }
    
    function playerDied() {
        
        players[currentPlayerIndex].alive = false;
        playerDiedSound.play();
        
        
        showOverlay(`${players[currentPlayerIndex].name} MATI!`, 'animate__zoomIn animate__faster', 1500);
        
       
        updatePlayersList();
        
        
        const alivePlayers = players.filter(player => player.alive);
        
        if (alivePlayers.length <= 1) {
            
            endGame(alivePlayers[0]);
        } else {
            
            nextPlayer();
            setTimeout(function() {
                disableButtons(false);
                messageDisplay.textContent = `${players[currentPlayerIndex].name}, giliran Anda!`;
            }, 1000);
        }
    }
    
    function nextPlayer() {
        
        do {
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        } while (!players[currentPlayerIndex].alive);
        
        
        currentPlayerDisplay.textContent = players[currentPlayerIndex].name;
        currentPlayerDisplay.classList.remove('animate__headShake');
        void currentPlayerDisplay.offsetWidth; 
        currentPlayerDisplay.classList.add('animate__headShake');
    }
    
    function endGame(winner) {
        gameActive = false;
        
       
        resultMessage.textContent = "GAME OVER";
        
        if (winner) {
            winnerName.textContent = winner.name;
            winnerDisplay.style.display = 'flex';
            gameWinSound.play();
            showOverlay(`${winner.name} MENANG!`, 'animate__bounceIn', 2000);
        } else {
            winnerDisplay.style.display = 'none';
        }
        
        
        setTimeout(function() {
            gameOver.style.display = 'flex';
        }, 2000);
    }
    
    function resetGame() {
        
        setupScreen.style.display = 'flex';
        gameScreen.style.display = 'none';
        gameOver.style.display = 'none';
        
        
        playersList.innerHTML = '';
        
        
        difficultyBtns.forEach(btn => btn.classList.remove('selected'));
        difficultyBtns[0].classList.add('selected');
        difficultyBullets = 1;
    }
    
    function updatePlayersList() {
        playersList.innerHTML = '';
        
        players.forEach((player, index) => {
            const playerEl = document.createElement('div');
            playerEl.className = `player-item ${!player.alive ? 'dead' : ''} ${index === currentPlayerIndex ? 'current' : ''}`;
            
            playerEl.innerHTML = `
                <div class="player-avatar">
                    <i class="fas ${player.alive ? 'fa-user' : 'fa-skull'}"></i>
                </div>
                <div class="player-name">${player.name}</div>
            `;
            
            playersList.appendChild(playerEl);
        });
    }
    
    function updateCylinderDisplay() {
        
        document.querySelectorAll('.cylinder-chamber').forEach((chamber, index) => {
            chamber.className = 'cylinder-chamber';
            
            if (index === currentChamber) {
                chamber.classList.add('current');
            }
        });
    }
    
    function animateGun(hasBullet) {
        const animation = hasBullet ? 
            '<div class="gunshot-animation"></div>' : 
            '<div class="empty-click-animation"></div>';
            
        animationContainer.innerHTML = animation;
        overlay.style.display = 'flex';
        
        setTimeout(function() {
            overlay.style.display = 'none';
            animationContainer.innerHTML = '';
        }, hasBullet ? 1200 : 600);
    }
    
    function showOverlay(text, animationClass, duration) {
        const messageEl = document.createElement('div');
        messageEl.className = `overlay-message animate__animated ${animationClass}`;
        messageEl.textContent = text;
        
        animationContainer.innerHTML = '';
        animationContainer.appendChild(messageEl);
        overlay.style.display = 'flex';
        
        setTimeout(function() {
            overlay.style.display = 'none';
        }, duration);
    }
    
    function disableButtons(disabled) {
        spinBtn.disabled = disabled;
        shootBtn.disabled = disabled;
    }
});




let gameStats = {
    gamesPlayed: 0,
    shots: 0,
    deaths: 0,
    spins: 0,
    winners: {}
};

function updateStats(statType, value) {
    
    switch(statType) {
        case 'game':
            gameStats.gamesPlayed++;
            break;
        case 'shot':
            gameStats.shots++;
            break;
        case 'death':
            gameStats.deaths++;
            break;
        case 'spin':
            gameStats.spins++;
            break;
        case 'winner':
            if (!gameStats.winners[value]) {
                gameStats.winners[value] = 0;
            }
            gameStats.winners[value]++;
            break;
    }
    
    
    localStorage.setItem('russianRouletteStats', JSON.stringify(gameStats));
}

function loadStats() {
    const savedStats = localStorage.getItem('russianRouletteStats');
    if (savedStats) {
        gameStats = JSON.parse(savedStats);
    }
}

function displayStats() {
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    let winnersHTML = '';
    if (Object.keys(gameStats.winners).length > 0) {
        const sortedWinners = Object.entries(gameStats.winners)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
            
        winnersHTML = `
            <div class="stats-section">
                <div class="stats-title">Top Winners</div>
                <div class="stats-grid">
                    ${sortedWinners.map(([name, wins]) => `
                        <div class="stat-item">
                            <div class="stat-value">${wins}</div>
                            <div class="stat-label">${name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="close-modal">&times;</div>
            <h2>Game Statistics</h2>
            
            <div class="stats-section">
                <div class="stats-title">Overall Stats</div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${gameStats.gamesPlayed}</div>
                        <div class="stat-label">Games Played</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${gameStats.shots}</div>
                        <div class="stat-label">Total Shots</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${gameStats.deaths}</div>
                        <div class="stat-label">Total Deaths</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${gameStats.spins}</div>
                        <div class="stat-label">Cylinder Spins</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${((gameStats.deaths / gameStats.shots) * 100 || 0).toFixed(1)}%</div>
                        <div class="stat-label">Death Rate</div>
                    </div>
                </div>
            </div>
            
            ${winnersHTML}
            
            <button class="pulse-btn" id="reset-stats">Reset Statistics</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    modal.querySelector('#reset-stats').addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua statistik?')) {
            gameStats = {
                gamesPlayed: 0,
                shots: 0,
                deaths: 0,
                spins: 0,
                winners: {}
            };
            localStorage.removeItem('russianRouletteStats');
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    });
}

// Instruksi Game
function showInstructions() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="close-modal">&times;</div>
            <h2>Instruksi Permainan</h2>
            
            <div class="instruction-section">
                <h3>Bagaimana Cara Bermain</h3>
                <ol>
                    <li>Masukkan nama pemain (minimal 2 pemain)</li>
                    <li>Pilih tingkat kesulitan yang diinginkan</li>
                    <li>Mulai permainan dengan menekan tombol "Mulai Permainan"</li>
                    <li>Pada giliran Anda, pilih untuk "Putar Silinder" atau langsung "Tarik Pelatuk"</li>
                    <li>Jika Anda selamat, giliran berlanjut ke pemain berikutnya</li>
                    <li>Jika Anda terkena peluru, Anda akan tereliminasi</li>
                    <li>Pemain terakhir yang bertahan adalah pemenangnya!</li>
                </ol>
            </div>
            
            <div class="instruction-section">
                <h3>Tingkat Kesulitan</h3>
                <ul>
                    <li><strong>Mudah:</strong> 1 peluru (probabilitas 1/6)</li>
                    <li><strong>Sedang:</strong> 2 peluru (probabilitas 2/6)</li>
                    <li><strong>Sulit:</strong> 3 peluru (probabilitas 3/6)</li>
                </ul>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    

    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    

    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
}

function addUtilityButtons() {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'utility-buttons';
    buttonsContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; display: flex; gap: 10px;';
    
    buttonsContainer.innerHTML = `
        <button class="game-btn" id="stats-btn"><i class="fas fa-chart-bar"></i></button>
        <button class="game-btn" id="help-btn"><i class="fas fa-question-circle"></i></button>
    `;
    
    document.body.appendChild(buttonsContainer);
    

    document.getElementById('stats-btn').addEventListener('click', displayStats);
    document.getElementById('help-btn').addEventListener('click', showInstructions);
}


document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    
    
    setupAudioControls();
    
    
    addUtilityButtons();
    

    const originalStartGame = startGame;
    startGame = function(playerNames) {
        originalStartGame(playerNames);
        updateStats('game');
    };
    
    
    const originalShoot = shoot;
    shoot = function() {
        originalShoot();
        updateStats('shot');
    };
    
    
    const originalSpinCylinder = spinCylinder;
    spinCylinder = function() {
        originalSpinCylinder();
        updateStats('spin');
    };
    
   
    const originalPlayerDied = playerDied;
    playerDied = function() {
        originalPlayerDied();
        updateStats('death');
    };
    
    
    const originalEndGame = endGame;
    endGame = function(winner) {
        if (winner) {
            updateStats('winner', winner.name);
        }
        originalEndGame(winner);
    };
    
    
    if (!localStorage.getItem('russianRouletteInstructionShown')) {
        setTimeout(showInstructions, 1000);
        localStorage.setItem('russianRouletteInstructionShown', 'true');
    }
});