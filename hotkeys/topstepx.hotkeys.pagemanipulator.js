function hotkeysVersion()
{
    return "4.4.0";
}

var debugHotkeys = false;

async function createAddWidget(addNews, addCalendar)
{
    cardDiv = null;
    for(i=0; i < 10 || cardDiv == null; ++i)
    {
        await sleep(250);
        cardDiv = document.querySelector('div[class^=ordercard_order]');
    }

    if(cardDiv == null) 
    {
        console.error("Cannot find card div");
        return;
    }
    console.log("found cardDiv for appending");
    var r = Math.floor(Math.random() * (9999 - 0 + 1) + 0);
    fetch("https://feed.financialjuice.com/widgets/widgets.js?r=" + r)
        .then((fj_res) => fj_res.text())
        .then((fj_js) => {
            eval(fj_js);

            if(addNews)
            {
                newsDiv = document.createElement("div");
                newsDiv.id = "financialjuice-news-widget-container";
                cardDiv.appendChild(newsDiv);
                var options = {};
                options.container = "financialjuice-news-widget-container";
                options.mode = "Dark";
                options.width= "300px";
                options.height= "300px";
                options.backColor= "1e222d";
                options.fontColor= "b2b5be";
                options.widgetType= "NEWS";
                new window.FJWidgets.createWidget(options);
            }
            
            if(addCalendar)
            {
                calendarDiv = document.createElement("div");
                calendarDiv.id = "financialjuice-eco-widget-container";
                cardDiv.appendChild(calendarDiv);
                var options = {};
                options.container = "financialjuice-eco-widget-container";
                options.mode = "standard";
                options.width= "300px";
                options.height= "600px";
                options.backColor= "1e222d";
                options.fontColor= "b2b5be";
                options.widgetType= "ECOCAL";
                new window.FJWidgets.createWidget(options);
            }
        });
}

async function findChart() {
    // chart component may not be available on the moment the page is loaded so try in a loop
    for(var i = 0; i < 10; ++i) {    
        console.log("Trying to find chart object");
        chartArray = Object.keys(document).filter(k => k.startsWith('tradingview'));
        if(chartArray.length > 0) {
            chartName = chartArray[0];
            chart = document[chartName];
            console.log("Found chart: " + chartName);
            return chart;
        }
        await sleep(250);
    }
    console.log("Failed to connect chart");
    return null;
}

async function setupHotkeys(accounts, addNews=true, addCalendar=true) {
    var hotkeysDict = {}
    console.log(hotkeys);
    hotkeys.forEach((m) => hotkeysDict[m["keys"].sort().join()] = m["f"])
        
    document.addEventListener('keydown', (event) => handleKeyDown(event, 'document'));
    
    var chart = await findChart();
    if(chart) {
        chart.addEventListener('keydown', (event) => handleKeyDown(event, 'chart'));
    }

    createAddWidget(addNews, addCalendar);

    function handleKeyDown(event, source) {
        if(event.repeat == true) return;
        if(debugHotkeys)
        {
            console.log(event, source);
        }
        let eventKeySet = new Set();
        if(event.shiftKey)
        {
            eventKeySet.add("shift");
        }
        if(event.altKey)
        {
            eventKeySet.add("alt");
        }
        if(event.ctrlKey)
        {
            eventKeySet.add("ctrl");
        }
        if(event.metaKey)
        {
            eventKeySet.add("meta");
        }
        eventKeySet.add(event.code.toLowerCase());
        eventKey = Array.from(eventKeySet).sort().join();
       
        if(eventKey in hotkeysDict)
        {
            event.preventDefault();
            console.log("Firing hotkey: " + eventKey + " from " + source);
            hotkeysDict[eventKey]();
        }
    }
}


