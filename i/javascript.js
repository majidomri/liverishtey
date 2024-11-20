function userDirectory() {
    return {
      users: [],
      displayedUsers: [],
      searchTerm: "",
      idFilter: "",
      sortOrder: "dateDesc",
      genderFilter: "all",
      educationFilter: "all", // New filter
      loading: false,
      drawerOpen: false,
      page: 1,
      perPage: 500,
      appliedFilters: [],
  
      init() {
        this.fetchUsers();
        this.setupInfiniteScroll();
      },
  
      async fetchUsers() {
        this.loading = true; // Show loading while fetching
        try {
          const response = await fetch(
            `https://raw.githubusercontent.com/majidomri/liverishtey/main/jsdata.json`
          );
          const newUsers = await response.json();
  
          // Use the data directly without generating random fields
          this.users = newUsers.map((user) => ({
            ...user,
            date: user.date || new Date().toISOString(), // Use provided date or fallback to current date
            urgent: user.priority === "Urgent", // Map priority to urgent status
          }));
  
          this.applyFilters(); // Update displayed users
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          this.loading = false;
        }
      },
  
      setupInfiniteScroll() {
        window.addEventListener("scroll", () => {
          if (
            window.innerHeight + window.scrollY >=
              document.body.offsetHeight - 500 &&
            !this.loading &&
            this.page * this.perPage < this.totalRecords
          ) {
            this.page++;
            this.fetchUsers();
          }
        });
      },
  
      loadMore() {
        if (this.users.length >= this.totalRecords) return; // Stop fetching if all records are loaded
        this.page++;
        this.fetchUsers();
      },
  
      resetPagination() {
        this.page = 1;
        this.users = [];
        this.fetchUsers();
      },
  
      addFilterBadge(name, value) {
        const existingBadge = this.appliedFilters.find(
          (badge) => badge.name === name
        );
        if (!existingBadge) {
          this.appliedFilters.push({ name, value });
        } else {
          existingBadge.value = value;
        }
      },
  
      removeFilterBadge(name) {
        this.appliedFilters = this.appliedFilters.filter(
          (badge) => badge.name !== name
        );
        // Reset the corresponding filter and reapply
        if (name === "Search") this.searchTerm = "";
        if (name === "ID") this.idFilter = "";
        if (name === "Gender") this.genderFilter = "all";
        if (name === "Education") this.educationFilter = "all";
        if (name === "Sort") this.sortOrder = "dateDesc";
        this.applyFilters();
      },
  
      applyFilters() {
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
        if (this.sortOrder !== "dateDesc")
          this.addFilterBadge("Sort", this.sortOrder);
  
        // Apply search filter
        if (this.searchTerm) {
          const searchLower = this.searchTerm.toLowerCase();
          filteredUsers = filteredUsers.filter(
            (user) =>
              user.title.toLowerCase().includes(searchLower) ||
              user.body.toLowerCase().includes(searchLower)
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
  
        // Apply sorting
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
              const aRelevance = this.calculateRelevance(a);
              const bRelevance = this.calculateRelevance(b);
              return bRelevance - aRelevance;
          }
        });
  
        // When sorting by urgent, filter out non-urgent listings
        if (this.sortOrder === "userUrgent") {
          filteredUsers = filteredUsers.filter((user) => user.urgent);
        }
  
        this.displayedUsers = filteredUsers;
        this.loading = false; // Hide loading when filtering done
      },
  
      calculateRelevance(user) {
        if (!this.searchTerm) return 0;
        const searchLower = this.searchTerm.toLowerCase();
        let relevance = 0;
        if (user.title.toLowerCase().includes(searchLower)) relevance += 3;
        if (user.body.toLowerCase().includes(searchLower)) relevance += 2;
        return relevance;
      },
  
      setGenderFilter(gender) {
        this.genderFilter = gender;
        this.resetPagination();
      },
  
      setEducationFilter(education) {
        this.educationFilter = education;
        this.resetPagination();
      },
  
      toggleDrawer() {
        this.drawerOpen = !this.drawerOpen;
      },
    };
  }
  