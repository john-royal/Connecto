import "../App.css";
import Sidebar from "../components/Sidebar.tsx";
import JoinChat from "../components/JoinChat.tsx";

function Start(): JSX.Element {
  return (
    <>
      <div className="App">
        <div className="Sidebar">
          <Sidebar />
        </div>
        <div className="JoinChat">
            <JoinChat />
          </div>
      </div>
    </>
  );
}

export default Start;
