import { FormEditor } from '@bpmn-io/form-js-editor';
import { useEffect } from 'react';

function Editor({ schema }) {

    useEffect(() => {

        const awaitImport = async (obj) => {
            await obj.importSchema(schema);
        }

        const formEditor = new FormEditor({
            container: document.querySelector('#form-editor')
        });
        awaitImport(formEditor)
        console.info("Editor loaded with", schema)

        // const schema = formEditor.saveSchema(schema);
        // console.log('exported schema', schema);
    }, [schema])

    return (
        <div style="height: 100vh;" id="form-editor" />
    );
}

export default Editor;
