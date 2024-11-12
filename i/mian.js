import "./style.css";
import { profiles } from ".profiles.js";
import { createAudioPlayer } from "./components/AudioPlayer.js";

const CACHE_KEY = "matchmaking_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

window.Alpine = Alpine;

// Initialize Alpine.js data
Alpine.data("matchmaking", () => ({
  searchQuery: "",
  filters: {
    education: "",
    gender: "",
    priority: "",
  },
  profiles: profiles,
  filteredProfiles: [],
  drawerOpen: false,
  page: 1,
  perPage: 20,
  hasMore: true,
  loading: false,
  sortOrder: "dateDesc",
  activeAudio: null,

  init() {
    this.filterProfiles();
    this.setupInfiniteScroll();
    this.prefetchAudioFiles(); // Prefetch audio files on init
  },
  clearAllFilters() {
    this.searchQuery = "";
    this.filters = {
      education: "",
      gender: "",
      priority: "",
    };
    this.resetPagination();
  },

  setupInfiniteScroll() {
    window.addEventListener("scroll", () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 500 &&
        !this.loading &&
        this.hasMore
      ) {
        this.loadMore();
      }
    });
  },

  loadMore() {
    if (this.loading || !this.hasMore) return;
    this.page++;
    this.filterProfiles(true);
  },

  resetPagination() {
    this.page = 1;
    this.hasMore = true;
    this.filterProfiles();
  },

  filterProfiles(loadMore = false) {
    if (!loadMore) {
      this.loading = true;
    }

    let filtered = this.profiles.filter((profile) => {
      const matchesSearch =
        profile.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        profile.description
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());

      const matchesEducation =
        !this.filters.education || profile.education === this.filters.education;
      const matchesGender =
        !this.filters.gender || profile.gender === this.filters.gender;
      const matchesPriority =
        !this.filters.priority || profile.priority === this.filters.priority;

      return (
        matchesSearch && matchesEducation && matchesGender && matchesPriority
      );
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortOrder) {
        case "dateDesc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "dateAsc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "userUrgent":
          if (a.priority !== "urgent" && b.priority !== "urgent") return 0;
          if (a.priority === "urgent" && b.priority !== "urgent") return -1;
          if (a.priority !== "urgent" && b.priority === "urgent") return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return this.calculateRelevance(b) - this.calculateRelevance(a);
      }
    });

    // When sorting by urgent, filter out non-urgent listings
    if (this.sortOrder === "userUrgent") {
      filtered = filtered.filter((profile) => profile.priority === "urgent");
    }

    // Apply pagination
    const startIndex = 0;
    const endIndex = this.page * this.perPage;
    this.hasMore = endIndex < filtered.length;

    // Update filtered profiles
    this.filteredProfiles = filtered.slice(startIndex, endIndex);
    this.loading = false;
  },

  calculateRelevance(profile) {
    if (!this.searchQuery) return 0;
    const searchLower = this.searchQuery.toLowerCase();
    let relevance = 0;
    if (profile.title.toLowerCase().includes(searchLower)) relevance += 3;
    if (profile.description.toLowerCase().includes(searchLower)) relevance += 2;
    return relevance;
  },

  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
  },

  // Prefetch audio files
  prefetchAudioFiles() {
    this.profiles.forEach((profile) => {
      if (profile.contact.audioMessage) {
        prefetchAudio(profile.contact.audioMessage);
      }
    });
  },

  // Audio control methods
  stopAllAudio() {
    document.querySelectorAll("audio").forEach((audio) => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
        const button = audio.parentElement.querySelector("button i");
        if (button) {
          button.classList.replace("fa-pause", "fa-play");
        }
      }
    });
    this.activeAudio = null;
  },

  toggleAudio(profileId) {
    const audioElement = document.getElementById(`audio-${profileId}`);

    if (this.activeAudio === profileId) {
      // If the same audio is clicked, pause it
      audioElement.pause();
      this.activeAudio = null; // Reset active audio
    } else {
      // Stop any currently playing audio
      this.stopAllAudio();

      // Play the new audio
      audioElement.play();
      this.activeAudio = profileId; // Set active audio to the current one

      // Add ended event listener
      audioElement.onended = () => {
        this.activeAudio = null; // Reset active audio when finished
      };
    }
  },
}));

Alpine.data("audioPlayer", createAudioPlayer);

Alpine.start();
