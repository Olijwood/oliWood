// ================================
//          VALIDATION
// ================================
class Validate {
  validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  validateName = (name) => /^[A-Za-z]+$/.test(name);
  validateID = (id) => Number.isInteger(parseFloat(id));
  validateNameMultiple = (name) => /^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(name);
}

const V = new Validate();
let isFormValid = true;

/**
 * Returns the validation rules for the given action (add or edit).
 *
 * @param {string} [action='add'] - The action to get validation rules for
 * @returns {Object|false} - The validation rules for the given action, or false if action is invalid
 */
const validationRules = (action = 'add') => {
  const actions = { add: true, edit: true };
  if (!actions[action]) return false;

  const createRules = () => ({
    personnel: [
      {
        selector: `#${action}PersonnelFirstName`,
        rule: V.validateName,
        message: 'Please enter a valid first name.',
      },
      {
        selector: `#${action}PersonnelLastName`,
        rule: V.validateName,
        message: 'Please enter a valid last name.',
      },
      {
        selector: `#${action}PersonnelEmailAddress`,
        rule: V.validateEmail,
        message: 'Please enter a valid email.',
      },
      {
        selector: `#${action}PersonnelDepartment`,
        rule: V.validateID,
        message: 'Please select a valid department.',
      },
    ],
    department: [
      {
        selector: `#${action}DepartmentName`,
        rule: V.validateNameMultiple,
        message: 'Please enter a valid department name.',
      },
      {
        selector: `#${action}DepartmentLocation`,
        rule: V.validateID,
        message: 'Please select a valid location.',
      },
    ],
    location: [
      {
        selector: `#${action}LocationName`,
        rule: V.validateName,
        message: 'Please enter a valid location name.',
      },
    ],
  });

  return createRules();
};

/**
 * Sets the custom validity for the given selector and displays a
 * tooltip if the input is not valid.
 * @param {string} selector - The selector for the input element
 * @param {boolean} isValid - Whether the input is valid
 * @param {string} message - The custom validity message to display
 */
const setValidity = (selector, isValid, message) => {
  const element = $(selector)[0];
  element.setCustomValidity(isValid ? '' : message);
  element.reportValidity();
  isFormValid = isValid && isFormValid;
};

// ================================
//          SANITIZATION
// ================================

const sanitizeInput = (input) => {
  return input ? DOMPurify.sanitize(input.trim()) : '';
};

const sanitizeName = (name) => DOMPurify.sanitize(capitalizeFirst(name.trim()));

// ================================
//        FORM HELPER FUNCTIONS
// ================================

const collectFormData = (tableName, fields) => {
  const formData = { table: tableName };
  fields.forEach(
    ({ id, key, sanitize = (v) => v }) =>
      (formData[key] = sanitize(document.getElementById(id).value)),
  );
  return formData;
};

const validateForm = (formData, action) => {
  isFormValid = true;
  let rules = validationRules(action);
  rules[formData.table].forEach(({ selector, rule, message }) => {
    const isValid = rule($(selector).val());
    setValidity(selector, isValid, message);
  });
  return isFormValid;
};

/**
 * Attaches an event listener to reset input validation feedback in real time.
 * Clears custom validity and updates validation feedback on user input.
 * @param {string} formName - The selector for the form whose inputs require real-time validation reset.
 */
function attachRealTimeValidationReset(formName) {
  $(`${formName} input`).on('input', function () {
    this.setCustomValidity('');
    this.reportValidity();
  });
}

/**
 * Resets the form validation when opening a new modal.
 * @param {string} formName - The name of the form to reset.
 */
const resetFormValidation = (formName) => {
  const form = $(formName)[0];
  form.classList.remove('was-validated');
  $(`${formName} input`).each(function () {
    this.setCustomValidity('');
  });
  attachRealTimeValidationReset(formName);
};

// ================================
//          MAPPINGS
// ================================

