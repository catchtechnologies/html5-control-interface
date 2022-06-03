const Types = [
  {
    name: "checkbox",
    description:
      "Checkbox - default implementation with checkboxes and radio buttons",
    events: ["change"],
  },
  {
    name: "mcsa",
    description:
      "Checkbox - special implementation with checkboxes and radio buttons. The elements value gets communicated instead of the element.checked state because multiple elements are assumed to use the same channel. The element communicated is the one that is true.",
    events: ["change"],
  },
  {
    name: "text",
    description: "Text input - default implementation with input type=text",
    events: ["change"],
    // events: ["change", "click", "pointerdown", "pointerup"],
  },
  {
    name: "number",
    description: "Number input - default implementation with input type=number",
    events: ["change"],
  },
  {
    name: "range",
    description: "Range input - default implementation with input type=range",
    events: ["change", "input"], //Remove input to only send a message over the websocket when slider is released.
  },
  {
    name: "select",
    description:
      "Select from multiple predefined options - default implementation with select element",
    events: ["change"],
  },
  {
    name: "button",
    description: "Button - default implementation with button element",
    events: ["click", "pointerdown", "pointerup"],
  },
];

export default Types;
