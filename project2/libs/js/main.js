// ================================
//         GLOBAL VARIABLES
// ================================

class Validate {
  validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  validateName = (name) => /^[A-Za-z]+$/.test(name);
  validateID = (id) => Number.isInteger(parseFloat(id));
  validateNameMultiple = (name) => /^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(name);
}

const V = new Validate();
let isFormValid = true;
let activeFilters = {
  departmentIDs: [],
  locationIDs: [],
};
// ================================
//          CREATE OPERATIONS
// ================================
$('#addBtn').click(function () {
  setupAddModal();
  $('#addModal').modal('show');
});

$('#addModal').on('hidden.bs.modal', () => resetForm('#addForm'));

$('#addForm').on('submit', function (e) {
  e.preventDefault();

  const table = getActiveTabTable();
  const formData = collectAddFormData(table);

  if (validateAddFormData(table, formData) && this.checkValidity()) {
    $.ajax({
      url: 'libs/php/insertRecord.php',
      type: 'POST',
      data: formData,
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

function setupAddModal() {
  const activeTab = getActiveTabTable();
  const modalConfig = addModalSettings[activeTab];

  // Set modal title
  document.getElementById('addModalLabel').textContent = modalConfig.label;

  // Clear previous fields and prepare new fields
  const dynamicFields = document.getElementById('dynamicFields');
  dynamicFields.innerHTML = ''; // Clear previous fields
  const fragment = document.createDocumentFragment();

  modalConfig.fields.forEach((field) => {
    const fieldElement = field.isSelect
      ? createSelectInput(field.id, field.label)
      : createFloatingInput(field.id, field.label, field.type);
    fragment.appendChild(fieldElement);
  });

  dynamicFields.appendChild(fragment);

  // Populate dropdown if needed
  if (modalConfig.populateDropdown) {
    populateCreateDropdownByType(modalConfig.populateDropdown);
  }
}
function collectAddFormData() {
  const activeTab = getActiveTabTable();
  const formData = { table: activeTab };

  addModalSettings[activeTab].fields.forEach((field) => {
    const fieldValue = $(`#${field.id}`).val();
    const dataName = firstLetterToLowerCase(field.id.replace('add', ''));
    formData[dataName] = field.isName
      ? sanitizeName(fieldValue)
      : sanitizeInput(fieldValue);
  });
  return formData;
}

// ================================
//          READ OPERATIONS
// ================================
$('#personnelBtn').click(function () {
  $('#filterBtn').attr('disabled', false);
  refreshTable('personnel');
});

$('#departmentsBtn').click(function () {
  $('#filterBtn').attr('disabled', true);
  refreshTable('department');
});

$('#locationsBtn').click(function () {
  $('#filterBtn').attr('disabled', true);
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

// DELETE PERSONNEL
$('#areYouSurePersonnelModal').on('show.bs.modal', function (e) {
  $.ajax({
    url: 'libs/php/getPersonnelByID.php',
    type: 'POST',
    dataType: 'json',
    data: { id: $(e.relatedTarget).data('id') },
    success: function (result) {
      if (result.status.code === '200') {
        $('#areYouSurePersonnelID').val(result.data.personnel[0].id);
        $('#areYouSurePersonnelName').text(
          result.data.personnel[0].firstName +
            ' ' +
            result.data.personnel[0].lastName,
        );

        $('#areYouSurePersonnelModal').modal('show');
      } else {
        $('#areYouSurePersonnelModal .modal-title').replaceWith(
          'Error retrieving data',
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('#deleteEmployeeName .modal-title').replaceWith(
        'Error retrieving data',
      );
    },
  });
});

$('#areYouSurePersonnelForm').on('submit', function (e) {
  // stop the default browser behviour
  e.preventDefault();

  // AJAX call
  deleteRecord($('#areYouSurePersonnelID').val(), 'personnel');

  // close modal if successfully deleted
  $('#areYouSurePersonnelModal').modal('hide');
});

// DELETE DEPARTMENT
$('#departmentTableBody').on('click', '.deleteDepartmentBtn', function () {
  const departmentId = $(this).data('id');
  $.ajax({
    url: 'libs/php/checkDepartmentUse.php',
    type: 'POST',
    dataType: 'json',
    data: { id: departmentId },
    success: function (result) {
      const personnelCount = result.data[0].personnelCount;
      const departmentName = result.data[0].departmentName;

      if (personnelCount == 0) {
        $('#areYouSureDeptName').text(departmentName);
        $('#deleteDepartmentID').val(departmentId);
        $('#areYouSureDeleteDepartmentModal').modal('show');
      } else {
        $('#cantDeleteDeptName').text(departmentName);
        $('#personnelCount').text(personnelCount);
        $('#cantDeleteDepartmentModal').modal('show');
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('#areYouSureDeleteDepartmentModal .modal-title').replaceWith(
        'Error retrieving data',
      );
    },
  });
});

$('#deleteDepartmentForm').on('submit', function (e) {
  e.preventDefault();

  const departmentId = $('#deleteDepartmentID').val();
  deleteRecord(departmentId, 'department');

  $('#areYouSureDeleteDepartmentModal').modal('hide');
});

// DELETE LOCATION

$('#locationTableBody').on('click', '.deleteLocationBtn', function () {
  const locationId = $(this).data('id');
  $.ajax({
    url: 'libs/php/checkLocationUse.php',
    type: 'POST',
    dataType: 'json',
    data: { id: locationId },
    success: function (result) {
      const departmentCount = result.data[0].departmentCount;
      const locationName = result.data[0].locationName;

      if (departmentCount == 0) {
        $('#areYouSureLocName').text(locationName);
        $('#deleteLocationID').val(locationId);
        $('#areYouSureDeleteLocationModal').modal('show');
      } else {
        $('#cantDeleteLocName').text(locationName);
        $('#departmentCount').text(departmentCount);
        $('#cantDeleteLocationModal').modal('show');
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('#areYouSureDeleteLocationModal .modal-title').replaceWith(
        'Error retrieving data',
      );
    },
  });
});

$('#deleteLocationForm').on('submit', function (e) {
  e.preventDefault();

  const locationID = $('#deleteLocationID').val();
  deleteRecord(locationID, 'location');

  $('#areYouSureDeleteLocationModal').modal('hide');
});

function deleteRecord(id, table) {
  $.ajax({
    url: 'libs/php/deleteRecordByID.php',
    type: 'POST',
    data: { id, table },
    success: function (response) {
      if (response.status.code === 200) {
        refreshTable(table);
        return true;
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
  $('#searchInput').val(''); // Clear search input

  let url =
    type === 'personnel'
      ? 'libs/php/getAll.php'
      : type === 'department'
        ? 'libs/php/getAllDepartments.php'
        : 'libs/php/getAllLocations.php';
  if (type === 'personnel') {
    // If filters are applied, refresh with filters
    if (
      activeFilters.departmentIDs.length > 0 ||
      activeFilters.locationIDs.length > 0
    ) {
      $.ajax({
        url: 'libs/php/filterPersonnel.php',
        type: 'POST',
        data: {
          departmentIDs: activeFilters.departmentIDs,
          locationIDs: activeFilters.locationIDs,
        },
        success: function (response) {
          if (response.status.code === 200) {
            updateTableRows(response.data, 'personnel');
          } else {
            console.error('Error refreshing personnel table: ', response);
          }
        },
        error: function (e) {
          console.error('Error refreshing personnel table: ', e);
        },
      });
    } else {
      // Default refresh without filters
      $.ajax({
        url: 'libs/php/getAll.php',
        type: 'GET',
        success: function (response) {
          if (response.status.code === '200') {
            updateTableRows(response.data, 'personnel');
          } else {
            console.error('Error refreshing personnel table: ', response);
          }
        },
        error: function (e) {
          console.error('Error refreshing personnel table: ', e);
        },
      });
    }
  } else {
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
}

// ================================
//          SEARCH
// ================================

$('#searchInp').on('input', function () {
  const searchQuery = $(this).val().trim();

  if (searchQuery) {
    performSearchWithFilter(searchQuery);
  } else {
    activeFilters.departmentIDs.length || activeFilters.locationIDs.length
      ? applyCurrentFilters()
      : refreshTable('personnel'); // Show all personnel when search is empty
  }
});

/**
 * Perform a search query with any active filters.
 * @param {string} searchQuery - The search query to send to the server.
 */
function performSearchWithFilter(searchQuery) {
  const tab = getActiveTabTable();
  const requestData = {
    query: searchQuery,
    tab,
    departmentIDs: activeFilters.departmentIDs,
    locationIDs: activeFilters.locationIDs,
  };
  $.ajax({
    url: 'libs/php/searchAll.php',
    type: 'POST',
    dataType: 'json',
    data: requestData,
    success: ({ status: { code, returnedIn }, data: { found } }) => {
      if (code === '200') {
        updateTableRows(found, tab);
      } else {
        console.error('Error: Failed to fetch search results.');
      }
    },
    error: (e) => console.error(e, 'Error fetching search results.'),
  });
}

// ================================
//          FILTER
// ================================

$('#filterBtn').click(function () {
  $('#filterPersonnelModal').modal('show');
});

// Populate dropdowns when the modal is shown
$('#filterPersonnelModal').on('shown.bs.modal', function () {
  populateFilterDropdownByType('department');
  populateFilterDropdownByType('location');
});

// Ensure only one filter (Department OR Location) is applied at a time
$('#filterPersonnelByDepartment').change(function () {
  if (this.value > 0) {
    $('#filterPersonnelByLocation').val(0);
    applyCurrentFilters();
  }
});

$('#filterPersonnelByLocation').change(function () {
  if (this.value > 0) {
    $('#filterPersonnelByDepartment').val(0);
    applyCurrentFilters();
  }
});

/**
 * Apply current filters and update table rows.
 */
function applyCurrentFilters() {
  const departmentID = $('#filterPersonnelByDepartment').val();
  const locationID = $('#filterPersonnelByLocation').val();

  $.ajax({
    url: 'libs/php/filterPersonnel.php',
    type: 'POST',
    data: {
      departmentID: departmentID > 0 ? departmentID : null,
      locationID: locationID > 0 ? locationID : null,
    },
    success: function (response) {
      if (response.status.code === 200) {
        updateTableRows(response.data, 'personnel');
      } else {
        console.error('Error applying filter: ', response);
      }
    },
    error: function (e) {
      console.error('Error refreshing personnel table with filters: ', e);
    },
  });
}

/**
 * Populate the dropdowns dynamically by type.
 * @param {string} type - The type of data to populate (department/location).
 */
function populateFilterDropdownByType(type) {
  const url =
    type === 'department'
      ? 'libs/php/getAllDepartments.php'
      : 'libs/php/getAllLocations.php';
  const dropdown =
    type === 'department'
      ? $('#filterPersonnelByDepartment')
      : $('#filterPersonnelByLocation');

  // Cache the previous value
  const previousValue = dropdown.val();

  $.ajax({
    url,
    type: 'GET',
    dataType: 'json',
    success: (response) => {
      if (response.status.code === '200') {
        // Only clear and rebuild the dropdown if the response is successful
        dropdown.empty().append(new Option('All', 0));

        const fragment = document.createDocumentFragment();

        // Append each department/location option
        response.data.forEach(({ id, name }) => {
          const option = document.createElement('option');
          option.value = id;
          option.text = name;
          fragment.appendChild(option);
        });

        // Append the fragment to the dropdown and restore the previous value
        dropdown.append(fragment);
        dropdown.val(previousValue || 0);
      }
    },
    error: () => {
      console.error(`Error fetching ${type} data.`);
    },
  });
}

function populateCreateDropdownByType(type) {
  const url =
    type === 'department'
      ? 'libs/php/getAllDepartments.php'
      : 'libs/php/getAllLocations.php';
  const dropdown =
    type === 'department' ? $('#addDepartment') : $('#addLocation');

  $.ajax({
    url,
    type: 'GET',
    dataType: 'json',
    success: (response) => {
      if (response.status.code === '200') {
        dropdown.empty();
        const disabledOption = document.createElement('option');
        disabledOption.disabled = true;
        disabledOption.selected = true;
        disabledOption.value = 0;
        disabledOption.text = `Select a ${type}`;
        dropdown.append(disabledOption);
        response.data.forEach(({ id, name }) => {
          const option = document.createElement('option');
          option.value = id;
          option.text = name;
          dropdown.append(option);
        });
      }
    },
    error: () => {
      console.error(`Error fetching ${type} data.`);
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
      V.validateID(data.department),
      'Please select a department.',
    );
  } else if (table === 'department') {
    setValidity(
      '#addDepartmentName',
      V.validateNameMultiple(data.departmentName),
      'Please enter a valid name.',
    );
    setValidity(
      '#addLocation',
      V.validateID(data.location),
      'Please select a location.',
    );
  } else if (table === 'location') {
    setValidity(
      '#addLocationName',
      V.validateName(data.locationName),
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

const sanitizeInput = (input) => {
  if (input == null) return ''; // Return an empty string if input is null or undefined
  return DOMPurify.sanitize(input.trim());
};
const sanitizeName = (name) => DOMPurify.sanitize(capitalize(name.trim()));

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

/**
 * Reset form, validation, and real-time feedback.
 */
function resetForm(formSelector) {
  $(formSelector)[0].reset();
  $(formSelector).removeClass('was-validated');
}

function firstLetterToLowerCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// ================================
//         POPULATE DROPDOWNS
// ================================

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
        const dropdown = document.getElementById('editDepartmentLocation');
        dropdown.innerHTML = '';

        var frag = document.createDocumentFragment();

        // Populate dropdown and set the selected location
        response.data.forEach(function (item) {
          var option = document.createElement('option');
          option.value = item.id;
          option.text = item.name;
          option.selected = item.id == selectedLocationID;
          // let option = $('<option>', { value: item.id, text: item.name });
          // if (item.id == selectedLocationID) {
          //   option.attr('selected', 'selected');
          // }
          frag.append(option);
        });

        dropdown.append(frag);
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
 * Create a floating input form field with a label.
 * @param {string} id - The id of the input element.
 * @param {string} label - The label text for the input.
 * @param {string} type - The type of the input element (text, email, etc.).
 * @returns {HTMLDivElement} The form field element with label.
 */
function createFloatingInput(id, label, type) {
  const formGroup = document.createElement('div');
  formGroup.classList.add('form-floating', 'mb-3');

  const input = document.createElement('input');
  input.type = type;
  input.className = 'form-control';
  input.id = id;
  input.placeholder = label;
  input.required = true;

  const inputLabel = document.createElement('label');
  inputLabel.setAttribute('for', id);
  inputLabel.textContent = label;

  const invalidFeedbackDiv = document.createElement('div');
  invalidFeedbackDiv.className = 'invalid-feedback';

  formGroup.append(input, inputLabel, invalidFeedbackDiv);
  return formGroup;
}

/**
 * Create a select input form field with a label.
 * @param {string} id - The id of the select element.
 * @param {string} label - The label text for the select.
 * @returns {HTMLDivElement} The select form field element with label.
 */
function createSelectInput(id, label) {
  const formGroup = document.createElement('div');
  formGroup.classList.add('form-floating', 'mb-3');

  const select = document.createElement('select');
  select.className = 'form-select';
  select.id = id;
  select.required = true;

  const selectLabel = document.createElement('label');
  selectLabel.setAttribute('for', id);
  selectLabel.textContent = label;

  const invalidFeedbackDiv = document.createElement('div');
  invalidFeedbackDiv.className = 'invalid-feedback';

  formGroup.append(select, selectLabel, invalidFeedbackDiv);
  return formGroup;
}

/**
 * Updates the table rows based on returned data
 *
 * @param {Array} data - The array of search results.
 * @param {String} activeTab - The active table being displayed (personnel, department, or location).
 */
function updateTableRows(data, activeTab) {
  const tableBody = document.getElementById(
    tabTypeMapping[activeTab].tableBodyId,
  );
  const fields = fieldDefinitions[activeTab];
  const frag = document.createDocumentFragment();

  // Create rows for each data item
  data.forEach((item) => {
    frag.appendChild(createTableRow(item, fields, activeTab));
  });

  // Clear the table body and append the fragment
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild);
  }
  tableBody.appendChild(frag);
}

/**
 * Creates a table row with all necessary cells including action buttons
 * @param {object} item - Data item to create the row for
 * @param {array} fields - Definitions of the fields to display for the item
 * @param {string} activeTab - The active tab type
 * @returns {HTMLTableRowElement} The created row element
 */
function createTableRow(item, fields, activeTab) {
  const row = document.createElement('tr');

  // Create and append data cells for each field definition
  fields.forEach((field) => {
    const cell = createTableCell(field, item);
    row.appendChild(cell);
  });

  // Create and append action buttons cell
  const actionsCell = createActionsCell(activeTab, item);
  row.appendChild(actionsCell);

  return row;
}

/**
 * Create a table cell based on field definitions
 * @param {object} field - The field definition containing classList and key
 * @param {object} item - The data item to populate the field
 * @returns {HTMLTableCellElement} The created table cell
 */
function createTableCell(field, item) {
  const cell = document.createElement('td');
  cell.className = field.classList.join(' ');
  cell.textContent = field.key(item);
  return cell;
}

/**
 * Create a table cell containing the edit and delete buttons for the given item and tab type
 * @param {string} tab - The type of tab (personnel, department, or location)
 * @param {object} item - The item to create the cell for
 * @return {HTMLTableCellElement} The table cell element
 */
function createActionsCell(tab, item) {
  const actions = document.createElement('td');
  actions.classList.add('align-middle', 'text-end', 'text-nowrap');

  const editButton = createActionButton('edit', tab, item);
  const deleteButton = createActionButton('delete', tab, item);

  actions.append(editButton, deleteButton);
  return actions;
}

/**
 * Create a button element for the given actionType, tabType, and itemData
 *
 * @param {string} actionType - The type of action to perform (edit or delete)
 * @param {string} tabType - The type of tab to perform the action on (personnel, department, or location)
 * @param {object} itemData - The data of the item to perform the action on
 *
 * @returns {HTMLButtonElement} The button element
 */
function createActionButton(actionType, tabType, itemData) {
  const tabConfig = tabTypeMapping[tabType];

  const button = document.createElement('button');
  button.className = `btn btn-primary btn-sm`;
  button.type = 'button';

  // Set the data attributes for the button
  button.dataset.id = itemData.id;
  button.dataset.type = tabType;
  button.dataset.name = tabConfig.getName(itemData);

  // Create  the icon
  const icon = document.createElement('i');
  icon.classList.add('fa-solid', 'fa-fw');

  if (actionType === 'edit') {
    button.dataset.bsTarget = tabConfig.editModalTarget;
    button.dataset.bsToggle = 'modal';
    button.classList.add('me-1');
    icon.classList.add('fa-pencil');
  }

  if (actionType === 'delete') {
    button.dataset.bsTarget = tabConfig.deleteModalTarget;
    button.dataset.bsToggle = tabConfig.delete.toggle;
    button.classList.add(tabConfig.delete.classListAdd);
    icon.classList.add('fa-trash');
  }

  button.appendChild(icon);
  return button;
}

/*=============================================================================
 Mappings
=============================================================================*/
const tabTypeMapping = {
  personnel: {
    tableBodyId: 'personnelTableBody',
    editModalTarget: '#editPersonnelModal',
    deleteModalTarget: '#areYouSurePersonnelModal',
    getName: (data) => `${data.firstName} ${data.lastName}`,
    delete: {
      toggle: 'modal',
      classListAdd: 'deletePersonnelBtn',
    },
  },
  department: {
    tableBodyId: 'departmentTableBody',
    editModalTarget: '#editDepartmentModal',
    deleteModalTarget: '#areYouSureDeleteDepartmentModal',
    getName: (data) => data.name,
    delete: {
      toggle: '',
      classListAdd: 'deleteDepartmentBtn',
    },
  },
  location: {
    tableBodyId: 'locationTableBody',
    editModalTarget: '#editLocationModal',
    deleteModalTarget: '#areYouSureLocationModal',
    getName: (data) => data.name,
    delete: {
      toggle: '',
      classListAdd: 'deleteLocationBtn',
    },
  },
};

const fieldDefinitions = {
  personnel: [
    {
      classList: ['align-middle', 'text-nowrap'],
      key: (item) => `${item.lastName}, ${item.firstName}`,
    },
    {
      classList: ['align-middle', 'text-nowrap', 'd-none', 'd-md-table-cell'],
      key: (item) => item.departmentName,
    },
    {
      classList: ['align-middle', 'text-nowrap', 'd-none', 'd-md-table-cell'],
      key: (item) => item.locationName,
    },
    {
      classList: ['align-middle', 'text-nowrap', 'd-none', 'd-lg-table-cell'],
      key: (item) => item.email,
    },
  ],
  department: [
    { classList: ['align-middle', 'text-nowrap'], key: (item) => item.name },
    {
      classList: ['align-middle', 'text-nowrap', 'd-none', 'd-md-table-cell'],
      key: (item) => item.locationName,
    },
  ],
  location: [
    { classList: ['align-middle', 'text-nowrap'], key: (item) => item.name },
  ],
};

const addModalSettings = {
  personnel: {
    label: 'Add Personnel',
    fields: [
      {
        id: 'addFirstName',
        label: 'First Name',
        type: 'text',
        isSelect: false,
        isName: true,
      },
      {
        id: 'addLastName',
        label: 'Last Name',
        type: 'text',
        isSelect: false,
        isName: true,
      },
      {
        id: 'addEmail',
        label: 'Email',
        type: 'email',
        isSelect: false,
        isName: false,
      },
      {
        id: 'addDepartment',
        label: 'Department',
        isSelect: true,
        isName: false,
      },
    ],
    populateDropdown: 'department',
  },
  department: {
    label: 'Add Department',
    fields: [
      {
        id: 'addDepartmentName',
        label: 'Department Name',
        type: 'text',
        isSelect: false,
        isName: true,
      },
      { id: 'addLocation', label: 'Location', isSelect: true, isName: false },
    ],
    populateDropdown: 'location',
  },
  location: {
    label: 'Add Location',
    fields: [
      {
        id: 'addLocationName',
        label: 'Location Name',
        type: 'text',
        isSelect: false,
        isName: true,
      },
    ],
    populateDropdown: null,
  },
};

// Refresh the table when the document is ready
$(document).ready(function () {
  refreshTable('personnel'); // Default tab is personnel
});
