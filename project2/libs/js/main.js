// ================================
//         GLOBAL VARIABLES
// ================================

class Validate {
  validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  validateName = (name) => /^[A-Za-z]+$/.test(name);
  validateID = (id) => !isNaN(id) && Number.isInteger(parseFloat(id));
  validateNameMultiple = (name) => /^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(name);
}

const V = new Validate();
let isFormValid = true;
let selectedFilters = {
  department: [],
  location: [],
};

// ================================
//          CREATE OPERATIONS
// ================================
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

  if ($('#personnelBtn').hasClass('active')) {
    $('#addModalLabel').text('Add Personnel');
    dynamicFields.append(createPersonnelFormFields());
    populateDropdownByType('department');
  } else if ($('#departmentsBtn').hasClass('active')) {
    $('#addModalLabel').text('Add Department');
    dynamicFields.append(createDepartmentFormFields());
    populateDropdownByType('location');
  } else if ($('#locationsBtn').hasClass('active')) {
    $('#addModalLabel').text('Add Location');
    dynamicFields.append(createLocationFormFields());
  }
}

/**
 * Collects form data for adding personnel, departments, or locations.
 * @param {string} table - The active table (personnel, department, location).
 * @returns {Object} - The collected form data.
 */
function collectAddFormData(table) {
  let data = {};
  if (table === 'personnel') {
    data = {
      table: table,
      firstName: sanitizeName($('#addFirstName').val()),
      lastName: sanitizeName($('#addLastName').val()),
      email: sanitizeInput($('#addEmail').val()),
      departmentID: sanitizeInput($('#addDepartment').val()),
    };
  } else if (table === 'department') {
    data = {
      table: table,
      name: sanitizeName($('#addDepartmentName').val()),
      locationID: sanitizeInput($('#addLocation').val()),
    };
  } else if (table === 'location') {
    data = {
      table: table,
      name: sanitizeName($('#addLocationName').val()),
    };
  }
  return data;
}

