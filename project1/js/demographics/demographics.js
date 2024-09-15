import DemographicsUI from "./ui/ui.js";

// Populate the demographics modal on page load
$('#demographicsModal').on('shown.bs.modal', function () {
  let countryCode = $('#hiddenCountrySelected').val();
  if (!countryCode) {
    console.log('no country selected')
    
  } else {
    const demographicsUI = new DemographicsUI(countryCode);
    demographicsUI.injectOverview();
    demographicsUI.handleCurrentDemographicsUi();
  }
});

// Populate the tab when tab is clicked
$('#demographicsTabs button[data-bs-toggle="tab"]').on('shown.bs.tab', async function (e) {
  const targetId = $(e.target).attr('data-bs-target');
  let countryCode = $('#hiddenCountrySelected').val();
  if (targetId === '#populationDemoTab') {
   const demographicsUI = new DemographicsUI(countryCode);
   demographicsUI.injectChartsForTab(targetId);
   demographicsUI.handleHistoricDemographicsUi('population');
  } else if (targetId === '#healthDemoTab') {
    const demographicsUI = new DemographicsUI(countryCode);
    demographicsUI.injectChartsForTab(targetId);
    demographicsUI.handleHistoricDemographicsUi('health');
  } else if (targetId === '#environmentDemoTab') {
    const demographicsUI = new DemographicsUI(countryCode);
    demographicsUI.injectChartsForTab(targetId);
    demographicsUI.handleHistoricDemographicsUi('environment');
  } else if (targetId === '#economyDemoTab') {
    const demographicsUI = new DemographicsUI(countryCode);
    demographicsUI.injectChartsForTab(targetId);
    demographicsUI.handleHistoricDemographicsUi('economy');
  }

});