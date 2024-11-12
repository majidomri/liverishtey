function userDirectory() {
  return {
    users: [],
    displayedUsers: [],
    searchTerm: "",
    idFilter: "",
    sortOrder: "dateDesc",
    genderFilter: "all",
    educationFilter: "all",
    loading: false,
    drawerOpen: false,
    audioPlayers: {},
    hasMore: true,
    page: 1,
    itemsPerPage: 25,
    educationOptions: [
      "All",
      "Preprimary",
      "Primary",
      "Upper Primary",
      "Secondary",
      "Higher Secondary",
      "Intermediate",
      "Graduate",
      "Post Graduate",
      "Engineer",
      "Doctor",
      "PHD",
      "Religious Scholar",
    ],
    activeAudio: null, // Track the currently active audio

    init() {
      this.fetchUsers();
      this.setupInfiniteScroll();
      this.setupDrawerSwipe();
    },

    setupDrawerSwipe() {
      let touchStartY = 0;
      const drawer = document.getElementById("mobileDrawer");

      drawer.addEventListener(
        "touchstart",
        (e) => {
          touchStartY = e.touches[0].clientY;
        },
        { passive: true }
      );

      drawer.addEventListener(
        "touchmove",
        (e) => {
          const currentY = e.touches[0].clientY;
          const diff = currentY - touchStartY;

          if (diff > 50 && this.drawerOpen) {
            this.toggleDrawer();
          } else if (diff < -50 && !this.drawerOpen) {
            this.toggleDrawer();
          }
        },
        { passive: true }
      );
    },

    async fetchUsers() {
      this.loading = true;
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/majidomri/liverishtey/main/jsdata.json"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        const processedUsers = data.map((user) => ({
          ...user,
          date: new Date(user.date || Date.now()).toISOString(),
          gender: user.gender || (Math.random() > 0.5 ? "male" : "female"),
          urgent: user.urgent || false,
          phone:
            user.phone ||
            "+1" + Math.floor(Math.random() * 9000000000 + 1000000000),
          audioUrl:
            user.audioUrl ||
            "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav",
          audioProgress: 0,
          audioDuration: 0,
        }));

        this.users = processedUsers;
        this.applyFilters();
      } catch (error) {
        console.error("Error fetching users:", error);
        this.users = [];
      } finally {
        this.loading = false;
      }
    },

    togglePlay(event) {
      const audioContainer = event.target.closest(".relative");
      const audio = audioContainer.nextElementSibling;
  
      if (this.activeAudio && this.activeAudio !== audio) {
          this.stopAudio(this.activeAudio);
      }
  
      if (audio.paused) {
          audio.play().then(() => {
              this.activeAudio = audio; // Set the currently active audio
              audio.onended = () => {
                  this.activeAudio = null; // Reset active audio when finished
              };
          }).catch((error) => {
              console.error("Playback failed:", error);
          });
      } else {
          this.stopAudio(audio);
      }
  },

    stopAudio(audio) {
      audio.pause();
      audio.currentTime = 0;
      this.activeAudio = null; // Reset active audio
    },

    updateProgress(event, user) {
      const audio = event.target;
      if (audio.duration) {
        user.audioProgress = (audio.currentTime / audio.duration) * 100;
      }
    },

    handleAudioEnd(event, user) {
      const audio = event.target;
      audio.currentTime = 0;
      user.audioProgress = 0;
    },

    setDuration(event, user) {
      user.audioDuration = event.target.duration;
    },

    setupInfiniteScroll() {
      window.addEventListener("scroll", () => {
        if (
          window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 500 &&
          !this.loading &&
          this.hasMore
        ) {
          this.loadMoreUsers();
        }
      });
    },

    loadMoreUsers() {
      this.page++;
      this.applyFilters();
    },

    resetPagination() {
      this.page = 1;
      this.hasMore = true;
      this.applyFilters();
    },

    setGenderFilter(gender) {
      this.genderFilter = gender;
      this.resetPagination();
    },

    setEducationFilter(education) {
      this.educationFilter = education;
      this.resetPagination();
    },

    applyFilters() {
      this.loading = true;
      let filteredUsers = [...this.users];

      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.body?.toLowerCase().includes(searchLower)
        );
      }

      if (this.idFilter) {
        filteredUsers = filteredUsers.filter(
          (user) => user.id?.toString() === this.idFilter
        );
      }

      if (this.genderFilter !== "all") {
        filteredUsers = filteredUsers.filter(
          (user) => user.gender === this.genderFilter
        );
      }

      if (this.educationFilter !== "all") {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.education?.toLowerCase() === this.educationFilter.toLowerCase()
        );
      }

      filteredUsers.sort((a, b) => {
        switch (this.sortOrder) {
          case "dateDesc":
            return new Date(b.date) - new Date(a.date);
          case "dateAsc":
            return new Date(a.date) - new Date(b.date);
          case "userUrgent":
            if (!a.urgent && !b.urgent) return 0;
            if (a.urgent && !b.urgent) return -1;
            if (!a.urgent && b.urgent) return 1;
            return new Date(b.date) - new Date(a.date);
          default:
            return this.calculateRelevance(b) - this.calculateRelevance(a);
        }
      });

      if (this.sortOrder === "userUrgent") {
        filteredUsers = filteredUsers.filter((user) => user.urgent);
      }

      const start = 0;
      const end = this.page * this.itemsPerPage;
      this.displayedUsers = filteredUsers.slice(start, end);
      this.hasMore = end < filteredUsers.length;
      this.loading = false;
    },

    calculateRelevance(user) {
      if (!this.searchTerm) return 0;
      const searchLower = this.searchTerm.toLowerCase();
      let relevance = 0;
      if (user.name?.toLowerCase().includes(searchLower)) relevance += 3;
      if (user.email?.toLowerCase().includes(searchLower)) relevance += 2;
      if (user.body?.toLowerCase().includes(searchLower)) relevance += 1;
      return relevance;
    },

    toggleDrawer() {
      this.drawerOpen = !this.drawerOpen;
    },
  };
}
