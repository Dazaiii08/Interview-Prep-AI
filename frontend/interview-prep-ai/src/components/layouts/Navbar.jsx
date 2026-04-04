import React from "react";
import ProfileInfoCard from "../Cards/ProfileInfoCard";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="h-16 bg-white border-b border-gray-200/50 backdrop-blur-sm sticky top-0 z-30">
      
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6 lg:px-8 h-full">
        
        <Link 
          to="/dashboard" 
          aria-label="Go to dashboard"
          className="hover:opacity-80 transition"
        >
          <h2 className="text-lg md:text-xl font-semibold text-black">
            Interview Prep AI
          </h2>
        </Link>

        <ProfileInfoCard />

      </div>

    </div>
  );
};

export default Navbar;