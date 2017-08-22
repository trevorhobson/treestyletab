/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

function init() {
  window.addEventListener('unload', destroy, { once: true });
  gAllTabs = document.getElementById('all-tabs');
  gAllTabs.addEventListener('mousedown', omMouseDown);
  rebuildAll();
}

function destroy() {
  endObserveTabs();
  gAllTabs.removeEventListener('mousedown', omMouseDown);
  gAllTabs = undefined;
}

function rebuildAll() {
  browser.tabs.query({ currentWindow: true }).then(aTabs => {
    gTargetWindow = aTabs[0].windowId;
    clearAllTabsContainers();
    var container = buildTabsContainerFor(gTargetWindow);
    for (let tab of aTabs) {
      container.appendChild(buildTab(tab));
    }
    gAllTabs.appendChild(container);
    inheritTreeStructure();
    startObserveTabs();
  });
}

function inheritTreeStructure() {
  browser.runtime.sendMessage({
    type:     kCOMMAND_REQUEST_TREE_INFO,
    windowId: gTargetWindow
  }).then(aResponse => {
    log('response: ', aResponse);
    for (let tabInfo of aResponse.tabs) {
      let tab = findTabById(tabInfo.id);
      if (tabInfo.parent)
        tab.setAttribute(kPARENT, tabInfo.parent);
      tab.setAttribute(kCHILDREN, tabInfo.children);
    }
    updateTabsIndent(getAllRootTabs(gTargetWindow), 0);
  });
}

window.addEventListener('DOMContentLoaded', init, { once: true });