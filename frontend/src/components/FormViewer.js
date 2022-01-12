import { Form } from '@bpmn-io/form-js';
import { useEffect } from 'react';

function FormViewer({schema}) {

    useEffect(() => {
        const awaitImport = async (obj) => {
            await obj.importSchema(schema);
        }
        const form = new Form({
            container: document.querySelector('#form')
        });
        awaitImport(form)
        form.on('submit', (event) => {
            console.log(event.data, event.errors);
        });
        console.info("Viewer loaded with", schema)

    }, [schema])

    return (
        <div id="form" />
    );
}

export default FormViewer;
