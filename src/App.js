import './App.css';
import Header from "./components/Header";
import Main from "./components/Main";
import { useEffect, useReducer } from "react";
import Loader from "./components/Loader";
import Error from "./components/Error";
import StartScreen from "./components/StartScreen";

const initialState = {
  questions: [],
  status: "loading" // "loading", "error", "ready", "active", "finished"
}

function reducer(state, action) {
  switch ( action.type ) {
    case "dataReceived":
      return {
        ...state,
        questions: action.payload,
        status: "ready"
      }
    case "dataFailed":
      return {
        ...state,
        status: "error"
      }
    default: {
      throw new Error("Action is unknown")
    }
  }
}

const App = () => {
  const [ { questions, status }, dispatch ] = useReducer(reducer, initialState);
  const numQuestions = questions.length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:9000/questions");
        if ( !response.ok ) {
          throw new Error('Failed to fetch data');

        }
        const data = await response.json();
        dispatch({ type: "dataReceived", payload: data });
      } catch ( err ) {
        // err loading
        console.log(err);
        dispatch({ type: "dataFailed" });
      }
    };
    fetchData();
  }, []);

  return <div className="app">
    <Header/>
    <Main>
      {status === "loading" && <Loader/>}
      {status === "error" && <Error/>}
      {status === "ready" && <StartScreen numQuestions={numQuestions}/>}
    </Main>
  </div>
}


export default App;
