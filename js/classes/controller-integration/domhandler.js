/**
 * Handles DOM manipulation and events
 *
 */

import types from "./control-element-types.js";
import * as Messaging from "./messaging.js";
export default class DomHandler {
  /**
   * .
   * @param {boolean} debug - Prints debug messages to console when true.
   * @param {object} updateCallback - Callback function providing channel and value parameters when a message is received.
   * @param {object} sendMessageCallback - Callback function providing channel and value parameters when a message is sent.
   */
  constructor(debug, updateCallback, sendMessageCallback) {
    this.debug = debug;
    this.updateCallback = updateCallback;
    this.sendMessageCallback = sendMessageCallback;
    this.types = types;
    this.registeredDataChannels = [];
    this.registeredDomElements = [];
    this.#registerAttributes([
      "button-channel",
      "checkbox-channel",
      "mcsa-channel",
      "number-channel",
      "range-channel",
      "select-channel",
      "text-channel",
      "active-channel",
      "disabled-channel",
      "hidden-channel",
      "invisible-channel",
      "inner-html-channel",
      "style-channel",
    ]);
  }

  log(msg) {
    if (this.debug) {
      try {
        console.log("DomHandler: " + msg);
      } catch (e) {}
    }
  }

  #registerAttributes(dataAttributes) {
    if (Array.isArray(dataAttributes)) {
      this.dataAttributes = dataAttributes;
    } else {
      this.dataAttributes = [dataAttributes];
    }
    var result;
    this.dataAttributes.forEach((attribute) => {
      if (!result) {
        result = this.#mapChannels(attribute);
      } else {
        result = this.#mapChannels(
          attribute,
          result.channels,
          result.channelMap,
          result.channelAttributeMap
        );
      }
    });
    this.channelAttributeMap = result.channelAttributeMap;
    this.channelMap = result.channelMap;
    this.log("Found data channels: " + Array.from(result.channels).join(","));
    this.#setEventListeners();
    Messaging.start(result.channels, (channel, value) => {
      handleUpdate(channel, value);
    });
  }

  /**
   * Gets all DOM elements for a channel and creates a new Set and channel map or adds to an existing Set and channel map.
   * @param {string} channel - The channel to query the DOM for.
   * @param {Set} existingChannels - An optional Set of channels to add to.
   * @param {object} existingChannelMap - An optional channel map object to add to.
   * @returns {object} - An object with the channels and channelMap key.
   */
  #mapChannels(
    dataChannelAttribute,
    existingChannels,
    existingChannelMap,
    existingChannelAttributeMap
  ) {
    const result = document.querySelectorAll(`[data-${dataChannelAttribute}]`);
    // This is a Set because we only want to map each channel once and make there are no duplicate event listeners.
    var channels = existingChannels || new Set([]);
    var channelMap = existingChannelMap || [];
    var channelAttributeMap = existingChannelAttributeMap || {};
    result.forEach((element) => {
      const dataChannelValue = element.getAttribute(
        `data-${dataChannelAttribute}`
      );
      channels.add(dataChannelValue);
      const channelMapEntry = {
        attribute: dataChannelAttribute,
        value: dataChannelValue,
      };
      channelMap.push(channelMapEntry);
      if (channelAttributeMap[dataChannelValue]) {
        channelAttributeMap[dataChannelValue].add(dataChannelAttribute);
      } else {
        channelAttributeMap[dataChannelValue] = new Set([dataChannelAttribute]);
      }
    });
    return { channels, channelMap, channelAttributeMap };
  }

  /**
   * Sets event listeners for a Set of channels
   * @param {Set} channels
   */
  #setEventListeners() {
    this.channelMap.forEach((mappedChannel) => {
      if (
        !this.registeredDataChannels ||
        !this.registeredDataChannels.includes(mappedChannel.value)
      )
        this.#setEventListerForChannel(
          mappedChannel.attribute,
          mappedChannel.value
        );
    });
  }

  /**
   * Sets event listeners for a single channel
   * @param {string} - the channel
   */
  #setEventListerForChannel(dataChannelAttribute, channel) {
    if (!dataChannelAttribute || !channel) {
      return;
    }
    const elements = Array.from(
      document.querySelectorAll(`[data-${dataChannelAttribute}="${channel}"]`)
    );

    elements.forEach((element) => {
      // Register each element only once.
      if (this.registeredDomElements.includes(element)) {
        return;
      }
      this.registeredDomElements.push(element);

      // Get the input type and its options.
      const elementType = dataChannelAttribute.substring(
        0,
        dataChannelAttribute.indexOf("-")
      );
      const dataTypeOptions = this.types.find(
        (type) => type.name === elementType
      );

      // Ignore attribute types.
      if (!dataTypeOptions || !dataTypeOptions.events) {
        return;
      }

      // Set an event listener for each event type.
      dataTypeOptions.events.forEach((channelEvent) => {
        try {
          // Only set a listener if the element has a channel defined for this event. Applies only to button inputs.
          if (
            !this.#checkEventValues(elementType, channelEvent, element.dataset)
          ) {
            return;
          }

          // Keep track of channels that have an event listener added.
          this.registeredDataChannels.push(channel);

          // Add an event listener for the element.
          element.addEventListener(channelEvent, (event) => {
            // The element's value is used for most element types.
            let value = element.value;

            // Handle elements that do not use element.value.
            switch (elementType) {
              case "button":
                value = this.#getButtonEventValue(event);
                break;
              case "checkbox":
                value = element.checked;
                break;
              case "mcsa":
                //Send the element's value if one is defined.
                if (value) {
                  break;
                }
                //Otherwise, send the 'checked' value.
                value = element.checked;
                break;
            }

            this.log(
              elementType +
                " " +
                event.type +
                " event recieved for " +
                dataChannelAttribute +
                "=" +
                channel +
                " with value: " +
                value
            );

            // Publish the channel and value to the messaging bus.
            this.sendMessageCallback(channel, value);
            Messaging.update(channel, value);
          });
        } catch (e) {
          console.log(e);
        }
      });
    });
  }

  /**
   * Checks to see if an html element has a data-EVENT-value property defined for the given event.
   * Only applies to input types with multiple events to prevent unused events from triggering.
   *
   * @param {string} dataType - The element type as defined by the data-type attribute.
   * @param {string} channelEvent - The event to check if there is a value for.
   * @param {object} dataset - The html element's data attibutes.
   * @returns {boolean} - True if there is a value defined for the event, false if there is not. Defaults to true.
   */
  #checkEventValues(dataType, channelEvent, dataset) {
    switch (dataType) {
      case "button":
        if (channelEvent === "click" && !dataset.clickValue) {
          return false;
        }
        if (channelEvent === "pointerdown" && !dataset.pointerdownValue) {
          return false;
        }
        if (channelEvent === "pointerup" && !dataset.pointerupValue) {
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  #getButtonEventValue(event) {
    let value;
    switch (event.type) {
      case "click":
        value = event.currentTarget.dataset.clickValue;
        break;
      case "pointerdown":
        value = event.currentTarget.dataset.pointerdownValue;
        break;
      case "pointerup":
        value = event.currentTarget.dataset.pointerupValue;
        break;
      default:
        break;
    }
    return value;
  }

  /**
   * Updates the DOM elements related to a single channel.
   *
   * @param {string} channel - the channel id
   * @param {object} value - the value to assign to the element's attribute
   */
  handleUpdate(channel, value) {
    this.log(
      "handleUpdate on channel: " +
        channel +
        " with value: " +
        JSON.stringify(value)
    );
    this.updateCallback(channel, value);
    if (!this.channelAttributeMap[channel]) {
      this.log("Cannot handle update. " + channel + " not registered.");
      return;
    }
    //Get all elements that contain the channel in their data-* property of one of the data attributes registered in start().
    var elements = [];
    this.channelAttributeMap[channel].forEach((dataChannelAttribute) => {
      console.log(
        "getting elements for dataChannelAttribute: " + dataChannelAttribute
      );
      const elements = Array.from(
        document.querySelectorAll(`[data-${dataChannelAttribute}="${channel}"]`)
      );

      elements.forEach((element) => {
        switch (dataChannelAttribute) {
          case "button-channel":
            break;
          case "checkbox-channel":
            if (element.value) {
              element.setAttribute("checked", true);
            } else {
              element.removeAttribute("checked");
            }
            break;
          case "mcsa-channel":
            if (element.value === value) {
              element.setAttribute("checked", true);
            } else {
              element.removeAttribute("checked");
            }
            break;
          case "number-channel":
            element.value = value;
            break;
          case "range-channel":
            element.value = value;
            break;
          case "select-channel":
            element.value = value;
            break;
          case "text-channel":
            element.value = value;
            break;

          case "active-channel":
            if (element.dataset["activeValue"] === value) {
              element.classList.add("active");
            } else {
              element.classList.remove("active");
            }
            break;
          case "disabled-channel":
            if (element.dataset["disabledValue"] === value) {
              element.setAttribute("disabled", true);
            } else {
              element.removeAttribute("disabled");
            }
            break;
          case "hidden-channel":
            if (element.dataset["hiddenValue"] === value) {
              element.setAttribute("hidden", true);
              element.classList.add("hidden");
            } else {
              element.removeAttribute("hidden");
              element.classList.remove("hidden");
            }
          case "invisible-channel":
            if (element.dataset["invisibleValue"] === value) {
              element.classList.add("invisible");
            } else {
              element.classList.remove("invisible");
            }
            break;
          case "inner-html-channel":
            element.innerHTML = value;
            break;
          case "style-channel":
            try {
              const valueObject = JSON.parse(value);
              const keys = Object.keys(valueObject);
              keys.forEach((key) => {
                element.style[key] = valueObject[key];
              });
            } catch (e) {
              this.log("Error parsing style value object: " + e);
            }
            break;
        }
      });
    });
  }
}
