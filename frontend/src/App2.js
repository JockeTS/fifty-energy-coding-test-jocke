import logo from './logo.svg';
import './App.css';
const apiUrl = process.env.REACT_APP_API_URL;

async function getSensors() {
  // const token localStorage.getItem
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkxNzUyNjEwLCJpYXQiOjE3NjAyMTY2MTAsImp0aSI6IjU2YmZlZGMxOWQ5YjQ0YjViMGYxZTY2M2NhMDFlMDQxIiwidXNlcl9pZCI6IjQifQ.c-JBQx2iIOmci62ckLPBBiuRE4HUHu69Z6RC6GAF2oE";
  const res = await fetch(`http://localhost:8000/api/sensors/`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  return await res.json();
};

async function getHello() {
    const res = await fetch(`http://localhost:8000/api/hello/`, {
    headers: {
      "Content-Type": "application/json",
    }
  });
  return await res.json();
}

function App() {
  // const sensors = getSensors()
  const sensors = ""
  const hello = getHello()

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>{sensors}</p>
        <p>{hello}</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
