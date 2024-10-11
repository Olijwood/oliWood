import { toTitleCase } from "./utils.js";
import { currentCountry, hideCustomOverlays } from "./map.js";
import { countryInfoConfig } from "./configs/modalConfigs.js";

/**
 * Injects data into the modal based on a configuration.
 * @param {Object} data - Country data object.
 * @param {Array} config - Configuration array with id and format keys.
 */
const injectDataIntoModal = (data, config) => {
  config.forEach(({ id: key, format }) => {
    const val = data[key];
    const element = $(`#${key}`);
    let formattedValue;

    if (val === undefined) {
      element.text("N/A");
    } else {
      switch (format) {
        case "":
          formattedValue = val;
          break;
        case "int":
          formattedValue = val.toLocaleString();
          break;
        case "title":
          formattedValue = toTitleCase(val);
          break;
        case "yesNo":
          formattedValue = val ? "Yes" : "No";
          break;
        default:
          formattedValue = val;
      }
      element.text(formattedValue);
    }
  });
};

/**
 * Updates the country info modal with data and configuration.
 * @param {Object} countryData - Country data object.
 * @param {Array} countryInfoConfig - Configuration for country info modal.
 */
export const updateCountryInfo = (countryData, countryInfoConfig) => {
  injectDataIntoModal(countryData, countryInfoConfig);

  const {
    countryName,
    languages,
    currencies,
    flag,
    alt,
    borders,
    demonyms
  } = countryData;

  // Set country flag
  $('#countryFlag').attr('src', flag).attr('alt', alt || `${countryName} Flag`);

  // Bordering countries
  $('#borderCs').empty();
  if (borders && borders.length) {
    borders.forEach(border => {
      $('#borderCs').append(`<li>${border}</li>`);
    });
  } else {
    $('#borderCs').append('<li>No bordering countries</li>');
  }

  // Languages
  $('#languagesTable').empty();
  if (languages && Object.keys(languages).length) {
    Object.entries(languages).forEach(([code, language]) => {
      $('#languagesTable').append(`<li>${language}</li>`);
    });
  } else {
    $('#languagesTable').html('<li>N/A</li>');
  }

  // Currencies
  $('#currenciesVal').empty();
  if (currencies && Object.keys(currencies).length) {
    Object.entries(currencies).forEach(([code, currency]) => {
      $('#currenciesVal').append(`<li>${currency.name}</li>`);
    });
  } else {
    $('#currenciesVal').html('<li>N/A</li>');
  }

  // Demonyms
  $('#demonymsTable').empty();
  if (demonyms && Object.keys(demonyms).length) {
    Object.entries(demonyms).forEach(([lang, { m, f }]) => {
      if (lang === 'eng') {
        $('#demonymsTable').append(`<tr><td>${m}</td></tr>`);
      }
    });
  } else {
    $('#demonymsTable').html('<tr><td colspan="2">N/A</td></tr>');
  }
};

/* --------------------------------------------------------------------------
      TAB HANDLING
-------------------------------------------------------------------------- */

/**
 * Handles tab switching for the modal.
 */
$('.o-tabs-link').on('click', function () {
  // Remove active class from all tabs
  $('.o-tabs-link').removeClass('tab-active');

  // Add active class to the clicked tab
  $(this).addClass('tab-active');

  // Get target content ID and hide all tab content sections
  const targetContentId = $(this).data('target');
  $('.tab-content').hide().removeClass('show');

  // Show the target content section
  $(`#${targetContentId}`).show().addClass('show');
});

/**
 * Hides the country information overlay when the close button is clicked.
 */
$('#iOverlayCloseBtn').on('click', () => {
  $('#infoContainer').hide();
});

/**
 * Displays the general information overlay for the selected country.
 */
export const showGeneralInfoOverlay = () => {
  hideCustomOverlays();

  // Update the modal with the selected country's data
  updateCountryInfo(currentCountry.info, countryInfoConfig);

  // Reset all tabs by removing 'tab-active' class from all info tabs
  $('.info-tabs-link').removeClass('tab-active');

  // Add 'tab-active' class only to the 'generalInfo' tab
  $('#generalInfo-tab').addClass('tab-active');

  // Hide all tab content
  $('.info-tab-content').hide();

  // Show only the general info content
  $('#generalInfoContent').show();

  // Show the info container
  $("#infoContainer").css("display", "flex");
};