const tabMapping = {
  personnel: {
    table: {
      url: {
        getAll: 'libs/php/getAllPersonnel.php',
      },
      tableBodyId: 'personnelTableBody',
      tableRowFields: [
        {
          className: 'align-middle text-nowrap',
          key: (item) => `${item.lastName}, ${item.firstName}`,
        },
        {
          className: 'align-middle text-nowrap d-none d-md-table-cell',
          key: (item) => item.departmentName,
        },
        {
          className: 'align-middle text-nowrap d-none d-md-table-cell',
          key: (item) => item.locationName,
        },
        {
          className: 'align-middle text-nowrap d-none d-lg-table-cell',
          key: (item) => item.email,
        },
      ],
      edit: {
        faIcon: 'fa-pencil',
        target: '#editPersonnelModal',
        toggle: 'modal',
        classListAdd: 'me-1',
      },
      del: {
        faIcon: 'fa-trash',
        target: '#areYouSurePersonnelModal',
        toggle: 'modal',
        classListAdd: 'deletePersonnelBtn',
      },
    },
    create: {
      formSelector: '#addPersonnelForm',
      label: 'Add Personnel',
      fields: [
        {
          id: 'addPersonnelFirstName',
          label: 'First Name',
          key: 'firstName',
          sanitize: sanitizeName,
          type: 'text',
          isSelect: false,
          isName: true,
        },
        {
          id: 'addPersonnelLastName',
          label: 'Last Name',
          key: 'lastName',
          sanitize: sanitizeName,
          type: 'text',
          isSelect: false,
          isName: true,
        },
        {
          id: 'addPersonnelEmailAddress',
          label: 'Email',
          key: 'email',
          sanitize: sanitizeInput,
          type: 'email',
          isSelect: false,
          isName: false,
        },
        {
          id: 'addPersonnelDepartment',
          key: 'departmentID',
          sanitize: sanitizeInput,
          label: 'Department',
          isSelect: true,
          isName: false,
        },
      ],
      addDropdown: {
        dropdownTable: 'department',
        dropdownSelector: '#addPersonnelDepartment',
        selectedValueKey: 'departmentID',
      },
    },
    update: {
      table: 'personnel',
      formSelector: '#editPersonnelForm',
      modalSelector: '#editPersonnelModal',
      url: {
        update: 'libs/php/updatePersonnelByID.php',
        getById: 'libs/php/getPersonnelByID.php',
      },
      dropdownConfig: {
        dropdownTable: 'department',
        dropdownSelector: '#editPersonnelDepartment',
        selectedValueKey: 'departmentID',
      },
      fields: [
        { id: 'editPersonnelID', key: 'id' },
        {
          id: 'editPersonnelFirstName',
          key: 'firstName',
          sanitize: sanitizeName,
        },
        {
          id: 'editPersonnelLastName',
          key: 'lastName',
          sanitize: sanitizeName,
        },
        {
          id: 'editPersonnelEmailAddress',
          key: 'email',
          sanitize: sanitizeInput,
        },
        {
          id: 'editPersonnelJobTitle',
          key: 'jobTitle',
          sanitize: sanitizeInput,
        },
        {
          id: 'editPersonnelDepartment',
          key: 'departmentID',
          sanitize: sanitizeInput,
        },
      ],
    },
  },
  department: {
    table: {
      url: {
        getAll: 'libs/php/getAllDepartments.php',
      },
      tableBodyId: 'departmentTableBody',
      tableRowFields: [
        {
          className: 'align-middle text-nowrap',
          key: (item) => item.name,
        },
        {
          className: 'align-middle text-nowrap d-none d-md-table-cell',
          key: (item) => item.locationName,
        },
      ],
      edit: {
        faIcon: 'fa-pencil',
        target: '#editDepartmentModal',
        toggle: 'modal',
        classListAdd: 'me-1',
      },
      del: {
        faIcon: 'fa-trash',
        target: '#areYouSureDeleteDepartmentModal',
        toggle: '',
        classListAdd: 'deleteDepartmentBtn',
      },
    },
    create: {
      formSelector: '#addDepartmentForm',
      label: 'Add Department',
      fields: [
        {
          id: 'addDepartmentName',
          key: 'name',
          sanitize: sanitizeInput,
          label: 'Department Name',
          type: 'text',
          isSelect: false,
          isName: true,
        },
        {
          id: 'addDepartmentLocation',
          key: 'locationID',
          sanitize: sanitizeInput,
          label: 'Location',
          isSelect: true,
          isName: false,
        },
      ],

      addDropdown: {
        dropdownTable: 'location',
        dropdownSelector: '#addDepartmentLocation',
        selectedValueKey: 'locationID',
      },
    },
    update: {
      table: 'department',
      formSelector: '#editDepartmentForm',
      modalSelector: '#editDepartmentModal',
      url: {
        update: 'libs/php/updateDepartmentByID.php',
        getById: 'libs/php/getDepartmentByID.php',
      },
      dropdownConfig: {
        dropdownTable: 'location',
        dropdownSelector: '#editDepartmentLocation',
        selectedValueKey: 'locationID',
      },
      fields: [
        { id: 'editDepartmentID', key: 'id' },
        { id: 'editDepartmentName', key: 'name', sanitize: sanitizeInput },
        {
          id: 'editDepartmentLocation',
          key: 'locationID',
          sanitize: sanitizeInput,
        },
      ],
    },
  },
  location: {
    table: {
      url: {
        getAll: 'libs/php/getAllLocations.php',
      },
      tableBodyId: 'locationTableBody',
      tableRowFields: [
        {
          className: 'align-middle text-nowrap',
          key: (item) => item.name,
        },
      ],
      edit: {
        faIcon: 'fa-pencil',
        target: '#editLocationModal',
        toggle: 'modal',
        classListAdd: 'me-1',
      },
      del: {
        faIcon: 'fa-trash',
        target: '#areYouSureLocationModal',
        toggle: '',
        classListAdd: 'deleteLocationBtn',
      },
    },
    create: {
      formSelector: '#addLocationForm',
      label: 'Add Location',
      fields: [
        {
          id: 'addLocationName',
          label: 'Location Name',
          type: 'text',
          isSelect: false,
          isName: true,
          key: 'locationName',
          sanitize: sanitizeName,
        },
      ],
      addDropdown: null,
    },
    update: {
      table: 'location',
      formSelector: '#editLocationForm',
      modalSelector: '#editLocationModal',
      url: {
        update: 'libs/php/updateLocationByID.php',
        getById: 'libs/php/getLocationByID.php',
      },
      fields: [
        { id: 'editLocationID', key: 'id' },
        { id: 'editLocationName', key: 'name', sanitize: sanitizeInput },
      ],
    },
  },
};

