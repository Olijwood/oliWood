$(window).on('load', function () {
    if ($('#preloader').length) {
        $('#preloader').delay(1000).fadeOut('slow', function () {
            $(this).remove();
        });
    }
});

$('#btnRunNeighbour').click(function() {
    $.ajax({
        url: 'php/getApiData.php',
        type: 'post',
        dataType: 'json',
        data: {
            country: $('#n-country-code').val(),
            api: 'neighbours'
        },
        success: function(result) {
            if (result.status.name == "ok") {
                let neighbours = result.data.map(item => item.countryName).join('<br>- ');
                $('#resultNeighbours').html(`
                    <p>8 neighbours:<br><br>- ${neighbours}</p>
                `);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#resultNeighbours').html('Error retrieving data.');
        }
    });
});

$('#btnRunNearby').click(function() {
    $.ajax({
        url: 'php/getApiData.php',
        type: 'post',
        dataType: 'json',
        data: {
            lat: $('#nearby-lat').val(),
            lng: $('#nearby-lng').val(),
            api: 'nearbyPop'
        },
        success: function(result) {
            if (result.status.name == "ok") {
                $('#resultNearby').html(`
                    Name: ${result.data[0].name}<br><br>
                    Country: ${result.data[0].countryName}<br><br>
                    Distance (km): ${result.data[0].distance}
                `);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#resultNearby').html('Error retrieving data.');
        }
    });
});

$('#btnRunWeather').click(function() {
    $.ajax({
        url: 'php/getApiData.php',
        type: 'post',
        dataType: 'json',
        data: {
            lat: $('#weather-lat').val(),
            lng: $('#weather-lng').val(),
            api: 'nearbyWeather'
        },
        success: function(result) {
            if (result.status.name == "ok") {
                $('#countryCode').html(`Country Code: ${result.data.countryCode}<br>`)
                $('#station').html(`Weather Station: ${result.data.stationName}<br>`)
                $('#temp').html(`Temperature (Celcius): ${result.data.temperature}<br>`)
                $('#humidity').html(`Humidity: ${result.data.humidity}<br>`)
                $('#clouds').html(`Clouds: ${result.data.clouds}<br>`)
                $('#winSpeed').html(`Wind Speed: ${result.data.windSpeed}<br>`)
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('#resultWeather').html('Error retrieving data.');
        }
    });
});
