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

    init() {
      this.fetchUsers();
      this.setupInfiniteScroll();
    },

    async fetchUsers() {
      if (this.loading) return; // Prevent concurrent fetches
      this.loading = true;

      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/majidomri/liverishtey/main/jsdata.json`
        );
        const newUsers = await response.json();

        this.users = newUsers.map((user) => ({
          ...user,
          date: user.date || new Date().toISOString(),
          urgent: user.priority?.toLowerCase() === "urgent",
        }));

        this.totalRecords = this.users.length;

        // Initialize displayedUsers on fetch
        this.page = 1;
        this.applyFilters();
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users. Please try again.");
      } finally {
        this.loading = false;
      }
    },

    setupInfiniteScroll() {
      let scrollTimeout;
      window.addEventListener("scroll", () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (
            window.innerHeight + window.scrollY >=
              document.body.offsetHeight - 500 &&
            !this.loading &&
            this.page * this.perPage < this.totalRecords
          ) {
            this.loadMore();
          }
        }, 200);
      });
    },

    loadMore() {
      if (this.page * this.perPage >= this.totalRecords) return; // Prevent loading beyond available records
      this.page++;
      this.applyFilters();
    },

    applyFilters() {
      if (!this.users.length) return;

      let filteredUsers = [...this.users];

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
            return 0; // Default to no sorting if the sortOrder is unknown
        }
      });

      if (this.sortOrder === "userUrgent") {
        filteredUsers = filteredUsers.filter((user) => user.urgent);
      }

      // Paginate results
      const startIndex = (this.page - 1) * this.perPage;
      const paginatedUsers = filteredUsers.slice(
        startIndex,
        startIndex + this.perPage
      );

      if (paginatedUsers.length) {
        this.displayedUsers = this.displayedUsers.concat(paginatedUsers);
      }

      this.loading = false; // Ensure loading is reset
    },

    resetPagination() {
      this.page = 1;
      this.displayedUsers = [];
      this.applyFilters();
    },
  };
}
