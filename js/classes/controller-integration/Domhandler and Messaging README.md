# webui-messaging

Connects HTML elements to a channel/value messaging system.

## Usage

- Add lib folder to your html project.
- Add the following references to the end of HTML body:  
  `<script src="lib/domhandler.js" type="module"></script>`  
  `<link type="text/css" rel="stylesheet" href="/lib/domhandler.css" />`
  `<script src="lib/messaging.js" type="module"></script>`
- Add the desired `data-` tags to your HTML elements.

## Example

```Javascript
import DomHandler from "./domhandler.js";
const debug = true;
const domHandler = new DomHandler(debug);

domHandler.handleUpdate("matrix.input", { active: "2" });
domHandler.handleUpdate("matrix.input.2.disable", { disabled: "disable" });
domHandler.handleUpdate("matrix.input.2.info", { innerHTML: "Not Connected" });
```

```HTML
<button
  data-button-channel="matrix.input"
  data-pointerdown-value="2"
  data-active-value="2"
  data-channel-2="matrix.input.2.disable"
  data-disabled-value="disable"
>
  <div>
    <p>Input 2</p>
    <p data-channel="matrix.input.2.info" data-type="text"></p>
  </div>
</button>
```

## Data Attributes

Any data attribute name can be registered by passing an array of the attribute (without the `data-` prefix) into the `registerAttributes` function. The domhandler scans the HTML for all elements containing the data attribute names and registers the values of the found data attributes as channels to be used for monitoring and updating the HTML elements.

In the above Javascript example, a data attribute called `data-channel` and one called `data-channel-2` are registered.

In the HTML part of the example the button is registered on two channels: `data-channel` and `data-channel-2`. Any value defined in the HTML and passed into either channel will update the button.

This allows developers to groups HTML elements together with one data attribute and use another data attribute to communicate directly with a single element that is part of a group. Or include elements in multiple groups.

## HTML Element Types

`data-type`  
The type of HTML element. Supported types are:

- `text`
  - A text field.
- `number`
  - A number field.
- `range`
  - A range slider.
- `checkbox`
  - A checkbox or radio button.
- `mcsa`
  - Mulitple choice, single answer. A checkbox or radio button that shares the same channel with other elements. Only one can be true.
- `select`
  - Dropdown select.
- `button`
  - A button.

## HTML Element Updates

### Active State

`data-active-value`

Adds the `active` class to the element if the values match and removes the `active` class to the element if the values do not match.

#### Example

```HTML
<button data-active-value="pressed" class="btn btn-primary">Active/Inactive Button</button>
```

### Enable/Disable

`data-disabled-value`

Disables the element with the `disabled` attribute if the values match and removes the `disabled` attribute of the element if the values do not match.

In this example, receiving the value `disable` on channel `building1.room1` will disable the element. Any other value enables the element.

#### Example

```HTML
<div data-channel="building1.room1" data-disabled-value="disable" >Something to disable.</div>
```

### Visible/Invisible

Add the following css to your project to add and remove an element's visbility. Or import the included `domhandler.css` file into your project.

```css
.visible {
  display: none;
}
```

#### Visible

`data-visible-value`

Adds the `visible` class to the element if the values match and removes the `visible` class to the element if the values do not match.

#### Example

```HTML
<div data-channel="building1.room1" data-visible-value="visible" >Something to show.</div>
```

#### Invisible

`data-invisible-value`

removes the `visible` class to the element if the values match and adds the `visible` class to the element if the values do not match.

#### Example

```HTML
<div data-channel="building1.room1" data-invisible-value="invisible" >Something to hide.</div>
```

## General Updates

### Inner HTML

The inner HTML text of an element can be updated by sending an update with the property `inner-html` to any channel.

#### Example

```HTML
<div data-channel="building1.room1" >This is the inner HTML that would get updated.</div>
```

### Button Events

`data-click-value`  
`data-pointerdown-value`  
`data-pointerup-value`

Defines the values to send on the defined event. In this example, the value `press` is sent on channel `building1.room1.button` when the button is pressed and `release` is sent when released.

#### Example

```HTML
<button data-channel="building1.room1.button" data-pointerdown-value="press"  data-pointerup-value="release" class="btn btn-primary">Button 1</button>
```
