$("#searchInp").on("keyup", function () {
  var searchQuery = $(this).val();
  var activeTab;

  if ($("#personnelBtn").hasClass("active")) {
    activeTab = "personnel";
  } else if ($("#departmentsBtn").hasClass("active")) {
    activeTab = "departments";
  } else if ($("#locationsBtn").hasClass("active")) {
    activeTab = "locations";
  }

  $.ajax({
    url: 'libs/php/SearchAll.php',
    type: 'POST',
    data: { 
      query: searchQuery,
      tab: activeTab 
    },
    success: function(response) {
      if (response.status.code === "200") {
        if (activeTab === "personnel") {
          let personnelRows = "";
          response.data.found.forEach(function(person) {
            personnelRows += `
              <tr>
                <td class="align-middle text-nowrap">${person.lastName}, ${person.firstName}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${person.departmentName}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${person.locationName}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
                <td class="text-end text-nowrap">
                  <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
                    <i class="fa-solid fa-pencil fa-fw"></i>
                  </button>
                  <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id="${person.id}">
                    <i class="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr>
            `;
          });
          $("#personnelTableBody").html(personnelRows);
        } else if (activeTab === "departments") {
          let departmentRows = "";
          response.data.found.forEach(function(department) {
            departmentRows += `
              <tr>
                <td class="align-middle text-nowrap">${department.departmentName}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${department.locationName}</td>
                <td class="text-end text-nowrap">
                  <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
                    <i class="fa-solid fa-pencil fa-fw"></i>
                  </button>
                  <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteDepartmentModal" data-id="${department.id}">
                    <i class="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr>
            `;
          });
          $("#departmentTableBody").html(departmentRows);
        } else if (activeTab === "locations") {
          let locationRows = "";
          response.data.found.forEach(function(location) {
            locationRows += `
              <tr>
                <td class="align-middle text-nowrap">${location.name}</td>
                <td class="text-end text-nowrap">
                  <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${location.id}">
                    <i class="fa-solid fa-pencil fa-fw"></i>
                  </button>
                  <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteLocationModal" data-id="${location.id}">
                    <i class="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr>
            `;
          });
          $("#locationTableBody").html(locationRows);
        }
      } else {
        console.error("Error: Failed to fetch search results.");
      }
    },
    error: function(e) {
      console.error(e, "Error fetching search results.");
    }
  });
});


$("#refreshBtn").click(function () {
  if ($("#personnelBtn").hasClass("active")) {  
    refreshPersonnelTable(); 
  } else if ($("#departmentsBtn").hasClass("active")) { 
    refreshDepartmentTable(); 
  } else {  
    refreshLocationTable();
  }
});

$("#filterBtn").click(function () {
  
  // Open a modal of your own design that allows the user to apply a filter to the personnel table on either department or location
  
});

$("#addBtn").click(function () {
  setupAddModal();
  $("#addModal").modal("show");
});

// Dynamically setup add modal based on active tab
function setupAddModal() {
  let dynamicFields = $("#dynamicFields");
  dynamicFields.empty();

  // Check which tab is active
  if ($("#personnelBtn").hasClass("active")) {  
    // Setup form for personnel
    $("#addModalLabel").text("Add Personnel");

    dynamicFields.append(`
      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="addFirstName" placeholder="First Name" required>
        <label for="addFirstName">First Name</label>
      </div>
      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="addLastName" placeholder="Last Name" required>
        <label for="addLastName">Last Name</label>
      </div>
      <div class="form-floating mb-3">
        <input type="email" class="form-control" id="addEmail" placeholder="Email" required>
        <label for="addEmail">Email</label>
      </div>
      <div class="form-floating mb-3">
        <select class="form-select" id="addDepartment" required></select>
        <label for="addDepartment">Department</label>
      </div>
    `);
    populateDropdown('department');

  } else if ($("#departmentsBtn").hasClass("active")) { 
    // Setup form for department
    $("#addModalLabel").text("Add Department");
    dynamicFields.append(`
      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="addDepartmentName" placeholder="Department Name" required>
        <label for="addDepartmentName">Department Name</label>
      </div>
      <div class="form-floating mb-3">
        <select class="form-select" id="addLocation" required></select>
        <label for="addLocation">Location</label>
      </div>
    `);
    populateDropdown('location');

  } else if ($("#locationsBtn").hasClass("active")) { 
    // Setup form for location
    $("#addModalLabel").text("Add Location");
    dynamicFields.append(`
      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="addLocationName" placeholder="Location Name" required>
        <label for="addLocationName">Location Name</label>
      </div>
    `);
  }
}

// Populate dropdowns dynamically based on type
function populateDropdown(type) {
  let url = (type === 'department') ? 'libs/php/getAllDepartments.php' : 'libs/php/getAllLocations.php';
  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: function(response) {
      if (response.status.code === "200") {
        let dropdown = (type === 'department') ? $("#addDepartment") : $("#addLocation");
        dropdown.empty();
        if (type === 'department') {
          response.data.forEach(function(item) {
            dropdown.append(`<option value="${item.id}">${item.departmentName}</option>`);
          });
        } else {
          response.data.forEach(function(item) {
            dropdown.append(`<option value="${item.id}">${item.name}</option>`);
          });
        }
      }
    },
    error: function() {
      console.error(`Error fetching ${type} data.`);
    }
  });
}

