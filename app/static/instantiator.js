const {
  CssBaseline,
  ThemeProvider,
  Typography,
  Container,
  Box,
  Button,
  Input,
  LinearProgress,
  IconButton,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogContent,
  Step,
  Stepper,
  StepLabel
} = MaterialUI;


function App() {
  const [formBuilder, setFormBuilder] = React.useState(null)
  const [jsonEditor, setJsonEditor] = React.useState(null)

  const [formName, setFormName] = React.useState("");

  const [defaultLanguage, setDefaultLanguage] = React.useState('en');
  const [translations, setTranslations] = React.useState({
    [defaultLanguage]: {
      Submit: "empty"
    }
  })
  const selectedLanguages = Object.keys(translations)


  const getLanguageCodes = () => {
    return Object.keys(translations)
  }

  const onMultiselectChange = (val) => {
    const createKeysForEveryComp = () => {
      const obj = {}
      formBuilder.schema.components.forEach(comp => {
        obj[comp.label] = "empty"
      })
      return obj
    }
    const newTranslations = jQuery.extend({}, translations)

    const addedLanguage = val.filter(x => !selectedLanguages.includes(x))
    if (addedLanguage) {
      newTranslations[addedLanguage] = createKeysForEveryComp()
      setTranslations(newTranslations)
    }

    const removedLanguage = selectedLanguages.filter(x => !val.includes(x));
    if (removedLanguage) {
      delete newTranslations[removedLanguage]
      setTranslations(newTranslations)
    }
  }

  React.useEffect(() => {
    var schema = {}
    if (datafrombackend) {
      console.log("DATA FROM BACKEND")
      schema = datafrombackend.schema
      setDefaultLanguage(datafrombackend.translations.language)
      setTranslations(datafrombackend.translations.i18n)
      setFormName(datafrombackend.name)
    }

    Formio.builder(document.getElementById('form-builder'), schema, {
      builder: {
        premium: false
      },
    }).then((builder) => {

      builder.on('saveComponent', function (info, visualComp, schema, key, index) {
        var component = schema.components[index]
        console.log("added", schema.components[index])
        const newTranslations = jQuery.extend({}, translations)
        getLanguageCodes().forEach(code => {
          // si no hay otro componente con el mismo label se pone a empty
          if (builder.schema.components.filter(x => x.label === component.label).length < 2) {
            newTranslations[code][component.label] = "empty"
          }
        })
        setTranslations(newTranslations)
      });

      builder.on('removeComponent', function (component, schema, path, index) {
        console.log("removed", component)
        const newTranslations = jQuery.extend({}, translations)
        getLanguageCodes().forEach(code => {
          // si no hay otro componente con el mismo label se elimina el key
          if (!builder.schema.components.filter(x => x.label === component.label).length < 2) {
            delete newTranslations[code][component.label]
          }
        })
        setTranslations(newTranslations)
      });

      builder.on('updateComponent', function (component) {
        const newTranslations = jQuery.extend({}, translations)
        getLanguageCodes().forEach(code => {
          // si no hay otro componente con el mismo label se elimina el key
          console.log(component, builder.schema.components)
          if (!builder.schema.components.filter(x => x.label === component.label).length < 2) {
            delete newTranslations[code][component.label]
          }
        })
        setTranslations(newTranslations)
      });
      setFormBuilder(builder)

      var jsEd = new JSONEditor(document.getElementById("jsoneditor"), {})
      setJsonEditor(jsEd)

    });
  }, [])

  React.useEffect(() => {
    if (formBuilder) {
      if (jsonEditor) {
        jsonEditor.set(translations)
      }
    }

  }, [formBuilder, jsonEditor, translations])


  const handleDefaultLanguageChange = (event) => {
    setDefaultLanguage(event.target.value);
  };

  const submit = () => {
    const data = {
      schema: formBuilder.schema,
      translations: {
        language: defaultLanguage,
        i18n: translations,
      },
      name: formName
    }
    service.create(data).then(res => console.log(res.data))
  }

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Container maxWidth={false}>
      {/* <Stepper activeStep={1} alternativeLabel>
        {["1", "2", "3"].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper> */}
      
      <div className="row">
        <div className="col-6">
          <div id='form-builder'></div>
        </div>
        <div className="col-3">
          <MultipleSelectChip selectedValue={selectedLanguages} onChange={onMultiselectChange} options={languagesJson.map(el => ({ key: el.code, value: el.code, label: el.name }))} getLabel={getNameOfLanguageByCode} />
          <InputLabel sx={{ mt: 1 }}>Default language</InputLabel>
          <Select
            id="select-standard"
            value={defaultLanguage}
            onChange={handleDefaultLanguageChange}
            label="Default language"
            fullWidth

          >
            {selectedLanguages.map(el => <MenuItem key={`default-language-${el}-option`} value={el}>{getNameOfLanguageByCode(el)}</MenuItem>)}
          </Select>
          <Box sx={{ mt: 2 }}>
            <div id="jsoneditor" style={{ width: "100%" }}></div>
          </Box>
          <Button sx={{ mt: 2 }} variant="contained" fullWidth onClick={() => setTranslations(jsonEditor.get())}>Save translations</Button>
        </div>
        <div className="col-3" style={{ display: "block" }}>
          <InputLabel>Name</InputLabel>

          <TextField error={formName === ""} helperText={formName === "" && "Required"} variant="outlined" fullWidth onChange={(e) => setFormName(e.target.value)} />

          <Button variant="contained" fullWidth sx={{ mt: 2 }} color="success" onClick={handleClickOpen}>Preview</Button>
          <Button variant="contained" fullWidth sx={{ mt: 1 }} onClick={() => submit()}>Save</Button>
        </div>
      </div>
      {formBuilder && <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth="md"
      >
        <DialogContent sx={{ p: 3 }}>
          <FormioForm
            schema={formBuilder.schema}
            translations={{
              language: defaultLanguage,
              i18n: translations,
            }}
          />
        </DialogContent>
      </Dialog>}

    </Container>
  );
}

ReactDOM.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <App />
  </ThemeProvider>,
  document.querySelector('#root'),
);