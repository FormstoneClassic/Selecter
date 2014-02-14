/* 
 * Selecter v3.0.12 - 2014-02-14 
 * A jQuery plugin for replacing default select elements. Part of the Formstone Library. 
 * http://formstone.it/selecter/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */ 

;(function ($, window) {
	"use strict";

	var guid = 0,
		isFirefox = window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
		isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test( (window.navigator.userAgent||window.navigator.vendor||window.opera) ),
		$body = null;

	/**
	 * @options
	 * @param callback [function] <$.noop> "Select item callback"
	 * @param cover [boolean] <false> "Cover handle with option set"
	 * @param customClass [string] <''> "Class applied to instance"
	 * @param label [string] <''> "Label displayed before selection"
	 * @param external [boolean] <false> "Open options as links in new window"
	 * @param links [boolean] <false> "Open options as links in same window"
	 * @param trim [int] <0> "Trim options to specified length; 0 to disable”
	 */
	var options = {
		callback: $.noop,
		cover: false,
		customClass: "",
		label: "",
		external: false,
		links: false,
		trim: 0
	};

	var pub = {

		/**
		 * @method
		 * @name defaults
		 * @description Sets default plugin options
		 * @param opts [object] <{}> "Options object"
		 * @example $.selecter("defaults", opts);
		 */
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return $(this);
		},

		/**
		 * @method
		 * @name disable
		 * @description Disables target instance or option
		 * @param option [string] <null> "Target option value"
		 * @example $(".target").selecter("disable", "1");
		 */
		disable: function(option) {
			return $(this).each(function(i, input) {
				var data = $(input).next(".selecter").data("selecter");

				if (data) {
					if (typeof option !== "undefined") {
						var index = data.$items.index( data.$items.filter("[data-value=" + option + "]") );

						data.$items.eq(index).addClass("disabled");
						data.$options.eq(index).prop("disabled", true);
					} else {
						if (data.$selecter.hasClass("open")) {
							data.$selecter.find(".selecter-selected").trigger("click.selecter");
						}

						data.$selecter.addClass("disabled");
						data.$select.prop("disabled", true);
					}
				}
			});
		},

		/**
		 * @method
		 * @name enable
		 * @description Enables target instance or option
		 * @param option [string] <null> "Target option value"
		 * @example $(".target").selecter("enable", "1");
		 */
		enable: function(option) {
			return $(this).each(function(i, input) {
				var data = $(input).next(".selecter").data("selecter");

				if (data) {
					if (typeof option !== "undefined") {
						var index = data.$items.index( data.$items.filter("[data-value=" + option + "]") );
						data.$items.eq(index).removeClass("disabled");
						data.$options.eq(index).prop("disabled", false);
					} else {
						data.$selecter.removeClass("disabled");
						data.$select.prop("disabled", false);
					}
				}
			});
		},

		/**
		 * @method
		 * @name destroy
		 * @description Removes instance of plugin
		 * @example $(".target").selecter("destroy");
		 */
		destroy: function() {
			return $(this).each(function(i, input) {
				var data = $(input).next(".selecter").data("selecter");

				if (data) {
					if (data.$selecter.hasClass("open")) {
						data.$selecter.find(".selecter-selected").trigger("click.selecter");
					}

					// Scroller support
					if ($.fn.scroller !== undefined) {
						data.$selecter.find(".selecter-options").scroller("destroy");
					}

					data.$select[0].tabIndex = data.tabIndex;

					data.$select.off(".selecter")
								.removeClass("selecter-element")
								.show();

					data.$selecter.off(".selecter")
								  .remove();
				}
			});
		},

		/**
		* @method
		* @name refresh
		* @description Updates instance base on target options
		* @example $(".target").selecter("refresh");
		*/
		refresh: function() {
			return $(this).each(function(i, input) {
				var data = $(input).next(".selecter").data("selecter");

				if (data) {
					var index = data.index;

					data.$allOptions = data.$select.find("option, optgroup");
					data.$options = data.$allOptions.filter("option");
					data.index = -1;

					index = data.$options.index(data.$options.filter(":selected"));

					_buildOptions(data);

					if (!data.multiple) {
						_update(index, data);
					}
				}
			});
		}
	};

	/**
	 * @method private
	 * @name _init
	 * @description Initializes plugin
	 * @param opts [object] "Initialization options"
	 */
	function _init(opts) {
		// Local options
		opts = $.extend({}, options, opts || {});

		// Check for Body
		if ($body === null) {
			$body = $("body");
		}

		// Apply to each element
		var $items = $(this);
		for (var i = 0, count = $items.length; i < count; i++) {
			_build($items.eq(i), opts);
		}
		return $items;
	}

	/**
	 * @method private
	 * @name _build
	 * @description Builds each instance
	 * @param $select [jQuery object] "Target jQuery object"
	 * @param opts [object] <{}> "Options object"
	 */
	function _build($select, opts) {
		if (!$select.hasClass("selecter-element")) {
			// EXTEND OPTIONS
			opts = $.extend({}, opts, $select.data("selecter-options"));

			if (opts.external) {
				opts.links = true;
			}

			// Build options array
			var $allOptions = $select.find("option, optgroup"),
				$options = $allOptions.filter("option"),
				$originalOption = $options.filter(":selected"),
				originalIndex = ($originalOption.length > 0) ? $options.index($originalOption) : 1,
				wrapperTag = (opts.links) ? "nav" : "div";

			if (opts.label !== "") {
				originalIndex = -1;
			}

			// Swap tab index, no more interacting with the actual select!
			opts.tabIndex = $select[0].tabIndex;
			$select[0].tabIndex = -1;

			opts.multiple = $select.prop("multiple");
			opts.disabled = $select.is(":disabled");

			// Build HTML
			var html = '<' + wrapperTag + ' class="selecter ' + opts.customClass;
			// Special case classes
			if (isMobile) {
				html += ' mobile';
			} else if (opts.cover) {
				html += ' cover';
			}
			if (opts.multiple) {
				html += ' multiple';
			} else {
				html += ' closed';
			}
			if (opts.disabled) {
				html += ' disabled';
			}
			html += '" tabindex="' + opts.tabIndex + '">';
			if (!opts.multiple) {
				html += '<span class="selecter-selected' + ((opts.label !== "") ? ' placeholder' : '') + '">';
				html += $('<span></span').text( _trim(((opts.label !== "") ? opts.label : $originalOption.text()), opts.trim) ).html();
				html += '</span>';
			}
			html += '<div class="selecter-options">';
			html += '</div>';
			html += '</' + wrapperTag + '>';

			// Modify DOM
			$select.addClass("selecter-element")
				   .after(html);

			// Store plugin data
			var $selecter = $select.next(".selecter"),
				data = $.extend({
					$select: $select,
					$allOptions: $allOptions,
					$options: $options,
					$selecter: $selecter,
					$selected: $selecter.find(".selecter-selected"),
					$itemsWrapper: $selecter.find(".selecter-options"),
					index: -1,
					guid: guid++
				}, opts);

			_buildOptions(data);

			if (!data.multiple) {
				_update(originalIndex, data);
			}

			// Scroller support
			if ($.fn.scroller !== undefined) {
				data.$itemsWrapper.scroller();
			}

			// Bind click events
			data.$selecter.on("touchstart.selecter click.selecter", ".selecter-selected", data, _onClick)
						  .on("click.selecter", ".selecter-item", data, _onSelect)
						  .on("close.selecter", data, _onClose)
						  .data("selecter", data);

			// Bind Blur/focus events
			//if ((!data.links && !isMobile) || isMobile) {
				data.$select.on("change.selecter", data, _onChange);

				if (!isMobile) {
					data.$selecter.on("focus.selecter", data, _onFocus)
								  .on("blur.selecter", data, _onBlur);

					// handle clicks to associated labels - not on mobile
					data.$select.on("focus.selecter", data, function(e) {
						e.data.$selecter.trigger("focus");
					});
				}

			//} else {
				// Disable browser focus/blur for jump links
				//data.$select.hide();
			//}
		}
	}

	/**
	 * @method private
	 * @name _buildOptions
	 * @description Builds instance's option set
	 * @param data [object] "Instance data"
	 */
	function _buildOptions(data) {
		var html = '',
			itemTag = (data.links) ? "a" : "span",
			j = 0;

		for (var i = 0, count = data.$allOptions.length; i < count; i++) {
			var $op = data.$allOptions.eq(i);

			// Option group
			if ($op[0].tagName === "OPTGROUP") {
				html += '<span class="selecter-group';
				// Disabled groups
				if ($op.is(":disabled")) {
					html += ' disabled';
				}
				html += '">' + $op.attr("label") + '</span>';
			} else {
				var opVal = $op.val();

				if (!$op.attr("value")) {
					$op.attr("value", opVal);
				}

				html += '<' + itemTag + ' class="selecter-item';
				// Default selected value - now handles multi's thanks to @kuilkoff
				if ($op.is(':selected') && data.label === "") {
					html += ' selected';
				}
				// Disabled options
				if ($op.is(":disabled")) {
					html += ' disabled';
				}
				html += '" ';
				if (data.links) {
					html += 'href="' + opVal + '"';
				} else {
					html += 'data-value="' + opVal + '"';
				}
				html += '>' + $("<span></span>").text( _trim($op.text(), data.trim) ).html() + '</' + itemTag + '>';
				j++;
			}
		}

		data.$itemsWrapper.html(html);
		data.$items = data.$selecter.find(".selecter-item");
	}

	/**
	 * @method private
	 * @name _onClick
	 * @description Handles click to selected item
	 * @param e [object] "Event data"
	 */
	function _onClick(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data;

		if (!data.$select.is(":disabled")) {
			$(".selecter").not(data.$selecter).trigger("close.selecter", [data]);

			// Handle mobile
			if (isMobile) {
				var el = data.$select[0];
				if (window.document.createEvent) { // All
					var evt = window.document.createEvent("MouseEvents");
					evt.initMouseEvent("mousedown", false, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
					el.dispatchEvent(evt);
				} else if (el.fireEvent) { // IE
					el.fireEvent("onmousedown");
				}
			} else {
				// Delegate intent
				if (data.$selecter.hasClass("closed")) {
					_onOpen(e);
				} else if (data.$selecter.hasClass("open")) {
					_onClose(e);
				}
			}
		}
	}

	/**
	 * @method private
	 * @name _onOpen
	 * @description Opens option set
	 * @param e [object] "Event data"
	 */
	function _onOpen(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data;

		// Make sure it's not alerady open
		if (!data.$selecter.hasClass("open")) {
			var offset = data.$selecter.offset(),
				bodyHeight = $body.outerHeight(),
				optionsHeight = data.$itemsWrapper.outerHeight(true),
				selectedOffset = (data.index >= 0) ? data.$items.eq(data.index).position() : { left: 0, top: 0 };

			// Calculate bottom of document
			if (offset.top + optionsHeight > bodyHeight) {
				data.$selecter.addClass("bottom");
			}

			data.$itemsWrapper.show();

			// Bind Events
			data.$selecter.removeClass("closed")
						  .addClass("open");
			$body.on("click.selecter-" + data.guid, ":not(.selecter-options)", data, _onCloseHelper);

			if ($.fn.scroller !== undefined) {
				data.$itemsWrapper.scroller("scroll", (data.$itemsWrapper.find(".scroller-content").scrollTop() + selectedOffset.top), 0)
								  .scroller("reset");
			} else {
				data.$itemsWrapper.scrollTop( data.$itemsWrapper.scrollTop() + selectedOffset.top );
			}
		}
	}

	/**
	 * @method private
	 * @name _onCloseHelper
	 * @description Determines if event target is outside instance before closing
	 * @param e [object] "Event data"
	 */
	function _onCloseHelper(e) {
		e.preventDefault();
		e.stopPropagation();

		if ($(e.currentTarget).parents(".selecter").length === 0) {
			_onClose(e);
		}
	}

	/**
	 * @method private
	 * @name _onClose
	 * @description Closes option set
	 * @param e [object] "Event data"
	 */
	function _onClose(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data;

		// Make sure it's actually open
		if (data.$selecter.hasClass("open")) {
			data.$itemsWrapper.hide();
			data.$selecter.removeClass("open bottom")
						  .addClass("closed");

			$body.off(".selecter-" + data.guid);
		}
	}

	/**
	 * @method private
	 * @name _onSelect
	 * @description Handles option select
	 * @param e [object] "Event data"
	 */
	function _onSelect(e) {
		e.preventDefault();
		e.stopPropagation();

		var $target = $(this),
			data = e.data;

		if (!data.$select.is(":disabled")) {
			if (data.$itemsWrapper.is(":visible")) {
				// Update
				var index = data.$items.index($target);

				if (index !== data.index) {
					_update(index, data);
					_handleChange(data);
				}
			}

			if (!data.multiple) {
				// Clean up
				_onClose(e);
			}
		}
	}

	/**
	 * @method private
	 * @name _onChange
	 * @description Handles external changes
	 * @param e [object] "Event data"
	 */
	function _onChange(e, internal) {
		var $target = $(this),
			data = e.data;

		if (!internal && !data.multiple) {
			var index = data.$options.index(data.$options.filter("[value='" + _escape($target.val()) + "']"));
			_update(index, data);
			_handleChange(data);
		}
	}

	/**
	 * @method private
	 * @name _onFocus
	 * @description Handles instance focus
	 * @param e [object] "Event data"
	 */
	function _onFocus(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data;

		if (!data.$select.is(":disabled") && !data.multiple) {
			data.$selecter.addClass("focus")
						  .on("keydown.selecter" + data.guid, data, _onKeypress);

			$(".selecter").not(data.$selecter)
						  .trigger("close.selecter", [ data ]);
		}
	}

	/**
	 * @method private
	 * @name _onBlur
	 * @description Handles instance focus
	 * @param e [object] "Event data"
	 */
	function _onBlur(e, internal, two) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data;

		data.$selecter.removeClass("focus")
					  .off("keydown.selecter" + data.guid + " keyup.selecter" + data.guid);

		$(".selecter").not(data.$selecter)
					  .trigger("close.selecter", [ data ]);
	}

	/**
	 * @method private
	 * @name _onKeypress
	 * @description Handles instance keypress, once focused
	 * @param e [object] "Event data"
	 */
	function _onKeypress(e) {
		var data = e.data;

		if (e.keyCode === 13) {
			if (data.$selecter.hasClass("open")) {
				_onClose(e);
				_update(data.index, data);
			}
			_handleChange(data);
		} else if (e.keyCode !== 9 && (!e.metaKey && !e.altKey && !e.ctrlKey && !e.shiftKey)) {
			// Ignore modifiers & tabs
			e.preventDefault();
			e.stopPropagation();

			var total = data.$items.length - 1,
				index = (data.index < 0) ? 0 : data.index;

			// Firefox left/right support thanks to Kylemade
			if ($.inArray(e.keyCode, (isFirefox) ? [38, 40, 37, 39] : [38, 40]) > -1) {
				// Increment / decrement using the arrow keys
				index = index + ((e.keyCode === 38 || (isFirefox && e.keyCode === 37)) ? -1 : 1);

				if (index < 0) {
					index = 0;
				}
				if (index > total) {
					index = total;
				}
			} else {
				var input = String.fromCharCode(e.keyCode).toUpperCase(),
					letter,
					i;

				// Search for input from original index
				for (i = data.index + 1; i <= total; i++) {
					letter = data.$options.eq(i).text().charAt(0).toUpperCase();
					if (letter === input) {
						index = i;
						break;
					}
				}

				// If not, start from the beginning
				if (index < 0) {
					for (i = 0; i <= total; i++) {
						letter = data.$options.eq(i).text().charAt(0).toUpperCase();
						if (letter === input) {
							index = i;
							break;
						}
					}
				}
			}

			// Update
			if (index >= 0) {
				_update(index, data);
			}
		}
	}

	/**
	 * @method private
	 * @name _update
	 * @description Updates instance based on new target index
	 * @param index [int] "Selected option index"
	 * @param data [object] "instance data"
	 */
	function _update(index, data) {
		var $item = data.$items.eq(index),
			isSelected = $item.hasClass("selected"),
			isDisabled = $item.hasClass("disabled");

		// Check for disabled options
		if (!isDisabled) {
			// Make sure we have a new index to prevent false 'change' triggers

			if (index === -1 && data.label !== "") {
				data.$selected.html(data.label);
			} else if (!isSelected) {
				var newLabel = $item.html(),
					newValue = $item.data("value");

				// Modify DOM
				if (data.multiple) {
					data.$options.eq(index).prop("selected", true);
				} else {
					data.$selected.html(newLabel)
								  .removeClass('placeholder');
					data.$items.filter(".selected")
							   .removeClass("selected");

					data.$select[0].selectedIndex = index;
				}

				$item.addClass("selected");
			} else if (data.multiple) {
				data.$options.eq(index).prop("selected", null);
				$item.removeClass("selected");
			}

			if (/* !isSelected ||  */ !data.multiple) {
				// Update index
				data.index = index;
			}
		}
	}

	function _handleChange(data) {
		if (data.links) {
			_launch(data);
		} else {
			data.callback.call(data.$selecter, data.$select.val(), data.index);
			data.$select.trigger("change", [ true ]);
		}
	}

	/**
	 * @method private
	 * @name _launch
	 * @description Launches link
	 * @param data [object] "Instance data"
	 */
	function _launch(data) {
		//var url = (isMobile) ? data.$select.val() : data.$options.filter(":selected").attr("href");
		var url = data.$select.val();

		if (data.external) {
			// Open link in a new tab/window
			window.open(url);
		} else {
			// Open link in same tab/window
			window.location.href = url;
		}
	}

	/**
	 * @method private
	 * @name _trim
	 * @description Trims text, if specified length is greater then 0
	 * @param length [int] "Length to trim at"
	 * @param text [string] "Text to trim"
	 * @return [string] "Trimmed string"
	 */
	function _trim(text, length) {
		if (length === 0) {
			return text;
		} else {
			if (text.length > length) {
				return text.substring(0, length) + "...";
			} else {
				return text;
			}
		}
	}

	/**
	 * @method private
	 * @name _escape
	 * @description Escapes text
	 * @param text [string] "Text to escape"
	 */
	function _escape(text) {
		return text.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
	}

	$.fn.selecter = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};

	$.selecter = function(method) {
		if (method === "defaults") {
			pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
		}
	};
})(jQuery, window);