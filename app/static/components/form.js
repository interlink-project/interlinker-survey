const {
    ButtonGroup,
    Button,
    Select,
    MenuItem
} = MaterialUI;

function FormioForm({ schema, translations }) {
    const [language, setLanguage] = React.useState(translations.language)

    const newTranslations = jQuery.extend({}, translations)

    React.useEffect(() => {
        var f = Formio.createForm(document.getElementById('form'), schema, newTranslations).then(function (form) {
            window.setPreviewFormLanguage = function (lang) {
                form.language = lang;
                setLanguage(lang)
            };
        });
    }, [])

    const codes = Object.keys(translations.i18n)

    const handleChange = (event) => {
        console.log("Setting", event.target.value)
        setPreviewFormLanguage(event.target.value)
    };

    return (
        <div>
            {codes.length > 1 && (
                <Select
                    value={language}
                    label="Language"
                    onChange={handleChange}
                    fullWidth
                >
                    {codes.map(code => <MenuItem key={`preview-language-${code}-button`} value={code}>{getNameOfLanguageByCode(code)}</MenuItem>
                    )}
                </Select>)}
            <div id="form">
            </div>
        </div>
    );
}