const checkInputs = () => {
    const inputWrappers = document.querySelectorAll('.input-controlled'),
        inputs = document.querySelectorAll('.input');

    inputs.forEach((input, index) => {
        input.addEventListener('blur', (e) => {
            if (e.target.value.length > 0) {
                if (e.target.type !== 'email') {
                    inputWrappers[index].classList.add('confirm');
                    inputWrappers[index].classList.remove('error');
                }
                else {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailPattern.test(e.target.value)) {
                        inputWrappers[index].classList.add('confirm');
                        inputWrappers[index].classList.remove('error');
                    }
                    else {
                        if (inputWrappers[index].classList.add('error')) inputWrappers[index].classList.add('error');
                        inputWrappers[index].classList.remove('confirm');
                    }
                }
            }
            else {
                inputWrappers[index].classList.add('error');
                inputWrappers[index].classList.remove('confirm');
            }


        })
    });
}
const checkCardNameInput = () => {
    const inputWrappers = document.querySelectorAll('.input-controlled-name'),
        inputs = document.querySelectorAll('.input-lastname');

    inputs.forEach((input, index) => {
        input.addEventListener('blur', (e) => {
            if (e.target.value.length > 0) {
                if (e.target.type !== 'email') {
                    inputWrappers[index].classList.add('confirm');
                    inputWrappers[index].classList.remove('error');
                }
                else {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailPattern.test(e.target.value)) {
                        inputWrappers[index].classList.add('confirm');
                        inputWrappers[index].classList.remove('error');
                    }
                    else {
                        if (inputWrappers[index].classList.add('error')) inputWrappers[index].classList.add('error');
                        inputWrappers[index].classList.remove('confirm');
                    }
                }
            }
            else {
                inputWrappers[index].classList.add('error');
                inputWrappers[index].classList.remove('confirm');
            }


        })
    });
}
const showTip = () => {
    const button = document.querySelector('.cvv-tip'),
        popup = document.querySelector('.cvv-tip__popup');
    button.addEventListener('click', () => {
        popup.classList.add('active');
    })
    // remove active class on click outside 
    document.addEventListener('click', (e) => {
        if (e.target !== button) {
            popup.classList.remove('active');
        }
    })
}

const handleCVV = () => {
    let cvvInput = document.querySelector('.input-cvv-code'),
        wrapper = document.querySelector('.input-cvv');

    cvvInput.addEventListener('input', function (e) {
        let input = e.target.value;
        let sanitizedInput = input.replace(/[^0-9]/g, '');
        cvvInput.value = input.replace(/[^0-9]/g, '');;
    });
    cvvInput.addEventListener('blur', (e) => {
        if (e.target.value.length === 3) {
            wrapper.classList.add('confirm');
            wrapper.classList.remove('error');
        } else {
            wrapper.classList.remove('confirm');
            wrapper.classList.add('error');
        }
    })

}

const handleExpirationDate = () => {
    let expiryInput = document.querySelector('.input-expiration'),
        wrapper = document.querySelector('.input-date');

    expiryInput.addEventListener('input', function (e) {
        let input = e.target.value;
        let sanitizedInput = input.replace(/[^0-9]/g, '');

        if (sanitizedInput.length > 2) {
           
            let formattedInput = sanitizedInput.slice(0, 2) + '/' + sanitizedInput.slice(2);
            expiryInput.value = formattedInput;
        } else {
            expiryInput.value = sanitizedInput;
        }
    });
    expiryInput.addEventListener('blur', (e) => {
        if (e.target.value.slice(0, 2) > 12 || e.target.value.slice(-2) < 23) {
            wrapper.classList.add('error');
            wrapper.classList.remove('confirm');
        } else {
            wrapper.classList.remove('error');
            wrapper.classList.add('confirm');
        }
    })
}


