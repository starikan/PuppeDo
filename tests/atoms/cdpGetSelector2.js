const pick = (obj, fields) => Object.fromEntries(Object.entries(obj).filter(([key]) => fields.includes(key)));
const dialogId = 'dialog-ppd';

module.exports = async function atomRun() {
  const dialogBox = () => {
    window.DialogBox = function (id, callback) {
      var _minW = 100, // The exact value get's calculated
        _minH = 1, // The exact value get's calculated
        _resizePixel = 5,
        _hasEventListeners = !!window.addEventListener,
        _parent,
        _dialog,
        _dialogTitle,
        _dialogContent,
        _dialogButtonPane,
        _maxX,
        _maxY,
        _startX,
        _startY,
        _startW = 300,
        _startH = 400,
        _leftPos,
        _topPos,
        _isDrag = false,
        _isResize = false,
        _isButton = false,
        _isButtonHovered = false, // Let's use standard hover (see css)
        //_isClickEvent = true, // Showing several dialog boxes work better if I do not use this variable
        _resizeMode = '',
        _whichButton,
        _buttons,
        _tabBoundary,
        _callback, // Callback function which transfers the name of the selected button to the caller
        _zIndex, // Initial zIndex of this dialog box
        _zIndexFlag = false, // Bring this dialog box to front
        _setCursor, // Forward declaration to get access to this function in the closure
        _whichClick, // Forward declaration to get access to this function in the closure
        _setDialogContent, // Forward declaration to get access to this function in the closure
        _addEvent = function (elm, evt, callback) {
          if (elm == null || typeof elm == undefined) return;
          if (_hasEventListeners) elm.addEventListener(evt, callback, false);
          else if (elm.attachEvent) elm.attachEvent('on' + evt, callback);
          else elm['on' + evt] = callback;
        },
        _returnEvent = function (evt) {
          if (evt.stopPropagation) evt.stopPropagation();
          if (evt.preventDefault) evt.preventDefault();
          else {
            evt.returnValue = false;
            return false;
          }
        },
        // not used
        /*
      _returnTrueEvent = function(evt) {
        evt.returnValue = true;
        return true;
      },
      */

        // not used
        // Mybe we should be able to destroy a dialog box, too.
        // In this case we should remove the event listeners from the dialog box but
        // I do not know how to identfy which event listeners should be removed from the document.
        /*
      _removeEvent = function(elm, evt, callback) {
        if (elm == null || typeof(elm) == undefined)
          return;
        if (window.removeEventListener)
          elm.removeEventListener(evt, callback, false);
        else if (elm.detachEvent)
          elm.detachEvent('on' + evt, callback);
      },
      */

        _adjustFocus = function (evt) {
          evt = evt || window.event;
          if (evt.target === _dialogTitle) _buttons[_buttons.length - 1].focus();
          else _buttons[0].focus();
          return _returnEvent(evt);
        },
        _onFocus = function (evt) {
          evt = evt || window.event;
          evt.target.classList.add('focus');
          return _returnEvent(evt);
        },
        _onBlur = function (evt) {
          evt = evt || window.event;
          evt.target.classList.remove('focus');
          return _returnEvent(evt);
        },
        _onClick = function (evt) {
          evt = evt || window.event;
          //if (_isClickEvent)
          _whichClick(evt.target);
          //else
          //	_isClickEvent = true;
          return _returnEvent(evt);
        },
        _onMouseDown = function (evt) {
          evt = evt || window.event;
          _zIndexFlag = true;
          // mousedown might happen on any place of the dialog box, therefore
          // we need to take care that this does not to mess up normal events
          // on the content of the dialog box, i.e. to copy text
          if (!(evt.target === _dialog || evt.target === _dialogTitle || evt.target === _buttons[0])) return;
          var rect = _getOffset(_dialog);
          _maxX = Math.max(
            document.documentElement['clientWidth'],
            document.body['scrollWidth'],
            document.documentElement['scrollWidth'],
            document.body['offsetWidth'],
            document.documentElement['offsetWidth'],
          );
          _maxY = Math.max(
            document.documentElement['clientHeight'],
            document.body['scrollHeight'],
            document.documentElement['scrollHeight'],
            document.body['offsetHeight'],
            document.documentElement['offsetHeight'],
          );
          if (rect.right > _maxX) _maxX = rect.right;
          if (rect.bottom > _maxY) _maxY = rect.bottom;
          _startX = evt.pageX;
          _startY = evt.pageY;
          _startW = _dialog.clientWidth;
          _startH = _dialog.clientHeight;
          _leftPos = rect.left;
          _topPos = rect.top;
          if (_isButtonHovered) {
            //_whichButton.classList.remove('hover');
            _whichButton.classList.remove('focus');
            _whichButton.classList.add('active');
            _isButtonHovered = false;
            _isButton = true;
          } else if (evt.target === _dialogTitle && _resizeMode == '') {
            _setCursor('move');
            _isDrag = true;
          } else if (_resizeMode != '') {
            _isResize = true;
          }
          var r = _dialog.getBoundingClientRect();
          return _returnEvent(evt);
        },
        _onMouseMove = function (evt) {
          evt = evt || window.event;
          // mousemove might run out of the dialog box during drag or resize, therefore we need to
          // attach the event to the whole document, but we need to take care that this
          // does not to mess up normal events outside of the dialog box.
          if (
            !(evt.target === _dialog || evt.target === _dialogTitle || evt.target === _buttons[0]) &&
            !_isDrag &&
            _resizeMode == ''
          )
            return;
          if (_isDrag) {
            var dx = _startX - evt.pageX,
              dy = _startY - evt.pageY,
              left = _leftPos - dx,
              top = _topPos - dy,
              scrollL = Math.max(document.body.scrollLeft, document.documentElement.scrollLeft),
              scrollT = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
            if (dx < 0) {
              if (left + _startW > _maxX) left = _maxX - _startW;
            }
            if (dx > 0) {
              if (left < 0) left = 0;
            }
            if (dy < 0) {
              if (top + _startH > _maxY) top = _maxY - _startH;
            }
            if (dy > 0) {
              if (top < 0) top = 0;
            }
            _dialog.style.left = left + 'px';
            _dialog.style.top = top + 'px';
            if (evt.clientY > window.innerHeight - 32) scrollT += 32;
            else if (evt.clientY < 32) scrollT -= 32;
            if (evt.clientX > window.innerWidth - 32) scrollL += 32;
            else if (evt.clientX < 32) scrollL -= 32;
            if (top + _startH == _maxY) scrollT = _maxY - window.innerHeight + 20;
            else if (top == 0) scrollT = 0;
            if (left + _startW == _maxX) scrollL = _maxX - window.innerWidth + 20;
            else if (left == 0) scrollL = 0;
            if (_startH > window.innerHeight) {
              if (evt.clientY < window.innerHeight / 2) scrollT = 0;
              else scrollT = _maxY - window.innerHeight + 20;
            }
            if (_startW > window.innerWidth) {
              if (evt.clientX < window.innerWidth / 2) scrollL = 0;
              else scrollL = _maxX - window.innerWidth + 20;
            }
            window.scrollTo(scrollL, scrollT);
          } else if (_isResize) {
            var dw, dh, w, h;
            if (_resizeMode == 'w') {
              dw = _startX - evt.pageX;
              if (_leftPos - dw < 0) dw = _leftPos;
              w = _startW + dw;
              if (w < _minW) {
                w = _minW;
                dw = w - _startW;
              }
              _dialog.style.width = w + 'px';
              _dialog.style.left = _leftPos - dw + 'px';
            } else if (_resizeMode == 'e') {
              dw = evt.pageX - _startX;
              if (_leftPos + _startW + dw > _maxX) dw = _maxX - _leftPos - _startW;
              w = _startW + dw;
              if (w < _minW) w = _minW;
              _dialog.style.width = w + 'px';
            } else if (_resizeMode == 'n') {
              dh = _startY - evt.pageY;
              if (_topPos - dh < 0) dh = _topPos;
              h = _startH + dh;
              if (h < _minH) {
                h = _minH;
                dh = h - _startH;
              }
              _dialog.style.height = h + 'px';
              _dialog.style.top = _topPos - dh + 'px';
            } else if (_resizeMode == 's') {
              dh = evt.pageY - _startY;
              if (_topPos + _startH + dh > _maxY) dh = _maxY - _topPos - _startH;
              h = _startH + dh;
              if (h < _minH) h = _minH;
              _dialog.style.height = h + 'px';
            } else if (_resizeMode == 'nw') {
              dw = _startX - evt.pageX;
              dh = _startY - evt.pageY;
              if (_leftPos - dw < 0) dw = _leftPos;
              if (_topPos - dh < 0) dh = _topPos;
              w = _startW + dw;
              h = _startH + dh;
              if (w < _minW) {
                w = _minW;
                dw = w - _startW;
              }
              if (h < _minH) {
                h = _minH;
                dh = h - _startH;
              }
              _dialog.style.width = w + 'px';
              _dialog.style.height = h + 'px';
              _dialog.style.left = _leftPos - dw + 'px';
              _dialog.style.top = _topPos - dh + 'px';
            } else if (_resizeMode == 'sw') {
              dw = _startX - evt.pageX;
              dh = evt.pageY - _startY;
              if (_leftPos - dw < 0) dw = _leftPos;
              if (_topPos + _startH + dh > _maxY) dh = _maxY - _topPos - _startH;
              w = _startW + dw;
              h = _startH + dh;
              if (w < _minW) {
                w = _minW;
                dw = w - _startW;
              }
              if (h < _minH) h = _minH;
              _dialog.style.width = w + 'px';
              _dialog.style.height = h + 'px';
              _dialog.style.left = _leftPos - dw + 'px';
            } else if (_resizeMode == 'ne') {
              dw = evt.pageX - _startX;
              dh = _startY - evt.pageY;
              if (_leftPos + _startW + dw > _maxX) dw = _maxX - _leftPos - _startW;
              if (_topPos - dh < 0) dh = _topPos;
              w = _startW + dw;
              h = _startH + dh;
              if (w < _minW) w = _minW;
              if (h < _minH) {
                h = _minH;
                dh = h - _startH;
              }
              _dialog.style.width = w + 'px';
              _dialog.style.height = h + 'px';
              _dialog.style.top = _topPos - dh + 'px';
            } else if (_resizeMode == 'se') {
              dw = evt.pageX - _startX;
              dh = evt.pageY - _startY;
              if (_leftPos + _startW + dw > _maxX) dw = _maxX - _leftPos - _startW;
              if (_topPos + _startH + dh > _maxY) dh = _maxY - _topPos - _startH;
              w = _startW + dw;
              h = _startH + dh;
              if (w < _minW) w = _minW;
              if (h < _minH) h = _minH;
              _dialog.style.width = w + 'px';
              _dialog.style.height = h + 'px';
            }
            _setDialogContent();
          } else if (!_isButton) {
            var cs,
              rm = '';
            if (evt.target === _dialog || evt.target === _dialogTitle || evt.target === _buttons[0]) {
              var rect = _getOffset(_dialog);
              if (evt.pageY < rect.top + _resizePixel) rm = 'n';
              else if (evt.pageY > rect.bottom - _resizePixel) rm = 's';
              if (evt.pageX < rect.left + _resizePixel) rm += 'w';
              else if (evt.pageX > rect.right - _resizePixel) rm += 'e';
            }
            if (rm != '' && _resizeMode != rm) {
              if (rm == 'n' || rm == 's') cs = 'ns-resize';
              else if (rm == 'e' || rm == 'w') cs = 'ew-resize';
              else if (rm == 'ne' || rm == 'sw') cs = 'nesw-resize';
              else if (rm == 'nw' || rm == 'se') cs = 'nwse-resize';
              _setCursor(cs);
              _resizeMode = rm;
            } else if (rm == '' && _resizeMode != '') {
              _setCursor('');
              _resizeMode = '';
            }
            if (
              (evt.target != _buttons[0] && evt.target.tagName.toLowerCase() == 'button') ||
              (evt.target === _buttons[0] && rm == '')
            ) {
              if (!_isButtonHovered || (_isButtonHovered && evt.target != _whichButton)) {
                _whichButton = evt.target;
                //_whichButton.classList.add('hover');
                _isButtonHovered = true;
              }
            } else if (_isButtonHovered) {
              //_whichButton.classList.remove('hover');
              _isButtonHovered = false;
            }
          }
          return _returnEvent(evt);
        };

      (_onMouseUp = function (evt) {
        evt = evt || window.event;
        if (_zIndexFlag) {
          _dialog.style.zIndex = _zIndex + 1;
          _zIndexFlag = false;
        } else {
          _dialog.style.zIndex = _zIndex;
        }
        // mousemove might run out of the dialog box during drag or resize, therefore we need to
        // attach the event to the whole document, but we need to take care that this
        // does not to mess up normal events outside of the dialog box.
        if (
          !(evt.target === _dialog || evt.target === _dialogTitle || evt.target === _buttons[0]) &&
          !_isDrag &&
          _resizeMode == ''
        )
          return;
        //_isClickEvent = false;
        if (_isDrag) {
          _setCursor('');
          _isDrag = false;
        } else if (_isResize) {
          _setCursor('');
          _isResize = false;
          _resizeMode = '';
        } else if (_isButton) {
          _whichButton.classList.remove('active');
          _isButton = false;
          _whichClick(_whichButton);
        }
        //else
        //_isClickEvent = true;
        return _returnEvent(evt);
      }),
        (_whichClick = function (btn) {
          _dialog.style.display = 'none';
          if (_callback) _callback(btn.name);
        }),
        (_getOffset = function (elm) {
          var rect = elm.getBoundingClientRect(),
            offsetX = window.scrollX || document.documentElement.scrollLeft,
            offsetY = window.scrollY || document.documentElement.scrollTop;
          return {
            left: rect.left + offsetX,
            top: rect.top + offsetY,
            right: rect.right + offsetX,
            bottom: rect.bottom + offsetY,
          };
        }),
        (_setCursor = function (cur) {
          _dialog.style.cursor = cur;
          _dialogTitle.style.cursor = cur;
          _buttons[0].style.cursor = cur;
        }),
        (_setDialogContent = function () {
          // Let's try to get rid of some of constants in javascript but use values from css
          var _dialogContentStyle = getComputedStyle(_dialogContent),
            _dialogButtonPaneStyle,
            _dialogButtonPaneStyleBefore;
          if (_buttons.length > 1) {
            _dialogButtonPaneStyle = getComputedStyle(_dialogButtonPane);
            _dialogButtonPaneStyleBefore = getComputedStyle(_dialogButtonPane, ':before');
          }

          var w =
              _dialog.clientWidth -
              parseInt(_dialogContentStyle.left) - // .dialog .content { left: 16px; }
              16, // right margin?
            h =
              _dialog.clientHeight -
              (parseInt(_dialogContentStyle.top) + // .dialog .content { top: 48px }
                16 + // ?
                (_buttons.length > 1
                  ? +parseInt(_dialogButtonPaneStyleBefore.borderBottom) - // .dialog .buttonpane:before { border-bottom: 1px; }
                    parseInt(_dialogButtonPaneStyleBefore.top) + // .dialog .buttonpane:before { height: 0; top: -16px; }
                    parseInt(_dialogButtonPaneStyle.height) + // .dialog .buttonset button { height: 32px; }
                    parseInt(_dialogButtonPaneStyle.bottom) // .dialog .buttonpane { bottom: 16px; }
                  : 0)); // Ensure to get minimal height
          _dialogContent.style.width = w + 'px';
          _dialogContent.style.height = h + 'px';

          if (_dialogButtonPane)
            // The buttonpane is optional
            _dialogButtonPane.style.width = w + 'px';

          _dialogTitle.style.width = w - 16 + 'px';
        }),
        (_showDialog = function () {
          _dialog.style.display = 'block';
          if (_buttons[1])
            // buttons are optional
            _buttons[1].focus();
          else _buttons[0].focus();
        }),
        (_init = function (id, callback) {
          _dialog = document.getElementById(id);
          _callback = _callback || callback; // Register callback function

          _dialog.style.visibility = 'hidden'; // We dont want to see anything..
          _dialog.style.display = 'block'; // but we need to render it to get the size of the dialog box

          _dialogTitle = _dialog.querySelector('.titlebar');
          _dialogContent = _dialog.querySelector('.content');
          _dialogButtonPane = _dialog.querySelector('.buttonpane');
          _buttons = _dialog.querySelectorAll('button'); // Ensure to get minimal width

          // Let's try to get rid of some of constants in javascript but use values from css
          var _dialogStyle = getComputedStyle(_dialog),
            _dialogTitleStyle = getComputedStyle(_dialogTitle),
            _dialogContentStyle = getComputedStyle(_dialogContent),
            _dialogButtonPaneStyle,
            _dialogButtonPaneStyleBefore,
            _dialogButtonStyle;
          if (_buttons.length > 1) {
            _dialogButtonPaneStyle = getComputedStyle(_dialogButtonPane);
            _dialogButtonPaneStyleBefore = getComputedStyle(_dialogButtonPane, ':before');
            _dialogButtonStyle = getComputedStyle(_buttons[1]);
          }

          // Calculate minimal width
          _minW = Math.max(
            _dialog.clientWidth,
            _minW,
            +(_buttons.length > 1
              ? +(_buttons.length - 1) * parseInt(_dialogButtonStyle.width) + // .dialog .buttonset button { width: 64px; }
                (_buttons.length - 1 - 1) * 16 + // .dialog .buttonset button { margin-left: 16px; } // but not for first-child
                ((_buttons.length - 1 - 1) * 16) / 2 // The formula is not correct, however, with fixed value 16 for margin-left: 16px it works
              : 0),
          );
          _dialog.style.width = (_startW || _minW) + 'px';

          // Calculate minimal height
          _minH = Math.max(
            _dialog.clientHeight,
            _minH,
            +parseInt(_dialogContentStyle.top) + // .dialog .content { top: 48px }
              2 * parseInt(_dialogStyle.border) + // .dialog { border: 1px }
              16 + // ?
              12 + // .p { margin-block-start: 1em; } // default
              12 + // .dialog { font-size: 12px; } // 1em = 12px
              12 + // .p { margin-block-end: 1em; } // default
              (_buttons.length > 1
                ? +parseInt(_dialogButtonPaneStyleBefore.borderBottom) - // .dialog .buttonpane:before { border-bottom: 1px; }
                  parseInt(_dialogButtonPaneStyleBefore.top) + // .dialog .buttonpane:before { height: 0; top: -16px; }
                  parseInt(_dialogButtonPaneStyle.height) + // .dialog .buttonset button { height: 32px; }
                  parseInt(_dialogButtonPaneStyle.bottom) // .dialog .buttonpane { bottom: 16px; }
                : 0),
          );
          _dialog.style.height = (_startH || _minH) + 'px';

          _setDialogContent();

          // center the dialog box
          _dialog.style.left = (window.innerWidth - _dialog.clientWidth) / 2 + 'px';
          _dialog.style.top = (window.innerHeight - _dialog.clientHeight) / 2 + 'px';

          _dialog.style.display = 'none'; // Let's hide it again..
          _dialog.style.visibility = 'visible'; // and undo visibility = 'hidden'

          _dialogTitle.tabIndex = '0';

          _tabBoundary = document.createElement('div');
          _tabBoundary.tabIndex = '0';
          _dialog.appendChild(_tabBoundary);

          _addEvent(_dialog, 'mousedown', _onMouseDown);
          // mousemove might run out of the dialog during resize, therefore we need to
          // attach the event to the whole document, but we need to take care not to mess
          // up normal events outside of the dialog.
          _addEvent(document, 'mousemove', _onMouseMove);
          // mouseup might happen out of the dialog during resize, therefore we need to
          // attach the event to the whole document, but we need to take care not to mess
          // up normal events outside of the dialog.
          _addEvent(document, 'mouseup', _onMouseUp);
          if (_buttons[0].textContent == '')
            // Use default symbol X if no other symbol is provided
            _buttons[0].innerHTML = '&#x2716;'; // use of innerHTML is required to show  Unicode characters
          for (var i = 0; i < _buttons.length; i++) {
            _addEvent(_buttons[i], 'click', _onClick);
            _addEvent(_buttons[i], 'focus', _onFocus);
            _addEvent(_buttons[i], 'blur', _onBlur);
          }
          _addEvent(_dialogTitle, 'focus', _adjustFocus);
          _addEvent(_tabBoundary, 'focus', _adjustFocus);

          _zIndex = _dialog.style.zIndex;
        });

      // Execute constructor
      _init(id, callback);

      // Public interface
      this.showDialog = _showDialog;
      return this;
    };
  };

  const dialogCss = `
    .dialog {
      display: none; /* not visible by default */
      font-family: Verdana, sans-serif;
      font-size: 12px;
      font-weight: 400;
      color: #fff;
      background: #666;
      border: 1px solid #fff;  /* change allowed; Border to separate multipe dialog boxes */
      margin: 0;
      position: absolute;
      z-index: 1000000 !important;
    }
    .dialog .titlebar {
      height: 32px; /* same as .dialog>button height */
      line-height: 32px; /* same as .dialog>button height */
      vertical-align: middle;
      font-size: 1.2em;
      padding: 0 8px 0 8px; /* change NOT allowed */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: move;
      background: #39c;
    }
    .dialog .content {
      position: absolute;
      top: 48px; /* change allowed */
      left: 16px; /* change NOT allowed */
      overflow: auto;
      font-size: 1em;
    }
    .dialog .buttonpane:before {
      width: 100%;
      height: 0;
      border-bottom: 1px solid; /* change allowed */
      content: '';
      position: absolute;
      top: -16px; /* change allowed */
    }
    .dialog .buttonpane {
      width: 100%;
      position: absolute;
      bottom: 16px; /* change allowed */
      right: 16px; /* change NOT allowed */
      white-space: nowrap; /* keep buttons on one line */
    }
    .dialog .buttonset {
      float: right;
    }
    .dialog button {
      -webkit-transition: 0.25s;
      transition: 0.25s;
      color: #fff;
    }
    .dialog button::-moz-focus-inner {
      border: 0;
    }
    /* .dialog button.hover, */ /* Let's use standard hover */
    .dialog button:hover,
    .dialog button.active
    {
      cursor: pointer;
    }
    .dialog>button {
      width: 32px; /* change NOT allowed */
      height: 32px; /* same as .dialog .titlebar height */
      position: absolute;
      top: 0;
      right: 0;
      padding: 0;
      border: 0;
      font-size: 1.4em;
      background: #fa0;
    }
    /* .dialog>button.hover, */
    .dialog>button:hover,
    .dialog>button.focus
    {
      box-shadow: inset -16px 0 0 0 #e80, inset 16px 0 0 0 #e80;
    }
    .dialog>button.active {
      background: #f55; /* irrelevant */
      border: 1px solid #ddd; /* irrelevant */
    }
    .dialog .buttonset button {
      height: 32px; /* change allowed */
      width: 64px; /* change allowed */
      font-size: 1.1em;
      padding: 0; /* irrelevant */
      border: 2px solid #fff; /* change allowed */
      border-radius: 4px; /* change allowed */
      margin-left: 16px; /* change NOT allowed */
      background: #39c
    }
    .dialog .buttonset button:first-child {
      margin-left: 0;
    }
    /* .dialog .buttonset button.hover, */
    .dialog .buttonset button:hover,
    .dialog .buttonset button.focus
    {
      box-shadow: inset -32px 0 0 0 #17a, inset 32px 0 0 0 #17a;
    }
    .dialog .buttonset button.active {
      background: #1a7;
      border-color: #ddd;
    }

    #ppd-wait-data-process-wraper {
      width: 100%;
      height: 100%;
      position: absolute;
      margin: 0;
      padding: 0;
      z-index: 100000000;
      top: 0;
      backdrop-filter: blur(2px);
      // display: grid;
      align-items: center;
      justify-items: center;
      display: none
    }
  `;

  const jsEvalOnClick = () => {
    let previousBorder = null;
    let elementClicked = null;

    window.clickHandler = function (event) {
      if (!event.ctrlKey) {
        return true;
      }
      event.stopPropagation();
      event.preventDefault();

      if (elementClicked) {
        elementClicked.style.border = previousBorder;
      }

      elementClicked = event.target;
      elementClicked.style.setProperty('border', previousBorder);

      console.log(event);

      const fields = [
        'x',
        'y',
        'button',
        'clientX',
        'clientY',
        'ctrlKey',
        'layerX',
        'layerY',
        'metaKey',
        'movementX',
        'movementY',
        'offsetX',
        'offsetY',
        'pageX',
        'pageY',
        'screenX',
        'screenY',
        'shiftKey',
      ];
      const exportData = this._.pick(event, fields);

      exportData.path = [];
      event.path.forEach((p, i) => {
        if (i > 3) return;

        let fieldsPath = [
          'baseURI',
          'childElementCount',
          'className',
          'clientHeight',
          'clientLeft',
          'clientTop',
          'clientWidth',
          'draggable',
          'hidden',
          'id',
          'localName',
          'nodeName',
          'nodeType',
          'nodeValue',
          'offsetHeight',
          'offsetLeft',
          'offsetTop',
          'offsetWidth',
          'scrollHeight',
          'scrollLeft',
          'scrollTop',
          'scrollWidth',
          'tabIndex',
          'tagName',
          'textContent',
          'title',
        ];

        if (i === 0) {
          fieldsPath = [...fieldsPath, 'innerHTML', 'innerText', 'outerHTML', 'outerText', 'text'];
        }

        const path = this._.pick(p, fieldsPath);

        path.attributes = {};
        if (p.attributes && p.attributes.length) {
          for (let attr of p.attributes) {
            path.attributes[attr.name] = attr.value;
          }
        }

        path.classList = p.classList && p.classList.length ? [...p.classList] : [];

        exportData.path.push(path);
      });

      const target = event.target;
      exportData.xpath = [xpath.getXPath(target), xpath.getUniqueXPath(target)];
      exportData.type = 'selectorClick';

      // console.log(exportData);
      console.log(JSON.stringify(exportData, { skipInvalid: true }));

      target.style.setProperty('border', '2px solid red');
    };
    window.removeEventListener('click', window.clickHandler);
    window.addEventListener('click', window.clickHandler, true);
  };

  const addDialogHTML = (dialogId) => {
    const body = document.getElementsByTagName('body');
    const div = document.createElement('div');
    div.setAttribute('id', dialogId);
    div.setAttribute('class', 'dialog');
    div.innerHTML = `
    <div class="titlebar">PPD Creator</div>
    <button name="collapse"></button>
    <button name="fullscreen"></button>
      <div id="content" class="content"></div>
      <div class="buttonpane">
        <div class="buttonset">
          <button name="ok">OK</button>
          <button name="cancel">Cancel</button>
        </div>
      </div>
    `;
    body[0].appendChild(div);
    const waiter = document.createElement('div');
    waiter.setAttribute('id', 'ppd-wait-data-process-wraper');
    waiter.innerHTML = `
      <div id="ppd-wait-data-process">
        <?xml version="1.0" encoding="utf-8"?>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: rgb(241, 242, 243); display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <g transform="rotate(0 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.9166666666666666s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(30 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.8333333333333334s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(60 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.75s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(90 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.6666666666666666s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(120 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5833333333333334s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(150 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(180 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.4166666666666667s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(210 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.3333333333333333s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(240 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.25s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(270 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.16666666666666666s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(300 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.08333333333333333s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(330 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#1d3f72">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animate>
          </rect>
        </g>
        </svg>
      </div>
    `;
    body[0].appendChild(waiter);
  };

  const runDialog = (dialogId) => {
    const callbackFunction = (data) => {
      console.log(JSON.stringify({ button: data, type: 'servise' }));
    };
    const dialog = DialogBox(dialogId, callbackFunction);
    dialog.showDialog();
  };

  const checkSelectorsInDom = (selectors) => {
    selectors = selectors.map((v) => [v, document.querySelectorAll(v).length]);
    return selectors;
  };

  const getCombinations = (chars, divider = '.') => {
    const result = [];
    const f = (prefix, chars) => {
      for (var i = 0; i < chars.length; i++) {
        result.push(prefix + divider + chars[i]);
        f(prefix + divider + chars[i], chars.slice(i + 1));
      }
    };
    f('', chars);
    return result;
  };

  const generateSelectors = (elements) => {
    elements = elements.filter((v) => !v.hidden);
    elements = elements.filter((v) => v.tagName && !['HTML', 'BODY'].includes(v.tagName));
    elements = elements.map((v) => pick(v, ['classList', 'attributes', 'id', 'tagName', 'textContent']));
    elements = elements.map((v) => {
      v.tagName = v.tagName.toLowerCase();
      return v;
    });
    elements = elements.map((v) => {
      delete v.attributes.class;
      return v;
    });

    const parts = elements.map((v) => {
      let set = [
        ...(v.id ? [`#${v.id}`] : []),
        ...getCombinations(v.classList)
          .map((c) => `${c}`)
          .sort((a, b) => a.length - b.length),
        // ...getCombinations(v.classList)
        //   .map(c => `${v.tagName}${c}`)
        //   .sort((a, b) => a.length - b.length),
        ...getCombinations(
          Object.entries(v.attributes).map((attr) => `[${attr[0]}='${attr[1]}']`),
          '',
        ),
        // ...getCombinations(
        //   Object.entries(v.attributes).map(attr => `[${attr[0]}='${attr[1]}']`),
        //   '',
        // ).map(c => `${v.tagName}${c}`),
        ...[v.tagName],
      ];

      return set;
    });

    let selectors = [...parts[0]];
    let combines = [...parts[0]];
    for (let i = 1; i < parts.length; i++) {
      combines = parts[i].reduce((s, b) => (s = [...s, ...combines.map((a) => `${b} > ${a}`)]), []);
      selectors = [...selectors, ...combines];
    }

    return selectors;
  };

  const checkSelectors = async (selectors) => {
    let counts = await this.page.evaluate(checkSelectorsInDom, selectors);
    counts = counts
      .filter((v) => v[1] === 1)
      .map((v) => v[0])
      .sort(
        (a, b) =>
          a.split('').filter((v) => ['.', '>'].includes(v)).length -
          b.split('').filter((v) => ['.', '>'].includes(v)).length,
      );
    return counts;
  };

  const dialogDrawer = (dialogId) => {
    window.dialogDrawer = (data) => {
      const content = document.querySelector(`#${dialogId} .content`);
      content.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    };
  };

  const sendDataToDialog = (data) => {
    window.dialogDrawer(data);
  };

  const switchLoader = (flag = true) => {
    const loader = document.getElementById('ppd-wait-data-process-wraper');
    loader.style.setProperty('display', flag ? 'grid' : 'none');
  };

  this.run = () => {
    return new Promise(async (resolve, reject) => {
      const yamlFile = 'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js';
      const lodashFile = 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.15/lodash.core.min.js';
      // https://github.com/johannhof/xpath-dom
      const xpathFile = 'https://cdn.rawgit.com/johannhof/xpath-dom/master/dist/xpath-dom.min.js';

      try {
        await this.page.addScriptTag({ url: yamlFile });
        await this.page.addScriptTag({ url: lodashFile });
        await this.page.addScriptTag({ url: xpathFile });
        await this.page.addStyleTag({ content: dialogCss });
        await this.page.evaluate(jsEvalOnClick);
        await this.page.evaluate(dialogBox);
        await this.page.evaluate(dialogDrawer, dialogId);
        await this.page.evaluate(addDialogHTML, dialogId);
        await this.page.evaluate(runDialog, dialogId);

        const engine = this.getEngine();

        let client;
        if (engine === 'playwright') {
          client = await this.page.context().newCDPSession(this.page);
        } else if (engine === 'puppeteer') {
          client = await this.page.target().createCDPSession();
        }
        await client.send('Console.enable');
        client.on('Console.messageAdded', async (e) => {
          const textLog = e.message.text;
          try {
            const data = JSON.parse(textLog);
            await this.page.evaluate(switchLoader, true);

            if (data.type === 'selectorClick') {
              const selectors = generateSelectors(data.path);
              const selectorsVariants = await checkSelectors(selectors);
              // const { x, y } = data;
              // const { nodeId } = await client.send('DOM.getNodeForLocation', { x, y });
              // const nodeIdDescribe = await client.send('DOM.describeNode', { nodeId });

              // const sendData = {
              // data: selectorsVariants,
              // type: 'atom',
              // name: 'cdpGetSelector',
              // envsId: this.envsId,
              // stepId: this.stepId,
              // };
              // this.socket.sendYAML(sendData);
              await this.page.evaluate(sendDataToDialog, { selectorsVariants });

              console.log(selectorsVariants);
            }
            if (data.type === 'servise') {
              if (data.button === 'ok') {
                await this.page.evaluate(switchLoader, false);
                await client.detach();
                resolve();
              }
            }

            await this.page.evaluate(switchLoader, false);
          } catch (err) {
            // debugger;
          }
        });

        await client.send('DOM.enable');
        client.on('DOM.documentUpdated', this.run);

        // debugger;
      } catch (err) {
        debugger;
        reject();
      }
    });
  };

  await this.run();
};
