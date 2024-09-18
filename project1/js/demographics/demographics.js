import DemographicsUI from "./ui/ui.js";

// Cache the modal and tabs
const $modal = $('#demographicsModal');
const $tabs = $('#demographicsTabs button[data-bs-toggle="tab"]');

// Populate the demographics modal on page load
$modal.on('shown.bs.modal', function () {
  const countryCode = $('#hiddenCountrySelected').val();
  if (!countryCode) {
    console.log('no country selected');
    return;
  }

  const demographicsUI = new DemographicsUI(countryCode);
  demographicsUI.injectOverviewTab();
  demographicsUI.injectDataForTab('overview');
});

// Populate the tab when tab is clicked
$tabs.on('shown.bs.tab', async function (e) {
  const targetId = $(e.target).attr('data-bs-target');
  const countryCode = $('#hiddenCountrySelected').val();

  if (!countryCode) {
    console.log('no country selected');
    return;
  }

  const demographicsUI = new DemographicsUI(countryCode);
  switch (targetId) {
    case '#populationDemoTab':
      demographicsUI.injectPopulationTab();
      demographicsUI.injectDataForTab('population');
      break;
    case '#healthDemoTab':
      demographicsUI.injectHealthTab();
      demographicsUI.injectDataForTab('health');
      break;
    case '#environmentDemoTab':
      demographicsUI.injectEnvironmentTab();
      demographicsUI.injectDataForTab('environment');
      break;
    case '#economyDemoTab':
      demographicsUI.injectEcomomicTab();
      demographicsUI.injectDataForTab('economy');
      break;
    default:
      break;
  }
});
