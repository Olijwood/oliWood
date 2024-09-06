// UI-related handlers

$('#nav-info-li').on('click', () => {
  if ($("#countrySelect").val()) {
    $("#countryInfoModal").modal("show");
  } else {
    alert("Please select a country to view information.");
  }
});

$('#nav-weather-li').on('click', () => {
  $("#weatherModal").modal("show");
});

// Additional UI handlers
