import { useState, useMemo } from 'react';
import { JsonForms } from '@jsonforms/react';
import './App.css';
import uischema from './uischema.json';
import {
  materialCells,
  materialRenderers,
} from '@jsonforms/material-renderers';
import RatingControl from './RatingControl';
import ratingControlTester from './ratingControlTester';
import { makeStyles } from '@mui/styles';
import $ from 'jquery';

const useStyles = makeStyles({
  container: {
    padding: '1em',
    width: '100%',
  },
  title: {
    textAlign: 'center',
    padding: '0.25em',
  },
  dataContent: {
    display: 'flex',
    justifyContent: 'center',
    borderRadius: '0.25em',
    backgroundColor: '#cecece',
    marginBottom: '1rem',
  },
  resetButton: {
    margin: 'auto !important',
    display: 'block !important',
  },
  demoform: {
    margin: 'auto',
    padding: '1rem',
  },
});

const initialData = {
  name: 'Send email to Adrian',
  description: 'Confirm if you have passed the subject\nHereby ...',
  done: true,
  recurrence: 'Daily',
  rating: 3,
};

const renderers = [
  ...materialRenderers,
  //register custom renderers
  { tester: ratingControlTester, renderer: RatingControl },
];

const App = () => {
  const classes = useStyles();
  const [formData, setFormData] = useState<any>(initialData);
  const stringifiedData = useMemo(() => JSON.stringify(formData, null, 2), [formData]);

  const el = $('#my-data').data();
  const schema = el.name

  console.log(stringifiedData)

  return (
    <div className={classes.demoform} id="modal-form">
      <JsonForms
        schema={schema}
        uischema={uischema}
        data={formData}
        renderers={renderers}
        cells={materialCells}
        onChange={({ errors, data }) => setFormData(data)}
      />
    </div>
  );
};

export default App;
