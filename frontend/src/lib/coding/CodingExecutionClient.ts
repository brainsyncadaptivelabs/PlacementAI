export interface CodingExecutionClientOptions {
  interviewId?: string | number | null;
  onData: (data: string, stream: "stdout" | "stderr") => void;
  onExit: (stage: "compile" | "run", code: number | null, signal: string | null) => void;
  onError: (error: string) => void;
  onStatusChange: (status: "connecting" | "connected" | "disconnected" | "error") => void;
}

export class CodingExecutionClient {
  private ws: WebSocket | null = null;
  private options: CodingExecutionClientOptions;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private heartbeatInterval: any = null;

  constructor(options: CodingExecutionClientOptions) {
    this.options = options;
  }

  public connect() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      this.options.onError("Authentication token missing.");
      this.options.onStatusChange("error");
      return;
    }

    this.options.onStatusChange("connecting");

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    let wsBase = baseUrl.replace(/^http/, "ws");
    
    let wsUrl: string;
    try {
      if (!wsBase.startsWith("ws")) {
        const loc = window.location;
        const proto = loc.protocol === "https:" ? "wss:" : "ws:";
        wsBase = `${proto}//${loc.host}${baseUrl.startsWith("/") ? "" : "/"}${baseUrl}`;
      }
      const urlObj = new URL(wsBase);
      // Backend WebSocket exposes endpoint at /ws/coding/connect
      wsUrl = `${urlObj.protocol}//${urlObj.host}/ws/coding/connect?token=${encodeURIComponent(token)}`;
      if (this.options.interviewId) {
        wsUrl += `&interviewId=${encodeURIComponent(this.options.interviewId.toString())}`;
      }
    } catch (e) {
      wsUrl = `ws://localhost:8080/ws/coding/connect?token=${encodeURIComponent(token)}`;
      if (this.options.interviewId) {
        wsUrl += `&interviewId=${encodeURIComponent(this.options.interviewId.toString())}`;
      }
    }

    const ws = new WebSocket(wsUrl);
    this.ws = ws;

    ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.options.onStatusChange("connected");
      this.startHeartbeat();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "data") {
          this.options.onData(msg.data, msg.stream === "stderr" ? "stderr" : "stdout");
        } else if (msg.type === "exit") {
          this.options.onExit(msg.stage || "run", msg.code ?? null, msg.signal ?? null);
        } else if (msg.type === "error") {
          this.options.onError(msg.message);
        }
      } catch (e) {
        this.options.onData(event.data, "stdout");
      }
    };

    ws.onerror = () => {
      this.options.onStatusChange("error");
      this.options.onError("WebSocket connection failed.");
    };

    ws.onclose = (event) => {
      this.stopHeartbeat();
      this.options.onStatusChange("disconnected");
      
      // Auto-reconnect on unexpected disconnects (not normal close, token issues, etc.)
      if (event.code !== 1000 && event.code !== 4001 && event.code !== 4002 && event.code !== 4003 && event.code !== 4004) {
        this.attemptReconnect();
      }
    };
  }

  public init(language: string, files: { name: string; content: string }[]) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "init",
          language,
          version: "*",
          run_timeout: 60000,
          files,
        })
      );
    } else {
      this.options.onError("Cannot execute code: WebSocket is not connected.");
    }
  }

  public sendInput(data: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "data",
          stream: "stdin",
          data,
        })
      );
    }
  }

  public sendSignal(signal: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "signal",
          signal,
        })
      );
    }
  }

  public close() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