const checkCardProvider = () => {
    const wrapper = document.querySelector('.input-number-container'),
        cardNumber = document.querySelector('.input-number'),
        cardImg = document.querySelector('.card__preview'),
        cardPlaceholder = document.querySelector('.card__view-ico'),
        patterns = {
            visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
            mc: /^5[1-5][0-9]{14}$/,
            // amex: /^3[47][0-9]{13}$/,
            // discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
            // jcb: /^(?:2131|1800|35\d{3})\d{11}$/,
            // diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
            // unionpay: /^(62[0-9]{14,17})$/,
            // cartebancaire: /^4[0-9]{11}(?:[0-9]{2,3})?$/,
        };
    cardImg.addEventListener('input', (e) => {
        //remove symbol if it is no a number 
        if (!e.key.match(/[0-9]/)) {
            input.replace(/[^0-9]/g, '')
        }
    })

    
    cardNumber.addEventListener('blur', (e) => {
        for (let system in patterns) {
            if (patterns[system].test(e.target.value.trim())) {
                wrapper.classList.add('confirm');
                wrapper.classList.remove('error');
                system.toUpperCase(); // return payment name
                //cardImg.classList.add('active');
                // cardImg.src = `/css/booking1/img/cards/${system}.svg`;
                //cardPlaceholder.classList.add('inactive');
                wrapper.classList.remove('error');
                return
            }
            else {
                cardPlaceholder.classList.remove('inactive');
                cardImg.classList.remove('active');
                wrapper.classList.add('error');
                wrapper.classList.remove('confirm');
            }
        }
    })
}
const handlePhone = () => {
    const input = document.querySelector('.input-transparent'),
        select = document.querySelector('.phone-countries'),
        wrapper = document.querySelector('.phone-inputs-wrapper'),
        flag = document.querySelector('.flag'),
        container = document.querySelector('.phone-wrapper'),
        label = container.querySelector('.input__label'),
        error = container.querySelector('.input__error');

    const addCountryCode = (countryCode) => {
        input.value = '+' + countryCode;
    }
    select.addEventListener('change', function () {
        let selectedOption = select.options[select.selectedIndex];
        let selectedValue = selectedOption.value;
        let selectedText = selectedOption.text;
        let selectedInfo = selectedOption.dataset.call;
        let selectedIndex = select.selectedIndex;
        let selectedOptionNumber = selectedIndex + 1;

        flag.style.backgroundPosition = `0 -${selectedIndex * 25}px`;
        addCountryCode(selectedInfo);

    });
    input.addEventListener('focus', () => {
        if (wrapper.classList.contains('error')) {
            wrapper.style.border = '1px solid #cc0000';
        }
        else if (wrapper.classList.contains('confirm')) {
            wrapper.style.border = '1px solid #008009';
        }
        else {
            wrapper.style.border = '1px solid #0071c2';
        }
    })
    input.addEventListener('blur', (e) => {
        wrapper.style.border = '';
        if (e.target.value.length > 7) {
            wrapper.classList.add('confirm');
            wrapper.classList.remove('error');
            label.style.display = 'block';
            error.style.display = 'none';
        }
        else {
            wrapper.classList.remove('confirm');
            wrapper.classList.add('error');
            label.style.display = 'none';
            error.style.display = 'block';
        }

    })
    input.addEventListener('input', function (e) {
        let inputValue = input.value;
        let numericValue = parseFloat(inputValue);
        numericValue = '+' + numericValue

        if (isNaN(numericValue) && numericValue !== '+') {
            input.value = '';
        } else {
            input.value = numericValue;
        }
    });

}
const handlePhoneMobile = () => {
    let select = document.querySelector('.phone-countries'),
        wrapper = document.querySelector('.phone-inputs-wrapper'),
        container = document.querySelector('.phone-wrapper'),
        label = container.querySelector('.input__label'),
        input = document.querySelector('.input-transparent'),
        error = container.querySelector('.input__error');
    input.value = '';

    select.addEventListener('change', function () {
        let selectedOption = select.options[select.selectedIndex];
        let selectedValue = selectedOption.value;
        let selectedInfo = selectedOption.dataset.call;
        let textBlock = document.querySelector('.flag-text');
        textBlock.textContent = `${selectedValue} +${selectedInfo}`;
    }
    )
    input.addEventListener('blur', (e) => {
        if (e.target.value.length > 7) {
            wrapper.classList.add('confirm');
            wrapper.classList.remove('error');
            label.style.display = 'block';
            error.style.display = 'none';
        }
        else {
            wrapper.classList.remove('confirm');
            wrapper.classList.add('error');
            label.style.display = 'none';
            error.style.display = 'block';
        }

    })
}
const buttonDisabledStep_1 = () => {
    const button_step_1 = document.querySelector('.steps__next-1'),
        inputs_step_1 = document.querySelectorAll('.i-1'),
        inputs_containers_step_1 = document.querySelectorAll('.i-w-1');

    let setBtn = function (value) {
        button_step_1.disabled = value;
    }

    let checker_func = function() {
        for (let i = 0; i < inputs_step_1.length; i++) {
            if (!inputs_containers_step_1[i].classList.contains('confirm')) {
               setBtn(true)
                break;
            }
        }
       setBtn(false);
    }

    inputs_step_1.forEach(el => {
        el.addEventListener('blur', checker_func);
    });
}
const buttonDisabledStep_2 = () => {
    const button = document.querySelector('.steps__next-2'),
        inputs = document.querySelectorAll('.i-2'),
        containers = document.querySelectorAll('.i-w-2');

    let disabledInput = true;

    inputs.forEach(el => {
        el.addEventListener('blur', () => {
            for (let i = 0; i < containers.length; i++) {
                if (!containers[i].classList.contains('confirm')) {
                    disabledInput = true;
                    break;
                }
                else {
                    disabledInput = false;
                }
            }
            setBtn()
        })
    })
    function setBtn() {
        button.disabled = disabledInput;
    }
}
if (document.querySelector('.phone-countries')) {
    checkInputs()
}
if (document.querySelector('.input-expiration')) {
    handleExpirationDate()
}
if (document.querySelector('.card__preview')) {
    checkCardProvider()
}
if (window.innerWidth < 1024 && document.querySelector('.cvv-tip')) {
    showTip()
}
if (document.querySelector('.input-cvv-code')) {
    handleCVV()
}
if (window.innerWidth > 1024 && document.querySelector('.phone-inputs-wrapper')) {
    handlePhone()
}
if (window.innerWidth < 1024 && document.querySelector('.phone-inputs-wrapper')) {
    handlePhoneMobile()
}
if (document.querySelector('.input-controlled-name')) {
    checkCardNameInput()
}
//check if inputs are empty

if (document.querySelector('.form')) {
    buttonDisabledStep_1()
}

if (document.querySelector('.form-cards')) {
    buttonDisabledStep_2()
}