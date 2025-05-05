import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
  Tooltip,
  Grow,
} from "@mui/material";

import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faRobot,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { createAPIEndPoint } from "../config/config/api/api";
import Loader from "./Loader";

const TITLE = (() => {
  if (typeof window === "undefined") return "AI Assistant";

  // 1️⃣ URL param added by loader
  const urlTitle = new URLSearchParams(window.location.search).get("title");
  if (urlTitle) return decodeURIComponent(urlTitle);

  // 2️⃣ fallback: global config (iframe inline render)
  if (window.Chat360_Config?.title) return window.Chat360_Config.title;

  // 3️⃣ default
  return "AI Assistant";
})();

const PRIMARY = (() => {
  if (typeof window === "undefined") return "#146ef5";

  const urlColor = new URLSearchParams(window.location.search).get("color");
  const configColor = window.Chat360_Config?.color;

  const normalizeColor = (color) => {
    if (!color) return "#146ef5";

    // If already starts with #, assume it's valid hex
    if (color.startsWith("#")) return color;

    // If it's a valid 3 or 6 character hex string (e.g., "146ef5" or "abc")
    if (/^[0-9a-fA-F]{6}$/.test(color) || /^[0-9a-fA-F]{3}$/.test(color)) {
      return `#${color}`;
    }

    // Else return as-is (e.g., "red", "rgb(255,0,0)")
    return color;
  };

  return normalizeColor(urlColor) || normalizeColor(configColor) || "#146ef5";
})();


// const PRIMARY = (() => {
//   if (typeof window === "undefined") return "#146ef5";

//   /* 1️⃣ URL param sent by loader */
//   const urlColor = new URLSearchParams(window.location.search).get("color");
//   if (urlColor) return urlColor.startsWith("#") ? urlColor : `#${urlColor}`;

//   /* 2️⃣ Fallback: global config if iframe served inline */
//   if (window.Chat360_Config?.color) return window.Chat360_Config.color;

//   /* 3️⃣ Hard-coded default */
//   return "#146ef5";
// })();

