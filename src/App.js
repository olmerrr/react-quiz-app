import './App.css';
import Header from "./components/Header";
import Main from "./components/Main";
import { useEffect, useReducer } from "react";
import Loader from "./components/Loader";
import Error from "./components/Error";
import StartScreen from "./components/StartScreen";
import Question from "./components/Question";
import NextButton from "./components/NextButton";
import Progress from "./components/Progress";
import Timer from "./components/Timer";
import FinishScreen from "./components/FinishScreen";
import { Footer } from "./components/Footer";

const initialState = {
  questions: [],
  status: "loading", // "loading", "error", "ready", "active", "finished"
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: null
}
const SECONDS_PER_QUESTION = 30;

function reducer(state, action) {
  switch ( action.type ) {
    case "dataReceived":
      return {
        ...state, questions: action.payload, status: "ready"
      }
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SECONDS_PER_QUESTION
      }
    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status
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
    case "finish":
      return {
        ...state,
        status: "finished",
        highscore: state.points > state.highscore ? state.points : state.highscore
      }
    case "restart":
      return {
        ...initialState,
        questions: state.questions,
        status: "ready"
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
  const [ {
    questions,
    status,
    index,
    answer,
    points,
    highscore,
    secondsRemaining
  }, dispatch ] = useReducer(reducer, initialState);
  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce((prev, cur) => prev + cur.points, 0);

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
        <Progress
          index={index}
          numQuestions={numQuestions}
          points={points}
          maxPossiblePoints={maxPossiblePoints}
          answer={answer}
        />
        <Question
          question={questions[index]}
          dispatch={dispatch}
          answer={answer}
          points={points}
        />
        <NextButton
          dispatch={dispatch}
          answer={answer}
          numQuestions={numQuestions}
          index={index}
        />
        <Footer>
          <Timer dispatch={dispatch} secondsRemaining={secondsRemaining}/>
        </Footer>
      </>}
      {status === "finished" && <FinishScreen
        points={points}
        maxPossiblePoints={maxPossiblePoints}
        highscore={highscore}
        dispatch={dispatch}
      />}
    </Main>
  </div>
}


export default App;
