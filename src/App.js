import './App.css';
import Header from "./components/Header";
import Main from "./components/Main";
import { useEffect, useReducer } from "react";
import Loader from "./components/Loader";
import Error from "./components/Error";
import StartScreen from "./components/StartScreen";
import Question from "./components/Question";
import NextButton from "./components/NextButton";

const initialState = {
  questions: [], status: "loading", // "loading", "error", "ready", "active", "finished"
  index: 0, answer: null, points: 0,
}

function reducer(state, action) {
  switch ( action.type ) {
    case "dataReceived":
      return {
        ...state, questions: action.payload, status: "ready"
      }
    case "start":
      return {
        ...state, status: "active"
      }
    case "newAnswer":
      const question = state.questions.at(state.index);
      return {
        ...state, answer: action.payload, // calculate points
        points: action.payload === question.correctOption ? state.points + question.points : state.points
      }
    case "nextQuestion":
      return {
        ...state,
        index: state.index + 1,
        answer: null
      }
    case "dataFailed":
      return {
        ...state, status: "error"
      }
    default: {
      throw new Error("Action is unknown")
    }
  }
}

const App = () => {
  const [ { questions, status, index, answer, points }, dispatch ] = useReducer(reducer, initialState);
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
      {status === "ready" && <StartScreen numQuestions={numQuestions} dispatch={dispatch}/>}
      {status === "active" && <>
        <Question
          question={questions[index]}
          dispatch={dispatch}
          answer={answer}
          points={points}
        />
        <NextButton dispatch={dispatch} answer={answer}/>
      </>}
    </Main>
  </div>
}


export default App;
