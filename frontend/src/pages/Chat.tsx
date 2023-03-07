import '../App.css';
import Sidebar from '../components/Sidebar';
import LeaveChat from '../components/LeaveChat';

function Chat(): JSX.Element {
  return (
    <>
      <div className="App">
        <div className="Sidebar">
          <Sidebar />
          <div className="LeaveChat">
            <LeaveChat />
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
