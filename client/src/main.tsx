import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { RDKitModule } from "@rdkit/rdkit";

declare global {
  interface Window {
    RDKit: RDKitModule;
  }
}

// IMPORTANT: need this await here!
// otherwise, this will run asynchrounously and then components needing RDKit
// will be rendered before RDKit has loaded!
// for some reason, using then and catch was not working
try {
  const instance: RDKitModule = await window.initRDKitModule();
  console.log("RDKit version: ", instance.version());
  window.RDKit = instance;
} catch (e) {
  console.error("Error loading RDKit");
  console.error(e);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
