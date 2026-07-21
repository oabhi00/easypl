/*
CX-3 - Flight Calculator
Copyright (C) 2013 Aviation Supplies & Academics, Inc.
Ported to javascript by Dean Brestel
*/

/**
 * @file
 * Class for BoundUI.
 */

/**
 * Binds a UI element to this class
 * @ctor
 * Constructor
 * Constructor description.
 * @tparam HTMLElement _ui The element to bind to this class.
 */
function BoundUI(_ui) {
  EventHandler.call(this);
  this.__ui__ = _ui;
}

// BoundUI is a subclass of EventHandler:
BoundUI.inheritsFrom(EventHandler);

/**
 * Description of function.
 * @tparam type name description.
 * @treturn type description.
 */
Object.defineProperty(BoundUI.prototype, "ui", {
  get : function() {return this.__ui__; }
});
