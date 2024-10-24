// CRUD OPERATIONS

// Create

$('#addBtn').click(function () {
  setupAddModal();
  $('#addModal').modal('show');
});

/**
 * Set up the add modal according to the active tab.
 */
function setupAddModal() {
  let dynamicFields = $('#dynamicFields');
  dynamicFields.empty();

  // Check which tab is active
  if ($('#personnelBtn').hasClass('active')) {
    $('#addModalLabel').text('Add Personnel');
    dynamicFields.append(createPersonnelFormFields());
    populateDropdown('department');
  } else if ($('#departmentsBtn').hasClass('active')) {
    $('#addModalLabel').text('Add Department');
    dynamicFields.append(createDepartmentFormFields());
    populateDropdown('location');
  } else if ($('#locationsBtn').hasClass('active')) {
    $('#addModalLabel').text('Add Location');
    dynamicFields.append(createLocationFormFields());
  }
}

function createPersonnelFormFields() {
  return `
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
  `;
}

function createDepartmentFormFields() {
  return `
    <div class="form-floating mb-3">
      <input type="text" class="form-control" id="addDepartmentName" placeholder="Department Name" required>
      <label for="addDepartmentName">Department Name</label>
      <div class="invalid-feedback"></div>
    </div>
    <div class="form-floating mb-3">
      <select class="form-select" id="addLocation" required></select>
      <label for="addLocation">Location</label>
      <div class="invalid-feedback"></div>
    </div>
  `;
}

function createLocationFormFields() {
  return `
    <div class="form-floating mb-3">
      <input type="text" class="form-control" id="addLocationName" placeholder="Location Name" required>
      <label for="addLocationName">Location Name</label>
      <div class="invalid-feedback"></div>
    </div>
  `;
}

// Form submission for adding records
$('#addForm').on('submit', function (e) {
  e.preventDefault(); // Prevent default form submission

  const table = getActiveTabTable();
  const data = collectAddFormData(table);

  if (validateAddFormData(table, data) && this.checkValidity()) {
    $.ajax({
      url: 'libs/php/insertRecord.php',
      type: 'POST',
      data,
      success: function (response) {
        if (response.status.code === '200') {
          refreshTable(table);
          $('#addModal').modal('hide');
        } else {
          console.error('Error: Failed to add record.');
        }
      },
      error: function (e) {
        console.error('Error adding record:', e);
      },
    });
  } else {
    e.stopPropagation();
    this.classList.add('was-validated');
  }
  attachRealTimeValidationReset('#addForm');
});

function getActiveTabTable() {
  if ($('#personnelBtn').hasClass('active')) return 'personnel';
  if ($('#departmentsBtn').hasClass('active')) return 'department';
  if ($('#locationsBtn').hasClass('active')) return 'location';
}

function collectAddFormData(table) {
  if (table === 'personnel') {
    return {
      table: table,
      firstName: sanitizeName($('#addFirstName').val()),
      lastName: sanitizeName($('#addLastName').val()),
      email: sanitizeInput($('#addEmail').val()),
      departmentID: sanitizeInput($('#addDepartment').val()),
    };
  } else if (table === 'department') {
    return {
      table: table,
      name: sanitizeName($('#addDepartmentName').val()),
      locationID: sanitizeInput($('#addLocation').val()),
    };
  } else if (table === 'location') {
    return {
      table: table,
      name: sanitizeName($('#addLocationName').val()),
    };
  }
}

// Read
$('#personnelBtn').click(function () {
  refreshTable('personnel');
});
$('#departmentsBtn').click(function () {
  refreshTable('department');
});
$('#locationsBtn').click(function () {
  refreshTable('location');
});
$('#refreshBtn').click(function () {
  refreshTable(getActiveTabTable());
});

// UPDATE LOGIC

