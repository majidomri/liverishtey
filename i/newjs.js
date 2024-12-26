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
          this.applyFilters(); // Apply filters immediately after fetching
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
          }, 200); // Debounce scroll events
        });
      },
  
      loadMore() {
        if (this.page * this.perPage >= this.totalRecords) return; // Stop if all records are loaded
        this.page++;
        this.applyFilters(); // Load next set of users
      },
  
      resetPagination() {
        this.page = 1;
        this.displayedUsers = [];
        this.applyFilters(); // Reset filters and pagination
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
  
        if (name === "Search") this.searchTerm = "";
        if (name === "ID") this.idFilter = "";
        if (name === "Gender") this.genderFilter = "all";
        if (name === "Education") this.educationFilter = "all";
        if (name === "Age") this.ageFilter = "all";
        if (name === "Sort") this.sortOrder = "dateDesc";
  
        this.resetPagination(); // Reapply filters
      },
  
      applyFilters() {
        if (!this.users.length) return;
  
        this.loading = true;
  
        let filteredUsers = [...this.users];
  
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
  
        if (this.searchTerm) {
          const searchLower = this.searchTerm.toLowerCase();
          filteredUsers = filteredUsers.filter(
            (user) =>
              (user.title || "").toLowerCase().includes(searchLower) ||
              (user.body || "").toLowerCase().includes(searchLower)
          );
        }
  
        if (this.idFilter) {
          filteredUsers = filteredUsers.filter(
            (user) => user.id.toString() === this.idFilter
          );
        }
  
        if (this.genderFilter !== "all") {
          filteredUsers = filteredUsers.filter(
            (user) => user.gender === this.genderFilter
          );
        }
  
        if (this.educationFilter !== "all") {
          filteredUsers = filteredUsers.filter(
            (user) => user.education === this.educationFilter
          );
        }
  
        if (this.ageFilter !== "all") {
          filteredUsers = filteredUsers.filter(
            (user) => user.age === parseInt(this.ageFilter, 10)
          );
        }
  
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
  
        if (this.sortOrder === "userUrgent") {
          filteredUsers = filteredUsers.filter((user) => user.urgent);
        }
  
        const startIndex = (this.page - 1) * this.perPage;
        this.displayedUsers = filteredUsers.slice(
          startIndex,
          startIndex + this.perPage
        );
  
        this.loading = false;
      },
  
      calculateRelevance(user) {
        if (!this.searchTerm) return 0;
        const searchLower = this.searchTerm.toLowerCase();
        let relevance = 0;
        if ((user.title || "").toLowerCase().includes(searchLower))
          relevance += 3;
        if ((user.body || "").toLowerCase().includes(searchLower)) relevance += 2;
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
  
      setAgeFilter(age) {
        this.ageFilter = age;
        this.resetPagination();
      },
  
      toggleDrawer() {
        this.drawerOpen = !this.drawerOpen;
      },
  
      isUrdu(text) {
        const urduRegex = /[\u0600-\u06FF]/;
        return urduRegex.test(text);
      },
    };
  }
  