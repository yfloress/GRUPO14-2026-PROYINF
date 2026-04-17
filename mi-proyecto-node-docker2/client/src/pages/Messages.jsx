import { useEffect, useState } from "react";
import axios from "axios";

export default function Messages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get("http://app:3000/messages")
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Mensajes desde PostgreSQL</h1>
      <ul>
        {messages.map(m => (
          <li key={m.id}>{m.content}</li>
        ))}
      </ul>
    </div>
  );
}
