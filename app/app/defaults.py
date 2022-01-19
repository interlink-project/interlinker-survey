formio = {
    "name": "Example name",
    "components": [
          {
              "key": "age",
              "label": "age-text",
              "type": "textfield",
              "validate": {
                  "required": True
              }
          },
        {
            "key": "submit",
              "label": "submit-text",
              "type": "button"
          },
    ],
    "translations": {
        "language": "defaultLanguage",
        "i18n": {
            "en": {
                "submit-text": "Submit",
                "age-text": "Age"
            },
            "es": {
                "submit-text": "Enviar",
                "age-text": "Edad"
            }
        },
    },
    "type": "default"
}
