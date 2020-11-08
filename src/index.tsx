import { render, h } from "preact";
import App from "components/App";

if (module.hot) {
  require("preact/debug");
  module.hot.accept();
}

render(<App />, document.body);
