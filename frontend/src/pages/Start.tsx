import '../App.css';
import Sidebar from '../components/Sidebar';
import JoinChat from '../components/JoinChat';

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
