


// đối tượng Validator
function Validator(options){
    // khi dùng loop vô hạn cần chú ý điểm dừng
    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector) ){
                return element.parentElement;
            }

            element = element.parentElement;

        }
    }
    // lưu lại rules
    var rulesSelector = {};

    // bước 1: lấy được form
    var formElement = document.querySelector(options.form);
    function notErrorMessage(inputElement){
        // var errorElement = getParent(inputElement, options.formGroupSelector)
        // var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        errorElement.innerText = '';
        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
    }

    function funcErrorMessage(inputElement, errorMessage){
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        errorElement.innerText = errorMessage;
        getParent(inputElement, options.formGroupSelector).classList.add('invalid');
    }

    // hàm xư lý khi lỗi
    function Validate(inputElement, rule){
        // var errorMessage = rule.test(inputElement.value)
        var errorMessage;


        // lấy ra các rules của selector
        var rules = rulesSelector[rule.selector];
        // console.log(rules)

        // lặp qua từng rule & kiểm tra
        // nếu có lỗi thì dừng việc kiểm tra
        for( var i = 0; i < rules.length; ++i){

            switch (inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            
            if(errorMessage) break;
        }



        if(errorMessage){
            funcErrorMessage(inputElement, errorMessage);
        }else{
            notErrorMessage(inputElement);
        }

        return !errorMessage;
    }
    
    if(formElement){
        // khi submit form
        // trong thực tế click form lấy đc dữ liệu 
        formElement.onsubmit = function(e){
            e.preventDefault();


            var isFormValid = true;


            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = Validate(inputElement, rule);
                if(!isValid){
                    isFormValid = false;
                }
            });

            if(isFormValid){
                if(typeof options.onSubmit === 'function'){


                    // tai sao cần disabled vì trong thực tế có trường mình disable

                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')

                    var formValues = Array.from(enableInputs).reduce((value, input) => {
                        // gán giá trị 
                        

                        switch (input.type) {
                            case 'radio':
                                value[input.name] = formElement.querySelector('input[name="'+input.name+'"]:checked').value;
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) return value;

                                if(!Array.isArray(value[input.name])){
                                    value[input.name] = [];
                                }
                                value[input.name].push(input.value);
                                break;
                            case 'file':
                                value[input.name] = input.files;
                                break;
                            default:
                                value[input.name] = input.value
                        }

                        
                        return value;
                    }, {})

                    options.onSubmit(formValues);
                }
            }


        }

        //lặp qua các rules
        
        // lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input...)
        options.rules.forEach(function(rule){

            // lưu lại rules cho mỗi input

            if(Array.isArray(rulesSelector[rule.selector])){
                rulesSelector[rule.selector].push(rule.test); 
            }else{
                rulesSelector[rule.selector] = [rule.test]
            }

            // rulesSelector[rule.selector] = rule.test;
            
            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach (function(inputElement){
                inputElement.onblur = function(){
                    // lấy được value: inputElement.value
                    // test func: rule.test
                    Validate(inputElement, rule)
                }

                inputElement.oninput = function(){
                    notErrorMessage(inputElement);
                }
            });
        })  

        // console.log(rulesSelector)
    }
}


// định nghĩa các rules
// nguyên tắc các rule
//1. khi có lỗi trả ra mess lỗi
//2. khi ko lỗi => underfined
Validator.isRequired = function(selector, message){
    return {
        selector: selector,
        //function test để kiểm tra
        test: function(value){
            return value ? undefined : message || 'Please enter value'
        }

    };
}

Validator.isEmail = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined: message|| 'is not email'
        }
    }
}

Validator.minLength = function(selector, min, message){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined: message|| `Enter min ${min} characters`
        }
    }
}


Validator.isConfirmed = function(selector, getConfirmValue, message){
    return {
        selector: selector,
        test: function(value){
            return value === getConfirmValue() ? undefined : message || 'Input value is incorrect';
        }
    }
}



