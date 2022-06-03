export default function loadComponents() {
  return Promise.all([
    loadView("./components/main-view.html", "main-view", MainView),
    loadView("./components/start-modal.html", "start-modal", StartModal),
    loadView("./components/start-view.html", "start-view", StartView),
    loadView(
      "./components/main-view-header.html",
      "main-view-header",
      MainViewHeader
    ),
    loadView(
      "./components/main-view-footer.html",
      "main-view-footer",
      MainViewFooter
    ),
    loadView(
      "./components/main-view-left.html",
      "main-view-left",
      MainViewLeft
    ),
    loadView(
      "./components/vertical-gauge.html",
      "vertical-gauge",
      VerticalGauge
    ),
    loadView(
      "./components/horizontal-gauge.html",
      "horizontal-gauge",
      HorizontalGauge
    ),
    loadView("./components/right-sidebar.html", "right-sidebar", RightSidebar),
    loadView(
      "./components/main-menu-item.html",
      "main-menu-item",
      MainMenuItem
    ),
  ]);
}

function loadView(htmlFilePath, componentName, className) {
  return fetch(htmlFilePath)
    .then((stream) => stream.text())
    .then((text) => {
      className._html = text;
      customElements.define(componentName, className);
    });
}

class MainView extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = MainView._html;
  }
}

class StartModal extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = StartModal._html;
  }
}

class StartView extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = StartView._html;
  }
}

class MainViewHeader extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = MainViewHeader._html;
  }
}

class MainViewFooter extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = MainViewFooter._html;
  }
}

class MainViewLeft extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = MainViewLeft._html;
  }
}

class VerticalGauge extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = VerticalGauge._html;
  }
}

class HorizontalGauge extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = HorizontalGauge._html;
  }
}

class RightSidebar extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = RightSidebar._html;
  }
}

class MainMenuItem extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = searchAndReplace(this, MainMenuItem._html, [
      "icon",
      "text",
      "info-text",
      "info-channel",
      "channel",
      "pointerdown-value",
      "active-channel",
      "active-value",
      "disabled-channel",
      "disabled-value",
      "hidden-channel",
      "hidden-value",
    ]);
  }
}

function searchAndReplace(component, sourceText, replaceTextArray) {
  replaceTextArray.forEach((replaceText) => {
    sourceText = sourceText.replace(
      "{{" + replaceText + "}}",
      component.getAttribute(replaceText) || ""
    );
  });
  return sourceText;
}
