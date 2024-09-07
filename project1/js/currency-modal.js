
let selectedCurr = $('#hiddenCurrSelected');

function loadCurrenciesForCountry(countryCode) {
  $.ajax({
    url: 'php/currencies/getCountryCurrencies.php',
    type: 'GET',
    data: { countryCode: countryCode },
    dataType: 'json',
    success: function(data) {
      const tbody = $('#curr-tbody');
      tbody.empty();
      $('#currencies').empty();
      
      if (data && data.currencies && data.currencies.length > 0) {
        const countryCurrencies = data.currencies;
        
        // Change Selected Currency Hidden Input
        selectedCurr.val('');
        let fisrtCurr = countryCurrencies[0].currencyCode;
        selectedCurr.val(fisrtCurr);

        // Populate Currencies
        
        countryCurrencies.forEach(currency => {
          let cSymbol = currency.symbol;
          let cName = currency.currencyName;
          let cCode = currency.currencyCode;

          // General Info Modal
          $('#currencies').append(`
            <div class="mb-1">
              <strong>${cCode}</strong> | ${cSymbol} | ${toTitleCase(cName)}
            </div>
          `);
          
          // Currencies Modal
          tbody.append(`
            <tr class="align-middle">
              <td>${cSymbol}</td>
              <td>${toTitleCase(cName)}</td>
              <td>${cCode}</td>
            </tr>
          `);
        });
      } else {
        tbody.append('<tr><td colspan="3">No currencies available for this country</td></tr>');
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error('Failed to fetch currency data:', textStatus, errorThrown);
    }
  });
};

// Fetch currencies from the cache file and populate the dropdowns
function populateCurrencyDropdowns() {
  $.ajax({
    url: 'php/currencies/cacheCurrencies.php',
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      if (data && data.currenciesList) {
        const currenciesList = data.currenciesList;
        
        // Prepare dropdowns
        const fromSelect = $('#fromCurrency');
        const toSelect = $('#toCurrency');

        // Define default currencies
        const defaultCurrencies = ['USD', 'EUR', 'GBP'];

        // Sort currencies alphabetically, but ensure default currencies come first
        const sortedCurrencies = Object.keys(currenciesList).sort((a, b) => {
          if (defaultCurrencies.includes(a) && !defaultCurrencies.includes(b)) {
            return -1;
          } else if (!defaultCurrencies.includes(a) && defaultCurrencies.includes(b)) {
            return 1;
          } else {
            return a.localeCompare(b);
          }
        });

        // Populate dropdowns
        sortedCurrencies.forEach(currencyCode => {
          const currency = currenciesList[currencyCode];
          const option = new Option(`${currencyCode} - ${currency.name}`, currencyCode);
          fromSelect.append(option);
          toSelect.append(option.cloneNode(true));
        });
        
        const userCurr = selectedCurr.val();
        fromSelect.val(userCurr).change();
        
        }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error('Failed to fetch currency list:', textStatus, errorThrown);
    }
  });
}

// Call populateCurrencyDropdowns when the modal is shown
$('#currencyModal').on('shown.bs.modal', function () {
  populateCurrencyDropdowns();
});


$('#hiddenCountrySelected').on('change', function() {
  const updatedCountryCode = $(this).val();
  if (updatedCountryCode) {
    loadCurrenciesForCountry(updatedCountryCode);
  }
});