// Form submission for adding records
$('#addForm').on('submit', function (e) {
  e.preventDefault();
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

// ================================
//          READ OPERATIONS
// ================================
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

// ================================
//          UPDATE OPERATIONS
// ================================
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

/**
 * Populates the edit form for personnel.
 * @param {Object} result - The data received from the server.
 */
function populatePersonnelEditForm(result) {
  $('#editPersonnelEmployeeID').val(result.data.personnel[0].id);
  $('#editPersonnelFirstName').val(result.data.personnel[0].firstName);
  $('#editPersonnelLastName').val(result.data.personnel[0].lastName);
  $('#editPersonnelJobTitle').val(result.data.personnel[0].jobTitle);
  $('#editPersonnelEmailAddress').val(result.data.personnel[0].email);

  // Populate department dropdown
  $('#editPersonnelDepartment').html('');
  $.each(result.data.department, function () {
    $('#editPersonnelDepartment').append(
      $('<option>', {
        value: this.id,
        text: this.name,
      }),
    );
  });

  $('#editPersonnelDepartment').val(result.data.personnel[0].departmentID);
}

function collectEditPersonnelFormData() {
  return {
    table: 'personnel',
    id: sanitizeInput($('#editPersonnelEmployeeID').val()),
    firstName: sanitizeName($('#editPersonnelFirstName').val()),
    lastName: sanitizeName($('#editPersonnelLastName').val()),
    jobTitle: sanitizeInput($('#editPersonnelJobTitle').val()),
    email: sanitizeInput($('#editPersonnelEmailAddress').val()),
    departmentID: sanitizeInput($('#editPersonnelDepartment').val()),
  };
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

  const departmentData = collectEditDepartmentFormData();

  const isValid = validateEditFormData(departmentData);

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

function collectEditDepartmentFormData() {
  return {
    table: 'department',
    id: sanitizeInput($('#editDepartmentID').val()),
    name: sanitizeName($('#editDepartmentName').val()),
    locationID: sanitizeInput($('#editDepartmentLocation').val()),
  };
}

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
    table: 'location',
    id: sanitizeInput($('#editLocationID').val()),
    name: sanitizeName($('#editLocationName').val()),
  };

  const isValid = validateEditFormData(locationData);

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

// ================================
//          DELETE OPERATIONS
// ================================
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

// ================================
//          TABLE REFRESH
// ================================

/**
 * Fetches the data for a given table type and updates the table rows.
 * @param {string} type - The type of table to refresh (personnel, department, location).
 */
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

// ================================
//          SEARCH
// ================================

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

// ================================
//          FILTER
// ================================

// Show filter modal and populate checkboxes
$('#filterBtn').click(function () {
  populateFilterCheckboxes(
    'department',
    '#filterDepartmentContainer',
    selectedFilters.department,
    '#selectAllDepartments',
  );
  populateFilterCheckboxes(
    'location',
    '#filterLocationContainer',
    selectedFilters.location,
    '#selectAllLocations',
  );
  $('#filterModal').modal('show');
});

// Handle "Select All" logic for departments and locations
$('#selectAllDepartments').change(function () {
  const isChecked = $(this).is(':checked');
  $('#filterDepartmentContainer input[type="checkbox"]').prop(
    'checked',
    isChecked,
  );
  selectedFilters.department = isChecked ? getAllFilterIds('department') : [];
});

$('#selectAllLocations').change(function () {
  const isChecked = $(this).is(':checked');
  $('#filterLocationContainer input[type="checkbox"]').prop(
    'checked',
    isChecked,
  );
  selectedFilters.location = isChecked ? getAllFilterIds('location') : [];
});

// Collect selected department and location IDs from checkboxes and apply filters
$('#applyFilterBtn').click(function () {
  selectedFilters.department = getSelectedFilterIds(
    '#filterDepartmentContainer',
  );
  selectedFilters.location = getSelectedFilterIds('#filterLocationContainer');

  applyFilter(
    selectedFilters.department.length
      ? selectedFilters.department
      : getAllFilterIds('department'),
    selectedFilters.location.length
      ? selectedFilters.location
      : getAllFilterIds('location'),
  );

  $('#filterModal').modal('hide');
});

// Retrieve all IDs for a filter type (department or location) for "Select All" functionality
function getAllFilterIds(type) {
  return $(`#filter${capitalizeFirst(type)}Container input[type="checkbox"]`)
    .map(function () {
      return $(this).val();
    })
    .get();
}

// Retrieve selected IDs from checkboxes in a container
function getSelectedFilterIds(containerSelector) {
  return $(`${containerSelector} input:checked`)
    .map(function () {
      return $(this).val();
    })
    .get();
}

/**
 * Applies the selected filters to the personnel table.
 * @param {Array|string} departmentIDs - Array of department IDs or "ALL".
 * @param {Array|string} locationIDs - Array of location IDs or "ALL".
 */
function applyFilter(departmentIDs, locationIDs) {
  $.ajax({
    url: 'libs/php/filterPersonnel.php',
    type: 'POST',
    dataType: 'json',
    data: { departmentIDs, locationIDs },
    success: function (response) {
      if (response.status.code === 200) {
        updateTableRows(response.data, 'personnel');
      } else {
        console.error('Error fetching filtered data.');
      }
    },
    error: function (e) {
      console.error('Error applying filter:', e);
    },
  });
}

// ================================
//          VALIDATION HELPERS
// ================================

// --- Global Validation Variables ---
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
      V.validateName(data.name),
      'Please enter a valid location name.',
    );
  }
  return isFormValid;
};

/**
 * Validate edit form data for personnel, departments, and locations
 * @param {Object} data - The form data to validate
 * @returns {Boolean} - Whether the form data is valid
 */
