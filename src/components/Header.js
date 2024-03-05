import logo from "../logo.svg"

function Header() {
  return (
    <header className='app-header'>
      <img src={logo} alt='React logo'/>
      <h1 className="app-header__title">The React Quiz</h1>
    </header>
  );
}

export default Header;
