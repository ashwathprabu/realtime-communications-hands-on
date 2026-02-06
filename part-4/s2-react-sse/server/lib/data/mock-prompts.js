const sseStaticResponses = [
  "Server-Sent Events enable real-time communication by allowing the server to push updates to the client over a single long-lived HTTP connection. Unlike polling, the browser does not repeatedly request data. In a React-based conversational interface, SSE allows messages to appear gradually as the server sends partial responses. This creates a responsive and interactive experience for users. SSE is lightweight, works over standard HTTP, and is well supported by modern browsers, making it ideal for streaming server-generated responses in real time.",

  "In a real-time messaging application, Server-Sent Events help maintain a continuous data stream from the backend to the frontend. Once the React client subscribes to an SSE endpoint, the server can push updates instantly without waiting for new requests. This approach is useful when responses are generated incrementally. SSE supports automatic reconnection, reduces network overhead, and keeps the system architecture simpler compared to bidirectional protocols when only server-to-client updates are required.",

  "Server-Sent Events provide an efficient way to deliver live updates from a Node.js backend to a React frontend. In a conversational demo, SSE allows the server to send message chunks as they are produced. The UI renders these chunks immediately, giving users a smooth, real-time experience. Because SSE is built on plain HTTP, it integrates easily with existing infrastructure such as authentication layers, load balancers, monitoring tools, and application logging systems.",

  "For real-time communication demonstrations, SSE is a strong choice when the data flow is primarily from server to client. In a React interface, the browser opens an EventSource connection and listens for incoming events. The server streams updates continuously, and the UI appends them as they arrive. This avoids constant polling, improves performance, and results in a seamless user experience, especially for live text updates, notifications, and streaming responses.",

  "Interactive applications benefit from Server-Sent Events because updates feel immediate and natural to the user. Instead of waiting for a complete response, the React frontend receives small pieces of data over time and renders them progressively. This keeps users engaged and informed while processing continues on the server. SSE is easy to implement, reliable over HTTP, and well suited for showcasing real-time communication concepts in live demos."
];

module.exports = sseStaticResponses;
