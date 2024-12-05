import type { MetaFunction } from "@remix-run/node";
import Home from "./home";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const meta: MetaFunction = () => {
  return [
    { title: "Good Stuff" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen items-center justify-center">
      <Home />
    </div>
  );
}

