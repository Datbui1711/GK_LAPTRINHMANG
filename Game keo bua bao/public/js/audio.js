// Audio Manager
class AudioManager {
    constructor() {
        this.sounds = {};
        this.bgMusic = null;
        this.musicEnabled = true;
        this.soundEnabled = true;
        this.musicVolume = 0.3;
        this.soundVolume = 0.6;
        this.init();
    }

    init() {
        // Background music
        this.bgMusic = new Audio('/sounds/bg.mp3');
        this.bgMusic.loop = true;
        this.bgMusic.volume = this.musicVolume;

        // Game sounds
        this.sounds.click = new Audio('/sounds/click.mp3');
        this.sounds.click.volume = this.soundVolume;

        this.sounds.win = new Audio('/sounds/win.mp3');
        this.sounds.win.volume = this.soundVolume;

        this.sounds.lose = new Audio('/sounds/lose.mp3');
        this.sounds.lose.volume = this.soundVolume;

        this.sounds.draw = new Audio('/sounds/draw.mp3');
        this.sounds.draw.volume = this.soundVolume;

        // Preload sounds
        Object.values(this.sounds).forEach(sound => {
            sound.preload = 'auto';
        });
    }

    playBackgroundMusic() {
        if (this.musicEnabled && this.bgMusic) {
            this.bgMusic.play().catch(error => {
                console.log('Could not play background music:', error);
            });
        }
    }

    stopBackgroundMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
    }

    playSound(soundName) {
        if (!this.soundEnabled) return;

        const sound = this.sounds[soundName];
        if (sound) {
            // Create a new audio instance to allow overlapping sounds
            const audioClone = sound.cloneNode();
            audioClone.volume = this.soundVolume;
            audioClone.play().catch(error => {
                console.log(`Could not play sound ${soundName}:`, error);
            });
        }
    }

    playClick() {
        this.playSound('click');
    }

    playWin() {
        this.playSound('win');
    }

    playLose() {
        this.playSound('lose');
    }

    playDraw() {
        this.playSound('draw');
    }

    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        if (!enabled) {
            this.stopBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.bgMusic) {
            this.bgMusic.volume = this.musicVolume;
        }
    }

    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.soundVolume;
        });
    }
}

// Create global audio manager instance
window.audioManager = new AudioManager();

// Start background music when page loads (after user interaction)
document.addEventListener('DOMContentLoaded', () => {
    // Play music after first user interaction
    const startMusic = () => {
        window.audioManager.playBackgroundMusic();
        document.removeEventListener('click', startMusic);
        document.removeEventListener('touchstart', startMusic);
    };
    
    document.addEventListener('click', startMusic);
    document.addEventListener('touchstart', startMusic);
});

