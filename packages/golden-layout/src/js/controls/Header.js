/**
 * This class represents a header above a Stack ContentItem.
 *
 * @param {lm.LayoutManager} layoutManager
 * @param {lm.item.AbstractContentItem} parent
 */
lm.controls.Header = function (layoutManager, parent) {
	lm.utils.EventEmitter.call(this);

	this.layoutManager = layoutManager;
	this.element = $(lm.controls.Header._template);

	if (this.layoutManager.config.settings.selectionEnabled === true) {
		this.element.addClass('lm_selectable');
		this.element.on('click touchstart', lm.utils.fnBind(this._onHeaderClick, this));
	}

	if (this.layoutManager.config.settings.mode === "workspace") {
		this.element.addClass('header_double');
	}

	if (this.layoutManager.config.settings.mode === "workspace" && this.layoutManager._componentFactory) {
		const headerControlls = this.element.children(".lm_controls")[0];
		const workspaceControlsContainer = this.element.children(".lm_workspace_controls")[0];
		const logoContainer = this.element.children(".lm_logo")[0];

		if (this.layoutManager._componentFactory.createLogo) {
			this.layoutManager._componentFactory.createLogo({ domNode: logoContainer });
		}

		if (this.layoutManager._componentFactory.createAddWorkspace) {
			this.layoutManager._componentFactory.createAddWorkspace({ domNode: workspaceControlsContainer });
		}

		if (this.layoutManager._componentFactory.createSystemButtons) {
			this.layoutManager._componentFactory.createSystemButtons({ domNode: headerControlls });
		}
	}

	this.tabsContainer = this.element.find('.lm_tabs');
	this.tabDropdownContainer = this.element.find('.lm_tabdropdown_list');
	this.tabDropdownContainer.hide();
	this.controlsContainer = this.element.find('.lm_controls');
	this.workspaceControlsContainer = this.layoutManager.config.settings.mode === "workspace" ? this.element.find('.lm_workspace_controls') : undefined;
	this.tabsControlsContainer = this.layoutManager.config.settings.mode !== "workspace" ? this.element.find('.lm_tabs_controls') : undefined;
	this.parent = parent;
	this.parent.on('resize', this._updateTabSizesWithoutDropdown, this);
	this.tabs = [];
	this.activeContentItem = null;
	this.closeButton = null;
	this.tabDropdownButton = null;
	this.hideAdditionalTabsDropdown = lm.utils.fnBind(this._hideAdditionalTabsDropdown, this);
	$(document).mouseup(this.hideAdditionalTabsDropdown);

	this._lastVisibleTabIndex = -1;
	this._tabControlOffset = this.layoutManager.config.settings.tabControlOffset;
	if (!(this.layoutManager.config.settings.mode === "workspace" && this.layoutManager._componentFactory && this.layoutManager._componentFactory.createSystemButtons)) {
		this._createControls();
	}
};

lm.controls.Header._template = [
	'<div class="lm_header">',
	'<div class="lm_logo"></div>',
	'<ul class="lm_tabs"></ul>',
	'<ul class="lm_workspace_controls"></ul>',
	'<ul class="lm_tabs_controls"></ul>',
	'<div class="move_area"></div>',
	'<ul class="lm_controls"></ul>',
	'<ul class="lm_tabdropdown_list"></ul>',
	'</div>'
].join('');

