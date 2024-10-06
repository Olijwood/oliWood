import { toTitleCase } from "./utils.js";
import { currentCountry } from "./map.js";
import { countryInfoConfig } from "./configs/modalConfigs.js";
import { _adapters } from "chart.js";
import { loadDemoModal } from "./demographics.js";


const injectDataIntoModal = (data, config) => {
  config.forEach(({ id: key, format}) => {
    const val = data[key];
    let element = $(`#${key}`);
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

export const updateCountryInfo = (countryData, countryInfoConfig) => {
  console.log(countryData);
  injectDataIntoModal(countryData, countryInfoConfig);
  const {
    countryName,
    languages,
    currencies,
    flag,
    alt,
    borders,
    demonyms,
  } = countryData;

  // Set country flag
  $('#countryFlag').attr('src', flag).attr('alt', alt || `${countryName} Flag`);


  // Bordering countries
  $('#borderCs').empty();
  if (borders && borders.length) {
    borders.forEach((border) => {
      $('#borderCs').append(`<li>${border}</li>`);
    });
  } else {
    $('#borderCs').append(`<li>No bordering countries</li>`);
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
      $('#demonymsTable').append(`<tr><td>${lang}:  ${m} / ${f}</td></tr>`);
    });
  } else {
    $('#demonymsTable').html('<tr><td colspan="2">N/A</td></tr>');
  }
};


// Handle tab switching
$('.o-tabs-link').on('click', function () {
  // Remove the active class from all tabs
  $('.o-tabs-link').removeClass('tab-active');
  
  // Add the active class to the clicked tab
  $(this).addClass('tab-active');

   // Get the target content ID from the clicked tab
  const targetContentId = $(this).data('target');
  console.log(targetContentId);
   // Hide all tab content sections
   $('.tab-content').css({
     display: 'none'
   });
   $('.tab-content').removeClass('show');
 
   // Show the target content section
   $(`#${targetContentId}`).css(
     {
       display: 'block'
     }
   );
  });

  $('#iOverlayCloseBtn').on('click', () => {
    $('#infoContainer').hide();
  });

