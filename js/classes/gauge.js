export default class Gauge {
  constructor(
    debug,
    increaseBtnId,
    decreaseBtnId,
    muteBtnId,
    orientation,
    gaugeId
  ) {
    this.debug = debug;
    this.increaseBtn = document.getElementById(increaseBtnId);
    this.decreaseBtn = document.getElementById(decreaseBtnId);
    this.muteBtn = document.getElementById(muteBtnId);
    this.orientation = orientation; // either "horizontal" or "vertical"
    this.gaugeId = gaugeId;
    const gauge = document.getElementById(this.gaugeId);
    if (this.orientation === "vertical") {
      this.indicator = gauge.querySelector(".vertical-gauge-level");
    } else {
      this.indicator = gauge.querySelector(".horizontal-gauge-level");
    }
    this.indicator.style.opacity = 1;

    this.level = 0;
    this.muted = false;
    this.rampTime = 50;

    this.increaseBtn.onpointerdown = () => {
      this.rampUpStart();
    };
    this.increaseBtn.onpointerup = () => {
      this.rampStop();
    };
    this.decreaseBtn.onpointerdown = () => {
      this.rampDownStart();
    };
    this.decreaseBtn.onpointerup = () => {
      this.rampStop();
    };
    this.muteBtn.onpointerdown = () => {
      this.muteToggle();
    };
  }

  log(msg) {
    if (this.debug) {
      console.log("Gauge with id " + this.gaugeId + ": " + msg);
    }
  }

  test() {
    this.log("testing " + this.gaugeId);
    this.level = 0;
    if (this.orientation === "vertical") {
      this.indicator.style.height = this.level + "%";
    } else {
      this.indicator.style.width = this.level + "%";
    }
    var interval = setInterval(() => {
      if (this.level < 100) {
        this.level = this.level + 1;
      } else {
        this.set(55);
        clearInterval(interval);
      }
      if (this.orientation === "vertical") {
        this.indicator.style.height = this.level + "%";
      } else {
        this.indicator.style.width = this.level + "%";
      }
    }, this.rampTime);
  }

  set(level) {
    this.log("setting vertical to " + level);
    if (this.orientation === "vertical") {
      this.log("setting vertical to " + level);
      this.indicator.style.height = level + "%";
    } else {
      this.log("setting horizontal to " + level);
      this.indicator.style.width = level + "%";
    }
    this.level = level;
  }

  increment(step) {
    if (this.level < 100) {
      this.muteOff();
      this.level = this.level + step;
      this.set(this.level);
      return;
    }
    clearInterval(this.rampInterval);
  }

  decrement(step) {
    if (this.level > 0) {
      this.muteOff();
      this.level = this.level - step;
      this.set(this.level);
      return;
    }
    clearInterval(this.rampInterval);
  }

  muteOn() {
    this.log("mute on");
    if (this.orientation === "vertical") {
      this.indicator.style.height = "0%";
    } else {
      this.indicator.style.width = "0%";
    }
    this.muted = true;
    this.muteBtn.classList.add("active");
  }

  muteOff() {
    this.log("mute off");
    if (this.orientation === "vertical") {
      this.indicator.style.height = this.level + "%";
    } else {
      this.indicator.style.width = this.level + "%";
    }
    this.muted = false;
    this.muteBtn.classList.remove("active");
  }

  muteToggle() {
    this.log("mute toggle from current mute state: " + this.muted);
    if (this.muted) {
      this.muteOff();
      return;
    }
    this.muteOn();
  }

  rampUpStart() {
    this.log("rampUpStart");
    clearInterval(this.rampInterval);
    this.increment(2);
    this.rampInterval = setInterval(() => {
      this.increment(2);
    }, this.rampTime);
  }

  rampDownStart() {
    this.log("rampDownStart");
    clearInterval(this.rampInterval);
    this.decrement(2);
    this.rampInterval = setInterval(() => {
      this.decrement(2);
    }, this.rampTime);
  }

  rampStop() {
    this.log("rampStop");
    clearInterval(this.rampInterval);
  }
}
