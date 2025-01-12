PAYPAL.namespace("widget");
if (typeof YUD == "undefined" || typeof YUE == "undefined") {
    YUD = YAHOO.util.Dom;
    YUE = YAHOO.util.Event;
}
PAYPAL.widget.hideShow = {
    exclusiveMode: false,
    mouseOverMode: false,
    containers: '',
    links: new Array(),
    cancelButtons: new Array(),
    init: function() {
        this.containers = YUD.getElementsByClassName("hideShow");
        for (var i = 0; i < this.containers.length; i++) {
            if (!(YUD.hasClass(this.containers[i], "opened"))) {
                YUD.addClass(this.containers[i], "hide");
            }
            var reg = new RegExp("#" + this.containers[i].id);
            checkHrefs = function(el) {
                return (el.getAttribute("href").match(reg));
            }
            this.links = YUD.getElementsBy(checkHrefs, "a");
            this.cancelButtons = YUD.getElementsByClassName("closer", "*", this.containers[i]);
            this.containers[i].hideShowLinks = this.links;
            this.containers[i].cancelButtons = this.cancelButtons;
            for (var j = 0; j < this.links.length; j++) {
                this.links[j].hideShowContainer = this.containers[i];
                if (!(YUD.hasClass(this.containers[i], "opened")) && YUD.hasClass(this.links[j], "opened")) {
                    this.links[j].wasOpened = true;
                    YUD.removeClass(this.links[j], "opened");
                }
                if (this.mouseOverMode) {
                    YUE.addListener(this.links[j], 'mouseover', PAYPAL.widget.hideShow.toggleHideShow);
                } else {
                    YUE.addListener(this.links[j], 'click', PAYPAL.widget.hideShow.toggleHideShow);
                }
            }
            if (this.cancelButtons.length > 0) {
                for (var k = 0; k < this.cancelButtons.length; k++) {
                    this.cancelButtons[k].hideShowContainer = this.containers[i];
                    YUE.addListener(this.cancelButtons[k], 'click', PAYPAL.widget.hideShow.toggleHideShow);
                }
            }
        }
    },
    hide: function(obj) {
        YUD.addClass(obj, "hide");
        YUD.removeClass(obj, "opened");
        if (obj && obj.hideShowLinks) {
            for (var i = 0; i < obj.hideShowLinks.length; i++) {
                if (YUD.hasClass(obj.hideShowLinks[i], "opened")) {
                    YUD.removeClass(obj.hideShowLinks[i], "opened");
                    obj.hideShowLinks[i].wasOpened = true;
                }
            }
        }
    },
    show: function(obj) {
        if (this.exclusiveMode) {
            for (var i = 0; i < this.containers.length; i++) {
                this.hide(this.containers[i]);
            }
        }
        YUD.removeClass(obj, "accessAid");
        YUD.removeClass(obj, "hide");
        YUD.addClass(obj, "opened")
        if (obj && obj.hideShowLinks) {
            for (var i = 0; i < obj.hideShowLinks.length; i++) {
                if (obj.hideShowLinks[i].wasOpened) {
                    YUD.addClass(obj.hideShowLinks[i], "opened");
                    obj.hideShowLinks[i].wasOpened = false;
                }
            }
        }
        var buttons = YUD.getElementsBy(function(elem) {
            return (elem.wasSubmit)
        }, "*", obj);
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = false;
            buttons[i].wasSubmit = false;
        }
    },
    toggleHideShow: function(e) {
        YUE.preventDefault(e);
        var anchor = this;
        var div = anchor.hideShowContainer;
        var ignoreClick = false;
        if (PAYPAL.widget.hideShow.mouseOverMode) {
            for (var i = 0; i < div.cancelButtons.length; i++) {
                if (div.cancelButtons[i] === anchor) {
                    ignoreClick = true;
                }
            }
        } else {
            ignoreClick = false;
        }
        if (YUD.hasClass(div, "opened") && PAYPAL.widget.hideShow.mouseOverMode && !ignoreClick) {} else if (YUD.hasClass(div, "opened")) {
            PAYPAL.widget.hideShow.hide(div);
        } else {
            PAYPAL.widget.hideShow.show(div);
        }
    }
}
YUE.onDOMReady(PAYPAL.widget.hideShow.init);
var onAccordionComplete = new YAHOO.util.CustomEvent('onAccordionComplete');
PAYPAL.widget.Accordion = {
    toggleReady: null,
    allowMultiple: false,
    animate: true,
    animDelayShow: 0.9,
    animDelayHide: 0.8,
    firstRun: true,
    init: function() {
        var header, body, i, autoShow;
        var accordions = YUD.getElementsByClassName('accordion');
        if (!accordions) {
            return;
        }
        YUD.addClass(accordions, 'dynamic');
        for (i = 0; i < accordions.length; i++) {
            boxes = YUD.getElementsByClassName('box', '', accordions[i]);
            for (i = 0; i < boxes.length; i++) {
                header = YUD.getElementsByClassName('header', 'div', boxes[i])[0];
                body = YUD.getElementsByClassName('body', 'div', boxes[i])[0];
                body.defaultHeight = body.offsetHeight;
                YUD.setStyle(body, 'width', body.offsetWidth);
                header.content = body;
                if (YUD.hasClass(boxes[i], 'defaultOpen')) {
                    autoShow = header.content;
                }
                YUE.addListener(header, 'mousedown', PAYPAL.widget.Accordion.toggle);
                YUE.addListener(header, 'mouseover', function(e) {
                    YUD.addClass(this, 'hover');
                });
                YUE.addListener(header, 'mouseout', function(e) {
                    YUD.removeClass(this, 'hover');
                });
            }
            if (autoShow) {
                PAYPAL.widget.Accordion.show(autoShow);
            }
        }
    },
    toggle: function(body) {
        if (this.content) body = this.content;
        var accordion = PAYPAL.widget.Accordion;
        accordion.toggleReady = (accordion.toggleReady === null) ? true : accordion.toggleReady;
        if (YUD.hasClass(body.parentNode, 'open') && accordion.toggleReady) {
            body.defaultHeight = body.offsetHeight;
            accordion.toggleReady = false;
            accordion.hide(body);
        } else if (accordion.toggleReady) {
            accordion.toggleReady = false;
            accordion.show(body);
        }
    },
    toggleCustom: function() {
        var body = this.getEl();
        var box = body.parentNode;
        box.open = box.open ? false : true;
        if (!box.open) {
            YUD.removeClass(box, 'open');
        } else {
            YUD.setStyle(body, 'height', 'auto');
        }
        PAYPAL.widget.Accordion.toggleReady = true;
        if (!PAYPAL.widget.Accordion.firstRun) {
            onAccordionComplete.fire(true);
        } else {
            PAYPAL.widget.Accordion.firstRun = false;
        }
        var browsername = navigator.appName.toLowerCase();
        if (browsername == "microsoft internet explorer") {
            body.style.filter = "";
        }
    },
    show: function(body) {
        if (!PAYPAL.widget.Accordion.allowMultiple) {
            PAYPAL.widget.Accordion.hideAll();
        }
        YUD.addClass(body.parentNode, 'open');
        if (PAYPAL.widget.Accordion.animate) {
            var attributes = {
                height: {
                    from: 0,
                    to: body.defaultHeight
                },
                opacity: {
                    from: 0,
                    to: 1
                }
            };
            var anim = new YAHOO.util.Anim(body, attributes, PAYPAL.widget.Accordion.animDelayShow, YAHOO.util.Easing.backOut);
            anim.animate();
            anim.onComplete.subscribe(PAYPAL.widget.Accordion.toggleCustom);
        } else {
            var box = body.parentNode;
            box.open = box.open ? false : true;
            if (!box.open) {
                YUD.removeClass(box, 'open');
            } else {
                YUD.setStyle(body, 'height', 'auto');
            }
            PAYPAL.widget.Accordion.toggleReady = true;
            if (!PAYPAL.widget.Accordion.firstRun) {
                onAccordionComplete.fire(true);
            } else {
                PAYPAL.widget.Accordion.firstRun = false;
            }
        }
    },
    hide: function(body) {
        if (PAYPAL.widget.Accordion.animate) {
            var attributes = {
                height: {
                    from: body.defaultHeight,
                    to: 0
                },
                opacity: {
                    from: 1,
                    to: 0
                }
            };
            var anim = new YAHOO.util.Anim(body, attributes, PAYPAL.widget.Accordion.animDelayHide, YAHOO.util.Easing.easeBoth);
            anim.animate();
            anim.onComplete.subscribe(PAYPAL.widget.Accordion.toggleCustom);
        } else {
            var box = body.parentNode;
            box.open = box.open ? false : true;
            if (!box.open) {
                YUD.removeClass(box, 'open');
            } else {
                YUD.setStyle(body, 'height', 'auto');
            }
            PAYPAL.widget.Accordion.toggleReady = true;
            if (!PAYPAL.widget.Accordion.firstRun) {
                onAccordionComplete.fire(true);
            } else {
                PAYPAL.widget.Accordion.firstRun = false;
            }
        }
    },
    hideAll: function() {
        var boxes = YUD.getElementsByClassName('box');
        for (i = 0; i < boxes.length; i++) {
            if (YUD.hasClass(boxes[i], 'open')) {
                var body = boxes[i].getElementsByTagName('div')[1];
                PAYPAL.widget.Accordion.hide(body);
            }
        }
    },
    toggleAccordion: function(nodeClass) {
        var box = YUD.getElementsByClassName(nodeClass);
        if (box[0]) {
            var body = box[0].getElementsByTagName('div')[0];
            PAYPAL.widget.Accordion.toggle(body);
        }
    },
    reedIsOpen: function(nodeClass) {
        var node = YUD.getElementsByClassName(nodeClass);
        if (node[0]) {
            return (YUD.hasClass(node[0], 'open')) ? true : false;
        } else {
            return false;
        }
    }
};
PAYPAL.namespace("Merchant.ButtonDesigner");
onPricePerOption = new YAHOO.util.CustomEvent('onPricePerOption');
onDropdownPriceChange = new YAHOO.util.CustomEvent('onDropdownPriceChange');
onItemDetailsChange = new YAHOO.util.CustomEvent('onItemDetailsChange');
YUD = YAHOO.util.Dom;
YUE = YAHOO.util.Event;
PPW = PAYPAL.widget;
wHideShow = PAYPAL.widget.hideShow;
PAYPAL.Merchant.ButtonDesigner.Master = {
    timeOut: 13,
    sessionLightbox: null,
    init: function() {
        PPW.Accordion.init();
        var header = document.getElementById("headline");
        if (header) {
            header = header.getElementsByTagName("h2");
            YUD.removeClass(header, 'accessAid');
        }
        var content = document.getElementById("jsContent");
        YUD.removeClass(content, 'accessAid');
        var links = YUD.getElementsByClassName('submitPage', '', content);
        var linksLen = links.length;
        for (var i = 0; i < linksLen; i++) {
            YUE.on(links[i], 'click', BD_MASTER.submitLink);
        }
        BD_STEP1.init();
        BD_CBUTTON.init();
        setTimeout("BD_MASTER.showTimeout()", (BD_MASTER.timeOut * 60 * 1000));
        YUE.on("timeoutSubmit", 'click', BD_MASTER.submitTimeout);
        YUE.on("timeoutCancel", 'click', BD_MASTER.submitTimeout);
        if (document.getElementById('pageLoadMsg')) {
            YUD.addClass('pageLoadMsg', 'accessAid');
        }
    },
    showTimeout: function() {
        BD_MASTER.sessionLightbox = new PAYPAL.util.Lightbox("timeoutLightbox");
        BD_MASTER.sessionLightbox.show();
    },
    submitTimeout: function(e) {
        YUE.preventDefault(e);
        var form = document.getElementById("buttonDesignerForm");
        if (!form) {
            form = document.getElementById("secondaryButtonsForm");
        }
        var fakeSubmit = document.getElementById("fakeSubmit");
        if (this.getAttribute('name') == "timeout_session") {
            fakeSubmit.setAttribute('value', "timeout_session");
            fakeSubmit.setAttribute('name', "timeout_session");
        } else {
            fakeSubmit.setAttribute('value', "cancel_timeout_session");
            fakeSubmit.setAttribute('name', "cancel_timeout_session");
        }
        form.submit();
        BD_MASTER.sessionLightbox.close();
    },
    fadeOut: function(obj) {
        function fade(ele) {
            if (!YUD.hasClass(ele, "fadedOut")) {
                YUD.addClass(ele, "fadedOut");
            }
            var tags = ele.getElementsByTagName("input");
            if (tags.length > 0) {
                disableFields(tags);
            }
            tags = ele.getElementsByTagName("textarea");
            if (tags.length > 0) {
                disableFields(tags);
            }
            tags = ele.getElementsByTagName("select");
            if (tags.length > 0) {
                disableFields(tags);
            }
            tags = ele.getElementsByTagName("button");
            if (tags.length > 0) {
                disableFields(tags);
            }

            function disableFields(inputs) {
                var inputsLen = inputs.length;
                for (j = 0; j < inputsLen; j++) {
                    inputs[j].disabled = true;
                }
            }
            ele.faded = true;
        }
        if (obj && obj !== 'undefined') {
            if (obj instanceof Array) {
                var objLen = obj.length;
                for (var i = 0; i < objLen; i++) {
                    fade(obj[i]);
                }
            } else {
                fade(obj);
            }
        }
    },
    fadeIn: function(obj) {
        function unFade(ele) {
            if (arguments.length > 1) {
                var reEnableFields = arguments[1];
            } else {
                var reEnableFields = true;
            }
            if (YUD.hasClass(ele, "fadedOut")) {
                YUD.removeClass(ele, "fadedOut");
            }
            if (reEnableFields) {
                var tags = ele.getElementsByTagName("input");
                if (tags.length > 0) {
                    enableFields(tags);
                }
                tags = ele.getElementsByTagName("textarea");
                if (tags.length > 0) {
                    enableFields(tags);
                }
                tags = ele.getElementsByTagName("select");
                if (tags.length > 0) {
                    enableFields(tags);
                }
                tags = ele.getElementsByTagName("button");
                if (tags.length > 0) {
                    enableFields(tags);
                }
            }

            function enableFields(inputs) {
                var inputsLen = inputs.length;
                for (var j = 0; j < inputsLen; j++) {
                    inputs[j].disabled = false;
                }
            }
            ele.faded = false;
        }
        if (obj && obj !== 'undefined') {
            if (arguments.length > 1) {
                var reEnableFields = arguments[1];
            } else {
                var reEnableFields = true;
            }
            if (obj instanceof Array) {
                var objLen = obj.length;
                for (var i = 0; i < objLen; i++) {
                    unFade(obj[i]);
                }
            } else {
                unFade(obj, reEnableFields);
            }
        }
    },
    disableLink: function(ele) {
        ele.onclick = function(e) {
            YUE.preventDefault(e);
        }
    },
    enableLink: function(ele) {
        ele.onclick = null;
    },
    toggleFade: function(ele) {
        try {
            if ((ele.faded && ele.faded == true) || YUD.hasClass(ele, "fadedOut")) {
                BD_MASTER.fadeIn(ele);
            } else {
                BD_MASTER.fadeOut(ele);
            }
        } catch (e) {}
    },
    submitLink: function(e) {
        YUE.preventDefault(e);
        var form = document.getElementById('buttonDesignerForm');
        var fakeField = document.getElementById('fakeSubmit');
        var onBoardingCmd = document.getElementById('onboarding_cmd');
        fakeField.name = getCmd(this.href);
        fakeField.value = this.innerHTML;
        if (YUD.hasClass(this, 'loginSubmit')) {
            onBoardingCmd.value = 'login';
        } else if (YUD.hasClass(this, 'signupSubmit')) {
            onBoardingCmd.value = 'signup';
        } else if (YUD.hasClass(this, 'upgradeSubmit')) {
            onBoardingCmd.value = 'upgrade';
        } else if (YUD.hasClass(this, 'loginSavedSubmit')) {
            onBoardingCmd.value = 'login-to-saved';
        }
        form.submit();

        function getCmd(str) {
            if (str.match("cmd") != null) {
                str = str.split('?')[1];
                str = str.split('&');
                var strLen = str.length;
                for (var i = 0; i < strLen; i++) {
                    if (str[i].match("cmd") != null) {
                        return str[i].split('=')[1];
                    }
                }
                return false;
            } else {
                return false;
            }
        }
        return false;
    },
    selectOnFocusIn: function() {
        try {
            var eSrc = window.event.srcElement;
            if (eSrc) {
                eSrc.tmpIndex = eSrc.selectedIndex;
            }
        } catch (e) {
            HandleError(e, false);
        }
    },
    selectOnFocus: function() {
        try {
            var eSrc = window.event.srcElement;
            if (eSrc) {
                eSrc.selectedIndex = eSrc.tmpIndex;
            }
        } catch (e) {
            HandleError(e, false);
        }
    },
    loadScript: function(src) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        head.appendChild(script);
    },
    isArray: function(obj) {
        return testObject && !(testObject.propertyIsEnumerable('length')) && typeof testObject === 'object' && typeof testObject.length === 'number';
    },
    isFunction: function(a) {
        return typeof a == 'function';
    },
    isNull: function(a) {
        return typeof a == 'object' && !a;
    },
    isNumber: function(a) {
        return typeof a == 'number' && isFinite(a);
    },
    isObject: function(a) {
        return (typeof a == 'object' && a) || isFunction(a);
    }
};
PAYPAL.Merchant.ButtonDesigner.StepOne = {
    buttonTypeIds: ['products', 'services', 'subscriptions', 'donations', 'gift_certs'],
    overrideMsgShown: false,
    activeButtonType: '',
    frequencyDOM: {},
    currencySymbol: '$',
    init: function() {
        var stepOne = document.getElementById("stepOne");
        if (stepOne) {
            this.show('accordionContainer');
            var fades = YUD.getElementsByClassName("fadedOut", '', stepOne);
            BD_MASTER.fadeOut(fades);
            var inputs = stepOne.getElementsByTagName('input');
            var inputsLen = inputs.length;
            for (var i = 0; i < inputsLen; i++) {
                var inputType = inputs[i].type.toLowerCase();
                if (inputType == "radio" || inputType == "checkbox") {
                    YUE.on(inputs[i], 'click', this.itemDetailsChangeHandler);
                } else {
                    if (inputType.toLowerCase() == "text") {
                        YUE.on(inputs[i], 'keydown', this.captureEnter);
                    }
                    YUE.on(inputs[i], 'change', this.itemDetailsChangeHandler);
                }
            }
            var selects = stepOne.getElementsByTagName('select');
            var selectsLen = selects.length;
            for (var i = 0; i < selectsLen; i++) {
                YUE.on(selects[i], 'change', this.itemDetailsChangeHandler);
            }
            var shippingType = document.getElementById('itemFlatShippingType');
            var shippingWeight = YUD.getElementsByClassName('itemWeight', 'div', stepOne)[0];
            if (shippingType && shippingType.checked) {
                BD_MASTER.fadeOut(shippingWeight);
            }
            this.frequencyDOM = YUD.getElementsByClassName('ddpOptionFrequency', 'select', 'optionsPriceContainer')[0];
            if (this.frequencyDOM) {
                this.frequencyDOM = this.frequencyDOM.cloneNode(true);
            }
            YUE.addListener('subscriptionBillingAmountCurrency', 'change', function() {
                BD_STEP1.currencySymbol = this.options[this.selectedIndex].title;
                BD_STEP1.currencyCode = this.value;
            });
            onItemDetailsChange.subscribe(this.itemDetailsChangeSubscriber);
            onItemDetailsChange.subscribe(BD_CBUTTON.updateCustomizeButtonSection);
            onItemDetailsChange.subscribe(BD_CBUTTON.dropdownCurrencyChange);
            onPricePerOption.subscribe(this.priceOptionSubscriber);
            onAccordionComplete.subscribe(this.accordionSubscriber);
            this.itemDetailsChangeHandler();
        }
    },
    donationDropDownChange: function(e) {
        var selectedTypeValue = document.getElementById("buttonType");
        if (selectedTypeValue.options[selectedTypeValue.selectedIndex].value == 'donations') {
            var content = document.getElementById("jsContent");
            YUD.replaceClass(content, 'show', 'hide');
            var header = document.getElementById("headline");
            header = header.getElementsByTagName("h2");
            YUD.replaceClass(header, 'show', 'hide');
            var pageLoadMsg = document.getElementById("pageLoadMsg");
            YUD.replaceClass(pageLoadMsg, 'accessAid', 'show');
            var redirectUrl = document.getElementById("donateUrl").value;
            window.location = redirectUrl;
        }
    },
    itemDetailsChangeHandler: function(e) {
        var stepOne = document.getElementById("stepOne");
        var changeElements = [];
        if (!e) {
            var bType = document.getElementById('buttonType');
            var buttonType = bType.options[bType.selectedIndex].value;
            var subButtonTypes = YUD.getElementsByClassName('subButtonType', '', stepOne);
            var selectedSubButtonType = null;
            if (subButtonTypes.length > 0) {
                var subButtonTypesLen = subButtonTypes.length;
                for (var i = 0; i < subButtonTypesLen; i++) {
                    if (subButtonTypes[i].checked) {
                        selectedSubButtonType = subButtonTypes[i].value;
                    }
                }
            }
            changeElements.eventTarget = bType;
            changeElements.button_type = buttonType;
            changeElements.sub_button_type = selectedSubButtonType;
        } else {
            var elTarget = YUE.getTarget(e);
            if (elTarget.nodeName.toLowerCase() == "input") {
                changeElements[elTarget.name] = elTarget.value;
            } else if (elTarget.nodeName.toLowerCase() == "select") {
                var selectedVal = elTarget.options[elTarget.selectedIndex].value;
                changeElements[elTarget.name] = selectedVal;
            }
            if (elTarget.value == "products" || elTarget.value == "services") {
                if (elTarget.value == 'products') {
                    document.getElementById('radioAddToCartButton').checked = true;
                    document.getElementById('radioAddToCartButton').click();
                } else {
                    document.getElementById('radioBuyNowButton').checked = true;
                    document.getElementById('radioBuyNowButton').click();
                }
                var subButtonTypes = YUD.getElementsByClassName('subButtonType', '', stepOne);
                if (subButtonTypes.length > 0) {
                    var subButtonTypesLen = subButtonTypes.length;
                    for (var i = 0; i < subButtonTypesLen; i++) {
                        if (subButtonTypes[i].checked) {
                            changeElements.sub_button_type = subButtonTypes[i].value;
                        }
                    }
                }
            } else if (elTarget.name == 'sub_button_type') {
                var buttonType = document.getElementById('buttonType');
                var selectedVal = buttonType.options[buttonType.selectedIndex].value;
                changeElements.button_type = selectedVal;
            }
            changeElements.eventTarget = elTarget;
        }
        if (changeElements.button_type == 'payment_plan' || changeElements.button_type == 'auto_billing') {
            var content = document.getElementById("jsContent");
            YUD.replaceClass(content, 'show', 'hide');
            var header = document.getElementById("headline");
            header = header.getElementsByTagName("h2");
            YUD.replaceClass(header, 'show', 'hide');
            var pageLoadMsg = document.getElementById("pageLoadMsg");
            YUD.replaceClass(pageLoadMsg, 'accessAid', 'show');
            var fakeField = document.getElementById('fakeSubmit');
            var cmd = document.getElementById('cmd');
            cmd.value = '_button-designer';
            fakeField.name = 'factory_type';
            fakeField.value = changeElements.button_type;
            document.getElementById('customImageUrl').value = '';
            this.form.submit();
        }
        onItemDetailsChange.fire(changeElements);
    },
    itemDetailsChangeSubscriber: function(type, obj) {
        var eventTarget = obj[0].eventTarget;
        if (obj[0].button_type) {
            var stepOne = document.getElementById('stepOne');
            var productItemPrice = YUD.getElementsByClassName('products pricing', '', stepOne)[0];
            var donationItemPrice = YUD.getElementsByClassName('contributionAmount', '', stepOne)[0].parentNode;
            if (obj[0].button_type != BD_STEP1.activeButtonType) {
                var buttonTypeIdsLen = BD_STEP1.buttonTypeIds.length;
                for (var i = 0; i < buttonTypeIdsLen; i++) {
                    var currentButtonType = BD_STEP1.buttonTypeIds[i];
                    if (obj[0].button_type == currentButtonType) {
                        BD_STEP1.prevButtonType = BD_STEP1.activeButtonType;
                        BD_STEP1.activeButtonType = currentButtonType;
                        switch (currentButtonType) {
                            case 'products':
                            case 'services':
                                BD_MASTER.fadeOut(donationItemPrice);
                                BD_MASTER.fadeIn(productItemPrice);
                                BD_STEP1.show('products');
                                BD_STEP1.updateProductOptions();
                                if (BD_STEP1.prevButtonType == 'subscriptions') {
                                    var dropdownPrice = document.getElementById("dropdownPrice");
                                    if (dropdownPrice.checked) {
                                        dropdownPrice.click();
                                    }
                                }
                                break;
                            case 'subscriptions':
                                BD_STEP1.show('subscriptions');
                                if (BD_STEP1.prevButtonType == 'products' || BD_STEP1.prevButtonType == 'services') {
                                    var dropdownPrice = document.getElementById("dropdownPrice");
                                    if (dropdownPrice.checked) {
                                        dropdownPrice.click();
                                    }
                                }
                                break;
                            case 'donations':
                                BD_MASTER.fadeOut(productItemPrice);
                                BD_MASTER.fadeIn(donationItemPrice);
                                BD_STEP1.show('donations');
                                break;
                            case 'gift_certs':
                                BD_STEP1.show('gift_certs');
                                break;
                        }
                    } else {
                        BD_STEP1.hide(currentButtonType);
                    }
                }
            }
        }
        if (obj[0].item_price_currency || obj[0].ddp_option_currency) {
            var currencyCode = (obj[0].item_price_currency) ? obj[0].item_price_currency : obj[0].ddp_option_currency;
            var currencyLabels = YUD.getElementsByClassName('currencyLabel', '', "stepOne");
            var currencyLabelsLen = currencyLabels.length;
            for (var i = 0; i < currencyLabelsLen; i++) {
                currencyLabels[i].innerHTML = currencyCode;
            }
            var currencySelects = YUD.getElementsByClassName('currencySelect', '', "stepOne");
            var currencySelectsLen = currencySelects.length;
            for (var i = 0; i < currencySelectsLen; i++) {
                if (currencySelects[i] != eventTarget.id) {
                    var currencyOptionsLen = currencySelects[i].options.length;
                    for (var j = 0; j < currencyOptionsLen; j++) {
                        if (currencySelects[i].options[j].value == currencyCode) {
                            currencySelects[i].options[j].selected = true;
                        }
                    }
                }
            }
        }
        if (obj[0].product_id) {
            var itemID = document.getElementById('itemID');
            itemID.value = obj[0].product_id;
        }
        if (obj[0].item_shipping_type || obj[0].item_tax_type) {
            BD_STEP1.updateProductOptions();
        }
        if (obj[0].subscription_id) {
            var subscriptionID = document.getElementById('subscriptionID');
            subscriptionID.value = obj[0].subscription_id;
        }
        if (obj[0].subscriptions_offer_trial) {
            if (eventTarget.checked) {
                BD_STEP1.show('trialOfferOptions');
            } else {
                BD_STEP1.hide('trialOfferOptions');
            }
        }
        if (obj[0].subscriptions_offer_another_trial) {
            if (eventTarget.checked && eventTarget.value == 1) {
                BD_STEP1.show('secondTrialOfferOptions');
            } else {
                BD_STEP1.hide('secondTrialOfferOptions');
            }
        }
        if (obj[0].donation_type) {
            if (obj[0].donation_type == 'fixed') {
                BD_STEP1.show('fixedDonationAmountContainer');
                BD_STEP1.hide('donationAmountContainer');
            } else {
                BD_STEP1.hide('fixedDonationAmountContainer');
                BD_STEP1.show('donationAmountContainer');
            }
        }
        if (obj[0].gc_amount_type) {
            if (obj[0].gc_amount_type == 'custom') {
                BD_STEP1.hide('gcFixedAmountContainer');
            } else {
                BD_STEP1.show('gcFixedAmountContainer');
            }
        }
    },
    accordionSubscriber: function(args) {
        var y = YUD.getY('stepOne') - 18;
        window.scrollTo(0, y);
    },
    priceOptionSubscriber: function(type, obj) {
        var stepOne = document.getElementById("stepOne");
        var itemPriceContainer = YUD.getElementsByClassName('products pricing', '', stepOne)[0];
        var buttonType = document.getElementById('buttonType');
        this.activeButtonType = buttonType.options[buttonType.selectedIndex].value;
        if (this.activeButtonType == 'subscriptions') {
            itemPriceContainer = document.getElementById('rbFixedAmount');
        }
        if (this.activeButtonType == "products" || this.activeButtonType == "services" || this.activeButtonType == "subscriptions") {
            if (obj[0].hideItemPrice) {
                wHideShow.hide(itemPriceContainer);
            } else {
                wHideShow.show(itemPriceContainer);
            }
            if (obj[0].disableItemPrice) {
                BD_MASTER.fadeOut(itemPriceContainer);
            } else {
                BD_MASTER.fadeIn(itemPriceContainer);
            }
        }
        var optionsPriceContainer = document.getElementById("optionsPriceContainer");
        var ddpOptionCurrency = YUD.getElementsByClassName('ddpOptionCurrency', '', optionsPriceContainer);
        var ddpOptionFrequency = YUD.getElementsByClassName('ddpOptionFrequency', '', optionsPriceContainer);
        if (this.activeButtonType == 'subscriptions' && document.getElementById("dropdownPrice").checked) {
            YUD.replaceClass(ddpOptionCurrency, 'show', 'hide');
            for (i = 0, ln = ddpOptionFrequency.length; i < ln; i++) {
                ddpOptionFrequency[i].disabled = false;
                YUD.removeClass(ddpOptionFrequency[i], 'hide')
            }
        } else {
            YUD.replaceClass(ddpOptionCurrency, 'hide', 'show');
            for (i = 0, ln = ddpOptionFrequency.length; i < ln; i++) {
                ddpOptionFrequency[i].disabled = true;
                YUD.addClass(ddpOptionFrequency[i], 'hide')
            }
        }
    },
    updateProductOptions: function() {
        var itemSavedShippingType = document.getElementById('itemSavedShippingType');
        var itemShippingAmount = document.getElementById('itemFlatShippingAmount');
        var itemWeight = YUD.getElementsByClassName('itemWeight')[0];
        var itemSavedTaxRate = document.getElementById('itemSavedTaxRate');
        var itemTaxRate = document.getElementById('itemTaxRate');
        if (itemSavedTaxRate) {
            if (itemSavedTaxRate.checked) {
                itemTaxRate.disabled = true;
            } else {
                itemTaxRate.disabled = false;
            }
        }
        if (itemSavedShippingType) {
            if (itemSavedShippingType.checked) {
                BD_MASTER.fadeIn(itemWeight);
                itemShippingAmount.disabled = true;
                itemWeight.focus();
            } else {
                BD_MASTER.fadeOut(itemWeight);
                itemShippingAmount.disabled = false;
            }
        }
    },
    buildGiftCertificatePreview: function() {
        var secureServer = document.getElementById("secureServerName").value;
        var logoURL = document.getElementById('giftCertificateLogoURL').value;
        var shopURL = document.getElementById('giftCertificateShopURL').value;
        var gcColor = document.getElementById('gcBackgroundColor');
        var gcColor = gcColor.options[gcColor.selectedIndex].value;
        var gcTheme = document.getElementById('gcBackgroundTheme');
        var gcTheme = gcTheme.options[gcTheme.selectedIndex].value;
        var url = 'https://' + secureServer + '/cgi-bin/webscr?cmd=xpt/Incentive/popup/PiePrintableMerchGC&code=oegc';
        if (YUD.getElementsByClassName('gcBackgroundType')[0].checked == true) {
            url += '&style_color=' + gcColor;
        } else if (YUD.getElementsByClassName('gcBackgroundType')[1].checked == true) {
            url += '&style_theme=' + gcTheme;
        } else {
            url += '&style_color=BLU';
        }
        url += '&logo_image_custom=' + logoURL;
        url += '&url_custom=' + shopURL;
        window.open(url, null, 'scrollbars,resizable,toolbar,status,width=640,height=480,left=50,top=50');
    },
    hide: function(elClass) {
        var stepOne = document.getElementById("stepOne");
        var elements = YUD.getElementsByClassName(elClass, '', stepOne);
        var elementsLen = elements.length;
        for (var i = 0; i < elementsLen; i++) {
            if (!YUD.hasClass(elements[i], 'accessAid')) {
                YUD.addClass(elements, 'accessAid');
            }
            if (YUD.hasClass(elements[i], 'accessAid')) {
                BD_MASTER.fadeOut(elements[i]);
            }
        }
    },
    show: function(elClass) {
        var stepOne = document.getElementById("stepOne");
        var elements = YUD.getElementsByClassName(elClass, '', stepOne);
        var elementsLen = elements.length;
        for (var i = 0; i < elementsLen; i++) {
            if (YUD.hasClass(elements[i], 'accessAid')) {
                YUD.removeClass(elements[i], 'accessAid');
                BD_MASTER.fadeIn(elements[i]);
            }
        }
    },
    captureEnter: function(e) {
        var keyPressed = e.charCode || e.keyCode;
        var target = e.target || e.srcElement;
        var validElements = /INPUT/i;
        var omitElements = /SUBMIT|IMAGE/i;
        if ((keyPressed == 13) && (validElements.test(target.nodeName)) && (!omitElements.test(target.type))) {
            YUE.preventDefault(e);
        }
    }
};
YUE.addListener('buttonType', 'change', PAYPAL.Merchant.ButtonDesigner.StepOne.donationDropDownChange);
PAYPAL.Merchant.ButtonDesigner.CustomizeButton = {
    numOptionsPrice: 0,
    numOptions1: 0,
    numOptions2: 0,
    numOptions3: 0,
    numOptions4: 0,
    activeDropdown: 0,
    activeTextfield: 0,
    buttonType: "",
    ddPriceStructure: new Object,
    ddStructure: new Array(),
    tfStructure: new Array(),
    optionCounter: 0,
    init: function() {
        var dropdownPrice = document.getElementById("dropdownPrice");
        if (dropdownPrice) {
            YUE.addListener(dropdownPrice, 'click', this.showDropdownPrice, this);
        }
        var dropdown = document.getElementById("dropdown");
        if (dropdown) {
            YUE.addListener(dropdown, 'click', this.showDropdown, this);
        }
        var textfield = document.getElementById("textfield");
        if (textfield) {
            YUE.addListener(textfield, 'click', this.showTextfield, this);
        }
        var addOptionPrice = document.getElementById("addOptionPrice");
        if (addOptionPrice) {
            YUE.addListener(addOptionPrice, 'click', this.addNewOptionPrice, this);
        }
        var removeOptionPrice = document.getElementById("removeOptionPrice");
        if (removeOptionPrice) {
            YUE.addListener(removeOptionPrice, 'click', this.removeOptionsPrice, this);
        }
        var saveOptionPrice = document.getElementById("saveOptionPrice");
        if (saveOptionPrice) {
            YUE.addListener(saveOptionPrice, 'click', this.saveDropdownPrice, this);
        }
        var cancelOptionPrice = document.getElementById("cancelOptionPrice");
        if (cancelOptionPrice) {
            YUE.addListener(cancelOptionPrice, 'click', this.cancelPricePerOption, this);
        }
        var editDropdownPrice = document.getElementById("editDropdownPrice");
        if (editDropdownPrice) {
            YUE.addListener(editDropdownPrice, 'click', this.editDropdownPrice, this);
        }
        var deleteDropdownPrice = document.getElementById("deleteDropdownPrice");
        if (deleteDropdownPrice) {
            YUE.addListener(deleteDropdownPrice, 'click', this.deleteDropdownPrice, this);
        }
        var addOption = YUD.getElementsByClassName("addOption");
        if (addOption) {
            YUE.addListener(addOption, 'click', this.addNewOption, this);
        }
        var saveOption = YUD.getElementsByClassName("saveOption");
        if (saveOption) {
            YUE.addListener(saveOption, 'click', this.saveDropdown, this);
        }
        var cancelOption = YUD.getElementsByClassName("cancelOption");
        if (cancelOption) {
            YUE.addListener(cancelOption, 'click', this.cancelOption, this);
        }
        var editDropdown = YUD.getElementsByClassName("editDropdown");
        if (editDropdown) {
            YUE.addListener(editDropdown, 'click', this.editDropdown, this);
        }
        var deleteDropdown = YUD.getElementsByClassName("deleteDropdown");
        if (deleteDropdown) {
            YUE.addListener(deleteDropdown, 'click', this.deleteDropdown, this);
        }
        var addNewDropdown = document.getElementById("addNewDropdown");
        if (addNewDropdown) {
            YUE.addListener(addNewDropdown, 'click', this.addNewDropdown, this);
        }
        var saveTextfield = YUD.getElementsByClassName("saveTextfield");
        if (saveTextfield) {
            YUE.addListener(saveTextfield, 'click', this.saveTextfield, this);
        }
        var editTextfield = YUD.getElementsByClassName("editTextfield");
        if (editTextfield) {
            YUE.addListener(editTextfield, 'click', this.editTextfield, this);
        }
        var deleteTextfield = YUD.getElementsByClassName("deleteTextfield");
        if (deleteTextfield) {
            YUE.addListener(deleteTextfield, 'click', this.deleteTextfield, this);
        }
        var cancelTextfield = YUD.getElementsByClassName("cancelTextfield");
        if (cancelTextfield) {
            YUE.addListener(cancelTextfield, 'click', this.cancelTextfield, this);
        }
        var addNewTextfield = document.getElementById("addNewTextfield");
        if (addNewTextfield) {
            YUE.addListener(addNewTextfield, 'click', this.addNewTextfield, this);
        }
        var buttonAppLink = document.getElementById("buttonAppLink");
        if (buttonAppLink) {
            YUE.addListener(buttonAppLink, 'click', this.toggleButtonAppSection, this);
        }
        var paypalButton = document.getElementById("paypalButton");
        if (paypalButton) {
            YUE.addListener(paypalButton, 'click', this.showPaypalButtonSection, this);
        }
        var customButton = document.getElementById("customButton");
        if (customButton) {
            YUE.addListener(customButton, 'click', this.showCustomButtonSection, this);
        }
        var smallButton = document.getElementById("smallButton");
        if (smallButton) {
            YUE.addListener(smallButton, 'click', this.displaySmallImage, this);
        }
        var ccLogos = document.getElementById("ccLogos");
        if (ccLogos) {
            YUE.addListener(ccLogos, 'click', this.displayCCImage, this);
        }
        var buttonTextBuyNow = document.getElementById("buttonTextBuyNow");
        if (buttonTextBuyNow) {
            YUE.addListener(buttonTextBuyNow, 'change', this.updateImageText);
        }
        var buttonTextSubscribe = document.getElementById("buttonTextSubscribe");
        if (buttonTextSubscribe) {
            YUE.addListener(buttonTextSubscribe, 'change', this.updateImageText);
        }
        var selectCountryLanguage = document.getElementById("selectCountryLanguage");
        if (selectCountryLanguage) {
            YUE.addListener(selectCountryLanguage, 'change', this.updateButtonCountry, this);
        }
        var country_code = document.getElementById("country_code");
        var readOnlyLabel = YUD.getElementsByClassName("readOnlyLabel");
        if (readOnlyLabel) {
            YUE.addListener(readOnlyLabel, 'focus', this.makeFieldReadOnly, this);
        }
        var createButton = document.getElementById("createButton");
        if (createButton) {
            YUE.addListener(createButton, 'click', this.saveDropdownsAndSubmit, this);
        }
        var accordionTabs = YUD.getElementsByClassName("header");
        if (accordionTabs) {
            YUE.addListener(accordionTabs, 'click', this.saveDropdowns, this);
        }
        var exampleLink = YUD.getElementsByClassName("exampleLink");
        if (exampleLink) {
            YUE.addListener(exampleLink, 'click', this.createPopupImage, this);
        }
        var defCurrency = YUD.getElementsByClassName("ddpOptionCurrency", "select", "dropdownPriceSection");
        if (defCurrency) {
            YUE.addListener(defCurrency, 'change', this.updateCurrency, this);
        }
        this.createDropdownPriceStructure();
        this.createDropdownStructure();
        this.createTextfieldStructure();
        var test = YUD.getElementsByClassName("savedDropdownSection");
        var testLen = test.length;
        var cnt = 0;
        for (var i = 0; i < testLen; i++) {
            if (YUD.hasClass(test[i], "opened")) cnt++;
        }
        this.numDropdowns = cnt;
    },
    showDropdownPrice: function() {
        var dropdownPriceSection = document.getElementById("dropdownPriceSection");
        var previewDropdownPriceSection = document.getElementById("previewDropdownPriceSection");
        var savedDropdownPriceSection = document.getElementById("savedDropdownPriceSection");
        var savedDropdownPrice = document.getElementById("savedDropdownPrice");
        if (this.checked) {
            if (dropdownPriceSection) {
                var allInputs = dropdownPriceSection.getElementsByTagName("input");
                var allInputsLen = allInputs.length;
                for (var i = 0; i < allInputsLen; i++) {
                    allInputs[i].disabled = false;
                }
                var allInputs = dropdownPriceSection.getElementsByTagName("select");
                var allInputsLen = allInputs.length;
                for (var i = 0; i < allInputsLen; i++) {
                    allInputs[i].disabled = false;
                }
                onPricePerOption.fire({
                    hideItemPrice: false,
                    disableItemPrice: true
                });
                BD_CBUTTON.displayAddOptionPriceLink();
                var options = YUD.getElementsByClassName("optionRow", "p", "dropdownPriceSection");
                if (options.length == 0) {
                    for (var i = 0; i < 3; i++) {
                        BD_CBUTTON.createNewPriceOption();
                    }
                }
                var optionPrices = YUD.getElementsByClassName("ddpOptionPrice", "input", "dropdownPriceSection");
                var itemPriceField = document.getElementById("itemPrice");
                if (itemPriceField) {
                    var itemPrice = itemPriceField.value;
                    var optionPricesLen = optionPrices.length;
                    for (var i = 0; i < optionPricesLen; i++) {
                        if (optionPrices[i].value == "") {
                            optionPrices[i].value = itemPrice;
                        }
                    }
                }
                BD_CBUTTON.updateCurrency();
                wHideShow.show(dropdownPriceSection);
            }
            BD_CBUTTON.updateOptionsPricePreview();
            if (previewDropdownPriceSection) {
                wHideShow.show(previewDropdownPriceSection);
            }
        } else {
            if (dropdownPriceSection) {
                wHideShow.hide(dropdownPriceSection);
                var allInputs = dropdownPriceSection.getElementsByTagName("input");
                var allInputsLen = allInputs.length;
                for (var i = 0; i < allInputsLen; i++) {
                    allInputs[i].disabled = true;
                }
            }
            if (previewDropdownPriceSection) {
                wHideShow.hide(previewDropdownPriceSection);
            }
            if (savedDropdownPriceSection) {
                savedDropdownPrice.innerHTML = "";
                wHideShow.hide(savedDropdownPriceSection);
            }
            BD_CBUTTON.buildDropdownInfo(0);
            onPricePerOption.fire({
                hideItemPrice: false,
                disableItemPrice: false
            });
        }
    },
    showDropdown: function() {
        if (this.checked) {
            var dropdownSection = document.getElementById("dropdownSection1");
            var previewDropdownSection = document.getElementById("previewDropdownSection1");
            var savedDropdownSection = document.getElementById("savedDropdownSection1");
            if (dropdownSection) {
                wHideShow.show(dropdownSection);
                BD_CBUTTON.activeDropdown = 1;
                var allInputs = dropdownSection.getElementsByTagName("input");
                var allInputsLen = allInputs.length;
                for (var i = 0; i < allInputsLen; i++) {
                    allInputs[i].disabled = false;
                }
                BD_CBUTTON.displayAddOptionLink();
            }
            BD_CBUTTON.recreateOptionsPreview(1);
            if (previewDropdownSection) {
                wHideShow.show(previewDropdownSection);
            }
        } else {
            for (var ddNum = 1; ddNum < 5; ddNum++) {
                var dropdownSection = document.getElementById("dropdownSection" + ddNum);
                var previewDropdownSection = document.getElementById("previewDropdownSection" + ddNum);
                var savedDropdownSection = document.getElementById("savedDropdownSection" + ddNum);
                var savedDropdown = document.getElementById("savedDropdown" + ddNum);
                var addNewDropdownSection = document.getElementById("addNewDropdownSection");
                if (dropdownSection) {
                    wHideShow.hide(dropdownSection);
                }
                if (previewDropdownSection) {
                    wHideShow.hide(previewDropdownSection);
                }
                if (savedDropdownSection) {
                    var allInputs = dropdownSection.getElementsByTagName("input");
                    var allInputsLen = allInputs.length;
                    for (var i = 0; i < allInputsLen; i++) {
                        allInputs[i].disabled = true;
                    }
                    savedDropdown.innerHTML = "";
                    wHideShow.hide(savedDropdownSection);
                }
            }
            if (addNewDropdownSection) {
                wHideShow.hide(addNewDropdownSection);
            }
            BD_CBUTTON.buildDropdownInfo(0);
        }
    },
    showTextfield: function() {
        if (this.checked) {
            var textfieldSection = document.getElementById("textfieldSection1");
            var previewTextfieldSection = document.getElementById("previewTextfieldSection1");
            var savedTextfieldSection = document.getElementById("savedTextfieldSection1");
            if (textfieldSection) {
                wHideShow.show(textfieldSection);
                BD_CBUTTON.activeTextfield = 1;
                var allInputs = textfieldSection.getElementsByTagName("input");
                var allInputsLen = allInputs.length;
                for (var i = 0; i < allInputsLen; i++) {
                    allInputs[i].disabled = false;
                }
            }
            if (previewTextfieldSection) {
                wHideShow.show(previewTextfieldSection);
            }
            BD_CBUTTON.createTextfieldStructure();
        } else {
            for (var tfNum = 1; tfNum < 3; tfNum++) {
                var textfieldSection = document.getElementById("textfieldSection" + tfNum);
                var previewTextfieldSection = document.getElementById("previewTextfieldSection" + tfNum);
                var savedTextfieldSection = document.getElementById("savedTextfieldSection" + tfNum);
                var addNewTextfieldSection = document.getElementById("addNewTextfieldSection");
                var textfieldTitle = YAHOO.util.Dom.get("textfieldTitle" + tfNum);
                var savedTextfield = YAHOO.util.Dom.get("savedTextfield" + tfNum);
                var previewTextfieldTitle = YAHOO.util.Dom.get("previewTextfieldTitle" + tfNum);
                if (textfieldSection) {
                    wHideShow.hide(textfieldSection);
                    textfieldTitle.value = "";
                    var allInputs = textfieldSection.getElementsByTagName("input");
                    var allInputsLen = allInputs.length;
                    for (var i = 0; i < allInputsLen; i++) {
                        allInputs[i].disabled = true;
                    }
                }
                if (previewTextfieldSection) {
                    wHideShow.hide(previewTextfieldSection);
                    previewTextfieldTitle.innerHTML = YAHOO.util.Dom.get("titleStr").value;
                }
                if (savedTextfieldSection) {
                    wHideShow.hide(savedTextfieldSection);
                    savedTextfield.innerHTML = "";
                }
            }
            if (addNewTextfieldSection) {
                wHideShow.hide(addNewTextfieldSection);
            }
        }
    },
    showPaypalButtonSection: function() {
        var paypalButtonSection = document.getElementById("paypalButtonSection");
        var customButtonSection = document.getElementById("customButtonSection");
        var previewImageSection = YUD.getElementsByClassName("previewImageSection")[0];
        var previewCustomImageSection = YUD.getElementsByClassName("previewCustomImageSection")[0];
        if (this.checked) {
            wHideShow.hide(customButtonSection);
            wHideShow.show(paypalButtonSection);
            wHideShow.show(previewImageSection);
            wHideShow.hide(previewCustomImageSection);
        }
    },
    showCustomButtonSection: function() {
        var paypalButtonSection = document.getElementById("paypalButtonSection");
        var customButtonSection = document.getElementById("customButtonSection");
        var previewImageSection = YUD.getElementsByClassName("previewImageSection")[0];
        var previewCustomImageSection = YUD.getElementsByClassName("previewCustomImageSection")[0];
        if (this.checked) {
            wHideShow.hide(paypalButtonSection);
            wHideShow.show(customButtonSection);
            wHideShow.hide(previewImageSection);
            wHideShow.show(previewCustomImageSection);
        }
    },
    toggleButtonAppSection: function(e) {
        YUE.preventDefault(e);
        var buttonAppSection = document.getElementById("buttonAppSection");
        var customizeButtonSection = YUD.getElementsByClassName("customizeButtonSection")[0];
        var borderBox = YUD.getElementsByClassName("borderBox")[0];
        if (YUD.hasClass(this, "collapsed")) {
            YUD.removeClass(this, "collapsed");
            YUD.addClass(this, "expanded");
            if (!(document.getElementById("paypalButton").checked || document.getElementById("customButton").checked)) {
                document.getElementById("paypalButton").checked = true;
            }
            if (BD_CBUTTON.buttonType == "gift_certs" || BD_CBUTTON.buttonType == "donations") {
                YUD.removeClass(borderBox, "heightFix");
            }
            wHideShow.show(buttonAppSection);
        } else if (YUD.hasClass(this, "expanded")) {
            YUD.removeClass(this, "expanded");
            YUD.addClass(this, "collapsed");
            if (BD_CBUTTON.buttonType == "gift_certs" || BD_CBUTTON.buttonType == "donations") {
                YUD.addClass(borderBox, "heightFix");
            }
            wHideShow.hide(buttonAppSection);
        }
    },
    saveDropdownPrice: function(e) {
        YUE.preventDefault(e);
        BD_CBUTTON.saveOptionPrice();
    },
    saveOptionPrice: function() {
        var buttonType = document.getElementById('buttonType');
        buttonType = buttonType.options[buttonType.selectedIndex].value;
        var optionsPriceDropdown = document.getElementById("optionsPriceDropdown");
        var dropdownPriceSection = document.getElementById("dropdownPriceSection");
        var savedDropdownPriceSection = document.getElementById("savedDropdownPriceSection");
        var previewDropdownPriceSection = document.getElementById("previewDropdownPriceSection");
        var optionsPriceContainer = document.getElementById("optionsPriceContainer");
        var options = YUD.getElementsByClassName("optionRow", "p", "dropdownPriceSection");
        var optionNames = YUD.getElementsByClassName("ddpOptionName", "input", "dropdownPriceSection");
        var optionPrices = YUD.getElementsByClassName("ddpOptionPrice", "input", "dropdownPriceSection");
        var testDropdowns = [];
        if (buttonType != 'subscriptions') {
            var defCurrency = YUD.getElementsByClassName("ddpOptionCurrency", "select", "dropdownPriceSection")[0];
            if (defCurrency.options) {
                var defCurrencyValue = defCurrency.options[defCurrency.selectedIndex].value;
            }
        }
        optionNames = YUD.getElementsByClassName("ddpOptionName", "input", "dropdownPriceSection");
        optionPrices = YUD.getElementsByClassName("ddpOptionPrice", "input", "dropdownPriceSection");
        var optionsLen = options.length;
        for (var i = 0; i < optionsLen; i++) {
            if ((optionNames[i].value == null || optionNames[i].value == "") && (optionPrices[i].value == null || optionPrices[i].value == "")) {
                optionsPriceContainer.removeChild(optionNames[i].parentNode);
            }
        }
        if (buttonType != 'subscriptions') {
            options = YUD.getElementsByClassName("optionRow", "p", "dropdownPriceSection");
            if (options.length > 0) {
                var oldOptionCurrency = YUD.getElementsByClassName("ddpOptionCurrency", "", "dropdownPriceSection")[0];
                if (oldOptionCurrency.nodeName != "SELECT") {
                    options[0].removeChild(oldOptionCurrency);
                    var optionCurrency = document.createElement("select");
                    optionCurrency.setAttribute("class", "ddpOptionCurrency");
                    optionCurrency.setAttribute("className", "ddpOptionCurrency");
                    YUE.addListener(optionCurrency, 'change', BD_CBUTTON.updateCurrency, this);
                    var itemCurrencyOpts = YUD.getElementsByClassName("currencySelect", "select", "")[0];
                    var itemCurrencyOptsLen = itemCurrencyOpts.options.length;
                    for (var i = 0; i < itemCurrencyOptsLen; i++) {
                        var opt = new Option(itemCurrencyOpts.options[i].text, itemCurrencyOpts.options[i].value);
                        optionCurrency.options[i] = opt;
                        if (optionCurrency.options[i].value == defCurrencyValue) {
                            optionCurrency.options[i].selected = true;
                        }
                    }
                    options[0].appendChild(optionCurrency);
                }
            }
        }
        BD_CBUTTON.displayAddOptionPriceLink();
        wHideShow.hide(dropdownPriceSection);
        if (BD_CBUTTON.numOptionsPrice == 0) {
            document.getElementById("dropdownPrice").checked = false;
        }
        if (BD_CBUTTON.numOptionsPrice == 0) {
            if (previewDropdownPriceSection) {
                wHideShow.hide(previewDropdownPriceSection);
            }
        } else {
            BD_CBUTTON.updateOptionsPricePreview();
        }
        if (BD_CBUTTON.numOptionsPrice != 0) {
            document.getElementById("savedDropdownPrice").innerHTML = "";
            var ddTitle = document.getElementById("dropdownPriceTitle").value;
            if (ddTitle != "") {
                ddTitle = BD_CBUTTON.escapeText(ddTitle);
                document.getElementById("savedDropdownPrice").innerHTML = ddTitle + ": ";
            }
            options = YUD.getElementsByClassName("optionRow", "p", "dropdownPriceSection");
            optionNames = YUD.getElementsByClassName("ddpOptionName", "input", "dropdownPriceSection");
            optionPrices = YUD.getElementsByClassName("ddpOptionPrice", "input", "dropdownPriceSection");
            if (buttonType == 'subscriptions') {
                optionFrequency = YUD.getElementsByClassName("ddpOptionFrequency", "select", "dropdownPriceSection");
                subscriptionBillingAmountCurrency = document.getElementById('subscriptionBillingAmountCurrency');
                optionCurrencyCode = subscriptionBillingAmountCurrency.options[subscriptionBillingAmountCurrency.selectedIndex].value;
                optionCurrencySymbol = subscriptionBillingAmountCurrency.options[subscriptionBillingAmountCurrency.selectedIndex].title;
                BD_STEP1.currencySymbol = subscriptionBillingAmountCurrency.options[subscriptionBillingAmountCurrency.selectedIndex].title;
            }
            var optionsLen = options.length;
            for (var i = 0; i < optionsLen; i++) {
                var optName = optionNames[i].value;
                var optPrice = optionPrices[i].value;
                var optPriceHTMLEsc = PAYPAL.util.escapeHTML(optPrice);
                if (buttonType == 'subscriptions') {
                    var optFrequency = optionFrequency[i].options[optionFrequency[i].selectedIndex].text;
                }
                if (i != 0) {
                    if (optName != "") {
                        if (buttonType == 'subscriptions') {
                            document.getElementById("savedDropdownPrice").innerHTML = document.getElementById("savedDropdownPrice").innerHTML + " | ";
                        } else {
                            document.getElementById("savedDropdownPrice").innerHTML = document.getElementById("savedDropdownPrice").innerHTML + ", ";
                        }
                    }
                }
                optName = BD_CBUTTON.escapeText(optName);
                if (buttonType == 'subscriptions') {
                    optFrequency = BD_CBUTTON.escapeText(optFrequency);
                    document.getElementById("savedDropdownPrice").innerHTML = document.getElementById("savedDropdownPrice").innerHTML + optName + ": " + optionCurrencySymbol + optPriceHTMLEsc + " " + optionCurrencyCode + " - " + optFrequency;
                } else {
                    document.getElementById("savedDropdownPrice").innerHTML = document.getElementById("savedDropdownPrice").innerHTML + optName;
                }
            }
            wHideShow.show(savedDropdownPriceSection);
        }
        if (BD_CBUTTON.numOptionsPrice == 0) {
            onPricePerOption.fire({
                hideItemPrice: false,
                disableItemPrice: false
            });
        } else {
            onPricePerOption.fire({
                hideItemPrice: true,
                disableItemPrice: false
            });
        }
        BD_CBUTTON.buildDropdownInfo(0);
        BD_CBUTTON.createDropdownPriceStructure();
    },
    cancelPricePerOption: function(e) {
        YUE.preventDefault(e);
        var buttonType = document.getElementById('buttonType');
        var activeButtonType = buttonType.options[buttonType.selectedIndex].value;
        var dropdownPriceSection = document.getElementById("dropdownPriceSection");
        var previewDropdownPriceSection = document.getElementById("previewDropdownPriceSection");
        var savedDropdownPriceSection = document.getElementById("savedDropdownPriceSection");
        var savedDropdownPrice = document.getElementById("savedDropdownPrice");
        var optionsPriceContainer = document.getElementById("optionsPriceContainer");
        var dropdownPrice = document.getElementById("dropdownPrice");
        options = YUD.getElementsByClassName("optionRow", "p", "dropdownPriceSection");
        var optionsLen = options.length;
        var optionFrequency = BD_STEP1.frequencyDOM.cloneNode(true);
        if (activeButtonType == 'subscriptions') {
            YUD.removeClass(optionFrequency, 'hide');
            optionFrequency.disabled = false;
        } else {
            YUD.addClass(optionFrequency, 'hide');
            optionFrequency.disabled = true;
        }
        if (dropdownPriceSection) {
            for (var a = 0; a < optionsLen; a++) {
                optionsPriceContainer.removeChild(options[a]);
            }
        }
        document.getElementById("dropdownPriceTitle").value = BD_CBUTTON.ddPriceStructure.title;
        var ddPriceStructureLen = BD_CBUTTON.ddPriceStructure.options.length;
        for (var j = 0; j < ddPriceStructureLen; j++) {
            var optionsPriceContainer = document.getElementById("optionsPriceContainer");
            var addOptionPrice = document.getElementById("addOptionPrice");
            var parent = document.createElement("p");
            parent.setAttribute("class", "optionRow col-md-9");
            parent.setAttribute("className", "optionRow col-md-9");
            parent.setAttribute("id", BD_CBUTTON.ddPriceStructure.options[j].optionId);
            var optionName = document.createElement("input");
            optionName.setAttribute("type", "text");
            var nm = "ddp_option_name";
            optionName.setAttribute("name", nm);
            optionName.setAttribute("class", "ddpOptionName form-control");
            optionName.setAttribute("className", "ddpOptionName form-control");
            optionName.setAttribute("value", BD_CBUTTON.ddPriceStructure.options[j].optionName);
            optionName.setAttribute("maxlength", "64");
            parent.appendChild(optionName);
            var optionPrice = document.createElement("input");
            optionPrice.setAttribute("type", "text");
            var nm = "ddp_option_price";
            optionPrice.setAttribute("name", nm);
            optionPrice.setAttribute("class", "ddpOptionPrice form-control");
            optionPrice.setAttribute("className", "ddpOptionPrice form-control");
            optionPrice.setAttribute("value", BD_CBUTTON.ddPriceStructure.options[j].optionPrice);
            parent.appendChild(optionPrice);
            if (j == 0) {
                BD_CBUTTON.numOptionsPrice = 0;
            }
            if (BD_CBUTTON.numOptionsPrice == 0) {
                var optionCurrency = document.createElement("select");
                if (activeButtonType == 'subscriptions') {
                    optionCurrency.setAttribute("class", "ddpOptionCurrency hide");
                    optionCurrency.setAttribute("className", "ddpOptionCurrency hide");
                } else {
                    optionCurrency.setAttribute("class", "ddpOptionCurrency");
                    optionCurrency.setAttribute("className", "ddpOptionCurrency");
                }
                YUE.addListener(optionCurrency, 'change', BD_CBUTTON.updateCurrency, this);
                var itemCurrencyOpts = YUD.getElementsByClassName("currencySelect", "select", "")[0];
                var itemCurrencyOptsLen = itemCurrencyOpts.options.length;
                for (var i = 0; i < itemCurrencyOptsLen; i++) {
                    optionCurrency.options[i] = new Option(itemCurrencyOpts.options[i].text, itemCurrencyOpts.options[i].value);
                    if (itemCurrencyOpts.options[i].value == BD_CBUTTON.ddPriceStructure.options[j].optionCurrency) {
                        optionCurrency.options[i].selected = true;
                    }
                }
                parent.appendChild(optionCurrency);
            } else {
                var optionCurrency = document.createElement("label");
                if (activeButtonType == 'subscriptions') {
                    optionCurrency.setAttribute("class", "ddpOptionCurrency hide");
                    optionCurrency.setAttribute("className", "ddpOptionCurrency hide");
                } else {
                    optionCurrency.setAttribute("class", "ddpOptionCurrency");
                    optionCurrency.setAttribute("className", "ddpOptionCurrency");
                }
                var defCurrency = YUD.getElementsByClassName("ddpOptionCurrency", "select", "dropdownPriceSection")[0];
                if (defCurrency.options) {
                    var defCurrencyValue = defCurrency.options[defCurrency.selectedIndex].value;
                    optionCurrency.setAttribute("innerHTML", defCurrencyValue);
                }
                parent.appendChild(optionCurrency);
            }
            var optionFreq = document.createElement("select");
            optionFreq.setAttribute("class", "subscriptions ddpOptionFrequency");
            optionFreq.setAttribute("className", "subscriptions ddpOptionFrequency");
            var optionFreqOptsLen = optionFrequency.options.length;
            for (var i = 0; i < optionFreqOptsLen; i++) {
                optionFreq.options[i] = new Option(optionFrequency.options[i].text, optionFrequency.options[i].value);
                if (optionFreq.options[i].value == 'M') {
                    optionFreq.options[i].selected = true;
                }
            }
            if (activeButtonType != 'subscriptions') {
                optionFreq.setAttribute("class", "ddpOptionFrequency hide");
                optionFreq.setAttribute("className", "ddpOptionFrequency hide");
            } else {
                optionFreq.setAttribute("class", "ddpOptionFrequency");
                optionFreq.setAttribute("className", "ddpOptionFrequency");
            }
            parent.appendChild(optionFreq);
            optionsPriceContainer.appendChild(parent);
            BD_CBUTTON.updateCurrency();
            BD_CBUTTON.displayAddOptionPriceLink();
        }
        if (dropdownPriceSection) {
            wHideShow.hide(dropdownPriceSection);
            if (savedDropdownPrice.innerHTML == "" && dropdownPrice.checked) {
                dropdownPrice.click();
            }
        }
        if (previewDropdownPriceSection) {
            (savedDropdownPrice.innerHTML == "") ? wHideShow.hide(previewDropdownPriceSection): wHideShow.show(previewDropdownPriceSection);
        }
        if (savedDropdownPriceSection) {
            (savedDropdownPrice.innerHTML == "") ? wHideShow.hide(savedDropdownPriceSection): wHideShow.show(savedDropdownPriceSection);
        }
        var removeOption = document.getElementById("removeOptionPrice");
        wHideShow.show(removeOption);
    },
    removeOptionsPrice: function(e) {
        YUE.preventDefault(e);
        var linkParent = BD_CBUTTON.getParent(this);
        var menuList = BD_CBUTTON.getPreviousSibling(linkParent);
        var optionList = YUD.getElementsByClassName("optionRow", "p", menuList.id);
        if (BD_CBUTTON.numOptionsPrice > 1) {
            menuList.removeChild(optionList[BD_CBUTTON.numOptionsPrice - 1]);
            BD_CBUTTON.numOptionsPrice--;
            if (BD_CBUTTON.numOptionsPrice == 1) {
                wHideShow.hide(this);
            }
            if (BD_CBUTTON.numOptionsPrice == 9) {
                var addOption = document.getElementById("addOptionPrice");
                wHideShow.show(addOption);
            }
        }
    },
    getParent: function(el) {
        do {
            el = el.parentNode;
        } while (el && el.nodeType != 1);
        return el;
    },
    getPreviousSibling: function(el) {
        do {
            el = el.previousSibling;
        } while (el && el.nodeType != 1);
        return el;
    },
    addNewOptionPrice: function(e) {
        YUE.preventDefault(e);
        BD_CBUTTON.createNewPriceOption();
        if (BD_CBUTTON.numOptionsPrice == 2) {
            var removeOption = document.getElementById("removeOptionPrice");
            wHideShow.show(removeOption);
        }
    },
    createNewPriceOption: function(opt) {
        var buttonType = document.getElementById('buttonType');
        var buttonTypeValue = buttonType.options[buttonType.selectedIndex].value;
        if (BD_CBUTTON.numOptionsPrice < 10) {
            var optionsPriceContainer = document.getElementById("optionsPriceContainer");
            var addOptionPrice = document.getElementById("addOptionPrice");
            var parent = document.createElement("p");
            parent.setAttribute("class", "optionRow clearfix");
            parent.setAttribute("className", "optionRow clearfix");
            var optionName = document.createElement("input");
            optionName.setAttribute("type", "text");
            var nm = "ddp_option_name";
            optionName.setAttribute("name", nm);
            optionName.setAttribute("class", "ddpOptionName form-control");
            optionName.setAttribute("className", "ddpOptionName form-control");
            optionName.setAttribute("maxlength", "64");
            optionName.setAttribute("value", document.getElementById("optionStr").value + " " + (BD_CBUTTON.numOptionsPrice + 1));
            parent.appendChild(optionName);
            var optionPrice = document.createElement("input");
            optionPrice.setAttribute("type", "text");
            var nm = "ddp_option_price";
            optionPrice.setAttribute("name", nm);
            optionPrice.setAttribute("class", "ddpOptionPrice form-control");
            optionPrice.setAttribute("className", "ddpOptionPrice form-control");
            parent.appendChild(optionPrice);
            if (BD_CBUTTON.numOptionsPrice == 0) {
                var optionCurrency = document.createElement("select");
                optionCurrency.setAttribute("class", "ddpOptionCurrency");
                optionCurrency.setAttribute("className", "ddpOptionCurrency");
                YUE.addListener(optionCurrency, 'change', BD_CBUTTON.updateCurrency, this);
                var itemCurrencyOpts = YUD.getElementsByClassName("currencySelect", "select", "")[0];
                var itemCurrencyOptsLen = itemCurrencyOpts.options.length;
                for (var i = 0; i < itemCurrencyOptsLen; i++) {
                    optionCurrency.options[i] = new Option(itemCurrencyOpts.options[i].text, itemCurrencyOpts.options[i].value);
                    if (itemCurrencyOpts.options[i].selected) {
                        optionCurrency.options[i].selected = true;
                    }
                }
                if (buttonTypeValue == 'subscriptions') {
                    YUD.addClass(optionCurrency, 'hide');
                }
                parent.appendChild(optionCurrency);
            } else {
                var optionCurrency = document.createElement("label");
                if (buttonTypeValue == 'subscriptions') {
                    optionCurrency.setAttribute("class", "ddpOptionCurrency hide");
                    optionCurrency.setAttribute("className", "ddpOptionCurrency hide");
                } else {
                    optionCurrency.setAttribute("class", "ddpOptionCurrency show");
                    optionCurrency.setAttribute("className", "ddpOptionCurrency show");
                }
                var defCurrency = YUD.getElementsByClassName("ddpOptionCurrency", "select", "dropdownPriceSection")[0];
                if (defCurrency.options) {
                    var defCurrencyValue = defCurrency.options[defCurrency.selectedIndex].value;
                    optionCurrency.setAttribute("innerHTML", defCurrencyValue);
                }
                if (buttonTypeValue == 'subscriptions') {
                    YUD.addClass(optionCurrency, 'hide');
                }
                parent.appendChild(optionCurrency);
            }
            var optionFrequency = BD_STEP1.frequencyDOM.cloneNode(true);
            if (buttonTypeValue == 'subscriptions') {
                YUD.removeClass(optionFrequency, 'hide');
                optionFrequency.disabled = false;
            } else {
                YUD.addClass(optionFrequency, 'hide');
                optionFrequency.disabled = true;
            }
            parent.appendChild(optionFrequency);
            optionsPriceContainer.appendChild(parent);
            BD_CBUTTON.updateCurrency();
        }
        BD_CBUTTON.displayAddOptionPriceLink();
    },
    editDropdownPrice: function(e) {
        YUE.preventDefault(e);
        var dropdownPriceSection = document.getElementById("dropdownPriceSection");
        var previewDropdownPriceSection = document.getElementById("previewDropdownPriceSection");
        var savedDropdownPriceSection = document.getElementById("savedDropdownPriceSection");
        if (dropdownPriceSection) {
            wHideShow.show(dropdownPriceSection);
            var labels = YUD.getElementsByClassName("optionNameLbl", "label", "dropdownPriceSection");
            wHideShow.show(labels[0]);
            labels = YUD.getElementsByClassName("optionPriceLbl", "label", "dropdownPriceSection");
            wHideShow.show(labels[0]);
            BD_CBUTTON.displayAddOptionPriceLink();
        }
        if (previewDropdownPriceSection) {
            wHideShow.show(previewDropdownPriceSection);
        }
        if (savedDropdownPriceSection) {
            wHideShow.hide(savedDropdownPriceSection);
        }
    },
    deleteDropdownPrice: function(e) {
        YUE.preventDefault(e);
        var dropdownPriceSection = document.getElementById("dropdownPriceSection");
        var previewDropdownPriceSection = document.getElementById("previewDropdownPriceSection");
        var savedDropdownPriceSection = document.getElementById("savedDropdownPriceSection");
        var savedDropdownPrice = document.getElementById("savedDropdownPrice");
        var optionsPriceContainer = document.getElementById("optionsPriceContainer");
        var options = YUD.getElementsByClassName("optionRow", "p", "dropdownPriceSection");
        var optionsLen = options.length;
        if (dropdownPriceSection) {
            for (var i = 0; i < optionsLen; i++) {
                optionsPriceContainer.removeChild(options[i]);
                BD_CBUTTON.numOptionsPrice--;
            }
            document.getElementById("dropdownPriceTitle").value = "";
            wHideShow.hide(dropdownPriceSection);
        }
        BD_CBUTTON.buildDropdownInfo(0);
        if (savedDropdownPriceSection) {
            savedDropdownPrice.innerHTML = "";
            wHideShow.hide(savedDropdownPriceSection);
        }
        if (previewDropdownPriceSection) {
            wHideShow.hide(previewDropdownPriceSection);
        }
        document.getElementById("dropdownPrice").checked = false;
        onPricePerOption.fire({
            hideItemPrice: false,
            disableItemPrice: false
        });
    },
    updateOptionsPricePreview: function() {
        var optionsPriceDropdown = document.getElementById("optionsPriceDropdown");
        var options = YUD.getElementsByClassName("optionRow", "p", "dropdownPriceSection");
        var optionNames = YUD.getElementsByClassName("ddpOptionName", "input", "dropdownPriceSection");
        var optionPrices = YUD.getElementsByClassName("ddpOptionPrice", "input", "dropdownPriceSection");
        var optionFrequency = YUD.getElementsByClassName("ddpOptionFrequency", "select", "dropdownPriceSection");
        var optionsLen = options.length;
        optionsPriceDropdown.length = 0;
        for (var i = 0; i < optionsLen; i++) {
            var opt = document.createElement("option");
            optionsPriceDropdown.options[i] = opt;
            if (BD_STEP1.activeButtonType == 'subscriptions') {
                var curr = document.getElementById('subscriptionBillingAmountCurrency');
                BD_STEP1.currencySymbol = curr.options[curr.selectedIndex].title;
                BD_STEP1.currencyCode = curr.options[curr.selectedIndex].value;
                var frequencyTxt = document.getElementById('frequencyTxt');
                if (frequencyTxt.childNodes[0].nodeType == '1') {
                    frequencyTxt = frequencyTxt.childNodes[0].innerHTML;
                } else {
                    frequencyTxt = frequencyTxt.innerHTML;
                }
                optionsPriceDropdown.options[i].text = optionNames[i].value + " - " + ((optionPrices[i].value == null || optionPrices[i].value == "") ? "$ x.xx" + " " + frequencyTxt : (BD_STEP1.currencySymbol + optionPrices[i].value + ' ' + BD_STEP1.currencyCode + ' ' + optionFrequency[i].options[optionFrequency[i].selectedIndex].text));
            } else {
                var curr = document.getElementById('BillingAmountCurrency');
                BD_STEP1.currencySymbol = curr.options[curr.selectedIndex].title;
                BD_STEP1.currencyCode = curr.options[curr.selectedIndex].value;
                optionsPriceDropdown.options[i].text = optionNames[i].value + " " + ((optionPrices[i].value == null || optionPrices[i].value == "") ? "$x.xx " + BD_STEP1.currencyCode : BD_STEP1.currencySymbol + optionPrices[i].value + ' ' + BD_STEP1.currencyCode);
            }
        }
        var ddTitle = document.getElementById("dropdownPriceTitle").value;
        ddTitle = BD_CBUTTON.escapeText(ddTitle);
        document.getElementById("previewDropdownPriceTitle").innerHTML = ddTitle;
    },
    displayAddOptionPriceLink: function() {
        var options = YUD.getElementsByClassName("optionRow", "p", "dropdownPriceSection");
        var addOptionPrice = document.getElementById("addOptionPrice");
        BD_CBUTTON.numOptionsPrice = options.length;
        if (BD_CBUTTON.numOptionsPrice < 10) {
            addOptionPrice.innerHTML = document.getElementById("addOptionStr").value;
            wHideShow.show(addOptionPrice);
        } else {
            wHideShow.hide(addOptionPrice);
        }
    },
    createDropdownPriceStructure: function() {
        BD_CBUTTON.ddPriceStructure = new Object;
        var options = YUD.getElementsByClassName("optionRow", "p", "dropdownPriceSection");
        var optionsLen = options.length;
        var optionNames = YUD.getElementsByClassName("ddpOptionName", "input", "dropdownPriceSection");
        var optionPrices = YUD.getElementsByClassName("ddpOptionPrice", "input", "dropdownPriceSection");
        var buttonType = document.getElementById('buttonType');
        var activeButtonType = buttonType.options[buttonType.selectedIndex].value;
        var optionFrequency = YUD.getElementsByClassName("ddpOptionFrequency", "select", "dropdownPriceSection");
        var optionCurrencies = YUD.getElementsByClassName("ddpOptionCurrency", "", "dropdownPriceSection");
        if (optionsLen != 0) {
            var temp = new Array();
            for (var j = 0; j < optionsLen; j++) {
                var optionObj = new Object;
                optionObj.optionName = optionNames[j].value;
                optionObj.optionPrice = optionPrices[j].value;
                optionObj.optionFrequency = optionFrequency[j].options[optionFrequency[j].selectedIndex].text;
                optionObj.optionCurrency = optionCurrencies[j].value;
                optionObj.optionId = options[j].id;
                temp[j] = optionObj;
                BD_CBUTTON.numOptionsPrice++;
            }
            var dropdownObj = {
                title: document.getElementById("dropdownPriceTitle").value,
                options: temp
            };
        };
        BD_CBUTTON.ddPriceStructure = dropdownObj;
    },
    saveDropdown: function(e) {
        YUE.preventDefault(e);
        switch (this.parentNode.parentNode.id) {
            case "dropdownSection1":
                var ddNum = 1;
                break;
            case "dropdownSection2":
                var ddNum = 2;
                break;
            case "dropdownSection3":
                var ddNum = 3;
                break;
            case "dropdownSection4":
                var ddNum = 4;
                break;
        }
        BD_CBUTTON.activeDropdown = ddNum;
        BD_CBUTTON.saveOption();
    },
    saveOption: function() {
        var dropdownSection = document.getElementById("dropdownSection" + BD_CBUTTON.activeDropdown);
        var savedDropdownSection = document.getElementById("savedDropdownSection" + BD_CBUTTON.activeDropdown);
        var savedDropdown = document.getElementById("savedDropdown" + BD_CBUTTON.activeDropdown);
        var dropdownTitle = YUD.getElementsByClassName("dropdownTitle", "input", "dropdownSection" + BD_CBUTTON.activeDropdown)[0];
        var previewDropdownTitle = YUD.getElementsByClassName("previewDropdownTitle", "label", "previewDropdownSection" + BD_CBUTTON.activeDropdown)[0];
        var addNewDropdownSection = document.getElementById("addNewDropdownSection");
        var dropdown = document.getElementById("dropdown");
        var addOption = document.getElementById("addOption" + BD_CBUTTON.activeDropdown);
        var options = YUD.getElementsByClassName("dropdown", "p", "dropdownSection" + BD_CBUTTON.activeDropdown);
        var optionNames = YUD.getElementsByClassName("ddOptionName", "input", "dropdownSection" + BD_CBUTTON.activeDropdown);
        var optionsContainer = document.getElementById("optionsContainer" + BD_CBUTTON.activeDropdown);
        var optionsLen = options.length;
        for (var i = 0; i < optionsLen; i++) {
            if (optionNames[i].value == null || optionNames[i].value == "") {
                optionsContainer.removeChild(optionNames[i].parentNode);
            }
        }
        var options = YUD.getElementsByClassName("dropdown", "p", "dropdownSection" + BD_CBUTTON.activeDropdown);
        if (options.length == 0) {
            dropdownTitle.value = "";
        }
        wHideShow.hide(dropdownSection);
        BD_CBUTTON.updateOptionsPreview();
        BD_CBUTTON.updateSavedOptions();
        BD_CBUTTON.displayAddOptionLink();
        BD_CBUTTON.getDropdownCount();
        if (BD_CBUTTON.activeDropdown == 0) {
            wHideShow.hide(addNewDropdownSection);
            if (dropdown.checked) {
                dropdown.click();
            }
            for (var i = 0; i < 3; i++) {
                var parent = document.createElement("p");
                parent.setAttribute("class", "optionRow dropdown col-md-9");
                parent.setAttribute("className", "optionRow dropdown col-md-9");
                var optionName = document.createElement("input");
                optionName.setAttribute("type", "text");
                var nm = "dd" + i + "_option_name";
                optionName.setAttribute("name", nm);
                optionName.setAttribute("class", "ddOptionName text form-control");
                optionName.setAttribute("className", "ddOptionName text form-control");
                optionName.setAttribute("value", document.getElementById("optionStr").value + " " + (i + 1));
                optionName.setAttribute("maxlength", "64");
                parent.appendChild(optionName);
                optionsContainer.appendChild(parent);
            }
        } else {
            BD_CBUTTON.displayAddDropdownLink();
        }
        BD_CBUTTON.buildDropdownInfo(0);
        BD_CBUTTON.createDropdownStructure();
    },
    cancelOption: function(e) {
        YUE.preventDefault(e);
        switch (this.parentNode.parentNode.id) {
            case "dropdownSection1":
                var ddNum = 1;
                break;
            case "dropdownSection2":
                var ddNum = 2;
                break;
            case "dropdownSection3":
                var ddNum = 3;
                break;
            case "dropdownSection4":
                var ddNum = 4;
                break;
        }
        var dropdownSection = document.getElementById("dropdownSection" + ddNum);
        var previewDropdownSection = document.getElementById("previewDropdownSection" + ddNum);
        var savedDropdownSection = document.getElementById("savedDropdownSection" + ddNum);
        var savedDropdown = document.getElementById("savedDropdown" + ddNum);
        var addNewDropdownSection = document.getElementById("addNewDropdownSection");
        var optionsContainer = document.getElementById("optionsContainer" + ddNum);
        var options = YUD.getElementsByClassName("dropdown", "p", "dropdownSection" + ddNum);
        var optionsLen = options.length;
        var dropdown = document.getElementById("dropdown");
        for (var a = 0; a < optionsLen; a++) {
            optionsContainer.removeChild(options[a]);
        }
        YUD.getElementsByClassName("dropdownTitle", "input", dropdownSection)[0].value = BD_CBUTTON.ddStructure[ddNum - 1].title;
        var tempOptions = BD_CBUTTON.ddStructure[ddNum - 1].options;
        var tempOptionsLen = tempOptions.length;
        for (var j = 0; j < tempOptionsLen; j++) {
            var parent = document.createElement("p");
            parent.setAttribute("class", "optionRow dropdown col-md-9");
            parent.setAttribute("className", "optionRow dropdown col-md-9");
            parent.setAttribute("id", tempOptions[j].optionId);
            var optionName = document.createElement("input");
            optionName.setAttribute("type", "text");
            var nm = "dd" + (ddNum) + "_option_name";
            optionName.setAttribute("name", nm);
            optionName.setAttribute("class", "ddOptionName text form-control");
            optionName.setAttribute("className", "ddOptionName text form-control");
            optionName.setAttribute("value", tempOptions[j].optionName);
            optionName.setAttribute("maxlength", "64");
            parent.appendChild(optionName);
            optionsContainer.appendChild(parent);
        }
        if (dropdownSection) {
            wHideShow.hide(dropdownSection);
        }
        if (BD_CBUTTON.ddStructure[ddNum - 1].saved) {
            if (previewDropdownSection) {
                (savedDropdown.innerHTML == "") ? wHideShow.hide(previewDropdownSection): wHideShow.show(previewDropdownSection);
            }
            if (savedDropdownSection) {
                (savedDropdown.innerHTML == "") ? wHideShow.hide(savedDropdownSection): wHideShow.show(savedDropdownSection);
            }
        } else {
            if (previewDropdownSection) {
                wHideShow.hide(previewDropdownSection);
            }
            if (savedDropdownSection) {
                wHideShow.hide(savedDropdownSection);
            }
        }
        BD_CBUTTON.getDropdownCount();
        if (BD_CBUTTON.activeDropdown == 0) {
            wHideShow.hide(addNewDropdownSection);
            if (dropdown.checked) {
                dropdown.click();
            }
        } else {
            BD_CBUTTON.displayAddDropdownLink();
        }
    },
    displayAddOptionLink: function() {
        var options = YUD.getElementsByClassName("dropdown", "p", "dropdownSection" + BD_CBUTTON.activeDropdown);
        var addOption = YUD.getElementsByClassName("addOption", "", "dropdownSection" + BD_CBUTTON.activeDropdown)[0];
        switch (BD_CBUTTON.activeDropdown) {
            case 1:
                BD_CBUTTON.numOptions1 = options.length;
                if (BD_CBUTTON.numOptions1 < 10) {
                    addOption.innerHTML = document.getElementById("addOptionStr").value + " " + (BD_CBUTTON.numOptions1 + 1);
                    wHideShow.show(addOption);
                } else {
                    wHideShow.hide(addOption);
                }
                break;
            case 2:
                BD_CBUTTON.numOptions2 = options.length;
                if (BD_CBUTTON.numOptions2 < 10) {
                    addOption.innerHTML = document.getElementById("addOptionStr").value + " " + (BD_CBUTTON.numOptions2 + 1);
                    wHideShow.show(addOption);
                } else {
                    wHideShow.hide(addOption);
                }
                break;
            case 3:
                BD_CBUTTON.numOptions3 = options.length;
                if (BD_CBUTTON.numOptions3 < 10) {
                    addOption.innerHTML = document.getElementById("addOptionStr").value + " " + (BD_CBUTTON.numOptions3 + 1);
                    wHideShow.show(addOption);
                } else {
                    wHideShow.hide(addOption);
                }
                break;
            case 4:
                BD_CBUTTON.numOptions4 = options.length;
                if (BD_CBUTTON.numOptions4 < 10) {
                    addOption.innerHTML = document.getElementById("addOptionStr").value + " " + (BD_CBUTTON.numOptions4 + 1);
                    wHideShow.show(addOption);
                } else {
                    wHideShow.hide(addOption);
                }
                break;
        }
    },
    addNewOption: function(e) {
        YUE.preventDefault(e);
        switch (this.parentNode.parentNode.id) {
            case "dropdownSection1":
                var ddNum = 1;
                break;
            case "dropdownSection2":
                var ddNum = 2;
                break;
            case "dropdownSection3":
                var ddNum = 3;
                break;
            case "dropdownSection4":
                var ddNum = 4;
                break;
        }
        BD_CBUTTON.activeDropdown = ddNum;
        var optionsContainer = document.getElementById("optionsContainer" + BD_CBUTTON.activeDropdown);
        BD_CBUTTON.createNewOption(optionsContainer);
    },
    createNewOption: function(optionsContainer) {
        var parent = document.createElement("p");
        parent.setAttribute("class", "optionRow dropdown col-md-9");
        parent.setAttribute("className", "optionRow dropdown col-md-9");
        var optionName = document.createElement("input");
        optionName.setAttribute("type", "text");
        var nm = "dd" + BD_CBUTTON.activeDropdown + "_option_name";
        optionName.setAttribute("name", nm);
        optionName.setAttribute("class", "ddOptionName text form-control");
        optionName.setAttribute("className", "ddOptionName text form-control");
        optionName.setAttribute("maxlength", "64");
        switch (BD_CBUTTON.activeDropdown) {
            case 1:
                if (BD_CBUTTON.numOptions1 < 10) {
                    BD_CBUTTON.numOptions1++;
                    optionName.setAttribute("value", document.getElementById("optionStr").value + " " + BD_CBUTTON.numOptions1);
                    parent.appendChild(optionName);
                    optionsContainer.appendChild(parent);
                }
                break;
            case 2:
                if (BD_CBUTTON.numOptions2 < 10) {
                    BD_CBUTTON.numOptions2++;
                    optionName.setAttribute("value", document.getElementById("optionStr").value + " " + BD_CBUTTON.numOptions2);
                    parent.appendChild(optionName);
                    optionsContainer.appendChild(parent);
                }
                break;
            case 3:
                if (BD_CBUTTON.numOptions3 < 10) {
                    BD_CBUTTON.numOptions3++;
                    optionName.setAttribute("value", document.getElementById("optionStr").value + " " + BD_CBUTTON.numOptions3);
                    parent.appendChild(optionName);
                    optionsContainer.appendChild(parent);
                }
                break;
            case 4:
                if (BD_CBUTTON.numOptions4 < 10) {
                    BD_CBUTTON.numOptions4++;
                    optionName.setAttribute("value", document.getElementById("optionStr").value + " " + BD_CBUTTON.numOptions4);
                    parent.appendChild(optionName);
                    optionsContainer.appendChild(parent);
                }
                break;
        }
        BD_CBUTTON.displayAddOptionLink();
    },
    editDropdown: function(e) {
        YUE.preventDefault(e);
        switch (this.parentNode.parentNode.id) {
            case "savedDropdownSection1":
                var ddNum = 1;
                break;
            case "savedDropdownSection2":
                var ddNum = 2;
                break;
            case "savedDropdownSection3":
                var ddNum = 3;
                break;
            case "savedDropdownSection4":
                var ddNum = 4;
                break;
        }
        var dropdownSection = document.getElementById("dropdownSection" + ddNum);
        var previewDropdownSection = document.getElementById("previewDropdownSection" + ddNum);
        var savedDropdownSection = document.getElementById("savedDropdownSection" + ddNum);
        var addNewDropdownSection = document.getElementById("addNewDropdownSection");
        BD_CBUTTON.activeDropdown = ddNum;
        if (dropdownSection) {
            wHideShow.show(dropdownSection);
            var options = YUD.getElementsByClassName("dropdown", "p", "dropdownSection" + ddNum);
        }
        if (previewDropdownSection) {
            wHideShow.show(previewDropdownSection);
        }
        if (savedDropdownSection) {
            wHideShow.hide(savedDropdownSection);
        }
        if (addNewDropdownSection) {
            wHideShow.hide(addNewDropdownSection);
        }
        BD_CBUTTON.displayAddOptionLink();
    },
    deleteDropdown: function(e) {
        YUE.preventDefault(e);
        switch (this.parentNode.parentNode.id) {
            case "savedDropdownSection1":
                var ddNum = 1;
                break;
            case "savedDropdownSection2":
                var ddNum = 2;
                break;
            case "savedDropdownSection3":
                var ddNum = 3;
                break;
            case "savedDropdownSection4":
                var ddNum = 4;
                break;
        }
        var dropdownSection = document.getElementById("dropdownSection" + ddNum);
        var previewDropdownSection = document.getElementById("previewDropdownSection" + ddNum);
        var savedDropdownSection = document.getElementById("savedDropdownSection" + ddNum);
        var addNewDropdownSection = document.getElementById("addNewDropdownSection");
        var dropdown = document.getElementById("dropdown");
        var ddStructureLen = BD_CBUTTON.ddStructure.length + 1;
        for (var i = 1; i < ddStructureLen; i++) {
            if (i == ddNum) {
                var dropdownSection = document.getElementById("dropdownSection" + i);
                var optionsContainer = document.getElementById("optionsContainer" + i);
                var options = YUD.getElementsByClassName("dropdown", "p", "dropdownSection" + i);
                var optionsLen = options.length;
                for (var aa = 0; aa < optionsLen; aa++) {
                    optionsContainer.removeChild(options[aa]);
                }
                YUD.getElementsByClassName("dropdownTitle", "input", "dropdownSection" + i)[0].value = "";
                BD_CBUTTON.ddStructure.splice(i - 1, 1);
            }
        }
        if (dropdownSection) {
            wHideShow.hide(dropdownSection);
        }
        if (previewDropdownSection) {
            wHideShow.hide(previewDropdownSection);
        }
        if (savedDropdownSection) {
            wHideShow.hide(savedDropdownSection);
        }
        BD_CBUTTON.createDropdownStructure();
        BD_CBUTTON.recreateDropdownSection();
        BD_CBUTTON.recreateSavedSection();
        BD_CBUTTON.addAllDropdowns();
        BD_CBUTTON.createDropdownStructure(ddNum);
        BD_CBUTTON.getDropdownCount();
        if (BD_CBUTTON.activeDropdown == 0) {
            wHideShow.hide(addNewDropdownSection);
            if (dropdown.checked) {
                dropdown.click();
            }
        } else {
            BD_CBUTTON.displayAddDropdownLink();
        }
        BD_CBUTTON.buildDropdownInfo(ddNum);
        for (var i = 1; i <= 4; i++) {
            var savedDropdownSection = document.getElementById('savedDropdownSection' + i);
            if (!YUD.hasClass(savedDropdownSection, "opened")) {
                var dropdownSection = document.getElementById("dropdownSection" + i);
                var inputs = dropdownSection.getElementsByTagName("input");
                var inputsLen = inputs.length;
                for (var j = 0; j < inputsLen; j++) {
                    inputs[j].disabled = true;
                }
            }
        }
    },
    recreateDropdownSection: function() {
        var ddStructureLen = BD_CBUTTON.ddStructure.length + 1;
        for (var i = 1; i < ddStructureLen; i++) {
            var dropdownSection = document.getElementById("dropdownSection" + i);
            var optionsContainer = document.getElementById("optionsContainer" + i);
            var options = YUD.getElementsByClassName("dropdown", "p", "dropdownSection" + i);
            var optionsLen = options.length;
            for (var a = 0; a < optionsLen; a++) {
                optionsContainer.removeChild(options[a]);
            }
            wHideShow.hide(dropdownSection);
            YUD.getElementsByClassName("dropdownTitle", "input", dropdownSection)[0].value = BD_CBUTTON.ddStructure[i - 1].title;
            var tempOptions = BD_CBUTTON.ddStructure[i - 1].options;
            var tempOptionsLen = tempOptions.length;
            for (var j = 0; j < tempOptionsLen; j++) {
                var parent = document.createElement("p");
                parent.setAttribute("class", "optionRow dropdown col-md-9");
                parent.setAttribute("className", "optionRow dropdown col-md-9");
                parent.setAttribute("id", tempOptions[j].optionId);
                var optionName = document.createElement("input");
                optionName.setAttribute("type", "text");
                var nm = "dd" + i + "_option_name";
                optionName.setAttribute("name", nm);
                optionName.setAttribute("class", "ddOptionName text form-control");
                optionName.setAttribute("className", "ddOptionName text form-control");
                optionName.setAttribute("value", tempOptions[j].optionName);
                optionName.setAttribute("maxlength", "64");
                parent.appendChild(optionName);
                optionsContainer.appendChild(parent);
            }
        }
    },
    updateSavedOptions: function(ddNum) {
        var savedDropdownSection = document.getElementById("savedDropdownSection" + BD_CBUTTON.activeDropdown);
        var savedDropdown = document.getElementById("savedDropdown" + BD_CBUTTON.activeDropdown);
        var dropdownTitle = YUD.getElementsByClassName("dropdownTitle", "input", "dropdownSection" + BD_CBUTTON.activeDropdown)[0];
        var previewDropdownTitle = YUD.getElementsByClassName("previewDropdownTitle", "label", "previewDropdownSection" + BD_CBUTTON.activeDropdown)[0];
        var options = YUD.getElementsByClassName("dropdown", "p", "dropdownSection" + BD_CBUTTON.activeDropdown);
        var optionNames = YUD.getElementsByClassName("ddOptionName", "input", "dropdownSection" + BD_CBUTTON.activeDropdown);
        savedDropdown.innerHTML = "";
        if (dropdownTitle.value != "") {
            savedDropdown.innerHTML = previewDropdownTitle.innerHTML + ": ";
        }
        options = YUD.getElementsByClassName("dropdown", "p", "dropdownSection" + BD_CBUTTON.activeDropdown);
        optionNames = YUD.getElementsByClassName("ddOptionName", "input", "dropdownSection" + BD_CBUTTON.activeDropdown);
        var optionsLen = options.length;
        if (optionsLen != 0) {
            for (var i = 0; i < optionsLen; i++) {
                var optName = optionNames[i].value;
                optName = BD_CBUTTON.escapeText(optName);
                if (i != 0) {
                    if (optName != "") {
                        document.getElementById("savedDropdown" + BD_CBUTTON.activeDropdown).innerHTML = document.getElementById("savedDropdown" + BD_CBUTTON.activeDropdown).innerHTML + ", ";
                    }
                }
                document.getElementById("savedDropdown" + BD_CBUTTON.activeDropdown).innerHTML = document.getElementById("savedDropdown" + BD_CBUTTON.activeDropdown).innerHTML + optName;
            }
            wHideShow.show(savedDropdownSection);
        }
    },
    updateOptionsPreview: function() {
        var optionsDropdown = document.getElementById("optionsDropdown" + BD_CBUTTON.activeDropdown);
        var options = YUD.getElementsByClassName("dropdown", "p", "dropdownSection" + BD_CBUTTON.activeDropdown);
        var optionNames = YUD.getElementsByClassName("ddOptionName", "input", "dropdownSection" + BD_CBUTTON.activeDropdown);
        var dropdownTitle = YUD.getElementsByClassName("dropdownTitle", "input", "dropdownSection" + BD_CBUTTON.activeDropdown)[0];
        var previewDropdownTitle = YUD.getElementsByClassName("previewDropdownTitle", "label", "previewDropdownSection" + BD_CBUTTON.activeDropdown)[0];
        var previewDropdownSection = document.getElementById("previewDropdownSection" + BD_CBUTTON.activeDropdown);
        var optionsLen = options.length;
        if (optionsLen == 0) {
            wHideShow.hide(previewDropdownSection);
        } else {
            optionsDropdown.length = 0;
            for (var i = 0; i < optionsLen; i++) {
                if (optionNames[i].value != null && optionNames[i].value != "") {
                    var opt = document.createElement("option");
                    optionsDropdown.options[i] = opt;
                    optionsDropdown.options[i].text = optionNames[i].value;
                }
            }
            previewDropdownTitle.innerHTML = BD_CBUTTON.escapeText(dropdownTitle.value);
        }
    },
    displayAddDropdownLink: function() {
        BD_CBUTTON.getDropdownCount();
        var addNewDropdownSection = document.getElementById("addNewDropdownSection");
        if (addNewDropdownSection) {
            if (BD_CBUTTON.activeDropdown != 4) {
                var dds = YUD.getElementsByClassName("dropdownSection");
                var ddsLen = dds.length;
                var ddsCnt = 0;
                for (var i = 0; i < ddsLen; i++) {
                    if (YUD.hasClass(dds[i], "opened")) ddsCnt++;
                }
                if (ddsCnt == 0) {
                    wHideShow.show(addNewDropdownSection);
                }
            } else {
                wHideShow.hide(addNewDropdownSection);
            }
        }
    },
    addNewDropdown: function(e) {
        YUE.preventDefault(e);
        BD_CBUTTON.getDropdownCount();
        BD_CBUTTON.numDropdowns++;
        BD_CBUTTON.activeDropdown++;
        var dropdownSection = document.getElementById("dropdownSection" + BD_CBUTTON.activeDropdown);
        var previewDropdownSection = document.getElementById("previewDropdownSection" + BD_CBUTTON.activeDropdown);
        var optionsContainer = document.getElementById("optionsContainer" + BD_CBUTTON.activeDropdown);
        if (dropdownSection) {
            var allInputs = dropdownSection.getElementsByTagName("input");
            var allInputsLen = allInputs.length;
            if (allInputsLen <= 2) {
                for (var i = 0; i < 3; i++) {
                    var parent = document.createElement("p");
                    parent.setAttribute("class", "optionRow dropdown col-md-9");
                    parent.setAttribute("className", "optionRow dropdown col-md-9");
                    var optionName = document.createElement("input");
                    optionName.setAttribute("type", "text");
                    var nm = "dd" + i + "_option_name";
                    optionName.setAttribute("name", nm);
                    optionName.setAttribute("class", "ddOptionName text form-control");
                    optionName.setAttribute("className", "ddOptionName text form-control");
                    optionName.setAttribute("value", document.getElementById("optionStr").value + " " + (i + 1));
                    optionName.setAttribute("maxlength", "64");
                    parent.appendChild(optionName);
                    optionsContainer.appendChild(parent);
                }
                BD_CBUTTON.createDropdownStructure();
            }
            for (var i = 0; i < allInputsLen; i++) {
                allInputs[i].disabled = false;
            }
            wHideShow.show(dropdownSection);
        }
        if (previewDropdownSection) {
            wHideShow.show(previewDropdownSection);
        }
        BD_CBUTTON.displayAddOptionLink();
        var addNewDropdownSection = document.getElementById("addNewDropdownSection");
        if (addNewDropdownSection) {
            wHideShow.hide(addNewDropdownSection);
        }
    },
    createDropdownStructure: function() {
        BD_CBUTTON.ddStructure = new Array();
        var count = 1;
        for (var i = 1; i < 5; i++) {
            var options = YUD.getElementsByClassName("optionRow", "p", "dropdownSection" + i);
            var optionsLen = options.length;
            var optionNames = YUD.getElementsByClassName("ddOptionName", "input", "dropdownSection" + i);
            var dropdownSection = document.getElementById("dropdownSection" + i);
            var savedDropdownSection = document.getElementById("savedDropdownSection" + i);
            if (optionsLen != 0) {
                var temp = new Array();
                for (var j = 0; j < optionsLen; j++) {
                    var optionObj = new Object;
                    optionObj.optionName = optionNames[j].value;
                    optionObj.optionId = options[j].id;
                    temp[j] = optionObj;
                }
                var dropdownObj = {
                    ddNum: count,
                    title: YUD.getElementsByClassName("dropdownTitle", "input", "dropdownSection" + i)[0].value,
                    options: temp,
                    saved: ((YUD.hasClass(savedDropdownSection, "opened") ? true : false) || (YUD.hasClass(dropdownSection, "opened") ? true : false))
                };
                BD_CBUTTON.ddStructure.push(dropdownObj);
                count++;
            }
        }
    },
    recreateSavedSection: function() {
        var ddStructureLen = BD_CBUTTON.ddStructure.length;
        for (var i = 0; i < ddStructureLen; i++) {
            BD_CBUTTON.recreateOptionsPreview(i + 1);
            if (BD_CBUTTON.ddStructure[i].saved) {
                BD_CBUTTON.recreateSavedOptions(i, i + 1);
            } else {
                if (!(YUD.hasClass(document.getElementById("dropdownSection" + (i + 1)), "opened"))) {
                    wHideShow.hide(document.getElementById("savedDropdownSection" + (i + 1)));
                    wHideShow.hide(document.getElementById("previewDropdownSection" + (i + 1)));
                }
            }
        }
        for (var i = BD_CBUTTON.ddStructure.length; i < 4; i++) {
            BD_CBUTTON.recreateOptionsPreview(i + 1);
            wHideShow.hide(document.getElementById("savedDropdownSection" + (i + 1)));
            wHideShow.hide(document.getElementById("previewDropdownSection" + (i + 1)));
        }
    },
    recreateSavedOptions: function(ddNum, ddActive) {
        var savedDropdownSection = document.getElementById("savedDropdownSection" + ddActive);
        var savedDropdown = document.getElementById("savedDropdown" + ddActive);
        var dropdownTitle = YUD.getElementsByClassName("dropdownTitle", "input", "dropdownSection" + ddActive)[0];
        savedDropdown.innerHTML = "";
        if (dropdownTitle.value != "") {
            savedDropdown.innerHTML = BD_CBUTTON.escapeText(BD_CBUTTON.ddStructure[ddNum].title) + ": ";
        }
        options = BD_CBUTTON.ddStructure[ddNum].options;
        var optionsLen = options.length;
        for (var i = 0; i < optionsLen; i++) {
            if (i != 0) {
                if (options[i] != "") {
                    savedDropdown.innerHTML = savedDropdown.innerHTML + ", ";
                }
            }
            savedDropdown.innerHTML = savedDropdown.innerHTML + BD_CBUTTON.escapeText(options[i].optionName);
        }
        wHideShow.show(savedDropdownSection);
    },
    recreateOptionsPreview: function(ddActive) {
        var optionsDropdown = document.getElementById("optionsDropdown" + ddActive);
        var options = YUD.getElementsByClassName("dropdown", "p", "dropdownSection" + ddActive);
        var optionNames = YUD.getElementsByClassName("ddOptionName", "input", "dropdownSection" + ddActive);
        var dropdownTitle = YUD.getElementsByClassName("dropdownTitle", "input", "dropdownSection" + ddActive)[0];
        var previewDropdownTitle = YUD.getElementsByClassName("previewDropdownTitle", "label", "previewDropdownSection" + ddActive)[0];
        var previewDropdownSection = document.getElementById("previewDropdownSection" + ddActive);
        var optionsLen = options.length;
        optionsDropdown.length = 0;
        for (var i = 0; i < optionsLen; i++) {
            if (optionNames[i].value != null && optionNames[i].value != "") {
                var opt = document.createElement("option");
                optionsDropdown.options[i] = opt;
                optionsDropdown.options[i].text = optionNames[i].value;
            }
        }
        previewDropdownTitle.innerHTML = BD_CBUTTON.escapeText(dropdownTitle.value);
        wHideShow.show(previewDropdownSection);
    },
    addAllDropdowns: function() {
        var ddStructureLen = BD_CBUTTON.ddStructure.length + 1;
        for (var i = ddStructureLen; i < 5; i++) {
            var dropdownSection = document.getElementById("dropdownSection" + i);
            var optionsContainer = document.getElementById("optionsContainer" + i);
            var options = YUD.getElementsByClassName("dropdown", "p", "dropdownSection" + i);
            var optionsLen = options.length;
            for (var a = 0; a < optionsLen; a++) {
                optionsContainer.removeChild(options[a]);
            }
            YUD.getElementsByClassName("dropdownTitle", "input", dropdownSection)[0].value = "";
            for (var j = 1; j < 4; j++) {
                var parent = document.createElement("p");
                parent.setAttribute("class", "optionRow dropdown col-md-9");
                parent.setAttribute("className", "optionRow dropdown col-md-9");
                var optionName = document.createElement("input");
                optionName.setAttribute("type", "text");
                var nm = "dd" + i + "_option_name";
                optionName.setAttribute("name", nm);
                optionName.setAttribute("class", "ddOptionName text form-control");
                optionName.setAttribute("className", "ddOptionName text form-control");
                optionName.setAttribute("value", document.getElementById("optionStr").value + " " + j);
                optionName.setAttribute("maxlength", "64");
                parent.appendChild(optionName);
                optionsContainer.appendChild(parent);
            }
            var allInputs = dropdownSection.getElementsByTagName("input");
            var allInputsLen = allInputs.length;
            for (var i = 0; i < allInputsLen; i++) {
                allInputs[i].disabled = true;
            }
            wHideShow.hide(dropdownSection);
        }
    },
    getDropdownCount: function() {
        var dds = YUD.getElementsByClassName("dropdownSection");
        var ddsLen = dds.length;
        var ddsCnt = 0;
        var savedDds = YUD.getElementsByClassName("savedDropdownSection");
        var savedDdsLen = savedDds.length;
        var savedDdsCnt = 0;
        for (var i = 0; i < ddsLen; i++) {
            if (YUD.hasClass(dds[i], "opened")) ddsCnt++;
        }
        for (var i = 0; i < savedDdsLen; i++) {
            if (YUD.hasClass(savedDds[i], "opened")) savedDdsCnt++;
        }
        BD_CBUTTON.activeDropdown = ddsCnt + savedDdsCnt;
    },
    saveTextfield: function(e) {
        YUE.preventDefault(e);
        switch (this.parentNode.parentNode.id) {
            case "textfieldSection1":
                var tfNum = 1;
                break;
            case "textfieldSection2":
                var tfNum = 2;
                break;
        }
        BD_CBUTTON.activeTextfield = tfNum;
        var previewTextfieldTitle = document.getElementById("previewTextfieldTitle" + BD_CBUTTON.activeTextfield);
        var textfieldSection = document.getElementById("textfieldSection" + BD_CBUTTON.activeTextfield);
        var savedTextfieldSection = document.getElementById("savedTextfieldSection" + BD_CBUTTON.activeTextfield);
        var savedTextfield = YUD.getElementsByClassName("savedTextfield", "label", "savedTextfieldSection" + BD_CBUTTON.activeTextfield)[0];
        previewTextfieldTitle.innerHTML = BD_CBUTTON.escapeText(document.getElementById("textfieldTitle" + BD_CBUTTON.activeTextfield).value);
        wHideShow.hide(textfieldSection);
        savedTextfield.innerHTML = BD_CBUTTON.escapeText(document.getElementById("textfieldTitle" + BD_CBUTTON.activeTextfield).value);
        wHideShow.show(savedTextfieldSection);
        BD_CBUTTON.getTextfieldCount();
        if (BD_CBUTTON.activeTextfield == 0) {
            wHideShow.hide(addNewTextfieldSection);
            if (textfield.checked) {
                textfield.click();
            }
        } else {
            BD_CBUTTON.displayAddTextfieldLink();
        }
        BD_CBUTTON.createTextfieldStructure();
    },
    cancelTextfield: function(e) {
        YUE.preventDefault(e);
        switch (this.parentNode.parentNode.id) {
            case "textfieldSection1":
                var tfNum = 1;
                break;
            case "textfieldSection2":
                var tfNum = 2;
                break;
        }
        var textfieldSection = document.getElementById("textfieldSection" + tfNum);
        var previewTextfieldSection = document.getElementById("previewTextfieldSection" + tfNum);
        var savedTextfieldSection = document.getElementById("savedTextfieldSection" + tfNum);
        var savedTextfield = document.getElementById("savedTextfield" + tfNum);
        var addNewTextfieldSection = document.getElementById("addNewTextfieldSection");
        var textfield = document.getElementById("textfield");
        document.getElementById("textfieldTitle" + tfNum).value = BD_CBUTTON.tfStructure[tfNum - 1];
        if (textfieldSection) {
            wHideShow.hide(textfieldSection);
            var allInputs = textfieldSection.getElementsByTagName("input");
            var allInputsLen = allInputs.length;
            for (var i = 0; i < allInputsLen; i++) {
                allInputs[i].disabled = true;
            }
        }
        if (previewTextfieldSection) {
            (savedTextfield.innerHTML == "") ? wHideShow.hide(previewTextfieldSection): wHideShow.show(previewTextfieldSection);
        }
        if (savedTextfieldSection) {
            (savedTextfield.innerHTML == "") ? wHideShow.hide(savedTextfieldSection): wHideShow.show(savedTextfieldSection);
        }
        BD_CBUTTON.getTextfieldCount();
        if (BD_CBUTTON.activeTextfield == 0) {
            wHideShow.hide(addNewTextfieldSection);
            if (textfield.checked) {
                textfield.click();
            }
        } else {
            BD_CBUTTON.displayAddTextfieldLink();
        }
    },
    editTextfield: function(e) {
        YUE.preventDefault(e);
        switch (this.parentNode.parentNode.id) {
            case "savedTextfieldSection1":
                var tfNum = 1;
                break;
            case "savedTextfieldSection2":
                var tfNum = 2;
                break;
        }
        var textfieldSection = document.getElementById("textfieldSection" + tfNum);
        var previewTextfieldSection = document.getElementById("previewTextfieldSection" + tfNum);
        var savedTextfieldSection = document.getElementById("savedTextfieldSection" + tfNum);
        BD_CBUTTON.activeTextfield = tfNum;
        if (textfieldSection) {
            wHideShow.show(textfieldSection);
            var allInputs = textfieldSection.getElementsByTagName("input");
            var allInputsLen = allInputs.length;
            for (var i = 0; i < allInputsLen; i++) {
                allInputs[i].disabled = false;
            }
        }
        if (previewTextfieldSection) {
            wHideShow.show(previewTextfieldSection);
        }
        if (savedTextfieldSection) {
            wHideShow.hide(savedTextfieldSection);
        }
        var addNewTextfieldSection = document.getElementById("addNewTextfieldSection");
        if (addNewTextfieldSection) {
            wHideShow.hide(addNewTextfieldSection);
        }
    },
    deleteTextfield: function(e) {
        YUE.preventDefault(e);
        switch (this.parentNode.parentNode.id) {
            case "savedTextfieldSection1":
                var tfNum = 1;
                break;
            case "savedTextfieldSection2":
                var tfNum = 2;
                break;
        }
        var textfieldSection = document.getElementById("textfieldSection" + tfNum);
        var textfieldTitle = document.getElementById("textfieldTitle" + tfNum);
        var previewTextfieldTitle = document.getElementById("previewTextfieldTitle" + tfNum);
        var previewTextfieldSection = document.getElementById("previewTextfieldSection" + tfNum);
        var savedTextfieldSection = document.getElementById("savedTextfieldSection" + tfNum);
        var savedTextfield = document.getElementById("savedTextfield" + tfNum);
        var addNewTextfieldSection = document.getElementById("addNewTextfieldSection");
        var textfield = document.getElementById("textfield");
        BD_CBUTTON.getTextfieldCount();
        if (tfNum == 1 && BD_CBUTTON.activeTextfield == 2) {
            var tmpTextfield = document.getElementById("textfieldTitle2");
            var tmpTextfieldSection = document.getElementById("textfieldSection2");
            var tmpPreviewTextfieldTitle = document.getElementById("previewTextfieldTitle2");
            var tmpPreviewTextfieldSection = document.getElementById("previewTextfieldSection2");
            var tmpSavedTextfieldSection = document.getElementById("savedTextfieldSection2");
            var tmpSavedTextfield = document.getElementById("savedTextfield2");
            if (tmpTextfield) {
                textfieldTitle.value = tmpTextfield.value;
                tmpTextfield.value = "";
                if (tmpTextfieldSection) {
                    wHideShow.hide(tmpTextfieldSection);
                    var allInputs = tmpTextfieldSection.getElementsByTagName("input");
                    var allInputsLen = allInputs.length;
                    for (var i = 0; i < allInputsLen; i++) {
                        allInputs[i].disabled = true;
                    }
                }
                if (tmpPreviewTextfieldSection) {
                    tmpPreviewTextfieldTitle.innerHTML = document.getElementById("titleStr").value;
                    wHideShow.hide(tmpPreviewTextfieldSection);
                }
                if (tmpSavedTextfieldSection) {
                    tmpSavedTextfield.innerHTML = "";
                    wHideShow.hide(tmpSavedTextfieldSection);
                }
                previewTextfieldTitle.innerHTML = textfieldTitle.value;
                savedTextfield.innerHTML = BD_CBUTTON.escapeText(textfieldTitle.value);
            }
            BD_CBUTTON.createTextfieldStructure();
        } else {
            if (textfieldSection) {
                wHideShow.hide(textfieldSection);
                textfieldTitle.value = "";
                var allInputs = textfieldSection.getElementsByTagName("input");
                var allInputsLen = allInputs.length;
                for (var i = 0; i < allInputsLen; i++) {
                    allInputs[i].disabled = true;
                }
                previewTextfieldTitle.innerHTML = document.getElementById("titleStr").value;
            }
            if (previewTextfieldSection) {
                wHideShow.hide(previewTextfieldSection);
            }
            if (savedTextfieldSection) {
                savedTextfield.innerHTML = "";
                wHideShow.hide(savedTextfieldSection);
            }
        }
        BD_CBUTTON.getTextfieldCount();
        if (BD_CBUTTON.activeTextfield == 0) {
            wHideShow.hide(addNewTextfieldSection);
            if (textfield.checked) {
                textfield.click();
            }
        } else {
            BD_CBUTTON.displayAddTextfieldLink();
        }
    },
    displayAddTextfieldLink: function() {
        BD_CBUTTON.getTextfieldCount();
        var addNewTextfieldSection = document.getElementById("addNewTextfieldSection");
        if (addNewTextfieldSection) {
            if (BD_CBUTTON.activeTextfield != 2) {
                var tfs = YUD.getElementsByClassName("textfieldSection");
                var tfsLen = tfs.length;
                var tfsCnt = 0;
                for (var i = 0; i < tfsLen; i++) {
                    if (YUD.hasClass(tfs[i], "opened")) tfsCnt++;
                }
                if (tfsCnt == 0) {
                    wHideShow.show(addNewTextfieldSection);
                }
            } else {
                wHideShow.hide(addNewTextfieldSection);
            }
        }
    },
    addNewTextfield: function(e) {
        YUE.preventDefault(e);
        BD_CBUTTON.getTextfieldCount();
        BD_CBUTTON.numTextfields++;
        BD_CBUTTON.activeTextfield++;
        var textfieldSection = document.getElementById("textfieldSection" + BD_CBUTTON.activeTextfield);
        var previewTextfieldSection = document.getElementById("previewTextfieldSection" + BD_CBUTTON.activeTextfield);
        if (textfieldSection) {
            var allInputs = textfieldSection.getElementsByTagName("input");
            var allInputsLen = allInputs.length;
            for (var i = 0; i < allInputsLen; i++) {
                allInputs[i].disabled = false;
            }
            wHideShow.show(textfieldSection);
        }
        if (previewTextfieldSection) {
            wHideShow.show(previewTextfieldSection);
        }
        BD_CBUTTON.createTextfieldStructure();
        var addNewTextfieldSection = document.getElementById("addNewTextfieldSection");
        if (addNewTextfieldSection) {
            wHideShow.hide(addNewTextfieldSection);
        }
    },
    createTextfieldStructure: function() {
        BD_CBUTTON.tfStructure = new Array();
        for (var i = 0; i < 2; i++) {
            BD_CBUTTON.tfStructure[i] = document.getElementById("textfieldTitle" + (i + 1)).value;
        }
    },
    getTextfieldCount: function() {
        var tfs = YUD.getElementsByClassName("textfieldSection");
        var tfsLen = tfs.length;
        var tfsCnt = 0;
        var savedTfs = YUD.getElementsByClassName("savedTextfieldSection");
        var savedTfsLen = savedTfs.length;
        var savedTfsCnt = 0;
        for (var i = 0; i < tfsLen; i++) {
            if (YUD.hasClass(tfs[i], "opened")) tfsCnt++;
        }
        for (var i = 0; i < savedTfsLen; i++) {
            if (YUD.hasClass(savedTfs[i], "opened")) savedTfsCnt++;
        }
        BD_CBUTTON.activeTextfield = tfsCnt + savedTfsCnt;
    },
    updateCustomizeButtonSection: function(type, args) {
        var locale = document.getElementById("langCode").value;
        if (args[0].button_type) {
            if (args[0].button_type == "services" || args[0].button_type == "products") {
                BD_CBUTTON.buttonBasedChanges(args[0].button_type, args[0].sub_button_type, locale);
            } else {
                BD_CBUTTON.buttonBasedChanges(args[0].button_type, "", locale);
            }
        }
    },
    buttonBasedChanges: function(buttonType, subButtonType, langCode) {
        var customizeButtonSection = YUD.getElementsByClassName("customizeButtonSection")[0];
        var outerContainer = YUD.getElementsByClassName("outerContainer")[0];
        var borderBox = YUD.getElementsByClassName("borderBox")[0];
        var dropdownPrice = document.getElementById("dropdownPrice");
        var dropdown = document.getElementById("dropdown");
        var textfield = document.getElementById("textfield");
        var addDropdownPrice = document.getElementById("addDropdownPrice");
        var addDropdown = document.getElementById("addDropdown");
        var dropDownLabelForSubscription = document.getElementById("dropDownLabelForSubscription");
        var dropDownLabel = document.getElementById("dropDownLabel");
        var addTextfield = document.getElementById("addTextfield");
        var displayCcLogos = document.getElementById("displayCcLogos");
        var textBuyNow = document.getElementById("textBuyNow");
        var textSubscr = document.getElementById("textSubscr");
        var displayCcLogos = document.getElementById("displayCcLogos");
        var previewImage = document.getElementById("previewImage");
        if (document.getElementById("paypalButton").checked) {
            var previewImageSection = YUD.getElementsByClassName("previewImageSection")[0];
            wHideShow.show(previewImageSection);
        } else {
            var previewCustomImageSection = YUD.getElementsByClassName("previewCustomImageSection")[0];
            wHideShow.show(previewCustomImageSection);
        }
        if (dropdownPrice.checked) {
            onPricePerOption.fire({
                hideItemPrice: true,
                disableItemPrice: false
            });
        } else {
            onPricePerOption.fire({
                hideItemPrice: false,
                disableItemPrice: false
            });
        }
        document.getElementById("buttonTextBuyNow").disabled = true;
        document.getElementById("buttonTextSubscribe").disabled = true;
        wHideShow.hide(textBuyNow);
        wHideShow.hide(textSubscr);
        BD_CBUTTON.buttonType = buttonType;
        switch (buttonType) {
            case "gift_certs":
                if (YUD.hasClass(document.getElementById("buttonAppLink"), "expanded")) {
                    YUD.removeClass(borderBox, "heightFix");
                } else {
                    YUD.addClass(borderBox, "heightFix");
                }
                YUD.setAttribute(outerContainer, 'id', 'sBox');
                if (dropdownPrice.checked) {
                    dropdownPrice.click();
                }
                wHideShow.hide(addDropdownPrice);
                if (dropdown.checked) {
                    dropdown.click();
                }
                wHideShow.hide(addDropdown);
                wHideShow.hide(addDropdown);
                if (textfield.checked) {
                    textfield.click();
                }
                wHideShow.hide(addTextfield);
                wHideShow.show(displayCcLogos);
                BD_CBUTTON.updateImage(langCode);
                break;
            case "subscriptions":
                YUD.removeClass(customizeButtonSection, "heightFix");
                YUD.removeClass(borderBox, "heightFix");
                YUD.setAttribute(outerContainer, 'id', 'wideBox');
                wHideShow.show(addDropdownPrice);
                wHideShow.show(addDropdown);
                wHideShow.hide(dropDownLabel);
                wHideShow.show(dropDownLabelForSubscription);
                BD_CBUTTON.getDropdownCount();
                BD_CBUTTON.getTextfieldCount();
                wHideShow.show(addDropdown);
                wHideShow.show(addTextfield);
                wHideShow.show(displayCcLogos);
                document.getElementById("buttonTextBuyNow").disabled = true;
                document.getElementById("buttonTextSubscribe").disabled = false;
                wHideShow.show(textSubscr);
                var buttonTextSubscribe = document.getElementById("buttonTextSubscribe");
                BD_CBUTTON.buttonType = buttonTextSubscribe.options[buttonTextSubscribe.selectedIndex].value;
                BD_CBUTTON.updateImage(langCode);
                break;
            case "donations":
                if (YUD.hasClass(document.getElementById("buttonAppLink"), "expanded")) {
                    YUD.removeClass(borderBox, "heightFix");
                } else {
                    YUD.addClass(borderBox, "heightFix");
                }
                YUD.setAttribute(outerContainer, 'id', 'sBox');
                if (dropdownPrice.checked) {
                    dropdownPrice.click();
                }
                wHideShow.hide(addDropdownPrice);
                if (dropdown.checked) {
                    dropdown.click();
                }
                wHideShow.hide(addDropdown);
                if (textfield.checked) {
                    textfield.click();
                }
                wHideShow.hide(addTextfield);
                wHideShow.show(displayCcLogos);
                BD_CBUTTON.updateImage(langCode);
                break;
            case "services":
            case "products":
                YUD.removeClass(customizeButtonSection, "heightFix");
                YUD.removeClass(borderBox, "heightFix");
                YUD.setAttribute(outerContainer, 'id', 'sBox');
                BD_CBUTTON.buttonType = subButtonType;
                BD_CBUTTON.getDropdownCount();
                BD_CBUTTON.getTextfieldCount();
                wHideShow.show(addDropdownPrice);
                wHideShow.show(addDropdown);
                wHideShow.show(dropDownLabel);
                wHideShow.hide(dropDownLabelForSubscription);
                wHideShow.show(addTextfield);
                wHideShow.show(displayCcLogos);
                switch (subButtonType) {
                    case "buy_now":
                        document.getElementById("buttonTextBuyNow").disabled = false;
                        wHideShow.show(textBuyNow);
                        document.getElementById("buttonTextSubscribe").disabled = true;
                        var buttonTextBuyNow = document.getElementById("buttonTextBuyNow");
                        BD_CBUTTON.buttonType = buttonTextBuyNow.options[buttonTextBuyNow.selectedIndex].value;
                        break;
                    case "add_to_cart":
                        wHideShow.hide(displayCcLogos);
                        break;
                }
                BD_CBUTTON.updateImage(langCode);
                break;
        }
        document.getElementById("buttonUrl").value = document.getElementById("previewImage").src;
    },
    displaySmallImage: function(e) {
        var previewImage = document.getElementById("previewImage");
        var ccLogos = document.getElementById("ccLogos");
        var displayCcLogos = document.getElementById("displayCcLogos");
        var locale = document.getElementById("langCode").value;
        if (BD_CBUTTON.buttonType != "view_cart") {
            if (imageUrls[locale]) {
                if (this.checked) {
                    ccLogos.checked = false;
                    ccLogos.disabled = true;
                    switch (BD_CBUTTON.buttonType) {
                        case "gift_certs":
                            previewImage.src = imageUrls[locale].GiftCertificate.small;
                            break;
                        case "donations":
                            previewImage.src = imageUrls[locale].Donate.small;
                            break;
                        case "subscriptions":
                            previewImage.src = imageUrls[locale].Subscribe.small;
                            break;
                        case "buy_now":
                            previewImage.src = imageUrls[locale].BuyNow.small;
                            break;
                        case "pay_now":
                            previewImage.src = imageUrls[locale].PayNow.small;
                            break;
                        case "add_to_cart":
                            previewImage.src = imageUrls[locale].AddToCart.small;
                            break;
                    }
                    YUD.addClass(displayCcLogos, "inactiveChkBox");
                } else {
                    switch (BD_CBUTTON.buttonType) {
                        case "gift_certs":
                            previewImage.src = imageUrls[locale].GiftCertificate.large;
                            break;
                        case "donations":
                            previewImage.src = imageUrls[locale].Donate.large;
                            break;
                        case "subscriptions":
                            previewImage.src = imageUrls[locale].Subscribe.large;
                            break;
                        case "buy_now":
                            previewImage.src = imageUrls[locale].BuyNow.large;
                            break;
                        case "pay_now":
                            previewImage.src = imageUrls[locale].PayNow.large;
                            break;
                        case "add_to_cart":
                            previewImage.src = imageUrls[locale].AddToCart.large;
                            break;
                    }
                    ccLogos.disabled = false;
                    YUD.removeClass(displayCcLogos, "inactiveChkBox");
                }
            }
        }
    },
    displayCCImage: function(e) {
        var previewImage = document.getElementById("previewImage");
        var smallButton = document.getElementById("smallButton");
        var flagInt = document.getElementById("flagInternational").disabled ? false : true;
        var locale = flagInt ? "int" : document.getElementById("langCode").value;
        if (imageUrls[locale]) {
            if (this.checked) {
                smallButton.checked = false;
                switch (BD_CBUTTON.buttonType) {
                    case "gift_certs":
                        previewImage.src = imageUrls[locale].GiftCertificate.cc;
                        break;
                    case "donations":
                        previewImage.src = imageUrls[locale].Donate.cc;
                        break;
                    case "subscriptions":
                        previewImage.src = imageUrls[locale].Subscribe.cc;
                        break;
                    case "buy_now":
                        previewImage.src = imageUrls[locale].BuyNow.cc;
                        break;
                    case "pay_now":
                        previewImage.src = imageUrls[locale].PayNow.cc;
                        break;
                }
            } else {
                switch (BD_CBUTTON.buttonType) {
                    case "gift_certs":
                        previewImage.src = imageUrls[locale].GiftCertificate.large;
                        break;
                    case "donations":
                        previewImage.src = imageUrls[locale].Donate.large;
                        break;
                    case "subscriptions":
                        previewImage.src = imageUrls[locale].Subscribe.large;
                        break;
                    case "buy_now":
                        previewImage.src = imageUrls[locale].BuyNow.large;
                        break;
                    case "pay_now":
                        previewImage.src = imageUrls[locale].PayNow.large;
                        break;
                }
            }
        }
    },
    updateImageText: function() {
        BD_CBUTTON.buttonType = this.options[this.selectedIndex].value;
        BD_CBUTTON.updateImage(document.getElementById("langCode").value);
    },
    updateButtonCountry: function() {
        var countryCode = document.getElementById("countryCode");
        var langCode = document.getElementById("langCode");
        var results = this.options[this.selectedIndex].value.split("_");
        if (this.options[this.selectedIndex].text == "International") {
            document.getElementById("flagInternational").disabled = false;
            BD_CBUTTON.refreshCountry(results);
        } else {
            if ((results[1] == "GB") && (!document.getElementById("flagInternational").disabled)) {
                document.getElementById("flagInternational").disabled = true;
                BD_CBUTTON.refreshCountry(results);
            } else {
                document.getElementById("flagInternational").disabled = true;
                if (countryCode.value != results[1]) {
                    BD_CBUTTON.refreshCountry(results);
                } else {
                    if (langCode.value != results[0]) {
                        var locale = results[0];
                        langCode.value = locale;
                        BD_CBUTTON.updateImage(locale);
                    }
                }
            }
        }
    },
    refreshCountry: function(results) {
        var refreshCountryCode = document.createElement("input");
        var countryCode = document.getElementById("countryCode");
        refreshCountryCode.setAttribute("type", "hidden");
        refreshCountryCode.setAttribute("name", "refresh_country_code");
        refreshCountryCode.setAttribute("value", true);
        var buttonDesignerForm = document.getElementById("buttonDesignerForm");
        buttonDesignerForm.appendChild(refreshCountryCode);
        countryCode.value = results[1];
        var buttonDesignerForm = document.getElementById("buttonDesignerForm");
        buttonDesignerForm.submit();
    },
    updateImage: function(locale) {
        if (imageUrls[locale]) {
            var smallButton = document.getElementById("smallButton");
            var ccLogos = document.getElementById("ccLogos");
            var previewImage = document.getElementById("previewImage");
            var flagInt = document.getElementById("flagInternational").disabled ? false : true;
            switch (BD_CBUTTON.buttonType) {
                case "gift_certs":
                    if (smallButton.checked) {
                        previewImage.src = imageUrls[locale].GiftCertificate.small;
                    } else if (ccLogos.checked) {
                        if (flagInt) {
                            previewImage.src = imageUrls["int"].GiftCertificate.cc;
                        } else {
                            previewImage.src = imageUrls[locale].GiftCertificate.cc;
                        }
                    } else {
                        previewImage.src = imageUrls[locale].GiftCertificate.large;
                    }
                    break;
                case "donations":
                    if (smallButton.checked) {
                        previewImage.src = imageUrls[locale].Donate.small;
                    } else if (ccLogos.checked) {
                        if (flagInt) {
                            previewImage.src = imageUrls["int"].Donate.cc;
                        } else {
                            previewImage.src = imageUrls[locale].Donate.cc;
                        }
                    } else {
                        previewImage.src = imageUrls[locale].Donate.large;
                    }
                    break;
                case "subscriptions":
                    if (smallButton.checked) {
                        previewImage.src = imageUrls[locale].Subscribe.small;
                    } else if (ccLogos.checked) {
                        if (flagInt) {
                            previewImage.src = imageUrls["int"].Subscribe.cc;
                        } else {
                            previewImage.src = imageUrls[locale].Subscribe.cc;
                        }
                    } else {
                        previewImage.src = imageUrls[locale].Subscribe.large;
                    }
                    break;
                case "buy_now":
                    if (smallButton.checked) {
                        previewImage.src = imageUrls[locale].BuyNow.small;
                    } else if (ccLogos.checked) {
                        if (flagInt) {
                            previewImage.src = imageUrls["int"].BuyNow.cc;
                        } else {
                            previewImage.src = imageUrls[locale].BuyNow.cc;
                        }
                    } else {
                        previewImage.src = imageUrls[locale].BuyNow.large;
                    }
                    break;
                case "pay_now":
                    if (smallButton.checked) {
                        previewImage.src = imageUrls[locale].PayNow.small;
                    } else if (ccLogos.checked) {
                        if (flagInt) {
                            previewImage.src = imageUrls["int"].PayNow.cc;
                        } else {
                            previewImage.src = imageUrls[locale].PayNow.cc;
                        }
                    } else {
                        previewImage.src = imageUrls[locale].PayNow.large;
                    }
                    break;
                case "add_to_cart":
                    if (smallButton.checked) {
                        previewImage.src = imageUrls[locale].AddToCart.small;
                    } else {
                        previewImage.src = imageUrls[locale].AddToCart.large;
                    }
                    break;
            }
        }
    },
    buildDropdownInfo: function(deletedDdNum) {
        var dropdownInfo = new Array();
        var dropdownPrice = document.getElementById("dropdownPrice");
        var dropdown = document.getElementById("dropdown");
        if (dropdownPrice.checked) {
            var options = YUD.getElementsByClassName("optionRow", "p", "dropdownPriceSection");
            var optionNames = YUD.getElementsByClassName("ddpOptionName", "input", "dropdownPriceSection");
            var optionPrices = YUD.getElementsByClassName("ddpOptionPrice", "input", "dropdownPriceSection");
            var optionCurrencies = YUD.getElementsByClassName("ddpOptionCurrency", "", "dropdownPriceSection");
            var optionFrequency = YUD.getElementsByClassName("ddpOptionFrequency", "", "dropdownPriceSection");
            var optionsLen = options.length;
            var previewDropdownPriceSection = document.getElementById("previewDropdownPriceSection");
            if (YUD.hasClass(previewDropdownPriceSection, "opened")) {
                if (optionsLen != 0) {
                    var dropdownObj = {
                        ddName: document.getElementById("dropdownPriceTitle").getAttribute("name"),
                        title: document.getElementById("dropdownPriceTitle").value,
                        withPrice: true
                    };
                    for (var i = 0; i < optionsLen; i++) {
                        if (!options[i].getAttribute('id')) {
                            BD_CBUTTON.optionCounter++;
                            options[i].setAttribute('id', 'option_row_' + BD_CBUTTON.optionCounter);
                        }
                        var optionId = options[i].getAttribute('id').split('_')[2];
                        var optionObj = new Object;
                        optionObj.optionName = optionNames[i].value;
                        optionObj.price = optionPrices[i].value;
                        optionObj.currency = optionCurrencies[0].options[optionCurrencies[0].selectedIndex].value;
                        optionObj.frequency = optionFrequency[i].options[optionFrequency[i].selectedIndex].text;
                        dropdownObj[optionId] = optionObj;
                    }
                    dropdownInfo.push(dropdownObj);
                }
            }
        }
        if (dropdown.checked) {
            for (var i = 1; i < 5; i++) {
                var flag = (deletedDdNum != 0 && deletedDdNum == i) ? true : false;
                var previewDropdownSection = document.getElementById("previewDropdownSection" + i);
                if (YUD.hasClass(previewDropdownSection, "opened")) {
                    var options = YUD.getElementsByClassName("optionRow", "p", "dropdownSection" + i);
                    var optionNames = YUD.getElementsByClassName("ddOptionName", "input", "dropdownSection" + i);
                    var optionsLen = options.length;
                    if (optionsLen != 0) {
                        var dropdownObj = {
                            ddName: YUD.getElementsByClassName("dropdownTitle", "input", "dropdownSection" + i)[0].getAttribute("name"),
                            title: YUD.getElementsByClassName("dropdownTitle", "input", "dropdownSection" + i)[0].value,
                            deleted: flag,
                            withPrice: false
                        };
                        for (var j = 0; j < optionsLen; j++) {
                            if (!options[j].getAttribute('id')) {
                                BD_CBUTTON.optionCounter++;
                                options[j].setAttribute('id', 'option_row_' + BD_CBUTTON.optionCounter);
                            }
                            var optionId = options[j].getAttribute('id').split('_')[2];
                            var optionObj = new Object;
                            optionObj.optionName = optionNames[j].value;
                            optionObj.price = "";
                            optionObj.currency = "";
                            dropdownObj[optionId] = optionObj;
                        }
                        dropdownInfo.push(dropdownObj);
                    }
                }
            }
        }
        onDropdownPriceChange.fire({
            dropdownInfo: dropdownInfo
        });
    },
    saveDropdowns: function() {
        var dropdownPriceSection = document.getElementById("dropdownPriceSection");
        if (YUD.hasClass(dropdownPriceSection, "opened")) {
            BD_CBUTTON.saveOptionPrice();
        }
        for (var i = 1; i < 5; i++) {
            BD_CBUTTON.activeDropdown = i;
            var dropdownSection = document.getElementById("dropdownSection" + i);
            if (YUD.hasClass(dropdownSection, "opened")) {
                BD_CBUTTON.saveOption();
            }
            var savedDropdownSection = document.getElementById("savedDropdownSection" + i);
            if (YUD.hasClass(savedDropdownSection, "accessAid")) {
                var allInputs = dropdownSection.getElementsByTagName("input");
                var allInputsLen = allInputs.length;
                for (var j = 0; j < allInputsLen; j++) {
                    allInputs[j].disabled = true;
                }
            }
        }
    },
    saveDropdownsAndSubmit: function(e) {
        if (BD_CBUTTON.buttonType != "view_cart") {
            YUE.preventDefault(e);
            BD_CBUTTON.saveDropdowns();
            var buttonUrl = document.getElementById("buttonUrl");
            buttonUrl.value = document.getElementById("previewImage").src;
            var buttonDesignerForm = document.getElementById("buttonDesignerForm");
            buttonDesignerForm.submit();
        }
    },
    updateCurrency: function() {
        var optionCurrencies = YUD.getElementsByClassName("ddpOptionCurrency", "label", "dropdownPriceSection");
        var currencyLabels = YUD.getElementsByClassName("currencyLabel", "", "stepOne");
        var defCurrency = YUD.getElementsByClassName("ddpOptionCurrency", "select", "dropdownPriceSection")[0];
        var defCurrencyLen = defCurrency.options.length;
        if (defCurrencyLen > 0) {
            var defCurrencyValue = defCurrency.options[defCurrency.selectedIndex].value;
            var optionCurrenciesLen = optionCurrencies.length;
            var currencyLabelsLen = currencyLabels.length;
            for (var i = 0; i < optionCurrenciesLen; i++) {
                optionCurrencies[i].innerHTML = defCurrencyValue;
            }
            for (i = 0; i < currencyLabelsLen; i++) {
                currencyLabels[i].innerHTML = defCurrencyValue;
            }
            var currencySelects = YUD.getElementsByClassName("currencySelect", "", "stepOne");
            var currencySelectsLen = currencySelects.length;
            for (i = 0; i < currencySelectsLen; i++) {
                var currencyOptionsLen = currencySelects[i].options.length;
                for (j = 0; j < currencyOptionsLen; j++) {
                    if (currencySelects[i].options[j].value == defCurrencyValue) {
                        currencySelects[i].options[j].selected = true;
                    }
                }
            }
        }
    },
    dropdownCurrencyChange: function(type, args) {
        var step1 = document.getElementById("stepOne");
        if (args[0].item_price_currency) {
            var currencyCode = args[0].item_price_currency;
            var currencyElement = args[0].eventTarget;
            var currencyLabels = YUD.getElementsByClassName('ddpOptionCurrency', 'label', step1);
            var currencyLabelsLen = currencyLabels.length;
            for (i = 0; i < currencyLabelsLen; i++) {
                currencyLabels[i].innerHTML = currencyCode;
            }
            var currencySelects = YUD.getElementsByClassName('ddpOptionCurrency', 'select', '');
            var currencySelectsLen = currencySelects.length;
            for (i = 0; i < currencySelectsLen; i++) {
                if (currencySelects[i] != currencyElement.id) {
                    var currencyOptionsLen = currencySelects[i].options.length;
                    for (j = 0; j < currencyOptionsLen; j++) {
                        if (currencySelects[i].options[j].value == currencyCode) {
                            currencySelects[i].options[j].selected = true;
                        }
                    }
                }
            }
            BD_CBUTTON.createDropdownPriceStructure();
        }
    },
    makeFieldReadOnly: function() {
        this.blur();
    },
    escapeText: function(txt) {
        var retTxt = txt;
        var re = /</g;
        retTxt = retTxt.replace(re, "&lt;");
        re = />/g;
        retTxt = retTxt.replace(re, "&gt;");
        return retTxt;
    }
};
BD_MASTER = PAYPAL.Merchant.ButtonDesigner.Master;
BD_STEP1 = PAYPAL.Merchant.ButtonDesigner.StepOne;
BD_CBUTTON = PAYPAL.Merchant.ButtonDesigner.CustomizeButton;
PAYPAL.util.Event.onDomReady(BD_MASTER.init);
PAYPAL.Merchant.ButtonDesigner.StepTwo = {
    inventoryChecked: false,
    PNLChecked: false,
    dropDowns: null,
    itemInfo: new Object,
    buttonType: '',
    currentDD: 0,
    ddLightbox: null,
    initialLoad: true,
    byItem: true,
    withPrice: false,
    ddCount: 0,
    ddData: new Object,
    init: function() {
        var stepTwo = document.getElementById("stepTwo");
        if (!stepTwo) return;
        var fades = YUD.getElementsByClassName("fadedOut", '', stepTwo);
        BD_MASTER.fadeOut(fades);
        YUE.addListener("enableHostedButtons", 'click', this.toggleOptions);
        YUE.addListener("enableInventory", 'click', this.toggleTables);
        YUE.addListener("enableProfitAndLoss", 'click', this.toggleTables);
        YUE.addListener("trackByOption", 'click', this.trackByOption);
        YUE.addListener("trackByItem", 'click', this.trackByItem);
        YUE.addListener("chooseAnotherDropDown", 'click', this.chooseAnotherDropDown);
        YUE.addListener("ddLightboxSubmit", 'click', this.pickDropDown);
        YUE.addListener("enablePreOrder", 'click', this.enablePreOrder);
        YUE.addListener("dontEnablePreOrder", 'click', this.dontEnablePreOrder);
        onDropdownPriceChange.subscribe(this.updateDropdownData);
        onItemDetailsChange.subscribe(this.itemDetailsChangeSubscriber);
        try {
            this.inventoryChecked = (document.getElementById("enableInventory") && document.getElementById("enableInventory").checked == true) ? true : false;
        } catch (e) {}
        try {
            this.PNLChecked = (document.getElementById("enableProfitAndLoss") && document.getElementById("enableProfitAndLoss").checked == true) ? true : false;
        } catch (e) {}
        try {
            this.byItem = (document.getElementById("trackByItem") && document.getElementById("trackByItem").checked == true) ? true : false;
        } catch (e) {}
        try {
            this.withPrice = (document.getElementById("dropdownPrice") && document.getElementById("dropdownPrice").checked == true) ? true : false;
        } catch (e) {}
        if (this.inventoryChecked) {
            try {
                BD_MASTER.fadeIn(document.getElementById("soldOutOption"));
                if (YUD.hasClass(document.getElementById("shoppingURL"), 'fadedOut')) {
                    BD_MASTER.fadeOut(document.getElementById("shoppingURL"));
                }
            } catch (e) {}
        }
        var currDDs = YUD.getElementsByClassName("currencySelect", 'select', "stepOne")[0];
        this.itemInfo.currency = currDDs.options[currDDs.selectedIndex].value;
        this.itemInfo.currency = (YUD.hasClass(stepTwo, 'reportingDisabled')) ? 'disabled' : this.itemInfo.currency;
        BD_CBUTTON.buildDropdownInfo(0);
    },
    enablePreOrder: function(e) {
        var soldOutURL = document.getElementById('shoppingURL');
        BD_MASTER.fadeOut(soldOutURL);
    },
    dontEnablePreOrder: function(e) {
        var soldOutURL = document.getElementById('shoppingURL');
        BD_MASTER.fadeIn(soldOutURL);
    },
    pickDropDown: function(e) {
        YUE.preventDefault(e);
        var lightboxChoiceBody = document.getElementById("lightboxChoiceBody");
        var options = YUD.getElementsByClassName("lbOption", "input", lightboxChoiceBody);
        var optionsLen = options.length;
        for (var i = 0; i < optionsLen; i++) {
            if (options[i].checked) {
                BD_STEP2.currentDD = parseInt(options[i].id.split('_')[1]);
            }
        }
        var tempDD = BD_STEP2.dropDowns;
        var curDD = BD_STEP2.currentDD;
        for (var item in tempDD[curDD]) {
            var isByOption = (item.price != '' || item.price != null || typeof item.price != 'undefined') ? true : false;
        }
        if (isByOption) {
            BD_STEP2.trackByOption();
            try {
                document.getElementById('trackByOption').checked = true;
            } catch (e) {}
        } else {
            BD_STEP2.trackByItem();
            try {
                document.getElementById('trackByItem').checked = true;
            } catch (e) {}
        }
        BD_STEP2.ddLightbox.close();
    },
    saveInvData: function() {
        var parentTable = document.getElementById("byOptionTableBody");
        var rows = YUD.getElementsByClassName("inventory-table-row", "div", parentTable);
        if (rows) {
            var rowsLen = rows.length;
            for (var i = 1; i < rowsLen; i++) {
                var rowId = rows[i].getAttribute('id');
                if (rowId != null) {
                    var inputs = rows[i].getElementsByTagName('input');
                    var inputsLen = inputs.length;
                    var selectedDropDown = rowId;
                    for (var j = 0; j < inputsLen; j++) {
                        if (!BD_STEP2.ddData[selectedDropDown]) {
                            BD_STEP2.ddData[selectedDropDown] = new Array;
                        }
                        if (!BD_STEP2.ddData[selectedDropDown][j]) {
                            BD_STEP2.ddData[selectedDropDown][j] = new Array;
                        }
                        BD_STEP2.ddData[selectedDropDown][j] = inputs[j].value;
                    }
                }
            }
        }
    },
    updateDropdownData: function(e, obj) {
        var ddi = obj[0].dropdownInfo;
        var withPrice = false;
        var ddlink = document.getElementById('chooseAnotherDropDown');
        var byItemTable = document.getElementById('trackByItemTable');
        var byItemTableBody = document.getElementById('byItemTableBody');
        var byItem = document.getElementById('trackByItem');
        var byOptionTable = document.getElementById('trackByOptionTable');
        var byOptionTableBody = document.getElementById('byOptionTableBody');
        BD_STEP2.saveInvData();
        if (ddlink != null && ddi != '' && ddi.length != 0) {
            BD_STEP2.ddCount = 0;
            for (var item in ddi) {
                if (ddi[item].withPrice) {
                    withPrice = true;
                }
                if (ddi[item].deleted) {
                    for (var subItem in ddi[item]) {
                        delete BD_STEP2.ddData[ddi[item].ddName + '_' + subItem]
                    }
                }
            }
            if (!withPrice) {
                while (!ddi[BD_STEP2.currentDD] && BD_STEP2.currentDD >= 0) {
                    BD_STEP2.currentDD--;
                }
            } else {
                BD_STEP2.currentDD = 0;
            }
            for (var counter in ddi[BD_STEP2.currentDD]) {
                if (counter != 'title' && counter != 'withPrice' && counter != 'ddName' && counter != 'deleted') {
                    BD_STEP2.ddCount++;
                }
            }
        } else {
            BD_STEP2.ddData = new Object;
        }
        BD_STEP2.dropDowns = ddi;
        if (!BD_STEP2.initialLoad && document.getElementById('trackByOption')) {
            if (withPrice) {
                YUD.addClass(ddlink, 'accessAid');
                BD_STEP2.withPrice = true;
            }
            if (ddi.length > 0) {
                var inputs = byItemTableBody.getElementsByTagName('input');
                var inputsLen = inputs.length;
                var itemInv = false;
                for (var i = 0; i < inputsLen; i++) {
                    if (inputs[i] && inputs[i].value != '' && inputs[i].value != null) {
                        itemInv = true;
                    }
                }
                if (document.getElementById('trackByItem').checked && (BD_STEP2.inventoryChecked || BD_STEP2.PNLChecked)) {
                    if (ddi.length > 1) {
                        try {
                            YUD.removeClass(ddlink, 'accessAid');
                        } catch (e) {}
                    } else {
                        try {
                            YUD.addClass(ddlink, 'accessAid');
                        } catch (e) {}
                    }
                    if (BD_STEP2.inventoryChecked || BD_STEP2.PNLChecked) {
                        BD_MASTER.fadeIn(byOptionTable);
                        YUD.removeClass(byOptionTable, 'accessAid');
                        BD_MASTER.fadeOut(byOptionTableBody);
                    }
                } else {
                    try {
                        document.getElementById('trackByOption').checked = true;
                    } catch (e) {}
                    BD_STEP2.trackByOption();
                    if (BD_STEP2.inventoryChecked || BD_STEP2.PNLChecked) {
                        try {
                            BD_MASTER.fadeIn(byItemTable);
                        } catch (e) {}
                        if (!BD_STEP2.byItem) {
                            try {
                                BD_MASTER.fadeOut(byItemTableBody);
                            } catch (e) {}
                        }
                    }
                    if (ddi.length > 1) {
                        try {
                            YUD.removeClass(ddlink, 'accessAid');
                        } catch (e) {}
                    } else {
                        try {
                            YUD.addClass(ddlink, 'accessAid');
                        } catch (e) {}
                    }
                    BD_STEP2.withPrice = false;
                    YUD.removeClass(byOptionTable, 'accessAid');
                }
            } else {
                try {
                    document.getElementById('trackByItem').checked = true;
                } catch (e) {}
                BD_STEP2.trackByItem();
                try {
                    YUD.addClass(ddlink, 'accessAid');
                } catch (e) {}
                try {
                    BD_MASTER.fadeOut(byOptionTable);
                    YUD.addClass(byOptionTable, 'accessAid');
                } catch (e) {}
                BD_STEP2.withPrice = false;
            }
        } else {
            var rows = YUD.getElementsByClassName("inventory-table-row", "div", byOptionTableBody);
            if (rows[1] && rows[1].getAttribute('id')) {
                if (!BD_STEP2.withPrice) {
                    var selectedDD = rows[1].getAttribute('id').split('_')[0];
                    BD_STEP2.currentDD = parseInt(selectedDD.charAt(selectedDD.length - 1)) - 1;
                } else {
                    BD_STEP2.currentDD = 0;
                }
                var rowCounter = 1;
                for (item in BD_STEP2.dropDowns[BD_STEP2.currentDD]) {
                    if (item != 'title' && item != 'withPrice' && item != 'ddName' && item != 'deleted') {
                        if (BD_STEP2.withPrice) {
                            try {
                                rows[rowCounter].setAttribute('id', 'dropdown_price_title_' + item);
                            } catch (e) {};
                        } else {
                            try {
                                rows[rowCounter].setAttribute('id', BD_STEP2.dropDowns[BD_STEP2.currentDD].ddName + '_' + item);
                            } catch (e) {};
                        }
                        rowCounter++;
                    }
                }
            }
            BD_STEP2.initialLoad = false;
            if (BD_STEP2.dropDowns.length > 1 && YUD.hasClass(ddlink, 'accessAid') && !withPrice) {
                YUD.removeClass(ddlink, 'accessAid');
            } else if (BD_STEP2.dropDowns.length > 0) {
                YUD.removeClass(byOptionTable, 'accessAid');
            } else {
                YUD.addClass(byOptionTable, 'accessAid');
            }
        }
    },
    chooseAnotherDropDown: function(e) {
        YUE.preventDefault(e);
        var tempDD = BD_STEP2.dropDowns;
        if (tempDD != null) {
            if (BD_STEP2.ddLightbox == null) {
                BD_STEP2.ddLightbox = new PAYPAL.util.Lightbox("ddLightbox");
            }
            var lightboxChoiceBody = document.getElementById("lightboxChoiceBody");
            var labels = lightboxChoiceBody.getElementsByTagName('label');
            while (lightboxChoiceBody.childNodes[0]) {
                lightboxChoiceBody.removeChild(lightboxChoiceBody.lastChild);
            }
            var html = lightboxChoiceBody.innerHTML;
            for (var item in tempDD) {
                var subItems = new Array();
                for (var subItem in tempDD[item]) {
                    if (subItem != 'title' && subItem != 'withPrice' && subItem != 'ddName' && subItem != 'deleted') {
                        subItems.push(tempDD[item][subItem].optionName);
                    }
                }
                var subItem = '(' + subItems.join(', ') + ')';
                var title = tempDD[item].title;
                if (title == 'undefined' || title == null || typeof title == 'undefined') {
                    title = '';
                }
                var checked = (item == BD_STEP2.currentDD) ? "checked" : "";
                var escTitle = PAYPAL.util.escapeHTML(title);
                var escsubItem = PAYPAL.util.escapeHTML(subItem);
                html += "<label for='lbdd_" + item + "'><input type='radio' name='lightBoxSelection' class='lbOption' id='lbdd_" + item + "' " + checked + "/>" + escTitle + " " + escsubItem + "</label>";
            }
            lightboxChoiceBody.innerHTML = html;
            BD_STEP2.ddLightbox.show();
        }
    },
    trackByItem: function() {
        BD_STEP2.byItem = true;
        var parentTable = document.getElementById("byItemTableBody");
        var optionsTable = document.getElementById("byOptionTableBody");
        wHideShow.hide(optionsTable);
        var rows = YUD.getElementsByClassName("inventory-table-row", "div", parentTable);
        var rowsLen = rows.length;
        if (rowsLen < 1) {
            rows = YUD.getElementsByClassName("inventory-table-row", "div", optionsTable);
        }
        if (rowsLen > 0) {
            var newRow = rows[rowsLen - 1].cloneNode(true);
            var tempII = BD_STEP2.itemInfo;
            var divs = newRow.getElementsByTagName('div');
            var inputs = newRow.getElementsByTagName('input');
            divs[0].innerHTML = '&nbsp;';
            if ((tempII.currency == 'undefined' || tempII.currency == null) && BD_STEP2.itemInfo.currency != 'disabled') {
                divs[divs.length - 1].innerHTML = '';
            } else if (BD_STEP2.itemInfo.currency != 'disabled') {
                divs[divs.length - 1].innerHTML = tempII.currency;
            }
            divs[0].innerHTML = '&nbsp;';
            parentTable.appendChild(newRow);
            for (var i = 1; i < rowsLen; i++) {
                try {
                    parentTable.removeChild(rows[i]);
                } catch (e) {}
            }
            BD_MASTER.fadeOut(optionsTable);
            BD_MASTER.fadeIn(parentTable);
        }
        try {
            if (BD_STEP2.inventoryChecked || BD_STEP2.PNLChecked) {
                BD_MASTER.fadeIn(document.getElementById('trackByItemTable'));
                BD_MASTER.fadeIn(parentTable);
                var PNLItems = YUD.getElementsByClassName("PNLRelated", '', parentTable);
                var invItems = YUD.getElementsByClassName("invRelated", '', parentTable);
                if (BD_STEP2.inventoryChecked) {
                    BD_MASTER.fadeIn(invItems);
                } else {
                    BD_MASTER.fadeOut(invItems);
                }
                if (BD_STEP2.PNLChecked) {
                    BD_MASTER.fadeIn(PNLItems);
                } else {
                    BD_MASTER.fadeOut(PNLItems);
                }
            } else {
                BD_MASTER.fadeOut(document.getElementById('trackByItemTable'));
            }
            wHideShow.show(parentTable);
        } catch (e) {}
    },
    trackByOption: function() {
        if (!BD_MASTER.isNumber(BD_STEP2.currentDD)) {
            BD_STEP2.currentDD = 0;
        }
        BD_STEP2.byItem = false;
        var parentTable = document.getElementById("byOptionTableBody");
        var itemTable = document.getElementById("byItemTableBody");
        var byOptionTable = document.getElementById('trackByOptionTable');
        var tempDD = BD_STEP2.dropDowns;
        var currentDD = BD_STEP2.currentDD;
        if (tempDD != null && tempDD != '') {
            BD_STEP2.ddCount = 0;
            for (var counter in tempDD[BD_STEP2.currentDD]) {
                if (counter != 'title' && counter != 'withPrice' && counter != 'ddName' && counter != 'deleted') {
                    BD_STEP2.ddCount++;
                }
            }
        }
        wHideShow.hide(itemTable);
        if (!BD_STEP2.initialLoad) {
            BD_STEP2.saveInvData();
        }
        rows = YUD.getElementsByClassName("inventory-table-row", "div", parentTable);
        rowsLen = rows.length;
        if (rowsLen < 2) {
            var rows = YUD.getElementsByClassName("inventory-table-row", "div", itemTable);
            var newRow = rows[1].cloneNode(true);
            var inputs = newRow.getElementsByTagName('input');
            var inputsLen = inputs.length;
            for (var j = 0; j < inputsLen; j++) {
                inputs[j].value = '';
                inputs[j].disabled = false;
            }
            parentTable.appendChild(newRow);
        }
        rows = YUD.getElementsByClassName("inventory-table-row", "div", parentTable);
        rowsLen = rows.length;
        if (BD_STEP2.ddCount > (rowsLen - 1)) {
            var createCount = BD_STEP2.ddCount - (rowsLen - 1);
            for (var i = 0; i < createCount; i++) {
                var newRow = rows[1].cloneNode(true);
                var inputs = newRow.getElementsByTagName('input');
                var inputsLen = inputs.length;
                for (var j = 0; j < inputsLen; j++) {
                    inputs[j].value = '';
                }
                parentTable.appendChild(newRow);
            }
        }
        rows = YUD.getElementsByClassName("inventory-table-row", "div", parentTable);
        var rowIndex = 1;
        for (var item in tempDD[currentDD]) {
            if (item != 'title' && item != 'withPrice' && item != 'ddName' && item != 'deleted') {
                var divs = rows[rowIndex].getElementsByTagName('div');
                var inputs = rows[rowIndex].getElementsByTagName('input');
                var inputsLen = inputs.length;
                var rowId = tempDD[currentDD]['ddName'];
                if (!BD_STEP2.initialLoad) {
                    var oldRowId = rows[rowIndex].getAttribute('id');
                    var newRowId = rowId + '_' + item;
                    if (oldRowId != newRowId) {
                        if (tempDD[currentDD]['deleted']) {
                            BD_STEP2.ddData[newRowId] = BD_STEP2.ddData[oldRowId];
                        }
                        rows[rowIndex].setAttribute('id', newRowId);
                    }
                }
                if (BD_STEP2.initialLoad) {
                    BD_STEP2.saveInvData();
                }
                for (var j = 0; j < inputsLen; j++) {
                    if (BD_STEP2.ddData[newRowId] && BD_STEP2.ddData[newRowId] != 'undefined') {
                        inputs[j].value = BD_STEP2.ddData[newRowId][j];
                    } else {
                        inputs[j].value = '';
                    }
                }
                if (tempDD[currentDD][item].optionName != '') {
                    if (tempDD[currentDD][item].optionName.length > 14) {
                        divs[0].innerHTML = tempDD[currentDD][item].optionName.substring(0, 14) + '...';
                    } else {
                        divs[0].innerHTML = tempDD[currentDD][item].optionName;
                    }
                } else {
                    divs[0].innerHTML = '&nbsp;';
                }
                if (tempDD[currentDD][item].currency != '' && BD_STEP2.itemInfo.currency != 'disabled') {
                    divs[divs.length - 1].innerHTML = tempDD[currentDD][item].currency;
                } else if (BD_STEP2.itemInfo.currency != 'disabled') {
                    divs[divs.length - 1].innerHTML = BD_STEP2.itemInfo.currency;
                }
                rowIndex++;
            } else if (item == 'ddName') {
                var selectedDropDown = document.getElementById("selectedDropDown");
                selectedDropDown.setAttribute('value', tempDD[currentDD][item]);
            }
        }
        if (!BD_STEP2.initialLoad) {
            if (BD_STEP2.ddCount < (rowsLen - 1)) {
                var diff = (rowsLen - 1) - BD_STEP2.ddCount;
                for (var i = (rowsLen - 1); i > (rowsLen - 1 - diff); i--) {
                    parentTable.removeChild(rows[i]);
                }
            }
            BD_MASTER.fadeOut(itemTable);
            if (BD_STEP2.inventoryChecked || BD_STEP2.PNLChecked) {
                BD_MASTER.fadeIn(parentTable);
                BD_MASTER.fadeIn(byOptionTable);
            }
            YUD.removeClass(byOptionTable, 'accessAid');
            var PNLItems = YUD.getElementsByClassName("PNLRelated", '', parentTable);
            var invItems = YUD.getElementsByClassName("invRelated", '', parentTable);
            var parentDisabled = YUD.hasClass(byOptionTable, 'fadedOut');
            if (BD_STEP2.inventoryChecked) {
                BD_MASTER.fadeIn(invItems);
            } else {
                if (!parentDisabled) {
                    BD_MASTER.fadeOut(invItems);
                }
            }
            if (BD_STEP2.PNLChecked) {
                BD_MASTER.fadeIn(PNLItems);
            } else {
                if (!parentDisabled) {
                    BD_MASTER.fadeOut(PNLItems);
                }
            }
            if (parentDisabled) {
                var kids = parentTable.getElementsByTagName('input');
                var kidsLen = kids.length;
                for (var i = 0; i < kidsLen; i++) {
                    if (!kids[i].disabled) {
                        kids[i].disabled = true;
                    }
                }
            }
        } else {
            BD_STEP2.initialLoad = false;
        }
        wHideShow.show(parentTable);
    },
    itemDetailsChangeSubscriber: function(e, obj) {
        var invOpt = document.getElementById("inventoryOptions");
        if (obj[0].button_type && invOpt != null) {
            var invTable = document.getElementById("inventoryTable");
            var soldOutOpt = document.getElementById("soldOutOption");
            var productBasedHeading = document.getElementById("productBasedHeading");
            var giftBasedHeading = document.getElementById("giftBasedHeading");
            var urlInput = document.getElementById("shoppingURL");
            var shoppingHead = document.getElementById("shoppingHead");
            var shoppingPreOrder = document.getElementById("shoppingPreOrder");
            var shoppingNoPreOrder = document.getElementById("dontEnablePreOrder");
            var shoppingNoPreOrderLabel = document.getElementById("shoppingNoPreOrderLabel");
            BD_STEP2.buttonType = obj[0].button_type;
            switch (obj[0].button_type) {
                case "gift_certs":
                    wHideShow.hide(shoppingNoPreOrderLabel);
                    wHideShow.hide(shoppingNoPreOrder);
                    wHideShow.hide(shoppingPreOrder);
                    wHideShow.hide(shoppingHead);
                    wHideShow.hide(invOpt);
                    wHideShow.hide(invTable);
                    wHideShow.hide(productBasedHeading);
                    wHideShow.hide(urlInput);
                    wHideShow.hide(soldOutOpt);
                    wHideShow.show(giftBasedHeading);
                    break;
                case "donations":
                    wHideShow.hide(invOpt);
                    wHideShow.hide(invTable);
                    wHideShow.hide(soldOutOpt);
                    wHideShow.hide(productBasedHeading);
                    wHideShow.show(giftBasedHeading);
                    wHideShow.show(shoppingNoPreOrderLabel);
                    wHideShow.show(shoppingNoPreOrder);
                    wHideShow.show(shoppingPreOrder);
                    wHideShow.show(shoppingHead);
                    break;
                default:
                    if (!YUD.hasClass(soldOutOpt, 'fadedOut')) {
                        BD_MASTER.fadeOut(soldOutOpt);
                    }
                    wHideShow.hide(giftBasedHeading);
                    wHideShow.show(shoppingNoPreOrderLabel);
                    wHideShow.show(shoppingNoPreOrder);
                    wHideShow.show(shoppingPreOrder);
                    wHideShow.show(shoppingHead);
                    wHideShow.show(urlInput);
                    wHideShow.show(productBasedHeading);
                    wHideShow.show(invOpt);
                    if (document.getElementById("enableHostedButtons").checked) {
                        BD_MASTER.fadeIn(invOpt);
                    }
                    wHideShow.show(invTable);
                    BD_MASTER.fadeIn(invTable);
                    BD_STEP2.toggleTables();
                    wHideShow.show(soldOutOpt);
                    break;
            }
        }
        if ((obj[0].item_price_currency || obj[0].ddp_option_currency) && BD_STEP2.itemInfo.currency != 'disabled') {
            var currencyCode = (obj[0].item_price_currency) ? obj[0].item_price_currency : obj[0].ddp_option_currency;
            BD_STEP2.itemInfo.currency = currencyCode;
            var fieldsToUpdate = YUD.getElementsByClassName('right-edge', 'div', 'inventoryTable');
            var fieldsToUpdateLen = fieldsToUpdate.length;
            for (var i = 0; i < fieldsToUpdateLen; i++) {
                if (i != 0 && i != 2)
                    fieldsToUpdate[i].innerHTML = BD_STEP2.itemInfo.currency;
            }
        }
        if (obj[0].product_name) {
            var itemNameEsc = obj[0].product_name;
            var itemName = PAYPAL.util.escapeHTML(itemNameEsc);
            var itemLabel = document.getElementById("byItemLabel");
            if (itemLabel != null) {
                var itemLabelContent = itemLabel.innerHTML.split('-');
                if (itemName.length > 40) {
                    itemName = itemName.substring(0, 40) + '...';
                }
                itemLabelContent = itemLabelContent[0] + ' - ' + itemName;
                itemLabel.innerHTML = itemLabelContent;
                BD_STEP2.itemInfo.itemName = itemName;
            }
        }
        if (obj[0].product_id || obj[0].subscription_id) {
            var itemId = YUD.getElementsByClassName('type-text', 'input', 'byItemTableBody')[0];
            if (obj[0].subscription_id) {
                try {
                    itemId.value = obj[0].subscription_id;
                } catch (e) {}
            } else if (obj[0].product_id) {
                try {
                    itemId.value = obj[0].product_id;
                } catch (e) {}
            }
        }
    },
    toggleOptions: function() {
        var daddy = document.getElementById("inventoryOptions");
        var checkbox = document.getElementById("enableHostedButtons");
        var kiddies = YUD.getElementsBy(function(ele) {
            return (ele.getAttribute("type") == "checkbox");
        }, "input", daddy);
        var kiddiesLen = kiddies.length;
        for (var i = 0; i < kiddiesLen; i++) {
            kiddies[i].checked = false;
            if (kiddies[i].disabled) {
                kiddies[i].disabled = false;
            } else {
                kiddies[i].disabled = true;
            }
        }
        BD_MASTER.toggleFade(daddy);
        BD_STEP2.toggleTables();
        checkbox.blur();
    },
    toggleTables: function() {
        var daddy = document.getElementById("inventoryTable");
        var byItemTable = document.getElementById("trackByItemTable");
        var byItemTableBody = document.getElementById("byItemTableBody");
        var byOptionTable = document.getElementById("trackByOptionTable");
        var byOptionTableBody = document.getElementById("byOptionTableBody");
        var soldOutOption = document.getElementById("soldOutOption");
        var soldOutURL = document.getElementById('shoppingURL');
        var enablePreOrder = document.getElementById('enablePreOrder');
        var PNLItems = YUD.getElementsByClassName("PNLRelated", '', daddy);
        var invItems = YUD.getElementsByClassName("invRelated", '', daddy);
        BD_STEP2.inventoryChecked = (document.getElementById("enableInventory").checked == true) ? true : false;
        BD_STEP2.PNLChecked = (document.getElementById("enableProfitAndLoss") && document.getElementById("enableProfitAndLoss").checked == true) ? true : false;
        try {
            BD_STEP2.withPrice = (document.getElementById("dropdownPrice").checked == true) ? true : false;
        } catch (e) {}
        if (document.getElementById("enableHostedButtons").checked == false) {
            BD_STEP2.inventoryChecked = false;
            BD_STEP2.PNLChecked = false;
        }
        if (!BD_STEP2.inventoryChecked && !BD_STEP2.PNLChecked) {
            BD_MASTER.fadeIn(PNLItems);
            BD_MASTER.fadeIn(invItems);
            BD_MASTER.fadeIn(byItemTableBody);
            BD_MASTER.fadeOut(byItemTable);
            BD_MASTER.fadeIn(byOptionTableBody);
            BD_MASTER.fadeOut(byOptionTable);
            if (BD_STEP2.buttonType == 'gift_certs' && document.getElementById("enableHostedButtons").checked == true) {
                BD_MASTER.fadeIn(soldOutURL);
                BD_MASTER.fadeIn(soldOutOption);
            } else {
                BD_MASTER.fadeOut(soldOutURL);
                BD_MASTER.fadeOut(soldOutOption);
            }
        } else {
            if (BD_STEP2.byItem) {
                BD_MASTER.fadeIn(byItemTable);
                BD_MASTER.fadeIn(byItemTableBody);
                if (!YUD.hasClass(document.getElementById('chooseAnotherDropDown'), 'accessAid') || BD_STEP2.dropDowns.length > 0) {
                    BD_MASTER.fadeIn(byOptionTable);
                    YUD.removeClass(byOptionTable, 'accessAid');
                } else if (BD_STEP2.dropDowns.length < 1) {
                    BD_MASTER.fadeOut(byOptionTable);
                    YUD.addClass(byOptionTable, 'accessAid');
                }
                BD_MASTER.fadeOut(byOptionTableBody);
                PNLItems = YUD.getElementsByClassName("PNLRelated", '', byItemTable);
                invItems = YUD.getElementsByClassName("invRelated", '', byItemTable);
            } else {
                BD_MASTER.fadeIn(byOptionTable);
                YUD.removeClass(byOptionTable, 'accessAid');
                BD_MASTER.fadeIn(byOptionTableBody);
                BD_MASTER.fadeIn(byItemTable);
                PNLItems = YUD.getElementsByClassName("PNLRelated", '', byOptionTable);
                invItems = YUD.getElementsByClassName("invRelated", '', byOptionTable);
            }
            if (BD_STEP2.inventoryChecked) {
                BD_MASTER.fadeIn(invItems);
                BD_MASTER.fadeIn(soldOutOption);
                if (enablePreOrder.checked) {
                    BD_MASTER.fadeOut(soldOutURL);
                } else {
                    BD_MASTER.fadeIn(soldOutURL);
                }
            } else {
                BD_MASTER.fadeOut(soldOutURL);
                BD_MASTER.fadeOut(soldOutOption);
                BD_MASTER.fadeOut(invItems);
            }
            if (BD_STEP2.PNLChecked) {
                BD_MASTER.fadeIn(PNLItems);
            } else {
                BD_MASTER.fadeOut(PNLItems);
            }
            if (!BD_STEP2.byItem) {
                BD_MASTER.fadeOut(byItemTableBody);
            }
        }
    }
};
PAYPAL.Merchant.ButtonDesigner.StepThree = {
    init: function() {
        var stepThree = document.getElementById("stepThree");
        if (!stepThree) return;
        var noSpecialInstructions = document.getElementById('noSpecialInstructions');
        YUE.addListener(noSpecialInstructions, 'click', this.hide);
        var addSpecialInstructions = document.getElementById('addSpecialInstructions');
        if (addSpecialInstructions) {
            YUE.addListener(addSpecialInstructions, 'click', this.show);
        }
        var cancellationCheckbox = document.getElementById('cancellationCheckbox');
        var cancellationRedirectURL = document.getElementById('cancellationRedirectURL');
        YUE.addListener(cancellationCheckbox, 'change', this.toggleTextfield, cancellationRedirectURL, false);
        var successfulCheckbox = document.getElementById('successfulCheckbox');
        var successfulRedirectURL = document.getElementById('successfulRedirectURL');
        YUE.addListener(successfulCheckbox, 'change', this.toggleTextfield, successfulRedirectURL, false);
        var variablesTextarea = document.getElementById('variablesTextarea');
        var addVariables = document.getElementById("addVariables");
        YUE.addListener(variablesTextarea, 'keyup', this.checkCheckbox, addVariables, false);
        onItemDetailsChange.subscribe(this.conditionalHides);
    },
    hide: function() {
        var messageBoxContainer = document.getElementById('messageBoxContainer');
        wHideShow.hide(messageBoxContainer);
    },
    show: function() {
        var messageBoxContainer = document.getElementById('messageBoxContainer');
        wHideShow.show(messageBoxContainer);
    },
    toggleTextfield: function(e, ElementId) {
        var elTarget = YUE.getTarget(e);
        ElementId.disabled = (elTarget.checked) ? false : true;
    },
    checkCheckbox: function(e, ElementId) {
        var elTarget = YUE.getTarget(e);
        ElementId.checked = (elTarget.value != '') ? true : false;
    },
    conditionalHides: function(type, args) {
        if (args[0].button_type) {
            var changeOrderQuantitiesContainer = document.getElementById('changeOrderQuantitiesContainer');
            var specialInstructionsContainer = document.getElementById('specialInstructionsContainer');
            var shippingAddressContainer = document.getElementById('shippingAddressContainer');
            var cancellationRedirectURLContainer = document.getElementById('cancellationRedirectURLContainer');
            var successfulRedirectURLContainer = document.getElementById('successfulRedirectURLContainer');
            var addVariablesContainer = document.getElementById('addVariablesContainer');
            if (args[0].button_type == 'view_cart' || args[0].button_type == 'unsubscribe') {
                wHideShow.hide(changeOrderQuantitiesContainer);
                wHideShow.hide(specialInstructionsContainer);
                wHideShow.hide(shippingAddressContainer);
                wHideShow.hide(cancellationRedirectURLContainer);
                wHideShow.hide(successfulRedirectURLContainer);
                wHideShow.hide(addVariablesContainer);
                BD_STEP3.setInstructionsValue('0');
            }
            if (args[0].button_type == 'products' || args[0].button_type == 'donations' || args[0].button_type == 'services') {
                if (args[0].button_type == 'donations' || args[0].sub_button_type == 'add_to_cart') {
                    wHideShow.hide(changeOrderQuantitiesContainer);
                } else {
                    wHideShow.show(changeOrderQuantitiesContainer);
                }
                wHideShow.show(specialInstructionsContainer);
                wHideShow.show(shippingAddressContainer);
                wHideShow.show(cancellationRedirectURLContainer);
                wHideShow.show(successfulRedirectURLContainer);
                wHideShow.show(addVariablesContainer);
                BD_STEP3.setInstructionsValue('0');
            }
            if (args[0].button_type == 'subscriptions') {
                wHideShow.hide(changeOrderQuantitiesContainer);
                wHideShow.hide(specialInstructionsContainer);
                wHideShow.show(shippingAddressContainer);
                wHideShow.show(cancellationRedirectURLContainer);
                wHideShow.show(successfulRedirectURLContainer);
                wHideShow.show(addVariablesContainer);
                BD_STEP3.setInstructionsValue('1');
            }
            if (args[0].button_type == 'gift_certs') {
                wHideShow.hide(changeOrderQuantitiesContainer);
                wHideShow.hide(specialInstructionsContainer);
                wHideShow.hide(shippingAddressContainer);
                wHideShow.hide(cancellationRedirectURLContainer);
                wHideShow.hide(successfulRedirectURLContainer);
                wHideShow.show(addVariablesContainer);
                BD_STEP3.setInstructionsValue('1');
            }
        }
    },
    setInstructionsValue: function(val) {
        var addSpecialInstructions = document.getElementById('addSpecialInstructions');
        if (addSpecialInstructions) {
            addSpecialInstructions.value = val;
        }
    }
};
BD_STEP2 = PAYPAL.Merchant.ButtonDesigner.StepTwo;
BD_STEP3 = PAYPAL.Merchant.ButtonDesigner.StepThree;
BD_STEP2.init();
BD_STEP3.init();