// ================================
//          CREATE
// ================================

/**
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

$('#addBtn').on('click', function (e) {
  const activeTab = getActiveTabTable();
  const { label, fields, addDropdown } = tabMapping[activeTab].create;

  resetFormValidation('#addForm');

  document.getElementById('addModalLabel').textContent = label;

  const dynamicFields = document.getElementById('dynamicFields');
  dynamicFields.innerHTML = '';
  const fragment = document.createDocumentFragment();

  fields.forEach((field) => {
    const { id, label, type, isSelect, isName } = field;
    const fieldElement = isSelect
      ? createSelectInput(id, label)
      : createFloatingInput(id, label, type, isName);
    fragment.appendChild(fieldElement);
  });

  dynamicFields.appendChild(fragment);

  if (addDropdown) {
    const { dropdownTable, dropdownSelector } =
      tabMapping[activeTab].create.addDropdown;
    updateDropdown(dropdownTable, dropdownSelector, false);
  }

  $('#addModal').modal('show');
});

$('#addForm').on('submit', function (e) {
  e.preventDefault();

  const tableName = getActiveTabTable();
  const { fields } = tabMapping[tableName].create;
  const formData = collectFormData(tableName, fields);

  if (validateForm(formData, 'add')) {
    $.post('libs/php/insertRecord.php', formData)
      .then((response) => {
        if (response.status.code === '200') {
          refreshTable(tableName);
          $('#addModal').modal('hide');
        } else {
          console.error('Error: Failed to insert record:', code);
        }
      })
      .catch((e) => console.error('Error inserting record:', e));
  } else {
    e.stopPropagation();
    this.classList.add('was-validated');
  }
  attachRealTimeValidationReset('#addForm');
});

// ================================
//          UPDATE
// ================================

// PERSONNEL
$('#editPersonnelModal').on('show.bs.modal', function (e) {
  const {
    formSelector,
    fields,
    dropdownConfig: { dropdownTable, dropdownSelector, selectedValueKey },
    url: { getById },
  } = tabMapping.personnel.update;
  resetFormValidation(formSelector);
  $.post(getById, { id: $(e.relatedTarget).data('id') })
    .then((result) => {
      const personnel = result.data.personnel[0];
      fields.forEach(({ id, key }) => $(`#${id}`).val(personnel[key])); // Populate form fields

      const previousValue = personnel[selectedValueKey];
      updateDropdown(dropdownTable, dropdownSelector, previousValue);
    })
    .catch((e) => console.error(`Error retrieving data for personnel:`, e));
});

$('#editPersonnelForm').on('submit', function (e) {
  e.preventDefault();
  const {
    table,
    modalSelector,
    fields,
    url: { update },
  } = tabMapping.personnel.update;
  const formData = collectFormData(table, fields); //(); // Collect form data
  if (validateForm(formData, 'edit')) {
    $.post(update, formData)
      .then(() => {
        refreshTable(table);
        $(modalSelector).modal('hide');
      })
      .catch((e) => console.error(`Error updating personnel:`, e));
  } else {
    this.classList.add('was-validated');
  }
});

// DEPARTMENT
$('#editDepartmentModal').on('show.bs.modal', function (e) {
  const {
    formSelector,
    fields,
    dropdownConfig: { dropdownTable, dropdownSelector, selectedValueKey },
    url: { getById },
  } = tabMapping.department.update;
  resetFormValidation(formSelector);

  $.post(getById, {
    id: $(e.relatedTarget).data('id'),
  })
    .then((result) => {
      const department = result.data.department[0];
      fields.forEach(({ id, key }) => $(`#${id}`).val(department[key]));

      const previousValue = department[selectedValueKey];
      updateDropdown(dropdownTable, dropdownSelector, previousValue);
    })
    .catch((e) => console.error('Error retrieving data for department:', e));
});

$('#editDepartmentForm').on('submit', function (e) {
  e.preventDefault();
  const {
    url: { update },
    modalSelector,
    table,
    fields,
  } = tabMapping.department.update;
  const formData = collectFormData(table, fields);

  if (validateForm(formData, 'edit')) {
    $.post(update, formData)
      .then(() => {
        refreshTable(table);
        $(modalSelector).modal('hide');
      })
      .catch((e) => console.error('Error updating department:', e));
  } else {
    this.classList.add('was-validated');
  }
});

// LOCATION
$('#editLocationModal').on('show.bs.modal', function (e) {
  const {
    formSelector,
    fields,
    url: { getById },
  } = tabMapping.location.update;
  resetFormValidation(formSelector);

  $.post(getById, { id: $(e.relatedTarget).data('id') })
    .then((result) => {
      const location = result.location;
      fields.forEach(({ id, key }) => $(`#${id}`).val(location[key]));
    })
    .catch((e) => console.error('Error retrieving data for location:', e));
});

$('#editLocationForm').on('submit', function (e) {
  e.preventDefault();
  const {
    modalSelector,
    table,
    fields,
    url: { update },
  } = tabMapping.location.update;
  const formData = collectFormData(table, fields);

  if (validateForm(formData, 'edit')) {
    $.post(update, formData)
      .then(() => {
        refreshTable(table);
        $(modalSelector).modal('hide');
      })
      .catch((e) => console.error('Error updating location:', e));
  } else {
    this.classList.add('was-validated');
  }
});

// ================================
//          READ
// ================================

$('#myTab').on('click', '.nav-link', function () {
  const table = $(this).data('tab');
  $('#filterBtn').attr('disabled', table !== 'personnel');
  refreshTable(table);
});

// ================================
//          DELETE
// ================================

/**
 * Deletes a record from the specified table and refreshes the table upon success.
 * @param {string|number} id - The ID of the record to delete.
 * @param {string} table - The name of the table from which the record should be deleted.
 */
