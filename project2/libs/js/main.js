$("#searchInp").on("keyup", function () {
  var searchQuery = $(this).val();
  var activeTab;

  if ($("#personnelBtn").hasClass("active")) {
    activeTab = "personnel";
  } else if ($("#departmentsBtn").hasClass("active")) {
    activeTab = "department";
  } else if ($("#locationsBtn").hasClass("active")) {
    activeTab = "location";
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
        } else if (activeTab === "department") {
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
        } else if (activeTab === "location") {
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
    refreshTable('personnel'); 
  } else if ($("#departmentsBtn").hasClass("active")) { 
    refreshTable('department');
  } else {  
    refreshTable('location');
  }
});

$("#filterBtn").click(function () {
  
  // Open a modal of your own design that allows the user to apply a filter to the personnel table on either department or location
  
});


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
        <div class="invalid-feedback"></div>
      </div>
      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="addLastName" placeholder="Last Name" required>
        <label for="addLastName">Last Name</label>
        <div class="invalid-feedback"></div>
      </div>
      <div class="form-floating mb-3">
        <input type="email" class="form-control" id="addEmail" placeholder="Email" required>
        <label for="addEmail">Email</label>
        <div class="invalid-feedback"></div>
      </div>
      <div class="form-floating mb-3">
        <select class="form-select" id="addDepartment" required></select>
        <label for="addDepartment">Department</label>
        <div class="invalid-feedback"></div>
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
        <div class="invalid-feedback"></div>
      </div>
      <div class="form-floating mb-3">
        <select class="form-select" id="addLocation" required></select>
        <label for="addLocation">Location</label>]
        <div class="invalid-feedback"></div>
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
        <div class="invalid-feedback"></div>
      </div>
    `);
  }
}

class Validate{
  validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  validateName = (name) => {
    const namePattern = /^[A-Za-z]+$/;
    return namePattern.test(name);
  };

  validateID = (id) => {
    return !isNaN(id) && Number.isInteger(parseFloat(id));
  };

  validateJobTitle = (jobTitle) => {
    const jobTitlePattern = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
    return jobTitlePattern.test(jobTitle);
  };

  validateNameMultiple = (jobTitle) => {
    const jobTitlePattern = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
    return jobTitlePattern.test(jobTitle);
  };
}

const V = new Validate();

const validateAddFormData = (table, data) => {
  let isFormValid = true;

  const setValidity = (selector, isValid, message) => {
    if (!isValid) { isFormValid = false;}
    $(selector)[0].setCustomValidity(isValid ? "" : message);
  };

  if (table === "personnel") {
    setValidity("#addFirstName", V.validateName(data.firstName), "Please enter a valid name.");
    setValidity("#addLastName", V.validateName(data.lastName), "Please enter a valid name.");
    setValidity("#addEmail", V.validateEmail(data.email), "Please enter a valid email.");
    setValidity("#addDepartment", V.validateID(data.departmentID), "Please enter a valid ID.");
  } else if (table === "departments") {
    setValidity("#addDepartmentName", V.validateName(data.name), "Please enter a valid name.");
    setValidity("#addLocation", V.validateID(data.locationID), "Please enter a valid ID.");
  } else if (table === "locations") {
    setValidity("#addLocationName", V.validateName(data.name), "Please enter a valid name.");
  }

  return isFormValid;
};

const capitalizeFirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
const sanitizeInput = (input) => DOMPurify.sanitize(input.trim());
const sanitizeName = (name) => DOMPurify.sanitize(capitalizeFirst(name.trim()));

// Handle form submission for adding records dynamically
$("#addForm").on("submit", function (e) {
  e.preventDefault(); // Prevent default form submission
  
  let table, data = {};  

  // Collect data based on the active tab
  if ($("#personnelBtn").hasClass("active")) {
    table = "personnel"; 
    data = {
      table: table,
      firstName: sanitizeName($("#addFirstName").val()),
      lastName: sanitizeName($("#addLastName").val()),
      email: sanitizeInput($("#addEmail").val()),
      departmentID: sanitizeInput($("#addDepartment").val())
    };
  } else if ($("#departmentsBtn").hasClass("active")) {
    table = "department";  
    data = {
      table: table,
      name: sanitizeName($("#addDepartmentName").val()),
      locationID: sanitizeInput($("#addLocation").val())
    };
  } else if ($("#locationsBtn").hasClass("active")) {
    table = "location";  
    data = {
      table: table,
      name: sanitizeNames($("#addLocationName").val())
    };
  }

  const form = this;
  const isValid = validateAddFormData(table, data);

  if (!isValid || !form.checkValidity()) {
    e.preventDefault();
    e.stopPropagation();
    form.reportValidity();
    form.classList.add("was-validated");
  } else {
    $.ajax({
      url: 'libs/php/insertRecord.php',
      type: 'POST',
      data,
      success: function (response) {
        if (response.status.code === "200") {
          refreshTable(table);
          $("#addModal").modal("hide");
        } else {
          console.error("Error: Failed to add record.");
        }
      },
      error: function (e) {
        console.error("Error adding record:", e);
      }
    });
  }
});

$("#personnelBtn").click(function () {
  refreshTable('personnel');
});

$("#departmentsBtn").click(function () {
  refreshTable('department');
});

$("#locationsBtn").click(function () {
  refreshTable('location');
});

$("#editPersonnelModal").on("show.bs.modal", function (e) {
  let id = $(e.relatedTarget).attr("data-id");
  $.ajax({
    url: "libs/php/getPersonnelByID.php",
    type: "POST",
    dataType: "json",
    data: {
      id: id
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
      console.log(errorThrown);
    }
  });
});

const validateEditFormData = (data) => {
  let isFormValid = true;

  const setValidity = (selector, isValid, message) => {
    if (!isValid) { isFormValid = false; }
    $(selector)[0].setCustomValidity(isValid ? "" : message);
  };

  setValidity("#editPersonnelFirstName", V.validateNameMultiple(data.firstName), "Please enter a valid name.");
  setValidity("#editPersonnelLastName", V.validateNameMultiple(data.lastName), "Please enter a valid name.");
  setValidity("#editPersonnelEmailAddress", V.validateEmail(data.email), "Please enter a valid email.");
  setValidity("#editPersonnelDepartment", V.validateID(data.departmentID), "Please select a valid department.");

  // Job title is optional, but if provided, it should be validated
  if (data.jobTitle.trim() !== "") {
    setValidity("#editPersonnelJobTitle", V.validateJobTitle(data.jobTitle), "Please enter a valid job title.");
  } else {
    // If jobTitle is empty, it's valid by default
    $("#editPersonnelJobTitle")[0].setCustomValidity("");
  }

  return isFormValid;
};

// Executes when the form button with type="submit" is clicked

$("#editPersonnelForm").on("submit", function (e) {
  e.preventDefault(); // Prevent default form submission

  // Sanitize and collect form data
  const data = {
    id: sanitizeInput($("#editPersonnelEmployeeID").val()),
    firstName: sanitizeName($("#editPersonnelFirstName").val()),
    lastName: sanitizeName($("#editPersonnelLastName").val()),
    jobTitle: sanitizeInput($("#editPersonnelJobTitle").val()),
    email: sanitizeInput($("#editPersonnelEmailAddress").val()),
    departmentID: sanitizeInput($("#editPersonnelDepartment").val())
  };

  // Validate the data before sending
  const isValid = validateEditFormData(data);

  if (isValid) {
    // Perform the AJAX request to update personnel
    $.ajax({
      url: 'libs/php/updatePersonnelByID.php',
      type: 'POST',
      data: data,
      success: function (response) {
        if (response.status.code === "200") {
          // Refresh the personnel table after updating
          refreshTable('personnel');
          // Close the modal
          $("#editPersonnelModal").modal("hide");
        } else {
          console.error("Error: Failed to update personnel.");
        }
      },
      error: function (e) {
        console.error("Error updating personnel:", e);
      }
    });
  } else {
    // If validation fails, display the invalid messages
    this.classList.add("was-validated");
  }
});

function populateLocationEditDropdown(selectedLocationID) {
  let url = 'libs/php/getAllLocations.php';
  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: function(response) {
      if (response.status.code === "200") {
        let dropdown = $("#editDepartmentLocation");
        dropdown.empty();
        
        response.data.forEach(function(item) {
          let option = $("<option>", {
            value: item.id,
            text: item.name
          });
          
          // Set the current department location as selected
          if (item.id == selectedLocationID) {
            option.attr("selected", "selected");
          }

          dropdown.append(option);
        });
      }
    },
    error: function() {
      console.error(`Error fetching ${type} data.`);
    }
  });
}

$("#editDepartmentModal").on("show.bs.modal", function (e) {
  let id = $(e.relatedTarget).attr("data-id");
  $.ajax({
    url: "libs/php/getDepartmentByID.php",
    type: "POST",
    dataType: "json",
    data: {
      id: id
    },
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        // Update the hidden input with the department id so that
        // it can be referenced when the form is submitted
        $("#editDepartmentID").val(result.data[0].id);
        $("#editDepartmentName").val(result.data[0].name);

        // Populate the dropdown and set the current location as selected
        populateLocationEditDropdown(result.data[0].locationID);
      } else {
        $("#editDepartmentModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editDepartmentModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    }
  });
});

const validateEditDepartmentFormData = (data) => {
  isFormValid = true;

  const setValidity = (selector, isValid, message) => {
    if (!isValid) { isFormValid = false; }
    $(selector)[0].setCustomValidity(isValid ? "" : message);
  };

  setValidity("#editDepartmentName", V.validateNameMultiple(data.name), "Please enter a valid name.");
  setValidity("#editDepartmentLocation", V.validateID(data.locationID), "Please select a valid location.");

  return isFormValid;
}

$("#editDepartmentForm").on("submit", function (e) {
  e.preventDefault(); // Prevent default form submission

  // Get the form data
  const departmentID = sanitizeInput($("#editDepartmentID").val());
  const departmentName = sanitizeName($("#editDepartmentName").val());
  const locationID = sanitizeInput($("#editDepartmentLocation").val());

  // Validate inputs (you can reuse the validation logic like in other forms)
  const isValid = validateEditDepartmentFormData({
    name: departmentName,
    locationID: locationID
  });

  if (isValid) {
    // Send AJAX request to update department
    $.ajax({
      url: 'libs/php/updateDepartmentByID.php',
      type: 'POST',
      data: {
        id: departmentID,
        name: departmentName,
        locationID: locationID
      },
      success: function (response) {
        if (response.status.code === "200") {
          refreshTable('department');
          $("#editDepartmentModal").modal("hide");
        } else {
          console.error("Error: Failed to update department.");
        }
      },
      error: function (e) {
        console.error("Error updating department:", e);
      }
    });
  } else {
    // If validation fails, display the invalid messages
    this.classList.add("was-validated");
  }
});

$("#editLocationModal").on("show.bs.modal", function (e) {
  let id = $(e.relatedTarget).attr("data-id");
  $.ajax({
    url: "libs/php/getLocationByID.php",
    type: "POST",
    dataType: "json",
    data: {
      id: id
    },
    success: function (result) {
      var resultCode = result.status.code;
      if (resultCode == 200) {
        // Update the hidden input with the location id so that
        // it can be referenced when the form is submitted
        $("#editLocationID").val(result.data.id);
        $("#editLocationName").val(result.data.name);
      } else {
        $("#editLocationModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editLocationModal .modal-title").replaceWith(
        "Error retrieving data"
      );
      console.log(errorThrown);
    }
  });
});

const validateEditLocationFormData = (data) => {
  isFormValid = true;

  const setValidity = (selector, isValid, message) => {
    if (!isValid) { isFormValid = false; }
    $(selector)[0].setCustomValidity(isValid ? "" : message);
  };  

  setValidity("#editLocationName", V.validateNameMultiple(data.name), "Please enter a valid name.");

  return isFormValid;
};

// Executes when the location form button with type="submit" is clicked
$("#editLocationForm").on("submit", function (e) {
  e.preventDefault(); // Prevent default form submission

  // Get the form data
  const locationID = sanitizeInput($("#editLocationID").val());
  const locationName = sanitizeName($("#editLocationName").val());
  // Validate inputs (reuse validation logic)
  const isValid = validateEditLocationFormData({ name: locationName });

  if (isValid) { 
    // Send AJAX request to update location
    $.ajax({
      url: 'libs/php/updateLocationByID.php',
      type: 'POST',
      data: { id: locationID, name: locationName },
      success: function (response) {
        if (response.status.code === "200") {
          refreshTable('location');
          $("#editLocationModal").modal("hide");
        } else {
          console.error("Error: Failed to update location.");
        }
      },
      error: function (e) {
        console.error("Error updating location:", e);
      }
    });
  } else {
    this.classList.add("was-validated");
  }
});

function refreshTable(type) {
  let url, tableBody;

  if (type === "personnel") {
    url = 'libs/php/getAll.php';
    tableBody = $("#personnelTableBody");
  } else if (type === "department") {
    url = 'libs/php/getAllDepartments.php';
    tableBody = $("#departmentTableBody");
  } else if (type === "location") {
    url = 'libs/php/getAllLocations.php';
    tableBody = $("#locationTableBody");
  }

  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      if (response.status.code === "200") {
        let rows = "";

        if (type === "personnel") {
          response.data.forEach(function (person) {
            rows += `
              <tr>
                <td class="align-middle text-nowrap">${person.lastName}, ${person.firstName}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${person.department}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${person.location}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
                <td class="text-end text-nowrap">
                  <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
                    <i class="fa-solid fa-pencil fa-fw"></i>
                  </button>
                  <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteModal" data-type="personnel" data-id="${person.id}">
                    <i class="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr>
            `;
          });
        } else if (type === "department") {
          response.data.forEach(function (department) {
            rows += `
              <tr>
                <td class="align-middle text-nowrap">${department.departmentName}</td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">${department.locationName}</td>
                <td class="text-end text-nowrap">
                  <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}">
                    <i class="fa-solid fa-pencil fa-fw"></i>
                  </button>
                  <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteModal" data-type="department" data-id="${department.id}">
                    <i class="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr>
            `;
          });
        } else if (type === "location") {
          response.data.forEach(function (location) {
            rows += `
              <tr>
                <td class="align-middle text-nowrap">${location.name}</td>
                <td class="text-end text-nowrap">
                  <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${location.id}">
                    <i class="fa-solid fa-pencil fa-fw"></i>
                  </button>
                  <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteModal" data-type="location" data-id="${location.id}">
                    <i class="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr>
            `;
          });
        }

        tableBody.html(rows);
      } else {
        console.error(`Error: Failed to fetch ${type} data.`);
      }
    },
    error: function () {
      console.error(`Error fetching ${type} data.`);
    }
  });
}

// Delete 

$("#deleteModal").on("show.bs.modal", function (e) {
  let recordID = $(e.relatedTarget).attr("data-id");
  let recordType = $(e.relatedTarget).attr("data-type");
  
  // Store record ID and type in hidden fields within the modal
  $("#deleteRecordID").val(recordID);
  $("#deleteRecordType").val(recordType);
});

// Handle the delete confirmation
$("#confirmDeleteBtn").on("click", function () {
  const recordID = Number($("#deleteRecordID").val());
  const recordType = $("#deleteRecordType").val();

  $.ajax({
    url: 'libs/php/deleteRecordByID.php',
    type: 'POST',
    data: {
      id: recordID,
      table: recordType 
    },
    success: function (response) {
      if (response.status.code === 200) {
        // Refresh the correct table based on the type
        refreshTable(recordType);
        $("#deleteModal").modal("hide");
      } else {
        console.error("Error: Failed to delete record.");
      }
    },
    error: function (e) {
      console.error("Error deleting record:", e);
    }
  });
});

$(document).ready(function() {
  refreshTable('personnel');
});

