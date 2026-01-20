// Game Manager - Main game logic
class GameManager {
    constructor() {
        this.username = null;
        this.roomCode = null;
        this.players = [];
        this.scores = {};
        this.currentRound = 0;
        this.maxRounds = 3;
        this.gameActive = false;
        this.hasChosen = false;
        this.myChoice = null;
        this.opponentChoice = null;
        this.unreadMessagesCount = 0; // Đếm số tin nhắn chưa đọc
        
        this.init();
    }

    init() {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.username = urlParams.get('username');
        this.roomCode = urlParams.get('room');

        if (!this.username || !this.roomCode) {
            this.showToast('Thiếu thông tin người chơi!', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }

        // Initialize DOM elements
        this.initializeElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Connect to server
        this.connect();
    }

    initializeElements() {
        // Header
        this.roomCodeDisplay = document.getElementById('roomCodeDisplay');
        this.backBtn = document.getElementById('backBtn');
        this.copyRoomBtn = document.getElementById('copyRoomBtn');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.statusDot = this.connectionStatus?.querySelector('.status-dot');
        this.statusText = this.connectionStatus?.querySelector('.status-text');
        
        // Players
        this.player1Card = document.getElementById('player1Card');
        this.player1Name = document.getElementById('player1Name');
        this.player1Score = document.getElementById('player1Score');
        this.player1Choice = document.getElementById('player1Choice');
        this.player1Status = document.getElementById('player1Status');
        
        this.player2Card = document.getElementById('player2Card');
        this.player2Name = document.getElementById('player2Name');
        this.player2Score = document.getElementById('player2Score');
        this.player2Choice = document.getElementById('player2Choice');
        this.player2Status = document.getElementById('player2Status');
        
        // Round info
        this.currentRoundEl = document.getElementById('currentRound');
        this.maxRoundsEl = document.getElementById('maxRounds');
        
        // Game controls
        this.startSection = document.getElementById('startSection');
        this.choiceSection = document.getElementById('choiceSection');
        this.resultSection = document.getElementById('resultSection');
        this.startGameBtn = document.getElementById('startGameBtn');
        this.waitingText = document.getElementById('waitingText');
        this.choiceButtons = document.querySelectorAll('.choice-btn');
        this.waitingChoice = document.getElementById('waitingChoice');
        
        // Result
        this.resultCard = document.getElementById('resultCard');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultTitle = document.getElementById('resultTitle');
        this.resultMessage = document.getElementById('resultMessage');
        this.rematchBtn = document.getElementById('rematchBtn');
        
        // Chat
        this.chatToggleBtn = document.getElementById('chatToggleBtn');
        this.chatBadge = document.getElementById('chatBadge');
        this.chatPanel = document.getElementById('chatPanel');
        this.closeChatBtn = document.getElementById('closeChatBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        
        // Toast container
        this.toastContainer = document.getElementById('toastContainer');
        
        // Update room code display
        if (this.roomCodeDisplay) {
            this.roomCodeDisplay.textContent = this.roomCode;
        }
        
        // Initialize connection status
        this.updateConnectionStatus('connecting');
    }

    setupEventListeners() {
        // Back button
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => {
                window.socketManager.leaveRoom();
                window.location.href = '/';
            });
        }

        // Start game button
        if (this.startGameBtn) {
            this.startGameBtn.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Choice buttons
        this.choiceButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.gameActive && !this.hasChosen && !btn.disabled) {
                    const choice = btn.dataset.choice;
                    this.selectChoice(choice);
                }
            });
        });

        // Chat
        if (this.chatToggleBtn) {
            this.chatToggleBtn.addEventListener('click', () => {
                this.toggleChat();
            });
        }

        if (this.closeChatBtn) {
            this.closeChatBtn.addEventListener('click', () => {
                this.toggleChat();
            });
        }

        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }

        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }

        // Rematch button
        if (this.rematchBtn) {
            this.rematchBtn.addEventListener('click', () => {
                this.rematch();
            });
        }

        // Copy room code button
        if (this.copyRoomBtn) {
            this.copyRoomBtn.addEventListener('click', () => {
                this.copyRoomCode();
            });
        }
    }

    copyRoomCode() {
        if (this.roomCode) {
            navigator.clipboard.writeText(this.roomCode).then(() => {
                this.showToast('Đã sao chép mã phòng!', 'success');
                // Visual feedback
                if (this.copyRoomBtn) {
                    const originalHTML = this.copyRoomBtn.innerHTML;
                    this.copyRoomBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                    this.copyRoomBtn.style.background = 'rgba(107, 203, 119, 0.2)';
                    setTimeout(() => {
                        this.copyRoomBtn.innerHTML = originalHTML;
                        this.copyRoomBtn.style.background = '';
                    }, 2000);
                }
            }).catch(() => {
                this.showToast('Không thể sao chép mã phòng!', 'error');
            });
        }
    }

    updateConnectionStatus(status) {
        if (!this.connectionStatus) return;
        
        this.connectionStatus.className = 'connection-status';
        this.connectionStatus.classList.add(status);
        
        const statusTexts = {
            'connecting': 'Đang kết nối...',
            'connected': 'Đã kết nối',
            'disconnected': 'Mất kết nối'
        };
        
        if (this.statusText) {
            this.statusText.textContent = statusTexts[status] || 'Đang kết nối...';
        }
    }

    rematch() {
        if (!window.socketManager.isConnected()) {
            this.showToast('Chưa kết nối đến server!', 'error');
            return;
        }

        if (this.players.length < 2) {
            this.showToast('Cần ít nhất 2 người chơi để bắt đầu!', 'error');
            return;
        }

        // Hide rematch button
        if (this.rematchBtn) {
            this.rematchBtn.style.display = 'none';
        }

        // Hide result section
        this.resultSection.style.display = 'none';
        this.startSection.style.display = 'block';

        // Reset game state
        this.gameActive = false;
        this.hasChosen = false;
        this.currentRound = 0;
        this.myChoice = null;
        this.opponentChoice = null;

        // Reset scores
        this.players.forEach(player => {
            this.scores[player] = 0;
        });
        this.updateScoresUI();
        this.updateRoundUI();
        this.resetChoices();
        this.resetPlayerChoices();

        window.audioManager.playClick();
    }

    connect() {
        window.socketManager.connect(this.username, this.roomCode);
    }

    startGame() {
        if (!window.socketManager.isConnected()) {
            this.showToast('Chưa kết nối đến server!', 'error');
            return;
        }

        window.socketManager.startGame(this.maxRounds);
        window.audioManager.playClick();
    }

    selectChoice(choice) {
        if (this.hasChosen) return;

        this.hasChosen = true;
        this.myChoice = choice;

        // Update UI
        this.choiceButtons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.choice === choice) {
                btn.classList.add('selected');
            } else {
                btn.style.opacity = '0.5';
            }
        });

        this.waitingChoice.style.display = 'block';
        window.audioManager.playClick();

        // Send choice to server
        window.socketManager.sendChoice(choice);

        // Show player's choice
        this.showPlayerChoice(this.username, choice, true);
    }

    showPlayerChoice(username, choice, isMe) {
        const playerChoiceEl = this.isPlayer1(username) ? this.player1Choice : this.player2Choice;

        if (playerChoiceEl) {
            const iconEl = playerChoiceEl.querySelector('.choice-icon');
            const choiceIcon = this.getChoiceIcon(choice);
            iconEl.textContent = choiceIcon;
            iconEl.classList.add('show');
        }
    }

    getChoiceIcon(choice) {
        const icons = {
            rock: '✊',
            paper: '✋',
            scissors: '✌️'
        };
        return icons[choice] || '❓';
    }

    isPlayer1(username) {
        return this.players.length > 0 && this.players[0] === username;
    }

    // Socket event handlers
    onPlayersJoined(data) {
        this.players = data.players || [];
        this.scores = data.scores || {};

        this.updatePlayersUI();
        this.updateScoresUI();

        // Show/hide start button based on player count
        if (this.players.length >= 2) {
            if (this.waitingText) {
                this.waitingText.style.display = 'none';
            }
        } else {
            if (this.waitingText) {
                this.waitingText.style.display = 'block';
            }
        }
    }

    onGameStarted(data) {
        this.gameActive = true;
        this.hasChosen = false;
        this.myChoice = null;
        this.opponentChoice = null;
        this.currentRound = 0;
        this.maxRounds = data.maxRounds || 3;

        // Reset UI
        this.startSection.style.display = 'none';
        this.choiceSection.style.display = 'block';
        this.resultSection.style.display = 'none';

        // Reset choices
        this.resetChoices();
        this.resetPlayerChoices();

        // Reset scores
        this.players.forEach(player => {
            this.scores[player] = 0;
        });

        // Reset unread messages count
        this.unreadMessagesCount = 0;
        this.updateChatBadge();

        this.updateScoresUI();
        this.updateRoundUI();

        // Clear result
        if (this.resultCard) {
            this.resultCard.className = 'result-card';
        }

        this.showToast('Trận đấu đã bắt đầu!', 'success');
        window.audioManager.playClick();
    }

    onChoiceMade(data) {
        if (data.username !== this.username) {
            // Opponent made a choice
            if (this.hasChosen) {
                this.waitingChoice.style.display = 'none';
            }
        }
    }

    onRoundResult(data) {
        this.currentRound = data.currentRound || 0;
        this.scores = data.scores || {};

        // Show both choices
        data.players.forEach(player => {
            const isMe = player.username === this.username;
            this.showPlayerChoice(player.username, player.choice, isMe);
        });

        // Determine result
        const winner = data.winner;
        const isWinner = winner === this.username;
        const isDraw = winner === 'Draw';

        // Update scores
        this.updateScoresUI();
        this.updateRoundUI();

        // Show result
        this.showResult(isWinner, isDraw, winner);

        // Play sound
        if (isDraw) {
            window.audioManager.playDraw();
        } else if (isWinner) {
            window.audioManager.playWin();
        } else {
            window.audioManager.playLose();
        }

        // Update player cards
        if (isWinner) {
            const playerCard = this.isPlayer1(this.username) ? this.player1Card : this.player2Card;
            playerCard.classList.add('winner');
            setTimeout(() => {
                playerCard.classList.remove('winner');
            }, 3000);
        }
    }

    onNextRound(data) {
        this.currentRound = data.currentRound || 0;
        this.scores = data.scores || {};
        this.hasChosen = false;
        this.myChoice = null;
        this.opponentChoice = null;

        // Reset UI
        this.choiceSection.style.display = 'block';
        this.resultSection.style.display = 'none';

        this.resetChoices();
        this.resetPlayerChoices();

        this.updateScoresUI();
        this.updateRoundUI();

        // Remove winner class
        this.player1Card.classList.remove('winner');
        this.player2Card.classList.remove('winner');

        this.showToast(`Vòng ${this.currentRound} bắt đầu!`, 'success');
    }

    onGameOver(data) {
        this.gameActive = false;
        this.hasChosen = false;

        const isWinner = data.winner === this.username;
        const isDraw = !data.winner || data.winner === 'Draw';

        // Show final result
        this.showResult(isWinner, isDraw, data.winner, true);

        // Reset after delay
        setTimeout(() => {
            this.startSection.style.display = 'block';
            this.choiceSection.style.display = 'none';
            this.resultSection.style.display = 'none';
            this.resetChoices();
            this.resetPlayerChoices();

            // Reset scores
            this.players.forEach(player => {
                this.scores[player] = 0;
            });
            this.updateScoresUI();

            if (isWinner) {
                window.audioManager.playWin();
            } else if (!isDraw) {
                window.audioManager.playLose();
            }
        }, 5000);
    }

    onPlayerLeft(data) {
        this.showToast(`${data.username} đã rời phòng`, 'warning');
        
        // Reset game state
        this.gameActive = false;
        this.hasChosen = false;
        this.startSection.style.display = 'block';
        this.choiceSection.style.display = 'none';
        this.resultSection.style.display = 'none';
        this.resetChoices();
        this.updatePlayersUI();
    }

    onChatMessage(data) {
        this.addChatMessage(data.username, data.text);
        
        // Chỉ đếm tin nhắn nếu không phải từ chính mình
        if (data.username !== this.username) {
            // Tăng số tin nhắn chưa đọc nếu chat panel đang đóng
            if (!this.chatPanel.classList.contains('open')) {
                this.unreadMessagesCount++;
                this.updateChatBadge();
                
                // Chỉ hiển thị notification toast cho tin nhắn đầu tiên hoặc mỗi 3 tin nhắn
                if (this.unreadMessagesCount === 1 || this.unreadMessagesCount % 3 === 0) {
                    const countText = this.unreadMessagesCount > 1 ? ` (${this.unreadMessagesCount} tin nhắn)` : '';
                    this.showToast(`Tin nhắn mới từ ${data.username}${countText}`, 'info');
                }
                
                // Play notification sound
                if (window.audioManager && window.audioManager.playClick) {
                    window.audioManager.playClick();
                }
            }
        }
    }

    // UI Updates
    updatePlayersUI() {
        if (this.players.length >= 1) {
            this.player1Name.textContent = this.players[0];
            this.player1Status.classList.add('ready');
        } else {
            this.player1Name.textContent = 'Chờ người chơi...';
            this.player1Status.classList.remove('ready');
        }

        if (this.players.length >= 2) {
            this.player2Name.textContent = this.players[1];
            this.player2Status.classList.add('ready');
        } else {
            this.player2Name.textContent = 'Chờ người chơi...';
            this.player2Status.classList.remove('ready');
        }

        // Mark active player
        if (this.isPlayer1(this.username)) {
            this.player1Card.classList.add('active');
            this.player2Card.classList.remove('active');
        } else if (this.players.length >= 2 && this.players[1] === this.username) {
            this.player2Card.classList.add('active');
            this.player1Card.classList.remove('active');
        }
    }

    updateScoresUI() {
        if (this.players.length >= 1) {
            const newScore = this.scores[this.players[0]] || 0;
            const oldScore = parseInt(this.player1Score.textContent) || 0;
            this.player1Score.textContent = newScore;
            if (newScore > oldScore) {
                this.player1Score.classList.add('updated');
                setTimeout(() => {
                    this.player1Score.classList.remove('updated');
                }, 600);
            }
        }
        if (this.players.length >= 2) {
            const newScore = this.scores[this.players[1]] || 0;
            const oldScore = parseInt(this.player2Score.textContent) || 0;
            this.player2Score.textContent = newScore;
            if (newScore > oldScore) {
                this.player2Score.classList.add('updated');
                setTimeout(() => {
                    this.player2Score.classList.remove('updated');
                }, 600);
            }
        }
    }

    updateRoundUI() {
        if (this.currentRoundEl) {
            this.currentRoundEl.textContent = this.currentRound;
        }
        if (this.maxRoundsEl) {
            this.maxRoundsEl.textContent = this.maxRounds;
        }
    }

    resetChoices() {
        this.choiceButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('selected');
            btn.style.opacity = '1';
        });
        this.waitingChoice.style.display = 'none';
    }

    resetPlayerChoices() {
        const choiceIcons = document.querySelectorAll('.choice-icon');
        choiceIcons.forEach(icon => {
            icon.textContent = '';
            icon.classList.remove('show');
        });
    }

    showResult(isWinner, isDraw, winner, isGameOver = false) {
        this.choiceSection.style.display = 'none';
        this.resultSection.style.display = 'block';

        // Hide rematch button initially
        if (this.rematchBtn) {
            this.rematchBtn.style.display = 'none';
        }

        if (isDraw) {
            this.resultIcon.textContent = '🤝';
            this.resultTitle.textContent = 'Hòa!';
            this.resultMessage.textContent = 'Cả hai cùng chọn giống nhau!';
            this.resultCard.className = 'result-card draw';
        } else if (isWinner) {
            this.resultIcon.textContent = '🎉';
            this.resultTitle.textContent = isGameOver ? 'Bạn thắng trận đấu!' : 'Bạn thắng vòng này!';
            this.resultMessage.textContent = isGameOver ? 
                `Chúc mừng ${this.username}! Bạn là người chiến thắng!` :
                'Tiếp tục phát huy!';
            this.resultCard.className = 'result-card win';
        } else {
            this.resultIcon.textContent = '😔';
            this.resultTitle.textContent = isGameOver ? 'Bạn thua trận đấu!' : 'Bạn thua vòng này!';
            this.resultMessage.textContent = isGameOver ? 
                `${winner} là người chiến thắng! Cố gắng lần sau nhé!` :
                'Cố gắng vòng tiếp theo!';
            this.resultCard.className = 'result-card lose';
        }
    }

    // Chat functions
    toggleChat() {
        const wasOpen = this.chatPanel.classList.contains('open');
        this.chatPanel.classList.toggle('open');
        
        if (this.chatPanel.classList.contains('open')) {
            this.chatInput.focus();
            // Reset số tin nhắn chưa đọc khi mở chat
            this.unreadMessagesCount = 0;
            this.updateChatBadge();
        } else if (wasOpen) {
            // Nếu đang đóng chat, cập nhật lại badge với số tin nhắn hiện tại
            this.updateChatBadge();
        }
    }

    sendChatMessage() {
        const text = this.chatInput.value.trim();
        if (!text) return;

        window.socketManager.sendChatMessage(text);
        this.chatInput.value = '';
    }

    addChatMessage(username, text) {
        // Remove welcome message if exists
        const welcome = this.chatMessages.querySelector('.chat-welcome');
        if (welcome) {
            welcome.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        const isMe = username === this.username;
        messageDiv.innerHTML = `
            <span class="message-author">${isMe ? 'Bạn' : username}</span>
            <div class="message-text">${this.escapeHtml(text)}</div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        // Nếu chat đang mở và là tin nhắn từ người khác, không cần đếm
        // Logic đếm sẽ được xử lý trong onChatMessage
    }

    updateChatBadge() {
        if (!this.chatBadge) return;
        
        // Nếu chat đang mở, ẩn badge
        if (this.chatPanel.classList.contains('open')) {
            this.chatBadge.style.display = 'none';
            this.unreadMessagesCount = 0;
            return;
        }
        
        // Hiển thị badge với số tin nhắn chưa đọc
        if (this.unreadMessagesCount > 0) {
            // Hiển thị số, nếu > 99 thì hiển thị "99+"
            const displayCount = this.unreadMessagesCount > 99 ? '99+' : this.unreadMessagesCount;
            this.chatBadge.textContent = displayCount;
            this.chatBadge.style.display = 'flex';
            
            // Animation khi có tin nhắn mới
            this.chatBadge.classList.add('badge-pulse');
            setTimeout(() => {
                this.chatBadge.classList.remove('badge-pulse');
            }, 600);
        } else {
            this.chatBadge.style.display = 'none';
        }
    }

    // Utility functions
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
});