lm.utils.copy(lm.controls.Header.prototype, {

	/**
	 * Creates a new tab and associates it with a contentItem
	 *
	 * @param    {lm.item.AbstractContentItem} contentItem
	 * @param    {Integer} index The position of the tab
	 *
	 * @returns {void}
	 */
	createTab: function (contentItem, index) {
		var tab, i;

		//If there's already a tab relating to the
		//content item, don't do anything
		for (i = 0; i < this.tabs.length; i++) {
			if (this.tabs[i].contentItem === contentItem) {
				return;
			}
		}

		tab = new lm.controls.Tab(this, contentItem);

		if (this.tabs.length === 0) {
			this.tabs.push(tab);
			this.tabsContainer.append(tab.element);
			return;
		}

		if (index === undefined) {
			index = this.tabs.length;
		}

		if (index > 0) {
			this.tabs[index - 1].element.after(tab.element);
		} else {
			this.tabs[0].element.before(tab.element);
		}

		this.tabs.splice(index, 0, tab);
		this._updateTabSizesWithoutDropdown();
	},
	moveTab: function (fromIndex, toIndex) {
		lm.utils.moveInArray(this.tabs, fromIndex, toIndex);

		this._updateTabSizesWithoutDropdown();
		this.parent._syncContentItemOrder();
	},

	/**
	 * Finds a tab based on the contentItem its associated with and removes it.
	 *
	 * @param    {lm.item.AbstractContentItem} contentItem
	 *
	 * @returns {void}
	 */
	removeTab: function (contentItem) {
		for (var i = 0; i < this.tabs.length; i++) {
			if (this.tabs[i].contentItem === contentItem) {
				this.tabs[i]._$destroy();
				this.tabs.splice(i, 1);
				return;
			}
		}

		throw new Error('contentItem is not controlled by this header');
	},

	/**
	 * The programmatical equivalent of clicking a Tab.
	 *
	 * @param {lm.item.AbstractContentItem} contentItem
	 */
	setActiveContentItem: function (contentItem) {
		var i, j, isActive, activeTab;

		for (i = 0; i < this.tabs.length; i++) {
			isActive = this.tabs[i].contentItem === contentItem;
			this.tabs[i].setActive(isActive);
			if (isActive === true) {
				this.activeContentItem = contentItem;
				this.parent.config.activeItemIndex = i;
			}
		}

		if (this.layoutManager.config.settings.reorderOnTabMenuClick) {
			/**
			 * If the tab selected was in the dropdown, move everything down one to make way for this one to be the first.
			 * This will make sure the most used tabs stay visible.
			 */
			if (this._lastVisibleTabIndex !== -1 && this.parent.config.activeItemIndex > this._lastVisibleTabIndex) {
				activeTab = this.tabs[this.parent.config.activeItemIndex];
				for (j = this.parent.config.activeItemIndex; j > 0; j--) {
					this.tabs[j] = this.tabs[j - 1];
				}
				this.tabs[0] = activeTab;
				this.parent.config.activeItemIndex = 0;
			}
		}

		this._updateTabSizesWithoutDropdown();
		this.parent.emitBubblingEvent('stateChanged');
	},

	/**
	 * Programmatically operate with header position.
	 *
	 * @param {string} position one of ('top','left','right','bottom') to set or empty to get it.
	 *
	 * @returns {string} previous header position
	 */
	position: function (position) {
		var previous = this.parent._header.show;
		if (previous && !this.parent._side)
			previous = 'top';
		if (position !== undefined && this.parent._header.show != position) {
			this.parent._header.show = position;
			this.parent._setupHeaderPosition();
		}
		return previous;
	},

	/**
	 * Programmatically set closability.
	 *
	 * @package private
	 * @param {Boolean} isClosable Whether to enable/disable closability.
	 *
	 * @returns {Boolean} Whether the action was successful
	 */
	_$setClosable: function (isClosable) {
		if (this.closeButton && this._isClosable()) {
			this.closeButton.element[isClosable ? "show" : "hide"]();
			return true;
		}

		return false;
	},

	/**
	 * Destroys the entire header
	 *
	 * @package private
	 *
	 * @returns {void}
	 */
	_$destroy: function () {
		this.emit('destroy', this);

		for (var i = 0; i < this.tabs.length; i++) {
			this.tabs[i]._$destroy();
		}
		$(document).off('mouseup', this.hideAdditionalTabsDropdown);
		this.element.remove();
	},

	/**
	 * get settings from header
	 *
	 * @returns {string} when exists
	 */
	_getHeaderSetting: function (name) {
		if (name in this.parent._header)
			return this.parent._header[name];
	},
	/**
	 * Creates the popout, maximise and close buttons in the header's top right corner
	 *
	 * @returns {void}
	 */
	_createControls: function () {
		var closeStack,
			popout,
			label,
			maximizeLabel,
			restoreLabel,
			maximize,
			maximizeButton,
			tabDropdownLabel,
			showTabDropdown;

		/**
		 * Dropdown to show additional tabs.
		 */
		showTabDropdown = lm.utils.fnBind(this._showAdditionalTabsDropdown, this);
		tabDropdownLabel = this.layoutManager.config.labels.tabDropdown;
		this.tabDropdownButton = new lm.controls.HeaderButton(this, tabDropdownLabel, 'lm_tabdropdown', showTabDropdown);
		this.tabDropdownButton.element.hide();

		/**
		 * Popout control to launch component in new window.
		 */
		if (this._getHeaderSetting('popout')) {
			popout = lm.utils.fnBind(this._onPopoutClick, this);
			label = this._getHeaderSetting('popout');
			new lm.controls.HeaderButton(this, label, 'lm_popout', popout);
		}

		if (this._getHeaderSetting("minimize")) {
			minimizeLabel = this._getHeaderSetting('minimize');
			minimizeButton = new lm.controls.HeaderButton(this, minimizeLabel, 'lm_minimise', undefined);
		}

		/**
		 * Maximize control - set the component to the full size of the layout
		 */
		if (this._getHeaderSetting('maximize')) {
			if (this.layoutManager.config.settings.mode !== "workspace") {
				maximize = lm.utils.fnBind(this.parent.toggleMaximise, this.parent);
			}

			maximizeLabel = this._getHeaderSetting('maximize');

			// TODO
			// whether is a function or not should be a config
			maximizeButton = new lm.controls.HeaderButton(this, maximizeLabel, 'lm_maximise', maximize);

			restoreLabel = this._getHeaderSetting('restore');

			this.parent.on('maximized', function () {
				maximizeButton.element.attr('title', restoreLabel);
			});

			this.parent.on('minimized', function () {
				maximizeButton.element.attr('title', maximizeLabel);
			});
		}

		/**
		 * Close button
		 */
		if (this._isClosable()) {
			if (this.layoutManager.config.settings.mode !== "workspace") {
				closeStack = lm.utils.fnBind(this.parent.remove, this.parent);
			}
			label = this._getHeaderSetting('close');
			this.closeButton = new lm.controls.HeaderButton(this, label, 'lm_close', closeStack);
		}
	},

	/**
	 * Shows drop down for additional tabs when there are too many to display.
	 *
	 * @returns {void}
	 */
	_showAdditionalTabsDropdown: function () {
		this.tabDropdownContainer.show();
	},

	/**
	 * Hides drop down for additional tabs when there are too many to display.
	 *
	 * @returns {void}
	 */
	_hideAdditionalTabsDropdown: function (e) {
		this.tabDropdownContainer.hide();
	},

	/**
	 * Checks whether the header is closable based on the parent config and
	 * the global config.
	 *
	 * @returns {Boolean} Whether the header is closable.
	 */
	_isClosable: function () {
		return this.parent.config.isClosable && this.layoutManager.config.settings.showCloseIcon;
	},

	_onPopoutClick: function () {
		this.parent.emit("popoutRequested");
		// Do nothing the workspaces application should handle the popout behaviour
	},

	/**
	 * Invoked when the header's background is clicked (not it's tabs or controls)
	 *
	 * @param    {jQuery DOM event} event
	 *
	 * @returns {void}
	 */
	_onHeaderClick: function (event) {
		if (event.target === this.element[0]) {
			this.parent.select();
		}
	},

	/**
	 * Pushes the tabs to the tab dropdown if the available space is not sufficient
	 *
	 * @returns {void}
	 */
	_updateTabSizes: function (showTabMenu) {
		if (this.tabs.length === 0) {
			return;
		}

		//Show the menu based on function argument
		this.tabDropdownButton.element.toggle(showTabMenu === true);

		var size = function (val) {
			return val ? 'width' : 'height';
		};
		this.element.css(size(!this.parent._sided), '');
		// this.element[size(this.parent._sided)](this.layoutManager.config.dimensions.headerHeight);
		var availableWidth = this.element.outerWidth() - this.controlsContainer.outerWidth() - this._tabControlOffset,
			cumulativeTabWidth = 0,
			visibleTabWidth = 0,
			tabElement,
			i,
			j,
			marginLeft,
			overlap = 0,
			tabWidth,
			tabOverlapAllowance = this.layoutManager.config.settings.tabOverlapAllowance,
			tabOverlapAllowanceExceeded = false,
			activeIndex = (this.activeContentItem ? this.tabs.indexOf(this.activeContentItem.tab) : 0),
			activeTab = this.tabs[activeIndex];
		if (this.parent._sided)
			availableWidth = this.element.outerHeight() - this.controlsContainer.outerHeight() - this._tabControlOffset;
		this._lastVisibleTabIndex = -1;

		for (i = 0; i < this.tabs.length; i++) {
			tabElement = this.tabs[i].element;

			//Put the tab in the tabContainer so its true width can be checked
			this.tabsContainer.append(tabElement);
			tabWidth = tabElement.outerWidth() + parseInt(tabElement.css('margin-right'), 10);

			cumulativeTabWidth += tabWidth;

			//Include the active tab's width if it isn't already
			//This is to ensure there is room to show the active tab
			if (activeIndex <= i) {
				visibleTabWidth = cumulativeTabWidth;
			} else {
				visibleTabWidth = cumulativeTabWidth + activeTab.element.outerWidth() + parseInt(activeTab.element.css('margin-right'), 10);
			}

			// If the tabs won't fit, check the overlap allowance.
			if (visibleTabWidth > availableWidth) {

				//Once allowance is exceeded, all remaining tabs go to menu.
				if (!tabOverlapAllowanceExceeded) {

					//No overlap for first tab or active tab
					//Overlap spreads among non-active, non-first tabs
					if (activeIndex > 0 && activeIndex <= i) {
						overlap = (visibleTabWidth - availableWidth) / (i - 1);
					} else {
						overlap = (visibleTabWidth - availableWidth) / i;
					}

					//Check overlap against allowance.
					if (overlap < tabOverlapAllowance) {
						for (j = 0; j <= i; j++) {
							marginLeft = (j !== activeIndex && j !== 0) ? '-' + overlap + 'px' : '';
							this.tabs[j].element.css({ 'z-index': i - j, 'margin-left': marginLeft });
						}
						this._lastVisibleTabIndex = i;
						this.tabsContainer.append(tabElement);
					} else {
						tabOverlapAllowanceExceeded = true;
					}

				} else if (i === activeIndex) {
					//Active tab should show even if allowance exceeded. (We left room.)
					tabElement.css({ 'z-index': 'auto', 'margin-left': '' });
					this.tabsContainer.append(tabElement);
				}

				if (tabOverlapAllowanceExceeded && i !== activeIndex) {
					if (showTabMenu) {
						//Tab menu already shown, so we just add to it.
						tabElement.css({ 'z-index': 'auto', 'margin-left': '' });
						this.tabDropdownContainer.append(tabElement);
					} else {
						//We now know the tab menu must be shown, so we have to recalculate everything.
						this._updateTabSizes(true);
						return;
					}
				}

			}
			else {
				this._lastVisibleTabIndex = i;
				tabElement.css({ 'z-index': 'auto', 'margin-left': '' });
				this.tabsContainer.append(tabElement);
			}
		}

	},

	/**
	 * Applies the necessary tab styles without using a dropdown
	 *
	 * @returns {void}
	 */
	_updateTabSizesWithoutDropdown: function (showTabMenu) {
		if (this.tabs.length === 0) {
			return;
		}

		var size = function (val) {
			return val ? 'width' : 'height';
		};
		this.element.css(size(!this.parent._sided), '');
		// this.element[size(this.parent._sided)](this.layoutManager.config.dimensions.headerHeight);
		var availableWidth = this.element.outerWidth() - this.controlsContainer.outerWidth() - this._tabControlOffset,
			cumulativeTabWidth = 0,
			visibleTabWidth = 0,
			tabElement,
			i,
			j,
			marginLeft,
			overlap = 0,
			tabWidth,
			tabOverlapAllowance = this.layoutManager.config.settings.tabOverlapAllowance,
			tabOverlapAllowanceExceeded = false,
			activeIndex = (this.activeContentItem ? this.tabs.indexOf(this.activeContentItem.tab) : 0),
			activeTab = this.tabs[activeIndex];
		if (this.parent._sided)
			availableWidth = this.element.outerHeight() - this.controlsContainer.outerHeight() - this._tabControlOffset;

		for (i = 0; i < this.tabs.length; i++) {
			tabElement = this.tabs[i].element;

			//Put the tab in the tabContainer so its true width can be checked
			this.tabsContainer.append(tabElement);
			tabWidth = tabElement.outerWidth() + parseInt(tabElement.css('margin-right'), 10);

			cumulativeTabWidth += tabWidth;

			//Include the active tab's width if it isn't already
			//This is to ensure there is room to show the active tab
			if (activeIndex <= i) {
				visibleTabWidth = cumulativeTabWidth;
			} else {
				visibleTabWidth = cumulativeTabWidth + activeTab.element.outerWidth() + parseInt(activeTab.element.css('margin-right'), 10);
			}

			tabElement.css({ 'z-index': 'auto', 'margin-left': '' });
			this.tabsContainer.append(tabElement);
		}

	}
});

