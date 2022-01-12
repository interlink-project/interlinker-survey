import { FormEditor } from '@bpmn-io/form-js-editor';
import { useEffect, useState } from 'react';
import axios from 'axios';
import $ from 'jquery'
import { Fab } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

function Editor({ schema }) {

    const [formEditor, setFormEditor] = useState(null)


    useEffect(() => {
        $("#form-editor").empty()
        var observer = new MutationObserver(function (mutationRecords) {
            console.log("change detected", mutationRecords);
        });
        observer.observe(document.getElementById("form-editor"), { childList: true });

        const awaitImport = async (obj) => {
            await obj.importSchema(schema);
        }
        const fe = new FormEditor({
            container: document.querySelector('#form-editor')
        });
        awaitImport(fe)
        setFormEditor(fe)
        console.info("Editor loaded with", schema)



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

    return (
        <>
            <div style={{ height: "93vh" }} id="form-editor" />
            <Fab color="primary" aria-label="add" sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
            }}>
                <SaveIcon />
            </Fab>
            <Fab color="primary" aria-label="add" sx={{
                position: 'absolute',
                bottom: 16,
                right: 80,
            }} onClick={() => saveSchema()}>
                <SaveIcon />
            </Fab>
        </>

    );
}

export default Editor;
