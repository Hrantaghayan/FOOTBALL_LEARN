import "./Header.css";

function Header({ titleImage }) {
  return (
    <header className="header">
      <div className="image-container">
        <img
          style={{
            width: "100%",
          }}
          src={titleImage}
          alt="Champions League Title"
          className="title-image"
          onError={(e) => {
            e.target.src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200"><rect fill="%231a1a2e" width="600" height="200"/><text x="300" y="90" text-anchor="middle" fill="%23ffd700" font-size="28" font-family="Arial" font-weight="bold">CHAMPIONS LEAGUE</text><text x="300" y="130" text-anchor="middle" fill="%23a0c4ff" font-size="14" font-family="Arial">Football Teams Generator</text></svg>';
          }}
        />
      </div>
    </header>
  );
}

export default Header;