function deleteRecord(id, table) {
  $.post('libs/php/deleteRecordByID.php', { id, table })
    .then(() => refreshTable(table))
    .catch((e) => console.error('Error deleting record:', e));
}

// DELETE PERSONNEL
$('#areYouSurePersonnelModal').on('show.bs.modal', function (e) {
  $.post('libs/php/getPersonnelByID.php', { id: $(e.relatedTarget).data('id') })
    .then(
      ({
        data: {
          personnel: [{ firstName, lastName, id }],
        },
      }) => {
        $('#areYouSurePersonnelID').val(id);
        $('#areYouSurePersonnelName').text(`${firstName} ${lastName}`);
      },
    )
    .catch((e) => console.error('Error retrieving data:', e));
});

$('#areYouSurePersonnelForm').on('submit', function (e) {
  e.preventDefault();
  deleteRecord($('#areYouSurePersonnelID').val(), 'personnel');
  $('#areYouSurePersonnelModal').modal('hide');
});

// DELETE DEPARTMENT
$('#departmentTableBody').on('click', '.deleteDepartmentBtn', function () {
  const id = $(this).data('id');
  $.post('libs/php/checkDepartmentUse.php', { id })
    .then(function (result) {
      const { personnelCount, departmentName } = result.data[0];
      if (personnelCount === 0) {
        $('#areYouSureDeptName').text(departmentName);
        $('#deleteDepartmentID').val(id);
        $('#areYouSureDeleteDepartmentModal').modal('show');
      } else {
        $('#cantDeleteDeptName').text(departmentName);
        $('#personnelCount').text(personnelCount);
        $('#cantDeleteDepartmentModal').modal('show');
      }
    })
    .catch((e) => console.error('Error retrieving data:', e));
});

