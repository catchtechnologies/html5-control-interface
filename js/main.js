import Modal from "./classes/modal.js";
import loadComponents from "./components.js";
import Gauge from "./classes/gauge.js";
import DomHandler from "./classes/controller-integration/domhandler.js";

const debug = false;

document.addEventListener("DOMContentLoaded", () => {
  loadComponents().then(() => {
    start();
  });
});

function start() {
  try {
    /*** Volume Gauge ***/

    const volumeGauge = new Gauge(
      true,
      "volume-up",
      "volume-down",
      "volume-mute",
      "horizontal",
      "volume-gauge"
    );

    /***  DOM Handler ***/

    const domHandler = new DomHandler(
      debug,
      (channel, value) => {
        console.log(
          "Received from server channel: " + channel + " and value: " + value
        );
        // Handle update messages with custom Javascript.
        switch (channel) {
          case "system.state":
            if (value === "started") {
              powerOnComplete();
            } else if (value === "stopped") {
              powerOffComplete();
            } else if (value === "starting") {
              powerOnInProgess();
            }
            return;
          case "volume.level":
            volumeGauge.set(value);
            return;
          default:
            return;
        }
      },
      (channel, value) => {
        console.log(
          "Sending to server channel: " + channel + " and value: " + value
        );
      }
    );

    /***  View Management ***/

    var startBtn = document.getElementById("start");
    var startModal = new Modal(document.getElementById("startModal"));
    var startProgressBar = document.getElementById("startProgress");
    var startView = document.getElementById("startView");
    var mainView = document.getElementById("mainView");
    var endBtn = document.getElementById("end");

    // Default to start view.
    powerOffComplete();

    //TODO: Remove startup emulation. Update progess bar and close the modal with feedback from the server.
    startBtn.onpointerdown = () => {
      startupProgress();
    };

    function startupProgress() {
      console.log("Starting System...");
      startModal.show();

      var value = 0;
      updateStartProgressBar(value);
      var updateStartProgressBarInterval = setInterval(() => {
        value = value + 1;
        updateStartProgressBar(value);
      }, 10);
      setTimeout(() => {
        clearInterval(updateStartProgressBarInterval);
        powerOnComplete();
      }, 5000);
    }

    function updateStartProgressBar(value) {
      startProgressBar.value = value;
    }

    function powerOnComplete() {
      startModal.hide();
      startView.style.display = "none";
      mainView.style.display = "flex";
    }

    function powerOffComplete() {
      startModal.hide();
      startView.style.display = "flex";
      mainView.style.display = "none";
    }

    function powerOnInProgess() {
      startupProgress();
    }

    endBtn.onpointerdown = () => {
      startView.style.display = "flex";
      mainView.style.display = "none";
    };

    /*** Time & Date ***/

    clock();

    /* Right Sidebar */

    var rigthSidebarToggleBtn = document.getElementById("right-sidebar-toggle");
    rigthSidebarToggleBtn.onpointerdown = () => {
      rightSidebarToggle(rigthSidebarToggleBtn);
    };

    // Emulate updates from server.
    // domHandler.handleUpdate("av.source.selected", "1");
    // domHandler.handleUpdate("volume.level", "77");
    // domHandler.handleUpdate("lights.state", "off");
    // domHandler.handleUpdate("system.state", "starting");
  } catch (e) {
    console.log(e);
  }
}

function clock() {
  document.getElementById("date-and-time").innerHTML = currentDateAndTime();
  setInterval(() => {
    document.getElementById("date-and-time").innerHTML = currentDateAndTime();
  }, 6000);
}

function currentDateAndTime() {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = new Date().toLocaleTimeString("en-US", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
  });
  return date + " " + time;
}

function rightSidebarToggle(rigthSidebarToggleBtn) {
  var rightSidebar = document.getElementById("right-sidebar");
  if (rightSidebar.classList.contains("active")) {
    rigthSidebarToggleBtn.classList.remove("active");
    rightSidebar.classList.remove("active");
    return;
  }

  rigthSidebarToggleBtn.classList.add("active");
  setTimeout(() => {
    rightSidebar.classList.add("active");
  }, 1);
}
