form_js = {
    "components": [
          {
              "key": "creditor",
              "label": "Creditor",
              "type": "textfield",
              "validate": {
                  "required": True
              }
          },
        {
            "key": "amount",
              "label": "Amount",
              "type": "number",
              "validate": {
                  "required": True
              }
          },
        {
            "description": "An invoice number in the format: C-123.",
              "key": "invoiceNumber",
              "label": "Invoice Number",
              "type": "textfield",
              "validate": {
                  "pattern": "^C-[0-9]+$"
              }
          },
        {
            "key": "approved",
              "label": "Approved",
              "type": "checkbox"
          },
        {
            "key": "approvedBy",
              "label": "Approved By",
              "type": "textfield"
          },
        {
            "key": "submit",
              "label": "Submit",
              "type": "button"
          },
        {
            "action": "reset",
              "key": "reset",
              "label": "Reset",
              "type": "button"
          }
    ],
    "type": "default"
}

jsonforms = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "minLength": 1
        },
        "description": {
            "title": "Long Description",
            "type": "string"
        },
        "done": {
            "type": "boolean"
        },
        "due_date": {
            "type": "string",
            "format": "date"
        },
        "rating": {
            "type": "integer",
            "maximum": 5
        },
        "recurrence": {
            "type": "string",
            "enum": ["Never", "Daily", "Weekly", "Monthly"]
        },
        "recurrence_interval": {
            "type": "integer"
        }
    },
    "required": ["name", "due_date"]
}
