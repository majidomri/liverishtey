export function createAudioPlayer(audioUrl) {
  return {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    audio: null,
    progressCircle: {
      radius: 16,
      circumference: 2 * Math.PI * 16,
    },

    init() {
      this.audio = new Audio(audioUrl);
      this.audio.addEventListener("loadedmetadata", () => {
        this.duration = this.audio.duration;
      });
      this.audio.addEventListener("timeupdate", () => {
        this.currentTime = this.audio.currentTime;
      });
      this.audio.addEventListener("ended", () => {
        this.isPlaying = false;
        this.currentTime = 0;
      });
    },

    togglePlay() {
      if (this.isPlaying) {
        this.audio.pause();
      } else {
        this.audio.play();
      }
      this.isPlaying = !this.isPlaying;
    },

    formatTime(time) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    },

    getProgress() {
      if (!this.duration) return 0;
      const progress =
        (this.currentTime / this.duration) * this.progressCircle.circumference;
      return this.progressCircle.circumference - progress;
    },
  };
}