// Edit Personnel Modal
$('#editPersonnelModal').on('show.bs.modal', function (e) {
  resetFormValidation('#editPersonnelForm');

  $('#editPersonnelForm input').on('input', function () {
    this.setCustomValidity('');
    this.reportValidity();
  });

  const id = $(e.relatedTarget).attr('data-id');

  $.ajax({
    url: 'libs/php/getPersonnelByID.php',
    type: 'POST',
    dataType: 'json',
    data: { id: id },
    success: function (result) {
      populatePersonnelEditForm(result);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Error retrieving personnel data:', errorThrown);
    },
  });
});

$('#editPersonnelForm').on('submit', function (e) {
  e.preventDefault();
  const data = collectEditPersonnelFormData();

  if (validateEditFormData(data)) {
    $.ajax({
      url: 'libs/php/updatePersonnelByID.php',
      type: 'POST',
      data: data,
      success: function (response) {
        refreshTable('personnel');
        $('#editPersonnelModal').modal('hide');
      },
      error: function (e) {
        console.error('Error updating personnel:', e);
      },
    });
  } else {
    this.classList.add('was-validated');
  }
});

function collectEditPersonnelFormData() {
  return {
    id: sanitizeInput($('#editPersonnelEmployeeID').val()),
    firstName: sanitizeName($('#editPersonnelFirstName').val()),
    lastName: sanitizeName($('#editPersonnelLastName').val()),
    jobTitle: sanitizeInput($('#editPersonnelJobTitle').val()),
    email: sanitizeInput($('#editPersonnelEmailAddress').val()),
    departmentID: sanitizeInput($('#editPersonnelDepartment').val()),
  };
}

function populatePersonnelEditForm(result) {
  if (result.status.code === '200') {
    $('#editPersonnelEmployeeID').val(result.data.personnel[0].id);
    $('#editPersonnelFirstName').val(result.data.personnel[0].firstName);
    $('#editPersonnelLastName').val(result.data.personnel[0].lastName);
    $('#editPersonnelJobTitle').val(result.data.personnel[0].jobTitle);
    $('#editPersonnelEmailAddress').val(result.data.personnel[0].email);
    populatePersonnelDepartmentDropdown(
      result.data.department,
      result.data.personnel[0].departmentID,
    );
  } else {
    console.error('Error retrieving data');
  }
}

