/*!
 * Client Side Validations JS - v0.4.0 (https://github.com/DavyJonesLocker/client_side_validations)
 * Copyright (c) 2024 Geremia Taglialatela, Brian Cardarella
 * Licensed under MIT (https://opensource.org/licenses/mit-license.php)
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define(['jquery'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ClientSideValidations = factory(global.jQuery));
})(this, (function (jQuery) { 'use strict';

  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }

  var arrayHasValue = function arrayHasValue(value, otherValues) {
    for (var i = 0, l = otherValues.length; i < l; i++) {
      if (value === otherValues[i]) {
        return true;
      }
    }
    return false;
  };
  var createElementFromHTML = function createElementFromHTML(html) {
    var element = document.createElement('div');
    element.innerHTML = html;
    return element.firstChild;
  };
  var isValuePresent = function isValuePresent(value) {
    return !/^\s*$/.test(value || '');
  };

  var ClientSideValidations = {
    callbacks: {
      element: {
        after: function after($element, eventData) {},
        before: function before($element, eventData) {},
        fail: function fail($element, message, addError, eventData) {
          return addError();
        },
        pass: function pass($element, removeError, eventData) {
          return removeError();
        }
      },
      form: {
        after: function after($form, eventData) {},
        before: function before($form, eventData) {},
        fail: function fail($form, eventData) {},
        pass: function pass($form, eventData) {}
      }
    },
    eventsToBind: {
      form: function form(_form, $form) {
        return {
          'submit.ClientSideValidations': function submitClientSideValidations(eventData) {
            if (!$form.isValid(_form.ClientSideValidations.settings.validators)) {
              eventData.preventDefault();
              eventData.stopImmediatePropagation();
            }
          },
          'ajax:beforeSend.ClientSideValidations': function ajaxBeforeSendClientSideValidations(eventData) {
            if (eventData.target === this) {
              $form.isValid(_form.ClientSideValidations.settings.validators);
            }
          },
          'form:validate:after.ClientSideValidations': function formValidateAfterClientSideValidations(eventData) {
            ClientSideValidations.callbacks.form.after($form, eventData);
          },
          'form:validate:before.ClientSideValidations': function formValidateBeforeClientSideValidations(eventData) {
            ClientSideValidations.callbacks.form.before($form, eventData);
          },
          'form:validate:fail.ClientSideValidations': function formValidateFailClientSideValidations(eventData) {
            ClientSideValidations.callbacks.form.fail($form, eventData);
          },
          'form:validate:pass.ClientSideValidations': function formValidatePassClientSideValidations(eventData) {
            ClientSideValidations.callbacks.form.pass($form, eventData);
          }
        };
      },
      input: function input(form) {
        return {
          'focusout.ClientSideValidations': function focusoutClientSideValidations() {
            jQuery(this).isValid(form.ClientSideValidations.settings.validators);
          },
          'change.ClientSideValidations': function changeClientSideValidations() {
            jQuery(this).data('changed', true);
          },
          'element:validate:after.ClientSideValidations': function elementValidateAfterClientSideValidations(eventData) {
            ClientSideValidations.callbacks.element.after(jQuery(this), eventData);
          },
          'element:validate:before.ClientSideValidations': function elementValidateBeforeClientSideValidations(eventData) {
            ClientSideValidations.callbacks.element.before(jQuery(this), eventData);
          },
          'element:validate:fail.ClientSideValidations': function elementValidateFailClientSideValidations(eventData, message) {
            var $element = jQuery(this);
            ClientSideValidations.callbacks.element.fail($element, message, function () {
              form.ClientSideValidations.addError($element, message);
            }, eventData);
          },
          'element:validate:pass.ClientSideValidations': function elementValidatePassClientSideValidations(eventData) {
            var $element = jQuery(this);
            ClientSideValidations.callbacks.element.pass($element, function () {
              form.ClientSideValidations.removeError($element);
            }, eventData);
          }
        };
      },
      inputConfirmation: function inputConfirmation($element, form) {
        return {
          'focusout.ClientSideValidations': function focusoutClientSideValidations() {
            $element.data('changed', true).isValid(form.ClientSideValidations.settings.validators);
          },
          'keyup.ClientSideValidations': function keyupClientSideValidations() {
            $element.data('changed', true).isValid(form.ClientSideValidations.settings.validators);
          }
        };
      }
    },
    enablers: {
      form: function form(_form2) {
        var $form = jQuery(_form2);
        _form2.ClientSideValidations = {
          settings: JSON.parse(_form2.dataset.clientSideValidations),
          addError: function addError($element, message) {
            return ClientSideValidations.formBuilders[_form2.ClientSideValidations.settings.html_settings.type].add($element, _form2.ClientSideValidations.settings.html_settings, message);
          },
          removeError: function removeError($element) {
            return ClientSideValidations.formBuilders[_form2.ClientSideValidations.settings.html_settings.type].remove($element, _form2.ClientSideValidations.settings.html_settings);
          }
        };
        var eventsToBind = ClientSideValidations.eventsToBind.form(_form2, $form);
        for (var eventName in eventsToBind) {
          var eventFunction = eventsToBind[eventName];
          $form.on(eventName, eventFunction);
        }
        $form.find(ClientSideValidations.selectors.inputs).each(function () {
          ClientSideValidations.enablers.input(this);
        });
      },
      input: function input(_input) {
        var $input = jQuery(_input);
        var form = _input.form;
        var $form = jQuery(form);
        var eventsToBind = ClientSideValidations.eventsToBind.input(form);
        for (var eventName in eventsToBind) {
          var eventFunction = eventsToBind[eventName];
          $input.filter(':not(:radio):not([id$=_confirmation])').each(function () {
            jQuery(this).attr('data-validate', true);
          }).on(eventName, eventFunction);
        }
        $input.filter(':checkbox').on('change.ClientSideValidations', function () {
          jQuery(this).isValid(form.ClientSideValidations.settings.validators);
        });
        $input.filter('[id$=_confirmation]').each(function () {
          var $element = jQuery(this);
          var $elementToConfirm = $form.find("#".concat(this.id.match(/(.+)_confirmation/)[1], ":input"));
          if ($elementToConfirm.length) {
            var _eventsToBind = ClientSideValidations.eventsToBind.inputConfirmation($elementToConfirm, form);
            for (var _eventName in _eventsToBind) {
              var _eventFunction = _eventsToBind[_eventName];
              jQuery("#".concat($element.attr('id'))).on(_eventName, _eventFunction);
            }
          }
        });
      }
    },
    formBuilders: {
      'ActionView::Helpers::FormBuilder': {
        add: function add($element, settings, message) {
          var element = $element[0];
          var form = element.form;
          var inputErrorTemplate = createElementFromHTML(settings.input_tag);
          var inputErrorElement = element.closest(".".concat(inputErrorTemplate.getAttribute('class').replace(/ /g, '.')));
          if (!inputErrorElement) {
            inputErrorElement = inputErrorTemplate;
            if (element.getAttribute('autofocus')) {
              element.setAttribute('autofocus', false);
            }
            element.before(inputErrorElement);
            inputErrorElement.querySelector('span#input_tag').replaceWith(element);
            var inputErrorLabelMessageElement = inputErrorElement.querySelector('label.message');
            if (inputErrorLabelMessageElement) {
              inputErrorLabelMessageElement.setAttribute('for', element.id);
            }
          }
          var labelElement = form.querySelector("label[for=\"".concat(element.id, "\"]:not(.message)"));
          if (labelElement) {
            var labelErrorTemplate = createElementFromHTML(settings.label_tag);
            var labelErrorContainer = labelElement.closest(".".concat(labelErrorTemplate.getAttribute('class').replace(/ /g, '.')));
            if (!labelErrorContainer) {
              labelElement.after(labelErrorTemplate);
              labelErrorTemplate.querySelector('label#label_tag').replaceWith(labelElement);
            }
          }
          var labelMessageElement = form.querySelector("label.message[for=\"".concat(element.id, "\"]"));
          if (labelMessageElement) {
            labelMessageElement.textContent = message;
          }
        },
        remove: function remove($element, settings) {
          var element = $element[0];
          var form = element.form;
          var inputErrorClass = createElementFromHTML(settings.input_tag).getAttribute('class');
          var inputErrorElement = element.closest(".".concat(inputErrorClass.replace(/ /g, '.')));
          if (inputErrorElement) {
            inputErrorElement.querySelector("#".concat(element.id)).remove();
            inputErrorElement.replaceWith(element);
          }
          var labelElement = form.querySelector("label[for=\"".concat(element.id, "\"]:not(.message)"));
          if (labelElement) {
            var labelErrorClass = createElementFromHTML(settings.label_tag).getAttribute('class');
            var labelErrorElement = labelElement.closest(".".concat(labelErrorClass.replace(/ /g, '.')));
            if (labelErrorElement) {
              labelErrorElement.replaceWith(labelElement);
            }
          }
          var labelMessageElement = form.querySelector("label.message[for=\"".concat(element.id, "\"]"));
          if (labelMessageElement) {
            labelMessageElement.remove();
          }
        }
      }
    },
    patterns: {
      numericality: {
        default: /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/,
        only_integer: /^[+-]?\d+$/
      }
    },
    selectors: {
      inputs: ':input:not(button):not([type="submit"])[name]:visible:enabled',
      validate_inputs: ':input:enabled:visible[data-validate]',
      forms: 'form[data-client-side-validations]'
    },
    validators: {
      all: function all() {
        return jQuery.extend({}, ClientSideValidations.validators.local, ClientSideValidations.validators.remote);
      },
      local: {},
      remote: {}
    },
    disable: function disable(target) {
      var $target = jQuery(target);
      $target.off('.ClientSideValidations');
      if ($target.is('form')) {
        ClientSideValidations.disable($target.find(':input'));
      } else {
        $target.removeData(['changed', 'valid']);
        $target.filter(':input').each(function () {
          jQuery(this).removeAttr('data-validate');
        });
      }
    },
    reset: function reset(form) {
      var $form = jQuery(form);
      ClientSideValidations.disable(form);
      for (var key in form.ClientSideValidations.settings.validators) {
        form.ClientSideValidations.removeError($form.find("[name=\"".concat(key, "\"]")));
      }
      ClientSideValidations.enablers.form(form);
    },
    initializeOnEvent: function initializeOnEvent() {
      if (window.Turbo != null) {
        return 'turbo:load';
      } else if (window.Turbolinks != null && window.Turbolinks.supported) {
        return window.Turbolinks.EVENTS != null ? 'page:change' : 'turbolinks:load';
      }
    },
    start: function start() {
      var initializeOnEvent = ClientSideValidations.initializeOnEvent();
      if (initializeOnEvent != null) {
        jQuery(document).on(initializeOnEvent, function () {
          return jQuery(ClientSideValidations.selectors.forms).validate();
        });
      } else {
        jQuery(function () {
          return jQuery(ClientSideValidations.selectors.forms).validate();
        });
      }
    }
  };

  var absenceLocalValidator = function absenceLocalValidator($element, options) {
    var element = $element[0];
    if (isValuePresent(element.value)) {
      return options.message;
    }
  };
  var presenceLocalValidator = function presenceLocalValidator($element, options) {
    var element = $element[0];
    if (!isValuePresent(element.value)) {
      return options.message;
    }
  };

  var DEFAULT_ACCEPT_OPTION = ['1', true];
  var isTextAccepted = function isTextAccepted(value, acceptOption) {
    if (!acceptOption) {
      acceptOption = DEFAULT_ACCEPT_OPTION;
    }
    if (Array.isArray(acceptOption)) {
      return arrayHasValue(value, acceptOption);
    }
    return value === acceptOption;
  };
  var acceptanceLocalValidator = function acceptanceLocalValidator($element, options) {
    var element = $element[0];
    var valid = true;
    if (element.type === 'checkbox') {
      valid = element.checked;
    }
    if (element.type === 'text') {
      valid = isTextAccepted(element.value, options.accept);
    }
    if (!valid) {
      return options.message;
    }
  };

  var isMatching = function isMatching(value, regExpOptions) {
    return new RegExp(regExpOptions.source, regExpOptions.options).test(value);
  };
  var hasValidFormat = function hasValidFormat(value, withOptions, withoutOptions) {
    return withOptions && isMatching(value, withOptions) || withoutOptions && !isMatching(value, withoutOptions);
  };
  var formatLocalValidator = function formatLocalValidator($element, options) {
    var element = $element[0];
    var value = element.value;
    if (options.allow_blank && !isValuePresent(value)) {
      return;
    }
    if (!hasValidFormat(value, options.with, options.without)) {
      return options.message;
    }
  };

  var VALIDATIONS$1 = {
    even: function even(a) {
      return parseInt(a, 10) % 2 === 0;
    },
    greater_than: function greater_than(a, b) {
      return parseFloat(a) > parseFloat(b);
    },
    greater_than_or_equal_to: function greater_than_or_equal_to(a, b) {
      return parseFloat(a) >= parseFloat(b);
    },
    equal_to: function equal_to(a, b) {
      return parseFloat(a) === parseFloat(b);
    },
    less_than: function less_than(a, b) {
      return parseFloat(a) < parseFloat(b);
    },
    less_than_or_equal_to: function less_than_or_equal_to(a, b) {
      return parseFloat(a) <= parseFloat(b);
    },
    odd: function odd(a) {
      return parseInt(a, 10) % 2 === 1;
    },
    other_than: function other_than(a, b) {
      return parseFloat(a) !== parseFloat(b);
    }
  };
  var formatValue = function formatValue(element) {
    var value = element.value || '';
    var numberFormat = element.form.ClientSideValidations.settings.number_format;
    return value.trim().replace(new RegExp("\\".concat(numberFormat.separator), 'g'), '.');
  };
  var getOtherValue = function getOtherValue(validationOption, form) {
    if (!isNaN(parseFloat(validationOption))) {
      return validationOption;
    }
    var validationElements = form.querySelectorAll("[name*=\"".concat(validationOption, "\"]"));
    if (validationElements.length === 1) {
      var validationElement = validationElements[0];
      var otherFormattedValue = formatValue(validationElement);
      if (!isNaN(parseFloat(otherFormattedValue))) {
        return otherFormattedValue;
      }
    }
  };
  var isValid = function isValid(validationFunction, validationOption, formattedValue, form) {
    if (validationFunction.length === 2) {
      var otherValue = getOtherValue(validationOption, form);
      return otherValue == null || otherValue === '' || validationFunction(formattedValue, otherValue);
    } else {
      return validationFunction(formattedValue);
    }
  };
  var runFunctionValidations = function runFunctionValidations(formattedValue, form, options) {
    for (var validation in VALIDATIONS$1) {
      var validationOption = options[validation];
      var validationFunction = VALIDATIONS$1[validation];

      // Must check for null because this could be 0
      if (validationOption == null) {
        continue;
      }
      if (!isValid(validationFunction, validationOption, formattedValue, form)) {
        return options.messages[validation];
      }
    }
  };
  var runValidations$1 = function runValidations(formattedValue, form, options) {
    if (options.only_integer && !ClientSideValidations.patterns.numericality.only_integer.test(formattedValue)) {
      return options.messages.only_integer;
    }
    if (!ClientSideValidations.patterns.numericality.default.test(formattedValue)) {
      return options.messages.numericality;
    }
    return runFunctionValidations(formattedValue, form, options);
  };
  var numericalityLocalValidator = function numericalityLocalValidator($element, options) {
    var element = $element[0];
    var value = element.value;
    if (options.allow_blank && !isValuePresent(value)) {
      return;
    }
    var form = element.form;
    var formattedValue = formatValue(element);
    return runValidations$1(formattedValue, form, options);
  };

  var VALIDATIONS = {
    is: function is(a, b) {
      return a === parseInt(b, 10);
    },
    minimum: function minimum(a, b) {
      return a >= parseInt(b, 10);
    },
    maximum: function maximum(a, b) {
      return a <= parseInt(b, 10);
    }
  };
  var runValidations = function runValidations(valueLength, options) {
    for (var validation in VALIDATIONS) {
      var validationOption = options[validation];
      var validationFunction = VALIDATIONS[validation];
      if (validationOption && !validationFunction(valueLength, validationOption)) {
        return options.messages[validation];
      }
    }
  };
  var lengthLocalValidator = function lengthLocalValidator($element, options) {
    var element = $element[0];
    var value = element.value;
    if (options.allow_blank && !isValuePresent(value)) {
      return;
    }
    return runValidations(value.length, options);
  };

  var isInList = function isInList(value, otherValues) {
    var normalizedOtherValues = [];
    for (var otherValueIndex in otherValues) {
      normalizedOtherValues.push(otherValues[otherValueIndex].toString());
    }
    return arrayHasValue(value, normalizedOtherValues);
  };
  var isInRange = function isInRange(value, range) {
    return value >= range[0] && value <= range[1];
  };
  var isIncluded = function isIncluded(value, options, allowBlank) {
    if ((options.allow_blank && !isValuePresent(value)) === allowBlank) {
      return true;
    }
    return options.in && isInList(value, options.in) || options.range && isInRange(value, options.range);
  };
  var exclusionLocalValidator = function exclusionLocalValidator($element, options) {
    var element = $element[0];
    var value = element.value;
    if (isIncluded(value, options, false) || !options.allow_blank && !isValuePresent(value)) {
      return options.message;
    }
  };
  var inclusionLocalValidator = function inclusionLocalValidator($element, options) {
    var element = $element[0];
    var value = element.value;
    if (!isIncluded(value, options, true)) {
      return options.message;
    }
  };

  var confirmationLocalValidator = function confirmationLocalValidator($element, options) {
    var element = $element[0];
    var value = element.value;
    var confirmationValue = document.getElementById("".concat(element.id, "_confirmation")).value;
    if (!options.case_sensitive) {
      value = value.toLowerCase();
      confirmationValue = confirmationValue.toLowerCase();
    }
    if (value !== confirmationValue) {
      return options.message;
    }
  };

  var isLocallyUnique = function isLocallyUnique(element, value, otherValue, caseSensitive) {
    if (!caseSensitive) {
      value = value.toLowerCase();
      otherValue = otherValue.toLowerCase();
    }
    if (otherValue === value) {
      element.dataset.notLocallyUnique = true;
      return false;
    }
    if (element.dataset.notLocallyUnique) {
      delete element.dataset.notLocallyUnique;
      element.dataset.changed = true;
    }
    return true;
  };
  var uniquenessLocalValidator = function uniquenessLocalValidator($element, options) {
    var element = $element[0];
    var elementName = element.name;
    var matches = elementName.match(/^(.+_attributes\])\[\d+\](.+)$/);
    if (!matches) {
      return;
    }
    var form = element.form;
    var value = element.value;
    var valid = true;
    var query = "[name^=\"".concat(matches[1], "\"][name$=\"").concat(matches[2], "\"]:not([name=\"").concat(elementName, "\"])");
    var otherElements = form.querySelectorAll(query);
    Array.prototype.slice.call(otherElements).forEach(function (otherElement) {
      var otherValue = otherElement.value;
      if (!isLocallyUnique(otherElement, value, otherValue, options.case_sensitive)) {
        valid = false;
      }
    });
    if (!valid) {
      return options.message;
    }
  };

  // Validators will run in the following order
  ClientSideValidations.validators.local = {
    absence: absenceLocalValidator,
    presence: presenceLocalValidator,
    acceptance: acceptanceLocalValidator,
    format: formatLocalValidator,
    numericality: numericalityLocalValidator,
    length: lengthLocalValidator,
    inclusion: inclusionLocalValidator,
    exclusion: exclusionLocalValidator,
    confirmation: confirmationLocalValidator,
    uniqueness: uniquenessLocalValidator
  };
  jQuery.fn.disableClientSideValidations = function () {
    ClientSideValidations.disable(this);
    return this;
  };
  jQuery.fn.enableClientSideValidations = function () {
    var _this = this;
    var selectors = {
      forms: 'form',
      inputs: 'input'
    };
    var _loop = function _loop() {
      var enablers = selectors[selector];
      _this.filter(ClientSideValidations.selectors[selector]).each(function () {
        ClientSideValidations.enablers[enablers](this);
      });
    };
    for (var selector in selectors) {
      _loop();
    }
    return this;
  };
  jQuery.fn.resetClientSideValidations = function () {
    this.filter(ClientSideValidations.selectors.forms).each(function () {
      ClientSideValidations.reset(this);
    });
    return this;
  };
  jQuery.fn.validate = function () {
    this.filter(ClientSideValidations.selectors.forms).each(function () {
      jQuery(this).enableClientSideValidations();
    });
    return this;
  };
  jQuery.fn.isValid = function (validators) {
    var obj = jQuery(this[0]);
    if (obj.is('form')) {
      return validateForm(obj, validators);
    } else {
      return validateElement(obj, validatorsFor(this[0].name, validators));
    }
  };
  var cleanNestedElementName = function cleanNestedElementName(elementName, nestedMatches, validators) {
    for (var validatorName in validators) {
      if (validatorName.match("\\[".concat(nestedMatches[1], "\\].*\\[\\]\\[").concat(nestedMatches[2], "\\]$"))) {
        elementName = elementName.replace(/\[[\da-z_]+\]\[(\w+)\]$/g, '[][$1]');
      }
    }
    return elementName;
  };
  var cleanElementName = function cleanElementName(elementName, validators) {
    elementName = elementName.replace(/\[(\w+_attributes)\]\[[\da-z_]+\](?=\[(?:\w+_attributes)\])/g, '[$1][]');
    var nestedMatches = elementName.match(/\[(\w+_attributes)\].*\[(\w+)\]$/);
    if (nestedMatches) {
      elementName = cleanNestedElementName(elementName, nestedMatches, validators);
    }
    return elementName;
  };
  var validatorsFor = function validatorsFor(elementName, validators) {
    if (Object.prototype.hasOwnProperty.call(validators, elementName)) {
      return validators[elementName];
    }
    return validators[cleanElementName(elementName, validators)] || {};
  };
  var validateForm = function validateForm($form, validators) {
    var valid = true;
    $form.trigger('form:validate:before.ClientSideValidations');
    $form.find(ClientSideValidations.selectors.validate_inputs).each(function () {
      if (!jQuery(this).isValid(validators)) {
        valid = false;
      }
      return true;
    });
    if (valid) {
      $form.trigger('form:validate:pass.ClientSideValidations');
    } else {
      $form.trigger('form:validate:fail.ClientSideValidations');
    }
    $form.trigger('form:validate:after.ClientSideValidations');
    return valid;
  };
  var passElement = function passElement($element) {
    $element.trigger('element:validate:pass.ClientSideValidations').data('valid', null);
  };
  var failElement = function failElement($element, message) {
    $element.trigger('element:validate:fail.ClientSideValidations', message).data('valid', false);
  };
  var afterValidate = function afterValidate($element) {
    return $element.trigger('element:validate:after.ClientSideValidations').data('valid') !== false;
  };
  var executeValidator = function executeValidator(validatorFunctions, validatorFunction, validatorOptions, $element) {
    for (var validatorOption in validatorOptions) {
      if (!validatorOptions[validatorOption]) {
        continue;
      }
      var message = validatorFunction.call(validatorFunctions, $element, validatorOptions[validatorOption]);
      if (message) {
        failElement($element, message);
        return false;
      }
    }
    return true;
  };
  var executeValidators = function executeValidators(validatorFunctions, $element, validators) {
    for (var validator in validators) {
      if (!validatorFunctions[validator]) {
        continue;
      }
      if (!executeValidator(validatorFunctions, validatorFunctions[validator], validators[validator], $element)) {
        return false;
      }
    }
    return true;
  };
  var isMarkedForDestroy = function isMarkedForDestroy($element) {
    var element = $element[0];
    var elementName = element.name;
    if (/\[([^\]]*?)\]$/.test(elementName)) {
      var destroyInputName = elementName.replace(/\[([^\]]*?)\]$/, '[_destroy]');
      var destroyInputElement = document.querySelector("input[name=\"".concat(destroyInputName, "\"]"));
      if (destroyInputElement && destroyInputElement.value === '1') {
        return true;
      }
    }
    return false;
  };
  var executeAllValidators = function executeAllValidators($element, validators) {
    var element = $element[0];
    if ($element.data('changed') === false || element.disabled) {
      return;
    }
    $element.data('changed', false);
    if (executeValidators(ClientSideValidations.validators.all(), $element, validators)) {
      passElement($element);
    }
  };
  var validateElement = function validateElement($element, validators) {
    $element.trigger('element:validate:before.ClientSideValidations');
    if (isMarkedForDestroy($element)) {
      passElement($element);
    } else {
      executeAllValidators($element, validators);
    }
    return afterValidate($element);
  };
  if (!window.ClientSideValidations) {
    window.ClientSideValidations = ClientSideValidations;
    if (!isAMD() && !isCommonJS()) {
      ClientSideValidations.start();
    }
  }
  function isAMD() {
    return typeof define === 'function' && define.amd; // eslint-disable-line no-undef
  }
  function isCommonJS() {
    return (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined';
  }

  return ClientSideValidations;

}));