$('#deleteDepartmentForm').on('submit', function (e) {
  e.preventDefault();
  deleteRecord($('#deleteDepartmentID').val(), 'department');
  $('#areYouSureDeleteDepartmentModal').modal('hide');
});

// DELETE LOCATION
$('#locationTableBody').on('click', '.deleteLocationBtn', function () {
  const id = $(this).data('id');

  $.post('libs/php/checkLocationUse.php', { id })
    .then(function (result) {
      const { departmentCount, locationName } = result.data[0];
      if (departmentCount === 0) {
        $('#areYouSureLocName').text(locationName);
        $('#deleteLocationID').val(id);
        $('#areYouSureDeleteLocationModal').modal('show');
      } else {
        $('#cantDeleteLocName').text(locationName);
        $('#departmentCount').text(departmentCount);
        $('#cantDeleteLocationModal').modal('show');
      }
    })
    .catch((e) => console.error('Error retrieving data for location:', e));
});

$('#deleteLocationForm').on('submit', function (e) {
  e.preventDefault();
  deleteRecord($('#deleteLocationID').val(), 'location');
  $('#areYouSureDeleteLocationModal').modal('hide');
});

// ================================
//          FILTER
// ================================

$('#filterBtn').click(function () {
  $('#filterPersonnelModal').modal('show');
});

$('#filterPersonnelModal').on('shown.bs.modal', async function () {
  const tables = ['department', 'location'];
  const filterDropdownConfig = {
    department: {
      dropdownId: '#filterPersonnelByDepartment',
    },
    location: {
      dropdownId: '#filterPersonnelByLocation',
    },
  };
  for (const table of tables) {
    const { dropdownId } = filterDropdownConfig[table];
    const previousValue = document.querySelector(dropdownId).value;

    updateDropdown(table, dropdownId, previousValue, true);
  }
});

function applyCurrentFilters() {
  const departmentID = +$('#filterPersonnelByDepartment').val() || null;
  const locationID = +$('#filterPersonnelByLocation').val() || null;

  $.post('libs/php/filterPersonnel.php', { departmentID, locationID })
    .then(({ status: { code }, data }) =>
      code === 200
        ? updateTableRows(data, 'personnel')
        : console.error('Error applying filter: ', { code }),
    )
    .catch((e) =>
      console.error('Error refreshing personnel table with filters: ', e),
    );
}

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

// ================================
//          REFRESH
// ================================