function toggleDebug()
{
    debugHotkeys = !debugHotkeys;
    console.log("hotkey debugging set to " + debugHotkeys);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buttonClickCommon(buttonTextToSearch)
{
    var button = [...document.querySelector('[id^=orderCardTab]').querySelectorAll('button')].filter(button => button.innerHTML.toLowerCase().startsWith(buttonTextToSearch))[0];
    if(button == null) { console.log('Unable to locate button with text: ' + buttonTextToSearch); return; }
    button.click();
}

function setQuantityCommon(quantity)
{
    var quantity_input = document.querySelector('div[class^=ordercard_order] input[type=number]')
    if(quantity_input == null) { console.log('Unable to locate Quantity Edit Box'); return; }
    quantity_input.value = quantity;
    quantity_input[Object.keys(quantity_input).filter((k) => k.startsWith('__reactProps'))[0]].onChange({'target' : { 'value' : quantity}});
}

function centerDom()
{
    var centerDomSVG = document.querySelectorAll('svg[aria-label^="Center on Last Price"')[0]
    if(centerDomSVG == null) { console.log('Unable to locate Center DOM on Last Price button'); return; }
    centerDomSVG[Object.keys(centerDomSVG).filter((k) => k.startsWith('__reactProps'))[0]].onClick();
}

async function buttonClickBuySellQuantityCommon(buttonTextToSearch, quantity)
{
    setQuantity(quantity);
    await sleep(10);
    buttonClickCommon(buttonTextToSearch);
}

function buttonClickBuySellMarketQuantity(buySell, quantity)
{
    var buttonTextToSearch = buySell ? 'buy' : 'sell';
    console.log(buttonTextToSearch + ' Quantity ' + quantity + ' hotkey pressed');  
    buttonClickBuySellQuantityCommon(buttonTextToSearch, quantity);
}

function buttonClickBuySellJoinQuantity(buySell, quantity)
{
    var buttonTextToSearch = buySell ? 'join bid' : 'join ask';
    console.log(buttonTextToSearch + ' Quantity ' + quantity + ' hotkey pressed');
    buttonClickBuySellQuantityCommon(buttonTextToSearch, quantity);
}

function buttonClickBuySellMarket(buySell)
{
    var buttonTextToSearch = buySell ? 'buy' : 'sell';
    console.log(buttonTextToSearch + ' hotkey pressed');
    buttonClickCommon(buttonTextToSearch);
}

function buttonClickBuySellJoin(buySell)
{
    var buttonTextToSearch = buySell ? 'join bid' : 'join ask';
    console.log(buttonTextToSearch + ' hotkey pressed');
    buttonClickCommon(buttonTextToSearch);
}

function buttonClickClosePosition()
{
    console.log('Close Position hotkey pressed');
    buttonClickCommon('close position');
}

function buttonClickReversePosition()
{
    console.log('Reverse Position hotkey pressed');
    buttonClickCommon('reverse position');
}

function buttonClickCancelOrders()
{
    console.log('Cancel Orders hotkey pressed');
    buttonClickCommon('cancel orders');
}

function buttonClickFlattenAll()
{
    console.log('Flatten All hotkey pressed');
    buttonClickCommon('flatten all');
}

function buttonClickCancelAll()
{
    console.log('Cancel All hotkey pressed');
    buttonClickCommon('cancel all');
}

function buttonClickStopBreakEven()
{
    console.log('Stop Break Even hotkey pressed');
    buttonClickCommon('b/e');
}

function setQuantity(quantity)
{
    console.log('Set Quantity ' + quantity + ' hotkey pressed');
    setQuantityCommon(quantity);
}

async function setContract(contract, delayMilliseconds)
{
    var input_div = [...document.querySelectorAll('div[class^=MuiInputBase-root')].filter(d => d.innerText.toLowerCase().startsWith('contract'))[0]
    if(input_div == null)
    {
        console.log('unable to find input div for contract section');
        return;
    }

    input_div.dispatchEvent(new Event('click', { bubbles : true }));
    await sleep(delayMilliseconds);
    var list_item = [...document.querySelectorAll('li')].filter(d => d.innerText.toLowerCase().startsWith(contract.toLowerCase()))[0]
    if(list_item == null)
    {
        console.log('unable to find li element for contract ' + contract);
    }
    else
    {
        list_item.dispatchEvent(new Event('click', { bubbles: true }));
    }
    input_div.dispatchEvent(new Event('click', { bubbles : true }));
}

async function setAccount(account, delayMilliseconds = 25)
{
    var input_div = document.querySelector('div[class^=ordercard_account]').querySelector('div[role=combobox]')
    if(input_div == null)
    {
        console.log('unable to find input div for contract section');
        return;
    }
	input_div.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true}));
    await sleep(delayMilliseconds);
	var account_li = [...document.querySelectorAll('li')].filter(d => d.innerText.toLowerCase().includes(account.toLowerCase()))[0]
    if(account_li == null)
    {
        console.log('unable to find li element for account ' + account);
    }
    else
    {
        account_li.dispatchEvent(new Event('click', { bubbles: true }));
    }
    input_div.dispatchEvent(new Event('click', { bubbles : true }));
}

