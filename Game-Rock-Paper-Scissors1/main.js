// Main Landing Page Logic
class LandingPage {
    constructor() {
        this.currentAction = 'create';
        this.socket = null;
        this.init();
    }

    init() {
        this.usernameInput = document.getElementById('username');
        this.roomCodeInput = document.getElementById('roomCode');
        this.roomCodeSection = document.getElementById('roomCodeSection');
        this.startBtn = document.getElementById('startBtn');
        this.optionBtns = document.querySelectorAll('.option-btn');
        this.generatedRoomCode = document.getElementById('generatedRoomCode');
        this.displayRoomCode = document.getElementById('displayRoomCode');
        this.copyBtn = document.getElementById('copyBtn');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Option buttons (Create/Join)
        this.optionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.optionBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentAction = btn.dataset.action;
                
                if (this.currentAction === 'join') {
                    this.roomCodeSection.style.display = 'block';
                } else {
                    this.roomCodeSection.style.display = 'none';
                    this.generatedRoomCode.style.display = 'none';
                    this.roomCodeInput.value = '';
                }
            });
        });

        // Start button
        this.startBtn.addEventListener('click', () => {
            this.handleStart();
        });

        // Enter key on inputs
        this.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (this.currentAction === 'join' && this.roomCodeInput.value.trim()) {
                    this.handleStart();
                }
            }
        });

        this.roomCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleStart();
            }
        });

        // Copy button
        this.copyBtn.addEventListener('click', () => {
            this.copyRoomCode();
        });

        // Uppercase room code input
        this.roomCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
    }

    handleStart() {
        const username = this.usernameInput.value.trim();
        
        if (!username) {
            this.showError('Vui lòng nhập tên của bạn!');
            this.usernameInput.focus();
            return;
        }

        if (this.currentAction === 'join') {
            const roomCode = this.roomCodeInput.value.trim().toUpperCase();
            
            if (!roomCode) {
                this.showError('Vui lòng nhập mã phòng!');
                this.roomCodeInput.focus();
                return;
            }

            if (roomCode.length !== 6) {
                this.showError('Mã phòng phải có 6 ký tự!');
                this.roomCodeInput.focus();
                return;
            }

            // Redirect to game page
            window.location.href = `/game?username=${encodeURIComponent(username)}&room=${encodeURIComponent(roomCode)}`;
        } else {
            // Create new room
            const roomCode = this.generateRoomCode();
            this.displayRoomCode.textContent = roomCode;
            this.generatedRoomCode.style.display = 'block';
            
            // Redirect to game page after a short delay
            setTimeout(() => {
                window.location.href = `/game?username=${encodeURIComponent(username)}&room=${encodeURIComponent(roomCode)}`;
            }, 2000);
        }
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    copyRoomCode() {
        const code = this.displayRoomCode.textContent;
        navigator.clipboard.writeText(code).then(() => {
            const tooltip = this.copyBtn.querySelector('.tooltip');
            if (tooltip) {
                const originalText = tooltip.textContent;
                tooltip.textContent = 'Đã sao chép!';
                setTimeout(() => {
                    tooltip.textContent = originalText;
                }, 2000);
            }
        }).catch(() => {
            this.showError('Không thể sao chép mã phòng!');
        });
    }

    showError(message) {
        // Simple alert for now, can be enhanced with toast
        alert(message);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LandingPage();
});

