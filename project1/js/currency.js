import { hideCustomOverlays } from './map.js';
import { toTitleCase } from './utils.js';

let selectedCurr = $('#hiddenCurrSelected');

/**
 * Loads currency information for the selected country.
 * @param {string} countryCode - ISO country code of the selected country.
 */
export function loadCurrenciesForCountry(countryCode) {
  $.ajax({
    url: 'php/currencies/getCountryCurrencies.php',
    type: 'GET',
    data: { countryCode },
    dataType: 'json',
    success: function (data) {
      const tbody = $('#curr-tbody');
      tbody.empty();
      $('#currencies').empty();

      if (data && data.currencies && data.currencies.length > 0) {
        const countryCurrencies = data.currencies;

        // Set first currency as selected
        selectedCurr.val(countryCurrencies[0].currencyCode);

        // Populate currencies in modals
        countryCurrencies.forEach(currency => {
          const { symbol: cSymbol, currencyName: cName, currencyCode: cCode } = currency;

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
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Failed to fetch currency data:', textStatus, errorThrown);
    }
  });
}

/**
 * Populates the currency dropdowns with supported currencies.
 */
export function populateCurrencyDropdowns() {
  $.ajax({
    url: 'php/currencies/getSupportedCurrencies.php',
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      if (data && Array.isArray(data)) {
        const fromSelect = $('#fromCurrency');
        const toSelect = $('#toCurrency');
        const defaultCurrencies = ['USD', 'EUR', 'GBP'];

        // Sort currencies and prioritize default ones
        const sortedCurrencies = data.sort(([a], [b]) => {
          if (defaultCurrencies.includes(a) && !defaultCurrencies.includes(b)) return -1;
          if (!defaultCurrencies.includes(a) && defaultCurrencies.includes(b)) return 1;
          return a.localeCompare(b);
        });

        // Populate dropdowns
        sortedCurrencies.forEach(([currencyCode, currencyName]) => {
          const option = new Option(`${currencyCode} - ${currencyName}`, currencyCode);
          fromSelect.append(option);
          toSelect.append(option.cloneNode(true));
        });

        // Set default currency and trigger conversion
        fromSelect.val(selectedCurr.val()).change();
        toSelect.val('USD').change();
        updateConversion();
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Failed to fetch currency list:', textStatus, errorThrown);
    }
  });
}

/**
 * Updates the currency conversion based on the selected currencies and amount.
 */
export function updateConversion() {
  const fromCurrency = $('#fromCurrency').val();
  const toCurrency = $('#toCurrency').val();
  const amount = $('#fromAmount').val() || 1;

  if (fromCurrency && toCurrency && amount) {
    $.ajax({
      url: 'php/currencies/currencyConverter.php',
      type: 'GET',
      data: {
        amount,
        from: fromCurrency,
        to: toCurrency
      },
      dataType: 'json',
      success: function (response) {
        if (response.convertedAmount) {
          $('#conversionRate').html(`${amount} ${fromCurrency} equals ${response.convertedAmount.toFixed(2)} ${toCurrency}`);
          $('#toAmount').val(response.convertedAmount.toFixed(2));
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error('Conversion failed:', textStatus, errorThrown);
      }
    });
  }
}

/**
 * Updates the 'from' amount when the 'to' amount is modified.
 */
$('#toAmount').on('input', function () {
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
      success: function (response) {
        if (response.convertedAmount) {
          $('#fromAmount').val(response.convertedAmount.toFixed(2));
          $('#conversionRate').html(`${toValue} ${toCurrency} equals ${response.convertedAmount.toFixed(2)} ${fromCurrency}`);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error('Conversion failed:', textStatus, errorThrown);
      }
    });
  }
});

/**
 * Event listeners for input and dropdown changes to trigger conversion updates.
 */
$('#fromCurrency, #toCurrency').on('change', updateConversion);
$('#fromAmount').on('input', updateConversion);

/**
 * Closes the currency overlay when the close button is clicked.
 */
$('#cOverlayCloseBtn').on('click', function () {
  $('#currencyOverlay').hide();
});

/**
 * Shows the currency overlay and populates the dropdowns.
 */
export const showCurrencyOverlay = () => {
  hideCustomOverlays();
  $('#currencyOverlay').css('display', 'flex');
  populateCurrencyDropdowns();
  updateConversion();
};