function updateTableRows(data, table) {
  const { tableRowFields, tableBodyId } = tabMapping[table].table;
  const frag = document.createDocumentFragment();
  for (const item of data) {
    const row = document.createElement('tr');
    for (const { className, key } of tableRowFields) {
      const cell = document.createElement('td');
      cell.className = className;
      cell.textContent = key(item);
      row.appendChild(cell);
    }
    row.appendChild(createActionsCell(table, item));
    frag.appendChild(row);
  }
  document.getElementById(tableBodyId).replaceChildren(frag);
}

function createActionsCell(tab, item) {
  const actions = document.createElement('td');
  actions.className = 'align-middle text-end text-nowrap';
  const { edit, del } = tabMapping[tab].table;
  [edit, del].forEach(({ faIcon, classListAdd, target, toggle }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn btn-primary btn-sm ${classListAdd}`;
    button.setAttribute('data-id', item.id);
    button.setAttribute('data-type', tab);
    button.setAttribute('data-bs-target', target);
    button.setAttribute('data-bs-toggle', toggle);
    const icon = document.createElement('i');
    icon.className = `fa-solid fa-fw ${faIcon}`;
    button.appendChild(icon);
    actions.appendChild(button);
  });
  return actions;
}

$('#refreshBtn').click(function () {
  refreshTable(getActiveTabTable());
});

function refreshTable(table) {
  document.getElementById('searchInp').value = ''; // Clear search input

  const getAll = tabMapping[table].table.url.getAll;

  $.getJSON(getAll)
    .then(({ status: { code }, data }) =>
      code === 200
        ? updateTableRows(data, table)
        : console.error('Error refreshing table: ', { code }),
    )
    .catch((e) => console.error('Error refreshing table: ', e));
}

// ================================
//          SEARCH
// ================================

/**
 * Perform a search on table with the query.
 * @param {string} searchQuery - The search query to send to the server.
 * @param {string} table - The table to perform the search on.
 */
function performSearch(query, table) {
  const requestData = {
    query,
    table,
  };
  $.post('libs/php/search.php', requestData)
    .then(({ status: { code }, data: { found } }) => {
      if (code == 200) {
        updateTableRows(found, table);
      } else {
        console.error('Error: Failed to fetch search results.');
      }
    })
    .catch((e) => console.error(e, 'Error fetching search results.'));
}

$('#searchInp').on('input', function () {
  const searchQuery = $(this).val().trim();
  const table = getActiveTabTable();
  if (searchQuery) {
    performSearch(searchQuery, table);
  } else {
    refreshTable(table);
  }
});

// ================================
//          DROPDOWN
// ================================

function getAllForDropdown(table) {
  return $.post('libs/php/getAllForDropdown.php', { table })
    .done((data) => {
      return data;
    })
    .fail((e) => {
      console.error(e, 'Error fetching dropdown data.');
    });
}

function updateDropdown(table, dropdownId, prevValue, firstOptionAll = false) {
  getAllForDropdown(table)
    .then(({ data }) => {
      const dropdown = document.querySelector(dropdownId);
      const fragment = document.createDocumentFragment();
      const options = data.reduce((acc, { id, name }) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name;
        acc.appendChild(option);
        return acc;
      }, fragment);
      if (firstOptionAll) {
        const optionAll = document.createElement('option');
        optionAll.value = 0;
        optionAll.textContent = 'All';
        options.insertBefore(optionAll, options.firstChild);
      } else if (table !== null) {
        const optionCreate = document.createElement('option');
        optionCreate.value = 0;
        options.disabled = true;
        options.selected = true;
        optionCreate.textContent = `Select a ${table}`;
        options.insertBefore(optionCreate, options.firstChild);
      }
      dropdown.innerHTML = '';
      dropdown.appendChild(options);
      dropdown.value = prevValue ? prevValue : 0;
    })
    .catch((error) => {
      console.error('Error updating dropdown:', error);
    });
}

// ================================
//          UTILITIES
// ================================

/**
 * @returns {string} - The active table (personnel, department, location).
 */
function getActiveTabTable() {
  return $('#personnelBtn').hasClass('active')
    ? 'personnel'
    : $('#departmentsBtn').hasClass('active')
      ? 'department'
      : 'location';
}

function firstLetterToLowerCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// ================================
//          INITIALIZE
// ================================

$(document).ready(function () {
  refreshTable('personnel'); // Default tab is personnel
});