const validateEditFormData = (data) => {
  isFormValid = true;

  // Validate personnel form
  if (data.table === 'personnel') {
    setValidity(
      '#editPersonnelFirstName',
      V.validateName(data.firstName),
      'Please enter a valid first name.',
    );
    setValidity(
      '#editPersonnelLastName',
      V.validateName(data.lastName),
      'Please enter a valid last name.',
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

    // Validate job title only if provided
    if (data.jobTitle.trim() !== '') {
      setValidity(
        '#editPersonnelJobTitle',
        V.validateNameMultiple(data.jobTitle),
        'Please enter a valid job title.',
      );
    } else {
      $('#editPersonnelJobTitle')[0].setCustomValidity('');
    }
  }

  // Validate department form
  else if (data.table === 'department') {
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
  }

  // Validate location form
  else if (data.table === 'location') {
    setValidity(
      '#editLocationName',
      V.validateName(data.name),
      'Please enter a valid location name.',
    );
  }

  return isFormValid;
};

/**
 * Sets the custom validity for the given selector and displays a
 * tooltip if the input is not valid.
 * @param {string} selector - The selector for the input element
 * @param {boolean} isValid - Whether the input is valid
 * @param {string} message - The custom validity message to display
 */
const setValidity = (selector, isValid, message) => {
  if (!isValid) {
    isFormValid = false;
    $(selector)[0].setCustomValidity(message); // Set custom validity message
  } else {
    $(selector)[0].setCustomValidity(''); // Clear custom validity if valid
  }
  $(selector)[0].reportValidity(); // Show browser tooltip
};

// Add real-time validation reset for input fields
function attachRealTimeValidationReset(formName) {
  $(`${formName} input`).on('input', function () {
    this.setCustomValidity(''); // Reset custom validity
    this.reportValidity(); // Show updated validation feedback
  });
}

/**
 * Resets the form validation when opening a new modal.
 * @param {string} formName - The name of the form to reset.
 */
function resetFormValidation(formName) {
  const form = $(formName)[0];

  form.classList.remove('was-validated');

  // Clear the custom validity for all input fields
  $(`${formName} input`).each(function () {
    this.setCustomValidity('');
  });
}

// ================================
//          DATA SANITIZATION
// ================================

const sanitizeInput = (input) => DOMPurify.sanitize(input.trim());
const sanitizeName = (name) => DOMPurify.sanitize(capitalizeFirst(name.trim()));

const capitalizeFirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// ================================
//          UTILITY FUNCTIONS
// ================================

/**
 * Retrieves the active table based on the selected tab.
 * @returns {string} - The active table (personnel, department, location).
 */
function getActiveTabTable() {
  if ($('#personnelBtn').hasClass('active')) return 'personnel';
  if ($('#departmentsBtn').hasClass('active')) return 'department';
  if ($('#locationsBtn').hasClass('active')) return 'location';
}

// ================================
//         POPULATE DROPDOWNS
// ================================

/**
 * Populates the dropdowns dynamically by type.
 * @param {string} type - The type of data to populate (department/location).
 */
function populateDropdownByType(type) {
  let url =
    type === 'department'
      ? 'libs/php/getAllDepartments.php'
      : 'libs/php/getAllLocations.php';

  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      if (response.status.code === '200') {
        let dropdown =
          type === 'department'
            ? $('#addDepartment')
            : $('#addLocation') || $('#editDepartmentLocation');
        dropdown.empty();
        response.data.forEach(function (item) {
          dropdown.append(`<option value="${item.id}">${item.name}</option>`);
        });
      }
    },
    error: function () {
      console.error(`Error fetching ${type} data.`);
    },
  });
}

/**
 * Populates the filter checkboxes based on type (department/location).
 * @param {string} type - The type of filter (department/location).
 * @param {string} containerSelector - The container for the checkboxes.
 * @param {Array} selectedIds - Array of previously selected IDs for the filter type.
 * @param {string} selectAllSelector - The "Select All" checkbox selector for the container.
 */
function populateFilterCheckboxes(
  type,
  containerSelector,
  selectedIds,
  selectAllSelector,
) {
  const url =
    type === 'department'
      ? 'libs/php/getAllDepartments.php'
      : 'libs/php/getAllLocations.php';

  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      if (response.status.code === '200') {
        const container = $(containerSelector);
        container.empty();
        let allSelected = true;

        response.data.forEach((item) => {
          const isChecked = selectedIds.includes(item.id.toString());
          allSelected = allSelected && isChecked;

          container.append(`
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="${item.id}" id="${type}${item.id}" ${isChecked ? 'checked' : ''}>
              <label class="form-check-label" for="${type}${item.id}">${item.name}</label>
            </div>
          `);
        });

        $(selectAllSelector).prop('checked', allSelected); // Set "Select All" checkbox
      } else {
        console.error(`Error: Failed to fetch ${type} data for filter.`);
      }
    },
    error: function () {
      console.error(`Error fetching ${type} data for filter.`);
    },
  });
}

/**
 * Populate the location dropdown for the edit department form.
 * @param {number} selectedLocationID - The ID of the currently selected location.
 */
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

// ================================
//            INJECT HTML
// ================================

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
          <td class="align-middle text-nowrap">${department.name}</td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">${department.locationName}</td>
          <td class="text-end text-nowrap">
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${department.id}" data-name="${department.name}">
              <i class="fa-solid fa-pencil fa-fw"></i>
            </button>
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="${department.id}" data-name="${department.name}" data-type="department">
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

// Refresh the table when the document is ready
$(document).ready(function () {
  refreshTable('personnel'); // Default tab is personnel
});
