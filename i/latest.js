function userDirectory() {
  return {
    users: [],
    displayedUsers: [],
    searchTerm: "",
    idFilter: "",
    sortOrder: "dateDesc",
    genderFilter: "all",
    educationFilter: "all",
    ageFilter: "all",
    loading: false,
    drawerOpen: false,
    page: 1,
    perPage: 500,
    totalRecords: 0,
    appliedFilters: [],

    init: function () {
      this.fetchUsers();
      this.setupInfiniteScroll();
    },

    fetchUsers: async function () {
      if (this.loading) return; // Prevent concurrent fetches
      this.loading = true;
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/majidomri/liverishtey/main/profiles.json`
        );
        const allUsers = await response.json();

        // Use the data directly without generating random fields
        this.users = allUsers.slice(0, 1000).map((user) => ({
          ...user,
          date: user.date || new Date().toISOString(), // Use provided date or fallback to current date
          urgent: user.priority?.toLowerCase() === "urgent", // Map priority to urgent status
        }));

        // Update totalRecords
        this.totalRecords = this.users.length;

        this.applyFilters(); // Update displayed users
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users. Please try again later.");
      } finally {
        this.loading = false;
      }
    },

    // setupInfiniteScroll: function () {
    //   let scrollTimeout;
    //   window.addEventListener("scroll", () => {
    //     if (scrollTimeout) clearTimeout(scrollTimeout);
    //     scrollTimeout = setTimeout(() => {
    //       if (
    //         window.innerHeight + window.scrollY >=
    //           document.body.offsetHeight - 500 &&
    //         !this.loading &&
    //         this.page * this.perPage < this.totalRecords
    //       ) {
    //         this.loadMore();
    //       }
    //     }, 50); // Add a delay to avoid frequent executions
    //   });
    // },
    setupInfiniteScroll() {
      const observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            !this.loading &&
            this.page * this.perPage < this.totalRecords
          ) {
            this.loadMore();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(this.$refs.sentinel);
    },
    loadMore: function () {
      if (this.users.length >= this.totalRecords) return; // Stop fetching if all records are loaded
      this.page++;
      this.applyFilters(); // Load next set of users
    },

    resetPagination: function () {
      this.users = [];
      this.fetchUsers();
    },

    addFilterBadge: function (name, value) {
      const existingBadge = this.appliedFilters.find(
        (badge) => badge.name === name
      );
      if (!existingBadge) {
        this.appliedFilters.push({ name, value });
      } else {
        existingBadge.value = value;
      }
    },

    removeFilterBadge: function (name) {
      this.appliedFilters = this.appliedFilters.filter(
        (badge) => badge.name !== name
      );
      // Reset the corresponding filter and reapply
      if (name === "Search") this.searchTerm = "";
      if (name === "ID") this.idFilter = "";
      if (name === "Gender") this.genderFilter = "all";
      if (name === "Education") this.educationFilter = "all";
      if (name === "Age") this.ageFilter = "all";
      if (name === "Sort") this.sortOrder = "dateDesc";
      this.applyFilters();
    },

    applyFilters: function () {
      if (!this.users.length) return; // Do not filter if no users exist
      this.loading = true; // Show loading while filtering
      let filteredUsers = this.users;

      // Update filter badges
      this.appliedFilters = [];
      if (this.searchTerm) this.addFilterBadge("Search", this.searchTerm);
      if (this.idFilter) this.addFilterBadge("ID", this.idFilter);
      if (this.genderFilter !== "all")
        this.addFilterBadge("Gender", this.genderFilter);
      if (this.educationFilter !== "all")
        this.addFilterBadge("Education", this.educationFilter);
      if (this.ageFilter !== "all") this.addFilterBadge("Age", this.ageFilter);
      if (this.sortOrder !== "dateDesc")
        this.addFilterBadge("Sort", this.sortOrder);

      // Apply search filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (user) =>
            (user.title || "").toLowerCase().includes(searchLower) ||
            (user.body || "").toLowerCase().includes(searchLower)
        );
      }

      // Apply ID filter
      if (this.idFilter) {
        filteredUsers = filteredUsers.filter(
          (user) => user.id.toString() === this.idFilter
        );
      }

      // Apply gender filter
      if (this.genderFilter !== "all") {
        filteredUsers = filteredUsers.filter(
          (user) => user.gender === this.genderFilter
        );
      }

      // Apply education filter
      if (this.educationFilter !== "all") {
        filteredUsers = filteredUsers.filter(
          (user) => user.education === this.educationFilter
        );
      }

      // Apply age filter
      if (this.ageFilter !== "all") {
        filteredUsers = filteredUsers.filter(
          (user) => user.age === parseInt(this.ageFilter, 10)
        );
      }

      // Apply sorting
      filteredUsers.sort((a, b) => {
        const safeDate = (date) =>
          isNaN(new Date(date)) ? new Date() : new Date(date);
        switch (this.sortOrder) {
          case "dateDesc":
            return safeDate(b.date) - safeDate(a.date);
          case "dateAsc":
            return safeDate(a.date) - safeDate(b.date);
          case "userUrgent":
            if (!a.urgent && !b.urgent) return 0;
            if (a.urgent && !b.urgent) return -1;
            if (!a.urgent && b.urgent) return 1;
            return safeDate(b.date) - safeDate(a.date);
          default:
            const aRelevance = this.calculateRelevance(a);
            const bRelevance = this.calculateRelevance(b);
            return bRelevance - aRelevance;
        }
      });

      // When sorting by urgent, filter out non-urgent listings
      if (this.sortOrder === "userUrgent") {
        filteredUsers = filteredUsers.filter((user) => user.urgent);
      }

      // Paginate results
      const startIndex = (this.page - 1) * this.perPage;
      this.displayedUsers = filteredUsers.slice(
        startIndex,
        startIndex + this.perPage
      );

      this.loading = false; // Hide loading when filtering done
    },

    calculateRelevance: function (user) {
      if (!this.searchTerm) return 0;
      const searchLower = this.searchTerm.toLowerCase();
      let relevance = 0;
      if ((user.title || "").toLowerCase().includes(searchLower))
        relevance += 3;
      if ((user.body || "").toLowerCase().includes(searchLower)) relevance += 2;
      return relevance;
    },

    setGenderFilter: function (gender) {
      this.genderFilter = gender;
      this.resetPagination();
    },

    setEducationFilter: function (education) {
      this.educationFilter = education;
      this.resetPagination();
    },

    setAgeFilter: function (age) {
      this.ageFilter = age;
      this.resetPagination();
    },

    toggleDrawer: function () {
      this.drawerOpen = !this.drawerOpen;
    },

    isUrdu: function (text) {
      // Checks if the input text contains Urdu characters
      const urduRegex = /[\u0600-\u06FF]/;
      return urduRegex.test(text);
    },
  };
}
