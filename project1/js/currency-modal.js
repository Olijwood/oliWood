

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
  
    // Function to fetch currency data
    const fetchCurrencyData = () => {
      $.ajax({
        url: 'php/cacheCurrencies.php',
        method: 'GET',
        dataType: 'json',
        success: (data) => {
          const currencies = data.currenciesList;
  
          // Populate currency info table
          const tbody = $('#curr-tbody');
          tbody.empty();
          Object.keys(currencies).forEach(currencyCode => {
            const cVals = currencies[currencyCode];
            tbody.append(`
              <tr class="align-middle">
                <td>${cVals.symbol}</td>
                <td>${cVals.name}</td>
                <td>${currencyCode}</td>
              </tr>
            `);
          });
  
          // Populate currency dropdowns
          populateCurrencyDropdowns(currencies);
        },
        error: (xhr, status, error) => {
          console.error('Failed to fetch currency data:', status, error);
        }
      });
    };
  
    // // Function to convert currencies
    // const convertCurrency = (amount, fromCurrency, toCurrency) => {
    //   $.ajax({
    //     url: `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
    //     method: 'GET',
    //     dataType: 'json',
    //     success: (data) => {
    //       const rate = data.rates[toCurrency];
    //       const result = amount * rate;
    //       $('#conversionResult').text(`${amount} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`);
    //     },
    //     error: (xhr, status, error) => {
    //       console.error('Failed to fetch conversion rate:', status, error);
    //     }
    //   });
    // };
  
    // // Event handler for conversion button
    // $('#convertBtn').click(() => {
    //   const amount = parseFloat($('#amountInput').val());
    //   const fromCurrency = $('#fromCurrency').val();
    //   const toCurrency = $('#toCurrency').val();
      
    //   if (!isNaN(amount) && fromCurrency && toCurrency) {
    //     convertCurrency(amount, fromCurrency, toCurrency);
    //   } else {
    //     $('#conversionResult').text('Please enter a valid amount and select currencies.');
    //   }
    // });
  
    // Fetch and populate currency data when modal is shown
    $('#currencyModal').on('shown.bs.modal', () => {
      fetchCurrencyData();
    });
  