const shade = (hex, lum = 0) => {
  // simple hex shade util
  let clr = String(hex).replace(/[^0-9a-f]/gi, "");
  if (clr.length < 6) clr = clr[0] + clr[0] + clr[1] + clr[1] + clr[2] + clr[2];
  let rgb = "#";
  for (let i = 0; i < 3; i++) {
    const c = parseInt(clr.substr(i * 2, 2), 16);
    const v = Math.min(255, Math.max(0, c + c * lum));
    rgb += ("00" + Math.round(v).toString(16)).substr(-2);
  }
  return rgb;
};

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "bot" },
  ]);

  const urlParams = new URLSearchParams(window.location.search);
  const paramSessionId = urlParams.get("session_id");
  const [sessionId, setSessionId] = useState(() => {
    return paramSessionId || localStorage.getItem("session_id") || uuidv4();
  });
  // const [sessionId, setSessionId] = useState(() => {
  //   return "33123";
  // });

  const [inputValue, setInputValue] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  // const [sessionId, setSessionId] = useState(() => {
  //   return localStorage.getItem("session_id") || uuidv4();
  // });
  const [userInfo, setUserInfo] = useState(null);
  const [appointment, setAppointment] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("session_id", sessionId);
  }, [sessionId]);

  const LoadingMessage = () => {
    const [dots, setDots] = useState("");

    useEffect(() => {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + "." : ""));
      }, 500);
      return () => clearInterval(interval);
    }, []);

    return (
      <Paper
        sx={{
          fontSize: 15,
          display: "inline-block",
          padding: 1.25,
          borderRadius: "18px 18px 18px 0",
          backgroundColor: "white",
          color: "text.primary",
          boxShadow: "none",
          border: "1px solid #ddd",
        }}
      >
        Typing{dots}
      </Paper>
    );
  };

  const getPrevConversation = async () => {
    try {
      setFetchingHistory(true); // 🔥 show center loader while fetching history

      const response = await createAPIEndPoint(
        `chat/get_messages?session_id=${sessionId}`
      ).fetchAll();

      if (Array.isArray(response?.data?.messages)) {
        const formattedMessages = response.data.messages.map((msg) => ({
          text: msg.message,
          sender: msg.role === "assistant" ? "bot" : "user",
        }));

        setMessages(
          formattedMessages.length > 0
            ? formattedMessages
            : [{ text: "Hello! How can I help you today?", sender: "bot" }]
        );
      } else {
        setMessages([
          { text: "Hello! How can I help you today?", sender: "bot" },
        ]);
      }
    } catch (err) {
      console.error(err?.response?.data?.error || "Error fetching messages");
      setMessages([
        { text: "Hello! How can I help you today?", sender: "bot" },
      ]);
    } finally {
      setFetchingHistory(false); // ✅ done loading history
    }
  };

  useEffect(() => {
    getPrevConversation(); // Always fetch on mount
  }, []);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    // Add user message to UI immediately
    const userMessage = { text: inputValue, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      // 🔥 HIT API with new structure
      const response = await createAPIEndPoint(
        // "chat/send_message"
        "chat/send_message?clinic_id=1"
      ).createWithJSONFormat({
        session_id: sessionId,
        message: inputValue,
      });

      const botReply = {
        text: response?.data?.assistant_response || "No response received.",
        sender: "bot",
      };

      setUserInfo(response?.data?.user_info);
      setAppointment(response?.data?.appointment);
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error("Error during API call:", err);
      setMessages((prev) => [
        ...prev,
        {
          text: "❌ Error processing your request. Please try again.",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 2,
        backgroundColor: "transparent !important",
      }}
    >
      {/* Chat Window */}
      <Grow direction="up" in={true} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            // width: 360,
            // maxWidth: "90vw",
            // maxHeight: "500px",
            width: "100%",
            height: "100%",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            // borderRadius: "8px",
            borderRadius: { xs: 0, sm: "8px" },
            overflow: "hidden",
            backgroundColor: "transparent", // <-- add this
            backdropFilter: "blur(10px)", // optional fancy look
            boxShadow:
              "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.15) 0px 5px 30px 0px, rgba(0, 0, 0, 0.05) 0px 3px 3px 0px",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              // background: "linear-gradient(to bottom, #146ef5, #4891ff)",
              background: `linear-gradient(to bottom, ${PRIMARY}, ${shade(
                PRIMARY,
                0.2
              )})`,
              color: "white",
              paddingBlock: 1,
              paddingInline: 2,
              paddingRight: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">{TITLE}</Typography>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              padding: fetchingHistory ? 0 : 2,
              backgroundColor: "#fff",
              position: "relative",
              overscrollBehavior: "contain",
            }}
          >
            {fetchingHistory ? (
              <Loader /> // 🔥 Show full screen loader while fetching previous chat
            ) : (
              <List>
                {messages.map((message, index) => (
                  <>
                    <ListItem
                      key={index}
                      sx={{
                        justifyContent:
                          message.sender === "user" ? "flex-end" : "flex-start",
                        paddingLeft: message.sender === "bot" ? 0 : "40px",
                        paddingRight: message.sender === "user" ? 0 : "40px",
                      }}
                    >
                      {message.sender === "bot" && (
                        <Tooltip
                          title="AI"
                          arrow
                          placement="top" // 👈 Ensures tooltip appears above
                        >
                          <ListItemAvatar sx={{ minWidth: 40 }}>
                            <Avatar
                              sx={{ width: 32, height: 32, bgcolor: PRIMARY }}
                            >
                              <FontAwesomeIcon icon={faRobot} size="xs" />
                            </Avatar>
                          </ListItemAvatar>
                        </Tooltip>
                      )}

                      <ListItemText
                        primary={
                          <Paper
                            sx={{
                              fontSize: 14,
                              display: "inline-block",
                              padding: 1.25,
                              borderRadius:
                                message.sender === "user"
                                  ? "18px 18px 0 18px"
                                  : "18px 18px 18px 0",
                              backgroundColor:
                                message.sender === "user" ? PRIMARY : "white",
                              color:
                                message.sender === "user"
                                  ? "white"
                                  : "text.primary",
                              maxWidth: "100%",
                              wordBreak: "break-word",
                              boxShadow: "none",
                              border:
                                message.sender === "user"
                                  ? "none"
                                  : "1px solid #ddd",
                            }}
                          >
                            {message.text}
                          </Paper>
                        }
                        sx={{
                          textAlign:
                            message.sender === "user" ? "right" : "left",
                          marginLeft: message.sender === "bot" ? 0 : "auto",
                        }}
                      />
                      {message.sender === "user" && (
                        <ListItemAvatar sx={{ minWidth: 40, marginLeft: 1 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "#f2f3f6",
                              color: "#6d7081",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faUser}
                              style={{ fontSize: 15.725 }}
                            />
                          </Avatar>
                        </ListItemAvatar>
                      )}
                    </ListItem>

                    {index === messages.length - 1 && loading && (
                      <ListItem
                        sx={{
                          justifyContent: "flex-start",
                          paddingLeft: 0,
                          paddingRight: "40px",
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          <Avatar
                            sx={{ width: 32, height: 32, bgcolor: PRIMARY }}
                          >
                            <FontAwesomeIcon icon={faRobot} size="xs" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={<LoadingMessage />} />
                      </ListItem>
                    )}
                  </>
                ))}
                <div ref={messagesEndRef} />
              </List>
            )}
          </Box>

          {/* Input area */}
          <Box
            sx={{
              padding: 1.5,
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "rgba(255,255,255,0.8)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "0 4px 0 8px",
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #d8dae0",
              }}
            >
              {/* Textarea input */}
              <TextField
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault(); // prevent new line
                    handleSendMessage();
                  }
                }}
                placeholder="Tell us how we can help..."
                variant="standard" // Use 'standard' instead of 'outlined' to get a simple text input
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    borderRadius: "0 !important", // Remove border-radius
                    border: "none !important", // Remove the border
                    boxShadow: "none !important", // Remove shadow
                  },
                  "& .MuiInputBase-input": {
                    padding: "5px 10px", // Adjust padding if needed
                    minHeight: 38,
                    border: "none", // Ensure no border
                    outline: "none", // Ensure no outline
                  },
                  "& .MuiInput-underline:before": {
                    borderBottom: "none !important", // Remove the underline before focus
                  },
                  "& .MuiInput-underline:after": {
                    borderBottom: "none !important", // Remove the underline after focus
                  },
                  "& .MuiInput-underline.Mui-focused:before": {
                    borderBottom: "none !important", // Remove underline when focused
                  },
                }}
              />

              {/* Send button */}
              <IconButton
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: PRIMARY,
                  color: "white",
                  marginLeft: 1,
                  "&:hover": { backgroundColor: shade(PRIMARY, -0.1) },
                  "&:disabled": {
                    backgroundColor: "#e0e0e0",
                  },
                }}
              >
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  style={{ fontSize: "14px" }}
                />
              </IconButton>
            </div>
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
};

export default ChatBot;