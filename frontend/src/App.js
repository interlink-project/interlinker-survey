import Editor from './components/Editor';
import FormViewer from './components/FormViewer';
import $ from 'jquery'
import List from './components/List';
import ResponsiveAppBar from './components/Appbar';

function App() {
  let { data, mode } = $('#my-data').data();
  console.log(data, mode)
  if (!mode || mode === "{{mode}}") {
    mode = "edit"
  }
  if (!data || data === "{{data}}") {
    data = {
      "components": [

      ],
      "type": "default"
    }
  }
  return (
    <div className="App" sx={{height: "100%"}}>
      {["edit", "list"].includes(mode) && <ResponsiveAppBar now={mode} />}

      {mode === "view" && <FormViewer schema={data} />}
      {mode === "edit" && <Editor schema={data} />}
      {mode === "list" && <List listOfSchemas={data} />}
    </div>
  );
}

export default App;