// Handle form submission for adding records dynamically
$("#addForm").on("submit", function (e) {
  e.preventDefault(); // Prevent default form submission
  let table, data = {};

  if ($("#personnelBtn").hasClass("active")) {
    table = "personnel"; 
    data = {
      table: table,
      firstName: $("#addFirstName").val(),
      lastName: $("#addLastName").val(),
      email: $("#addEmail").val(),
      departmentID: $("#addDepartment").val()
    };
  } else if ($("#departmentsBtn").hasClass("active")) {
    table = "departments";  
    data = {
      table: table,
      name: $("#addDepartmentName").val(),
      locationID: $("#addLocation").val()
    };
  } else if ($("#locationsBtn").hasClass("active")) {
    table = "locations";  
    data = {
      table: table,
      name: $("#addLocationName").val()
    };
  }

  $.ajax({
    url: 'libs/php/insertRecord.php',
    type: 'POST',
    data: data,
    success: function (response) {
      if (response.status.code === "200") {
        if (table === "personnel") refreshPersonnelTable();
        else if (table === "departments") refreshDepartmentTable();
        else refreshLocationTable();
      } else {
        console.error("Error: Failed to add record.");
      }
    },
    error: function (e) {
      console.error("Error adding record:", e);
    }
  });

  $("#addModal").modal("hide");
});

$("#personnelBtn").click(function () {
  refreshPersonnelTable();
});

$("#departmentsBtn").click(function () {
  refreshDepartmentTable();
});

$("#locationsBtn").click(function () {
  refreshLocationTable();
});

$("#editPersonnelModal").on("show.bs.modal", function (e) {
  
  $.ajax({
    url:
      "https://coding.itcareerswitch.co.uk/companydirectory/libs/php/getPersonnelByID.php",
    type: "POST",
    dataType: "json",
    data: {
      // Retrieve the data-id attribute from the calling button
      // see https://getbootstrap.com/docs/5.0/components/modal/#varying-modal-content
      // for the non-jQuery JavaScript alternative
      id: $(e.relatedTarget).attr("data-id") 
    },
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        
        // Update the hidden input with the employee id so that
        // it can be referenced when the form is submitted

        $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);

        $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
        $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
        $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
        $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);

        $("#editPersonnelDepartment").html("");

        $.each(result.data.department, function () {
          $("#editPersonnelDepartment").append(
            $("<option>", {
              value: this.id,
              text: this.name
            })
          );
        });

        $("#editPersonnelDepartment").val(result.data.personnel[0].departmentID);
        
      } else {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editPersonnelModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    }
  });
});

// Executes when the form button with type="submit" is clicked

$("#editPersonnelForm").on("submit", function (e) {
  
  // Executes when the form button with type="submit" is clicked
  // stop the default browser behviour

  e.preventDefault();

  // AJAX call to save form data
  
});

function refreshPersonnelTable() {
  $.ajax({
    url: 'libs/php/getAll.php',  // Ensure this URL is correct
    type: 'GET',
    dataType: 'json',  // Expecting a JSON response
    success: function(response) {
      if (response.status.code === "200") {
        let personnelRows = "";
        response.data.forEach(function(person) {
          personnelRows += `
            <tr>
              <td class="align-middle text-nowrap">${person.lastName}, ${person.firstName}</td>
              <td class="align-middle text-nowrap d-none d-md-table-cell">${person.department}</td>
              <td class="align-middle text-nowrap d-none d-md-table-cell">${person.location}</td>
              <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
                  <i class="fa-solid fa-pencil fa-fw"></i>
                </button>
                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id="${person.id}">
                  <i class="fa-solid fa-trash fa-fw"></i>
                </button>
              </td>
            </tr>
          `;
        });
        // Insert the generated rows into the table body
        $("#personnelTableBody").html(personnelRows);
      } else {
        console.error("Error: Failed to fetch personnel data.");
      }
    },
    error: function() {
      console.error("Error fetching personnel data.");
    }
  });
}

// Refresh Department Table
function refreshDepartmentTable() {
  $.ajax({
    url: 'libs/php/getAllDepartments.php',  
    type: 'GET',
    dataType: 'json',
    success: function(response) {
      if (response.status.code === "200") {
        let departmentRows = "";
        response.data.forEach(function(department) {
          departmentRows += `
            <tr>
              <td class="align-middle text-nowrap">${department.departmentName}</td>
              <td class="align-middle text-nowrap d-none d-md-table-cell">${department.locationName}</td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
                  <i class="fa-solid fa-pencil fa-fw"></i>
                </button>
                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteDepartmentModal" data-id="${department.id}">
                  <i class="fa-solid fa-trash fa-fw"></i>
                </button>
              </td>
            </tr>
          `;
        });
        $("#departmentTableBody").html(departmentRows);
      } else {
        console.error("Error: Failed to fetch department data.");
      }
    },
    error: function() {
      console.error("Error fetching department data.");
    }
  });
}

function refreshLocationTable() {
  $.ajax({
    url: 'libs/php/getAllLocations.php',  
    type: 'GET',
    dataType: 'json',
    success: function(response) {
      if (response.status.code === "200") {
        let locationRows = "";
        response.data.forEach(function(location) {
          locationRows += `
            <tr>
              <td class="align-middle text-nowrap">${location.name}</td>
              <td class="text-end text-nowrap">
                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${location.id}">
                  <i class="fa-solid fa-pencil fa-fw"></i>
                </button>
                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteLocationModal" data-id="${location.id}">
                  <i class="fa-solid fa-trash fa-fw"></i>
                </button>
              </td>
            </tr>
          `;
        });
        $("#locationTableBody").html(locationRows);
      } else {
        console.error("Error: Failed to fetch location data.");
      }
    },
    error: function() {
      console.error("Error fetching location data.");
    }
  });
}

$(document).ready(function() {
  refreshPersonnelTable();
});
