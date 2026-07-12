// 1. Data Model: Array of 6+ student objects
const students = [
    { name: "Aarav Sharma", email: "aarav@college.edu", branch: "CSE", cgpa: 9.1, roll: "CS001", image: "https://i.pravatar.cc/300?img=11" },
    { name: "Priya Patel", email: "priya@college.edu", branch: "ECE", cgpa: 8.8, roll: "EC014", image: "https://i.pravatar.cc/300?img=5" },
    { name: "Rohan Gupta", email: "rohan@college.edu", branch: "IT", cgpa: 7.9, roll: "IT022", image: "https://i.pravatar.cc/300?img=13" },
    { name: "Neha Singh", email: "neha@college.edu", branch: "CSE", cgpa: 9.5, roll: "CS034", image: "https://i.pravatar.cc/300?img=9" },
    { name: "Vikram Verma", email: "vikram@college.edu", branch: "ECE", cgpa: 8.2, roll: "EC045", image: "https://i.pravatar.cc/300?img=15" },
    { name: "Ananya Desai", email: "ananya@college.edu", branch: "IT", cgpa: 8.6, roll: "IT056", image: "https://i.pravatar.cc/300?img=20" },
    { name: "Marcus Johnson", email: "marcus@college.edu", branch: "CSE", cgpa: 7.4, roll: "CS089", image: "https://i.pravatar.cc/300?img=33" }
];

// 2. DOM Manipulation: Render students to the grid
function renderStudents(data) {
    const $grid = $('#studentGrid');
    $grid.empty(); // Clear grid before appending

    if (data.length === 0) {
        $grid.append('<div class="col-12 text-center mt-5"><h4 class="text-muted">No students match your search criteria.</h4></div>');
        return;
    }

    // Loop through data and create cards
    data.forEach(student => {
        const cardHTML = `
            <div class="col-12 col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm student-card">
                    <img src="${student.image}" class="card-img-top" alt="${student.name} profile picture">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-primary fw-bold">${student.name}</h5>
                        <h6 class="card-subtitle mb-2 text-muted fw-semibold">${student.branch}</h6>
                        <p class="card-text text-secondary email-text mb-3">${student.email}</p>
                        
                        <div class="mt-auto">
                            <button class="btn btn-outline-primary w-100 fw-bold view-profile-btn">View Profile</button>
                        </div>

                        <div class="student-details">
                            <p class="mb-1"><strong>Roll Number:</strong> ${student.roll}</p>
                            <p class="mb-0"><strong>CGPA:</strong> ${student.cgpa}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $grid.append(cardHTML);
    });
}

// 3. Document Ready Initialization
$(document).ready(function() {
    
    // Initial Render of all students
    renderStudents(students);

    // Filter Logic
    function filterDirectory() {
        const searchTerm = $('#searchInput').val().toLowerCase();
        const branchFilter = $('#branchFilter').val();

        const filteredStudents = students.filter(student => {
            // Check if search matches name OR email
            const matchesSearch = student.name.toLowerCase().includes(searchTerm) || 
                                  student.email.toLowerCase().includes(searchTerm);
            
            // Check if dropdown matches branch
            const matchesBranch = branchFilter === "All" || student.branch === branchFilter;

            return matchesSearch && matchesBranch;
        });

        renderStudents(filteredStudents);
    }

    // Event Listeners for real-time filtering
    $('#searchInput').on('keyup', filterDirectory);
    $('#branchFilter').on('change', filterDirectory);

    // Event Delegation for dynamically created "View Profile" buttons
    $('#studentGrid').on('click', '.view-profile-btn', function() {
        // Toggle the sub-section containing CGPA and Roll Number
        $(this).closest('.card-body').find('.student-details').slideToggle(300);
        
        // Dynamically update button text
        const $btn = $(this);
        if ($btn.text() === "View Profile") {
            $btn.text("Hide Profile");
            $btn.removeClass("btn-outline-primary").addClass("btn-primary");
        } else {
            $btn.text("View Profile");
            $btn.removeClass("btn-primary").addClass("btn-outline-primary");
        }
    });
});