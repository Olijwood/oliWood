

// Function to populate currency dropdowns
const populateCurrencyDropdowns = (currencies) => {
  const fromSelect = $('#fromCurrency');
  const toSelect = $('#toCurrency');
  
  fromSelect.empty();
  toSelect.empty();

  Object.keys(currencies).forEach(currencyCode => {
    const currency = currencies[currencyCode];
    fromSelect.append(new Option(`${currencyCode} - ${currency.name}`, currencyCode));
    toSelect.append(new Option(`${currencyCode} - ${currency.name}`, currencyCode));
  });
};
  
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


  // Fetch and populate currency data when modal is shown
$('#currencyModal').on('shown.bs.modal', () => {
 let fadsadsa = null;
});


// Watch for changes in the hidden input value
$('#hiddenCountrySelected').on('change', function() {
  const updatedCountryCode = $(this).val();
  if (updatedCountryCode) {
    loadCurrenciesForCountry(updatedCountryCode);  // Load currencies based on new country code
  }
});