async function setOrderType(orderType)
{
    var cardDiv = document.querySelector('div[class^=ordercard_order]');
    
    if(cardDiv == null) 
    {
        console.error("Cannot find card div");
        return;
    }

    // Get all labels within the card div
    var labels = cardDiv.querySelectorAll('label');

    // Iterate through each label
    for (var i = 0; i < labels.length; i++) {
        // Check if the label's text content is "Order Type"
        if (labels[i].textContent.trim() === 'Order Type') {
            // Select the parent div of the label with the specific class
            var inputDiv = labels[i].closest('div.MuiFormControl-root');
            if (inputDiv) {
                // Find the combobox within this div
                var input_dropdown = inputDiv.querySelector('div[role=combobox]');
                break;  // Break the loop once we find the correct input
            }
        }
    }

    if(input_dropdown == null)
    {
        console.log('unable to find input div for order type section');
        return;
    }
	input_dropdown.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true}));
    await sleep(10);
	var orderType_li = [...document.querySelectorAll('li')].filter(d => d.innerText.toLowerCase().includes(orderType.toLowerCase()))[0]
    if(orderType_li == null)
    {
        console.log('unable to find li element for account ' + orderType);
    }
    else
    {
        orderType_li.dispatchEvent(new Event('click', { bubbles: true }));
        await sleep(3000);
        setStopPrice(20100);
    }
}

async function setStopPrice(stop_price)
{
    var cardDiv = document.querySelector('div[class^=ordercard_order]');
    
    if(cardDiv == null) 
    {
        console.error("Cannot find card div");
        return;
    }

    // Get all labels within the card div
    var labels = cardDiv.querySelectorAll('label');

    var stopPriceInput = null;
    // Iterate through each label
    for (var i = 0; i < labels.length; i++) {
	console.log(labels[i].textContent.trim());
        // Check if the label's text content is "Stop Price"
        if (labels[i].textContent.trim().includes('Stop Price')) {
            foundStopPriceLabel = true;
            // Select the parent div of the label with the specific class
            var inputDiv = labels[i].closest('div.MuiFormControl-root');
            if (inputDiv) {
                console.info(inputDiv.outerHTML);
                // Find the combobox within this div
                stopPriceInput = inputDiv.querySelector('input[type=number]');
                break;  // Break the loop once we find the correct input
            }
        }
    }

    if (!foundStopPriceLabel) {
        console.error('Unable to find Stop Price label');
        return;
    }

    if (stopPriceInput == null) {
        console.error('Unable to locate Stop Price Edit Box');
        return;
    }

    // Focus the input box
    stopPriceInput.focus();
    await sleep(30);
    
    // Set the value and trigger necessary events
    stopPriceInput.value = stop_price;
    stopPriceInput.dispatchEvent(new Event('input', { bubbles: true }));
    stopPriceInput.dispatchEvent(new Event('change', { bubbles: true }));

    await sleep(30);
	
    // Trigger Arrow Up and Arrow Down key events
    stopPriceInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
    await sleep(30);
    stopPriceInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'ArrowUp' }));
    await sleep(30);
    stopPriceInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
    await sleep(30);
    stopPriceInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'ArrowDown' }));
	
    stopPriceInput.dispatchEvent(new Event('focus', { bubbles: true }));
    stopPriceInput.dispatchEvent(new Event('blur', { bubbles: true }));
}
