import React from "react";
import Logo from "./imgs/logo.png";

function NavBar({ handleLogout }) {
  return (
    <section className="header">
      <nav>
        <div className="logo">
          <ul>
            <li>
              <a href="/">
                <img className="logo" src={Logo} alt="Logo" />
              </a>
            </li>
          </ul>
        </div>
        <div className="nav-bar">
          <ul>
            <li>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </li>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="#application">Application</a>
            </li>
            <li>
              <a href="#process">Process</a>
            </li>
          </ul>
        </div>
      </nav>
    </section>
  );
}

export default NavBar;