// Edit Department Modal
$('#editDepartmentModal').on('show.bs.modal', function (e) {
  resetFormValidation('#editDepartmentForm');

  // Attach input validation reset on user input
  $('#editDepartmentForm input').on('input', function () {
    this.setCustomValidity('');
    this.reportValidity();
  });

  const id = $(e.relatedTarget).attr('data-id');

  $.ajax({
    url: 'libs/php/getDepartmentByID.php',
    type: 'POST',
    dataType: 'json',
    data: { id: id },
    success: function (result) {
      if (result.status.code === '200') {
        // Populate the form with department data
        $('#editDepartmentID').val(result.data[0].id);
        $('#editDepartmentName').val(result.data[0].name);

        // Populate locations in the dropdown
        populateLocationEditDropdown(result.data[0].locationID);
      } else {
        $('#editDepartmentModal .modal-title').replaceWith(
          'Error retrieving data',
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Error retrieving department data:', errorThrown);
    },
  });
});

// Submit event for editing department
$('#editDepartmentForm').on('submit', function (e) {
  e.preventDefault();

  const departmentData = {
    id: sanitizeInput($('#editDepartmentID').val()),
    name: sanitizeName($('#editDepartmentName').val()),
    locationID: sanitizeInput($('#editDepartmentLocation').val()),
  };

  const isValid = validateEditDepartmentFormData(departmentData);

  if (isValid) {
    $.ajax({
      url: 'libs/php/updateDepartmentByID.php',
      type: 'POST',
      data: departmentData,
      success: function (response) {
        if (response.status.code === '200') {
          refreshTable('department');
          $('#editDepartmentModal').modal('hide');
        } else {
          console.error('Error: Failed to update department.');
        }
      },
      error: function (e) {
        console.error('Error updating department:', e);
      },
    });
  } else {
    this.classList.add('was-validated');
  }
});

// Edit Location Modal
$('#editLocationModal').on('show.bs.modal', function (e) {
  resetFormValidation('#editLocationForm');

  $('#editLocationForm input').on('input', function () {
    this.setCustomValidity('');
    this.reportValidity();
  });

  const id = $(e.relatedTarget).attr('data-id');

  $.ajax({
    url: 'libs/php/getLocationByID.php',
    type: 'POST',
    dataType: 'json',
    data: { id: id },
    success: function (result) {
      if (result.status.code === '200') {
        // Populate form fields with the location data
        $('#editLocationID').val(result.data.id);
        $('#editLocationName').val(result.data.name);
      } else {
        $('#editLocationModal .modal-title').replaceWith(
          'Error retrieving data',
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Error retrieving location data:', errorThrown);
    },
  });
});

// Submit event for editing location
$('#editLocationForm').on('submit', function (e) {
  e.preventDefault();

  const locationData = {
    id: sanitizeInput($('#editLocationID').val()),
    name: sanitizeName($('#editLocationName').val()),
  };

  const isValid = validateEditLocationFormData(locationData);

  if (isValid) {
    $.ajax({
      url: 'libs/php/updateLocationByID.php',
      type: 'POST',
      data: locationData,
      success: function (response) {
        if (response.status.code === '200') {
          refreshTable('location');
          $('#editLocationModal').modal('hide');
        } else {
          console.error('Error: Failed to update location.');
        }
      },
      error: function (e) {
        console.error('Error updating location:', e);
      },
    });
  } else {
    this.classList.add('was-validated');
  }
});

function populatePersonnelDepartmentDropdown(
  departments,
  selectedDepartmentID,
) {
  const dropdown = $('#editPersonnelDepartment');
  dropdown.empty();
  $.each(departments, function () {
    const option = $('<option>', { value: this.id, text: this.name });
    if (this.id == selectedDepartmentID) option.attr('selected', 'selected');
    dropdown.append(option);
  });
}

// DELETE RECORD LOGIC

$('#deleteModal').on('show.bs.modal', function (e) {
  const id = $(e.relatedTarget).data('id');
  const name = $(e.relatedTarget).data('name');
  const table = $(e.relatedTarget).data('type');

  $('#deleteRecordName').text(name);
  $('#confirmDeleteBtn')
    .off('click')
    .on('click', function () {
      deleteRecord(id, table);
    });
});

function deleteRecord(id, table) {
  $.ajax({
    url: 'libs/php/deleteRecordByID.php',
    type: 'POST',
    data: { id, table },
    success: function (response) {
      if (response.status.code === 200) {
        refreshTable(table);
        $('#deleteModal').modal('hide');
      } else {
        console.error('Error: Failed to delete record.');
      }
    },
    error: function (e) {
      console.error('Error deleting record:', e);
    },
  });
}

// Filter

$('#filterBtn').click(function () {
  // Open a modal of your own design that allows the user to apply a filter to the personnel table on either department or location
});

// SEARCH FUNCTIONALITY
$('#searchInp').on('keyup', function () {
  const searchQuery = $(this).val();
  const activeTab = getActiveTabTable();

  $.ajax({
    url: 'libs/php/SearchAll.php',
    type: 'POST',
    data: { query: searchQuery, tab: activeTab },
    success: function (response) {
      if (response.status.code === '200') {
        updateTableRows(response.data.found, activeTab);
      } else {
        console.error('Error: Failed to fetch search results.');
      }
    },
    error: function (e) {
      console.error('Error fetching search results:', e);
    },
  });
});

/**
 * Update the table rows based on the search results
 * @param {Array} data - The array of search results.
 * @param {String} activeTab - The active table being displayed (personnel, department, or location).
 */
function updateTableRows(data, activeTab) {
  let rows = '';

  if (activeTab === 'personnel') {
    data.forEach(function (person) {
      rows += `
        <tr>
          <td class="align-middle text-nowrap">${person.lastName}, ${person.firstName}</td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">${person.departmentName}</td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">${person.locationName}</td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">${person.email}</td>
          <td class="text-end text-nowrap">
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}" data-name="${person.firstName} ${person.lastName}">
              <i class="fa-solid fa-pencil fa-fw"></i>
            </button>
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="${person.id}" data-name="${person.firstName} ${person.lastName}" data-type="personnel">
              <i class="fa-solid fa-trash fa-fw"></i>
            </button>
          </td>
        </tr>
      `;
    });
    $('#personnelTableBody').html(rows);
  } else if (activeTab === 'department') {
    data.forEach(function (department) {
      rows += `
        <tr>
          <td class="align-middle text-nowrap">${department.departmentName}</td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">${department.locationName}</td>
          <td class="text-end text-nowrap">
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}" data-name="${department.departmentName}">
              <i class="fa-solid fa-pencil fa-fw"></i>
            </button>
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="${department.id}" data-name="${department.departmentName}" data-type="department">
              <i class="fa-solid fa-trash fa-fw"></i>
            </button>
          </td>
        </tr>
      `;
    });
    $('#departmentTableBody').html(rows);
  } else if (activeTab === 'location') {
    data.forEach(function (location) {
      rows += `
        <tr>
          <td class="align-middle text-nowrap">${location.name}</td>
          <td class="text-end text-nowrap">
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${location.id}" data-name="${location.name}">
              <i class="fa-solid fa-pencil fa-fw"></i>
            </button>
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="${location.id}" data-name="${location.name}" data-type="location">
              <i class="fa-solid fa-trash fa-fw"></i>
            </button>
          </td>
        </tr>
      `;
    });
    $('#locationTableBody').html(rows);
  }
}

// FORM VALIDATION AND SANITIZATION HELPERS

class Validate {
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

  validateNameMultiple = (jobTitle) => {
    const jobTitlePattern = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
    return jobTitlePattern.test(jobTitle);
  };
}

const V = new Validate();
let isFormValid = true;

const validateAddFormData = (table, data) => {
  isFormValid = true;
  if (table === 'personnel') {
    setValidity(
      '#addFirstName',
      V.validateName(data.firstName),
      'Please enter a valid name.',
    );
    setValidity(
      '#addLastName',
      V.validateName(data.lastName),
      'Please enter a valid name.',
    );
    setValidity(
      '#addEmail',
      V.validateEmail(data.email),
      'Please enter a valid email.',
    );
    setValidity(
      '#addDepartment',
      V.validateID(data.departmentID),
      'Please enter a valid ID.',
    );
  } else if (table === 'department') {
    setValidity(
      '#addDepartmentName',
      V.validateNameMultiple(data.name),
      'Please enter a valid name.',
    );
    setValidity(
      '#addLocation',
      V.validateID(data.locationID),
      'Please enter a valid ID.',
    );
  } else if (table === 'location') {
    setValidity(
      '#addLocationName',
      V.validateNameMultiple(data.name),
      'Please enter a valid name.',
    );
  }
  return isFormValid;
};

const validateEditFormData = (data) => {
  isFormValid = true;

  setValidity(
    '#editPersonnelFirstName',
    V.validateName(data.firstName),
    'Please enter a valid name.',
  );
  setValidity(
    '#editPersonnelLastName',
    V.validateName(data.lastName),
    'Please enter a valid name.',
  );
  setValidity(
    '#editPersonnelEmailAddress',
    V.validateEmail(data.email),
    'Please enter a valid email.',
  );
  setValidity(
    '#editPersonnelDepartment',
    V.validateID(data.departmentID),
    'Please select a valid department.',
  );

  // Job title is optional, but if provided, it should be validated
  if (data.jobTitle.trim() !== '') {
    setValidity(
      '#editPersonnelJobTitle',
      V.validateNameMultiple(data.jobTitle),
      'Please enter a valid job title.',
    );
  } else {
    $('#editPersonnelJobTitle')[0].setCustomValidity('');
  }
  return isFormValid;
};

// Validate Department Data
const validateEditDepartmentFormData = (data) => {
  isFormValid = true;

  setValidity(
    '#editDepartmentName',
    V.validateNameMultiple(data.name),
    'Please enter a valid department name.',
  );
  setValidity(
    '#editDepartmentLocation',
    V.validateID(data.locationID),
    'Please select a valid location.',
  );

  return isFormValid;
};

// Validate Location Data
const validateEditLocationFormData = (data) => {
  isFormValid = true;

  setValidity(
    '#editLocationName',
    V.validateNameMultiple(data.name),
    'Please enter a valid location name.',
  );

  return isFormValid;
};

// Add real-time validation reset for input fields
function attachRealTimeValidationReset(formName) {
  $(`${formName} input`).on('input', function () {
    this.setCustomValidity(''); // Reset custom validity
    this.reportValidity(); // Show updated validation feedback
  });
}

// Reset form validation
function resetFormValidation(formName) {
  let form = $(formName)[0];
  form.classList.remove('was-validated');

  $(`${formName} input`).each(function () {
    this.setCustomValidity('');
  });
}

// Form validation utility
const setValidity = (selector, isValid, message) => {
  if (!isValid) {
    isFormValid = false;
    $(selector)[0].setCustomValidity(message); // Set custom validity message
  } else {
    $(selector)[0].setCustomValidity(''); // Clear custom validity if valid
  }
  $(selector)[0].reportValidity(); // Show browser tooltip
};

// Utility functions for sanitization
const sanitizeInput = (input) => DOMPurify.sanitize(input.trim());
const sanitizeName = (name) =>
  DOMPurify.sanitize(
    name.trim().charAt(0).toUpperCase() + name.trim().slice(1),
  );
const capitalizeFirst = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

// DROPDOWN HELPERS
function populateDropdown(type) {
  let url =
    type === 'department'
      ? 'libs/php/getAllDepartments.php'
      : 'libs/php/getAllLocations.php';

  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      console.log(response);
      if (response.status.code === '200') {
        let dropdown =
          type === 'department' ? $('#addDepartment') : $('#addLocation');
        dropdown.empty();
        response.data.forEach(function (item) {
          dropdown.append(
            `<option value="${item.id}">${item.departmentName}</option>`,
          );
        });
      }
    },
    error: function () {
      console.error(`Error fetching ${type} data.`);
    },
  });
}

// Populate Location dropdown for the edit form
function populateLocationEditDropdown(selectedLocationID) {
  let url = 'libs/php/getAllLocations.php';

  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      if (response.status.code === '200') {
        const dropdown = $('#editDepartmentLocation');
        dropdown.empty();

        // Populate dropdown and set the selected location
        response.data.forEach(function (item) {
          let option = $('<option>', { value: item.id, text: item.name });
          if (item.id == selectedLocationID) {
            option.attr('selected', 'selected');
          }
          dropdown.append(option);
        });
      }
    },
    error: function () {
      console.error('Error fetching locations.');
    },
  });
}

// TABLE REFRESH
function refreshTable(type) {
  let url =
    type === 'personnel'
      ? 'libs/php/getAll.php'
      : type === 'department'
        ? 'libs/php/getAllDepartments.php'
        : 'libs/php/getAllLocations.php';

  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      if (response.status.code === '200') {
        updateTableRows(response.data, type);
      } else {
        console.error(`Error: Failed to fetch ${type} data.`);
      }
    },
    error: function () {
      console.error(`Error fetching ${type} data.`);
    },
  });
}

$(document).ready(function () {
  refreshTable('personnel'); // Default tab is personnel
});
