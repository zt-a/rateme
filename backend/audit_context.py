# audit_context.py
import contextvars

# переменные контекста для текущей сессии
current_user_id = contextvars.ContextVar("current_user_id", default=None)
current_ip = contextvars.ContextVar("current_ip", default=None)
current_user_agent = contextvars.ContextVar("current_user_agent", default=None)