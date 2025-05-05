import React from "react";

const Loader = ({ isRounded = false }) => {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        height: isRounded ? "calc(100vh - 268px)" : "100%",
        width: "100%",
        backgroundColor: "rgba(20,110,245,0.15)", // Light blue background
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: isRounded ? "8px" : 0,
      }}
    >
      <span className="ring_loader"></span>
    </div>
  );
};

export default Loader;