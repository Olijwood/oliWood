
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

function populateCurrencyDropdowns() {
  $.ajax({
    url: 'php/currencies/getSupportedCurrencies.php', // Use getCurrencies2.php
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      if (data && Array.isArray(data)) {
        const fromSelect = $('#fromCurrency');
        const toSelect = $('#toCurrency');
        const defaultCurrencies = ['USD', 'EUR', 'GBP'];

        // Sort currencies
        const sortedCurrencies = data.sort((a, b) => {
          const aCode = a[0];
          const bCode = b[0];
          if (defaultCurrencies.includes(aCode) && !defaultCurrencies.includes(bCode)) return -1;
          if (!defaultCurrencies.includes(aCode) && defaultCurrencies.includes(bCode)) return 1;
          return aCode.localeCompare(bCode);
        });

        // Populate dropdowns
        sortedCurrencies.forEach(([currencyCode, currencyName]) => {
          const option = new Option(`${currencyCode} - ${currencyName}`, currencyCode);
          fromSelect.append(option);
          toSelect.append(option.cloneNode(true));
        });

        const userCurr = selectedCurr.val();
        fromSelect.val(userCurr).change();
        toSelect.val('EUR').change();
        updateConversion(); // Initial conversion display
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error('Failed to fetch currency list:', textStatus, errorThrown);
    }
  });
}

function updateConversion() {
  const fromCurrency = $('#fromCurrency').val();
  const toCurrency = $('#toCurrency').val();
  const amount = $('#fromAmount').val() || 1;

  if (fromCurrency && toCurrency && amount) {
    $.ajax({
      url: 'php/currencies/currencyConverter.php',
      type: 'GET',
      data: {
        amount: amount,
        from: fromCurrency,
        to: toCurrency
      },
      dataType: 'json',
      success: function(response) {
        if (response.convertedAmount) {
          $('#conversionRate').html(`
              ${amount} ${fromCurrency} equals ${response.convertedAmount.toFixed(2)} ${toCurrency}
          `);
          $('#toAmount').val(response.convertedAmount.toFixed(2));
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error('Conversion failed:', textStatus, errorThrown);
      }
    });
  }
}


// Event listeners for inputs and dropdowns
$('#fromCurrency, #toCurrency').on('change', updateConversion);

$('#fromAmount').on('input', function() {
  updateConversion();
});

$('#toAmount').on('input', function() {
  const fromCurrency = $('#fromCurrency').val();
  const toCurrency = $('#toCurrency').val();
  const toValue = parseFloat($('#toAmount').val()) || 0;
  
  if (fromCurrency && toCurrency && toValue) {
    $.ajax({
      url: 'php/currencies/currencyConverter.php',
      type: 'GET',
      data: {
        amount: toValue,
        from: toCurrency,
        to: fromCurrency
      },
      dataType: 'json',
      success: function(response) {
        if (response.convertedAmount) {
          $('#fromAmount').val(response.convertedAmount.toFixed(2));
          $('#conversionRate').html(`
            ${toValue} ${toCurrency} equals ${response.convertedAmount.toFixed(2)} ${fromCurrency}
          `);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error('Conversion failed:', textStatus, errorThrown);
      }
    });
  }
});

// Populate the dropdowns on page load
$('#currencyModal').on('shown.bs.modal', function () {
  populateCurrencyDropdowns();
  updateConversion();
});

// Handle country selection change
$('#hiddenCountrySelected').on('change', function() {
  const updatedCountryCode = $(this).val();
  if (updatedCountryCode) {
    console.log("Updated country code:", updatedCountryCode);
    loadCurrenciesForCountry(updatedCountryCode);
  }
});
