import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Giao diện khách hàng */}
        <Route path="/" element={<Home />} />

        {/* Giao diện admin - chỉ mình bạn biết URL */}
        <Route path="/admin-ktp" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;