"use strict";

var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var { FormEditor } = require('@bpmn-io/form-js-editor');

const App = () => {
    const [formEditor, setFormEditor] = React.useState(null)
    const [schema] = React.useState({
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
    })
    React.useEffect(() => {
        $("#form-editor").empty()
        
        const awaitImport = async (obj) => {
            await obj.importSchema(schema);
        }
        const fe = new FormEditor({
            container: document.querySelector('#form-editor')
        });
        awaitImport(fe)
        console.info("Editor loaded with", schema)
        setFormEditor(fe)
    }, [schema])

    const saveSchema = () => {
        const newSchema = formEditor.saveSchema(schema);
        newSchema.name = newSchema.id
        delete newSchema.id
        console.log('exported schema', newSchema);
        axios.post(`/api/v1/surveys/`, newSchema)
            .then(res => {
                console.log(res)
            })
    }
    return (<div style={{height: "100vh"}}id="form-editor"></div>);
};
ReactDOM.render(
    <App />,
    document.getElementById('app')
);