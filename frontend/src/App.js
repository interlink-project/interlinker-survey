import Editor from './components/Editor';
import FormViewer from './components/FormViewer';
import $ from 'jquery'

function App() {
  let { schema, mode } = $('#my-data').data();
  console.log(schema, mode)
  if (!schema || schema === "{{schema}}") {
    mode = "edit"
  }
  if (!schema || schema === "{{schema}}") {
    schema = {
      "_id": "548843c87b344cedaa0554276888da6b",
      "components": [
        {
          "key": "creditor",
          "label": "Creditor",
          "type": "textfield",
          "validate": {
            "required": true
          }
        },
        {
          "key": "amount",
          "label": "Amount",
          "type": "number",
          "validate": {
            "required": true
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
  }
  return (
    <div className="App">
      {mode === "edit" ? <Editor schema={schema} /> : <FormViewer schema={schema} />}
    </div>
  );
}

export default App;
