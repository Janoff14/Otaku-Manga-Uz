import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import MangaInfo from "./pages/MangaInfo";
import Reader from "./pages/Reader";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/manga/:mangaId" element={<MangaInfo />} />
      <Route path="/read/:mangaId/:chapter" element={<Reader />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
