
var {basepath} = $('#data').data();

var lastLanguages = []
var preview_language = "en"
var formBuilder;
var jsonEditor;
var translations = {
    language: "en",
    i18n: {}
}

// Elements
var $multi_languages_selector
var $default_language_selector
var $modal_form_languages
var $modal_form
var $preview_btn

var possibleLanguages;

function saveTranslations() {
    translations.i18n = jsonEditor.get();
    console.log("Translations saved")
}

function setSelectorValue(selector, value) {
    selector.val(value)
    selector.selectpicker("refresh");
}

function getLanguageName(code) {
    const { name } = possibleLanguages.find(el => el.code === code)
    return name
}

function getExistingLanguageCodes() {
    return Object.keys(translations.i18n)
}
function getExistingVisualComponents() {
    return formBuilder.schema.components
}

function updateTranslations() {
    // check which language codes have been added
    var currentLanguages = $multi_languages_selector.val()
    let addedCodes = currentLanguages.filter(x => !lastLanguages.includes(x));
    addedCodes.forEach(code => {
        translations.i18n[code] = {}
        getExistingVisualComponents().forEach(component => {
            translations.i18n[code][component.label] = "empty"
        })
    });
    let deletedCodes = lastLanguages.filter(x => !currentLanguages.includes(x));
    deletedCodes.forEach(code => {
        delete translations.i18n[code]
    });

    console.log("Added / deleted:", addedCodes.length, deletedCodes.length)
    // let remainingCodes = currentLanguages.filter(x => lastLanguages.includes(x));

    // update options for default language selector
    $default_language_selector.empty()
    getExistingLanguageCodes().forEach(code => {
        $default_language_selector.append(`<option value="${code}">${getLanguageName(code)}</option>`)
    })
    $default_language_selector.selectpicker("refresh");

    // set lastLanguages and json editor data
    lastLanguages = currentLanguages
    jsonEditor.set(translations.i18n)

}

function updateModalForm() {
    $modal_form_languages.empty()
    var existingLanguages = getExistingLanguageCodes()
    if (existingLanguages.length > 1) {
        existingLanguages.map(code => {
            // add button for the form
            console.log("Adding button for", code)
            $modal_form_languages.append(`<button type="button" class="btn btn-primary" onclick="setPreviewLanguage('${code}')">${getLanguageName(code)}</button>`)
        });
    }

    $modal_form.empty();
    var copiedObject = jQuery.extend({}, translations)
    copiedObject.language = preview_language
    Formio.createForm(document.getElementById('modal-form'), formBuilder.schema, copiedObject)
};

const setPreviewLanguage = (lang) => {
    console.log("Setting preview", lang)
    preview_language = lang
    updateModalForm()
}

window.onload = function () {
    // Selectors
    $multi_languages_selector = $('#languages-multi')
    $default_language_selector = $('#default-language-selector')
    $preview_btn = $('#preview-button');

    // PREVIEW MODAL
    var modalBigContent = new tingle.modal();
    modalBigContent.setContent(`
    <div>
      <div class="btn-group w-100" id="modal-form-languages"></div>
      <div id="modal-form"><div>
    </div>`);

    $preview_btn.on('click', function () {
        updateModalForm()
        modalBigContent.open();
    });
    $modal_form_languages = $('#modal-form-languages')
    $modal_form = $('#modal-form')

    // Form builder
    Formio.builder(document.getElementById('form-builder'), {}, {
        builder: {
            premium: false
        },
    }).then((builder) => {
        formBuilder = builder

        builder.on('saveComponent', function (info, visualComp, schema, key, index) {
            var component = schema.components[index]
            console.log("added", schema.components[index])
            getExistingLanguageCodes().forEach(code => {
                translations.i18n[code][component.label] = "empty"
            })
            updateTranslations()

            $preview_btn.removeAttr("disabled")
        });

        builder.on('removeComponent', function (component, schema, path, index) {
            console.log("removed", component)
            getExistingLanguageCodes().forEach(code => {
                delete translations.i18n[code][component.label]
            })
            updateTranslations()

        });

        builder.on('updateComponent', function (component) {
            // console.log("updated", component)
            getExistingLanguageCodes().forEach(code => {
                delete translations.i18n[code][component.label]
            })
        });

        updateTranslations()
    });

    // JSON editor
    jsonEditor = new JSONEditor(document.getElementById("jsoneditor"), {})

    // ON SAVE CLICK

    document.submitform.onsubmit = (e) => {
        e.preventDefault()
        var name_input = $('#survey-name');
        var data = {
            name: name_input.val(),
            schema: formBuilder.schema,
            translations
        }
        console.log(data)

        axios.post(`${basepath}/api/v1/assets/`, data).then(function (response) {
            console.log("RESPONSE", response.data);

            if(window.parent) {
                window.parent.postMessage({
                    'code': 'asset_created',
                    'message': response.data
                }, "*");
            }       
        })
        // https://stackoverflow.com/questions/2161388/calling-a-parent-window-function-from-an-iframe
        
    };


$.getJSON(`${basepath}/static/languages.json`, function (json) {
    possibleLanguages = json
    // LANGUAGE SELECTOR
    possibleLanguages.forEach(element => {
        $multi_languages_selector.append(`<option value="${element.code}">${element.name}</option>`)
    })
    setSelectorValue($multi_languages_selector, ["en"])
    $multi_languages_selector.on("change", function () {
        updateTranslations()
    });
});

};

