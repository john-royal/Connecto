import '../App.css';
import Logo from '../img/logo.png';
import { SidebarData } from './SidebarData';

function Sidebar(): JSX.Element {
  return (
    <>
      <div className="SidebarLogo">
        <img src={Logo} alt="Logo" width="308" height="173" />
      </div>
      <ul className="SidebarList">
        {SidebarData.map((val, key) => {
          return (
            <li
              key={key}
              className="row"
              onClick={() => {
                return;
              }}
            >
              <div id="icon">{val.icon}</div>
              <div id="title">{val.title}</div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default Sidebar;
