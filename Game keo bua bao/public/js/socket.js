// Socket.IO Client Manager
class SocketManager {
    constructor() {
        this.socket = null;
        this.username = null;
        this.roomCode = null;
        this.connected = false;
    }

    connect(username, roomCode) {
        this.username = username;
        this.roomCode = roomCode;

        // Connect to server (use relative URL for flexibility)
        this.socket = io({
            transports: ['websocket', 'polling']
        });

        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ Connected to server');
            this.connected = true;
            if (window.gameManager) {
                window.gameManager.updateConnectionStatus('connected');
            }
            
            // Join room immediately after connection
            this.socket.emit('join_room', {
                username: this.username,
                roomCode: this.roomCode
            });
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error);
            this.connected = false;
            if (window.gameManager) {
                window.gameManager.updateConnectionStatus('disconnected');
                window.gameManager.showToast('Không thể kết nối đến server!', 'error');
            }
        });

        this.socket.on('disconnect', () => {
            console.log('🔴 Disconnected from server');
            this.connected = false;
            if (window.gameManager) {
                window.gameManager.updateConnectionStatus('disconnected');
                window.gameManager.showToast('Đã mất kết nối với server!', 'error');
            }
        });

        this.socket.on('reconnect', () => {
            console.log('🔄 Reconnected to server');
            this.connected = true;
            if (window.gameManager) {
                window.gameManager.updateConnectionStatus('connected');
                window.gameManager.showToast('Đã kết nối lại!', 'success');
            }
            
            // Rejoin room
            this.socket.emit('join_room', {
                username: this.username,
                roomCode: this.roomCode
            });
        });

        this.socket.on('reconnect_attempt', () => {
            if (window.gameManager) {
                window.gameManager.updateConnectionStatus('connecting');
            }
        });

        // Game events
        this.socket.on('player_joined', (data) => {
            console.log('👥 Players joined:', data);
            if (window.gameManager) {
                window.gameManager.onPlayersJoined(data);
            }
        });

        this.socket.on('game_started', (data) => {
            console.log('🎮 Game started:', data);
            if (window.gameManager) {
                window.gameManager.onGameStarted(data);
            }
        });

        this.socket.on('choice_made', (data) => {
            console.log('🎯 Choice made:', data);
            if (window.gameManager) {
                window.gameManager.onChoiceMade(data);
            }
        });

        this.socket.on('round_result', (data) => {
            console.log('📊 Round result:', data);
            if (window.gameManager) {
                window.gameManager.onRoundResult(data);
            }
        });

        this.socket.on('next_round', (data) => {
            console.log('➡️ Next round:', data);
            if (window.gameManager) {
                window.gameManager.onNextRound(data);
            }
        });

        this.socket.on('game_over', (data) => {
            console.log('🏆 Game over:', data);
            if (window.gameManager) {
                window.gameManager.onGameOver(data);
            }
        });

        this.socket.on('player_left', (data) => {
            console.log('👋 Player left:', data);
            if (window.gameManager) {
                window.gameManager.onPlayerLeft(data);
            }
        });

        this.socket.on('chat_message', (data) => {
            console.log('💬 Chat message:', data);
            if (window.gameManager) {
                window.gameManager.onChatMessage(data);
            }
        });

        this.socket.on('game_error', (data) => {
            console.error('❌ Game error:', data);
            if (window.gameManager) {
                window.gameManager.showToast(data.message, 'error');
            }
        });

        return this.socket;
    }

    startGame(maxRounds = 3) {
        if (this.socket && this.connected) {
            this.socket.emit('start_game', {
                roomCode: this.roomCode,
                maxRounds: maxRounds
            });
        }
    }

    sendChoice(choice) {
        if (this.socket && this.connected) {
            this.socket.emit('player_choice', {
                roomCode: this.roomCode,
                username: this.username,
                choice: choice
            });
        }
    }

    sendChatMessage(text) {
        if (this.socket && this.connected) {
            this.socket.emit('chat_message', {
                roomCode: this.roomCode,
                username: this.username,
                text: text
            });
        }
    }

    leaveRoom() {
        if (this.socket && this.connected) {
            this.socket.emit('leave_room', {
                roomCode: this.roomCode
            });
        }
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    isConnected() {
        return this.connected && this.socket && this.socket.connected;
    }
}

// Create global socket manager instance
window.socketManager = new SocketManager();

