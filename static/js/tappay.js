// TapPay 設定
TPDirect.setupSDK(123980, 'app_GggIOy1IUM9ZmklbfhC5hrYgDl1AzwUU6we1N2KIEVFKprlO9TCKCJAIDpsE', 'sandbox');

TPDirect.card.setup({
    fields: {
        number: {
            // css selector
            element: '#card-number',
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            // DOM object
            element: document.getElementById('card-expiration-date'),
            placeholder: 'MM / YY'
        },
        ccv: {
            element: '#card-cvc',
            placeholder: 'CVV'
        }
    },
    styles: {
        'input': {
            'color': '#666666'
        },
        // Styling ccv field
        'input.ccv': {
            'font-size': '16px'
        },
        // Styling expiration-date field
        'input.expiration-date': {
            'font-size': '16px'
        },
        // Styling card-number field
        'input.card-number': {
            'font-size': '16px'
        },
        // style valid state
        '.valid': {
            'color': 'green'
        },
        // style invalid state
        '.invalid': {
            'color': 'red'
        }
    }
})


TPDirect.card.onUpdate(function (update) {
    // update.canGetPrime === true
    // --> you can call TPDirect.card.getPrime()
    if (update.canGetPrime) {
        // Enable submit Button to get prime.
        // submitButton.removeAttribute('disabled')
    } else {
        // Disable submit Button to get prime.
        // submitButton.setAttribute('disabled', true)
    }

    // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unionpay','unknown']
    if (update.cardType === 'visa') {
        // Handle card type visa.
    }

    // number 欄位是錯誤的
    if (update.status.number === 2) {
        setNumberFormGroupToError('.card-number-group');
    } else if (update.status.number === 0) {
        setNumberFormGroupToSuccess('.card-number-group');
    } else {
        setNumberFormGroupToNormal('.card-number-group');
    }

    if (update.status.expiry === 2) {
        setNumberFormGroupToError('.expiration-date-group');
    } else if (update.status.expiry === 0) {
        setNumberFormGroupToSuccess('.expiration-date-group');
    } else {
        setNumberFormGroupToNormal('.expiration-date-group');
    }

    // if (update.status.cvc === 2) {
    //     setNumberFormGroupToError('.cvc-group');
    // } else if (update.status.cvc === 0) {
    //     setNumberFormGroupToSuccess('.cvc-group');
    // } else {
    //     setNumberFormGroupToNormal('.cvc-group');
    // }
})

function setNumberFormGroupToError(selector) {
    const element = document.querySelector(selector);
    element.classList.add('has-error');
    element.classList.remove('has-success');
}

function setNumberFormGroupToSuccess(selector) {
    const element = document.querySelector(selector);
    element.classList.remove('has-error');
    element.classList.add('has-success');
}

function setNumberFormGroupToNormal(selector) {
    const element = document.querySelector(selector);
    element.classList.remove('has-error');
    element.classList.remove('has-success');
}

export function onSubmit(event, callback) {
    event.preventDefault();
    const getPrimeRsult = { error: true, prime: null, msg: "error" };

    // fix keyboard issue in iOS device
    forceBlurIos();

    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();
    // console.log(tappayStatus);

    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        getPrimeRsult.msg = "can not get prime";
        callback(getPrimeRsult);
        return;
    }

    // Get prime
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            getPrimeRsult.msg = "get prime error " + result.msg;
            callback(getPrimeRsult);
            return;
        }
        getPrimeRsult.error = false;
        getPrimeRsult.prime = result.card.prime;
        getPrimeRsult.msg = result.msg
        callback(getPrimeRsult);
    });
}

function forceBlurIos() {
    if (!isIos()) {
        return
    }
    var input = document.createElement('input')
    input.setAttribute('type', 'text')
    // Insert to active element to ensure scroll lands somewhere relevant
    document.activeElement.prepend(input)
    input.focus()
    input.parentNode.removeChild(input)
}

function isIos() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}